#[cfg(test)]
mod tests {
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use serde_json::Value;
    use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};
    use tower::ServiceExt;

    use crate::{
        app_state::AppState,
        config::AppConfig,
        documents::{DocumentInsertRecord, UpdateDocumentPayload},
        folders::CreateFolderPayload,
        repository::{
            create_document_with_id, create_folder_with_id, create_user, find_document_by_id,
            get_folder_breadcrumbs, get_profile_by_user_id, update_document,
        },
        routes::create_router,
    };

    async fn setup_test_db() -> SqlitePool {
        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .expect("in-memory sqlite should start");

        sqlx::query(
            r#"
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                fullName TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'USER',
                avatar_url TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE folders (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                color TEXT,
                parent_id TEXT,
                user_id TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'ACTIVE',
                is_public BOOLEAN NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE documents (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                folder_id TEXT,
                title TEXT NOT NULL,
                description TEXT,
                author TEXT,
                subject TEXT,
                keywords TEXT,
                file_name TEXT,
                file_path TEXT,
                file_size BIGINT,
                mime_type TEXT,
                inspection_id TEXT,
                status TEXT NOT NULL DEFAULT 'ACTIVE',
                is_public BOOLEAN NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE inspection_history (
                id TEXT PRIMARY KEY,
                filename TEXT,
                content_type TEXT,
                extension TEXT,
                size_bytes BIGINT NOT NULL,
                sha256 TEXT NOT NULL,
                supported_content_type BOOLEAN NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE news_categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                description TEXT,
                "order" INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'ACTIVE',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE news (
                id TEXT PRIMARY KEY,
                category_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                summary TEXT NOT NULL,
                content TEXT NOT NULL,
                thumbnail_url TEXT,
                is_published BOOLEAN NOT NULL DEFAULT 0,
                is_featured BOOLEAN NOT NULL DEFAULT 0,
                published_at TEXT,
                view_count INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'DRAFT',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            "#,
        )
        .execute(&pool)
        .await
        .expect("schema should be created");

        pool
    }

    fn test_config() -> AppConfig {
        AppConfig {
            host: "127.0.0.1".to_string(),
            port: 4001,
            jwt_secret: "integration-secret".to_string(),
            max_file_size_bytes: 10 * 1024 * 1024,
            allowed_content_types: [
                "application/pdf".to_string(),
                "text/plain".to_string(),
                "image/png".to_string(),
                "image/jpeg".to_string(),
            ]
            .into_iter()
            .collect(),
            database_url: "sqlite::memory:".to_string(),
            database_max_connections: 1,
        }
    }

    fn create_test_app(pool: SqlitePool) -> axum::Router {
        create_router(AppState::new(test_config(), pool))
    }

    async fn read_json(response: axum::response::Response) -> Value {
        let bytes = axum::body::to_bytes(response.into_body(), usize::MAX)
            .await
            .expect("response body should read");
        serde_json::from_slice(&bytes).expect("response should be valid json")
    }

    #[tokio::test]
    async fn creates_user_and_reads_profile_count() {
        let pool = setup_test_db().await;

        let user = create_user(&pool, "mentor@example.com", "Rust Mentor", "hashed-password")
            .await
            .expect("user should be created");

        let profile = get_profile_by_user_id(&pool, &user.id)
            .await
            .expect("profile query should work")
            .expect("profile should exist");

        assert_eq!(profile.email, "mentor@example.com");
        assert_eq!(profile.fullName, "Rust Mentor");
        assert_eq!(profile._count.documents, 0);
    }

    #[tokio::test]
    async fn updates_document_metadata_successfully() {
        let pool = setup_test_db().await;
        let user = create_user(&pool, "author@example.com", "Doc Author", "hash")
            .await
            .expect("user should be created");

        let created = create_document_with_id(
            &pool,
            "doc-1",
            &user.id,
            &DocumentInsertRecord {
                title: "Old title".to_string(),
                description: Some("Old description".to_string()),
                author: Some("Old author".to_string()),
                subject: Some("Math".to_string()),
                keywords: Some("[\"rust\"]".to_string()),
                file_name: "doc.pdf".to_string(),
                file_path: "uploads/doc.pdf".to_string(),
                file_size: 1024,
                mime_type: Some("application/pdf".to_string()),
                inspection_id: None,
                is_public: false,
                folder_id: None,
            },
        )
        .await
        .expect("document should be created");

        let updated = update_document(
            &pool,
            &created.id,
            &UpdateDocumentPayload {
                title: Some("New title".to_string()),
                description: Some("New description".to_string()),
                author: Some("New author".to_string()),
                subject: Some("Physics".to_string()),
                keywords: Some("[\"rust\",\"v2\"]".to_string()),
                is_public: Some(true),
                folder_id: None,
                inspection_id: Some("insp-1".to_string()),
            },
        )
        .await
        .expect("update should succeed")
        .expect("document should exist");

        assert_eq!(updated.title, "New title");
        assert_eq!(updated.author.as_deref(), Some("New author"));
        assert_eq!(updated.inspection_id.as_deref(), Some("insp-1"));
        assert!(updated.is_public);
    }

    #[tokio::test]
    async fn builds_folder_breadcrumbs_in_correct_order() {
        let pool = setup_test_db().await;
        let user = create_user(&pool, "folder@example.com", "Folder User", "hash")
            .await
            .expect("user should be created");

        create_folder_with_id(
            &pool,
            "root-folder",
            &user.id,
            &CreateFolderPayload {
                name: "Root".to_string(),
                description: None,
                color: Some("#111111".to_string()),
                parent_id: None,
                is_public: Some(false),
            },
        )
        .await
        .expect("root folder should be created");

        create_folder_with_id(
            &pool,
            "child-folder",
            &user.id,
            &CreateFolderPayload {
                name: "Child".to_string(),
                description: None,
                color: Some("#222222".to_string()),
                parent_id: Some("root-folder".to_string()),
                is_public: Some(false),
            },
        )
        .await
        .expect("child folder should be created");

        let breadcrumbs = get_folder_breadcrumbs(&pool, "child-folder")
            .await
            .expect("breadcrumbs should load");

        let names: Vec<String> = breadcrumbs.into_iter().map(|item| item.name).collect();
        assert_eq!(names, vec!["Root".to_string(), "Child".to_string()]);
    }

    #[tokio::test]
    async fn finds_document_after_insert() {
        let pool = setup_test_db().await;
        let user = create_user(&pool, "lookup@example.com", "Lookup User", "hash")
            .await
            .expect("user should be created");

        create_document_with_id(
            &pool,
            "doc-lookup",
            &user.id,
            &DocumentInsertRecord {
                title: "Lookup doc".to_string(),
                description: None,
                author: None,
                subject: None,
                keywords: Some("[]".to_string()),
                file_name: "lookup.pdf".to_string(),
                file_path: "uploads/lookup.pdf".to_string(),
                file_size: 2048,
                mime_type: Some("application/pdf".to_string()),
                inspection_id: None,
                is_public: false,
                folder_id: None,
            },
        )
        .await
        .expect("document should be inserted");

        let loaded = find_document_by_id(&pool, "doc-lookup")
            .await
            .expect("query should succeed")
            .expect("document should exist");

        assert_eq!(loaded.file_name.as_deref(), Some("lookup.pdf"));
        assert_eq!(loaded.file_size, Some(2048));
    }

    #[tokio::test]
    async fn register_and_me_routes_work_together() {
        let pool = setup_test_db().await;
        let app = create_test_app(pool);

        let register_request = Request::builder()
            .method("POST")
            .uri("/auth/register")
            .header("content-type", "application/json")
            .body(Body::from(
                r#"{"email":"route@example.com","fullName":"Route Tester","password":"secret123"}"#,
            ))
            .expect("request should build");

        let register_response = app
            .clone()
            .oneshot(register_request)
            .await
            .expect("register route should respond");

        assert_eq!(register_response.status(), StatusCode::CREATED);
        let register_json = read_json(register_response).await;
        let token = register_json["accessToken"]
            .as_str()
            .expect("token should exist")
            .to_string();

        let me_request = Request::builder()
            .method("GET")
            .uri("/auth/me")
            .header("authorization", format!("Bearer {token}"))
            .body(Body::empty())
            .expect("request should build");

        let me_response = app
            .oneshot(me_request)
            .await
            .expect("me route should respond");

        assert_eq!(me_response.status(), StatusCode::OK);
        let me_json = read_json(me_response).await;
        assert_eq!(me_json["email"], "route@example.com");
        assert_eq!(me_json["fullName"], "Route Tester");
    }

    #[tokio::test]
    async fn authenticated_folder_tree_route_returns_nested_children() {
        let pool = setup_test_db().await;
        let user = create_user(&pool, "tree@example.com", "Tree Owner", "hash")
            .await
            .expect("user should be created");
        create_folder_with_id(
            &pool,
            "root-route",
            &user.id,
            &CreateFolderPayload {
                name: "Root Route".to_string(),
                description: None,
                color: None,
                parent_id: None,
                is_public: Some(false),
            },
        )
        .await
        .expect("root folder should be created");
        create_folder_with_id(
            &pool,
            "child-route",
            &user.id,
            &CreateFolderPayload {
                name: "Child Route".to_string(),
                description: None,
                color: None,
                parent_id: Some("root-route".to_string()),
                is_public: Some(false),
            },
        )
        .await
        .expect("child folder should be created");

        let token = test_config()
            .sign_jwt(&user.id, &user.email, &user.role)
            .expect("jwt should sign");
        let app = create_test_app(pool);

        let request = Request::builder()
            .method("GET")
            .uri("/v2/folders/tree")
            .header("authorization", format!("Bearer {token}"))
            .body(Body::empty())
            .expect("request should build");

        let response = app
            .oneshot(request)
            .await
            .expect("folder tree route should respond");

        assert_eq!(response.status(), StatusCode::OK);
        let json = read_json(response).await;
        assert_eq!(json.as_array().expect("array response").len(), 1);
        assert_eq!(json[0]["name"], "Root Route");
        assert_eq!(json[0]["children"][0]["name"], "Child Route");
    }

    #[tokio::test]
    async fn upload_route_accepts_authenticated_multipart_file() {
        let pool = setup_test_db().await;
        let user = create_user(&pool, "upload@example.com", "Upload Owner", "hash")
            .await
            .expect("user should be created");
        let token = test_config()
            .sign_jwt(&user.id, &user.email, &user.role)
            .expect("jwt should sign");
        let app = create_test_app(pool);

        let boundary = "X-BOUNDARY";
        let multipart_body = format!(
            "--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"hello.txt\"\r\nContent-Type: text/plain\r\n\r\nhello rust upload\r\n--{boundary}--\r\n"
        );

        let request = Request::builder()
            .method("POST")
            .uri("/upload")
            .header("authorization", format!("Bearer {token}"))
            .header("content-type", format!("multipart/form-data; boundary={boundary}"))
            .body(Body::from(multipart_body))
            .expect("request should build");

        let response = app
            .oneshot(request)
            .await
            .expect("upload route should respond");

        assert_eq!(response.status(), StatusCode::CREATED);
        let json = read_json(response).await;
        assert_eq!(json["message"], "Upload thành công");
        assert!(json["filename"].as_str().is_some());
    }

    #[tokio::test]
    async fn document_routes_support_create_detail_and_download() {
        let pool = setup_test_db().await;
        let user = create_user(&pool, "document@example.com", "Document Owner", "hash")
            .await
            .expect("user should be created");
        let token = test_config()
            .sign_jwt(&user.id, &user.email, &user.role)
            .expect("jwt should sign");
        let app = create_test_app(pool);

        let boundary = "DOC-BOUNDARY";
        let multipart_body = format!(
            "--{boundary}\r\nContent-Disposition: form-data; name=\"title\"\r\n\r\nRust Integration Guide\r\n--{boundary}\r\nContent-Disposition: form-data; name=\"keywords\"\r\n\r\nrust,v2,docs\r\n--{boundary}\r\nContent-Disposition: form-data; name=\"isPublic\"\r\n\r\ntrue\r\n--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"guide.txt\"\r\nContent-Type: text/plain\r\n\r\nhello from document route\r\n--{boundary}--\r\n"
        );

        let create_request = Request::builder()
            .method("POST")
            .uri("/v2/documents")
            .header("authorization", format!("Bearer {token}"))
            .header("content-type", format!("multipart/form-data; boundary={boundary}"))
            .body(Body::from(multipart_body))
            .expect("request should build");

        let create_response = app
            .clone()
            .oneshot(create_request)
            .await
            .expect("document create should respond");

        assert_eq!(create_response.status(), StatusCode::CREATED);
        let created_json = read_json(create_response).await;
        let document_id = created_json["id"].as_str().expect("id should exist");
        assert_eq!(created_json["title"], "Rust Integration Guide");
        assert_eq!(created_json["fileName"], "guide.txt");
        assert_eq!(created_json["isPublic"], true);

        let detail_request = Request::builder()
            .method("GET")
            .uri(format!("/v2/documents/{document_id}"))
            .header("authorization", format!("Bearer {token}"))
            .body(Body::empty())
            .expect("request should build");

        let detail_response = app
            .clone()
            .oneshot(detail_request)
            .await
            .expect("document detail should respond");

        assert_eq!(detail_response.status(), StatusCode::OK);
        let detail_json = read_json(detail_response).await;
        assert_eq!(detail_json["title"], "Rust Integration Guide");

        let download_request = Request::builder()
            .method("GET")
            .uri(format!("/v2/documents/{document_id}/download"))
            .header("authorization", format!("Bearer {token}"))
            .body(Body::empty())
            .expect("request should build");

        let download_response = app
            .oneshot(download_request)
            .await
            .expect("document download should respond");

        assert_eq!(download_response.status(), StatusCode::OK);
        let download_bytes = axum::body::to_bytes(download_response.into_body(), usize::MAX)
            .await
            .expect("download body should read");
        let download_text = String::from_utf8(download_bytes.to_vec()).expect("text file should decode");
        assert_eq!(download_text, "hello from document route");
    }

    #[tokio::test]
    async fn document_list_and_inspection_routes_handle_sqlite_integer_timestamps() {
        let pool = setup_test_db().await;
        let user = create_user(&pool, "timestamp@example.com", "Timestamp User", "hash")
            .await
            .expect("user should be created");
        let token = test_config()
            .sign_jwt(&user.id, &user.email, &user.role)
            .expect("jwt should sign");
        let app = create_test_app(pool.clone());

        sqlx::query(
            r#"
            INSERT INTO inspection_history (
                id, filename, content_type, extension, size_bytes, sha256, supported_content_type, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind("inspection-integer")
        .bind("sample.txt")
        .bind("text/plain")
        .bind("txt")
        .bind(12_i64)
        .bind("abc123")
        .bind(true)
        .bind(1_772_000_000_000_i64)
        .execute(&pool)
        .await
        .expect("inspection row should insert");

        sqlx::query(
            r#"
            INSERT INTO documents (
                id, user_id, folder_id, title, description, author, subject, keywords,
                file_name, file_path, file_size, mime_type, inspection_id, status, is_public, created_at, updated_at
            ) VALUES (?, ?, NULL, ?, NULL, NULL, NULL, ?, ?, ?, ?, ?, NULL, 'ACTIVE', 1, ?, ?)
            "#,
        )
        .bind("document-integer")
        .bind(&user.id)
        .bind("Timestamp Document")
        .bind("rust,timestamp")
        .bind("timestamp.txt")
        .bind("uploads/timestamp.txt")
        .bind(12_i64)
        .bind("text/plain")
        .bind(1_772_000_000_500_i64)
        .bind(1_772_000_001_000_i64)
        .execute(&pool)
        .await
        .expect("document row should insert");

        let documents_request = Request::builder()
            .method("GET")
            .uri("/v2/documents")
            .header("authorization", format!("Bearer {token}"))
            .body(Body::empty())
            .expect("request should build");

        let documents_response = app
            .clone()
            .oneshot(documents_request)
            .await
            .expect("documents route should respond");

        assert_eq!(documents_response.status(), StatusCode::OK);
        let documents_json = read_json(documents_response).await;
        assert_eq!(documents_json["data"][0]["title"], "Timestamp Document");
        assert!(documents_json["data"][0]["createdAt"].as_str().is_some());

        let inspections_request = Request::builder()
            .method("GET")
            .uri("/inspections?limit=5")
            .body(Body::empty())
            .expect("request should build");

        let inspections_response = app
            .clone()
            .oneshot(inspections_request)
            .await
            .expect("inspections route should respond");

        assert_eq!(inspections_response.status(), StatusCode::OK);
        let inspections_json = read_json(inspections_response).await;
        assert_eq!(inspections_json["data"][0]["id"], "inspection-integer");
        assert!(inspections_json["data"][0]["created_at"].as_str().is_some());

        let inspection_detail_request = Request::builder()
            .method("GET")
            .uri("/inspections/inspection-integer")
            .body(Body::empty())
            .expect("request should build");

        let inspection_detail_response = app
            .oneshot(inspection_detail_request)
            .await
            .expect("inspection detail route should respond");

        assert_eq!(inspection_detail_response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn news_and_category_routes_work_for_admin_and_public_reads() {
        let pool = setup_test_db().await;
        let admin = create_user(&pool, "admin@example.com", "Admin User", "hash")
            .await
            .expect("admin should be created");
        sqlx::query("UPDATE users SET role = 'ADMIN' WHERE id = ?")
            .bind(&admin.id)
            .execute(&pool)
            .await
            .expect("admin role should update");

        let admin_token = test_config()
            .sign_jwt(&admin.id, &admin.email, "ADMIN")
            .expect("admin jwt should sign");
        let app = create_test_app(pool);

        let create_category_request = Request::builder()
            .method("POST")
            .uri("/news-categories")
            .header("authorization", format!("Bearer {admin_token}"))
            .header("content-type", "application/json")
            .body(Body::from(
                r#"{"name":"Engineering","slug":"engineering","description":"Rust category","order":1,"status":"ACTIVE"}"#,
            ))
            .expect("request should build");

        let create_category_response = app
            .clone()
            .oneshot(create_category_request)
            .await
            .expect("category create should respond");

        assert_eq!(create_category_response.status(), StatusCode::CREATED);
        let category_json = read_json(create_category_response).await;
        let category_id = category_json["id"].as_str().expect("category id should exist");
        assert_eq!(category_json["slug"], "engineering");

        let create_news_request = Request::builder()
            .method("POST")
            .uri("/news")
            .header("authorization", format!("Bearer {admin_token}"))
            .header("content-type", "application/json")
            .body(Body::from(format!(
                r#"{{"categoryId":"{category_id}","title":"Rust V2 Released","slug":"rust-v2-released","summary":"Migration complete","content":"<p>Rust V2 is live</p>","isFeatured":true,"isPublished":true}}"#
            )))
            .expect("request should build");

        let create_news_response = app
            .clone()
            .oneshot(create_news_request)
            .await
            .expect("news create should respond");

        assert_eq!(create_news_response.status(), StatusCode::CREATED);
        let news_json = read_json(create_news_response).await;
        assert_eq!(news_json["slug"], "rust-v2-released");

        let list_request = Request::builder()
            .method("GET")
            .uri("/news?category=engineering")
            .body(Body::empty())
            .expect("request should build");

        let list_response = app
            .clone()
            .oneshot(list_request)
            .await
            .expect("news list should respond");

        assert_eq!(list_response.status(), StatusCode::OK);
        let list_json = read_json(list_response).await;
        assert_eq!(list_json["data"].as_array().expect("data array").len(), 1);
        assert_eq!(list_json["data"][0]["title"], "Rust V2 Released");

        let featured_request = Request::builder()
            .method("GET")
            .uri("/news/featured?limit=1")
            .body(Body::empty())
            .expect("request should build");

        let featured_response = app
            .clone()
            .oneshot(featured_request)
            .await
            .expect("featured route should respond");

        assert_eq!(featured_response.status(), StatusCode::OK);
        let featured_json = read_json(featured_response).await;
        assert_eq!(featured_json[0]["slug"], "rust-v2-released");

        let slug_request = Request::builder()
            .method("GET")
            .uri("/news/slug/rust-v2-released")
            .body(Body::empty())
            .expect("request should build");

        let slug_response = app
            .oneshot(slug_request)
            .await
            .expect("slug route should respond");

        assert_eq!(slug_response.status(), StatusCode::OK);
        let slug_json = read_json(slug_response).await;
        assert_eq!(slug_json["viewCount"], 1);
        assert_eq!(slug_json["category"]["slug"], "engineering");
    }

    #[tokio::test]
    async fn document_routes_support_update_and_delete() {
        let pool = setup_test_db().await;
        let user = create_user(&pool, "doc-update@example.com", "Doc Editor", "hash")
            .await
            .expect("user should be created");
        let token = test_config()
            .sign_jwt(&user.id, &user.email, &user.role)
            .expect("jwt should sign");
        let app = create_test_app(pool.clone());

        let create_boundary = "DOC-UPD-BOUNDARY";
        let create_body = format!(
            "--{create_boundary}\r\nContent-Disposition: form-data; name=\"title\"\r\n\r\nOriginal Document\r\n--{create_boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"original.txt\"\r\nContent-Type: text/plain\r\n\r\noriginal content\r\n--{create_boundary}--\r\n"
        );

        let create_request = Request::builder()
            .method("POST")
            .uri("/v2/documents")
            .header("authorization", format!("Bearer {token}"))
            .header("content-type", format!("multipart/form-data; boundary={create_boundary}"))
            .body(Body::from(create_body))
            .expect("request should build");

        let create_response = app
            .clone()
            .oneshot(create_request)
            .await
            .expect("document create should respond");
        let created_json = read_json(create_response).await;
        let document_id = created_json["id"].as_str().expect("document id should exist");

        let update_request = Request::builder()
            .method("PUT")
            .uri(format!("/v2/documents/{document_id}"))
            .header("authorization", format!("Bearer {token}"))
            .header("content-type", "application/json")
            .body(Body::from(
                r#"{"title":"Updated Document","description":"Updated from integration test","isPublic":true}"#,
            ))
            .expect("request should build");

        let update_response = app
            .clone()
            .oneshot(update_request)
            .await
            .expect("document update should respond");

        assert_eq!(update_response.status(), StatusCode::OK);
        let update_json = read_json(update_response).await;
        assert_eq!(update_json["title"], "Updated Document");
        assert_eq!(update_json["isPublic"], true);

        let delete_request = Request::builder()
            .method("DELETE")
            .uri(format!("/v2/documents/{document_id}"))
            .header("authorization", format!("Bearer {token}"))
            .body(Body::empty())
            .expect("request should build");

        let delete_response = app
            .clone()
            .oneshot(delete_request)
            .await
            .expect("document delete should respond");

        assert_eq!(delete_response.status(), StatusCode::NO_CONTENT);

        let db_status: String = sqlx::query_scalar("SELECT status FROM documents WHERE id = ?")
            .bind(document_id)
            .fetch_one(&pool)
            .await
            .expect("status should be queryable");
        assert_eq!(db_status, "DELETED");
    }

    #[tokio::test]
    async fn folder_routes_support_update_and_delete() {
        let pool = setup_test_db().await;
        let user = create_user(&pool, "folder-update@example.com", "Folder Editor", "hash")
            .await
            .expect("user should be created");
        let token = test_config()
            .sign_jwt(&user.id, &user.email, &user.role)
            .expect("jwt should sign");
        let app = create_test_app(pool.clone());

        let create_request = Request::builder()
            .method("POST")
            .uri("/v2/folders")
            .header("authorization", format!("Bearer {token}"))
            .header("content-type", "application/json")
            .body(Body::from(
                r##"{"name":"Original Folder","description":"First version","color":"#123456"}"##,
            ))
            .expect("request should build");

        let create_response = app
            .clone()
            .oneshot(create_request)
            .await
            .expect("folder create should respond");
        assert_eq!(create_response.status(), StatusCode::CREATED);
        let create_json = read_json(create_response).await;
        let folder_id = create_json["id"].as_str().expect("folder id should exist");

        let update_request = Request::builder()
            .method("PUT")
            .uri(format!("/v2/folders/{folder_id}"))
            .header("authorization", format!("Bearer {token}"))
            .header("content-type", "application/json")
            .body(Body::from(
                r#"{"name":"Updated Folder","description":"Second version"}"#,
            ))
            .expect("request should build");

        let update_response = app
            .clone()
            .oneshot(update_request)
            .await
            .expect("folder update should respond");

        assert_eq!(update_response.status(), StatusCode::OK);
        let update_json = read_json(update_response).await;
        assert_eq!(update_json["name"], "Updated Folder");

        let delete_request = Request::builder()
            .method("DELETE")
            .uri(format!("/v2/folders/{folder_id}"))
            .header("authorization", format!("Bearer {token}"))
            .body(Body::empty())
            .expect("request should build");

        let delete_response = app
            .clone()
            .oneshot(delete_request)
            .await
            .expect("folder delete should respond");

        assert_eq!(delete_response.status(), StatusCode::NO_CONTENT);

        let db_status: String = sqlx::query_scalar("SELECT status FROM folders WHERE id = ?")
            .bind(folder_id)
            .fetch_one(&pool)
            .await
            .expect("status should be queryable");
        assert_eq!(db_status, "DELETED");
    }

    #[tokio::test]
    async fn news_routes_support_update_and_delete() {
        let pool = setup_test_db().await;
        let admin = create_user(&pool, "news-admin@example.com", "News Admin", "hash")
            .await
            .expect("admin should be created");
        sqlx::query("UPDATE users SET role = 'ADMIN' WHERE id = ?")
            .bind(&admin.id)
            .execute(&pool)
            .await
            .expect("admin role should update");

        let admin_token = test_config()
            .sign_jwt(&admin.id, &admin.email, "ADMIN")
            .expect("jwt should sign");
        let app = create_test_app(pool.clone());

        let category_request = Request::builder()
            .method("POST")
            .uri("/news-categories")
            .header("authorization", format!("Bearer {admin_token}"))
            .header("content-type", "application/json")
            .body(Body::from(
                r#"{"name":"Platform","slug":"platform","description":"Platform updates","order":2,"status":"ACTIVE"}"#,
            ))
            .expect("request should build");

        let category_response = app
            .clone()
            .oneshot(category_request)
            .await
            .expect("category route should respond");
        let category_json = read_json(category_response).await;
        let category_id = category_json["id"].as_str().expect("category id should exist");

        let create_request = Request::builder()
            .method("POST")
            .uri("/news")
            .header("authorization", format!("Bearer {admin_token}"))
            .header("content-type", "application/json")
            .body(Body::from(format!(
                r#"{{"categoryId":"{category_id}","title":"Original News","slug":"original-news","summary":"Original summary","content":"<p>Original content</p>","isFeatured":false,"isPublished":false}}"#
            )))
            .expect("request should build");

        let create_response = app
            .clone()
            .oneshot(create_request)
            .await
            .expect("news create should respond");

        assert_eq!(create_response.status(), StatusCode::CREATED);
        let create_json = read_json(create_response).await;
        let news_id = create_json["id"].as_str().expect("news id should exist");

        let update_request = Request::builder()
            .method("PUT")
            .uri(format!("/news/{news_id}"))
            .header("authorization", format!("Bearer {admin_token}"))
            .header("content-type", "application/json")
            .body(Body::from(
                r#"{"title":"Updated News","summary":"Updated summary","isPublished":true,"isFeatured":true}"#,
            ))
            .expect("request should build");

        let update_response = app
            .clone()
            .oneshot(update_request)
            .await
            .expect("news update should respond");

        assert_eq!(update_response.status(), StatusCode::OK);
        let update_json = read_json(update_response).await;
        let db_row: (String, i64, i64) = sqlx::query_as("SELECT title, is_published, is_featured FROM news WHERE id = ?")
            .bind(news_id)
            .fetch_one(&pool)
            .await
            .expect("updated news should be queryable");
        assert_eq!(update_json["title"], "Updated News", "response body: {update_json}");
        assert_eq!(update_json["isPublished"], true, "response body: {update_json}");
        assert_eq!(update_json["isFeatured"], true, "response body: {update_json}");
        assert_eq!(db_row.0, "Updated News");
        assert_eq!(db_row.1, 1);
        assert_eq!(db_row.2, 1);

        let delete_request = Request::builder()
            .method("DELETE")
            .uri(format!("/news/{news_id}"))
            .header("authorization", format!("Bearer {admin_token}"))
            .body(Body::empty())
            .expect("request should build");

        let delete_response = app
            .clone()
            .oneshot(delete_request)
            .await
            .expect("news delete should respond");

        assert_eq!(delete_response.status(), StatusCode::OK);
        let delete_json = read_json(delete_response).await;
        assert_eq!(delete_json["message"], "Đã xóa bài viết thành công");

        let db_status: String = sqlx::query_scalar("SELECT status FROM news WHERE id = ?")
            .bind(news_id)
            .fetch_one(&pool)
            .await
            .expect("status should be queryable");
        assert_eq!(db_status, "ARCHIVED");
    }
}
