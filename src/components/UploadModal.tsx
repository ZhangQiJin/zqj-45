import { useState, useCallback, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { ClothingCategory, CATEGORY_LABELS, COLOR_OPTIONS } from '@/types';
import { useStore } from '@/store/useStore';
import { compressImage } from '@/utils/image';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('top');
  const [color, setColor] = useState('白色');
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const addClothingItem = useStore((state) => state.addClothingItem);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setName('');
        setCategory('top');
        setColor('白色');
        setImageUrl('');
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }
    setIsLoading(true);
    try {
      const compressed = await compressImage(file);
      setImageUrl(compressed);
    } catch (error) {
      alert('图片处理失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('请输入衣物名称');
      return;
    }
    if (!imageUrl) {
      alert('请上传衣物图片');
      return;
    }
    addClothingItem({
      name: name.trim(),
      category,
      color,
      imageUrl,
    });
    setName('');
    setCategory('top');
    setColor('白色');
    setImageUrl('');
    onClose();
  };

  const resetAndClose = () => {
    setName('');
    setCategory('top');
    setColor('白色');
    setImageUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-soft-hover w-full max-w-md overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-earth-100">
          <h2 className="text-lg font-serif font-semibold text-earth-800">添加新衣物</h2>
          <button
            onClick={resetAndClose}
            className="p-2 rounded-lg hover:bg-earth-50 text-earth-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              isDragging
                ? 'border-sage-400 bg-sage-50'
                : imageUrl
                ? 'border-earth-200 bg-earth-50'
                : 'border-earth-200 hover:border-sage-300 hover:bg-earth-50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="预览"
                  className="max-h-48 mx-auto rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-earth-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                />
                {isLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 border-3 border-sage-200 border-t-sage-500 rounded-full animate-spin" />
                    <span className="text-sm text-earth-500">处理中...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center">
                      {isDragging ? (
                        <Upload className="w-6 h-6 text-sage-600" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-sage-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-earth-700">
                        拖拽图片到这里，或点击上传
                      </p>
                      <p className="text-xs text-earth-500 mt-1">
                        支持 JPG、PNG 格式
                      </p>
                    </div>
                  </div>
                )}
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">
              衣物名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：白色T恤"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">
              衣物类别
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_LABELS) as ClothingCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    category === cat
                      ? 'bg-sage-500 text-white'
                      : 'bg-earth-50 text-earth-600 hover:bg-earth-100'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">
              颜色
            </label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="input-field"
            >
              {COLOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetAndClose}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="flex-1 btn-primary">
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
