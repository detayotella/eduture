import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const avatarUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMofZ6l-IiSVXFTbgUrrcOQHSGgfusYMOwHkWRvTCbPDP0nURcsFNKvMXdeGXn8noYnX0rEDMsKQdXbBLYHvnkvI_XC9VdytOuhxbt79ze7OWiDYvtkXJB2j3p_0b56Cll45ieSXd5z6wzUqbvWzOoz2cQpJAc2nw95dlEKqub1qcpITGxACjs8-WAaR5LsBvhaVvKq7cpXe9ka_KDBNZsYg_7mcO8Y6oL_fWixJPKPJUDL9aF1ERw6ZWlHp3_HPIDt9lBYxHDtS-n';

export default function DashboardShell({ children }) {
    const { user } = useAuth();

    return (
        <div className="db-page">
            <div className="db-desktop-shell">
                <aside className="db-sidebar">
                    <div className="db-logo">EDUTURE 2.0</div>
                    <div className="db-profile">
                        <img src={avatarUrl} alt="Learner" />
                        <div>
                            <div className="db-level">Mastery Level 4</div>
                            <div className="db-style">Activist Learner</div>
                        </div>
                    </div>

                    <nav className="db-nav">
                        <NavLink to="/dashboard" className={({ isActive }) => `db-nav-item ${isActive ? 'active' : ''}`}>
                            <span className="material-symbols-outlined">home</span>
                            <span>Home</span>
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

                    <button className="db-roadmap" type="button">View Roadmap</button>
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
