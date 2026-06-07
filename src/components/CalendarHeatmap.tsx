import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface CalendarHeatmapProps {
  onDateClick: (date: string) => void;
  selectedDate?: string;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getHeatmapColor(count: number): string {
  if (count === 0) return 'bg-earth-100 hover:bg-earth-200';
  if (count === 1) return 'bg-sage-200 hover:bg-sage-300';
  if (count === 2) return 'bg-sage-300 hover:bg-sage-400';
  if (count === 3) return 'bg-sage-400 hover:bg-sage-500';
  return 'bg-sage-500 hover:bg-sage-600';
}

function getTextColor(count: number): string {
  if (count >= 3) return 'text-white';
  return 'text-earth-700';
}

export default function CalendarHeatmap({ onDateClick, selectedDate }: CalendarHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const wearRecords = useStore((state) => state.wearRecords);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [year, month]);

  const wearCountByDate = useMemo(() => {
    const countMap = new Map<string, number>();
    wearRecords.forEach((record) => {
      countMap.set(record.date, record.clothingIds.length);
    });
    return countMap;
  }, [wearRecords]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const todayStr = formatDate(new Date());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-lg hover:bg-earth-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-earth-600" />
          </button>
          <h2 className="text-xl font-serif font-semibold text-earth-800 min-w-[160px] text-center">
            {year}年 {MONTHS[month]}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-earth-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-earth-600" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 text-sm font-medium text-sage-700 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors"
        >
          今天
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-earth-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = formatDate(date);
          const count = wearCountByDate.get(dateStr) || 0;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 relative ${getHeatmapColor(count)} ${getTextColor(count)} ${isSelected ? 'ring-2 ring-sage-600 ring-offset-2' : ''} ${isToday ? 'ring-2 ring-earth-400' : ''}`}
            >
              <span className="text-sm font-medium">{date.getDate()}</span>
              {count > 0 && (
                <span className="text-xs mt-0.5 font-medium">{count}件</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-earth-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-earth-500">穿着强度：</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-earth-100" />
            <div className="w-4 h-4 rounded bg-sage-200" />
            <div className="w-4 h-4 rounded bg-sage-300" />
            <div className="w-4 h-4 rounded bg-sage-400" />
            <div className="w-4 h-4 rounded bg-sage-500" />
          </div>
          <span className="text-xs text-earth-500">少 → 多</span>
        </div>
      </div>
    </div>
  );
}
