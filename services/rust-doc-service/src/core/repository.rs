use sqlx::SqlitePool;
use uuid::Uuid;

use crate::{
    accounts::{ProfileCount, ProfileResponse, UserRecord, UserSearchResult},
    documents::{CreateDocumentPayload, DocumentRecord, UpdateDocumentPayload, UploadedDocumentFile},
    folders::{CreateFolderPayload, FolderRecord, UpdateFolderPayload},
    inspection::FileInspectionResult,
    models::InspectionHistory,
    news::{
        CreateCategoryPayload, CreateNewsPayload, ListNewsQuery, NewsCategoryRecord, NewsRecord,
        UpdateCategoryPayload, UpdateNewsPayload,
    },
    permissions::{GrantPermissionPayload, PermissionRecord},
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
    _current_user_role: &str,
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
          AND (? = 1 OR d.user_id = ? OR d.is_public = 1)
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
          AND (? = 1 OR d.user_id = ? OR d.is_public = 1)
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
    _current_user_role: &str,
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
                WHERE d.folder_id = f.id 
                  AND d.status = 'ACTIVE'
                  AND (d.user_id = ? OR d.is_public = 1)
            ) AS documents_count,
            (
                SELECT COUNT(*)
                FROM folders c
                WHERE c.parent_id = f.id 
                  AND c.status = 'ACTIVE'
                  AND (c.user_id = ? OR c.is_public = 1)
            ) AS children_count
        FROM folders f
        INNER JOIN users u ON u.id = f.user_id
        WHERE f.status = 'ACTIVE'
          AND (
            -- User luôn thấy folder của chính mình
            f.user_id = ?
            -- Folder public chỉ hiển thị nếu có content public (documents hoặc subfolders)
            -- Áp dụng cho cả admin và user thường
            OR (
              f.is_public = 1
              AND (
                -- Có public documents
                EXISTS (
                  SELECT 1 FROM documents d 
                  WHERE d.folder_id = f.id 
                    AND d.is_public = 1 
                    AND d.status != 'DELETED'
                )
                -- HOẶC có public subfolders (với content public bên trong)
                OR EXISTS (
                  SELECT 1 FROM folders sub 
                  WHERE sub.parent_id = f.id 
                    AND sub.is_public = 1 
                    AND sub.status != 'DELETED'
                )
              )
            )
          )
          AND (
            ? IS NULL
            OR (? = 'null' AND f.parent_id IS NULL)
            OR (? != 'null' AND f.parent_id = ?)
          )
        ORDER BY f.name ASC
        "#,
    )
    .bind(current_user_id)
    .bind(current_user_id)
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

