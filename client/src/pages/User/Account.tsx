import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Lock, MapPin, Package, HeadphonesIcon,
  Trash2, ChevronRight, Camera, Eye, EyeOff,
  Plus, Edit2, Check, X, ArrowLeft, AlertTriangle, Mail, Phone, LogOut, PauseCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import PrimeLoader from "../../components/PrimeLoader";
import ImageCropperModal from "../../components/Admin/ImageCropperModal";
import {
  getProfile, updateProfile, changePassword,
  getAddresses, addAddress, updateAddress, deleteAddress, deactivateAccount, deleteAccount,
  sendVerificationEmail,
} from "../../services/storefront/accountService";
import type { UserProfile, Address } from "../../services/storefront/accountService";

const inputCls = "form-control fw-semibold";
const pwdRules = [
  { id: "length",    text: "At least 6 chars",  test: (v: string) => v.length >= 6 },
  { id: "noSpaces",  text: "No spaces",          test: (v: string) => v.length > 0 && !/\s/.test(v) },
  { id: "uppercase", text: "Uppercase letter",   test: (v: string) => /[A-Z]/.test(v) },
  { id: "lowercase", text: "Lowercase letter",   test: (v: string) => /[a-z]/.test(v) },
  { id: "number",    text: "One number",         test: (v: string) => /[0-9]/.test(v) },
  { id: "special",   text: "Special character",  test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

const SubPageWrapper: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
      <button className="btn p-0 border-0 d-flex align-items-center gap-2 fw-bold mb-4"
        style={{ color: "#888", fontSize: "0.88rem", background: "transparent" }} onClick={() => navigate("/account")}>
        <ArrowLeft size={16} /> My Account
      </button>
      <div className="mb-4">
        <h3 className="fw-black mb-1" style={{ letterSpacing: "-0.5px" }}>{title}</h3>
        {subtitle && <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
};


// ─── Profile Sub-page ────────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
  const { updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", gender: "", dateOfBirth: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifyError, setVerifyError] = useState("");

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p);
      setForm({ name: p.name, email: p.email, phone: p.phone?.replace(/^\+91/, "") || "", gender: p.gender || "", dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : "" });
      if (searchParams.get("verified") === "1") {
        setSuccess("Email verified successfully!");
        window.history.replaceState({}, "", window.location.pathname);
      }
    }).catch(() => setError("Failed to load profile")).finally(() => setLoading(false));
  }, []);

  // 3.3 — revoke object URL on preview change or unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      const fd = new FormData();
      fd.append("name", form.name); fd.append("phone", form.phone);
      if (form.email) fd.append("email", form.email);
      if (form.gender) fd.append("gender", form.gender);
      if (form.dateOfBirth) fd.append("dateOfBirth", form.dateOfBirth);
      if (avatarFile) fd.append("profilePicture", avatarFile);
      const res = await updateProfile(fd);
      setProfile((p) => p ? { ...p, ...res.user } : p);
      updateUser({ name: res.user.name, profilePicture: res.user.profilePicture });
      // If email changed, reset verify state
      if (res.user.email !== profile?.email) {
        setVerifyMsg(""); setVerifyError("");
      }
      setSuccess("Profile updated successfully"); setAvatarFile(null); setAvatarPreview(null);
    } catch (err: any) { setError(err?.message || "Failed to update profile"); }
    finally { setSaving(false); }
  };

  const handleVerify = async () => {
    setVerifying(true); setVerifyMsg(""); setVerifyError("");
    try {
      await sendVerificationEmail();
      setVerifyMsg("Verification email sent");
    } catch (err: any) {
      setVerifyError(err?.message || "Failed to send verification email");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <PrimeLoader isLoading />;
  const avatarSrc = avatarPreview || profile?.profilePicture;

  return (
    <SubPageWrapper title="Account Info" subtitle="Update your personal details">
      <div className="form-panel mx-auto" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          {/* Compact banner */}
          <div className="rounded-4 mb-4 px-4 py-3 d-flex align-items-center gap-3 position-relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#1a0a00 0%,#c44a00 55%,#FF6B2B 100%)" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="position-relative flex-shrink-0">
              <div className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center"
                style={{ width: 64, height: 64, background: "rgba(255,255,255,0.15)", border: "2.5px solid rgba(255,255,255,0.35)" }}>
                {avatarSrc ? <img src={avatarSrc} alt="avatar" className="w-100 h-100 object-fit-cover" /> : <User size={26} color="rgba(255,255,255,0.85)" />}
              </div>
              <label htmlFor="avatarInput" className="position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 22, height: 22, background: "var(--prime-orange)", cursor: "pointer", border: "2px solid #fff" }}>
                <Camera size={11} color="#fff" />
              </label>
              <input id="avatarInput" type="file" accept="image/*" className="d-none"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setRawFile(f); setCropperOpen(true); e.target.value = ""; } }} />
            </div>
            <div className="position-relative">
              <div className="fw-black text-white" style={{ fontSize: "1.05rem", letterSpacing: "-0.3px" }}>{profile?.name}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>{profile?.email}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Tap camera to change photo</div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>Email</label>
              <div className="d-flex align-items-center gap-2">
                <div className="position-relative flex-grow-1">
                  <input
                    className={`${inputCls} pe-5`}
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                  {/* verified / unverified badge inside input */}
                  <span
                    className="position-absolute top-50 end-0 translate-middle-y me-2 d-flex align-items-center gap-1 fw-bold"
                    style={{ fontSize: "0.72rem", color: profile?.emailVerified ? "#10b981" : "#f59e0b", pointerEvents: "none" }}
                  >
                    {profile?.emailVerified
                      ? <><Check size={11} /> Verified</>
                      : <><AlertTriangle size={11} /> Unverified</>}
                  </span>
                </div>
                {!profile?.emailVerified && (
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={verifying || !!verifyMsg}
                    className="btn fw-bold d-flex align-items-center gap-1 flex-shrink-0"
                    style={{
                      background: verifyMsg ? "rgba(16,185,129,0.1)" : "rgba(255,107,43,0.1)",
                      color: verifyMsg ? "#10b981" : "var(--prime-orange)",
                      border: `1.5px solid ${verifyMsg ? "rgba(16,185,129,0.3)" : "rgba(255,107,43,0.3)"}`,
                      borderRadius: 8,
                      fontSize: "0.8rem",
                      whiteSpace: "nowrap",
                      padding: "6px 14px",
                    }}
                  >
                    {verifying ? (
                      <><span className="spinner-border spinner-border-sm me-1" style={{ width: 12, height: 12, borderWidth: 2 }} />Sending</>
                    ) : verifyMsg ? (
                      <><Check size={13} /> Sent</>
                    ) : (
                      <><Mail size={13} /> Verify</>
                    )}
                  </button>
                )}
              </div>
              {verifyMsg && <div className="text-success mt-1 fw-semibold d-flex align-items-center gap-1" style={{ fontSize: "0.8rem" }}><Check size={12} /> {verifyMsg} — check your inbox</div>}
              {verifyError && <div className="text-danger mt-1 fw-semibold" style={{ fontSize: "0.8rem" }}>{verifyError}</div>}
              {!profile?.emailVerified && !verifyMsg && (
                <div className="mt-1 fw-semibold" style={{ fontSize: "0.78rem", color: "#f59e0b" }}>
                  Your email is not verified. Click "Verify" to send a confirmation link.
                </div>
              )}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>Full Name</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>Phone</label>
              <div className="input-group">
                <span className="input-group-text fw-bold" style={{ fontSize: "0.88rem" }}>+91</span>
                <input className={inputCls} value={form.phone} maxLength={10}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>Date of Birth</label>
              <input type="date" className={inputCls} value={form.dateOfBirth} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>Gender</label>
              <select className={inputCls} value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
              </select>
            </div>
          </div>
          {error && <div className="alert alert-danger mt-3 py-2 fw-semibold" style={{ fontSize: "0.88rem" }}>{error}</div>}
          {success && <div className="alert alert-success mt-3 py-2 fw-semibold" style={{ fontSize: "0.88rem" }}>{success}</div>}
          <div className="mt-4 d-flex align-items-center justify-content-between">
            <button type="submit" disabled={saving} className="btn fw-bold text-white px-4"
              style={{ background: "var(--prime-gradient)", border: "none", borderRadius: 10 }}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving...</> : "Save Changes"}
            </button>
            <button
              type="button"
              className="btn fw-bold d-flex align-items-center gap-2"
              style={{ border: "1.5px solid #e0e0e0", borderRadius: 10, color: "#666", background: "transparent", fontSize: "0.85rem" }}
              onClick={() => { logout(); navigate("/auth"); }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
          {saving && <PrimeLoader isLoading={saving} message="Saving profile..." />}
        </form>
      </div>
      <ImageCropperModal
        isOpen={cropperOpen}
        imageFile={rawFile}
        onApply={(cropped) => {
          setAvatarFile(cropped);
          setAvatarPreview(URL.createObjectURL(cropped));
          setCropperOpen(false);
          setRawFile(null);
        }}
        onCancel={() => { setCropperOpen(false); setRawFile(null); }}
      />
    </SubPageWrapper>
  );
};

