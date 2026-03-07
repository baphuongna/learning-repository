use sqlx::SqlitePool;
use uuid::Uuid;

use crate::{
    accounts::{ProfileCount, ProfileResponse, UserRecord},
    documents::{CreateDocumentPayload, DocumentRecord, UpdateDocumentPayload, UploadedDocumentFile},
    folders::{CreateFolderPayload, FolderRecord, UpdateFolderPayload},
    inspection::FileInspectionResult,
    models::InspectionHistory,
    news::{
        CreateCategoryPayload, CreateNewsPayload, ListNewsQuery, NewsCategoryRecord, NewsRecord,
        UpdateCategoryPayload, UpdateNewsPayload,
    },
};

#[cfg(test)]
use crate::documents::DocumentInsertRecord;

fn current_timestamp_millis() -> i64 {
    chrono::Utc::now().timestamp_millis()
}

pub async fn insert_inspection_history(
    pool: &SqlitePool,
    inspection: &FileInspectionResult,
) -> Result<InspectionHistory, sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query_as::<_, InspectionHistory>(
        r#"
        INSERT INTO inspection_history (
            id,
            filename,
            content_type,
            extension,
            size_bytes,
            sha256,
            supported_content_type,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id, filename, content_type, extension, size_bytes, sha256, supported_content_type, created_at
        "#,
    )
    .bind(Uuid::new_v4().to_string())
    .bind(inspection.filename.as_deref())
    .bind(inspection.content_type.as_deref())
    .bind(inspection.extension.as_deref())
    .bind(inspection.size_bytes as i64)
    .bind(&inspection.sha256)
    .bind(inspection.supported_content_type)
    .bind(now)
    .fetch_one(pool)
    .await
}

pub async fn list_recent_inspections(
    pool: &SqlitePool,
    limit: i64,
) -> Result<Vec<InspectionHistory>, sqlx::Error> {
    sqlx::query_as::<_, InspectionHistory>(
        r#"
        SELECT
            id,
            filename,
            content_type,
            extension,
            size_bytes,
            sha256,
            supported_content_type,
            CASE
                WHEN typeof(created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', created_at / 1000.0, 'unixepoch')
                ELSE created_at
            END AS created_at
        FROM inspection_history
        ORDER BY created_at DESC
        LIMIT ?
        "#,
    )
    .bind(limit)
    .fetch_all(pool)
    .await
}

pub async fn find_inspection_by_id(
    pool: &SqlitePool,
    id: &str,
) -> Result<Option<InspectionHistory>, sqlx::Error> {
    sqlx::query_as::<_, InspectionHistory>(
        r#"
        SELECT
            id,
            filename,
            content_type,
            extension,
            size_bytes,
            sha256,
            supported_content_type,
            CASE
                WHEN typeof(created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', created_at / 1000.0, 'unixepoch')
                ELSE created_at
            END AS created_at
        FROM inspection_history
        WHERE id = ?
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await
}

pub async fn create_document(
    pool: &SqlitePool,
    user_id: &str,
    payload: &CreateDocumentPayload,
    file: &UploadedDocumentFile,
) -> Result<DocumentRecord, sqlx::Error> {
    let document_id = Uuid::new_v4().to_string();
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        INSERT INTO documents (
            id,
            user_id,
            folder_id,
            title,
            description,
            author,
            subject,
            keywords,
            file_name,
            file_path,
            file_size,
            mime_type,
            inspection_id,
            status,
            is_public,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)
        "#,
    )
    .bind(&document_id)
    .bind(user_id)
    .bind(payload.folder_id.as_deref())
    .bind(&payload.title)
    .bind(payload.description.as_deref())
    .bind(payload.author.as_deref())
    .bind(payload.subject.as_deref())
    .bind(payload.keywords.as_deref())
    .bind(&file.file_name)
    .bind(&file.relative_path)
    .bind(file.size)
    .bind(file.mime_type.as_deref())
    .bind(payload.inspection_id.as_deref())
    .bind(payload.is_public)
    .bind(now)
    .bind(now)
    .execute(pool)
    .await?;

    find_document_by_id(pool, &document_id)
        .await?
        .ok_or(sqlx::Error::RowNotFound)
}

#[cfg(test)]
pub async fn create_document_with_id(
    pool: &SqlitePool,
    document_id: &str,
    user_id: &str,
    payload: &DocumentInsertRecord,
) -> Result<DocumentRecord, sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        INSERT INTO documents (
            id,
            user_id,
            folder_id,
            title,
            description,
            author,
            subject,
            keywords,
            file_name,
            file_path,
            file_size,
            mime_type,
            inspection_id,
            status,
            is_public,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)
        "#,
    )
    .bind(document_id)
    .bind(user_id)
    .bind(payload.folder_id.as_deref())
    .bind(&payload.title)
    .bind(payload.description.as_deref())
    .bind(payload.author.as_deref())
    .bind(payload.subject.as_deref())
    .bind(payload.keywords.as_deref())
    .bind(&payload.file_name)
    .bind(&payload.file_path)
    .bind(payload.file_size)
    .bind(payload.mime_type.as_deref())
    .bind(payload.inspection_id.as_deref())
    .bind(payload.is_public)
    .bind(now)
    .bind(now)
    .execute(pool)
    .await?;

    find_document_by_id(pool, document_id)
        .await?
        .ok_or(sqlx::Error::RowNotFound)
}

