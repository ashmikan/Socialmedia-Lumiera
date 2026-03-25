<div align="center"><h1>Lumiera - Social Media App</h1>

<i>An interactive full-stack social media app with authentication, posts, likes, comments, follows, notifications, media upload, and profile customization.</i>
</div>

## 🎯Jump To

- [Quick Start](#quick-start)
- [Feature Tour](#feature-tour)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)

---

## 📍Quick Start

### 1) Clone and install

```bash
git clone <your-repo-url>
cd Socialmedia-Lumiera

cd api
npm install

cd ../frontend
npm install
```

### 2) Configure database

Update database credentials in [api/connect.js](api/connect.js):

```js
export const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '1234',
	database: 'social'
});
```

### 3) Run backend and frontend

Open two terminals:

```bash
# Terminal 1
cd api
npm start

# Terminal 2
cd frontend
npm start
```

App URLs:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8800

---

## 📍Feature Tour

### Account and auth

- Register, login, logout
- Cookie-based auth sessions (`access_token`)
- Protected routes in the frontend

### Social feed

- Create posts with text + image
- Add location and feeling to posts
- Tag friends in posts
- Edit and delete own posts
- View global/following feed and profile-specific posts

### Engagement

- Like / unlike posts
- Comment on posts
- Delete own comments
- Like / unlike comments
- Follow / unfollow users

### Notifications

- Notification feed for likes, comments, follows
- Unread count endpoint

### Profile and media

- Update name/city/website/profile/cover images
- Upload endpoint stores files in [frontend/public/upload](frontend/public/upload)
- Search users by name

---

## 📍Tech Stack

### Frontend

- React 19
- React Router
- TanStack React Query
- Axios
- Sass (SCSS)
- Material UI Icons

### Backend

- Node.js + Express
- MySQL (`mysql2`)
- JWT (`jsonwebtoken`)
- `cookie-parser` + `cors`
- `multer` for file uploads

---

## 📍Project Structure

```text
Socialmedia-Lumiera/
├─ api/
│  ├─ controllers/
│  ├─ routes/
│  ├─ connect.js
│  └─ index.js
├─ frontend/
│  ├─ public/
│  │  └─ upload/
│  └─ src/
│     ├─ components/
│     ├─ context/
│     └─ pages/
└─ README.md
```

Useful entry files:

- Backend server: [api/index.js](api/index.js)
- DB connection: [api/connect.js](api/connect.js)
- Frontend app root: [frontend/src/App.js](frontend/src/App.js)
- API client: [frontend/src/axios.js](frontend/src/axios.js)

---

## 📍API Overview

Base URL: `http://localhost:8800/api`

<details>
	<summary><strong>Auth</strong></summary>

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

</details>

<details>
	<summary><strong>Users</strong></summary>

- `GET /users/search?q=<name>`
- `GET /users/find/:userId`
- `PUT /users`

</details>

<details>
	<summary><strong>Posts</strong></summary>

- `GET /posts?userId=<id|undefined>`
- `GET /posts/:id`
- `POST /posts`
- `PUT /posts/:id`
- `DELETE /posts/:id`

</details>

<details>
	<summary><strong>Comments and Likes</strong></summary>

- `GET /comments?postId=<id>`
- `POST /comments`
- `DELETE /comments/:id`
- `GET /likes?postId=<id>`
- `POST /likes`
- `DELETE /likes?postId=<id>`
- `GET /comment-likes?commentId=<id>`
- `GET /comment-likes?postId=<id>`
- `POST /comment-likes`
- `DELETE /comment-likes?commentId=<id>`

</details>

<details>
	<summary><strong>Relationships and Notifications</strong></summary>

- `GET /relationships?followedUserId=<id>`
- `POST /relationships`
- `DELETE /relationships?userId=<id>`
- `GET /notifications`
- `GET /notifications/unread-count`

</details>

<details>
	<summary><strong>Upload</strong></summary>

- `POST /upload` (multipart form with field: `file`)

</details>

---

## 📍Database Setup

Create a MySQL database named `social` and required tables for:

- `users`
- `posts`
- `comments`
- `likes`
- `relationships`
- `commentlikes`
- `posttags`

Important columns used by current code:

- `users`: `id`, `username`, `email`, `password`, `name`, `city`, `website`, `profilePic`, `coverPic`
- `posts`: `id`, `desc`, `img`, `createdAt`, `userId`, optional `place`, optional `feeling`
- `comments`: `id`, `desc`, `createdAt`, `userId`, `postId`

---

## 📍Development Scripts

### Backend ([api/package.json](api/package.json))

- `npm start` -> starts API with nodemon

### Frontend ([frontend/package.json](frontend/package.json))

- `npm start` -> run React app
- `npm run build` -> production build
- `npm test` -> test runner

---

## 📍Troubleshooting

<details>
	<summary><strong>Login not working</strong></summary>

- Ensure backend is running on port `8800`.
- Ensure frontend is running on port `3000`.
- Confirm MySQL connection in [api/connect.js](api/connect.js).
- Login expects `username` and `password`.

</details>

<details>
	<summary><strong>Images not showing</strong></summary>

- Verify uploads are saved in [frontend/public/upload](frontend/public/upload).
- Confirm uploaded filename is stored in DB (`posts.img`, `users.profilePic`, `users.coverPic`).

</details>

<details>
	<summary><strong>CORS / cookie issues</strong></summary>

- Check `origin` and `credentials` in [api/index.js](api/index.js).
- Ensure frontend requests use `withCredentials: true` (see [frontend/src/axios.js](frontend/src/axios.js)).

</details>

---

<h3 align="center">Thank you for exploring the app - I hope it brings your social connections to life! 🌟</h3>	

---

<div align="center">
👩🏼‍💻 Credit: <a href="https://github.com/ashmikan">Ashmika Nathali </a>
Last Edited on: 25/03/2026
</div>
