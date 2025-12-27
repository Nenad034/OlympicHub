import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Plane,
    Bus,
    Car,
    MapPin,
    Ticket,
    Users,
    User,
    Anchor,
    ArrowLeft,
    ShoppingBag,
    Briefcase,
    X,
    Settings2,
    ListPlus,
    Truck,
    UserCheck,
    Contact2
} from 'lucide-react';

interface ProductionItem {
    id: string;
    title: string;
    icon: React.ReactNode;
    color: string;
    options: string[];
    category: 'services' | 'entities';
}

interface ProductionHubProps {
    onBack: () => void;
    lang: string;
    userLevel: number;
}

const ProductionHub: React.FC<ProductionHubProps> = ({ onBack }) => {
    const [selectedItem, setSelectedItem] = useState<ProductionItem | null>(null);
    const [items, setItems] = useState<ProductionItem[]>([
        {
            id: 'accommodation',
            title: 'Smeštaj',
            icon: <Building2 size={24} />,
            color: 'var(--gradient-blue)',
            options: ['Hotel', 'Apartman', 'Vila', 'Resort', 'Bungalov', 'Hostel'],
            category: 'services'
        },
        {
            id: 'trips',
            title: 'Putovanja',
            icon: <MapPin size={24} />,
            color: 'var(--gradient-purple)',
            options: ['Avion', 'Autobus', 'Voz', 'Brod'],
            category: 'services'
        },
        {
            id: 'flights',
            title: 'Avio karte',
            icon: <Plane size={24} />,
            color: 'var(--gradient-orange)',
            options: ['Redovne linije', 'Low cost', 'Individualni upiti', 'Čarteri'],
            category: 'services'
        },
        {
            id: 'transport',
            title: 'Prevoz',
            icon: <Bus size={24} />,
            color: 'var(--gradient-green)',
            options: ['Sopstveni prevoz', 'Avion', 'Autobus', 'Voz', 'Brod'],
            category: 'services'
        },
        {
            id: 'transfers',
            title: 'Transferi',
            icon: <Car size={24} />,
            color: 'var(--gradient-blue)',
            options: ['Avion', 'Mini bus', 'Autobus', 'Brod', 'Voz', 'Automobil', 'Rent-a car', 'Uber'],
            category: 'services'
        },
        {
            id: 'extra',
            title: 'Extra usluge',
            icon: <Ticket size={24} />,
            color: 'var(--gradient-purple)',
            options: ['Vodiči', 'Izleti', 'Ulaznice', 'Obroci', 'Osiguranje', 'SPA paketi'],
            category: 'services'
        },
        {
            id: 'suppliers',
            title: 'Dobavljači',
            icon: <Truck size={24} />,
            color: 'var(--gradient-orange)',
            options: ['Hoteli', 'Hotelske grupe', 'Organizacije', 'Touroperatori', 'Prevoznici'],
            category: 'entities'
        },
        {
            id: 'customers',
            title: 'Kupci',
            icon: <UserCheck size={24} />,
            color: 'var(--gradient-green)',
            options: ['B2C - Individualni putnici', 'B2C - Pravna lica', 'B2B - Subagenti', 'B2B - Touroperatori'],
            category: 'entities'
        }
    ]);

    const packages = [
        {
            id: 'group-dynamic',
            title: 'Grupni Dinamički paketi',
            desc: 'avion + smeštaj + transfer + extra usluge',
            icon: <Users size={24} />,
            color: 'rgba(57, 118, 245, 0.1)',
            borderColor: '#3976f5'
        },
        {
            id: 'ind-dynamic',
            title: 'Individualni dinamički paketi',
            desc: 'avion + smeštaj + transfer + extra usluge',
            icon: <User size={24} />,
            color: 'rgba(188, 140, 255, 0.1)',
            borderColor: '#bc8cff'
        },
        {
            id: 'charters',
            title: 'Čarteri',
            desc: 'avion + smeštaj + transfer',
            icon: <Anchor size={24} />,
            color: 'rgba(63, 185, 80, 0.1)',
            borderColor: '#3fb950'
        }
    ];

    const handleAddOption = (itemId: string, option: string) => {
        if (!option.trim()) return;
        setItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, options: [...item.options, option] } : item
        ));
        if (selectedItem?.id === itemId) {
            setSelectedItem(prev => prev ? { ...prev, options: [...prev.options, option] } : null);
        }
    };

    const handleRemoveOption = (itemId: string, option: string) => {
        setItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, options: item.options.filter(o => o !== option) } : item
        ));
        if (selectedItem?.id === itemId) {
            setSelectedItem(prev => prev ? { ...prev, options: prev.options.filter(o => o !== option) } : null);
        }
    };

    return (
        <div className="module-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        padding: '8px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Produkcija</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Upravljanje turističkim proizvodima i partnerima</p>
                </div>
            </div>

            {/* Main Services */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShoppingBag size={20} color="var(--accent)" /> Glavne stavke
                    </h3>
                </div>

                <div className="dashboard-grid">
                    {items.filter(i => i.category === 'services').map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`app-card ${selectedItem?.id === item.id ? 'active-selection' : ''}`}
                            onClick={() => setSelectedItem(item)}
                            style={{ paddingBottom: '16px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div className="card-icon" style={{ background: item.color, marginBottom: 0 }}>
                                    {item.icon}
                                </div>
                                <div style={{ color: 'var(--accent)', opacity: selectedItem?.id === item.id ? 1 : 0 }}>
                                    <Settings2 size={18} />
                                </div>
                            </div>
                            <h3 className="card-title">{item.title}</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                                {item.options.slice(0, 4).map(opt => (
                                    <span key={opt} style={{ fontSize: '11px', background: 'var(--glass-bg)', padding: '4px 8px', borderRadius: '6px', color: 'var(--text-secondary)' }}>
                                        {opt}
                                    </span>
                                ))}
                                {item.options.length > 4 && (
                                    <span style={{ fontSize: '11px', background: 'var(--glass-bg)', padding: '4px 8px', borderRadius: '6px', color: 'var(--accent)' }}>
                                        +{item.options.length - 4} još
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Partners & Entities */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Contact2 size={20} color="var(--accent)" /> Partneri i baze
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                    {items.filter(i => i.category === 'entities').map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            className={`app-card ${selectedItem?.id === item.id ? 'active-selection' : ''}`}
                            onClick={() => setSelectedItem(item)}
                            style={{ display: 'flex', gap: '20px', alignItems: 'center' }}
                        >
                            <div className="card-icon" style={{ background: item.color, marginBottom: 0, flexShrink: 0 }}>
                                {item.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 className="card-title" style={{ marginBottom: '4px' }}>{item.title}</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {item.options.map(opt => (
                                        <span key={opt} style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>• {opt}</span>
                                    ))}
                                </div>
                            </div>
                            <Settings2 size={18} style={{ color: 'var(--accent)', opacity: selectedItem?.id === item.id ? 1 : 0.3 }} />
                        </motion.div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--accent)',
                            borderRadius: '24px',
                            padding: '30px',
                            marginBottom: '40px',
                            position: 'relative'
                        }}
                    >
                        <button
                            onClick={() => setSelectedItem(null)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: selectedItem.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {selectedItem.icon}
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Upravljanje: {selectedItem.title}</h3>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                            {selectedItem.options.map(opt => (
                                <div key={opt} style={{
                                    background: 'var(--glass-bg)',
                                    padding: '8px 16px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid var(--border)'
                                }}>
                                    <span style={{ fontSize: '14px' }}>{opt}</span>
                                    <button
                                        onClick={() => handleRemoveOption(selectedItem.id, opt)}
                                        style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', display: 'flex', padding: '2px' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Dodaj novu opciju..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddOption(selectedItem.id, (e.target as HTMLInputElement).value);
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: '1px dashed var(--border)',
                                        padding: '8px 16px',
                                        borderRadius: '12px',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        width: '200px'
                                    }}
                                />
                                <ListPlus size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={20} color="var(--accent)" /> Specijalne kategorije (Paketi)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    {packages.map((pkg, idx) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            style={{
                                background: pkg.color,
                                border: `1px solid ${pkg.borderColor}44`,
                                borderRadius: '24px',
                                padding: '24px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '14px',
                                    background: 'var(--bg-card)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: pkg.borderColor,
                                    border: `1px solid ${pkg.borderColor}44`
                                }}>
                                    {pkg.icon}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>{pkg.title}</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{pkg.desc}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button style={{
                                    flex: 1,
                                    background: pkg.borderColor,
                                    color: '#fff',
                                    border: 'none',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}>
                                    Kreiraj novi
                                </button>
                                <button style={{
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-primary)',
                                    border: `1px solid ${pkg.borderColor}44`,
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}>
                                    Lista
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
        .module-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .active-selection {
          border-color: var(--accent) !important;
          background: rgba(63, 185, 80, 0.05) !important;
        }
      `}</style>
        </div>
    );
};

export default ProductionHub;
