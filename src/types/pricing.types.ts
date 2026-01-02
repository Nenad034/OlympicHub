// Pricing System Types

export interface PersonCategory {
    code: 'ADL' | 'CHD1' | 'CHD2' | 'CHD3' | 'INF';
    label: string;
    ageFrom: number;
    ageTo: number;
}

export interface BedOccupant {
    bedType: 'osnovni' | 'pomocni';
    bedIndex: number;
    personCategory: 'ADL' | 'CHD1' | 'CHD2' | 'CHD3' | 'INF';
}

export interface Discount {
    type: 'early_booking' | 'child_discount' | 'last_minute' | 'custom';
    label: string;
    amount?: number;
    percentage?: number;
}

export interface Surcharge {
    type: 'single_use' | 'extra_bed' | 'sea_view' | 'custom';
    label: string;
    amount?: number;
    percentage?: number;
}

export interface PricingRule {
    id: string;
    isActive: boolean;

    // Bed assignment
    bedAssignment: BedOccupant[];

    // Pricing
    basePrice: number;
    discounts?: Discount[];
    surcharges?: Surcharge[];
    finalPrice: number;

    // Metadata
    notes?: string;
}

export interface RoomTypePricing {
    roomTypeId: string;
    roomTypeName: string;

    // Base occupancy rules from RoomsStep
    baseOccupancyVariants: string[]; // e.g., ["2ADL_1CHD", "3ADL_0CHD"]

    // Generated pricing rules with age categories
    pricingRules: PricingRule[];
}

export interface PriceList {
    id: string;
    name: string;
    propertyId: string;

    // Validity period
    validFrom: Date;
    validTo: Date;

    // Person categories
    personCategories: PersonCategory[];

    // Room type pricing
    roomTypePricing: RoomTypePricing[];

    // AI Assistant metadata
    aiGeneratedRules?: AIGeneratedRule[];
    validationStatus: 'pending' | 'approved' | 'rejected';
    validationNotes?: string;

    // Import metadata
    importSource?: ImportSource;
}

export interface AIGeneratedRule {
    ruleId: string;
    prompt: string;
    generatedAt: Date;
    validatedAt?: Date;
    validatedBy?: string;
    feedback?: string;
}

export interface ImportSource {
    type: 'excel' | 'pdf' | 'json' | 'xml' | 'html';
    fileName: string;
    uploadedAt: Date;
    parsedData?: any;
}

export interface ImportPreview {
    personCategories: PersonCategory[];
    roomTypePricing: RoomTypePricing[];
    warnings: string[];
    errors: string[];
}

export interface AIAssistantMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;

    // For assistant messages
    preview?: ImportPreview | PricingRule[];
    requiresValidation?: boolean;
    validationStatus?: 'pending' | 'approved' | 'rejected';
}
