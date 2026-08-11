import { createContext } from 'react';

export interface ConfirmOptions {
    header: string;
    message: string;
    acceptLabel?: string;
    rejectLabel?: string;
    severity?: 'danger' | 'primary' | 'success' | 'warning';
}

export interface ConfirmContextType {
    confirmar: (options: ConfirmOptions) => Promise<boolean>;
}

export const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);
