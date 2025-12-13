// 분석 트리거 간격
export const ANALYSIS_INTERVAL = 10;

// 분석 트리거 체크
export const shouldTriggerAnalysis = (
  logCount: number,
  lastAnalysisLogCount: number,
): boolean => {
  return (
    logCount >= ANALYSIS_INTERVAL &&
    logCount % ANALYSIS_INTERVAL === 0 &&
    logCount > lastAnalysisLogCount
  );
};
