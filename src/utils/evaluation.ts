import { SwitchgearData, EvaluationResult, SystemRecommendation } from '../types';

export const evaluateSystem = (data: SwitchgearData): EvaluationResult => {
  const reasons: string[] = [];
  
  // Fallbacks
  const current = data.current ?? 0;
  const icw = data.icw ?? 0;
  const voltage = data.voltage ?? 400;
  const form = data.form || 'unbekannt';
  const ip = data.ip || 'unbekannt';
  
  const busbarPosition = data.busbarPosition || 'unbekannt';
  const uimp = data.uimp ?? 0;
  const ui = data.ui ?? 0;
  const ipk = data.ipk ?? 0;
  const protectionClass = data.protectionClass ?? 1;
  const height = data.height ?? 2000;
  const base = data.base ?? 100;
  const width = data.width ?? 600;
  const depth = data.depth ?? 600;
  const installationType = data.installationType || 'unbekannt';

  const features = data.features || { arcFault: false, einschub: false, mcc: false, nj63: false, kompensation: false, universal: false };

  // Check SIVACON S8
  let requiresS8 = false;
  if (current > 3200) {
    requiresS8 = true;
    reasons.push(`Bemessungsstrom > 3200A (${current}A) nur mit S8 möglich`);
  }
  if (icw > 75) {
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
  if (uimp > 8) {
    requiresS8 = true;
    reasons.push(`Bemessungsstoßspannungsfestigkeit > 8kV (${uimp}kV) nur mit S8 möglich`);
  }
  if (ipk > 165) {
    requiresS8 = true;
    reasons.push(`Bemessungsstoßkurzschlussstrom > 165kA (${ipk}kA) nur mit S8 möglich`);
  }
  if (height > 2000) {
    requiresS8 = true;
    reasons.push(`Höhe > 2000mm (${height}mm) nur mit S8 möglich`);
  }
  if (installationType.toLowerCase().includes('doppelfront')) {
    requiresS8 = true;
    reasons.push(`Aufstellart ${installationType} nur mit S8 möglich`);
  }
  if (width < 350 && width > 0) {
    requiresS8 = true;
    reasons.push(`Breite < 350mm (${width}mm) nur mit S8 möglich`);
  }

  if (requiresS8) {
    return { system: 'SIVACON S8', reasons };
  }

  // Check ALPHA 3200 classic
  let requiresClassic = false;
  if (voltage > 400) {
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
  if (width > 1100) {
    requiresClassic = true;
    reasons.push(`Breite > 1100mm (${width}mm) schließt eco aus`);
  }

  if (requiresClassic) {
    return { system: 'ALPHA 3200 classic', reasons };
  }

  // Default to Eco
  reasons.push('Alle Parameter im Standardbereich der ALPHA 3200 eco');
  return { system: 'ALPHA 3200 eco', reasons };
};
