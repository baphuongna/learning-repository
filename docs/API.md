# API Documentation

## Tổng quan

API được xây dựng với **NestJS** và tuân theo chuẩn RESTful. Tất cả các endpoints đều có prefix `/api`.

### Base URL
```
http://localhost:3001/api
```

### Response Format

#### Success Response
```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Error Response
```json
{
  "statusCode": 400,
  "message": "Mô tả lỗi",
  "error": "Bad Request"
}
```

---

## Authentication

### Đăng ký

**POST** `/auth/register`

Tạo tài khoản mới.

**Request Body:**
```json
{
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "USER"
  }
}
```

**Validation:**
- `email`: Email hợp lệ, unique
- `fullName`: Không rỗng
- `password`: Tối thiểu 6 ký tự

---

### Đăng nhập

**POST** `/auth/login`

Đăng nhập và lấy access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "USER"
  }
}
```

---

### Lấy thông tin user hiện tại

**GET** `/auth/me`

Yêu cầu authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "role": "USER",
  "avatarUrl": null,
  "createdAt": "2026-02-22T00:00:00.000Z",
  "_count": {
    "documents": 5
  }
}
```

---

## Documents

### Danh sách tài liệu

**GET** `/documents`

Lấy danh sách tài liệu. Admin xem tất cả, User chỉ xem của mình và tài liệu công khai.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| page | int | 1 | Số trang |
| limit | int | 10 | Số items per page |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Giáo trình Toán học",
      "description": "Mô tả...",
      "author": "Bộ Giáo dục",
      "subject": "Toán học",
      "keywords": ["toán", "lớp 10"],
      "fileName": "toan-lop-10.pdf",
      "fileSize": "5242880",
      "mimeType": "application/pdf",
      "status": "ACTIVE",
      "isPublic": true,
      "createdAt": "2026-02-22T00:00:00.000Z",
      "user": {
        "id": "uuid",
        "fullName": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### Tài liệu của tôi

**GET** `/documents/my`

Lấy danh sách tài liệu do user hiện tại tạo.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| page | int | 1 | Số trang |
| limit | int | 10 | Số items per page |

---

### Chi tiết tài liệu

**GET** `/documents/:id`

Lấy thông tin chi tiết một tài liệu.

**Headers:**
```
Authorization: Bearer <token>
```

**Params:**
| Param | Type | Mô tả |
|-------|------|-------|
| id | UUID | ID tài liệu |

**Response:**
```json
{
  "id": "uuid",
  "title": "Giáo trình Toán học",
  "description": "Mô tả chi tiết...",
  "author": "Bộ Giáo dục",
  "subject": "Toán học",
  "keywords": ["toán", "lớp 10", "giáo trình"],
  "language": "vi",
  "fileName": "toan-lop-10.pdf",
  "filePath": "/uploads/toan-lop-10.pdf",
  "fileSize": "5242880",
  "mimeType": "application/pdf",
  "status": "ACTIVE",
  "isPublic": true,
  "createdAt": "2026-02-22T00:00:00.000Z",
  "updatedAt": "2026-02-22T00:00:00.000Z",
  "user": {
    "id": "uuid",
    "fullName": "Admin User",
    "email": "admin@example.com"
  }
}
```

---

### Tạo tài liệu mới

**POST** `/documents`

Upload và tạo tài liệu mới.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| file | File | ✅ | File tài liệu |
| title | String | ✅ | Tiêu đề |
| description | String | ❌ | Mô tả |
| author | String | ❌ | Tác giả |
| subject | String | ❌ | Môn học |
| keywords | String | ❌ | Từ khóa (phân cách bằng dấu phẩy) |
| isPublic | Boolean | ❌ | Công khai (default: false) |

**Supported File Types:**
- PDF (.pdf)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- PowerPoint (.ppt, .pptx)
- Video (.mp4)
- Audio (.mp3)
- Images (.jpg, .png)

**Max File Size:** 50MB

---

### Cập nhật tài liệu

**PUT** `/documents/:id`

Cập nhật metadata tài liệu (không thay đổi file).

**Headers:**
```
Authorization: Bearer <token>
```

**Params:**
| Param | Type | Mô tả |
|-------|------|-------|
| id | UUID | ID tài liệu |

**Request Body:**
```json
{
  "title": "Tiêu đề mới",
  "description": "Mô tả mới",
  "author": "Tác giả mới",
  "subject": "Môn học mới",
  "keywords": ["tag1", "tag2"],
  "isPublic": true
}
```

---

### Xóa tài liệu

**DELETE** `/documents/:id`

Soft delete tài liệu (status → DELETED).

**Headers:**
```
Authorization: Bearer <token>
```

**Params:**
| Param | Type | Mô tả |
|-------|------|-------|
| id | UUID | ID tài liệu |

**Response:**
```json
{
  "message": "Đã xóa tài liệu thành công"
}
```

---

## Search

### Tìm kiếm tài liệu

**GET** `/search`

Tìm kiếm tài liệu theo từ khóa.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| q | String | ✅ | Từ khóa tìm kiếm |
| page | int | ❌ | Số trang (default: 1) |
| limit | int | ❌ | Items per page (default: 10) |

**Tìm kiếm trong các trường:**
- title
- description
- author
- subject

**Response:** Tương tự GET `/documents`

---

## Upload

### Upload file

**POST** `/upload`

Upload file lên server.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| file | File | ✅ | File cần upload |

**Response:**
```json
{
  "message": "Upload thành công",
  "path": "/uploads/uuid-filename.pdf",
  "filename": "uuid-filename.pdf"
}
```

---

### Download file

**GET** `/upload/:filename`

Download file từ server.

**Params:**
| Param | Type | Mô tả |
|-------|------|-------|
| filename | String | Tên file |

**Response:** File binary

---

## Error Codes

| Status Code | Mô tả |
|-------------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập hoặc token hết hạn |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy resource |
| 409 | Conflict - Dữ liệu đã tồn tại (e.g., email) |
| 500 | Internal Server Error - Lỗi server |

---

## Swagger UI

Truy cập Swagger UI để xem và test API trực tiếp:

**URL:** http://localhost:3001/api/docs
