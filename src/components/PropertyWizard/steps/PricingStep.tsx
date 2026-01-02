import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Sparkles, Check, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Property, RoomType } from '../../../types/property.types';
import {
    PriceList,
    PersonCategory,
    RoomTypePricing,
    PricingRule,
    ImportPreview,
    AIAssistantMessage
} from '../../../types/pricing.types';
import { generatePricingRules, calculateFinalPrice } from '../../../utils/pricingRulesGenerator';
import { parsePriceListFile, detectFileType, validateImportPreview } from '../../../utils/priceListParsers';

interface PricingStepProps {
    property: Property;
    onUpdate: (property: Partial<Property>) => void;
}

export default function PricingStep({ property, onUpdate }: PricingStepProps) {
    const [priceList, setPriceList] = useState<PriceList | null>(null);
    const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
    const [includePermutations, setIncludePermutations] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
    const [aiMessages, setAiMessages] = useState<AIAssistantMessage[]>([]);
    const [aiPrompt, setAiPrompt] = useState('');

    // Initialize price list with default categories
    useEffect(() => {
        if (!priceList && property.rooms && property.rooms.length > 0) {
            const defaultCategories: PersonCategory[] = [
                { code: 'ADL', label: 'Odrasli', ageFrom: 18, ageTo: 99 },
                { code: 'CHD1', label: 'Deca 2-7', ageFrom: 2, ageTo: 7 },
                { code: 'CHD2', label: 'Deca 7-12', ageFrom: 7, ageTo: 12 },
                { code: 'CHD3', label: 'Deca 12-18', ageFrom: 12, ageTo: 18 },
                { code: 'INF', label: 'Beba 0-2', ageFrom: 0, ageTo: 2 }
            ];

            setPriceList({
                id: `pricelist_${Date.now()}`,
                name: 'Novi Cenovnik',
                propertyId: property.id || '',
                validFrom: new Date(),
                validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 year
                personCategories: defaultCategories,
                roomTypePricing: [],
                validationStatus: 'pending'
            });
        }
    }, [property.rooms, priceList]);

    // Handle file upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);

        try {
            const fileType = detectFileType(file.name);
            if (!fileType) {
                alert('Nepodržan format fajla. Podržani formati: Excel, PDF, JSON, XML, HTML');
                return;
            }

            const preview = await parsePriceListFile(file, fileType);

            // Validate preview
            const validationErrors = validateImportPreview(preview);
            if (validationErrors.length > 0) {
                preview.errors = [...preview.errors, ...validationErrors];
            }

            setImportPreview(preview);

            // Add AI message
            const message: AIAssistantMessage = {
                id: `msg_${Date.now()}`,
                role: 'assistant',
                content: `Učitao sam cenovnik iz fajla "${file.name}". Pronađeno je ${preview.personCategories.length} kategorija osoba i ${preview.roomTypePricing.length} tipova soba. Molim vas pregledajte i potvrdite.`,
                timestamp: new Date(),
                preview,
                requiresValidation: true,
                validationStatus: 'pending'
            };

            setAiMessages(prev => [...prev, message]);
        } catch (error) {
            alert(`Greška pri učitavanju fajla: ${error instanceof Error ? error.message : 'Nepoznata greška'}`);
        } finally {
            setIsImporting(false);
        }
    };

    // Handle import approval
    const handleApproveImport = () => {
        if (!importPreview || !priceList) return;

        setPriceList({
            ...priceList,
            personCategories: importPreview.personCategories,
            roomTypePricing: importPreview.roomTypePricing,
            validationStatus: 'approved'
        });

        setImportPreview(null);

        // Update AI message
        setAiMessages(prev => prev.map(msg =>
            msg.requiresValidation && msg.validationStatus === 'pending'
                ? { ...msg, validationStatus: 'approved' }
                : msg
        ));
    };

    // Handle import rejection
    const handleRejectImport = (reason: string) => {
        setImportPreview(null);

        // Update AI message
        setAiMessages(prev => prev.map(msg =>
            msg.requiresValidation && msg.validationStatus === 'pending'
                ? { ...msg, validationStatus: 'rejected' }
                : msg
        ));

        // Add user feedback message
        const feedbackMessage: AIAssistantMessage = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content: `Odbijen import: ${reason}`,
            timestamp: new Date()
        };

        setAiMessages(prev => [...prev, feedbackMessage]);
    };

    // Generate pricing rules for a room type
    const handleGenerateRules = (roomType: RoomType) => {
        if (!priceList) return;

        const rules = generatePricingRules(roomType, priceList.personCategories, includePermutations);

        const roomTypePricing: RoomTypePricing = {
            roomTypeId: roomType.id || '',
            roomTypeName: roomType.nameInternal || '',
            baseOccupancyVariants: roomType.allowedOccupancyVariants || [],
            pricingRules: rules
        };

        setPriceList({
            ...priceList,
            roomTypePricing: [
                ...priceList.roomTypePricing.filter(rtp => rtp.roomTypeId !== roomType.id),
                roomTypePricing
            ]
        });

        setSelectedRoomType(roomType.id || null);
    };

    // Update pricing rule
    const handleUpdateRule = (roomTypeId: string, ruleId: string, updates: Partial<PricingRule>) => {
        if (!priceList) return;

        setPriceList({
            ...priceList,
            roomTypePricing: priceList.roomTypePricing.map(rtp => {
                if (rtp.roomTypeId !== roomTypeId) return rtp;

                return {
                    ...rtp,
                    pricingRules: rtp.pricingRules.map(rule => {
                        if (rule.id !== ruleId) return rule;

                        const updatedRule = { ...rule, ...updates };
                        updatedRule.finalPrice = calculateFinalPrice(updatedRule);
                        return updatedRule;
                    })
                };
            })
        });
    };

    if (!priceList) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Cenovnik</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Kreirajte i upravljajte cenovnicima za sve tipove soba</p>
            </div>

            {/* Price List Info */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                        <label className="form-label">Naziv Cenovnika</label>
                        <input
                            className="glass-input"
                            value={priceList.name}
                            onChange={(e) => setPriceList({ ...priceList, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="form-label">Važi Od</label>
                        <input
                            type="date"
                            className="glass-input"
                            value={priceList.validFrom.toISOString().split('T')[0]}
                            onChange={(e) => setPriceList({ ...priceList, validFrom: new Date(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="form-label">Važi Do</label>
                        <input
                            type="date"
                            className="glass-input"
                            value={priceList.validTo.toISOString().split('T')[0]}
                            onChange={(e) => setPriceList({ ...priceList, validTo: new Date(e.target.value) })}
                        />
                    </div>
                </div>
            </div>

            {/* Import Section */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={20} />
                    Import Cenovnika
                </h3>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <label className="glass-button" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} />
                        Excel (.xlsx, .xls)
                        <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>

                    <label className="glass-button" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} />
                        PDF (.pdf)
                        <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>

                    <label className="glass-button" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} />
                        JSON (.json)
                        <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>

                    <label className="glass-button" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} />
                        XML (.xml)
                        <input type="file" accept=".xml" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>

                    <label className="glass-button" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} />
                        HTML (.html)
                        <input type="file" accept=".html,.htm" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                </div>

                {isImporting && (
                    <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                        Učitavam fajl...
                    </div>
                )}
            </div>

            {/* Import Preview */}
            <AnimatePresence>
                {importPreview && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card"
                        style={{ padding: '24px', marginBottom: '24px', border: '2px solid rgba(59, 130, 246, 0.3)' }}
                    >
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={20} color="#3b82f6" />
                            Pregled Importa - Potrebna Validacija
                        </h3>

                        <div style={{ marginBottom: '16px' }}>
                            <strong>Kategorije Osoba ({importPreview.personCategories.length}):</strong>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                {importPreview.personCategories.map(cat => (
                                    <div key={cat.code} style={{ padding: '6px 12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', fontSize: '14px' }}>
                                        {cat.label} ({cat.ageFrom}-{cat.ageTo})
                                    </div>
                                ))}
                            </div>
                        </div>

                        {importPreview.warnings.length > 0 && (
                            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '8px' }}>
                                <strong>Upozorenja:</strong>
                                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                    {importPreview.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                        )}

                        {importPreview.errors.length > 0 && (
                            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                                <strong>Greške:</strong>
                                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                    {importPreview.errors.map((e, i) => <li key={i}>{e}</li>)}
                                </ul>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                className="glass-button"
                                onClick={handleApproveImport}
                                disabled={importPreview.errors.length > 0}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34, 197, 94, 0.15)' }}
                            >
                                <Check size={16} />
                                Odobri Import
                            </button>

                            <button
                                className="glass-button"
                                onClick={() => {
                                    const reason = prompt('Razlog odbijanja:');
                                    if (reason) handleRejectImport(reason);
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.15)' }}
                            >
                                <X size={16} />
                                Odbij Import
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Person Categories */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Kategorije Osoba</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {priceList.personCategories.map(category => (
                        <div key={category.code} className="glass-card" style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 700, marginBottom: '4px' }}>{category.label}</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                {category.ageFrom} - {category.ageTo} godina
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Room Types */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Tipovi Soba</h3>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                            type="checkbox"
                            checked={includePermutations}
                            onChange={(e) => setIncludePermutations(e.target.checked)}
                        />
                        Uključi permutacije (različit redosled dece)
                    </label>
                </div>

                {property.rooms && property.rooms.map(room => {
                    const roomPricing = priceList.roomTypePricing.find(rtp => rtp.roomTypeId === room.id);
                    const isExpanded = selectedRoomType === room.id;

                    return (
                        <div key={room.id} className="glass-card" style={{ padding: '16px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{room.nameInternal}</h4>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        {room.osnovniKreveti} osnovnih + {room.pomocniKreveti} pomoćnih kreveta
                                    </div>
                                </div>

                                <button
                                    className="glass-button"
                                    onClick={() => handleGenerateRules(room)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <Sparkles size={16} />
                                    {roomPricing ? 'Regeneriši Pravila' : 'Generiši Pravila'}
                                </button>
                            </div>

                            {roomPricing && (
                                <div style={{ marginTop: '16px', fontSize: '14px' }}>
                                    <strong>Generisano {roomPricing.pricingRules.length} pravila</strong>
                                    <button
                                        className="glass-button"
                                        onClick={() => setSelectedRoomType(isExpanded ? null : room.id || null)}
                                        style={{ marginLeft: '12px', fontSize: '12px', padding: '4px 12px' }}
                                    >
                                        {isExpanded ? 'Sakrij' : 'Prikaži'}
                                    </button>
                                </div>
                            )}

                            <AnimatePresence>
                                {isExpanded && roomPricing && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden', marginTop: '16px' }}
                                    >
                                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            <table style={{ width: '100%', fontSize: '14px' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                        <th style={{ padding: '8px', textAlign: 'left' }}>Aktivno</th>
                                                        <th style={{ padding: '8px', textAlign: 'left' }}>Raspored</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>Osnovna Cena</th>
                                                        <th style={{ padding: '8px', textAlign: 'right' }}>Finalna Cena</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {roomPricing.pricingRules.map(rule => (
                                                        <tr key={rule.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <td style={{ padding: '8px' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={rule.isActive}
                                                                    onChange={(e) => handleUpdateRule(room.id || '', rule.id, { isActive: e.target.checked })}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '8px' }}>
                                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                                    {rule.bedAssignment.map((bed, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            style={{
                                                                                padding: '2px 6px',
                                                                                borderRadius: '4px',
                                                                                fontSize: '11px',
                                                                                background: bed.personCategory === 'ADL' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                                                color: bed.personCategory === 'ADL' ? '#3b82f6' : '#10b981'
                                                                            }}
                                                                        >
                                                                            {bed.personCategory}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                                                <input
                                                                    type="number"
                                                                    value={rule.basePrice}
                                                                    onChange={(e) => handleUpdateRule(room.id || '', rule.id, { basePrice: parseFloat(e.target.value) || 0 })}
                                                                    style={{ width: '80px', textAlign: 'right', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '4px 8px' }}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>
                                                                €{rule.finalPrice.toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
