import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label?: string;
  count?: number;
}

interface MultiSelectDropdownProps {
  id?: string;
  label?: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  mono?: boolean;
  className?: string;
  buttonClassName?: string;
  dropdownWidth?: string;
  maxHeight?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  id,
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Barchasi',
  mono = false,
  className = '',
  buttonClassName = '',
  dropdownWidth = 'w-64 sm:w-72',
  maxHeight = 'max-h-60',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Tashqariga bosilganda yopish
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Ochilganda qidiruv maydoniga fokus berish
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // ESC bosilganda yopish
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Qidiruv bo'yicha saralangan variantlar
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.trim().toLowerCase();
    return options.filter((opt) => {
      const val = opt.value.toLowerCase();
      const lbl = (opt.label || '').toLowerCase();
      return val.includes(q) || lbl.includes(q);
    });
  }, [options, searchQuery]);

  // Elementni tanlash / bekor qilish
  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  // Barchasini tanlash
  const selectAll = () => {
    onChange(options.map((o) => o.value));
  };

  // Tozalash
  const clearAll = () => {
    onChange([]);
  };

  // Tanlanganlar matni
  const getButtonText = () => {
    if (selectedValues.length === 0) {
      return `${placeholder} (${options.length})`;
    }
    if (selectedValues.length === 1) {
      const found = options.find((o) => o.value === selectedValues[0]);
      return found?.label || found?.value || selectedValues[0];
    }
    return `${selectedValues.length} ta tanlandi`;
  };

  const isAllSelected = options.length > 0 && selectedValues.length === options.length;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label
          htmlFor={id}
          className="text-[10px] font-black uppercase text-stone-700 block truncate mb-1"
        >
          {label}
        </label>
      )}

      {/* Trigger Tugmasi */}
      <div className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-1.5 px-2 py-1.5 text-xs font-bold border-2 text-black bg-white focus:outline-none transition rounded-none cursor-pointer select-none text-left ${
            selectedValues.length > 0
              ? 'border-amber-600 bg-amber-50/70 font-black'
              : 'border-amber-400 hover:border-amber-500'
          } ${buttonClassName}`}
        >
          <span className={`truncate flex-1 ${mono ? 'font-mono' : ''}`}>
            {getButtonText()}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {selectedValues.length > 0 && (
              <span
                role="button"
                tabIndex={0}
                title="Tozalash"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="w-4 h-4 rounded flex items-center justify-center text-stone-500 hover:text-red-700 hover:bg-amber-200 cursor-pointer"
              >
                <X className="w-3 h-3 stroke-[2.5]" />
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-stone-600 transition-transform duration-150 ${
                isOpen ? 'rotate-180 text-amber-700' : ''
              }`}
            />
          </div>
        </button>

        {/* Dropdown Menyusi */}
        {isOpen && (
          <div
            className={`absolute z-50 left-0 mt-1 ${dropdownWidth} max-w-[90vw] bg-white border-2 border-amber-500 shadow-2xl rounded-none p-2 space-y-2 text-xs animate-in fade-in-50 duration-100`}
            style={{ minWidth: '100%' }}
          >
            {/* Tezkor boshqaruv: Barchasi / Tozalash */}
            <div className="flex items-center justify-between gap-1 border-b border-amber-300 pb-1.5">
              <span className="text-[10px] font-black uppercase text-stone-600">
                {selectedValues.length > 0
                  ? `${selectedValues.length} / ${options.length} tanlandi`
                  : `Jami: ${options.length} ta`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={selectAll}
                  disabled={isAllSelected || options.length === 0}
                  className="px-1.5 py-0.5 text-[10px] font-black uppercase bg-amber-100 hover:bg-amber-300 border border-amber-400 text-stone-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  Hammasi
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={selectedValues.length === 0}
                  className="px-1.5 py-0.5 text-[10px] font-black uppercase bg-stone-100 hover:bg-red-100 border border-stone-300 text-stone-700 hover:text-red-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  Tozalash
                </button>
              </div>
            </div>

            {/* Qidiruv maydoni (agar variantlar 4 tadan ko'p bo'lsa) */}
            {options.length >= 4 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Qidirish..."
                  className="w-full pl-7 pr-6 py-1 text-xs border border-amber-300 bg-yellow-50/50 font-medium text-black focus:outline-none focus:border-amber-500 rounded-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Variantlar ro'yxati (Checkboxes) */}
            <div className={`${maxHeight} overflow-y-auto space-y-0.5 pr-1 divide-y divide-amber-100`}>
              {filteredOptions.length === 0 ? (
                <div className="py-3 text-center text-[11px] font-bold text-stone-500">
                  Mos variant topilmadi
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isChecked = selectedValues.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-between gap-2 px-1.5 py-1 text-xs rounded-none cursor-pointer select-none transition ${
                        isChecked
                          ? 'bg-amber-100 font-black text-black'
                          : 'hover:bg-yellow-50 text-stone-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOption(opt.value)}
                          className="w-3.5 h-3.5 accent-amber-600 border border-amber-500 rounded cursor-pointer"
                        />
                        <span
                          className={`truncate ${mono ? 'font-mono' : ''}`}
                          title={opt.label || opt.value}
                        >
                          {opt.label || opt.value}
                        </span>
                      </div>

                      {typeof opt.count === 'number' && (
                        <span className="shrink-0 text-[10px] font-mono font-bold px-1 py-0.2 bg-white border border-amber-300 text-stone-600">
                          {opt.count}
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>

            {/* Pastki qism: Tayyor tugmasi */}
            <div className="border-t border-amber-300 pt-1.5 flex items-center justify-between">
              <span className="text-[10px] text-stone-500">
                {selectedValues.length === 0 ? 'Hozircha: barchasi' : `${selectedValues.length} ta belgilandi`}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2 py-0.5 text-[10px] font-black uppercase bg-amber-500 hover:bg-amber-600 text-black border border-amber-700 cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3 stroke-[2.5]" />
                Tayyor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
