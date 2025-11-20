# 🚀 Deployment Guide

This guide covers multiple deployment options for Smart Saving Club.

## Table of Contents

- [Option 1: Railway (Easiest - Full Stack)](#option-1-railway)
- [Option 2: Render (Backend) + Netlify (Frontend)](#option-2-render--netlify)
- [Option 3: VPS/Self-Hosted](#option-3-vps)

---

## Option 1: Railway (Easiest - Full Stack)

Railway can host both frontend and backend together.

### Steps

1. **Push code to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/smart-saving-club.git
   git push -u origin main
   ```

2. **Create Railway account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

3. **Deploy**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway auto-detects Node.js

4. **Configure Environment Variables**
   - Go to project settings
   - Add variables:
     - `ADMIN_PASSWORD=your_secure_password`
     - `WHATSAPP_PHONE=971561510897`
     - `PORT=3001`
     - `DELIVERY_FEE=0`

5. **Configure Build**
   - Build Command: `npm install && cd server && npm install && cd ../client && npm install && npm run build`
   - Start Command: `npm start`

6. **Get your URL**
   - Railway provides a public URL like `https://your-app.railway.app`

**Cost:** Free tier available, then ~$5/month

---

## Option 2: Render (Backend) + Netlify (Frontend)

Split frontend and backend for better performance.

### Part A: Deploy Backend on Render

1. **Create Render account**
   - Go to [render.com](https://render.com)
   - Sign up

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name:** smart-saving-club-api
     - **Root Directory:** `server`
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`

3. **Add Environment Variables**
   - `ADMIN_PASSWORD=your_secure_password`
   - `WHATSAPP_PHONE=971561510897`
   - `PORT=3001`
   - `DELIVERY_FEE=0`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your API URL: `https://smart-saving-club-api.onrender.com`

### Part B: Deploy Frontend on Netlify

1. **Update API Configuration**

   Edit `client/vite.config.js`:

   ```javascript
   export default defineConfig({
     plugins: [react()],
     server: {
       port: 3000,
       proxy: {
         '/api': {
           target: process.env.VITE_API_URL || 'http://localhost:3001',
           changeOrigin: true
         }
       }
     },
     // Add this for production
     preview: {
       proxy: {
         '/api': {
           target: process.env.VITE_API_URL || 'http://localhost:3001',
           changeOrigin: true
         }
       }
     }
   })
   ```

   Create `client/netlify.toml`:

   ```toml
   [build]
     command = "npm install && npm run build"
     publish = "dist"

   [[redirects]]
     from = "/api/*"
     to = "https://smart-saving-club-api.onrender.com/api/:splat"
     status = 200
     force = true

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Create Netlify account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up

3. **Deploy**
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub
   - Select repository
   - Configure:
     - **Base directory:** `client`
     - **Build command:** `npm install && npm run build`
     - **Publish directory:** `client/dist`

4. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL=https://smart-saving-club-api.onrender.com`

5. **Deploy**
   - Click "Deploy site"
   - Your site will be at `https://your-site-name.netlify.app`

**Cost:** Both free tiers available

---

## Option 3: VPS (Self-Hosted)

For full control, deploy on your own server (DigitalOcean, AWS, etc.)

### Prerequisites

- Ubuntu 20.04+ server
- Domain name (optional)
- SSH access

### Steps

1. **Connect to server**

   ```bash
   ssh root@your-server-ip
   ```

2. **Install Node.js 18**

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y build-essential
   ```

3. **Install PM2 (Process Manager)**

   ```bash
   sudo npm install -g pm2
   ```

4. **Clone repository**

   ```bash
   cd /var/www
   git clone https://github.com/yourusername/smart-saving-club.git
   cd smart-saving-club
   ```

5. **Install dependencies**

   ```bash
   npm install
   cd server && npm install && cd ..
   cd client && npm install && cd ..
   ```

6. **Create .env file**

   ```bash
   nano .env
   ```

   Add your configuration and save (Ctrl+X, Y, Enter)

7. **Build frontend**

   ```bash
   cd client
   npm run build
   cd ..
   ```

8. **Start server with PM2**

   ```bash
   cd server
   pm2 start src/index.js --name smart-saving-club
   pm2 save
   pm2 startup
   ```

9. **Install Nginx**

   ```bash
   sudo apt-get install -y nginx
   ```

10. **Configure Nginx**

    ```bash
    sudo nano /etc/nginx/sites-available/smart-saving-club
    ```

    Add configuration:

    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        # Frontend
        location / {
            root /var/www/smart-saving-club/client/dist;
            try_files $uri $uri/ /index.html;
        }

        # API proxy
        location /api {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

11. **Enable site**

    ```bash
    sudo ln -s /etc/nginx/sites-available/smart-saving-club /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

12. **Setup SSL with Let's Encrypt (Optional but recommended)**

    ```bash
    sudo apt-get install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

13. **Setup firewall**

    ```bash
    sudo ufw allow 'Nginx Full'
    sudo ufw allow OpenSSH
    sudo ufw enable
    ```

Your app is now live at `http://your-domain.com` or `http://your-server-ip`

### Maintenance

**View logs:**

```bash
pm2 logs smart-saving-club
```

**Restart app:**

```bash
pm2 restart smart-saving-club
```

**Update app:**

```bash
cd /var/www/smart-saving-club
git pull
npm install
cd client && npm install && npm run build && cd ..
cd server && npm install && cd ..
pm2 restart smart-saving-club
```

**Backup data:**

```bash
cp -r /var/www/smart-saving-club/data /backup/data-$(date +%Y%m%d)
```

---

## Post-Deployment Checklist

- [ ] Test public order page
- [ ] Test WhatsApp integration
- [ ] Login to admin panel
- [ ] Update at least one item price
- [ ] Place a test order
- [ ] Export orders to CSV
- [ ] Change admin password from default
- [ ] Add real product images
- [ ] Test on mobile device
- [ ] Setup regular backups
- [ ] Setup monitoring/alerts (optional)

---

## Troubleshooting

**Backend won't start:**

- Check environment variables are set
- Verify port 3001 is not in use
- Check server logs

**Frontend can't reach backend:**

- Verify API URL is correct
- Check CORS settings
- Check proxy configuration

**Images not loading:**

- Ensure images are in correct directory
- Check nginx static file serving
- Verify paths in items.json

**Database errors:**

- Check write permissions on data/ directory
- Verify SQLite is installed
- Check disk space

---

## Need Help?

- Check server logs: `pm2 logs` (VPS) or platform logs (Railway/Render)
- Review README.md
- Check browser console for errors
- Verify environment variables

---

Good luck with your deployment! 🚀
