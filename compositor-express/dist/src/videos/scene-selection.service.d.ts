import { LlmService } from '../llm/llm.service';
import { SceneAsset } from './scenes';
export declare class SceneSelectionService {
    private readonly llm;
    private readonly logger;
    constructor(llm: LlmService);
    selectScenes(lyrics: string, count?: number): Promise<SceneAsset[]>;
}
