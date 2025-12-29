import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    Building2,
    MapPin,
    Star,
    ChevronRight
} from 'lucide-react';
import { loadFromCloud, saveToCloud } from '../utils/storageUtils';
import { useToast } from '../components/ui/Toast';

// Form state type
interface HotelFormData {
    name: string;
    propertyType: string;
    starRating: number;
    isActive: boolean;
    address: {
        addressLine1: string;
        city: string;
        postalCode: string;
        countryCode: string;
    };
    geoCoordinates: {
        latitude: number;
        longitude: number;
    };
    shortDescription: string;
    longDescription: string;
}

const HotelNew: React.FC = () => {
    const navigate = useNavigate();
    const { success, error } = useToast();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<HotelFormData>({
        name: '',
        propertyType: 'Hotel',
        starRating: 4,
        isActive: true,
        address: {
            addressLine1: '',
            city: '',
            postalCode: '',
            countryCode: 'RS',
        },
        geoCoordinates: {
            latitude: 44.7866,
            longitude: 20.4489,
        },
        shortDescription: '',
        longDescription: '',
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAddressChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
        if (!formData.name) {
            error('Greška', 'Naziv hotela je obavezan.');
            return;
        }

        setSaving(true);

        try {
            // Load all hotels to generate new ID and check for duplicates
            const { data: allHotels } = await loadFromCloud('properties');
            let hotels: any[] = allHotels as any[] || [];

            const newId = Date.now().toString(); // Simple ID generation
            const slug = formData.name.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');

            // Build new hotel object
            const newHotel = {
                id: newId,
                name: formData.name,
                location: {
                    address: formData.address.addressLine1,
                    lat: formData.geoCoordinates.latitude,
                    lng: formData.geoCoordinates.longitude,
                    place: formData.address.city,
                },
                images: [],
                amenities: [],
                units: [],
                commonItems: {
                    discount: [],
                    touristTax: [],
                    supplement: [],
                },
                originalPropertyData: {
                    propertyId: newId,
                    propertyType: formData.propertyType,
                    starRating: formData.starRating,
                    isActive: formData.isActive,
                    address: formData.address,
                    geoCoordinates: {
                        latitude: formData.geoCoordinates.latitude,
                        longitude: formData.geoCoordinates.longitude,
                        coordinateSource: 'MANUAL',
                    },
                    content: [{
                        languageCode: 'sr',
                        officialName: formData.name,
                        displayName: formData.name,
                        shortDescription: formData.shortDescription,
                        longDescription: formData.longDescription,
                    }],
                },
            };

            const updatedList = [newHotel, ...hotels];

            // Save to cloud
            await saveToCloud('properties', updatedList);
            localStorage.setItem('olympic_hub_hotels', JSON.stringify(updatedList));

            success('Hotel kreiran!', 'Novi hotel je uspešno dodat u sistem.');
            navigate(`/production/hotels/${slug}`);

        } catch (err) {
            error('Greška', 'Nije moguće kreirati hotel.');
            console.error('Create error:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="module-container fade-in">
            {/* Breadcrumb */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px',
                fontSize: '14px',
                color: 'var(--text-secondary)'
            }}>
                <Link to="/production" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    Produkcija
                </Link>
                <ChevronRight size={14} />
                <Link to="/production/hotels" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    Smeštaj
                </Link>
                <ChevronRight size={14} />
                <span style={{ color: 'var(--accent)' }}>Novi Hotel</span>
            </div>

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => navigate('/production/hotels')}
                        className="btn-icon circle"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                            Novi Hotel
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Unesite detalje za novi smeštajni objekat
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="btn-glass"
                        onClick={() => navigate('/production/hotels')}
                    >
                        <X size={18} /> Otkaži
                    </button>
                    <button
                        className="btn-primary-action"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save size={18} /> {saving ? 'Kreiranje...' : 'Kreiraj Hotel'}
                    </button>
                </div>
            </div>

            {/* Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Basic Info */}
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '24px'
                    }}>
                        <h3 style={{ marginBottom: '20px' }}>Osnovne Informacije</h3>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                    Naziv Hotela *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-main)',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                    }}
                                    placeholder="Npr. Hotel Moskva"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                        Tip Objekta
                                    </label>
                                    <select
                                        value={formData.propertyType}
                                        onChange={(e) => handleInputChange('propertyType', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--bg-main)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <option value="Hotel">Hotel</option>
                                        <option value="Apartment">Apartman</option>
                                        <option value="Villa">Vila</option>
                                        <option value="Resort">Rizort</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                        Broj Zvezdica
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => handleInputChange('starRating', star)}
                                                style={{
                                                    background: star <= formData.starRating ? '#fbbf24' : 'var(--bg-main)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '8px',
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Star
                                                    size={20}
                                                    fill={star <= formData.starRating ? '#fbbf24' : 'transparent'}
                                                    color={star <= formData.starRating ? '#fbbf24' : 'var(--text-secondary)'}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '24px'
                    }}>
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={20} /> Adresa i Lokacija
                        </h3>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                    Ulica i broj
                                </label>
                                <input
                                    type="text"
                                    value={formData.address.addressLine1}
                                    onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-main)',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                        Grad
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address.city}
                                        onChange={(e) => handleAddressChange('city', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--bg-main)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                        Poštanski Broj
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address.postalCode}
                                        onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--bg-main)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                                        Država
                                    </label>
                                    <select
                                        value={formData.address.countryCode}
                                        onChange={(e) => handleAddressChange('countryCode', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--bg-main)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <option value="RS">Srbija</option>
                                        <option value="ME">Crna Gora</option>
                                        <option value="HR">Hrvatska</option>
                                        <option value="BA">BiH</option>
                                        <option value="GR">Grčka</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div>
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '24px',
                        position: 'sticky',
                        top: '24px'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: 'var(--accent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <Building2 size={32} />
                            </div>
                            <h3 style={{ margin: 0 }}>Novi Unos</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>
                                Popunite osnovne podatke. Sobe i cene ćete moći da dodate nakon kreiranja hotela.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                                <span style={{ color: '#10b981', fontWeight: 600 }}>Draft</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Vidljivost:</span>
                                <span>Interno</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelNew;
