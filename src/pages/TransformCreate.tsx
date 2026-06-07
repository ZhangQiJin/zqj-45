import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Star,
  Check,
  Image as ImageIcon,
  Shirt,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  TransformCategory,
  TRANSFORM_CATEGORY_LABELS,
  Outfit,
  ClothingItem,
} from '@/types';
import CategoryTag from '@/components/CategoryTag';
import { compressImage } from '@/utils/image';

const categories: TransformCategory[] = ['cut', 'dye', 'patchwork', 'decorate'];

export default function TransformCreate() {
  const navigate = useNavigate();
  const outfits = useStore((state) => state.outfits);
  const clothingItems = useStore((state) => state.clothingItems);
  const addUserTransform = useStore((state) => state.addUserTransform);

  const [step, setStep] = useState(1);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);
  const [category, setCategory] = useState<TransformCategory>('cut');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [beforeImage, setBeforeImage] = useState<string>('');
  const [afterImage, setAfterImage] = useState<string>('');
  const [authorName, setAuthorName] = useState('创意改造家');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getOutfitItems = useCallback(
    (outfit: Outfit): ClothingItem[] => {
      return outfit.items
        .map((id) => clothingItems.find((c) => c.id === id))
        .filter((c): c is ClothingItem => !!c);
    },
    [clothingItems]
  );

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'before' | 'after'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 600, 0.85);
      if (type === 'before') {
        setBeforeImage(compressed);
      } else {
        setAfterImage(compressed);
      }
    } catch (error) {
      alert('图片上传失败，请重试');
    }
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const canProceed = () => {
    if (step === 1) return selectedOutfit !== null;
    if (step === 2) return title.trim() && description.trim();
    if (step === 3) return beforeImage && afterImage;
    if (step === 4) return steps.filter((s) => s.trim()).length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedOutfit) return;

    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      alert('请至少填写一个改造步骤');
      return;
    }

    setIsSubmitting(true);

    try {
      addUserTransform({
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        steps: validSteps,
        beforeImage,
        afterImage,
        outfitId: selectedOutfit.id,
        authorName: authorName.trim() || '创意改造家',
      });

      alert('改造方案发布成功！');
      navigate('/transform');
    } catch (error) {
      alert('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-earth-100 text-earth-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-earth-800">
              发布改造方案
            </h1>
            <p className="text-earth-500 text-sm mt-0.5">
              分享你的创意，让更多人获得灵感
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step > s
                    ? 'bg-sage-500 text-white'
                    : step === s
                    ? 'bg-sage-500 text-white ring-4 ring-sage-100'
                    : 'bg-earth-100 text-earth-400'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 md:w-20 h-1 mx-1 rounded ${
                    step > s ? 'bg-sage-500' : 'bg-earth-100'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-soft p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-earth-800 mb-4">
                选择基础搭配方案
              </h2>
              <p className="text-earth-500 text-sm mb-6">
                从你保存的搭配中选择一个作为改造的基础
              </p>

              {outfits.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-earth-100 flex items-center justify-center mx-auto mb-4">
                    <Shirt className="w-8 h-8 text-earth-400" />
                  </div>
                  <p className="text-earth-500 mb-4">还没有保存的搭配方案</p>
                  <button
                    onClick={() => navigate('/styling')}
                    className="btn-primary"
                  >
                    去创建搭配
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {outfits.map((outfit) => {
                    const items = getOutfitItems(outfit);
                    return (
                      <div
                        key={outfit.id}
                        onClick={() => setSelectedOutfit(outfit)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedOutfit?.id === outfit.id
                            ? 'border-sage-400 bg-sage-50'
                            : 'border-earth-100 hover:border-sage-200 hover:bg-earth-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                            {items.slice(0, 4).map((item) => (
                              <div
                                key={item.id}
                                className="w-12 h-12 rounded-lg border-2 border-white overflow-hidden bg-earth-50"
                              >
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-earth-800">
                              {outfit.name}
                            </h3>
                            <p className="text-sm text-earth-500">
                              {items.length} 件衣物
                            </p>
                          </div>
                          {selectedOutfit?.id === outfit.id && (
                            <div className="w-6 h-6 rounded-full bg-sage-500 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-soft p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-earth-800 mb-4">
                填写基本信息
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">
                    方案标题 <span className="text-terracotta-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="给你的改造方案起个吸引人的标题"
                    className="input-field"
                    maxLength={50}
                  />
                  <p className="text-xs text-earth-400 mt-1 text-right">
                    {title.length}/50
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">
                    改造说明 <span className="text-terracotta-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="简单介绍一下这个改造的创意和亮点..."
                    className="input-field min-h-[100px] resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-earth-400 mt-1 text-right">
                    {description.length}/200
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">
                    所属分类
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <CategoryTag
                        key={cat}
                        label={TRANSFORM_CATEGORY_LABELS[cat]}
                        active={category === cat}
                        onClick={() => setCategory(cat)}
                        color="terracotta"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">
                    难度等级
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level as 1 | 2 | 3 | 4 | 5)}
                        className={`p-2 rounded-lg transition-colors ${
                          difficulty >= level
                            ? 'text-terracotta-400'
                            : 'text-earth-200'
                        }`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            difficulty >= level ? 'fill-terracotta-400' : ''
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm text-earth-500 ml-2">
                      {difficulty === 1 && '入门级'}
                      {difficulty === 2 && '简单'}
                      {difficulty === 3 && '中等'}
                      {difficulty === 4 && '较难'}
                      {difficulty === 5 && '专家级'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">
                    你的昵称
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="输入你的昵称"
                    className="input-field"
                    maxLength={20}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-soft p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-earth-800 mb-4">
                上传对比图片
              </h2>
              <p className="text-earth-500 text-sm mb-6">
                上传改造前后的对比图，让大家更直观地看到效果
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">
                    改造前 <span className="text-terracotta-500">*</span>
                  </label>
                  {!beforeImage ? (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-earth-200 flex flex-col items-center justify-center cursor-pointer hover:border-sage-400 hover:bg-sage-50 transition-colors">
                      <Upload className="w-8 h-8 text-earth-400 mb-2" />
                      <span className="text-sm text-earth-500">点击上传图片</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'before')}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="aspect-square rounded-xl overflow-hidden relative group">
                      <img
                        src={beforeImage}
                        alt="改造前"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setBeforeImage('')}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full bg-black/50 text-white">
                        改造前
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">
                    改造后 <span className="text-terracotta-500">*</span>
                  </label>
                  {!afterImage ? (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-earth-200 flex flex-col items-center justify-center cursor-pointer hover:border-sage-400 hover:bg-sage-50 transition-colors">
                      <ImageIcon className="w-8 h-8 text-earth-400 mb-2" />
                      <span className="text-sm text-earth-500">点击上传图片</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'after')}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="aspect-square rounded-xl overflow-hidden relative group">
                      <img
                        src={afterImage}
                        alt="改造后"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setAfterImage('')}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full bg-sage-500 text-white">
                        改造后
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white rounded-2xl shadow-soft p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-earth-800 mb-4">
                填写改造步骤
              </h2>
              <p className="text-earth-500 text-sm mb-6">
                详细描述改造的每一步，让大家更容易跟着做
              </p>

              <div className="space-y-3">
                {steps.map((stepText, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center text-sm font-semibold mt-2">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={stepText}
                        onChange={(e) => handleStepChange(index, e.target.value)}
                        placeholder={`第 ${index + 1} 步...`}
                        className="input-field resize-none min-h-[60px]"
                        maxLength={150}
                      />
                    </div>
                    {steps.length > 1 && (
                      <button
                        onClick={() => removeStep(index)}
                        className="p-2 text-earth-400 hover:text-terracotta-500 transition-colors mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addStep}
                className="w-full mt-4 py-3 border-2 border-dashed border-earth-200 rounded-xl text-earth-500 hover:border-sage-400 hover:text-sage-600 hover:bg-sage-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加步骤
              </button>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 btn-secondary"
              >
                上一步
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '发布中...' : '发布方案'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
