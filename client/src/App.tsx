import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ToastProvider } from "./context/ToastContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import PrimeLoader from "./components/PrimeLoader";

// ── Eagerly loaded (tiny, always needed) ──────────────────────
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import StorefrontLayout from "./components/Storefront/StorefrontLayout";
import AdminLayout from "./components/Admin/AdminLayout";

// ── Auth ──────────────────────────────────────────────────────
const AuthPage        = lazy(() => import("./pages/Auth"));
const SetPassword     = lazy(() => import("./pages/SetPassword"));
const ResetPassword   = lazy(() => import("./pages/ResetPassword"));

// ── Storefront ────────────────────────────────────────────────
const HomePage           = lazy(() => import("./pages/User/Home"));
const ProductDetail      = lazy(() => import("./pages/User/ProductDetail"));
const CartPage           = lazy(() => import("./pages/User/Cart"));
const CheckoutPage       = lazy(() => import("./pages/User/Checkout"));
const OrderConfirmation  = lazy(() => import("./pages/User/OrderConfirmation"));
const MyOrdersPage       = lazy(() => import("./pages/User/MyOrders"));
const OrderDetailPage    = lazy(() => import("./pages/User/OrderDetail"));
const ContactPage        = lazy(() => import("./pages/User/Contact"));
const FAQPage            = lazy(() => import("./pages/User/FAQ"));
const ShippingPolicyPage = lazy(() => import("./pages/User/ShippingPolicy"));
const ReturnsPage        = lazy(() => import("./pages/User/Returns"));
const WishlistPage       = lazy(() => import("./pages/User/Wishlist"));
const SearchResults      = lazy(() => import("./pages/User/SearchResults"));
const BrowsePage         = lazy(() => import("./pages/User/Browse"));
const AccountPage        = lazy(() => import("./pages/User/Account"));
const VerifyEmail        = lazy(() => import("./pages/User/VerifyEmail"));
const PrivacyPolicy      = lazy(() => import("./pages/User/PrivacyPolicy"));
const TermsOfUse         = lazy(() => import("./pages/User/TermsOfUse"));

// ── Admin ─────────────────────────────────────────────────────
const AdminDashboard     = lazy(() => import("./pages/Admin/Dashboard"));
const ProductManagement  = lazy(() => import("./pages/Admin/ProductManagement"));
const OrderManagement    = lazy(() => import("./pages/Admin/OrderManagement"));
const CustomerManagement = lazy(() => import("./pages/Admin/CustomerManagement"));
const Settings           = lazy(() => import("./pages/Admin/Settings"));
const CategoryManagement = lazy(() => import("./pages/Admin/CategoryManagement"));
const StaffManagement    = lazy(() => import("./pages/Admin/StaffManagement"));
const MyProfile          = lazy(() => import("./pages/Admin/MyProfile"));
const StoreProfilePage   = lazy(() => import("./pages/Admin/StoreProfile"));
const StaffSettings      = lazy(() => import("./pages/Admin/StaffSettings"));
const OffersManagement   = lazy(() => import("./pages/Admin/OffersManagement"));
const ReviewManagement   = lazy(() => import("./pages/Admin/ReviewManagement"));
const ReturnManagement   = lazy(() => import("./pages/Admin/ReturnManagement"));
const AuditLogPage       = lazy(() => import("./pages/Admin/AuditLog"));
const AdvancedAnalytics  = lazy(() => import("./pages/Admin/AdvancedAnalytics"));
const BulkProducts       = lazy(() => import("./pages/Admin/BulkProducts"));
const AdminStaffMgmt     = lazy(() => import("./pages/Admin/AdminStaffManagement"));
const DeliveryPartnerMgmt = lazy(() => import("./pages/Admin/DeliveryPartnerManagement"));

// ── Delivery Panel ────────────────────────────────────────────
const DeliveryLayout      = lazy(() => import("./components/Delivery/DeliveryLayout"));
const DeliveryDashboard   = lazy(() => import("./pages/Delivery/DeliveryDashboard"));
const DeliveryOrders      = lazy(() => import("./pages/Delivery/DeliveryOrders"));
const DeliveryOrderDetail = lazy(() => import("./pages/Delivery/DeliveryOrderDetail"));
const DeliveryProfile     = lazy(() => import("./pages/Delivery/DeliveryProfile"));
const DeliverySupport     = lazy(() => import("./pages/Delivery/DeliverySupport"));
const DeliveryReportIssue = lazy(() => import("./pages/Delivery/DeliveryReportIssue"));
const DeliveryEarnings    = lazy(() => import("./pages/Delivery/DeliveryEarnings"));
const DeliverySettings    = lazy(() => import("./pages/Delivery/DeliverySettings"));
const DeliveryPrivacy     = lazy(() => import("./pages/Delivery/DeliveryPrivacy"));
const DeliveryReturnDetail = lazy(() => import("./pages/Delivery/DeliveryReturnDetail"));

