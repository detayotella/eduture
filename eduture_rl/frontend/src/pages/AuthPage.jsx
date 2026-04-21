import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode }) {
    const navigate = useNavigate();
    const { login, register, user, loading } = useAuth();
    const [form, setForm] = useState({ full_name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const isLogin = mode === 'login';
    const estimatedMinutes = isLogin ? 1 : 2;
    const localTimeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const oauthStatus = useMemo(() => new URLSearchParams(window.location.search).get('oauth'), []);
    const oauthReason = useMemo(() => new URLSearchParams(window.location.search).get('reason'), []);

    useEffect(() => {
        if (oauthStatus !== 'error') {
            return;
        }
        const reasonMessages = {
            invalid_state: 'Google sign-in session expired. Please try again.',
            missing_code: 'Google sign-in did not return an authorization code. Please try again.',
            token_exchange_error: 'Unable to reach Google sign-in right now. Please try again shortly.',
            token_exchange_rejected: 'Google rejected the sign-in request. Please retry or use email/password.',
            missing_id_token: 'Google sign-in response was incomplete. Please try again.',
            invalid_id_token: 'Google sign-in token could not be verified. Please try again.',
            invalid_issuer: 'Google sign-in issuer validation failed. Please try again.',
            email_not_verified: 'Your Google account email is not verified. Verify it and try again.',
            missing_email: 'Google did not provide an email address for this account.',
            google_error: 'Google sign-in was cancelled or denied. Please try again.',
        };
        setError(reasonMessages[oauthReason] || 'Google sign-in failed. Please try again.');
    }, [oauthReason, oauthStatus]);

    useEffect(() => {
        if (loading || !user) {
            return;
        }
        if (user.is_admin) {
            navigate('/admin', { replace: true });
            return;
        }
        navigate('/dashboard', { replace: true });
    }, [loading, navigate, user]);

    const continueWithGoogle = () => {
        window.location.href = `${apiBaseUrl}/auth/google/login`;
    };

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            let authData;
            if (isLogin) {
                authData = await login(form.email, form.password);
            } else {
                authData = await register(form.full_name, form.email, form.password);
            }
            if (authData?.is_admin) {
                navigate('/admin');
            } else if (isLogin) {
                navigate('/dashboard');
            } else {
                navigate('/questionnaire');
            }
        } catch (err) {
            const detail = err.response?.data?.detail;
            const structuredMessage = detail?.message;
            const arrayMessage = Array.isArray(detail) ? detail[0]?.msg : null;
            setError(structuredMessage || arrayMessage || err.response?.data?.message || 'Unable to authenticate right now.');
        }
    };

    return (
        <div className="auth-focus-shell">
            <header className="auth-focus-header">
                <div className="auth-focus-brand">EDUTURE 2.0</div>
                <button className="auth-focus-link" type="button" onClick={() => navigate('/')}>Back to home</button>
            </header>

            <main className="auth-focus-main">
                <div className="auth-progress-row">
                    <span>{isLogin ? 'Returning learner access' : 'Account setup'}</span>
                    <span className="auth-clock">~{estimatedMinutes} min • {localTimeLabel}</span>
                </div>
                <form className="auth-focus-card" onSubmit={submit}>
                    <div className="auth-focus-badge">{isLogin ? 'Login' : 'Register'}</div>
                    <h1 className="auth-focus-title">{isLogin ? 'Sign in to continue' : 'Create your account'}</h1>
                    <p className="auth-focus-copy">{isLogin ? 'Continue your adaptive pathway from where you left off.' : 'Set up access and begin the onboarding questionnaire.'}</p>

                    {!isLogin ? (
                        <label className="field">
                            <span>Full name</span>
                            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" />
                        </label>
                    ) : null}
                    <label className="field">
                        <span>Email</span>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" />
                    </label>
                    <label className="field">
                        <span>Password</span>
                        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="SecurePass123!" />
                    </label>

                    {error ? <div className="error-banner">{error}</div> : null}

                    <div className="auth-focus-actions">
                        <button className="btn btn-primary btn-large btn-full" type="submit">{isLogin ? 'Sign in' : 'Create account'}</button>
                        <button className="btn btn-soft btn-full auth-google-btn" type="button" onClick={continueWithGoogle}>
                            <span className="auth-google-icon" aria-hidden="true">
                                <svg className="auth-google-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false" aria-hidden="true">
                                    <path fill="#EA4335" d="M12 5.04c1.69 0 3.22.58 4.42 1.72l3.3-3.3C17.71 1.6 15.07.5 12 .5 7.36.5 3.34 3.14 1.36 7l3.84 2.98C6.15 7.06 8.85 5.04 12 5.04z" />
                                    <path fill="#FBBC05" d="M5.2 9.98 1.36 7A11.44 11.44 0 0 0 .5 11.99c0 1.79.43 3.48 1.2 4.98l4.16-3.22A6.83 6.83 0 0 1 5.2 9.98z" />
                                    <path fill="#34A853" d="M12 23.5c3 0 5.52-.99 7.36-2.68l-3.58-2.77c-.99.67-2.27 1.07-3.78 1.07-3.11 0-5.75-2.1-6.69-4.94l-4.16 3.22C3.1 20.96 7.2 23.5 12 23.5z" />
                                    <path fill="#4285F4" d="M23.5 12c0-.75-.07-1.48-.2-2.18H12v4.13h6.48a5.54 5.54 0 0 1-2.4 3.4l3.58 2.77c2.08-1.92 3.29-4.74 3.29-8.12z" />
                                </svg>
                            </span>
                            <span>Continue with Google</span>
                        </button>
                        <button className="btn btn-soft btn-full" type="button" onClick={() => navigate(isLogin ? '/register' : '/login')}>
                            {isLogin ? 'Need an account?' : 'Already have an account?'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
