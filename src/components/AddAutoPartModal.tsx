import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Wrench, Calendar, Building2, Tag, DollarSign, Info, FileText } from 'lucide-react';
import { AutoPart, AutoPartFormData, Supplier } from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface AddAutoPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AutoPartFormData, editId?: string) => Promise<void> | void;
  currentCount: number;
  initialPart?: AutoPart | null;
  suppliers: Supplier[];
}

export const AddAutoPartModal: React.FC<AddAutoPartModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentCount,
  initialPart,
  suppliers,
}) => {
  const isOnline = useOnlineStatus();
  const isEditMode = Boolean(initialPart);

  const getTodayDate = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<AutoPartFormData>({
    partName: '',
    brand: '',
    supplierName: '',
    price: '',
    date: getTodayDate(),
    source: '',
    comment: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialPart) {
        setFormData({
          partName: initialPart.partName,
          brand: initialPart.brand,
          supplierName: initialPart.supplierName,
          price: String(initialPart.price),
          date: initialPart.date || getTodayDate(),
          source: initialPart.source,
          comment: initialPart.comment,
        });
      } else {
        setFormData({
          partName: '',
          brand: '',
          supplierName: suppliers.length > 0 ? suppliers[0].name : '',
          price: '',
          date: getTodayDate(),
          source: '',
          comment: '',
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialPart, suppliers]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!formData.partName.trim()) {
      errs.partName = 'Avto ehtiyot qism nomi kiritilishi shart (majburiy)';
    }
    if (!formData.brand.trim()) {
      errs.brand = 'Brend kiritilishi shart (majburiy)';
    }
    if (!formData.supplierName.trim()) {
      errs.supplierName = 'Yetkazib beruvchilar ro\'yxatidan tanlanishi shart (majburiy)';
    }
    const numPrice = parseFloat(String(formData.price).replace(/\s/g, ''));
    if (!formData.price || isNaN(numPrice) || numPrice <= 0) {
      errs.price = 'To\'g\'ri narx kiritilishi shart (0 dan katta bo\'lsin)';
    }
    if (!formData.date.trim()) {
      errs.date = 'Sana kiritilishi shart (majburiy)';
    }
    if (!formData.source.trim()) {
      errs.source = 'Ma\'lumot manbaasi kiritilishi shart (majburiy)';
    }
    if (!formData.comment.trim()) {
      errs.comment = 'Izoh kiritilishi shart (majburiy)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      alert('Oflayn rejimda yangi yozuv qo\'shish imkoniyati cheklangan!');
      return;
    }
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSave(formData, initialPart ? initialPart.id : undefined);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSystemTime = initialPart?.systemTime || new Date().toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-amber-50 border-3 border-amber-500 shadow-2xl my-6 text-black rounded-none">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-yellow-200 border-b-2 border-amber-400">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-400 border border-amber-600 text-black">
              <Wrench className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-black font-heading">
                {isEditMode ? 'Avto ehtiyot qismni tahrirlash' : 'Yangi avto ehtiyot qism qo\'shish'}
              </h2>
              <p className="text-[10px] text-stone-700 font-bold">
                Barcha maydonlar to'ldirilishi majburiy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 bg-amber-300 hover:bg-amber-400 border border-amber-500 text-black cursor-pointer transition"
            title="Yopish"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Offline notification if offline */}
        {!isOnline && (
          <div className="bg-amber-200 border-b-2 border-amber-400 px-4 py-2 text-xs font-black text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>Oflayn rejimdasiz. Yozuv qo'shish yoki tahrirlash faqat internetga ulanganda mumkin.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
          
          {/* 1 & 2: Avtomatik to'ldiriladigan ustunlar */}
          <div className="grid grid-cols-2 gap-3 p-2.5 bg-yellow-100 border border-amber-300">
            <div>
              <span className="text-[10px] font-black uppercase text-stone-700 block">
                1. Tartib raqami (Avtomatik)
              </span>
              <div className="mt-1 px-3 py-1.5 bg-amber-200 border border-amber-400 font-mono font-black text-sm text-black">
                № {initialPart ? initialPart.orderNumber : currentCount + 1}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-stone-700 block">
                2. Sistema vaqti (Avtomatik)
              </span>
              <div className="mt-1 px-3 py-1.5 bg-amber-200 border border-amber-400 font-mono font-bold text-xs text-black">
                {currentSystemTime}
              </div>
            </div>
          </div>

          {/* 3. Avto ehtiyot qism nomi */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
              3. Avto ehtiyot qism nomi <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={formData.partName}
              onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
              placeholder="Masalan: Oldi tormoz kolodkasi, Moy filtri, Svecha, Amortizator..."
              className={`w-full px-3 py-2 text-xs border-2 bg-white text-black font-bold focus:outline-none rounded-none ${
                errors.partName ? 'border-rose-600 bg-rose-50' : 'border-amber-400 focus:border-amber-600'
              }`}
            />
            {errors.partName && (
              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.partName}
              </p>
            )}
          </div>

          {/* 4. Brend */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
              4. Brend <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Masalan: Sangsin Hi-Q, Mando, Mann Filter, Bosch, GM Korea..."
              className={`w-full px-3 py-2 text-xs border-2 bg-white text-black font-bold focus:outline-none rounded-none ${
                errors.brand ? 'border-rose-600 bg-rose-50' : 'border-amber-400 focus:border-amber-600'
              }`}
            />
            {errors.brand && (
              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.brand}
              </p>
            )}
          </div>

          {/* 5. Yetkazib beruvchi (Faqat yetkazib beruvchilar ro'yxatidan ismi bo'yicha tanlanadi) */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
              5. Yetkazib beruvchi <span className="text-rose-600">*</span>
            </label>
            {suppliers.length === 0 ? (
              <div className="p-2.5 bg-yellow-100 border-2 border-amber-400 text-xs font-bold text-stone-800">
                Yetkazib beruvchilar ro'yxati hozircha bo'sh. Avval 1-jadvalda yetkazib beruvchi qo'shing.
              </div>
            ) : (
              <select
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className={`w-full px-3 py-2 text-xs border-2 bg-white text-black font-bold focus:outline-none rounded-none ${
                  errors.supplierName ? 'border-rose-600 bg-rose-50' : 'border-amber-400 focus:border-amber-600'
                }`}
              >
                <option value="">-- Yetkazib beruvchini tanlang --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.activityType === 'yuridik' ? 'Yuridik' : 'Jismoniy'})
                  </option>
                ))}
              </select>
            )}
            {errors.supplierName && (
              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.supplierName}
              </p>
            )}
          </div>

          {/* 6. Narx va 7. Sana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                6. Narx (so'mda) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Masalan: 185000"
                className={`w-full px-3 py-2 text-xs border-2 bg-white text-black font-bold focus:outline-none rounded-none ${
                  errors.price ? 'border-rose-600 bg-rose-50' : 'border-amber-400 focus:border-amber-600'
                }`}
              />
              {formData.price && !isNaN(Number(formData.price)) && (
                <span className="text-[10px] font-black text-stone-700 block mt-0.5">
                  {Number(formData.price).toLocaleString('uz-UZ')} so'm
                </span>
              )}
              {errors.price && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                7. Sana <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-3 py-2 text-xs border-2 bg-white text-black font-bold focus:outline-none rounded-none ${
                  errors.date ? 'border-rose-600 bg-rose-50' : 'border-amber-400 focus:border-amber-600'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* 8. Ma'lumot manbaasi */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
              8. Ma'lumot manbaasi <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="Masalan: Rasmiy diler, Ulgurji bozor, Do'kon, Koreya import, Telefon orqali..."
              className={`w-full px-3 py-2 text-xs border-2 bg-white text-black font-bold focus:outline-none rounded-none ${
                errors.source ? 'border-rose-600 bg-rose-50' : 'border-amber-400 focus:border-amber-600'
              }`}
            />
            {errors.source && (
              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.source}
              </p>
            )}
          </div>

          {/* 9. Izoh */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
              9. Izoh <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Mahsulot holati, sifati, avtomobil modeli (Cobalt, Gentra, Nexia), kafolat va boshqa eslatmalar..."
              className={`w-full px-3 py-2 text-xs border-2 bg-white text-black font-bold focus:outline-none rounded-none resize-none ${
                errors.comment ? 'border-rose-600 bg-rose-50' : 'border-amber-400 focus:border-amber-600'
              }`}
            />
            {errors.comment && (
              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.comment}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-amber-300">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-black bg-stone-200 hover:bg-stone-300 text-black border border-stone-400 transition cursor-pointer rounded-none"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !isOnline}
              className={`px-5 py-2 text-xs font-black flex items-center gap-2 border-2 transition rounded-none shadow-sm ${
                !isOnline
                  ? 'bg-stone-300 border-stone-400 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-500 border-amber-600 text-black cursor-pointer active:scale-95'
              }`}
              title={!isOnline ? 'Oflayn rejimda saqlab bo\'lmaydi' : 'Saqlash'}
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Saqlanmoqda...' : isEditMode ? 'O\'zgarishlarni saqlash' : 'Saqlash'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
