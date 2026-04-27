import React from 'react';
import { ScrollView, StyleSheet, Text, View, RefreshControl, Pressable, Image } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { LyricCard } from '../../src/components/LyricCard';
import { GradientButton } from '../../src/components/GradientButton';
import { colors, gradient, radius, spacing } from '../../src/theme';
import { LyricsAPI } from '../../src/api';
import type { Lyric, Stats } from '../../src/types';

export default function Home() {
  const [recents, setRecents] = React.useState<Lyric[]>([]);
  const [stats, setStats] = React.useState<Stats>({ totalLyrics: 0, totalFavorites: 0 });
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [list, s] = await Promise.all([
        LyricsAPI.list({ limit: 5, page: 1 }).catch(() => ({ items: [] as Lyric[], total: 0, page: 1, totalPages: 1 })),
        LyricsAPI.stats().catch(() => ({ totalLyrics: 0, totalFavorites: 0 } as Stats)),
      ]);
      setRecents(list?.items ?? []);
      setStats(s ?? { totalLyrics: 0, totalFavorites: 0 });
    } finally { setLoading(false); }
  }, []);

  useFocusEffect(React.useCallback(() => { load(); }, [load]));

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent} />}
      >
        <View style={styles.headerRow}>
          <Image source={require('../../assets/compositor-express-logo.png')} style={styles.logoCenter} />
        </View>

        <Pressable onPress={() => router.push('/generator')} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
          <LinearGradient colors={gradient as unknown as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>Crea con IA</Text>
              <Text style={styles.heroTitle}>Generar Nueva Letra</Text>
              <Text style={styles.heroSub}>Compone con duende y pasión</Text>
            </View>
            <MaterialIcons name="auto-awesome" size={48} color={colors.textOnAccent} />
          </LinearGradient>
        </Pressable>

        <Pressable onPress={() => router.push('/video/create')} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }], marginTop: spacing.md }]}>
          <LinearGradient colors={['#8B0000', '#D72638', '#FFD700'] as unknown as [string, string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>Para tus canciones</Text>
              <Text style={styles.heroTitle}>Crear Video Viral</Text>
              <Text style={styles.heroSub}>Sube tu MP3 + letra · TikTok ready</Text>
            </View>
            <MaterialIcons name="movie-creation" size={48} color={colors.textOnAccent} />
          </LinearGradient>
        </Pressable>

        <View style={styles.statsRow}>
          <StatCard icon="library-music" label="Letras" value={stats?.totalLyrics ?? 0} />
          <StatCard icon="favorite" label="Favoritos" value={stats?.totalFavorites ?? 0} accent={colors.primary} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recientes</Text>
          <Pressable onPress={() => router.push('/tabs/my-lyrics')} hitSlop={8}>
            <Text style={styles.linkText}>Ver todas</Text>
          </Pressable>
        </View>
        {(recents?.length ?? 0) === 0 ? (
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyText}>Aún no hay letras. ¡Crea la primera!</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
            {(recents ?? []).map((l) => (
              <View key={l?.id} style={{ width: 240, marginRight: spacing.md }}>
                <LyricCard lyric={l} compact onPress={() => l?.id && router.push(`/lyric/${l.id}`)} />
              </View>
            ))}
          </ScrollView>
        )}

        <Pressable onPress={() => router.push('/tabs/encyclopedia')} style={({ pressed }) => [styles.encyCard, pressed && { opacity: 0.9 }]}>
          <MaterialIcons name="menu-book" size={36} color={colors.accent} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.encyTitle}>Enciclopedia</Text>
            <Text style={styles.encySub}>Aprende sobre Compositor Express</Text>
          </View>
          <MaterialIcons name="chevron-right" size={28} color={colors.textSecondary} />
        </Pressable>

        <GradientButton title="Generar con IA" icon="auto-awesome" onPress={() => router.push('/generator')} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </Screen>
  );
}

function StatCard({ icon, label, value, accent = colors.accent }: { icon: any; label: string; value: number; accent?: string }) {
  return (
    <View style={styles.stat}>
      <MaterialIcons name={icon} size={22} color={accent} />
      <Text style={[styles.statValue, { color: accent }]}>{value ?? 0}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, paddingVertical: spacing.sm },
  logoCenter: { width: 200, height: 80, resizeMode: 'contain' },
  hero: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.xl, padding: spacing.lg, minHeight: 120 },
  heroLabel: { color: colors.textOnAccent, fontSize: 12, fontWeight: '700', letterSpacing: 2, opacity: 0.8 },
  heroTitle: { color: colors.textOnAccent, fontSize: 22, fontWeight: '800', marginTop: 4 },
  heroSub: { color: colors.textOnAccent, fontSize: 13, marginTop: 4, opacity: 0.85 },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-start' },
  statValue: { fontSize: 26, fontWeight: '800', marginTop: 4 },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.sm },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  linkText: { color: colors.accent, fontWeight: '700' },
  emptyRecent: { padding: spacing.lg, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  emptyText: { color: colors.textSecondary },
  encyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginTop: spacing.lg },
  encyTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  encySub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
});
