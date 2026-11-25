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
  fullText?: string;

  features: Features;
  positions: Evidence[];
}

export interface Project {
  id: string;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
  
  // Project Header Data
  customer: string;
  projectTitle: string;
  vb: string;
  region: string;
  partnership: string;
  editor: string;
  plannedSystem: string;
  panelCount: number | null;
  revenueP310: number | null;
  revenueP360: number | null;
  totalRevenue: number | null;
  opportunity: string;
  sieSalesMaintained: boolean;
  tenderedBrand: string;
  remarks: string;
  
  // Analyzed Data
  analysisData: SwitchgearData | null;
  fileName: string;
  fileContent?: string;
}

export type SystemRecommendation = 'ALPHA 3200 eco' | 'ALPHA 3200 classic' | 'SIVACON S8' | (string & {});

export type FeatureSupport = boolean | 'on_request';

export interface SystemRule {
  description?: string;
  image?: string;
  maxCurrent: number;
  maxIcw: number;
  maxIpk: number;
  maxVoltage: number;
  maxUi: number;
  maxUimp: number;
  maxHeight: number;
  heightRange?: string;
  protectionClass?: string;
  base?: string;
  depth?: string;
  busbarNote?: string;
  arcFaultClass?: string;
  allowedIp: string[];
  allowedForms: string[];
  allowedBusbarPositions: string[];
  allowedInstallationTypes: string[];
  features: {
    arcFault: FeatureSupport;
    einschub: FeatureSupport;
    mcc: FeatureSupport;
    nj63: FeatureSupport;
    kompensation: FeatureSupport;
    universal: FeatureSupport;
  };
}

export interface SystemKnowledge {
  expertRole: string;
  systems: string[];
  evaluationOrder?: string[];
  systemRules?: Record<string, SystemRule>;
  generalKnowledge?: string[];
}

export interface EvaluationResult {
  system: SystemRecommendation;
  reasons: string[];
}
