import React, { useState } from 'react';
import {
    Bot,
    Send,
    Settings,
    FileSpreadsheet,
    Link,
    Zap,
    Save,
    Calendar,
    Table as TableIcon,
    Clock,
    Database,
    Sun,
    Moon,
    Trash2,
    Plus,
    Download,
    AlertCircle
} from 'lucide-react';
import './PricingModule.styles.css';
import { HOTEL_SERVICES } from '../../data/services/hotelServices';
import { ROOM_PREFIXES, ROOM_VIEWS, ROOM_TYPES } from '../../data/rooms/roomTypes';

const PricingIntelligence: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'setup' | 'grid' | 'rules' | 'mapping'>('setup');
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Detektovao sam tvoj JSON format! Vidim da imaš "API unit showcase". Da li želiš da mapiramo ove jedinice u tvoju bazu smeštaja?' }
    ]);
    const [input, setInput] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Product Configuration State (Hoisted for persistence)
    const [productState, setProductState] = useState({
        service: '',
        prefix: '',
        type: '',
        view: '',
        name: ''
    });

    // Price Periods State (Base Rates)
    const [pricePeriods, setPricePeriods] = useState([
        {
            id: '1',
            dateFrom: '2026-04-01',
            dateTo: '2026-05-01',
            basis: 'PER_PERSON_DAY',
            netPrice: 39.00,
            provisionPercent: 21.00,
            releaseDays: 0,
            minStay: 3,
            maxStay: null as number | null,
            minAdults: 2,
            maxAdults: 3,
            minChildren: 0,
            maxChildren: 2,
            arrivalDays: [1, 2, 3, 4, 5, 6, 7]
        },
        {
            id: '2',
            dateFrom: '2026-06-20',
            dateTo: '2026-06-30',
            basis: 'PER_ROOM_DAY',
            netPrice: 120.00,
            provisionPercent: 15.00,
            releaseDays: 7,
            minStay: 5,
            maxStay: null as number | null,
            minAdults: 2,
            maxAdults: 2,
            minChildren: 0,
            maxChildren: 1,
            arrivalDays: [5, 6] // Samo petak i subota
        }
    ]);

    // Supplements/Discounts State
    const [supplements, setSupplements] = useState([
        {
            id: '1',
            type: 'SUPPLEMENT',
            title: 'Supplement for person on basic bed',
            netPrice: 12.50,
            provisionPercent: 20,
            childAgeFrom: null as number | null,
            childAgeTo: null as number | null,
            minAdults: 2,
            minChildren: 2
        },
        {
            id: '2',
            type: 'DISCOUNT',
            title: 'Early Booking -10%',
            percentValue: 10,
            daysBeforeArrival: 30,
            childAgeFrom: null as number | null,
            childAgeTo: null as number | null,
            minAdults: null as number | null,
            minChildren: null as number | null
        }
    ]);

    // Export Configuration to JSON
    const exportToJSON = () => {
        const config = {
            pricelist: {
                id: 119,
                product: productState,
                baseRates: pricePeriods.map(p => ({
                    ...p,
                    grossPrice: (p.netPrice * (1 + p.provisionPercent / 100)).toFixed(2)
                })),
                supplements: supplements
            },
            exportedAt: new Date().toISOString(),
            format: 'MARS_COMPATIBLE'
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pricelist_${productState.name || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Validation Check
    const getValidationStatus = () => {
        const issues: string[] = [];
        if (!productState.type) issues.push('Nije izabran tip sobe');
        if (!productState.service) issues.push('Nije izabrana usluga');
        if (pricePeriods.length === 0) issues.push('Nema definisanih cenovnih perioda');
        pricePeriods.forEach((p, i) => {
            if (!p.dateFrom || !p.dateTo) issues.push(`Period ${i + 1}: Nedostaju datumi`);
            if (p.netPrice <= 0) issues.push(`Period ${i + 1}: Neto cena mora biti > 0`);
        });
        return issues;
    };

    const validationIssues = getValidationStatus();

    const handleSendMessage = () => {
        if (!input.trim()) return;
        setMessages([...messages, { role: 'user', content: input }]);
        setInput('');
    };

    return (
        <div className={`pricing-module ${isDarkMode ? 'dark' : ''}`}>
            {/* Left: AI Assistant Sidebar */}
            <aside className="ai-assistant-sidebar">
                <div className="ai-header">
                    <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '10px' }}>
                        <Bot size={24} className="text-blue-500" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Price AI Assistant</h2>
                        <span style={{ fontSize: '12px', color: 'var(--pricing-text-dim)' }}>Mapping & Rules Expert</span>
                    </div>
                </div>

                <div className="ai-messages">
                    {messages.map((m, i) => (
                        <div key={i} className={`msg ${m.role === 'ai' ? 'msg-ai' : 'msg-user'}`}>
                            {m.content}
                            {m.role === 'ai' && i === 0 && (
                                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                                    <button className="btn-primary" style={{ fontSize: '11px', padding: '4px 8px' }}>Prikaži Mapiranje</button>
                                    <button className="btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>Preskoči</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="ai-input-area">
                    <div className="ai-input-wrapper">
                        <input
                            type="text"
                            className="ai-input"
                            placeholder="Zatraži izmenu pravila..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage} className="ai-send-btn">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Right: Main Content Area */}
            <main className="pricing-main">
                <header className="pricing-topbar">
                    <nav className="pricing-tabs">
                        <div className={`pricing-tab ${activeTab === 'setup' ? 'active' : ''}`} onClick={() => setActiveTab('setup')}>Header & Product</div>
                        <div className={`pricing-tab ${activeTab === 'grid' ? 'active' : ''}`} onClick={() => setActiveTab('grid')}>Cene (Base Rates)</div>
                        <div className={`pricing-tab ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>Pravila (Doplate/Popusti)</div>
                        <div className={`pricing-tab ${activeTab === 'mapping' ? 'active' : ''}`} onClick={() => setActiveTab('mapping')}>Mapiranje (Sync)</div>
                    </nav>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* Validation Indicator */}
                        {validationIssues.length > 0 && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    borderRadius: '8px',
                                    color: '#ef4444',
                                    fontSize: '12px',
                                    cursor: 'help'
                                }}
                                title={validationIssues.join('\n')}
                            >
                                <AlertCircle size={14} />
                                {validationIssues.length} problema
                            </div>
                        )}
                        <button
                            className="btn-secondary"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            style={{ padding: '8px' }}
                            title="Toggle Dark Mode"
                        >
                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <button className="btn-secondary"><FileSpreadsheet size={16} /> Import Excel</button>
                        <button className="btn-secondary" onClick={exportToJSON} title="Izvezi konfiguraciju u JSON">
                            <Download size={16} /> Export JSON
                        </button>
                        <button className="btn-secondary"><Link size={16} /> API MARS Sync</button>
                        <button className="btn-primary" disabled={validationIssues.length > 0}>
                            <Save size={16} /> Aktiviraj Cenovnik
                        </button>
                    </div>
                </header>

                <div className="pricing-content">
                    {activeTab === 'setup' && <PricelistSetupView productState={productState} setProductState={setProductState} />}
                    {activeTab === 'grid' && <GridView pricePeriods={pricePeriods} setPricePeriods={setPricePeriods} productName={productState.name} />}
                    {activeTab === 'rules' && <RulesView supplements={supplements} setSupplements={setSupplements} productName={productState.name} />}
                    {activeTab === 'mapping' && <MappingView />}
                </div>
            </main>
        </div>
    );
};

const PricelistSetupView = ({ productState, setProductState }: { productState: any, setProductState: any }) => {

    // Auto-generate name when parts change
    React.useEffect(() => {
        const prefixObj = ROOM_PREFIXES.find(p => p.code === productState.prefix);
        const typeObj = ROOM_TYPES.find(t => t.id === productState.type);
        const viewObj = ROOM_VIEWS.find(v => v.code === productState.view);

        if (typeObj) {
            const parts = [
                prefixObj && prefixObj.name !== '- Bez Prefiksa -' ? prefixObj.name : '',
                typeObj.name,
                viewObj && viewObj.name !== '- Standardni/Bez pogleda -' ? viewObj.name : ''
            ].filter(Boolean);

            const newName = parts.join(' ');
            if (newName !== productState.name) {
                setProductState((prev: any) => ({ ...prev, name: newName }));
            }
        }
    }, [productState.prefix, productState.type, productState.view]);

    return (
        <div className="setup-container">
            <div className="form-grid">
                {/* PRICELIST HEADER */}
                <div className="form-section">
                    <h3><Database size={20} /> Identifikacija Cenovnika</h3>
                    <div className="input-group">
                        <label>ID Cenovnika</label>
                        <input type="text" defaultValue="119" readOnly />
                    </div>
                    <div className="input-group">
                        <label>Naziv Cenovnika</label>
                        <input type="text" placeholder="npr. Early Booking 2026 - Contract A" />
                    </div>

                    <div className="input-group">
                        <label>Naziv Usluge</label>
                        <select
                            className="ai-select"
                            value={productState.service}
                            onChange={e => setProductState((prev: any) => ({ ...prev, service: e.target.value }))}
                        >
                            <option value="" disabled>-- Izaberi Uslugu --</option>
                            {HOTEL_SERVICES.map(service => (
                                <option key={service.id} value={service.code}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ROOM BUILDER UI */}
                    <div className="input-group" style={{ gridColumn: '1 / -1', background: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--pricing-accent)' }}>
                        <label style={{ color: 'var(--pricing-accent)', fontWeight: 'bold', marginBottom: '12px', display: 'block' }}>🏗️ Konfigurator Smeštajne Jedinice</label>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ fontSize: '11px', marginBottom: '4px' }}>Prefiks</label>
                                <select
                                    className="ai-select"
                                    value={productState.prefix}
                                    onChange={e => setProductState((prev: any) => ({ ...prev, prefix: e.target.value }))}
                                >
                                    {ROOM_PREFIXES.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', marginBottom: '4px' }}>Osnovni Tip (Kapacitet)</label>
                                <select
                                    className="ai-select"
                                    value={productState.type}
                                    onChange={e => setProductState((prev: any) => ({ ...prev, type: e.target.value }))}
                                >
                                    <option value="">-- Izaberi Tip --</option>
                                    {ROOM_TYPES.map(t => <option key={t.id} value={t.id}>{t.name} ({t.capacity})</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', marginBottom: '4px' }}>Pogled</label>
                                <select
                                    className="ai-select"
                                    value={productState.view}
                                    onChange={e => setProductState((prev: any) => ({ ...prev, view: e.target.value }))}
                                >
                                    {ROOM_VIEWS.map(v => <option key={v.code} value={v.code}>{v.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Generisan Naziv (Možeš ga ručno promeniti)</label>
                            <input
                                type="text"
                                value={productState.name}
                                onChange={e => setProductState((prev: any) => ({ ...prev, name: e.target.value }))}
                                style={{ fontWeight: 'bold', color: 'var(--pricing-accent)' }}
                                placeholder="Izaberi tip sobe iznad..."
                            />
                        </div>

                        {productState.type && (
                            <div style={{ display: 'flex', gap: '24px', fontSize: '12px', marginTop: '8px', color: 'var(--pricing-text-dim)' }}>
                                <span>🛏️ Osnovnih: <strong>{ROOM_TYPES.find(t => t.id === productState.type)?.basicBeds}</strong></span>
                                <span>🛋️ Pomoćnih: <strong>{ROOM_TYPES.find(t => t.id === productState.type)?.extraBeds}</strong></span>
                                <span>👥 Kapacitet: <strong>{ROOM_TYPES.find(t => t.id === productState.type)?.capacity}</strong></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* VALIDITY DATES */}
                <div className="form-section">
                    <h3><Clock size={20} /> Važenje Cenovnika</h3>
                    <div className="date-box">
                        <h4>📅 Rezervacije kreirane od / do</h4>
                        <p className="hint">Period u kojem je dozvoljeno bukirati po ovim cenama</p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <input type="date" />
                            <input type="date" />
                        </div>
                    </div>

                    <div className="date-box" style={{ marginTop: '24px' }}>
                        <h4>🏨 Boravci od / do</h4>
                        <p className="hint">Period u kojem se vrši realizacija usluge</p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <input type="date" />
                            <input type="date" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MappingView = () => (
    <div className="mapping-view">
        <div className="mapping-header">
            <h3><Zap size={20} /> AI Mapping Engine</h3>
            <p>Poveži spoljne nazive (API/Import) sa tvojom bazom pravila i soba.</p>
        </div>

        <div className="mapping-table">
            <div className="mapping-row header">
                <div>Eksterni Naziv (Izvor)</div>
                <div>Interni Naziv (Baza)</div>
                <div>Status</div>
            </div>

            <div className="mapping-row">
                <div className="ext-val">"API unit showcase" (ID: 56948)</div>
                <div className="int-val">
                    <select>
                        <option>Standardne Soba 1/2</option>
                        <option selected>Superior Soba 1/2+1</option>
                        <option>App 04</option>
                    </select>
                </div>
                <div className="status-mapped">✅ Mapirano</div>
            </div>

            <div className="mapping-row">
                <div className="ext-val">"Reduction on period" (DefID: 15)</div>
                <div className="int-val">
                    <select>
                        <option selected>Popust za određeni period</option>
                        <option>Early Booking</option>
                        <option>Last Minute</option>
                    </select>
                </div>
                <div className="status-mapped">✅ Mapirano</div>
            </div>

            <div className="mapping-row alert">
                <div className="ext-val">"Ecological tax" (DefID: 103)</div>
                <div className="int-val">
                    <button className="btn-secondary btn-small">+ Kreiraj novo pravilo u bazi</button>
                    <span style={{ margin: '0 8px' }}>ili</span>
                    <select>
                        <option>Izaberi iz baze...</option>
                    </select>
                </div>
                <div className="status-new">🆕 Novo</div>
            </div>
        </div>
    </div>
);

const GridView = ({ pricePeriods, setPricePeriods, productName }: { pricePeriods: any[], setPricePeriods: any, productName: string }) => {

    // Helper: Calculate Gross Price from Net + Provision
    const calculateGross = (net: number, provisionPercent: number) => {
        return (net * (1 + provisionPercent / 100)).toFixed(2);
    };



    // Update a specific field in a period
    const updatePeriod = (id: string, field: string, value: any) => {
        setPricePeriods((prev: any[]) => prev.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    // Add new period
    const addNewPeriod = () => {
        const newId = (pricePeriods.length + 1).toString();
        setPricePeriods((prev: any[]) => [...prev, {
            id: newId,
            dateFrom: '',
            dateTo: '',
            basis: 'PER_PERSON_DAY',
            netPrice: 0,
            provisionPercent: 20.00,
            releaseDays: 0,
            minStay: 1,
            maxStay: null,
            minAdults: 1,
            maxAdults: 2,
            minChildren: 0,
            maxChildren: 0,
            arrivalDays: [1, 2, 3, 4, 5, 6, 7]
        }]);
    };

    // Delete period
    const deletePeriod = (id: string) => {
        setPricePeriods((prev: any[]) => prev.filter(p => p.id !== id));
    };

    return (
        <div className="grid-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h3><TableIcon size={20} /> Kalkulacija Osnovnih Cena (Quick Entry)</h3>
                    <p style={{ fontSize: '12px', color: 'var(--pricing-text-dim)', marginTop: '4px' }}>
                        {productName ? `Proizvod: ${productName}` : 'Definiši proizvod u "Header & Product" tabu.'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={16} /> Podešavanja Kolona
                    </button>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={addNewPeriod}>
                        <Plus size={16} /> Dodaj novi period
                    </button>
                </div>
            </div>

            {/* MREŽA ZA RUČNI UNOS */}
            <div className="manual-entry-grid">
                <table className="price-matrix manual-mode">
                    <thead>
                        <tr>
                            <th style={{ width: '200px' }}>Period Boravka</th>
                            <th>Model Obračuna</th>
                            <th>Nabavna €</th>
                            <th>Provizija %</th>
                            <th>Prodajna €</th>
                            <th>Release (D)</th>
                            <th>Min/Max Stay</th>
                            <th>Osobe (Min/Max)</th>
                            <th>Dan Dolaska</th>
                            <th style={{ width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pricePeriods.map(period => (
                            <tr key={period.id}>
                                <td>
                                    <div className="range-display" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                        <Calendar size={14} />
                                        <input
                                            type="date"
                                            value={period.dateFrom}
                                            onChange={e => updatePeriod(period.id, 'dateFrom', e.target.value)}
                                            style={{ width: '110px', fontSize: '11px' }}
                                        />
                                        <span>-</span>
                                        <input
                                            type="date"
                                            value={period.dateTo}
                                            onChange={e => updatePeriod(period.id, 'dateTo', e.target.value)}
                                            style={{ width: '110px', fontSize: '11px' }}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <select
                                        className="cell-select"
                                        value={period.basis}
                                        onChange={e => updatePeriod(period.id, 'basis', e.target.value)}
                                    >
                                        <option value="PER_PERSON_DAY">Per Person / Day</option>
                                        <option value="PER_ROOM_DAY">Per Room / Day</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={period.netPrice}
                                        onChange={e => updatePeriod(period.id, 'netPrice', parseFloat(e.target.value) || 0)}
                                        className="matrix-input"
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={period.provisionPercent}
                                        onChange={e => updatePeriod(period.id, 'provisionPercent', parseFloat(e.target.value) || 0)}
                                        className="matrix-input"
                                        style={{ color: '#f59e0b' }}
                                        step="0.1"
                                    />
                                </td>
                                <td className="gross-val" style={{ fontWeight: 'bold', color: '#10b981' }}>
                                    {calculateGross(period.netPrice, period.provisionPercent)}
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={period.releaseDays || ''}
                                        onChange={e => updatePeriod(period.id, 'releaseDays', parseInt(e.target.value) || 0)}
                                        placeholder="-"
                                        className="matrix-input small"
                                    />
                                </td>
                                <td>
                                    <div className="min-max-box">
                                        <input
                                            type="number"
                                            value={period.minStay}
                                            onChange={e => updatePeriod(period.id, 'minStay', parseInt(e.target.value) || 1)}
                                            className="tiny-input"
                                            title="Min Stay"
                                        />
                                        <span>/</span>
                                        <input
                                            type="number"
                                            value={period.maxStay || ''}
                                            onChange={e => updatePeriod(period.id, 'maxStay', parseInt(e.target.value) || null)}
                                            placeholder="∞"
                                            className="tiny-input"
                                            title="Max Stay"
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="pax-info">
                                        <span title="Odrasli">👤 {period.minAdults}-{period.maxAdults}</span>
                                        <span title="Deca" style={{ color: 'var(--pricing-text-dim)' }}>👶 {period.minChildren}-{period.maxChildren}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="day-dots">
                                        {[1, 2, 3, 4, 5, 6, 7].map(d => (
                                            <span
                                                key={d}
                                                className={`dot ${period.arrivalDays.includes(d) ? 'active' : ''}`}
                                                title={`Dan ${d}`}
                                                onClick={() => {
                                                    const newDays = period.arrivalDays.includes(d)
                                                        ? period.arrivalDays.filter((day: number) => day !== d)
                                                        : [...period.arrivalDays, d].sort();
                                                    updatePeriod(period.id, 'arrivalDays', newDays);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            ></span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className="btn-icon-danger"
                                        onClick={() => deletePeriod(period.id)}
                                        title="Obriši period"
                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {pricePeriods.length === 0 && (
                            <tr>
                                <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: 'var(--pricing-text-dim)' }}>
                                    Nema definisanih perioda. Klikni "Dodaj novi period" da započneš.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="ai-suggestion-box">
                <Bot size={18} />
                <span><strong>AI Savet:</strong> Provizija od 21% je standardna za ovaj period. Ako povećaš release period na 14 dana za Jun, možemo smanjiti rizik neprodatih soba.</span>
                <button className="btn-small">Primeni Release 14</button>
            </div>
        </div>
    );
};

const RulesView = ({ supplements, setSupplements, productName }: { supplements: any[], setSupplements: any, productName: string }) => {

    const calculateGross = (net: number, provisionPercent: number) => {
        return (net * (1 + provisionPercent / 100)).toFixed(2);
    };

    const updateSupplement = (id: string, field: string, value: any) => {
        setSupplements((prev: any[]) => prev.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    const addNewSupplement = (type: 'SUPPLEMENT' | 'DISCOUNT') => {
        const newId = (supplements.length + 1).toString();
        setSupplements((prev: any[]) => [...prev, {
            id: newId,
            type: type,
            title: type === 'SUPPLEMENT' ? 'Nova doplata' : 'Novi popust',
            netPrice: type === 'SUPPLEMENT' ? 0 : undefined,
            provisionPercent: type === 'SUPPLEMENT' ? 20 : undefined,
            percentValue: type === 'DISCOUNT' ? 0 : undefined,
            daysBeforeArrival: type === 'DISCOUNT' ? 0 : undefined,
            childAgeFrom: null,
            childAgeTo: null,
            minAdults: null,
            minChildren: null
        }]);
    };

    const deleteSupplement = (id: string) => {
        setSupplements((prev: any[]) => prev.filter(s => s.id !== id));
    };

    return (
        <div className="rules-container">
            <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--pricing-accent)' }}>
                <h4 style={{ color: 'var(--pricing-accent)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={18} /> AI Dopuna za MARS JSON
                </h4>
                <p style={{ fontSize: '13px', margin: 0 }}>
                    {productName ? `Pravila za: ${productName}` : 'MARS ne šalje uzrast i uslovnu popunjenost. Definiši ih ovde:'}
                </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button className="btn-primary" onClick={() => addNewSupplement('SUPPLEMENT')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} /> Dodaj Doplatu
                </button>
                <button className="btn-secondary" onClick={() => addNewSupplement('DISCOUNT')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} /> Dodaj Popust
                </button>
            </div>

            {/* Rules List */}
            {supplements.map(rule => (
                <div className="rule-card" key={rule.id} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className={rule.type === 'SUPPLEMENT' ? 'tag-supplement' : 'tag-discount'}>
                                {rule.type === 'SUPPLEMENT' ? 'Doplata' : 'Popust'}
                            </span>
                            <input
                                type="text"
                                value={rule.title}
                                onChange={e => updateSupplement(rule.id, 'title', e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px dashed var(--pricing-border)',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: 'var(--pricing-text)',
                                    width: '300px'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {rule.type === 'SUPPLEMENT' && (
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                    Net: <input
                                        type="number"
                                        value={rule.netPrice || 0}
                                        onChange={e => updateSupplement(rule.id, 'netPrice', parseFloat(e.target.value) || 0)}
                                        style={{ width: '70px', background: 'var(--pricing-input-bg)', border: '1px solid var(--pricing-border)', padding: '4px', color: 'var(--pricing-text)' }}
                                        step="0.01"
                                    /> € |
                                    <span style={{ color: '#10b981' }}> Gross: {calculateGross(rule.netPrice || 0, rule.provisionPercent || 20)} €</span>
                                </div>
                            )}
                            {rule.type === 'DISCOUNT' && (
                                <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="number"
                                        value={rule.percentValue || 0}
                                        onChange={e => updateSupplement(rule.id, 'percentValue', parseFloat(e.target.value) || 0)}
                                        style={{ width: '60px', background: 'var(--pricing-input-bg)', border: '1px solid var(--pricing-border)', padding: '4px', color: '#10b981' }}
                                    /> %
                                    <span style={{ color: 'var(--pricing-text-dim)', fontSize: '12px' }}>ako rezervacija</span>
                                    <input
                                        type="number"
                                        value={rule.daysBeforeArrival || 0}
                                        onChange={e => updateSupplement(rule.id, 'daysBeforeArrival', parseInt(e.target.value) || 0)}
                                        style={{ width: '50px', background: 'var(--pricing-input-bg)', border: '1px solid var(--pricing-border)', padding: '4px', color: 'var(--pricing-text)' }}
                                    />
                                    <span style={{ color: 'var(--pricing-text-dim)', fontSize: '12px' }}>dana pre dolaska</span>
                                </div>
                            )}
                            <button
                                onClick={() => deleteSupplement(rule.id)}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                title="Obriši pravilo"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', width: '100%' }}>
                        <div className="cond-group">
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--pricing-text-dim)', marginBottom: '8px' }}>Uzrast deteta (opciono)</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    placeholder="Od"
                                    value={rule.childAgeFrom || ''}
                                    onChange={e => updateSupplement(rule.id, 'childAgeFrom', parseInt(e.target.value) || null)}
                                    style={{ width: '60px', background: 'var(--pricing-input-bg)', border: '1px solid var(--pricing-border)', color: 'var(--pricing-text)', padding: '6px' }}
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Do"
                                    value={rule.childAgeTo || ''}
                                    onChange={e => updateSupplement(rule.id, 'childAgeTo', parseInt(e.target.value) || null)}
                                    style={{ width: '60px', background: 'var(--pricing-input-bg)', border: '1px solid var(--pricing-border)', color: 'var(--pricing-text)', padding: '6px' }}
                                />
                                <span style={{ fontSize: '11px' }}>godina</span>
                            </div>
                        </div>

                        <div className="cond-group">
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--pricing-text-dim)', marginBottom: '8px' }}>Uslov Popunjenosti (opciono)</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px' }}>Min odraslih:</span>
                                <input
                                    type="number"
                                    value={rule.minAdults || ''}
                                    onChange={e => updateSupplement(rule.id, 'minAdults', parseInt(e.target.value) || null)}
                                    style={{ width: '50px', background: 'var(--pricing-input-bg)', border: '1px solid var(--pricing-border)', color: 'var(--pricing-text)', padding: '6px' }}
                                />
                                <span style={{ fontSize: '12px' }}>+ dece:</span>
                                <input
                                    type="number"
                                    value={rule.minChildren || ''}
                                    onChange={e => updateSupplement(rule.id, 'minChildren', parseInt(e.target.value) || null)}
                                    style={{ width: '50px', background: 'var(--pricing-input-bg)', border: '1px solid var(--pricing-border)', color: 'var(--pricing-text)', padding: '6px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {supplements.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--pricing-text-dim)', background: 'var(--pricing-card)', borderRadius: '12px' }}>
                    Nema definisanih pravila. Dodaj doplatu ili popust iznad.
                </div>
            )}
        </div>
    );
};

export default PricingIntelligence;
