import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { colors, radius } from '../theme';
import type { Suggestion, Severity } from '../types';

interface Props {
  content: string;
  suggestions: Suggestion[];
  onPressSuggestion?: (s: Suggestion, index: number) => void;
}

function sevColor(sev: Severity) {
  if (sev === 'critical') return colors.critical;
  if (sev === 'suggested') return colors.suggested;
  return colors.optional;
}

type Segment = { text: string; suggestion?: Suggestion; sIndex?: number };

export function HighlightedText({ content, suggestions, onPressSuggestion }: Props) {
  const safe = content ?? '';
  const sorted = [...(suggestions ?? [])]
    .filter((s) => s && typeof s.positionStart === 'number' && typeof s.positionEnd === 'number' && s.positionStart < s.positionEnd)
    .sort((a, b) => (a?.positionStart ?? 0) - (b?.positionStart ?? 0));

  const segments: Segment[] = [];
  let cursor = 0;
  sorted.forEach((s, i) => {
    const start = Math.max(0, Math.min(safe.length, s.positionStart));
    const end = Math.max(start, Math.min(safe.length, s.positionEnd));
    if (start > cursor) segments.push({ text: safe.slice(cursor, start) });
    if (end > start) segments.push({ text: safe.slice(start, end), suggestion: s, sIndex: i });
    cursor = end;
  });
  if (cursor < safe.length) segments.push({ text: safe.slice(cursor) });
  if (segments.length === 0) segments.push({ text: safe });

  return (
    <View>
      <Text style={styles.body} selectable>
        {segments.map((seg, idx) => {
          if (!seg.suggestion) return <Text key={idx}>{seg.text}</Text>;
          const c = sevColor(seg.suggestion.severity);
          return (
            <Text
              key={idx}
              onPress={() => onPressSuggestion?.(seg.suggestion as Suggestion, seg.sIndex ?? 0)}
              style={{ backgroundColor: c + '33', color: colors.textPrimary, borderRadius: radius.sm }}
            >
              {seg.text}
            </Text>
          );
        })}
      </Text>
      {sorted.length > 0 ? (
        <View style={styles.legend}>
          <Legend color={colors.critical} label="Crítico" />
          <Legend color={colors.suggested} label="Sugerido" />
          <Legend color={colors.optional} label="Opcional" />
        </View>
      ) : null}
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.textPrimary, fontSize: 17, lineHeight: 28 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: colors.textSecondary, fontSize: 12 },
});
