import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getDashboardStats, type DashboardStats } from '../../services/admin/statsService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import PrimeLoader from '../../components/PrimeLoader';

import SummaryWidgets from '../../components/Admin/Dashboard/SummaryWidgets';
import RevenueChart from '../../components/Admin/Dashboard/RevenueChart';
import OrderStatusChart from '../../components/Admin/Dashboard/OrderStatusChart';
import RecentTransactions from '../../components/Admin/Dashboard/RecentTransactions';
import LowStockAlerts from '../../components/Admin/Dashboard/LowStockAlerts';
import DashboardErrorState from '../../components/Admin/Dashboard/ErrorState';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch {
      showToast({ type: 'error', title: 'Something went wrong', message: 'We couldn\'t load your dashboard. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <motion.div
      style={{ maxWidth: '1400px', minHeight: '80vh', margin: '0 auto', position: 'relative', display: 'flex', flexDirection: 'column' }}
    >
      <PrimeLoader isLoading={isLoading} />

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Page Header */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>
              Overview
            </p>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px', margin: '0 0 6px' }}>
              Dashboard
            </h2>
            <p style={{ color: '#999', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
              {isStaff ? "Here's how your products are performing." : "Here's what's happening with your store today."}
            </p>
          </div>

          {stats ? (
            <>
              <SummaryWidgets stats={stats} isStaff={isStaff} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', marginBottom: '20px' }}>
                <RevenueChart data={stats.revenueByDay} />
                <OrderStatusChart data={stats.ordersByStatus} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', paddingBottom: '40px' }}>
                <RecentTransactions orders={stats.recentOrders} />
                <LowStockAlerts products={stats.lowStockProducts} />
              </div>
            </>
          ) : (
            <div style={{ paddingTop: '16px' }}>
              <DashboardErrorState onRetry={fetchStats} />
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;
