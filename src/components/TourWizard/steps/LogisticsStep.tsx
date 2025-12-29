import type { FC } from 'react';
import type { StepProps } from '../types';
import { Plane, Bus, Ship, Train, Plus, Trash2, ArrowRight } from 'lucide-react';

const LogisticsStep: FC<StepProps> = ({ data, onChange }) => {
    const itinerary = data.itinerary || [];

    const addSegment = () => {
        const newSegment = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'Flight',
            fromCity: '',
            toCity: ''
        };

        if (itinerary.length > 0) {
            const next = [...itinerary];
            next[0].transportSegments = [...(next[0].transportSegments || []), newSegment as any];
            onChange({ itinerary: next });
        }
    };

    const removeSegment = (dayIdx: number, segIdx: number) => {
        const next = [...itinerary];
        next[dayIdx].transportSegments = next[dayIdx].transportSegments?.filter((_, i) => i !== segIdx);
        onChange({ itinerary: next });
    };

    return (
        <div className="tour-logistics">
            <div className="logistics-section">
                <div className="section-header">
                    <div>
                        <h3>Transport Mixer</h3>
                        <p>Kombinujte različite vidove prevoza u okviru aranžmana</p>
                    </div>
                    <button className="btn-add-segment" onClick={addSegment}>
                        <Plus size={16} /> Dodaj Segment
                    </button>
                </div>

                <div className="segments-grid">
                    {itinerary.map((day, dIdx) => (
                        day.transportSegments?.map((seg, sIdx) => (
                            <div key={seg.id} className="transport-seg-card">
                                <div className="seg-type-icon">
                                    {seg.type === 'Flight' && <Plane size={20} />}
                                    {seg.type === 'Bus' && <Bus size={20} />}
                                    {seg.type === 'Ship' && <Ship size={20} />}
                                    {seg.type === 'Train' && <Train size={20} />}
                                </div>
                                <div className="seg-route">
                                    <input
                                        type="text"
                                        placeholder="Odakle"
                                        value={seg.fromCity}
                                        onChange={e => {
                                            const next = [...itinerary];
                                            next[dIdx].transportSegments![sIdx].fromCity = e.target.value;
                                            onChange({ itinerary: next });
                                        }}
                                    />
                                    <ArrowRight size={14} />
                                    <input
                                        type="text"
                                        placeholder="Dokle"
                                        value={seg.toCity}
                                        onChange={e => {
                                            const next = [...itinerary];
                                            next[dIdx].transportSegments![sIdx].toCity = e.target.value;
                                            onChange({ itinerary: next });
                                        }}
                                    />
                                </div>
                                <button className="btn-remove-seg" onClick={() => removeSegment(dIdx, sIdx)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    ))}
                </div>
            </div>

            <div className="logistics-section" style={{ marginTop: '30px' }}>
                <div className="section-header">
                    <div>
                        <h3>Smeštaj & Objekti</h3>
                        <p>Povežite hotele iz baze sa danima u itinereru</p>
                    </div>
                </div>
                <div className="hotel-link-placeholder">
                    <p>Modul za povezivanje sa bazom smeštaja će biti aktivan nakon što definišete bazu hotela.</p>
                </div>
            </div>
        </div>
    );
};

export default LogisticsStep;
