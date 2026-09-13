import ExcelJS from 'exceljs';
import { AutoPart } from '../types';

export const EDITABLE_COLUMNS = [
  { key: 'id', header: "Tizim ID (O'zgartirilmasin)", width: 28 },
  { key: 'orderNumber', header: '№ (Tartib raqam)', width: 14 },
  { key: 'systemTime', header: 'Sistema vaqti', width: 22 },
  { key: 'partName', header: 'Avto moy nomi', width: 30 },
  { key: 'code', header: 'Kod', width: 18 },
  { key: 'api', header: 'API', width: 20 },
  { key: 'liters', header: 'Litr', width: 12 },
  { key: 'country', header: 'Ishlab chiqarilgan davlat', width: 24 },
  { key: 'brand', header: 'Brend', width: 20 },
  { key: 'supplierName', header: 'Yetkazib beruvchi', width: 32 },
  { key: 'price', header: 'Narx ($ / USD)', width: 18 },
  { key: 'date', header: 'Sana (YYYY-MM-DD)', width: 18 },
  { key: 'source', header: "Ma'lumot manbaasi", width: 24 },
  { key: 'comment', header: 'Izoh', width: 36 },
] as const;

export interface ExcelChangeItem {
  partId: string;
  orderNumber: number;
  partName: string;
  field: string;
  fieldLabel: string;
  oldValue: string | number;
  newValue: string | number;
}

export interface ExcelValidationResult {
  success: boolean;
  errorMessage?: string;
  errorDetails?: string[];
  totalRows: number;
  changedParts: AutoPart[];
  changesList: ExcelChangeItem[];
}

/**
 * 2-Jadvalni qora ramkalar bilan bezatilgan .xlsx formatida yuklab beradi.
 */
