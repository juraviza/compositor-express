import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { colors, spacing } from '../theme';

interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: any) { console.error('ErrorBoundary caught:', error, info); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.bgPrimary }} contentContainerStyle={styles.wrap}>
        <Text style={styles.title}>Algo salió mal</Text>
        <Text style={styles.msg}>{this.state.error?.message ?? 'Error desconocido'}</Text>
        <Text style={styles.stack}>{this.state.error?.stack ?? ''}</Text>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg },
  title: { color: colors.primary, fontSize: 20, fontWeight: '700', marginBottom: spacing.md },
  msg: { color: colors.textPrimary, marginBottom: spacing.md },
  stack: { color: colors.textMuted, fontSize: 11 },
});
