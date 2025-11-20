# 🌿 Smart Saving Club

A production-ready web application for ordering fruits and vegetables for residential compounds. Built with React, Node.js, Express, and SQLite.

## 📋 Features

- **Public Order Page**: Mobile-first ordering interface with real-time totals
- **WhatsApp Integration**: Orders sent directly to owner's WhatsApp
- **Admin Dashboard**: Manage items, prices, and view/export orders
- **Persistent Storage**: SQLite database for orders, JSON file for items
- **CSV Export**: Export orders for Excel/spreadsheet analysis
- **Arabic Support**: Bilingual item names (English + Arabic)
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm installed
- Git (optional, for cloning)

### Installation

1. **Clone or download this project**

```bash
cd smartsavingclub
```

2. **Install dependencies for root, server, and client**

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

3. **Create environment file**

Copy `.env.example` to `.env` and configure:

```bash
copy .env.example .env
```

Edit `.env`:

```env
ADMIN_PASSWORD=your_secure_password
WHATSAPP_PHONE=971561510897
PORT=3001
DELIVERY_FEE=0
```

4. **Run the application**

From the root directory:

```bash
npm run dev
```

This starts:

- Frontend on `http://localhost:3000`
- Backend API on `http://localhost:3001`

## 📱 Usage

### Customer Order Flow

1. Open `http://localhost:3000`
2. Fill in your name, flat number, and delivery day
3. Select items and quantities
4. Review total and click "Send via WhatsApp"
5. Order opens in WhatsApp - just tap Send!

### Admin Access

1. Go to `http://localhost:3000/admin`
2. Enter admin password (from `.env`)
3. **Items Management**: Update prices, toggle active/inactive, add new items
4. **Orders**: View all orders, export to CSV

## 🗂️ Project Structure

```
smartsavingclub/
├── client/                 # React frontend
│   ├── public/
│   │   └── images/        # Product images
│   ├── src/
│   │   ├── pages/
│   │   │   ├── OrderPage.jsx       # Public order page
│   │   │   ├── AdminLogin.jsx      # Admin login
│   │   │   └── AdminDashboard.jsx  # Admin panel
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                # Node.js backend
│   ├── src/
│   │   └── index.js      # Express API server
│   └── package.json
│
├── data/                  # Data storage
│   ├── items.json        # Item catalog (vegetables & fruits)
│   └── orders.db         # SQLite database (auto-created)
│
├── .env                   # Environment config (create from .env.example)
├── .env.example
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Public Endpoints

- `GET /api/items` - Get active items
- `POST /api/orders` - Create new order
- `GET /api/config` - Get config (WhatsApp phone, delivery fee)
- `GET /api/health` - Health check

### Admin Endpoints (require `x-admin-token` header)

- `POST /api/admin/login` - Admin login
- `GET /api/items/all` - Get all items (including inactive)
- `PUT /api/items/:id` - Update item
- `POST /api/items` - Create new item
- `GET /api/orders` - Get all orders
- `GET /api/orders/export` - Export orders as CSV

## 🖼️ Adding Product Images

Place product images in `client/public/images/`:

```
client/public/images/
├── banana.jpg
├── tomato.jpg
├── cucumber.jpg
└── ... (other items)
```

Update image URLs in `data/items.json` or via admin panel.

## 🌐 Deployment

### Option 1: Netlify (Frontend) + Render/Railway (Backend)

**Backend on Render:**

1. Create new Web Service on [Render](https://render.com)
2. Connect your Git repository
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables (ADMIN_PASSWORD, WHATSAPP_PHONE, etc.)
6. Deploy

**Frontend on Netlify:**

1. Create new site on [Netlify](https://netlify.com)
2. Build command: `cd client && npm install && npm run build`
3. Publish directory: `client/dist`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
5. Update `vite.config.js` to use VITE_API_URL for API proxy in production
6. Deploy

### Option 2: Railway (Full Stack)

1. Create new project on [Railway](https://railway.app)
2. Add service from GitHub repository
3. Railway auto-detects Node.js and deploys
4. Set environment variables
5. Railway provides public URL

### Option 3: VPS/Server

1. Install Node.js 16+ on server
2. Clone repository
3. Install dependencies: `npm install && cd server && npm install && cd ../client && npm install`
4. Build client: `cd client && npm run build`
5. Serve static files from `client/dist` via server or nginx
6. Run server: `cd server && npm start`
7. Use PM2 or systemd to keep server running

## 🔒 Security Notes

- Change default `ADMIN_PASSWORD` in production
- Use HTTPS in production (required for secure WhatsApp links)
- Consider adding rate limiting for API endpoints
- Backup `data/` directory regularly

## 🛠️ Development

### Running Tests

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

### Building for Production

```bash
# Build client
cd client
npm run build

# Output in client/dist/
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_PASSWORD` | `admin123` | Admin panel password |
| `WHATSAPP_PHONE` | `971561510897` | WhatsApp number (no + or spaces) |
| `PORT` | `3001` | Backend server port |
| `DELIVERY_FEE` | `0` | Delivery fee in AED |

## 📊 Data Models

### Item

```json
{
  "id": "banana",
  "name": "Banana",
  "nameAr": "موز",
  "category": "fruit",
  "price": 6,
  "unit": "kg",
  "imageUrl": "/images/banana.jpg",
  "active": true,
  "sortOrder": 101
}
```

### Order

```json
{
  "id": "uuid",
  "createdAt": "2025-11-20T10:30:00.000Z",
  "customerName": "Ahmed Ali",
  "flatNumber": "A-102",
  "deliveryDay": "Tomorrow",
  "phone": "0501234567",
  "notes": "Please knock twice",
  "items": [...],
  "itemsTotal": 45.50,
  "deliveryFee": 0,
  "grandTotal": 45.50
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

ISC License - feel free to use for your compound or community!

## 💡 Tips

- **Add real product images**: Replace placeholder images with actual photos for better UX
- **Customize colors**: Edit `client/tailwind.config.js` to match your brand
- **Backup regularly**: Set up automated backups of `data/` directory
- **Monitor orders**: Check admin panel daily for new orders
- **Update prices**: Use admin panel to adjust prices based on market rates

## 🐛 Troubleshooting

**Server won't start:**

- Check if port 3001 is available
- Verify `.env` file exists
- Run `npm install` in server directory

**Client won't start:**

- Check if port 3000 is available
- Run `npm install` in client directory
- Clear node_modules and reinstall

**Images not loading:**

- Verify images exist in `client/public/images/`
- Check image paths in `data/items.json`
- Use browser DevTools to check 404 errors

**Orders not saving:**

- Check server logs for errors
- Verify `data/` directory is writable
- Check SQLite database file permissions

## 📞 Support

For issues or questions:

1. Check this README
2. Review server logs in terminal
3. Check browser console for errors
4. Open an issue on GitHub (if repository is public)

---

Built with ❤️ for Smart Saving Club
