import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'navy' | 'cream' | 'dark-rainbow' | 'light-rainbow' | 'cyberpunk' | 'forest';
export type Language = 'sr' | 'en';
export type NavMode = 'sidebar' | 'horizontal';
export type LayoutMode = 'classic' | 'modern';

interface ThemeState {
    theme: Theme;
    isPrism: boolean;
    lang: Language;
    navMode: NavMode;
    layoutMode: LayoutMode;
    isSidebarCollapsed: boolean;

    setTheme: (theme: Theme) => void;
    cycleTheme: () => void;
    togglePrism: () => void;
    setLang: (lang: Language) => void;
    setNavMode: (mode: NavMode) => void;
    setLayoutMode: (mode: LayoutMode) => void;
    toggleLayoutMode: () => void;
    toggleNavMode: () => void;
    toggleSidebar: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'dark',
            isPrism: false,
            lang: 'sr',
            navMode: 'sidebar',
            layoutMode: 'modern',
            isSidebarCollapsed: false,

            setTheme: (theme: Theme) => set({ theme }),

            cycleTheme: () => {
                const current = get().theme;
                const order: Theme[] = ['dark', 'dark-rainbow', 'navy', 'cyberpunk', 'light', 'light-rainbow', 'cream', 'forest'];
                const currentIndex = order.indexOf(current);
                const nextIndex = (currentIndex + 1) % order.length;
                set({ theme: order[nextIndex] });
            },

            togglePrism: () => set((state) => ({ isPrism: !state.isPrism })),

            setLang: (lang: Language) => set({ lang }),

            setNavMode: (mode: NavMode) => set({ navMode: mode }),

            setLayoutMode: (mode: LayoutMode) => set({ layoutMode: mode }),

            toggleLayoutMode: () => set((state) => ({
                layoutMode: state.layoutMode === 'classic' ? 'modern' : 'classic'
            })),

            toggleNavMode: () => set((state) => ({
                navMode: state.navMode === 'sidebar' ? 'horizontal' : 'sidebar'
            })),

            toggleSidebar: () => set((state) => ({
                isSidebarCollapsed: !state.isSidebarCollapsed
            })),
        }),
        {
            name: 'olympic-theme-storage',
        }
    )
);
