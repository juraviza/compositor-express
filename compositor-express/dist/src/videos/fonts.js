"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FONTS = void 0;
exports.resolveFontsDir = resolveFontsDir;
exports.getFontFilePath = getFontFilePath;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
exports.FONTS = [
    { id: 'bangers', name: 'Bangers', file: 'Bangers-Regular.ttf', style: 'Cómic impactante' },
    { id: 'bebas', name: 'Bebas Neue', file: 'BebasNeue-Regular.ttf', style: 'Sans condensada' },
    { id: 'anton', name: 'Anton', file: 'Anton-Regular.ttf', style: 'Sans pesada' },
    { id: 'oswald', name: 'Oswald', file: 'Oswald-Bold.ttf', style: 'Sans condensada negrita' },
    { id: 'fjalla', name: 'Fjalla One', file: 'FjallaOne-Regular.ttf', style: 'Industrial estrecha' },
    { id: 'bungee', name: 'Bungee', file: 'Bungee-Regular.ttf', style: 'Bloque urbano' },
    { id: 'righteous', name: 'Righteous', file: 'Righteous-Regular.ttf', style: 'Geométrica retro' },
    { id: 'montserrat', name: 'Montserrat', file: 'Montserrat-Bold.ttf', style: 'Sans moderna' },
    { id: 'playfair', name: 'Playfair Display', file: 'PlayfairDisplay-Bold.ttf', style: 'Serif elegante' },
    { id: 'abril', name: 'Abril Fatface', file: 'AbrilFatface-Regular.ttf', style: 'Editorial dramática' },
    { id: 'cinzel', name: 'Cinzel', file: 'Cinzel-Bold.ttf', style: 'Romana mayúscula' },
    { id: 'lobster', name: 'Lobster', file: 'Lobster-Regular.ttf', style: 'Script clásica' },
    { id: 'pacifico', name: 'Pacifico', file: 'Pacifico-Regular.ttf', style: 'Manuscrita amigable' },
    { id: 'dancing', name: 'Dancing Script', file: 'DancingScript-Bold.ttf', style: 'Cursiva fluida' },
    { id: 'sacramento', name: 'Sacramento', file: 'Sacramento-Regular.ttf', style: 'Caligrafía fina' },
    { id: 'caveat', name: 'Caveat', file: 'Caveat-Bold.ttf', style: 'Notas a mano' },
    { id: 'permanent', name: 'Permanent Marker', file: 'PermanentMarker-Regular.ttf', style: 'Marcador grueso' },
    { id: 'shadows', name: 'Shadows Into Light', file: 'ShadowsIntoLight-Regular.ttf', style: 'Manuscrita sutil' },
    { id: 'creepster', name: 'Creepster', file: 'Creepster-Regular.ttf', style: 'Terror gótico' },
];
function resolveFontsDir() {
    const candidates = [
        path.join(__dirname, '..', 'assets', 'fonts'),
        path.join(__dirname, '..', '..', 'src', 'assets', 'fonts'),
        path.join(process.cwd(), 'src', 'assets', 'fonts'),
        path.join(process.cwd(), 'app', 'assets', 'fonts'),
    ];
    for (const c of candidates) {
        try {
            if (fs.existsSync(c) && fs.readdirSync(c).length > 0)
                return c;
        }
        catch { }
    }
    return candidates[0];
}
function getFontFilePath(fontId) {
    const def = exports.FONTS.find(f => f.id === fontId);
    if (!def)
        return null;
    const p = path.join(resolveFontsDir(), def.file);
    return fs.existsSync(p) ? p : null;
}
//# sourceMappingURL=fonts.js.map