pub async fn find_folder_by_name_and_parent(
    pool: &SqlitePool,
    name: &str,
    parent_id: Option<&str>,
    user_id: &str,
) -> Result<Option<FolderRecord>, sqlx::Error> {
    let parent_condition = if parent_id.is_some() { "parent_id = ?" } else { "parent_id IS NULL" };
    
    let query = format!(
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
                WHEN typeof(f.created_at) = 'integer' THEN strftime('%Y-%m-dT%H:%M:%fZ', f.created_at / 1000.0, 'unixepoch')
                ELSE f.created_at
            END AS created_at,
            CASE
                WHEN typeof(f.updated_at) = 'integer' THEN strftime('%Y-%m-dT%H:%M:%fZ', f.updated_at / 1000.0, 'unixepoch')
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
        WHERE f.name = ? AND f.user_id = ? AND f.status = 'ACTIVE' AND {}
        "#,
        parent_condition
    );

    let mut query = sqlx::query_as::<_, FolderRow>(&query);
    query = query.bind(name).bind(user_id);
    
    if let Some(pid) = parent_id {
        query = query.bind(pid);
    }
    
    query.fetch_optional(pool).await.map(|result| result.map(map_folder_row))
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

/// Cascade update is_public status for all ancestor folders of a document
/// Returns list of folder IDs that were updated (for audit/warning purposes)
pub async fn cascade_folder_public_status(
    pool: &SqlitePool,
    folder_id: &str,
    is_public: bool,
) -> Result<Vec<String>, sqlx::Error> {
    // Get all ancestor folders using existing breadcrumbs logic
    let breadcrumbs = get_folder_breadcrumbs(pool, folder_id).await?;
    
    if breadcrumbs.is_empty() {
        return Ok(Vec::new());
    }
    
    // Filter folders that need updating (only update if different)
    let folder_ids: Vec<String> = breadcrumbs
        .iter()
        .filter(|f| f.is_public != is_public)
        .map(|f| f.id.clone())
        .collect();
    
    if folder_ids.is_empty() {
        return Ok(Vec::new());
    }
    
    // Batch update all ancestor folders
    let public_value = if is_public { 1 } else { 0 };
    for folder_id in &folder_ids {
        sqlx::query(
            r#"
            UPDATE folders
            SET is_public = ?, updated_at = ?
            WHERE id = ?
            "#,
        )
        .bind(public_value)
        .bind(current_timestamp_millis())
        .bind(folder_id)
        .execute(pool)
        .await?;
    }
    
    Ok(folder_ids)
}

/// Check if a folder has any public content (documents or subfolders)
/// Returns true if the folder contains at least one public document or public subfolder
pub async fn folder_has_public_content(
    pool: &SqlitePool,
    folder_id: &str,
) -> Result<bool, sqlx::Error> {
    // Check for public documents in this folder
    let has_public_docs: bool = sqlx::query_scalar(
        r#"
        SELECT COUNT(*) > 0
        FROM documents
        WHERE folder_id = ? 
          AND is_public = 1 
          AND status != 'DELETED'
        "#,
    )
    .bind(folder_id)
    .fetch_one(pool)
    .await?;

    if has_public_docs {
        return Ok(true);
    }

    // Check for public subfolders
    let has_public_subfolders: bool = sqlx::query_scalar(
        r#"
        SELECT COUNT(*) > 0
        FROM folders
        WHERE parent_id = ? 
          AND is_public = 1 
          AND status != 'DELETED'
        "#,
    )
    .bind(folder_id)
    .fetch_one(pool)
    .await?;

    Ok(has_public_subfolders)
}

/// Cascade private status up to parent folders if they no longer have public content.
/// This is called when a document becomes private or is deleted.
/// Returns list of folder IDs that were updated.
pub async fn cascade_folder_private_if_empty(
    pool: &SqlitePool,
    folder_id: &str,
) -> Result<Vec<String>, sqlx::Error> {
    let mut updated_folder_ids = Vec::new();
    
    // Get all ancestor folders (from current folder up to root)
    let breadcrumbs = get_folder_breadcrumbs(pool, folder_id).await?;
    
    // Check from innermost to outermost
    // We need to check in reverse order (from the folder that had its content changed, up to root)
    for folder in breadcrumbs.into_iter().rev() {
        // Skip if folder is already private
        if !folder.is_public {
            continue;
        }
        
        // Check if this folder still has any public content
        let has_public = folder_has_public_content(pool, &folder.id).await?;
        
        if !has_public {
            // No more public content, make this folder private
            sqlx::query(
                r#"
                UPDATE folders
                SET is_public = 0, updated_at = ?
                WHERE id = ?
                "#,
            )
            .bind(current_timestamp_millis())
            .bind(&folder.id)
            .execute(pool)
            .await?;
            
            updated_folder_ids.push(folder.id);
        } else {
            // This folder still has public content, stop cascading
            // (parent folders should remain public too)
            break;
        }
    }
    
    Ok(updated_folder_ids)
}

/// Cleanup all folders that are marked as public but don't have any public content.
/// This should be called on server startup or via admin API.
/// Returns count of folders that were updated.
pub async fn cleanup_folders_without_public_content(
    pool: &SqlitePool,
) -> Result<usize, sqlx::Error> {
    let mut total_updated = 0;
    
    // Run cleanup in a loop until no more folders are updated
    // This handles nested folder structures where parent folders depend on child folders
    loop {
        // Get all folders that are marked as public, ordered by depth (deepest first)
        // This ensures we process leaf folders before parent folders
        let public_folders: Vec<String> = sqlx::query_scalar(
            r#"
            WITH RECURSIVE folder_depth AS (
                SELECT id, 0 as depth FROM folders WHERE parent_id IS NULL
                UNION ALL
                SELECT f.id, fd.depth + 1
                FROM folders f
                INNER JOIN folder_depth fd ON f.parent_id = fd.id
            )
            SELECT fd.id
            FROM folder_depth fd
            INNER JOIN folders f ON f.id = fd.id
            WHERE f.is_public = 1 AND f.status != 'DELETED'
            ORDER BY fd.depth DESC
            "#,
        )
        .fetch_all(pool)
        .await?;

        let mut updated_this_round = 0;

        for folder_id in public_folders {
            // Check if this folder has any public content
            let has_public = folder_has_public_content(pool, &folder_id).await?;
            
            if !has_public {
                // Make this folder private
                sqlx::query(
                    r#"
                    UPDATE folders
                    SET is_public = 0, updated_at = ?
                    WHERE id = ?
                    "#,
                )
                .bind(current_timestamp_millis())
                .bind(&folder_id)
                .execute(pool)
                .await?;
                
                updated_this_round += 1;
            }
        }
        
        total_updated += updated_this_round;
        
        // If no folders were updated this round, we're done
        if updated_this_round == 0 {
            break;
        }
    }

    Ok(total_updated)
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
            status,
            can_approve_users,
            approved_by,
            CASE
                WHEN approved_at IS NULL THEN NULL
                WHEN typeof(approved_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', approved_at / 1000.0, 'unixepoch')
                ELSE approved_at
            END AS approved_at,
            rejected_by,
            CASE
                WHEN rejected_at IS NULL THEN NULL
                WHEN typeof(rejected_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', rejected_at / 1000.0, 'unixepoch')
                ELSE rejected_at
            END AS rejected_at,
            rejection_reason,
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
            status,
            can_approve_users,
            approved_by,
            CASE
                WHEN approved_at IS NULL THEN NULL
                WHEN typeof(approved_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', approved_at / 1000.0, 'unixepoch')
                ELSE approved_at
            END AS approved_at,
            rejected_by,
            CASE
                WHEN rejected_at IS NULL THEN NULL
                WHEN typeof(rejected_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', rejected_at / 1000.0, 'unixepoch')
                ELSE rejected_at
            END AS rejected_at,
            rejection_reason,
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
            status,
            can_approve_users,
            approved_by,
            approved_at,
            rejected_by,
            rejected_at,
            rejection_reason,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, 'USER', 'PENDING', 0, NULL, NULL, NULL, NULL, NULL, ?, ?)
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
            u.status,
            u.can_approve_users,
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

pub async fn list_users_for_admin(
    pool: &SqlitePool,
    status: Option<&str>,
    search: Option<&str>,
) -> Result<Vec<UserRecord>, sqlx::Error> {
    sqlx::query_as::<_, UserRow>(
        r#"
        SELECT
            id,
            email,
            "fullName" AS full_name,
            password_hash,
            role,
            status,
            can_approve_users,
            approved_by,
            CASE
                WHEN approved_at IS NULL THEN NULL
                WHEN typeof(approved_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', approved_at / 1000.0, 'unixepoch')
                ELSE approved_at
            END AS approved_at,
            rejected_by,
            CASE
                WHEN rejected_at IS NULL THEN NULL
                WHEN typeof(rejected_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', rejected_at / 1000.0, 'unixepoch')
                ELSE rejected_at
            END AS rejected_at,
            rejection_reason,
            avatar_url,
            CASE
                WHEN typeof(created_at) = 'integer' THEN strftime('%Y-%m-%dT%H:%M:%fZ', created_at / 1000.0, 'unixepoch')
                ELSE created_at
            END AS created_at
        FROM users
        WHERE (? IS NULL OR status = ?)
          AND (
            ? IS NULL
            OR email LIKE ?
            OR "fullName" LIKE ?
          )
        ORDER BY created_at DESC
        "#,
    )
    .bind(status)
    .bind(status)
    .bind(search)
    .bind(search.map(|value| format!("%{value}%")))
    .bind(search.map(|value| format!("%{value}%")))
    .fetch_all(pool)
    .await
    .map(|rows| rows.into_iter().map(map_user_row).collect())
}

pub async fn approve_user(
    pool: &SqlitePool,
    user_id: &str,
    approved_by: &str,
) -> Result<Option<UserRecord>, sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        UPDATE users
        SET
            status = 'ACTIVE',
            approved_by = ?,
            approved_at = ?,
            rejected_by = NULL,
            rejected_at = NULL,
            rejection_reason = NULL,
            updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(approved_by)
    .bind(now)
    .bind(now)
    .bind(user_id)
    .execute(pool)
    .await?;

    find_user_by_id(pool, user_id).await
}

pub async fn reject_user(
    pool: &SqlitePool,
    user_id: &str,
    rejected_by: &str,
    reason: Option<&str>,
) -> Result<Option<UserRecord>, sqlx::Error> {
    let now = current_timestamp_millis();

    sqlx::query(
        r#"
        UPDATE users
        SET
            status = 'REJECTED',
            approved_by = NULL,
            approved_at = NULL,
            rejected_by = ?,
            rejected_at = ?,
            rejection_reason = ?,
            updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(rejected_by)
    .bind(now)
    .bind(reason)
    .bind(now)
    .bind(user_id)
    .execute(pool)
    .await?;

    find_user_by_id(pool, user_id).await
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
    status: String,
    can_approve_users: bool,
    approved_by: Option<String>,
    approved_at: Option<String>,
    rejected_by: Option<String>,
    rejected_at: Option<String>,
    rejection_reason: Option<String>,
    avatar_url: Option<String>,
    created_at: String,
}

#[derive(sqlx::FromRow)]
struct ProfileRow {
    id: String,
    email: String,
    full_name: String,
    role: String,
    status: String,
    can_approve_users: bool,
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
        status: row.status,
        can_approve_users: row.can_approve_users,
        approved_by: row.approved_by,
        approved_at: row.approved_at,
        rejected_by: row.rejected_by,
        rejected_at: row.rejected_at,
        rejection_reason: row.rejection_reason,
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
        status: row.status,
        canApproveUsers: row.can_approve_users,
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

pub async fn grant_folder_permission(
    pool: &SqlitePool,
    folder_id: &str,
    granter_id: &str,
    payload: &GrantPermissionPayload,
) -> Result<PermissionRecord, sqlx::Error> {
    let id = Uuid::new_v4().to_string();
    let now = current_timestamp_millis().to_string();

    sqlx::query(
        r#"
        INSERT INTO folder_permissions (id, folder_id, user_id, can_upload, granted_by, granted_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(folder_id, user_id) DO UPDATE SET
            can_upload = excluded.can_upload,
            granted_by = excluded.granted_by,
            granted_at = excluded.granted_at
        "#,
    )
    .bind(&id)
    .bind(folder_id)
    .bind(&payload.user_id)
    .bind(payload.can_upload)
    .bind(granter_id)
    .bind(&now)
    .execute(pool)
    .await?;

    find_permission_by_folder_and_user(pool, folder_id, &payload.user_id)
        .await?
        .ok_or(sqlx::Error::RowNotFound)
}

pub async fn find_permission_by_id(
    pool: &SqlitePool,
    id: &str,
) -> Result<Option<PermissionRecord>, sqlx::Error> {
    sqlx::query_as::<_, PermissionRecord>(
        r#"
        SELECT
            fp.id, fp.folder_id, fp.user_id, fp.can_upload, fp.granted_by, fp.granted_at,
            u."fullName" as user_name,
            u.email as user_email,
            g."fullName" as granted_by_name
        FROM folder_permissions fp
        INNER JOIN users u ON u.id = fp.user_id
        INNER JOIN users g ON g.id = fp.granted_by
        WHERE fp.id = ?
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await
}

pub async fn find_permission_by_folder_and_user(
    pool: &SqlitePool,
    folder_id: &str,
    user_id: &str,
) -> Result<Option<PermissionRecord>, sqlx::Error> {
    sqlx::query_as::<_, PermissionRecord>(
        r#"
        SELECT
            fp.id, fp.folder_id, fp.user_id, fp.can_upload, fp.granted_by, fp.granted_at,
            u."fullName" as user_name,
            u.email as user_email,
            g."fullName" as granted_by_name
        FROM folder_permissions fp
        INNER JOIN users u ON u.id = fp.user_id
        INNER JOIN users g ON g.id = fp.granted_by
        WHERE fp.folder_id = ? AND fp.user_id = ?
        "#,
    )
    .bind(folder_id)
    .bind(user_id)
    .fetch_optional(pool)
    .await
}

pub async fn list_folder_permissions(
    pool: &SqlitePool,
    folder_id: &str,
) -> Result<Vec<PermissionRecord>, sqlx::Error> {
    sqlx::query_as::<_, PermissionRecord>(
        r#"
        SELECT
            fp.id, fp.folder_id, fp.user_id, fp.can_upload, fp.granted_by, fp.granted_at,
            u."fullName" as user_name,
            u.email as user_email,
            g."fullName" as granted_by_name
        FROM folder_permissions fp
        INNER JOIN users u ON u.id = fp.user_id
        INNER JOIN users g ON g.id = fp.granted_by
        WHERE fp.folder_id = ?
        ORDER BY u."fullName"
        "#,
    )
    .bind(folder_id)
    .fetch_all(pool)
    .await
}

pub async fn revoke_folder_permission(
    pool: &SqlitePool,
    permission_id: &str,
) -> Result<bool, sqlx::Error> {
    let result = sqlx::query("DELETE FROM folder_permissions WHERE id = ?")
        .bind(permission_id)
        .execute(pool)
        .await?;
    Ok(result.rows_affected() > 0)
}

pub async fn can_upload_to_folder(
    pool: &SqlitePool,
    user_id: &str,
    folder_id: &str,
) -> Result<bool, sqlx::Error> {
    let folder = find_folder_by_id(pool, folder_id).await?;
    if let Some(f) = &folder {
        if f.user_id == user_id {
            return Ok(true);
        }
    }

    let has_direct: bool = sqlx::query_scalar(
        r#"
        SELECT can_upload FROM folder_permissions
        WHERE folder_id = ? AND user_id = ? AND can_upload = 1
        "#,
    )
    .bind(folder_id)
    .bind(user_id)
    .fetch_optional(pool)
    .await?
    .unwrap_or(false);

    if has_direct {
        return Ok(true);
    }

    if let Some(ref parent_id) = folder.as_ref().and_then(|f| f.parent_id.clone()) {
        let mut current_id = parent_id.clone();
        loop {
            let parent = find_folder_by_id(pool, &current_id).await?;
            let Some(p) = parent else {
                break;
            };

            if p.status == "DELETED" {
                break;
            }

            let inherited: bool = sqlx::query_scalar(
                r#"
                SELECT can_upload FROM folder_permissions
                WHERE folder_id = ? AND user_id = ? AND can_upload = 1
                "#,
            )
            .bind(&current_id)
            .bind(user_id)
            .fetch_optional(pool)
            .await?
            .unwrap_or(false);

            if inherited {
                return Ok(true);
            }

            current_id = match p.parent_id {
                Some(pid) => pid,
                None => break,
            };
        }
    }

    Ok(false)
}

pub async fn get_user_folder_permission(
    pool: &SqlitePool,
    user_id: &str,
    folder_id: &str,
) -> Result<Option<bool>, sqlx::Error> {
    let folder = find_folder_by_id(pool, folder_id).await?;
    if let Some(f) = &folder {
        if f.user_id == user_id {
            return Ok(Some(true));
        }
    }

    let can_upload: Option<bool> = sqlx::query_scalar(
        r#"
        SELECT can_upload FROM folder_permissions
        WHERE folder_id = ? AND user_id = ?
        "#,
    )
    .bind(folder_id)
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    if can_upload.is_some() {
        return Ok(can_upload);
    }

    if let Some(ref parent_id) = folder.as_ref().and_then(|f| f.parent_id.clone()) {
        let mut current_id = parent_id.clone();
        loop {
            let parent = find_folder_by_id(pool, &current_id).await?;
            let Some(p) = parent else {
                break;
            };

            let inherited: Option<bool> = sqlx::query_scalar(
                r#"
                SELECT can_upload FROM folder_permissions
                WHERE folder_id = ? AND user_id = ?
                "#,
            )
            .bind(&current_id)
            .bind(user_id)
            .fetch_optional(pool)
            .await?;

            if inherited.unwrap_or(false) {
                return Ok(Some(true));
            }

            current_id = match p.parent_id {
                Some(pid) => pid,
                None => break,
            };
        }
    }

    Ok(None)
}

pub async fn search_users_by_email(
    pool: &SqlitePool,
    query: &str,
    current_user_id: &str,
) -> Result<Vec<UserSearchResult>, sqlx::Error> {
    sqlx::query_as::<_, UserSearchResult>(
        r#"
        SELECT id, "fullName" as full_name, email
        FROM users
        WHERE email LIKE ?
          AND id != ?
          AND status = 'ACTIVE'
        ORDER BY "fullName"
        LIMIT 10
        "#,
    )
    .bind(format!("%{}%", query))
    .bind(current_user_id)
    .fetch_all(pool)
    .await
}
