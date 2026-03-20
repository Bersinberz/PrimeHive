import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
    getStaff,
    addStaff,
    updateStaffStatus,
    deleteStaff,
    type Staff,
} from '../../services/admin/staffService';
import PrimeLoader from '../../components/PrimeLoader';
import ToastNotification from '../../components/Admin/ToastNotification';

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
    const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

    const [form, setForm] = useState<{ 
        name: string; 
        email: string; 
        phone: string; 
        password?: string; 
        profilePicture: File | null; 
        existingProfilePicture?: string;
        dateOfBirth: string;
        gender: string;
    }>({ 
        name: '', 
        email: '', 
        phone: '', 
        password: '', 
        profilePicture: null,
        dateOfBirth: '',
        gender: ''
    });

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => { loadStaff(); }, []);

    const loadStaff = async () => {
        try {
            const data = await getStaff();
            setStaffList(data);
        } catch {
            setToast({ type: 'error', title: 'Load Failed', message: 'Could not load staff members.' });
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
                password: form.password || '',
                dateOfBirth: form.dateOfBirth || undefined,
                gender: form.gender || undefined
            });
            setStaffList(prev => [newStaff, ...prev]);
            setForm({ name: '', email: '', phone: '', password: '', profilePicture: null, dateOfBirth: '', gender: '' });
            setIsAddModalOpen(false);
            setToast({ type: 'success', title: 'Created', message: `${newStaff.name} added as staff.` });
        } catch (err: any) {
            setToast({ type: 'error', title: 'Failed', message: err?.response?.data?.message || err?.message || 'Could not add staff.' });
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
                if (form.profilePicture) {
                    formData.append('profilePicture', form.profilePicture);
                }

                const updated = await updateStaff(selectedStaff._id, formData);
                setStaffList(prev => prev.map(s => s._id === updated._id ? updated : s));
                setSelectedStaff(updated);
                setIsEditModalOpen(false);
                setToast({ type: 'success', title: 'Updated', message: 'Staff details updated.' });
            } catch (err: any) {
                setToast({ type: 'error', title: 'Failed', message: err?.response?.data?.message || err?.message || 'Could not update staff.' });
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
            const label = status === 'active' ? 'Activated' : status === 'inactive' ? 'Deactivated' : 'Banned';
            setToast({ type: 'success', title: label, message: `Staff status updated to ${status}.` });
        } catch (err: any) {
            setToast({ type: 'error', title: 'Failed', message: err?.message || 'Could not update status.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsSaving(true);
        try {
            await deleteStaff(id);
            setStaffList(prev => prev.filter(s => s._id !== id));
            if (selectedStaff?._id === id) { setView('list'); setSelectedStaff(null); }
            setToast({ type: 'success', title: 'Deleted', message: 'Staff member removed.' });
        } catch (err: any) {
            setToast({ type: 'error', title: 'Failed', message: err?.message || 'Could not delete.' });
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
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

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
                                    profilePicture: null, 
                                    existingProfilePicture: selectedStaff.profilePicture,
                                    dateOfBirth: selectedStaff.dateOfBirth ? new Date(selectedStaff.dateOfBirth).toISOString().split('T')[0] : '',
                                    gender: selectedStaff.gender || ''
                                });
                                setIsEditModalOpen(true);
                            }}
                            onStatusChange={handleStatusChange} 
                            onDelete={handleDelete} 
                        />
                    </motion.div>
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