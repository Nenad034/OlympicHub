import React from 'react';
import {
    Users,
    ArrowLeft,
    ChevronRight,
    Briefcase
} from 'lucide-react';

interface CustomersProps {
    onBack: () => void;
}

const Customers: React.FC<CustomersProps> = ({ onBack }) => {
    const categories = [
        { id: 'b2c-ind', name: 'B2C (Individualni putnici)', type: 'B2C' },
        { id: 'b2c-firms', name: 'B2C (Pravna lica - Firme)', type: 'B2C' },
        { id: 'b2b-sub', name: 'B2B (Subagenti)', type: 'B2B' },
        { id: 'b2b-to', name: 'B2B (Touroperatori)', type: 'B2B' }
    ];

    return (
        <div className="module-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={onBack} className="btn-icon">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Kupci</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Upravljanje bazom kupaca i subagenata</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div className="category-group">
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--accent)' }}>B2C Segment</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {categories.filter(c => c.type === 'B2C').map(cat => (
                            <div key={cat.id} className="customer-card">
                                <div className="card-icon-small" style={{ background: 'var(--gradient-blue)' }}>
                                    <Users size={18} />
                                </div>
                                <span style={{ flex: 1, fontWeight: '500' }}>{cat.name}</span>
                                <ChevronRight size={18} color="var(--text-secondary)" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="category-group">
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--accent)' }}>B2B Segment</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {categories.filter(c => c.type === 'B2B').map(cat => (
                            <div key={cat.id} className="customer-card">
                                <div className="card-icon-small" style={{ background: 'var(--gradient-purple)' }}>
                                    <Briefcase size={18} />
                                </div>
                                <span style={{ flex: 1, fontWeight: '500' }}>{cat.name}</span>
                                <ChevronRight size={18} color="var(--text-secondary)" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .btn-icon { background: var(--glass-bg); border: 1px solid var(--border); color: var(--text-primary); padding: 8px; borderRadius: 12px; cursor: pointer; display: flex; align-items: center; }
                .customer-card { background: var(--bg-card); border: 1px solid var(--border); padding: 16px; borderRadius: 16px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all 0.2s; }
                .customer-card:hover { border-color: var(--accent); transform: translateX(5px); background: rgba(63, 185, 80, 0.05); }
                .card-icon-small { width: 36px; height: 36px; borderRadius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; }
            `}</style>
        </div>
    );
};

export default Customers;
