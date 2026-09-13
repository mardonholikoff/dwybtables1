import React, { useState } from 'react';
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Save,
  X,
  FileCheck,
  Info,
} from 'lucide-react';
import { AutoPart } from '../types';
import {
  downloadEditableAutoPartsExcel,
  ExcelValidationResult,
} from '../utils/excelEditableService';
import { formatUSD } from '../utils/formatCurrency';

interface ExcelDownloadWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: AutoPart[];
}

export const ExcelDownloadWarningModal: React.FC<ExcelDownloadWarningModalProps> = ({
  isOpen,
  onClose,
  parts,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleConfirmDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadEditableAutoPartsExcel(parts);
      setTimeout(() => {
        setIsDownloading(false);
        onClose();
      }, 500);
    } catch (err: any) {
      alert(`Yuklab olishda xatolik: ${err?.message || 'Noma\'lum xatolik'}`);
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-amber-50 border-3 border-amber-600 shadow-2xl max-w-xl w-full p-4 sm:p-6 text-black space-y-4">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b-2 border-amber-300 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 border-2 border-amber-700 text-amber-950 shrink-0">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide font-heading text-black">
                Jadvalni yuklab tahrirlash
              </h2>
              <p className="text-xs text-stone-700 font-bold">
                Jami: <span className="text-amber-900 font-black">{parts.length} ta</span> avto moy yozuvi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-amber-200 border border-amber-400 text-stone-700 transition cursor-pointer"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ogohlantirish matni */}
        <div className="bg-amber-100/90 border-2 border-amber-500 p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
            <Info className="w-4 h-4 stroke-[2.5] text-amber-800 shrink-0" />
            <span>Muhim ogohlantirish va ko'rsatma:</span>
          </div>

          <p className="text-xs sm:text-sm font-black text-black leading-relaxed">
            Hozir <span className="underline decoration-amber-700 decoration-2 font-black text-amber-950">«Roziman»</span> tugmasini bosganingizdan keyin jadvalni ustun va qatorlariga umuman o'zgartirish kiritmasdan faqatgina ichidagi qiymatlarni o'zgartirishingiz kerak!
          </p>

          <ul className="text-[11px] sm:text-xs text-stone-800 font-bold space-y-1.5 list-disc pl-4 border-t border-amber-300/80 pt-2">
            <li>
              <span className="font-black text-black">Ustunlar:</span> Sarlavhalar nomini, tartibini o'zgartirmang, yangi ustun qo'shmang va o'chirmang.
            </li>
            <li>
              <span className="font-black text-black">Qatorlar:</span> Yangi qator qo'shmang va mavjud qatorlarni o'chirmang.
            </li>
            <li>
              <span className="font-black text-black">Tizim ID:</span> 1-ustundagi Tizim ID yozuviga tegmang (u har bir mahsulotni aniq taniydi).
            </li>
            <li>
              <span className="font-black text-black">Format:</span> Jadval chiroyli chizilgan qora ramkalari bilan <span className="font-mono font-black text-emerald-900">.xlsx</span> formatida yuklanadi.
            </li>
            <li>
              <span className="font-black text-black">Ixtiyoriy maydonlar:</span> <span className="underline decoration-stone-500 font-bold">API</span>, <span className="underline decoration-stone-500 font-bold">Litr</span> va <span className="underline decoration-stone-500 font-bold">Izoh</span> ustunlarini bo'sh qoldirish mumkin (ular ixtiyoriy).
            </li>
            <li>
              <span className="font-black text-black">Qayta yuklash:</span> Tahrirlab bo'lgach, «Tahrirlangan jadvalni yuklash» tugmasi orqali yuklaysiz. Tizim faqat to'liq mos keluvchi jadvalni qabul qiladi.
            </li>
          </ul>
        </div>

        {/* Tugmalar */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-amber-300">
          <button
            type="button"
            onClick={onClose}
            disabled={isDownloading}
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-stone-200 border-2 border-stone-400 text-stone-800 text-xs font-black uppercase transition cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleConfirmDownload}
            disabled={isDownloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 border-2 border-amber-700 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-md disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full" />
                <span>Yuklanmoqda...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Roziman, yuklab olish (.xlsx)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ExcelUploadReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExcelValidationResult | null;
  onApplyChanges: (changedParts: AutoPart[]) => Promise<void>;
  isApplying: boolean;
}

export const ExcelUploadReviewModal: React.FC<ExcelUploadReviewModalProps> = ({
  isOpen,
  onClose,
  result,
  onApplyChanges,
  isApplying,
}) => {
  if (!isOpen || !result) return null;

  const { success, errorMessage, errorDetails, totalRows, changedParts, changesList } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-yellow-50 border-3 border-amber-600 shadow-2xl max-w-3xl w-full p-4 sm:p-6 text-black space-y-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b-2 border-amber-300 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 border-2 shrink-0 ${
                success
                  ? 'bg-emerald-400 border-emerald-700 text-emerald-950'
                  : 'bg-rose-400 border-rose-700 text-rose-950'
              }`}
            >
              {success ? (
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <XCircle className="w-6 h-6 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide font-heading text-black">
                {success
                  ? "Tahrirlangan jadval tekshirildi va qabul qilindi"
                  : "Jadval mos kelmadi — Qabul qilinmadi"}
              </h2>
              <p className="text-xs text-stone-700 font-bold">
                Jami tekshirilgan qatorlar: <span className="text-black font-black">{totalRows} ta</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="p-1 hover:bg-amber-200 border border-amber-400 text-stone-700 transition cursor-pointer"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {/* Failure Case */}
          {!success && (
            <div className="bg-rose-50 border-2 border-rose-500 p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 stroke-[2.5] text-rose-700 shrink-0" />
                <span>Qabul qilinmaslik sababi:</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-rose-950 leading-snug">
                {errorMessage}
              </p>

              {errorDetails && errorDetails.length > 0 && (
                <div className="bg-white border border-rose-300 p-2.5 space-y-1">
                  <span className="text-[11px] font-black uppercase text-rose-900 block">
                    Batafsil nomuvofiqliklar:
                  </span>
                  <ul className="text-xs text-stone-800 font-mono font-bold space-y-1 list-disc pl-4">
                    {errorDetails.map((err, idx) => (
                      <li key={idx} className="break-all">
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-[11px] text-stone-700 font-bold bg-amber-100 p-2 border border-amber-300">
                Eslatma: Jadvalni yuklab olgandan keyin qatorlar yoki ustunlar sonini, nomlarini o'zgartirmang. Faqat ichidagi qiymatlarni tahrirlab qayta yuklang.
              </div>
            </div>
          )}

          {/* Success Case */}
          {success && (
            <div className="space-y-3">
              {/* Moslik tasdig'i */}
              <div className="bg-emerald-50 border-2 border-emerald-600 p-3 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-700 stroke-[2.5]" />
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                    Tuzilish to'liq mos keldi (Barcha ustun va qatorlar tekshirildi)
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-200 border border-emerald-600 text-xs font-black text-emerald-950">
                  {changedParts.length > 0
                    ? `${changedParts.length} ta yozuvda o'zgarish bor`
                    : "O'zgarishlar yo'q"}
                </span>
              </div>

              {/* Hech qanday o'zgarish bo'lmasa */}
              {changedParts.length === 0 && (
                <div className="bg-yellow-100 border border-amber-400 p-4 text-center space-y-1">
                  <p className="text-xs sm:text-sm font-black text-black">
                    Jadvaldagi barcha qiymatlar bazadagi hozirgi qiymatlar bilan bir xil.
                  </p>
                  <p className="text-[11px] text-stone-600 font-bold">
                    Hech bir mahsulot narxi yoki parametri o'zgartirilmagan.
                  </p>
                </div>
              )}

              {/* O'zgarishlar ro'yxati (Diff preview) */}
              {changesList.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-black">
                    <span>Aniqlangan o'zgarishlar ({changesList.length} ta parametr):</span>
                    <span className="text-[11px] text-stone-600 font-mono">
                      {changedParts.length} ta qator
                    </span>
                  </div>

                  <div className="border-2 border-amber-400 overflow-x-auto bg-white max-h-72">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-amber-200 border-b-2 border-amber-400 text-[11px] font-black uppercase text-black">
                          <th className="p-2 border-r border-amber-300 text-center w-12">№</th>
                          <th className="p-2 border-r border-amber-300 text-left">Avto moy nomi</th>
                          <th className="p-2 border-r border-amber-300 text-left">O'zgargan maydon</th>
                          <th className="p-2 border-r border-amber-300 text-left bg-rose-50 text-rose-900">Eski qiymat</th>
                          <th className="p-2 text-left bg-emerald-50 text-emerald-900">Yangi qiymat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-200">
                        {changesList.map((ch, idx) => (
                          <tr key={idx} className="hover:bg-yellow-50">
                            <td className="p-1.5 border-r border-amber-200 text-center font-mono font-bold text-stone-700">
                              {ch.orderNumber}
                            </td>
                            <td className="p-1.5 border-r border-amber-200 font-black text-black">
                              {ch.partName}
                            </td>
                            <td className="p-1.5 border-r border-amber-200 font-bold text-amber-900">
                              {ch.fieldLabel}
                            </td>
                            <td className="p-1.5 border-r border-amber-200 font-mono text-rose-800 bg-rose-50/40 line-through">
                              {ch.field === 'price' ? formatUSD(Number(ch.oldValue)) : String(ch.oldValue || '—')}
                            </td>
                            <td className="p-1.5 font-mono font-black text-emerald-900 bg-emerald-50/50">
                              {ch.field === 'price' ? formatUSD(Number(ch.newValue)) : String(ch.newValue || '—')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t-2 border-amber-300 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-stone-200 border-2 border-stone-400 text-stone-800 text-xs font-black uppercase transition cursor-pointer"
          >
            {success && changedParts.length > 0 ? "Bekor qilish" : "Yopish"}
          </button>

          {success && changedParts.length > 0 && (
            <button
              type="button"
              onClick={() => onApplyChanges(changedParts)}
              disabled={isApplying}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-800 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-md disabled:opacity-50"
            >
              {isApplying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  <span>Bazaga saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>O'zgarishlarni bazaga saqlash ({changedParts.length} ta yozuv)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
