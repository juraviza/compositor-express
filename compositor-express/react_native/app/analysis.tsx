import React from 'react';
import { Alert, ActivityIndicator, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { Header } from '../src/components/Header';
import { GradientButton } from '../src/components/GradientButton';
import { HighlightedText } from '../src/components/HighlightedText';
import { SuggestionSheet } from '../src/components/SuggestionSheet';
import { colors, fonts, fallbackFonts, radius, spacing } from '../src/theme';
import { LyricsAPI, SuggestionsAPI } from '../src/api';
import { useStore } from '../src/store';
import type { Suggestion } from '../src/types';

export default function Analysis() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { pendingAnalysis, setPendingAnalysis } = useStore();
  const [loading, setLoading] = React.useState(false);
  const [content, setContent] = React.useState<string>(pendingAnalysis?.content ?? '');
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>(pendingAnalysis?.suggestions ?? []);
  const [active, setActive] = React.useState<Suggestion | null>(null);
  const [saving, setSaving] = React.useState(false);

  // If id present and no pending analysis -> fetch lyric and analyze
  React.useEffect(() => {
    let cancel = false;
    const run = async () => {
      if (id && !pendingAnalysis) {
        setLoading(true);
        try {
          const lyric = await LyricsAPI.get(id);
          if (cancel) return;
          const analysis = await LyricsAPI.analyze({ content: lyric?.content ?? '', lyricId: id });
          if (cancel) return;
          setContent(lyric?.content ?? '');
          setSuggestions(analysis?.suggestions ?? []);
        } catch (e: any) {
          Alert.alert('Error', e?.message ?? 'No se pudo analizar la letra.');
        } finally { if (!cancel) setLoading(false); }
      }
    };
    run();
    return () => { cancel = true; };
  }, [id]);

  const applySuggestion = async (alt: string) => {
    if (!active) return;
    const start = active.positionStart ?? 0;
    const end = active.positionEnd ?? start;
    const next = (content ?? '').slice(0, start) + alt + (content ?? '').slice(end);
    const delta = alt.length - (end - start);
    setContent(next);
    setSuggestions((prev) => prev.filter((s) => s !== active).map((s) => {
      if ((s?.positionStart ?? 0) >= end) {
        return { ...s, positionStart: (s.positionStart ?? 0) + delta, positionEnd: (s.positionEnd ?? 0) + delta };
      }
      return s;
    }));
    setActive(null);
    if (active.id) { try { await SuggestionsAPI.apply(active.id, alt); } catch {} }
  };

  const saveChanges = async () => {
    if (!id) {
      // No saved lyric, just go back
      setPendingAnalysis({ content, suggestions });
      router.back();
      return;
    }
    setSaving(true);
    try {
      await LyricsAPI.update(id, { content });
      Alert.alert('Guardado', 'Cambios aplicados a la letra.');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar.');
    } finally { setSaving(false); }
  };

  return (
    <Screen>
      <Header title="Análisis y Corrección" />
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /><Text style={styles.loadText}>Analizando con duende...</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 140 }}>
          {(suggestions?.length ?? 0) === 0 ? (
            <View style={styles.perfect}>
              <Text style={styles.perfectTitle}>¡Tu letra es perfecta!</Text>
              <Text style={styles.perfectMsg}>No se encontraron sugerencias. ¡Bravo!</Text>
            </View>
          ) : null}
          <View style={styles.card}>
            <HighlightedText content={content} suggestions={suggestions} onPressSuggestion={(s) => setActive(s)} />
          </View>
          <Text style={styles.hint}>Toca un fragmento resaltado para ver alternativas.</Text>
          <GradientButton title="Guardar Cambios" icon="check" onPress={saveChanges} loading={saving} style={{ marginTop: spacing.lg }} />
        </ScrollView>
      )}
      <SuggestionSheet visible={!!active} suggestion={active} onClose={() => setActive(null)} onApply={applySuggestion} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadText: { color: colors.textSecondary, fontStyle: 'italic' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  hint: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: spacing.md, fontStyle: 'italic' },
  perfect: { padding: spacing.lg, backgroundColor: colors.optional + '22', borderRadius: radius.lg, marginBottom: spacing.md, alignItems: 'center' },
  perfectTitle: { color: colors.optional, fontWeight: '800', fontSize: 18, fontFamily: Platform.select({ ios: fonts.heading, android: fonts.heading, default: fallbackFonts.serif }) },
  perfectMsg: { color: colors.textSecondary, marginTop: 4 },
});
