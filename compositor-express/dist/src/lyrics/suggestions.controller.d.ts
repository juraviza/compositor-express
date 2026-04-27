import { SuggestionsService } from './suggestions.service';
import { ApplySuggestionDto } from './dto/lyrics.dto';
export declare class SuggestionsController {
    private service;
    constructor(service: SuggestionsService);
    apply(id: string, dto: ApplySuggestionDto): Promise<{
        id: any;
        appliedText: any;
        appliedAt: any;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
