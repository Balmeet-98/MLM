import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Tree from './pages/Tree';
import Income from './pages/Income';
import Wallet from './pages/Wallet';
import Installments from './pages/Installments';
import Rewards from './pages/Rewards';
// import ProductSelect from './pages/ProductSelect';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
// import AdminProducts from './pages/admin/AdminProducts';
import AdminPairs from './pages/admin/AdminPairs';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminRewards from './pages/admin/AdminRewards';
import AdminIncome from './pages/admin/AdminIncome';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User routes */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tree" element={<Tree />} />
              <Route path="/income" element={<Income />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/installments" element={<Installments />} />
              <Route path="/rewards" element={<Rewards />} />
              {/* <Route path="/products/select" element={<ProductSelect />} /> */}
            </Route>

            {/* Admin routes */}
            <Route element={<Layout adminOnly />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/users/:userId/tree" element={<Tree />} />
              <Route path="/admin/pairs" element={<AdminPairs />} />
              {/* <Route path="/admin/products" element={<AdminProducts />} /> */}
              <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/admin/rewards" element={<AdminRewards />} />
              <Route path="/admin/income" element={<AdminIncome />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
