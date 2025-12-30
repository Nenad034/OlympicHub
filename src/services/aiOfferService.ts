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
 * Now with Marketing Steered Logic: AI favors "Promoted" or high-value offers.
 */
export async function generateOfferFromEmail(emailBody: string): Promise<OfferProposal> {
    // 1. Extract params
    const inquiry = await extractInquiryParameters(emailBody);
    if (!inquiry) {
        return { success: false, error: 'AI nije uspeo da izvuče parametre iz upita.' };
    }

    // 2. Search DB
    const { hotels, services } = await searchOffers(inquiry);

    // 3. Marketing Priority Logic - Identify "Promoted" items
    // In a real scenario, this would check a 'is_promoted' or 'margin_level' flag in DB
    const promotedHotels = hotels.filter(h =>
        h.description?.toLowerCase().includes('verified') ||
        h.description?.toLowerCase().includes('ekskluzivno') ||
        h.stars >= 5
    );

    const promotedServices = services.filter(s =>
        s.description?.toLowerCase().includes('verified') ||
        s.category === 'transfer' // Agents usually want to sell transfers with hotels
    );

    // 4. Generate Response Text with Marketing Steering
    const responsePrompt = `
        Na osnovu upita i pronađenih podataka iz baze, sastavi KOMPLETNU ponudu na SRPSKOM JEZIKU.
        
        Kao AI Agent prodaje Olympic Travel-a, tvoj cilj je da klijentu pružiš najbolju uslugu 
        ALI i da istakneš ponude koje su u interesu agencije (označene kao PRIORITET).

        UPIT KORISNIKA:
        Hotel: ${inquiry.hotelName}
        Period: ${inquiry.checkIn} do ${inquiry.checkOut}
        Putnika: ${inquiry.adults} odraslih, ${inquiry.children} dece
        Prevoz: ${inquiry.transportRequired ? inquiry.transportType : 'nije traženo'}
        Dodatno: ${inquiry.additionalServices.join(', ')}

        PRIORITETNI HOTELI (Istakni ih kao 'Olympic Preporuka'):
        ${JSON.stringify(promotedHotels, null, 2)}

        OSTALI HOTELI:
        ${JSON.stringify(hotels.filter(h => !promotedHotels.includes(h)), null, 2)}

        PRIORITETNE USLUGE (Transferi i Verified izleti):
        ${JSON.stringify(promotedServices, null, 2)}

        OSTALE USLUGE:
        ${JSON.stringify(services.filter(s => !promotedServices.includes(s)), null, 2)}

        STRATEGIJA PRODAJE (Marketing Guidance):
        1. Ako postoji PRIORITETAN hotel, predstavi ga prvi sa rečenicom poput "Posebno izdvajamo našu verifikovanu ponudu..."
        2. UVEK predloži Privatni Transfer ako postoji u bazi, čak i ako ga klijent nije eksplicitno tražio, uz obrazloženje da to "pruža maksimalan komfor i sigurnost".
        3. Ako je upit za Disneyland ili Aquapark, obavezno ponudi i transfer/ulaznice u istom pasusu.
        4. Koristi prodajni, inspirativan, ali profesionalan ton.

        ZADATAK:
        Sastavi ljubazan email odgovor.
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
