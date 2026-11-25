import { SwitchgearData, EvaluationResult, SystemKnowledge, SystemRule, FeatureSupport } from '../types';

let cachedKnowledge: SystemKnowledge | null = null;
let knowledgePromise: Promise<SystemKnowledge> | null = null;

export const loadSystemKnowledge = async (forceReload = false): Promise<SystemKnowledge> => {
  if (forceReload) {
    cachedKnowledge = null;
    knowledgePromise = null;
  }

  if (cachedKnowledge) return cachedKnowledge;

  if (!knowledgePromise) {
    knowledgePromise = fetch('./siemens-nshv.json', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`siemens-nshv.json konnte nicht geladen werden (HTTP ${res.status})`);
        }
        const data: SystemKnowledge = await res.json();
        if (!data || !data.systemRules || Object.keys(data.systemRules).length === 0) {
          throw new Error('siemens-nshv.json enthält keine gültigen systemRules.');
        }
        cachedKnowledge = data;
        return data;
      })
      .catch((err) => {
        knowledgePromise = null;
        throw err;
      });
  }

  return knowledgePromise;
};

export const getKnowledgeOptions = (knowledge?: SystemKnowledge | null) => {
  const rules = knowledge?.systemRules;
  if (!rules) {
    return {
      ipOptions: [] as string[],
      formOptions: [] as string[],
      busbarOptions: [] as string[],
      installationOptions: [] as string[]
    };
  }

  const ipSet = new Set<string>();
  const formSet = new Set<string>();
  const busbarSet = new Set<string>();
  const installationSet = new Set<string>();

  Object.values(rules).forEach((rule) => {
    rule.allowedIp?.forEach((v) => ipSet.add(v));
    rule.allowedForms?.forEach((v) => formSet.add(v));
    rule.allowedBusbarPositions?.forEach((v) => busbarSet.add(v));
    rule.allowedInstallationTypes?.forEach((v) => installationSet.add(v));
  });

  return {
    ipOptions: Array.from(ipSet).sort(),
    formOptions: Array.from(formSet).sort(),
    busbarOptions: Array.from(busbarSet),
    installationOptions: Array.from(installationSet)
  };
};

const isUnknown = (val: string | null | undefined): boolean => {
  if (!val) return true;
  const lower = val.trim().toLowerCase();
  return lower === '' || lower === 'unbekannt' || lower === 'unknown' || lower === 'n/a';
};

const normalizeBusbar = (val: string): string => {
  const lower = val.trim().toLowerCase();
  if (lower.includes('top') || lower.includes('oben')) return 'oben';
  if (lower.includes('back') || lower.includes('rear') || lower.includes('hinten')) return 'hinten';
  if (lower.includes('center') || lower.includes('middle') || lower.includes('mittig')) return 'mittig';
  return lower;
};

const normalizeInstallationType = (val: string): string => {
  const lower = val.trim().toLowerCase();
  if (lower.includes('doppelfront') || lower.includes('double')) return 'doppelfront';
  if (lower.includes('rücken') || lower.includes('back-to-back') || lower.includes('back to back')) return 'rücken an rücken';
  if (lower.includes('einfront') || lower.includes('single-front') || lower.includes('single front')) return 'einfront';
  if (lower.includes('wand') || lower.includes('wall')) return 'wand';
  return lower;
};

const normalizeForm = (val: string): string => {
  return val.toLowerCase().replace(/form/g, '').replace(/\s+/g, '').trim();
};

interface CriterionDefinition {
  id: string;
  active: boolean;
  labelDe: string;
  labelEn: string;
  check: (rule: SystemRule) => { passed: boolean; onRequest?: boolean; limitDescDe?: string; limitDescEn?: string };
}

