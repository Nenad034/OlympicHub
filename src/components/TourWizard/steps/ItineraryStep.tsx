import type { FC } from 'react';
import type { StepProps } from '../types';
import type { TourDay } from '../../../types/tour.types';
import { Plus, Trash2, MapPin, Coffee, Car, Sun } from 'lucide-react';

const ItineraryStep: FC<StepProps> = ({ data, onChange }) => {
    const itinerary = data.itinerary || [];

    const addDay = () => {
        const nextDay = itinerary.length + 1;
        const newDay: TourDay = {
            dayNumber: nextDay,
            title: `Dan ${nextDay}`,
            description: '',
            activities: [],
            transportSegments: []
        };
        onChange({ itinerary: [...itinerary, newDay] });
    };

    const removeDay = (idx: number) => {
        const next = itinerary.filter((_, i) => i !== idx);
        onChange({ itinerary: next });
    };

    const addActivity = (dayIdx: number) => {
        const newItinerary = [...itinerary];
        newItinerary[dayIdx].activities.push({
            id: Math.random().toString(36).substr(2, 9),
            title: '',
            description: '',
            type: 'Sightseeing',
            includedInPrice: true
        });
        onChange({ itinerary: newItinerary });
    };

    return (
        <div className="tour-itinerary-builder">
            <div className="itinerary-header">
                <div>
                    <h3>Vremenska Linija</h3>
                    <p>Definišite dnevne aktivnosti i program putovanja</p>
                </div>
                <button className="btn-add-day" onClick={addDay}>
                    <Plus size={16} /> Dodaj Dan
                </button>
            </div>

            <div className="timeline">
                {itinerary.map((day, dIdx) => (
                    <div key={day.dayNumber} className="timeline-day">
                        <div className="day-sidebar">
                            <div className="day-number">{day.dayNumber}</div>
                            <div className="day-line" />
                        </div>
                        <div className="day-content">
                            <div className="day-header">
                                <input
                                    type="text"
                                    className="day-title-input"
                                    value={day.title}
                                    onChange={e => {
                                        const next = [...itinerary];
                                        next[dIdx].title = e.target.value;
                                        onChange({ itinerary: next });
                                    }}
                                />
                                <button className="btn-remove" onClick={() => removeDay(dIdx)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <textarea
                                className="day-desc-input"
                                placeholder="Opis dana..."
                                value={day.description}
                                onChange={e => {
                                    const next = [...itinerary];
                                    next[dIdx].description = e.target.value;
                                    onChange({ itinerary: next });
                                }}
                            />

                            <div className="activities-list">
                                {day.activities.map((act, aIdx) => (
                                    <div key={act.id} className="activity-slot">
                                        <div className="slot-icon">
                                            {act.type === 'Sightseeing' && <MapPin size={14} />}
                                            {act.type === 'Meal' && <Coffee size={14} />}
                                            {act.type === 'Transit' && <Car size={14} />}
                                            {act.type === 'FreeTime' && <Sun size={14} />}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Naziv aktivnosti..."
                                            value={act.title}
                                            onChange={e => {
                                                const next = [...itinerary];
                                                next[dIdx].activities[aIdx].title = e.target.value;
                                                onChange({ itinerary: next });
                                            }}
                                        />
                                        <select
                                            value={act.type}
                                            onChange={e => {
                                                const next = [...itinerary];
                                                next[dIdx].activities[aIdx].type = e.target.value as any;
                                                onChange({ itinerary: next });
                                            }}
                                        >
                                            <option value="Sightseeing">Razgledanje</option>
                                            <option value="Meal">Obrok</option>
                                            <option value="Transit">Transfer</option>
                                            <option value="FreeTime">Slobodno vreme</option>
                                        </select>
                                    </div>
                                ))}
                                <button className="btn-add-activity" onClick={() => addActivity(dIdx)}>
                                    <Plus size={14} /> Dodaj Aktivnost
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {itinerary.length === 0 && (
                    <div className="empty-itinerary">
                        <MapPin size={48} />
                        <p>Vaš itinerer je prazan. Počnite tako što ćete dodati prvi dan.</p>
                        <button onClick={addDay} className="btn-primary">Dodaj Dan 1</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItineraryStep;
