import { CivicIssue, IssueType } from '../types';

const BENGALURU_NEIGHBORHOODS = [
  'Chowdeshwari', 'Attur', 'Yelahanka Satellite Town', 'Kogilu', 'Jakkur', 
  'Thanisandra', 'Byatarayanapura', 'Chikkabommasandra', 'Yelahanka', 'Chokkasandra',
  'Kempapura', 'Shettihalli', 'Mallasandra', 'Bagalakunte', 'T Dasarahalli',
  'Peenya Industrial Area', 'Jalahalli', 'Kuvempu Nagar', 'Doddabommasandra', 'Vidyaranyapura',
  'Radhakrishna Temple', 'Sanjaynagar', 'Sadashivanagar', 'Ganganagar', 'Hebbal',
  'Vishwanatha Nagenahalli', 'Manorayanapalya', 'RT Nagar', 'Kaval Bairasandra', 'Devara Jeevanahalli',
  'Kushal Nagar', 'Kadu Gondanahalli', 'HBR Layout', 'Banaswadi', 'Kammanahalli',
  'Kalyan Nagar', 'Hennur', 'Horamavu', 'Ramamurthy Nagar', 'KR Puram',
  'Mahadevapura', 'Indiranagar', 'HAL 2nd Stage', 'Domlur', 'Jeevanbhimanagar',
  'CV Raman Nagar', 'Kaggadasapura', 'Hoodi', 'Garudachar Palya', 'Kadugodi',
  'Varthur', 'Bellandur', 'Hagadur', 'Doddanekundi', 'Marathahalli',
  'HSR Layout', 'Singasandra', 'Bommanahalli', 'Begur', 'Arakere',
  'Gottigere', 'Anjanapura', 'Konanakunte', 'Uttarahalli', 'Padmanabhanagar',
  'Chikkalasandra', 'Yelachenahalli', 'JP Nagar', 'Jayanagar', 'Giri Nagar',
  'Chamarajapet', 'Basavanagudi', 'Hanumanth Nagar', 'Srinagar', 'Ganeshamandira',
  'Karisandra', 'Banashankari Temple Ward', 'Yediyur', 'Pattabhiram Nagar', 'BTM Layout',
  'Madiwala', 'Jakkarasandra', 'Koramangala', 'Ejipura', 'Lakkasandra',
  'Adugodi', 'Shanthi Nagar', 'Sudham Nagar', 'Dharmaraya Swamy Temple', 'Sunkenahalli',
  'Vishveshwara Puram', 'Kempegowda Ward', 'Chickpet', 'Cottonpet', 'Binnypet',
  'Jagajivan Ram Nagar', 'Chamarajapet West', 'Padarayanapura', 'Valmiki Nagar', 'Srirampura',
  'Malleshwaram', 'Subhash Nagar', 'Gandhinagar', 'Dattatreya Temple', 'Vyalikaval',
  'Palace Guttahalli', 'Jayamahal', 'Vasanth Nagar', 'Sampangiram Nagar', 'Sudhama Nagar',
  'Richmond Town', 'Ashok Nagar', 'Shivajinagar', 'Bharathi Nagar', 'Pulikeshi Nagar',
  'Cox Town', 'Fraser Town', 'Benson Town', 'Jeevanahalli', 'Kacharakanahalli',
  'Kalyan Nagar East', 'Banaswadi West', 'Horamavu North', 'Ramamurthy Nagar East', 'Vijnana Nagar',
  'HAL Road', 'Varthur South', 'Bellandur West', 'HSR Layout South', 'BTM Layout North',
  'Jayanagar East', 'JP Nagar West', 'Banashankari Stage II', 'Padmanabhanagar West', 'Uttarahalli South',
  'Kengeri Satellite Town', 'Rajarajeshwari Nagar', 'Nayandahalli', 'Gnanabharathi', 'Chandra Layout',
  'Vijayanagar', 'Basaveshwaranagar', 'Kamakshipalya', 'Govindraj Nagar', 'Chandra Layout West',
  'Vijayanagar North', 'Basaveshwaranagar East', 'Kamakshipalya South', 'Sunkadakatte', 'Hegganahalli',
  'Laggere West', 'Chokkasandra North', 'T Dasarahalli West', 'Peenya Industrial Area East', 'Jalahalli North',
  'Kuvempu Nagar East', 'Vidyaranyapura West', 'Yelahanka North', 'Chowdeshwari North', 'Attur North'
];

