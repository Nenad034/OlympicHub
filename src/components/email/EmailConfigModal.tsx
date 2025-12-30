import React, { useState, useEffect } from 'react';
import { Mail, Save, TestTube, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { saveEmailConfig, getEmailConfig, testEmailConnection, type EmailConfig } from '../../services/emailService';
import { useMailStore } from '../../stores';
import './EmailConfigModal.css';

interface EmailConfigModalProps {
    accountId: string;
    accountEmail: string;
    onClose: () => void;
    onSaved: () => void;
}

export const EmailConfigModal: React.FC<EmailConfigModalProps> = ({ accountId, accountEmail, onClose, onSaved }) => {
    const [config, setConfig] = useState<Partial<EmailConfig>>({
        account_id: accountId,
        smtp_host: '',
        smtp_port: 587,
        smtp_user: accountEmail,
        smtp_password: '',
        imap_host: '',
        imap_port: 993,
        imap_user: accountEmail,
        imap_password: '',
        use_ssl: true
    });

    const [showSmtpPassword, setShowSmtpPassword] = useState(false);
    const [showImapPassword, setShowImapPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadExistingConfig();
    }, [accountId]);

    const loadExistingConfig = async () => {
        setIsLoading(true);
        const result = await getEmailConfig(accountId);
        if (result.success && result.config) {
            setConfig(result.config);
        }
        setIsLoading(false);
    };

    const handleInputChange = (field: keyof EmailConfig, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
        setTestResult(null);
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);

        const result = await testEmailConnection(config);

        setTestResult({
            success: result.success,
            message: result.success
                ? '✅ Konekcija uspešna! SMTP i IMAP serveri su dostupni.'
                : `❌ Greška: ${result.error || 'Nepoznata greška'}`
        });

        setIsTesting(false);
    };

    const handleSave = async () => {
        if (!config.smtp_host || !config.imap_host || !config.smtp_password || !config.imap_password) {
            alert('Molimo popunite sva obavezna polja');
            return;
        }

        setIsSaving(true);
        const result = await saveEmailConfig(config as EmailConfig);

        if (result.success) {
            alert('✅ Email konfiguracija je sačuvana!');
            onSaved();
            onClose();
        } else {
            alert(`❌ Greška pri čuvanju: ${result.error}`);
        }

        setIsSaving(false);
    };

    const commonProviders = [
        { name: 'Gmail', smtp: 'smtp.gmail.com', imap: 'imap.gmail.com', smtpPort: 587, imapPort: 993 },
        { name: 'Outlook/Office365', smtp: 'smtp.office365.com', imap: 'outlook.office365.com', smtpPort: 587, imapPort: 993 },
        { name: 'Yahoo', smtp: 'smtp.mail.yahoo.com', imap: 'imap.mail.yahoo.com', smtpPort: 587, imapPort: 993 },
        { name: 'Custom', smtp: '', imap: '', smtpPort: 587, imapPort: 993 }
    ];

    const handleProviderSelect = (provider: typeof commonProviders[0]) => {
        setConfig(prev => ({
            ...prev,
            smtp_host: provider.smtp,
            smtp_port: provider.smtpPort,
            imap_host: provider.imap,
            imap_port: provider.imapPort
        }));
    };

    if (isLoading) {
        return (
            <div className="email-config-modal-overlay" onClick={onClose}>
                <div className="email-config-modal" onClick={e => e.stopPropagation()}>
                    <div className="loading-state">
                        <Loader2 size={32} className="spin" />
                        <p>Učitavanje konfiguracije...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="email-config-modal-overlay" onClick={onClose}>
            <div className="email-config-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Mail size={20} />
                        <h2>Email Konfiguracija</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="account-info-box">
                        <strong>Nalog:</strong> {accountEmail}
                    </div>

                    {/* Provider Quick Select */}
                    <div className="form-section">
                        <label className="section-label">Brzi izbor provajdera</label>
                        <div className="provider-buttons">
                            {commonProviders.map(provider => (
                                <button
                                    key={provider.name}
                                    className={`provider-btn ${config.smtp_host === provider.smtp ? 'active' : ''}`}
                                    onClick={() => handleProviderSelect(provider)}
                                >
                                    {provider.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SMTP Configuration */}
                    <div className="form-section">
                        <label className="section-label">📤 SMTP (Slanje email-ova)</label>

                        <div className="form-row">
                            <div className="form-group">
                                <label>SMTP Server</label>
                                <input
                                    type="text"
                                    placeholder="smtp.gmail.com"
                                    value={config.smtp_host}
                                    onChange={e => handleInputChange('smtp_host', e.target.value)}
                                />
                            </div>
                            <div className="form-group small">
                                <label>Port</label>
                                <input
                                    type="number"
                                    value={config.smtp_port}
                                    onChange={e => handleInputChange('smtp_port', parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>SMTP Korisničko ime</label>
                            <input
                                type="text"
                                placeholder="your.email@gmail.com"
                                value={config.smtp_user}
                                onChange={e => handleInputChange('smtp_user', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>SMTP Lozinka / App Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showSmtpPassword ? 'text' : 'password'}
                                    placeholder="••••••••••••••••"
                                    value={config.smtp_password}
                                    onChange={e => handleInputChange('smtp_password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                                >
                                    {showSmtpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <small className="help-text">
                                Za Gmail, koristite <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">App Password</a>
                            </small>
                        </div>
                    </div>

                    {/* IMAP Configuration */}
                    <div className="form-section">
                        <label className="section-label">📥 IMAP (Primanje email-ova)</label>

                        <div className="form-row">
                            <div className="form-group">
                                <label>IMAP Server</label>
                                <input
                                    type="text"
                                    placeholder="imap.gmail.com"
                                    value={config.imap_host}
                                    onChange={e => handleInputChange('imap_host', e.target.value)}
                                />
                            </div>
                            <div className="form-group small">
                                <label>Port</label>
                                <input
                                    type="number"
                                    value={config.imap_port}
                                    onChange={e => handleInputChange('imap_port', parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>IMAP Korisničko ime</label>
                            <input
                                type="text"
                                placeholder="your.email@gmail.com"
                                value={config.imap_user}
                                onChange={e => handleInputChange('imap_user', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>IMAP Lozinka / App Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showImapPassword ? 'text' : 'password'}
                                    placeholder="••••••••••••••••"
                                    value={config.imap_password}
                                    onChange={e => handleInputChange('imap_password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowImapPassword(!showImapPassword)}
                                >
                                    {showImapPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SSL Option */}
                    <div className="form-section">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={config.use_ssl}
                                onChange={e => handleInputChange('use_ssl', e.target.checked)}
                            />
                            <span>Koristi SSL/TLS enkripciju (preporučeno)</span>
                        </label>
                    </div>

                    {/* Test Result */}
                    {testResult && (
                        <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                            {testResult.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            <span>{testResult.message}</span>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-test"
                        onClick={handleTestConnection}
                        disabled={isTesting || !config.smtp_host || !config.imap_host}
                    >
                        {isTesting ? (
                            <>
                                <Loader2 size={16} className="spin" />
                                Testiranje...
                            </>
                        ) : (
                            <>
                                <TestTube size={16} />
                                Testiraj konekciju
                            </>
                        )}
                    </button>

                    <div className="spacer"></div>

                    <button className="btn-cancel" onClick={onClose}>
                        Otkaži
                    </button>

                    <button
                        className="btn-save"
                        onClick={handleSave}
                        disabled={isSaving || !testResult?.success}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={16} className="spin" />
                                Čuvanje...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Sačuvaj
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailConfigModal;