export const evaluateSystem = (
  data: SwitchgearData,
  language: 'de' | 'en' = 'de',
  knowledge: SystemKnowledge
): EvaluationResult => {
  const rulesMap = knowledge?.systemRules;
  if (!rulesMap || Object.keys(rulesMap).length === 0) {
    throw new Error('Wissensdatenbank (siemens-nshv.json) ist nicht geladen.');
  }

  const rawOrder =
    knowledge.evaluationOrder && knowledge.evaluationOrder.length > 0
      ? knowledge.evaluationOrder
      : Object.keys(rulesMap);
  const order = rawOrder.filter((name) => Boolean(rulesMap[name]));

  if (order.length === 0) {
    throw new Error('Keine gültigen Systeme in evaluationOrder/systemRules der siemens-nshv.json gefunden.');
  }

  const features = data.features || {
    arcFault: false,
    einschub: false,
    mcc: false,
    nj63: false,
    kompensation: false,
    universal: false
  };

  const criteria: CriterionDefinition[] = [
    {
      id: 'current',
      active: data.current !== null && data.current !== undefined,
      labelDe: `Bemessungsstrom (${data.current}A)`,
      labelEn: `Rated current (${data.current}A)`,
      check: (rule) => ({
        passed: data.current! <= rule.maxCurrent,
        limitDescDe: `> ${rule.maxCurrent}A`,
        limitDescEn: `> ${rule.maxCurrent}A`
      })
    },
    {
      id: 'icw',
      active: data.icw !== null && data.icw !== undefined,
      labelDe: `Kurzschlussfestigkeit (${data.icw}kA)`,
      labelEn: `Short-circuit strength (${data.icw}kA)`,
      check: (rule) => ({
        passed: data.icw! <= rule.maxIcw,
        limitDescDe: `> ${rule.maxIcw}kA`,
        limitDescEn: `> ${rule.maxIcw}kA`
      })
    },
    {
      id: 'voltage',
      active: data.voltage !== null && data.voltage !== undefined,
      labelDe: `Spannung (${data.voltage}V)`,
      labelEn: `Voltage (${data.voltage}V)`,
      check: (rule) => ({
        passed: data.voltage! <= rule.maxVoltage,
        limitDescDe: `> ${rule.maxVoltage}V`,
        limitDescEn: `> ${rule.maxVoltage}V`
      })
    },
    {
      id: 'ui',
      active: data.ui !== null && data.ui !== undefined,
      labelDe: `Isolationsspannung Ui (${data.ui}V)`,
      labelEn: `Insulation voltage Ui (${data.ui}V)`,
      check: (rule) => ({
        passed: data.ui! <= rule.maxUi,
        limitDescDe: `> ${rule.maxUi}V`,
        limitDescEn: `> ${rule.maxUi}V`
      })
    },
    {
      id: 'uimp',
      active: data.uimp !== null && data.uimp !== undefined,
      labelDe: `Bemessungsstoßspannungsfestigkeit (${data.uimp}kV)`,
      labelEn: `Rated impulse withstand voltage (${data.uimp}kV)`,
      check: (rule) => ({
        passed: data.uimp! <= rule.maxUimp,
        limitDescDe: `> ${rule.maxUimp}kV`,
        limitDescEn: `> ${rule.maxUimp}kV`
      })
    },
    {
      id: 'ipk',
      active: data.ipk !== null && data.ipk !== undefined,
      labelDe: `Bemessungsstoßkurzschlussstrom (${data.ipk}kA)`,
      labelEn: `Rated peak withstand current (${data.ipk}kA)`,
      check: (rule) => ({
        passed: data.ipk! <= rule.maxIpk,
        limitDescDe: `> ${rule.maxIpk}kA`,
        limitDescEn: `> ${rule.maxIpk}kA`
      })
    },
    {
      id: 'height',
      active: data.height !== null && data.height !== undefined,
      labelDe: `Höhe (${data.height}mm)`,
      labelEn: `Height (${data.height}mm)`,
      check: (rule) => ({
        passed: data.height! <= rule.maxHeight,
        limitDescDe: `> ${rule.maxHeight}mm`,
        limitDescEn: `> ${rule.maxHeight}mm`
      })
    },
    {
      id: 'ip',
      active: !isUnknown(data.ip),
      labelDe: `Schutzart ${data.ip}`,
      labelEn: `Protection class ${data.ip}`,
      check: (rule) => {
        const normIp = data.ip!.replace(/\s+/g, '').toUpperCase();
        const allowed = rule.allowedIp || [];
        return {
          passed: allowed.some((v) => v.replace(/\s+/g, '').toUpperCase() === normIp)
        };
      }
    },
    {
      id: 'form',
      active: !isUnknown(data.form),
      labelDe: `Innere Unterteilung ${data.form}`,
      labelEn: `Internal separation ${data.form}`,
      check: (rule) => {
        const normForm = normalizeForm(data.form!);
        const allowed = rule.allowedForms || [];
        return {
          passed: allowed.some((f) => {
            const nf = f.toLowerCase().trim();
            return nf === normForm || (normForm.length === 1 && nf.startsWith(normForm));
          })
        };
      }
    },
    {
      id: 'busbarPosition',
      active: !isUnknown(data.busbarPosition),
      labelDe: `Sammelschienenlage ${data.busbarPosition}`,
      labelEn: `Busbar position ${data.busbarPosition}`,
      check: (rule) => {
        const normPos = normalizeBusbar(data.busbarPosition!);
        const allowed = rule.allowedBusbarPositions || [];
        return {
          passed: allowed.some((p) => {
            const np = normalizeBusbar(p);
            return normPos.includes(np) || np.includes(normPos);
          })
        };
      }
    },
    {
      id: 'installationType',
      active: !isUnknown(data.installationType),
      labelDe: `Aufstellart ${data.installationType}`,
      labelEn: `Installation type ${data.installationType}`,
      check: (rule) => {
        const normType = normalizeInstallationType(data.installationType!);
        const allowed = rule.allowedInstallationTypes || [];
        return {
          passed: allowed.some((t) => {
            const nt = normalizeInstallationType(t);
            return normType.includes(nt) || nt.includes(normType);
          })
        };
      }
    },
    {
      id: 'arcFault',
      active: Boolean(features.arcFault),
      labelDe: 'Störlichtbogenschutz',
      labelEn: 'Arc fault protection',
      check: (rule) => {
        const support: FeatureSupport = rule.features?.arcFault ?? false;
        return { passed: support !== false, onRequest: support === 'on_request' };
      }
    },
    {
      id: 'einschub',
      active: Boolean(features.einschub),
      labelDe: 'Einschubtechnik',
      labelEn: 'Withdrawable technology',
      check: (rule) => {
        const support: FeatureSupport = rule.features?.einschub ?? false;
        return { passed: support !== false, onRequest: support === 'on_request' };
      }
    },
    {
      id: 'mcc',
      active: Boolean(features.mcc),
      labelDe: 'Motor Control Center (MCC)',
      labelEn: 'Motor Control Center (MCC)',
      check: (rule) => {
        const support: FeatureSupport = rule.features?.mcc ?? false;
        return { passed: support !== false, onRequest: support === 'on_request' };
      }
    },
    {
      id: 'nj63',
      active: Boolean(features.nj63),
      labelDe: 'Lasttrennschalter mit Sicherungen (3NJ63)',
      labelEn: 'Switch disconnectors with fuses (3NJ63)',
      check: (rule) => {
        const support: FeatureSupport = rule.features?.nj63 ?? false;
        return { passed: support !== false, onRequest: support === 'on_request' };
      }
    },
    {
      id: 'kompensation',
      active: Boolean(features.kompensation),
      labelDe: 'Blindleistungskompensation',
      labelEn: 'Reactive power compensation',
      check: (rule) => {
        const support: FeatureSupport = rule.features?.kompensation ?? false;
        return { passed: support !== false, onRequest: support === 'on_request' };
      }
    },
    {
      id: 'universal',
      active: Boolean(features.universal),
      labelDe: 'Universaleinbautechnik',
      labelEn: 'Universal mounting technology',
      check: (rule) => {
        const support: FeatureSupport = rule.features?.universal ?? false;
        return { passed: support !== false, onRequest: support === 'on_request' };
      }
    }
  ];

  const activeCriteria = criteria.filter((c) => c.active);

  const systemCheckResults = order.map((systemName) => {
    const rule = rulesMap[systemName];
    return activeCriteria.map((criterion) => criterion.check(rule));
  });

  let selectedIndex = systemCheckResults.findIndex((checks) => checks.every((res) => res.passed));
  if (selectedIndex === -1) {
    selectedIndex = order.length - 1;
  }

  const selectedSystem = order[selectedIndex];
  const reasons: string[] = [];

  activeCriteria.forEach((criterion, cIdx) => {
    const label = language === 'de' ? criterion.labelDe : criterion.labelEn;
    const selectedRes = systemCheckResults[selectedIndex][cIdx];
    const excludedEarlier = order
      .slice(0, selectedIndex)
      .filter((_, sIdx) => !systemCheckResults[sIdx][cIdx].passed);

    if (!selectedRes.passed) {
      const limit = language === 'de' ? selectedRes.limitDescDe : selectedRes.limitDescEn;
      reasons.push(
        language === 'de'
          ? `${label} überschreitet alle Systemgrenzen${limit ? ` (${selectedSystem}: ${limit.replace('> ', 'max. ')})` : ''}`
          : `${label} exceeds all system limits${limit ? ` (${selectedSystem}: ${limit.replace('> ', 'max. ')})` : ''}`
      );
      return;
    }

    if (excludedEarlier.length > 0) {
      const allEarlierExcluded = excludedEarlier.length === selectedIndex && selectedIndex === order.length - 1;
      let reason = '';

      if (allEarlierExcluded && selectedIndex > 1) {
        reason = language === 'de'
          ? `${label} nur mit ${selectedSystem} möglich`
          : `${label} only possible with ${selectedSystem}`;
      } else {
        reason = language === 'de'
          ? `${label} schließt ${excludedEarlier.join(', ')} aus`
          : `${label} excludes ${excludedEarlier.join(', ')}`;
      }

      if (selectedRes.onRequest) {
        reason += language === 'de'
          ? ` (bei ${selectedSystem} auf Anfrage möglich)`
          : ` (possible on request for ${selectedSystem})`;
      }

      reasons.push(reason);
    } else if (selectedRes.onRequest) {
      reasons.push(
        language === 'de'
          ? `${label} bei ${selectedSystem} auf Anfrage möglich`
          : `${label} possible on request for ${selectedSystem}`
      );
    }
  });

  if (reasons.length === 0) {
    reasons.push(
      language === 'de'
        ? `Alle Parameter im Standardbereich der ${selectedSystem}`
        : `All parameters within standard range of ${selectedSystem}`
    );
  }

  return { system: selectedSystem, reasons };
};
