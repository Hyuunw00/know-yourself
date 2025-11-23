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
