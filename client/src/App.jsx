import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';
import ServicesPage from './pages/client/ServicesPage';
import GuidesPage from './pages/client/GuidesPage';
import BookingPage from './pages/client/BookingPage';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ManageServices from './pages/admin/ManageServices';
import ManageBookings from './pages/admin/ManageBookings';
import ManageFeedback from './pages/admin/ManageFeedback';
import TrafficLogs from './pages/admin/TrafficLogs';
import ManageGuides from './pages/admin/ManageGuides';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<ServicesPage />} />
          <Route path="guides" element={<GuidesPage />} />
          <Route path="booking" element={<BookingPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="feedback" element={<ManageFeedback />} />
          <Route path="logs" element={<TrafficLogs />} />
          <Route path="guides" element={<ManageGuides />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
