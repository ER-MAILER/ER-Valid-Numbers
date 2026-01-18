
export enum ValidationStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PENDING = 'PENDING'
}

export interface PhoneNumberRecord {
  id: string;
  original: string;
  formatted: string;
  country: string;
  status: ValidationStatus;
  notes?: string;
}

export interface ValidationSummary {
  total: number;
  valid: number;
  invalid: number;
}
