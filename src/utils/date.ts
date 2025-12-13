// 날짜 포맷: 2024년 1월 1일 (월)
export const formatDateLong = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};

// 날짜 포맷: 2024년 1월 1일
export const formatDateMedium = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 날짜 포맷: 1/1
export const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 시간 포맷: 오후 3:30
export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// 날짜+시간 포맷: 1/1 오후 3:30
export const formatDateTime = (dateString: string) => {
  return `${formatDateShort(dateString)} ${formatTime(dateString)}`;
};

// 날짜 포맷: 2024-01-01 (ISO, 로컬 시간대 기준)
export const formatDateISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 오늘 날짜 (YYYY-MM-DD)
export const getTodayISO = () => formatDateISO(new Date());

// N개월 전 날짜 (YYYY-MM-DD)
export const getMonthsAgoISO = (months: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return formatDateISO(date);
};
