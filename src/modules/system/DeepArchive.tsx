import { useState, useEffect } from 'react';
import {
    ShieldAlert,
    ArrowLeft,
    Search,
    Download,
    Database,
    User as UserIcon,
    History,
    RefreshCcw,
    Trash2,
    AlertCircle,
    Layout,
    Filter,
    FileJson,
    LogOut
} from 'lucide-react';
import { GeometricBrain } from '../../components/icons/GeometricBrain';
import { motion, AnimatePresence } from 'framer-motion';

interface ArchiveItem {
    id: string;
    type: 'DELETE' | 'UPDATE';
    entityType: 'User' | 'Reservation' | 'Payment' | 'Hotel' | 'Supplier' | 'Customer';
    entityId: string;
    oldData: any;
    newData?: any;
    changedBy: string;
    userEmail: string;
    timestamp: string; // YYYY-MM-DD HH:mm:ss
    summary: string;
}

interface Props {
    onBack: () => void;
    lang: 'sr' | 'en';
}

export default function DeepArchive({ onBack }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'DELETE' | 'UPDATE'>('ALL');
    const [items, setItems] = useState<ArchiveItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);

    // Initial dummy data for the Deep Archive
    useEffect(() => {
        const dummyData: ArchiveItem[] = [
            {
                id: 'log_1',
                type: 'DELETE',
                entityType: 'User',
                entityId: '2',
                oldData: { firstName: 'Marko', lastName: 'Agent', email: 'marko@example.com', level: 3 },
                changedBy: 'Nenad Admin (Master)',
                userEmail: 'nenad@example.com',
                timestamp: '2025-12-28 15:25:34',
                summary: 'Obrisan nalog korisnika Marko Agent'
            },
            {
                id: 'log_2',
                type: 'UPDATE',
                entityType: 'Hotel',
                entityId: 'h_101',
                oldData: { price: 120, status: 'Available' },
                newData: { price: 145, status: 'Available' },
                changedBy: 'Jovan Prodaja',
                userEmail: 'jovan@example.com',
                timestamp: '2025-12-28 14:10:05',
                summary: 'Izmenjena cena za Hotel Splendid'
            },
            {
                id: 'log_3',
                type: 'DELETE',
                entityType: 'Reservation',
                entityId: 'RES-9988',
                oldData: { guest: 'Ivan Ivić', amount: 450, date: '2026-05-12' },
                changedBy: 'Milica Rezervacije',
                userEmail: 'milica@example.com',
                timestamp: '2025-12-27 10:45:22',
                summary: 'Stornirana rezervacija RES-9988'
            },
            {
                id: 'log_old',
                type: 'DELETE',
                entityType: 'Payment',
                entityId: 'PAY-77',
                oldData: { amount: 1500, bank: 'Intesa' },
                changedBy: 'Sistem',
                userEmail: 'system@olympichub.rs',
                timestamp: '2024-11-15 09:00:12',
                summary: 'Obrisan stari unos uplate'
            }
        ];
        setItems(dummyData);
    }, []);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.changedBy.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filter === 'ALL' || item.type === filter;
        return matchesSearch && matchesType;
    });

    const isOlderThanYear = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return date < oneYearAgo;
    };

    const filters = [
        { id: 'ALL', title: 'Sve Promene', icon: <Layout size={18} /> },
        { id: 'DELETE', title: 'Obrisano', icon: <Trash2 size={18} /> },
        { id: 'UPDATE', title: 'Izmenjeno', icon: <RefreshCcw size={18} /> }
    ];

    return (
        <div className="wizard-overlay">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="wizard-container"
            >
                {/* SIDEBAR NAVIGATION */}
                <div className="wizard-sidebar">
                    <div className="wizard-sidebar-header">
                        <div style={{ background: 'var(--gradient-blue)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldAlert size={18} color="#fff" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '800' }}>ARCHIVE</h2>
                            <div style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: 800 }}>Master Audit Log</div>
                        </div>
                    </div>

                    <div className="wizard-steps-list">
                        {filters.map((f) => (
                            <div
                                key={f.id}
                                className={`step-item-row ${filter === f.id ? 'active' : ''}`}
                                onClick={() => setFilter(f.id as any)}
                            >
                                <div className="step-icon-small">
                                    {f.icon}
                                </div>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.title}</span>
                                <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '2px 6px', borderRadius: '100px', background: 'var(--border)', color: 'var(--text-secondary)' }}>
                                    {items.filter(i => f.id === 'ALL' || i.type === f.id).length}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '20px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                        <div style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '15px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }}></div>
                                Zero Trust Active
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                                <span>• RBAC Verifikacija: OK</span>
                                <span>• Audit Trail: Immutable</span>
                                <span>• Encryption: AES-256</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="wizard-main-area">
                    {/* TOPBAR */}
                    <div className="wizard-topbar">
                        <div className="topbar-title">
                            <h3>{filters.find(f => f.id === filter)?.title}</h3>
                            <span className="topbar-subtitle">
                                {filteredItems.length} zapisa • Poslednji unos: {items[0]?.timestamp.split(' ')[0]}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: '300px' }}>
                                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={16} />
                                <input
                                    type="text"
                                    placeholder="Pretraži arhivu (subjekat, ID, entitet)..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '100px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
                                />
                            </div>
                            <button
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'var(--accent)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '100px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 700
                                }}
                            >
                                <Download size={16} /> Export
                            </button>
                            <button
                                onClick={onBack}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    padding: '8px 16px',
                                    borderRadius: '100px',
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)',
                                    fontSize: '13px',
                                    fontWeight: 600
                                }}
                            >
                                <LogOut size={16} /> Exit
                            </button>
                        </div>
                    </div>

                    {/* SCROLLABLE CONTENT */}
                    <div className="wizard-content-wrapper" style={{ padding: '0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', height: '100%' }}>
                            {/* Left Panel: Table */}
                            <div style={{ overflowY: 'auto', padding: '30px', borderRight: '1px solid var(--border)' }}>
                                {items.some(i => isOlderThanYear(i.timestamp)) && (
                                    <div style={{ background: 'rgba(52, 152, 219, 0.1)', border: '1px solid var(--accent)', padding: '15px 20px', borderRadius: '16px', display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                                        <GeometricBrain size={24} color="#FFD700" />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>AI Savetnik za Retenciju Podataka</h4>
                                            <p style={{ fontSize: '12px', opacity: 0.8 }}>Pronašao sam podatke starije od godinu dana. Preporučujem eksport na lokalni disk.</p>
                                        </div>
                                    </div>
                                )}

                                <div style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead style={{ background: 'var(--bg-sidebar)' }}>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '15px 20px', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Entitet</th>
                                                <th style={{ textAlign: 'left', padding: '15px 20px', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Akcija / Opis</th>
                                                <th style={{ textAlign: 'right', padding: '15px 20px', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Vreme</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredItems.map(item => (
                                                <tr
                                                    key={item.id}
                                                    onClick={() => setSelectedItem(item)}
                                                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selectedItem?.id === item.id ? 'var(--accent-glow)' : 'transparent', transition: '0.2s' }}
                                                >
                                                    <td style={{ padding: '15px 20px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ background: item.type === 'DELETE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(52, 152, 219, 0.1)', color: item.type === 'DELETE' ? '#ef4444' : 'var(--accent)', padding: '6px', borderRadius: '8px' }}>
                                                                {item.type === 'DELETE' ? <Trash2 size={16} /> : <RefreshCcw size={16} />}
                                                            </div>
                                                            <span style={{ fontWeight: 600 }}>{item.entityType}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{item.summary}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <UserIcon size={10} /> {item.changedBy}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px 20px', textAlign: 'right', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                                                        {item.timestamp.split(' ')[0]}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Right Panel: Inspector */}
                            <div style={{ background: 'var(--bg-main)', borderLeft: '1px solid var(--border)', padding: '30px', overflowY: 'auto' }}>
                                <AnimatePresence mode="wait">
                                    {selectedItem ? (
                                        <motion.div
                                            key={selectedItem.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Detaljni Pregled</h3>
                                                <div style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border)' }}>ID: {selectedItem.id}</div>
                                            </div>

                                            <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TRANSAKCIJA</div>
                                                <div style={{ fontWeight: 700, fontSize: '16px', lineHeight: '1.4', marginBottom: '15px' }}>{selectedItem.summary}</div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>IZVRŠIO</div>
                                                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedItem.changedBy}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>VREME</div>
                                                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedItem.timestamp}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><History size={14} /> Izvorno Stanje (JSON)</div>
                                                <div style={{ padding: '15px', background: 'var(--bg-card)', borderRadius: '16px', fontSize: '11px', color: '#f59e0b', overflowX: 'auto', border: '1px solid var(--border)', fontFamily: 'monospace' }}>
                                                    {JSON.stringify(selectedItem.oldData, null, 2)}
                                                </div>
                                            </div>

                                            {selectedItem.type === 'UPDATE' && selectedItem.newData && (
                                                <div>
                                                    <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)' }}><RefreshCcw size={14} /> Novo Stanje</div>
                                                    <div style={{ padding: '15px', background: 'var(--bg-card)', borderRadius: '16px', fontSize: '11px', color: 'var(--accent)', overflowX: 'auto', border: '1px solid var(--accent)', fontFamily: 'monospace' }}>
                                                        {JSON.stringify(selectedItem.newData, null, 2)}
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                                <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <FileJson size={14} /> Copy JSON
                                                </button>
                                                <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'var(--gradient-blue)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <RefreshCcw size={14} /> Restore
                                                </button>
                                            </div>

                                        </motion.div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', height: '100%' }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid var(--border)' }}>
                                                <Database size={24} style={{ opacity: 0.5 }} />
                                            </div>
                                            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Detalji Stavke</h3>
                                            <p style={{ fontSize: '13px', opacity: 0.7, maxWidth: '200px' }}>Kliknite na bilo koju stavku u tabeli da biste videli kompletan audit log i JSON podatke.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style>{`
                .wizard-overlay {
                    position: fixed;
                    inset: 0;
                    background: var(--bg-dark);
                    z-index: 2000;
                    display: flex;
                }

                .wizard-container {
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    background: var(--bg-dark);
                    overflow: hidden;
                }

                .wizard-sidebar {
                    width: 280px;
                    background: var(--bg-card);
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    flex-shrink: 0;
                }

                .wizard-sidebar-header {
                    padding: 24px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .wizard-steps-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .step-item-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: var(--text-secondary);
                    font-weight: 500;
                    user-select: none;
                }

                .step-item-row:hover {
                    background: var(--glass-bg);
                }

                .step-item-row.active {
                    background: var(--accent-glow);
                    color: var(--accent);
                    font-weight: 600;
                    border-right: 3px solid var(--accent);
                }

                .step-icon-small {
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    background: rgba(0,0,0,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .step-item-row.active .step-icon-small {
                    background: var(--accent);
                    color: #fff;
                }

                .wizard-main-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--bg-dark);
                }

                .wizard-topbar {
                    height: 80px;
                    padding: 0 30px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--bg-card);
                    flex-shrink: 0;
                }

                .topbar-title h3 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 700;
                }

                .topbar-subtitle {
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .wizard-content-wrapper {
                    flex: 1;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}
