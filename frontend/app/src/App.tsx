import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout Components
import DashboardLayout from './components/layouts/DashboardLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import ContactsPage from './pages/contacts/ContactsPage';
import ContactDetails from './pages/contacts/ContactDetails';
import DealsPage from './pages/deals/DealsPage';
import DealDetails from './pages/deals/DealDetails';
import TasksPage from './pages/tasks/TasksPage';
import NotesPage from './pages/notes/NotesPage';
import SettingsPage from './pages/settings/SettingsPage';
import UsersPage from './pages/users/UsersPage';
import UserDetailPage from './pages/users/UserDetailPage';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - accessible when not logged in */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      
      {/* Authentication routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      </Route>

      {/* Protected routes - require authentication */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        
        {/* Contacts */}
        <Route path="/contacts" element={user ? <ContactsPage /> : <Navigate to="/login" />} />
        <Route path="/contacts/:id" element={user ? <ContactDetails /> : <Navigate to="/login" />} />
        
        {/* Deals */}
        <Route path="/deals" element={user ? <DealsPage /> : <Navigate to="/login" />} />
        <Route path="/deals/:id" element={user ? <DealDetails /> : <Navigate to="/login" />} />
        
        {/* Tasks */}
        <Route path="/tasks" element={user ? <TasksPage /> : <Navigate to="/login" />} />
        
        {/* Notes */}
        <Route path="/notes" element={user ? <NotesPage /> : <Navigate to="/login" />} />
        
        {/* Settings */}
        <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
        
        {/* Users - Admin only routes */}
        <Route path="/users" element={user && user.role === 'admin' ? <UsersPage /> : <Navigate to="/dashboard" />} />
        <Route path="/users/:id" element={user ? <UserDetailPage /> : <Navigate to="/login" />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
