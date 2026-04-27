import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { Header } from '../src/components/Header';
import { GradientButton } from '../src/components/GradientButton';
import { CategoryPicker } from '../src/components/CategoryPicker';
import { colors, fonts, fallbackFonts, radius, spacing } from '../src/theme';
import { LyricsAPI } from '../src/api';
import { THEMES, EMOTIONS, STYLES } from '../src/categories';
import type { Lyric } from '../src/types';

export default function Editor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const lyricId = typeof id === 'string' ? id : '';
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [theme, setTheme] = React.useState<string | null>(null);
  const [emotion, setEmotion] = React.useState<string | null>(null);
  const [style, setStyle] = React.useState<string | null>(null);

  useFocusEffect(React.useCallback(() => {
    let active = true;
    if (!lyricId) return;
    setLoading(true);
    LyricsAPI.get(lyricId)
      .then((l: Lyric) => {
        if (!active) return;
        setTitle(l?.title ?? '');
        setContent(l?.content ?? '');
        setTheme(l?.theme ?? null);
        setEmotion(l?.emotion ?? null);
        setStyle(l?.style ?? null);
      })
      .catch((e) => Alert.alert('Error', e?.message ?? 'No se pudo cargar la letra.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [lyricId]));

  const onSave = async () => {
    if (!lyricId) return;
    if (!title.trim() || !content.trim()) { Alert.alert('Aviso', 'Título y contenido son requeridos.'); return; }
    setSaving(true);
    try {
      await LyricsAPI.update(lyricId, { title: title.trim(), content, theme: theme ?? undefined, emotion: emotion ?? undefined, style: style ?? undefined });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar.');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <Screen>
        <Header title="Editar" />
        <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Editar" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={20}>
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Título</Text>
          <TextInput value={title} onChangeText={setTitle} style={styles.titleInput} placeholder="Título de la letra" placeholderTextColor={colors.textMuted} />
          <CategoryPicker label="Tema" value={theme} options={THEMES} onChange={setTheme} accent={colors.primary} />
          <CategoryPicker label="Emoción" value={emotion} options={EMOTIONS} onChange={setEmotion} accent={colors.accent} />
          <CategoryPicker label="Estilo" value={style} options={STYLES} onChange={setStyle} accent={colors.textSecondary} />
          <Text style={styles.label}>Contenido</Text>
          <TextInput value={content} onChangeText={setContent} multiline style={styles.contentInput} textAlignVertical="top" placeholder="Versos de la letra" placeholderTextColor={colors.textMuted} />
          <View style={styles.actions}>
            <GradientButton title="Cancelar" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
            <GradientButton title="Guardar" icon="save" onPress={onSave} loading={saving} style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, marginTop: spacing.md },
  titleInput: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  contentInput: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, color: colors.textPrimary, minHeight: 240, fontSize: 16, lineHeight: 24, fontFamily: Platform.select({ default: fallbackFonts.sans }) },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
