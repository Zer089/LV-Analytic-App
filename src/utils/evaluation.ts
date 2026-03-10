import { SwitchgearData, EvaluationResult, SystemRecommendation } from '../types';

export const evaluateSystem = (data: SwitchgearData, language: 'de' | 'en' = 'de'): EvaluationResult => {
  const reasons: string[] = [];
  
  const current = data.current;
  const icw = data.icw;
  const voltage = data.voltage;
  const form = data.form || (language === 'de' ? 'unbekannt' : 'unknown');
  const ip = data.ip || (language === 'de' ? 'unbekannt' : 'unknown');
  
  const busbarPosition = data.busbarPosition || (language === 'de' ? 'unbekannt' : 'unknown');
  const uimp = data.uimp;
  const ui = data.ui;
  const ipk = data.ipk;
  const protectionClass = data.protectionClass;
  const height = data.height;
  const base = data.base;
  const width = data.width;
  const depth = data.depth;
  const installationType = data.installationType || (language === 'de' ? 'unbekannt' : 'unknown');

  const features = data.features || { arcFault: false, einschub: false, mcc: false, nj63: false, kompensation: false, universal: false };

  // Check SIVACON S8
  let requiresS8 = false;
  if (current !== null && current > 3200) {
    requiresS8 = true;
    reasons.push(language === 'de' 
      ? `Bemessungsstrom > 3200A (${current}A) nur mit S8 möglich` 
      : `Rated current > 3200A (${current}A) only possible with S8`);
  }
  if (icw !== null && icw > 75) {
    requiresS8 = true;
    reasons.push(language === 'de' 
      ? `Kurzschlussfestigkeit > 75kA (${icw}kA) nur mit S8 möglich`
      : `Short-circuit strength > 75kA (${icw}kA) only possible with S8`);
  }
  if (form.toLowerCase().includes('2a') || form.toLowerCase().includes('3') || form.toLowerCase().includes('4')) {
    requiresS8 = true;
    reasons.push(language === 'de' 
      ? `Innere Unterteilung ${form} nur mit S8 möglich`
      : `Internal separation ${form} only possible with S8`);
  }
  if (ip.toUpperCase() === 'IP43') {
    requiresS8 = true;
    reasons.push(language === 'de' 
      ? `Schutzart ${ip} nur mit S8 möglich`
      : `Protection class ${ip} only possible with S8`);
  }
  if (features.einschub) {
    requiresS8 = true;
    reasons.push(language === 'de' 
      ? 'Einschubtechnik nur mit S8 möglich'
      : 'Withdrawable technology only possible with S8');
  }
  if (features.mcc) {
    requiresS8 = true;
    reasons.push(language === 'de' 
      ? 'Motor Control Center (MCC) nur mit S8 möglich'
      : 'Motor Control Center (MCC) only possible with S8');
  }
  if (busbarPosition.toLowerCase().includes('oben') || busbarPosition.toLowerCase().includes('top')) {
    requiresS8 = true;
    reasons.push(language === 'de' 
      ? `Sammelschienenlage ${busbarPosition} nur mit S8 möglich`
      : `Busbar position ${busbarPosition} only possible with S8`);
  }
  if (uimp !== null && uimp > 8) {
    requiresS8 = true;
    reasons.push(language === 'de' 
      ? `Bemessungsstoßspannungsfestigkeit > 8kV (${uimp}kV) nur mit S8 möglich`
      : `Rated impulse withstand voltage > 8kV (${uimp}kV) only possible with S8`);
  }
  if (ipk !== null && ipk > 165) {
    requiresS8 = true;
    reasons.push(language === 'de' 
      ? `Bemessungsstoßkurzschlussstrom > 165kA (${ipk}kA) nur mit S8 möglich`
      : `Rated peak withstand current > 165kA (${ipk}kA) only possible with S8`);
  }
  if (height !== null && height > 2000) {
    requiresS8 = true;
    reasons.push(language === 'de' 
      ? `Höhe > 2000mm (${height}mm) nur mit S8 möglich`
      : `Height > 2000mm (${height}mm) only possible with S8`);
  }
  if (installationType.toLowerCase().includes('doppelfront') || installationType.toLowerCase().includes('double')) {
    requiresS8 = true;
    reasons.push(language === 'de' 
      ? `Aufstellart ${installationType} nur mit S8 möglich`
      : `Installation type ${installationType} only possible with S8`);
  }
  if (width !== null && width < 350 && width > 0) {
    requiresS8 = true;
    reasons.push(language === 'de' 
      ? `Breite < 350mm (${width}mm) nur mit S8 möglich`
      : `Width < 350mm (${width}mm) only possible with S8`);
  }

  // Check ALPHA 3200 classic
  let requiresClassic = false;
  if (voltage !== null && voltage > 400) {
    requiresClassic = true;
    reasons.push(language === 'de' 
      ? `Spannung > 400V (${voltage}V) schließt eco aus`
      : `Voltage > 400V (${voltage}V) excludes eco`);
  }
  if (form.toLowerCase().includes('2b')) {
    requiresClassic = true;
    reasons.push(language === 'de' 
      ? `Innere Unterteilung ${form} schließt eco aus`
      : `Internal separation ${form} excludes eco`);
  }
  if (ip.toUpperCase() === 'IP40' || ip.toUpperCase() === 'IP41') {
    requiresClassic = true;
    reasons.push(language === 'de' 
      ? `Schutzart ${ip} schließt eco aus`
      : `Protection class ${ip} excludes eco`);
  }
  if (features.arcFault) {
    requiresClassic = true;
    reasons.push(language === 'de' 
      ? 'Störlichtbogenschutz schließt eco aus (bei classic auf Anfrage möglich)'
      : 'Arc fault protection excludes eco (possible on request for classic)');
  }
  if (features.nj63) {
    requiresClassic = true;
    reasons.push(language === 'de' 
      ? 'Lasttrennschalter mit Sicherungen (3NJ63) in eco nicht möglich'
      : 'Switch disconnectors with fuses (3NJ63) not possible in eco');
  }
  if (features.kompensation) {
    requiresClassic = true;
    reasons.push(language === 'de' 
      ? 'Blindleistungskompensation in eco nicht möglich'
      : 'Reactive power compensation not possible in eco');
  }
  if (features.universal) {
    requiresClassic = true;
    reasons.push(language === 'de' 
      ? 'Universaleinbautechnik in eco nicht möglich'
      : 'Universal mounting technology not possible in eco');
  }
  if (busbarPosition.toLowerCase().includes('hinten') || busbarPosition.toLowerCase().includes('back') || busbarPosition.toLowerCase().includes('rear')) {
    requiresClassic = true;
    reasons.push(language === 'de' 
      ? `Sammelschienenlage ${busbarPosition} schließt eco aus`
      : `Busbar position ${busbarPosition} excludes eco`);
  }
  if (width !== null && width > 1100) {
    requiresClassic = true;
    reasons.push(language === 'de' 
      ? `Breite > 1100mm (${width}mm) schließt eco aus`
      : `Width > 1100mm (${width}mm) excludes eco`);
  }

  let system: SystemRecommendation = 'ALPHA 3200 eco';
  if (requiresS8) {
    system = 'SIVACON S8';
  } else if (requiresClassic) {
    system = 'ALPHA 3200 classic';
  }

  if (reasons.length === 0) {
    reasons.push(language === 'de' 
      ? 'Alle Parameter im Standardbereich der ALPHA 3200 eco'
      : 'All parameters within standard range of ALPHA 3200 eco');
  }

  return { system, reasons };
};
