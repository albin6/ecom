# 🚀 Hannvis eCommerce Deployment Guide

This guide provides step-by-step instructions for deploying your MERN stack application to production using **Render** (Backend) and **Vercel** (Frontend).

---

## 🏗️ Phase 1: Database & Redis Setup (Infrastructure)

### 1. MongoDB Atlas (Database)
1.  **Create Account**: Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
2.  **Create Cluster**: Deploy a "Shared" (Free) cluster.
3.  **Network Access**: Add IP Address `0.0.0.0/0` (Allow access from anywhere).
4.  **Database Access**: Create a user with a strong password.
5.  **Connect**: Get your `Connection String` (e.g., `mongodb+srv://...`).

### 2. Upstash (Redis)
*Required for atomic inventory reservations.*
1.  **Create Account**: Sign up at [upstash.com](https://upstash.com/).
2.  **Create Database**: Select "Redis" and choose a region close to your server (e.g., US-East).
3.  **Copy URI**: Copy the `UPSTASH_REDIS_REST_URL` or the standard `redis://` URI.

### 3. Cloudinary (Images)
1.  **Dashboard**: Get your `Cloud Name`, `API Key`, and `API Secret` from your [Cloudinary Dashboard](https://cloudinary.com/console).

---

## ⚙️ Phase 2: Backend Deployment (Render)

1.  **New Web Service**: Connect your GitHub repository to [Render](https://dashboard.render.com/).
2.  **Root Directory**: Set to `backend`.
3.  **Build Command**: `npm install`.
4.  **Start Command**: `npm start`.
5.  **Environment Variables**: Add the following secrets:
    -   `NODE_ENV`: `production`
    -   `PORT`: `10000`
    -   `MONGO_URI`: (Your Atlas URI)
    -   `REDIS_URI`: (Your Upstash Redis URI)
    -   `JWT_SECRET`: (A long, random string)
    -   `JWT_REFRESH_SECRET`: (Another long, random string)
    -   `FRONTEND_URL`: (Your future Vercel URL, e.g., `https://hannvis.vercel.app`)
    -   `CLOUDINARY_CLOUD_NAME`: (Your Cloudinary name)
    -   `CLOUDINARY_API_KEY`: (Your Cloudinary Key)
    -   `CLOUDINARY_API_SECRET`: (Your Cloudinary Secret)

---

## 🎨 Phase 3: Frontend Deployment (Vercel)

1.  **New Project**: Connect your GitHub repository to [Vercel](https://vercel.com/new).
2.  **Root Directory**: Set to `frontend`.
3.  **Framework Preset**: Vite.
4.  **Build Command**: `npm run build`.
5.  **Output Directory**: `dist`.
6.  **Environment Variables**:
    -   `VITE_API_URL`: (Your Render URL + `/api/v1`, e.g., `https://hannvis-api.onrender.com/api/v1`)

---

## ✅ Phase 4: Final Verification

1.  **Check Health**: Visit `https://your-backend.render.com/` — you should see the "Welcome to Hannvis API" message.
2.  **CORS**: Ensure your `FRONTEND_URL` in Render matches your Vercel URL exactly (no trailing slash).
3.  **Launch**: Once both are deployed, visit your Vercel URL and test the login/cart flow.

> [!TIP]
> **Admin Seeding**: On the first start, the system will automatically create an admin account using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you provided in the Render environment variables.
