import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, LayoutAnimation, UIManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { colors, fonts, fallbackFonts, radius, spacing } from '../../src/theme';
import { SECTIONS } from '../../src/encyclopediaData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  try { UIManager.setLayoutAnimationEnabledExperimental(true); } catch {}
}

type TabKey = 'ejemplos' | 'vocabulario' | 'consejos' | 'estructura';
const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'ejemplos', label: 'Ejemplos', icon: 'auto-stories' },
  { key: 'vocabulario', label: 'Vocabulario', icon: 'menu-book' },
  { key: 'consejos', label: 'Consejos', icon: 'lightbulb' },
  { key: 'estructura', label: 'Estructura', icon: 'library-music' },
];

export default function Encyclopedia() {
  const [tab, setTab] = React.useState<TabKey>('ejemplos');
  const [open, setOpen] = React.useState<Record<string, boolean>>({});
  const toggle = (id: string) => {
    if (Platform.OS !== 'web') { try { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); } catch {} }
    setOpen((p) => ({ ...p, [id]: !p?.[id] }));
  };

  const visible = SECTIONS.filter((s) => {
    if (tab === 'ejemplos') return s.id === 'ejemplos' || s.id === 'temas' || s.id === 'inspiracion';
    if (tab === 'vocabulario') return s.id === 'vocabulario';
    if (tab === 'consejos') return s.id === 'consejos';
    if (tab === 'estructura') return s.id === 'estructura';
    return false;
  });

  return (
    <Screen>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <Text style={styles.title}>Enciclopedia</Text>
        <Text style={styles.sub}>Todo sobre Compositor Express</Text>
        <View style={styles.tabsRow}>
          {TABS.map((t) => {
            const sel = tab === t.key;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, sel && styles.tabSel]}>
                <MaterialIcons name={t.icon} size={18} color={sel ? colors.accent : colors.textSecondary} />
                <Text style={[styles.tabText, sel && { color: colors.accent }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}>
        {visible.map((s) => {
          const isOpen = !!open?.[s.id];
          return (
            <View key={s.id} style={styles.card}>
              <Pressable onPress={() => toggle(s.id)} style={styles.cardHeader} accessibilityRole="button">
                <MaterialIcons name={s.icon as any} size={22} color={colors.accent} />
                <Text style={styles.cardTitle}>{s.title}</Text>
                <MaterialIcons name={isOpen ? 'expand-less' : 'expand-more'} size={26} color={colors.textSecondary} />
              </Pressable>
              {isOpen ? (
                <View style={styles.cardBody}>
                  {s.intro ? <Text style={styles.intro}>{s.intro}</Text> : null}
                  {(s.body ?? []).map((b, i) => (
                    <View key={i} style={styles.bullet}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{b}</Text>
                    </View>
                  ))}
                  {(s.glossary ?? []).map((g, i) => (
                    <View key={i} style={styles.glossItem}>
                      <Text style={styles.term}>{g.term}</Text>
                      <Text style={styles.def}>{g.def}</Text>
                    </View>
                  ))}
                  {(s.tips ?? []).map((t, i) => (
                    <View key={i} style={styles.tip}>
                      <Text style={styles.tipNum}>{i + 1}</Text>
                      <Text style={styles.tipText}>{t}</Text>
                    </View>
                  ))}
                  {(s.examples ?? []).map((e, i) => (
                    <View key={i} style={styles.example}>
                      <Text style={styles.exTitle}>{e.title}</Text>
                      <Text style={styles.exContent}>{e.content}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800', fontFamily: Platform.select({ ios: fonts.display, android: fonts.display, default: fallbackFonts.serif }) },
  sub: { color: colors.textSecondary, fontSize: 13, marginBottom: spacing.md },
  tabsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: spacing.sm },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  tabSel: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  tabText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  cardTitle: { flex: 1, color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  cardBody: { padding: spacing.md, paddingTop: 0, gap: 8 },
  intro: { color: colors.textSecondary, fontStyle: 'italic', marginBottom: spacing.sm, lineHeight: 20 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginTop: 8 },
  bulletText: { color: colors.textPrimary, flex: 1, lineHeight: 22 },
  glossItem: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  term: { color: colors.accent, fontWeight: '700', fontSize: 15 },
  def: { color: colors.textPrimary, fontSize: 14, marginTop: 2 },
  tip: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginVertical: 6 },
  tipNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary, color: colors.textOnAccent, textAlign: 'center', lineHeight: 26, fontWeight: '800' },
  tipText: { color: colors.textPrimary, flex: 1, lineHeight: 22 },
  example: { backgroundColor: colors.bgSecondary, padding: spacing.md, borderRadius: radius.md, marginTop: 8 },
  exTitle: { color: colors.accent, fontWeight: '700', fontSize: 16, marginBottom: 6 },
  exContent: { color: colors.textPrimary, fontStyle: 'italic', lineHeight: 22 },
});
