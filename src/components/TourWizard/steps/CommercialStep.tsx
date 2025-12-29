import type { FC } from 'react';
import type { StepProps } from '../types';
import { DollarSign, Plus, Trash2, Users, Info } from 'lucide-react';

const CommercialStep: FC<StepProps> = ({ data, onChange }) => {
    const supplements = data.supplements || [];

    const addSupplement = () => {
        const newSupp = {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            price: 0,
            currency: data.currency || 'EUR',
            type: 'Optional' as const
        };
        onChange({ supplements: [...supplements, newSupp] });
    };

    const removeSupplement = (idx: number) => {
        const next = supplements.filter((_, i) => i !== idx);
        onChange({ supplements: next });
    };

    return (
        <div className="tour-commercial">
            <div className="price-hero-section">
                <div className="primary-price-card">
                    <label><DollarSign size={16} /> Osnovna Cena (po osobi)</label>
                    <div className="price-input-wrapper">
                        <input
                            type="number"
                            value={data.basePrice}
                            onChange={e => onChange({ basePrice: parseFloat(e.target.value) })}
                        />
                        <span className="currency-label">{data.currency}</span>
                    </div>
                </div>

                <div className="inventory-card">
                    <label><Users size={16} /> Ukupno Mesta</label>
                    <input
                        type="number"
                        value={data.totalSeats || 0}
                        onChange={e => onChange({ totalSeats: parseInt(e.target.value), availableSeats: parseInt(e.target.value) })}
                    />
                </div>
            </div>

            <div className="supplements-section">
                <div className="section-header">
                    <div>
                        <h3>Doplate i Fakultativa</h3>
                        <p>Dodajte opcione ili obavezne doplate na osnovnu cenu</p>
                    </div>
                    <button className="btn-add-supp" onClick={addSupplement}>
                        <Plus size={16} /> Dodaj Doplatu
                    </button>
                </div>

                <div className="supp-list">
                    {supplements.map((supp, idx) => (
                        <div key={supp.id} className="supp-item-row">
                            <input
                                type="text"
                                placeholder="Naziv doplate (npr. Doplata za 1/1 sobu)"
                                value={supp.name}
                                className="supp-name"
                                onChange={e => {
                                    const next = [...supplements];
                                    next[idx].name = e.target.value;
                                    onChange({ supplements: next });
                                }}
                            />
                            <div className="supp-price-box">
                                <input
                                    type="number"
                                    value={supp.price}
                                    onChange={e => {
                                        const next = [...supplements];
                                        next[idx].price = parseFloat(e.target.value);
                                        onChange({ supplements: next });
                                    }}
                                />
                                <span>{supp.currency}</span>
                            </div>
                            <select
                                value={supp.type}
                                onChange={e => {
                                    const next = [...supplements];
                                    next[idx].type = e.target.value as any;
                                    onChange({ supplements: next });
                                }}
                            >
                                <option value="Required">Obavezna</option>
                                <option value="Optional">Opciona</option>
                            </select>
                            <button className="btn-remove-supp" onClick={() => removeSupplement(idx)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="important-info-box">
                <Info size={18} />
                <p>Ove cene će biti vidljive na javnom portalu i služe kao osnova za kalkulaciju ugovora.</p>
            </div>
        </div>
    );
};

export default CommercialStep;
