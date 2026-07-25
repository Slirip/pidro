import { useCallback, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { Game, TEAM_LABELS } from '../../lib/types';
import { getHistory } from '../../lib/storage';
import { colors, fonts, motion, radii, shadows } from '../../lib/theme';
import { ScalePressable } from '../../components/ScalePressable';
import { ScreenTransition } from '../../components/ScreenTransition';

export default function HistoryScreen() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getHistory().then((list) => {
        if (!cancelled) {
          setGames(list);
          setLoaded(true);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenTransition>
        <Text style={styles.title}>Historik</Text>

        {loaded && games.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyGlyph}>♠ ♥</Text>
            <Text style={styles.emptyText}>Inga sparade matcher än.</Text>
          </View>
        )}

        <FlatList
          data={games}
          keyExtractor={(g) => g.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <HistoryCard game={item} onPress={() => router.push(`/history/${item.id}`)} />}
        />
      </ScreenTransition>
    </SafeAreaView>
  );
}

function HistoryCard({ game, onPress }: { game: Game; onPress: () => void }) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(reducedMotion ? 1 : 0);
  const translateX = useSharedValue(reducedMotion ? 0 : -8);

  useEffect(() => {
    if (reducedMotion) return;
    opacity.value = withTiming(1, { duration: motion.screenIn });
    translateX.value = withTiming(0, { duration: motion.screenIn });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const date = new Date(game.finishedAt ?? game.createdAt);
  const dateLabel = date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });
  const pillLabel = game.winner ? `${TEAM_LABELS[game.winner]} vann` : 'Oavslutad';
  const pillBg = game.winner ? (game.winner === 'A' ? colors.successTint : colors.dangerTint) : colors.segmentTrack;
  const pillFg = game.winner ? (game.winner === 'A' ? colors.feltGreen : colors.cardRed) : colors.muted;

  return (
    <ScalePressable
      style={[styles.card, animatedStyle]}
      activeScale={0.98}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Match ${dateLabel}`}
    >
      <View style={styles.cardLeft}>
        <Text style={styles.dateLabel}>{dateLabel}</Text>
        <View style={[styles.pill, { backgroundColor: pillBg }]}>
          <Text style={[styles.pillLabel, { color: pillFg }]}>{pillLabel}</Text>
        </View>
      </View>
      <Text style={styles.score}>
        <Text style={{ color: colors.feltGreen }}>{game.totalA}</Text>
        <Text style={{ color: colors.dash }}> – </Text>
        <Text style={{ color: colors.cardRed }}>{game.totalB}</Text>
      </Text>
      <Text style={styles.chevron}>›</Text>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.ink, marginHorizontal: 20, marginTop: 20, marginBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  emptyWrap: { alignItems: 'center', marginTop: 90, gap: 14 },
  emptyGlyph: { fontSize: 28, color: colors.soft },
  emptyText: { fontFamily: fonts.medium, fontSize: 15, color: colors.muted },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    ...shadows.card,
  },
  cardLeft: { flex: 1, gap: 6 },
  dateLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  pillLabel: { fontFamily: fonts.bold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.4 },
  score: { fontFamily: fonts.bold, fontSize: 24, fontVariant: ['tabular-nums'] },
  chevron: { color: colors.soft, fontSize: 20 },
});
