import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    MapPin,
    Globe,
    Image as ImageIcon,
    Bed,
    DollarSign,
    Shield,
    Key,
    User,
    ChevronRight,
    ChevronLeft,
    Check,
    X,
    Plus,
    Trash2,
    AlertCircle
} from 'lucide-react';
import type { Property, PropertyContent, RoomType, BeddingConfiguration, PropertyAmenity, RatePlan, HouseRules, KeyCollection, HostProfile, Tax } from '../../types/property.types';
import { validateProperty } from '../../types/property.types';

interface PropertyWizardProps {
    onClose: () => void;
    onSave: (property: Partial<Property>) => void;
}

const PropertyWizard: React.FC<PropertyWizardProps> = ({ onClose, onSave }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [propertyData, setPropertyData] = useState<Partial<Property>>({
        propertyType: 'Hotel',
        isActive: false,
        content: [],
        roomTypes: [],
        propertyAmenities: [],
        ratePlans: [],
        taxes: [],
        pointsOfInterest: [],
        images: []
    });
    const [errors, setErrors] = useState<string[]>([]);

    const steps = [
        { id: 'basic', title: 'Osnovni Podaci', icon: <Building2 size={20} /> },
        { id: 'location', title: 'Lokacija', icon: <MapPin size={20} /> },
        { id: 'content', title: 'Sadržaj', icon: <Globe size={20} /> },
        { id: 'images', title: 'Slike', icon: <ImageIcon size={20} /> },
        { id: 'rooms', title: 'Sobe', icon: <Bed size={20} /> },
        { id: 'amenities', title: 'Sadržaji', icon: <Shield size={20} /> },
        { id: 'rates', title: 'Cene', icon: <DollarSign size={20} /> },
        { id: 'policies', title: 'Pravila', icon: <Key size={20} /> }
    ];

    const updateProperty = (updates: Partial<Property>) => {
        setPropertyData(prev => ({ ...prev, ...updates }));
    };

    const handleNext = () => {
        const validationErrors = validateProperty(propertyData);
        if (validationErrors.length > 0 && currentStep === steps.length - 1) {
            setErrors(validationErrors);
            return;
        }
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            setErrors([]);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setErrors([]);
        }
    };

    const handleSave = () => {
        const validationErrors = validateProperty(propertyData);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }
        onSave(propertyData);
    };

    const renderStepContent = () => {
        switch (steps[currentStep].id) {
            case 'basic':
                return <BasicInfoStep data={propertyData} onChange={updateProperty} />;
            case 'location':
                return <LocationStep data={propertyData} onChange={updateProperty} />;
            case 'content':
                return <ContentStep data={propertyData} onChange={updateProperty} />;
            case 'images':
                return <ImagesStep data={propertyData} onChange={updateProperty} />;
            case 'rooms':
                return <RoomsStep data={propertyData} onChange={updateProperty} />;
            case 'amenities':
                return <AmenitiesStep data={propertyData} onChange={updateProperty} />;
            case 'rates':
                return <RatesStep data={propertyData} onChange={updateProperty} />;
            case 'policies':
                return <PoliciesStep data={propertyData} onChange={updateProperty} />;
            default:
                return null;
        }
    };

    return (
        <div className="wizard-overlay">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="wizard-container"
            >
                {/* Header */}
                <div className="wizard-header">
                    <h2>Kreiranje Novog Objekta (OTA Standard)</h2>
                    <button onClick={onClose} className="close-btn"><X size={24} /></button>
                </div>

                {/* Progress Steps */}
                <div className="wizard-steps">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`step-item ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                            onClick={() => setCurrentStep(index)}
                        >
                            <div className="step-icon">
                                {index < currentStep ? <Check size={16} /> : step.icon}
                            </div>
                            <span className="step-title">{step.title}</span>
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="wizard-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderStepContent()}
                        </motion.div>
                    </AnimatePresence>

                    {/* Validation Errors */}
                    {errors.length > 0 && (
                        <div className="validation-errors">
                            <AlertCircle size={20} />
                            <div>
                                <strong>Greške u validaciji:</strong>
                                <ul>
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="wizard-footer">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="btn-secondary"
                    >
                        <ChevronLeft size={18} /> Nazad
                    </button>
                    <div className="step-indicator">
                        Korak {currentStep + 1} od {steps.length}
                    </div>
                    {currentStep < steps.length - 1 ? (
                        <button onClick={handleNext} className="btn-primary">
                            Sledeće <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button onClick={handleSave} className="btn-primary">
                            <Check size={18} /> Sačuvaj Objekat
                        </button>
                    )}
                </div>
            </motion.div>

            <style>{`
                .wizard-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(10px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .wizard-container {
                    background: var(--bg-main);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    width: 100%;
                    max-width: 1200px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .wizard-header {
                    padding: 24px 32px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .wizard-header h2 {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0;
                }

                .wizard-steps {
                    display: flex;
                    padding: 24px 32px;
                    gap: 8px;
                    overflow-x: auto;
                    border-bottom: 1px solid var(--border);
                }

                .step-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: 0.2s;
                    min-width: 120px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                }

                .step-item:hover {
                    background: var(--glass-bg);
                }

                .step-item.active {
                    background: var(--accent-glow);
                    border-color: var(--accent);
                }

                .step-item.completed {
                    background: rgba(63, 185, 80, 0.1);
                    border-color: var(--accent);
                }

                .step-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--glass-bg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary);
                }

                .step-item.active .step-icon {
                    background: var(--accent);
                    color: #fff;
                }

                .step-item.completed .step-icon {
                    background: var(--accent);
                    color: #fff;
                }

                .step-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-align: center;
                }

                .step-item.active .step-title {
                    color: var(--accent);
                }

                .wizard-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 32px;
                }

                .wizard-footer {
                    padding: 20px 32px;
                    border-top: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .step-indicator {
                    font-size: 14px;
                    color: var(--text-secondary);
                    font-weight: 600;
                }

                .validation-errors {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 12px;
                    padding: 16px;
                    margin-top: 24px;
                    display: flex;
                    gap: 12px;
                    color: #ef4444;
                }

                .validation-errors ul {
                    margin: 8px 0 0 0;
                    padding-left: 20px;
                }

                .validation-errors li {
                    margin: 4px 0;
                }

                .form-section {
                    margin-bottom: 32px;
                }

                .form-section-title {
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    color: var(--text-primary);
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .form-grid.single {
                    grid-template-columns: 1fr;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group.span-2 {
                    grid-column: span 2;
                }

                .form-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .form-label.required::after {
                    content: '*';
                    color: #ef4444;
                    margin-left: 4px;
                }

                .form-input {
                    padding: 12px 16px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    color: var(--text-primary);
                    font-size: 14px;
                    outline: none;
                    transition: 0.2s;
                }

                .form-input:focus {
                    border-color: var(--accent);
                }

                .form-select {
                    padding: 12px 16px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    color: var(--text-primary);
                    font-size: 14px;
                    outline: none;
                    cursor: pointer;
                }

                .form-textarea {
                    padding: 12px 16px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    color: var(--text-primary);
                    font-size: 14px;
                    outline: none;
                    resize: vertical;
                    min-height: 100px;
                }

                .form-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }

                .form-checkbox input {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

// Step Components
const BasicInfoStep: React.FC<{ data: Partial<Property>; onChange: (updates: Partial<Property>) => void }> = ({ data, onChange }) => {
    return (
        <div>
            <div className="form-section">
                <h3 className="form-section-title">Tip i Klasifikacija Objekta</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label required">Tip Smeštaja</label>
                        <select
                            className="form-select"
                            value={data.propertyType || 'Hotel'}
                            onChange={(e) => onChange({ propertyType: e.target.value as any })}
                        >
                            <option value="Hotel">Hotel</option>
                            <option value="Apartment">Apartman</option>
                            <option value="Villa">Vila</option>
                            <option value="Resort">Resort</option>
                            <option value="Hostel">Hostel</option>
                            <option value="GuestHouse">Pansion</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Broj Zvezdica</label>
                        <select
                            className="form-select"
                            value={data.starRating || ''}
                            onChange={(e) => onChange({ starRating: e.target.value ? Number(e.target.value) : undefined })}
                        >
                            <option value="">Nije kategorisano</option>
                            <option value="1">1 Zvezdica</option>
                            <option value="2">2 Zvezdice</option>
                            <option value="3">3 Zvezdice</option>
                            <option value="4">4 Zvezdice</option>
                            <option value="5">5 Zvezdica</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Chain Code (Lanac)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="npr. MC za Marriott"
                            value={data.chainCode || ''}
                            onChange={(e) => onChange({ chainCode: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Brand Code (Brend)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="npr. CY za Courtyard"
                            value={data.brandCode || ''}
                            onChange={(e) => onChange({ brandCode: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section-title">Identifikatori</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Legal Entity ID</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="PIB ili matični broj"
                            value={data.identifiers?.legalEntityId || ''}
                            onChange={(e) => onChange({
                                identifiers: { ...data.identifiers, legalEntityId: e.target.value } as any
                            })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">PMS ID</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="ID iz Property Management System-a"
                            value={data.identifiers?.pmsId || ''}
                            onChange={(e) => onChange({
                                identifiers: { ...data.identifiers, pmsId: e.target.value } as any
                            })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const LocationStep: React.FC<{ data: Partial<Property>; onChange: (updates: Partial<Property>) => void }> = ({ data, onChange }) => {
    return (
        <div>
            <div className="form-section">
                <h3 className="form-section-title">Fizička Adresa</h3>
                <div className="form-grid">
                    <div className="form-group span-2">
                        <label className="form-label required">Ulica i Broj</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="npr. Knez Mihailova 12"
                            value={data.address?.addressLine1 || ''}
                            onChange={(e) => onChange({
                                address: { ...data.address, addressLine1: e.target.value } as any
                            })}
                        />
                    </div>

                    <div className="form-group span-2">
                        <label className="form-label">Dodatak Adrese</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Sprat, stan, zgrada..."
                            value={data.address?.addressLine2 || ''}
                            onChange={(e) => onChange({
                                address: { ...data.address, addressLine2: e.target.value } as any
                            })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Grad</label>
                        <input
                            type="text"
                            className="form-input"
                            value={data.address?.city || ''}
                            onChange={(e) => onChange({
                                address: { ...data.address, city: e.target.value } as any
                            })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Poštanski Broj</label>
                        <input
                            type="text"
                            className="form-input"
                            value={data.address?.postalCode || ''}
                            onChange={(e) => onChange({
                                address: { ...data.address, postalCode: e.target.value } as any
                            })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Država (ISO Kod)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="RS, ME, HR..."
                            maxLength={2}
                            value={data.address?.countryCode || ''}
                            onChange={(e) => onChange({
                                address: { ...data.address, countryCode: e.target.value.toUpperCase() } as any
                            })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Pokrajina/Država (ISO)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Za SAD, Kanadu, Australiju..."
                            value={data.address?.stateProvince || ''}
                            onChange={(e) => onChange({
                                address: { ...data.address, stateProvince: e.target.value } as any
                            })}
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section-title">GPS Koordinate</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Geografska Širina (Latitude)</label>
                        <input
                            type="number"
                            step="0.000001"
                            className="form-input"
                            placeholder="44.786568"
                            value={data.geoCoordinates?.latitude || ''}
                            onChange={(e) => onChange({
                                geoCoordinates: { ...data.geoCoordinates, latitude: Number(e.target.value) } as any
                            })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Geografska Dužina (Longitude)</label>
                        <input
                            type="number"
                            step="0.000001"
                            className="form-input"
                            placeholder="20.448921"
                            value={data.geoCoordinates?.longitude || ''}
                            onChange={(e) => onChange({
                                geoCoordinates: { ...data.geoCoordinates, longitude: Number(e.target.value) } as any
                            })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Izvor Koordinata</label>
                        <select
                            className="form-select"
                            value={data.geoCoordinates?.coordinateSource || 'MAP_PIN'}
                            onChange={(e) => onChange({
                                geoCoordinates: { ...data.geoCoordinates, coordinateSource: e.target.value as any } as any
                            })}
                        >
                            <option value="GPS_DEVICE">GPS Uređaj</option>
                            <option value="MAP_PIN">Mapa (Pin)</option>
                            <option value="ADDRESS_GEOCODING">Geocoding</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Google Place ID</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="ChIJ..."
                            value={data.geoCoordinates?.googlePlaceId || ''}
                            onChange={(e) => onChange({
                                geoCoordinates: { ...data.geoCoordinates, googlePlaceId: e.target.value } as any
                            })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContentStep: React.FC<{ data: Partial<Property>; onChange: (updates: Partial<Property>) => void }> = ({ data, onChange }) => {
    const [selectedLang, setSelectedLang] = useState('sr');

    const currentContent = data.content?.find(c => c.languageCode === selectedLang) || {
        languageCode: selectedLang,
        officialName: '',
        displayName: '',
        shortDescription: '',
        longDescription: '',
        locationDescription: '',
        policyText: ''
    };

    const updateContent = (updates: Partial<PropertyContent>) => {
        const newContent = data.content?.filter(c => c.languageCode !== selectedLang) || [];
        newContent.push({ ...currentContent, ...updates } as PropertyContent);
        onChange({ content: newContent });
    };

    return (
        <div>
            <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="form-section-title" style={{ margin: 0 }}>Tekstualni Sadržaj</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className={`btn-${selectedLang === 'sr' ? 'primary' : 'secondary'}`}
                            onClick={() => setSelectedLang('sr')}
                            style={{ padding: '8px 16px' }}
                        >
                            Srpski
                        </button>
                        <button
                            className={`btn-${selectedLang === 'en' ? 'primary' : 'secondary'}`}
                            onClick={() => setSelectedLang('en')}
                            style={{ padding: '8px 16px' }}
                        >
                            English
                        </button>
                    </div>
                </div>

                <div className="form-grid single">
                    <div className="form-group">
                        <label className="form-label required">Zvanični Naziv</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Hotel Moskva doo"
                            value={currentContent.officialName}
                            onChange={(e) => updateContent({ officialName: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Prikazni Naziv (Marketing)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Hotel Moskva - City Center"
                            value={currentContent.displayName}
                            onChange={(e) => updateContent({ displayName: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Kratak Opis (max 300 karaktera)</label>
                        <textarea
                            className="form-textarea"
                            maxLength={300}
                            placeholder="Za mobilne aplikacije i brzi pregled..."
                            value={currentContent.shortDescription}
                            onChange={(e) => updateContent({ shortDescription: e.target.value })}
                            style={{ minHeight: '80px' }}
                        />
                        <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                            {currentContent.shortDescription?.length || 0}/300
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Detaljan Opis (2000+ karaktera)</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Za detaljne stranice i SEO..."
                            value={currentContent.longDescription}
                            onChange={(e) => updateContent({ longDescription: e.target.value })}
                            style={{ minHeight: '200px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Opis Lokacije</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Opis kraja/komšiluka..."
                            value={currentContent.locationDescription}
                            onChange={(e) => updateContent({ locationDescription: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Pravila Kuće (Polisa)</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Sitna slova o pravilima..."
                            value={currentContent.policyText}
                            onChange={(e) => updateContent({ policyText: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Placeholder components for other steps
const ImagesStep: React.FC<{ data: Partial<Property>; onChange: (updates: Partial<Property>) => void }> = () => (
    <div className="form-section">
        <h3 className="form-section-title">Slike Objekta</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Upload slika - u razvoju...</p>
    </div>
);

const RoomsStep: React.FC<{ data: Partial<Property>; onChange: (updates: Partial<Property>) => void }> = ({ data, onChange }) => {
    const [editingRoom, setEditingRoom] = useState<number | null>(null);

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
                    <button className="btn-primary" onClick={addRoom} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Dodaj Sobu
                    </button>
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

                {data.roomTypes?.map((room, roomIndex) => (
                    <div key={room.roomTypeId} style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                                {room.nameInternal || `Soba ${roomIndex + 1}`}
                            </h4>
                            <div style={{ display: 'flex', gap: '8px' }}>
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
    );
};

const AmenitiesStep: React.FC<{ data: Partial<Property>; onChange: (updates: Partial<Property>) => void }> = ({ data, onChange }) => {
    const [selectedCategory, setSelectedCategory] = useState('General');

    // OTA Standard Amenity Codes
    const amenityCategories = {
        'General': [
            { code: 'WiFi_Free', name: 'WiFi Besplatan', icon: '📶' },
            { code: 'WiFi_Paid', name: 'WiFi Plaćen', icon: '📶' },
            { code: 'Parking_Free', name: 'Parking Besplatan', icon: '🅿️' },
            { code: 'Parking_Paid', name: 'Parking Plaćen', icon: '🅿️' },
            { code: 'Restaurant', name: 'Restoran', icon: '🍽️' },
            { code: 'Bar', name: 'Bar', icon: '🍸' },
            { code: 'RoomService', name: 'Sobna Usluga', icon: '🛎️' },
            { code: 'Reception24h', name: 'Recepcija 24h', icon: '🏨' },
            { code: 'Elevator', name: 'Lift', icon: '🛗' },
            { code: 'AirportShuttle', name: 'Transfer do Aerodroma', icon: '🚐' }
        ],
        'Wellness': [
            { code: 'Pool_Indoor', name: 'Bazen Unutrašnji', icon: '🏊' },
            { code: 'Pool_Outdoor', name: 'Bazen Spoljašnji', icon: '🏊' },
            { code: 'Pool_Heated', name: 'Bazen Grejan', icon: '🏊' },
            { code: 'Spa', name: 'Spa', icon: '💆' },
            { code: 'Sauna', name: 'Sauna', icon: '🧖' },
            { code: 'Gym', name: 'Teretana', icon: '💪' },
            { code: 'Massage', name: 'Masaža', icon: '💆' },
            { code: 'HotTub', name: 'Đakuzi', icon: '🛁' }
        ],
        'Family': [
            { code: 'KidsClub', name: 'Dečiji Klub', icon: '👶' },
            { code: 'Playground', name: 'Igralište', icon: '🎪' },
            { code: 'Babysitting', name: 'Čuvanje Dece', icon: '👶' },
            { code: 'FamilyRooms', name: 'Porodične Sobe', icon: '👨‍👩‍👧‍👦' }
        ],
        'Business': [
            { code: 'BusinessCenter', name: 'Poslovni Centar', icon: '💼' },
            { code: 'MeetingRooms', name: 'Sale za Sastanke', icon: '🏢' },
            { code: 'ConferenceRoom', name: 'Konferencijska Sala', icon: '🎤' }
        ],
        'Sports': [
            { code: 'Tennis', name: 'Tenis', icon: '🎾' },
            { code: 'Golf', name: 'Golf', icon: '⛳' },
            { code: 'Skiing', name: 'Skijanje', icon: '⛷️' },
            { code: 'WaterSports', name: 'Vodeni Sportovi', icon: '🏄' },
            { code: 'Bicycle', name: 'Bicikli', icon: '🚴' }
        ]
    };

    const toggleAmenity = (code: string, name: string) => {
        const currentAmenities = data.propertyAmenities || [];
        const exists = currentAmenities.find(a => a.otaCode === code);

        if (exists) {
            // Remove
            onChange({
                propertyAmenities: currentAmenities.filter(a => a.otaCode !== code)
            });
        } else {
            // Add
            const newAmenity: PropertyAmenity = {
                amenityId: Math.random().toString(36).substr(2, 9),
                otaCode: code,
                name: name,
                category: selectedCategory,
                isFree: true,
                onSite: true,
                reservationRequired: false,
                propertyId: data.identifiers?.internalId || ''
            };
            onChange({
                propertyAmenities: [...currentAmenities, newAmenity]
            });
        }
    };

    const isSelected = (code: string) => {
        return data.propertyAmenities?.some(a => a.otaCode === code) || false;
    };

    const updateAmenityDetails = (code: string, updates: Partial<PropertyAmenity>) => {
        const currentAmenities = data.propertyAmenities || [];
        const updatedAmenities = currentAmenities.map(a =>
            a.otaCode === code ? { ...a, ...updates } : a
        );
        onChange({ propertyAmenities: updatedAmenities });
    };

    return (
        <div>
            <div className="form-section">
                <h3 className="form-section-title">Sadržaji Objekta (OTA Standard)</h3>

                {/* Category Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {Object.keys(amenityCategories).map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                background: selectedCategory === category ? 'var(--accent)' : 'var(--bg-card)',
                                color: selectedCategory === category ? '#fff' : 'var(--text-primary)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Amenities Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '12px',
                    marginBottom: '24px'
                }}>
                    {amenityCategories[selectedCategory as keyof typeof amenityCategories].map(amenity => {
                        const selected = isSelected(amenity.code);
                        return (
                            <div
                                key={amenity.code}
                                onClick={() => toggleAmenity(amenity.code, amenity.name)}
                                style={{
                                    padding: '16px',
                                    background: selected ? 'var(--accent-glow)' : 'var(--bg-card)',
                                    border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                <span style={{ fontSize: '24px' }}>{amenity.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{amenity.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{amenity.code}</div>
                                </div>
                                {selected && (
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'var(--accent)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff'
                                    }}>
                                        <Check size={16} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Selected Amenities Summary */}
                {data.propertyAmenities && data.propertyAmenities.length > 0 && (
                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '20px',
                        marginTop: '24px'
                    }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>
                            Izabrani Sadržaji ({data.propertyAmenities.length})
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {data.propertyAmenities.map(amenity => (
                                <div key={amenity.amenityId} style={{
                                    background: 'var(--bg-card)',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto auto auto',
                                    gap: '12px',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '13px' }}>{amenity.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{amenity.otaCode}</div>
                                    </div>

                                    <label className="form-checkbox" style={{ margin: 0 }}>
                                        <input
                                            type="checkbox"
                                            checked={amenity.isFree}
                                            onChange={(e) => updateAmenityDetails(amenity.otaCode, { isFree: e.target.checked })}
                                        />
                                        <span style={{ fontSize: '12px' }}>Besplatno</span>
                                    </label>

                                    <label className="form-checkbox" style={{ margin: 0 }}>
                                        <input
                                            type="checkbox"
                                            checked={amenity.onSite}
                                            onChange={(e) => updateAmenityDetails(amenity.otaCode, { onSite: e.target.checked })}
                                        />
                                        <span style={{ fontSize: '12px' }}>Na Licu Mesta</span>
                                    </label>

                                    <label className="form-checkbox" style={{ margin: 0 }}>
                                        <input
                                            type="checkbox"
                                            checked={amenity.reservationRequired}
                                            onChange={(e) => updateAmenityDetails(amenity.otaCode, { reservationRequired: e.target.checked })}
                                        />
                                        <span style={{ fontSize: '12px' }}>Rezervacija</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(!data.propertyAmenities || data.propertyAmenities.length === 0) && (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        background: 'var(--bg-card)',
                        border: '2px dashed var(--border)',
                        borderRadius: '16px',
                        color: 'var(--text-secondary)'
                    }}>
                        <Shield size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p>Nema izabranih sadržaja. Kliknite na stavke iznad da ih dodate.</p>
                    </div>
                )}
            </div>

            <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '24px'
            }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <AlertCircle size={20} style={{ color: '#a855f7', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '13px', color: '#a855f7' }}>
                        <strong>OTA Amenity Codes:</strong>
                        <p style={{ margin: '8px 0 0 0', lineHeight: '1.5' }}>
                            Ovi kodovi su standardizovani prema OpenTravel Alliance specifikaciji i koriste se za integraciju sa Booking.com, Expedia i drugim OTA platformama.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RatesStep: React.FC<{ data: Partial<Property>; onChange: (updates: Partial<Property>) => void }> = ({ data, onChange }) => {
    const [editingRate, setEditingRate] = useState<number | null>(null);

    const addRatePlan = () => {
        if (!data.roomTypes || data.roomTypes.length === 0) {
            alert('Prvo morate dodati sobe pre kreiranja cenovnih planova!');
            return;
        }

        const newRate: RatePlan = {
            ratePlanId: Math.random().toString(36).substr(2, 9),
            roomTypeId: data.roomTypes[0].roomTypeId,
            name: '',
            mealPlanCode: 'RO',
            cancellationPolicy: {
                policyType: 'FreeCancellation',
                rules: []
            },
            paymentMode: 'HOTEL_COLLECT',
            basePrice: 0,
            currency: 'EUR'
        };

        onChange({ ratePlans: [...(data.ratePlans || []), newRate] });
        setEditingRate((data.ratePlans?.length || 0));
    };

    const updateRate = (index: number, updates: Partial<RatePlan>) => {
        const newRates = [...(data.ratePlans || [])];
        newRates[index] = { ...newRates[index], ...updates };
        onChange({ ratePlans: newRates });
    };

    const deleteRate = (index: number) => {
        const newRates = data.ratePlans?.filter((_, i) => i !== index) || [];
        onChange({ ratePlans: newRates });
        setEditingRate(null);
    };

    const addCancellationRule = (rateIndex: number) => {
        const rate = data.ratePlans?.[rateIndex];
        if (!rate) return;

        const newRule = {
            offsetUnit: 'Day' as const,
            offsetValue: 1,
            penaltyType: 'Percent' as const,
            penaltyValue: 100
        };

        updateRate(rateIndex, {
            cancellationPolicy: {
                ...rate.cancellationPolicy,
                rules: [...rate.cancellationPolicy.rules, newRule]
            }
        });
    };

    const updateCancellationRule = (rateIndex: number, ruleIndex: number, updates: any) => {
        const rate = data.ratePlans?.[rateIndex];
        if (!rate) return;

        const newRules = [...rate.cancellationPolicy.rules];
        newRules[ruleIndex] = { ...newRules[ruleIndex], ...updates };

        updateRate(rateIndex, {
            cancellationPolicy: {
                ...rate.cancellationPolicy,
                rules: newRules
            }
        });
    };

    const deleteCancellationRule = (rateIndex: number, ruleIndex: number) => {
        const rate = data.ratePlans?.[rateIndex];
        if (!rate) return;

        const newRules = rate.cancellationPolicy.rules.filter((_, i) => i !== ruleIndex);
        updateRate(rateIndex, {
            cancellationPolicy: {
                ...rate.cancellationPolicy,
                rules: newRules
            }
        });
    };

    const addTax = () => {
        const newTax: Tax = {
            taxType: 'VAT',
            calculationType: 'Percent',
            value: 0,
            currency: 'EUR'
        };
        onChange({ taxes: [...(data.taxes || []), newTax] });
    };

    const updateTax = (index: number, updates: Partial<Tax>) => {
        const newTaxes = [...(data.taxes || [])];
        newTaxes[index] = { ...newTaxes[index], ...updates };
        onChange({ taxes: newTaxes });
    };

    const deleteTax = (index: number) => {
        const newTaxes = data.taxes?.filter((_, i) => i !== index) || [];
        onChange({ taxes: newTaxes });
    };

    return (
        <div>
            <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 className="form-section-title" style={{ margin: 0 }}>Cenovni Planovi (Rate Plans)</h3>
                    <button className="btn-primary" onClick={addRatePlan} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Dodaj Rate Plan
                    </button>
                </div>

                {(!data.ratePlans || data.ratePlans.length === 0) && (
                    <div style={{
                        padding: '60px',
                        textAlign: 'center',
                        background: 'var(--bg-card)',
                        border: '2px dashed var(--border)',
                        borderRadius: '16px',
                        color: 'var(--text-secondary)'
                    }}>
                        <DollarSign size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <p>Nema definisanih cenovnih planova. Kliknite "Dodaj Rate Plan".</p>
                    </div>
                )}

                {data.ratePlans?.map((rate, rateIndex) => (
                    <div key={rate.ratePlanId} style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                                {rate.name || `Rate Plan ${rateIndex + 1}`}
                            </h4>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setEditingRate(editingRate === rateIndex ? null : rateIndex)}
                                    style={{ padding: '8px 16px' }}
                                >
                                    {editingRate === rateIndex ? 'Zatvori' : 'Uredi'}
                                </button>
                                <button
                                    onClick={() => deleteRate(rateIndex)}
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

                        {editingRate === rateIndex && (
                            <div>
                                <div className="form-grid">
                                    <div className="form-group span-2">
                                        <label className="form-label required">Naziv Rate Plana</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="npr. Standard Rate, Early Bird, Last Minute"
                                            value={rate.name}
                                            onChange={(e) => updateRate(rateIndex, { name: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Tip Sobe</label>
                                        <select
                                            className="form-select"
                                            value={rate.roomTypeId}
                                            onChange={(e) => updateRate(rateIndex, { roomTypeId: e.target.value })}
                                        >
                                            {data.roomTypes?.map(room => (
                                                <option key={room.roomTypeId} value={room.roomTypeId}>
                                                    {room.nameInternal || room.code}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Meal Plan (Obrok)</label>
                                        <select
                                            className="form-select"
                                            value={rate.mealPlanCode}
                                            onChange={(e) => updateRate(rateIndex, { mealPlanCode: e.target.value as any })}
                                        >
                                            <option value="RO">RO - Room Only (Samo Soba)</option>
                                            <option value="BB">BB - Bed & Breakfast (Noćenje sa Doručkom)</option>
                                            <option value="HB">HB - Half Board (Polupansion)</option>
                                            <option value="FB">FB - Full Board (Pansion)</option>
                                            <option value="AI">AI - All Inclusive (Sve Uključeno)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Bazna Cena</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="0.00"
                                            value={rate.basePrice || ''}
                                            onChange={(e) => updateRate(rateIndex, { basePrice: Number(e.target.value) })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Valuta</label>
                                        <select
                                            className="form-select"
                                            value={rate.currency || 'EUR'}
                                            onChange={(e) => updateRate(rateIndex, { currency: e.target.value })}
                                        >
                                            <option value="EUR">EUR</option>
                                            <option value="USD">USD</option>
                                            <option value="RSD">RSD</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Način Plaćanja</label>
                                        <select
                                            className="form-select"
                                            value={rate.paymentMode}
                                            onChange={(e) => updateRate(rateIndex, { paymentMode: e.target.value as any })}
                                        >
                                            <option value="HOTEL_COLLECT">Hotel Collect (Plaćanje u hotelu)</option>
                                            <option value="PREPAY">Prepay (Predplaćeno)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Min Length of Stay</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="1"
                                            value={rate.minLOS || ''}
                                            onChange={(e) => updateRate(rateIndex, { minLOS: e.target.value ? Number(e.target.value) : undefined })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Max Length of Stay</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="Neograničeno"
                                            value={rate.maxLOS || ''}
                                            onChange={(e) => updateRate(rateIndex, { maxLOS: e.target.value ? Number(e.target.value) : undefined })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Cut-Off Days</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="0"
                                            value={rate.cutOffDays || ''}
                                            onChange={(e) => updateRate(rateIndex, { cutOffDays: e.target.value ? Number(e.target.value) : undefined })}
                                        />
                                        <small style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            Broj dana pre dolaska kada se zatvara rezervacija
                                        </small>
                                    </div>
                                </div>

                                {/* Cancellation Policy */}
                                <div style={{ marginTop: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h5 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Cancellation Policy</h5>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <select
                                                className="form-select"
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                value={rate.cancellationPolicy.policyType}
                                                onChange={(e) => updateRate(rateIndex, {
                                                    cancellationPolicy: {
                                                        ...rate.cancellationPolicy,
                                                        policyType: e.target.value as any
                                                    }
                                                })}
                                            >
                                                <option value="FreeCancellation">Free Cancellation</option>
                                                <option value="PartiallyRefundable">Partially Refundable</option>
                                                <option value="NonRefundable">Non-Refundable</option>
                                            </select>
                                            <button
                                                className="btn-secondary"
                                                onClick={() => addCancellationRule(rateIndex)}
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                            >
                                                <Plus size={14} /> Dodaj Pravilo
                                            </button>
                                        </div>
                                    </div>

                                    {rate.cancellationPolicy.rules.map((rule, ruleIndex) => (
                                        <div key={ruleIndex} style={{
                                            background: 'rgba(0,0,0,0.2)',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            marginBottom: '12px',
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                                            gap: '12px',
                                            alignItems: 'end'
                                        }}>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Jedinica</label>
                                                <select
                                                    className="form-select"
                                                    value={rule.offsetUnit}
                                                    onChange={(e) => updateCancellationRule(rateIndex, ruleIndex, { offsetUnit: e.target.value })}
                                                >
                                                    <option value="Day">Dana</option>
                                                    <option value="Hour">Sati</option>
                                                </select>
                                            </div>

                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Vrednost</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    value={rule.offsetValue}
                                                    onChange={(e) => updateCancellationRule(rateIndex, ruleIndex, { offsetValue: Number(e.target.value) })}
                                                />
                                            </div>

                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Tip Penala</label>
                                                <select
                                                    className="form-select"
                                                    value={rule.penaltyType}
                                                    onChange={(e) => updateCancellationRule(rateIndex, ruleIndex, { penaltyType: e.target.value })}
                                                >
                                                    <option value="Percent">Procenat</option>
                                                    <option value="FixedAmount">Fiksni Iznos</option>
                                                </select>
                                            </div>

                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Penal</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    value={rule.penaltyValue}
                                                    onChange={(e) => updateCancellationRule(rateIndex, ruleIndex, { penaltyValue: Number(e.target.value) })}
                                                />
                                            </div>

                                            <button
                                                onClick={() => deleteCancellationRule(rateIndex, ruleIndex)}
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

                                    {rate.cancellationPolicy.rules.length === 0 && (
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                            Nema definisanih pravila. Kliknite "Dodaj Pravilo".
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {editingRate !== rateIndex && (
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                                <div className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', position: 'static' }}>
                                    {rate.mealPlanCode}
                                </div>
                                <div className="badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', position: 'static' }}>
                                    {rate.basePrice} {rate.currency}
                                </div>
                                <div className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', position: 'static' }}>
                                    {rate.cancellationPolicy.policyType}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Taxes Section */}
            <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 className="form-section-title" style={{ margin: 0 }}>Porezi i Takse</h3>
                    <button className="btn-secondary" onClick={addTax} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Dodaj Porez
                    </button>
                </div>

                {data.taxes && data.taxes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {data.taxes.map((tax, index) => (
                            <div key={index} style={{
                                background: 'var(--bg-card)',
                                padding: '16px',
                                borderRadius: '12px',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                                gap: '12px',
                                alignItems: 'end'
                            }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Tip Poreza</label>
                                    <select
                                        className="form-select"
                                        value={tax.taxType}
                                        onChange={(e) => updateTax(index, { taxType: e.target.value as any })}
                                    >
                                        <option value="VAT">VAT (PDV)</option>
                                        <option value="CityTax">City Tax (Boravišna Taksa)</option>
                                        <option value="CleaningFee">Cleaning Fee</option>
                                        <option value="ResortFee">Resort Fee</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Način Obračuna</label>
                                    <select
                                        className="form-select"
                                        value={tax.calculationType}
                                        onChange={(e) => updateTax(index, { calculationType: e.target.value as any })}
                                    >
                                        <option value="Percent">Procenat</option>
                                        <option value="PerPerson">Po Osobi</option>
                                        <option value="PerNight">Po Noćenju</option>
                                        <option value="PerStay">Po Boravku</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Vrednost</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={tax.value}
                                        onChange={(e) => updateTax(index, { value: Number(e.target.value) })}
                                    />
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Valuta</label>
                                    <select
                                        className="form-select"
                                        value={tax.currency || 'EUR'}
                                        onChange={(e) => updateTax(index, { currency: e.target.value })}
                                    >
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                        <option value="RSD">RSD</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => deleteTax(index)}
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
                    </div>
                ) : (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Nema definisanih poreza. Kliknite "Dodaj Porez".
                    </p>
                )}
            </div>

            <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '24px'
            }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <AlertCircle size={20} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '13px', color: '#22c55e' }}>
                        <strong>Rate Plans & Pricing:</strong>
                        <p style={{ margin: '8px 0 0 0', lineHeight: '1.5' }}>
                            Rate Plans definišu kako se cene primenjuju na različite sobe i uslove. Cancellation Policy mora biti jasno definisana prema OTA standardima.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PoliciesStep: React.FC<{ data: Partial<Property>; onChange: (updates: Partial<Property>) => void }> = ({ data, onChange }) => {
    const updateHouseRules = (updates: Partial<HouseRules>) => {
        onChange({ houseRules: { ...data.houseRules, ...updates } as any });
    };

    const updateKeyCollection = (updates: Partial<KeyCollection>) => {
        onChange({ keyCollection: { ...data.keyCollection, ...updates } as any });
    };

    const updateHostProfile = (updates: Partial<HostProfile>) => {
        onChange({ hostProfile: { ...data.hostProfile, ...updates } as any });
    };

    const needsKeyCollection = data.propertyType === 'Apartment' || data.propertyType === 'Villa';

    return (
        <div>
            <div className="form-section">
                <h3 className="form-section-title">Pravila Kuće (House Rules)</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label required">Check-in Početak</label>
                        <input
                            type="time"
                            className="form-input"
                            value={data.houseRules?.checkInStart || '14:00'}
                            onChange={(e) => updateHouseRules({ checkInStart: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Check-in Kraj</label>
                        <input
                            type="time"
                            className="form-input"
                            value={data.houseRules?.checkInEnd || '22:00'}
                            onChange={(e) => updateHouseRules({ checkInEnd: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Check-out Vreme</label>
                        <input
                            type="time"
                            className="form-input"
                            value={data.houseRules?.checkOutTime || '10:00'}
                            onChange={(e) => updateHouseRules({ checkOutTime: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Minimalna Starost za Check-in</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="npr. 18 ili 21"
                            value={data.houseRules?.ageRestriction || ''}
                            onChange={(e) => updateHouseRules({ ageRestriction: e.target.value ? Number(e.target.value) : undefined })}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Restrikcije</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label className="form-checkbox">
                            <input
                                type="checkbox"
                                checked={data.houseRules?.smokingAllowed || false}
                                onChange={(e) => updateHouseRules({ smokingAllowed: e.target.checked })}
                            />
                            <span>Pušenje dozvoljeno</span>
                        </label>

                        <label className="form-checkbox">
                            <input
                                type="checkbox"
                                checked={data.houseRules?.partiesAllowed || false}
                                onChange={(e) => updateHouseRules({ partiesAllowed: e.target.checked })}
                            />
                            <span>Žurke/Događaji dozvoljeni</span>
                        </label>

                        <label className="form-checkbox">
                            <input
                                type="checkbox"
                                checked={data.houseRules?.petsAllowed || false}
                                onChange={(e) => updateHouseRules({ petsAllowed: e.target.checked })}
                            />
                            <span>Kućni ljubimci dozvoljeni</span>
                        </label>
                    </div>

                    {data.houseRules?.petsAllowed && (
                        <div style={{
                            marginTop: '16px',
                            padding: '16px',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '12px',
                            border: '1px solid var(--border)'
                        }}>
                            <h5 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>Detalji o Kućnim Ljubimcima</h5>
                            <div className="form-grid">
                                <label className="form-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={data.houseRules?.petDetails?.dogsOnly || false}
                                        onChange={(e) => updateHouseRules({
                                            petDetails: {
                                                ...data.houseRules?.petDetails,
                                                dogsOnly: e.target.checked
                                            } as any
                                        })}
                                    />
                                    <span>Samo psi</span>
                                </label>

                                <div className="form-group">
                                    <label className="form-label">Maksimalna Težina (kg)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="npr. 10"
                                        value={data.houseRules?.petDetails?.maxWeight || ''}
                                        onChange={(e) => updateHouseRules({
                                            petDetails: {
                                                ...data.houseRules?.petDetails,
                                                maxWeight: e.target.value ? Number(e.target.value) : undefined
                                            } as any
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Naknada za Ljubimca (EUR)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="npr. 15"
                                        value={data.houseRules?.petDetails?.petFee || ''}
                                        onChange={(e) => updateHouseRules({
                                            petDetails: {
                                                ...data.houseRules?.petDetails,
                                                petFee: e.target.value ? Number(e.target.value) : undefined
                                            } as any
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {needsKeyCollection && (
                <div className="form-section">
                    <h3 className="form-section-title">
                        Preuzimanje Ključeva
                        <span style={{ fontSize: '12px', color: 'var(--accent)', marginLeft: '8px' }}>
                            (Obavezno za Apartmane/Vile)
                        </span>
                    </h3>
                    <div className="form-grid">
                        <div className="form-group span-2">
                            <label className="form-label required">Metod Preuzimanja</label>
                            <select
                                className="form-select"
                                value={data.keyCollection?.method || 'Reception'}
                                onChange={(e) => updateKeyCollection({ method: e.target.value as any })}
                            >
                                <option value="Reception">Recepcija</option>
                                <option value="Keybox">Keybox (Sef sa šifrom)</option>
                                <option value="MeetGreeter">Susret sa Domaćinom</option>
                                <option value="DigitalLock">Digitalna Brava</option>
                            </select>
                        </div>

                        <div className="form-group span-2">
                            <label className="form-label">Instrukcije za Preuzimanje</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Detaljne instrukcije (šalje se nakon potvrde rezervacije)..."
                                value={data.keyCollection?.instructions || ''}
                                onChange={(e) => updateKeyCollection({ instructions: e.target.value })}
                                style={{ minHeight: '100px' }}
                            />
                            <small style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                Npr: "Keybox se nalazi pored glavnog ulaza. Šifra će vam biti poslata 24h pre dolaska."
                            </small>
                        </div>
                    </div>
                </div>
            )}

            {(data.propertyType === 'Apartment' || data.propertyType === 'Villa' || data.propertyType === 'GuestHouse') && (
                <div className="form-section">
                    <h3 className="form-section-title">Profil Domaćina (Host Profile)</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Ime Domaćina</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Marko Petrović"
                                value={data.hostProfile?.hostName || ''}
                                onChange={(e) => updateHostProfile({ hostName: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Prosečno Vreme Odgovora</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="npr. 'Unutar 1 sata'"
                                value={data.hostProfile?.responseTime || ''}
                                onChange={(e) => updateHostProfile({ responseTime: e.target.value })}
                            />
                        </div>

                        <div className="form-group span-2">
                            <label className="form-label">Jezici koje Domaćin Govori (ISO kodovi, odvojeni zarezom)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="sr, en, de"
                                value={data.hostProfile?.languagesSpoken?.join(', ') || ''}
                                onChange={(e) => updateHostProfile({
                                    languagesSpoken: e.target.value.split(',').map(l => l.trim()).filter(Boolean)
                                })}
                            />
                        </div>

                        <div className="form-group span-2">
                            <label className="form-label">URL Profilne Slike</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://..."
                                value={data.hostProfile?.profileImageUrl || ''}
                                onChange={(e) => updateHostProfile({ profileImageUrl: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '24px'
            }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <AlertCircle size={20} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '13px', color: '#3b82f6' }}>
                        <strong>OTA Compliance Napomena:</strong>
                        <p style={{ margin: '8px 0 0 0', lineHeight: '1.5' }}>
                            Pravila kuće i politike su kritični za Booking.com i Airbnb integraciju.
                            Jasno definisite check-in/out vremena i sve restrikcije kako bi se izbegli problemi sa gostima.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyWizard;
