import { useCallback, useState } from 'react';
import { ScrollView, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Game, TEAM_LABELS } from '../../lib/types';
import { deleteFromHistory, getHistoryGame } from '../../lib/storage';
import { TARGET_SCORE } from '../../lib/scoring';
import { colors, fonts, radii, shadows } from '../../lib/theme';
import { HandLogRow } from '../../components/HandLogRow';
import { InlineConfirm } from '../../components/InlineConfirm';
import { ScalePressable } from '../../components/ScalePressable';
import { ScreenTransition } from '../../components/ScreenTransition';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [game, setGame] = useState<Game | null | undefined>(undefined);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (id) {
        getHistoryGame(id).then((g) => {
          if (!cancelled) setGame(g ?? null);
        });
      }
      return () => {
        cancelled = true;
      };
    }, [id])
  );

  if (game === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Laddar…</Text>
      </SafeAreaView>
    );
  }

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Matchen kunde inte hittas.</Text>
      </SafeAreaView>
    );
  }

  const onDelete = async () => {
    await deleteFromHistory(game.id);
    router.back();
  };

  const bannerLabel = game.winner
    ? `${TEAM_LABELS[game.winner]} vann · först till ${game.targetScore || TARGET_SCORE}`
    : 'Oavslutad match';
  const bannerBg = game.winner ? (game.winner === 'A' ? colors.successTint : colors.dangerTint) : colors.segmentTrack;
  const bannerFg = game.winner ? (game.winner === 'A' ? colors.feltGreen : colors.cardRed) : colors.muted;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenTransition style={styles.content}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreCol}>
              <Text style={[styles.colHeader, { color: colors.feltGreen }]}>{TEAM_LABELS.A}</Text>
              <Text style={styles.teamScore}>{game.totalA}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.scoreCol}>
              <Text style={[styles.colHeader, { color: colors.cardRed }]}>{TEAM_LABELS.B}</Text>
              <Text style={styles.teamScore}>{game.totalB}</Text>
            </View>
          </View>

          <View style={[styles.banner, { backgroundColor: bannerBg }]}>
            <Text style={[styles.bannerLabel, { color: bannerFg }]}>{bannerLabel}</Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Givhistorik ({game.hands.length})</Text>
            {game.hands.length === 0 ? (
              <Text style={styles.loading}>Inga givar registrerade.</Text>
            ) : (
              <View style={styles.table}>
                {[...game.hands].reverse().map((hand) => (
                  <HandLogRow key={hand.id} hand={hand} />
                ))}
              </View>
            )}
          </View>

          <View style={styles.deleteWrap}>
            {!confirmingDelete ? (
              <ScalePressable
                hitSlop={8}
                onPress={() => setConfirmingDelete(true)}
                accessibilityRole="button"
                accessibilityLabel="Ta bort match"
              >
                <Text style={styles.deleteLabel}>Ta bort match</Text>
              </ScalePressable>
            ) : (
              <InlineConfirm
                message="Går inte att ångra —"
                confirmLabel="Ta bort"
                onConfirm={onDelete}
                onCancel={() => setConfirmingDelete(false)}
              />
            )}
          </View>
        </ScreenTransition>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { color: colors.muted, textAlign: 'center', marginTop: 40, fontFamily: fonts.medium },
  scroll: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  content: { gap: 14 },
  scoreCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.cardLg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },
  scoreCol: { flex: 1, alignItems: 'center' },
  divider: { width: 1, height: 44, backgroundColor: colors.cardBorder },
  colHeader: { fontFamily: fonts.bold, fontSize: 13, letterSpacing: 2 },
  teamScore: { fontFamily: fonts.bold, fontSize: 40, lineHeight: 46, color: colors.ink, fontVariant: ['tabular-nums'] },
  banner: { borderRadius: 12, padding: 10, alignItems: 'center' },
  bannerLabel: { fontFamily: fonts.semibold, fontSize: 14 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink, marginHorizontal: 2, marginBottom: 10 },
  table: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.card,
    overflow: 'hidden',
    ...shadows.card,
  },
  deleteWrap: { alignItems: 'center' },
  deleteLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.cardRed,
    textDecorationLine: 'underline',
    padding: 10,
  },
});
