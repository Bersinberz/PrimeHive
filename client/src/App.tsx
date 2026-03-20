import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import AuthPage from "./pages/Auth";
import HomePage from "./pages/User/Home";
import AdminDashboard from "./pages/Admin/Dashboard";
import ProductManagement from "./pages/Admin/ProductManagement";
import AdminLayout from "./components/Admin/AdminLayout";
import OrderManagement from "./pages/Admin/OrderManagement";
import CustomerManagement from "./pages/Admin/CustomerManagement";
import Settings from "./pages/Admin/Settings";
import CategoryManagement from "./pages/Admin/CategoryManagement";
import StaffManagement from "./pages/Admin/StaffManagement";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <SettingsProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<HomePage />} />

          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </SettingsProvider>
  );
}

export default App;