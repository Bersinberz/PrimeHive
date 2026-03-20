import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout: React.FC = () => {
  return (
    <div className="d-flex vh-100" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>

      <Sidebar />

      <div className="flex-grow-1 overflow-auto p-4 p-xl-5" style={{ height: '100vh' }}>

        <Outlet />

      </div>
    </div>
  );
};

export default AdminLayout;