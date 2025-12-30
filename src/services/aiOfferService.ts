import { supabase } from '../supabaseClient';
import { askGemini } from './gemini';

export interface OfferInquiry {
    hotelName: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    childrenAges: number[];
    transportRequired: boolean;
    transportType?: 'bus' | 'flight' | 'car' | 'transfer';
    locationFilter?: string;
    additionalServices: string[]; // npr. ['izleti', 'ulaznice', 'vodič']
}

export interface OfferProposal {
    success: boolean;
    data?: {
        inquiry: OfferInquiry;
        hotelMatches: any[];
        serviceMatches: any[];
        suggestedResponse: string;
    };
    error?: string;
}

/**
 * Extracts travel parameters from email text using Gemini
 */
export async function extractInquiryParameters(emailBody: string): Promise<OfferInquiry | null> {
    const prompt = `
        Analiziraj sledeći upit za putovanje i izvuci SVE parametre u JSON formatu.
        Budi detektov i za dodatne usluge kao što su prevoz, izleti, ulaznice.

        Parametri:
        - hotelName: Naziv hotela
        - checkIn: Datum dolaska (YYYY-MM-DD)
        - checkOut: Datum odlaska (YYYY-MM-DD)
        - adults: Broj odraslih
        - children: Broj dece
        - childrenAges: Niz uzrasta dece
        - transportRequired: boolean (da li pominju prevoz, avio, bus...)
        - transportType: 'bus' | 'flight' | 'car' | 'transfer'
        - locationFilter: Grad ili regija koja se pominje
        - additionalServices: Niz ključnih reči za dodatke (npr. ['izlet', 'muzej', 'brod'])

        Upit:
        "${emailBody}"

        Odgovori ISKLJUČIVO JSON objektom.
    `;

    const result = await askGemini(prompt, { temperature: 0.1 });

    if (result.success) {
        try {
            const jsonStr = result.response.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            return {
                ...parsed,
                additionalServices: parsed.additionalServices || []
            } as OfferInquiry;
        } catch (e) {
            console.error('Failed to parse Gemini JSON:', e);
            return null;
        }
    }
    return null;
}

/**
 * Searches the pricelist database for matching offers and services
 */
export async function searchOffers(params: OfferInquiry): Promise<{ hotels: any[], services: any[] }> {
    try {
        // 1. Search Hotels
        let hotelQuery = supabase
            .from('pricelists')
            .select('*, price_periods (*), price_rules (*)')
            .eq('status', 'active');

        if (params.hotelName) {
            hotelQuery = hotelQuery.ilike('title', `%${params.hotelName}%`);
        }

        const { data: hotels, error: hotelError } = await hotelQuery;
        if (hotelError) throw hotelError;

        // Filter periods that cover the requested dates
        const filteredHotels = (hotels || []).filter((pl: any) => {
            const hasValidPeriod = pl.price_periods.some((period: any) => {
                const pFrom = new Date(period.date_from);
                const pTo = new Date(period.date_to);
                const reqFrom = params.checkIn ? new Date(params.checkIn) : null;

                if (reqFrom) {
                    return reqFrom >= pFrom && reqFrom <= pTo;
                }
                return true;
            });
            return hasValidPeriod;
        });


        // 2. Search Services (Transport, Excursions)
        let serviceQuery = supabase.from('travel_services').select('*');

        // Search by location or keywords in tags/title
        const searchTerms = [
            ...(params.locationFilter ? [params.locationFilter] : []),
            ...(params.additionalServices || []),
            ...(params.transportRequired ? [params.transportType || 'transport'] : [])
        ];

        if (searchTerms.length > 0) {
            // Simple OR search for demonstration
            serviceQuery = serviceQuery.or(
                searchTerms.map(term => `title.ilike.%${term}%,description.ilike.%${term}%`).join(',')
            );
        }

        const { data: services, error: serviceError } = await serviceQuery;
        if (serviceError) throw serviceError;

        return {
            hotels: filteredHotels || [],
            services: services || []
        };
    } catch (error) {
        console.error('Error searching database:', error);
        return { hotels: [], services: [] };
    }
}

/**
 * Main workflow: From Email to Proposal
 */
export async function generateOfferFromEmail(emailBody: string): Promise<OfferProposal> {
    // 1. Extract params
    const inquiry = await extractInquiryParameters(emailBody);
    if (!inquiry) {
        return { success: false, error: 'AI nije uspeo da izvuče parametre iz upita.' };
    }

    // 2. Search DB
    const { hotels, services } = await searchOffers(inquiry);

    // 3. Generate Response Text
    const responsePrompt = `
        Na osnovu upita i pronađenih podataka iz baze, sastavi KOMPLETNU ponudu na SRPSKOM JEZIKU.
        
        UPIT KORISNIKA:
        Hotel: ${inquiry.hotelName}
        Period: ${inquiry.checkIn} do ${inquiry.checkOut}
        Putnika: ${inquiry.adults} odraslih, ${inquiry.children} dece
        Prevoz: ${inquiry.transportRequired ? inquiry.transportType : 'nije traženo'}
        Dodatno: ${inquiry.additionalServices.join(', ')}

        PRONAĐENI HOTELI:
        ${JSON.stringify(hotels, null, 2)}

        PRONAĐENE DODATNE USLUGE (Prevoz, izleti...):
        ${JSON.stringify(services, null, 2)}

        ZADATAK:
        Sastavi ljubazan email odgovor koji obuhvata SVE komponente (hotel + prevoz + izlete ako su traženi i nađeni).
        Ako nešto nedostaje u bazi, reci da je ta komponenta "na upit" ili predloži najbolju alternativu.
        Koristi profesionalan i topao ton Olympic Travel agencije.
    `;

    const aiResponse = await askGemini(responsePrompt);

    return {
        success: true,
        data: {
            inquiry,
            hotelMatches: hotels,
            serviceMatches: services,
            suggestedResponse: aiResponse.response
        }
    };
}
