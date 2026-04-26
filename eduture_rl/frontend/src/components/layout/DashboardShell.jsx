import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const avatarUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMofZ6l-IiSVXFTbgUrrcOQHSGgfusYMOwHkWRvTCbPDP0nURcsFNKvMXdeGXn8noYnX0rEDMsKQdXbBLYHvnkvI_XC9VdytOuhxbt79ze7OWiDYvtkXJB2j3p_0b56Cll45ieSXd5z6wzUqbvWzOoz2cQpJAc2nw95dlEKqub1qcpITGxACjs8-WAaR5LsBvhaVvKq7cpXe9ka_KDBNZsYg_7mcO8Y6oL_fWixJPKPJUDL9aF1ERw6ZWlHp3_HPIDt9lBYxHDtS-n';

function getInitials(fullName) {
    if (!fullName) {
        return 'ED';
    }
    return fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || 'ED';
}

export default function DashboardShell({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const profileLabel = user?.full_name || 'Your profile';
    const profileSubtitle = user?.email || 'Profile settings';
    const masteryValue = user?.is_admin ? 'Admin' : 'Learner';
    const activeStyle = user?.preferred_style || user?.dominant_style || 'Adaptive';
    const profileAvatar = user?.avatar_url || avatarUrl;
    const profileTo = '/settings';
    const profileActive = location.pathname === '/settings';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="db-page">
            <div className="db-desktop-shell">
                <aside className="db-sidebar">
                    <div className="db-logo">EDUTURE 2.0</div>
                    <NavLink to={profileTo} className={({ isActive }) => `db-profile db-profile-link ${isActive || profileActive ? 'active' : ''}`}>
                        <div className="db-profile-avatar">
                            <img src={profileAvatar} alt={profileLabel} />
                            <span>{getInitials(user?.full_name)}</span>
                        </div>
                        <div className="db-profile-copy">
                            <div className="db-profile-name">{profileLabel}</div>
                            <div className="db-profile-subtitle">{profileSubtitle}</div>
                            <div className="db-profile-meta">
                                <span>{masteryValue}</span>
                                <span>{activeStyle}</span>
                            </div>
                        </div>
                    </NavLink>

                    <nav className="db-nav">
                        <NavLink to="/dashboard" className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}>
                            <span className="material-symbols-outlined">home</span>
                            <span>Home</span>
                        </NavLink>
                        <NavLink to="/questionnaire" className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}>
                            <span className="material-symbols-outlined">quiz</span>
                            <span>Questionnaire</span>
                        </NavLink>
                        <NavLink to="/explore" className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}>
                            <span className="material-symbols-outlined">explore</span>
                            <span>Explore</span>
                        </NavLink>
                        <NavLink to="/pathways" className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}>
                            <span className="material-symbols-outlined">moving</span>
                            <span>Pathways</span>
                        </NavLink>
                        <NavLink to="/achievements" className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}>
                            <span className="material-symbols-outlined">workspace_premium</span>
                            <span>Achievements</span>
                        </NavLink>
                        <NavLink to="/progress" className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}>
                            <span className="material-symbols-outlined">trending_up</span>
                            <span>Progress</span>
                        </NavLink>
                        <NavLink to="/settings" className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}>
                            <span className="material-symbols-outlined">settings</span>
                            <span>Settings</span>
                        </NavLink>
                    </nav>

                    <div className="db-bottom-actions">
                        <button type="button" className="db-logout" onClick={handleLogout}>Logout</button>
                    </div>

                </aside>

                <main className="db-main">
                    <div className="db-main-inner">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
