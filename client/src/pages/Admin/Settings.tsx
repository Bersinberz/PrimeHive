import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSettings, updateSettings, changePassword } from '../../services/admin/settingsService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';

import SettingsHeader from '../../components/Admin/Settings/SettingsHeader';
import SettingsNav, { type SettingsSection } from '../../components/Admin/Settings/SettingsNav';
import GeneralSettings from '../../components/Admin/Settings/GeneralSettings';
import ShippingSettings from '../../components/Admin/Settings/ShippingSettings';
import SecuritySettings from '../../components/Admin/Settings/SecuritySettings';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    storeName: '',
    supportEmail: '',
    supportPhone: '',
    storeLocation: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    orderIdPrefix: 'ORD-',
    standardShippingRate: 50,
    freeShippingThreshold: 999,
    taxRate: 18,
    taxInclusive: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSettings();
        setForm({
          storeName: data.storeName || '',
          supportEmail: data.supportEmail || '',
          supportPhone: data.supportPhone || '',
          storeLocation: data.storeLocation || '',
          currency: data.currency || 'INR',
          timezone: data.timezone || 'Asia/Kolkata',
          orderIdPrefix: data.orderIdPrefix || 'ORD-',
          standardShippingRate: data.standardShippingRate ?? 50,
          freeShippingThreshold: data.freeShippingThreshold ?? 999,
          taxRate: data.taxRate ?? 18,
          taxInclusive: data.taxInclusive ?? true,
        });
      } catch {
        showToast({ type: 'error', title: 'Load Failed', message: 'Could not load store settings.' });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const validateField = (name: string, value: any) => {
    let error: string | undefined = undefined;
    switch (name) {
      case 'storeName':
        if (!value || String(value).trim().length < 2) error = 'Store name must be at least 2 characters.';
        break;
      case 'supportEmail':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(String(value))) error = 'Please enter a valid email address.';
        break;
      case 'supportPhone':
        if (value && String(value).trim().length < 5) error = 'Please enter a valid phone number.';
        break;
      case 'storeLocation':
        if (value && String(value).trim().length < 5) error = 'Please enter a valid location.';
        break;
      case 'taxRate':
        if (value === '' || isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100) error = 'Tax rate must be between 0 and 100.';
        break;
      case 'standardShippingRate':
        if (value === '' || isNaN(Number(value)) || Number(value) < 0) error = 'Shipping rate must be ≥ 0.';
        break;
      case 'freeShippingThreshold':
        if (value === '' || isNaN(Number(value)) || Number(value) < 0) error = 'Threshold must be ≥ 0.';
        break;
    }
    return error;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFormErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors[name] = error;
      else delete newErrors[name];
      return newErrors;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;
    if (type === 'checkbox') {
      newValue = e.target.checked;
    } else if (type === 'number') {
      newValue = value === '' ? '' : Number(value);
    }

    setForm(prev => ({ ...prev, [name]: newValue }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const fields = ['storeName', 'supportEmail', 'supportPhone', 'storeLocation', 'taxRate', 'standardShippingRate', 'freeShippingThreshold'];
    fields.forEach(f => {
      const err = validateField(f, (form as any)[f]);
      if (err) errors[f] = err;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Please correct the highlighted errors.' });
      return;
    }
    setIsSaving(true);
    try {
      await updateSettings(form);
      showToast({ type: 'success', title: 'Saved', message: 'Store settings updated successfully!' });
    } catch (err: any) {
      if (err?.status === 400 && err?.errors) {
        const backendErrors: Record<string, string> = {};
        err.errors.forEach((e: { field: string; message: string }) => {
          backendErrors[e.field] = e.message;
        });
        setFormErrors(backendErrors);
      }
      showToast({ type: 'error', title: 'Save Failed', message: err?.message || 'Could not save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast({ type: 'success', title: 'Updated', message: 'Password changed successfully!' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed', message: err?.message || 'Could not change password.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        maxWidth: '1400px',
        minHeight: '80vh',
        margin: '0 auto',
        position: 'relative',
        paddingBottom: '40px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <PrimeLoader isLoading={isLoading || isSaving} />

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
              <GeneralSettings form={form} formErrors={formErrors} onInputChange={handleInputChange} onBlur={handleBlur} />
            )}
            {activeSection === 'shipping' && (
              <ShippingSettings form={form} formErrors={formErrors} onInputChange={handleInputChange} onBlur={handleBlur} />
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