// ─── Password Sub-page ───────────────────────────────────────────────────────
const PasswordPage: React.FC = () => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const newPwd = form.newPassword;
  const allPass = pwdRules.every((r) => r.test(newPwd));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!allPass) return setError("New password doesn't meet all requirements");
    if (newPwd !== form.confirmPassword) return setError("Passwords don't match");
    setSaving(true);
    try {
      await changePassword(form.currentPassword, newPwd);
      setSuccess("Password changed successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) { setError(err?.message || "Failed to change password"); }
    finally { setSaving(false); }
  };

  return (
    <SubPageWrapper title="Password & Security" subtitle="Keep your account secure with a strong password">
      <div className="form-panel mx-auto" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>Current Password</label>
            <div className="input-group">
              <input type={showCurrent ? "text" : "password"} className={inputCls} value={form.currentPassword}
                onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))} required />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCurrent((v) => !v)}>
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>New Password</label>
            <div className="input-group">
              <input type={showNew ? "text" : "password"} className={inputCls} value={form.newPassword}
                onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))} required />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowNew((v) => !v)}>
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {newPwd.length > 0 && (
              <div className="mt-2 row g-1">
                {pwdRules.map((r) => { const ok = r.test(newPwd); return (
                  <div key={r.id} className="col-6 d-flex align-items-center gap-1"
                    style={{ fontSize: "0.76rem", color: ok ? "#10b981" : "#bbb", fontWeight: ok ? 700 : 500 }}>
                    {ok ? <Check size={11} /> : <X size={11} />} {r.text}
                  </div>
                ); })}
              </div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>Confirm New Password</label>
            <input type="password" className={inputCls} value={form.confirmPassword}
              onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} required />
            {form.confirmPassword && form.confirmPassword !== newPwd &&
              <div className="text-danger mt-1 fw-semibold" style={{ fontSize: "0.8rem" }}>Passwords don't match</div>}
          </div>
          {error && <div className="alert alert-danger py-2 fw-semibold" style={{ fontSize: "0.88rem" }}>{error}</div>}
          {success && <div className="alert alert-success py-2 fw-semibold" style={{ fontSize: "0.88rem" }}>{success}</div>}
          <button type="submit" disabled={saving} className="btn fw-bold text-white px-4"
            style={{ background: "var(--prime-gradient)", border: "none", borderRadius: 10 }}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Updating...</> : "Update Password"}
          </button>
          {saving && <PrimeLoader isLoading={saving} message="Updating password..." />}
        </form>
      </div>
    </SubPageWrapper>
  );
};

