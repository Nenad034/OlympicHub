import React, { useState } from 'react';
import { Sparkles, Send, Edit3, Check, Loader2, Calendar, Users, Home } from 'lucide-react';
import './AIOfferModal.css';

interface AIOfferModalProps {
    proposal: {
        inquiry: any;
        matches: any[];
        suggestedResponse: string;
    };
    onClose: () => void;
    onSend: (text: string) => void;
}

export const AIOfferModal: React.FC<AIOfferModalProps> = ({ proposal, onClose, onSend }) => {
    const [editableText, setEditableText] = useState(proposal.suggestedResponse);
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="ai-offer-modal-overlay" onClick={onClose}>
            <div className="ai-offer-modal" onClick={e => e.stopPropagation()}>
                <div className="ai-modal-header">
                    <div className="ai-modal-title">
                        <Sparkles size={20} className="ai-icon-sparkle" />
                        <h2>AI Predlog Ponude</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="ai-modal-body">
                    {/* Summary of Extraction */}
                    <div className="ai-extraction-summary">
                        <div className="summary-item">
                            <Home size={16} />
                            <span><strong>Hotel:</strong> {proposal.inquiry.hotelName || 'Nije detektovano'}</span>
                        </div>
                        <div className="summary-item">
                            <Calendar size={16} />
                            <span><strong>Period:</strong> {proposal.inquiry.checkIn || '??'} - {proposal.inquiry.checkOut || '??'}</span>
                        </div>
                        <div className="summary-item">
                            <Users size={16} />
                            <span><strong>Putnici:</strong> {proposal.inquiry.adults} odr, {proposal.inquiry.children} dece</span>
                        </div>
                    </div>

                    {/* DB Matches Section */}
                    <div className="ai-db-matches">
                        <h3>🔎 Pronađeno u bazi ({proposal.matches.length})</h3>
                        {proposal.matches.length > 0 ? (
                            <div className="matches-list">
                                {proposal.matches.slice(0, 2).map((match, idx) => (
                                    <div key={idx} className="match-card">
                                        <h4>{match.title}</h4>
                                        <p>Status: <span className="status-badge-active">{match.status}</span></p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-matches">Nije pronađeno direktno poklapanje u bazi cenovnika.</p>
                        )}
                    </div>

                    {/* Response Preview */}
                    <div className="ai-response-preview">
                        <div className="preview-header">
                            <h3>✍️ Predlog odgovora</h3>
                            <button className="edit-toggle-btn" onClick={() => setIsEditing(!isEditing)}>
                                {isEditing ? <><Check size={14} /> Završi</> : <><Edit3 size={14} /> Izmeni</>}
                            </button>
                        </div>

                        {isEditing ? (
                            <textarea
                                className="ai-response-textarea"
                                value={editableText}
                                onChange={(e) => setEditableText(e.target.value)}
                            />
                        ) : (
                            <div className="ai-response-content">
                                {editableText.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="ai-modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Odustani</button>
                    <button className="btn-ai-send" onClick={() => onSend(editableText)}>
                        <Send size={16} />
                        <span>Pošalji ponudu</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIOfferModal;
