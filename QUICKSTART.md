# 🚀 Quick Start Guide

Get Smart Saving Club running in 5 minutes!

## Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
.\setup.ps1
```

Or manually:

```powershell
npm install
cd server ; npm install ; cd ..
cd client ; npm install ; cd ..
```

## Step 2: Configure Environment

The `.env` file has been created with defaults. You can edit it:

```env
ADMIN_PASSWORD=admin123          # Change this!
WHATSAPP_PHONE=971561510897     # Your WhatsApp number
PORT=3001                        # Backend port
DELIVERY_FEE=0                   # Delivery fee in AED
```

## Step 3: Start the App

```powershell
npm run dev
```

This starts both frontend and backend.

## Step 4: Access the App

**Public Order Page:**

- Open: <http://localhost:3000>
- Fill in customer info
- Select items and quantities
- Click "Send via WhatsApp"

**Admin Panel:**

- Open: <http://localhost:3000/admin>
- Password: `admin123` (or what you set in .env)
- Manage items and view orders

## Common Commands

```powershell
# Start development
npm run dev

# Start only server
npm run server:dev

# Start only client
npm run client:dev

# Build for production
npm run build

# Start production server
npm start
```

## Next Steps

1. ✅ **Test an order** - Place a test order to verify WhatsApp integration
2. 🖼️ **Add product images** - Replace placeholder images in `client/public/images/`
3. 💰 **Update prices** - Use admin panel to adjust prices
4. 🔒 **Change password** - Update `ADMIN_PASSWORD` in `.env`
5. 🚀 **Deploy** - See `DEPLOYMENT.md` for deployment options

## Troubleshooting

**Port already in use:**

- Change `PORT=3001` in `.env` to another port
- Change client port in `client/vite.config.js`

**Dependencies won't install:**

- Delete `node_modules` folders
- Delete `package-lock.json` files
- Run install again

**WhatsApp doesn't open:**

- Check `WHATSAPP_PHONE` format (no + or spaces)
- Try: `971561510897` format

## Need Help?

Check the full README.md for detailed documentation.

---

Happy ordering! 🌿
