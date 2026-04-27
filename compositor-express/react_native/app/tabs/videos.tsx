import React from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../src/components/Screen';
import { Header } from '../../src/components/Header';
import { GradientButton } from '../../src/components/GradientButton';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, fonts, fallbackFonts, radius, spacing } from '../../src/theme';
import { VideosAPI } from '../../src/api';
import type { Video } from '../../src/types';

export default function VideosTab() {
  const [items, setItems] = React.useState<Video[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try { setItems(await VideosAPI.list()); } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(React.useCallback(() => { load(); }, [load]));

  return (
    <Screen>
      <Header title="Mis Videos" />
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent} />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>
          ) : (
            <EmptyState
              icon="movie-creation"
              title="Sin videos aún"
              message="Crea tu primer video viral desde una de tus letras."
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: '/video/[id]', params: { id: item.id } })} style={styles.card}>
            <LinearGradient
              colors={['#241519', '#3A1F25'] as unknown as [string, string]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.thumb}
            >
              <MaterialIcons name="play-circle" size={42} color={colors.accent} />
              <Text style={styles.thumbLabel}>{item.format === 'vertical' ? '9:16' : '16:9'}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.template} · {Math.round(item.durationSec)}s · {new Date(item.createdAt).toLocaleDateString('es-ES')}
              </Text>
              <View style={[styles.statusPill, item.status === 'ready' ? styles.ready : item.status === 'failed' ? styles.failed : styles.processing]}>
                <Text style={styles.statusText}>{item.status === 'ready' ? 'Listo' : item.status === 'failed' ? 'Falló' : 'Procesando'}</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListHeaderComponent={
          <GradientButton
            title="Crear Nuevo Video"
            icon="add-circle-outline"
            onPress={() => router.push('/video/create')}
            style={{ marginBottom: spacing.md }}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { padding: spacing.xl, alignItems: 'center' },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  thumb: { width: 110, height: 80, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  thumbLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 2, fontWeight: '700' },
  title: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', fontFamily: Platform.select({ default: fallbackFonts.serif, ios: fonts.heading, android: fonts.heading }) },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, marginTop: 6 },
  ready: { backgroundColor: 'rgba(16,185,129,0.18)' },
  failed: { backgroundColor: 'rgba(239,68,68,0.18)' },
  processing: { backgroundColor: 'rgba(212,160,23,0.18)' },
  statusText: { color: colors.textPrimary, fontSize: 11, fontWeight: '700' },
});
