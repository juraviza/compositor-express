import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { GradientButton } from '../../src/components/GradientButton';
import { CategoryPicker } from '../../src/components/CategoryPicker';
import { colors, fonts, fallbackFonts, radius, spacing } from '../../src/theme';
import { THEMES, EMOTIONS, STYLES } from '../../src/categories';
import { LyricsAPI } from '../../src/api';
import { useStore } from '../../src/store';

export default function GeneratorScreen() {
  const [idea, setIdea] = React.useState('');
  const [theme, setTheme] = React.useState<string | null>(null);
  const [emotion, setEmotion] = React.useState<string | null>(null);
  const [style, setStyle] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { setDraft } = useStore();

  const onGenerate = async () => {
    if (!idea.trim()) { setError('Escribe una idea o tema para tu letra.'); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await LyricsAPI.generate({
        idea: idea.trim(),
        theme: theme ?? undefined,
        emotion: emotion ?? undefined,
        style: style ?? undefined,
      });
      setDraft({
        title: res?.title ?? 'Sin título',
        content: res?.content ?? '',
        idea: idea.trim(),
        theme, emotion, style,
      });
      router.push('/result');
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo generar la letra.');
    } finally { setLoading(false); }
  };

  return (
    <Screen>
      <Header title="Crear Letra" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={20}>
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Tu idea o tema</Text>
          <TextInput
            value={idea}
            onChangeText={setIdea}
            placeholder="Ej: El amor de un verano andaluz..."
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.input}
            textAlignVertical="top"
          />

          <CategoryPicker label="Tema" value={theme} options={THEMES} onChange={setTheme} accent={colors.primary} />
          <CategoryPicker label="Emoción" value={emotion} options={EMOTIONS} onChange={setEmotion} accent={colors.accent} />
          <CategoryPicker label="Estilo" value={style} options={STYLES} onChange={setStyle} accent={colors.textSecondary} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <GradientButton title={loading ? 'Componiendo tu letra...' : 'Generar con IA'} icon="auto-awesome" onPress={onGenerate} loading={loading} style={{ marginTop: spacing.lg }} />
          {loading ? <Text style={styles.loadingHint}>Esto puede tomar unos segundos. La IA está sintiendo el duende...</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  input: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, color: colors.textPrimary, minHeight: 110, fontSize: 16, lineHeight: 22, fontFamily: Platform.select({ default: fallbackFonts.sans }) },
  error: { color: colors.critical, marginTop: spacing.md, textAlign: 'center' },
  loadingHint: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, fontStyle: 'italic' },
});
