import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

interface Props { children: React.ReactNode; style?: StyleProp<ViewStyle>; edges?: ('top' | 'bottom' | 'left' | 'right')[] }

export function Screen({ children, style, edges = ['top'] }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.bgPrimary, colors.bgSecondary, colors.bgPrimary]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={edges} style={[styles.safe, style]}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPrimary },
  safe: { flex: 1 },
});
