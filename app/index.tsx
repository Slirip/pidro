import { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Game, TEAM_LABELS } from '../lib/types';
import { TARGET_SCORE } from '../lib/scoring';
import { generateId, getActiveGame, saveActiveGame } from '../lib/storage';
import { colors, fonts, radii, shadows } from '../lib/theme';
import { Logo } from '../components/Logo';
import { ScalePressable } from '../components/ScalePressable';
import { ScreenTransition } from '../components/ScreenTransition';

export default function HomeScreen() {
  const router = useRouter();
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getActiveGame().then((game) => {
        if (!cancelled) {
          setActiveGame(game);
          setLoaded(true);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const startNewGame = async () => {
    const game: Game = {
      id: generateId(),
      createdAt: Date.now(),
      targetScore: TARGET_SCORE,
      hands: [],
      totalA: 0,
      totalB: 0,
    };
    await saveActiveGame(game);
    router.push('/game');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenTransition style={styles.transition}>
        <View style={styles.hero}>
          <Image
            source={require('../assets/brand/four-fives-logo.png')}
            style={styles.fivesLogo}
            resizeMode="contain"
          />
          <Logo variant="primary" />
        </View>

        <View style={styles.actions}>
          {loaded && activeGame && (
            <ScalePressable
              style={styles.primaryButton}
              restBackgroundColor={colors.feltGreen}
              pressedBackgroundColor={colors.deepFelt}
              onPress={() => router.push('/game')}
              accessibilityRole="button"
              accessibilityLabel="Fortsätt match"
            >
              <Text style={styles.primaryLabel}>Fortsätt match</Text>
              <Text style={styles.primarySub}>
                <Text style={{ color: colors.sage, textTransform: 'uppercase' }}>{TEAM_LABELS.A}</Text>{' '}
                {activeGame.totalA} – {activeGame.totalB}{' '}
                <Text style={{ color: colors.warmCoral, textTransform: 'uppercase' }}>{TEAM_LABELS.B}</Text>
              </Text>
            </ScalePressable>
          )}

          {loaded && !activeGame && (
            <ScalePressable
              style={[styles.primaryButton, styles.primaryButtonTall]}
              restBackgroundColor={colors.feltGreen}
              pressedBackgroundColor={colors.deepFelt}
              onPress={startNewGame}
              accessibilityRole="button"
              accessibilityLabel="Ny match"
            >
              <Text style={styles.primaryLabel}>Ny match</Text>
            </ScalePressable>
          )}

          <ScalePressable
            style={styles.secondaryButton}
            onPress={() => router.push('/history')}
            accessibilityRole="button"
            accessibilityLabel="Historik"
          >
            <Text style={styles.secondaryLabel}>Historik</Text>
          </ScalePressable>
        </View>
      </ScreenTransition>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  transition: {
    justifyContent: 'space-between',
    padding: 24,
  },
  hero: {
    marginTop: 52,
    alignItems: 'center',
  },
  fivesLogo: {
    width: 200,
    height: 141,
    marginBottom: 12,
  },
  actions: {
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    borderRadius: radii.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 3,
    ...shadows.primaryButton,
  },
  primaryButtonTall: { paddingVertical: 18 },
  primaryLabel: { fontFamily: fonts.bold, fontSize: 17, color: colors.cream },
  primarySub: { fontFamily: fonts.semibold, fontSize: 13, color: colors.sage },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    borderRadius: radii.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  secondaryLabel: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
});
