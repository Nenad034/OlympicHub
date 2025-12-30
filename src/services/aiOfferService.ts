import { supabase } from '../supabaseClient';
import { askGemini } from './gemini';

export interface OfferInquiry {
    hotelName: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    childrenAges: number[];
}

export interface OfferProposal {
    success: boolean;
    data?: {
        inquiry: OfferInquiry;
        matches: any[];
        suggestedResponse: string;
    };
    error?: string;
}

/**
 * Extracts travel parameters from email text using Gemini
 */
export async function extractInquiryParameters(emailBody: string): Promise<OfferInquiry | null> {
    const prompt = `
        Analiziraj sledeći upit za putovanje i izvuci parametre u JSON formatu.
        Pokušaj da identifikuješ:
        - Naziv hotela (hotelName)
        - Datum dolaska (checkIn - format YYYY-MM-DD)
        - Datum odlaska (checkOut - format YYYY-MM-DD)
        - Broj odraslih (adults)
        - Broj dece (children)
        - Uzrast dece (childrenAges - niz brojeva)

        Upit:
        "${emailBody}"

        Odgovori ISKLJUČIVO JSON objektom. Ako neki podatak fali, stavi null ili prazan niz.
    `;

    const result = await askGemini(prompt, { temperature: 0.1 });

    if (result.success) {
        try {
            // Clean the response from markdown code blocks if present
            const jsonStr = result.response.replace(/```json|```/g, '').trim();
            return JSON.parse(jsonStr) as OfferInquiry;
        } catch (e) {
            console.error('Failed to parse Gemini JSON:', e);
            return null;
        }
    }
    return null;
}

/**
 * Searches the pricelist database for matching offers
 */
export async function searchPricelists(params: OfferInquiry): Promise<any[]> {
    try {
        // Simple search by hotel name in pricelist titles or connected properties
        let query = supabase
            .from('pricelists')
            .select(`
                *,
                price_periods (*),
                price_rules (*)
            `)
            .eq('status', 'active');

        if (params.hotelName) {
            query = query.ilike('title', `%${params.hotelName}%`);
        }

        const { data: pricelists, error } = await query;

        if (error) throw error;
        if (!pricelists) return [];

        // Filter periods that cover the requested dates
        const matches = pricelists.filter((pl: any) => {
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

        return matches;
    } catch (error) {
        console.error('Error searching pricelists:', error);
        return [];
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
    const matches = await searchPricelists(inquiry);

    // 3. Generate Response Text
    const responsePrompt = `
        Na osnovu upita i pronađenih cena iz baze, sastavi profesionalan odgovor korisniku na SRPSKOM JEZIKU.
        
        UPIT KORISNIKA:
        Hotel: ${inquiry.hotelName}
        Period: ${inquiry.checkIn} do ${inquiry.checkOut}
        Putnika: ${inquiry.adults} odraslih, ${inquiry.children} dece

        PRONAĐENE CENE:
        ${JSON.stringify(matches, null, 2)}

        ZADATAK:
        Sastavi ljubazan email odgovor. Ako si našao cenu, navedi je jasno sa ukuponim iznosom. 
        Ako nisi našao tačnu cenu, reci da proveravaš i ponudi alternativu (ako postoji u pronađenim cenama).
        Koristi profesionalan ton Olympic Travel agencije.
    `;

    const aiResponse = await askGemini(responsePrompt);

    return {
        success: true,
        data: {
            inquiry,
            matches,
            suggestedResponse: aiResponse.response
        }
    };
}
