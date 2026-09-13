import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  AlertCircle,
  Wrench,
  Calendar,
  Building2,
  Tag,
  DollarSign,
  Info,
  FileText,
  History,
  CheckCircle2,
  Sparkles,
  Search,
} from 'lucide-react';
import { AutoPart, AutoPartFormData, Supplier } from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { formatUSD } from '../utils/formatCurrency';

interface AddAutoPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AutoPartFormData, editId?: string) => Promise<void> | void;
  currentCount: number;
  initialPart?: AutoPart | null;
  suppliers: Supplier[];
  existingParts?: AutoPart[];
}

export const AddAutoPartModal: React.FC<AddAutoPartModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentCount,
  initialPart,
  suppliers,
  existingParts = [],
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
    code: '',
    api: '',
    liters: '',
    country: '',
    brand: '',
    supplierName: '',
    price: '',
    date: getTodayDate(),
    source: '',
    comment: '',
  });

  const [selectedTemplatePartId, setSelectedTemplatePartId] = useState<string>('');
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [autoFilledNotice, setAutoFilledNotice] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Noyob yoki tartiblangan oldingi qismlar ro'yxati
  const sortedExistingParts = useMemo(() => {
    return [...existingParts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [existingParts]);

  // Qidiruv bo'yicha filtrlangan eski qismlar
  const filteredExistingParts = useMemo(() => {
    if (!templateSearch.trim()) return sortedExistingParts;
    const query = templateSearch.toLowerCase().trim();
    return sortedExistingParts.filter(
      (p) =>
        p.partName.toLowerCase().includes(query) ||
        (p.code && p.code.toLowerCase().includes(query)) ||
        p.brand.toLowerCase().includes(query) ||
        p.supplierName.toLowerCase().includes(query)
    );
  }, [sortedExistingParts, templateSearch]);

  useEffect(() => {
    if (isOpen) {
      setSelectedTemplatePartId('');
      setTemplateSearch('');
      setAutoFilledNotice(null);
      if (initialPart) {
        setFormData({
          partName: initialPart.partName,
          code: initialPart.code || '',
          api: initialPart.api || '',
          liters: initialPart.liters || '',
          country: initialPart.country || '',
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
          code: '',
          api: '',
          liters: '',
          country: '',
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

  // Eski avto moy tanlanganda avtomatik to'ldirish
  const handleSelectExistingPart = (partId: string) => {
    setSelectedTemplatePartId(partId);
    if (!partId) return;

    const chosen = existingParts.find((p) => p.id === partId);
    if (chosen) {
      setFormData({
        partName: chosen.partName,
        code: chosen.code || '',
        api: chosen.api || '',
        liters: chosen.liters || '',
        country: chosen.country || '',
        brand: chosen.brand,
        supplierName: chosen.supplierName,
        price: String(chosen.price),
        date: getTodayDate(), // yangi yozuv uchun joriy sana qo'yiladi
        source: chosen.source,
        comment: chosen.comment,
      });
      setAutoFilledNotice(
        `«${chosen.partName} (${chosen.brand})» ma'lumotlari avtomatik to'ldirildi. Qo'shishdan oldin narx yoki boshqa maydonlarni tahrirlashingiz mumkin!`
      );
      setErrors({});
    }
  };

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!formData.partName.trim()) {
      errs.partName = 'Avto moy nomi kiritilishi shart (majburiy)';
    }
    if (!formData.code.trim()) {
      errs.code = 'Kod kiritilishi shart (majburiy)';
    }
    // api majburiy emas (ixtiyoriy)
    if (!formData.liters.trim()) {
      errs.liters = 'Litr kiritilishi shart (majburiy)';
    }
    if (!formData.country.trim()) {
      errs.country = 'Ishlab chiqarilgan davlat kiritilishi shart (majburiy)';
    }
    if (!formData.brand.trim()) {
      errs.brand = 'Brend kiritilishi shart (majburiy)';
    }
    if (!formData.supplierName.trim()) {
      errs.supplierName = 'Yetkazib beruvchilar ro\'yxatidan tanlanishi shart (majburiy)';
    }
    const rawPriceStr = String(formData.price).replace(/,/g, '.').replace(/\s/g, '');
    const numPrice = parseFloat(rawPriceStr);
    if (!formData.price || isNaN(numPrice) || numPrice <= 0) {
      errs.price = 'To\'g\'ri narx kiritilishi shart (0 dan yuqori son, masalan: 0.02, 1.5, 25)';
    }
    if (!formData.date.trim()) {
      errs.date = 'Sana kiritilishi shart (majburiy)';
    }
    if (!formData.source.trim()) {
      errs.source = 'Ma\'lumot manbaasi kiritilishi shart (majburiy)';
    }
    // Izoh qismi majburiy emas (ixtiyoriy)

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
                {isEditMode ? 'Avto moyni tahrirlash' : 'Yangi avto moy qo\'shish'}
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
          
          {/* Eski qo'shilgan avto moylardan tezkor tanlash (Avtomatik to'ldirish va tahrirlash imkoniyati) */}
          {existingParts && existingParts.length > 0 && !isEditMode && (
            <div className="p-3 bg-amber-100/90 border-2 border-amber-400 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="quick-select-part"
                  className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5"
                >
                  <History className="w-4 h-4 text-amber-800" />
                  <span>Eski (oldin kiritilgan) avto moylardan tanlash:</span>
                </label>
                <span className="text-[10px] bg-amber-300 px-1.5 py-0.5 border border-amber-500 font-black text-black">
                  {existingParts.length} ta mavjud
                </span>
              </div>

              {/* 3 ta harf yozilganda qidirish va tanlab olish */}
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Qidirish uchun kamida 3 ta harf yozing (masalan: 10W, Cas, Man, ZIC)..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs border-2 border-amber-400 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-none placeholder:text-stone-400"
                  />
                  {templateSearch && (
                    <button
                      type="button"
                      onClick={() => setTemplateSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black text-xs font-bold px-1 cursor-pointer"
                      title="Qidiruvni tozalash"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* 1 yoki 2 ta harf yozilganda eslatma */}
                {templateSearch.trim().length > 0 && templateSearch.trim().length < 3 && (
                  <p className="text-[11px] text-amber-900 font-bold bg-amber-200/70 px-2 py-1 border border-amber-300">
                    💡 Mos avto moylarni ko'rish va tanlash uchun kamida 3 ta harf yozing (yana {3 - templateSearch.trim().length} ta harf qoldi)
                  </p>
                )}

                {/* 3 ta harf yoki undan ko'p yozilganda mos kelgan avto moylar ro'yxati (Tanlab olish) */}
                {templateSearch.trim().length >= 3 && (
                  <div className="border-2 border-amber-500 bg-white p-2 space-y-1.5 shadow-sm max-h-56 overflow-y-auto">
                    <div className="flex items-center justify-between text-[11px] font-black text-amber-950 pb-1 border-b border-amber-200">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Mos kelgan avto moylar ({filteredExistingParts.length} ta topildi):
                      </span>
                      <span className="text-[10px] text-stone-500">Tanlash uchun bosing</span>
                    </div>

                    {filteredExistingParts.length === 0 ? (
                      <div className="p-2 text-center text-xs text-stone-600 italic">
                        «{templateSearch}» bo'yicha mos keluvchi avto moy topilmadi. Quyida yangi avto moy sifatida kiritishingiz mumkin.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredExistingParts.slice(0, 8).map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectExistingPart(p.id)}
                            className={`w-full text-left p-2 border transition flex items-center justify-between gap-2 cursor-pointer rounded-none ${
                              selectedTemplatePartId === p.id
                                ? 'bg-amber-300 border-amber-600 ring-1 ring-amber-500'
                                : 'bg-yellow-50/70 hover:bg-yellow-100 border-amber-300'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-black text-xs text-black truncate">{p.partName}</div>
                              <div className="flex items-center gap-1.5 text-[10px] text-stone-700 mt-0.5 flex-wrap">
                                <span className="px-1.5 py-0.2 bg-amber-200 border border-amber-400 font-bold uppercase text-black">
                                  {p.brand}
                                </span>
                                <span className="text-stone-800 font-semibold truncate">{p.supplierName}</span>
                                <span className="text-stone-500 font-mono">({p.date})</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 flex flex-col items-end">
                              <span className="font-mono font-black text-xs text-black">{formatUSD(p.price)}</span>
                              <span className="mt-0.5 text-[9px] px-2 py-0.5 bg-amber-400 border border-amber-600 font-black text-black">
                                Tanlash
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Qo'shimcha tanlash uchun dropdown (select) */}
              <div className="pt-1">
                <select
                  id="quick-select-part"
                  value={selectedTemplatePartId}
                  onChange={(e) => handleSelectExistingPart(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border-2 border-amber-500 bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-none cursor-pointer"
                >
                  <option value="">
                    {templateSearch.trim().length >= 3
                      ? `-- Topilgan avto moylardan tanlang (${filteredExistingParts.length} ta) --`
                      : `-- Barcha avto moylar ro'yxatidan tanlash (avto to'ldirish) --`}
                  </option>
                  {filteredExistingParts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.partName} | {p.brand} | {p.supplierName} | {formatUSD(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              {autoFilledNotice && (
                <div className="flex items-start gap-1.5 p-2 bg-emerald-100 border border-emerald-400 text-emerald-900 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{autoFilledNotice}</span>
                </div>
              )}
            </div>
          )}

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

          {/* 3. Avto moy nomi */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
              3. Avto moy nomi <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={formData.partName}
              onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
              placeholder="Masalan: Mannol Defender 10W-40, Castrol Magnatec 5W-30, ZIC X7 5W-40, Shell Helix Ultra..."
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

          {/* 4. Kod (Majburiy) */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
              4. Kod <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Masalan: MN7501-4, 15CA45, 162615, 550040755, 152566..."
              className={`w-full px-3 py-2 text-xs border-2 bg-white text-black font-bold focus:outline-none rounded-none font-mono ${
                errors.code ? 'border-rose-600 bg-rose-50' : 'border-amber-400 focus:border-amber-600'
              }`}
            />
            {errors.code && (
              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.code}
              </p>
            )}
          </div>

          {/* 5. API (Majburiy emas / Ixtiyoriy) */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
              5. API <span className="text-stone-600 text-[10px] font-semibold lowercase">(majburiy emas / ixtiyoriy)</span>
            </label>
            <input
              type="text"
              value={formData.api}
              onChange={(e) => setFormData({ ...formData, api: e.target.value })}
              placeholder="Masalan: API SN/CH-4, API SP, ILSAC GF-6, API SN PLUS, API CF..."
              className="w-full px-3 py-2 text-xs border-2 border-amber-400 focus:border-amber-600 bg-white text-black font-bold focus:outline-none rounded-none"
            />
          </div>

          {/* 6. Litr (Majburiy) va 7. Ishlab chiqarilgan davlat (Majburiy) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                6. Litr <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.liters}
                onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                placeholder="Masalan: 1L, 4L, 5L, 20L, 208L..."
                className={`w-full px-3 py-2 text-xs border-2 bg-white text-black font-bold focus:outline-none rounded-none ${
                  errors.liters ? 'border-rose-600 bg-rose-50' : 'border-amber-400 focus:border-amber-600'
                }`}
              />
              {errors.liters && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.liters}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                7. Ishlab chiqarilgan davlat <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Masalan: Germaniya, Belgiya, Janubiy Koreya, Fransiya, Turkiya..."
                className={`w-full px-3 py-2 text-xs border-2 bg-white text-black font-bold focus:outline-none rounded-none ${
                  errors.country ? 'border-rose-600 bg-rose-50' : 'border-amber-400 focus:border-amber-600'
                }`}
              />
              {errors.country && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.country}
                </p>
              )}
            </div>
          </div>

          {/* 8. Brend */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
              8. Brend <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Masalan: Mannol, Castrol, ZIC, Shell, Mobil, Motul, Total, Kixx..."
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

          {/* 9. Yetkazib beruvchi */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
              9. Yetkazib beruvchi <span className="text-rose-600">*</span>
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

          {/* 10. Narx va 11. Sana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                10. Narx ($ / AQSH dollari) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="0.0001"
                step="any"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Masalan: 0.02 yoki 15.50 yoki 120"
                className={`w-full px-3 py-2 text-xs border-2 bg-white text-black font-bold focus:outline-none rounded-none ${
                  errors.price ? 'border-rose-600 bg-rose-50' : 'border-amber-400 focus:border-amber-600'
                }`}
              />
              {formData.price && !isNaN(Number(String(formData.price).replace(',', '.'))) && (
                <span className="text-[10px] font-black text-stone-700 block mt-0.5">
                  {formatUSD(formData.price)} USD
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
                11. Sana <span className="text-rose-600">*</span>
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

          {/* 12. Ma'lumot manbaasi */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
              12. Ma'lumot manbaasi <span className="text-rose-600">*</span>
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

          {/* 13. Izoh (Ixtiyoriy) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black uppercase tracking-wider text-black block">
                13. Izoh <span className="text-stone-600 text-[10px] font-semibold lowercase">(ixtiyoriy, majburiy emas)</span>
              </label>
            </div>
            <textarea
              rows={2}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Mahsulot holati, sifati, avtomobil modeli (Cobalt, Gentra, Nexia), kafolat va boshqa eslatmalar (ixtiyoriy)..."
              className="w-full px-3 py-2 text-xs border-2 border-amber-400 focus:border-amber-600 bg-white text-black font-bold focus:outline-none rounded-none resize-none"
            />
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
