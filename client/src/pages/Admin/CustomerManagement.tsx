import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  getCustomers,
  updateCustomerStatus,
  deleteCustomer,
  type Customer,
} from '../../services/admin/customerService';
import PrimeLoader from '../../components/PrimeLoader';
import ToastNotification from '../../components/Admin/ToastNotification';

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
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const [form, setForm] = useState<{ name: string; email: string; phone: string; dateOfBirth: string; gender: string; profilePicture: File | null; existingProfilePicture?: string }>({ name: '', email: '', phone: '', dateOfBirth: '', gender: '', profilePicture: null });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch {
      setToast({ type: 'error', title: 'Load Failed', message: 'Could not load customers.' });
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
      const label = status === 'active' ? 'Activated' : status === 'inactive' ? 'Deactivated' : 'Banned';
      setToast({ type: 'success', title: label, message: `Customer status updated to ${status}.` });
    } catch (err: any) {
      setToast({ type: 'error', title: 'Failed', message: err?.message || 'Could not update status.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    setIsSaving(true);
    try {
      await deleteCustomer(customerId);
      setCustomers(prev => prev.filter(c => c._id !== customerId));
      if (selectedCustomer?._id === customerId) {
        setView('list');
        setSelectedCustomer(null);
      }
      setToast({ type: 'success', title: 'Deleted', message: 'Customer removed permanently.' });
    } catch (err: any) {
      setToast({ type: 'error', title: 'Failed', message: err?.message || 'Could not delete customer.' });
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
        if (form.profilePicture) formData.append('profilePicture', form.profilePicture);
        
        const updated = await updateCustomer(selectedCustomer._id, formData);
        setCustomers(prev => prev.map(c => c._id === updated._id ? updated : c));
        setSelectedCustomer(updated);
        setIsEditModalOpen(false);
        setToast({ type: 'success', title: 'Updated', message: 'Customer details updated successfully.' });
      } catch (err: any) {
        setToast({ type: 'error', title: 'Failed', message: err?.response?.data?.message || err?.message || 'Could not update customer.' });
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
        position: 'relative', paddingBottom: '40px', display: 'flex', flexDirection: 'column'
      }}
    >
      <PrimeLoader isLoading={isLoading || isSaving} />
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

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
                onEdit={() => {
                  setForm({ 
                    name: selectedCustomer.name, 
                    email: selectedCustomer.email, 
                    phone: selectedCustomer.phone, 
                    dateOfBirth: selectedCustomer.dateOfBirth ? new Date(selectedCustomer.dateOfBirth).toISOString().split('T')[0] : '',
                    gender: selectedCustomer.gender || '',
                    profilePicture: null,
                    existingProfilePicture: selectedCustomer.profilePicture
                  });
                  setIsEditModalOpen(true);
                }}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* ── EDIT CUSTOMER MODAL ── */}
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