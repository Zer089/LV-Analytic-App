import { SwitchgearData, EvaluationResult, SystemRecommendation } from '../types';

export const evaluateSystem = (data: SwitchgearData): EvaluationResult => {
  const reasons: string[] = [];
  
  const current = data.current;
  const icw = data.icw;
  const voltage = data.voltage;
  const form = data.form || 'unbekannt';
  const ip = data.ip || 'unbekannt';
  
  const busbarPosition = data.busbarPosition || 'unbekannt';
  const uimp = data.uimp;
  const ui = data.ui;
  const ipk = data.ipk;
  const protectionClass = data.protectionClass;
  const height = data.height;
  const base = data.base;
  const width = data.width;
  const depth = data.depth;
  const installationType = data.installationType || 'unbekannt';

  const features = data.features || { arcFault: false, einschub: false, mcc: false, nj63: false, kompensation: false, universal: false };

  // Check SIVACON S8
  let requiresS8 = false;
  if (current !== null && current > 3200) {
    requiresS8 = true;
    reasons.push(`Bemessungsstrom > 3200A (${current}A) nur mit S8 möglich`);
  }
  if (icw !== null && icw > 75) {
    requiresS8 = true;
    reasons.push(`Kurzschlussfestigkeit > 75kA (${icw}kA) nur mit S8 möglich`);
  }
  if (form.toLowerCase().includes('2a') || form.toLowerCase().includes('3') || form.toLowerCase().includes('4')) {
    requiresS8 = true;
    reasons.push(`Innere Unterteilung ${form} nur mit S8 möglich`);
  }
  if (ip.toUpperCase() === 'IP43') {
    requiresS8 = true;
    reasons.push(`Schutzart ${ip} nur mit S8 möglich`);
  }
  if (features.einschub) {
    requiresS8 = true;
    reasons.push('Einschubtechnik nur mit S8 möglich');
  }
  if (features.mcc) {
    requiresS8 = true;
    reasons.push('Motor Control Center (MCC) nur mit S8 möglich');
  }
  if (busbarPosition.toLowerCase().includes('oben')) {
    requiresS8 = true;
    reasons.push(`Sammelschienenlage ${busbarPosition} nur mit S8 möglich`);
  }
  if (uimp !== null && uimp > 8) {
    requiresS8 = true;
    reasons.push(`Bemessungsstoßspannungsfestigkeit > 8kV (${uimp}kV) nur mit S8 möglich`);
  }
  if (ipk !== null && ipk > 165) {
    requiresS8 = true;
    reasons.push(`Bemessungsstoßkurzschlussstrom > 165kA (${ipk}kA) nur mit S8 möglich`);
  }
  if (height !== null && height > 2000) {
    requiresS8 = true;
    reasons.push(`Höhe > 2000mm (${height}mm) nur mit S8 möglich`);
  }
  if (installationType.toLowerCase().includes('doppelfront')) {
    requiresS8 = true;
    reasons.push(`Aufstellart ${installationType} nur mit S8 möglich`);
  }
  if (width !== null && width < 350 && width > 0) {
    requiresS8 = true;
    reasons.push(`Breite < 350mm (${width}mm) nur mit S8 möglich`);
  }

  // Check ALPHA 3200 classic
  let requiresClassic = false;
  if (voltage !== null && voltage > 400) {
    requiresClassic = true;
    reasons.push(`Spannung > 400V (${voltage}V) schließt eco aus`);
  }
  if (form.toLowerCase().includes('2b')) {
    requiresClassic = true;
    reasons.push(`Innere Unterteilung ${form} schließt eco aus`);
  }
  if (ip.toUpperCase() === 'IP40' || ip.toUpperCase() === 'IP41') {
    requiresClassic = true;
    reasons.push(`Schutzart ${ip} schließt eco aus`);
  }
  if (features.arcFault) {
    requiresClassic = true;
    reasons.push('Störlichtbogenschutz schließt eco aus (bei classic auf Anfrage möglich)');
  }
  if (features.nj63) {
    requiresClassic = true;
    reasons.push('Lasttrennschalter mit Sicherungen (3NJ63) in eco nicht möglich');
  }
  if (features.kompensation) {
    requiresClassic = true;
    reasons.push('Blindleistungskompensation in eco nicht möglich');
  }
  if (features.universal) {
    requiresClassic = true;
    reasons.push('Universaleinbautechnik in eco nicht möglich');
  }
  if (busbarPosition.toLowerCase().includes('hinten')) {
    requiresClassic = true;
    reasons.push(`Sammelschienenlage ${busbarPosition} schließt eco aus`);
  }
  if (width !== null && width > 1100) {
    requiresClassic = true;
    reasons.push(`Breite > 1100mm (${width}mm) schließt eco aus`);
  }

  let system: SystemRecommendation = 'ALPHA 3200 eco';
  if (requiresS8) {
    system = 'SIVACON S8';
  } else if (requiresClassic) {
    system = 'ALPHA 3200 classic';
  }

  if (reasons.length === 0) {
    reasons.push('Alle Parameter im Standardbereich der ALPHA 3200 eco');
  }

  return { system, reasons };
};
