import AsyncStorage from '@react-native-async-storage/async-storage';

import { FinanceState } from '../models/finance';

const STORAGE_KEY = '@assetflow/state/v1';

export async function loadFinanceState() {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
  return rawValue ? (JSON.parse(rawValue) as FinanceState) : null;
}

export async function saveFinanceState(state: FinanceState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearFinanceState() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
