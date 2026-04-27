import React from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { GradientButton } from '../../src/components/GradientButton';
import { colors, fonts, fallbackFonts, radius, spacing } from '../../src/theme';
import { LyricsAPI, VideosAPI } from '../../src/api';
import type { Lyric, VideoFormat, VideoTemplate, VideoTemplateId } from '../../src/types';

const TITLE_FONTS: { id: string; label: string; preview: string }[] = [
  { id: 'DejaVuSans-Bold', label: 'Clásica', preview: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }) as string },
  { id: 'Hunters', label: 'Hunters', preview: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }) as string },
  { id: 'Blacksword', label: 'Blacksword', preview: Platform.select({ ios: 'Snell Roundhand', android: 'cursive', default: 'cursive' }) as string },
  { id: 'Hello Valentina', label: 'Valentina', preview: Platform.select({ ios: 'Snell Roundhand', android: 'cursive', default: 'cursive' }) as string },
  { id: 'Cream Cake', label: 'Cream Cake', preview: Platform.select({ ios: 'Marker Felt', android: 'sans-serif-medium', default: 'sans-serif' }) as string },
  { id: 'Cream Cake Bold', label: 'Cream Bold', preview: Platform.select({ ios: 'Marker Felt', android: 'sans-serif-medium', default: 'sans-serif' }) as string },
  { id: 'BillionDreams', label: 'Billion', preview: Platform.select({ ios: 'Bradley Hand', android: 'cursive', default: 'cursive' }) as string },
];

