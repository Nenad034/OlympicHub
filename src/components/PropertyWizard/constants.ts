export const MOCK_SUPPLIERS = [
    { id: 'sup1', name: 'Hilton Hotels & Resorts', type: 'Lanac Hotela' },
    { id: 'sup2', name: 'Marriott International', type: 'Lanac Hotela' },
    { id: 'sup3', name: 'Accor', type: 'Lanac Hotela' },
    { id: 'sup4', name: 'Hyatt Hotels Corporation', type: 'Lanac Hotela' },
    { id: 'sup5', name: 'Best Western', type: 'Brand Hotela' },
    { id: 'sup6', name: 'Holiday Inn', type: 'Brand Hotela' },
    { id: 'sup7', name: 'Crowne Plaza', type: 'Brand Hotela' },
    { id: 'sup8', name: 'Balkan Tours', type: 'Touroperatori' },
    { id: 'sup9', name: 'Argus Tours', type: 'Touroperatori' },
    { id: 'sup10', name: 'Hotel Serbia', type: 'Hoteli' },
];

export const STEP_IDS = {
    BASIC: 'basic',
    LOCATION: 'location',
    CONTENT: 'content',
    IMAGES: 'images',
    ROOMS: 'rooms',
    AMENITIES: 'amenities',
    RATES: 'rates',
    POLICIES: 'policies'
} as const;
