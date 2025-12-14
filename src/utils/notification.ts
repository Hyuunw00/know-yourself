export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'ai_question':
      return '💭';
    case 'analysis_complete':
      return '✨';
    case 'reminder':
      return '⏰';
    case 'system':
      return '🔔';
    default:
      return '📬';
  }
};
