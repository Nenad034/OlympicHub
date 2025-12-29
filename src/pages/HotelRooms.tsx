import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Bed,
    Users,
    ChevronRight,
    AlertCircle,
    Info,
    LayoutGrid,
    Search
} from 'lucide-react';
import { loadFromCloud, saveToCloud } from '../utils/storageUtils';
import { useToast } from '../components/ui/Toast';

interface RoomUnit {
    id: string;
    unitName: string;
    unitType: string;
    maxOccupancy: number;
    basePrice?: number;
    description?: string;
}

interface Hotel {
    id: string;
    name: string;
    units: RoomUnit[];
}

const HotelRooms: React.FC = () => {
    const { hotelSlug } = useParams<{ hotelSlug: string }>();
    const navigate = useNavigate();
    const { success, error } = useToast();

    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRoom, setNewRoom] = useState<Partial<RoomUnit>>({
        unitName: '',
        unitType: 'Double Room',
        maxOccupancy: 2,
    });

    useEffect(() => {
        const loadHotel = async () => {
            setLoading(true);
            const { data } = await loadFromCloud('properties');
            let hotels: any[] = data as any[] || [];

            const foundHotel = hotels.find(h => {
                const slug = h.name.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');
                return slug === hotelSlug || h.id.toString() === hotelSlug;
            });

            if (foundHotel) {
                setHotel(foundHotel);
            }
            setLoading(false);
        };
        loadHotel();
    }, [hotelSlug]);

    const handleAddRoom = async () => {
        if (!hotel || !newRoom.unitName) return;

        const updatedRoom = {
            ...newRoom,
            id: Date.now().toString(),
        } as RoomUnit;

        const updatedHotel = {
            ...hotel,
            units: [...hotel.units, updatedRoom]
        };

        try {
            const { data: allHotels } = await loadFromCloud('properties');
            let hotels: any[] = allHotels as any[] || [];

            const updatedList = hotels.map(h => (h.id === hotel.id ? updatedHotel : h));

            await saveToCloud('properties', updatedList);
            localStorage.setItem('olympic_hub_hotels', JSON.stringify(updatedList));

            setHotel(updatedHotel);
            setIsAddModalOpen(false);
            setNewRoom({ unitName: '', unitType: 'Double Room', maxOccupancy: 2 });
            success('Soba dodata', `Soba ${updatedRoom.unitName} je uspešno dodata.`);
        } catch (err) {
            error('Greška', 'Nije moguće dodati sobu.');
        }
    };

    const handleDeleteRoom = async (roomId: string) => {
        if (!hotel) return;

        const updatedUnits = hotel.units.filter(u => u.id !== roomId);
        const updatedHotel = { ...hotel, units: updatedUnits };

        try {
            const { data: allHotels } = await loadFromCloud('properties');
            let hotels: any[] = allHotels as any[] || [];

            const updatedList = hotels.map(h => (h.id === hotel.id ? updatedHotel : h));

            await saveToCloud('properties', updatedList);
            localStorage.setItem('olympic_hub_hotels', JSON.stringify(updatedList));

            setHotel(updatedHotel);
            success('Soba obrisana', 'Soba je uklonjena iz hotela.');
        } catch (err) {
            error('Greška', 'Nije moguće obrisati sobu.');
        }
    };

    const filteredUnits = hotel?.units.filter(u =>
        u.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.unitType.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div className="module-container fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ color: 'var(--accent)' }}>
                    <LayoutGrid size={48} />
                </motion.div>
            </div>
        );
    }

    if (!hotel) return <div className="module-container">Hotel nije pronađen.</div>;

    return (
        <div className="module-container fade-in">
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <Link to="/production" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Produkcija</Link>
                <ChevronRight size={14} />
                <Link to="/production/hotels" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Smeštaj</Link>
                <ChevronRight size={14} />
                <Link to={`/production/hotels/${hotelSlug}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{hotel.name}</Link>
                <ChevronRight size={14} />
                <span style={{ color: 'var(--accent)' }}>Upravljanje sobama</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate(`/production/hotels/${hotelSlug}`)} className="btn-icon circle">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>Sobe i Jedinice</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{hotel.name} • {hotel.units.length} tipova soba u bazi</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Pretraži sobe..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '10px 16px 10px 36px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-card)',
                                borderRadius: '10px',
                                color: 'var(--text-primary)',
                                width: '240px'
                            }}
                        />
                    </div>
                    <button className="btn-primary-action" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} /> Dodaj Novu Sobu
                    </button>
                </div>
            </div>

            {/* Room Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {filteredUnits.length > 0 ? (
                    filteredUnits.map(unit => (
                        <motion.div
                            key={unit.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--accent)' }}>
                                        <Bed size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{unit.unitName}</h4>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{unit.unitType}</div>
                                    </div>
                                </div>
                                <button className="btn-icon" onClick={() => handleDeleteRoom(unit.id)} style={{ color: '#ef4444' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Users size={16} color="var(--text-secondary)" />
                                    <div style={{ fontSize: '13px' }}>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Kapacitet</div>
                                        <div style={{ fontWeight: '600' }}>{unit.maxOccupancy} Pers.</div>
                                    </div>
                                </div>
                                <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Info size={16} color="var(--text-secondary)" />
                                    <div style={{ fontSize: '13px' }}>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>ID Koda</div>
                                        <div style={{ fontWeight: '600' }}>#{unit.id.slice(-4)}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', background: 'var(--bg-card)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                        <div style={{ opacity: 0.5, marginBottom: '16px' }}>
                            <AlertCircle size={48} style={{ margin: '0 auto' }} />
                        </div>
                        <h3>Nema soba</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Nije pronađena nijedna soba koja odgovara vašoj pretrazi.</p>
                    </div>
                )}
            </div>

            {/* Add Room Modal Overlay */}
            {isAddModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '32px', width: '450px', maxWidth: '90vw' }}
                    >
                        <h2 style={{ marginTop: 0 }}>Dodaj Sobu</h2>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>Naziv Jedinice</label>
                                <input
                                    type="text"
                                    value={newRoom.unitName}
                                    onChange={e => setNewRoom({ ...newRoom, unitName: e.target.value })}
                                    placeholder="Npr. Standard Soba Pogled More"
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>Tip Sobe</label>
                                    <select
                                        value={newRoom.unitType}
                                        onChange={e => setNewRoom({ ...newRoom, unitType: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                                    >
                                        <option value="Single Room">Single Room</option>
                                        <option value="Double Room">Double Room</option>
                                        <option value="Twin Room">Twin Room</option>
                                        <option value="Suite">Suite</option>
                                        <option value="Apartment">Apartment</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>Maks. Osoba</label>
                                    <input
                                        type="number"
                                        value={newRoom.maxOccupancy}
                                        onChange={e => setNewRoom({ ...newRoom, maxOccupancy: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button className="btn-glass" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1 }}>Otkaži</button>
                            <button className="btn-primary-action" onClick={handleAddRoom} style={{ flex: 1 }}>Dodaj</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default HotelRooms;
