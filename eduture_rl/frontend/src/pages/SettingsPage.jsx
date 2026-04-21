import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardShell from '../components/layout/DashboardShell';
import { Pill, SectionHeader } from '../components/ui/Cards';

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

const profileAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMofZ6l-IiSVXFTbgUrrcOQHSGgfusYMOwHkWRvTCbPDP0nURcsFNKvMXdeGXn8noYnX0rEDMsKQdXbBLYHvnkvI_XC9VdytOuhxbt79ze7OWiDYvtkXJB2j3p_0b56Cll45ieSXd5z6wzUqbvWzOoz2cQpJAc2nw95dlEKqub1qcpITGxACjs8-WAaR5LsBvhaVvKq7cpXe9ka_KDBNZsYg_7mcO8Y6oL_fWixJPKPJUDL9aF1ERw6ZWlHp3_HPIDt9lBYxHDtS-n';

export default function SettingsPage() {
    const { user, setUser } = useAuth();
    const [emailUpdates, setEmailUpdates] = useState(true);
    const [autoResume, setAutoResume] = useState(true);
    const [summary, setSummary] = useState(null);
    const [avatarDraft, setAvatarDraft] = useState('');
    const [avatarSaving, setAvatarSaving] = useState(false);
    const [avatarError, setAvatarError] = useState('');
    const [avatarNotice, setAvatarNotice] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        api
            .get('/interaction/summary')
            .then((response) => setSummary(response.data.data))
            .catch(() => setSummary(null));
    }, []);

    useEffect(() => {
        setAvatarDraft(user?.avatar_url || '');
        setAvatarError('');
        setAvatarNotice('');
    }, [user]);

    const displayName = user?.full_name || user?.email || 'Learner profile';
    const email = user?.email || 'No email available';
    const activeStyle = summary?.dominant_style || summary?.style || user?.preferred_style || 'Adaptive';
    const masteryValue = user?.is_admin ? 'Admin' : `${Math.max(1, Math.min(10, Math.round((summary?.mastery_score || 68) / 10)))} / 10`;
    const streakValue = `${summary?.streak_days ?? 0} day streak`;
    const interactionValue = `${summary?.interaction_count ?? 0} interactions`;
    const profileImage = avatarDraft || user?.avatar_url || profileAvatar;

    const onChooseAvatar = () => {
        fileInputRef.current?.click();
    };

    const onAvatarFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        if (!file.type.startsWith('image/')) {
            setAvatarError('Choose a PNG, JPG, or WebP image.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setAvatarError('Image must be 2 MB or smaller.');
            return;
        }
        setAvatarError('');
        const reader = new FileReader();
        reader.onload = () => {
            setAvatarDraft(String(reader.result || ''));
            setAvatarNotice('Preview ready. Save to update your profile image.');
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const onSaveAvatar = async () => {
        setAvatarSaving(true);
        setAvatarError('');
        try {
            const response = await api.put('/auth/me/avatar', { avatar_url: avatarDraft || null });
            const updatedUser = response.data.data;
            setUser((currentUser) => ({
                ...currentUser,
                avatar_url: updatedUser.avatar_url || null,
            }));
            setAvatarDraft(updatedUser.avatar_url || '');
            setAvatarNotice('Profile image updated.');
        } catch (error) {
            setAvatarError(error?.response?.data?.detail?.message || 'Could not update your profile image.');
        } finally {
            setAvatarSaving(false);
        }
    };

    return (
        <DashboardShell>
            <header className="db-header">
                <h1>Profile</h1>
                <p>Your identity, progress, and learning preferences.</p>
            </header>

            <section className="fx-hero fx-hero-settings db-profile-hero">
                <div className="db-profile-hero-copy">
                    <div className="fx-kicker">Profile hub</div>
                    <h2>{displayName}</h2>
                    <p>{email}</p>
                    <div className="db-profile-pill-row">
                        <Pill>{activeStyle}</Pill>
                        <Pill>{masteryValue} mastery</Pill>
                        <Pill>{streakValue}</Pill>
                    </div>
                </div>
                <div className="db-profile-hero-card">
                    <button type="button" className="db-profile-avatar db-profile-avatar-large db-avatar-picker" onClick={onChooseAvatar} aria-label="Change profile image">
                        <img src={profileImage} alt={displayName} />
                        <span>{getInitials(user?.full_name)}</span>
                    </button>
                    <div>
                        <strong>{summary?.next_milestone || 'Keep building your personalized path'}</strong>
                        <p>{interactionValue}</p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="db-avatar-input"
                        onChange={onAvatarFileChange}
                    />
                    <div className="db-avatar-actions">
                        <button type="button" className="db-secondary-btn" onClick={onChooseAvatar}>Change photo</button>
                        <button type="button" className="db-primary-btn" onClick={onSaveAvatar} disabled={avatarSaving || !avatarDraft}>Save photo</button>
                    </div>
                    {avatarNotice ? <p className="db-avatar-note success">{avatarNotice}</p> : null}
                    {avatarError ? <p className="db-avatar-note error">{avatarError}</p> : null}
                </div>
            </section>

            <SectionHeader
                eyebrow="Account"
                title="Identity and activity"
            />

            <div className="fx-settings-grid">
                <div className="fx-settings-card fx-profile-card">
                    <h3>Profile details</h3>
                    <div className="fx-profile-field">
                        <span>Name</span>
                        <strong>{displayName}</strong>
                    </div>
                    <div className="fx-profile-field">
                        <span>Email</span>
                        <strong>{email}</strong>
                    </div>
                    <div className="fx-profile-field">
                        <span>Learning style</span>
                        <strong>{activeStyle}</strong>
                    </div>
                    <div className="fx-profile-field">
                        <span>Mastery snapshot</span>
                        <strong>{masteryValue}</strong>
                    </div>
                    <div className="fx-profile-actions">
                        <NavLink to="/questionnaire" className="db-primary-btn">Retake questionnaire</NavLink>
                        <NavLink to="/dashboard" className="db-secondary-btn">Back to dashboard</NavLink>
                    </div>
                </div>

                <div className="fx-settings-card">
                    <h3>Preferences</h3>
                    <label className="fx-setting-row">
                        <span>Email update summaries</span>
                        <button
                            type="button"
                            className={`fx-switch ${emailUpdates ? 'on' : ''}`}
                            onClick={() => setEmailUpdates((value) => !value)}
                            aria-pressed={emailUpdates}
                        >
                            <span />
                        </button>
                    </label>

                    <label className="fx-setting-row">
                        <span>Auto-resume last module</span>
                        <button
                            type="button"
                            className={`fx-switch ${autoResume ? 'on' : ''}`}
                            onClick={() => setAutoResume((value) => !value)}
                            aria-pressed={autoResume}
                        >
                            <span />
                        </button>
                    </label>
                </div>
            </div>
        </DashboardShell>
    );
}