const PageLoader = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <PrimeLoader isLoading={true} />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <BrowserRouter>
                <ScrollToTop />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Auth */}
                    <Route path="/auth"           element={<AuthPage />} />
                    <Route path="/set-password"   element={<SetPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Storefront */}
                    <Route element={<StorefrontLayout />}>
                      <Route path="/"                          element={<HomePage />} />
                      <Route path="/products/:id"              element={<ProductDetail />} />
                      <Route path="/cart"                      element={<CartPage />} />
                      <Route path="/checkout"                  element={<CheckoutPage />} />
                      <Route path="/order-confirmation/:id"    element={<OrderConfirmation />} />
                      <Route path="/orders"                    element={<MyOrdersPage />} />
                      <Route path="/orders/:id"                element={<OrderDetailPage />} />
                      <Route path="/contact"                   element={<ContactPage />} />
                      <Route path="/faq"                       element={<FAQPage />} />
                      <Route path="/shipping-policy"           element={<ShippingPolicyPage />} />
                      <Route path="/returns"                   element={<ReturnsPage />} />
                      <Route path="/search"                    element={<SearchResults />} />
                      <Route path="/browse"                    element={<BrowsePage />} />
                      <Route path="/account/*"                 element={<AccountPage />} />
                      <Route path="/account/wishlist"          element={<WishlistPage />} />
                      <Route path="/privacy-policy"            element={<PrivacyPolicy />} />
                      <Route path="/terms-of-use"              element={<TermsOfUse />} />
                    </Route>

                    {/* Standalone — no navbar */}
                    <Route path="/verify-email" element={<VerifyEmail />} />

                    {/* Admin */}
                    <Route path="/admin" element={<ProtectedRoute><ErrorBoundary><AdminLayout /></ErrorBoundary></ProtectedRoute>}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard"       element={<ProtectedRoute permission="dashboard">  <AdminDashboard />      </ProtectedRoute>} />
                      <Route path="products"        element={<ProtectedRoute permission="products">   <ProductManagement />   </ProtectedRoute>} />
                      <Route path="categories"      element={<ProtectedRoute permission="categories"> <CategoryManagement />  </ProtectedRoute>} />
                      <Route path="orders"          element={<ProtectedRoute permission="orders">     <OrderManagement />     </ProtectedRoute>} />
                      <Route path="customers"       element={<ProtectedRoute allowedRoles={["superadmin", "admin_staff", "staff"]} permission="customers"><CustomerManagement /></ProtectedRoute>} />
                      <Route path="staff"           element={<ProtectedRoute allowedRoles={["superadmin", "admin_staff"]}><StaffManagement /></ProtectedRoute>} />
                      <Route path="settings"        element={<ProtectedRoute allowedRoles={["superadmin"]}><Settings /></ProtectedRoute>} />
                      <Route path="profile"         element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
                      <Route path="store-profile"   element={<ProtectedRoute allowedRoles={["staff"]}><StoreProfilePage /></ProtectedRoute>} />
                      <Route path="account-settings" element={<ProtectedRoute allowedRoles={["staff"]}><StaffSettings /></ProtectedRoute>} />
                      <Route path="offers"          element={<ProtectedRoute allowedRoles={["superadmin", "admin_staff"]}><OffersManagement /></ProtectedRoute>} />
                      <Route path="reviews"         element={<ProtectedRoute allowedRoles={["superadmin", "admin_staff"]}><ReviewManagement /></ProtectedRoute>} />
                      <Route path="returns"         element={<ProtectedRoute allowedRoles={["superadmin", "admin_staff", "staff"]} permission="orders"><ReturnManagement /></ProtectedRoute>} />
                      <Route path="audit-log"       element={<ProtectedRoute allowedRoles={["superadmin"]}><AuditLogPage /></ProtectedRoute>} />
                      <Route path="analytics"       element={<ProtectedRoute allowedRoles={["superadmin"]}><AdvancedAnalytics /></ProtectedRoute>} />
                      <Route path="bulk-products"   element={<ProtectedRoute permission="products"><BulkProducts /></ProtectedRoute>} />
                      <Route path="admin-staff"     element={<ProtectedRoute allowedRoles={["superadmin"]}><AdminStaffMgmt /></ProtectedRoute>} />
                      <Route path="delivery-partners" element={<ProtectedRoute allowedRoles={["superadmin", "admin_staff"]}><DeliveryPartnerMgmt /></ProtectedRoute>} />
                    </Route>

                    {/* Delivery Panel */}
                    <Route path="/delivery" element={<ProtectedRoute allowedRoles={["delivery_partner"]}><DeliveryLayout /></ProtectedRoute>}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard"    element={<DeliveryDashboard />} />
                      <Route path="orders"       element={<DeliveryOrders />} />
                      <Route path="orders/:id"   element={<DeliveryOrderDetail />} />
                      <Route path="profile"      element={<DeliveryProfile />} />
                      <Route path="support"      element={<DeliverySupport />} />
                      <Route path="report-issue" element={<DeliveryReportIssue />} />
                      <Route path="earnings"     element={<DeliveryEarnings />} />
                      <Route path="settings"     element={<DeliverySettings />} />
                      <Route path="privacy"      element={<DeliveryPrivacy />} />
                      <Route path="returns/:id"  element={<DeliveryReturnDetail />} />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
