import { PrismaService } from '../prisma/prisma.service';
export declare class SuggestionsService {
    private prisma;
    constructor(prisma: PrismaService);
    apply(id: string, appliedText: string): Promise<{
        id: any;
        appliedText: any;
        appliedAt: any;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
