# 🚀 Railway Deployment Guide for Finance Trainer

This guide will help you deploy the Finance Trainer application (Frontend + Backend + Database) to [Railway](https://railway.app/).

## Prerequisites
1.  A [Railway account](https://railway.app/).
2.  The [Railway CLI](https://docs.railway.app/guides/cli) installed (optional, but recommended).
3.  Your project pushed to GitHub.

---

## Step 1: Create a New Project on Railway

1.  Go to your Railway Dashboard.
2.  Click **"New Project"**.
3.  Select **"Deploy from GitHub repo"**.
4.  Choose your repository: `Didedar/Finance_Trainer`.
5.  Click **"Add Variables"** later.

## Step 2: Configure the Database (PostgreSQL)

1.  In your project view, click **"New"** -> **"Database"** -> **"PostgreSQL"**.
2.  Once created, click on the PostgreSQL service.
3.  Go to the **"Variables"** tab.
4.  Copy the `DATABASE_URL` (or `POSTGRES_URL`). You will need this for the backend.

## Step 3: Configure the Backend Service

1.  Railway should automatically detect the `backend` folder if you set the **Root Directory**.
2.  Click on the service that represents your backend (it might be named after your repo).
3.  Go to **"Settings"**:
    - **Root Directory**: Set to `/backend`.
    - **Build Command**: Leave empty or default (Railway detects `requirements.txt`).
    - **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4.  Go to **"Variables"**:
    - Add `DATABASE_URL`: Paste the value from Step 2.
    - Add `SECRET_KEY`: Generate a random string (e.g., `openssl rand -hex 32`).
    - Add `CORS_ORIGINS`: Set to `https://<YOUR-FRONTEND-URL>.up.railway.app` (You'll get this URL in Step 4). for now, use `*` or `http://localhost:5173` if testing.
    - Add `GEMINI_API_KEY`: Your Google Gemini API Key.
    - Add `PYTHON_VERSION`: `3.10` or `3.11` (optional, default is usually fine).
    - Add `PORT`: `8000` (Railway provides this automatically, but good to be aware).

## Step 4: Configure the Frontend Service

1.  In the same project, click **"New"** -> **"GitHub Repo"** -> Select `Didedar/Finance_Trainer` again.
2.  Click on this new service to configure it as the frontend.
3.  Go to **"Settings"**:
    - **Root Directory**: Set to `/frontend`.
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm run preview -- --host --port $PORT` (or serve built files).
    *Recommendation*: For better performance, use the HTTP server to serve static files.  The `railway.toml` I added tries to use `npm run start`, make sure your `package.json` has a start script that serves the `dist` folder.
    *Better Start Command*: `npx serve -s dist -l $PORT`
4.  Go to **"Variables"**:
    - Add `VITE_API_URL`: Set this to your **Backend Service URL** (e.g., `https://backend-production.up.railway.app`).  **IMPORTANT**: Do not add a trailing slash `/`.
        - You can find the Backend URL in the Backend Service -> Settings -> Domains.

## Step 5: Finalize and Deploy

1.  Once variables are set, Railway will likely trigger a redeploy.
2.  Watch the **Build Logs** and **Deploy Logs** for any errors.
3.  Start with the Backend. Ensure migrations run successfully (`alembic upgrade head`).
4.  Then check the Frontend. Open the public URL.

## Troubleshooting

-   **Build Failed (pip not found)**: This means you are building from the Project Root instead of the Backend folder. **Go to Settings -> Root Directory and set it to `/backend`.**
-   **Backend 500 Error**: Check the logs. If it's a database content issue, make sure migrations ran.
-   **Frontend API Errors**: Check the Network tab in your browser. Verify `VITE_API_URL` is pointing to the correct HTTPS backend URL.
-   **CORS Errors**: Ensure the Backend `CORS_ORIGINS` variable matches the Frontend's public domain exactly (no trailing slash).

## Notes

-   I have added `railway.toml` files in both `backend/` and `frontend/` directories to help Railway detect the configuration automatically, but setting the **Root Directory** in the UI is crucial.
