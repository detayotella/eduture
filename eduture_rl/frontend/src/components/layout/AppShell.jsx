import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AppShell({ title, subtitle, actions, children }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isSectionActive = (paths) => {
        const pathname = location.pathname;
        return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`) || pathname === `/preview${path}` || pathname.startsWith(`/preview${path}/`));
    };

    const linkClass = (paths) => `shell-nav-link ${isSectionActive(paths) ? 'active' : ''}`;

    return (
        <div className="app-shell">
            <aside className="shell-sidebar">
                <div className="shell-brand">
                    <div className="brand-mark" />
                    <div>
                        <div className="shell-brand-title">EDUTURE 2.0</div>
                        <div className="shell-brand-subtitle">Mastery level 4</div>
                    </div>
                </div>
                <div className="shell-profile card-surface">
                    <div className="shell-profile-kicker">Signed in as</div>
                    <div className="shell-profile-name">{user?.full_name || 'Guest'}</div>
                    <div className="shell-profile-meta">{user?.email || 'No account connected'}</div>
                    {user ? <div className={`shell-role-chip ${user.is_admin ? 'admin' : 'learner'}`}>{user.is_admin ? 'Admin' : 'Learner'}</div> : null}
                </div>
                <nav className="shell-nav">
                    <NavLink to="/dashboard" className={linkClass(['/dashboard'])}>
                        <span className="nav-icon" aria-hidden="true">⌂</span>
                        <span>Home</span>
                    </NavLink>
                    <NavLink to="/explore" className={linkClass(['/explore'])}>
                        <span className="nav-icon" aria-hidden="true">◎</span>
                        <span>Explore</span>
                    </NavLink>
                    <NavLink to="/pathways" className={linkClass(['/pathways'])}>
                        <span className="nav-icon" aria-hidden="true">↗</span>
                        <span>Pathways</span>
                    </NavLink>
                    <NavLink to="/achievements" className={linkClass(['/achievements'])}>
                        <span className="nav-icon" aria-hidden="true">☑</span>
                        <span>Achievements</span>
                    </NavLink>
                    <NavLink to="/progress" className={linkClass(['/progress'])}>
                        <span className="nav-icon" aria-hidden="true">↻</span>
                        <span>Progress</span>
                    </NavLink>
                    <NavLink to="/settings" className={linkClass(['/settings'])}>
                        <span className="nav-icon" aria-hidden="true">◴</span>
                        <span>Settings</span>
                    </NavLink>
                    {user?.is_admin ? (
                        <NavLink to="/admin" className={linkClass(['/admin'])}>
                            <span className="nav-icon" aria-hidden="true">⚙</span>
                            <span>A/B Testing</span>
                        </NavLink>
                    ) : null}
                </nav>
                <div className="shell-bottom-actions">
                    <button className="btn btn-soft shell-logout" type="button" onClick={logout}>Logout</button>
                </div>
            </aside>

            <div className="workspace">
                <header className="shell-header">
                    <div>
                        <div className="shell-header-eyebrow">{subtitle}</div>
                        <div className="shell-header-title">{title}</div>
                    </div>
                    <div className="shell-actions">{actions}</div>
                </header>
                <main className="workspace-body">{children}</main>
            </div>
        </div>
    );
}
