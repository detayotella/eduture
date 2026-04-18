import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode }) {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [form, setForm] = useState({ full_name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const isLogin = mode === 'login';
    const estimatedMinutes = isLogin ? 1 : 2;
    const localTimeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
                        <button className="btn btn-soft btn-full" type="button" onClick={() => navigate(isLogin ? '/register' : '/login')}>
                            {isLogin ? 'Need an account?' : 'Already have an account?'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