const CUSTOM_BENGALURU_MAP: Record<number, string> = {
  15: 'St. Johns',
  23: 'KR Market',
  42: 'Indiranagar',
  88: 'Outer Ring Road',
  108: 'MG Road',
};

const generateBengaluruWards = (): string[] => {
  const wards: string[] = [];
  for (let i = 1; i <= 243; i++) {
    if (CUSTOM_BENGALURU_MAP[i]) {
      wards.push(`Ward ${i} (${CUSTOM_BENGALURU_MAP[i]})`);
    } else {
      const nameIndex = (i - 1) % BENGALURU_NEIGHBORHOODS.length;
      const name = BENGALURU_NEIGHBORHOODS[nameIndex];
      wards.push(`Ward ${i} (${name})`);
    }
  }
  return wards;
};

export const CITY_WARD_DATA: Record<string, string[]> = {
  'Bengaluru': generateBengaluruWards(),
  'Mumbai': [
    'Ward A (Colaba & Fort)',
    'Ward D (Malabar Hill)',
    'Ward H-West (Bandra)',
    'Ward K-West (Andheri)',
    'Ward S (Bhandup)',
  ],
  'Delhi': [
    'Ward 10-N (Connaught Place)',
    'Ward 52-S (Saket)',
    'Ward 73-C (Chandni Chowk)',
    'Ward 98-E (Mayur Vihar)',
    'Ward 112-W (Dwarka)',
  ],
  'Chennai': [
    'Ward 110 (Mylapore)',
    'Ward 123 (Adyar)',
    'Ward 156 (T. Nagar)',
    'Ward 172 (Velachery)',
    'Ward 190 (Anna Nagar)',
  ],
  'Hyderabad': [
    'Ward 12 (Banjara Hills)',
    'Ward 15 (Jubilee Hills)',
    'Ward 8 (Gachibowli)',
    'Ward 3 (Begumpet)',
    'Ward 24 (Madhapur)',
  ],
};


/**
 * Calculates the exact cost per day according to the user's ground-up formulas.
 */
export function getCostPerDay(type: IssueType, severity: 'low' | 'medium' | 'critical'): number {
  const rates: Record<IssueType, Record<'low' | 'medium' | 'critical', number>> = {
    pothole:     { low: 950,  medium: 4200,  critical: 14500 },
    water_leak:  { low: 640,  medium: 4230,  critical: 16260 },
    streetlight: { low: 560,  medium: 2220,  critical: 6800  },
    garbage:     { low: 1790, medium: 7310,  critical: 19620 },
    drain:       { low: 400,  medium: 3300,  critical: 17400 },
    footpath:    { low: 1000, medium: 3400,  critical: 12400 },
    sewage:      { low: 400,  medium: 3300,  critical: 17400 }, // Fallback mapping sewage to drain
  };
  return rates[type]?.[severity] ?? rates['pothole'][severity];
}

/**
 * Calculates the accrued cost of an issue per second based on its specific math model.
 */
export function getAccruingRatePerSecond(type: IssueType, params: any): number {
  const severity = params?.severity || 'medium';
  return getCostPerDay(type, severity) / 86400;
}

/**
 * Calculates the daily accruing cost of an issue.
 */
export function getDailyAccrualRate(type: IssueType, params: any): number {
  const severity = params?.severity || 'medium';
  return getCostPerDay(type, severity);
}

/**
 * Calculates the elapsed time in seconds between two dates, or between a date and now.
 */
export function getElapsedSeconds(startDateStr: string, endDateStr?: string): number {
  const start = new Date(startDateStr).getTime();
  const end = endDateStr ? new Date(endDateStr).getTime() : Date.now();
  return Math.max(0, (end - start) / 1000);
}

/**
 * Calculates the current cost for an issue.
 */
export function calculateCurrentCost(issue: CivicIssue): number {
  const seconds = getElapsedSeconds(issue.reportedAt, issue.resolvedAt);
  const severity = issue.severity || issue.params?.severity || 'medium';
  const rate = getCostPerDay(issue.type, severity) / 86400;
  return seconds * rate;
}

/**
 * Formats duration in a human-readable form (X days, Y hours, Z mins)
 */
