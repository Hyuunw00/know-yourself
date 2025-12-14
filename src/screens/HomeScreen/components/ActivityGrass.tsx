import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { DailyLog } from '@/types/database';

interface Props {
  logs: DailyLog[];
  year?: number; // 표시할 년도 (기본 올해)
}

const MONTHS = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const ActivityGrass = ({
  logs,
  year: initialYear = new Date().getFullYear(),
}: Props) => {
  const scrollRef = useRef<ScrollView>(null);
  const [year, setYear] = useState(initialYear);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showYearPicker, setShowYearPicker] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // 날짜별 기록 수 계산
  const getLogCountByDate = () => {
    const countMap: Record<string, number> = {};
    logs.forEach(log => {
      const date = log.date;
      countMap[date] = (countMap[date] || 0) + 1;
    });
    return countMap;
  };

  // 해당 년도 1월 1일부터 12월 31일까지 날짜 생성
  const generateYearDates = () => {
    const startDate = new Date(year, 0, 1); // 1월 1일
    const endDate = new Date(year, 11, 31); // 12월 31일

    const dates: (string | null)[][] = [];
    let currentWeek: (string | null)[] = [];

    // 첫 주의 빈 칸 채우기 (일요일 시작)
    const firstDayOfWeek = startDate.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    // 날짜 채우기
    const current = new Date(startDate);
    while (current <= endDate) {
      // 로컬 시간 기준으로 YYYY-MM-DD 형식 생성
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      currentWeek.push(dateStr);

      if (currentWeek.length === 7) {
        dates.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    // 마지막 주 남은 칸 채우기
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      dates.push(currentWeek);
    }

    return dates;
  };

  // 월 레이블 위치 계산
  const getMonthLabels = (weeks: (string | null)[][]) => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    let lastWeekIndex = -4; // 최소 4주 간격 유지

    weeks.forEach((week, weekIndex) => {
      const firstDate = week.find(d => d !== null);
      if (firstDate) {
        const month = new Date(firstDate).getMonth();
        if (month !== lastMonth && weekIndex - lastWeekIndex >= 3) {
          labels.push({ month: MONTHS[month], weekIndex });
          lastMonth = month;
          lastWeekIndex = weekIndex;
        }
      }
    });

    return labels;
  };

  // 기록 수에 따른 색상
  const getColor = (count: number) => {
    if (count === 0) return '#ebedf0';
    if (count === 1) return '#9be9a8';
    if (count === 2) return '#40c463';
    if (count === 3) return '#30a14e';
    return '#216e39';
  };

  const handleCellPress = (date: string, event: { nativeEvent: { pageX: number; pageY: number } }) => {
    if (selectedDate === date) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
      setTooltipPos({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    }
  };

  const logCountMap = getLogCountByDate();
  const weeks = generateYearDates();
  const monthLabels = getMonthLabels(weeks);

  // 올해 총 기록 수
  const yearLogs = logs.filter(log => log.date.startsWith(String(year)));
  const totalLogs = yearLogs.length;

  // 기록한 날 수
  const activeDays = Object.keys(logCountMap).filter(date =>
    date.startsWith(String(year)),
  ).length;

  return (
    <View style={styles.container}>
      {/* 년도 및 통계 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setShowYearPicker(true)}
          style={styles.yearSelector}
        >
          <Text style={styles.yearText}>{year}년</Text>
          <Text style={styles.yearDropdownIcon}>▼</Text>
        </TouchableOpacity>
        <Text style={styles.statText}>
          <Text style={styles.statValue}>{totalLogs}</Text>개 기록 ·{' '}
          <Text style={styles.statValue}>{activeDays}</Text>일 활동
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={() => {
          // 현재 월 위치로 스크롤 (오른쪽 끝 근처)
          const currentWeek = Math.floor(
            (new Date().getTime() - new Date(year, 0, 1).getTime()) /
              (7 * 24 * 60 * 60 * 1000),
          );
          const scrollX = Math.max(0, (currentWeek - 10) * 13); // 10주 전부터 보이게
          scrollRef.current?.scrollTo({ x: scrollX, animated: false });
        }}
      >
        <View>
          {/* 월 레이블 */}
          <View style={styles.monthRow}>
            <View style={styles.dayLabelSpace} />
            {monthLabels.map((label, index) => (
              <Text
                key={index}
                style={[
                  styles.monthLabel,
                  { left: label.weekIndex * 13 }, // cell width(10) + gap(3)
                ]}
              >
                {label.month}
              </Text>
            ))}
          </View>

          <View style={styles.gridContainer}>
            {/* 요일 레이블 */}
            <View style={styles.dayLabels}>
              {DAYS.map((day, index) => (
                <Text key={index} style={styles.dayLabel}>
                  {index % 2 === 1 ? day : ''}
                </Text>
              ))}
            </View>

            {/* 잔디 그리드 */}
            <View style={styles.grassContainer}>
              {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.weekColumn}>
                  {week.map((date, dayIndex) => (
                    <TouchableOpacity
                      key={dayIndex}
                      onPress={(e) => date && handleCellPress(date, e)}
                      activeOpacity={date ? 0.7 : 1}
                    >
                      <View
                        style={[
                          styles.cell,
                          {
                            backgroundColor: date
                              ? getColor(logCountMap[date] || 0)
                              : 'transparent',
                          },
                          selectedDate && selectedDate === date && styles.selectedCell,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 범례 */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {[0, 1, 2, 3, 4].map(level => (
          <View
            key={level}
            style={[styles.legendCell, { backgroundColor: getColor(level) }]}
          />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>

      {/* 툴팁 모달 */}
      <Modal
        visible={selectedDate !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDate(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedDate(null)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.tooltip,
                {
                  position: 'absolute',
                  top: tooltipPos.y + 10,
                  left: tooltipPos.x - 60,
                },
              ]}
            >
              <View style={styles.tooltipArrow} />
              <Text style={styles.tooltipText}>
                {selectedDate && (
                  <>
                    {new Date(selectedDate).getMonth() + 1}월{' '}
                    {new Date(selectedDate).getDate()}일 ·{' '}
                    {logCountMap[selectedDate] || 0}개의 기록
                  </>
                )}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 년도 선택 모달 */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowYearPicker(false)}>
          <View style={styles.yearPickerOverlay}>
            <View style={styles.yearPickerContainer}>
              <Text style={styles.yearPickerTitle}>년도 선택</Text>
              <ScrollView style={styles.yearPickerScroll}>
                {yearOptions.map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.yearPickerItem, year === y && styles.yearPickerItemSelected]}
                    onPress={() => {
                      setYear(y);
                      setShowYearPicker(false);
                    }}
                  >
                    <Text style={[styles.yearPickerItemText, year === y && styles.yearPickerItemTextSelected]}>
                      {y}년
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statText: {
    fontSize: 13,
    color: '#666',
  },
  statValue: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  monthRow: {
    flexDirection: 'row',
    position: 'relative',
    height: 20,
    marginLeft: 24,
  },
  dayLabelSpace: {
    width: 0,
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 11,
    color: '#666',
  },
  gridContainer: {
    flexDirection: 'row',
  },
  dayLabels: {
    marginRight: 4,
  },
  dayLabel: {
    height: 10,
    marginBottom: 3,
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
    width: 20,
  },
  grassContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  weekColumn: {
    gap: 3,
  },
  cell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 4,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
    marginHorizontal: 4,
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  modalOverlay: {
    flex: 1,
  },
  tooltip: {
    backgroundColor: '#24292f',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 130,
  },
  tooltipArrow: {
    position: 'absolute',
    top: -6,
    left: 60,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#24292f',
  },
  tooltipText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
  },
  yearDropdownIcon: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  yearPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 200,
    maxHeight: 300,
    overflow: 'hidden',
  },
  yearPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  yearPickerScroll: {
    maxHeight: 250,
  },
  yearPickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  yearPickerItemSelected: {
    backgroundColor: '#e8f5e9',
  },
  yearPickerItemText: {
    fontSize: 15,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  yearPickerItemTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});
