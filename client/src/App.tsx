import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ToastProvider } from "./context/ToastContext";
import { CartProvider } from "./context/CartContext";

// Auth
import AuthPage from "./pages/Auth";
import SetPassword from "./pages/SetPassword";

// Storefront
import StorefrontLayout from "./components/Storefront/StorefrontLayout";
import HomePage from "./pages/User/Home";
import ProductDetail from "./pages/User/ProductDetail";
import CartPage from "./pages/User/Cart";
import CheckoutPage from "./pages/User/Checkout";
import OrderConfirmation from "./pages/User/OrderConfirmation";
import MyOrdersPage from "./pages/User/MyOrders";
import OrderDetailPage from "./pages/User/OrderDetail";
import ContactPage from "./pages/User/Contact";
import FAQPage from "./pages/User/FAQ";
import ShippingPolicyPage from "./pages/User/ShippingPolicy";
import ReturnsPage from "./pages/User/Returns";

// Admin
import AdminDashboard from "./pages/Admin/Dashboard";
import ProductManagement from "./pages/Admin/ProductManagement";
import AdminLayout from "./components/Admin/AdminLayout";
import OrderManagement from "./pages/Admin/OrderManagement";
import CustomerManagement from "./pages/Admin/CustomerManagement";
import Settings from "./pages/Admin/Settings";
import CategoryManagement from "./pages/Admin/CategoryManagement";
import StaffManagement from "./pages/Admin/StaffManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import MyProfile from "./pages/Admin/MyProfile";
import StoreProfilePage from "./pages/Admin/StoreProfile";
import StaffSettings from "./pages/Admin/StaffSettings";

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Auth */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/set-password" element={<SetPassword />} />

                {/* Storefront */}
                <Route element={<StorefrontLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                  <Route path="/orders" element={<MyOrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                  <Route path="/returns" element={<ReturnsPage />} />
                </Route>

                {/* Admin */}
                <Route path="/admin" element={<ProtectedRoute><ErrorBoundary><AdminLayout /></ErrorBoundary></ProtectedRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard"  element={<ProtectedRoute permission="dashboard">  <AdminDashboard />      </ProtectedRoute>} />
                  <Route path="products"   element={<ProtectedRoute permission="products">   <ProductManagement />   </ProtectedRoute>} />
                  <Route path="categories" element={<ProtectedRoute permission="categories"> <CategoryManagement />  </ProtectedRoute>} />
                  <Route path="orders"     element={<ProtectedRoute permission="orders">     <OrderManagement />     </ProtectedRoute>} />
                  <Route path="customers"  element={<ProtectedRoute allowedRoles={["superadmin"]}><CustomerManagement /></ProtectedRoute>} />
                  <Route path="staff"      element={<ProtectedRoute allowedRoles={["superadmin"]}><StaffManagement /></ProtectedRoute>} />
                  <Route path="settings"   element={<ProtectedRoute allowedRoles={["superadmin"]}><Settings /></ProtectedRoute>} />
                  <Route path="profile"    element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
                  <Route path="store-profile" element={<ProtectedRoute allowedRoles={["staff"]}><StoreProfilePage /></ProtectedRoute>} />
                  <Route path="account-settings" element={<ProtectedRoute allowedRoles={["staff"]}><StaffSettings /></ProtectedRoute>} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
