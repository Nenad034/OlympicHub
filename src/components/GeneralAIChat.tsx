import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Send,
    Brain,
    Loader2,
    User,
    Bot,
    X,
    ShieldCheck,
    Zap,
    GripHorizontal,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    AlertCircle,
    Copy,
    Check,
    Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useConfig } from '../context/ConfigContext';

const FLASH_MODELS = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest"];
const PRO_MODELS = ["gemini-2.0-flash", "gemini-2.5-pro", "gemini-pro-latest"];

interface Message {
    role: 'user' | 'ai';
    text: string;
    model?: string;
    isError?: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    lang: 'sr' | 'en';
    context?: string;
    userLevel?: number;
    analysisData?: any[];
}

declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export default function GeneralAIChat({ isOpen, onClose, lang, context = "Dashboard", userLevel = 1, analysisData = [] }: Props) {
    const { config } = useConfig();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [selectedModel, setSelectedModel] = useState<'PREMIUM' | 'FAST'>('FAST');
    const [isListening, setIsListening] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [dimensions, setDimensions] = useState({ width: 420, height: 650 });
    const scrollRef = useRef<HTMLDivElement>(null);
    const isResizing = useRef(false);

    const speak = useCallback((text: string) => {
        if (!isVoiceEnabled) return;
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang === 'sr' ? 'sr-RS' : 'en-US';
            window.speechSynthesis.speak(utterance);
        } catch (e) { }
    }, [isVoiceEnabled, lang]);

    useEffect(() => {
        if (messages.length === 0) {
            const welcome = lang === 'sr'
                ? `Zdravo! Ja sam vaš AI asistent za ${context}. Kako vam mogu pomoći?`
                : `Hello! I am your AI assistant for ${context}. How can I help you?`;
            setMessages([{ role: 'ai', text: welcome }]);
            setTimeout(() => speak(welcome), 500);
        }
    }, [lang, context, messages.length, speak]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleSend = async (overrideText?: string) => {
        const textToSend = overrideText || input;
        if (!textToSend.trim() || isThinking) return;

        setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
        setInput('');
        setIsThinking(true);

        const modelsToTry = selectedModel === 'FAST' ? FLASH_MODELS : PRO_MODELS;
        let lastError = "";
        let successfulResponse = null;
        let usedModelName = "";

        const apiVersions: ("v1" | "v1beta")[] = ["v1", "v1beta"];

        for (const apiVer of apiVersions) {
            if (successfulResponse) break;
            for (const modelName of modelsToTry) {
                try {
                    const fallbackKey = ""; // Ključ treba uneti u Settings sekciji
                    const apiKey = (config.geminiKey && config.geminiKey.trim().length > 10) ? config.geminiKey.trim() : fallbackKey;
                    const genAI = new GoogleGenerativeAI(apiKey);
                    const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: apiVer });
                    const prompt = `
                        System: Ti si integrisani AI asistent u "Olympic Hub" platformi.
                        Lokacija: ${context}
                        Jezik: ${lang === 'sr' ? 'Srpski' : 'Engleski'}
                        ${analysisData.length > 0 ? `PODACI ZA ANALIZU (Prvih 50 redova): ${JSON.stringify(analysisData.slice(0, 50))}` : 'Trenutno nema učitanih podataka.'}
                        Korisnik pita: ${textToSend}
                    `;
                    const result = await model.generateContent(prompt);
                    successfulResponse = result.response.text();
                    usedModelName = `${modelName}`;
                    if (successfulResponse) break;
                } catch (e: any) {
                    lastError = e.message;
                    if (e.message.includes("429") || e.message.includes("404")) continue;
                    break;
                }
            }
        }

        if (successfulResponse) {
            setMessages(prev => [...prev, { role: 'ai', text: successfulResponse, model: usedModelName }]);
            speak(successfulResponse);
        } else {
            setMessages(prev => [...prev, { role: 'ai', text: lang === 'sr' ? `Povezivanje nije uspelo: ${lastError}` : `Connection failed: ${lastError}`, isError: true }]);
        }
        setIsThinking(false);
    };

    const startResizing = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing.current = true;
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = dimensions.width;
        const startH = dimensions.height;

        const onPointerMove = (moveEvent: PointerEvent) => {
            if (!isResizing.current) return;
            const deltaX = startX - moveEvent.clientX;
            const deltaY = startY - moveEvent.clientY;
            setDimensions({
                width: Math.max(320, Math.min(800, startW + deltaX)),
                height: Math.max(400, Math.min(900, startH + deltaY))
            });
        };

        const onPointerUp = () => {
            isResizing.current = false;
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const toggleListening = () => {
        const SpeechRecognition = window.webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'sr' ? 'sr-RS' : 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) handleSend(transcript);
        };
        recognition.start();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    drag dragMomentum={false}
                    initial={{ opacity: 0, scale: 0.9, y: 100 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 100 }}
                    style={{
                        position: 'fixed', bottom: '30px', right: '30px',
                        width: `${dimensions.width}px`,
                        height: `${dimensions.height}px`,
                        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '28px',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column',
                        zIndex: 99999, overflow: 'hidden', backdropFilter: 'blur(30px)', touchAction: 'none'
                    }}
                >
                    <div
                        onPointerDown={startResizing}
                        style={{
                            position: 'absolute', top: 0, left: 0, width: '30px', height: '30px',
                            cursor: 'nw-resize', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: 0.3
                        }}
                    >
                        <Maximize2 size={14} style={{ transform: 'rotate(-45deg)', color: '#fff' }} />
                    </div>

                    <div style={{ padding: '20px', background: 'var(--gradient-blue)', color: '#fff', cursor: 'move', userSelect: 'none', flexShrink: 0, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', opacity: 0.5 }}>
                            <GripHorizontal size={16} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '10px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px' }}><Brain size={24} /></div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '16px' }}>Olympic Hub AI</div>
                                    <div style={{ fontSize: '11px', opacity: 0.8 }}>{context} Mode • Lvl {userLevel}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '6px', borderRadius: '10px', cursor: 'pointer' }}>
                                    {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                </button>
                                <button onPointerDown={(e) => e.stopPropagation()} onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '6px', borderRadius: '10px', cursor: 'pointer' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div onPointerDown={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                            <button onClick={() => setSelectedModel('FAST')} className={`model-tag ${selectedModel === 'FAST' ? 'active' : ''}`}><Zap size={12} /> Standard (Fast)</button>
                            <button onClick={() => setSelectedModel('PREMIUM')} className={`model-tag ${selectedModel === 'PREMIUM' ? 'active' : ''}`}><ShieldCheck size={12} /> Analitika (Advanced)</button>
                        </div>
                    </div>

                    <div onPointerDown={(e) => e.stopPropagation()} ref={scrollRef} style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: m.role === 'user' ? 'var(--gradient-purple)' : (m.isError ? "rgba(239,68,68,0.1)" : 'var(--glass-bg)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {m.role === 'user' ? <User size={18} color="#fff" /> : (m.isError ? <AlertCircle size={18} color="#ef4444" /> : <Bot size={18} color="var(--accent)" />)}
                                </div>
                                <div style={{ maxWidth: '80%', position: 'relative' }} className="message-container">
                                    <div style={{ padding: '14px 18px', borderRadius: '20px', fontSize: '13.5px', background: m.role === 'user' ? 'var(--accent)' : 'var(--glass-bg)', color: m.role === 'user' ? '#fff' : (m.isError ? "#ef4444" : 'var(--text-primary)'), border: '1px solid var(--border)', userSelect: 'text' }}>
                                        {m.text}
                                        <button onClick={() => copyToClipboard(m.text, i)} style={{ position: 'absolute', top: '-10px', right: m.role === 'user' ? 'auto' : '-10px', left: m.role === 'user' ? '-10px' : 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="copy-btn">
                                            {copiedIndex === i ? <Check size={12} color="var(--accent)" /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                    {m.model && <span style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Powered by {m.model}</span>}
                                </div>
                            </div>
                        ))}
                        {isThinking && <div style={{ display: 'flex', gap: '10px', color: 'var(--text-secondary)', fontSize: '12px', marginLeft: '48px' }}><Loader2 size={16} className="rotate" /> Gemini razmišlja...</div>}
                    </div>

                    <div onPointerDown={(e) => e.stopPropagation()} style={{ padding: '24px', borderTop: '1px solid var(--border)', background: 'var(--bg-sidebar)' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={toggleListening} style={{ background: isListening ? 'var(--accent)' : 'var(--glass-bg)', border: '1px solid var(--border)', width: '46px', height: '46px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: isListening ? 'pulse 1.5s infinite' : 'none' }}>
                                {isListening ? <MicOff size={22} color="#fff" /> : <Mic size={22} color="var(--text-primary)" />}
                            </button>
                            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Pitajte bilo šta..." style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 18px', color: 'var(--text-primary)', outline: 'none' }} />
                            <button onClick={() => handleSend()} disabled={isThinking} style={{ background: 'var(--gradient-blue)', width: '46px', height: '46px', borderRadius: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={22} color="#fff" /></button>
                        </div>
                    </div>
                    <style>{`
                        .model-tag { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 8px; font-size: 10px; font-weight: 600; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); cursor: pointer; }
                        .model-tag.active { background: #fff; color: var(--accent); }
                        .rotate { animation: spin 1s linear infinite; }
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                        @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 92, 197, 0.4); } 70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(0, 92, 197, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 92, 197, 0); } }
                        .message-container:hover .copy-btn { opacity: 1 !important; }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
