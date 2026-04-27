import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import { colors, fonts, fallbackFonts, spacing } from '../theme';

interface Props {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export function Header({ title, showBack = true, right }: Props) {
  return (
    <View style={styles.row}>
      {showBack ? (
        <Pressable hitSlop={12} onPress={() => { try { router.canGoBack() ? router.back() : router.replace('/tabs'); } catch { router.replace('/tabs'); } }} accessibilityLabel="Volver">
          <MaterialIcons name="arrow-back" size={26} color={colors.textPrimary} />
        </Pressable>
      ) : <View style={{ width: 26 }} />}
      <Text numberOfLines={1} style={styles.title}>{title}</Text>
      <View style={{ minWidth: 26, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  title: { flex: 1, color: colors.textPrimary, textAlign: 'center', fontSize: 20, fontWeight: '700', fontFamily: Platform.select({ ios: fonts.heading, android: fonts.heading, default: fallbackFonts.serif }) },
});
