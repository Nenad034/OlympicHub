import React, { useState } from 'react';
import { Plus, Bed, Trash2, Grid, List } from 'lucide-react';
import type { StepProps } from '../types';
import type { RoomType, BeddingConfiguration } from '../../../types/property.types';

const RoomsStep: React.FC<StepProps> = ({ data, onChange }) => {
    const [editingRoom, setEditingRoom] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const addRoom = () => {
        const newRoom: RoomType = {
            roomTypeId: Math.random().toString(36).substr(2, 9),
            code: `ROOM_${(data.roomTypes?.length || 0) + 1}`,
            nameInternal: '',
            category: 'Room',
            standardOccupancy: 2,
            maxAdults: 2,
            maxChildren: 0,
            maxOccupancy: 2,
            minOccupancy: 1,
            bathroomCount: 1,
            bathroomType: 'Private',
            beddingConfigurations: [],
            amenities: [],
            images: []
        };
        onChange({ roomTypes: [...(data.roomTypes || []), newRoom] });
        setEditingRoom((data.roomTypes?.length || 0));
    };

    const updateRoom = (index: number, updates: Partial<RoomType>) => {
        const newRooms = [...(data.roomTypes || [])];
        newRooms[index] = { ...newRooms[index], ...updates };
        onChange({ roomTypes: newRooms });
    };

    const deleteRoom = (index: number) => {
        const newRooms = data.roomTypes?.filter((_, i) => i !== index) || [];
        onChange({ roomTypes: newRooms });
        setEditingRoom(null);
    };

    const addBedding = (roomIndex: number) => {
        const room = data.roomTypes?.[roomIndex];
        if (!room) return;

        const newBedding: BeddingConfiguration = {
            bedTypeCode: 'DOUBLE',
            quantity: 1,
            isExtraBed: false
        };

        updateRoom(roomIndex, {
            beddingConfigurations: [...room.beddingConfigurations, newBedding]
        });
    };

    const updateBedding = (roomIndex: number, beddingIndex: number, updates: Partial<BeddingConfiguration>) => {
        const room = data.roomTypes?.[roomIndex];
        if (!room) return;

        const newBedding = [...room.beddingConfigurations];
        newBedding[beddingIndex] = { ...newBedding[beddingIndex], ...updates };
        updateRoom(roomIndex, { beddingConfigurations: newBedding });
    };

    const deleteBedding = (roomIndex: number, beddingIndex: number) => {
        const room = data.roomTypes?.[roomIndex];
        if (!room) return;

        const newBedding = room.beddingConfigurations.filter((_, i) => i !== beddingIndex);
        updateRoom(roomIndex, { beddingConfigurations: newBedding });
    };

    return (
        <div>
            <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 className="form-section-title" style={{ margin: 0 }}>Smeštajne Jedinice</h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', borderRadius: '8px', padding: '4px', border: '1px solid var(--border)' }}>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    padding: '8px 12px',
                                    background: viewMode === 'grid' ? 'var(--accent)' : 'transparent',
                                    color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Grid size={16} /> Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    padding: '8px 12px',
                                    background: viewMode === 'list' ? 'var(--accent)' : 'transparent',
                                    color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <List size={16} /> Lista
                            </button>
                        </div>
                        <button className="btn-primary" onClick={addRoom} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={18} /> Dodaj Sobu
                        </button>
                    </div>
                </div>

                {(!data.roomTypes || data.roomTypes.length === 0) && (
                    <div style={{
                        padding: '60px',
                        textAlign: 'center',
                        background: 'var(--bg-card)',
                        border: '2px dashed var(--border)',
                        borderRadius: '16px',
                        color: 'var(--text-secondary)'
                    }}>
                        <Bed size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <p>Nema definisanih soba. Kliknite "Dodaj Sobu" da započnete.</p>
                    </div>
                )}

                <div style={{
                    display: viewMode === 'grid' ? 'grid' : 'flex',
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : undefined,
                    flexDirection: viewMode === 'list' ? 'column' : undefined,
                    gap: '16px'
                }}>
                    {data.roomTypes?.map((room, roomIndex) => (
                        <div key={room.roomTypeId} style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            padding: '24px',
                            position: 'relative',
                            display: viewMode === 'list' ? 'flex' : 'block',
                            alignItems: viewMode === 'list' ? 'center' : undefined,
                            gap: viewMode === 'list' ? '20px' : undefined
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: viewMode === 'grid' ? '20px' : '0',
                                flex: viewMode === 'list' ? 1 : undefined
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: viewMode === 'list' ? '16px' : '0', flex: 1 }}>
                                    {viewMode === 'list' && (
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                                            <Bed size={24} />
                                        </div>
                                    )}
                                    <div style={{ flex: viewMode === 'list' ? 1 : undefined }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                                            {room.nameInternal || `Soba ${roomIndex + 1}`}
                                        </h4>
                                        {viewMode === 'list' && (
                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                #{room.code} • {room.standardOccupancy} osoba
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => {
                                            const roomToCopy = data.roomTypes?.[roomIndex];
                                            if (roomToCopy) {
                                                const copiedRoom = { ...roomToCopy, roomTypeId: Math.random().toString(36).substr(2, 9), code: `${roomToCopy.code}_COPY`, nameInternal: `${roomToCopy.nameInternal} - Kopija` };
                                                onChange({ roomTypes: [...(data.roomTypes || []), copiedRoom] });
                                            }
                                        }}
                                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <Plus size={16} /> Kopiraj
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => setEditingRoom(editingRoom === roomIndex ? null : roomIndex)}
                                        style={{ padding: '8px 16px' }}
                                    >
                                        {editingRoom === roomIndex ? 'Zatvori' : 'Uredi'}
                                    </button>
                                    <button
                                        onClick={() => deleteRoom(roomIndex)}
                                        style={{
                                            padding: '8px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '8px',
                                            color: '#ef4444',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {editingRoom === roomIndex && (
                                <div>
                                    <div className="form-grid">
                                        <div className="form-group span-2">
                                            <label className="form-label required">Naziv Sobe</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Deluxe Dvokrevetna Soba sa Pogledom na More"
                                                value={room.nameInternal}
                                                onChange={(e) => updateRoom(roomIndex, { nameInternal: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label required">Interni Kod</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="DBL_DLX_01"
                                                value={room.code}
                                                onChange={(e) => updateRoom(roomIndex, { code: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label required">Kategorija</label>
                                            <select
                                                className="form-select"
                                                value={room.category}
                                                onChange={(e) => updateRoom(roomIndex, { category: e.target.value as any })}
                                            >
                                                <option value="Room">Room (Standardna soba)</option>
                                                <option value="Suite">Suite (Apartman sa dnevnim boravkom)</option>
                                                <option value="Apartment">Apartment (Sa kuhinjom)</option>
                                                <option value="Dormitory">Dormitory (Spavaonica)</option>
                                                <option value="Villa">Villa (Zasebna kuća)</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Kvadratura (m²)</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={room.sizeSqm || ''}
                                                onChange={(e) => updateRoom(roomIndex, { sizeSqm: Number(e.target.value) })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Pogled</label>
                                            <select
                                                className="form-select"
                                                value={room.viewType || ''}
                                                onChange={(e) => updateRoom(roomIndex, { viewType: e.target.value as any || undefined })}
                                            >
                                                <option value="">Bez pogleda</option>
                                                <option value="SeaView">Pogled na More</option>
                                                <option value="GardenView">Pogled na Baštu</option>
                                                <option value="CityView">Pogled na Grad</option>
                                                <option value="PoolView">Pogled na Bazen</option>
                                                <option value="MountainView">Pogled na Planinu</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '24px' }}>
                                        <h5 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Popunjenost (Occupancy)</h5>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label className="form-label required">Standardna Popunjenost</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    min="1"
                                                    value={room.standardOccupancy}
                                                    onChange={(e) => updateRoom(roomIndex, { standardOccupancy: Number(e.target.value) })}
                                                />
                                                <small style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                    Broj gostiju uključen u osnovnu cenu
                                                </small>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label required">Max Odraslih</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    min="1"
                                                    value={room.maxAdults}
                                                    onChange={(e) => updateRoom(roomIndex, { maxAdults: Number(e.target.value) })}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Max Dece</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    min="0"
                                                    value={room.maxChildren}
                                                    onChange={(e) => updateRoom(roomIndex, { maxChildren: Number(e.target.value) })}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label required">Max Ukupno</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    min="1"
                                                    value={room.maxOccupancy}
                                                    onChange={(e) => updateRoom(roomIndex, { maxOccupancy: Number(e.target.value) })}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Min Osoba</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    min="1"
                                                    value={room.minOccupancy}
                                                    onChange={(e) => updateRoom(roomIndex, { minOccupancy: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h5 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Konfiguracija Kreveta (OTA Standard)</h5>
                                            <button
                                                className="btn-secondary"
                                                onClick={() => addBedding(roomIndex)}
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                            >
                                                <Plus size={14} /> Dodaj Krevet
                                            </button>
                                        </div>

                                        {room.beddingConfigurations.map((bedding, beddingIndex) => (
                                            <div key={beddingIndex} style={{
                                                background: 'rgba(0,0,0,0.2)',
                                                padding: '16px',
                                                borderRadius: '12px',
                                                marginBottom: '12px',
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 1fr 1fr auto',
                                                gap: '12px',
                                                alignItems: 'end'
                                            }}>
                                                <div className="form-group" style={{ margin: 0 }}>
                                                    <label className="form-label">Tip Kreveta</label>
                                                    <select
                                                        className="form-select"
                                                        value={bedding.bedTypeCode}
                                                        onChange={(e) => updateBedding(roomIndex, beddingIndex, { bedTypeCode: e.target.value as any })}
                                                    >
                                                        <option value="KING">King (&gt;180cm)</option>
                                                        <option value="QUEEN">Queen (150-180cm)</option>
                                                        <option value="DOUBLE">Double (130-150cm)</option>
                                                        <option value="TWIN">Twin (90-130cm)</option>
                                                        <option value="SOFA_BED">Sofa Bed</option>
                                                        <option value="BUNK_BED">Bunk Bed (Krevet na sprat)</option>
                                                    </select>
                                                </div>

                                                <div className="form-group" style={{ margin: 0 }}>
                                                    <label className="form-label">Količina</label>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        min="1"
                                                        value={bedding.quantity}
                                                        onChange={(e) => updateBedding(roomIndex, beddingIndex, { quantity: Number(e.target.value) })}
                                                    />
                                                </div>

                                                <div className="form-checkbox" style={{ margin: 0, paddingBottom: '12px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={bedding.isExtraBed}
                                                        onChange={(e) => updateBedding(roomIndex, beddingIndex, { isExtraBed: e.target.checked })}
                                                    />
                                                    <label style={{ fontSize: '13px' }}>Pomoćni</label>
                                                </div>

                                                <button
                                                    onClick={() => deleteBedding(roomIndex, beddingIndex)}
                                                    style={{
                                                        padding: '8px',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                        borderRadius: '8px',
                                                        color: '#ef4444',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}

                                        {room.beddingConfigurations.length === 0 && (
                                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                Nije definisan nijedan krevet. Kliknite "Dodaj Krevet".
                                            </p>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '24px' }}>
                                        <h5 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Kupatilo</h5>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label className="form-label">Broj Kupatila</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    min="1"
                                                    value={room.bathroomCount}
                                                    onChange={(e) => updateRoom(roomIndex, { bathroomCount: Number(e.target.value) })}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Tip Kupatila</label>
                                                <select
                                                    className="form-select"
                                                    value={room.bathroomType}
                                                    onChange={(e) => updateRoom(roomIndex, { bathroomType: e.target.value as any })}
                                                >
                                                    <option value="Private">Privatno</option>
                                                    <option value="Shared">Deljeno</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {editingRoom !== roomIndex && (
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                                    <div className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', position: 'static' }}>
                                        {room.category}
                                    </div>
                                    <div className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', position: 'static' }}>
                                        Max: {room.maxOccupancy} osoba
                                    </div>
                                    <div className="badge" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', position: 'static' }}>
                                        {room.beddingConfigurations.length} kreveta
                                    </div>
                                    {room.sizeSqm && (
                                        <div className="badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', position: 'static' }}>
                                            {room.sizeSqm}m²
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoomsStep;
