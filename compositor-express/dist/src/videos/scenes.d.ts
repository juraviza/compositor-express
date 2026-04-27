export interface SceneAsset {
    id: string;
    file: string;
    description: string;
    tags: string[];
    intensity: number;
}
export declare const SCENE_LIBRARY: SceneAsset[];
export declare function resolveScenesDir(): string;
export declare function getSceneFilePath(file: string): string;
