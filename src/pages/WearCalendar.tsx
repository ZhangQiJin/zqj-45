import { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Clock, Shirt } from 'lucide-react';
import { useStore } from '@/store/useStore';
import CalendarHeatmap from '@/components/CalendarHeatmap';
import WearRecordDetail from '@/components/WearRecordDetail';
import { CATEGORY_LABELS } from '@/types';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysAgo(dateStr: string): number {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function WearCalendar() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const clothingItems = useStore((state) => state.clothingItems);
  const wearRecords = useStore((state) => state.wearRecords);
  const getAllClothingWearStats = useStore((state) => state.getAllClothingWearStats);

  const stats = useMemo(() => getAllClothingWearStats(), [getAllClothingWearStats]);

  const sortedByWearCount = useMemo(() => {
    return clothingItems
      .map((item) => {
        const itemStats = stats.get(item.id);
        return {
          item,
          stats: itemStats || { totalWears: 0, lastWornDate: null, wearDates: [] },
        };
      })
      .sort((a, b) => b.stats.totalWears - a.stats.totalWears);
  }, [clothingItems, stats]);

  const mostWorn = sortedByWearCount.filter((s) => s.stats.totalWears > 0).slice(0, 5);
  const leastWorn = [...sortedByWearCount]
    .filter((s) => s.stats.totalWears > 0)
    .sort((a, b) => a.stats.totalWears - b.stats.totalWears)
    .slice(0, 5);
  const notWorn = sortedByWearCount.filter((s) => s.stats.totalWears === 0);

  const totalWearsThisMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return wearRecords.filter((r) => {
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;
  }, [wearRecords]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-earth-800">穿着日历</h1>
          <p className="text-earth-500 mt-1">
            记录每日穿搭，了解你的衣物穿着习惯
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-earth-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-sage-600" />
            </div>
            <p className="text-2xl font-bold text-earth-800">{wearRecords.length}</p>
            <p className="text-sm text-earth-500">总记录天数</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-earth-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-earth-800">{totalWearsThisMonth}</p>
            <p className="text-sm text-earth-500">本月记录</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-earth-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
              <Shirt className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-earth-800">
              {clothingItems.filter((item) => {
                const s = stats.get(item.id);
                return s && s.totalWears > 0;
              }).length}
            </p>
            <p className="text-sm text-earth-500">已穿衣物</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-earth-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-earth-800">{notWorn.length}</p>
            <p className="text-sm text-earth-500">闲置衣物</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalendarHeatmap
              onDateClick={handleDateClick}
              selectedDate={selectedDate || undefined}
            />
          </div>

          <div className="space-y-6">
            {mostWorn.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-earth-100 shadow-sm">
                <h3 className="text-lg font-serif font-semibold text-earth-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sage-500" />
                  穿着最多
                </h3>
                <div className="space-y-3">
                  {mostWorn.map(({ item, stats }) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-earth-800 truncate">{item.name}</p>
                        <p className="text-xs text-earth-500">
                          {CATEGORY_LABELS[item.category]}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-sage-600">{stats.totalWears}次</p>
                        {stats.lastWornDate && (
                          <p className="text-xs text-earth-400">
                            {getDaysAgo(stats.lastWornDate) === 0
                              ? '今天'
                              : `${getDaysAgo(stats.lastWornDate)}天前`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {leastWorn.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-earth-100 shadow-sm">
                <h3 className="text-lg font-serif font-semibold text-earth-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  穿着最少
                </h3>
                <div className="space-y-3">
                  {leastWorn.map(({ item, stats }) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-earth-800 truncate">{item.name}</p>
                        <p className="text-xs text-earth-500">
                          {CATEGORY_LABELS[item.category]}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-amber-600">{stats.totalWears}次</p>
                        {stats.lastWornDate && (
                          <p className="text-xs text-earth-400">
                            {getDaysAgo(stats.lastWornDate) === 0
                              ? '今天'
                              : `${getDaysAgo(stats.lastWornDate)}天前`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {notWorn.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-earth-100 shadow-sm">
                <h3 className="text-lg font-serif font-semibold text-earth-800 mb-4 flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-rose-500" />
                  从未穿着 ({notWorn.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {notWorn.slice(0, 8).map(({ item }) => (
                    <img
                      key={item.id}
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border border-earth-200"
                      title={item.name}
                    />
                  ))}
                  {notWorn.length > 8 && (
                    <div className="w-12 h-12 rounded-lg bg-earth-100 flex items-center justify-center text-xs text-earth-500 font-medium">
                      +{notWorn.length - 8}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedDate && (
        <WearRecordDetail
          date={selectedDate}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </div>
  );
}
