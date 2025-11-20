import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || ''

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('items')
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (!token) {
            navigate('/admin')
        }
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        navigate('/admin')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-primary text-white shadow-lg">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">🛠️ Admin Dashboard</h1>
                        <p className="text-sm opacity-90">Smart Saving Club Management</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('items')}
                            className={`px-6 py-4 font-semibold border-b-2 transition-colors ${activeTab === 'items'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            📦 Items Management
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-4 font-semibold border-b-2 transition-colors ${activeTab === 'orders'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            📋 Orders
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-6">
                {activeTab === 'items' && <ItemsManagement />}
                {activeTab === 'orders' && <OrdersManagement />}
            </div>
        </div>
    )
}

function ItemsManagement() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [editingItem, setEditingItem] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${API_URL}/api/items/all`, {
                headers: { 'x-admin-token': token }
            })
            const data = await response.json()
            setItems(data.sort((a, b) => a.sortOrder - b.sortOrder))
            setLoading(false)
        } catch (err) {
            setError('Failed to load items')
            setLoading(false)
        }
    }

    const updateItem = async (itemId, updates) => {
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${API_URL}/api/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-token': token
                },
                body: JSON.stringify(updates)
            })

            const data = await response.json()

            if (data.success) {
                setSuccess('Item updated successfully')
                fetchItems()
                setTimeout(() => setSuccess(''), 3000)
            } else {
                setError(data.error || 'Failed to update item')
            }
        } catch (err) {
            setError('Failed to update item')
        }
    }

    const createItem = async (newItem) => {
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${API_URL}/api/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-token': token
                },
                body: JSON.stringify(newItem)
            })

            const data = await response.json()

            if (data.success) {
                setSuccess('Item created successfully')
                setShowAddForm(false)
                fetchItems()
                setTimeout(() => setSuccess(''), 3000)
            } else {
                setError(data.error || 'Failed to create item')
            }
        } catch (err) {
            setError('Failed to create item')
        }
    }

    const toggleActive = (item) => {
        updateItem(item.id, { active: !item.active })
    }

    if (loading) {
        return <div className="text-center py-12">Loading...</div>
    }

    return (
        <div>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Items List</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary transition-colors"
                >
                    {showAddForm ? 'Cancel' : '+ Add New Item'}
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4">Add New Item</h3>
                    <AddItemForm onSubmit={createItem} onCancel={() => setShowAddForm(false)} />
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Active</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded"
                                            onError={(e) => {
                                                e.target.src = '/images/placeholder.jpg'
                                            }}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{item.id}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-800">{item.name}</div>
                                        {item.nameAr && (
                                            <div className="text-sm text-gray-500">{item.nameAr}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${item.category === 'fruit' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {editingItem?.id === item.id ? (
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={editingItem.price}
                                                onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                                                className="w-20 px-2 py-1 border rounded"
                                            />
                                        ) : (
                                            <span className="font-semibold">{item.price} AED</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {editingItem?.id === item.id ? (
                                            <select
                                                value={editingItem.unit}
                                                onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                                                className="px-2 py-1 border rounded"
                                            >
                                                <option value="kg">kg</option>
                                                <option value="pc">pc</option>
                                                <option value="bundle">bundle</option>
                                            </select>
                                        ) : (
                                            item.unit
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggleActive(item)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${item.active
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                        >
                                            {item.active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingItem?.id === item.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        updateItem(item.id, {
                                                            price: editingItem.price,
                                                            unit: editingItem.unit
                                                        })
                                                        setEditingItem(null)
                                                    }}
                                                    className="text-green-600 hover:text-green-800 font-semibold text-sm"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingItem(null)}
                                                    className="text-gray-600 hover:text-gray-800 font-semibold text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditingItem(item)}
                                                className="text-primary hover:text-secondary font-semibold text-sm"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function AddItemForm({ onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        nameAr: '',
        category: 'vegetable',
        price: 0,
        unit: 'kg',
        imageUrl: '/images/placeholder.jpg',
        active: true,
        sortOrder: 999
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">ID (unique)</label>
                <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Arabic Name</label>
                <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                >
                    <option value="vegetable">Vegetable</option>
                    <option value="fruit">Fruit</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Price (AED)</label>
                <input
                    type="number"
                    step="0.5"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                >
                    <option value="kg">kg</option>
                    <option value="pc">pc</option>
                    <option value="bundle">bundle</option>
                </select>
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                />
            </div>

            <div className="md:col-span-2 flex gap-4">
                <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-secondary"
                >
                    Create Item
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}

function OrdersManagement() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedOrder, setExpandedOrder] = useState(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${API_URL}/api/orders`, {
                headers: { 'x-admin-token': token }
            })
            const data = await response.json()
            setOrders(data)
            setLoading(false)
        } catch (err) {
            setError('Failed to load orders')
            setLoading(false)
        }
    }

    const exportCSV = async () => {
        try {
            const token = localStorage.getItem('adminToken')
            const response = await fetch(`${API_URL}/api/orders/export`, {
                headers: { 'x-admin-token': token }
            })
            const csv = await response.text()

            const blob = new Blob([csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (err) {
            setError('Failed to export orders')
        }
    }

    if (loading) {
        return <div className="text-center py-12">Loading...</div>
    }

    return (
        <div>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Recent Orders ({orders.length})</h2>
                <button
                    onClick={exportCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                    📥 Export CSV
                </button>
            </div>

            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div
                            className="p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-800">{order.customerName}</div>
                                    <div className="text-sm text-gray-600">Flat: {order.flatNumber}</div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Delivery: <span className="font-semibold">{order.deliveryDay}</span>
                                </div>
                                <div className="font-bold text-primary text-lg">
                                    {order.grandTotal.toFixed(2)} AED
                                </div>
                                <div>
                                    {expandedOrder === order.id ? '▼' : '▶'}
                                </div>
                            </div>
                        </div>

                        {expandedOrder === order.id && (
                            <div className="border-t bg-gray-50 p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <div className="text-sm font-semibold text-gray-600">Order ID:</div>
                                        <div className="text-sm text-gray-800 font-mono">{order.id}</div>
                                    </div>
                                    {order.phone && (
                                        <div>
                                            <div className="text-sm font-semibold text-gray-600">Phone:</div>
                                            <div className="text-sm text-gray-800">{order.phone}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <div className="text-sm font-semibold text-gray-600 mb-2">Items:</div>
                                    <div className="space-y-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm bg-white p-2 rounded">
                                                <span>{item.name}</span>
                                                <span className="text-gray-600">
                                                    {item.quantity} {item.unit} × {item.price} AED = <span className="font-semibold">{item.lineTotal.toFixed(2)} AED</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t pt-4 space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Items Total:</span>
                                        <span className="font-semibold">{order.itemsTotal.toFixed(2)} AED</span>
                                    </div>
                                    {order.deliveryFee > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Delivery Fee:</span>
                                            <span className="font-semibold">{order.deliveryFee.toFixed(2)} AED</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Grand Total:</span>
                                        <span className="text-primary">{order.grandTotal.toFixed(2)} AED</span>
                                    </div>
                                </div>

                                {order.notes && (
                                    <div className="mt-4 border-t pt-4">
                                        <div className="text-sm font-semibold text-gray-600 mb-1">Notes:</div>
                                        <div className="text-sm text-gray-800 bg-white p-2 rounded">{order.notes}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No orders yet
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminDashboard
