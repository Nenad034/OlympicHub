import { useState, useEffect, useRef } from 'react';
import {
    Brain,
    Send,
    Sparkles,
    ArrowLeft,
    Cpu,
    Zap,
    Network,
    Activity,
    Users,
    Database,
    Mail,
    Hotel,
    DollarSign,
    Shield,
    RefreshCcw,
    CheckCircle,
    AlertCircle,
    Clock,
    BookOpen,
    Plus,
    Trash2,
    Edit,
    Save,
    Upload,
    FileText,
    File,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeometricBrain } from '../../components/icons/GeometricBrain';
import { supabase } from '../../supabaseClient';
import * as XLSX from 'xlsx';

interface Props {
    onBack: () => void;
    userLevel: number;
}

interface Message {
    id: string;
    role: 'user' | 'orchestrator' | 'agent';
    content: string;
    agentName?: string;
    timestamp: Date;
    status?: 'thinking' | 'processing' | 'complete' | 'error';
}

interface Agent {
    id: string;
    name: string;
    module: string;
    status: 'idle' | 'active' | 'busy' | 'offline';
    capabilities: string[];
    icon: React.ReactNode;
    color: string;
    lastActive?: Date;
    tasksCompleted: number;
    minLevel: number; // Minimum user level required to access this agent
}

interface TrainingDocument {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: Date;
    content?: string; // For text files
}

interface TrainingRule {
    id: string;
    agentId: string;
    title: string;
    description: string;
    trigger: string;
    action: string;
    priority: 'low' | 'medium' | 'high';
    enabled: boolean;
    createdAt: Date;
    documents?: TrainingDocument[]; // Attached learning documents
}

type TabType = 'chat' | 'training';

export default function MasterOrchestrator({ onBack, userLevel }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeAgents, setActiveAgents] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('chat');
    const [trainingRules, setTrainingRules] = useState<TrainingRule[]>([]);
    const [editingRule, setEditingRule] = useState<Partial<TrainingRule> | null>(null);
    const [uploadingDocs, setUploadingDocs] = useState<File[]>([]);
    const [isLoadingRules, setIsLoadingRules] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch rules from Supabase on mount
    useEffect(() => {
        fetchTrainingRules();
    }, []);

    const fetchTrainingRules = async () => {
        setIsLoadingRules(true);
        try {
            const { data, error } = await supabase
                .from('training_rules')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const rules: TrainingRule[] = data.map((row: any) => ({
                    id: row.id,
                    agentId: row.agent_id,
                    title: row.title,
                    description: row.description,
                    trigger: row.trigger_text, // mapping trigger_text to trigger
                    action: row.action_text,   // mapping action_text to action
                    priority: row.priority,
                    enabled: row.enabled,
                    createdAt: new Date(row.created_at),
                    documents: row.documents || [] // Assuming JSONB column for documents
                }));
                setTrainingRules(rules);
            }
        } catch (error) {
            console.error('Error fetching rules:', error);
            // Fallback or just log, current state is empty array
        } finally {
            setIsLoadingRules(false);
        }
    };

    // Definicija svih agenata u sistemu sa nivoima pristupa
    const allAgents: Agent[] = [
        {
            id: 'hotel-agent',
            name: 'Hotel Agent',
            module: 'Production Hub',
            status: 'idle',
            capabilities: ['search_hotels', 'manage_rooms', 'pricing'],
            icon: <Hotel size={20} />,
            color: '#3b82f6',
            tasksCompleted: 0,
            minLevel: 2 // Level 2: Operater - može da pretražuje i upravlja hotelima
        },
        {
            id: 'pricing-agent',
            name: 'Pricing Agent',
            module: 'Pricing Intelligence',
            status: 'idle',
            capabilities: ['calculate_price', 'apply_discounts', 'market_analysis'],
            icon: <DollarSign size={20} />,
            color: '#10b981',
            tasksCompleted: 0,
            minLevel: 3 // Level 3: Menadžer - može da upravlja cenama
        },
        {
            id: 'mail-agent',
            name: 'Mail Agent',
            module: 'Olympic Mail',
            status: 'idle',
            capabilities: ['analyze_email', 'generate_response', 'send_email'],
            icon: <Mail size={20} />,
            color: '#f59e0b',
            tasksCompleted: 0,
            minLevel: 1 // Level 1: Korisnik - svi mogu da koriste mail
        },
        {
            id: 'customer-agent',
            name: 'Customer Agent',
            module: 'Customer Management',
            status: 'idle',
            capabilities: ['customer_lookup', 'booking_history', 'preferences'],
            icon: <Users size={20} />,
            color: '#8b5cf6',
            tasksCompleted: 0,
            minLevel: 2 // Level 2: Operater - može da upravlja kupcima
        },
        {
            id: 'fortress-agent',
            name: 'Fortress Agent',
            module: 'Security',
            status: 'idle',
            capabilities: ['security_analysis', 'threat_detection', 'recommendations'],
            icon: <Shield size={20} />,
            color: '#ef4444',
            tasksCompleted: 0,
            minLevel: 6 // Level 6: Master - samo master ima pristup security
        },
        {
            id: 'data-agent',
            name: 'Data Agent',
            module: 'Database',
            status: 'idle',
            capabilities: ['query_data', 'analytics', 'reporting'],
            icon: <Database size={20} />,
            color: '#06b6d4',
            tasksCompleted: 0,
            minLevel: 4 // Level 4: Admin - može da pristupa podacima i analytics
        }
    ];

    // Filter agents based on user level
    const agents = allAgents.filter(agent => userLevel >= agent.minLevel);

    useEffect(() => {
        // Inicijalna poruka
        setMessages([{
            id: '1',
            role: 'orchestrator',
            content: `Master Orchestrator Online. Upravljam sa ${agents.length} specijalizovanih AI agenata dostupnih na vašem nivou (Level ${userLevel}). Kako mogu da pomognem?`,
            timestamp: new Date(),
            status: 'complete'
        }]);
    }, [agents.length, userLevel]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isProcessing) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsProcessing(true);

        // Simulacija orchestrator razmišljanja
        const thinkingMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'orchestrator',
            content: 'Analiziram zahtev i određujem koje agente treba aktivirati...',
            timestamp: new Date(),
            status: 'thinking'
        };

        setMessages(prev => [...prev, thinkingMessage]);

        // Simulacija identifikacije agenata
        setTimeout(() => {
            const query = input.toLowerCase();
            const identifiedAgents: string[] = [];

            if (query.includes('hotel') || query.includes('smeštaj') || query.includes('soba')) {
                identifiedAgents.push('hotel-agent');
            }
            if (query.includes('cena') || query.includes('popust') || query.includes('price')) {
                identifiedAgents.push('pricing-agent');
            }
            if (query.includes('email') || query.includes('mail') || query.includes('poruka')) {
                identifiedAgents.push('mail-agent');
            }
            if (query.includes('kupac') || query.includes('customer') || query.includes('gost')) {
                identifiedAgents.push('customer-agent');
            }
            if (query.includes('security') || query.includes('napad') || query.includes('bezbednost')) {
                identifiedAgents.push('fortress-agent');
            }
            if (query.includes('data') || query.includes('podatak') || query.includes('report')) {
                identifiedAgents.push('data-agent');
            }

            // Ako nijedan agent nije identifikovan, koristi opšti pristup
            if (identifiedAgents.length === 0) {
                identifiedAgents.push('hotel-agent', 'data-agent');
            }

            setActiveAgents(identifiedAgents);

            // Provera da li se neka pravila (Training Rules) aktiviraju
            const triggeredRules = trainingRules.filter(rule =>
                rule.enabled && (
                    query.includes(rule.title.toLowerCase()) ||
                    (rule.trigger && query.includes(rule.trigger.toLowerCase()))
                )
            );

            // Orchestrator poruka o identifikovanim agentima i pravilima
            const agentNames = identifiedAgents.map(id =>
                agents.find(a => a.id === id)?.name
            ).join(', ');

            let orchestratorContent = `Aktiviram sledeće agente: ${agentNames}`;
            if (triggeredRules.length > 0) {
                orchestratorContent += `\n\nPrimenjujem naučena pravila: ${triggeredRules.map(r => r.title).join(', ')}`;
            }

            const orchestratorMessage: Message = {
                id: (Date.now() + 2).toString(),
                role: 'orchestrator',
                content: orchestratorContent,
                timestamp: new Date(),
                status: 'processing'
            };

            setMessages(prev => [...prev.slice(0, -1), orchestratorMessage]);

            // Simulacija odgovora agenata
            setTimeout(() => {
                identifiedAgents.forEach((agentId, index) => {
                    setTimeout(() => {
                        const agent = agents.find(a => a.id === agentId);
                        if (!agent) return;

                        const agentResponse = generateAgentResponse(agentId, input);

                        const agentMessage: Message = {
                            id: (Date.now() + 3 + index).toString(),
                            role: 'agent',
                            content: agentResponse,
                            agentName: agent.name,
                            timestamp: new Date(),
                            status: 'complete'
                        };

                        setMessages(prev => [...prev, agentMessage]);
                    }, index * 1000);
                });

                // Finalni odgovor orchestrator-a
                setTimeout(() => {
                    const finalMessage: Message = {
                        id: (Date.now() + 100).toString(),
                        role: 'orchestrator',
                        content: 'Svi agenti su završili sa obradom. Rezultati su agregirani i prikazani iznad.',
                        timestamp: new Date(),
                        status: 'complete'
                    };

                    setMessages(prev => [...prev, finalMessage]);
                    setIsProcessing(false);
                    setActiveAgents([]);
                }, identifiedAgents.length * 1000 + 500);
            }, 1500);
        }, 1000);
    };

    const generateAgentResponse = (agentId: string, query: string): string => {
        // Proveri da li postoji specifično pravilo za ovog agenta koje se aktivira
        const queryLower = query.toLowerCase();
        const relevantRule = trainingRules.find(rule =>
            rule.enabled &&
            rule.agentId === agentId &&
            (queryLower.includes(rule.title.toLowerCase()) || (rule.trigger && queryLower.includes(rule.trigger.toLowerCase())))
        );

        if (relevantRule) {
            let response = `Na osnovu naučenog pravila "${relevantRule.title}": ${relevantRule.action}. `;
            if (relevantRule.documents && relevantRule.documents.length > 0) {
                response += `Analizirao sam ${relevantRule.documents.length} dokumenata za učenje. `;

                // Add preview of the first document content if available
                const firstDoc = relevantRule.documents[0];
                if (firstDoc.content) {
                    const preview = firstDoc.content.slice(0, 150).replace(/\n/g, ' ');
                    response += `Izvadak iz "${firstDoc.name}": "${preview}..."`;
                }
            }
            return response;
        }

        const responses: Record<string, string> = {
            'hotel-agent': `Pronašao sam 3 hotela koji odgovaraju vašim kriterijumima. Hotel Splendid (5*), Hotel Mediteran (4*), i Hotel Budva (3*). Svi imaju dostupne sobe za traženi period.`,
            'pricing-agent': `Analizirao sam cene za traženi period. Prosečna cena je 85€ po noći. Detektovao sam early bird popust od 15% za rezervacije 30+ dana unapred.`,
            'mail-agent': `Analizirao sam poslednje email-ove. Pronašao sam 2 nova upita za rezervaciju i 1 zahtev za izmenu postojeće rezervacije. Generisao sam draft odgovore.`,
            'customer-agent': `Uspešno sam locirao profil kupca. Radi se o VIP klijentu sa visokim prioritetom. Prethodne rezervacije ukazuju na preferenciju hotela sa 5* i all-inclusive uslugom.`,
            'fortress-agent': `Sistem bezbednosti je u pripravnosti. Skenirao sam mrežni saobraćaj i nisam detektovao nikakve sumnjive aktivnosti. Firewall pravila su ažurirana.`,
            'data-agent': `Izveštaj je spreman. Prodaja je porasla za 12% u odnosu na prošli mesec. Najprodavaniji paketi su "Luxury Summer 2026" i "Budva Weekend Getaway".`
        };

        return responses[agentId] || `${agentId} je obradio zahtev i vratio rezultate.`;
    };

    const getStatusColor = (status: Agent['status']) => {
        switch (status) {
            case 'active': return '#10b981';
            case 'busy': return '#f59e0b';
            case 'offline': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getMessageStatusIcon = (status?: Message['status']) => {
        switch (status) {
            case 'thinking': return <RefreshCcw size={14} className="spin" />;
            case 'processing': return <Activity size={14} className="pulse" />;
            case 'complete': return <CheckCircle size={14} />;
            case 'error': return <AlertCircle size={14} />;
            default: return null;
        }
    };

    // Training Rules Functions
    const handleAddRule = async () => {
        // Legacy method, not used in favor of handleAddRuleWithDocs
        console.warn('Use handleAddRuleWithDocs instead');
    };

    const handleDeleteRule = async (id: string) => {
        // Optimistic update
        setTrainingRules(prev => prev.filter(r => r.id !== id));

        try {
            const { error } = await supabase
                .from('training_rules')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting rule:', error);
            // Revert on error would go here (fetchTrainingRules())
            fetchTrainingRules();
        }
    };

    const handleToggleRule = async (id: string) => {
        const rule = trainingRules.find(r => r.id === id);
        if (!rule) return;

        // Optimistic update
        setTrainingRules(prev => prev.map(r =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
        ));

        try {
            const { error } = await supabase
                .from('training_rules')
                .update({ enabled: !rule.enabled })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error toggling rule:', error);
            fetchTrainingRules();
        }
    };

    const getPriorityColor = (priority: TrainingRule['priority']) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#3b82f6';
        }
    };

    // Document Upload Functions
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setUploadingDocs(prev => [...prev, ...files]);
    };

    const handleRemoveUploadingDoc = (index: number) => {
        setUploadingDocs(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddRuleWithDocs = async () => {
        if (!editingRule?.title || !editingRule?.agentId) return;

        // Process uploaded documents
        const documents: TrainingDocument[] = await Promise.all(
            uploadingDocs.map(async (file) => {
                let content: string | undefined;

                // Read text-based files
                if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.type.includes('json')) {
                    content = await file.text();
                } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    // Parse Excel files
                    try {
                        const arrayBuffer = await file.arrayBuffer();
                        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const sheet = workbook.Sheets[sheetName];
                        // Convert to CSV for token-efficient storage
                        content = XLSX.utils.sheet_to_csv(sheet);
                    } catch (err) {
                        console.error('Error parsing Excel file:', err);
                        content = 'Error parsing Excel file.';
                    }
                }

                return {
                    id: Date.now().toString() + Math.random(),
                    name: file.name,
                    type: file.type || 'application/octet-stream',
                    size: file.size,
                    uploadedAt: new Date(),
                    content
                };
            })
        );

        const newRuleData = {
            agent_id: editingRule.agentId,
            title: editingRule.title,
            description: editingRule.description || '',
            trigger_text: editingRule.trigger || '',
            action_text: editingRule.action || '',
            priority: editingRule.priority || 'medium',
            enabled: true,
            documents: documents.length > 0 ? documents : null
            // created_at is handled by default now() in DB usually, but we can pass it if needed
        };

        try {
            const { data, error } = await supabase
                .from('training_rules')
                .insert([newRuleData])
                .select()
                .single();

            if (error) throw error;

            if (data) {
                const newRule: TrainingRule = {
                    id: data.id,
                    agentId: data.agent_id,
                    title: data.title,
                    description: data.description,
                    trigger: data.trigger_text,
                    action: data.action_text,
                    priority: data.priority,
                    enabled: data.enabled,
                    createdAt: new Date(data.created_at),
                    documents: data.documents || []
                };
                setTrainingRules(prev => [newRule, ...prev]);
            }
        } catch (error) {
            console.error('Error creating rule:', error);
            // Fallback for offline/error: add to local state anyway using simple structure
            const offlineRule: TrainingRule = {
                id: Date.now().toString(),
                agentId: editingRule.agentId!,
                title: editingRule.title!,
                description: editingRule.description || '',
                trigger: editingRule.trigger || '',
                action: editingRule.action || '',
                priority: editingRule.priority || 'medium',
                enabled: true,
                createdAt: new Date(),
                documents: documents.length > 0 ? documents : undefined
            };
            setTrainingRules(prev => [offlineRule, ...prev]);
        }

        setEditingRule(null);
        setUploadingDocs([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveDocumentFromRule = (ruleId: string, docId: string) => {
        setTrainingRules(prev => prev.map(rule => {
            if (rule.id === ruleId) {
                return {
                    ...rule,
                    documents: rule.documents?.filter(doc => doc.id !== docId)
                };
            }
            return rule;
        }));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return <FileText size={16} />;
        if (type.includes('text') || type.includes('json')) return <FileText size={16} />;
        if (type.includes('word') || type.includes('document')) return <FileText size={16} />;
        if (type.includes('excel') || type.includes('spreadsheet')) return <FileText size={16} />;
        return <File size={16} />;
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-main)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px 30px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-card)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '12px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <GeometricBrain size={32} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>
                            Master Orchestrator
                        </h1>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                            AI Agent Management System
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{
                        padding: '6px 12px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '20px',
                        color: '#10b981',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <Activity size={12} />
                        {agents.filter(a => activeAgents.includes(a.id)).length} ACTIVE
                    </div>
                    <button
                        onClick={onBack}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        <ArrowLeft size={16} />
                        Nazad
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                gap: '5px',
                padding: '0 30px'
            }}>
                <button
                    onClick={() => setActiveTab('chat')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'chat' ? 'var(--bg-main)' : 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'chat' ? '2px solid var(--accent)' : '2px solid transparent',
                        color: activeTab === 'chat' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Sparkles size={16} />
                    AI Chat
                </button>
                <button
                    onClick={() => setActiveTab('training')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'training' ? 'var(--bg-main)' : 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'training' ? '2px solid var(--accent)' : '2px solid transparent',
                        color: activeTab === 'training' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <BookOpen size={16} />
                    Training Rules ({trainingRules.length})
                </button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Sidebar - Agent Registry */}
                <div style={{
                    width: '320px',
                    borderRight: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Network size={16} />
                            Agent Registry
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                            {agents.length} Registered Agents
                        </p>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                        {agents.map(agent => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: activeAgents.includes(agent.id)
                                        ? 'rgba(59, 130, 246, 0.1)'
                                        : 'var(--bg-main)',
                                    border: `1px solid ${activeAgents.includes(agent.id) ? 'rgba(59, 130, 246, 0.3)' : 'var(--border)'}`,
                                    borderRadius: '12px',
                                    padding: '12px',
                                    marginBottom: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: agent.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff'
                                    }}>
                                        {agent.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {agent.name}
                                            <span style={{
                                                fontSize: '9px',
                                                fontWeight: 700,
                                                padding: '2px 6px',
                                                borderRadius: '6px',
                                                background: agent.minLevel === 6 ? 'rgba(239, 68, 68, 0.1)' :
                                                    agent.minLevel >= 4 ? 'rgba(139, 92, 246, 0.1)' :
                                                        agent.minLevel >= 3 ? 'rgba(16, 185, 129, 0.1)' :
                                                            'rgba(59, 130, 246, 0.1)',
                                                color: agent.minLevel === 6 ? '#ef4444' :
                                                    agent.minLevel >= 4 ? '#8b5cf6' :
                                                        agent.minLevel >= 3 ? '#10b981' :
                                                            '#3b82f6',
                                                border: `1px solid ${agent.minLevel === 6 ? 'rgba(239, 68, 68, 0.2)' :
                                                    agent.minLevel >= 4 ? 'rgba(139, 92, 246, 0.2)' :
                                                        agent.minLevel >= 3 ? 'rgba(16, 185, 129, 0.2)' :
                                                            'rgba(59, 130, 246, 0.2)'}`
                                            }}>
                                                Lvl {agent.minLevel}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{agent.module}</div>
                                    </div>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: activeAgents.includes(agent.id) ? '#10b981' : '#6b7280'
                                    }} />
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                                    {agent.capabilities.slice(0, 2).join(', ')}
                                    {agent.capabilities.length > 2 && ` +${agent.capabilities.length - 2}`}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area - Chat or Training */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {activeTab === 'chat' ? (
                        <>
                            {/* Messages */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px'
                            }}>
                                <AnimatePresence>
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{
                                                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                                                maxWidth: '70%'
                                            }}
                                        >
                                            <div style={{
                                                background: message.role === 'user'
                                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                    : message.role === 'orchestrator'
                                                        ? 'var(--bg-card)'
                                                        : 'rgba(59, 130, 246, 0.1)',
                                                color: message.role === 'user' ? '#fff' : 'var(--text-primary)',
                                                padding: '12px 16px',
                                                borderRadius: '16px',
                                                border: message.role !== 'user' ? '1px solid var(--border)' : 'none',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}>
                                                {message.agentName && (
                                                    <div style={{
                                                        fontSize: '10px',
                                                        fontWeight: 700,
                                                        color: 'var(--accent)',
                                                        marginBottom: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <Cpu size={12} />
                                                        {message.agentName}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                                    {message.content}
                                                </div>
                                                <div style={{
                                                    fontSize: '10px',
                                                    opacity: 0.7,
                                                    marginTop: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <span>{message.timestamp.toLocaleTimeString()}</span>
                                                    {message.status && getMessageStatusIcon(message.status)}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Area */}
                            <div style={{
                                padding: '20px',
                                borderTop: '1px solid var(--border)',
                                background: 'var(--bg-card)'
                            }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Pitajte Master Orchestrator-a..."
                                        disabled={isProcessing}
                                        style={{
                                            flex: 1,
                                            padding: '14px 18px',
                                            borderRadius: '12px',
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isProcessing}
                                        style={{
                                            padding: '14px 24px',
                                            borderRadius: '12px',
                                            background: isProcessing
                                                ? 'var(--bg-main)'
                                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            color: '#fff',
                                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            opacity: isProcessing ? 0.5 : 1
                                        }}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <RefreshCcw size={18} className="spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Send
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Training Rules Tab
                        <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
                            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                                <div style={{ marginBottom: '30px' }}>
                                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                                        AI Training Rules
                                    </h2>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        Definiši pravila koja će AI agenti koristiti za automatizaciju zadataka
                                    </p>
                                </div>

                                {/* Add New Rule Form */}
                                <div style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    marginBottom: '24px'
                                }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Plus size={18} />
                                        Dodaj Novo Pravilo
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                        <input
                                            placeholder="Naziv pravila"
                                            value={editingRule?.title || ''}
                                            onChange={e => setEditingRule({ ...editingRule, title: e.target.value })}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                background: 'var(--bg-main)',
                                                border: '1px solid var(--border)',
                                                color: 'var(--text-primary)',
                                                fontSize: '14px'
                                            }}
                                        />
                                        <select
                                            value={editingRule?.agentId || ''}
                                            onChange={e => setEditingRule({ ...editingRule, agentId: e.target.value })}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                background: 'var(--bg-main)',
                                                border: '1px solid var(--border)',
                                                color: 'var(--text-primary)',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Izaberi agenta...</option>
                                            {agents.map(agent => (
                                                <option key={agent.id} value={agent.id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                                                    {agent.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <textarea
                                        placeholder="Opis pravila"
                                        value={editingRule?.description || ''}
                                        onChange={e => setEditingRule({ ...editingRule, description: e.target.value })}
                                        rows={2}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            marginBottom: '15px',
                                            resize: 'vertical'
                                        }}
                                    />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                        <input
                                            placeholder="Trigger (npr: 'kada dobijemo email')"
                                            value={editingRule?.trigger || ''}
                                            onChange={e => setEditingRule({ ...editingRule, trigger: e.target.value })}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                background: 'var(--bg-main)',
                                                border: '1px solid var(--border)',
                                                color: 'var(--text-primary)',
                                                fontSize: '14px'
                                            }}
                                        />
                                        <input
                                            placeholder="Action (npr: 'analiziraj i odgovori')"
                                            value={editingRule?.action || ''}
                                            onChange={e => setEditingRule({ ...editingRule, action: e.target.value })}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                background: 'var(--bg-main)',
                                                border: '1px solid var(--border)',
                                                color: 'var(--text-primary)',
                                                fontSize: '14px'
                                            }}
                                        />
                                        <select
                                            value={editingRule?.priority || 'medium'}
                                            onChange={e => setEditingRule({ ...editingRule, priority: e.target.value as TrainingRule['priority'] })}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                background: 'var(--bg-main)',
                                                border: '1px solid var(--border)',
                                                color: 'var(--text-primary)',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="low" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Low Priority</option>
                                            <option value="medium" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Medium Priority</option>
                                            <option value="high" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>High Priority</option>
                                        </select>
                                    </div>

                                    {/* Document Upload Section */}
                                    <div style={{ marginBottom: '15px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '10px'
                                        }}>
                                            <Upload size={16} style={{ color: 'var(--text-secondary)' }} />
                                            <label style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: 'var(--text-secondary)'
                                            }}>
                                                Dodaj Dokumente za Učenje (PDF, Excel, Word, TXT, JSON)
                                            </label>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.json"
                                            onChange={handleFileSelect}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                background: 'var(--bg-main)',
                                                border: '1px solid var(--border)',
                                                color: 'var(--text-primary)',
                                                fontSize: '14px',
                                                width: '100%',
                                                cursor: 'pointer'
                                            }}
                                        />

                                        {/* Uploaded Files Preview */}
                                        {uploadingDocs.length > 0 && (
                                            <div style={{
                                                marginTop: '10px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px'
                                            }}>
                                                {uploadingDocs.map((file, index) => (
                                                    <div key={index} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '8px 12px',
                                                        background: 'rgba(102, 126, 234, 0.1)',
                                                        border: '1px solid rgba(102, 126, 234, 0.2)',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {getFileIcon(file.type)}
                                                            <span style={{ fontSize: '13px' }}>{file.name}</span>
                                                            <span style={{
                                                                fontSize: '11px',
                                                                color: 'var(--text-secondary)'
                                                            }}>
                                                                ({formatFileSize(file.size)})
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveUploadingDoc(index)}
                                                            style={{
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                padding: '4px 8px',
                                                                color: '#ef4444',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleAddRuleWithDocs()}
                                        disabled={!editingRule?.title || !editingRule?.agentId}
                                        style={{
                                            padding: '12px 24px',
                                            borderRadius: '10px',
                                            background: (!editingRule?.title || !editingRule?.agentId)
                                                ? 'var(--bg-main)'
                                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            color: '#fff',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: (!editingRule?.title || !editingRule?.agentId) ? 'not-allowed' : 'pointer',
                                            opacity: (!editingRule?.title || !editingRule?.agentId) ? 0.5 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Save size={16} />
                                        Sačuvaj Pravilo
                                    </button>
                                </div>

                                {/* Existing Rules */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {trainingRules.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '60px 20px',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                            <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                                                Još nema definisanih pravila
                                            </p>
                                            <p style={{ fontSize: '14px' }}>
                                                Kreirajte prvo pravilo da biste naučili AI agente kako da rade
                                            </p>
                                        </div>
                                    ) : (
                                        trainingRules.map(rule => {
                                            const agent = agents.find(a => a.id === rule.agentId);
                                            return (
                                                <motion.div
                                                    key={rule.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{
                                                        background: 'var(--bg-card)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '12px',
                                                        padding: '20px',
                                                        opacity: rule.enabled ? 1 : 0.5
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                                {agent && (
                                                                    <div style={{
                                                                        width: '32px',
                                                                        height: '32px',
                                                                        borderRadius: '8px',
                                                                        background: agent.color,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: '#fff'
                                                                    }}>
                                                                        {agent.icon}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                                                                        {rule.title}
                                                                    </h4>
                                                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                                                                        {agent?.name}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {rule.description && (
                                                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                                                    {rule.description}
                                                                </p>
                                                            )}
                                                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                                {rule.trigger && (
                                                                    <div style={{ fontSize: '12px' }}>
                                                                        <span style={{ color: 'var(--text-secondary)' }}>Trigger:</span>{' '}
                                                                        <span style={{ color: 'var(--text-primary)' }}>{rule.trigger}</span>
                                                                    </div>
                                                                )}
                                                                {rule.action && (
                                                                    <div style={{ fontSize: '12px' }}>
                                                                        <span style={{ color: 'var(--text-secondary)' }}>Action:</span>{' '}
                                                                        <span style={{ color: 'var(--text-primary)' }}>{rule.action}</span>
                                                                    </div>
                                                                )}
                                                                <div style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: 700,
                                                                    padding: '4px 8px',
                                                                    borderRadius: '6px',
                                                                    background: `${getPriorityColor(rule.priority)}20`,
                                                                    color: getPriorityColor(rule.priority)
                                                                }}>
                                                                    {rule.priority.toUpperCase()}
                                                                </div>
                                                            </div>

                                                            {/* Attached Documents */}
                                                            {rule.documents && rule.documents.length > 0 && (
                                                                <div style={{ marginTop: '12px' }}>
                                                                    <div style={{
                                                                        fontSize: '12px',
                                                                        fontWeight: 600,
                                                                        color: 'var(--text-secondary)',
                                                                        marginBottom: '8px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px'
                                                                    }}>
                                                                        <FileText size={14} />
                                                                        Dokumenti za učenje ({rule.documents.length})
                                                                    </div>
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: '6px'
                                                                    }}>
                                                                        {rule.documents.map(doc => (
                                                                            <div key={doc.id} style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'space-between',
                                                                                padding: '6px 10px',
                                                                                background: 'rgba(102, 126, 234, 0.05)',
                                                                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                                                                borderRadius: '6px'
                                                                            }}>
                                                                                <div style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '8px',
                                                                                    flex: 1
                                                                                }}>
                                                                                    {getFileIcon(doc.type)}
                                                                                    <span style={{ fontSize: '12px' }}>{doc.name}</span>
                                                                                    <span style={{
                                                                                        fontSize: '10px',
                                                                                        color: 'var(--text-secondary)'
                                                                                    }}>
                                                                                        {formatFileSize(doc.size)}
                                                                                    </span>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => handleRemoveDocumentFromRule(rule.id, doc.id)}
                                                                                    style={{
                                                                                        background: 'transparent',
                                                                                        border: 'none',
                                                                                        color: '#ef4444',
                                                                                        cursor: 'pointer',
                                                                                        padding: '2px',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center'
                                                                                    }}
                                                                                >
                                                                                    <X size={12} />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                onClick={() => handleToggleRule(rule.id)}
                                                                style={{
                                                                    padding: '8px 12px',
                                                                    borderRadius: '8px',
                                                                    background: rule.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                    border: 'none',
                                                                    color: rule.enabled ? '#10b981' : '#ef4444',
                                                                    fontSize: '12px',
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {rule.enabled ? 'Enabled' : 'Disabled'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRule(rule.id)}
                                                                style={{
                                                                    padding: '8px',
                                                                    borderRadius: '8px',
                                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                                    border: 'none',
                                                                    color: '#ef4444',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                .pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                select option {
                    background-color: #1a1b1e !important;
                    color: #ffffff !important;
                    padding: 10px;
                }
                select:focus {
                    border-color: #667eea !important;
                    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
                }
            `}</style>
        </div>
    );
}
