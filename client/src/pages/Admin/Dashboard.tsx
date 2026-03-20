import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getDashboardStats, type DashboardStats } from '../../services/admin/statsService';
import ToastNotification from '../../components/Admin/ToastNotification';
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
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error: any) {
      setToast({
        type: 'error',
        title: 'Load Failed',
        message: 'Could not load dashboard data.'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto"
      style={{
        maxWidth: '1400px',
        minHeight: '80vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <PrimeLoader isLoading={isLoading} />

      {!isLoading && (
        <>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-3">
            <div>
              <h2 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Dashboard Overview</h2>
              <p className="text-muted mb-0">Here's what's happening with your store today.</p>
            </div>
          </div>

          {stats ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <SummaryWidgets stats={stats} />
              </motion.div>

              <div className="row g-4 mb-5">
                <motion.div className="col-12 col-lg-8" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <RevenueChart data={stats.revenueByDay} />
                </motion.div>
                <motion.div className="col-12 col-lg-4" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <OrderStatusChart data={stats.ordersByStatus} />
                </motion.div>
              </div>

              <div className="row g-4 pb-5">
                <motion.div className="col-12 col-xl-8" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <RecentTransactions orders={stats.recentOrders} />
                </motion.div>
                <motion.div className="col-12 col-xl-4 d-flex flex-column gap-4" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <LowStockAlerts products={stats.lowStockProducts} />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="py-4">
              <DashboardErrorState onRetry={fetchStats} />
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default AdminDashboard;