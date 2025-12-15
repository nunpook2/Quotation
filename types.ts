export interface QuotationItem {
  id: string;
  description: string;
  image?: string | null; // Base64 or URL
  qty: number;
  unit: string;
  pricePerUnit: number;
}

export interface CustomerInfo {
  name: string;
  company: string;
  address: string;
  phone: string;
  taxId: string;
}

export interface DocInfo {
  no: string;
  date: string;
  paymentTerms: string;
  credit: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
}