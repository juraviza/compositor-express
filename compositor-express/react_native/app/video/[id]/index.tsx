import React from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../../src/components/Screen';
import { Header } from '../../../src/components/Header';
import { GradientButton } from '../../../src/components/GradientButton';
import { colors, fonts, fallbackFonts, radius, spacing } from '../../../src/theme';
import { VideosAPI } from '../../../src/api';
import type { Video as Vid } from '../../../src/types';

export default function VideoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const videoId = typeof id === 'string' ? id : '';
  const [video, setVideo] = React.useState<Vid | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);
  const videoRef = React.useRef<Video>(null);

  const load = React.useCallback(async () => {
    if (!videoId) return;
    setLoading(true);
    try { const v = await VideosAPI.get(videoId); setVideo(v ?? null); }
    catch (e: any) { Alert.alert('Error', e?.message ?? 'No se pudo cargar.'); }
    finally { setLoading(false); }
  }, [videoId]);

  useFocusEffect(React.useCallback(() => { load(); }, [load]));

  // Poll every 5s while video is processing
  React.useEffect(() => {
    if (!video || video.status !== 'processing') return;
    const t = setInterval(() => {
      VideosAPI.get(videoId).then((v) => { if (v) setVideo(v); }).catch(() => {});
    }, 5000);
    return () => clearInterval(t);
  }, [video?.status, videoId]);

  const videoUrl = video?.videoUrl ?? null;

  const onShare = async () => {
    if (!videoUrl) return;
    const text = `¡Mira mi nuevo video en Compositor Express: "${video?.title}"!`;
    try {
      if (Platform.OS === 'web') {
        if ((navigator as any)?.share) await (navigator as any).share({ text, url: videoUrl, title: video?.title });
        else { await (navigator as any)?.clipboard?.writeText?.(videoUrl); Alert.alert('Copiado', 'Enlace del video copiado.'); }
      } else {
        await Share.share({ message: `${text}\n${videoUrl}`, url: videoUrl, title: video?.title });
      }
    } catch {}
  };

  const onDownload = async () => {
    if (!videoUrl) return;
    setDownloading(true);
    try {
      if (Platform.OS === 'web') {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `${video?.title || 'video'}.mp4`;
        a.target = '_blank';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      } else {
        const safeName = (video?.title || 'video').replace(/[^a-zA-Z0-9_-]/g, '_');
        const localUri = (FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '') + `${safeName}.mp4`;
        // Use FileSystem.downloadAsync (still functional in current expo-file-system)
        const { uri } = await (FileSystem as any).downloadAsync(videoUrl, localUri);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'video/mp4', dialogTitle: 'Guardar / Compartir video' });
        } else {
          Alert.alert('Descargado', `Guardado en ${uri}`);
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo descargar.');
    } finally {
      setDownloading(false);
    }
  };

  const onOpenTikTok = async () => {
    const url = Platform.OS === 'ios' ? 'tiktok://' : 'https://www.tiktok.com/upload';
    try { await Linking.openURL(url); } catch { Linking.openURL('https://www.tiktok.com/upload'); }
  };

  const onDelete = () => {
    if (!video?.id) return;
    const doDelete = async () => {
      try { await VideosAPI.remove(video.id); router.replace('/tabs/videos'); }
      catch (e: any) { Alert.alert('Error', e?.message ?? 'No se pudo eliminar.'); }
    };
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('¿Eliminar este video?')) doDelete();
    } else {
      Alert.alert('Eliminar video', '¿Seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const onGenerateAnother = async () => {
    if (!video?.audioPath) {
      Alert.alert('Error', 'No se puede regenerar sin audio.');
      return;
    }
    
    setRegenerating(true);
    try {
      const newVideo = await VideosAPI.generate({
        title: video.title ?? 'Video',
        audioPath: video.audioPath,
        lyricsText: video.lyricsText ?? '',
        format: video.format ?? 'vertical',
        template: video.template ?? 'pasion',
        autoSelect: true,
        artistName: 'Juan Rafael V.Z',
      });
      router.replace({ pathname: '/video/[id]', params: { id: newVideo.id } });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo generar el video.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading || !video) {
    return (
      <Screen>
        <Header title="Video" showBack />
        <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>
      </Screen>
    );
  }

  const isVertical = video.format === 'vertical';
  const aspect = isVertical ? 9 / 16 : 16 / 9;

  return (
    <Screen>
      <Header title={video.title || 'Video'} showBack />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 140 }}>
        <View style={[styles.playerWrap, { aspectRatio: aspect, alignSelf: 'center', maxWidth: isVertical ? 360 : '100%' }]}>
          {video.status === 'ready' && videoUrl ? (
            <Video
              key={videoUrl}
              ref={videoRef}
              source={{ uri: videoUrl }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              style={StyleSheet.absoluteFill}
              onError={(e: any) => Alert.alert('Reproducción', String(e ?? 'Error'))}
            />
          ) : video.status === 'failed' ? (
            <View style={styles.center}>
              <MaterialIcons name="error-outline" size={48} color={colors.critical} />
              <Text style={styles.errorText}>{video.errorMsg || 'Error al generar'}</Text>
            </View>
          ) : (
            <View style={styles.center}>
              <ActivityIndicator color={colors.accent} size="large" />
              <Text style={styles.processing}>🎬 Generando tu video con IA...</Text>
              <Text style={[styles.processing, { fontSize: 12, opacity: 0.7, marginTop: 4 }]}>Buscando clips + composición profesional{"\n"}Esto puede tardar 1-3 minutos</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          <Tag label={video.format === 'vertical' ? 'Vertical 9:16' : 'Horizontal 16:9'} color={colors.accent} />
          <Tag label={video.template} color={colors.primary} />
          <Tag label={`${Math.round(video.durationSec)}s`} color={colors.textSecondary} />
        </View>

        {video.status === 'ready' ? (
          <>
            <GradientButton title="Descargar Video" icon="file-download" onPress={onDownload} loading={downloading} style={{ marginTop: spacing.md }} />
            <View style={styles.shareRow}>
              <GradientButton title="Compartir" icon="share" variant="outline" onPress={onShare} style={{ flex: 1 }} />
              <GradientButton title="Subir a TikTok" icon="music-note" variant="outline" onPress={onOpenTikTok} style={{ flex: 1 }} />
            </View>
            <GradientButton title={regenerating ? 'Generando...' : 'Generar Otro Video'} icon="refresh" onPress={onGenerateAnother} loading={regenerating} variant="outline" style={{ marginTop: spacing.sm }} />
          </>
        ) : null}

        <GradientButton title="Eliminar" icon="delete" variant="ghost" onPress={onDelete} style={{ marginTop: spacing.md }} />

        <Text style={styles.section}>Letra</Text>
        <View style={styles.lyricsCard}><Text style={styles.lyricsText} selectable>{video.lyricsText}</Text></View>
      </ScrollView>
    </Screen>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return <View style={[styles.tag, { borderColor: color }]}><Text style={[styles.tagText, { color }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  playerWrap: { width: '100%', backgroundColor: '#000', borderRadius: radius.lg, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  processing: { color: colors.textPrimary, marginTop: 8 },
  errorText: { color: colors.critical, textAlign: 'center', padding: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.md, flexWrap: 'wrap' },
  tag: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '700' },
  shareRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  section: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm, fontFamily: Platform.select({ default: fallbackFonts.serif, ios: fonts.heading, android: fonts.heading }) },
  lyricsCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  lyricsText: { color: colors.textPrimary, fontSize: 15, lineHeight: 24 },
});
