import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Truck,
    X,
    ArrowLeft,
    ChevronRight
} from 'lucide-react';

interface SuppliersProps {
    onBack: () => void;
}

const Suppliers: React.FC<SuppliersProps> = ({ onBack }) => {
    const [types, setTypes] = useState(['Hoteli', 'Hotelske grupe i organizacije', 'Touroperatori', 'Prevoznici']);
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const handleAddType = (type: string) => {
        if (!type.trim() || types.includes(type)) return;
        setTypes([...types, type]);
    };

    const handleRemoveType = (type: string) => {
        setTypes(types.filter(t => t !== type));
        if (selectedType === type) setSelectedType(null);
    };

    return (
        <div className="module-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={onBack} className="btn-icon">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Dobavljači</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Upravljanje bazom dobavljača i partnera</p>
                </div>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
                {types.map((type, idx) => (
                    <motion.div
                        key={type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`app-card ${selectedType === type ? 'active-selection' : ''}`}
                        onClick={() => setSelectedType(type)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="card-icon" style={{ background: 'var(--gradient-orange)' }}>
                                <Truck size={24} />
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleRemoveType(type); }} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>
                        <h3 className="card-title">{type}</h3>
                        <div className="card-footer" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: 'var(--accent)' }}>
                            Pregled baze <ChevronRight size={14} />
                        </div>
                    </motion.div>
                ))}

                <div className="app-card" style={{ border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
                    <div style={{ textAlign: 'center' }}>
                        <input
                            type="text"
                            placeholder="Novi tip dobavljača..."
                            className="minimal-input"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddType((e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }}
                        />
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>Pritisnite Enter</p>
                    </div>
                </div>
            </div>

            {selectedType && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="base-view">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Lista: {selectedType}</h3>
                        <button className="btn-primary">Dodaj novi zapis +</button>
                    </div>
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <p>Nema unetih dobavljača u ovoj kategoriji.</p>
                    </div>
                </motion.div>
            )}

            <style>{`
                .btn-icon { background: var(--glass-bg); border: 1px solid var(--border); color: var(--text-primary); padding: 8px; borderRadius: 12px; cursor: pointer; display: flex; align-items: center; }
                .active-selection { border-color: var(--accent) !important; background: rgba(63, 185, 80, 0.05) !important; }
                .minimal-input { background: transparent; border: none; border-bottom: 1px solid var(--border); padding: 8px; color: var(--text-primary); text-align: center; width: 100%; outline: none; }
                .btn-primary { background: var(--accent); color: #fff; border: none; padding: 10px 20px; borderRadius: 12px; fontWeight: 600; cursor: pointer; }
            `}</style>
        </div>
    );
};

export default Suppliers;
