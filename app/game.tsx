import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Game, TEAM_LABELS, TeamId } from '../lib/types';
import { computeHandResult, MAX_BID, MIN_BID, TARGET_SCORE, TOTAL_POINTS } from '../lib/scoring';
import { addToHistory, clearActiveGame, generateId, getActiveGame, saveActiveGame } from '../lib/storage';
import { colors, fonts, motion, radii, shadows } from '../lib/theme';
import { Header } from '../components/Header';
import { Scoreboard } from '../components/Scoreboard';
import { TeamSegment } from '../components/TeamSegment';
import { BidChips } from '../components/BidChips';
import { PointsWheelPair } from '../components/PointsWheelPair';
import { HandLogRow } from '../components/HandLogRow';
import { InlineConfirm } from '../components/InlineConfirm';
import { WinOverlay } from '../components/WinOverlay';
import { SavedToast } from '../components/SavedToast';
import { ScalePressable } from '../components/ScalePressable';
import { ScreenTransition } from '../components/ScreenTransition';

type Flash = { key: number; delta: number } | null;
type Confirming = 'undo' | 'abandon' | null;
type WinState = { team: TeamId; a: number; b: number } | null;

export default function GameScreen() {
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [biddingTeam, setBiddingTeam] = useState<TeamId | null>(null);
  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [d14, setD14] = useState(false);
  const [pts, setPts] = useState(0);
  const [flashA, setFlashA] = useState<Flash>(null);
  const [flashB, setFlashB] = useState<Flash>(null);
  const [confirming, setConfirming] = useState<Confirming>(null);
  const [win, setWin] = useState<WinState>(null);
  const [wheelActive, setWheelActive] = useState(false);
  const [savedToast, setSavedToast] = useState<number | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const winTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getActiveGame().then((g) => {
        if (!cancelled) {
          if (!g) {
            router.replace('/');
          } else {
            setGame(g);
          }
        }
      });
      return () => {
        cancelled = true;
      };
    }, [router])
  );

  useEffect(() => {
    return () => {
      clearTimeout(flashTimer.current);
      clearTimeout(winTimer.current);
      clearTimeout(toastTimer.current);
    };
  }, []);

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Laddar…</Text>
      </SafeAreaView>
    );
  }

  const resetHandForm = () => {
    setBiddingTeam(null);
    setBidAmount(null);
    setD14(false);
    setPts(0);
  };

  const flash = (dA: number, dB: number) => {
    const key = Date.now();
    setFlashA(dA !== 0 ? { key, delta: dA } : null);
    setFlashB(dB !== 0 ? { key: key + 1, delta: dB } : null);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => {
      setFlashA(null);
      setFlashB(null);
    }, 1400);
  };

  const saveHand = async () => {
    if (game.winner || !biddingTeam || bidAmount == null) return;

    const otherTeamPoints = TOTAL_POINTS - pts;
    const pointsA = biddingTeam === 'A' ? pts : otherTeamPoints;
    const pointsB = biddingTeam === 'A' ? otherTeamPoints : pts;

    const outcome = computeHandResult({
      biddingTeam,
      bidAmount,
      dealerFourteenOverFourteen: d14,
      pointsA,
      pointsB,
      currentTotalA: game.totalA,
      currentTotalB: game.totalB,
      handNumber: game.hands.length + 1,
    });

    const updatedGame: Game = {
      ...game,
      hands: [...game.hands, outcome.record],
      totalA: outcome.record.runningTotalA,
      totalB: outcome.record.runningTotalB,
    };

    flash(outcome.record.scoreDeltaA, outcome.record.scoreDeltaB);

    setSavedToast(Date.now());
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setSavedToast(null), motion.chipFloat);

    scrollRef.current?.scrollTo({ y: 0, animated: true });

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    if (outcome.winner) {
      updatedGame.winner = outcome.winner;
      updatedGame.finishedAt = Date.now();
      await addToHistory(updatedGame);
      await clearActiveGame();
      setGame(updatedGame);
      resetHandForm();
      winTimer.current = setTimeout(() => {
        setWin({ team: outcome.winner as TeamId, a: updatedGame.totalA, b: updatedGame.totalB });
      }, 950);
      return;
    }

    await saveActiveGame(updatedGame);
    setGame(updatedGame);
    resetHandForm();
  };

  const doUndo = async () => {
    const hands = game.hands.slice(0, -1);
    const last = hands[hands.length - 1];
    const updatedGame: Game = {
      ...game,
      hands,
      totalA: last ? last.runningTotalA : 0,
      totalB: last ? last.runningTotalB : 0,
    };
    await saveActiveGame(updatedGame);
    setGame(updatedGame);
    setConfirming(null);
  };

  const doAbandon = async () => {
    const finished: Game = { ...game, finishedAt: Date.now() };
    await addToHistory(finished);
    await clearActiveGame();
    router.replace('/');
  };

  const winNewGame = async () => {
    const newGame: Game = {
      id: generateId(),
      createdAt: Date.now(),
      targetScore: TARGET_SCORE,
      hands: [],
      totalA: 0,
      totalB: 0,
    };
    await saveActiveGame(newGame);
    setGame(newGame);
    setWin(null);
    resetHandForm();
  };

  const winGoHome = () => {
    setWin(null);
    router.replace('/');
  };

  const handNo = game.hands.length + 1;
  const canSave = !game.winner && !!biddingTeam && bidAmount != null;
  const teamColor = biddingTeam === 'B' ? colors.cardRed : colors.feltGreen;
  const pointsA = biddingTeam === 'B' ? TOTAL_POINTS - pts : pts;
  const pointsB = biddingTeam === 'B' ? pts : TOTAL_POINTS - pts;
  const onChangePointsA = (v: number) => setPts(biddingTeam === 'B' ? TOTAL_POINTS - v : v);
  const onChangePointsB = (v: number) => setPts(biddingTeam === 'B' ? v : TOTAL_POINTS - v);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ header: () => <Header showBack onBack={() => router.back()} rightPill={`Giv ${handNo}`} /> }} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} scrollEnabled={!wheelActive}>
        <ScreenTransition>
          <Scoreboard
            nameA={TEAM_LABELS.A}
            nameB={TEAM_LABELS.B}
            totalA={game.totalA}
            totalB={game.totalB}
            target={TARGET_SCORE}
            flashA={flashA}
            flashB={flashB}
          />

          <View style={styles.formCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Vem bjöd?</Text>
              <Text style={styles.sectionTitleMuted}>Giv {handNo}</Text>
            </View>
            <TeamSegment value={biddingTeam} onChange={setBiddingTeam} nameA={TEAM_LABELS.A} nameB={TEAM_LABELS.B} />

            <DimmedSection active={!!biddingTeam}>
              <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Bud</Text>
              <View style={{ marginTop: 10 }}>
                <BidChips
                  value={bidAmount}
                  onChange={(n) => {
                    setBidAmount(n);
                    setD14(n === 14 ? d14 : false);
                  }}
                  min={MIN_BID}
                  max={MAX_BID}
                  teamColor={teamColor}
                />
              </View>

              {bidAmount === 14 && (
                <ScalePressable
                  style={styles.checkboxRow}
                  onPress={() => setD14((v) => !v)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: d14 }}
                  accessibilityLabel="Given tog 14 över någon annans 14-bud"
                >
                  <View
                    style={[
                      styles.checkbox,
                      { backgroundColor: d14 ? colors.cardRed : colors.inset, borderColor: d14 ? colors.cardRed : '#D8CFBB' },
                    ]}
                  >
                    {d14 && <Text style={styles.checkboxMark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    Given tog 14 över någon annans 14-bud (miss ger −28)
                  </Text>
                </ScalePressable>
              )}

              <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Poäng</Text>
              <View style={{ marginTop: 10 }}>
                <PointsWheelPair
                  pointsA={pointsA}
                  pointsB={pointsB}
                  onChangeA={onChangePointsA}
                  onChangeB={onChangePointsB}
                  min={0}
                  max={TOTAL_POINTS}
                  biddingTeam={biddingTeam}
                  bidAmount={bidAmount}
                  nameA={TEAM_LABELS.A}
                  nameB={TEAM_LABELS.B}
                  onInteractionStart={() => setWheelActive(true)}
                  onInteractionEnd={() => setWheelActive(false)}
                />
              </View>
            </DimmedSection>

            <ScalePressable
              style={[styles.saveButton, !canSave && { opacity: 0.45 }]}
              disabled={!canSave}
              onPress={saveHand}
              accessibilityRole="button"
              accessibilityLabel="Spara giv"
            >
              <Text style={styles.saveButtonLabel}>Spara giv</Text>
            </ScalePressable>
          </View>

          {game.hands.length > 0 && (
            <View style={styles.logSection}>
              <View style={styles.logHeaderRow}>
                <Text style={styles.sectionTitle}>Givhistorik</Text>
                {confirming !== 'undo' ? (
                  <ScalePressable
                    hitSlop={8}
                    onPress={() => setConfirming('undo')}
                    accessibilityRole="button"
                    accessibilityLabel="Ångra senaste giv"
                  >
                    <Text style={styles.undoLink}>Ångra senaste</Text>
                  </ScalePressable>
                ) : (
                  <InlineConfirm
                    message="Säker?"
                    confirmLabel="Ångra"
                    onConfirm={doUndo}
                    onCancel={() => setConfirming(null)}
                  />
                )}
              </View>
              <View style={styles.table}>
                {[...game.hands].reverse().map((hand, i) => (
                  <HandLogRow key={hand.id} hand={hand} animateIn={i === 0} />
                ))}
              </View>
            </View>
          )}

          <View style={styles.abandonWrap}>
            {confirming !== 'abandon' ? (
              <ScalePressable
                hitSlop={8}
                onPress={() => setConfirming('abandon')}
                accessibilityRole="button"
                accessibilityLabel="Avsluta match"
              >
                <Text style={styles.abandonLabel}>Avsluta match</Text>
              </ScalePressable>
            ) : (
              <InlineConfirm
                message="Sparas oavslutad i historiken —"
                confirmLabel="Avsluta"
                onConfirm={doAbandon}
                onCancel={() => setConfirming(null)}
              />
            )}
          </View>
        </ScreenTransition>
      </ScrollView>

      <SavedToast toastKey={savedToast} />

      <Modal visible={!!win} animationType="none" statusBarTranslucent transparent>
        {win && (
          <WinOverlay
            winner={win.team}
            target={TARGET_SCORE}
            totalA={win.a}
            totalB={win.b}
            onNewGame={winNewGame}
            onGoHome={winGoHome}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

function DimmedSection({ active, children }: { active: boolean; children: React.ReactNode }) {
  const opacity = useSharedValue(active ? 1 : 0.4);

  useEffect(() => {
    opacity.value = withTiming(active ? 1 : 0.4, { duration: 250 });
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={animatedStyle} pointerEvents={active ? 'auto' : 'none'}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { color: colors.muted, textAlign: 'center', marginTop: 40, fontFamily: fonts.medium },
  scroll: { padding: 16, paddingBottom: 40 },
  formCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.cardLg,
    padding: 18,
    marginTop: 14,
    ...shadows.card,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  sectionTitleMuted: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.checkbox,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMark: { color: colors.cream, fontSize: 13, fontFamily: fonts.bold },
  checkboxLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 13, color: colors.muted, lineHeight: 18 },
  saveButton: {
    width: '100%',
    marginTop: 28,
    backgroundColor: colors.feltGreen,
    borderRadius: radii.button,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadows.primaryButton,
  },
  saveButtonLabel: { fontFamily: fonts.bold, fontSize: 16, color: colors.cream },
  logSection: { marginTop: 14 },
  logHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 2,
    marginBottom: 10,
  },
  undoLink: { fontFamily: fonts.semibold, fontSize: 13, color: colors.cardRed },
  table: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.card,
    overflow: 'hidden',
    ...shadows.card,
  },
  abandonWrap: { marginTop: 8, alignItems: 'center' },
  abandonLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
    textDecorationLine: 'underline',
    padding: 10,
  },
});
