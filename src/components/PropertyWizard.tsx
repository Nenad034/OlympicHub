import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    MapPin,
    Globe,
    ImageIcon,
    Bed,
    DollarSign,
    Shield,
    Key,
    ChevronRight,
    ChevronLeft,
    Check,
    Plus,
    Trash2,
    AlertCircle,
    Save,
    Sparkles,
    LogOut
} from 'lucide-react';
import type { Property, PropertyContent, RoomType, BeddingConfiguration, PropertyAmenity, RatePlan, HouseRules, KeyCollection, HostProfile, Tax, PropertyImage } from '../types/property.types';
import { validateProperty } from '../types/property.types';
import LocationPicker, { type LocationData } from './LocationPicker';

interface PropertyWizardProps {
    onClose: () => void;
    onSave: (property: Partial<Property>, shouldClose?: boolean) => void;
    initialData?: Partial<Property>;
}

// MOCK DATA FOR SUPPLIERS (Should be fetched from API)
const MOCK_SUPPLIERS = [
    { id: 'sup1', name: 'Hilton Hotels & Resorts', type: 'Lanac Hotela' },
    { id: 'sup2', name: 'Marriott International', type: 'Lanac Hotela' },
    { id: 'sup3', name: 'Accor', type: 'Lanac Hotela' },
    { id: 'sup4', name: 'Hyatt Hotels Corporation', type: 'Lanac Hotela' },
    { id: 'sup5', name: 'Best Western', type: 'Brand Hotela' },
    { id: 'sup6', name: 'Holiday Inn', type: 'Brand Hotela' },
    { id: 'sup7', name: 'Crowne Plaza', type: 'Brand Hotela' },
    { id: 'sup8', name: 'Balkan Tours', type: 'Touroperatori' },
    { id: 'sup9', name: 'Argus Tours', type: 'Touroperatori' },
    { id: 'sup10', name: 'Hotel Serbia', type: 'Hoteli' },
];

