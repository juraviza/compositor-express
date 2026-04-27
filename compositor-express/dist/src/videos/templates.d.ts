export type TemplateId = 'pasion' | 'noche' | 'duende' | 'fiesta';
export interface Template {
    id: TemplateId;
    name: string;
    description: string;
    bgColorA: string;
    bgColorB: string;
    bgColorC: string;
    textColor: string;
    accentColor: string;
    shadowColor: string;
}
export declare const TEMPLATES: Record<TemplateId, Template>;
export declare const DEFAULT_TEMPLATE: TemplateId;
