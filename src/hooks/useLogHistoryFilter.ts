import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayISO, getMonthsAgoISO } from '@/utils/date';

const FILTER_STORAGE_KEY = 'log-history-filter';

export const useLogHistoryFilter = () => {
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);

  // AsyncStorage에서 필터 불러오기
  useEffect(() => {
    const loadFilter = async () => {
      const saved = await AsyncStorage.getItem(FILTER_STORAGE_KEY);
      if (saved) {
        const { start, end } = JSON.parse(saved);
        setStartDate(start);
        setEndDate(end);
      } else {
        // 기본값: 최근 1개월
        setStartDate(getMonthsAgoISO(1));
        setEndDate(getTodayISO());
      }
      setIsLoaded(true);
    };
    loadFilter();
  }, []);

  const saveFilter = async (start?: string, end?: string) => {
    await AsyncStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({ start, end }),
    );
  };

  const handleSetStartDate = (date: string) => {
    setStartDate(date);
    saveFilter(date, endDate);
  };

  const handleSetEndDate = (date: string) => {
    setEndDate(date);
    saveFilter(startDate, date);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    AsyncStorage.removeItem(FILTER_STORAGE_KEY);
  };

  return {
    startDate,
    endDate,
    isLoaded,
    setStartDate: handleSetStartDate,
    setEndDate: handleSetEndDate,
    clearFilters,
  };
};
