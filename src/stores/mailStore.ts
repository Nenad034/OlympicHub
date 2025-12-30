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
    setEmails: (emails: Email[]) => void;
}

const initialAccounts: MailAccount[] = [
    { id: 'acc1', email: 'nenad.tomic1403@gmail.com', name: 'Nenad Tomić - Gmail', color: '#ea4335', signature: 'Srdačan pozdrav,\nNenad Tomić' },
    { id: 'acc2', email: 'nenad.tomic@olympic.rs', name: 'Nenad Tomić - Olympic', color: '#3fb950', signature: 'Srdačan pozdrav,\nNenad Tomić\nOlympic Travel' },
    { id: 'acc3', email: 'info@olympic.rs', name: 'Olympic Info', color: '#3b82f6', signature: 'Olympic Travel Team\nwww.olympic.rs' }
];

const initialEmails: Email[] = [];

export const useMailStore = create<MailState>()(
    persist(
        (set) => ({
            accounts: initialAccounts,
            emails: initialEmails,
            selectedAccountId: 'acc1',

            sendEmail: (data: { accountId: string, to: string, subject: string, body: string, sender: string, senderEmail: string }) => set((state: MailState) => {
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

            updateEmail: (id: string, updates: Partial<Email>) => set((state: MailState) => ({
                emails: state.emails.map(e => e.id === id ? { ...e, ...updates } : e)
            })),

            deleteEmail: (id: string) => set((state: MailState) => ({
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

            restoreEmail: (id: string) => set((state: MailState) => ({
                emails: state.emails.map(e => {
                    if (e.id === id) {
                        return { ...e, category: 'inbox', deletedAt: undefined };
                    }
                    return e;
                })
            })),

            setSignature: (accountId: string, signature: string) => set((state: MailState) => ({
                accounts: state.accounts.map(a => a.id === accountId ? { ...a, signature } : a)
            })),

            setSelectedAccount: (id: string) => set({ selectedAccountId: id }),

            setEmails: (emails: Email[]) => set({ emails }),
        }),
        {
            name: 'olympic-mail-storage',
        }
    )
);
