import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Edit2, Truck, RefreshCw } from 'lucide-react';
import {
  getDeliveryPartners, addDeliveryPartner, updateDeliveryPartner, deleteDeliveryPartner, hardDeleteDeliveryPartner,
  type DeliveryPartner,
} from '../../services/Admin/deliveryPartnerService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';
import ActionConfirmModal from '../../components/Admin/ActionConfirmModal';

const emptyForm = () => ({ name: '', email: '', phone: '', dateOfBirth: '', gender: '', vehicleType: '', vehicleNumber: '' });

const DeliveryPartnerManagement: React.FC = () => {
  const { showToast } = useToast();
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<DeliveryPartner | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<DeliveryPartner | null>(null);
  const [toHardDelete, setToHardDelete] = useState<DeliveryPartner | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setPartners(await getDeliveryPartners()); }
    catch { showToast({ type: 'error', title: 'Error', message: 'Failed to load delivery partners' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(emptyForm()); setSelected(null); setModal('add'); };
  const openEdit = (p: DeliveryPartner) => {
    setForm({ name: p.name, email: p.email, phone: p.phone.replace(/^\+91\s?/, ''), dateOfBirth: (p as any).dateOfBirth?.slice(0, 10) || '', gender: (p as any).gender || '', vehicleType: p.vehicleType || '', vehicleNumber: p.vehicleNumber || '' });
    setSelected(p); setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone) {
      showToast({ type: 'error', title: 'Validation', message: 'Name, email and phone are required.' });
      return;
    }
    setSaving(true);
    try {
      if (modal === 'add') {
        const created = await addDeliveryPartner(form);
        setPartners(prev => [created, ...prev]);
        showToast({ type: 'success', title: 'Created', message: 'Delivery partner added. Setup email sent.' });
      } else if (selected) {
        const updated = await updateDeliveryPartner(selected._id, form);
        setPartners(prev => prev.map(p => p._id === selected._id ? updated : p));
        showToast({ type: 'success', title: 'Updated', message: 'Delivery partner updated.' });
      }
      setModal(null);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err?.response?.data?.message || 'Failed to save.' });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteDeliveryPartner(toDelete._id);
      setPartners(prev => prev.map(x => x._id === toDelete._id ? { ...x, status: 'deleted' as any } : x));
      showToast({ type: 'success', title: 'Deleted', message: 'Delivery partner deactivated.' });
    } catch { showToast({ type: 'error', title: 'Error', message: 'Failed to delete.' }); }
    finally { setToDelete(null); }
  };

  const handleHardDelete = async () => {
    if (!toHardDelete) return;
    try {
      await hardDeleteDeliveryPartner(toHardDelete._id);
      setPartners(prev => prev.filter(x => x._id !== toHardDelete._id));
      showToast({ type: 'success', title: 'Permanently Deleted', message: 'Delivery partner removed forever.' });
    } catch { showToast({ type: 'error', title: 'Error', message: 'Failed to permanently delete.' }); }
    finally { setToHardDelete(null); }
  };

  const sc = (s: string) => s === 'active'
    ? { color: '#059669', bg: 'rgba(16,185,129,0.1)' }
    : { color: '#dc2626', bg: 'rgba(239,68,68,0.1)' };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ maxWidth: 1200, margin: '0 auto' }}>
      <PrimeLoader isLoading={loading || saving} />
      <ActionConfirmModal
        isOpen={!!toDelete}
        actionType="delete_member"
        itemName={toDelete?.name ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
      <ActionConfirmModal
        isOpen={!!toHardDelete}
        actionType="hard_delete"
        itemName={toHardDelete?.name ?? ''}
        onConfirm={handleHardDelete}
        onCancel={() => setToHardDelete(null)}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>Logistics</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px', margin: '0 0 6px' }}>Delivery Partners</h2>
          <p style={{ color: '#999', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>Manage delivery agents and assign them to orders.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 50, border: '1px solid #e5e7eb', background: '#fff', color: '#666', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
            <RefreshCw size={13} />
          </button>
          <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 50, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            <Plus size={15} /> Add Partner
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f2', overflow: 'hidden' }}>
        {partners.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
            <Truck size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>No delivery partners yet</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
              <thead style={{ background: '#fafafa' }}>
                <tr>
                  {['Name', 'Email', 'Phone', 'Vehicle', 'Status', 'Actions'].map(h => (
                    <th key={h} className="py-3 px-4 border-0" style={{ fontSize: '0.68rem', fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partners.map(p => {
                  const s = sc(p.status);
                  return (
                    <tr key={p._id}>
                      <td className="py-3 px-4 border-light fw-bold">{p.name}</td>
                      <td className="py-3 px-4 border-light" style={{ color: '#666' }}>{p.email}</td>
                      <td className="py-3 px-4 border-light" style={{ color: '#666' }}>{p.phone}</td>
                      <td className="py-3 px-4 border-light" style={{ color: '#888' }}>
                        {p.vehicleType ? `${p.vehicleType}${p.vehicleNumber ? ` · ${p.vehicleNumber}` : ''}` : '—'}
                      </td>
                      <td className="py-3 px-4 border-light">
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: s.color, background: s.bg, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize' }}>{p.status}</span>
                      </td>
                      <td className="py-3 px-4 border-light">
                        <div style={{ display: 'flex', gap: 8 }}>
                          {p.status !== 'deleted' ? (
                            <>
                              <button onClick={() => openEdit(p)} style={{ padding: '6px 14px', borderRadius: 50, border: '1px solid #e5e7eb', background: '#fff', color: '#555', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Edit2 size={12} /> Edit
                              </button>
                              <button onClick={() => setToDelete(p)} style={{ padding: '6px 12px', borderRadius: 50, border: 'none', background: 'rgba(239,68,68,0.08)', color: '#dc2626', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                                <Trash2 size={12} />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => setToHardDelete(p)}
                              style={{ padding: '6px 14px', borderRadius: 50, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#dc2626', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Trash2 size={12} /> Delete Permanently
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 520, padding: 32 }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.3rem', margin: 0 }}>{modal === 'add' ? 'Add Delivery Partner' : 'Edit Partner'}</h3>
                <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Ravi Kumar" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="partner@example.com" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', background: '#f8fafc', borderRight: '1.5px solid #e5e7eb', flexShrink: 0 }}>
                      <span style={{ fontSize: '1rem' }}>🇮🇳</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#555' }}>+91</span>
                    </div>
                    <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="10-digit number" style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: '0.88rem' }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} style={{ ...inputStyle, background: '#fff' }}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Vehicle Type</label>
                  <input type="text" value={form.vehicleType} onChange={e => setForm(p => ({ ...p, vehicleType: e.target.value }))} placeholder="e.g. Bike, Van" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Vehicle Number</label>
                  <input type="text" value={form.vehicleNumber} onChange={e => setForm(p => ({ ...p, vehicleNumber: e.target.value }))} placeholder="e.g. TN01AB1234" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setModal(null)} style={{ padding: '10px 24px', borderRadius: 50, border: '1px solid #e5e7eb', background: '#fff', color: '#666', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ padding: '10px 28px', borderRadius: 50, border: 'none', background: 'var(--prime-gradient)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : modal === 'add' ? 'Create' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DeliveryPartnerManagement;

