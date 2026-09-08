import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  AlertCircle,
  Calendar,
  Trash2,
  PackagePlus,
  Save,
  Package,
  CheckSquare,
  Square,
  Search,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';
import {
  Supplier,
  SupplierFormData,
  ActivityType,
  PaymentMethod,
  PaymentConditionType,
  QualityStability,
  TransparencyLevel,
  ResponsibilityType,
  DisciplineLevel,
  ExtrasType,
} from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SupplierFormData, editId?: string) => void | Promise<void>;
  currentCount: number;
  initialSupplier?: Supplier | null;
  availableProducts?: string[];
}

const DEFAULT_PRESET_PRODUCTS: string[] = [
  "G'isht",
  "Sement",
  "Qum",
  "Armatura",
  "Shag'al",
  "Profil",
  "Penoblok",
  "Bo'yoq",
  "Plitka",
  "Yog'och",
  "Truba",
  "Gipsokarton",
  "Kabel",
  "Metall",
  "Shifer",
  "Ohak",
  "Mix va vintlar",
];

const DEFAULT_FORM_STATE: SupplierFormData = {
  activityType: 'jismoniy', // 3: default jismoniy
  name: '', // 4: majburiy
  address: '', // 5: majburiy
  phone: '', // 6: majburiy
  paymentMethod: 'naqd', // 7: default naqd
  paymentCondition: 'naqd joyida', // 8: default naqd joyida
  delayDays: '30', // agar kechiktirib to'lash bo'lsa kun
  qualityStability: 'o\'rtacha', // 9: default o'rtacha
  transparencyLevel: 'shaffof', // 10: default shaffof
  responsibility: 'mahsulot sifatiga ba\'zida javob beradi', // 11: default
  disciplineLevel: 'o\'rtacha', // 12: default o'rtacha
  extras: 'yetkazib berish (pulli)', // 13: default yetkazib berish (pulli)
  products: [], // 14: ixtiyoriy mahsulotlar ro'yxati
};

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentCount,
  initialSupplier,
  availableProducts = [],
}) => {
  const isOnline = useOnlineStatus();
  const isEditMode = Boolean(initialSupplier);

  const [formData, setFormData] = useState<SupplierFormData>(DEFAULT_FORM_STATE);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [customProductCatalog, setCustomProductCatalog] = useState<string[]>([]);
  const [newProductInput, setNewProductInput] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialSupplier) {
        const initProds = initialSupplier.products && initialSupplier.products.length > 0 ? [...initialSupplier.products] : [];
        setFormData({
          activityType: initialSupplier.activityType,
          name: initialSupplier.name,
          address: initialSupplier.address,
          phone: initialSupplier.phone,
          paymentMethod: initialSupplier.paymentMethod,
          paymentCondition: initialSupplier.paymentCondition,
          delayDays: initialSupplier.delayDays ? String(initialSupplier.delayDays) : '30',
          qualityStability: initialSupplier.qualityStability,
          transparencyLevel: initialSupplier.transparencyLevel,
          responsibility: initialSupplier.responsibility,
          disciplineLevel: initialSupplier.disciplineLevel,
          extras: initialSupplier.extras,
          products: initProds,
        });
        setSelectedProducts(initProds);
      } else {
        setFormData(DEFAULT_FORM_STATE);
        setSelectedProducts([]);
      }
      setNewProductInput('');
      setProductSearch('');
      setErrors({});
    }
  }, [isOpen, initialSupplier]);

  // Barcha mavjud mahsulotlar katalogi (Preset + Available from props + Yangi qo'shilganlar + Supplier mahsulotlari)
  const allCatalogProducts = useMemo(() => {
    const set = new Set<string>();
    DEFAULT_PRESET_PRODUCTS.forEach((p) => set.add(p.trim()));
    availableProducts.forEach((p) => {
      if (p && p.trim()) set.add(p.trim());
    });
    customProductCatalog.forEach((p) => {
      if (p && p.trim()) set.add(p.trim());
    });
    selectedProducts.forEach((p) => {
      if (p && p.trim()) set.add(p.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'uz'));
  }, [availableProducts, customProductCatalog, selectedProducts]);

  // Qidiruv bo'yicha filtrlangan katalog
  const filteredCatalog = useMemo(() => {
    if (!productSearch.trim()) return allCatalogProducts;
    const q = productSearch.toLowerCase().trim();
    return allCatalogProducts.filter((p) => p.toLowerCase().includes(q));
  }, [allCatalogProducts, productSearch]);

  if (!isOpen) return null;

  // Checkbox orqali mahsulotni tanlash / bekor qilish (1 tadan ko'pini tanlash mumkin)
  const handleToggleProduct = (productName: string) => {
    setSelectedProducts((prev) => {
      const exists = prev.includes(productName);
      if (exists) {
        return prev.filter((p) => p !== productName);
      } else {
        return [...prev, productName];
      }
    });
  };

  // Yangi mahsulot qo'shish va uni avtomatik tanlash
  const handleAddNewProduct = () => {
    const trimmed = newProductInput.trim();
    if (!trimmed) return;

    if (!customProductCatalog.includes(trimmed)) {
      setCustomProductCatalog((prev) => [...prev, trimmed]);
    }
    if (!selectedProducts.includes(trimmed)) {
      setSelectedProducts((prev) => [...prev, trimmed]);
    }
    setNewProductInput('');
  };

  // Barcha mahsulotlarni tanlash (filtr bo'yicha ko'rinayotganlarini)
  const handleSelectAllFiltered = () => {
    setSelectedProducts((prev) => {
      const set = new Set(prev);
      filteredCatalog.forEach((p) => set.add(p));
      return Array.from(set);
    });
  };

  // Barchasini bekor qilish
  const handleClearSelected = () => {
    setSelectedProducts([]);
  };

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errs.name = 'Yetkazib beruvchi nomi majburiy!';
    }
    if (!formData.address.trim()) {
      errs.address = 'Manzil majburiy!';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Telefon raqam majburiy!';
    }
    if (formData.paymentCondition === 'kechiktirib to\'lash') {
      const days = parseInt(formData.delayDays, 10);
      if (!formData.delayDays || isNaN(days) || days <= 0) {
        errs.delayDays = 'Kechiktirib to\'lash muddati (kunlar soni) ni kiriting!';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      alert('Oflayn rejimda yangi yozuv qo\'shish yoki tahrirlash imkoniyati cheklangan!');
      return;
    }
    if (!validate()) return;

    // Filter out empty product items
    const cleanProducts = selectedProducts
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const submissionData: SupplierFormData = {
      ...formData,
      products: cleanProducts,
    };

    onSave(submissionData, initialSupplier?.id);
    onClose();
  };

  const nextOrderNumber = isEditMode && initialSupplier ? initialSupplier.orderNumber : currentCount + 1;
  const currentTime = isEditMode && initialSupplier
    ? initialSupplier.systemTime
    : new Date().toLocaleString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-2xs overflow-y-auto rounded-none">
      <div className="w-full max-w-2xl bg-amber-50 shadow-2xl border-4 border-amber-400 my-8 overflow-hidden text-black rounded-none">
        
        {/* Modal Header */}
        <div className="bg-yellow-200 text-black px-6 py-4 flex items-center justify-between border-b-2 border-amber-400 rounded-none">
          <div>
            <h2 className="text-lg font-black tracking-wide flex items-center gap-2 text-black font-heading">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-none" />
              {isEditMode ? "Yetkazib beruvchi ma'lumotlarini tahrirlash" : "Yangi yetkazib beruvchi qo'shish"}
            </h2>
            <p className="text-xs text-stone-800 font-semibold mt-0.5">
              {isEditMode ? `№${initialSupplier?.orderNumber} — ${initialSupplier?.name}` : "14 ta ustun bo'yicha ma'lumotlarni to'ldirish"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-black hover:bg-yellow-300 p-1.5 transition cursor-pointer rounded-none"
            aria-label="Yopish"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Automatic System Fields Notice (1-Tartib raqam, 2-Sistema vaqti) */}
          <div className="bg-yellow-100 border-2 border-amber-400 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-black rounded-none">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm bg-amber-400 border border-amber-500 text-black w-6 h-6 inline-flex items-center justify-center shadow-2xs rounded-none">
                №
              </span>
              <div>
                <span className="text-stone-700 block text-[10px] uppercase font-bold">1-Tartib raqam:</span>
                <span className="font-black text-black text-sm">#{nextOrderNumber} {isEditMode ? "(mavjud)" : "(avtomatik)"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-800 stroke-[2.5]" />
              <div>
                <span className="text-stone-700 block text-[10px] uppercase font-bold">2-Sistema vaqti:</span>
                <span className="font-black text-black">{currentTime} {isEditMode ? "(kiritilgan vaqti)" : "(avtomatik)"}</span>
              </div>
            </div>
          </div>

          {/* Section: Majburiy Asosiy Ma'lumotlar (4, 5, 6) */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-black border-b-2 border-amber-400 pb-1 font-heading">
              Asosiy majburiy ma'lumotlar
            </h3>

            {/* 4-Nom */}
            <div className="space-y-1">
              <label htmlFor="supplier-name" className="block text-xs font-black text-black">
                4. Nomi (Kompaniya yoki shaxs) <span className="text-rose-600">*</span>
              </label>
              <input
                id="supplier-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masalan: 'Artel MChJ' yoki 'Ali Valiyev'"
                className={`w-full px-3.5 py-2 text-sm border-2 bg-white text-black font-semibold placeholder-stone-400 focus:outline-none focus:ring-2 transition rounded-none ${
                  errors.name
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-amber-400 focus:ring-amber-500 focus:border-amber-500'
                }`}
                autoFocus
              />
              {errors.name && (
                <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* 5-Manzil & 6-Telefon raqam */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="supplier-address" className="block text-xs font-black text-black">
                  5. Manzil <span className="text-rose-600">*</span>
                </label>
                <input
                  id="supplier-address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Toshkent sh., Chilonzor tumani"
                  className={`w-full px-3.5 py-2 text-sm border-2 bg-white text-black font-semibold placeholder-stone-400 focus:outline-none focus:ring-2 transition rounded-none ${
                    errors.address
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-amber-400 focus:ring-amber-500 focus:border-amber-500'
                  }`}
                />
                {errors.address && (
                  <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="supplier-phone" className="block text-xs font-black text-black">
                  6. Telefon raqami <span className="text-rose-600">*</span>
                </label>
                <input
                  id="supplier-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className={`w-full px-3.5 py-2 text-sm border-2 bg-white text-black font-semibold placeholder-stone-400 focus:outline-none focus:ring-2 transition rounded-none ${
                    errors.phone
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-amber-400 focus:ring-amber-500 focus:border-amber-500'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section: 14. Taklif qilinadigan mahsulotlar ro'yxati (CHECKBOX BILAN 1 TADAN KO'PINI TANLASH) */}
          <div className="space-y-3 bg-yellow-100/80 border-2 border-amber-300 p-4 rounded-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-300 pb-2.5">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-800" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-black font-heading flex items-center gap-1.5">
                    <span>14. Taklif qilinadigan mahsulotlar</span>
                    <span className="px-1.5 py-0.2 bg-amber-300 border border-amber-500 text-[10px] font-black">
                      {selectedProducts.length} ta tanlandi
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-700 font-semibold">
                    Checkbox orqali bir vaqtning o'zida 1 tadan ko'p mahsulotni tanlashingiz mumkin
                  </p>
                </div>
              </div>

              {/* Tezkor amallar: Barchasini tanlash / Tozalash */}
              <div className="flex items-center gap-1.5 shrink-0 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="px-2 py-1 bg-yellow-200 hover:bg-yellow-300 text-black border border-amber-400 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition rounded-none"
                  title="Ko'rinayotgan barcha mahsulotlarni belgilash"
                >
                  <CheckCheck className="w-3 h-3 text-amber-900" />
                  <span>Barchasini belgilash</span>
                </button>
                {selectedProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="px-2 py-1 bg-yellow-200 hover:bg-rose-200 text-black hover:text-rose-800 border border-amber-400 hover:border-rose-400 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition rounded-none"
                    title="Barcha tanlanganlarni tozalash"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Tozalash</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tanlangan mahsulotlar ro'yxati (Tags) */}
            {selectedProducts.length > 0 ? (
              <div className="bg-white/80 p-2.5 border border-amber-300">
                <span className="text-[10px] font-black uppercase text-stone-600 block mb-1.5">
                  Tanlangan mahsulotlar ({selectedProducts.length}):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {selectedProducts.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-200 text-black font-bold text-xs border border-amber-400 shadow-2xs rounded-none"
                    >
                      <span>{p}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleProduct(p)}
                        className="text-stone-700 hover:text-rose-700 hover:scale-110 cursor-pointer"
                        title="Olib tashlash"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-2 px-3 bg-amber-50 border border-dashed border-amber-300 text-xs text-stone-600 font-medium">
                Hozircha birorta mahsulot tanlanmagan. Quyidagi checkboxlar orqali kerakli mahsulotlarni belgilang (ixtiyoriy).
              </div>
            )}

            {/* Qidiruv va yangi mahsulot qo'shish qatori */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* Qidiruv inputi */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-500" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Mahsulotlarni qidirish..."
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-amber-400 bg-white text-black font-bold focus:outline-none focus:border-amber-600 rounded-none"
                />
              </div>

              {/* Yangi mahsulot nomi qo'shish */}
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newProductInput}
                  onChange={(e) => setNewProductInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewProduct();
                    }
                  }}
                  placeholder="Ro'yxatda yo'q mahsulot..."
                  className="flex-1 px-2.5 py-1.5 text-xs border border-amber-400 bg-white text-black font-bold focus:outline-none focus:border-amber-600 rounded-none"
                />
                <button
                  type="button"
                  onClick={handleAddNewProduct}
                  disabled={!newProductInput.trim()}
                  className={`px-3 py-1.5 text-xs font-black flex items-center gap-1 border transition rounded-none ${
                    newProductInput.trim()
                      ? 'bg-amber-400 hover:bg-amber-500 text-black border-amber-600 cursor-pointer active:scale-95'
                      : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed'
                  }`}
                  title="Yangi mahsulotni ro'yxatga qo'shish va tanlash"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Qo'shish</span>
                </button>
              </div>
            </div>

            {/* Checkboxlar ro'yxati (1 tadan ko'pini tanlash mumkin) */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-stone-700 block">
                Mavjud mahsulotlar (Checkbox orqali belgilang):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-2 bg-yellow-50 border border-amber-300">
                {filteredCatalog.map((prodName) => {
                  const isChecked = selectedProducts.includes(prodName);
                  return (
                    <label
                      key={prodName}
                      className={`flex items-center gap-2 p-1.5 border transition select-none cursor-pointer rounded-none text-xs font-bold ${
                        isChecked
                          ? 'bg-amber-300 border-amber-600 text-black shadow-2xs'
                          : 'bg-white hover:bg-amber-100 border-amber-200 text-stone-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleProduct(prodName)}
                        className="w-4 h-4 accent-amber-600 border-amber-400 rounded-none cursor-pointer"
                      />
                      <span className="truncate text-[11px]">{prodName}</span>
                    </label>
                  );
                })}

                {filteredCatalog.length === 0 && (
                  <div className="col-span-full py-3 text-center text-xs text-stone-600 font-medium">
                    "{productSearch}" bo'yicha mahsulot topilmadi. Yuqoridagi «Qo'shish» maydoni orqali yangi mahsulot kiriting.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Tanlovlar (Standart default qiymatlar bilan to'ldirilgan) */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-black border-b-2 border-amber-400 pb-1 font-heading">
              Faoliyat va to'lov shartlari (standart avtomatik tanlangan)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 3-Faoliyat turi (Default: jismoniy) */}
              <div className="space-y-1">
                <label htmlFor="supplier-activity" className="block text-xs font-black text-black">
                  3. Faoliyat turi <span className="text-stone-700 text-[10px] font-semibold">(avto: jismoniy)</span>
                </label>
                <select
                  id="supplier-activity"
                  value={formData.activityType}
                  onChange={(e) => setFormData({ ...formData, activityType: e.target.value as ActivityType })}
                  className="w-full px-3.5 py-2 text-sm border-2 border-amber-400 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-none"
                >
                  <option value="jismoniy">jismoniy</option>
                  <option value="yuridik">yuridik</option>
                </select>
              </div>

              {/* 7-Pul o'tkazmalari (Default: naqd) */}
              <div className="space-y-1">
                <label htmlFor="supplier-payment-method" className="block text-xs font-black text-black">
                  7. Pul o'tkazmalari <span className="text-stone-700 text-[10px] font-semibold">(avto: naqd)</span>
                </label>
                <select
                  id="supplier-payment-method"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-3.5 py-2 text-sm border-2 border-amber-400 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-none"
                >
                  <option value="naqd">naqd</option>
                  <option value="bank orqali">bank orqali</option>
                  <option value="bank kartalari orqali">bank kartalari orqali</option>
                </select>
              </div>

              {/* 8-To'lov sharti (Default: naqd joyida) */}
              <div className="space-y-1">
                <label htmlFor="supplier-payment-condition" className="block text-xs font-black text-black">
                  8. To'lov sharti <span className="text-stone-700 text-[10px] font-semibold">(avto: naqd joyida)</span>
                </label>
                <select
                  id="supplier-payment-condition"
                  value={formData.paymentCondition}
                  onChange={(e) => setFormData({ ...formData, paymentCondition: e.target.value as PaymentConditionType })}
                  className="w-full px-3.5 py-2 text-sm border-2 border-amber-400 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-none"
                >
                  <option value="naqd joyida">naqd joyida</option>
                  <option value="kechiktirib to'lash">kechiktirib to'lash</option>
                </select>
              </div>

              {/* Kechiktirib to'lash bo'lsa: kun kiritish */}
              {formData.paymentCondition === 'kechiktirib to\'lash' ? (
                <div className="space-y-1">
                  <label htmlFor="supplier-delay-days" className="block text-xs font-black text-amber-950">
                    Kechiktirish muddati (kun) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="supplier-delay-days"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.delayDays}
                    onChange={(e) => setFormData({ ...formData, delayDays: e.target.value })}
                    placeholder="Masalan: 30"
                    className="w-full px-3.5 py-2 text-sm border-2 border-amber-600 bg-yellow-100 text-black font-bold focus:outline-none focus:ring-2 focus:ring-amber-600 rounded-none"
                  />
                  {errors.delayDays && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.delayDays}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <label htmlFor="supplier-quality" className="block text-xs font-black text-black">
                    9. Sifat barqarorligi <span className="text-stone-700 text-[10px] font-semibold">(avto: o'rtacha)</span>
                  </label>
                  <select
                    id="supplier-quality"
                    value={formData.qualityStability}
                    onChange={(e) => setFormData({ ...formData, qualityStability: e.target.value as QualityStability })}
                    className="w-full px-3.5 py-2 text-sm border-2 border-amber-400 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-none"
                  >
                    <option value="yomon">yomon</option>
                    <option value="o'rtacha">o'rtacha</option>
                    <option value="yaxshi">yaxshi</option>
                  </select>
                </div>
              )}

              {/* Agar kechiktirib to'lash bo'lsa sifat barqarorligi alohida joyda */}
              {formData.paymentCondition === 'kechiktirib to\'lash' && (
                <div className="space-y-1">
                  <label htmlFor="supplier-quality-alt" className="block text-xs font-black text-black">
                    9. Sifat barqarorligi <span className="text-stone-700 text-[10px] font-semibold">(avto: o'rtacha)</span>
                  </label>
                  <select
                    id="supplier-quality-alt"
                    value={formData.qualityStability}
                    onChange={(e) => setFormData({ ...formData, qualityStability: e.target.value as QualityStability })}
                    className="w-full px-3.5 py-2 text-sm border-2 border-amber-400 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-none"
                  >
                    <option value="yomon">yomon</option>
                    <option value="o'rtacha">o'rtacha</option>
                    <option value="yaxshi">yaxshi</option>
                  </select>
                </div>
              )}

              {/* 10-Shaffoflik darajasi (Default: shaffof) */}
              <div className="space-y-1">
                <label htmlFor="supplier-transparency" className="block text-xs font-black text-black">
                  10. Shaffoflik darajasi <span className="text-stone-700 text-[10px] font-semibold">(avto: shaffof)</span>
                </label>
                <select
                  id="supplier-transparency"
                  value={formData.transparencyLevel}
                  onChange={(e) => setFormData({ ...formData, transparencyLevel: e.target.value as TransparencyLevel })}
                  className="w-full px-3.5 py-2 text-sm border-2 border-amber-400 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-none"
                >
                  <option value="shaffof">shaffof</option>
                  <option value="shubhali">shubhali</option>
                </select>
              </div>

              {/* 12-Intizom darajasi (Default: o'rtacha) */}
              <div className="space-y-1">
                <label htmlFor="supplier-discipline" className="block text-xs font-black text-black">
                  12. Intizom darajasi <span className="text-stone-700 text-[10px] font-semibold">(avto: o'rtacha)</span>
                </label>
                <select
                  id="supplier-discipline"
                  value={formData.disciplineLevel}
                  onChange={(e) => setFormData({ ...formData, disciplineLevel: e.target.value as DisciplineLevel })}
                  className="w-full px-3.5 py-2 text-sm border-2 border-amber-400 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-none"
                >
                  <option value="vaqtida">vaqtida</option>
                  <option value="o'rtacha">o'rtacha</option>
                  <option value="kechikadi">kechikadi</option>
                </select>
              </div>

              {/* 13-Qo'shimchalar (Default: yetkazib berish (pulli)) */}
              <div className="space-y-1">
                <label htmlFor="supplier-extras" className="block text-xs font-black text-black">
                  13. Qo'shimchalar <span className="text-stone-700 text-[10px] font-semibold">(avto: pulli)</span>
                </label>
                <select
                  id="supplier-extras"
                  value={formData.extras}
                  onChange={(e) => setFormData({ ...formData, extras: e.target.value as ExtrasType })}
                  className="w-full px-3.5 py-2 text-sm border-2 border-amber-400 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-none"
                >
                  <option value="yetkazib berish (pulli)">yetkazib berish (pulli)</option>
                  <option value="yetkazib berish (bepul)">yetkazib berish (bepul)</option>
                </select>
              </div>
            </div>

            {/* 11-Javobgarlik (Default: mahsulot sifatiga ba'zida javob beradi) */}
            <div className="space-y-1 pt-1">
              <label htmlFor="supplier-responsibility" className="block text-xs font-black text-black">
                11. Javobgarlik <span className="text-stone-700 text-[10px] font-semibold">(avto: ba'zida javob beradi)</span>
              </label>
              <select
                id="supplier-responsibility"
                value={formData.responsibility}
                onChange={(e) => setFormData({ ...formData, responsibility: e.target.value as ResponsibilityType })}
                className="w-full px-3.5 py-2 text-sm border-2 border-amber-400 bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-none"
              >
                <option value="mahsulot sifatiga ba'zida javob beradi">
                  mahsulot sifatiga ba'zida javob beradi
                </option>
                <option value="mahsulot sifatiga javob beradi">
                  mahsulot sifatiga javob beradi
                </option>
                <option value="mahsulot sifatiga javob bermaydi">
                  mahsulot sifatiga javob bermaydi
                </option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t-2 border-amber-400 flex items-center justify-end gap-3 rounded-none">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-black border-2 border-amber-400 bg-yellow-100 hover:bg-yellow-200 text-black transition cursor-pointer rounded-none"
            >
              Bekor qilish
            </button>
            <button
              id="submit-supplier-form-btn"
              type="submit"
              disabled={!isOnline}
              className={`px-5 py-2 text-sm font-black border-2 shadow-sm flex items-center gap-2 transition rounded-none ${
                !isOnline
                  ? 'bg-stone-300 border-stone-400 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-500 text-black border-amber-500 cursor-pointer active:scale-95'
              }`}
              title={!isOnline ? 'Oflayn rejimda yozuv qo\'shib bo\'lmaydi' : isEditMode ? 'O\'zgarishlarni saqlash' : 'Jadvalga qo\'shish'}
            >
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 stroke-[3]" />
                  <span>O'zgarishlarni saqlash</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Jadvalga qo'shish</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
