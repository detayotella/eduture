import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UnauthorizedPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const attemptedPath = location.state?.from || '/admin';

    return (
        <div className="auth-focus-shell unauthorized-shell">
            <header className="auth-focus-header">
                <div className="auth-focus-brand">EDUTURE 2.0</div>
                <button className="auth-focus-link" type="button" onClick={() => navigate(user ? '/dashboard' : '/login')}>
                    {user ? 'Back to dashboard' : 'Go to login'}
                </button>
            </header>

            <main className="auth-focus-main">
                <section className="auth-focus-card unauthorized-card">
                    <div className="auth-focus-badge">Access Restricted</div>
                    <h1 className="auth-focus-title">You are not authorized to view this page</h1>
                    <p className="auth-focus-copy">
                        The route <strong>{attemptedPath}</strong> is available to admin accounts only.
                    </p>
                    <div className="unauthorized-actions">
                        <button className="btn btn-primary" type="button" onClick={() => navigate('/dashboard')}>
                            Open Learner Dashboard
                        </button>
                        {!user ? (
                            <button className="btn btn-soft" type="button" onClick={() => navigate('/login')}>
                                Sign in
                            </button>
                        ) : null}
                    </div>
                </section>
            </main>
        </div>
    );
}
