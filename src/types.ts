export interface Features {
  arcFault: boolean;
  einschub: boolean;
  mcc: boolean;
  nj63: boolean;
  kompensation: boolean;
  universal: boolean;
}

export interface Evidence {
  field: string;
  quote: string;
  page: number | null;
}

export interface SwitchgearData {
  current: number | null;
  icw: number | null;
  voltage: number | null;
  ip: string | null;
  form: string | null;
  
  busbarPosition: string | null;
  uimp: number | null;
  ui: number | null;
  ipk: number | null;
  protectionClass: number | null;
  height: number | null;
  base: number | null;
  width: number | null;
  depth: number | null;
  installationType: string | null;

  features: Features;
  positions: Evidence[];
}

export type SystemRecommendation = 'ALPHA 3200 eco' | 'ALPHA 3200 classic' | 'SIVACON S8';

export interface EvaluationResult {
  system: SystemRecommendation;
  reasons: string[];
}

