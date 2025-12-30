import React, { useState } from 'react';
import {
    Search, Plane, Home, MapPin, Calendar, Users, Sparkles,
    Bus, Compass, Ticket, Loader2, CheckCircle2, Hotel,
    Info, CarFront, Ship, TrainFront, Utensils, Waves,
    Castle, Users2, ChevronRight, PlusCircle, Trash2,
    Moon, RotateCcw, Zap
} from 'lucide-react';
import { searchOffers, type OfferInquiry } from '../../services/aiOfferService';
import './TotalTripSearch.css';

const TRIP_CATEGORIES = [
    { id: 'hotel', label: 'Hotel', icon: <Hotel size={18} /> },
    { id: 'flight', label: 'Avio', icon: <Plane size={18} /> },
    { id: 'bus', label: 'Autobus', icon: <Bus size={18} /> },
    { id: 'car', label: 'Rent-a-car', icon: <CarFront size={18} /> },
    { id: 'ship', label: 'Brod/Krstarenje', icon: <Ship size={18} /> },
    { id: 'train', label: 'Voz', icon: <TrainFront size={18} /> },
    { id: 'excursion', label: 'Izleti', icon: <Compass size={18} /> },
    { id: 'ticket', label: 'Ulaznice', icon: <Ticket size={18} /> },
    { id: 'disney', label: 'Disneyland', icon: <Castle size={18} /> },
    { id: 'waterpark', label: 'Aquapark', icon: <Waves size={18} /> },
    { id: 'food', label: 'Restorani', icon: <Utensils size={18} /> },
    { id: 'group', label: 'Grupe', icon: <Users2 size={18} /> },
];