export async function downloadEditableAutoPartsExcel(
  parts: AutoPart[],
  fileNamePrefix = 'Avto_Moylar_Tahrirlash'
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DAEWOO Monitoring Tizimi';
  workbook.lastModifiedBy = 'DAEWOO Operator';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Avto moylar tahrirlash', {
    views: [{ state: 'frozen', ySplit: 1 }],
    properties: { defaultRowHeight: 22 },
  });

  // Ustunlar o'lchamini belgilash
  worksheet.columns = EDITABLE_COLUMNS.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
  }));

  // Qora chiziqli to'liq ramka (Thin Black Border)
  const blackBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  };

  // 1-qator: Sarlavhalar (Header)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 32;
  headerRow.eachCell((cell) => {
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FF000000' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFDE047' }, // Amber / Sariq rang
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    cell.border = blackBorder;
  });

  // Ma'lumot qatorlarini kiritish
  parts.forEach((item, index) => {
    const row = worksheet.addRow({
      id: item.id,
      orderNumber: item.orderNumber,
      systemTime: item.systemTime || '',
      partName: item.partName || '',
      code: item.code || '',
      api: item.api || '',
      liters: item.liters || '',
      country: item.country || '',
      brand: item.brand || '',
      supplierName: item.supplierName || '',
      price: Number(item.price) || 0,
      date: item.date || '',
      source: item.source || '',
      comment: item.comment || '',
    });

    row.height = 24;
    const isEven = index % 2 === 1;

    row.eachCell((cell, colNumber) => {
      cell.border = blackBorder;
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF000000' } };

      // Qator foni (zebra striping)
      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFBEB' }, // Och sariq fon
        };
      } else {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFFFF' }, // Oq fon
        };
      }

      // Ustunlarga mos joylashuv
      if (colNumber === 1) {
        // Tizim ID ustuni — o'zgartirilmaslik kerak bo'lgan ID
        cell.font = { name: 'Consolas', size: 9, color: { argb: 'FF555555' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF3F4F6' }, // Kulrang himoya foni
        };
      } else if (colNumber === 2) {
        // № Tartib raqam
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF000000' } };
      } else if (colNumber === 3) {
        // Sistema vaqti
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Consolas', size: 9, color: { argb: 'FF444444' } };
      } else if (colNumber === 5 || colNumber === 6 || colNumber === 7) {
        // Kod, API, Litr
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber === 11) {
        // Narx ($ / USD)
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '$#,##0.00';
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF000000' } };
      } else if (colNumber === 12) {
        // Sana
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        // Matnlar (Moy nomi, Davlat, Brend, Yetkazib beruvchi, Manbaa, Izoh)
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false };
      }
    });
  });

  // Faylni brauzerda yuklab berish
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  link.download = `${fileNamePrefix}_${dateStr}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Foydalanuvchi tahrir qilib qayta yuklagan Excel faylini qat'iy tekshiradi:
 * 1. Ustunlar to'liq va aynan mos bo'lishi kerak.
 * 2. Qatorlar soni aynan bazadagi qatorlar soniga teng bo'lishi kerak.
 * 3. Har bir qatordagi Tizim ID bazadagi ID bilan mos kelishi kerak.
 * 4. Faqat ichki qiymatlar (narx, kod, sana, brend va h.k.) o'zgarganligi tekshiriladi va o'zgarishlar ro'yxati qaytariladi.
 */
export async function validateAndParseEditedExcel(
  file: File,
  currentParts: AutoPart[]
): Promise<ExcelValidationResult> {
  const errorDetails: string[] = [];

  // Fayl turi tekshiruvi
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    return {
      success: false,
      errorMessage: "Faqat .xlsx yoki .xls formatidagi Excel fayllarini yuklash mumkin!",
      totalRows: 0,
      changedParts: [],
      changesList: [],
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return {
        success: false,
        errorMessage: "Excel faylida varaq (sahifa) topilmadi!",
        totalRows: 0,
        changedParts: [],
        changesList: [],
      };
    }

    // 1. USTUNLARNI TEKSHIRISH (Header row)
    const headerRow = worksheet.getRow(1);
    const uploadedHeaders: string[] = [];

    headerRow.eachCell({ includeEmpty: false }, (cell) => {
      const text = String(cell.value || '').trim();
      if (text) uploadedHeaders.push(text);
    });

    // Kutilgan ustunlar soni
    if (uploadedHeaders.length !== EDITABLE_COLUMNS.length) {
      return {
        success: false,
        errorMessage: `Jadval ustunlari soni mos kelmadi! Kutilgan ustunlar: ${EDITABLE_COLUMNS.length} ta, yuklangan faylda: ${uploadedHeaders.length} ta ustun topildi. Ustunlarni o'chirish yoki yangi ustun qo'shish taqiqlangan!`,
        errorDetails: [
          `Kutilgan ustunlar: ${EDITABLE_COLUMNS.map((c) => c.header).join(' | ')}`,
          `Yuklangan ustunlar: ${uploadedHeaders.join(' | ')}`,
        ],
        totalRows: 0,
        changedParts: [],
        changesList: [],
      };
    }

    // Har bir ustun nomini tekshirish
    for (let i = 0; i < EDITABLE_COLUMNS.length; i++) {
      const expected = EDITABLE_COLUMNS[i].header.toLowerCase().replace(/\s+/g, '');
      const actual = (uploadedHeaders[i] || '').toLowerCase().replace(/\s+/g, '');
      if (expected !== actual) {
        return {
          success: false,
          errorMessage: `Ustun nomi o'zgartirilgan! ${i + 1}-ustun: kutilgan «${EDITABLE_COLUMNS[i].header}», lekin faylda «${uploadedHeaders[i] || 'bo\'sh'}» deb yozilgan. Ustun nomlarini o'zgartirmasdan faqat qiymatlarni tahrirlang!`,
          totalRows: 0,
          changedParts: [],
          changesList: [],
        };
      }
    }

    // 2. QATORLARNI O'QISH VA TEKSHIRISH
    const rawRows: any[] = [];
    const rowCount = worksheet.rowCount;

    for (let r = 2; r <= rowCount; r++) {
      const row = worksheet.getRow(r);
      // Agar qator butunlay bo'sh bo'lsa o'tkazib yuboramiz
      let hasData = false;
      row.eachCell({ includeEmpty: false }, () => {
        hasData = true;
      });
      if (!hasData) continue;

      const getCellString = (colIndex: number): string => {
        const val = row.getCell(colIndex).value;
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') {
          // Formula yoki rich text bo'lsa
          if ('result' in val && val.result !== undefined) return String(val.result).trim();
          if ('text' in val && val.text !== undefined) return String(val.text).trim();
        }
        return String(val).trim();
      };

      const getCellNumber = (colIndex: number): number => {
        const val = row.getCell(colIndex).value;
        if (typeof val === 'number') return val;
        if (typeof val === 'object' && val !== null && 'result' in val) {
          const num = Number(val.result);
          return isNaN(num) ? 0 : num;
        }
        const cleaned = String(val || '').replace(/[$,\s]/g, '').replace(/,/g, '.');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      };

      rawRows.push({
        rowNumber: r,
        id: getCellString(1),
        orderNumber: getCellNumber(2) || (r - 1),
        systemTime: getCellString(3),
        partName: getCellString(4),
        code: getCellString(5),
        api: getCellString(6),
        liters: getCellString(7),
        country: getCellString(8),
        brand: getCellString(9),
        supplierName: getCellString(10),
        price: getCellNumber(11),
        date: getCellString(12),
        source: getCellString(13),
        comment: getCellString(14),
      });
    }

    // Qatorlar soni tekshiruvi:
    if (rawRows.length !== currentParts.length) {
      return {
        success: false,
        errorMessage: `Jadval qatorlari soni mos kelmadi! Bazada jami ${currentParts.length} ta yozuv bor, yuklangan faylda esa ${rawRows.length} ta qator topildi. Qatorlarni o'chirish yoki yangi qator qo'shish qat'iyan taqiqlangan!`,
        errorDetails: [
          `Kutilgan qatorlar soni: ${currentParts.length}`,
          `Fayldagi qatorlar soni: ${rawRows.length}`,
          "Iltimos, avval yuklab olingan jadval faylining qatorlariga tegmasdan faqat ichidagi qiymatlarni o'zgartiring.",
        ],
        totalRows: rawRows.length,
        changedParts: [],
        changesList: [],
      };
    }

    // ID mosligini va majburiy qiymatlarni tekshirish
    const existingPartsMap = new Map<string, AutoPart>();
    currentParts.forEach((p) => existingPartsMap.set(p.id, p));

    const updatedParts: AutoPart[] = [];
    const changesList: ExcelChangeItem[] = [];

    for (const row of rawRows) {
      if (!row.id) {
        errorDetails.push(`${row.rowNumber}-qatorda: Tizim ID maydoni bo'sh. ID o'chirilishi taqiqlangan!`);
        continue;
      }

      const existingPart = existingPartsMap.get(row.id);
      if (!existingPart) {
        errorDetails.push(`${row.rowNumber}-qatorda: Noma'lum Tizim ID «${row.id}». Bu ID bazada mavjud emas!`);
        continue;
      }

      // Majburiy maydonlar tekshiruvi (api, liters va comment ixtiyoriy)
      if (!row.partName) {
        errorDetails.push(`${row.rowNumber}-qatorda: Avto moy nomi bo'sh qoldirilgan!`);
      }
      if (!row.code) {
        errorDetails.push(`${row.rowNumber}-qatorda: Mahsulot kodi bo'sh qoldirilgan!`);
      }
      if (!row.country) {
        errorDetails.push(`${row.rowNumber}-qatorda: Ishlab chiqarilgan davlat bo'sh qoldirilgan!`);
      }
      if (!row.brand) {
        errorDetails.push(`${row.rowNumber}-qatorda: Brend bo'sh qoldirilgan!`);
      }
      if (!row.supplierName) {
        errorDetails.push(`${row.rowNumber}-qatorda: Yetkazib beruvchi nomi bo'sh qoldirilgan!`);
      }
      if (typeof row.price !== 'number' || row.price <= 0) {
        errorDetails.push(`${row.rowNumber}-qatorda: Narx 0 dan katta to'g'ri son bo'lishi shart! (Hozirgi qiymat: ${row.price})`);
      }
      if (!row.date) {
        errorDetails.push(`${row.rowNumber}-qatorda: Sana kiritilmagan!`);
      }
      if (!row.source) {
        errorDetails.push(`${row.rowNumber}-qatorda: Ma'lumot manbaasi bo'sh qoldirilgan!`);
      }

      // O'zgarishlarni aniqlash (Diff tracking)
      const rowChanges: ExcelChangeItem[] = [];

      const checkFieldChange = (
        fieldName: string,
        fieldLabel: string,
        oldVal: any,
        newVal: any,
        isNumeric = false
      ) => {
        if (isNumeric) {
          const o = Number(oldVal) || 0;
          const n = Number(newVal) || 0;
          if (Math.abs(o - n) > 0.0001) {
            rowChanges.push({
              partId: existingPart.id,
              orderNumber: existingPart.orderNumber,
              partName: row.partName || existingPart.partName,
              field: fieldName,
              fieldLabel,
              oldValue: o,
              newValue: n,
            });
          }
        } else {
          const oStr = String(oldVal || '').trim();
          const nStr = String(newVal || '').trim();
          if (oStr !== nStr) {
            rowChanges.push({
              partId: existingPart.id,
              orderNumber: existingPart.orderNumber,
              partName: row.partName || existingPart.partName,
              field: fieldName,
              fieldLabel,
              oldValue: oStr,
              newValue: nStr,
            });
          }
        }
      };

      checkFieldChange('partName', 'Avto moy nomi', existingPart.partName, row.partName);
      checkFieldChange('code', 'Kod', existingPart.code, row.code);
      checkFieldChange('api', 'API', existingPart.api || '', row.api || '');
      checkFieldChange('liters', 'Litr', existingPart.liters, row.liters);
      checkFieldChange('country', 'Davlat', existingPart.country, row.country);
      checkFieldChange('brand', 'Brend', existingPart.brand, row.brand);
      checkFieldChange('supplierName', 'Yetkazib beruvchi', existingPart.supplierName, row.supplierName);
      checkFieldChange('price', 'Narx ($)', existingPart.price, row.price, true);
      checkFieldChange('date', 'Sana', existingPart.date, row.date);
      checkFieldChange('source', 'Manbaa', existingPart.source, row.source);
      checkFieldChange('comment', 'Izoh', existingPart.comment || '', row.comment || '');

      if (rowChanges.length > 0) {
        changesList.push(...rowChanges);
        // Yangilangan obyektni tayyorlaymiz
        updatedParts.push({
          ...existingPart,
          partName: row.partName.trim(),
          code: row.code.trim(),
          api: (row.api || '').trim(),
          liters: row.liters.trim(),
          country: row.country.trim(),
          brand: row.brand.trim(),
          supplierName: row.supplierName.trim(),
          price: Number(row.price),
          date: row.date.trim(),
          source: row.source.trim(),
          comment: (row.comment || '').trim(),
        });
      }
    }

    if (errorDetails.length > 0) {
      return {
        success: false,
        errorMessage: `Jadval ma'lumotlarida ${errorDetails.length} ta xatolik aniqlandi! Iltimos, xatoliklarni to'g'rilab qayta yuklang.`,
        errorDetails: errorDetails.slice(0, 15), // Eng muhim 15 tasini ko'rsatamiz
        totalRows: rawRows.length,
        changedParts: [],
        changesList: [],
      };
    }

    return {
      success: true,
      totalRows: rawRows.length,
      changedParts: updatedParts,
      changesList,
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: `Excel faylini o'qishda xatolik yuz berdi: ${err?.message || 'Noma\'lum xatolik'}`,
      totalRows: 0,
      changedParts: [],
      changesList: [],
    };
  }
}
