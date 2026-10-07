# Exanor CMS Server

Backend API for the Exanor content management system. It powers authentication, user management, blog post workflows, media uploads, and global app settings.

## Overview

This project is an Express + MongoDB server used by the Exanor admin console and public-facing site.

It provides:
- JWT-based authentication for admin users
- Role/permission-based access control
- Draft/review/publish workflow for posts
- Public endpoints for published blog content and app settings
- Cloudinary-based media upload and management
- Audit logging for key admin actions
- Optional webhook triggers for frontend revalidation and deploys

## Tech Stack

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Cloudinary (`cloudinary`, `multer`, `multer-storage-cloudinary`)

## Project Structure

```text
src/
  config/         # DB connection
  controllers/    # Request handlers
  middleware/     # Auth and upload middleware
  models/         # Mongoose schemas
  routes/         # API route definitions
  scripts/        # Seed scripts
  utils/          # Audit + webhook utilities
  server.js       # App entrypoint
scripts/          # Operational helper scripts
```

## Getting Started

### 1) Prerequisites

- Node.js 18+
- MongoDB instance
- Cloudinary account (for media endpoints)

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment

Create a `.env` file in the project root (you can copy `.env.example`):

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/exanor-blog
JWT_SECRET=replace-with-a-secure-secret

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional integrations
VERCEL_DEPLOY_HOOK=
REVALIDATION_SECRET=
FRONTEND_URL=
```

### 4) Run the server

```bash
npm run dev
```

or

```bash
npm start
```

Default URL: `http://localhost:5000`

## NPM Scripts

- `npm start` — start server
- `npm run dev` — run with nodemon
- `npm test` — placeholder script (no test suite configured in this repository)

## API Overview

Base URL: `/api`

### Auth

- `POST /auth/login`
- `POST /auth/change-password` (protected)
- `PUT /auth/profile` (protected)

### Admin Users (protected)

- `GET /admin/users`
- `POST /admin/users`
- `PUT /admin/users/:id`
- `POST /admin/users/:id/reset-password`
- `PUT /admin/users/:id/status`

### Posts

**Admin (protected):**
- `GET /admin/posts`
- `POST /admin/posts`
- `PUT /admin/posts/:id`
- `DELETE /admin/posts/:id`

**Public:**
- `GET /public/posts`
- `GET /public/posts/:slug`

### Media Uploads (protected)

- `POST /admin/upload` (multipart, field name: `image`)
- `GET /admin/upload`
- `DELETE /admin/upload?public_id=<cloudinary_public_id>`

### Settings

- `GET /public/settings`
- `GET /admin/settings` (protected)
- `PUT /admin/settings` (protected)

## Authorization Model

Authentication uses JWT bearer tokens.

The codebase enforces permission checks for admin routes using permission keys such as:
- `CREATE_POST`
- `READ_POST`
- `UPDATE_POST`
- `DELETE_POST`
- `PUBLISH_POST`
- `MANAGE_USERS`

## Content Workflow

Posts support these states:
- `DRAFT`
- `IN_REVIEW`
- `REJECTED`
- `PUBLISHED`

The update logic includes handling for:
- author restrictions vs admin-level access
- review/approval of pending updates
- revalidation hooks for published content changes

## Notes

- CORS is currently configured as open (`origin: *`) in `src/server.js`.
- `scripts/` and `src/scripts/` include maintenance/seed helpers for local operations.

## License

ISC
