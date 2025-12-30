import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MailAccount {
    id: string;
    email: string;
    name: string;
    color: string;
    signature?: string;
}

export interface Email {
    id: string;
    sender: string;
    senderEmail: string;
    recipient: string;
    subject: string;
    preview: string;
    body: string;
    time: string;
    isUnread: boolean;
    isStarred: boolean;
    category: 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash';
    accountId: string;
    deletedAt?: string;
}

interface MailState {
    accounts: MailAccount[];
    emails: Email[];
    selectedAccountId: string;

    // Actions
    sendEmail: (data: { accountId: string, to: string, subject: string, body: string, sender: string, senderEmail: string }) => void;
    updateEmail: (id: string, updates: Partial<Email>) => void;
    deleteEmail: (id: string) => void;
    restoreEmail: (id: string) => void;
    setSignature: (accountId: string, signature: string) => void;
    setSelectedAccount: (id: string) => void;
}

const initialAccounts: MailAccount[] = [
    { id: 'acc1', email: 'nenad@olympic.rs', name: 'Nenad - Privatni', color: '#3fb950', signature: 'Srdačan pozdrav,\nNenad\nOlympic Travel' },
    { id: 'acc2', email: 'office@olympic.rs', name: 'Olympic Office', color: '#3b82f6', signature: 'Olympic Travel Team' },
    { id: 'acc3', email: 'marketing@olympic.rs', name: 'Marketing SES', color: '#a855f7' }
];

const initialEmails: Email[] = [
    {
        id: '1',
        accountId: 'acc1',
        sender: 'Nikola Petrović',
        senderEmail: 'nikola.p@gmail.com',
        recipient: 'nenad@olympic.rs',
        subject: 'Upit za ponudu - Hotel Splendid 5*',
        preview: 'Poštovani, molim vas za ponudu za 2 odrasle osobe i 2 deteta u periodu...',
        body: 'Poštovani,\n\nMolim vas za ponudu za 2 odrasle osobe i 2 deteta u periodu od 15.07. do 25.07. u hotelu Splendid 5*.\n\nSrdačan pozdrav,\nNikola Petrović',
        time: '14:20',
        isUnread: true,
        isStarred: true,
        category: 'inbox'
    },
    {
        id: '2',
        accountId: 'acc2',
        sender: 'Rezervacije - Regent Porto Montenegro',
        senderEmail: 'reservations@regentpm.com',
        recipient: 'office@olympic.rs',
        subject: 'Potvrda rezervacije #88432',
        preview: 'Vaša rezervacija je uspešno potvrđena. Detalji u prilogu...',
        body: 'Poštovani,\n\nVaša rezervacija #88432 je uspešno potvrđena. Detalji u prilogu.\n\nHvala na poverenju!',
        time: '12:05',
        isUnread: false,
        isStarred: false,
        category: 'inbox'
    }
];

export const useMailStore = create<MailState>()(
    persist(
        (set) => ({
            accounts: initialAccounts,
            emails: initialEmails,
            selectedAccountId: 'acc1',

            sendEmail: (data) => set((state) => {
                const newEmail: Email = {
                    id: Math.random().toString(36).substring(7),
                    accountId: data.accountId,
                    sender: data.sender,
                    senderEmail: data.senderEmail,
                    recipient: data.to,
                    subject: data.subject,
                    body: data.body,
                    preview: data.body.substring(0, 100) + '...',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isUnread: false,
                    isStarred: false,
                    category: 'sent'
                };
                return { emails: [newEmail, ...state.emails] };
            }),

            updateEmail: (id, updates) => set((state) => ({
                emails: state.emails.map(e => e.id === id ? { ...e, ...updates } : e)
            })),

            deleteEmail: (id) => set((state) => ({
                emails: state.emails.map(e => {
                    if (e.id === id) {
                        return {
                            ...e,
                            category: 'trash',
                            deletedAt: new Date().toISOString()
                        };
                    }
                    return e;
                })
            })),

            restoreEmail: (id) => set((state) => ({
                emails: state.emails.map(e => {
                    if (e.id === id) {
                        return { ...e, category: 'inbox', deletedAt: undefined };
                    }
                    return e;
                })
            })),

            setSignature: (accountId, signature) => set((state) => ({
                accounts: state.accounts.map(a => a.id === accountId ? { ...a, signature } : a)
            })),

            setSelectedAccount: (id) => set({ selectedAccountId: id }),
        }),
        {
            name: 'olympic-mail-storage',
        }
    )
);
