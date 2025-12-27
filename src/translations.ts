export type Language = 'sr' | 'en';

export interface Translations {
    dashboard: string;
    apps: string;
    production: string;
    sales: string;
    marketing: string;
    settings: string;
    searchPlaceholder: string;
    welcomeBack: string;
    hubDesc: string;
    activeTools: string;
    sectors: string;
    system: string;
    openModule: string;
    aiAssistant: string;
    aiDesc: string;
    startChat: string;
    quickActions: string;
    recentActivity: string;
    viewAll: string;
    language: string;
    userLevel: string;
    viewOnly: string;
    editView: string;
    uploadExcel: string;
    aiAnalysis: string;
    filters: string;
    back: string;
    loadedFile: string;
    noData: string;
    rowsCount: string;
    totalValue: string;
    // Settings & Backups
    apiKeys: string;
    geminiKey: string;
    saveSettings: string;
    pointOfReturn: string;
    createBackup: string;
    restore: string;
    backupHistory: string;
    dangerZone: string;
    rollbackSuccess: string;
    snapshotCreated: string;
}

export const translations: Record<Language, Translations> = {
    sr: {
        dashboard: "Dashboard",
        apps: "Aplikacije",
        production: "Produkcija",
        sales: "Prodaja",
        marketing: "Marketing",
        settings: "Podešavanja",
        searchPlaceholder: "Pretraži aplikacije i module...",
        welcomeBack: "Dobrodošli nazad",
        hubDesc: "Vaš centralni Hub za upravljanje Olympic Travel poslovanjem.",
        activeTools: "Aktivni Alati",
        sectors: "Sektori",
        system: "Sistem",
        openModule: "Otvori Modul",
        aiAssistant: "AI Asistent",
        aiDesc: "Spreman za analizu vaših MARS podataka.",
        startChat: "Pokreni Chat",
        quickActions: "Brze Prečice",
        recentActivity: "Nedavna Aktivnost",
        viewAll: "Vidi sve",
        language: "Jezik",
        userLevel: "Nivo Pristupa",
        viewOnly: "Samo gledanje",
        editView: "Uređivanje i gledanje",
        uploadExcel: "Učitaj Excel",
        aiAnalysis: "AI Analiza",
        filters: "Filteri",
        back: "Nazad",
        loadedFile: "Učitan fajl",
        noData: "Nema podataka za prikaz",
        rowsCount: "Broj redova",
        totalValue: "Ukupna vrednost",
        apiKeys: "API Ključevi",
        geminiKey: "Gemini API Ključ",
        saveSettings: "Sačuvaj Podešavanja",
        pointOfReturn: "Tačka Povratka",
        createBackup: "Napravi Snapshot",
        restore: "Vrati verziju",
        backupHistory: "Istorija verzija",
        dangerZone: "Zona opreza",
        rollbackSuccess: "Sistem je uspešno vraćen na prethodnu verziju!",
        snapshotCreated: "Snapshot sistema je uspešno kreiran."
    },
    en: {
        dashboard: "Dashboard",
        apps: "Applications",
        production: "Production",
        sales: "Sales",
        marketing: "Marketing",
        settings: "Settings",
        searchPlaceholder: "Search apps and modules...",
        welcomeBack: "Welcome Back",
        hubDesc: "Your central Hub for managing Olympic Travel business.",
        activeTools: "Active Tools",
        sectors: "Sectors",
        system: "System",
        openModule: "Open Module",
        aiAssistant: "AI Assistant",
        aiDesc: "Ready to analyze your MARS data.",
        startChat: "Start Chat",
        quickActions: "Quick Actions",
        recentActivity: "Recent Activity",
        viewAll: "View all",
        language: "Language",
        userLevel: "Access Level",
        viewOnly: "View Only",
        editView: "Edit & View",
        uploadExcel: "Upload Excel",
        aiAnalysis: "AI Analysis",
        filters: "Filters",
        back: "Back",
        loadedFile: "Loaded file",
        noData: "No data to display",
        rowsCount: "Rows count",
        totalValue: "Total value",
        apiKeys: "API Keys",
        geminiKey: "Gemini API Key",
        saveSettings: "Save Settings",
        pointOfReturn: "Point of Return",
        createBackup: "Create Snapshot",
        restore: "Restore version",
        backupHistory: "Version history",
        dangerZone: "Danger Zone",
        rollbackSuccess: "System successfully restored to a previous version!",
        snapshotCreated: "System snapshot successfully created."
    }
};
