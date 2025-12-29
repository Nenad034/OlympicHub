import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPermissions {
    canImport: boolean;
    canExport: boolean;
    allowedModules?: string[];
    deniedModules?: string[];
}

interface AuthState {
    userLevel: number;
    userName: string;
    permissions: UserPermissions;
    setUserLevel: (level: number) => void;
    setUserName: (name: string) => void;
    getPermissions: () => UserPermissions;
}

const defaultPermissions: Record<number, UserPermissions> = {
    1: { canImport: false, canExport: false },
    2: { canImport: false, canExport: true },
    3: { canImport: true, canExport: true },
    4: { canImport: true, canExport: true },
    5: { canImport: true, canExport: true },
    6: { canImport: true, canExport: true }, // Master Admin
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            userLevel: 6,
            userName: 'Nenad',
            permissions: defaultPermissions[6],

            setUserLevel: (level: number) => {
                set({
                    userLevel: level,
                    permissions: defaultPermissions[level] || defaultPermissions[1]
                });
            },

            setUserName: (name: string) => {
                set({ userName: name });
            },

            getPermissions: () => {
                const level = get().userLevel;
                return defaultPermissions[level] || defaultPermissions[1];
            },
        }),
        {
            name: 'olympic-auth-storage',
        }
    )
);
