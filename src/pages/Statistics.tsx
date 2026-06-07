import { useState, useMemo } from 'react';
import { PieChart, TrendingUp, Shirt, Palette } from 'lucide-react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { ClothingCategory, CATEGORY_LABELS, COLOR_OPTIONS } from '@/types';

type TimeRange = 'all' | 'year' | 'quarter';

const CHART_COLORS = [
  '#5B8C5A',
  '#D4846F',
  '#9C8A5E',
  '#7BA87B',
  '#BF6A55',
  '#B8A67F',
];

const COLOR_HEX_MAP: Record<string, string> = {
  '白色': '#FFFFFF',
  '黑色': '#1F2937',
  '灰色': '#9CA3AF',
  '米色': '#F5F0E6',
  '棕色': '#8B7355',
  '红色': '#DC2626',
  '蓝色': '#2563EB',
  '绿色': '#16A34A',
  '黄色': '#EAB308',
  '粉色': '#EC4899',
  '紫色': '#9333EA',
  '牛仔': '#3B82F6',
};

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'quarter', label: '近三个月' },
  { value: 'year', label: '近一年' },
];

export default function Statistics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [activeCategories, setActiveCategories] = useState<Set<ClothingCategory>>(
    new Set(['top', 'bottom', 'outerwear', 'dress', 'shoes', 'accessory'])
  );

  const clothingItems = useStore((state) => state.clothingItems);
  const wearRecords = useStore((state) => state.wearRecords);

  const now = Date.now();
  const timeRangeMs = {
    all: 0,
    year: 365 * 24 * 60 * 60 * 1000,
    quarter: 90 * 24 * 60 * 60 * 1000,
  };

  const filteredItems = useMemo(() => {
    if (timeRange === 'all') return clothingItems;
    const cutoff = now - timeRangeMs[timeRange];
    return clothingItems.filter((item) => item.createdAt >= cutoff);
  }, [clothingItems, timeRange, now]);

  const monthlyAverageDenominator = useMemo(() => {
    if (timeRange === 'quarter') return 3;
    if (timeRange === 'year') return 12;
    if (filteredItems.length === 0) return 1;
    const earliestDate = new Date(Math.min(...filteredItems.map((item) => item.createdAt)));
    const nowDate = new Date();
    const monthsDiff =
      (nowDate.getFullYear() - earliestDate.getFullYear()) * 12 +
      (nowDate.getMonth() - earliestDate.getMonth()) +
      1;
    return Math.max(monthsDiff, 1);
  }, [filteredItems, timeRange]);

  const categoryData = useMemo(() => {
    const counts: Record<ClothingCategory, number> = {
      top: 0,
      bottom: 0,
      outerwear: 0,
      dress: 0,
      shoes: 0,
      accessory: 0,
    };
    filteredItems.forEach((item) => {
      counts[item.category]++;
    });
    return Object.entries(counts)
      .map(([key, value]) => ({
        name: CATEGORY_LABELS[key as ClothingCategory],
        value,
        category: key as ClothingCategory,
      }))
      .filter((item) => activeCategories.has(item.category));
  }, [filteredItems, activeCategories]);

  const colorData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredItems.forEach((item) => {
      counts[item.color] = (counts[item.color] || 0) + 1;
    });
    return COLOR_OPTIONS.map((opt) => ({
      name: opt.label,
      value: counts[opt.value] || 0,
      color: COLOR_HEX_MAP[opt.value] || '#CCCCCC',
    })).filter((item) => item.value > 0);
  }, [filteredItems]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    filteredItems.forEach((item) => {
      const date = new Date(item.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + 1;
    });

    const sortedMonths = Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12);

    return sortedMonths.map(([month, count]) => ({
      month: month.substring(5) + '月',
      新增数量: count,
    }));
  }, [filteredItems]);

  const wearFrequencyData = useMemo(() => {
    const cutoffDate =
      timeRange === 'all'
        ? null
        : new Date(now - timeRangeMs[timeRange]).toISOString().split('T')[0];

    const itemWearCounts: Record<string, number> = {};
    filteredItems.forEach((item) => {
      itemWearCounts[item.id] = 0;
    });

    wearRecords.forEach((record) => {
      if (cutoffDate && record.date < cutoffDate) return;
      record.clothingIds.forEach((clothingId) => {
        if (itemWearCounts.hasOwnProperty(clothingId)) {
          itemWearCounts[clothingId]++;
        }
      });
    });

    const categoryWears: Record<ClothingCategory, { total: number; count: number }> = {
      top: { total: 0, count: 0 },
      bottom: { total: 0, count: 0 },
      outerwear: { total: 0, count: 0 },
      dress: { total: 0, count: 0 },
      shoes: { total: 0, count: 0 },
      accessory: { total: 0, count: 0 },
    };

    filteredItems.forEach((item) => {
      const wearCount = itemWearCounts[item.id] || 0;
      categoryWears[item.category].total += wearCount;
      categoryWears[item.category].count++;
    });

    return Object.entries(categoryWears)
      .map(([key, data]) => ({
        name: CATEGORY_LABELS[key as ClothingCategory],
        平均穿着次数: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
        category: key as ClothingCategory,
      }))
      .filter((item) => activeCategories.has(item.category));
  }, [filteredItems, wearRecords, timeRange, now, activeCategories]);

  const toggleCategory = (category: ClothingCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        if (next.size > 1) {
          next.delete(category);
        }
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const totalItems = filteredItems.length;

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-earth-800">数据统计</h1>
            <p className="text-earth-500 mt-1">
              共 {totalItems} 件衣物 · 洞悉你的衣橱构成
            </p>
          </div>
          <div className="flex gap-2">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  timeRange === range.value
                    ? 'bg-sage-500 text-white'
                    : 'bg-white text-earth-600 hover:bg-earth-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                <Shirt className="w-5 h-5 text-sage-600" />
              </div>
              <span className="text-earth-500 text-sm">衣物总数</span>
            </div>
            <p className="text-3xl font-bold text-earth-800">{totalItems}</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-terracotta-100 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-terracotta-600" />
              </div>
              <span className="text-earth-500 text-sm">品类数量</span>
            </div>
            <p className="text-3xl font-bold text-earth-800">
              {categoryData.filter((d) => d.value > 0).length}
            </p>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-earth-100 flex items-center justify-center">
                <Palette className="w-5 h-5 text-earth-600" />
              </div>
              <span className="text-earth-500 text-sm">颜色种类</span>
            </div>
            <p className="text-3xl font-bold text-earth-800">{colorData.length}</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-sage-600" />
              </div>
              <span className="text-earth-500 text-sm">月均新增</span>
            </div>
            <p className="text-3xl font-bold text-earth-800">
              {filteredItems.length > 0
                ? Math.round((filteredItems.length / monthlyAverageDenominator) * 10) / 10
                : 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-earth-800">品类分布</h2>
              <div className="flex flex-wrap gap-1">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                  const cat = key as ClothingCategory;
                  const isActive = activeCategories.has(cat);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleCategory(cat)}
                      className={`px-2 py-1 text-xs rounded-md transition-all ${
                        isActive
                          ? 'bg-sage-100 text-sage-700'
                          : 'bg-earth-100 text-earth-400'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(74, 63, 53, 0.08)',
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-earth-800 mb-6">颜色分布</h2>
            <div className="space-y-3">
              {colorData.length === 0 ? (
                <div className="text-center py-8 text-earth-400">暂无数据</div>
              ) : (
                colorData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg border border-earth-200 flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-earth-700">{item.name}</span>
                        <span className="text-sm text-earth-500">{item.value} 件</span>
                      </div>
                      <div className="h-2 bg-earth-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.value / totalItems) * 100}%`,
                            backgroundColor: item.color === '#FFFFFF' ? '#D4C4A8' : item.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-earth-800 mb-6">每月新增衣物</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DFCE" />
                  <XAxis dataKey="month" stroke="#9C8A5E" fontSize={12} />
                  <YAxis stroke="#9C8A5E" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(74, 63, 53, 0.08)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="新增数量"
                    stroke="#5B8C5A"
                    strokeWidth={3}
                    dot={{ fill: '#5B8C5A', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#5B8C5A' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-earth-800 mb-6">各品类平均穿着频率</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wearFrequencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DFCE" />
                  <XAxis dataKey="name" stroke="#9C8A5E" fontSize={12} />
                  <YAxis stroke="#9C8A5E" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(74, 63, 53, 0.08)',
                    }}
                  />
                  <Bar dataKey="平均穿着次数" radius={[4, 4, 0, 0]}>
                    {wearFrequencyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
