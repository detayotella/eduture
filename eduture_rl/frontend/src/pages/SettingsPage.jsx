import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { Pill, SectionHeader } from '../components/ui/Cards';

export default function SettingsPage() {
    const [emailUpdates, setEmailUpdates] = useState(true);
    const [autoResume, setAutoResume] = useState(true);

    return (
        <AppShell title="Settings" subtitle="Preferences" actions={<Pill tone="neutral">Account controls</Pill>}>
            <section className="fx-hero fx-hero-settings">
                <div>
                    <div className="fx-kicker">Settings</div>
                    <h2>Personalization</h2>
                    <p>Manage experience defaults and communication preferences.</p>
                </div>
            </section>

            <SectionHeader
                eyebrow="Preferences"
                title="Learning behavior and notifications"
            />

            <div className="fx-settings-card">
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
        </AppShell>
    );
}
