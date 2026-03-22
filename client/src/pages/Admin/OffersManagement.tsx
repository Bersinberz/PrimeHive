import React, { useState, useEffect, useCallback } from "react";
import { Tag, Ticket, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../context/ToastContext";
import PrimeLoader from "../../components/PrimeLoader";
import ActionConfirmModal from "../../components/Admin/ActionConfirmModal";
import { getOffers, createOffer, updateOffer, deleteOffer } from "../../services/admin/offerService";
import type { Offer, OfferPayload } from "../../services/admin/offerService";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "../../services/admin/couponService";
import type { Coupon, CouponPayload } from "../../services/admin/couponService";
import { getProducts } from "../../services/admin/productService";
import type { Product } from "../../services/admin/productService";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

// ─── Shared modal shell ────────────────────────────────────────────────────────
interface ModalShellProps {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({ title, subtitle, onClose, children }) => (
  <motion.div
    className="glass-modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    onClick={onClose}
    style={{ zIndex: 1000 }}
  >
    <motion.div
      className="glass-modal"
      initial={{ opacity: 0, scale: 0.88, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: 24 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={e => e.stopPropagation()}
      style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 660,
        border: "1px solid #f0f0f2", display: "flex", flexDirection: "column",
        maxHeight: "90vh", overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 28px 20px", borderBottom: "1px solid #f0f0f2", flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.5px", margin: 0 }}>{title}</h2>
          <p style={{ color: "#888", fontSize: "0.88rem", fontWeight: 500, margin: "4px 0 0" }}>{subtitle}</p>
        </div>
        <button type="button" onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "#999", transition: "color 0.2s", flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = "#1a1a1a")}
          onMouseLeave={e => (e.currentTarget.style.color = "#999")}>
          <X size={22} />
        </button>
      </div>
      {/* Scrollable body */}
      <div style={{ overflowY: "auto", flex: 1, padding: "24px 28px" }}>
        {children}
      </div>
    </motion.div>
  </motion.div>
);

// ─── Offer Form ────────────────────────────────────────────────────────────────
const emptyOffer = (): OfferPayload => ({
  label: "", discountType: "percentage", discountValue: 10, isActive: true,
  startDate: "", endDate: "", productIds: [],
});

interface OfferFormProps {
  initial: OfferPayload & { _id?: string };
  products: Product[];
  saving: boolean;
  onSave: (data: OfferPayload, id?: string) => Promise<void>;
  onCancel: () => void;
}

const OfferForm: React.FC<OfferFormProps> = ({ initial, products, saving, onSave, onCancel }) => {
  const [form, setForm] = useState<OfferPayload & { _id?: string }>(initial);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");

  const set = (k: keyof OfferPayload, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleProduct = (id: string) =>
    setForm(f => ({
      ...f,
      productIds: f.productIds?.includes(id)
        ? f.productIds.filter(p => p !== id)
        : [...(f.productIds ?? []), id],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try { await onSave(form, form._id); }
    catch (e: any) { setErr(e?.response?.data?.message || "Failed to save offer"); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 12,
    border: "1.5px solid #f0f0f2", background: "#fafafa",
    fontSize: "0.9rem", fontWeight: 600, color: "#1a1a1a", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.72rem", fontWeight: 800, color: "#aaa",
    textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6,
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <PrimeLoader isLoading={saving} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Label *</label>
          <input style={inputStyle} placeholder="e.g. Flash Sale" value={form.label}
            onChange={e => set("label", e.target.value)} required />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Discount Type *</label>
            <select style={inputStyle} value={form.discountType}
              onChange={e => set("discountType", e.target.value)}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Value * {form.discountType === "percentage" ? "(1–99%)" : "(₹)"}</label>
            <input type="number" style={inputStyle} min={1} max={form.discountType === "percentage" ? 99 : undefined}
              value={form.discountValue} onChange={e => set("discountValue", Number(e.target.value))} required />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Start Date</label>
            <input type="date" style={inputStyle}
              value={form.startDate ? form.startDate.slice(0, 10) : ""}
              onChange={e => set("startDate", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>End Date</label>
            <input type="date" style={inputStyle}
              value={form.endDate ? form.endDate.slice(0, 10) : ""}
              onChange={e => set("endDate", e.target.value)} />
          </div>
        </div>

        <div className="form-check form-switch m-0">
          <input className="form-check-input" type="checkbox" role="switch" id="offerActive"
            checked={form.isActive} onChange={e => set("isActive", e.target.checked)} />
          <label className="form-check-label fw-bold" htmlFor="offerActive" style={{ fontSize: "0.85rem" }}>Active</label>
        </div>

        <div>
          <label style={labelStyle}>Assign Products ({form.productIds?.length ?? 0} selected)</label>
          <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Search products..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ border: "1.5px solid #f0f0f2", borderRadius: 12, overflow: "auto", maxHeight: 200 }}>
            {filtered.length === 0
              ? <div className="text-muted text-center py-3" style={{ fontSize: "0.8rem" }}>No products found</div>
              : filtered.map(p => (
                <label key={p._id}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, borderBottom: "1px solid #f5f5f5", background: form.productIds?.includes(p._id) ? "#fff8f0" : "#fff" }}>
                  <input type="checkbox" checked={form.productIds?.includes(p._id) ?? false}
                    onChange={() => toggleProduct(p._id)} />
                  {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 6 }} />}
                  <span style={{ flex: 1 }}>{p.name}</span>
                  <span className="text-muted" style={{ fontSize: "0.78rem" }}>{fmt(p.price)}</span>
                </label>
              ))
            }
          </div>
        </div>

        {err && <div className="text-danger fw-semibold" style={{ fontSize: "0.82rem" }}>{err}</div>}

        <div className="d-flex gap-2 pt-2" style={{ borderTop: "1px solid #f0f0f2" }}>
          <button type="submit" disabled={saving}
            className="btn fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2"
            style={{ background: "var(--prime-gradient)", border: "none", color: "#fff", fontSize: "0.85rem" }}>
            <Check size={14} /> {form._id ? "Update Offer" : "Create Offer"}
          </button>
          <button type="button" onClick={onCancel}
            className="btn btn-light fw-bold rounded-pill px-4 py-2" style={{ fontSize: "0.85rem" }}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

// ─── Coupon Form ───────────────────────────────────────────────────────────────
const emptyCoupon = (): CouponPayload => ({
  code: "", discountType: "percentage", discountValue: 10,
  minOrderValue: 0, isActive: true,
});

interface CouponFormProps {
  initial: CouponPayload & { _id?: string };
  saving: boolean;
  onSave: (data: CouponPayload, id?: string) => Promise<void>;
  onCancel: () => void;
}

const CouponForm: React.FC<CouponFormProps> = ({ initial, saving, onSave, onCancel }) => {
  const [form, setForm] = useState<CouponPayload & { _id?: string }>(initial);
  const [err, setErr] = useState("");

  const set = (k: keyof CouponPayload, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try { await onSave(form, form._id); }
    catch (e: any) { setErr(e?.response?.data?.message || "Failed to save coupon"); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 12,
    border: "1.5px solid #f0f0f2", background: "#fafafa",
    fontSize: "0.9rem", fontWeight: 600, color: "#1a1a1a", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.72rem", fontWeight: 800, color: "#aaa",
    textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6,
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <PrimeLoader isLoading={saving} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Coupon Code *</label>
          <input style={{ ...inputStyle, textTransform: "uppercase", letterSpacing: 2 }}
            placeholder="e.g. SAVE20"
            value={form.code}
            onChange={e => set("code", e.target.value.toUpperCase())}
            required />
          <span style={{ fontSize: "0.75rem", color: "#bbb", fontWeight: 500 }}>Stored in uppercase automatically</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Discount Type *</label>
            <select style={inputStyle} value={form.discountType}
              onChange={e => set("discountType", e.target.value)}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Value * {form.discountType === "percentage" ? "(1–99%)" : "(₹)"}</label>
            <input type="number" style={inputStyle} min={1} max={form.discountType === "percentage" ? 99 : undefined}
              value={form.discountValue} onChange={e => set("discountValue", Number(e.target.value))} required />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Min Order Value (₹)</label>
            <input type="number" style={inputStyle} min={0} placeholder="No minimum"
              value={form.minOrderValue ?? ""}
              onChange={e => set("minOrderValue", e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div>
            <label style={labelStyle}>Usage Limit</label>
            <input type="number" style={inputStyle} min={1} placeholder="Unlimited"
              value={form.usageLimit ?? ""}
              onChange={e => set("usageLimit", e.target.value ? Number(e.target.value) : undefined)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Expiry Date</label>
          <input type="date" style={inputStyle}
            value={form.expiryDate ? form.expiryDate.slice(0, 10) : ""}
            onChange={e => set("expiryDate", e.target.value || undefined)} />
        </div>

        <div className="form-check form-switch m-0">
          <input className="form-check-input" type="checkbox" role="switch" id="couponActive"
            checked={form.isActive} onChange={e => set("isActive", e.target.checked)} />
          <label className="form-check-label fw-bold" htmlFor="couponActive" style={{ fontSize: "0.85rem" }}>Active</label>
        </div>

        {err && <div className="text-danger fw-semibold" style={{ fontSize: "0.82rem" }}>{err}</div>}

        <div className="d-flex gap-2 pt-2" style={{ borderTop: "1px solid #f0f0f2" }}>
          <button type="submit" disabled={saving}
            className="btn fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2"
            style={{ background: "var(--prime-gradient)", border: "none", color: "#fff", fontSize: "0.85rem" }}>
            <Check size={14} /> {form._id ? "Update Coupon" : "Create Coupon"}
          </button>
          <button type="button" onClick={onCancel}
            className="btn btn-light fw-bold rounded-pill px-4 py-2" style={{ fontSize: "0.85rem" }}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const OffersManagement: React.FC = () => {
  const { showToast } = useToast();
  const [tab, setTab] = useState<"offers" | "coupons">("offers");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerForm, setOfferForm] = useState<(OfferPayload & { _id?: string }) | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState<(CouponPayload & { _id?: string }) | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  const [products, setProducts] = useState<Product[]>([]);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try { setOffers(await getOffers()); }
    catch { showToast({ type: "error", title: "Error", message: "Failed to load offers" }); }
    finally { setLoading(false); }
  }, []);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try { setCoupons(await getCoupons()); }
    catch { showToast({ type: "error", title: "Error", message: "Failed to load coupons" }); }
    finally { setLoading(false); }
  }, []);

  const loadProducts = useCallback(async () => {
    try { setProducts(await getProducts({ limit: 200 })); }
    catch { /* silent */ }
  }, []);

  useEffect(() => { loadOffers(); loadProducts(); }, [loadOffers, loadProducts]);
  useEffect(() => { if (tab === "coupons") loadCoupons(); }, [tab, loadCoupons]);

  const handleSaveOffer = async (data: OfferPayload, id?: string) => {
    setSaving(true);
    try {
      if (id) {
        const updated = await updateOffer(id, data);
        setOffers(prev => prev.map(o => o._id === id ? updated : o));
        showToast({ type: "success", title: "Updated", message: "Offer updated successfully" });
      } else {
        const created = await createOffer(data);
        setOffers(prev => [created, ...prev]);
        showToast({ type: "success", title: "Created", message: "Offer created successfully" });
      }
      setOfferForm(null);
    } finally { setSaving(false); }
  };

  const confirmDeleteOffer = async () => {
    if (!offerToDelete) return;
    setSaving(true);
    try {
      await deleteOffer(offerToDelete._id);
      setOffers(prev => prev.filter(o => o._id !== offerToDelete._id));
      showToast({ type: "success", title: "Deleted", message: "Offer deleted" });
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to delete offer" });
    } finally { setSaving(false); setOfferToDelete(null); }
  };

  const handleSaveCoupon = async (data: CouponPayload, id?: string) => {
    setSaving(true);
    try {
      if (id) {
        const updated = await updateCoupon(id, data);
        setCoupons(prev => prev.map(c => c._id === id ? updated : c));
        showToast({ type: "success", title: "Updated", message: "Coupon updated successfully" });
      } else {
        const created = await createCoupon(data);
        setCoupons(prev => [created, ...prev]);
        showToast({ type: "success", title: "Created", message: "Coupon created successfully" });
      }
      setCouponForm(null);
    } finally { setSaving(false); }
  };

  const confirmDeleteCoupon = async () => {
    if (!couponToDelete) return;
    setSaving(true);
    try {
      await deleteCoupon(couponToDelete._id);
      setCoupons(prev => prev.filter(c => c._id !== couponToDelete._id));
      showToast({ type: "success", title: "Deleted", message: "Coupon deleted" });
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to delete coupon" });
    } finally { setSaving(false); setCouponToDelete(null); }
  };

  const badge = (active: boolean) => (
    <span className="badge rounded-pill fw-bold px-2 py-1"
      style={{ fontSize: "0.7rem", background: active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)", color: active ? "#059669" : "#ef4444" }}>
      {active ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      <PrimeLoader isLoading={loading} />

      <ActionConfirmModal
        isOpen={!!offerToDelete}
        actionType="delete_product"
        itemName={offerToDelete?.label ?? ""}
        onConfirm={confirmDeleteOffer}
        onCancel={() => setOfferToDelete(null)}
      />
      <ActionConfirmModal
        isOpen={!!couponToDelete}
        actionType="delete_product"
        itemName={couponToDelete?.code ?? ""}
        onConfirm={confirmDeleteCoupon}
        onCancel={() => setCouponToDelete(null)}
      />

      {/* Offer modal */}
      <AnimatePresence>
        {offerForm && (
          <ModalShell
            title={offerForm._id ? "Edit Offer" : "New Offer"}
            subtitle={offerForm._id ? "Update offer details and assigned products" : "Create a product-level discount offer"}
            onClose={() => setOfferForm(null)}
          >
            <OfferForm
              initial={offerForm}
              products={products}
              saving={saving}
              onSave={handleSaveOffer}
              onCancel={() => setOfferForm(null)}
            />
          </ModalShell>
        )}
      </AnimatePresence>

      {/* Coupon modal */}
      <AnimatePresence>
        {couponForm && (
          <ModalShell
            title={couponForm._id ? "Edit Coupon" : "New Coupon"}
            subtitle={couponForm._id ? "Update coupon code settings" : "Create a checkout discount coupon"}
            onClose={() => setCouponForm(null)}
          >
            <CouponForm
              initial={couponForm}
              saving={saving}
              onSave={handleSaveCoupon}
              onCancel={() => setCouponForm(null)}
            />
          </ModalShell>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-black mb-1" style={{ fontSize: "1.4rem" }}>Offers & Coupons</h2>
          <p className="text-muted m-0" style={{ fontSize: "0.85rem" }}>Manage product offers and checkout coupon codes</p>
        </div>
        <button
          className="btn fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2"
          style={{ background: "var(--prime-gradient)", border: "none", color: "#fff", fontSize: "0.85rem" }}
          onClick={() => tab === "offers" ? setOfferForm(emptyOffer()) : setCouponForm(emptyCoupon())}>
          <Plus size={15} /> New {tab === "offers" ? "Offer" : "Coupon"}
        </button>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4">
        {(["offers", "coupons"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="btn fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2"
            style={{ fontSize: "0.85rem", background: tab === t ? "var(--prime-gradient)" : "#f5f5f5", color: tab === t ? "#fff" : "#555", border: "none" }}>
            {t === "offers" ? <Tag size={14} /> : <Ticket size={14} />}
            {t === "offers" ? "Offers" : "Coupons"}
          </button>
        ))}
      </div>

      {/* ── Offers Tab ── */}
      {tab === "offers" && (
        <div className="rounded-4 border bg-white overflow-hidden">
          {offers.length === 0 && !loading ? (
            <div className="text-center py-5 text-muted">
              <Tag size={36} style={{ color: "#ddd", marginBottom: 12 }} />
              <div className="fw-bold" style={{ fontSize: "0.9rem" }}>No offers yet</div>
              <div style={{ fontSize: "0.8rem" }}>Create your first offer to start promoting products</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
                <thead style={{ background: "#f8f8f8" }}>
                  <tr>
                    <th className="fw-bold py-3 px-4">Label</th>
                    <th className="fw-bold py-3">Discount</th>
                    <th className="fw-bold py-3">Products</th>
                    <th className="fw-bold py-3">Date Range</th>
                    <th className="fw-bold py-3">Status</th>
                    <th className="fw-bold py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map(o => (
                    <tr key={o._id}>
                      <td className="px-4 fw-semibold">{o.label}</td>
                      <td>
                        <span className="fw-bold" style={{ color: "var(--prime-orange)" }}>
                          {o.discountType === "percentage" ? `${o.discountValue}%` : fmt(o.discountValue)} off
                        </span>
                      </td>
                      <td>{o.productCount ?? o.productIds?.length ?? 0} products</td>
                      <td className="text-muted" style={{ fontSize: "0.78rem" }}>
                        {o.startDate ? new Date(o.startDate).toLocaleDateString("en-IN") : "—"}
                        {" → "}
                        {o.endDate ? new Date(o.endDate).toLocaleDateString("en-IN") : "No end"}
                      </td>
                      <td>{badge(o.isActive)}</td>
                      <td className="px-4">
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-light rounded-pill px-3 fw-semibold"
                            style={{ fontSize: "0.78rem" }}
                            onClick={() => setOfferForm({ ...o, startDate: o.startDate?.slice(0, 10), endDate: o.endDate?.slice(0, 10) })}>
                            <Pencil size={12} className="me-1" />Edit
                          </button>
                          <button className="btn btn-sm rounded-pill px-3 fw-semibold"
                            style={{ fontSize: "0.78rem", background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "none" }}
                            onClick={() => setOfferToDelete(o)}>
                            <Trash2 size={12} className="me-1" />Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Coupons Tab ── */}
      {tab === "coupons" && (
        <div className="rounded-4 border bg-white overflow-hidden">
          {coupons.length === 0 && !loading ? (
            <div className="text-center py-5 text-muted">
              <Ticket size={36} style={{ color: "#ddd", marginBottom: 12 }} />
              <div className="fw-bold" style={{ fontSize: "0.9rem" }}>No coupons yet</div>
              <div style={{ fontSize: "0.8rem" }}>Create coupon codes for checkout discounts</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
                <thead style={{ background: "#f8f8f8" }}>
                  <tr>
                    <th className="fw-bold py-3 px-4">Code</th>
                    <th className="fw-bold py-3">Discount</th>
                    <th className="fw-bold py-3">Min Order</th>
                    <th className="fw-bold py-3">Usage</th>
                    <th className="fw-bold py-3">Expiry</th>
                    <th className="fw-bold py-3">Status</th>
                    <th className="fw-bold py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c._id}>
                      <td className="px-4">
                        <span className="fw-black font-monospace" style={{ fontSize: "0.9rem", color: "#1a1a1a", letterSpacing: 1 }}>
                          {c.code}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold" style={{ color: "var(--prime-orange)" }}>
                          {c.discountType === "percentage" ? `${c.discountValue}%` : fmt(c.discountValue)} off
                        </span>
                      </td>
                      <td>{c.minOrderValue ? fmt(c.minOrderValue) : "—"}</td>
                      <td>{c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : " / ∞"}</td>
                      <td className="text-muted" style={{ fontSize: "0.78rem" }}>
                        {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-IN") : "No expiry"}
                      </td>
                      <td>{badge(c.isActive)}</td>
                      <td className="px-4">
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-light rounded-pill px-3 fw-semibold"
                            style={{ fontSize: "0.78rem" }}
                            onClick={() => setCouponForm({ ...c, expiryDate: c.expiryDate?.slice(0, 10) })}>
                            <Pencil size={12} className="me-1" />Edit
                          </button>
                          <button className="btn btn-sm rounded-pill px-3 fw-semibold"
                            style={{ fontSize: "0.78rem", background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "none" }}
                            onClick={() => setCouponToDelete(c)}>
                            <Trash2 size={12} className="me-1" />Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OffersManagement;
