import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
    getStaff,
    addStaff,
    updateStaffStatus,
    deleteStaff,
    hardDeleteStaff,
    revokeStaffDeletion,
    type Staff,
} from '../../services/admin/staffService';
import { useToast } from '../../context/ToastContext';
import PrimeLoader from '../../components/PrimeLoader';

import StaffHeader from '../../components/Admin/Staff/StaffHeader';
import StaffList from '../../components/Admin/Staff/StaffList';
import StaffForm from '../../components/Admin/Staff/StaffForm';
import StaffProfile from '../../components/Admin/Staff/StaffProfile';

type StaffStatus = 'active' | 'inactive';

const StaffManagement: React.FC = () => {
    const [view, setView] = useState<'list' | 'profile'>('list');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [form, setForm] = useState<{ 
        name: string; 
        email: string; 
        phone: string; 
        password?: string;
        newPassword?: string;
        profilePicture: File | null; 
        existingProfilePicture?: string;
        dateOfBirth: string;
        gender: string;
        permissions?: any;
    }>({ 
        name: '', 
        email: '', 
        phone: '', 
        password: '',
        newPassword: '',
        profilePicture: null,
        dateOfBirth: '',
        gender: '',
        permissions: undefined,
    });

    const { showToast } = useToast();

    useEffect(() => { loadStaff(); }, []);

    const loadStaff = async () => {
        try {
            const data = await getStaff();
            setStaffList(data);
        } catch {
            showToast({ type: 'error', title: 'Couldn\'t load staff', message: 'Something went wrong. Please refresh and try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const newStaff = await addStaff({
                name: form.name,
                email: form.email,
                phone: form.phone,
                dateOfBirth: form.dateOfBirth || undefined,
                gender: form.gender || undefined,
                permissions: form.permissions || undefined,
            });
            setStaffList(prev => [newStaff, ...prev]);
            setForm({ name: '', email: '', phone: '', password: '', profilePicture: null, dateOfBirth: '', gender: '' });
            setIsAddModalOpen(false);
            showToast({ type: 'success', title: 'Staff member added', message: `${newStaff.name} now has access to the admin panel.` });
        } catch (err: any) {
            showToast({ type: 'error', title: 'Couldn\'t add staff', message: err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        import('../../services/admin/staffService').then(async ({ updateStaff }) => {
            if (!selectedStaff) return;
            setIsSaving(true);
            try {
                const formData = new FormData();
                formData.append('name', form.name);
                formData.append('email', form.email);
                formData.append('phone', form.phone);
                if (form.dateOfBirth) formData.append('dateOfBirth', form.dateOfBirth);
                if (form.gender) formData.append('gender', form.gender);
                if (form.newPassword) formData.append('password', form.newPassword);
                if (form.permissions) formData.append('permissions', JSON.stringify(form.permissions));
                if (form.profilePicture) {
                    formData.append('profilePicture', form.profilePicture);
                }

                const updated = await updateStaff(selectedStaff._id, formData);
                setStaffList(prev => prev.map(s => s._id === updated._id ? updated : s));
                setSelectedStaff(updated);
                setIsEditModalOpen(false);
                showToast({ type: 'success', title: 'Changes saved', message: 'Staff profile has been updated.' });
            } catch (err: any) {
                showToast({ type: 'error', title: 'Couldn\'t save changes', message: err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.' });
            } finally {
                setIsSaving(false);
            }
        });
    };

    const handleStatusChange = async (id: string, status: StaffStatus) => {
        setIsSaving(true);
        try {
            const updated = await updateStaffStatus(id, status);
            setStaffList(prev => prev.map(s => s._id === id ? updated : s));
            if (selectedStaff?._id === id) setSelectedStaff(updated);
            const label = status === 'active' ? 'Account activated' : 'Account deactivated';
            showToast({ type: 'success', title: label, message: `This staff member's access is now ${status}.` });
        } catch (err: any) {
            showToast({ type: 'error', title: 'Couldn\'t update status', message: err?.message || 'Something went wrong. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsSaving(true);
        try {
            await deleteStaff(id);
            const now = new Date().toISOString();
            setStaffList(prev => prev.map(s => s._id === id ? { ...s, status: 'deleted' as const, deletedAt: now } : s));
            if (selectedStaff?._id === id) {
                setSelectedStaff(prev => prev ? { ...prev, status: 'deleted' as const, deletedAt: now } : null);
            }
            showToast({ type: 'success', title: 'Staff member removed', message: 'Their account has been scheduled for deletion in 30 days.' });
        } catch (err: any) {
            showToast({ type: 'error', title: 'Couldn\'t delete', message: err?.message || 'Something went wrong. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleHardDelete = async (id: string) => {
        setIsSaving(true);
        try {
            await hardDeleteStaff(id);
            setStaffList(prev => prev.filter(s => s._id !== id));
            setView('list');
            setSelectedStaff(null);
            showToast({ type: 'success', title: 'Permanently deleted', message: 'The staff account has been erased from the system.' });
        } catch (err: any) {
            showToast({ type: 'error', title: 'Couldn\'t delete', message: err?.message || 'Something went wrong. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRevokeDelete = async (id: string) => {
        setIsSaving(true);
        try {
            const restored = await revokeStaffDeletion(id);
            setStaffList(prev => prev.map(s => s._id === id ? restored : s));
            setSelectedStaff(restored);
            showToast({ type: 'success', title: 'Account restored', message: 'The staff account has been reactivated.' });
        } catch (err: any) {
            showToast({ type: 'error', title: 'Couldn\'t restore', message: err?.message || 'Something went wrong. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = staffList.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery)
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

            <AnimatePresence mode="wait">
                {/* ── LIST VIEW ── */}
                {view === 'list' && (
                    <motion.div key="list" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                        <StaffHeader 
                            staffList={staffList} 
                            searchQuery={searchQuery} 
                            setSearchQuery={setSearchQuery} 
                            onAddClick={() => {
                                setSearchQuery('');
                                setForm({ name: '', email: '', phone: '', password: '', profilePicture: null, existingProfilePicture: undefined, dateOfBirth: '', gender: '' });
                                setIsAddModalOpen(true);
                            }} 
                        />
                        <StaffList 
                            staffList={staffList} 
                            filteredStaff={filtered} 
                            searchQuery={searchQuery} 
                            isLoading={isLoading} 
                            onViewProfile={(s) => { setSelectedStaff(s); setView('profile'); }} 
                        />
                    </motion.div>
                )}

                {/* ── PROFILE VIEW ── */}
                {view === 'profile' && selectedStaff && (
                    <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                        <StaffProfile 
                            staff={selectedStaff} 
                            isSaving={isSaving} 
                            onBack={() => setView('list')} 
                            onEdit={() => {
                                setForm({ 
                                    name: selectedStaff.name, 
                                    email: selectedStaff.email, 
                                    phone: selectedStaff.phone, 
                                    password: '',
                                    newPassword: '',
                                    profilePicture: null, 
                                    existingProfilePicture: selectedStaff.profilePicture,
                                    dateOfBirth: selectedStaff.dateOfBirth ? new Date(selectedStaff.dateOfBirth).toISOString().split('T')[0] : '',
                                    gender: selectedStaff.gender || '',
                                    permissions: (selectedStaff as any).permissions || undefined,
                                });
                                setIsEditModalOpen(true);
                            }}
                            onStatusChange={handleStatusChange} 
                            onDelete={handleDelete}
                            onHardDelete={handleHardDelete}
                            onRevokeDelete={handleRevokeDelete}
                        />                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── ADD STAFF MODAL ── */}
            {isAddModalOpen && (
                <StaffForm 
                    form={form} 
                    setForm={setForm} 
                    isSaving={isSaving} 
                    isEdit={false}
                    onSubmit={handleAddStaff} 
                    onBack={() => setIsAddModalOpen(false)} 
                />
            )}

            {/* ── EDIT STAFF MODAL ── */}
            {isEditModalOpen && selectedStaff && (
                <StaffForm 
                    form={form} 
                    setForm={setForm} 
                    isSaving={isSaving} 
                    isEdit={true}
                    onSubmit={handleEditStaff} 
                    onBack={() => setIsEditModalOpen(false)} 
                />
            )}

        </motion.div>
    );
};

export default StaffManagement;