#[cfg(test)]
pub async fn create_folder_with_id(
    pool: &SqlitePool,
    folder_id: &str,
    user_id: &str,
    payload: &CreateFolderPayload,
) -> Result<FolderRecord, sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        INSERT INTO folders (
            id,
            name,
            description,
            color,
            parent_id,
            user_id,
            status,
            is_public,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)
        "#,
    )
    .bind(folder_id)
    .bind(&payload.name)
    .bind(payload.description.as_deref())
    .bind(payload.color.as_deref())
    .bind(payload.parent_id.as_deref())
    .bind(user_id)
    .bind(payload.is_public.unwrap_or(false))
    .bind(now)
    .bind(now)
    .execute(pool)
    .await?;

    find_folder_by_id(pool, folder_id)
        .await?
        .ok_or(sqlx::Error::RowNotFound)
}

pub async fn list_documents(
    pool: &SqlitePool,
    current_user_id: &str,
    current_user_role: &str,
    page: i64,
    limit: i64,
    folder_id: Option<&str>,
    search: Option<&str>,
    mine_only: bool,
) -> Result<(Vec<DocumentRecord>, i64), sqlx::Error> {
    let offset = (page - 1) * limit;

    let rows = sqlx::query_as::<_, DocumentRow>(
        r#"
        SELECT
            d.id,
            d.user_id,
            d.folder_id,
            d.title,
            d.description,
            d.author,
            d.subject,
            d.keywords,
            d.file_name,
            d.file_path,
            d.file_size,
            d.mime_type,
            d.inspection_id,
            d.status,
            d.is_public,
            CASE
                WHEN typeof(d.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', d.created_at / 1000.0, 'unixepoch')
                ELSE d.created_at
            END AS created_at,
            CASE
                WHEN typeof(d.updated_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', d.updated_at / 1000.0, 'unixepoch')
                ELSE d.updated_at
            END AS updated_at,
            u."fullName" AS user_name,
            u.email AS user_email,
            f.name AS folder_name,
            f.color AS folder_color
        FROM documents d
        INNER JOIN users u ON u.id = d.user_id
        LEFT JOIN folders f ON f.id = d.folder_id
        WHERE d.status = 'ACTIVE'
          AND (? = 0 OR d.user_id = ?)
          AND (? = 1 OR ? = 'ADMIN' OR d.user_id = ? OR d.is_public = 1)
          AND (
            ? IS NULL
            OR (? = 'null' AND d.folder_id IS NULL)
            OR (? != 'null' AND d.folder_id = ?)
          )
          AND (
            ? IS NULL
            OR d.title LIKE ?
            OR COALESCE(d.description, '') LIKE ?
            OR COALESCE(d.author, '') LIKE ?
            OR COALESCE(d.subject, '') LIKE ?
            OR COALESCE(d.keywords, '') LIKE ?
          )
        ORDER BY d.created_at DESC
        LIMIT ? OFFSET ?
        "#,
    )
    .bind(if mine_only { 1 } else { 0 })
    .bind(current_user_id)
    .bind(if mine_only { 1 } else { 0 })
    .bind(current_user_role)
    .bind(current_user_id)
    .bind(folder_id)
    .bind(folder_id)
    .bind(folder_id)
    .bind(folder_id)
    .bind(search)
    .bind(search.map(|value| format!("%{value}%")))
    .bind(search.map(|value| format!("%{value}%")))
    .bind(search.map(|value| format!("%{value}%")))
    .bind(search.map(|value| format!("%{value}%")))
    .bind(search.map(|value| format!("%{value}%")))
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    let total = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COUNT(*)
        FROM documents d
        WHERE d.status = 'ACTIVE'
          AND (? = 0 OR d.user_id = ?)
          AND (? = 1 OR ? = 'ADMIN' OR d.user_id = ? OR d.is_public = 1)
          AND (
            ? IS NULL
            OR (? = 'null' AND d.folder_id IS NULL)
            OR (? != 'null' AND d.folder_id = ?)
          )
          AND (
            ? IS NULL
            OR d.title LIKE ?
            OR COALESCE(d.description, '') LIKE ?
            OR COALESCE(d.author, '') LIKE ?
            OR COALESCE(d.subject, '') LIKE ?
            OR COALESCE(d.keywords, '') LIKE ?
          )
        "#,
    )
    .bind(if mine_only { 1 } else { 0 })
    .bind(current_user_id)
    .bind(if mine_only { 1 } else { 0 })
    .bind(current_user_role)
    .bind(current_user_id)
    .bind(folder_id)
    .bind(folder_id)
    .bind(folder_id)
    .bind(folder_id)
    .bind(search)
    .bind(search.map(|value| format!("%{value}%")))
    .bind(search.map(|value| format!("%{value}%")))
    .bind(search.map(|value| format!("%{value}%")))
    .bind(search.map(|value| format!("%{value}%")))
    .bind(search.map(|value| format!("%{value}%")))
    .fetch_one(pool)
    .await?;

    Ok((rows.into_iter().map(map_document_row).collect(), total))
}

pub async fn find_document_by_id(
    pool: &SqlitePool,
    id: &str,
) -> Result<Option<DocumentRecord>, sqlx::Error> {
    sqlx::query_as::<_, DocumentRow>(
        r#"
        SELECT
            d.id,
            d.user_id,
            d.folder_id,
            d.title,
            d.description,
            d.author,
            d.subject,
            d.keywords,
            d.file_name,
            d.file_path,
            d.file_size,
            d.mime_type,
            d.inspection_id,
            d.status,
            d.is_public,
            CASE
                WHEN typeof(d.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', d.created_at / 1000.0, 'unixepoch')
                ELSE d.created_at
            END AS created_at,
            CASE
                WHEN typeof(d.updated_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', d.updated_at / 1000.0, 'unixepoch')
                ELSE d.updated_at
            END AS updated_at,
            u."fullName" AS user_name,
            u.email AS user_email,
            f.name AS folder_name,
            f.color AS folder_color
        FROM documents d
        INNER JOIN users u ON u.id = d.user_id
        LEFT JOIN folders f ON f.id = d.folder_id
        WHERE d.id = ?
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map(|result| result.map(map_document_row))
}

pub async fn soft_delete_document(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        UPDATE documents
        SET status = 'DELETED', updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(now)
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn update_document(
    pool: &SqlitePool,
    id: &str,
    payload: &UpdateDocumentPayload,
) -> Result<Option<DocumentRecord>, sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        UPDATE documents
        SET
            title = COALESCE(?, title),
            description = ?,
            author = ?,
            subject = ?,
            keywords = ?,
            folder_id = ?,
            inspection_id = ?,
            is_public = COALESCE(?, is_public),
            updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(payload.title.as_deref())
    .bind(payload.description.as_deref())
    .bind(payload.author.as_deref())
    .bind(payload.subject.as_deref())
    .bind(payload.keywords.as_deref())
    .bind(payload.folder_id.as_deref())
    .bind(payload.inspection_id.as_deref())
    .bind(payload.is_public)
    .bind(now)
    .bind(id)
    .execute(pool)
    .await?;

    find_document_by_id(pool, id).await
}

pub async fn list_folders(
    pool: &SqlitePool,
    current_user_id: &str,
    current_user_role: &str,
    parent_id: Option<&str>,
) -> Result<Vec<FolderRecord>, sqlx::Error> {
    sqlx::query_as::<_, FolderRow>(
        r#"
        SELECT
            f.id,
            f.name,
            f.description,
            f.color,
            f.parent_id,
            f.user_id,
            f.is_public,
            f.status,
            CASE
                WHEN typeof(f.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', f.created_at / 1000.0, 'unixepoch')
                ELSE f.created_at
            END AS created_at,
            CASE
                WHEN typeof(f.updated_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', f.updated_at / 1000.0, 'unixepoch')
                ELSE f.updated_at
            END AS updated_at,
            u."fullName" AS user_name,
            u.email AS user_email,
            (
                SELECT COUNT(*)
                FROM documents d
                WHERE d.folder_id = f.id AND d.status = 'ACTIVE'
            ) AS documents_count,
            (
                SELECT COUNT(*)
                FROM folders c
                WHERE c.parent_id = f.id AND c.status = 'ACTIVE'
            ) AS children_count
        FROM folders f
        INNER JOIN users u ON u.id = f.user_id
        WHERE f.status = 'ACTIVE'
          AND (? = 'ADMIN' OR f.user_id = ? OR f.is_public = 1)
          AND (
            ? IS NULL
            OR (? = 'null' AND f.parent_id IS NULL)
            OR (? != 'null' AND f.parent_id = ?)
          )
        ORDER BY f.name ASC
        "#,
    )
    .bind(current_user_role)
    .bind(current_user_id)
    .bind(parent_id)
    .bind(parent_id)
    .bind(parent_id)
    .bind(parent_id)
    .fetch_all(pool)
    .await
    .map(|rows| rows.into_iter().map(map_folder_row).collect())
}

pub async fn find_folder_by_id(pool: &SqlitePool, id: &str) -> Result<Option<FolderRecord>, sqlx::Error> {
    sqlx::query_as::<_, FolderRow>(
        r#"
        SELECT
            f.id,
            f.name,
            f.description,
            f.color,
            f.parent_id,
            f.user_id,
            f.is_public,
            f.status,
            CASE
                WHEN typeof(f.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', f.created_at / 1000.0, 'unixepoch')
                ELSE f.created_at
            END AS created_at,
            CASE
                WHEN typeof(f.updated_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', f.updated_at / 1000.0, 'unixepoch')
                ELSE f.updated_at
            END AS updated_at,
            u."fullName" AS user_name,
            u.email AS user_email,
            (
                SELECT COUNT(*)
                FROM documents d
                WHERE d.folder_id = f.id AND d.status = 'ACTIVE'
            ) AS documents_count,
            (
                SELECT COUNT(*)
                FROM folders c
                WHERE c.parent_id = f.id AND c.status = 'ACTIVE'
            ) AS children_count
        FROM folders f
        INNER JOIN users u ON u.id = f.user_id
        WHERE f.id = ?
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map(|result| result.map(map_folder_row))
}

pub async fn create_folder(
    pool: &SqlitePool,
    user_id: &str,
    payload: &CreateFolderPayload,
) -> Result<FolderRecord, sqlx::Error> {
    let folder_id = Uuid::new_v4().to_string();
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        INSERT INTO folders (
            id,
            name,
            description,
            color,
            parent_id,
            user_id,
            status,
            is_public,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)
        "#,
    )
    .bind(&folder_id)
    .bind(&payload.name)
    .bind(payload.description.as_deref())
    .bind(payload.color.as_deref())
    .bind(payload.parent_id.as_deref())
    .bind(user_id)
    .bind(payload.is_public.unwrap_or(false))
    .bind(now)
    .bind(now)
    .execute(pool)
    .await?;

    find_folder_by_id(pool, &folder_id)
        .await?
        .ok_or(sqlx::Error::RowNotFound)
}

pub async fn update_folder(
    pool: &SqlitePool,
    id: &str,
    payload: &UpdateFolderPayload,
) -> Result<Option<FolderRecord>, sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        UPDATE folders
        SET
            name = COALESCE(?, name),
            description = ?,
            color = COALESCE(?, color),
            parent_id = ?,
            is_public = COALESCE(?, is_public),
            updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(payload.name.as_deref())
    .bind(payload.description.as_deref())
    .bind(payload.color.as_deref())
    .bind(payload.parent_id.as_deref())
    .bind(payload.is_public)
    .bind(now)
    .bind(id)
    .execute(pool)
    .await?;

    find_folder_by_id(pool, id).await
}

pub async fn soft_delete_folder(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        UPDATE folders
        SET status = 'DELETED', updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(now)
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn is_descendant_folder(
    pool: &SqlitePool,
    folder_id: &str,
    target_id: &str,
) -> Result<bool, sqlx::Error> {
    let mut current_parent = sqlx::query_scalar::<_, Option<String>>(
        "SELECT parent_id FROM folders WHERE id = ?"
    )
    .bind(target_id)
    .fetch_optional(pool)
    .await?
    .flatten();

    while let Some(parent_id) = current_parent {
        if parent_id == folder_id {
            return Ok(true);
        }

        current_parent = sqlx::query_scalar::<_, Option<String>>(
            "SELECT parent_id FROM folders WHERE id = ?"
        )
        .bind(parent_id)
        .fetch_optional(pool)
        .await?
        .flatten();
    }

    Ok(false)
}

pub async fn get_folder_breadcrumbs(
    pool: &SqlitePool,
    folder_id: &str,
) -> Result<Vec<FolderRecord>, sqlx::Error> {
    let mut breadcrumbs = Vec::new();
    let mut current_id = Some(folder_id.to_string());

    while let Some(id) = current_id {
        let Some(folder) = find_folder_by_id(pool, &id).await? else {
            break;
        };

        current_id = folder.parent_id.clone();
        breadcrumbs.push(folder);
    }

    breadcrumbs.reverse();
    Ok(breadcrumbs)
}

pub async fn find_user_by_email(
    pool: &SqlitePool,
    email: &str,
) -> Result<Option<UserRecord>, sqlx::Error> {
    sqlx::query_as::<_, UserRow>(
        r#"
        SELECT
            id,
            email,
            "fullName" AS full_name,
            password_hash,
            role,
            avatar_url,
            CASE
                WHEN typeof(created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', created_at / 1000.0, 'unixepoch')
                ELSE created_at
            END AS created_at
        FROM users
        WHERE email = ?
        "#,
    )
    .bind(email)
    .fetch_optional(pool)
    .await
    .map(|result| result.map(map_user_row))
}

pub async fn find_user_by_id(
    pool: &SqlitePool,
    id: &str,
) -> Result<Option<UserRecord>, sqlx::Error> {
    sqlx::query_as::<_, UserRow>(
        r#"
        SELECT
            id,
            email,
            "fullName" AS full_name,
            password_hash,
            role,
            avatar_url,
            CASE
                WHEN typeof(created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', created_at / 1000.0, 'unixepoch')
                ELSE created_at
            END AS created_at
        FROM users
        WHERE id = ?
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map(|result| result.map(map_user_row))
}

pub async fn create_user(
    pool: &SqlitePool,
    email: &str,
    full_name: &str,
    password_hash: &str,
) -> Result<UserRecord, sqlx::Error> {
    let user_id = Uuid::new_v4().to_string();
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        INSERT INTO users (
            id,
            email,
            "fullName",
            password_hash,
            role,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, 'USER', ?, ?)
        "#,
    )
    .bind(&user_id)
    .bind(email)
    .bind(full_name)
    .bind(password_hash)
    .bind(now)
    .bind(now)
    .execute(pool)
    .await?;

    find_user_by_id(pool, &user_id)
        .await?
        .ok_or(sqlx::Error::RowNotFound)
}

pub async fn get_profile_by_user_id(
    pool: &SqlitePool,
    user_id: &str,
) -> Result<Option<ProfileResponse>, sqlx::Error> {
    sqlx::query_as::<_, ProfileRow>(
        r#"
        SELECT
            u.id,
            u.email,
            u."fullName" AS full_name,
            u.role,
            u.avatar_url,
            CASE
                WHEN typeof(u.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', u.created_at / 1000.0, 'unixepoch')
                ELSE u.created_at
            END AS created_at,
            (
                SELECT COUNT(*)
                FROM documents d
                WHERE d.user_id = u.id AND d.status = 'ACTIVE'
            ) AS documents_count
        FROM users u
        WHERE u.id = ?
        "#,
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map(|result| result.map(map_profile_row))
}

pub async fn update_user_profile(
    pool: &SqlitePool,
    user_id: &str,
    full_name: Option<&str>,
    avatar_url: Option<&str>,
) -> Result<Option<ProfileResponse>, sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        UPDATE users
        SET
            "fullName" = COALESCE(?, "fullName"),
            avatar_url = ?,
            updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(full_name)
    .bind(avatar_url)
    .bind(now)
    .bind(user_id)
    .execute(pool)
    .await?;

    get_profile_by_user_id(pool, user_id).await
}

pub async fn update_user_password(
    pool: &SqlitePool,
    user_id: &str,
    password_hash: &str,
) -> Result<(), sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        UPDATE users
        SET password_hash = ?, updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(password_hash)
    .bind(now)
    .bind(user_id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn list_news_categories(pool: &SqlitePool, admin: bool) -> Result<Vec<NewsCategoryRecord>, sqlx::Error> {
    let query = if admin {
        r#"
        SELECT
            c.id, c.name, c.slug, c.description, c."order", c.status,
            CASE
                WHEN typeof(c.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', c.created_at / 1000.0, 'unixepoch')
                ELSE c.created_at
            END AS created_at,
            CASE
                WHEN typeof(c.updated_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', c.updated_at / 1000.0, 'unixepoch')
                ELSE c.updated_at
            END AS updated_at,
            (SELECT COUNT(*) FROM news n WHERE n.category_id = c.id AND n.status != 'ARCHIVED') AS news_count
        FROM news_categories c
        ORDER BY c."order" ASC
        "#
    } else {
        r#"
        SELECT
            c.id, c.name, c.slug, c.description, c."order", c.status,
            CASE
                WHEN typeof(c.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', c.created_at / 1000.0, 'unixepoch')
                ELSE c.created_at
            END AS created_at,
            CASE
                WHEN typeof(c.updated_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', c.updated_at / 1000.0, 'unixepoch')
                ELSE c.updated_at
            END AS updated_at,
            (SELECT COUNT(*) FROM news n WHERE n.category_id = c.id AND n.status = 'PUBLISHED' AND n.is_published = 1) AS news_count
        FROM news_categories c
        WHERE c.status = 'ACTIVE'
        ORDER BY c."order" ASC
        "#
    };

    sqlx::query_as::<_, NewsCategoryRow>(query)
        .fetch_all(pool)
        .await
        .map(|rows| rows.into_iter().map(map_news_category_row).collect())
}

pub async fn find_news_category_by_id(pool: &SqlitePool, id: &str) -> Result<Option<NewsCategoryRecord>, sqlx::Error> {
    sqlx::query_as::<_, NewsCategoryRow>(
        r#"
        SELECT
            c.id, c.name, c.slug, c.description, c."order", c.status,
            CASE
                WHEN typeof(c.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', c.created_at / 1000.0, 'unixepoch')
                ELSE c.created_at
            END AS created_at,
            CASE
                WHEN typeof(c.updated_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', c.updated_at / 1000.0, 'unixepoch')
                ELSE c.updated_at
            END AS updated_at,
            (SELECT COUNT(*) FROM news n WHERE n.category_id = c.id AND n.status != 'ARCHIVED') AS news_count
        FROM news_categories c
        WHERE c.id = ?
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map(|result| result.map(map_news_category_row))
}

pub async fn create_news_category(
    pool: &SqlitePool,
    payload: &CreateCategoryPayload,
) -> Result<NewsCategoryRecord, sqlx::Error> {
    let category_id = Uuid::new_v4().to_string();
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        INSERT INTO news_categories (id, name, slug, description, "order", status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&category_id)
    .bind(&payload.name)
    .bind(&payload.slug)
    .bind(payload.description.as_deref())
    .bind(payload.order.unwrap_or(0))
    .bind(payload.status.as_deref().unwrap_or("ACTIVE"))
    .bind(now)
    .bind(now)
    .execute(pool)
    .await?;

    find_news_category_by_id(pool, &category_id)
        .await?
        .ok_or(sqlx::Error::RowNotFound)
}

pub async fn update_news_category(
    pool: &SqlitePool,
    id: &str,
    payload: &UpdateCategoryPayload,
) -> Result<Option<NewsCategoryRecord>, sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        UPDATE news_categories
        SET
            name = COALESCE(?, name),
            slug = COALESCE(?, slug),
            description = ?,
            "order" = COALESCE(?, "order"),
            status = COALESCE(?, status),
            updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(payload.name.as_deref())
    .bind(payload.slug.as_deref())
    .bind(payload.description.as_deref())
    .bind(payload.order)
    .bind(payload.status.as_deref())
    .bind(now)
    .bind(id)
    .execute(pool)
    .await?;

    find_news_category_by_id(pool, id).await
}

pub async fn inactivate_news_category(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query("UPDATE news_categories SET status = 'INACTIVE', updated_at = ? WHERE id = ?")
        .bind(now)
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn find_news_category_by_slug(pool: &SqlitePool, slug: &str) -> Result<Option<NewsCategoryRecord>, sqlx::Error> {
    sqlx::query_as::<_, NewsCategoryRow>(
        r#"
        SELECT
            c.id, c.name, c.slug, c.description, c."order", c.status,
            CASE
                WHEN typeof(c.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', c.created_at / 1000.0, 'unixepoch')
                ELSE c.created_at
            END AS created_at,
            CASE
                WHEN typeof(c.updated_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', c.updated_at / 1000.0, 'unixepoch')
                ELSE c.updated_at
            END AS updated_at,
            (SELECT COUNT(*) FROM news n WHERE n.category_id = c.id AND n.status != 'ARCHIVED') AS news_count
        FROM news_categories c
        WHERE c.slug = ?
        "#,
    )
    .bind(slug)
    .fetch_optional(pool)
    .await
    .map(|result| result.map(map_news_category_row))
}

pub async fn list_news(
    pool: &SqlitePool,
    query: &ListNewsQuery,
) -> Result<(Vec<NewsRecord>, i64), sqlx::Error> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * limit;
    let search = query.search.as_deref().map(str::trim).filter(|value| !value.is_empty());
    let category = query.category.as_deref().map(str::trim).filter(|value| !value.is_empty());

    let rows = sqlx::query_as::<_, NewsRow>(
        r#"
        SELECT
            n.id, n.category_id, n.user_id, n.title, n.slug, n.summary, n.content, n.thumbnail_url,
            n.is_published, n.is_featured,
            CASE
                WHEN n.published_at IS NULL THEN NULL
                WHEN typeof(n.published_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.published_at / 1000.0, 'unixepoch')
                ELSE n.published_at
            END AS published_at,
            n.view_count, n.status,
            CASE
                WHEN typeof(n.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.created_at / 1000.0, 'unixepoch')
                ELSE n.created_at
            END AS created_at,
            CASE
                WHEN typeof(n.updated_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.updated_at / 1000.0, 'unixepoch')
                ELSE n.updated_at
            END AS updated_at,
            c.name AS category_name, c.slug AS category_slug,
            u."fullName" AS user_name, u.avatar_url AS user_avatar_url
        FROM news n
        INNER JOIN news_categories c ON c.id = n.category_id
        INNER JOIN users u ON u.id = n.user_id
        WHERE n.is_published = 1
          AND n.status = 'PUBLISHED'
          AND (
            ? IS NULL
            OR n.category_id = ?
            OR c.slug = ?
          )
          AND (
            ? IS NULL
            OR n.title LIKE ?
            OR n.summary LIKE ?
          )
        ORDER BY n.is_featured DESC, n.published_at DESC
        LIMIT ? OFFSET ?
        "#,
    )
    .bind(category)
    .bind(category)
    .bind(category)
    .bind(search)
    .bind(search.map(|value| format!("%{value}%")))
    .bind(search.map(|value| format!("%{value}%")))
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    let total = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COUNT(*)
        FROM news n
        INNER JOIN news_categories c ON c.id = n.category_id
        WHERE n.is_published = 1
          AND n.status = 'PUBLISHED'
          AND (
            ? IS NULL
            OR n.category_id = ?
            OR c.slug = ?
          )
          AND (
            ? IS NULL
            OR n.title LIKE ?
            OR n.summary LIKE ?
          )
        "#,
    )
    .bind(category)
    .bind(category)
    .bind(category)
    .bind(search)
    .bind(search.map(|value| format!("%{value}%")))
    .bind(search.map(|value| format!("%{value}%")))
    .fetch_one(pool)
    .await?;

    Ok((rows.into_iter().map(map_news_row).collect(), total))
}

pub async fn list_featured_news(pool: &SqlitePool, limit: i64) -> Result<Vec<NewsRecord>, sqlx::Error> {
    sqlx::query_as::<_, NewsRow>(
        r#"
        SELECT
            n.id, n.category_id, n.user_id, n.title, n.slug, n.summary, n.content, n.thumbnail_url,
            n.is_published, n.is_featured,
            CASE
                WHEN n.published_at IS NULL THEN NULL
                WHEN typeof(n.published_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.published_at / 1000.0, 'unixepoch')
                ELSE n.published_at
            END AS published_at,
            n.view_count, n.status,
            CASE
                WHEN typeof(n.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.created_at / 1000.0, 'unixepoch')
                ELSE n.created_at
            END AS created_at,
            CASE
                WHEN typeof(n.updated_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.updated_at / 1000.0, 'unixepoch')
                ELSE n.updated_at
            END AS updated_at,
            c.name AS category_name, c.slug AS category_slug,
            u."fullName" AS user_name, u.avatar_url AS user_avatar_url
        FROM news n
        INNER JOIN news_categories c ON c.id = n.category_id
        INNER JOIN users u ON u.id = n.user_id
        WHERE n.is_featured = 1 AND n.is_published = 1 AND n.status = 'PUBLISHED'
        ORDER BY n.published_at DESC
        LIMIT ?
        "#,
    )
    .bind(limit)
    .fetch_all(pool)
    .await
    .map(|rows| rows.into_iter().map(map_news_row).collect())
}

pub async fn find_news_by_slug(pool: &SqlitePool, slug: &str) -> Result<Option<NewsRecord>, sqlx::Error> {
    sqlx::query_as::<_, NewsRow>(
        r#"
        SELECT
            n.id, n.category_id, n.user_id, n.title, n.slug, n.summary, n.content, n.thumbnail_url,
            n.is_published, n.is_featured,
            CASE
                WHEN n.published_at IS NULL THEN NULL
                WHEN typeof(n.published_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.published_at / 1000.0, 'unixepoch')
                ELSE n.published_at
            END AS published_at,
            n.view_count, n.status,
            CASE
                WHEN typeof(n.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.created_at / 1000.0, 'unixepoch')
                ELSE n.created_at
            END AS created_at,
            CASE
                WHEN typeof(n.updated_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.updated_at / 1000.0, 'unixepoch')
                ELSE n.updated_at
            END AS updated_at,
            c.name AS category_name, c.slug AS category_slug,
            u."fullName" AS user_name, u.avatar_url AS user_avatar_url
        FROM news n
        INNER JOIN news_categories c ON c.id = n.category_id
        INNER JOIN users u ON u.id = n.user_id
        WHERE n.slug = ?
        "#,
    )
    .bind(slug)
    .fetch_optional(pool)
    .await
    .map(|result| result.map(map_news_row))
}

pub async fn find_news_by_id(pool: &SqlitePool, id: &str) -> Result<Option<NewsRecord>, sqlx::Error> {
    sqlx::query_as::<_, NewsRow>(
        r#"
        SELECT
            n.id, n.category_id, n.user_id, n.title, n.slug, n.summary, n.content, n.thumbnail_url,
            n.is_published, n.is_featured,
            CASE
                WHEN n.published_at IS NULL THEN NULL
                WHEN typeof(n.published_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.published_at / 1000.0, 'unixepoch')
                ELSE n.published_at
            END AS published_at,
            n.view_count, n.status,
            CASE
                WHEN typeof(n.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.created_at / 1000.0, 'unixepoch')
                ELSE n.created_at
            END AS created_at,
            CASE
                WHEN typeof(n.updated_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.updated_at / 1000.0, 'unixepoch')
                ELSE n.updated_at
            END AS updated_at,
            c.name AS category_name, c.slug AS category_slug,
            u."fullName" AS user_name, u.avatar_url AS user_avatar_url
        FROM news n
        INNER JOIN news_categories c ON c.id = n.category_id
        INNER JOIN users u ON u.id = n.user_id
        WHERE n.id = ?
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map(|result| result.map(map_news_row))
}

pub async fn increment_news_view_count(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE news SET view_count = view_count + 1 WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn list_my_news(
    pool: &SqlitePool,
    user_id: &str,
    page: i64,
    limit: i64,
) -> Result<(Vec<NewsRecord>, i64), sqlx::Error> {
    let offset = (page - 1) * limit;
    let rows = sqlx::query_as::<_, NewsRow>(
        r#"
        SELECT
            n.id, n.category_id, n.user_id, n.title, n.slug, n.summary, n.content, n.thumbnail_url,
            n.is_published, n.is_featured,
            CASE
                WHEN n.published_at IS NULL THEN NULL
                WHEN typeof(n.published_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.published_at / 1000.0, 'unixepoch')
                ELSE n.published_at
            END AS published_at,
            n.view_count, n.status,
            CASE
                WHEN typeof(n.created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.created_at / 1000.0, 'unixepoch')
                ELSE n.created_at
            END AS created_at,
            CASE
                WHEN typeof(n.updated_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', n.updated_at / 1000.0, 'unixepoch')
                ELSE n.updated_at
            END AS updated_at,
            c.name AS category_name, c.slug AS category_slug,
            u."fullName" AS user_name, u.avatar_url AS user_avatar_url
        FROM news n
        INNER JOIN news_categories c ON c.id = n.category_id
        INNER JOIN users u ON u.id = n.user_id
        WHERE n.user_id = ? AND n.status != 'ARCHIVED'
        ORDER BY n.created_at DESC
        LIMIT ? OFFSET ?
        "#,
    )
    .bind(user_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    let total = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM news WHERE user_id = ? AND status != 'ARCHIVED'")
        .bind(user_id)
        .fetch_one(pool)
        .await?;

    Ok((rows.into_iter().map(map_news_row).collect(), total))
}

pub async fn create_news(
    pool: &SqlitePool,
    user_id: &str,
    payload: &CreateNewsPayload,
) -> Result<NewsRecord, sqlx::Error> {
    let news_id = Uuid::new_v4().to_string();
    let is_published = payload.is_published.unwrap_or(false);
    let status = if is_published { "PUBLISHED" } else { "DRAFT" };
    let now = current_timestamp_millis();
    let published_at = if is_published { Some(now) } else { None };

    sqlx::query(
        r#"
        INSERT INTO news (
            id, category_id, user_id, title, slug, summary, content, thumbnail_url,
            is_published, is_featured, published_at, view_count, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
        "#,
    )
    .bind(&news_id)
    .bind(&payload.category_id)
    .bind(user_id)
    .bind(&payload.title)
    .bind(&payload.slug)
    .bind(&payload.summary)
    .bind(&payload.content)
    .bind(payload.thumbnail_url.as_deref())
    .bind(is_published)
    .bind(payload.is_featured.unwrap_or(false))
    .bind(published_at)
    .bind(status)
    .bind(now)
    .bind(now)
    .execute(pool)
    .await?;

    find_news_by_id(pool, &news_id)
        .await?
        .ok_or(sqlx::Error::RowNotFound)
}

pub async fn update_news(
    pool: &SqlitePool,
    id: &str,
    payload: &UpdateNewsPayload,
) -> Result<Option<NewsRecord>, sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        UPDATE news
        SET
            category_id = COALESCE(?, category_id),
            title = COALESCE(?, title),
            slug = COALESCE(?, slug),
            summary = COALESCE(?, summary),
            content = COALESCE(?, content),
            thumbnail_url = ?,
            is_featured = COALESCE(?, is_featured),
            is_published = COALESCE(?, is_published),
            status = CASE
                WHEN COALESCE(?, is_published) = 1 THEN 'PUBLISHED'
                ELSE 'DRAFT'
            END,
            published_at = CASE
                WHEN COALESCE(?, is_published) = 1 AND published_at IS NULL THEN ?
                WHEN COALESCE(?, is_published) = 0 THEN NULL
                ELSE published_at
            END,
            updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(payload.category_id.as_deref())
    .bind(payload.title.as_deref())
    .bind(payload.slug.as_deref())
    .bind(payload.summary.as_deref())
    .bind(payload.content.as_deref())
    .bind(payload.thumbnail_url.as_deref())
    .bind(payload.is_featured)
    .bind(payload.is_published)
    .bind(payload.is_published)
    .bind(payload.is_published)
    .bind(now)
    .bind(payload.is_published)
    .bind(now)
    .bind(id)
    .execute(pool)
    .await?;

    find_news_by_id(pool, id).await
}

pub async fn archive_news(pool: &SqlitePool, id: &str) -> Result<(), sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query("UPDATE news SET status = 'ARCHIVED', updated_at = ? WHERE id = ?")
        .bind(now)
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn count_news_in_category(pool: &SqlitePool, category_id: &str) -> Result<i64, sqlx::Error> {
    sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM news WHERE category_id = ? AND status != 'ARCHIVED'")
        .bind(category_id)
        .fetch_one(pool)
        .await
}

pub async fn slug_exists_in_news(pool: &SqlitePool, slug: &str, exclude_id: Option<&str>) -> Result<bool, sqlx::Error> {
    let count = if let Some(exclude_id) = exclude_id {
        sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM news WHERE slug = ? AND id != ?")
            .bind(slug)
            .bind(exclude_id)
            .fetch_one(pool)
            .await?
    } else {
        sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM news WHERE slug = ?")
            .bind(slug)
            .fetch_one(pool)
            .await?
    };

    Ok(count > 0)
}

#[derive(sqlx::FromRow)]
struct DocumentRow {
    id: String,
    user_id: String,
    folder_id: Option<String>,
    title: String,
    description: Option<String>,
    author: Option<String>,
    subject: Option<String>,
    keywords: Option<String>,
    file_name: Option<String>,
    file_path: Option<String>,
    file_size: Option<i64>,
    mime_type: Option<String>,
    inspection_id: Option<String>,
    status: String,
    is_public: bool,
    created_at: String,
    updated_at: String,
    user_name: String,
    user_email: String,
    folder_name: Option<String>,
    folder_color: Option<String>,
}

#[derive(sqlx::FromRow)]
struct FolderRow {
    id: String,
    name: String,
    description: Option<String>,
    color: Option<String>,
    parent_id: Option<String>,
    user_id: String,
    is_public: bool,
    status: String,
    created_at: String,
    updated_at: String,
    user_name: String,
    user_email: Option<String>,
    documents_count: i64,
    children_count: i64,
}

#[derive(sqlx::FromRow)]
struct UserRow {
    id: String,
    email: String,
    full_name: String,
    password_hash: String,
    role: String,
    avatar_url: Option<String>,
    created_at: String,
}

#[derive(sqlx::FromRow)]
struct ProfileRow {
    id: String,
    email: String,
    full_name: String,
    role: String,
    avatar_url: Option<String>,
    created_at: String,
    documents_count: i64,
}

#[derive(sqlx::FromRow)]
struct NewsCategoryRow {
    id: String,
    name: String,
    slug: String,
    description: Option<String>,
    order: i64,
    status: String,
    created_at: String,
    updated_at: String,
    news_count: i64,
}

#[derive(sqlx::FromRow)]
struct NewsRow {
    id: String,
    category_id: String,
    user_id: String,
    title: String,
    slug: String,
    summary: String,
    content: String,
    thumbnail_url: Option<String>,
    is_published: bool,
    is_featured: bool,
    published_at: Option<String>,
    view_count: i64,
    status: String,
    created_at: String,
    updated_at: String,
    category_name: String,
    category_slug: String,
    user_name: String,
    user_avatar_url: Option<String>,
}

fn map_document_row(row: DocumentRow) -> DocumentRecord {
    DocumentRecord {
        id: row.id,
        user_id: row.user_id,
        folder_id: row.folder_id,
        title: row.title,
        description: row.description,
        author: row.author,
        subject: row.subject,
        keywords: row.keywords,
        file_name: row.file_name,
        file_path: row.file_path,
        file_size: row.file_size,
        mime_type: row.mime_type,
        inspection_id: row.inspection_id,
        status: row.status,
        is_public: row.is_public,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user_name: row.user_name,
        user_email: row.user_email,
        folder_name: row.folder_name,
        folder_color: row.folder_color,
    }
}

fn map_folder_row(row: FolderRow) -> FolderRecord {
    FolderRecord {
        id: row.id,
        name: row.name,
        description: row.description,
        color: row.color,
        parent_id: row.parent_id,
        user_id: row.user_id,
        is_public: row.is_public,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user_name: row.user_name,
        user_email: row.user_email,
        documents_count: row.documents_count,
        children_count: row.children_count,
    }
}

fn map_user_row(row: UserRow) -> UserRecord {
    UserRecord {
        id: row.id,
        email: row.email,
        full_name: row.full_name,
        password_hash: row.password_hash,
        role: row.role,
        avatar_url: row.avatar_url,
        created_at: row.created_at,
    }
}

fn map_profile_row(row: ProfileRow) -> ProfileResponse {
    ProfileResponse {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        avatarUrl: row.avatar_url,
        createdAt: row.created_at,
        _count: ProfileCount {
            documents: row.documents_count,
        },
    }
}

fn map_news_category_row(row: NewsCategoryRow) -> NewsCategoryRecord {
    NewsCategoryRecord {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        order: row.order,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        news_count: row.news_count,
    }
}

fn map_news_row(row: NewsRow) -> NewsRecord {
    NewsRecord {
        id: row.id,
        category_id: row.category_id,
        user_id: row.user_id,
        title: row.title,
        slug: row.slug,
        summary: row.summary,
        content: row.content,
        thumbnail_url: row.thumbnail_url,
        is_published: row.is_published,
        is_featured: row.is_featured,
        published_at: row.published_at,
        view_count: row.view_count,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        category_name: row.category_name,
        category_slug: row.category_slug,
        user_name: row.user_name,
        user_avatar_url: row.user_avatar_url,
    }
}
