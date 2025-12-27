import { useState } from 'react';
import {
    Key,
    RotateCcw,
    Save,
    Plus,
    Check,
    AlertTriangle,
    ArrowLeft,
    ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useConfig } from '../../context/ConfigContext';
import { translations, type Language } from '../../translations';

interface Props {
    onBack: () => void;
    lang: Language;
    userLevel: number;
    setUserLevel: (level: number) => void;
}

export default function SettingsModule({ onBack, lang, userLevel, setUserLevel }: Props) {
    const { config, updateConfig, createSnapshot, backups, restoreSnapshot } = useConfig();
    const t = translations[lang];

    const [geminiKey, setGeminiKey] = useState(config.geminiKey);
    const [backupNote, setBackupNote] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await updateConfig({ geminiKey });
        setTimeout(() => setIsSaving(false), 800);
    };

    const handleCreateSnapshot = async () => {
        if (!backupNote) return;
        await createSnapshot(backupNote);
        setBackupNote("");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="settings-module"
            style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '900px', margin: '0 auto' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={onBack} className="back-btn" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}>
                    <ArrowLeft size={18} />
                </button>
                <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{t.settings}</h2>
            </div>

            <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* API Keys Section */}
                    <section style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                            <Key className="text-accent" size={20} />
                            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{t.apiKeys}</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t.geminiKey}</label>
                                <input
                                    type="password"
                                    value={geminiKey}
                                    onChange={e => setGeminiKey(e.target.value)}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                className="action-btn-hub primary"
                                style={{ padding: '12px', width: '100%', justifyContent: 'center', marginTop: '10px' }}
                            >
                                {isSaving ? <Check size={18} /> : <Save size={18} />} {t.saveSettings}
                            </button>
                        </div>
                    </section>

                    {/* Access Level Section (Moved from Sidebar) */}
                    <section style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <ShieldCheck className="text-accent" size={20} />
                            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{t.userLevel}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[1, 2, 3, 4, 5].map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => setUserLevel(lvl)}
                                    style={{
                                        flex: 1, padding: '12px', border: 'none', borderRadius: '12px',
                                        background: userLevel >= lvl ? 'var(--accent)' : 'var(--border)',
                                        color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: '0.2s',
                                        boxShadow: userLevel === lvl ? '0 4px 12px var(--accent-glow)' : 'none'
                                    }}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '15px' }}>
                            {userLevel >= 3 ? "Imate puna prava uređivanja." : "Trenutno ste u modu 'Samo gledanje'."}
                        </p>
                    </section>
                </div>

                {/* Point of Return Section */}
                <section style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '24px', border: '1px solid var(--border)', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <RotateCcw className="text-accent" size={20} />
                        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{t.pointOfReturn}</h3>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '25px' }}>
                        Napravite kopiju trenutnog stanja svih API ključeva i podešavanja kako biste mogli da se vratite ako nešto krene po zlu.
                    </p>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                        <input
                            type="text"
                            placeholder="Naziv snapshot-a (npr. Stabilna verzija)"
                            value={backupNote}
                            onChange={e => setBackupNote(e.target.value)}
                            style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                        />
                        <button onClick={handleCreateSnapshot} className="action-btn-hub success">
                            <Plus size={18} /> {t.createBackup}
                        </button>
                    </div>

                    <div className="backup-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
                        <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>{t.backupHistory}</h4>
                        {backups.map(b => (
                            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'var(--bg-sidebar)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{b.note}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(b.created_at).toLocaleString()}</div>
                                </div>
                                <button
                                    onClick={() => restoreSnapshot(b)}
                                    style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--accent)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    {t.restore}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '20px', borderRadius: '16px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <AlertTriangle color="#ef4444" />
                <div>
                    <h4 style={{ color: '#ef4444', fontSize: '14px', fontWeight: '700' }}>{t.dangerZone}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Promena API ključeva može prekinuti rad AI asistenta. Uvek napravite snapshot pre promene.
                    </p>
                </div>
            </div>

        </motion.div>
    );
}
