import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  ShoppingCart, LogOut, Package, LogIn, Search, X, Menu, 
  UserCircle, ChevronDown, Truck} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useSettings } from "../../context/SettingsContext";
import { getProducts } from "../../services/storefront/productService";
import type { StorefrontProduct } from "../../services/storefront/productService";
import Logo from "../../assets/logo.png";

const StorefrontNavbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { storeName, freeShippingThreshold } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<StorefrontProduct[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [recommended, setRecommended] = useState<StorefrontProduct[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const helpDropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setShowHelpDropdown(false);
    setShowAccountDropdown(false);
  }, [location.pathname]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(targetNode)) {
        setShowDropdown(false);
      }
      if (helpDropdownRef.current && !helpDropdownRef.current.contains(targetNode)) {
         setShowHelpDropdown(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(targetNode)) {
         setShowAccountDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch recommended products
  useEffect(() => {
    getProducts({ limit: 4 }).then(res => {
      const inStock = res.data.filter(p => p.stock > 0);
      setRecommended(inStock);
    }).catch(() => { });
  }, []);

  // Search debounce and fetch
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await getProducts({ search: searchQuery, limit: 6 });
        const inStock = res.data.filter(p => p.stock > 0);
        setSearchResults(inStock);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <>
      <header className="sticky-top w-100 z-3 shadow-sm" style={{ background: "var(--prime-deep)" }}>
        {/* TOP ROW: Logo, Search, Account, Cart */}
        <div className="container py-3 border-bottom" style={{ borderColor: "rgba(255,255,255,0.15) !important" }}>
          <div className="d-flex align-items-center justify-content-between gap-3 gap-xl-5">
            
            {/* Logo */}
            <Link to="/" className="text-decoration-none d-flex align-items-center flex-shrink-0 text-white">
              <img src={Logo} alt={storeName} width="45" className="me-2" />
              <span className="fw-black fs-3 d-none d-sm-inline" style={{ letterSpacing: "-0.5px" }}>
                {storeName}
              </span>
            </Link>

            {/* Central Search Bar */}
            <div className="flex-grow-1 position-relative d-none d-md-block" ref={dropdownRef} style={{ maxWidth: "800px" }}>
              <div className="d-flex align-items-center bg-white overflow-hidden" style={{ borderRadius: "4px", padding: "3px" }}>
                <input
                  type="text"
                  placeholder="Find the best for your pet..."
                  className="border-0 bg-transparent flex-grow-1 px-3 py-2 fw-medium"
                  style={{ outline: "none", fontSize: "1rem", color: "#333", minWidth: 0 }}
                  value={searchQuery}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      setShowDropdown(false);
                      navigate(`/search?q=${searchQuery}`);
                    }
                  }}
                />
                
                {searchQuery && (
                  <button className="btn p-0 border-0 flex-shrink-0 me-2" onClick={() => setSearchQuery("")}>
                    <X size={20} style={{ color: "#aaa" }} />
                  </button>
                )}
                
                <button 
                  className="btn d-flex align-items-center justify-content-center border-0 flex-shrink-0"
                  style={{ background: "#fff", color: "var(--prime-deep)" }}
                  onClick={() => searchQuery.trim() && navigate(`/search?q=${searchQuery}`)}
                >
                  <Search size={24} className="fw-bold" strokeWidth={2.5} />
                </button>
              </div>

              {/* Advanced Search Dropdown */}
              <AnimatePresence>
                {showDropdown && (searchQuery.trim() || recommended.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="position-absolute w-100 bg-white shadow-lg overflow-hidden mt-1"
                    style={{ top: "100%", left: 0, zIndex: 1000, borderRadius: "4px", border: "1px solid #ddd" }}
                  >
                    <div className="p-0">
                      {isSearching ? (
                        <div className="text-center py-4">
                          <div className="spinner-border spinner-border-sm mb-2" style={{ color: "var(--prime-orange)" }} />
                          <div className="text-muted fw-bold" style={{ fontSize: "0.85rem" }}>SEARCHING...</div>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="p-2">
                          {searchResults.map((product) => (
                            <div
                              key={product._id}
                              className="d-flex align-items-center gap-3 p-2 rounded custom-hover-bg"
                              onClick={() => {
                                setShowDropdown(false);
                                navigate(`/products/${product._id}`);
                                setSearchQuery("");
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <div style={{ width: 40, height: 40, background: "#f5f5f5", flexShrink: 0 }}>
                                {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-100 h-100 object-fit-cover" /> : <Package size={20} className="m-2 text-muted" />}
                              </div>
                              <div className="flex-grow-1 text-truncate pe-2">
                                <div className="fw-bold text-dark text-truncate" style={{ fontSize: "0.95rem" }}>{product.name}</div>
                                <div className="fw-bold" style={{ fontSize: "0.85rem", color: "var(--prime-orange)" }}>
                                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(product.price)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : searchQuery.trim() ? (
                        <div className="py-4 px-3 text-center">
                          <Search size={32} style={{ color: "#ddd", marginBottom: 12 }} />
                          <div className="text-muted fw-bold">NO RESULTS FOUND</div>
                        </div>
                      ) : (
                        <div className="p-3">
                          <div className="text-muted fw-bold mb-2" style={{ fontSize: "0.75rem", letterSpacing: 1 }}>TRENDING</div>
                          <div className="d-flex flex-wrap gap-2">
                            {recommended.map(product => (
                              <div
                                key={product._id}
                                className="border rounded p-2"
                                style={{ width: "calc(50% - 4px)", cursor: "pointer", background: "#fff" }}
                                onClick={() => {
                                  setShowDropdown(false);
                                  navigate(`/products/${product._id}`);
                                }}
                              >
                                <div className="fw-bold text-dark text-truncate" style={{ fontSize: "0.8rem" }}>{product.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side Links */}
            <div className="d-flex align-items-center gap-2 gap-xl-4 text-white flex-shrink-0">
              
              {/* Help Line */}
              <div className="position-relative d-none d-lg-block z-3" ref={helpDropdownRef}>
                <button
                  className="btn p-0 border-0 text-white d-flex align-items-center gap-1 fw-bold"
                  style={{ background: "transparent" }}
                  onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                >
                  24/7 help <ChevronDown size={16} />
                </button>
                <AnimatePresence>
                  {showHelpDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="position-absolute shadow-lg bg-white rounded-3 mt-3 overflow-hidden"
                      style={{ top: "100%", left: 0, minWidth: 220, zIndex: 1000, border: "1px solid #ddd" }}
                    >
                      <div className="d-flex flex-column py-2">
                        <Link className="px-4 py-2 text-dark text-decoration-none fw-bold custom-hover-bg" style={{ fontSize: "0.95rem" }} to="/contact" onClick={() => setShowHelpDropdown(false)}>Contact Us</Link>
                        <Link className="px-4 py-2 text-dark text-decoration-none fw-bold custom-hover-bg" style={{ fontSize: "0.95rem" }} to="/faq" onClick={() => setShowHelpDropdown(false)}>FAQ</Link>
                        <Link className="px-4 py-2 text-dark text-decoration-none fw-bold custom-hover-bg" style={{ fontSize: "0.95rem" }} to="/shipping-policy" onClick={() => setShowHelpDropdown(false)}>Shipping Policy</Link>
                        <Link className="px-4 py-2 text-dark text-decoration-none fw-bold custom-hover-bg" style={{ fontSize: "0.95rem" }} to="/returns" onClick={() => setShowHelpDropdown(false)}>Returns & Refunds</Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Account Dropdown (Always visible Avatar) */}
              <div className="position-relative d-none d-md-block z-3" ref={accountDropdownRef}>
                <button
                  className="btn p-0 border-0 text-white d-flex flex-column align-items-center"
                  style={{ background: "transparent" }}
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                >
                  <div className="d-flex align-items-center gap-2 fw-bold">
                    <UserCircle size={24} />
                    <span>your account <ChevronDown size={16} /></span>
                  </div>
                </button>
                <AnimatePresence>
                  {showAccountDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="position-absolute shadow-lg bg-white rounded-3 mt-3 overflow-hidden"
                      style={{ top: "100%", right: 0, minWidth: 220, zIndex: 1000, border: "1px solid #ddd" }}
                    >
                      <div className="d-flex flex-column py-2">
                        {isAuthenticated ? (
                          <>
                            <div className="px-4 py-2 text-muted fw-bold" style={{ fontSize: '0.8rem' }}>
                              Hi, {user?.name || "Customer"}!
                            </div>
                            <Link className="px-4 py-2 text-dark text-decoration-none fw-bold custom-hover-bg d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }} to="/orders" onClick={() => setShowAccountDropdown(false)}>
                              <Package size={16} style={{ color: "var(--prime-orange)" }} /> My Orders
                            </Link>
                            <div className="border-bottom my-1" style={{ borderColor: "#f0f0f0" }}></div>
                            <button className="btn px-4 py-2 text-danger fw-bold custom-hover-bg d-flex align-items-center gap-2 text-start rounded-0 border-0" style={{ fontSize: "0.95rem", background: "transparent" }} onClick={() => { handleLogout(); setShowAccountDropdown(false); }}>
                              <LogOut size={16} /> Sign Out
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="p-3 pb-2 text-center">
                              <Link to="/auth" className="btn w-100 fw-bold text-white shadow-sm" style={{ background: "var(--prime-gradient)", border: "none" }} onClick={() => setShowAccountDropdown(false)}>
                                Sign In
                              </Link>
                            </div>
                            <div className="text-center py-2 px-3">
                              <span className="text-muted" style={{ fontSize: '0.85rem' }}>New customer? <Link to="/auth?mode=register" style={{ color: "var(--prime-deep)", fontWeight: "bold" }} onClick={() => setShowAccountDropdown(false)}>Start here.</Link></span>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <Link to="/cart" className="text-white text-decoration-none d-flex align-items-center gap-2 position-relative ms-2">
                <div className="position-relative">
                  <ShoppingCart size={28} />
                  {totalItems > 0 && (
                    <span
                      className="position-absolute badge rounded-circle text-dark d-flex align-items-center justify-content-center"
                      style={{ 
                        top: -8, right: -12, background: "#FFD100", 
                        fontSize: "0.8rem", width: 22, height: 22, fontWeight: "900" 
                      }}
                    >
                      {totalItems > 99 ? "99" : totalItems}
                    </span>
                  )}
                </div>
                <span className="fw-bold fs-6 d-none d-lg-inline ms-1">
                  your cart
                </span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                className="btn border-0 shadow-none p-1 d-md-none text-white ms-2"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Categories & Promo */}
        <div className="container py-2 d-none d-md-flex justify-content-between align-items-center text-white">
          <div className="d-flex align-items-center gap-4 fw-bold" style={{ fontSize: '0.95rem' }}>
            <span style={{ cursor: "pointer" }} className="hover-opacity" onClick={() => navigate("/")}>Prime Deals</span>
            <span style={{ cursor: "pointer" }} className="hover-opacity" onClick={() => navigate("/")}>New Arrivals</span>
            <span style={{ cursor: "pointer" }} className="hover-opacity" onClick={() => navigate("/")}>Best Sellers</span>
            <span style={{ cursor: "pointer" }} className="hover-opacity" onClick={() => navigate("/")}>Customer Service</span>
          </div>

          <div className="fw-black d-flex align-items-center gap-2" style={{ color: "#FFD100", fontSize: '0.95rem', letterSpacing: '0.5px' }}>
            FREE DELIVERY FOR ORDERS ABOVE {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(freeShippingThreshold)}! <Truck size={20} />
          </div>
        </div>
      </header>

      {/* Mobile Search Bar (Only visible on small screens below header) */}
      <div className="d-md-none bg-white p-2 border-bottom shadow-sm">
         <div className="d-flex align-items-center bg-light rounded px-2" style={{ border: "1px solid #ddd" }}>
            <Search size={18} className="text-muted" />
            <input
               type="text"
               placeholder="Find the best for your pet..."
               className="border-0 bg-transparent flex-grow-1 px-2 py-2"
               style={{ outline: "none", fontSize: "0.95rem" }}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                     navigate(`/search?q=${searchQuery}`);
                  }
               }}
            />
         </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="position-fixed h-100 bg-white z-3 shadow-lg"
            style={{ top: 0, left: 0, width: "85%", maxWidth: "350px", overflowY: "auto" }}
          >
            <div className="p-4" style={{ background: "var(--prime-deep)", color: "white" }}>
               {isAuthenticated ? (
                  <div className="d-flex align-items-center gap-3">
                     <UserCircle size={40} />
                     <div className="fw-bold fs-5">Hello, {user?.name}</div>
                  </div>
               ) : (
                  <div className="d-flex align-items-center gap-3">
                     <UserCircle size={40} />
                     <Link to="/auth" className="fw-bold fs-5 text-white text-decoration-none">Sign In / Register</Link>
                  </div>
               )}
            </div>

            <div className="d-flex flex-column p-3 gap-2">
              <div className="fw-bold text-muted mt-2 mb-1 px-2" style={{ fontSize: "0.8rem", textTransform: "uppercase" }}>My Account</div>

              {isAuthenticated ? (
                <>
                  <Link to="/orders" className="btn text-start fw-bold py-2 border-0 bg-transparent d-flex align-items-center gap-2">
                    <Package size={18} /> My Orders
                  </Link>
                  <button onClick={handleLogout} className="btn text-start fw-bold py-2 border-0 bg-transparent text-danger d-flex align-items-center gap-2">
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" className="btn text-start fw-bold py-2 border-0 bg-transparent d-flex align-items-center gap-2">
                    <LogIn size={18} /> Sign In
                </Link>
              )}

              <hr className="my-2" />
              
              <div className="bg-light p-3 rounded mt-2 d-flex align-items-center gap-2 fw-bold" style={{ color: "var(--prime-deep)" }}>
                 <Truck size={20} /> FREE Delivery {">"} {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(freeShippingThreshold)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Backdrop */}
      {menuOpen && (
         <div 
            className="position-fixed top-0 start-0 w-100 h-100 z-2 bg-dark opacity-50" 
            onClick={() => setMenuOpen(false)}
         />
      )}
    </>
  );
};

export default StorefrontNavbar;