const PropertyWizard: React.FC<PropertyWizardProps> = ({ onClose, onSave, initialData }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [propertyData, setPropertyData] = useState<Partial<Property>>(initialData || {
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

    const handleSave = (shouldClose: boolean = false) => {
        const validationErrors = validateProperty(propertyData);
        // Do not block saving, just show errors if any
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
        }
        onSave(propertyData, shouldClose);
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="wizard-container"
            >
                {/* SIDEBAR NAVIGATION */}
                <div className="wizard-sidebar">
                    <div className="wizard-sidebar-header">
                        <h2>Izmena Objekta</h2>
                    </div>

                    <div className="wizard-steps-list">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`step-item-row ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                                onClick={() => setCurrentStep(index)}
                            >
                                <div className="step-icon-small">
                                    {index < currentStep ? <Check size={16} /> : (index + 1)}
                                </div>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="wizard-main-area">
                    {/* TOPBAR */}
                    <div className="wizard-topbar">
                        <div className="topbar-title">
                            <h3>{steps[currentStep].title}</h3>
                            <span className="topbar-subtitle">Korak {currentStep + 1} od {steps.length} • OTA Standard</span>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                                fontWeight: 500
                            }}
                        >
                            <LogOut size={16} /> Exit
                        </button>
                    </div>

                    {/* SCROLLABLE CONTENT */}
                    <div className="wizard-content-wrapper">
                        <div className="content-center-limit">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
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
                    </div>

                    {/* ACTION FOOTER */}
                    <div className="wizard-action-footer">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'transparent', border: '1px solid var(--border)',
                                color: 'var(--text-primary)',
                                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                                opacity: currentStep === 0 ? 0.5 : 1
                            }}
                        >
                            <ChevronLeft size={18} /> Nazad
                        </button>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            {currentStep < steps.length - 1 ? (
                                <>
                                    <button
                                        onClick={() => handleSave(false)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)',
                                            padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
                                        }}
                                    >
                                        <Save size={18} /> Sačuvaj
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            background: 'var(--accent)', color: '#fff', border: 'none',
                                            padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
                                        }}
                                    >
                                        Sledeće <ChevronRight size={18} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => handleSave(true)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        background: 'var(--accent)', color: '#fff', border: 'none',
                                        padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                                        boxShadow: '0 4px 12px var(--accent-glow)'
                                    }}
                                >
                                    <Check size={18} /> Završi i Sačuvaj
                                </button>
                            )}
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

/* Sidebar Styling */
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

.wizard-sidebar-header h2 {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
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
    border-radius: 8px;
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

.step-item-row.completed {
    color: var(--accent);
}

.step-icon-small {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0,0,0,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
}

.step-item-row.active .step-icon-small, .step-item-row.completed .step-icon-small {
    background: var(--accent);
    color: #fff;
}

/* Main Content Area */
.wizard-main-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-dark); /* Slightly different bg for contrast */
}

.wizard-topbar {
    height: 70px;
    padding: 0 40px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-card);
    flex-shrink: 0;
}

.topbar-title h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
}
.topbar-subtitle {
    font-size: 13px;
    color: var(--text-secondary);
}

.wizard-content-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 40px;
}

.content-center-limit {
    max-width: 900px;
    margin: 0 auto;
    padding-bottom: 40px;
}

.wizard-action-footer {
    height: 80px;
    padding: 0 40px;
    border-top: 1px solid var(--border);
    background: var(--bg-card);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}

/* Utility */
.validation-errors {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 16px;
    margin-top: 24px;
    display: flex;
    gap: 12px;
    color: #ef4444;
}
.validation-errors ul { margin: 8px 0 0 0; padding-left: 20px; }
.validation-errors li { margin: 4px 0; }


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
                <h3 className="form-section-title">Identitet Objekta</h3>
                <div className="form-group">
                    <label className="form-label required">Naziv Objekta</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="npr. Hotel Grand"
                        value={(data as any).name || ''}
                        onChange={(e) => onChange({ name: e.target.value } as any)}
                        style={{ fontSize: '16px', padding: '12px' }}
                    />
                </div>
                <div className="form-group" style={{ marginTop: '12px' }}>
                    <label className="form-label">Izvorni Link (Sajt)</label>
                    <input
                        type="url"
                        className="form-input"
                        placeholder="https://www.hotel-website.com"
                        value={(data as any).website || ''}
                        onChange={(e) => onChange({ website: e.target.value } as any)}
                        style={{ fontFamily: 'monospace', color: 'var(--accent)' }}
                    />
                    <small style={{ color: 'var(--text-secondary)' }}>Interni link. Koristi se za generisanje sadržaja i preuzimanje slika.</small>
                </div>
            </div>
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
                        <label className="form-label">Lanac Hotela (Partner)</label>
                        <select
                            className="form-select"
                            value={data.chainId || ''}
                            onChange={(e) => onChange({ chainId: e.target.value })}
                        >
                            <option value="">Odaberite Lanac...</option>
                            {MOCK_SUPPLIERS.filter(s => s.type === 'Lanac Hotela').map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Brand Hotela (Partner)</label>
                        <select
                            className="form-select"
                            value={data.brandId || ''}
                            onChange={(e) => onChange({ brandId: e.target.value })}
                        >
                            <option value="">Odaberite Brand...</option>
                            {MOCK_SUPPLIERS.filter(s => s.type === 'Brand Hotela').map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
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

    // Transform Property data to LocationData for the picker
    const pickerData: LocationData = {
        address: data.address?.addressLine1 || '',
        addressLine2: data.address?.addressLine2 || '',
        city: data.address?.city || '',
        postalCode: data.address?.postalCode || '',
        countryCode: data.address?.countryCode || '',
        stateProvince: data.address?.stateProvince || '',
        latitude: data.geoCoordinates?.latitude || 0,
        longitude: data.geoCoordinates?.longitude || 0,
        googlePlaceId: data.geoCoordinates?.googlePlaceId
    };

    const handleLocationChange = (newData: LocationData) => {
        onChange({
            address: {
                addressLine1: newData.address,
                addressLine2: newData.addressLine2,
                city: newData.city,
                postalCode: newData.postalCode,
                countryCode: newData.countryCode,
                stateProvince: newData.stateProvince
            } as any,
            geoCoordinates: {
                latitude: newData.latitude,
                longitude: newData.longitude,
                coordinateSource: 'MAP_PIN',
                googlePlaceId: newData.googlePlaceId
            } as any
        });
    };

    const addPoi = () => {
        const newPoi = { poiName: '', distanceMeters: 0, poiType: 'CityCenter' };
        onChange({ pointsOfInterest: [...(data.pointsOfInterest || []), newPoi as any] });
    };

    const updatePoi = (index: number, field: string, value: any) => {
        const newPois = [...(data.pointsOfInterest || [])];
        newPois[index] = { ...newPois[index], [field]: value };
        onChange({ pointsOfInterest: newPois });
    };

    const removePoi = (index: number) => {
        onChange({ pointsOfInterest: data.pointsOfInterest?.filter((_, i) => i !== index) });
    };

    return (
        <div>
            {/* The LocationPicker handles all map logic including auto-search by name */}
            <LocationPicker
                data={pickerData}
                onChange={handleLocationChange}
            />

            <div className="form-section" style={{ marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                <h3 className="form-section-title">Tačke Interesa (Udaljenosti)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(data.pointsOfInterest || []).map((poi, index) => (
                        <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-card)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <input
                                className="form-input"
                                placeholder="Naziv tačke (npr. Centar)"
                                value={poi.poiName}
                                onChange={e => updatePoi(index, 'poiName', e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Distanca"
                                    value={poi.distanceMeters}
                                    onChange={e => updatePoi(index, 'distanceMeters', parseInt(e.target.value) || 0)}
                                    style={{ width: '100px' }}
                                />
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>m</span>
                            </div>
                            <select
                                className="form-select"
                                value={poi.poiType}
                                onChange={e => updatePoi(index, 'poiType', e.target.value)}
                                style={{ width: '150px' }}
                            >
                                <option value="CityCenter">Centar</option>
                                <option value="Airport">Aerodrom</option>
                                <option value="TrainStation">Stanica</option>
                                <option value="Beach">Plaža</option>
                                <option value="SkiLift">Ski Lift</option>
                                <option value="Restaurant">Restoran</option>
                                <option value="Shop">Prodavnica</option>
                            </select>
                            <button onClick={() => removePoi(index)} className="btn-icon" style={{ color: '#ef4444', padding: '8px' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button onClick={addPoi} className="btn-secondary" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
                        <Plus size={16} /> Dodaj Tačku
                    </button>
                </div>
            </div>
        </div>
    );
};

const ContentStep: React.FC<{ data: Partial<Property>; onChange: (updates: Partial<Property>) => void }> = ({ data, onChange }) => {
    const [selectedLang, setSelectedLang] = useState('sr');
    const [showAiSettings, setShowAiSettings] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('Pronađi zvanični sajt ovog objekta i koristi ISKLJUČIVO njega kao izvor informacija. Ako ne možeš da nađeš zvanični sajt, stani i zatraži link. Ako nađeš, generiši opis, sadržaje, tačke interesa i tipove soba na osnovu njega.');
    const [sourceUrl, setSourceUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const currentContent = data.content?.find(c => c.languageCode === selectedLang) || {
        languageCode: selectedLang,
        officialName: '',
        displayName: '',
        shortDescription: '',
        longDescription: '',
        locationDescription: '',
        policyText: '',
        metaTitle: '',
        metaDescription: '',
        structuredJson: ''
    };

    const updateContent = (updates: Partial<PropertyContent>) => {
        const newContent = data.content?.filter(c => c.languageCode !== selectedLang) || [];
        newContent.push({ ...currentContent, ...updates } as PropertyContent);
        onChange({ content: newContent });
    };

    const handleHtmlPreview = () => {
        const title = currentContent.displayName || currentContent.officialName || 'Hotel';
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${title} - Interni Pregled</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; line-height: 1.6; max-width: 900px; margin: 0 auto; color: #333; }
                    h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
                    .section { margin-top: 30px; background: #f5f5f5; padding: 20px; border-radius: 8px; }
                    .label { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #666; margin-bottom: 5px; }
                    pre { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 6px; overflow-x: auto; }
                    .preview-box { border: 1px solid #ddd; padding: 20px; border-radius: 6px; background: white; margin-top: 10px; }
                </style>
            </head>
            <body>
                <h1>Interni Pregled Podataka: ${title}</h1>
                
                <div class="section">
                    <div class="label">SEO Meta Podaci</div>
                    <p><strong>Meta Title:</strong> ${currentContent.metaTitle || '-'}</p>
                    <p><strong>Meta Description:</strong> ${currentContent.metaDescription || '-'}</p>
                </div>

                <div class="section">
                    <div class="label">HTML Sadržaj (Opis)</div>
                    <div class="preview-box">
                        ${currentContent.longDescription || '<i>Nema generisanog opisa.</i>'}
                    </div>
                </div>

                <div class="section">
                    <div class="label">Structured Data (JSON-LD)</div>
                    <pre>${currentContent.structuredJson || '// Empty'}</pre>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const handleGenerateAi = () => {
        setIsGenerating(true);
        // Simulate AI generation delay
        setTimeout(() => {
            const name = (data as any).name || 'Naš Hotel';
            const city = data.address?.city || 'Centar';

            // 1. Generate Serbian Content
            const contentSr: PropertyContent = {
                languageCode: 'sr',
                officialName: name,
                displayName: name,
                shortDescription: `Doživite savršen odmor u ${name}, smeštenom u srcu destinacije ${city}. Spoj luksuza, tradicije i vrhunske usluge za nezaboravne trenutke.`,
                longDescription: `
<p><b>${name} – Vaša oaza mira u srcu destinacije ${city}</b></p>
<p>${name} predstavlja idealan spoj moderne arhitekture i toplog gostoprimstva. Bilo da dolazite poslovno ili na odmor, naš hotel nudi sve što vam je potrebno za savršen boravak - od luksuznih soba do vrhunskog wellness centra.</p>

<p class="section"><b>Lokacija</b></p>
<p>Hotel se nalazi na prestižnoj lokaciji u mestu ${city}, na adresi ${data.address?.addressLine1 || 'Centar'}. Okružen je zelenilom i nalazi se u neposrednoj blizini glavnih turističkih atrakcija, šetališta i poslovne zone, što ga čini savršenim polazištem za istraživanje.</p>

<p class="section"><b>Sadržaji hotela</b></p>
<p>Gostima su na raspolaganju brojni sadržaji uključujući à la carte restoran sa lokalnim i internacionalnim specijalitetima, lobby bar sa terasom, moderno opremljenu konferencijsku salu, besplatan brzi Wi-Fi u celom objektu, kao i privatni parking sa video nadzorom (uz doplatu).</p>

<p class="section"><b>Wellness i rekreacija</b></p>
<p>Naš ekskluzivni Wellness & Spa centar prostire se na 500m2 i nudi zatvoreni bazen sa termalnom vodom, finsku saunu, parno kupatilo i zonu za relaksaciju. Za ljubitelje aktivnog odmora, tu je i moderno opremljena teretana dostupna 24h.</p>

<p class="section"><b>Smeštaj</b></p>
<p>Hotel raspolaže sa 50 luksuzno opremljenih smeštajnih jedinica. Sve sobe su klimatizovane i zvučno izolovane.</p><br>

<p><b># Standard Soba</b> Kapacitet: 2 osobe<br>Komforna soba površine 25m2, idealna za parove. Sadrži francuski ležaj, radni sto, LCD TV sa kablovskim kanalima, sef, mini-bar, ketler za čaj/kafu i moderno kupatilo sa tuš kabinom i fenom. Wi-Fi je besplatan.</p>
<hr style="border:0;border-top:1px solid #ccc;margin:10px 0;">

<p><b># Deluxe Apartman</b> Kapacitet: 4 osobe<br>Prostran apartman od 45m2 sa odvojenom spavaćom sobom i dnevnim boravkom. Poseduje privatnu terasu sa panoramskim pogledom. Opremljen je sa dva LCD TV-a, mini-kuhinjom, aparatom za kafu i luksuznim kupatilom sa đakuzi kadom, bade mantilima i papučama.</p>
<hr style="border:0;border-top:1px solid #ccc;margin:10px 0;">

<p class="section"><b>Usluga</b></p>
<p>Usluga je na bazi noćenja sa doručkom (bogati švedski sto). Mogućnost doplate za polupansion (večera - izbor više jela ili švedski sto, zavisno od broja gostiju).</p>

<p class="section"><b>Dodatne usluge</b></p>
<p>Recepcija je otvorena 24h. Nudimo usluge pranja i peglanja veša, room service, kao i organizaciju transfera od/do aerodroma uz prethodnu najavu.</p>
<hr>
<p><b>Najčešća pitanja (FAQ)</b></p>
<p><b>Da li hotel ima wellness sadržaje?</b><br>Da, hotel poseduje Wellness centar sa bazenom i saunom. Korišćenje bazena je besplatno za goste hotela.</p>
<p><b>Da li hotel ima parking?</b><br>Da, dostupan je privatni parking u okviru objekta (nije potrebna rezervacija) i naplaćuje se 10 EUR po danu.</p>
<p><b>Da li su kućni ljubimci dozvoljeni?</b><br>Da, kućni ljubimci su dozvoljeni na zahtev. Moguća je dodatna naknada.</p>
<p><b>Koliko je hotel udaljen od centra?</b><br>Hotel je udaljen oko 500m od strogog centra grada.</p>
`.trim(),
                locationDescription: '',
                policyText: '',
                metaTitle: `${name} ${city} | Wellness & Spa Odmor | Zvanični Sajt`,
                metaDescription: `Rezervišite boravak u ${name}, ${city}. Luksuzne sobe, spa centar, restoran i odlična lokacija. Najbolje cene i specijalne ponude za vaš savršen odmor.`,
                structuredJson: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Hotel",
                    "name": name,
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": city,
                        "streetAddress": data.address?.addressLine1
                    },
                    "description": `Doživite savršen odmor u ${name}...`,
                    "starRating": data.starRating
                }, null, 2)
            };

            // 2. Generate English Content
            const contentEn: PropertyContent = {
                languageCode: 'en',
                officialName: name,
                displayName: name,
                shortDescription: `Experience a perfect stay at ${name}, located in the heart of ${city}. A blend of luxury, tradition, and premium service for unforgettable moments.`,
                longDescription: `
<p><b>${name} – Your oasis of peace in the heart of ${city}</b></p>
<p>${name} represents the ideal blend of modern architecture and warm hospitality. Whether you are visiting for business or leisure, our hotel offers everything you need for a perfect stay - from luxurious rooms to a top-notch wellness center.</p>

<p class="section"><b>Location</b></p>
<p>The hotel is situated in a prestigious location in ${city}, at ${data.address?.addressLine1 || 'City Center'}. Surrounded by greenery and located in close proximity to main tourist attractions, promenades, and the business zone, it is the perfect starting point for exploration.</p>

<p class="section"><b>Hotel Facilities</b></p>
<p>Guests can enjoy numerous facilities including an à la carte restaurant with local and international specialties, a lobby bar with a terrace, a fully equipped conference hall, free high-speed Wi-Fi throughout the property, and private parking (surcharge applies).</p>

<p class="section"><b>Wellness & Recreation</b></p>
<p>Our exclusive Wellness & Spa center covers 500m2 and offers an indoor pool with thermal water, Finnish sauna, steam bath, and relaxation zone. For active vacation lovers, a modern gym is available 24/7.</p>

<p class="section"><b>Accommodation</b></p>
<p>The hotel features 50 luxuriously equipped accommodation units. All rooms are air-conditioned and soundproofed.</p><br>

<p><b># Standard Room</b> Capacity: 2 persons<br>Comfortable room of 25m2, ideal for couples. Features a double bed, work desk, LCD TV with cable channels, safe, mini-bar, kettle for tea/coffee, and a modern bathroom with shower cabin and hairdryer. Wi-Fi is free.</p>
<hr style="border:0;border-top:1px solid #ccc;margin:10px 0;">

<p><b># Deluxe Suite</b> Capacity: 4 persons<br>Spacious suite of 45m2 with separate bedroom and living room. Features a private terrace with panoramic views. Equipped with two LCD TVs, mini-kuhinjom, aparatom za kafu and a luxurious bathroom with jacuzzi tub, bathrobes, and slippers.</p>
<hr style="border:0;border-top:1px solid #ccc;margin:10px 0;">

<p class="section"><b>Service</b></p>
<p>Service is based on Bed & Breakfast (rich buffet). Half-board supplement available (choice of menu or buffet for dinner).</p>

<p class="section"><b>Additional Services</b></p>
<p>Reception is open 24/7. We offer laundry and ironing services, room service, and airport transfers upon request.</p>
<hr>
<p><b>FAQ</b></p>
<p><b>Does the hotel have wellness facilities?</b><br>Yes, the hotel has a Wellness center with pool and sauna. Pool access is free for guests.</p>
<p><b>Is parking available?</b><br>Yes, private parking is available on-site (10 EUR/day).</p>
<p><b>Are pets allowed?</b><br>Yes, pets are allowed upon request. Charges may apply.</p>
<p><b>How far is the center?</b><br>The hotel is about 500m from the city center.</p>
`.trim(),
                locationDescription: '',
                policyText: '',
                metaTitle: `${name} ${city} | Wellness & Spa Vacation | Official Site`,
                metaDescription: `Book your stay at ${name}, ${city}. Luxury rooms, spa, restaurant, and great location. Best rates and special offers.`,
                structuredJson: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Hotel",
                    "name": name,
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": city,
                        "streetAddress": data.address?.addressLine1
                    },
                    "description": `Experience a perfect stay at ${name}...`,
                    "starRating": data.starRating
                }, null, 2)
            };

            // 3. Generate Points of Interest (Distances)
            const newPois: any[] = [
                { poiName: `Centar grada (${city})`, distanceMeters: 500, poiType: 'CityCenter' },
                { poiName: 'Aerodrom Nikola Tesla', distanceMeters: 18500, poiType: 'Airport' },
                { poiName: 'Glavna Autobuska Stanica', distanceMeters: 2100, poiType: 'TrainStation' },
                { poiName: 'Lokalni Restorani', distanceMeters: 200, poiType: 'Restaurant' }
            ];

            // 4. Generate Amenities
            const newAmenities: any[] = [
                { amenityId: 'wifi', propertyId: 'temp', otaCode: '1', name: 'Besplatan WiFi', category: 'General', isFree: true, onSite: true, reservationRequired: false },
                { amenityId: 'parking', propertyId: 'temp', otaCode: '2', name: 'Parking', category: 'General', isFree: true, onSite: true, reservationRequired: true },
                { amenityId: 'pool', propertyId: 'temp', otaCode: '3', name: 'Bazen', category: 'Wellness', isFree: false, onSite: true, reservationRequired: false },
                { amenityId: 'ac', propertyId: 'temp', otaCode: '4', name: 'Klima Uređaj', category: 'Room', isFree: true, onSite: true, reservationRequired: false }
            ];

            // 5. Generate Room Types
            const newRoomTypes: any[] = [
                {
                    roomTypeId: 'rt_' + Date.now(),
                    code: 'STD',
                    nameInternal: 'Standard Dvokrevetna Soba',
                    category: 'Room',
                    standardOccupancy: 2,
                    maxAdults: 2,
                    maxChildren: 1,
                    maxOccupancy: 3,
                    minOccupancy: 1,
                    bathroomCount: 1,
                    bathroomType: 'Private',
                    beddingConfigurations: [{ bedTypeCode: 'DOUBLE', quantity: 1, isExtraBed: false }],
                    amenities: [],
                    images: []
                },
                {
                    roomTypeId: 'rt_' + (Date.now() + 1),
                    code: 'DLX',
                    nameInternal: 'Deluxe Apartman',
                    category: 'Suite',
                    standardOccupancy: 3,
                    maxAdults: 3,
                    maxChildren: 2,
                    maxOccupancy: 4,
                    minOccupancy: 1,
                    bathroomCount: 1,
                    bathroomType: 'Private',
                    beddingConfigurations: [{ bedTypeCode: 'KING', quantity: 1, isExtraBed: false }, { bedTypeCode: 'SOFA_BED', quantity: 1, isExtraBed: true }],
                    amenities: [],
                    images: []
                }
            ];

            // Update All Data
            const otherContent = data.content?.filter(c => c.languageCode !== 'sr' && c.languageCode !== 'en') || [];
            onChange({
                content: [...otherContent, contentSr, contentEn],
                pointsOfInterest: newPois,
                propertyAmenities: newAmenities,
                roomTypes: newRoomTypes,
                website: (data as any).website || `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.rs`
            } as any);

            setIsGenerating(false);
            setShowAiSettings(false);
        }, 1500);
    };

    return (
        <div>
            {/* AI Control Panel */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} className="text-accent" />
                        <h4 style={{ margin: 0, fontSize: '14px' }}>Opis i Seo</h4>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="btn-secondary"
                            onClick={handleHtmlPreview}
                            style={{ fontSize: '13px', padding: '6px 12px' }}
                        >
                            <Globe size={14} style={{ marginRight: '4px' }} /> HTML Prikaz
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => setShowAiSettings(!showAiSettings)}
                            style={{ fontSize: '13px', padding: '6px 12px' }}
                        >
                            {showAiSettings ? 'Sakrij Podešavanja' : 'Podešavanja Prompta'}
                        </button>
                        <button
                            className="btn-primary-glow"
                            onClick={handleGenerateAi}
                            disabled={isGenerating}
                            style={{ fontSize: '13px', padding: '6px 12px' }}
                        >
                            {isGenerating ? 'Generisanje...' : 'Generiši Sadržaj'}
                        </button>
                    </div>
                </div>

                {showAiSettings && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                        <label className="form-label">Globalni AI Prompt Template</label>
                        <textarea
                            className="form-textarea"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            style={{ fontSize: '13px', fontFamily: 'monospace', minHeight: '80px', width: '100%' }}
                        />
                        <small style={{ color: 'var(--text-secondary)' }}>Definišite instrukcije za AI model. Koristite ovaj prostor za tonalitet, stil i specifične zahteve.</small>

                        <div style={{ marginTop: '16px' }}>
                            <label className="form-label">Link ka izvornom sajtu (Opciono)</label>
                            <input
                                className="form-input"
                                placeholder="https://www.official-hotel-site.com"
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                            />
                            <small style={{ color: 'var(--text-secondary)' }}>Ukoliko AI ne pronađe sajt, ovde unesite tačan link.</small>
                        </div>
                    </div>
                )}
            </div>

            <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="form-section-title" style={{ margin: 0 }}>Tekstualni Sadržaj (Višejezično)</h3>
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
                        <label className="form-label">Kratak Opis (max 300 karaktera)</label>
                        <textarea
                            className="form-textarea"
                            maxLength={300}
                            placeholder="Za mobilne aplikacije i brzi pregled..."
                            value={currentContent.shortDescription || ''}
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
                            value={currentContent.longDescription || ''}
                            onChange={(e) => updateContent({ longDescription: e.target.value })}
                            style={{ minHeight: '200px' }}
                        />
                    </div>

                    {/* SEO SECTION */}
                    <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--border)', marginTop: '16px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--accent)' }}>SEO & Meta Podaci (Google Search)</h4>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label">Meta Title (Naslov)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    maxLength={60}
                                    placeholder="Naslov za pretraživače..."
                                    value={currentContent.metaTitle || ''}
                                    onChange={(e) => updateContent({ metaTitle: e.target.value })}
                                    style={{ paddingRight: '60px', width: '100%' }}
                                />
                                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: (currentContent.metaTitle?.length || 0) > 60 ? 'red' : 'gray' }}>
                                    {currentContent.metaTitle?.length || 0}/60
                                </span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Meta Description (Opis)</label>
                            <textarea
                                className="form-textarea"
                                maxLength={160}
                                placeholder="Kratak opis koji se pojavljuje u rezultatima pretrage..."
                                value={currentContent.metaDescription || ''}
                                onChange={(e) => updateContent({ metaDescription: e.target.value })}
                                style={{ minHeight: '80px' }}
                            />
                            <small style={{ color: (currentContent.metaDescription?.length || 0) > 160 ? 'red' : 'var(--text-secondary)' }}>
                                {currentContent.metaDescription?.length || 0}/160 preporučenih karaktera
                            </small>
                        </div>

                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label className="form-label">Structured Data (JSON-LD) - Skriveno</label>
                            <textarea
                                className="form-textarea"
                                readOnly
                                value={currentContent.structuredJson || ''}
                                placeholder="Automatski generisan JSON-LD kod..."
                                style={{ minHeight: '60px', fontSize: '11px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', opacity: 0.7 }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Opis Lokacije</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Opis kraja/komšiluka..."
                            value={currentContent.locationDescription || ''}
                            onChange={(e) => updateContent({ locationDescription: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Pravila Kuće (Polisa)</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Sitna slova o pravilima..."
                            value={currentContent.policyText || ''}
                            onChange={(e) => updateContent({ policyText: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ImagesStep: React.FC<{ data: Partial<Property>; onChange: (updates: Partial<Property>) => void }> = ({ data, onChange }) => {
    const [websiteUrl, setWebsiteUrl] = useState((data as any).website || 'https://www.example-hotel.com');

    useEffect(() => {
        const val = (data as any).website;
        if (val) setWebsiteUrl(val);
    }, [data]);

    const [isFetching, setIsFetching] = useState(false);
    // const [showManual, setShowManual] = useState(false); // Removed unused state


    // Manual States
    const [imageUrl, setImageUrl] = useState('');
    const [imageCategory, setImageCategory] = useState<'Exterior' | 'Lobby' | 'Room' | 'Bathroom' | 'Pool' | 'Restaurant' | 'View' | 'Amenity'>('Exterior');
    const [selectedRoomType, setSelectedRoomType] = useState<string>('');
    const [imageCaption, setImageCaption] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Auto-update Alt Text suggestion when Category changes
    useEffect(() => {
        const hotelName = (data as any).name || 'Hotel';
        if (!imageAlt || imageAlt.includes(hotelName)) {
            setImageAlt(`${hotelName} - ${imageCategory}`);
        }
    }, [imageCategory, (data as any).name]);

    const handleFetchImages = () => {
        if (!websiteUrl) return;
        setIsFetching(true);
        setTimeout(() => {
            // Mock Fetch with diverse images
            const fetchedImages: PropertyImage[] = [
                { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000', category: 'Exterior', caption: 'Fasada Objekta', sortOrder: 1 },
                { url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1000', category: 'Lobby', caption: 'Lobby i Recepcija', sortOrder: 2 },
                { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000', category: 'Restaurant', caption: 'Restoran', sortOrder: 3 },
                { url: 'https://images.unsplash.com/photo-1576354302919-96748cb8299e?auto=format&fit=crop&q=80&w=1000', category: 'Room', caption: 'Standardna Soba', sortOrder: 4 },
                { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000', category: 'Room', caption: 'Pogled iz sobe', sortOrder: 5 },
                { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000', category: 'Bathroom', caption: 'Kupatilo', sortOrder: 6 },
                { url: 'https://images.unsplash.com/photo-1572331165267-854da2b00cc6?auto=format&fit=crop&q=80&w=1000', category: 'Pool', caption: 'Bazen', sortOrder: 7 },
                { url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=1000', category: 'Amenity', caption: 'Teretana', sortOrder: 8 },
            ];

            const currentCount = data.images?.length || 0;
            const hotelName = (data as any).name || 'Hotel';

            const preparedImages = fetchedImages.map((img, i) => ({
                ...img,
                altText: `${hotelName} - ${img.category} - ${img.caption}`,
                sortOrder: currentCount + i + 1
            }));

            onChange({ images: [...(data.images || []), ...preparedImages] });
            setIsFetching(false);
        }, 2000);
    };

    const addImage = () => {
        if (!imageUrl.trim()) return;
        const newImage: PropertyImage = {
            url: imageUrl,
            category: imageCategory,
            roomTypeId: selectedRoomType || undefined,
            sortOrder: (data.images?.length || 0) + 1,
            caption: imageCaption || undefined,
            altText: imageAlt || undefined
        };
        onChange({ images: [...(data.images || []), newImage] });
        setImageUrl('');
        setImageCaption('');
        setImageAlt(''); // Reset will trigger effect to refill
        setSelectedRoomType('');
    };

    const deleteImage = (index: number) => {
        const newImages = data.images?.filter((_, i) => i !== index) || [];
        onChange({ images: newImages });
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const newImages = [...(data.images || [])];
        const draggedItem = newImages[draggedIndex];

        newImages.splice(draggedIndex, 1);
        newImages.splice(dropIndex, 0, draggedItem);

        const reordered = newImages.map((img, idx) => ({
            ...img,
            sortOrder: idx + 1
        }));

        onChange({ images: reordered });
        setDraggedIndex(null);
    };

    return (
        <div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <div className="form-section">
                <h3 className="form-section-title">Galerija Slika</h3>

                {/* Optimized Layout: 2 Columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: '24px', marginBottom: '32px' }}>

                    {/* Column 1: Auto Fetch */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: '#3b82f6' }}>
                                    <Sparkles size={18} />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Preuzimanje sa Sajta</h4>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Link ka sajtu hotela</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        className="form-input"
                                        placeholder="https://www.hotel.com"
                                        value={websiteUrl}
                                        onChange={e => setWebsiteUrl(e.target.value)}
                                        style={{ background: 'var(--bg-main)' }}
                                    />
                                    <button
                                        className="btn-primary-glow"
                                        onClick={handleFetchImages}
                                        disabled={isFetching}
                                        style={{ whiteSpace: 'nowrap', padding: '0 20px' }}
                                    >
                                        {isFetching ? '...' : 'Preuzmi'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '12px', borderRadius: '10px', fontSize: '12px', lineHeight: '1.5' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', fontWeight: '600' }}>
                                <AlertCircle size={14} style={{ marginTop: '1px' }} />
                                Demo Mod Aktiviran
                            </div>
                            Sistem će koristiti demo slike zbog CORS ograničenja browsera. U produkciji bi ovo preuzimalo prave slike sa sajta.
                        </div>
                    </div>

                    {/* Column 2: Quick Manual Add */}
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '24px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}>
                                <Plus size={18} />
                            </div>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Brzi Ručni Unos</h4>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input type="url" className="form-input" placeholder="https://image-url.com..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ background: 'var(--bg-main)' }} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <select className="form-select" value={imageCategory} onChange={e => setImageCategory(e.target.value as any)} style={{ background: 'var(--bg-main)' }}>
                                    <option value="Exterior">Exterior</option>
                                    <option value="Lobby">Lobby</option>
                                    <option value="Room">Room</option>
                                    <option value="Pool">Pool</option>
                                </select>
                                <button className="btn-secondary" onClick={addImage} disabled={!imageUrl} style={{ justifyContent: 'center', background: 'var(--bg-main)' }}>Dodaj Sliku</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery Grid */}
                {data.images && data.images.length > 0 ? (
                    <div className="image-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                        {data.images.map((image, index) => (
                            <div
                                key={index}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'grab',
                                    opacity: draggedIndex === index ? 0.4 : 1,
                                    transform: draggedIndex === index ? 'scale(0.95)' : 'scale(1)',
                                    transition: 'all 0.2s',
                                    boxShadow: draggedIndex === index ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div style={{ height: '160px', background: `url(${image.url}) center/cover`, position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                                        {image.category}
                                    </div>
                                    <button onClick={(e) => { e.preventDefault(); deleteImage(index); }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}>
                                        <Trash2 size={12} />
                                    </button>
                                    <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#fff', color: '#000', fontSize: '10px', padding: '2px 6px', borderTopLeftRadius: '4px', fontWeight: 'bold' }}>
                                        #{index + 1}
                                    </div>
                                </div>
                                <div style={{ padding: '12px', flex: 1 }}>
                                    {image.caption && <p style={{ fontSize: '12px', fontWeight: 500, margin: '0 0 4px 0' }}>{image.caption}</p>}
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{image.url.substring(0, 30)}...</div>
                                    {image.altText && (
                                        <div style={{ fontSize: '10px', color: 'var(--accent)', background: 'rgba(59, 130, 246, 0.1)', padding: '4px', borderRadius: '4px', display: 'inline-block' }}>
                                            SEO: {image.altText.substring(0, 35)}{image.altText.length > 35 ? '...' : ''}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                        <ImageIcon size={32} style={{ opacity: 0.3 }} />
                        <p>Nema slika. Koristite opciju za preuzimanje sa sajta.</p>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', borderRadius: '8px', display: 'flex', gap: '12px' }}>
                <AlertCircle size={16} color="#ffc107" />
                <span style={{ fontSize: '12px', color: '#ffc107' }}>Booking.com zahteva slike min. 1280px širine. Sistem automatski filtrira slike niskog kvaliteta.</span>
            </div>
        </div>
    );
};

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
                                    border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'} `,
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

                                    <div className="form-group span-2">
                                        <label className="form-label">Dobavljač (Partner)</label>
                                        <select
                                            className="form-select"
                                            value={rate.supplierId || ''}
                                            onChange={(e) => updateRate(rateIndex, { supplierId: e.target.value })}
                                        >
                                            <option value="">Direktno / Nema Dobavljača</option>
                                            {MOCK_SUPPLIERS.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                                            ))}
                                        </select>
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
