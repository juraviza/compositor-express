import React from 'react';
import { Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { GradientButton } from '../../src/components/GradientButton';
import { colors, fonts, fallbackFonts, radius, spacing } from '../../src/theme';
import { LyricsAPI } from '../../src/api';
import { useStore } from '../../src/store';
import type { Lyric } from '../../src/types';

export default function LyricDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lyricId = typeof id === 'string' ? id : '';
  const [lyric, setLyric] = React.useState<Lyric | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { setPendingAnalysis } = useStore();

  const load = React.useCallback(async () => {
    if (!lyricId) return;
    setLoading(true);
    try { const l = await LyricsAPI.get(lyricId); setLyric(l ?? null); }
    catch (e: any) { Alert.alert('Error', e?.message ?? 'No se pudo cargar.'); }
    finally { setLoading(false); }
  }, [lyricId]);

  useFocusEffect(React.useCallback(() => { load(); }, [load]));

  const toggleFav = async () => {
    if (!lyric?.id) return;
    const next = !lyric.isFavorite;
    setLyric((l) => l ? { ...l, isFavorite: next } : l);
    try { await LyricsAPI.toggleFavorite(lyric.id, next); } catch { load(); }
  };

  const onShare = async () => {
    if (!lyric) return;
    const text = `${lyric.title}\n\n${lyric.content}`;
    try {
      if (Platform.OS === 'web') {
        if ((navigator as any)?.share) await (navigator as any).share({ text, title: lyric.title });
        else { await (navigator as any)?.clipboard?.writeText?.(text); Alert.alert('Copiado', 'Letra copiada.'); }
      } else {
        await Share.share({ message: text, title: lyric.title });
      }
    } catch {}
  };

  const onDelete = () => {
    if (!lyric?.id) return;
    const doDelete = async () => {
      try { await LyricsAPI.remove(lyric.id); router.replace('/tabs/my-lyrics'); }
      catch (e: any) { Alert.alert('Error', e?.message ?? 'No se pudo eliminar.'); }
    };
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('¿Eliminar esta letra?')) doDelete();
    } else {
      Alert.alert('Eliminar letra', '¿Seguro que deseas eliminarla?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const onAnalyze = () => {
    if (!lyric) return;
    setPendingAnalysis(null);
    router.push({ pathname: '/analysis', params: { id: lyric.id } });
  };

  const onEdit = () => { if (lyric?.id) router.push({ pathname: '/editor', params: { id: lyric.id } }); };

  if (loading || !lyric) {
    return (
      <Screen>
        <Header title="Letra" />
        <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Letra" right={
        <Pressable hitSlop={10} onPress={toggleFav} accessibilityLabel="Favorito">
          <MaterialIcons name={lyric.isFavorite ? 'favorite' : 'favorite-border'} size={26} color={lyric.isFavorite ? colors.primary : colors.textSecondary} />
        </Pressable>
      } />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 140 }}>
        <Text style={styles.title}>{lyric.title ?? 'Sin título'}</Text>
        <View style={styles.tagsRow}>
          {lyric.theme ? <Tag label={lyric.theme} color={colors.primary} /> : null}
          {lyric.emotion ? <Tag label={lyric.emotion} color={colors.accent} /> : null}
          {lyric.style ? <Tag label={lyric.style} color={colors.textSecondary} /> : null}
        </View>
        <View style={styles.card}>
          <Text style={styles.body} selectable>{lyric.content}</Text>
        </View>
        <Text style={styles.meta}>Creada: {new Date(lyric.createdAt).toLocaleString('es-ES')}</Text>

        <View style={styles.actionRow}>
          <GradientButton title="Editar" icon="edit" variant="outline" onPress={onEdit} style={{ flex: 1 }} />
          <GradientButton title="Analizar" icon="auto-fix-high" variant="outline" onPress={onAnalyze} style={{ flex: 1 }} />
        </View>
        <GradientButton
          title="Crear Video Viral"
          icon="movie-creation"
          onPress={() => router.push({ pathname: '/video/create', params: { lyricId: lyric.id } })}
          style={{ marginTop: spacing.md }}
        />
        <GradientButton title="Compartir" icon="share" variant="outline" onPress={onShare} style={{ marginTop: spacing.sm }} />
        <GradientButton title="Eliminar" icon="delete" variant="ghost" onPress={onDelete} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </Screen>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return <View style={[styles.tag, { borderColor: color }]}><Text style={[styles.tagText, { color }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800', textAlign: 'center', fontFamily: Platform.select({ ios: fonts.display, android: fonts.display, default: fallbackFonts.serif }) },
  tagsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: spacing.md, flexWrap: 'wrap' },
  tag: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  body: { color: colors.textPrimary, fontSize: 17, lineHeight: 28 },
  meta: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: spacing.md },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
