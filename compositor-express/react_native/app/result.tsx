import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, Platform, Share } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { Header } from '../src/components/Header';
import { GradientButton } from '../src/components/GradientButton';
import { colors, fonts, fallbackFonts, radius, spacing } from '../src/theme';
import { LyricsAPI } from '../src/api';
import { useStore } from '../src/store';

export default function Result() {
  const { draft, setPendingAnalysis, clearDraft } = useStore();
  const [saving, setSaving] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);

  if (!draft) {
    return (
      <Screen>
        <Header title="Resultado" />
        <View style={styles.empty}><Text style={styles.emptyText}>No hay letra para mostrar.</Text></View>
      </Screen>
    );
  }

  const onSave = async () => {
    setSaving(true);
    try {
      const created = await LyricsAPI.create({
        title: draft.title,
        content: draft.content,
        originalIdea: draft.idea,
        theme: draft.theme ?? undefined,
        emotion: draft.emotion ?? undefined,
        style: draft.style ?? undefined,
      });
      clearDraft();
      router.replace(`/lyric/${created?.id ?? ''}`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar.');
    } finally { setSaving(false); }
  };

  const onAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await LyricsAPI.analyze({ content: draft.content });
      setPendingAnalysis({ content: draft.content, suggestions: res?.suggestions ?? [] });
      router.push('/analysis');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo analizar.');
    } finally { setAnalyzing(false); }
  };

  const onShare = async () => {
    try {
      const text = `${draft.title}\n\n${draft.content}`;
      if (Platform.OS === 'web') {
        if ((navigator as any)?.share) { await (navigator as any).share({ text, title: draft.title }); }
        else { try { await (navigator as any)?.clipboard?.writeText?.(text); Alert.alert('Copiado', 'Letra copiada al portapapeles.'); } catch {} }
      } else {
        await Share.share({ message: text, title: draft.title });
      }
    } catch {}
  };

  return (
    <Screen>
      <Header title="Resultado" />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}>
        <Text style={styles.title}>{draft.title}</Text>
        <View style={styles.card}>
          <Text style={styles.body}>{draft.content}</Text>
        </View>
        <View style={styles.row}>
          <GradientButton title="Analizar" icon="auto-fix-high" variant="outline" onPress={onAnalyze} loading={analyzing} style={{ flex: 1 }} />
          <GradientButton title="Compartir" icon="share" variant="outline" onPress={onShare} style={{ flex: 1 }} />
        </View>
        <GradientButton title="Guardar Letra" icon="save" onPress={onSave} loading={saving} style={{ marginTop: spacing.md }} />
        <GradientButton title="Regenerar" variant="ghost" icon="refresh" onPress={() => router.replace('/generator')} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: spacing.md, fontFamily: Platform.select({ ios: fonts.display, android: fonts.display, default: fallbackFonts.serif }) },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  body: { color: colors.textPrimary, fontSize: 17, lineHeight: 28 },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  emptyText: { color: colors.textSecondary },
});