const FALLBACK_TEMPLATES: VideoTemplate[] = [
  { id: 'pasion', name: 'Pasión Flamenca', description: 'Rojos cálidos, tono intenso', bgColorA: '8B0000', bgColorB: 'D72638', bgColorC: '1A0000', textColor: 'FFE5B4', accentColor: 'FFD700' },
  { id: 'noche', name: 'Noche Andaluza', description: 'Azul frío, ambiente nítido', bgColorA: '0B1D3A', bgColorB: '1B3F8B', bgColorC: '050B1A', textColor: 'F5E6CC', accentColor: 'C9A227' },
  { id: 'duende', name: 'Duende', description: 'Sepia cinematográfico', bgColorA: '2E1A0F', bgColorB: '6B4423', bgColorC: '120A05', textColor: 'F4E4C1', accentColor: 'D4A574' },
  { id: 'fiesta', name: 'Fiesta', description: 'Vibrante y saturado', bgColorA: 'FF6B35', bgColorB: 'D7263D', bgColorC: '4A0E2C', textColor: 'FFFFFF', accentColor: 'FFE74C' },
];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoCreate() {
  const { lyricId, lyricsText: initialLyricsText, format: initialFormat, template: initialTemplate, title: initialTitle } = useLocalSearchParams<{ lyricId?: string; lyricsText?: string; format?: string; template?: string; title?: string }>();
  const [_lyric, setLyric] = React.useState<Lyric | null>(null);
  const [title, setTitle] = React.useState('');
  const [lyricsText, setLyricsText] = React.useState('');
  const [audio, setAudio] = React.useState<{ uri: string; name: string; size?: number } | null>(null);
  const [audioDuration, setAudioDuration] = React.useState<number>(0);
  const [format, setFormat] = React.useState<VideoFormat>('vertical');
  const [template, setTemplate] = React.useState<VideoTemplateId>('pasion');
  const [titleFont, setTitleFont] = React.useState<string>('DejaVuSans-Bold');
  const [templates, setTemplates] = React.useState<VideoTemplate[]>(FALLBACK_TEMPLATES);
  const [uploading, setUploading] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [progressMsg, setProgressMsg] = React.useState('');
  const soundRef = React.useRef<Audio.Sound | null>(null);

  React.useEffect(() => {
    VideosAPI.templates().then((t) => { if (t?.length) setTemplates(t); }).catch(() => {});
  }, []);

  React.useEffect(() => {
    // Load from passed params (for regenerating)
    if (initialTitle) setTitle(initialTitle);
    if (initialLyricsText) setLyricsText(initialLyricsText);
    if (initialFormat && (initialFormat === 'vertical' || initialFormat === 'horizontal')) setFormat(initialFormat as VideoFormat);
    if (initialTemplate) setTemplate(initialTemplate as VideoTemplateId);
    
    // Load from lyric ID if provided
    if (typeof lyricId === 'string' && lyricId) {
      LyricsAPI.get(lyricId).then((l) => {
        setLyric(l ?? null);
        if (!initialTitle) setTitle(l?.title ?? '');
        if (!initialLyricsText) setLyricsText(l?.content ?? '');
      }).catch(() => {});
    }
  }, [lyricId, initialLyricsText, initialFormat, initialTemplate, initialTitle]);

  React.useEffect(() => () => { soundRef.current?.unloadAsync().catch(() => {}); }, []);

  const pickAudio = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/mp3', 'audio/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled) return;
      const file = res.assets?.[0];
      if (!file?.uri) return;
      setAudio({ uri: file.uri, name: file.name ?? 'audio.mp3', size: file.size });
      try { await soundRef.current?.unloadAsync(); } catch {}
      const { sound } = await Audio.Sound.createAsync({ uri: file.uri }, { shouldPlay: false });
      soundRef.current = sound;
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        setAudioDuration(Math.floor(status.durationMillis / 1000));
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo seleccionar el archivo');
    }
  };

  const uploadAudio = async (): Promise<string | null> => {
    if (!audio) { Alert.alert('Falta audio', 'Sube un archivo MP3 primero.'); return null; }
    setUploading(true);
    setProgressMsg('Subiendo tu canción...');
    try {
      const { uploadUrl, cloud_storage_path } = await VideosAPI.presignAudio(audio.name);
      const fileResp = await fetch(audio.uri);
      const blob = await fileResp.blob();
      const url = new URL(uploadUrl);
      const signedHeaders = (url.searchParams.get('X-Amz-SignedHeaders') || '').toLowerCase();
      const headers: Record<string, string> = { 'Content-Type': 'audio/mpeg' };
      if (signedHeaders.includes('content-disposition')) headers['Content-Disposition'] = 'attachment';
      const put = await fetch(uploadUrl, { method: 'PUT', headers, body: blob });
      if (!put.ok) throw new Error(`Subida falló (${put.status})`);
      return cloud_storage_path;
    } finally {
      setUploading(false);
    }
  };

  const onGenerate = async () => {
    if (!title.trim()) { Alert.alert('Falta título', 'Escribe un título para tu video.'); return; }
    if (!lyricsText.trim()) { Alert.alert('Falta letra', 'Añade la letra de la canción.'); return; }
    if (!audio) { Alert.alert('Falta audio', 'Sube un archivo MP3.'); return; }
    try {
      setGenerating(true);
      const audioPath = await uploadAudio();
      if (!audioPath) return;
      setProgressMsg('DeepSeek analizando tu letra y generando guión cinematográfico...');
      const video = await VideosAPI.generate({
        lyricId: typeof lyricId === 'string' ? lyricId : undefined,
        title: title.trim(),
        audioPath,
        lyricsText: lyricsText.trim(),
        format,
        template,
        autoSelect: true,
        artistName: 'Juan Rafael V.Z',
        titleFont,
      });
      router.replace({ pathname: '/video/[id]', params: { id: video.id } });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo generar el video.');
    } finally {
      setGenerating(false);
      setProgressMsg('');
    }
  };

  return (
    <Screen>
      <Header title="Crear Video Viral" showBack />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 140 }}>
        <View style={styles.heroBox}>
          <MaterialIcons name="auto-awesome" size={28} color={colors.accent} />
          <Text style={styles.heroTitle}>Video musical automático</Text>
          <Text style={styles.heroSub}>Subimos tu MP3, detectamos el momento más viral y montamos un vídeo cinematográfico con clips reales de Pexels que cuentan tu letra. Sin texto en pantalla.</Text>
        </View>

        <Text style={styles.section}>1. Título del video</Text>
        <TextInput
          value={title} onChangeText={setTitle} placeholder="Ej: Mi Gitana Morena"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.subsection}>Tipografía del título</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
          {TITLE_FONTS.map((f) => (
            <Pressable key={f.id} onPress={() => setTitleFont(f.id)} style={[styles.fontChip, titleFont === f.id && styles.fontChipActive]}>
              <Text style={[styles.fontChipPreview, { fontFamily: f.preview }, titleFont === f.id && { color: colors.accent }]}>Aa</Text>
              <Text style={[styles.fontChipLabel, titleFont === f.id && { color: colors.accent }]}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.section}>2. Letra de la canción</Text>
        <TextInput
          value={lyricsText} onChangeText={setLyricsText} placeholder="Pega aquí la letra (la usamos para elegir las imágenes)"
          placeholderTextColor={colors.textMuted} multiline
          style={[styles.input, { minHeight: 140, textAlignVertical: 'top' }]}
        />

        <Text style={styles.section}>3. Sube tu canción (MP3)</Text>
        <Pressable onPress={pickAudio} style={styles.dropzone}>
          <MaterialIcons name={audio ? 'audiotrack' : 'cloud-upload'} size={32} color={colors.accent} />
          <Text style={styles.dropText}>
            {audio ? audio.name : 'Toca para seleccionar un MP3'}
          </Text>
          {audio && audioDuration > 0 ? (
            <Text style={styles.dropMeta}>Duración: {formatTime(audioDuration)} • Detectaremos los 60s más virales</Text>
          ) : null}
        </Pressable>

        <Text style={styles.section}>4. Formato</Text>
        <View style={styles.formatRow}>
          <FormatChip label="Vertical 9:16" sub="TikTok / Reels" active={format === 'vertical'} onPress={() => setFormat('vertical')} icon="stay-current-portrait" />
          <FormatChip label="Horizontal 16:9" sub="YouTube" active={format === 'horizontal'} onPress={() => setFormat('horizontal')} icon="stay-current-landscape" />
        </View>

        <Text style={styles.section}>5. Estilo de color</Text>
        <View style={styles.tplGrid}>
          {templates.map((t) => (
            <Pressable key={t.id} onPress={() => setTemplate(t.id)} style={[styles.tpl, template === t.id && styles.tplActive]}>
              <LinearGradient
                colors={[`#${t.bgColorC}`, `#${t.bgColorA}`, `#${t.bgColorB}`] as unknown as [string, string, string]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.tplPreview}
              >
                <MaterialIcons name="movie" size={26} color={`#${t.accentColor}`} />
              </LinearGradient>
              <Text style={styles.tplName}>{t.name}</Text>
              <Text style={styles.tplDesc} numberOfLines={2}>{t.description}</Text>
            </Pressable>
          ))}
        </View>

        {generating || uploading ? (
          <View style={styles.progressBox}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.progressText}>{progressMsg}</Text>
            <Text style={styles.progressHint}>Subiendo → Pixabay (clips) → Renderizando</Text>
            <Text style={[styles.progressHint, { marginTop: 4, fontSize: 11, opacity: 0.7 }]}>Puede tardar 1-3 minutos</Text>
          </View>
        ) : null}

        <GradientButton
          title={generating ? 'Generando...' : 'Generar Video'}
          icon="movie-creation"
          onPress={onGenerate}
          loading={generating || uploading}
          style={{ marginTop: spacing.lg }}
        />
        <Text style={styles.disclaim}>
          La generación puede tardar entre 30 y 90 segundos. Sin texto, sin subtítulos: puro montaje musical 🔥
        </Text>
      </ScrollView>
    </Screen>
  );
}