const TotalTripSearch: React.FC = () => {
    const [selectedComponents, setSelectedComponents] = useState<string[]>(['hotel']);
    const [nights, setNights] = useState<number>(7);
    const [flexibleDays, setFlexibleDays] = useState<number>(0);
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

    // Smart Date Calculations
    const handleCheckInChange = (date: string) => {
        const newInquiry = { ...inquiry, checkIn: date };
        if (date && nights > 0) {
            const outDate = new Date(date);
            outDate.setDate(outDate.getDate() + nights);
            newInquiry.checkOut = outDate.toISOString().split('T')[0];
        }
        setInquiry(newInquiry);
    };

    const handleNightsChange = (n: number) => {
        setNights(n);
        if (inquiry.checkIn && n > 0) {
            const outDate = new Date(inquiry.checkIn);
            outDate.setDate(outDate.getDate() + n);
            setInquiry({ ...inquiry, checkOut: outDate.toISOString().split('T')[0] });
        }
    };

    const handleCheckOutChange = (date: string) => {
        const newInquiry = { ...inquiry, checkOut: date };
        if (inquiry.checkIn && date) {
            const diffTime = Math.abs(new Date(date).getTime() - new Date(inquiry.checkIn).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setNights(diffDays);
        } else if (date && !inquiry.checkIn) {
            // If only checkout set, well just set it
        }
        setInquiry(newInquiry);
    };

    const handleSearch = async () => {
        setIsLoading(true);
        setSearchPerformed(true);
        try {
            const updatedInquiry = {
                ...inquiry,
                transportRequired: selectedComponents.some(c => ['flight', 'bus', 'car', 'ship', 'train'].includes(c)),
                additionalServices: selectedComponents.filter(c => !['hotel', 'flight', 'bus', 'car', 'ship', 'train'].includes(c))
            };
            const data = await searchOffers(updatedInquiry);
            setResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleComponent = (id: string) => {
        setSelectedComponents(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    return (
        <div className="total-trip-container">
            <header className="total-trip-header">
                <div className="header-content">
                    <h1><Compass className="icon-main" /> Total Trip Planner</h1>
                    <p>Kreirajte personalizovano putovanje kao mozaik doživljaja</p>
                </div>
                <div className="header-badge ai-premium">
                    <Sparkles size={16} />
                    <span>AI Enhanced Planning</span>
                </div>
            </header>

            <div className="trip-builder-console">
                <div className="component-selector">
                    <h3 className="selector-title">Šta uključujemo u putovanje?</h3>
                    <div className="component-chips-grid">
                        {TRIP_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`comp - chip ${selectedComponents.includes(cat.id) ? 'active' : ''} `}
                                onClick={() => toggleComponent(cat.id)}
                            >
                                <span className="comp-icon">{cat.icon}</span>
                                <span className="comp-label">{cat.label}</span>
                                {selectedComponents.includes(cat.id) && <CheckCircle2 size={12} className="check-indicator" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="search-form-complex">
                    {/* Row 1: Destination and Dates */}
                    <div className="form-row main">
                        <div className="input-group-premium main-search">
                            <label><MapPin size={14} /> Destinacija</label>
                            <input
                                type="text"
                                placeholder="Gde putujemo? (Hotel, Grad, Regija...)"
                                value={inquiry.hotelName}
                                onChange={e => setInquiry({ ...inquiry, hotelName: e.target.value })}
                            />
                        </div>

                        <div className="date-cluster">
                            <div className="input-group-premium date">
                                <label><Calendar size={14} /> Polazak</label>
                                <input
                                    type="date"
                                    value={inquiry.checkIn}
                                    onChange={e => handleCheckInChange(e.target.value)}
                                />
                            </div>
                            <div className="input-group-premium nights">
                                <label><Moon size={14} /> Noćenja</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={nights}
                                    onChange={e => handleNightsChange(parseInt(e.target.value) || 1)}
                                />
                            </div>
                            <div className="input-group-premium date">
                                <label><RotateCcw size={14} /> Povratak</label>
                                <input
                                    type="date"
                                    value={inquiry.checkOut}
                                    onChange={e => handleCheckOutChange(e.target.value)}
                                />
                            </div>
                            <div className="input-group-premium flexibility">
                                <label><Zap size={14} /> +/- dana</label>
                                <select value={flexibleDays} onChange={e => setFlexibleDays(parseInt(e.target.value))}>
                                    <option value={0}>Fiksno</option>
                                    <option value={1}>+/- 1 dan</option>
                                    <option value={2}>+/- 2 dana</option>
                                    <option value={3}>+/- 3 dana</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Passengers and Action */}
                    <div className="form-row sub">
                        <div className="passenger-cluster">
                            <div className="input-group-premium">
                                <label><Users size={14} /> Odrasli</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={inquiry.adults}
                                    onChange={e => setInquiry({ ...inquiry, adults: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                            <div className="input-group-premium">
                                <label><Users2 size={14} /> Deca</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={inquiry.children}
                                    onChange={e => {
                                        const count = parseInt(e.target.value) || 0;
                                        setInquiry({
                                            ...inquiry,
                                            children: count,
                                            childrenAges: Array(count).fill(7) // Default to 7 years
                                        });
                                    }}
                                />
                            </div>
                            {inquiry.children > 0 && (
                                <div className="children-ages-scroll">
                                    {inquiry.childrenAges.map((age, idx) => (
                                        <div key={idx} className="age-input">
                                            <span>Det {idx + 1}</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="17"
                                                value={age}
                                                onChange={e => {
                                                    const newAges = [...inquiry.childrenAges];
                                                    newAges[idx] = parseInt(e.target.value) || 0;
                                                    setInquiry({ ...inquiry, childrenAges: newAges });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button className="search-launch-btn-v2" onClick={handleSearch} disabled={isLoading}>
                            {isLoading ? <Loader2 className="spin" /> : <Search size={22} />}
                            <span>Pretraži Ponude</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="content-workflow">
                {!searchPerformed && (
                    <div className="zen-placeholder">
                        <div className="zen-content">
                            <div className="musashi-icon-large">
                                <Compass size={80} strokeWidth={1} />
                            </div>
                            <h2>Spremite se za savršeno putovanje</h2>
                            <p>Izaberite komponente iznad i unesite destinaciju da pretražimo Olympic Hub bazu.</p>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="loading-orchestrator">
                        <div className="pulse-loader"></div>
                        <p>AI sklapa vaš mozaik putovanja...</p>
                    </div>
                )}

                {results && !isLoading && (
                    <div className="results-mosaic">
                        {selectedComponents.includes('hotel') && (
                            <section className="results-category">
                                <div className="cat-header-premium">
                                    <Hotel size={20} />
                                    <h3>Smeštaj</h3>
                                    <span className="count-pill">{results.hotels.length}</span>
                                </div>
                                <div className="mosaic-grid">
                                    {results.hotels.length > 0 ? (
                                        results.hotels.map(hotel => (
                                            <div key={hotel.id} className="mosaic-card hotel">
                                                <div className="card-top">
                                                    <h4>{hotel.title}</h4>
                                                    <span className="stars">{'★'.repeat(hotel.stars || 5)}</span>
                                                </div>
                                                <div className="card-meta">
                                                    <MapPin size={12} /> {hotel.location || 'Lokacija na upit'}
                                                </div>
                                                <div className="card-price">
                                                    <span className="label">Od</span>
                                                    <span className="value">{hotel.price_periods?.[0]?.net_price || '??'} EUR</span>
                                                </div>
                                                <div className="card-actions">
                                                    <button className="btn-action">Dodaj u plan</button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-data-card">Nema slobodnih soba u bazi.</div>
                                    )}
                                </div>
                            </section>
                        )}

                        <section className="results-category">
                            <div className="cat-header-premium experiences">
                                <Sparkles size={20} />
                                <h3>Doživljaji i Prevoz</h3>
                                <span className="count-pill">{results.services.length}</span>
                            </div>
                            <div className="mosaic-grid">
                                {results.services.length > 0 ? (
                                    results.services.map(service => (
                                        <div key={service.id} className="mosaic-card service">
                                            <div className="service-tag">{service.category}</div>
                                            <h4>{service.title}</h4>
                                            <p className="description-short">{service.description}</p>
                                            <div className="card-price">
                                                <span className="value">{service.price_gross} {service.currency}</span>
                                            </div>
                                            <div className="card-actions">
                                                <button className="btn-action add">Dodaj</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-data-card">Pokušajte sa širim filterima ili kontaktirajte operativu.</div>
                                )}
                            </div>
                        </section>

                        {results.hotels.length > 0 && (
                            <div className="verified-upsell">
                                <div className="upsell-banner">
                                    <Info size={20} />
                                    <span><strong>Pro tip:</strong> Uz ovaj hotel preporučujemo privatni transfer i jedan od Olympic proverenih izleta!</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TotalTripSearch;
