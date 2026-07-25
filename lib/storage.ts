import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game } from './types';

const ACTIVE_GAME_KEY = 'pidro:activeGame';
const HISTORY_KEY = 'pidro:history';

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getActiveGame(): Promise<Game | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_GAME_KEY);
  return raw ? (JSON.parse(raw) as Game) : null;
}

export async function saveActiveGame(game: Game): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(game));
}

export async function clearActiveGame(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_GAME_KEY);
}

export async function getHistory(): Promise<Game[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  const list = raw ? (JSON.parse(raw) as Game[]) : [];
  return list.sort((a, b) => (b.finishedAt ?? b.createdAt) - (a.finishedAt ?? a.createdAt));
}

export async function addToHistory(game: Game): Promise<void> {
  const list = await getHistory();
  list.unshift(game);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export async function deleteFromHistory(id: string): Promise<void> {
  const list = await getHistory();
  const filtered = list.filter((g) => g.id !== id);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}

export async function getHistoryGame(id: string): Promise<Game | undefined> {
  const list = await getHistory();
  return list.find((g) => g.id === id);
}