// ─── Addresses Sub-page ──────────────────────────────────────────────────────
interface AddressFormData {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const emptyAddr: AddressFormData = { line1: "", line2: "", city: "", state: "", zip: "", country: "India" };

// 4.1 — Address field validation helpers
const validateLine1 = (v: string) => !v.trim() ? "Address is required" : v.trim().length < 5 ? "Address must be at least 5 characters" : "";
const validateCity = (v: string) => !v.trim() ? "City is required" : /[^a-zA-Z\s]/.test(v) ? "City must contain only letters" : "";
const validateState = (v: string) => !v.trim() ? "State is required" : /[^a-zA-Z\s]/.test(v) ? "State must contain only letters" : "";
const validateZip = (v: string) => !/^\d{6}$/.test(v) ? "Pincode must be exactly 6 digits" : "";
const validateCountry = (v: string) => !v.trim() ? "Country is required" : "";

// 4.3 — AddressModal
interface AddressModalProps {
  mode: "add" | "edit";
  initial?: Partial<AddressFormData>;
  onSave: (data: AddressFormData) => Promise<void>;
  onClose: () => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ mode, initial, onSave, onClose }) => {
  const [form, setForm] = useState<AddressFormData>({ ...emptyAddr, ...initial });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const errors = {
    line1: validateLine1(form.line1),
    city: validateCity(form.city),
    state: validateState(form.state),
    zip: validateZip(form.zip),
    country: validateCountry(form.country),
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const blur = (field: string) => () => setTouched((t) => ({ ...t, [field]: true }));
  const set = (k: keyof AddressFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ line1: true, city: true, state: true, zip: true, country: true });
    if (hasErrors) return;
    setSaving(true);
    setApiError("");
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setApiError(err?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 1050, background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-4 p-4 position-relative"
        style={{ width: "100%", maxWidth: 480, margin: "0 16px", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h5 className="fw-black mb-0" style={{ letterSpacing: "-0.3px" }}>
            {mode === "add" ? "Add New Address" : "Edit Address"}
          </h5>
          <button
            type="button"
            className="btn p-1 border-0 d-flex align-items-center justify-content-center rounded-circle"
            style={{ background: "#f5f5f5", width: 32, height: 32 }}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Line 1 */}
            <div className="col-12">
              <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>Address Line 1 *</label>
              <input
                className={`${inputCls}${touched.line1 && errors.line1 ? " is-invalid" : ""}`}
                placeholder="Street address, building name"
                value={form.line1}
                onChange={set("line1")}
                onBlur={blur("line1")}
              />
              {touched.line1 && errors.line1 && <div className="invalid-feedback">{errors.line1}</div>}
            </div>
            {/* Line 2 */}
            <div className="col-12">
              <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>Address Line 2</label>
              <input className={inputCls} placeholder="Apartment, suite, floor (optional)" value={form.line2} onChange={set("line2")} />
            </div>
            {/* City */}
            <div className="col-6">
              <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>City *</label>
              <input
                className={`${inputCls}${touched.city && errors.city ? " is-invalid" : ""}`}
                placeholder="City"
                value={form.city}
                onChange={set("city")}
                onBlur={blur("city")}
              />
              {touched.city && errors.city && <div className="invalid-feedback">{errors.city}</div>}
            </div>
            {/* State */}
            <div className="col-6">
              <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>State *</label>
              <input
                className={`${inputCls}${touched.state && errors.state ? " is-invalid" : ""}`}
                placeholder="State"
                value={form.state}
                onChange={set("state")}
                onBlur={blur("state")}
              />
              {touched.state && errors.state && <div className="invalid-feedback">{errors.state}</div>}
            </div>
            {/* Zip */}
            <div className="col-6">
              <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>Pincode *</label>
              <input
                className={`${inputCls}${touched.zip && errors.zip ? " is-invalid" : ""}`}
                placeholder="6-digit pincode"
                value={form.zip}
                onChange={set("zip")}
                onBlur={blur("zip")}
                maxLength={6}
              />
              {touched.zip && errors.zip && <div className="invalid-feedback">{errors.zip}</div>}
            </div>
            {/* Country */}
            <div className="col-6">
              <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>Country *</label>
              <input
                className={`${inputCls}${touched.country && errors.country ? " is-invalid" : ""}`}
                placeholder="Country"
                value={form.country}
                onChange={set("country")}
                onBlur={blur("country")}
              />
              {touched.country && errors.country && <div className="invalid-feedback">{errors.country}</div>}
            </div>
          </div>

          {apiError && <div className="alert alert-danger mt-3 py-2 fw-semibold" style={{ fontSize: "0.85rem" }}>{apiError}</div>}

          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn fw-bold text-white px-4"
              style={{ background: "var(--prime-gradient)", border: "none", borderRadius: 10 }}
            >
              {saving ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving...</> : "Save Address"}
            </button>
            <button
              type="button"
              className="btn fw-bold px-4"
              style={{ border: "1.5px solid #ddd", borderRadius: 10 }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
          {saving && <PrimeLoader isLoading={saving} message="Saving address..." />}
        </form>
      </motion.div>
    </div>
  );
};

// 4.4 — AddressesPage using AddressModal
const AddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalInitial, setModalInitial] = useState<Partial<AddressFormData> | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { getAddresses().then(setAddresses).finally(() => setLoading(false)); }, []);

  const handleAdd = async (d: AddressFormData) => {
    const a = await addAddress(d);
    setAddresses((p) => [a, ...p]);
    setModalOpen(false);
  };

  const handleEdit = async (d: AddressFormData) => {
    if (!editingId) return;
    const a = await updateAddress(editingId, d);
    setAddresses((p) => p.map((x) => x._id === editingId ? a : x));
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => { await deleteAddress(id); setAddresses((p) => p.filter((a) => a._id !== id)); };

  if (loading) return <PrimeLoader isLoading />;
  return (
    <SubPageWrapper title="Saved Addresses" subtitle="Manage your delivery addresses">
      <div className="mx-auto" style={{ maxWidth: 560 }}>
        <button
          className="btn fw-bold d-flex align-items-center gap-2 mb-4"
          style={{ background: "var(--prime-orange)", color: "#fff", border: "none", borderRadius: 10 }}
          onClick={() => { setModalOpen(true); setModalMode("add"); setModalInitial(undefined); }}
        >
          <Plus size={16} /> Add New Address
        </button>
        {addresses.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <MapPin size={40} style={{ color: "#ddd", marginBottom: 12 }} />
            <div className="fw-bold">No saved addresses yet</div>
            <div style={{ fontSize: "0.85rem" }}>Add one to speed up checkout</div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {addresses.map((addr) => (
              <div key={addr._id} className="p-3 rounded-3 d-flex justify-content-between align-items-start"
                style={{ background: "#fff", border: "1px solid #f0f0f2", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
                  <div className="fw-bold">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</div>
                  <div className="text-muted">{addr.city}, {addr.state} – {addr.zip}</div>
                  <div className="text-muted">{addr.country}</div>
                </div>
                <div className="d-flex gap-1 flex-shrink-0 ms-3">
                  <button
                    className="btn btn-sm p-2 rounded-2"
                    style={{ color: "var(--prime-orange)", background: "rgba(255,107,43,0.08)" }}
                    onClick={() => { setModalOpen(true); setModalMode("edit"); setModalInitial(addr); setEditingId(addr._id); }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button className="btn btn-sm p-2 rounded-2" style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)" }}
                    onClick={() => handleDelete(addr._id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modalOpen && (
        <AddressModal
          mode={modalMode}
          initial={modalInitial}
          onSave={modalMode === "add" ? handleAdd : handleEdit}
          onClose={() => setModalOpen(false)}
        />
      )}
    </SubPageWrapper>
  );
};

// ─── Support Sub-page ────────────────────────────────────────────────────────
const SupportPage: React.FC = () => {
  const { supportEmail, supportPhone } = useSettings();
  return (
    <SubPageWrapper title="Help & Support" subtitle="We're here for you, anytime">
      <div className="row g-3 mx-auto" style={{ maxWidth: 560 }}>
        {[
          { icon: Mail, label: "Email Support", value: supportEmail || "support@primehive.com", hint: "We reply within 24 hours", color: "#3b82f6" },
          { icon: Phone, label: "Phone Support", value: supportPhone || "+91 1800 123 4567", hint: "Mon–Sat, 9am–6pm IST", color: "#10b981" },
        ].map(({ icon: Icon, label, value, hint, color }) => (
          <div key={label} className="col-12">
            <div className="p-4 rounded-3 d-flex align-items-center gap-4"
              style={{ background: "#fff", border: "1px solid #f0f0f2", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 52, height: 52, background: `${color}15` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <div className="fw-black" style={{ fontSize: "0.95rem" }}>{label}</div>
                <div className="fw-bold" style={{ color, fontSize: "0.9rem" }}>{value}</div>
                <div className="text-muted" style={{ fontSize: "0.78rem" }}>{hint}</div>
              </div>
            </div>
          </div>
        ))}
        <div className="col-12 mt-2">
          <div className="p-4 rounded-3" style={{ background: "linear-gradient(135deg,rgba(255,140,66,0.08),rgba(255,107,43,0.04))", border: "1px solid rgba(255,107,43,0.15)" }}>
            <div className="fw-black mb-2">Quick Links</div>
            {[["FAQ", "/faq"], ["Shipping Policy", "/shipping-policy"], ["Returns & Refunds", "/returns"]].map(([label, path]) => (
              <a key={path} href={path} className="d-flex align-items-center justify-content-between py-2 text-decoration-none fw-semibold"
                style={{ color: "#333", borderBottom: "1px solid rgba(0,0,0,0.05)", fontSize: "0.9rem" }}>
                {label} <ChevronRight size={16} style={{ color: "#ccc" }} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </SubPageWrapper>
  );
};

// ─── PolicyModal ─────────────────────────────────────────────────────────────
interface PolicyModalProps {
  action: "deactivate" | "delete";
  onClose: () => void;
  onConfirmed: () => void;
}

const POLICY_TEXT = {
  deactivate: "Your account will go dormant immediately. You can log back in within 30 days to reactivate it. After 30 days, your account and all associated data will be permanently deleted.",
  delete: "You are requesting permanent deletion of your account. A 30-day grace period begins now — you may log back in within 30 days to cancel this request. After 30 days, all your account data will be permanently and irrecoverably wiped.",
};

const PolicyModal: React.FC<PolicyModalProps> = ({ action, onClose, onConfirmed }) => {
  const [step, setStep] = useState<"policy" | "confirm">("policy");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const title = action === "deactivate" ? "Deactivate Account" : "Delete Account";
  const iconColor = action === "deactivate" ? "#f59e0b" : "#ef4444";
  const confirmLabel = action === "deactivate" ? "Deactivate My Account" : "Permanently Delete Account";

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (action === "deactivate") {
        await deactivateAccount(password);
      } else {
        await deleteAccount(password);
      }
      onConfirmed();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("Incorrect password. Please try again.");
      } else {
        setError(err?.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 1050, background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-4 p-4 position-relative"
        style={{ width: "100%", maxWidth: 480, margin: "0 16px", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle size={20} style={{ color: iconColor }} />
            <h5 className="fw-black mb-0" style={{ letterSpacing: "-0.3px" }}>{title}</h5>
          </div>
          <button
            type="button"
            className="btn p-1 border-0 d-flex align-items-center justify-content-center rounded-circle"
            style={{ background: "#f5f5f5", width: 32, height: 32 }}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {step === "policy" ? (
          <>
            <p className="fw-semibold mb-3" style={{ fontSize: "0.9rem", color: "#444" }}>
              {POLICY_TEXT[action]}
            </p>
            <ul className="mb-3" style={{ fontSize: "0.88rem", color: "#555", paddingLeft: "1.2rem" }}>
              <li>Order history and invoices</li>
              <li>Saved delivery addresses</li>
              <li>Profile data (name, phone, photo)</li>
              <li>Wishlist and saved items</li>
              <li>All account preferences</li>
            </ul>
            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="policyCheckbox"
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
              />
              <label className="form-check-label fw-semibold" htmlFor="policyCheckbox" style={{ fontSize: "0.88rem" }}>
                I have read and understood the above. I want to proceed.
              </label>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                disabled={!policyAccepted}
                className="btn fw-bold text-white px-4"
                style={{ background: iconColor, border: "none", borderRadius: 10, opacity: policyAccepted ? 1 : 0.5 }}
                onClick={() => setStep("confirm")}
              >
                Continue
              </button>
              <button
                type="button"
                className="btn fw-bold px-4"
                style={{ border: "1.5px solid #ddd", borderRadius: 10 }}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleConfirm}>
            <h6 className="fw-black mb-1">Confirm your identity</h6>
            <p className="text-muted mb-3" style={{ fontSize: "0.88rem" }}>Enter your password to confirm this action.</p>
            <div className="input-group mb-2">
              <input
                type={showPwd ? "text" : "password"}
                className={inputCls}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <div className="text-danger fw-semibold mb-3" style={{ fontSize: "0.85rem" }}>{error}</div>}
            <div className="d-flex gap-2 mt-3">
              <button
                type="submit"
                disabled={loading}
                className="btn fw-bold text-white px-4"
                style={{ background: iconColor, border: "none", borderRadius: 10 }}
              >
                {loading ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 14, height: 14, borderWidth: 2 }} />Please wait...</> : confirmLabel}
              </button>
              <button
                type="button"
                className="btn fw-bold px-4"
                style={{ border: "1.5px solid #ddd", borderRadius: 10 }}
                onClick={() => { setStep("policy"); setError(""); setPassword(""); }}
              >
                Back
              </button>
            </div>
            {loading && <PrimeLoader isLoading={loading} message={action === "deactivate" ? "Deactivating account..." : "Deleting account..."} />}
          </form>
        )}
      </motion.div>
    </div>
  );
};

// ─── Privacy & Account Control Sub-page ──────────────────────────────────────
const PrivacyPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [policyAction, setPolicyAction] = useState<"deactivate" | "delete" | null>(null);

  return (
    <SubPageWrapper title="Privacy & Account Control" subtitle="Manage your account status and data">
      <div className="mx-auto" style={{ maxWidth: 560 }}>
        <div className="row g-3">
          {/* Deactivate Card */}
          <div className="col-12 col-sm-6">
            <div className="p-4 rounded-3 h-100 d-flex flex-column"
              style={{ background: "#fff", border: "1px solid #f0f0f2", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 44, height: 44, background: "rgba(245,158,11,0.1)" }}>
                  <PauseCircle size={20} style={{ color: "#f59e0b" }} />
                </div>
                <div className="fw-black" style={{ fontSize: "1rem" }}>Deactivate Account</div>
              </div>
              <p className="text-muted mb-4 flex-grow-1" style={{ fontSize: "0.85rem" }}>
                Temporarily disable your account. Reactivate anytime within 30 days.
              </p>
              <button
                className="btn fw-bold px-4"
                style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1.5px solid rgba(245,158,11,0.25)", borderRadius: 10 }}
                onClick={() => setPolicyAction("deactivate")}
              >
                Deactivate
              </button>
            </div>
          </div>

          {/* Delete Card */}
          <div className="col-12 col-sm-6">
            <div className="p-4 rounded-3 h-100 d-flex flex-column"
              style={{ background: "#fff", border: "1px solid #f0f0f2", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 44, height: 44, background: "rgba(239,68,68,0.1)" }}>
                  <Trash2 size={20} style={{ color: "#ef4444" }} />
                </div>
                <div className="fw-black" style={{ fontSize: "1rem" }}>Delete Account</div>
              </div>
              <p className="text-muted mb-4 flex-grow-1" style={{ fontSize: "0.85rem" }}>
                Permanently delete your account and all data after a 30-day grace period.
              </p>
              <button
                className="btn fw-bold px-4"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1.5px solid rgba(239,68,68,0.2)", borderRadius: 10 }}
                onClick={() => setPolicyAction("delete")}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {policyAction && (
        <PolicyModal
          action={policyAction}
          onClose={() => setPolicyAction(null)}
          onConfirmed={() => { logout(); navigate("/auth"); }}
        />
      )}
    </SubPageWrapper>
  );
};

// ─── Account Hub ─────────────────────────────────────────────────────────────
const CARDS = [
  { id: "profile",   path: "/account/profile",   icon: User,           label: "Account Info",        color: "#FF6B2B", bg: "rgba(255,107,43,0.08)",  subs: ["Edit name & photo", "Update phone & DOB", "Change gender"] },
  { id: "orders",    path: "/orders",             icon: Package,        label: "My Orders",           color: "#3b82f6", bg: "rgba(59,130,246,0.08)",   subs: ["Track orders", "View order history", "Download invoices"] },
  { id: "addresses", path: "/account/addresses",  icon: MapPin,         label: "Addresses",           color: "#10b981", bg: "rgba(16,185,129,0.08)",   subs: ["Add new address", "Edit saved addresses", "Set default address"] },
  { id: "password",  path: "/account/password",   icon: Lock,           label: "Password & Security", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",   subs: ["Change password", "Login activity", "Two-factor auth"] },
  { id: "support",   path: "/account/support",    icon: HeadphonesIcon, label: "Help & Support",      color: "#f59e0b", bg: "rgba(245,158,11,0.08)",   subs: ["Contact us", "FAQ", "Returns & refunds"] },
  { id: "danger",    path: "/account/danger",     icon: Trash2,         label: "Privacy & Account Control", color: "#ef4444", bg: "rgba(239,68,68,0.08)",    subs: ["Deactivate account", "Delete account", "Data & privacy"] },
];

const AccountHub: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => { getProfile().then(setProfile).catch(() => {}); }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      {/* Hero — compact horizontal */}
      <div className="rounded-4 mb-4 px-4 py-3 d-flex align-items-center gap-3 position-relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#1a0a00 0%,#c44a00 55%,#FF6B2B 100%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center flex-shrink-0 position-relative"
          style={{ width: 52, height: 52, background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.35)" }}>
          {profile?.profilePicture
            ? <img src={profile.profilePicture} alt="avatar" className="w-100 h-100 object-fit-cover" />
            : <User size={22} color="rgba(255,255,255,0.85)" />}
        </div>
        <div className="position-relative">
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 2 }}>Welcome</div>
          <div className="fw-black text-white" style={{ fontSize: "1.05rem", letterSpacing: "-0.3px" }}>{user?.name || "Customer"}</div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.65)" }}>{user?.email}</div>
        </div>
      </div>

      {/* Cards */}
      <div className="row g-3 mb-3 justify-content-center">
        {CARDS.map(({ id, path, icon: Icon, label, color, bg, subs }, i) => (
          <div key={id} className="col-12 col-sm-6" style={{ maxWidth: 360 }}>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.18 }}
              onClick={() => navigate(path)} style={{ cursor: "pointer" }}>
              <div className="p-3 rounded-4"
                style={{ background: "#fff", border: "1px solid #f0f0f2", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; el.style.borderColor = color + "50"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ""; el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; el.style.borderColor = "#f0f0f2"; }}>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 40, height: 40, background: bg }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div className="fw-black" style={{ fontSize: "0.95rem", color: "#1a1a1a" }}>{label}</div>
                  <ChevronRight size={15} className="ms-auto flex-shrink-0" style={{ color: "#ccc" }} />
                </div>
                <div className="d-flex flex-column gap-1" style={{ paddingLeft: "52px" }}>
                  {subs.map((s) => (
                    <div key={s} className="d-flex align-items-center gap-1" style={{ fontSize: "0.76rem", color: "#999", fontWeight: 500 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: color, opacity: 0.5, flexShrink: 0 }} />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
const AccountPage: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "user")) navigate("/auth");
  }, [isAuthenticated, user, loading, navigate]);

  if (loading || !isAuthenticated) return <PrimeLoader isLoading />;

  return (
    <div className="container py-4" style={{ maxWidth: 760 }}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route index element={<AccountHub />} />
          <Route path="profile"   element={<ProfilePage />} />
          <Route path="password"  element={<PasswordPage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="support"   element={<SupportPage />} />
          <Route path="danger"    element={<PrivacyPage />} />
          <Route path="*"         element={<Navigate to="/account" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default AccountPage;
