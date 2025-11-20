import Database from 'better-sqlite3';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: join(dirname(dirname(fileURLToPath(import.meta.url))), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(dirname(__dirname)); // Go up two levels to project root

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || '971561510897';
const DELIVERY_FEE = parseFloat(process.env.DELIVERY_FEE || '0');

// Middleware
app.use(cors());
app.use(express.json());

// Paths
const dataDir = join(rootDir, 'data');
const itemsPath = join(dataDir, 'items.json');
const dbPath = join(dataDir, 'orders.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize SQLite database
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    createdAt TEXT NOT NULL,
    customerName TEXT NOT NULL,
    flatNumber TEXT NOT NULL,
    deliveryDay TEXT NOT NULL,
    phone TEXT,
    notes TEXT,
    itemsTotal REAL NOT NULL,
    deliveryFee REAL NOT NULL,
    grandTotal REAL NOT NULL,
    items TEXT NOT NULL
  )
`);

// Helper functions
function loadItems() {
    try {
        const data = fs.readFileSync(itemsPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading items:', error);
        return [];
    }
}

function saveItems(items) {
    fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2), 'utf-8');
}

function validateAdmin(req, res, next) {
    const token = req.headers['x-admin-token'];
    if (token === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// API Routes

// Get active items (public)
app.get('/api/items', (req, res) => {
    try {
        const items = loadItems();
        const activeItems = items.filter(item => item.active);
        res.json(activeItems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load items' });
    }
});

// Get all items (admin)
app.get('/api/items/all', validateAdmin, (req, res) => {
    try {
        const items = loadItems();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load items' });
    }
});

// Update item (admin)
app.put('/api/items/:id', validateAdmin, (req, res) => {
    try {
        const items = loadItems();
        const itemIndex = items.findIndex(item => item.id === req.params.id);

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Update item with provided fields
        const updatedItem = {
            ...items[itemIndex],
            ...req.body,
            id: req.params.id // Prevent ID change
        };

        // Validate price
        if (updatedItem.price !== undefined && updatedItem.price < 0) {
            return res.status(400).json({ error: 'Price must be non-negative' });
        }

        items[itemIndex] = updatedItem;
        saveItems(items);

        res.json({ success: true, item: updatedItem });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Create new item (admin)
app.post('/api/items', validateAdmin, (req, res) => {
    try {
        const items = loadItems();
        const { id, name, nameAr, category, price, unit, imageUrl, active, sortOrder } = req.body;

        // Validate required fields
        if (!id || !name || !category || price === undefined || !unit) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if ID already exists
        if (items.find(item => item.id === id)) {
            return res.status(400).json({ error: 'Item ID already exists' });
        }

        // Validate price
        if (price < 0) {
            return res.status(400).json({ error: 'Price must be non-negative' });
        }

        const newItem = {
            id,
            name,
            nameAr: nameAr || '',
            category,
            price: parseFloat(price),
            unit,
            imageUrl: imageUrl || '/images/placeholder.jpg',
            active: active !== undefined ? active : true,
            sortOrder: sortOrder !== undefined ? sortOrder : items.length
        };

        items.push(newItem);
        saveItems(items);

        res.json({ success: true, item: newItem });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create item' });
    }
});

// Create order (public)
app.post('/api/orders', (req, res) => {
    try {
        const { customerName, flatNumber, deliveryDay, phone, items, notes, itemsTotal, grandTotal } = req.body;

        // Validate required fields
        if (!customerName || !flatNumber || !deliveryDay || !items || items.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const orderId = uuidv4();
        const createdAt = new Date().toISOString();
        const deliveryFee = DELIVERY_FEE;

        const order = {
            id: orderId,
            createdAt,
            customerName,
            flatNumber,
            deliveryDay,
            phone: phone || '',
            notes: notes || '',
            itemsTotal: parseFloat(itemsTotal),
            deliveryFee,
            grandTotal: parseFloat(grandTotal),
            items: JSON.stringify(items)
        };

        // Insert into database
        const stmt = db.prepare(`
      INSERT INTO orders (id, createdAt, customerName, flatNumber, deliveryDay, phone, notes, itemsTotal, deliveryFee, grandTotal, items)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            order.id,
            order.createdAt,
            order.customerName,
            order.flatNumber,
            order.deliveryDay,
            order.phone,
            order.notes,
            order.itemsTotal,
            order.deliveryFee,
            order.grandTotal,
            order.items
        );

        res.json({ success: true, orderId });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get all orders (admin)
app.get('/api/orders', validateAdmin, (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC LIMIT 100');
        const orders = stmt.all().map(order => ({
            ...order,
            items: JSON.parse(order.items)
        }));

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load orders' });
    }
});

// Export orders as CSV (admin)
app.get('/api/orders/export', validateAdmin, (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC');
        const orders = stmt.all();

        // CSV header
        let csv = 'Order ID,Date,Customer Name,Flat Number,Delivery Day,Phone,Items,Items Total,Delivery Fee,Grand Total,Notes\n';

        // CSV rows
        orders.forEach(order => {
            const items = JSON.parse(order.items);
            const itemsStr = items.map(item =>
                `${item.name} (${item.quantity} ${item.unit} @ ${item.price} AED)`
            ).join('; ');

            csv += `"${order.id}","${order.createdAt}","${order.customerName}","${order.flatNumber}","${order.deliveryDay}","${order.phone}","${itemsStr}",${order.itemsTotal},${order.deliveryFee},${order.grandTotal},"${order.notes || ''}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: 'Failed to export orders' });
    }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, token: ADMIN_PASSWORD });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Get config (public)
app.get('/api/config', (req, res) => {
    res.json({
        whatsappPhone: WHATSAPP_PHONE,
        deliveryFee: DELIVERY_FEE
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin password: ${ADMIN_PASSWORD}`);
});
