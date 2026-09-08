export type ActivityType = 'jismoniy' | 'yuridik';

export type PaymentMethod = 'naqd' | 'bank orqali' | 'bank kartalari orqali';

export type PaymentConditionType = 'naqd joyida' | 'kechiktirib to\'lash';

export type QualityStability = 'yomon' | 'o\'rtacha' | 'yaxshi';

export type TransparencyLevel = 'shaffof' | 'shubhali';

export type ResponsibilityType =
  | 'mahsulot sifatiga javob beradi'
  | 'mahsulot sifatiga javob bermaydi'
  | 'mahsulot sifatiga ba\'zida javob beradi';

export type DisciplineLevel = 'vaqtida' | 'o\'rtacha' | 'kechikadi';

export type ExtrasType = 'yetkazib berish (pulli)' | 'yetkazib berish (bepul)';

export interface Supplier {
  id: string;
  orderNumber: number; // 1-tartib raqam (avtomatik)
  systemTime: string; // 2-sistema vaqti (avtomatik)
  createdAt: number;
  activityType: ActivityType; // 3-faoliyat turi (default: jismoniy)
  name: string; // 4-nom (majburiy)
  address: string; // 5-manzil (majburiy)
  phone: string; // 6-telefon raqam (majburiy)
  paymentMethod: PaymentMethod; // 7-pul o'tkazmalari (default: naqd)
  paymentCondition: PaymentConditionType; // 8-to'lov sharti (default: naqd joyida)
  delayDays?: number | string; // agar kechiktirib to'lash bo'lsa kun
  qualityStability: QualityStability; // 9-sifat barqarorligi (default: o'rtacha)
  transparencyLevel: TransparencyLevel; // 10-shaffoflik darajasi (default: shaffof)
  responsibility: ResponsibilityType; // 11-javobgarlik (default: mahsulot sifatiga ba'zida javob beradi)
  disciplineLevel: DisciplineLevel; // 12-intizom darajasi (default: o'rtacha)
  extras: ExtrasType; // 13-qo'shimchalar (default: yetkazib berish (pulli))
  products?: string[]; // 14-taklif qilinadigan mahsulotlar ro'yxati (ixtiyoriy)
}

export interface SupplierFormData {
  activityType: ActivityType;
  name: string;
  address: string;
  phone: string;
  paymentMethod: PaymentMethod;
  paymentCondition: PaymentConditionType;
  delayDays: string;
  qualityStability: QualityStability;
  transparencyLevel: TransparencyLevel;
  responsibility: ResponsibilityType;
  disciplineLevel: DisciplineLevel;
  extras: ExtrasType;
  products: string[]; // taklif qilinadigan mahsulotlar ro'yxati (ixtiyoriy)
}

export interface UserSession {
  username: string;
  loggedInAt: string;
}

export interface AutoPart {
  id: string;
  orderNumber: number; // 1-tartib son (avtomatik)
  systemTime: string; // 2-sistema vaqti (avtomatik)
  createdAt: number;
  partName: string; // 3-avto ehtiyot qism nomi (majburiy)
  brand: string; // 4-brend (majburiy)
  supplierName: string; // 5-yetkazib beruvchi (majburiy)
  price: number; // 6-narx (majburiy)
  date: string; // 7-sana (majburiy)
  source: string; // 8-ma'lumot manbaasi (majburiy)
  comment: string; // 9-izoh (majburiy)
}

export interface AutoPartFormData {
  partName: string;
  brand: string;
  supplierName: string;
  price: string;
  date: string;
  source: string;
  comment: string;
}

export type ActiveTab = 'suppliers' | 'autoparts' | 'analytics';
