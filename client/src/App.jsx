import { Route, Routes } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import OrderPage from './pages/OrderPage'

function App() {
    return (
        <Routes>
            <Route path="/" element={<OrderPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
    )
}

export default App