function FormatChip({ label, sub, active, onPress, icon }: { label: string; sub: string; active: boolean; onPress: () => void; icon: any }) {
  return (
    <Pressable onPress={onPress} style={[styles.formatChip, active && styles.formatChipActive]}>
      <MaterialIcons name={icon} size={28} color={active ? colors.accent : colors.textSecondary} />
      <Text style={[styles.formatChipLabel, active && { color: colors.accent }]}>{label}</Text>
      <Text style={styles.formatChipSub}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroBox: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center', gap: 6 },
  heroTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800', marginTop: 2 },
  heroSub: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, textAlign: 'center' },
  section: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm, fontFamily: Platform.select({ default: fallbackFonts.serif, ios: fonts.heading, android: fonts.heading }) },
  subsection: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: spacing.sm, marginBottom: 4 },
  fontChip: { alignItems: 'center', justifyContent: 'center', minWidth: 84, paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, gap: 2 },
  fontChipActive: { borderColor: colors.accent, backgroundColor: colors.cardElevated },
  fontChipPreview: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' },
  fontChipLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  input: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, padding: spacing.md, fontSize: 15 },
  dropzone: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.accent, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: 6, backgroundColor: colors.card },
  dropText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  dropMeta: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' },
  formatRow: { flexDirection: 'row', gap: spacing.sm },
  formatChip: { flex: 1, alignItems: 'center', padding: spacing.md, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card },
  formatChipActive: { borderColor: colors.accent, backgroundColor: colors.cardElevated },
  formatChipLabel: { color: colors.textPrimary, fontWeight: '700', fontSize: 13, marginTop: 4 },
  formatChipSub: { color: colors.textMuted, fontSize: 11 },
  tplGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  tpl: { width: '48%', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.sm, borderWidth: 1.5, borderColor: colors.border, marginBottom: spacing.sm },
  tplActive: { borderColor: colors.accent },
  tplPreview: { height: 80, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  tplName: { color: colors.textPrimary, fontSize: 13, fontWeight: '700', marginTop: 6 },
  tplDesc: { color: colors.textMuted, fontSize: 11 },
  progressBox: { alignItems: 'center', marginTop: spacing.lg, padding: spacing.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  progressText: { color: colors.textPrimary, fontSize: 14, textAlign: 'center', fontWeight: '600' },
  progressHint: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
  disclaim: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: spacing.md, lineHeight: 18 },
});
