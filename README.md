# Eppic Homes & Collections — E-Commerce Store

A full-stack single-vendor e-commerce store built for a Kenyan home goods business.

## Tech Stack
- **Frontend**: React + Tailwind CSS → deployed on Vercel
- **Backend**: Node.js + Express → deployed on Railway
- **Database**: MongoDB Atlas (free tier)
- **Payments**: M-Pesa Daraja API (STK Push)
- **Images**: Cloudinary
- **Notifications**: Twilio WhatsApp API

---

## Project Structure
```
eppic-homes/
├── frontend/        ← React app (deploy to Vercel)
└── backend/         ← Node.js API (deploy to Railway)
```

---

## Quick Start (Local Development)

### 1. Clone & install
```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in your keys
npm run dev            # runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env   # set REACT_APP_API_URL=http://localhost:5000
npm start              # runs on http://localhost:3000
```

---

## Deployment Guide

### Step 1 — MongoDB Atlas (Database)
1. Go to https://cloud.mongodb.com → Create free account
2. Create a free M0 cluster
3. Under "Database Access" → Add a user with password
4. Under "Network Access" → Allow access from anywhere (0.0.0.0/0)
5. Click "Connect" → "Connect your application" → copy the URI
6. Save as: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/eppic-homes`

### Step 2 — Cloudinary (Product Images)
1. Go to https://cloudinary.com → Create free account
2. Dashboard → copy Cloud Name, API Key, API Secret
3. Save these as environment variables (see .env.example)

### Step 3 — M-Pesa Daraja API
1. Go to https://developer.safaricom.co.ke → Create account
2. Create an app → Get Consumer Key & Secret
3. For sandbox testing: use the sandbox credentials
4. For production: apply with your Paybill/Till number
5. Set MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET

### Step 4 — Deploy Backend to Railway
1. Go to https://railway.app → Sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo → choose the `backend` folder as root
4. Add all environment variables from .env.example
5. Railway gives you a URL like: https://eppic-backend.up.railway.app
6. Save this URL for the frontend

### Step 5 — Deploy Frontend to Vercel
1. Go to https://vercel.com → Sign up with GitHub
2. Click "New Project" → import your repo
3. Set Root Directory to `frontend`
4. Add environment variable: REACT_APP_API_URL=https://your-railway-url
5. Deploy → Vercel gives you: https://eppic-homes.vercel.app

### Step 6 — Get a .co.ke Domain
1. Go to https://www.hostpinnacle.co.ke
2. Search for `eppichomes.co.ke` → register (~KES 1,000/year)
3. In Vercel → Settings → Domains → add your custom domain
4. Point your domain's DNS to Vercel (they give you instructions)

---

## Environment Variables Summary
See `backend/.env.example` for full list.
