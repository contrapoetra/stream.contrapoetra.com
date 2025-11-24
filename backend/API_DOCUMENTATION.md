# MiniStream API Documentation

## Base URL
```
http://localhost/stream.contrapoetra.com/backend/php/api/
```

## Authentication
Most endpoints require authentication. User must be logged in via session.

---

## 📝 Users API

### Register User
- **URL:** `/users/register` or `/users`
- **Method:** `POST`
- **Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
- **Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user_id": 1,
    "username": "alice",
    "email": "alice@example.com"
  }
}
```

### Login User
- **URL:** `/users/login`
- **Method:** `POST`
- **Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

### Logout User
- **URL:** `/users/logout`
- **Method:** `POST`

### Get Current User
- **URL:** `/users`
- **Method:** `GET`
- **Authentication:** Required

### Get User Profile
- **URL:** `/users/profile`
- **Method:** `GET`
- **Authentication:** Required

---

## 🎥 Videos API

### Upload Video
- **URL:** `/videos`
- **Method:** `POST` (multipart/form-data)
- **Authentication:** Required
- **Fields:**
  - `video` (file) - Video file
  - `title` (string) - Video title
  - `description` (string, optional) - Video description

### Get All Videos
- **URL:** `/videos`
- **Method:** `GET`
- **Query Parameters:**
  - `page` (int, optional) - Page number
  - `limit` (int, optional) - Items per page

### Get Video by ID
- **URL:** `/videos/{video_id}`
- **Method:** `GET`

### Get Videos by User
- **URL:** `/videos?user={user_id}`
- **Method:** `GET`

### Search Videos
- **URL:** `/videos?search=1&q={search_term}`
- **Method:** `GET`

### Update Video
- **URL:** `/videos/{video_id}`
- **Method:** `PUT`
- **Authentication:** Required (video owner only)
- **Body:**
```json
{
  "title": "string",
  "description": "string"
}
```

### Delete Video
- **URL:** `/videos/{video_id}`
- **Method:** `DELETE`
- **Authentication:** Required (video owner only)

---

## 💬 Comments API

### Add Comment
- **URL:** `/comments/video/{video_id}`
- **Method:** `POST`
- **Authentication:** Required
- **Body:**
```json
{
  "comment_text": "string"
}
```

### Get Video Comments
- **URL:** `/comments/video/{video_id}`
- **Method:** `GET`
- **Query Parameters:**
  - `page` (int, optional) - Page number
  - `limit` (int, optional) - Items per page

### Update Comment
- **URL:** `/comments/{comment_id}`
- **Method:** `PUT`
- **Authentication:** Required (comment owner only)
- **Body:**
```json
{
  "comment_text": "string"
}
```

### Delete Comment
- **URL:** `/comments/{comment_id}`
- **Method:** `DELETE`
- **Authentication:** Required (comment owner only)

---

## ❤️ Likes API

### Like Video
- **URL:** `/likes/video/{video_id}`
- **Method:** `POST`
- **Authentication:** Required

### Unlike Video
- **URL:** `/likes/video/{video_id}`
- **Method:** `DELETE`
- **Authentication:** Required

### Get Like Status
- **URL:** `/likes/{video_id}`
- **Method:** `GET`
- **Authentication:** Required

### Get User's Liked Videos
- **URL:** `/likes/user/{user_id}`
- **Method:** `GET`

---

## 🔔 Subscriptions API

### Subscribe to Channel
- **URL:** `/subscriptions/channel/{channel_id}`
- **Method:** `POST`
- **Authentication:** Required

### Unsubscribe from Channel
- **URL:** `/subscriptions/channel/{channel_id}`
- **Method:** `DELETE`
- **Authentication:** Required

### Get Subscription Status
- **URL:** `/subscriptions/{channel_id}`
- **Method:** `GET`
- **Authentication:** Required

### Get User's Subscriptions
- **URL:** `/subscriptions`
- **Method:** `GET`
- **Authentication:** Required

### Get Channel Subscribers
- **URL:** `/subscriptions/channel/{channel_id}`
- **Method:** `GET`

---

## 📊 Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "data": null
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## 🗄️ Database Schema

### Users Table
- `user_id` (INT, PRIMARY KEY)
- `username` (VARCHAR(50))
- `email` (VARCHAR(100), UNIQUE)
- `password` (VARCHAR(255))
- `join_date` (DATE)

### Videos Table
- `video_id` (INT, PRIMARY KEY)
- `user_id` (INT, FOREIGN KEY)
- `title` (VARCHAR(150))
- `description` (TEXT)
- `upload_date` (DATE)
- `file_path` (VARCHAR(255))
- `views` (INT, DEFAULT 0)

### Comments Table
- `comment_id` (INT, PRIMARY KEY)
- `video_id` (INT, FOREIGN KEY)
- `user_id` (INT, FOREIGN KEY)
- `comment_text` (TEXT)
- `comment_date` (DATETIME)

### Likes Table
- `like_id` (INT, PRIMARY KEY)
- `video_id` (INT, FOREIGN KEY)
- `user_id` (INT, FOREIGN KEY)
- `like_date` (DATETIME)

### Subscriptions Table
- `subscription_id` (INT, PRIMARY KEY)
- `subscriber_id` (INT, FOREIGN KEY)
- `channel_id` (INT, FOREIGN KEY)
- `subscribe_date` (DATE)