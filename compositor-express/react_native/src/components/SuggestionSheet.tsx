import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { GradientButton } from './GradientButton';
import type { Suggestion } from '../types';

interface Props {
  visible: boolean;
  suggestion: Suggestion | null;
  onClose: () => void;
  onApply: (alternative: string) => void;
}

export function SuggestionSheet({ visible, suggestion, onClose, onApply }: Props) {
  const [selected, setSelected] = React.useState<string | null>(null);
  React.useEffect(() => { if (visible) setSelected(null); }, [visible, suggestion?.originalText]);
  const sevColor = suggestion?.severity === 'critical' ? colors.critical : suggestion?.severity === 'suggested' ? colors.suggested : colors.optional;
  const alts = suggestion?.suggestedTexts ?? [];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <View style={[styles.sevPill, { borderColor: sevColor }]}>
            <View style={[styles.sevDot, { backgroundColor: sevColor }]} />
            <Text style={[styles.sevText, { color: sevColor }]}>{suggestion?.severity ?? 'sugerido'}</Text>
          </View>
          <Pressable hitSlop={12} onPress={onClose} accessibilityLabel="Cerrar">
            <MaterialIcons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
        <Text style={styles.section}>Texto original</Text>
        <Text style={styles.original}>“{suggestion?.originalText ?? ''}”</Text>
        <Text style={styles.section}>Razón</Text>
        <Text style={styles.reason}>{suggestion?.reason ?? '—'}</Text>
        <Text style={styles.section}>Alternativas</Text>
        <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ paddingBottom: spacing.sm }}>
          {alts.length === 0 ? (
            <Text style={styles.empty}>Sin alternativas disponibles.</Text>
          ) : alts.map((alt, i) => {
            const sel = selected === alt;
            return (
              <Pressable key={`${i}-${alt}`} onPress={() => setSelected(alt)} style={[styles.altCard, sel && { borderColor: colors.accent, backgroundColor: colors.accent + '15' }]}>
                <MaterialIcons name={sel ? 'radio-button-checked' : 'radio-button-unchecked'} size={20} color={sel ? colors.accent : colors.textSecondary} />
                <Text style={styles.altText}>{alt}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.actions}>
          <GradientButton title="Ignorar" variant="outline" onPress={onClose} style={{ flex: 1 }} />
          <GradientButton title="Aplicar" onPress={() => selected && onApply(selected)} disabled={!selected} style={{ flex: 1 }} icon="check" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.bgSecondary, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: spacing.xl, borderTopWidth: 1, borderColor: colors.border, maxHeight: '85%' },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sevPill: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, gap: 6 },
  sevDot: { width: 8, height: 8, borderRadius: 4 },
  sevText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  section: { color: colors.textSecondary, fontSize: 12, marginTop: spacing.md, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  original: { color: colors.textPrimary, fontStyle: 'italic', fontSize: 16 },
  reason: { color: colors.textPrimary, fontSize: 14, lineHeight: 20 },
  altCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginVertical: 4, gap: 10 },
  altText: { color: colors.textPrimary, flex: 1, fontSize: 15 },
  empty: { color: colors.textSecondary, fontStyle: 'italic', padding: spacing.md, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
