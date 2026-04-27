import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { GradientButton } from './GradientButton';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface Props {
  icon?: IconName;
  title: string;
  message?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon = 'music-note', title, message, ctaLabel, onCta }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconBox}>
        <MaterialIcons name={icon} size={48} color={colors.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.msg}>{message}</Text> : null}
      {ctaLabel && onCta ? (
        <GradientButton title={ctaLabel} onPress={onCta} icon="add" style={{ marginTop: spacing.md }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconBox: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  msg: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 6, paddingHorizontal: spacing.md },
});
