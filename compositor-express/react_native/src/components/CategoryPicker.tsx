import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props {
  label: string;
  value: string | null | undefined;
  options: string[];
  onChange: (v: string | null) => void;
  accent?: string;
}

export function CategoryPicker({ label, value, options, onChange, accent = colors.primary }: Props) {
  return (
    <View style={{ marginVertical: spacing.sm }}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {(options ?? []).map((opt) => {
          const selected = value === opt;
          return (
            <Pressable key={opt} onPress={() => onChange(selected ? null : opt)} style={[styles.chip, { borderColor: selected ? accent : colors.border, backgroundColor: selected ? accent + '22' : 'transparent' }]}>
              <Text style={[styles.chipText, { color: selected ? accent : colors.textSecondary }]}>{opt}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 6, marginLeft: 2, textTransform: 'uppercase', letterSpacing: 1 },
  row: { gap: 8, paddingVertical: 4, paddingRight: spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, marginRight: 8 },
  chipText: { fontSize: 14, fontWeight: '600' },
});
