import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'navy' | 'cream';
export type Language = 'sr' | 'en';
export type NavMode = 'sidebar' | 'horizontal';

interface ThemeState {
    theme: Theme;
    isPrism: boolean;
    lang: Language;
    navMode: NavMode;
    isSidebarCollapsed: boolean;

    setTheme: (theme: Theme) => void;
    cycleTheme: () => void;
    togglePrism: () => void;
    setLang: (lang: Language) => void;
    setNavMode: (mode: NavMode) => void;
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
            isSidebarCollapsed: false,

            setTheme: (theme: Theme) => set({ theme }),

            cycleTheme: () => {
                const current = get().theme;
                const order: Theme[] = ['dark', 'navy', 'light', 'cream'];
                const currentIndex = order.indexOf(current);
                const nextIndex = (currentIndex + 1) % order.length;
                set({ theme: order[nextIndex] });
            },

            togglePrism: () => set((state) => ({ isPrism: !state.isPrism })),

            setLang: (lang: Language) => set({ lang }),

            setNavMode: (mode: NavMode) => set({ navMode: mode }),

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
