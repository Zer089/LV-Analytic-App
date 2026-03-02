import { SwitchgearData, EvaluationResult, SystemRecommendation } from '../types';

export const evaluateSystem = (data: SwitchgearData, manualOverride?: SystemRecommendation): EvaluationResult => {
  if (manualOverride) {
    return { system: manualOverride, reasons: ['Manuell überschrieben'] };
  }

  const reasons: string[] = [];
  
  // Fallbacks
  const current = data.current ?? 0;
  const icw = data.icw ?? 0;
  const voltage = data.voltage ?? 400;
  const form = data.form || 'Form 1';
  const ip = data.ip || 'IP31';
  const features = data.features || { arcFault: false, einschub: false, mcc: false, nj63: false, kompensation: false };

  // Check SIVACON S8
  let requiresS8 = false;
  if (current > 3200) {
    requiresS8 = true;
    reasons.push(`Bemessungsstrom > 3200A (${current}A)`);
  }
  if (icw > 75) {
    requiresS8 = true;
    reasons.push(`Kurzschlussfestigkeit > 75kA (${icw}kA)`);
  }
  if (form.toLowerCase().includes('form 3') || form.toLowerCase().includes('form 4')) {
    requiresS8 = true;
    reasons.push(`Innere Unterteilung ${form} gefordert`);
  }
  if (features.einschub) {
    requiresS8 = true;
    reasons.push('Einschubtechnik gefordert');
  }
  if (features.mcc) {
    requiresS8 = true;
    reasons.push('Motor Control Center (MCC) gefordert');
  }

  if (requiresS8) {
    return { system: 'SIVACON S8', reasons };
  }

  // Check ALPHA 3200 classic
  let requiresClassic = false;
  if (voltage > 400) {
    requiresClassic = true;
    reasons.push(`Spannung > 400V (${voltage}V)`);
  }
  if (form.toLowerCase().includes('form 2b')) {
    requiresClassic = true;
    reasons.push(`Innere Unterteilung ${form} gefordert`);
  }
  if (features.nj63) {
    requiresClassic = true;
    reasons.push('3NJ63 Lasttrenner gefordert');
  }
  if (features.kompensation) {
    requiresClassic = true;
    reasons.push('Blindleistungskompensation gefordert');
  }
  if (ip.toUpperCase() === 'IP40' || ip.toUpperCase() === 'IP41') {
    requiresClassic = true;
    reasons.push(`Schutzart ${ip} gefordert`);
  }

  if (requiresClassic) {
    return { system: 'ALPHA 3200 classic', reasons };
  }

  // Default to Eco
  reasons.push('Alle Parameter im Standardbereich (In ≤ 3200A, Icw ≤ 75kA, Ue ≤ 400V, Form 1)');
  return { system: 'ALPHA 3200 eco', reasons };
};
