import { useState, useEffect } from 'react';

export interface WaitingListItem {
  id: string;
  customerName: string;
  whatsapp: string;
  brand: string;
  partType: string;
  model: string;
  network: string;
  color: string;
  availability: 'متوفر' | 'غير متوفر';
  price: string;
  productLink: string;
  dateAdded: string;
  processed: boolean;
  archived: boolean;
}

export interface ShippingItem {
  id: string;
  policyNumber: string;
  company: string;
  cancelReason: string;
  followUpDate: string;
  paymentStatus: 'الدفع عند الاستلام' | 'تم السداد';
  dateAdded: string;
  processed: boolean;
  archived: boolean;
}

export interface ReturnItem {
  id: string;
  returnNumber: string;
  company: string;
  status: 'جديد' | 'قيد المعالجة' | 'مكتمل';
  product: string;
  followUpDate: string;
  dateAdded: string;
  processed: boolean;
  archived: boolean;
}

export interface IssueItem {
  id: string;
  orderNumber: string;
  category: 'تأخير' | 'نقص' | 'تالف';
  product: string;
  followUpDate: string;
  status: 'قيد المعالجة' | 'منجز';
  dateAdded: string;
  processed: boolean;
  archived: boolean;
}

export interface TaskItem {
  id: string;
  brand: string;
  title: string;
  dueDate: string;
  repeat: 'يومي' | 'أسبوعي' | 'شهري' | 'بدون';
  status: 'قيد التنفيذ' | 'منجز';
  dateAdded: string;
  processed: boolean;
  archived: boolean;
}

export interface StoreData {
  waitingList: WaitingListItem[];
  shipping: ShippingItem[];
  returns: ReturnItem[];
  issues: IssueItem[];
  tasks: TaskItem[];
  dropdowns: {
    shippingCompanies: string[];
    cancelReasons: string[];
    issueCategories: string[];
    returnStatuses: string[];
    brands: string[];
    partTypes: string[];
    colors: string[];
    taskTitles: string[];
    trackingLinks: { [company: string]: string };
  };
}

const defaultData: StoreData = {
  waitingList: [],
  shipping: [],
  returns: [],
  issues: [],
  tasks: [],
  dropdowns: {
    shippingCompanies: ['سمسا', 'البريد السعودي', 'أرامكس', 'دي إتش إل'],
    cancelReasons: ['عدم التوفر', 'مشكل في الجودة', 'إلغاء العميل', 'مشكل في الشحن'],
    issueCategories: ['تأخير', 'نقص', 'تالف'],
    returnStatuses: ['جديد', 'قيد المعالجة', 'مكتمل'],
    brands: ['سامسونج', 'أيفون', 'هواوي', 'شاولي', 'أوبو'],
    partTypes: ['شاشة', 'بطارية', 'غطاء خلفي', 'كاميرا', 'لوحة شحن'],
    colors: ['أسود', 'أبيض', 'أزرق', 'أحمر', 'ذهبي'],
    taskTitles: ['متابعة المخزون', 'مراجعة الأسعار', 'تحديث الكتالوج', 'متابعة العملاء'],
    trackingLinks: {
      'سمسا': 'https://www.smsaexpress.com/ar/track',
      'البريد السعودي': 'https://spl.com.sa/ar/track-shipment',
      'أرامكس': 'https://www.aramex.com/sa/ar/track',
      'دي إتش إل': 'https://www.dhl.com/sa-ar/home/tracking.html'
    }
  }
};

export const useStore = () => {
  const [data, setData] = useState<StoreData>(() => {
    const stored = localStorage.getItem('mobilePartsStore');
    return stored ? JSON.parse(stored) : defaultData;
  });

  useEffect(() => {
    localStorage.setItem('mobilePartsStore', JSON.stringify(data));
  }, [data]);

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mobile-parts-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (importedData: StoreData) => {
    setData(importedData);
  };

  const clearAllData = () => {
    setData(defaultData);
  };

  return {
    data,
    setData,
    exportData,
    importData,
    clearAllData,
  };
};