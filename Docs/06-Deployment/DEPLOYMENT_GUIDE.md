# 🚀 SwasthyaCare — Cloud Deployment Guide (100% Free Tier)

This guide walks you through deploying the complete **SwasthyaCare** platform to the cloud for free with automatic SSL/HTTPS and CI/CD pipelines.

---

## 🏛️ System Architecture in the Cloud

| Component | Cloud Provider | Free Tier Specification |
|---|---|---|
| **Frontend** (`client`) | **Vercel** | Free global CDN, continuous deployment from GitHub |
| **Backend API Gateway** (`server`) | **Render** | Free Node.js Web Service (Port 3001) |
| **AI Microservice** (`ai-service`) | **Render** | Free Python FastAPI Web Service (Port 8000) |
| **Database** (`mongodb`) | **MongoDB Atlas** | Free M0 Sandbox Cluster (512MB storage, automated backups) |

---

## 📋 Step-by-Step Deployment Instructions

### Step 1: Set Up Free Cloud Database (MongoDB Atlas)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up with Google/Email.
2. Click **Create Deployment** and select the **M0 Free (Shared)** tier.
3. Choose an AWS region closest to you (e.g. `ap-south-1` Mumbai) and click **Create**.
4. In **Database Access**:
   * Create a database user (e.g. username: `swasthya_admin`, password: generate a strong password and save it).
5. In **Network Access**:
   * Click **Add IP Address** ➔ Select **Allow Access from Anywhere (`0.0.0.0/0`)** so your Render backend can connect.
6. Click **Connect** ➔ Choose **Drivers (Node.js)** ➔ Copy your connection string:
   ```
   mongodb+srv://swasthya_admin:<password>@cluster0.xxxxx.mongodb.net/swasthyacare?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your database password).*

---

### Step 2: Deploy Backend Services to Render (One-Click with `render.yaml`)

Our repository includes a configured **`render.yaml` Blueprint** that automatically spins up both the **Node.js Express Gateway** and the **Python AI Microservice**:

1. Go to [render.com](https://render.com) and sign in with your GitHub account.
2. Click **New +** ➔ Select **Blueprint**.
3. Connect your repository: `riya-aiml/SwasthyaCare`.
4. Select the branch: `feature/sprint-9-chatbot` (or `main`).
5. Render will automatically parse `render.yaml` and discover two web services:
   * `swasthyacare-ai-service` (Python FastAPI)
   * `swasthyacare-server` (Node.js Express)
6. Under `swasthyacare-server` environment variables, paste your MongoDB Atlas connection string from Step 1 into `MONGODB_URI`.
7. Click **Apply**. Render will build and deploy both services!
8. Once deployment finishes, copy your Node backend URL:
   ```
   https://swasthyacare-server.onrender.com
   ```

---

### Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** ➔ **Project**.
3. Select your repository: `SwasthyaCare`.
4. In the Project Configuration:
   * **Framework Preset:** Vite
   * **Root Directory:** Click Edit and select **`client`**
5. In **Environment Variables**:
   * Add a variable:
     * **Key:** `VITE_API_URL`
     * **Value:** Your live Render server URL from Step 2 (e.g., `https://swasthyacare-server.onrender.com`)
6. Click **Deploy**!
7. Within 60 seconds, your application will be live at:
   ```
   https://swasthyacare.vercel.app
   ```

---

## 🔒 Production Environment Variables Reference

### Node API Gateway (`server` on Render)
| Variable | Value / Description |
|---|---|
| `PORT` | `3001` (Render configures `$PORT` automatically) |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string from Step 1 |
| `JWT_SECRET` | Auto-generated secure random key |
| `JWT_EXPIRE` | `7d` |
| `AI_SERVICE_URL` | Handled automatically by Render internal private networking |
| `INTERNAL_AI_SERVICE_SECRET` | `swasthya-internal-prod-key-2026` |
| `SARVAM_API_KEY` | (Optional) Your Sarvam AI Bulbul subscription key |
| `OPENAI_API_KEY` | (Optional) Your OpenAI API key |

### Python AI Microservice (`ai-service` on Render)
| Variable | Value / Description |
|---|---|
| `PYTHON_VERSION` | `3.11.9` |
| `INTERNAL_AI_SERVICE_SECRET` | `swasthya-internal-prod-key-2026` |

### React Frontend (`client` on Vercel)
| Variable | Value / Description |
|---|---|
| `VITE_API_URL` | `https://your-server-name.onrender.com` |

---

## ✅ Post-Deployment Verification Checklist

1. **Health Check:** Open `https://your-server.onrender.com/api/health` in your browser. It should return `{"status":"connected"}`.
2. **AI Health Check:** Open `https://your-ai-service.onrender.com/health`. It should return `{"status":"healthy"}`.
3. **Frontend Check:** Open your Vercel URL. Register a new test patient account and book a test doctor consultation!
