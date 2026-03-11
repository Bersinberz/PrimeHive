import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSettings, updateSettings, changePassword } from '../../services/Admin/settingsService';
import PrimeLoader from '../../components/PrimeLoader';
import ToastNotification from '../../components/Admin/ToastNotification';

import SettingsHeader from '../../components/Admin/Settings/SettingsHeader';
import SettingsNav, { type SettingsSection } from '../../components/Admin/Settings/SettingsNav';
import GeneralSettings from '../../components/Admin/Settings/GeneralSettings';
import ShippingSettings from '../../components/Admin/Settings/ShippingSettings';
import SecuritySettings from '../../components/Admin/Settings/SecuritySettings';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const [form, setForm] = useState({
    storeName: '',
    supportEmail: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    orderIdPrefix: 'ORD-',
    standardShippingRate: 50,
    freeShippingThreshold: 999,
    taxRate: 18,
    taxInclusive: true,
  });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSettings();
        setForm({
          storeName: data.storeName || '',
          supportEmail: data.supportEmail || '',
          currency: data.currency || 'INR',
          timezone: data.timezone || 'Asia/Kolkata',
          orderIdPrefix: data.orderIdPrefix || 'ORD-',
          standardShippingRate: data.standardShippingRate ?? 50,
          freeShippingThreshold: data.freeShippingThreshold ?? 999,
          taxRate: data.taxRate ?? 18,
          taxInclusive: data.taxInclusive ?? true,
        });
      } catch {
        setToast({ type: 'error', title: 'Load Failed', message: 'Could not load store settings.' });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: e.target.checked }));
    } else if (type === 'number') {
      setForm(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(form);
      setToast({ type: 'success', title: 'Saved', message: 'Store settings updated successfully!' });
    } catch (err: any) {
      setToast({ type: 'error', title: 'Save Failed', message: err?.message || 'Could not save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setToast({ type: 'success', title: 'Updated', message: 'Password changed successfully!' });
    } catch (err: any) {
      setToast({ type: 'error', title: 'Failed', message: err?.message || 'Could not change password.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ maxWidth: '1400px', minHeight: '80vh', margin: '0 auto', position: 'relative', paddingBottom: '40px' }}
    >
      <PrimeLoader isLoading={isLoading || isSaving} />
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <SettingsHeader isSaving={isSaving} onSave={handleSave} />

      <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
        <SettingsNav activeSection={activeSection} onSectionChange={setActiveSection} />

        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: '20px',
          border: '1px solid #f0f0f2',
          padding: '40px',
          minHeight: '500px',
        }}>
          <AnimatePresence mode="wait">
            {activeSection === 'general' && (
              <GeneralSettings form={form} onInputChange={handleInputChange} />
            )}
            {activeSection === 'shipping' && (
              <ShippingSettings form={form} onInputChange={handleInputChange} />
            )}
            {activeSection === 'security' && (
              <SecuritySettings isSaving={isSaving} onChangePassword={handleChangePassword} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;