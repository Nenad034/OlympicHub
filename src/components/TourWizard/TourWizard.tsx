import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flag,
    Map,
    Truck,
    DollarSign,
    Check,
    ChevronRight,
    ChevronLeft,
    Save,
    X,
    Globe
} from 'lucide-react';
import type { Tour } from '../../types/tour.types';
import './TourWizard.styles.css';

// Steps (will create these next)
import BasicInfoStep from './steps/BasicInfoStep';
import ItineraryStep from './steps/ItineraryStep';
import LogisticsStep from './steps/LogisticsStep';
import CommercialStep from './steps/CommercialStep';

interface TourWizardProps {
    onClose: () => void;
    onSave: (tour: Partial<Tour>) => void;
    initialData?: Partial<Tour>;
}

const TourWizard: React.FC<TourWizardProps> = ({ onClose, onSave, initialData }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [tourData, setTourData] = useState<Partial<Tour>>(initialData || {
        category: 'Grupno',
        status: 'Draft',
        itinerary: [],
        supplements: [],
        highlights: [],
        currency: 'EUR'
    });

    const steps = [
        { id: 'basic', title: 'Koncept', icon: <Flag size={20} /> },
        { id: 'itinerary', title: 'Itinerer', icon: <Map size={20} /> },
        { id: 'logistics', title: 'Logistika', icon: <Truck size={20} /> },
        { id: 'commercial', title: 'Cenovnik', icon: <DollarSign size={20} /> }
    ];

    const updateTour = (updates: Partial<Tour>) => {
        setTourData(prev => ({ ...prev, ...updates }));
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const renderStep = () => {
        const props = { data: tourData, onChange: updateTour };
        switch (steps[currentStep].id) {
            case 'basic': return <BasicInfoStep {...props} />;
            case 'itinerary': return <ItineraryStep {...props} />;
            case 'logistics': return <LogisticsStep {...props} />;
            case 'commercial': return <CommercialStep {...props} />;
            default: return null;
        }
    };

    return (
        <div className="tour-wizard-overlay">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="tour-wizard-container"
            >
                {/* Header */}
                <div className="tour-wizard-header">
                    <div className="header-left">
                        <div className="tour-icon-badge">
                            <Globe size={24} className="pulse" />
                        </div>
                        <div>
                            <h2>Grand Tour Architect</h2>
                            <p>Kreiranje grupnog aranžmana • Musashi Strategija</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                {/* Progress Stepper */}
                <div className="tour-stepper">
                    {steps.map((step, idx) => (
                        <div
                            key={step.id}
                            className={`step-item ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                            onClick={() => setCurrentStep(idx)}
                        >
                            <div className="step-point">
                                {idx < currentStep ? <Check size={14} /> : step.icon}
                            </div>
                            <span>{step.title}</span>
                            {idx < steps.length - 1 && <div className="step-line" />}
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="tour-wizard-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="tour-wizard-footer">
                    <button
                        className="btn-back"
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                    >
                        <ChevronLeft size={18} /> Nazad
                    </button>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-secondary" onClick={() => onSave(tourData)}>
                            <Save size={18} /> Sačuvaj Draft
                        </button>
                        {currentStep < steps.length - 1 ? (
                            <button className="btn-primary" onClick={handleNext}>
                                Dalje <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button className="btn-finish" onClick={() => onSave(tourData)}>
                                <Check size={18} /> Objavi Putovanje
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TourWizard;
