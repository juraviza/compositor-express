import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { colors, spacing } from '../src/theme';

export default function NotFound() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Página no encontrada</Text>
      <Text style={styles.msg}>La ruta solicitada no existe.</Text>
      <Link href="/tabs" style={styles.link}>Volver al inicio</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.bgPrimary },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' },
  msg: { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
  link: { marginTop: spacing.lg, color: colors.accent, fontSize: 16, fontWeight: '700' },
});
