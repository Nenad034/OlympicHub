import type { FC } from 'react';
import type { StepProps } from '../types';
import { Type, Calendar, AlignLeft, BarChart } from 'lucide-react';

const BasicInfoStep: FC<StepProps> = ({ data, onChange }) => {
    return (
        <div className="step-container">
            <div className="grid-2">
                <div className="tour-form-group">
                    <label><Type size={14} /> Naziv Aranžmana</label>
                    <input
                        type="text"
                        className="tour-input"
                        placeholder="npr. Grand Tour: Italija i Krstarenje Mediteranom"
                        value={data.title || ''}
                        onChange={e => onChange({ title: e.target.value })}
                    />
                </div>
                <div className="tour-form-group">
                    <label><BarChart size={14} /> Kategorija</label>
                    <select
                        className="tour-select"
                        value={data.category}
                        onChange={e => onChange({ category: e.target.value as any })}
                    >
                        <option value="Grupno">Grupno Putovanje</option>
                        <option value="Individualno">Individualno Putovanje</option>
                        <option value="Krstarenje">Krstarenje</option>
                        <option value="StayAndCruise">Stay & Cruise (Kombinovano)</option>
                    </select>
                </div>
            </div>

            <div className="grid-2">
                <div className="tour-form-group">
                    <label><Calendar size={14} /> Datum Polaska</label>
                    <input
                        type="date"
                        className="tour-input"
                        value={data.startDate || ''}
                        onChange={e => onChange({ startDate: e.target.value })}
                    />
                </div>
                <div className="tour-form-group">
                    <label><Calendar size={14} /> Datum Povratka</label>
                    <input
                        type="date"
                        className="tour-input"
                        value={data.endDate || ''}
                        onChange={e => onChange({ endDate: e.target.value })}
                    />
                </div>
            </div>

            <div className="tour-form-group">
                <label><AlignLeft size={14} /> Kratak Opis (Teaser)</label>
                <textarea
                    className="tour-textarea"
                    rows={3}
                    placeholder="Ukratko o putovanju za listu aranžmana..."
                    value={data.shortDescription}
                    onChange={e => onChange({ shortDescription: e.target.value })}
                />
            </div>

            <div className="tour-form-group">
                <label>Glavni Highlights (Jedno po redu)</label>
                <textarea
                    className="tour-textarea"
                    rows={4}
                    placeholder="npr. Direktni let kompanijom Air Serbia&#10;7 noćenja u hotelima 4*&#10;Uključeno krstarenje od 3 dana"
                    value={data.highlights?.join('\n')}
                    onChange={e => onChange({ highlights: e.target.value.split('\n') })}
                />
            </div>

            <style>{`
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .step-container { display: flex; flex-direction: column; gap: 10px; }
            `}</style>
        </div>
    );
};

export default BasicInfoStep;
