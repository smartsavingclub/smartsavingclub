import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

function OrderPage() {
    const [items, setItems] = useState([])
    const [config, setConfig] = useState({ whatsappPhone: '971561510897', deliveryFee: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Customer info
    const [customerName, setCustomerName] = useState('')
    const [flatNumber, setFlatNumber] = useState('')
    const [deliveryDay, setDeliveryDay] = useState('Today')
    const [phone, setPhone] = useState('')
    const [notes, setNotes] = useState('')

    // Cart state
    const [quantities, setQuantities] = useState({})
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        fetchItems()
        fetchConfig()
    }, [])

    const fetchItems = async () => {
        try {
            const response = await fetch(`${API_URL}/api/items`)
            const data = await response.json()
            setItems(data)
            setLoading(false)
        } catch (err) {
            setError('Failed to load items')
            setLoading(false)
        }
    }

    const fetchConfig = async () => {
        try {
            const response = await fetch(`${API_URL}/api/config`)
            const data = await response.json()
            setConfig(data)
        } catch (err) {
            console.error('Failed to load config')
        }
    }

    const handleQuantityChange = (itemId, value) => {
        setQuantities(prev => ({
            ...prev,
            [itemId]: parseFloat(value) || 0
        }))
    }

    const getCartItems = () => {
        return items
            .filter(item => quantities[item.id] > 0)
            .map(item => ({
                itemId: item.id,
                name: item.name,
                unit: item.unit,
                price: item.price,
                quantity: quantities[item.id],
                lineTotal: item.price * quantities[item.id]
            }))
    }

    const calculateTotal = () => {
        const cartItems = getCartItems()
        const itemsTotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0)
        const grandTotal = itemsTotal + config.deliveryFee
        return { itemsTotal, grandTotal }
    }

    const validateForm = () => {
        if (!customerName.trim()) {
            setError('Please enter your name')
            return false
        }
        if (!flatNumber.trim()) {
            setError('Please enter your flat number')
            return false
        }
        if (!deliveryDay) {
            setError('Please select a delivery day')
            return false
        }
        const cartItems = getCartItems()
        if (cartItems.length === 0) {
            setError('Please select at least one item')
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!validateForm()) {
            return
        }

        const cartItems = getCartItems()
        const { itemsTotal, grandTotal } = calculateTotal()

        const order = {
            customerName,
            flatNumber,
            deliveryDay,
            phone,
            notes,
            items: cartItems,
            itemsTotal,
            deliveryFee: config.deliveryFee,
            grandTotal
        }

        try {
            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            })

            const data = await response.json()

            if (data.success) {
                // Build WhatsApp message
                let message = `🌟 Smart Saving Club Order\n\n`
                message += `Name: ${customerName}\n`
                message += `Flat: ${flatNumber}\n`
                message += `Delivery: ${deliveryDay}\n`
                if (phone) message += `Phone: ${phone}\n`
                message += `\n📦 Items:\n`

                cartItems.forEach(item => {
                    message += `• ${item.name}: ${item.quantity} ${item.unit} × ${item.price} AED = ${item.lineTotal.toFixed(2)} AED\n`
                })

                message += `\n💰 Total Summary:\n`
                message += `Items: ${itemsTotal.toFixed(2)} AED\n`
                if (config.deliveryFee > 0) {
                    message += `Delivery: ${config.deliveryFee.toFixed(2)} AED\n`
                }
                message += `TOTAL: ${grandTotal.toFixed(2)} AED\n`

                if (notes) {
                    message += `\n📝 Notes: ${notes}`
                }

                const whatsappUrl = `https://wa.me/${config.whatsappPhone}?text=${encodeURIComponent(message)}`
                window.open(whatsappUrl, '_blank')

                setShowSuccess(true)

                // Reset form
                setCustomerName('')
                setFlatNumber('')
                setDeliveryDay('Today')
                setPhone('')
                setNotes('')
                setQuantities({})

                setTimeout(() => setShowSuccess(false), 5000)
            } else {
                setError(data.error || 'Failed to submit order')
            }
        } catch (err) {
            setError('Failed to submit order. Please try again.')
        }
    }

    const vegetables = items.filter(item => item.category === 'vegetable')
    const fruits = items.filter(item => item.category === 'fruit')
    const { itemsTotal, grandTotal } = calculateTotal()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <header className="bg-primary text-white shadow-lg sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <img
                        src="/ssc-logo-full.svg"
                        alt="Smart Saving Club logo"
                        className="h-10 md:h-12 w-auto"
                    />
                    <p className="text-sm md:text-base mt-1 opacity-90">
                        Order wholesale-price fruits & vegetables for our compound
                    </p>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Success Message */}
                {showSuccess && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
                        <p className="font-bold">Thank you!</p>
                        <p>Your order has been sent via WhatsApp. We'll process it soon.</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                        <p>{error}</p>
                    </div>
                )}

                {/* Customer Info Form */}
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">📋 Your Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Flat / Apartment Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={flatNumber}
                                    onChange={(e) => setFlatNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., A-102"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Delivery Day <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={deliveryDay}
                                    onChange={(e) => setDeliveryDay(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                >
                                    <option value="Today">Today</option>
                                    <option value="Tomorrow">Tomorrow</option>
                                    <option value="Next available">Next available</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    WhatsApp Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., 0501234567"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                rows="2"
                                placeholder="Any special requests or instructions..."
                            />
                        </div>
                    </div>

                    {/* Vegetables Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="mr-2">🥬</span> Vegetables
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vegetables.map(item => (
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    quantity={quantities[item.id] || 0}
                                    onQuantityChange={handleQuantityChange}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Fruits Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                            <span className="mr-2">🍎</span> Fruits
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fruits.map(item => (
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    quantity={quantities[item.id] || 0}
                                    onQuantityChange={handleQuantityChange}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Order Summary - Fixed at bottom */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-primary shadow-lg p-4 z-20">
                        <div className="container mx-auto max-w-4xl">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Items Total:</span>
                                        <span className="font-semibold">{itemsTotal.toFixed(2)} AED</span>
                                    </div>
                                    {config.deliveryFee > 0 && (
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Delivery Fee:</span>
                                            <span className="font-semibold">{config.deliveryFee.toFixed(2)} AED</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold border-t pt-1">
                                        <span>Grand Total:</span>
                                        <span className="text-primary">{grandTotal.toFixed(2)} AED</span>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    <span>📱</span>
                                    <span>Send via WhatsApp</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

function ItemCard({ item, quantity, onQuantityChange }) {
    const lineTotal = item.price * quantity
    const step = item.unit === 'kg' ? 0.25 : 1

    return (
        <div className="item-card border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex gap-3">
                <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = '/images/placeholder.jpg'
                        }}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                    {item.nameAr && (
                        <p className="text-sm text-gray-500">{item.nameAr}</p>
                    )}
                    <p className="text-primary font-bold mt-1">
                        {item.price} AED / {item.unit}
                    </p>
                </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
                <input
                    type="number"
                    min="0"
                    step={step}
                    value={quantity || ''}
                    onChange={(e) => onQuantityChange(item.id, e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0"
                />
                <span className="text-sm text-gray-600">{item.unit}</span>
                {quantity > 0 && (
                    <span className="ml-auto font-semibold text-primary">
                        {lineTotal.toFixed(2)} AED
                    </span>
                )}
            </div>
        </div>
    )
}

export default OrderPage
