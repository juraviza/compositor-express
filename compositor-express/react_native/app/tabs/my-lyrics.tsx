import React from 'react';
import { FlatList, StyleSheet, Text, View, RefreshControl, Pressable, ScrollView } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { LyricCard } from '../../src/components/LyricCard';
import { SearchBar } from '../../src/components/SearchBar';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, fonts, fallbackFonts, radius, spacing } from '../../src/theme';
import { LyricsAPI } from '../../src/api';
import type { Lyric } from '../../src/types';
import { THEMES, EMOTIONS, STYLES } from '../../src/categories';

type FilterKey = 'all' | 'favorites' | string;

export default function MyLyrics() {
  const [items, setItems] = React.useState<Lyric[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<FilterKey>('all');

  const params = React.useMemo(() => {
    const p: Record<string, any> = { limit: 100, page: 1 };
    if (search) p.search = search;
    if (filter === 'favorites') p.isFavorite = true;
    else if (THEMES.includes(filter)) p.theme = filter;
    else if (EMOTIONS.includes(filter)) p.emotion = filter;
    else if (STYLES.includes(filter)) p.style = filter;
    return p;
  }, [search, filter]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await LyricsAPI.list(params).catch(() => ({ items: [] as Lyric[], total: 0, page: 1, totalPages: 1 }));
      setItems(list?.items ?? []);
    } finally { setLoading(false); }
  }, [params]);

  useFocusEffect(React.useCallback(() => { load(); }, [load]));

  const toggleFav = async (l: Lyric) => {
    if (!l?.id) return;
    setItems((prev) => prev.map((x) => x?.id === l.id ? { ...x, isFavorite: !x.isFavorite } : x));
    try { await LyricsAPI.toggleFavorite(l.id, !l.isFavorite); } catch { load(); }
  };

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'favorites', label: 'Favoritos' },
    ...THEMES.map((t) => ({ key: t, label: t })),
    ...EMOTIONS.map((t) => ({ key: t, label: t })),
    ...STYLES.map((t) => ({ key: t, label: t })),
  ];

  return (
    <Screen>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <Text style={styles.title}>Mis Letras</Text>
        <SearchBar value={search} onChangeText={setSearch} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((f) => {
            const sel = filter === f.key;
            return (
              <Pressable key={f.key} onPress={() => setFilter(f.key)} style={[styles.chip, sel && styles.chipSel]}>
                <Text style={[styles.chipText, sel && styles.chipTextSel]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <FlatList
        data={items ?? []}
        keyExtractor={(it) => it?.id ?? Math.random().toString()}
        renderItem={({ item }) => (
          <LyricCard lyric={item} onPress={() => item?.id && router.push(`/lyric/${item.id}`)} onToggleFavorite={() => toggleFav(item)} />
        )}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent} />}
        ListEmptyComponent={!loading ? (
          <EmptyState icon="music-note" title="Aún no tienes letras" message="¡Crea tu primera letra en Compositor Express!" ctaLabel="Crear Letra" onCta={() => router.push('/generator')} />
        ) : null}
      />
      <Pressable onPress={() => router.push('/generator')} style={styles.fab} accessibilityLabel="Nueva letra">
        <MaterialIcons name="add" size={28} color={colors.textOnAccent} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800', marginBottom: spacing.md, fontFamily: Platform.select({ ios: fonts.display, android: fonts.display, default: fallbackFonts.serif }) },
  filters: { gap: 8, paddingVertical: spacing.sm, paddingRight: spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, marginRight: 6 },
  chipSel: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextSel: { color: colors.accent },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.xl + 60, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
});
