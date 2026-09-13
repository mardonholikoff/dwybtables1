import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Plus,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Calendar,
  Building2,
  Tag,
  WifiOff,
  AlertTriangle,
  LayoutList,
  Table as TableIcon,
  Clock,
  Info,
  Filter,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { AutoPart } from '../types';
import { exportAutoPartsToExcel } from '../utils/excelExport';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { formatUSD } from '../utils/formatCurrency';

interface AutoPartsTableProps {
  parts: AutoPart[];
  onOpenAddModal: () => void;
  onEditPart: (part: AutoPart) => void;
  onDeletePart: (id: string) => void;
}

export const AutoPartsTable: React.FC<AutoPartsTableProps> = ({
  parts,
  onOpenAddModal,
  onEditPart,
  onDeletePart,
}) => {
  const isOnline = useOnlineStatus();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  // Mobilda ko'rinish rejimi: 'cards' (ixcham kartalar) yoki 'table' (gorizontal suriladigan jadval)
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');

  // Filtr holatlari: moy nomi, kod, api, litr, davlat, brend, yetkazib beruvchi, narx, sana, manbaa
  const [filterPartName, setFilterPartName] = useState<string>('');
  const [filterCode, setFilterCode] = useState<string>('');
  const [filterApi, setFilterApi] = useState<string>('');
  const [filterLiters, setFilterLiters] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [filterSupplier, setFilterSupplier] = useState<string>('');
  const [filterMinPrice, setFilterMinPrice] = useState<string>('');
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('');

  // 1. Bazadagi unikal moy nomlari
  const uniquePartNames = useMemo(() => {
    const map = new Map<string, number>();
    parts.forEach((p) => {
      const name = p.partName?.trim();
      if (name) map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [parts]);

  // Bazadagi unikal kodlar
  const uniqueCodes = useMemo(() => {
    const map = new Map<string, number>();
    parts.forEach((p) => {
      const code = p.code?.trim();
      if (code) map.set(code, (map.get(code) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [parts]);

  // Bazadagi unikal API'lar
  const uniqueApis = useMemo(() => {
    const map = new Map<string, number>();
    parts.forEach((p) => {
      const api = p.api?.trim();
      if (api) map.set(api, (map.get(api) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([api, count]) => ({ api, count }))
      .sort((a, b) => a.api.localeCompare(b.api));
  }, [parts]);

  // Bazadagi unikal litrlar
  const uniqueLiters = useMemo(() => {
    const map = new Map<string, number>();
    parts.forEach((p) => {
      const lit = p.liters?.trim();
      if (lit) map.set(lit, (map.get(lit) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([liters, count]) => ({ liters, count }))
      .sort((a, b) => a.liters.localeCompare(b.liters));
  }, [parts]);

  // Bazadagi unikal davlatlar
  const uniqueCountries = useMemo(() => {
    const map = new Map<string, number>();
    parts.forEach((p) => {
      const c = p.country?.trim();
      if (c) map.set(c, (map.get(c) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [parts]);

  // 2. Bazadagi unikal brendlar
  const uniqueBrands = useMemo(() => {
    const map = new Map<string, number>();
    parts.forEach((p) => {
      const brand = p.brand?.trim();
      if (brand) map.set(brand, (map.get(brand) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [parts]);

  // 3. Bazadagi unikal yetkazib beruvchilar
  const uniqueSuppliers = useMemo(() => {
    const map = new Map<string, number>();
    parts.forEach((p) => {
      const sup = p.supplierName?.trim();
      if (sup) map.set(sup, (map.get(sup) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([supplier, count]) => ({ supplier, count }))
      .sort((a, b) => a.supplier.localeCompare(b.supplier));
  }, [parts]);

  // 4. Bazadagi unikal manbalar
  const uniqueSources = useMemo(() => {
    const map = new Map<string, number>();
    parts.forEach((p) => {
      const src = p.source?.trim();
      if (src) map.set(src, (map.get(src) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => a.source.localeCompare(b.source));
  }, [parts]);

  // Filtr faolligini tekshirish
  const isFilterActive = Boolean(
    filterPartName ||
    filterCode ||
    filterApi ||
    filterLiters ||
    filterCountry ||
    filterBrand ||
    filterSupplier ||
    filterMinPrice !== '' ||
    filterMaxPrice !== '' ||
    filterStartDate ||
    filterEndDate ||
    filterSource
  );

  const handleResetFilters = () => {
    setFilterPartName('');
    setFilterCode('');
    setFilterApi('');
    setFilterLiters('');
    setFilterCountry('');
    setFilterBrand('');
    setFilterSupplier('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterSource('');
  };

  // Tanlangan filtrlar bo'yicha saralangan / elangan avto moylar ro'yxati
  const filteredParts = useMemo(() => {
    return parts.filter((item) => {
      // Moy nomi bo'yicha filtr
      if (filterPartName && item.partName !== filterPartName) {
        return false;
      }
      // Kod bo'yicha filtr
      if (filterCode && (item.code || '') !== filterCode) {
        return false;
      }
      // API bo'yicha filtr
      if (filterApi && (item.api || '') !== filterApi) {
        return false;
      }
      // Litr bo'yicha filtr
      if (filterLiters && (item.liters || '') !== filterLiters) {
        return false;
      }
      // Davlat bo'yicha filtr
      if (filterCountry && (item.country || '') !== filterCountry) {
        return false;
      }
      // Brend bo'yicha filtr
      if (filterBrand && item.brand !== filterBrand) {
        return false;
      }
      // Yetkazib beruvchi bo'yicha filtr
      if (filterSupplier && item.supplierName !== filterSupplier) {
        return false;
      }
      // Narx bo'yicha filtr (min va max oralig'i)
      if (filterMinPrice !== '' && !isNaN(Number(filterMinPrice))) {
        if ((item.price || 0) < Number(filterMinPrice)) return false;
      }
      if (filterMaxPrice !== '' && !isNaN(Number(filterMaxPrice))) {
        if ((item.price || 0) > Number(filterMaxPrice)) return false;
      }
      // Sana bo'yicha filtr (boshlanish va tugash sanasi)
      if (filterStartDate && item.date < filterStartDate) {
        return false;
      }
      if (filterEndDate && item.date > filterEndDate) {
        return false;
      }
      // Manbaa bo'yicha filtr
      if (filterSource && item.source !== filterSource) {
        return false;
      }
      return true;
    });
  }, [
    parts,
    filterPartName,
    filterCode,
    filterApi,
    filterLiters,
    filterCountry,
    filterBrand,
    filterSupplier,
    filterMinPrice,
    filterMaxPrice,
    filterStartDate,
    filterEndDate,
    filterSource,
  ]);

  const handleExport = () => {
    exportAutoPartsToExcel(filteredParts);
  };

  const confirmDelete = (id: string) => {
    if (!isOnline) {
      alert('Oflayn rejimda yozuvni o\'chirish imkoniyati cheklangan!');
      return;
    }
    setDeleteTargetId(id);
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      onDeletePart(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <div id="autoparts-container" className="w-full space-y-3">
      {/* Top action toolbar */}
      <div className="bg-yellow-100/95 border-2 border-amber-400 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-black rounded-none">
        
        {/* Title & Count (Jami qiymat o'chirildi) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 bg-amber-400 border border-amber-600 text-black shrink-0">
            <Wrench className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-black font-heading truncate">
                Avto Moylar
              </h1>
              <span className="px-2 py-0.5 bg-amber-300 border border-amber-500 text-xs font-black shrink-0">
                {isFilterActive
                  ? `${filteredParts.length} / ${parts.length} ta yozuv`
                  : `${parts.length} ta yozuv`}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons: Add & Excel Export */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Excel Export */}
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-200 hover:bg-amber-300 border-2 border-amber-500 text-black text-xs font-black transition cursor-pointer active:scale-95 shadow-2xs rounded-none"
            title="Avto moylar jadvalini Excel (.xlsx) formatida yuklab olish"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-800 stroke-[2.5]" />
            <span>Excel {isFilterActive ? `(${filteredParts.length})` : '(.xlsx)'}</span>
          </button>

          {/* Add Part (Disabled when offline) */}
          <button
            type="button"
            onClick={onOpenAddModal}
            disabled={!isOnline}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 border-2 text-xs font-black transition rounded-none shadow-sm ${
              !isOnline
                ? 'bg-stone-200 border-stone-400 text-stone-500 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-500 border-amber-600 text-black cursor-pointer active:scale-95'
            }`}
            title={
              !isOnline
                ? 'Oflayn rejim: Baza faqat ko\'rish uchun ochiq, yangi yozuv qo\'shib bo\'lmaydi'
                : 'Yangi avto moy qo\'shish'
            }
          >
            {!isOnline ? (
              <WifiOff className="w-4 h-4 text-rose-700 stroke-[2.5]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[3]" />
            )}
            <span>
              {!isOnline ? 'Oflayn' : '+ Yangi avto moy'}
            </span>
          </button>
        </div>
      </div>

      {/* 2-Jadval Filtr Paneli */}
      <div className="bg-yellow-50/90 border-2 border-amber-400 p-3 sm:p-3.5 shadow-sm space-y-2.5 text-black">
        {/* Filtr panel bosh qismi */}
        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-amber-300">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 bg-amber-400 border border-amber-600 text-black shrink-0">
              <Filter className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="font-black text-xs uppercase tracking-wider text-black">
              Filtrlar (Moy nomi, Kod, API, Litr, Davlat, Brend, Yetkazib beruvchi, Narx, Sana, Manbaa)
            </span>
            {isFilterActive && (
              <span className="px-1.5 py-0.5 bg-amber-300 border border-amber-600 text-[10px] font-black text-black">
                {filteredParts.length} ta natija
              </span>
            )}
          </div>

          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-200 border-2 border-amber-500 text-black text-[11px] font-black transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <RotateCcw className="w-3 h-3 text-amber-900" />
              <span>Barcha filtrlarni tozalash</span>
            </button>
          )}
        </div>

        {/* Filtr ustunlari */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* 1. Moy nomi */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-700 block truncate">
              Moy nomi:
            </label>
            <select
              value={filterPartName}
              onChange={(e) => setFilterPartName(e.target.value)}
              className="w-full px-2 py-1.5 text-xs font-bold border-2 border-amber-400 bg-white text-black focus:outline-none focus:border-amber-600 rounded-none cursor-pointer truncate"
            >
              <option value="">Barchasi ({uniquePartNames.length})</option>
              {uniquePartNames.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name} ({item.count})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Kod */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-700 block truncate">
              Kod:
            </label>
            <select
              value={filterCode}
              onChange={(e) => setFilterCode(e.target.value)}
              className="w-full px-2 py-1.5 text-xs font-mono font-bold border-2 border-amber-400 bg-white text-black focus:outline-none focus:border-amber-600 rounded-none cursor-pointer truncate"
            >
              <option value="">Barchasi ({uniqueCodes.length})</option>
              {uniqueCodes.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} ({item.count})
                </option>
              ))}
            </select>
          </div>

          {/* 3. API */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-700 block truncate">
              API:
            </label>
            <select
              value={filterApi}
              onChange={(e) => setFilterApi(e.target.value)}
              className="w-full px-2 py-1.5 text-xs font-bold border-2 border-amber-400 bg-white text-black focus:outline-none focus:border-amber-600 rounded-none cursor-pointer truncate"
            >
              <option value="">Barchasi ({uniqueApis.length})</option>
              {uniqueApis.map((item) => (
                <option key={item.api} value={item.api}>
                  {item.api} ({item.count})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Litr */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-700 block truncate">
              Litr:
            </label>
            <select
              value={filterLiters}
              onChange={(e) => setFilterLiters(e.target.value)}
              className="w-full px-2 py-1.5 text-xs font-bold border-2 border-amber-400 bg-white text-black focus:outline-none focus:border-amber-600 rounded-none cursor-pointer truncate"
            >
              <option value="">Barchasi ({uniqueLiters.length})</option>
              {uniqueLiters.map((item) => (
                <option key={item.liters} value={item.liters}>
                  {item.liters} ({item.count})
                </option>
              ))}
            </select>
          </div>

          {/* 5. Ishlab chiqarilgan davlat */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-700 block truncate">
              Davlat:
            </label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full px-2 py-1.5 text-xs font-bold border-2 border-amber-400 bg-white text-black focus:outline-none focus:border-amber-600 rounded-none cursor-pointer truncate"
            >
              <option value="">Barchasi ({uniqueCountries.length})</option>
              {uniqueCountries.map((item) => (
                <option key={item.country} value={item.country}>
                  {item.country} ({item.count})
                </option>
              ))}
            </select>
          </div>

          {/* 6. Brend */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-700 block truncate">
              Brend:
            </label>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="w-full px-2 py-1.5 text-xs font-bold border-2 border-amber-400 bg-white text-black focus:outline-none focus:border-amber-600 rounded-none cursor-pointer truncate"
            >
              <option value="">Barchasi ({uniqueBrands.length})</option>
              {uniqueBrands.map((item) => (
                <option key={item.brand} value={item.brand}>
                  {item.brand} ({item.count})
                </option>
              ))}
            </select>
          </div>

          {/* 7. Yetkazib beruvchi */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-700 block truncate">
              Yetkazib beruvchi:
            </label>
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="w-full px-2 py-1.5 text-xs font-bold border-2 border-amber-400 bg-white text-black focus:outline-none focus:border-amber-600 rounded-none cursor-pointer truncate"
            >
              <option value="">Barchasi ({uniqueSuppliers.length})</option>
              {uniqueSuppliers.map((item) => (
                <option key={item.supplier} value={item.supplier}>
                  {item.supplier} ({item.count})
                </option>
              ))}
            </select>
          </div>

          {/* 8. Narx ($ / USD) */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-700 block truncate">
              Narx ($):
            </label>
            <div className="grid grid-cols-2 gap-1">
              <input
                type="number"
                value={filterMinPrice}
                onChange={(e) => setFilterMinPrice(e.target.value)}
                placeholder="Min $"
                className="w-full px-1.5 py-1 text-xs font-mono font-bold border-2 border-amber-400 bg-white text-black focus:outline-none focus:border-amber-600 rounded-none"
              />
              <input
                type="number"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
                placeholder="Max $"
                className="w-full px-1.5 py-1 text-xs font-mono font-bold border-2 border-amber-400 bg-white text-black focus:outline-none focus:border-amber-600 rounded-none"
              />
            </div>
          </div>

          {/* 9. Sana oralig'i */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-700 block truncate">
              Sana oralig'i:
            </label>
            <div className="grid grid-cols-2 gap-1">
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-1 py-1 text-[10px] font-mono font-bold border-2 border-amber-400 bg-white text-black focus:outline-none focus:border-amber-600 rounded-none"
                title="Boshlanish sanasi (Dan)"
              />
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full px-1 py-1 text-[10px] font-mono font-bold border-2 border-amber-400 bg-white text-black focus:outline-none focus:border-amber-600 rounded-none"
                title="Tugash sanasi (Gacha)"
              />
            </div>
          </div>

          {/* 10. Manbaa */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-stone-700 block truncate">
              Manbaa:
            </label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full px-2 py-1.5 text-xs font-bold border-2 border-amber-400 bg-white text-black focus:outline-none focus:border-amber-600 rounded-none cursor-pointer truncate"
            >
              <option value="">Barchasi ({uniqueSources.length})</option>
              {uniqueSources.map((item) => (
                <option key={item.source} value={item.source}>
                  {item.source} ({item.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Faol filtrlar teglari */}
        {isFilterActive && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-amber-200 text-[11px]">
            <span className="text-[10px] font-black uppercase text-stone-600">Faol:</span>
            {filterPartName && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-200 border border-amber-500 font-bold text-black">
                Moy: <strong>{filterPartName}</strong>
                <button
                  type="button"
                  onClick={() => setFilterPartName('')}
                  className="hover:text-rose-700 ml-0.5 font-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {filterCode && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-200 border border-amber-500 font-bold text-black">
                Kod: <strong>{filterCode}</strong>
                <button
                  type="button"
                  onClick={() => setFilterCode('')}
                  className="hover:text-rose-700 ml-0.5 font-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {filterApi && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-200 border border-amber-500 font-bold text-black">
                API: <strong>{filterApi}</strong>
                <button
                  type="button"
                  onClick={() => setFilterApi('')}
                  className="hover:text-rose-700 ml-0.5 font-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {filterLiters && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-200 border border-amber-500 font-bold text-black">
                Litr: <strong>{filterLiters}</strong>
                <button
                  type="button"
                  onClick={() => setFilterLiters('')}
                  className="hover:text-rose-700 ml-0.5 font-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {filterCountry && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-200 border border-amber-500 font-bold text-black">
                Davlat: <strong>{filterCountry}</strong>
                <button
                  type="button"
                  onClick={() => setFilterCountry('')}
                  className="hover:text-rose-700 ml-0.5 font-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {filterBrand && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-200 border border-amber-500 font-bold text-black">
                Brend: <strong>{filterBrand}</strong>
                <button
                  type="button"
                  onClick={() => setFilterBrand('')}
                  className="hover:text-rose-700 ml-0.5 font-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {filterSupplier && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-200 border border-amber-500 font-bold text-black">
                Yetkazuvchi: <strong>{filterSupplier}</strong>
                <button
                  type="button"
                  onClick={() => setFilterSupplier('')}
                  className="hover:text-rose-700 ml-0.5 font-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {(filterMinPrice !== '' || filterMaxPrice !== '') && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-200 border border-amber-500 font-bold text-black">
                Narx: <strong>{filterMinPrice || '0'}$ - {filterMaxPrice || '∞'}$</strong>
                <button
                  type="button"
                  onClick={() => { setFilterMinPrice(''); setFilterMaxPrice(''); }}
                  className="hover:text-rose-700 ml-0.5 font-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {(filterStartDate || filterEndDate) && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-200 border border-amber-500 font-bold text-black">
                Sana: <strong>{filterStartDate || '...'} / {filterEndDate || '...'}</strong>
                <button
                  type="button"
                  onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
                  className="hover:text-rose-700 ml-0.5 font-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {filterSource && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-200 border border-amber-500 font-bold text-black">
                Manba: <strong>{filterSource}</strong>
                <button
                  type="button"
                  onClick={() => setFilterSource('')}
                  className="hover:text-rose-700 ml-0.5 font-black cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Offline banner notification if disconnected */}
      {!isOnline && (
        <div className="bg-amber-200 border-2 border-amber-400 p-2.5 text-xs font-black text-stone-900 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-rose-700 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              Oflayn rejim: Ma'lumotlar to'liq ko'rinmoqda, ammo yangi yozuv qo'shish yoki o'chirish taqiqlangan.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-yellow-100 border border-amber-500 text-[10px] uppercase font-black shrink-0">
            Faqat ko'rish
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MOBIL VERSIYA (Faqat md ekrangacha ko'rinadi, ixcham va moslashuvchan)  */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-2.5">
        {/* Mobil ko'rinish almashtirgichi (Kartalar yoki Gorizontal jadval) */}
        <div className="flex items-center justify-between gap-2 bg-yellow-100 border-2 border-amber-400 p-2 text-xs font-black shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-800">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Mobil ko'rinish:</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileViewMode('cards')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-black border transition cursor-pointer ${
                mobileViewMode === 'cards'
                  ? 'bg-amber-400 border-amber-600 text-black shadow-xs'
                  : 'bg-yellow-200/60 hover:bg-yellow-200 border-amber-300 text-stone-700'
              }`}
            >
              <LayoutList className="w-3 h-3" />
              <span>Ixcham kartalar</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-black border transition cursor-pointer ${
                mobileViewMode === 'table'
                  ? 'bg-amber-400 border-amber-600 text-black shadow-xs'
                  : 'bg-yellow-200/60 hover:bg-yellow-200 border-amber-300 text-stone-700'
              }`}
            >
              <TableIcon className="w-3 h-3" />
              <span>Jadval</span>
            </button>
          </div>
        </div>

        {/* REJIM A: MOBIL IXCHAM KARTALAR (Ekran bo'yicha 100% sig'adi, chiroyli va ixcham) */}
        {mobileViewMode === 'cards' && (
          <div className="space-y-2.5">
            {parts.length === 0 ? (
              <div className="p-6 text-center bg-yellow-50/70 border-2 border-amber-300 text-black">
                <Wrench className="w-7 h-7 text-amber-500 mx-auto mb-1.5 opacity-60" />
                <p className="font-black text-sm text-stone-800">Hozircha avto moylar yo'q</p>
                <p className="text-xs text-stone-600 mt-1">
                  Yangi avto moy qo'shish uchun "+ Yangi avto moy" tugmasini bosing
                </p>
              </div>
            ) : filteredParts.length === 0 ? (
              <div className="p-6 text-center bg-yellow-50/70 border-2 border-amber-300 text-black space-y-2">
                <Filter className="w-7 h-7 text-amber-600 mx-auto opacity-70" />
                <p className="font-black text-sm text-stone-800">Belgilangan filtrlar bo'yicha avto moy topilmadi</p>
                <p className="text-xs text-stone-600">Filtrlarni o'zgartiring yoki tozalang.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 bg-amber-300 hover:bg-amber-400 border-2 border-amber-500 text-black text-xs font-black transition cursor-pointer"
                >
                  Filtrlarni tozalash
                </button>
              </div>
            ) : (
              filteredParts.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white border-2 border-amber-400 p-3 shadow-xs space-y-2.5 text-black"
                >
                  {/* Yuqori satr: Tartib raqam, Qism nomi va Narx */}
                  <div className="flex items-start justify-between gap-2 border-b border-amber-200 pb-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 bg-amber-400 border border-amber-600 font-mono font-black text-xs text-black shrink-0">
                        №{item.orderNumber || idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h2 className="font-black text-sm text-black leading-snug break-words">
                          {item.partName}
                        </h2>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 bg-amber-200 border border-amber-400 text-[10px] font-black uppercase text-black">
                            {item.brand}
                          </span>
                          <span className="text-[10px] font-mono text-stone-600 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-stone-500" />
                            {item.systemTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Narx */}
                    <div className="text-right shrink-0">
                      <div className="px-2 py-1 bg-yellow-200 border border-amber-500 font-mono font-black text-xs text-black shadow-2xs whitespace-nowrap">
                        {formatUSD(item.price)}
                      </div>
                    </div>
                  </div>

                  {/* Detallar to'ri */}
                  <div className="grid grid-cols-1 gap-1.5 text-xs">
                    {/* Yangi maydonlar: Kod, API, Litr, Davlat */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-yellow-100/70 p-2 border border-amber-300 text-[11px]">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">Kod:</span>
                        <span className="font-mono font-black text-black break-all">{item.code || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">API:</span>
                        <span className="font-bold text-stone-900 break-all">{item.api || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">Litr:</span>
                        <span className="font-black text-black">{item.liters || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">Davlat:</span>
                        <span className="font-bold text-stone-900">{item.country || '-'}</span>
                      </div>
                    </div>

                    {/* Yetkazib beruvchi */}
                    <div className="flex items-start gap-1.5 text-stone-800">
                      <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-stone-500 block">Yetkazib beruvchi:</span>
                        <span className="font-black text-stone-900 break-words">{item.supplierName}</span>
                      </div>
                    </div>

                    {/* Sana & Manba */}
                    <div className="grid grid-cols-2 gap-2 bg-yellow-50/80 p-2 border border-amber-200 text-[11px]">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">Sana:</span>
                        <span className="font-mono font-bold text-black flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-700" />
                          {item.date}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">Ma'lumot manbaasi:</span>
                        <span className="font-bold text-stone-900 break-words flex items-center gap-1">
                          <Tag className="w-3 h-3 text-amber-700 shrink-0" />
                          {item.source}
                        </span>
                      </div>
                    </div>

                    {/* Izoh */}
                    {item.comment && (
                      <div className="bg-stone-50 p-2 border border-stone-200 text-[11px] text-stone-700 break-words">
                        <span className="text-[9px] uppercase font-black text-stone-500 block">Izoh:</span>
                        <p className="italic">{item.comment}</p>
                      </div>
                    )}
                  </div>

                  {/* Pastki qism: Tahrirlash va O'chirish tugmalari */}
                  <div className="flex items-center justify-end gap-2 border-t border-amber-200 pt-2">
                    <button
                      type="button"
                      onClick={() => onEditPart(item)}
                      disabled={!isOnline}
                      className={`flex items-center gap-1 px-3 py-1.5 border text-xs font-black transition cursor-pointer ${
                        !isOnline
                          ? 'bg-stone-100 border-stone-300 text-stone-400 cursor-not-allowed'
                          : 'bg-yellow-200 hover:bg-yellow-300 border-amber-400 text-black active:scale-95'
                      }`}
                    >
                      <Edit2 className="w-3 h-3 stroke-[2.5]" />
                      <span>Tahrirlash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(item.id)}
                      disabled={!isOnline}
                      className={`flex items-center gap-1 px-3 py-1.5 border text-xs font-black transition cursor-pointer ${
                        !isOnline
                          ? 'bg-stone-100 border-stone-300 text-stone-400 cursor-not-allowed'
                          : 'bg-rose-100 hover:bg-rose-200 border-rose-400 text-rose-800 active:scale-95'
                      }`}
                    >
                      <Trash2 className="w-3 h-3 stroke-[2.5]" />
                      <span>O'chirish</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* REJIM B: MOBILDA GORIZONTAL SURILADIGAN JADVAL (Ustunlar siqilmasdan to'liq ko'rinadi) */}
        {mobileViewMode === 'table' && (
          <div className="space-y-1">
            <p className="text-[10px] text-stone-600 font-bold italic px-1">
              ↔ Barcha ustunlarni ko'rish uchun jadvalni chapga/o'ngga suring (swipe)
            </p>
            <div className="border-2 border-amber-400 bg-white shadow-sm overflow-x-auto">
              <table className="min-w-[1100px] w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-yellow-200 border-b-2 border-amber-400 text-black text-[10px] font-black uppercase">
                    <th className="p-2 border-r border-amber-300 w-10 text-center">№</th>
                    <th className="p-2 border-r border-amber-300 w-24">Vaqt</th>
                    <th className="p-2 border-r border-amber-300 w-36">Avto moy nomi</th>
                    <th className="p-2 border-r border-amber-300 w-24">Kod</th>
                    <th className="p-2 border-r border-amber-300 w-20">API</th>
                    <th className="p-2 border-r border-amber-300 w-16">Litr</th>
                    <th className="p-2 border-r border-amber-300 w-24">Davlat</th>
                    <th className="p-2 border-r border-amber-300 w-24">Brend</th>
                    <th className="p-2 border-r border-amber-300 w-32">Yetkazib beruvchi</th>
                    <th className="p-2 border-r border-amber-300 text-right w-24">Narx ($)</th>
                    <th className="p-2 border-r border-amber-300 text-center w-24">Sana</th>
                    <th className="p-2 border-r border-amber-300 w-24">Manba</th>
                    <th className="p-2 border-r border-amber-300 w-32">Izoh</th>
                    <th className="p-2 text-center w-24">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200">
                  {filteredParts.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="p-6 text-center bg-yellow-50/50">
                        <p className="font-black text-xs text-stone-800">
                          {isFilterActive
                            ? 'Belgilangan filtrlar bo\'yicha avto moy topilmadi'
                            : 'Avto moylar mavjud emas'}
                        </p>
                        {isFilterActive && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-2 px-2.5 py-1 bg-amber-300 hover:bg-amber-400 border border-amber-500 text-black text-[11px] font-black cursor-pointer"
                          >
                            Filtrlarni tozalash
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredParts.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-yellow-50/40'}>
                        <td className="p-2 border-r border-amber-200 text-center font-mono font-black">{item.orderNumber || idx + 1}</td>
                        <td className="p-1.5 border-r border-amber-200 font-mono text-[10px] text-stone-700 leading-tight">
                          {(() => {
                            const raw = item.systemTime || '';
                            const p = raw.split(/,\s*|\s+/);
                            const datePart = p[0] || raw;
                            const timePart = p.slice(1).join(' ');
                            return (
                              <div className="flex flex-col">
                                <span className="font-bold text-stone-900 whitespace-nowrap">{datePart}</span>
                                {timePart && <span className="text-[9px] text-stone-500 whitespace-nowrap">{timePart}</span>}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="p-2 border-r border-amber-200 font-black text-black break-words">{item.partName}</td>
                        <td className="p-2 border-r border-amber-200 font-mono font-bold text-stone-900">{item.code || '-'}</td>
                        <td className="p-2 border-r border-amber-200 text-stone-800">{item.api || '-'}</td>
                        <td className="p-2 border-r border-amber-200 font-bold text-black">{item.liters || '-'}</td>
                        <td className="p-2 border-r border-amber-200 text-stone-800">{item.country || '-'}</td>
                        <td className="p-2 border-r border-amber-200 font-black text-[10px] uppercase text-black">{item.brand}</td>
                        <td className="p-2 border-r border-amber-200 font-bold text-stone-800 break-words">{item.supplierName}</td>
                        <td className="p-2 border-r border-amber-200 text-right font-mono font-black text-black whitespace-nowrap">{formatUSD(item.price)}</td>
                        <td className="p-2 border-r border-amber-200 text-center font-mono text-[11px] text-stone-700 whitespace-nowrap">{item.date}</td>
                        <td className="p-2 border-r border-amber-200 text-stone-700 font-semibold">{item.source}</td>
                        <td className="p-2 border-r border-amber-200 text-stone-600 text-[11px]">{item.comment}</td>
                        <td className="p-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEditPart(item)}
                              disabled={!isOnline}
                              className="p-1 bg-yellow-200 hover:bg-yellow-300 border border-amber-400 text-black cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3 stroke-[2.5]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDelete(item.id)}
                              disabled={!isOnline}
                              className="p-1 bg-rose-100 hover:bg-rose-200 border border-rose-400 text-rose-800 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VERSIYA */}
      {/* ========================================================================= */}
      <div className="hidden md:block border-2 border-amber-400 bg-white shadow-sm overflow-hidden rounded-none">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-left text-xs">
            {/* Table Header */}
            <thead>
              <tr className="bg-yellow-200 border-b-2 border-amber-400 text-black text-[11px] font-black uppercase font-heading">
                <th className="p-2 border-r border-amber-300 text-center w-10">№</th>
                <th className="p-2 border-r border-amber-300 w-24">Vaqt</th>
                <th className="p-2 border-r border-amber-300 w-44">Avto moy nomi</th>
                <th className="p-2 border-r border-amber-300 w-28">Kod</th>
                <th className="p-2 border-r border-amber-300 w-24">API</th>
                <th className="p-2 border-r border-amber-300 w-16 text-center">Litr</th>
                <th className="p-2 border-r border-amber-300 w-28">Davlat</th>
                <th className="p-2 border-r border-amber-300 w-24">Brend</th>
                <th className="p-2 border-r border-amber-300 w-36">Yetkazib beruvchi</th>
                <th className="p-2 border-r border-amber-300 text-right w-24">Narx ($)</th>
                <th className="p-2 border-r border-amber-300 text-center w-24">Sana</th>
                <th className="p-2 border-r border-amber-300 w-28">Manba</th>
                <th className="p-2 border-r border-amber-300 w-32">Izoh</th>
                <th className="p-2 text-center w-24">Amallar</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-amber-200">
              {parts.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center bg-yellow-50/50">
                    <Wrench className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-60" />
                    <p className="font-black text-sm text-stone-800">
                      Hozircha avto moylar kiritilmagan
                    </p>
                    <p className="text-xs text-stone-600 mt-1">
                      {isOnline
                        ? 'Yangi avto moy qo\'shish uchun "+ Yangi avto moy" tugmasini bosing.'
                        : 'Oflayn rejimdasiz. Internetga ulangach yangi ma\'lumot kiritishingiz mumkin.'}
                    </p>
                  </td>
                </tr>
              ) : filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center bg-yellow-50/50">
                    <Filter className="w-8 h-8 text-amber-600 mx-auto mb-2 opacity-70" />
                    <p className="font-black text-sm text-stone-800">
                      Belgilangan filtrlar bo'yicha hech qanday avto moy topilmadi
                    </p>
                    <p className="text-xs text-stone-600 mt-1">
                      Filtr parametrlarini o'zgartirib ko'ring yoki barcha filtrlarni tozalang.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-300 hover:bg-amber-400 border-2 border-amber-600 text-black text-xs font-black transition cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-900" />
                      <span>Barcha filtrlarni tozalash</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredParts.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-yellow-100/60 text-stone-900 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-yellow-50/40'
                    }`}
                  >
                    {/* 1. Tartib raqam */}
                    <td className="p-2 border-r border-amber-200 text-center font-mono font-black text-black">
                      {item.orderNumber || idx + 1}
                    </td>

                    {/* 2. Sistema vaqti */}
                    <td className="p-2 border-r border-amber-200 font-mono text-[10px] text-stone-700 whitespace-nowrap">
                      {item.systemTime}
                    </td>

                    {/* 3. Avto moy nomi */}
                    <td className="p-2 border-r border-amber-200 font-black text-black break-words">
                      {item.partName}
                    </td>

                    {/* 4. Kod */}
                    <td className="p-2 border-r border-amber-200 font-mono font-bold text-stone-900">
                      {item.code || '-'}
                    </td>

                    {/* 5. API */}
                    <td className="p-2 border-r border-amber-200 text-stone-800">
                      {item.api || '-'}
                    </td>

                    {/* 6. Litr */}
                    <td className="p-2 border-r border-amber-200 text-center font-bold text-black">
                      {item.liters || '-'}
                    </td>

                    {/* 7. Davlat */}
                    <td className="p-2 border-r border-amber-200 text-stone-800">
                      {item.country || '-'}
                    </td>

                    {/* 8. Brend */}
                    <td className="p-2 border-r border-amber-200">
                      <span className="inline-block px-1.5 py-0.5 bg-amber-200 border border-amber-400 text-[10px] font-black text-black uppercase">
                        {item.brand}
                      </span>
                    </td>

                    {/* 9. Yetkazib beruvchi */}
                    <td className="p-2 border-r border-amber-200 font-bold text-stone-800 break-words">
                      {item.supplierName}
                    </td>

                    {/* 10. Narx */}
                    <td className="p-2 border-r border-amber-200 text-right font-mono font-black text-black whitespace-nowrap">
                      {formatUSD(item.price)}
                    </td>

                    {/* 11. Sana */}
                    <td className="p-2 border-r border-amber-200 text-center font-mono text-[11px] text-stone-700 whitespace-nowrap">
                      {item.date}
                    </td>

                    {/* 12. Ma'lumot manbaasi */}
                    <td className="p-2 border-r border-amber-200 text-stone-700 font-semibold break-words">
                      {item.source}
                    </td>

                    {/* 13. Izoh */}
                    <td className="p-2 border-r border-amber-200 text-stone-600 text-[11px] break-words">
                      {item.comment}
                    </td>

                    {/* 14. Amallar: Tahrirlash va O'chirish */}
                    <td className="p-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditPart(item)}
                          disabled={!isOnline}
                          className={`p-1 border transition ${
                            !isOnline
                              ? 'bg-stone-100 border-stone-300 text-stone-400 cursor-not-allowed'
                              : 'bg-yellow-200 hover:bg-yellow-300 border-amber-400 text-black cursor-pointer'
                          }`}
                          title={!isOnline ? 'Oflayn rejimda tahrirlab bo\'lmaydi' : 'Tahrirlash'}
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDelete(item.id)}
                          disabled={!isOnline}
                          className={`p-1 border transition ${
                            !isOnline
                              ? 'bg-stone-100 border-stone-300 text-stone-400 cursor-not-allowed'
                              : 'bg-rose-100 hover:bg-rose-200 border-rose-400 text-rose-800 cursor-pointer'
                          }`}
                          title={!isOnline ? 'Oflayn rejimda o\'chirib bo\'lmaydi' : 'O\'chirish'}
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-amber-50 border-3 border-amber-500 p-5 max-w-sm w-full shadow-2xl text-black">
            <div className="flex items-center gap-2.5 mb-3 text-rose-700">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
              <h3 className="font-black text-sm uppercase">O'chirishni tasdiqlang</h3>
            </div>
            <p className="text-xs font-bold text-stone-700 mb-4">
              Ushbu avto moy yozuvini bazadan o'chirishga ishonchingiz komilmi? Bu amalni qaytarib bo'lmaydi.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-black text-xs font-black border border-stone-400 cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black border border-rose-800 cursor-pointer"
              >
                Ha, o'chirilsin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
