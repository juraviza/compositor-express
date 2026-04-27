import React from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { colors, fonts, fallbackFonts, radius, spacing, gradient } from '../theme';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface Props {
  title: string;
  onPress?: () => void;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'gradient' | 'outline' | 'ghost';
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}

export function GradientButton({ title, onPress, icon, loading, disabled, variant = 'gradient', style, small }: Props) {
  const handle = () => {
    if (loading || disabled) return;
    if (Platform.OS !== 'web') {
      try { Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light); } catch {}
    }
    onPress?.();
  };
  const innerHeight = small ? 40 : 52;
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const content = (
    <View style={[styles.inner, { height: innerHeight }]}>
      {loading ? (
        <ActivityIndicator color={isOutline || isGhost ? colors.accent : colors.textOnAccent} />
      ) : (
        <>
          {icon ? (
            <MaterialIcons
              name={icon}
              size={small ? 16 : 20}
              color={isOutline ? colors.accent : isGhost ? colors.textPrimary : colors.textOnAccent}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text style={[
            styles.text,
            { fontSize: small ? 14 : 16 },
            isOutline && { color: colors.accent },
            isGhost && { color: colors.textPrimary },
          ]}>{title}</Text>
        </>
      )}
    </View>
  );
  return (
    <Pressable onPress={handle} disabled={disabled || loading} style={({ pressed }) => [
      { opacity: disabled ? 0.5 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      style,
    ]} accessibilityRole="button" accessibilityLabel={title}>
      {variant === 'gradient' ? (
        <LinearGradient colors={gradient as unknown as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.outline, isGhost && styles.ghost]}>{content}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: { borderRadius: radius.lg },
  outline: { borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.accent, backgroundColor: 'transparent' },
  ghost: { borderColor: 'transparent' },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  text: { fontFamily: Platform.select({ ios: fonts.bodyBold, android: fonts.bodyBold, default: fallbackFonts.sans }), color: colors.textOnAccent, fontWeight: '700' },
});
