# Smart Saving Club - Deployment Guide

## Prerequisites

- Backend deployed and accessible via HTTPS
- Backend URL (e.g., `https://your-backend.onrender.com`)

## Steps

### 1. Deploy Backend First

#### Option A: Deploy to Render (Free Tier Available)

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository or upload code
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:

     ```
     ADMIN_PASSWORD=admin123
     WHATSAPP_PHONE=971561510897
     DELIVERY_FEE=0
     PORT=3001
     ```

5. Click "Create Web Service"
6. Wait for deployment (you'll get a URL like `https://smartsavingclub.onrender.com`)

#### Option B: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select the `server` directory
5. Add environment variables (same as above)
6. Deploy and get your backend URL

### 2. Update Frontend Configuration

1. Open `.env.production` in the `client` folder
2. Replace `https://your-backend-url.com` with your actual backend URL:

   ```
   VITE_API_URL=https://smartsavingclub.onrender.com
   ```

   ⚠️ **Important**: Do NOT include `/api` at the end

### 3. Build Frontend

```bash
cd client
npm run build
```

This creates the `dist` folder with all static files.

### 4. Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the entire **`client/dist`** folder
4. Wait for deployment (takes 10-30 seconds)
5. Your site will be live at a URL like `https://smartsavingclub.netlify.app`

### 5. Configure Custom Domain (Optional)

#### On Netlify

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Testing

1. Visit your Netlify URL
2. Verify:
   - ✅ Logo displays correctly
   - ✅ Items load without errors
   - ✅ Can add items to cart
   - ✅ WhatsApp link works after order submission
   - ✅ Admin login works at `/admin`
   - ✅ Admin dashboard shows items and orders

## Troubleshooting

### "Failed to load items" Error

- **Cause**: Backend not deployed or wrong URL in `.env.production`
- **Fix**: Verify backend is running, update `VITE_API_URL`, rebuild frontend

### CORS Errors

- **Cause**: Backend not allowing requests from frontend domain
- **Fix**: Update CORS configuration in `server/src/index.js`:

  ```javascript
  app.use(cors({
    origin: ['https://smartsavingclub.netlify.app', 'http://localhost:3000']
  }))
  ```

### Images Not Loading

- **Cause**: Images not copied to `dist` folder
- **Fix**: Run `npm run build` again

### Admin Panel Not Working

- **Cause**: React Router routes not properly configured
- **Fix**: The `_redirects` file should already be in place. If missing, create `client/public/_redirects`:

  ```
  /* /index.html 200
  ```

## Local Development

For local development, use:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

The frontend will use `http://localhost:3001` from `.env.local` automatically.

## Environment Files Summary

- `.env.local` - Local development (uses localhost:3001)
- `.env.production` - Production build (uses deployed backend URL)

Remember to **rebuild** the frontend after changing `.env.production`!
