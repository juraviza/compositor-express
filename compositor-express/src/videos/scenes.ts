import * as path from 'path';
import * as fs from 'fs';

export interface SceneAsset {
  id: string;
  file: string;
  description: string;
  // Themes used for matching
  tags: string[];
  // Mood from 0 (calm) to 1 (intense)
  intensity: number;
}

export const SCENE_LIBRARY: SceneAsset[] = [
  { id: 'dancer_passion', file: 'dancer_passion.jpg', description: 'Bailaora flamenca girando con vestido rojo, luz dramática', tags: ['baile', 'pasión', 'mujer', 'fuego', 'movimiento', 'rojo'], intensity: 0.9 },
  { id: 'dancer_silhouette', file: 'dancer_silhouette.jpg', description: 'Silueta de bailaora contra luz cálida del atardecer', tags: ['baile', 'silueta', 'atardecer', 'misterio', 'soledad'], intensity: 0.6 },
  { id: 'dancer_hands', file: 'dancer_hands.jpg', description: 'Manos de bailaora con castañuelas, gesto expresivo', tags: ['manos', 'detalle', 'baile', 'expresión', 'íntimo'], intensity: 0.7 },
  { id: 'guitar_close', file: 'guitar_close.jpg', description: 'Primer plano de guitarra flamenca, cuerdas y luz cálida', tags: ['guitarra', 'música', 'detalle', 'íntimo', 'arte'], intensity: 0.5 },
  { id: 'guitar_player', file: 'guitar_player.jpg', description: 'Manos de guitarrista flamenco sobre el mástil', tags: ['guitarra', 'música', 'manos', 'arte', 'concentración'], intensity: 0.55 },
  { id: 'andalusia_street', file: 'andalusia_street.jpg', description: 'Calle blanca andaluza al atardecer', tags: ['andalucía', 'pueblo', 'nostalgia', 'hogar', 'tradición'], intensity: 0.4 },
  { id: 'seville_night', file: 'seville_night.jpg', description: 'Sevilla iluminada de noche con cielo dramático', tags: ['sevilla', 'noche', 'ciudad', 'monumental', 'recuerdo'], intensity: 0.55 },
  { id: 'flamenco_show', file: 'flamenco_show.jpg', description: 'Tablao flamenco con luces cálidas y sombras', tags: ['tablao', 'espectáculo', 'noche', 'tradición', 'misterio'], intensity: 0.7 },
  { id: 'red_smoke', file: 'red_smoke.jpg', description: 'Humo rojo y dorado abstracto sobre fondo oscuro', tags: ['abstracto', 'fuego', 'pasión', 'rojo', 'energía'], intensity: 0.85 },
  { id: 'sunset_andalusia', file: 'sunset_andalusia.jpg', description: 'Olivar andaluz al atardecer', tags: ['andalucía', 'campo', 'atardecer', 'paz', 'nostalgia'], intensity: 0.35 },
  { id: 'wine_glass', file: 'wine_glass.jpg', description: 'Copa de vino tinto con luces bokeh, ambiente íntimo', tags: ['vino', 'íntimo', 'amor', 'noche', 'celebración'], intensity: 0.5 },
  { id: 'rose_dark', file: 'rose_dark.jpg', description: 'Rosa roja sobre fondo negro con luz lateral', tags: ['amor', 'pasión', 'belleza', 'desamor', 'romance'], intensity: 0.75 },
  { id: 'couple_dance', file: 'couple_dance.jpg', description: 'Pareja bailando con luz cálida tenue', tags: ['amor', 'pareja', 'baile', 'romance', 'pasión'], intensity: 0.7 },
  { id: 'bullring', file: 'bullring.jpg', description: 'Plaza de toros española al atardecer', tags: ['españa', 'tradición', 'monumental', 'arte', 'cultura'], intensity: 0.5 },
  { id: 'cobblestone_night', file: 'cobblestone_night.jpg', description: 'Adoquines mojados de noche con farola cálida', tags: ['noche', 'soledad', 'lluvia', 'melancolía', 'calle'], intensity: 0.45 },
  { id: 'fire_embers', file: 'fire_embers.jpg', description: 'Brasas y chispas naranjas subiendo en negro', tags: ['fuego', 'pasión', 'energía', 'abstracto', 'intensidad'], intensity: 0.95 },
  { id: 'moon_clouds', file: 'moon_clouds.jpg', description: 'Luna llena tras nubes oscuras', tags: ['noche', 'misterio', 'soledad', 'melancolía', 'sueño'], intensity: 0.6 },
  { id: 'abstract_red', file: 'abstract_red.jpg', description: 'Textura abstracta roja y negra cinematográfica', tags: ['abstracto', 'rojo', 'pasión', 'arte', 'fondo'], intensity: 0.7 },
];

/** Resolve the assets folder regardless of dev/prod layout. */
export function resolveScenesDir(): string {
  const candidates = [
    path.join(__dirname, '..', 'assets', 'scenes'), // dist/src/assets after nest build with copy-assets
    path.join(__dirname, '..', '..', 'src', 'assets', 'scenes'), // running compiled from dist/src/videos
    path.join(process.cwd(), 'src', 'assets', 'scenes'),
    path.join(process.cwd(), 'app', 'assets', 'scenes'),
  ];
  for (const c of candidates) {
    try { if (fs.existsSync(c) && fs.readdirSync(c).length > 0) return c; } catch { /* ignore */ }
  }
  // Fallback: first one
  return candidates[0];
}

export function getSceneFilePath(file: string): string {
  return path.join(resolveScenesDir(), file);
}
