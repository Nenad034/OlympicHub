import React, { useState } from 'react';
import {
    Search,
    Plane,
    Home,
    MapPin,
    Calendar,
    Users,
    Sparkles,
    Bus,
    Compass,
    Ticket,
    Loader2,
    CheckCircle2,
    Hotel,
    Info
} from 'lucide-react';
import { searchOffers, type OfferInquiry } from '../../services/aiOfferService';
import './TotalTripSearch.css';

const TotalTripSearch: React.FC = () => {
    const [inquiry, setInquiry] = useState<OfferInquiry>({
        hotelName: '',
        checkIn: '',
        checkOut: '',
        adults: 2,
        children: 0,
        childrenAges: [],
        transportRequired: false,
        additionalServices: []
    });

    const [results, setResults] = useState<{ hotels: any[], services: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    const handleSearch = async () => {
        setIsLoading(true);
        setSearchPerformed(true);
        try {
            const data = await searchOffers(inquiry);
            setResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleService = (service: string) => {
        setInquiry(prev => ({
            ...prev,
            additionalServices: prev.additionalServices.includes(service)
                ? prev.additionalServices.filter(s => s !== service)
                : [...prev.additionalServices, service]
        }));
    };

    return (
        <div className="total-trip-container">
            <header className="total-trip-header">
                <div className="header-content">
                    <h1><Compass className="icon-main" /> Total Trip Planner</h1>
                    <p>Univerzalna pretraga smeštaja, prevoza i dodatnih usluga</p>
                </div>
                <div className="header-badge">
                    <Sparkles size={16} />
                    <span>AI Enhanced</span>
                </div>
            </header>

            <div className="search-console">
                <div className="search-grid">
                    <div className="input-group">
                        <label><Home size={14} /> Destinacija / Hotel</label>
                        <input
                            type="text"
                            placeholder="Npr. Splendid Bečići..."
                            value={inquiry.hotelName}
                            onChange={e => setInquiry({ ...inquiry, hotelName: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label><Calendar size={14} /> Datum polaska</label>
                        <input
                            type="date"
                            value={inquiry.checkIn}
                            onChange={e => setInquiry({ ...inquiry, checkIn: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label><Users size={14} /> Putnici</label>
                        <div className="passengers-input">
                            <input
                                type="number"
                                min="1"
                                value={inquiry.adults}
                                onChange={e => setInquiry({ ...inquiry, adults: parseInt(e.target.value) || 1 })}
                                title="Odrasli"
                            />
                            <span>+</span>
                            <input
                                type="number"
                                min="0"
                                value={inquiry.children}
                                onChange={e => setInquiry({ ...inquiry, children: parseInt(e.target.value) || 0 })}
                                title="Deca"
                            />
                        </div>
                    </div>

                    <div className="search-actions">
                        <button className="search-btn" onClick={handleSearch} disabled={isLoading}>
                            {isLoading ? <Loader2 className="spin" /> : <Search />}
                            Pretraži Sve
                        </button>
                    </div>
                </div>

                <div className="extra-filters">
                    <div className="filter-chip-group">
                        <span>Dodatno:</span>
                        {[
                            { id: 'transport', label: 'Prevoz', icon: <Bus size={14} /> },
                            { id: 'excursion', label: 'Izleti', icon: <Compass size={14} /> },
                            { id: 'ticket', label: 'Ulaznice', icon: <Ticket size={14} /> },
                        ].map(service => (
                            <button
                                key={service.id}
                                className={`filter-chip ${inquiry.additionalServices.includes(service.id) ? 'active' : ''}`}
                                onClick={() => toggleService(service.id)}
                            >
                                {service.icon}
                                {service.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="results-area">
                {!searchPerformed && (
                    <div className="search-placeholder">
                        <div className="placeholder-content">
                            <Compass size={64} opacity={0.2} />
                            <h3>Spremni za planiranje?</h3>
                            <p>Unesite parametre iznad da pretražite bazu Olympic Travela.</p>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="loading-state">
                        <Loader2 className="spin" size={48} />
                        <p>Pretražujem hotele, prevoz i izlete...</p>
                    </div>
                )}

                {results && !isLoading && (
                    <div className="results-grid">
                        <section className="results-column">
                            <h3><Hotel size={18} /> Smeštaj ({results.hotels.length})</h3>
                            {results.hotels.length > 0 ? (
                                results.hotels.map(hotel => (
                                    <div key={hotel.id} className="result-card hotel">
                                        <div className="result-main">
                                            <h4>{hotel.title}</h4>
                                            <p className="location"><MapPin size={12} /> {hotel.location || 'Crna Gora'}</p>
                                            <div className="price-tag">
                                                <span>od</span>
                                                <strong>{hotel.price_periods?.[0]?.net_price || '??'} EUR</strong>
                                            </div>
                                        </div>
                                        <div className="result-footer">
                                            <span className="badge">Dostupno</span>
                                            <button className="view-btn">Detalji</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">Nema pronađenih hotela.</div>
                            )}
                        </section>

                        <section className="results-column">
                            <h3><Plane size={18} /> Prevoz i Usluge ({results.services.length})</h3>
                            {results.services.length > 0 ? (
                                results.services.map(service => (
                                    <div key={service.id} className="result-card service">
                                        <div className="result-main">
                                            <div className="cat-header">
                                                <span className={`cat-icon ${service.category}`}>
                                                    {service.category === 'transport' ? <Bus size={14} /> : <Compass size={14} />}
                                                </span>
                                                <span className="cat-name">{service.category}</span>
                                            </div>
                                            <h4>{service.title}</h4>
                                            <p className="desc">{service.description}</p>
                                            <div className="price-tag">
                                                <strong>{service.price_gross} {service.currency}</strong>
                                            </div>
                                        </div>
                                        <div className="result-footer">
                                            <button className="add-btn">Dodaj u ponudu</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">Nema pronađenih dodatnih usluga.</div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TotalTripSearch;
