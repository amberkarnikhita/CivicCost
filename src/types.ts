export type IssueType = 'pothole' | 'water_leak' | 'streetlight' | 'garbage' | 'sewage' | 'drain' | 'footpath';

export interface IssueParams {
  severity?: 'low' | 'medium' | 'critical';
  // Pothole
  vehicleDamageCost?: number; // ₹1,200
  dailyTrafficCount?: number; // e.g. 4500
  
  // Water Leak
  litersPerHour?: number; // e.g. 850L
  waterRatePerLiter?: number; // ₹0.15
  
  // Broken Streetlight
  accidentProbabilityDelta?: number; // 0.085 (8.5%)
  avgInsuranceClaimCost?: number; // ₹4,50,000
  
  // Garbage Pile
  healthRiskMultiplier?: number; // 1.4
  medicalCostPerHousehold?: number; // ₹3,500
  affectedHouseholds?: number; // e.g. 120
}

export interface CivicIssue {
  id: string;
  type: IssueType;
  title: string;
  location: string;
  ward: string;
  city?: string; // Optional city field
  reportedAt: string; // ISO date
  resolvedAt?: string; // ISO date
  status: 'unresolved' | 'resolved';
  severity?: 'low' | 'medium' | 'critical';
  params: IssueParams;
  fixCost: number; // Cost to fix immediately
  photoUrl: string;
  verificationsCount?: number;
  upvotesCount?: number;
  flaggedCount?: number;
}

export interface WardHealth {
  wardName: string;
  totalUnresolvedCost: number;
  unresolvedCount: number;
  resolvedCount: number;
  avgResponseTimeDays: number; // Average days taken to resolve
  negligenceScore: number; // calculated as totalUnresolvedCost / responseTimeFactor
}
