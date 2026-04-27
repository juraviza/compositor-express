import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { SCENE_LIBRARY, SceneAsset } from './scenes';

@Injectable()
export class SceneSelectionService {
  private readonly logger = new Logger(SceneSelectionService.name);

  constructor(private readonly llm: LlmService) {}

  /**
   * Pick ~7 ordered scene IDs that best illustrate the lyrics. Always returns valid IDs.
   */
  async selectScenes(lyrics: string, count = 7): Promise<SceneAsset[]> {
    const ids = SCENE_LIBRARY.map(s => s.id);
    const catalog = SCENE_LIBRARY.map(s => `- ${s.id}: ${s.description} (tags: ${s.tags.join(', ')})`).join('\n');
    const sys = 'Eres un director artístico experto en videos musicales flamencos. Tu tarea es escoger imágenes que cuenten visualmente la historia de la letra. Devuelve SOLO un JSON con la forma exacta { "scenes": ["id1", "id2", ...] } sin explicaciones.';
    const user = `Letra de la canción:\n"""\n${(lyrics || '').slice(0, 2000)}\n"""\n\nCatálogo de imágenes disponibles (usa SOLO los IDs listados):\n${catalog}\n\nElige exactamente ${count} imágenes en orden cinematográfico que mejor representen el sentimiento, los temas y la progresión emocional de la letra. Varía los planos para que el video sea visualmente rico (alterna detalle/amplio, gente/lugar/abstracto). Responde SOLO el JSON: { "scenes": ["id", ...] }`;

    let chosen: string[] = [];
    try {
      const data = await this.llm.chatJson<{ scenes?: string[] }>(sys, user, 30000);
      if (Array.isArray(data?.scenes)) chosen = data.scenes;
    } catch (e: any) {
      this.logger.warn(`Scene LLM selection failed: ${e?.message}`);
    }

    // Validate chosen IDs against catalog
    const valid = chosen.map(c => SCENE_LIBRARY.find(s => s.id === c)).filter((s): s is SceneAsset => !!s);

    // If we don't have enough, fallback to a sensible varied default
    if (valid.length < count) {
      const fallbackOrder = [
        'dancer_silhouette', 'guitar_close', 'rose_dark', 'flamenco_show', 'red_smoke',
        'couple_dance', 'fire_embers', 'andalusia_street', 'moon_clouds', 'dancer_passion',
        'wine_glass', 'sunset_andalusia',
      ];
      for (const id of fallbackOrder) {
        if (valid.length >= count) break;
        if (!valid.find(v => v.id === id)) {
          const s = SCENE_LIBRARY.find(x => x.id === id);
          if (s) valid.push(s);
        }
      }
    }
    return valid.slice(0, count);
  }
}
