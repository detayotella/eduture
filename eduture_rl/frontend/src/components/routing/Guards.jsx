import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return <div className="loading-state">Loading...</div>;
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export function RequireAdmin({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return <div className="loading-state">Loading...</div>;
    }
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    if (!user.is_admin) {
        return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
    }
    return children;
}
