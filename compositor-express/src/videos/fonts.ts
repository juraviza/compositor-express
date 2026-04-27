import * as path from 'path';
import * as fs from 'fs';

export interface FontDef {
  id: string;
  name: string;
  file: string;
  style: string;
}

export const FONTS: FontDef[] = [
  // Display / Impacto
  { id: 'bangers', name: 'Bangers', file: 'Bangers-Regular.ttf', style: 'Cómic impactante' },
  { id: 'bebas', name: 'Bebas Neue', file: 'BebasNeue-Regular.ttf', style: 'Sans condensada' },
  { id: 'anton', name: 'Anton', file: 'Anton-Regular.ttf', style: 'Sans pesada' },
  { id: 'oswald', name: 'Oswald', file: 'Oswald-Bold.ttf', style: 'Sans condensada negrita' },
  { id: 'fjalla', name: 'Fjalla One', file: 'FjallaOne-Regular.ttf', style: 'Industrial estrecha' },
  { id: 'bungee', name: 'Bungee', file: 'Bungee-Regular.ttf', style: 'Bloque urbano' },
  { id: 'righteous', name: 'Righteous', file: 'Righteous-Regular.ttf', style: 'Geométrica retro' },
  { id: 'montserrat', name: 'Montserrat', file: 'Montserrat-Bold.ttf', style: 'Sans moderna' },
  // Serif / Elegantes
  { id: 'playfair', name: 'Playfair Display', file: 'PlayfairDisplay-Bold.ttf', style: 'Serif elegante' },
  { id: 'abril', name: 'Abril Fatface', file: 'AbrilFatface-Regular.ttf', style: 'Editorial dramática' },
  { id: 'cinzel', name: 'Cinzel', file: 'Cinzel-Bold.ttf', style: 'Romana mayúscula' },
  // Script / Manuscritas
  { id: 'lobster', name: 'Lobster', file: 'Lobster-Regular.ttf', style: 'Script clásica' },
  { id: 'pacifico', name: 'Pacifico', file: 'Pacifico-Regular.ttf', style: 'Manuscrita amigable' },
  { id: 'dancing', name: 'Dancing Script', file: 'DancingScript-Bold.ttf', style: 'Cursiva fluida' },
  { id: 'sacramento', name: 'Sacramento', file: 'Sacramento-Regular.ttf', style: 'Caligrafía fina' },
  { id: 'caveat', name: 'Caveat', file: 'Caveat-Bold.ttf', style: 'Notas a mano' },
  // Mano / Marcador
  { id: 'permanent', name: 'Permanent Marker', file: 'PermanentMarker-Regular.ttf', style: 'Marcador grueso' },
  { id: 'shadows', name: 'Shadows Into Light', file: 'ShadowsIntoLight-Regular.ttf', style: 'Manuscrita sutil' },
  // Especiales
  { id: 'creepster', name: 'Creepster', file: 'Creepster-Regular.ttf', style: 'Terror gótico' },
];

export function resolveFontsDir(): string {
  const candidates = [
    path.join(__dirname, '..', 'assets', 'fonts'),
    path.join(__dirname, '..', '..', 'src', 'assets', 'fonts'),
    path.join(process.cwd(), 'src', 'assets', 'fonts'),
    path.join(process.cwd(), 'app', 'assets', 'fonts'),
  ];
  for (const c of candidates) {
    try { if (fs.existsSync(c) && fs.readdirSync(c).length > 0) return c; } catch { /* ignore */ }
  }
  return candidates[0];
}

export function getFontFilePath(fontId: string): string | null {
  const def = FONTS.find(f => f.id === fontId);
  if (!def) return null;
  const p = path.join(resolveFontsDir(), def.file);
  return fs.existsSync(p) ? p : null;
}
