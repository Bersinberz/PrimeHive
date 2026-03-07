import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthPage from "./pages/Auth";
import HomePage from "./pages/User/Home";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProductManagement from "./pages/Admin/Productsmanager";
import AdminLayout from "./components/Admin/AdminLayout";
import OrderManagement from "./pages/Admin/OrderManagement";
import CustomerManagement from "./pages/Admin/CustomerManagement";
import Analytics from "./pages/Admin/Analytics";
import MediaLibrary from "./pages/Admin/MediaLibrary";
import Settings from "./pages/Admin/Settings";
import CategoryManagement from "./pages/Admin/CategoryManagement";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<HomePage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;