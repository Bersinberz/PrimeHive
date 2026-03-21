import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  getCustomers,
  updateCustomerStatus,
  deleteCustomer,
  hardDeleteCustomer,
  revokeCustomerDeletion,
  type Customer,
} from '../../services/admin/customerService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';

import CustomerHeader from '../../components/Admin/Customer/CustomerHeader';
import CustomerList from '../../components/Admin/Customer/CustomerList';
import CustomerProfile from '../../components/Admin/Customer/CustomerProfile';
import CustomerForm from '../../components/Admin/Customer/CustomerForm';

type CustomerStatus = 'active' | 'inactive';

const CustomerManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'profile'>('list');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState<{ name: string; email: string; phone: string; dateOfBirth: string; gender: string; profilePicture: File | null; existingProfilePicture?: string; newPassword?: string }>({ name: '', email: '', phone: '', dateOfBirth: '', gender: '', profilePicture: null, newPassword: '' });

  const { showToast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch {
      showToast({ type: 'error', title: 'Couldn\'t load customers', message: 'Something went wrong. Please refresh and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (customerId: string, status: CustomerStatus) => {
    setIsSaving(true);
    try {
      const updated = await updateCustomerStatus(customerId, status);
      setCustomers(prev => prev.map(c => c._id === customerId ? updated : c));
      if (selectedCustomer?._id === customerId) {
        setSelectedCustomer(updated);
      }
      const label = status === 'active' ? 'Account activated' : 'Account deactivated';
      showToast({ type: 'success', title: label, message: `The customer's account is now ${status}.` });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Couldn\'t update status', message: err?.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    setIsSaving(true);
    try {
      await deleteCustomer(customerId);
      const now = new Date().toISOString();
      setCustomers(prev => prev.map(c => c._id === customerId ? { ...c, status: 'deleted' as const, deletedAt: now } : c));
      if (selectedCustomer?._id === customerId) {
        setSelectedCustomer(prev => prev ? { ...prev, status: 'deleted' as const, deletedAt: now } : null);
      }
      showToast({ type: 'success', title: 'Customer removed', message: 'The customer account has been scheduled for deletion in 30 days.' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Couldn\'t delete', message: err?.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleHardDelete = async (customerId: string) => {
    setIsSaving(true);
    try {
      await hardDeleteCustomer(customerId);
      setCustomers(prev => prev.filter(c => c._id !== customerId));
      setView('list');
      setSelectedCustomer(null);
      showToast({ type: 'success', title: 'Permanently deleted', message: 'The customer account has been erased from the system.' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Couldn\'t delete', message: err?.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeDelete = async (customerId: string) => {
    setIsSaving(true);
    try {
      const restored = await revokeCustomerDeletion(customerId);
      setCustomers(prev => prev.map(c => c._id === customerId ? restored : c));
      setSelectedCustomer(restored);
      showToast({ type: 'success', title: 'Account restored', message: 'The customer account has been reactivated.' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Couldn\'t restore', message: err?.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    import('../../services/admin/customerService').then(async ({ updateCustomer }) => {
      if (!selectedCustomer) return;
      setIsSaving(true);
      try {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('phone', form.phone);
        if (form.dateOfBirth) formData.append('dateOfBirth', form.dateOfBirth);
        if (form.gender) formData.append('gender', form.gender);
        if (form.newPassword) formData.append('password', form.newPassword);
        if (form.profilePicture) formData.append('profilePicture', form.profilePicture);
        
        const updated = await updateCustomer(selectedCustomer._id, formData);
        setCustomers(prev => prev.map(c => c._id === updated._id ? updated : c));
        setSelectedCustomer(updated);
        setIsEditModalOpen(false);
        showToast({ type: 'success', title: 'Changes saved', message: 'Customer details have been updated.' });
      } catch (err: any) {
        showToast({ type: 'error', title: 'Couldn\'t save changes', message: err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.' });
      } finally {
        setIsSaving(false);
      }
    });
  };

  const handleViewProfile = (customer: Customer) => {
    setSelectedCustomer(customer);
    setView('profile');
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const pageVariants: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        maxWidth: '1400px', minHeight: '80vh', margin: '0 auto',
        paddingBottom: '40px', display: 'flex', flexDirection: 'column'
      }}
    >
      <PrimeLoader isLoading={isLoading || isSaving} />

      <CustomerHeader
        view={view}
        customers={customers} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onBackClick={() => setView('list')}
      />

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" variants={pageVariants} initial="initial" animate="animate" exit="exit">

            <CustomerList 
              customers={customers} 
              filteredCustomers={filtered} 
              searchQuery={searchQuery} 
              isLoading={isLoading} 
              onViewProfile={handleViewProfile} 
            />

          </motion.div>
        ) : (
          selectedCustomer && (
            <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <CustomerProfile 
                customer={selectedCustomer} 
                isSaving={isSaving} 
                onStatusChange={handleStatusChange} 
                onDelete={handleDelete}
                onHardDelete={handleHardDelete}
                onRevokeDelete={handleRevokeDelete}
                onEdit={() => {
                  setForm({ 
                    name: selectedCustomer.name, 
                    email: selectedCustomer.email, 
                    phone: selectedCustomer.phone, 
                    dateOfBirth: selectedCustomer.dateOfBirth ? new Date(selectedCustomer.dateOfBirth).toISOString().split('T')[0] : '',
                    gender: selectedCustomer.gender || '',
                    profilePicture: null,
                    existingProfilePicture: selectedCustomer.profilePicture,
                    newPassword: ''
                  });
                  setIsEditModalOpen(true);
                }}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* ── EDIT CUSTOMER MODAL ── rendered outside motion wrapper so overlay covers full viewport ── */}
      {isEditModalOpen && selectedCustomer && (
          <CustomerForm
              form={form}
              setForm={setForm}
              isSaving={isSaving}
              onSubmit={handleEditCustomer}
              onBack={() => setIsEditModalOpen(false)}
          />
      )}
    </motion.div>
  );
};

export default CustomerManagement;