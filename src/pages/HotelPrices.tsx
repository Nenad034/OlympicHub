import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Brain,
    Sparkles,
    Upload,
    Save,
    RefreshCw,
    X,
    Check,
    ChevronRight,
    TrendingUp,
    Plus,
    Zap,
    Calendar
} from 'lucide-react';
import { loadFromCloud, saveToCloud } from '../utils/storageUtils';
import { useConfig } from '../context/ConfigContext';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Types ---
interface PriceOption {
    id: string;
    period: string;
    roomType: string;
    mealPlan: string;
    price: number;
    currency: string;
    occupancy: string;
    status: 'current' | 'suggested' | 'pending';
    source?: string;
}

interface AIAdjustment {
    id: string;
    targetId: string;
    originalValue: number;
    newValue: number;
    reason: string;
    confidence: number;
}

const HotelPrices: React.FC = () => {
    const { hotelSlug } = useParams<{ hotelSlug: string }>();
    const navigate = useNavigate();
    const { config } = useConfig();

    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [prices, setPrices] = useState<PriceOption[]>([]);
    const [pendingAdjustments, setPendingAdjustments] = useState<AIAdjustment[]>([]);
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'suggesting'>('idle');
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Load
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { success, data } = await loadFromCloud('properties');
            let hotels = [];
            if (success && data) hotels = data;
            else {
                const saved = localStorage.getItem('olympic_hub_hotels');
                if (saved) hotels = JSON.parse(saved);
            }

            const found = hotels.find((h: any) => {
                const slug = h.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                return slug === hotelSlug || h.id.toString() === hotelSlug;
            });

            if (found) {
                setHotel(found);
                // Mock initial prices if none exist
                const initialPrices: PriceOption[] = [
                    { id: 'p1', period: '01.06 - 30.06', roomType: 'Standard Room', mealPlan: 'HB', price: 85, currency: 'EUR', occupancy: '2 ADL', status: 'current' },
                    { id: 'p2', period: '01.07 - 31.08', roomType: 'Standard Room', mealPlan: 'HB', price: 110, currency: 'EUR', occupancy: '2 ADL', status: 'current' },
                    { id: 'p3', period: '01.09 - 30.09', roomType: 'Standard Room', mealPlan: 'HB', price: 90, currency: 'EUR', occupancy: '2 ADL', status: 'current' },
                    { id: 'p4', period: '01.06 - 30.06', roomType: 'Family Suite', mealPlan: 'HB', price: 140, currency: 'EUR', occupancy: '2 ADL + 2 CHD', status: 'current' },
                ];
                setPrices(initialPrices);
            }
            setLoading(false);
        };
        fetchData();
    }, [hotelSlug]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAILoading(true);
        setAiStatus('analyzing');

        // Simulate AI analysis of file
        setTimeout(() => {
            const newAdjustments: AIAdjustment[] = [
                {
                    id: 'adj1',
                    targetId: 'p2',
                    originalValue: 110,
                    newValue: 125,
                    reason: 'Tržišna analiza pokazuje povećanu potražnju za Jul/Avg period. Konkurentski hoteli su podigli cene za 15%.',
                    confidence: 0.94
                },
                {
                    id: 'adj2',
                    targetId: 'p3',
                    originalValue: 90,
                    newValue: 95,
                    reason: 'Rana rezervacija za septembar je iznad proseka. Preporučuje se blagi porast.',
                    confidence: 0.88
                }
            ];
            setPendingAdjustments(newAdjustments);
            setAiStatus('suggesting');
            setIsAILoading(false);

            setChatHistory(prev => [...prev, {
                role: 'ai',
                text: `Analizirao sam vaš fajl "${file.name}". Detektovao sam mogućnosti za optimizaciju cena na osnovu trenutnih trendova na tržištu. Pogledajte predložene izmene u desnom panelu.`
            }]);
        }, 2500);
    };

    const approveAdjustment = async (adj: AIAdjustment) => {
        const updatedPrices = prices.map(p => p.id === adj.targetId ? { ...p, price: adj.newValue } : p);
        setPrices(updatedPrices);
        setPendingAdjustments(prev => prev.filter(a => a.id !== adj.id));
        if (pendingAdjustments.length === 1) setAiStatus('idle');

        // Persist change
        await saveToCloud('property_prices', updatedPrices);
    };

    const rejectAdjustment = (adjId: string) => {
        setPendingAdjustments(prev => prev.filter(a => a.id !== adjId));
        if (pendingAdjustments.length === 1) setAiStatus('idle');
    };

    const handleChatSubmit = async () => {
        if (!chatInput.trim()) return;

        const userText = chatInput;
        setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
        setChatInput('');
        setIsAILoading(true);

        // Simulate AI logic
        try {
            if (config.geminiKey) {
                const genAI = new GoogleGenerativeAI(config.geminiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                const prompt = `Ti si Price AI Assistant za Olympic Hub ERP. Upravljaš cenama za hotel ${hotel.name}. 
                Korisnik kaže: "${userText}"
                Trenutne cene: ${JSON.stringify(prices)}
                Odgovori profesionalno na srpskom jeziku i predloži konkretne akcije ako je potrebno.`;

                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                setChatHistory(prev => [...prev, { role: 'ai', text: responseText }]);
            } else {
                setTimeout(() => {
                    setChatHistory(prev => [...prev, { role: 'ai', text: "Žao mi je, Gemini API ključ nije podešen. Molim vas podesite ga u Settings-u kako bih mogao da analiziram vaše zahteve." }]);
                }, 1000);
            }
        } catch (e) {
            setChatHistory(prev => [...prev, { role: 'ai', text: "Došlo je do greške u komunikaciji sa AI modelom." }]);
        } finally {
            setIsAILoading(false);
        }
    };

    if (loading) return <div className="loading-container">Učitavanje...</div>;

    return (
        <div className="module-container fade-in" style={{
            height: 'calc(100vh - 120px)',
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '24px',
            overflow: 'hidden'
        }}>
            {/* Left Content Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '8px' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => navigate(`/production/hotels/${hotelSlug}`)} className="btn-icon circle">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                <Link to="/production/hotels" style={{ color: 'inherit', textDecoration: 'none' }}>Hoteli</Link>
                                <ChevronRight size={12} />
                                <span>{hotel.name}</span>
                                <ChevronRight size={12} />
                                <span style={{ color: 'var(--accent)' }}>Cenovnik i AI Pametni Asistent</span>
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 0' }}>Price AI Management</h1>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-glass" onClick={() => fileInputRef.current?.click()}>
                            <Upload size={18} /> Uvezi Cenovnik
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.xls,.xlsx,.json" />
                        <button className="btn-primary-action" style={{ background: 'var(--gradient-blue)' }}>
                            <Save size={18} /> Sačuvaj Izmene
                        </button>
                    </div>
                </div>

                {/* AI Status Dashboard */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px'
                }}>
                    <motion.div
                        whileHover={{ y: -5 }}
                        style={{
                            border: '1px solid var(--border)',
                            borderRadius: '20px',
                            padding: '20px',
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%)'
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>PRICING PULSE</span>
                            <Zap size={18} color="#3b82f6" />
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>94% Optimalno</div>
                        <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <TrendingUp size={14} /> +2.4% vs prošla sezona
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        style={{
                            border: '1px solid var(--border)',
                            borderRadius: '20px',
                            padding: '20px',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%)'
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>REVPAR FORECAST</span>
                            <TrendingUp size={18} color="#10b981" />
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>€ 118.50</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Predviđeno za Q3 2026</div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        style={{
                            border: '1px solid var(--border)',
                            borderRadius: '20px',
                            padding: '20px',
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%)'
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>PREPORUKE</span>
                            <Brain size={18} color="#8b5cf6" />
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>{pendingAdjustments.length} Nove</div>
                        <div style={{ fontSize: '12px', color: '#8b5cf6', marginTop: '4px' }}>AI sugerisane promene</div>
                    </motion.div>
                </div>

                {/* Primary Price Table */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: '24px',
                    border: '1px solid var(--border)',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Glavni Cenovnik</h3>
                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            <Plus size={14} /> Dodaj Period
                        </button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>PERIOD</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>TIP SOBE</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>USLUGA</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>STRUKTURA</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>CENA</th>
                                <th style={{ padding: '16px 24px', width: '60px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {prices.map(p => {
                                const adj = pendingAdjustments.find(a => a.targetId === p.id);
                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Calendar size={14} color="var(--text-secondary)" />
                                                <span style={{ fontWeight: '500' }}>{p.period}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{p.roomType}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{p.mealPlan}</span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '13px' }}>{p.occupancy}</td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <span style={{ color: adj ? 'var(--text-secondary)' : '#fff', textDecoration: adj ? 'line-through' : 'none', fontSize: adj ? '12px' : '15px' }}>
                                                    {p.price} {p.currency}
                                                </span>
                                                {adj && (
                                                    <motion.span
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        style={{ color: '#10b981', fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        {adj.newValue} {p.currency} <Sparkles size={14} />
                                                    </motion.span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <ChevronRight size={16} color="var(--text-secondary)" cursor="pointer" />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Assistant Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* AI Status Card */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: '24px',
                    border: '1px solid var(--border)',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '14px',
                            background: 'var(--gradient-purple)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: '#fff',
                            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
                        }}>
                            <Brain size={24} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '16px' }}>Price AI Assistant</div>
                            <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                                {aiStatus !== 'idle' ? `AI: ${aiStatus.toUpperCase()}...` : 'Aktivan i Posmatra Market'}
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {pendingAdjustments.length > 0 ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                                <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Čeka na odobrenje ({pendingAdjustments.length})</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {pendingAdjustments.map(adj => (
                                        <div key={adj.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                            <div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '800', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                                POVEĆANJE PRIHODA <span style={{ color: 'var(--text-secondary)' }}>{Math.round(adj.confidence * 100)}% Conf.</span>
                                            </div>
                                            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>{adj.originalValue} € → {adj.newValue} €</div>
                                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: '1.4' }}>{adj.reason}</p>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => approveAdjustment(adj)} style={{ flex: 1, background: '#10b981', border: 'none', borderRadius: '8px', color: '#fff', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>
                                                    <Check size={14} style={{ marginRight: '4px' }} /> ODOBRI
                                                </button>
                                                <button onClick={() => rejectAdjustment(adj.id)} style={{ padding: '0 12px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '8px', color: '#ef4444', height: '32px', cursor: 'pointer' }}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                <Sparkles size={24} style={{ color: 'var(--accent)', marginBottom: '12px', opacity: 0.5 }} />
                                <p>Sve cene su trenutno optimalne prema mojim analizama.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* AI Chat Logic Interface */}
                <div style={{
                    flex: 1,
                    background: 'var(--bg-card)',
                    borderRadius: '24px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={16} color="var(--accent)" /> AI Reasoning Console
                    </div>

                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {chatHistory.length === 0 && (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                                Pitajte me bilo šta o strategiji cena, npr: "Kako da optimizujem septembar?" ili "Uvezi PDF cenovnik partnera".
                            </div>
                        )}
                        {chatHistory.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '90%',
                                padding: '10px 14px',
                                borderRadius: '15px',
                                fontSize: '13px',
                                background: msg.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                                border: msg.role === 'user' ? 'none' : '1px solid var(--border)'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        {isAILoading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <RefreshCw size={14} className="spin" /> AI razmišlja...
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleChatSubmit()}
                                placeholder="Komanduj AI asistentu..."
                                style={{
                                    flex: 1,
                                    background: 'var(--bg-main)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    padding: '10px 16px',
                                    color: '#fff',
                                    fontSize: '13px',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleChatSubmit}
                                style={{
                                    width: '40px', height: '40px', borderRadius: '12px', border: 'none',
                                    background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .loading-container { display: flex; align-items: center; justify-content: center; height: 100vh; color: #fff; font-size: 20px; }
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default HotelPrices;