export function formatDuration(startDateStr: string, endDateStr?: string): string {
  const seconds = getElapsedSeconds(startDateStr, endDateStr);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0 || days > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
  
  return parts.join(', ');
}

/**
 * Formats a currency number into Indian Rupee style with specified decimals
 */
export function formatCurrency(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Generates an AI Formula Breakdown tooltip / textual panel content.
 */
export function getFormulaBreakdown(type: IssueType, params: any): { formula: string; values: string; explanation: string } {
  const severity = params?.severity || 'medium';
  const dailyCost = getCostPerDay(type, severity);

  switch (type) {
    case 'pothole': {
      if (severity === 'low') {
        return {
          formula: 'Daily Cost = Direct Damage (₹96) + Risk Premium (₹200) + Secondary Loss (₹1,236) | Calibrated: ₹950/day',
          values: '₹96 (800 vehicles × 2% hits × 10% damage × ₹600 repair) + ₹200 (Accident risk) + ₹1,236 (Fuel loss)',
          explanation: 'Low severity pothole with 800 daily commuting vehicles. 2% hit rate with 10% chance of tire/alignment damage (avg ₹600). Statistical accident risk adds ₹200/day. Secondary fuel loss adds ₹1,236/day (30% slow down wasting 0.05L each at ₹103/L).'
        };
      } else if (severity === 'medium') {
        return {
          formula: 'Daily Cost = Direct Damage (₹360) + Risk Premium (₹1,800) + Secondary Loss (₹4,635) | Calibrated: ₹4,200/day',
          values: '₹360 (3,000 vehicles × 5% hits × 20% damage × ₹1,200 repair) + ₹1,800 (Accident risk) + ₹4,635 (Fuel loss)',
          explanation: 'Medium severity pothole with 3,000 daily commuting vehicles. 5% hit rate with 20% chance of tire/alignment damage (avg ₹1,200). Statistical accident risk adds ₹1,800/day. Secondary fuel loss adds ₹4,635/day (30% slow down wasting 0.05L each at ₹103/L).'
        };
      } else {
        return {
          formula: 'Daily Cost = Direct Damage (₹5,280) + Risk Premium (₹9,000) + Secondary Loss (₹12,360) | Calibrated: ₹14,500/day',
          values: '₹5,280 (8,000 vehicles × 10% hits × 30% damage × ₹2,200 repair) + ₹9,000 (Accident risk) + ₹12,360 (Fuel loss)',
          explanation: 'Critical severity pothole with 8,000 daily commuting vehicles. 10% hit rate with 30% chance of severe damage (avg ₹2,200). Statistical accident risk adds ₹9,000/day (1 accident/60 days at ₹5.4L). Secondary fuel loss adds ₹12,360/day.'
        };
      }
    }
    case 'water_leak': {
      if (severity === 'low') {
        return {
          formula: 'Daily Cost = Water Loss (₹576) + Road Degradation (₹110) + Risk Premium (₹50) | Calibrated: ₹640/day',
          values: '₹576 (300 L/hr × 24hr × ₹80/KL) + ₹110 (Road degradation) + ₹50 (Risk premium)',
          explanation: 'Minor seep of 300 L/hr. True economic treatment & pumping cost to BWSSB is ₹80/KL. Water-soaked 50m road base degradation damages asset by ₹110/day. Contamination risk premium adds ₹50/day.'
        };
      } else if (severity === 'medium') {
        return {
          formula: 'Daily Cost = Water Loss (₹2,880) + Road Degradation (₹550) + Risk Premium (₹800) | Calibrated: ₹4,230/day',
          values: '₹2,880 (1,500 L/hr × 24hr × ₹80/KL) + ₹550 (Road degradation) + ₹800 (Risk premium)',
          explanation: 'Moderate stream of 1,500 L/hr. True economic treatment & pumping cost to BWSSB is ₹80/KL. Water-soaked road base degradation damages asset by ₹550/day. Contamination/sinkhole risk premium adds ₹800/day.'
        };
      } else {
        return {
          formula: 'Daily Cost = Water Loss (₹11,520) + Road Degradation (₹2,200) + Risk Premium (₹4,500) | Calibrated: ₹16,260/day',
          values: '₹11,520 (6,000 L/hr × 24hr × ₹80/KL) + ₹2,200 (Road degradation) + ₹4,500 (Risk premium)',
          explanation: 'Critical main burst of 6,000 L/hr. True economic treatment & pumping cost to BWSSB is ₹80/KL. Severe water soaking causes rapid road base asset damage of ₹2,200/day. Severe structural risk premium adds ₹4,500/day.'
        };
      }
    }
    case 'streetlight': {
      if (severity === 'low') {
        return {
          formula: 'Daily Cost = Accident Risk (₹270) + Crime Risk (₹100) + Business Loss (₹200) | Calibrated: ₹560/day',
          values: '₹270 ((40 night traffic / 80,000) × ₹540,000 cost) + ₹100 (Crime risk) + ₹200 (Business loss)',
          explanation: 'Stretch of 50m with lights out, affecting 40 night commuters. Nighttime accident risk multiplier is 2.5x. Snatching crime risk adds ₹100/day. Reduced footfall local business loss adds ₹200/day.'
        };
      } else if (severity === 'medium') {
        return {
          formula: 'Daily Cost = Accident Risk (₹810) + Crime Risk (₹560) + Business Loss (₹600) | Calibrated: ₹2,220/day',
          values: '₹810 ((120 night traffic / 80,000) × ₹540,000 cost) + ₹560 (Crime risk) + ₹600 (Business loss)',
          explanation: 'Stretch of 150m with lights out, affecting 120 night commuters. Nighttime accident risk multiplier is 2.5x. Snatching crime risk adds ₹560/day (1 snatch/45 days). Reduced footfall local business loss adds ₹600/day.'
        };
      } else {
        return {
          formula: 'Daily Cost = Accident Risk (₹1,620) + Crime Risk (₹1,800) + Business Loss (₹1,500) | Calibrated: ₹6,800/day',
          values: '₹1,620 ((240 night traffic / 80,000) × ₹540,000 cost) + ₹1,800 (Crime risk) + ₹1,500 (Business loss)',
          explanation: 'Stretch of 300m with lights out, affecting 240 night commuters. Nighttime accident risk multiplier is 2.5x. Snatching crime risk adds ₹1,800/day. Reduced footfall local business loss adds ₹1,500/day.'
        };
      }
    }
    case 'garbage': {
      if (severity === 'low') {
        return {
          formula: 'Daily Cost = Health Risk (₹787) + Property Loss (₹800) + BBMP Penalty (₹200) | Calibrated: ₹1,790/day',
          values: '₹787 (80 households × ₹3.28 base × 3x multiplier) + ₹800 (Rental loss) + ₹200 (BBMP penalty)',
          explanation: 'Affects 80 households within 200m. WHO estimates epidemic risk multiplies daily baseline health risk (₹3.28/day) by 3x. Visible pile reduces property rental value (adds ₹800/day). BBMP collection delay penalty adds ₹200/day.'
        };
      } else if (severity === 'medium') {
        return {
          formula: 'Daily Cost = Health Risk (₹4,100) + Property Loss (₹2,500) + BBMP Penalty (₹700) | Calibrated: ₹7,310/day',
          values: '₹4,100 (250 households × ₹3.28 base × 5x multiplier) + ₹2,500 (Rental loss) + ₹700 (BBMP penalty)',
          explanation: 'Affects 250 households. WHO estimates epidemic risk multiplies daily baseline health risk (₹3.28/day) by 5x. Visible pile reduces property rental value (adds ₹2,500/day). BBMP collection delay penalty adds ₹700/day.'
        };
      } else {
        return {
          formula: 'Daily Cost = Health Risk (₹15,744) + Property Loss (₹6,000) + BBMP Penalty (₹1,500) | Calibrated: ₹19,620/day',
          values: '₹15,744 (600 households × ₹3.28 base × 8x multiplier) + ₹6,000 (Rental loss) + ₹1,500 (BBMP penalty)',
          explanation: 'Affects 600 households. Epidemic risk multiplies baseline health cost by 8x due to severe disease vectors. Rent depreciation loss adds ₹6,000/day. BBMP collection delay penalty adds ₹1,500/day.'
        };
      }
    }
    case 'drain':
    case 'sewage': {
      if (severity === 'low') {
        return {
          formula: 'Daily Cost = Flood Damage (₹150) + Disease Vector (₹200) + Road Damage (₹50) | Calibrated: ₹400/day',
          values: '₹150 (5% flood prob. × 3 stranded cars × ₹1,000) + ₹200 (Disease cost) + ₹50 (Road damage)',
          explanation: 'Minor blocked drain. 5% daily flood probability with 3 stranded vehicles (avg ₹1,000 delay/damage cost). Dengue/malaria breeding disease cost adds ₹200/day. Standing water road degradation adds ₹50/day.'
        };
      } else if (severity === 'medium') {
        return {
          formula: 'Daily Cost = Flood Damage (₹2,250) + Disease Vector (₹700) + Road Damage (₹350) | Calibrated: ₹3,300/day',
          values: '₹2,250 (15% flood prob. × 15 stranded cars × ₹1,000) + ₹700 (Disease cost) + ₹350 (Road damage)',
          explanation: 'Moderately blocked drain. 15% daily flood probability with 15 stranded vehicles (avg ₹1,000 delay/damage cost). Stagnant water dengue disease risk adds ₹700/day. Standing water road degradation adds ₹350/day.'
        };
      } else {
        return {
          formula: 'Daily Cost = Flood Damage (₹14,000) + Disease Vector (₹2,200) + Road Damage (₹1,200) | Calibrated: ₹17,400/day',
          values: '₹14,000 (35% flood prob. × 40 stranded cars × ₹1,000) + ₹2,200 (Disease cost) + ₹1,200 (Road damage)',
          explanation: 'Critically blocked drain / stormwater main. 35% daily flood probability with 40 stranded vehicles (avg ₹1,000 delay/damage cost). Severe disease vector risk adds ₹2,200/day. Rapid standing water road degradation adds ₹1,200/day.'
        };
      }
    }
    case 'footpath': {
      if (severity === 'low') {
        return {
          formula: 'Daily Cost = Direct Injury (₹600) + Road Spillover (₹100) + Mobility Loss (₹300) | Calibrated: ₹1,000/day',
          values: '₹600 (300 footfall × 0.05% injury probability × ₹4,000 medical) + ₹100 (Road risk) + ₹300 (Mobility loss)',
          explanation: 'Low severity footpath failure (small cracks/broken tiles). 300 daily footfall. 0.05% injury risk with avg ₹4,000 medical cost. Commuters spilling onto road adds ₹100/day risk. Elderly/disabled mobility well-being loss adds ₹300/day.'
        };
      } else if (severity === 'medium') {
        return {
          formula: 'Daily Cost = Direct Injury (₹16,000 - scaled) + Road Spillover (₹500) + Mobility Loss (₹900) | Calibrated: ₹3,400/day',
          values: '₹16,000 (1,000 footfall × 0.20% injury probability × ₹8,000 medical) [Calibrated to ₹3,400/day]',
          explanation: 'Medium severity footpath failure (broken tiles/open trench). 1,000 daily footfall. 0.20% injury risk with avg ₹8,000 medical cost. Pedestrians forced onto road adds ₹500/day risk. Elderly mobility well-being loss adds ₹900/day.'
        };
      } else {
        return {
          formula: 'Daily Cost = Direct Injury (₹324,000 - scaled) + Road Spillover (₹2,000) + Mobility Loss (₹2,500) | Calibrated: ₹12,400/day',
          values: '₹324,000 (3,000 footfall × 0.60% injury probability × ₹18,000 medical) [Calibrated to ₹12,400/day]',
          explanation: 'Critical severity footpath failure (missing slabs/deep drops). 3,000 daily footfall. 0.60% injury risk with avg ₹18,000 medical cost. Heavy road-spillover accident risk adds ₹2,000/day. Severe elderly mobility exclusion adds ₹2,500/day.'
        };
      }
    }
    default:
      return { formula: 'Unknown', values: 'N/A', explanation: 'Unknown issue type' };
  }
}

/**
 * Generates an AI Resolved Case Report Card narrative.
 */
export function getResolvedReport(issue: CivicIssue): string {
  const seconds = getElapsedSeconds(issue.reportedAt, issue.resolvedAt);
  const severity = issue.severity || issue.params?.severity || 'medium';
  const totalCost = seconds * (getCostPerDay(issue.type, severity) / 86400);
  const daysTaken = (seconds / 86400).toFixed(1);
  const issueName = issue.type.replace('_', ' ');
  
  switch (issue.type) {
    case 'pothole':
      return `This pothole on ${issue.location} took ${daysTaken} days to resolve. While repairing it cost only ${formatCurrency(issue.fixCost, 0)}, the delay cost local commuters ${formatCurrency(totalCost, 0)} in tyre ruptures, alignment damages, back pain, minor skids, and fuel wasted from deceleration.`;
    case 'water_leak':
      return `This active pipeline leak at ${issue.location} spewed treated water for ${daysTaken} days. The engineering patch took under an hour and cost ${formatCurrency(issue.fixCost, 0)}, but the delay led to severe water waste and road base degradation, bleeding ${formatCurrency(totalCost, 0)} of public resources.`;
    case 'streetlight':
      return `For ${daysTaken} days, ${issue.location} remained dark. Restoring the streetlight bulb cost a mere ${formatCurrency(issue.fixCost, 0)}. However, leaving it dark subjected citizens to an accumulated ${formatCurrency(totalCost, 0)} in nighttime vehicle crashes, snatching theft, and women's safety auto detour costs.`;
    case 'garbage':
      return `This unattended garbage pile on ${issue.location} sat for ${daysTaken} days. Clearing it cost ${formatCurrency(issue.fixCost, 0)}, but the delay created a health risk and odor discomfort liability of ${formatCurrency(totalCost, 0)} across neighboring households from malaria/dengue vectors and stray infestation.`;
    case 'sewage':
    case 'drain':
      return `This drainage failure at ${issue.location} stood unresolved for ${daysTaken} days. Pumping and clearing the blockage cost ${formatCurrency(issue.fixCost, 0)}, but the delay inflicted an estimated ${formatCurrency(totalCost, 0)} in expected flood damages, disease vectors, and severe commuter delays on citizens.`;
    case 'footpath':
      return `This dangerous broken footpath at ${issue.location} was left neglected for ${daysTaken} days. Repairing it cost ${formatCurrency(issue.fixCost, 0)}, but the delay cost citizens ${formatCurrency(totalCost, 0)} in pedestrian fall injuries, medical bills, traffic spillover accidents, and elderly exclusion.`;
    default:
      return `This ${issueName} at ${issue.location} took ${daysTaken} days to resolve. While repairing it cost only ${formatCurrency(issue.fixCost, 0)}, the delay inflicted an estimated ${formatCurrency(totalCost, 0)} in accumulated community losses.`;
  }
}

// Keep the old name as alias for backward compatibility or direct replacement
export const getNecropsyReport = getResolvedReport;

/**
 * Generates a unique, compliant Issue ID based on:
 * - First 8 digits: Date reported on in ddmmyyyy format
 * - Next 3 digits: Ward number (left-padded or hashed to 3 digits)
 * - Last 2 digits: Current issue count of that ward in existingIssues (e.g. 01, 02...)
 */
export function generateIssueId(reportedAt: string, ward: string, existingIssues: CivicIssue[]): string {
  const date = new Date(reportedAt);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  const datePart = `${dd}${mm}${yyyy}`;

  let wardNum = '000';
  const match = ward.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    wardNum = num.toString().padStart(3, '0').slice(-3);
  } else {
    let hash = 0;
    for (let i = 0; i < ward.length; i++) {
      hash = (hash + ward.charCodeAt(i)) % 1000;
    }
    wardNum = hash.toString().padStart(3, '0');
  }

  // Count existing issues in this specific ward
  const countInWard = existingIssues.filter(i => i.ward === ward).length;
  const countPart = String(countInWard + 1).padStart(2, '0').slice(-2);

  return `${datePart}${wardNum}${countPart}`;
}

/**
 * Ensures all loaded issues have a compliant 13-digit ID in the format ddmmyyyy+ward+count
 */
export function ensureCompliantIds(issues: CivicIssue[]): CivicIssue[] {
  const compliant: CivicIssue[] = [];
  // Sort chronologically so that sequence counters are incremented in correct order
  const sorted = [...issues].sort((a, b) => new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime());

  for (const issue of sorted) {
    if (/^\d{13}$/.test(issue.id)) {
      compliant.push(issue);
    } else {
      const newId = generateIssueId(issue.reportedAt, issue.ward, compliant);
      compliant.push({ ...issue, id: newId });
    }
  }

  // Preserve the original array sorting order
  return issues.map(orig => compliant.find(c => c.reportedAt === orig.reportedAt && c.location === orig.location) || orig);
}

