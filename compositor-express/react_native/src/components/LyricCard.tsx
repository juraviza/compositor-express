import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing, fonts, fallbackFonts } from '../theme';
import type { Lyric } from '../types';
import { Platform } from 'react-native';

interface Props {
  lyric: Lyric;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  compact?: boolean;
}

function formatDate(d?: string) {
  if (!d) return '';
  try {
    const date = new Date(d);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

export const LyricCard = React.memo(function LyricCard({ lyric, onPress, onToggleFavorite, compact }: Props) {
  const preview = (lyric?.content ?? '').split('\n').filter(Boolean).slice(0, 2).join(' · ');
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, compact && styles.compact, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}>
      <View style={styles.headerRow}>
        <Text numberOfLines={1} style={styles.title}>{lyric?.title ?? 'Sin título'}</Text>
        {onToggleFavorite ? (
          <Pressable hitSlop={10} onPress={onToggleFavorite} accessibilityLabel="Favorito">
            <MaterialIcons name={lyric?.isFavorite ? 'favorite' : 'favorite-border'} size={22} color={lyric?.isFavorite ? colors.primary : colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      <Text numberOfLines={2} style={styles.preview}>{preview || '—'}</Text>
      <View style={styles.tagsRow}>
        {lyric?.theme ? <Tag label={lyric.theme} color={colors.primary} /> : null}
        {lyric?.emotion ? <Tag label={lyric.emotion} color={colors.accent} /> : null}
        {lyric?.style ? <Tag label={lyric.style} color={colors.textSecondary} /> : null}
        <View style={{ flex: 1 }} />
        <Text style={styles.date}>{formatDate(lyric?.createdAt)}</Text>
      </View>
    </Pressable>
  );
});

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.tag, { borderColor: color }]}>
      <Text style={[styles.tagText, { color }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  compact: { width: 240, marginRight: spacing.md, marginBottom: 0 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1, color: colors.textPrimary, fontSize: 18, fontFamily: Platform.select({ default: fallbackFonts.serif, ios: fonts.heading, android: fonts.heading }), fontWeight: '700', marginRight: spacing.sm },
  preview: { color: colors.textSecondary, marginTop: spacing.xs, fontSize: 14, lineHeight: 20 },
  tagsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, flexWrap: 'wrap', gap: 6 },
  tag: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 11, fontWeight: '600' },
  date: { color: colors.textMuted, fontSize: 11 },
});
