import { CivicIssue } from '../types';

export const INITIAL_ISSUES: CivicIssue[] = [
  {
    id: 'issue-1',
    type: 'water_leak',
    title: 'Major Water Main Pipe Burst',
    location: 'Indiranagar 100ft Rd, near Metro Pillar 112',
    ward: 'Ward 42 (Indiranagar)',
    reportedAt: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000).toISOString(), // 5.5 days ago
    status: 'unresolved',
    severity: 'medium',
    params: {
      litersPerHour: 1200,
      waterRatePerLiter: 0.15
    },
    fixCost: 18000,
    photoUrl: 'https://images.unsplash.com/photo-1542013936693-8848e5744a61?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'issue-2',
    type: 'pothole',
    title: 'Dangerous Deep Craters on High-Speed Lane',
    location: 'MG Road Metro Gate A, near Signal Junction',
    ward: 'Ward 108 (MG Road)',
    reportedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    status: 'unresolved',
    severity: 'medium',
    params: {
      vehicleDamageCost: 1200,
      dailyTrafficCount: 6800
    },
    fixCost: 4500,
    photoUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'issue-3',
    type: 'garbage',
    title: 'Unattended Hazardous Commercial Waste Pile',
    location: 'KR Market, Alleyway 4 (Next to Wholesale Market)',
    ward: 'Ward 23 (KR Market)',
    reportedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    status: 'unresolved',
    severity: 'medium',
    params: {
      healthRiskMultiplier: 1.4,
      medicalCostPerHousehold: 3500,
      affectedHouseholds: 180
    },
    fixCost: 15000,
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'issue-4',
    type: 'streetlight',
    title: 'Blind Intersection Quad-Streetlight Outage',
    location: 'Outer Ring Road, Exit 9 Ramp',
    ward: 'Ward 88 (Outer Ring Road)',
    reportedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(), // 22 days ago
    status: 'unresolved',
    severity: 'medium',
    params: {
      accidentProbabilityDelta: 0.085,
      avgInsuranceClaimCost: 450000
    },
    fixCost: 3500,
    photoUrl: 'https://images.unsplash.com/photo-1509024644558-2f56ce76c0fc?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'issue-5',
    type: 'drain',
    title: 'Overflowing Sewage Line Flooding Footpath',
    location: 'Koramangala 4th Block, 17th Main Rd Corner',
    ward: 'Ward 42 (Indiranagar)',
    reportedAt: new Date(Date.now() - 2.1 * 24 * 60 * 60 * 1000).toISOString(), // 2.1 days ago
    status: 'unresolved',
    severity: 'medium',
    params: {
      dailyTrafficCount: 3800
    },
    fixCost: 9500,
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'issue-6',
    type: 'pothole',
    title: 'Suspension-Shattering Potholes on Flyover Exit',
    location: 'Richmond Circle Flyover, Exit Lane',
    ward: 'Ward 108 (MG Road)',
    reportedAt: new Date(Date.now() - 3.2 * 24 * 60 * 60 * 1000).toISOString(), // 3.2 days ago
    status: 'unresolved',
    severity: 'critical',
    params: {
      vehicleDamageCost: 1200,
      dailyTrafficCount: 11000
    },
    fixCost: 6000,
    photoUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80'
  },
  
  // Resolved issues for post-mortem analysis
  {
    id: 'issue-resolved-1',
    type: 'pothole',
    title: 'Asphalt Collapse near School Crossing',
    location: 'St. Marys School Road, Gate 2 Entrance',
    ward: 'Ward 15 (St. Johns)',
    reportedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // resolved 7 days ago
    status: 'resolved',
    severity: 'medium',
    params: {
      vehicleDamageCost: 1200,
      dailyTrafficCount: 4200
    },
    fixCost: 5000,
    photoUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'issue-resolved-2',
    type: 'water_leak',
    title: 'High-Pressure Water Main Blowout',
    location: 'Hebbal Flyover, Service Road Junction',
    ward: 'Ward 88 (Outer Ring Road)',
    reportedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    resolvedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), // resolved 11 days ago (took 4 days)
    status: 'resolved',
    severity: 'medium',
    params: {
      litersPerHour: 1800,
      waterRatePerLiter: 0.15
    },
    fixCost: 25000,
    photoUrl: 'https://images.unsplash.com/photo-1542013936693-8848e5744a61?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'issue-resolved-3',
    type: 'streetlight',
    title: 'Total Streetlight Blackout in High-Crime Zone',
    location: 'Silk Board Junction Underpass',
    ward: 'Ward 23 (KR Market)',
    reportedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days ago
    resolvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // resolved 12 days ago (took 28 days)
    status: 'resolved',
    severity: 'medium',
    params: {
      accidentProbabilityDelta: 0.085,
      avgInsuranceClaimCost: 450000
    },
    fixCost: 8000,
    photoUrl: 'https://images.unsplash.com/photo-1509024644558-2f56ce76c0fc?auto=format&fit=crop&w=400&q=80'
  }
];
