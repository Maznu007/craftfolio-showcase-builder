
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Admin = () => {
  // Simply redirect to the admin dashboard
  return <Navigate to="/admin/dashboard" replace />;
};

export default Admin;
