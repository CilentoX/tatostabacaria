import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Home, NotFound, Termos, Privacidade } from './pages';
import { AdminLogin, AdminLayout, AdminDashboard, AdminProducts, AdminUsers, AdminSettings, AdminCustomers, AdminSales } from './pages/admin';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="produtos" element={<AdminProducts />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="configuracoes" element={<AdminSettings />} />
 <Route path="vendas" element={<AdminSales />} />
 <Route path="clientes" element={<AdminCustomers />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    <Toaster position="bottom-center" richColors closeButton />
    </AuthProvider>
  );
}

export default App;