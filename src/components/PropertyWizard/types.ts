import type { Property } from '../../types/property.types';

export interface PropertyWizardProps {
    onClose: () => void;
    onSave: (property: Partial<Property>, shouldClose?: boolean) => void;
    initialData?: Partial<Property>;
}

export interface StepProps {
    data: Partial<Property>;
    onChange: (updates: Partial<Property>) => void;
}

export interface Step {
    id: string;
    title: string;
    icon: React.ReactNode;
}
