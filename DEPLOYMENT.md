# Deployment Guide for ChatterBox on Vercel (Full Stack)

## Overview
This application is configured to deploy both frontend and backend on **Vercel**:
- **Frontend**: React + Vite (static site)
- **Backend**: Node.js + Express + Socket.io (serverless functions)

## Important Note About Socket.io on Vercel
Vercel's serverless functions have the following limitations:
- **10-second timeout** on free/hobby plans (Socket.io connections may drop)
- **WebSocket support** is available but may have limitations

For production use with heavy Socket.io traffic, consider:
- Upgrading to Vercel Pro for longer timeouts
- Using a dedicated server (Railway, Render, AWS EC2) for the backend

---

## Step 1: Push Code to GitHub

The code is already configured. Just push to GitHub:

```bash
git add .
git commit -m "Configure for Vercel deployment"
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `07-soham/chatterbox`
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`
5. Add Environment Variables:
   - `MONGODB_URI` - Your MongoDB connection string (required)
   - `JWT_SECRET` - A secure random string for JWT (required)
   - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
   - `CLIENT_URL` - Your Vercel app URL (e.g., `https://chatterbox.vercel.app`)

6. Click **Deploy**

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Link to existing project? No
# - What's your project name? chatterbox
# - In which directory is your code located? ./
```

---

## Step 3: Configure Environment Variables

After deployment, go to Project Settings → Environment Variables and add:

| Variable | Value | Required |
|----------|-------|----------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | Yes |
| `JWT_SECRET` | Random secret string (generate with `openssl rand -base64 32`) | Yes |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard | For image upload |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard | For image upload |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard | For image upload |
| `CLIENT_URL` | Your Vercel app URL | Yes |

---

## Step 4: Update CORS (After First Deploy)

After your first deployment, Vercel will assign you a URL like `https://chatterbox.vercel.app`.

1. Copy this URL
2. Go to your Vercel dashboard → Project Settings → Environment Variables
3. Add `CLIENT_URL` with your Vercel app URL
4. Redeploy the project

---

## Project Structure

```
chatterbox/
├── client/              # React frontend
│   ├── src/
│   ├── dist/           # Build output (Vercel serves this)
│   └── package.json
├── server/              # Express backend
│   ├── server.js       # Main server file (exports app for Vercel)
│   └── package.json
├── api/                 # Vercel serverless entry point
│   └── index.js        # Imports server app
├── vercel.json         # Vercel configuration
└── package.json        # Root package.json (optional)
```

---

## Troubleshooting

### Socket.io Connection Drops
- This is expected on Vercel free tier due to 10s timeout
- Upgrade to Vercel Pro or deploy backend separately on Railway/Render

### Build Fails
- Check that `client/dist` is in `.gitignore`
- Ensure `vercel.json` has correct build command

### API 404 Errors
- Make sure `vercel.json` routes are configured correctly
- Check that environment variables are set

### MongoDB Connection Fails
- Whitelist Vercel IP ranges in MongoDB Atlas
- Check `MONGODB_URI` is correctly set

---

## Alternative: Deploy Frontend on Vercel, Backend on Railway

If you experience issues with Socket.io on Vercel:

1. **Frontend**: Deploy as above, but set `VITE_BACKEND_URL` to your Railway URL
2. **Backend**: Deploy `server/` folder to [Railway](https://railway.app)

See the original `README.md` for backend-only deployment instructions.

---

## Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Socket.io with Vercel](https://socket.io/docs/v4/serverless-adapter/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
