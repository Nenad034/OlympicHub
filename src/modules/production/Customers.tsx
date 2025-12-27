import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    ArrowLeft,
    Briefcase,
    Plus,
    X,
    Mail,
    Phone,
    User,
    MapPin
} from 'lucide-react';
import { exportToJSON, exportToExcel, exportToXML, exportToPDF } from '../../utils/exportUtils';

interface Customer {
    id: string;
    type: 'B2C' | 'B2B';
    category: string;
    fname: string;
    lname: string;
    email: string;
    phone: string;
    firmName?: string;
    cui?: string; // Tax ID
    iban?: string;
    bank?: string;
    address: string;
    city: string;
    country: string;
    identityNo?: string; // Passport/ID
    newsletter: boolean;
}

interface CustomersProps {
    onBack: () => void;
}

const Customers: React.FC<CustomersProps> = ({ onBack }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'B2C' | 'B2B'>('B2C');
    const [formData, setFormData] = useState<Partial<Customer>>({
        type: 'B2C',
        country: 'RS',
        newsletter: true
    });

    const b2cCategories = ['Individualni putnici', 'Pravna lica (Firme)'];
    const b2bCategories = ['Subagenti', 'Touroperatori'];

    const handleAddCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        const newCustomer = {
            ...formData,
            id: Math.random().toString(36).substr(2, 9)
        } as Customer;
        setCustomers([...customers, newCustomer]);
        setShowAddForm(false);
    };

    const handleExport = (format: 'json' | 'excel' | 'xml' | 'pdf') => {
        const filtered = customers.filter(c => c.type === selectedTab);
        if (filtered.length === 0) return alert('Nema kupaca za export');
        switch (format) {
            case 'json': exportToJSON(filtered, `kupci_${selectedTab}`); break;
            case 'excel': exportToExcel(filtered, `kupci_${selectedTab}`); break;
            case 'xml': exportToXML(filtered, `kupci_${selectedTab}`); break;
            case 'pdf': exportToPDF(filtered, `kupci_${selectedTab}`, `Baza Kupaca - ${selectedTab}`); break;
        }
    };

    return (
        <div className="module-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} className="btn-icon"><ArrowLeft size={20} /></button>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Kupci</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Upravljanje bazom putnika i subagenata</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setShowAddForm(true)} className="btn-primary">
                        <Plus size={18} /> Dodaj Kupca
                    </button>
                    <div className="export-group">
                        <button className="btn-secondary" onClick={() => handleExport('json')}>JSON</button>
                        <button className="btn-secondary" onClick={() => handleExport('excel')}>XLSX</button>
                        <button className="btn-secondary" onClick={() => handleExport('pdf')}>PDF</button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <button
                    onClick={() => setSelectedTab('B2C')}
                    className={`nav-btn ${selectedTab === 'B2C' ? 'active' : ''}`}
                >
                    <Users size={18} /> B2C Segment
                </button>
                <button
                    onClick={() => setSelectedTab('B2B')}
                    className={`nav-btn ${selectedTab === 'B2B' ? 'active' : ''}`}
                >
                    <Briefcase size={18} /> B2B Segment
                </button>
            </div>

            <div className="customers-list">
                {customers.filter(c => c.type === selectedTab).length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <User size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.3 }} />
                        <p style={{ color: 'var(--text-secondary)' }}>Nema unetih kupaca u {selectedTab} segmentu.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {customers.filter(c => c.type === selectedTab).map(c => (
                            <motion.div key={c.id} layout className="app-card" style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{c.fname} {c.lname}</h3>
                                {c.firmName && <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent)', marginBottom: '12px' }}>{c.firmName}</div>}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <div><Mail size={12} /> {c.email}</div>
                                    <div><Phone size={12} /> {c.phone}</div>
                                    <div><MapPin size={12} /> {c.city}, {c.country}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h3>Novi Kupac</h3>
                                <button onClick={() => setShowAddForm(false)} className="btn-icon"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAddCustomer} className="form-grid">
                                <div className="form-item">
                                    <label>Tip</label>
                                    <select onChange={e => setFormData({ ...formData, type: e.target.value as any })} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px', color: 'var(--text-primary)' }}>
                                        <option value="B2C">B2C</option>
                                        <option value="B2B">B2B</option>
                                    </select>
                                </div>
                                <div className="form-item">
                                    <label>Kategorija</label>
                                    <select onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px', color: 'var(--text-primary)' }}>
                                        {formData.type === 'B2B' ? b2bCategories.map(cat => <option key={cat}>{cat}</option>) : b2cCategories.map(cat => <option key={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="form-item">
                                    <label>Ime</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, fname: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Prezime</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, lname: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Email</label>
                                    <input required type="email" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Telefon</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Firma (opciono)</label>
                                    <input type="text" onChange={e => setFormData({ ...formData, firmName: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>PIB / CUI</label>
                                    <input type="text" onChange={e => setFormData({ ...formData, cui: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Grad</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Država</label>
                                    <input required type="text" defaultValue="RS" onChange={e => setFormData({ ...formData, country: e.target.value })} />
                                </div>
                                <div className="form-item" style={{ gridColumn: 'span 2' }}>
                                    <label>Adresa</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                                <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '20px', padding: '15px' }}>
                                    Sačuvaj Kupca
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .btn-icon { background: var(--glass-bg); border: 1px solid var(--border); color: var(--text-primary); padding: 8px; borderRadius: 12px; cursor: pointer; display: flex; align-items: center; }
                .btn-primary { background: var(--accent); color: #fff; border: none; padding: 10px 20px; borderRadius: 12px; fontWeight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
                .btn-secondary { background: var(--glass-bg); border: 1px solid var(--border); color: var(--text-primary); padding: 10px 15px; borderRadius: 10px; cursor: pointer; font-size: 12px; font-weight: 600; }
                .export-group { display: flex; background: var(--glass-bg); padding: 4px; borderRadius: 14px; border: 1px solid var(--border); gap: 4px; }
                .nav-btn { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary); padding: 12px 24px; borderRadius: 16px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 600; }
                .nav-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justifyContent: center; z-index: 1000; }
                .modal-content { background: var(--bg-main); border: 1px solid var(--border); padding: 40px; borderRadius: 32px; width: 600px; max-height: 90vh; overflowY: auto; }
                .form-grid { display: grid; gridTemplateColumns: 1fr 1fr; gap: 20px; }
                .form-item { display: flex; flexDirection: column; gap: 8px; }
                .form-item label { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
                .form-item input { background: var(--bg-card); border: 1px solid var(--border); padding: 12px; borderRadius: 12px; color: var(--text-primary); }
            `}</style>
        </div>
    );
};

export default Customers;
