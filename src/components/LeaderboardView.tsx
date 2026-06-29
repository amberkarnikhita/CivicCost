import React, { useState, useEffect } from 'react';
import { ShieldAlert, TrendingDown, Clock, BarChart3, AlertCircle } from 'lucide-react';
import { CivicIssue, WardHealth } from '../types';
import { 
  calculateCurrentCost, 
  getAccruingRatePerSecond, 
  getDailyAccrualRate,
  formatCurrency,
  CITY_WARD_DATA 
} from '../utils/civicUtils';

interface LeaderboardViewProps {
  issues: CivicIssue[];
  tick: number;
}

export default function LeaderboardView({ issues, tick }: LeaderboardViewProps) {
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const activeIssues = issues.filter(i => i.status === 'unresolved');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');

  // Dynamically extract any custom cities added by the user
  const customCities = Array.from(
    new Set(
      issues
        .map(i => i.city)
        .filter((c): c is string => !!c && !['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad'].includes(c))
    )
  );
  const allCities = ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', ...customCities];

  // Filter issues belonging to the selected city
  const cityActiveIssues = activeIssues.filter(i => (i.city || 'Bengaluru').toLowerCase() === selectedCity.toLowerCase());
  const cityResolvedIssues = resolvedIssues.filter(i => (i.city || 'Bengaluru').toLowerCase() === selectedCity.toLowerCase());

  // Compute total city damage this month
  const totalUnresolvedDamage = cityActiveIssues.reduce((acc, issue) => {
    return acc + calculateCurrentCost(issue);
  }, 0);

  const totalResolvedDamage = cityResolvedIssues.reduce((acc, issue) => {
    const elapsedSec = (new Date(issue.resolvedAt!).getTime() - new Date(issue.reportedAt).getTime()) / 1000;
    return acc + (elapsedSec * getAccruingRatePerSecond(issue.type, issue.params));
  }, 0);

  const cityTotalLossThisMonth = totalUnresolvedDamage + totalResolvedDamage;

  // Format the damage in standard Lakhs or Indian currency
  const formatLakhs = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return formatCurrency(amount, 0);
  };

  // Get pre-defined wards for the selected city
  const defaultWardsInCity = CITY_WARD_DATA[selectedCity] || [];

  // Get custom wards in issues under the selected city
  const customWardsInCity = Array.from(
    new Set(
      issues
        .filter(i => {
          const issueCity = i.city || 'Bengaluru';
          return issueCity.toLowerCase() === selectedCity.toLowerCase();
        })
        .map(i => i.ward)
        .filter(w => !defaultWardsInCity.includes(w))
    )
  );

  const allWardsInCity = [...defaultWardsInCity, ...customWardsInCity];

  const wardLeaderboard: WardHealth[] = allWardsInCity.map(wardName => {
    const wardActive = cityActiveIssues.filter(i => i.ward === wardName);
    const wardResolved = cityResolvedIssues.filter(i => i.ward === wardName);

    // Sum unresolved cost
    const unresolvedCost = wardActive.reduce((acc, issue) => acc + calculateCurrentCost(issue), 0);
    
    // Compute response times (historical or mock baseline)
    const resolveTimes = wardResolved.map(issue => {
      const start = new Date(issue.reportedAt).getTime();
      const end = new Date(issue.resolvedAt!).getTime();
      return (end - start) / (1000 * 86400); // in days
    });

    // Find default response time baseline
    let baseResponseTime = 7.0;
    if (selectedCity === 'Bengaluru') {
      const bWard = [
        { name: 'Ward 42 (Indiranagar)', baseResponseTime: 8.5 },
        { name: 'Ward 108 (MG Road)', baseResponseTime: 14.2 },
        { name: 'Ward 23 (KR Market)', baseResponseTime: 22.0 },
        { name: 'Ward 88 (Outer Ring Road)', baseResponseTime: 12.8 },
        { name: 'Ward 15 (St. Johns)', baseResponseTime: 5.0 },
      ].find(w => w.name === wardName);
      if (bWard) baseResponseTime = bWard.baseResponseTime;
    }

    const avgResponseTimeDays = resolveTimes.length > 0 
      ? Number((resolveTimes.reduce((a, b) => a + b, 0) / resolveTimes.length).toFixed(1))
      : baseResponseTime;

    const unresolvedCount = wardActive.length;
    // If a ward has NO unresolved issues, its negligence index is 0 (it is perfectly healthy and ranked 1st)
    const calculatedScore = unresolvedCount > 0
      ? Math.min(100, Math.round((unresolvedCost / 12000) + (unresolvedCount * 8) + (avgResponseTimeDays * 1.2)))
      : 0;

    return {
      wardName,
      totalUnresolvedCost: unresolvedCost,
      unresolvedCount,
      resolvedCount: wardResolved.length,
      avgResponseTimeDays,
      negligenceScore: calculatedScore
    };
  });

  // Sort leaderboard from lowest cost (best) to highest cost (worst)
  const sortedLeaderboard = [...wardLeaderboard].sort((a, b) => a.totalUnresolvedCost - b.totalUnresolvedCost);

  // Filter leaderboard based on search term
  const filteredLeaderboard = sortedLeaderboard.filter(ward => 
    ward.wardName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Worst Ward in terms of current active damage
  const worstWard = [...wardLeaderboard].sort((a, b) => b.totalUnresolvedCost - a.totalUnresolvedCost)[0];

  // Dynamic Average Response Delay calculation for selected city
  const cityResolvedTimes = cityResolvedIssues.map(issue => {
    const start = new Date(issue.reportedAt).getTime();
    const end = new Date(issue.resolvedAt!).getTime();
    return (end - start) / (1000 * 86400); // in days
  });
  const avgDelayDays = cityResolvedTimes.length > 0
    ? Number((cityResolvedTimes.reduce((a, b) => a + b, 0) / cityResolvedTimes.length).toFixed(1))
    : 13.9; // realistic fallback if no issues resolved yet

  return (
    <div className="space-y-6 text-zinc-900">
      {/* City Selector Tab Row */}
      <div className="flex flex-wrap gap-2.5">
        {allCities.map((cityName) => (
          <button
            key={cityName}
            id={`city-tab-${cityName}`}
            onClick={() => {
              setSelectedCity(cityName);
              setSearchTerm('');
            }}
            className={`px-4 py-2 font-mono text-xs font-black uppercase tracking-wider border-2 border-black rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 transition-all cursor-pointer ${
              selectedCity.toLowerCase() === cityName.toLowerCase()
                ? 'bg-red-600 text-white shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 translate-y-0.5'
                : 'bg-white text-zinc-900'
            }`}
          >
            {cityName}
          </button>
        ))}
      </div>

      {/* Top Ledger Cards (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total City Damage */}
        <div id="metric-unresolved-damage" className="bg-white border-2 border-black rounded-none p-5 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">UNRESOLVED LOSS RECORDS</span>
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">MONTHLY TOTAL LOSS</span>
            <div className="text-3xl font-mono font-black text-red-600 tracking-tight tabular-nums">
              {formatLakhs(cityTotalLossThisMonth)}
            </div>
            <div className="text-[11px] font-mono text-zinc-600">
              Active Leaks: <span className="text-red-600 font-black">{formatCurrency(totalUnresolvedDamage, 0)}</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Average Response Latency */}
        <div id="metric-response-latency" className="bg-white border-2 border-black rounded-none p-5 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">RESPONSE TIMEFRAMES</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">CITY AVG DELAY TO FIX</span>
            <div className="text-3xl font-mono font-black text-amber-600 tracking-tight">
              {avgDelayDays} Days
            </div>
            <p className="text-[11px] font-sans text-zinc-600 leading-normal font-medium">
              Target response is <span className="font-bold text-black border-b border-black">48 Hours</span>. Delay is significantly above threshold.
            </p>
          </div>
        </div>

        {/* Metric 3: Critical Hotspot */}
        <div id="metric-critical-hotspot" className="bg-white border-2 border-black rounded-none p-5 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">CRITICAL HOTSPOT AREA</span>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">MOST EXPOSED AREA</span>
            <div className="text-lg font-mono font-black text-black truncate">
              {worstWard?.wardName || 'N/A'}
            </div>
            <div className="text-xs font-mono font-bold text-red-600">
              Losing {formatCurrency(worstWard?.totalUnresolvedCost || 0, 0)}
            </div>
            <div className="text-[10px] font-mono text-zinc-600">
              Negligence rating: <span className="text-red-600 font-black">{worstWard?.negligenceScore || 0}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ward Economic Leaderboard */}
      <div className="bg-white border-2 border-black rounded-none overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="px-6 py-5 border-b-2 border-black bg-zinc-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-mono font-black text-black uppercase tracking-wide flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-red-600" /> {selectedCity.toUpperCase()} ECONOMIC HEALTH COMPARATIVE BOARD
            </h2>
            <p className="text-xs font-sans text-zinc-600 font-medium">
              Wards ranked by current active damage. Lower economic loss represents efficient civic maintenance.
            </p>
          </div>
          <span className="px-3 py-1 rounded-none bg-black border border-black text-[10px] font-mono text-white uppercase tracking-widest font-bold">
            REAL-TIME DATA AUDIT
          </span>
        </div>

        {/* Dynamic Interactive Search Filter */}
        <div className="px-6 py-3 border-b-2 border-black bg-white flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-black text-black uppercase">Search:</span>
            <input
              type="text"
              placeholder="Search ward name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 border-2 border-black font-mono text-xs focus:outline-none focus:ring-0 rounded-none bg-zinc-50 w-64 max-w-full"
            />
          </div>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="px-2.5 py-1.5 border-2 border-black font-mono text-xs font-bold uppercase bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Clear Filter
            </button>
          )}
          <span className="sm:ml-auto text-xs font-mono font-bold text-zinc-500 uppercase">
            Showing {filteredLeaderboard.length} of {sortedLeaderboard.length} Wards
          </span>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table id="ward-leaderboard-table" className="w-full text-left font-sans text-sm">
            <thead className="bg-zinc-100 font-mono text-[10px] uppercase tracking-wider text-zinc-700 border-b-2 border-black">
              <tr>
                <th className="py-3 px-6 text-center w-16">RANK</th>
                <th className="py-3 px-6">WARD BOUNDARY</th>
                <th className="py-3 px-6 text-center">ACTIVE ISSUES</th>
                <th className="py-3 px-6 text-center">RESOLVED ITEMS</th>
                <th className="py-3 px-6 text-right">CURRENT OUTSTANDING LOSS</th>
                <th className="py-3 px-6 text-center w-36">NEGLIGENCE INDEX</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-zinc-200 font-sans">
              {filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center font-mono text-xs text-zinc-500 uppercase">
                    No matching wards found for "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredLeaderboard.map((ward, filteredIndex) => {
                  const originalIndex = sortedLeaderboard.findIndex(w => w.wardName === ward.wardName);
                  const isWorst = originalIndex === sortedLeaderboard.length - 1 && sortedLeaderboard.length > 1;
                  const isBest = originalIndex === 0;
                  const isNoComplaint = ward.unresolvedCount === 0 && ward.totalUnresolvedCost === 0;

                  let scoreBadge = "bg-green-100 text-green-950 border-green-500";
                  let scoreText = "LOW RISK";
                  if (ward.negligenceScore > 35) {
                    scoreBadge = "bg-amber-100 text-amber-950 border-amber-500";
                    scoreText = "SEVERE DELAY";
                  }
                  if (ward.negligenceScore > 65) {
                    scoreBadge = "bg-red-100 text-red-950 border-red-500";
                    scoreText = "CRITICAL FAILURE";
                  }

                  return (
                    <tr 
                      key={ward.wardName} 
                      id={`leaderboard-row-${originalIndex}`}
                      className={`hover:bg-zinc-50 transition-all ${
                        isWorst ? 'bg-red-50/40' : isBest ? 'bg-green-50/40' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4.5 px-6 text-center font-mono font-black text-zinc-500">
                        {isBest ? '👑' : (isNoComplaint ? '1' : originalIndex + 1)}
                      </td>

                      {/* Ward Name */}
                      <td className="py-4.5 px-6 font-mono font-black text-zinc-900 uppercase tracking-tight">
                        {ward.wardName}
                      </td>

                      {/* Active */}
                      <td className="py-4.5 px-6 text-center font-mono text-zinc-900">
                        <span className={`px-2 py-0.5 border border-black rounded-none text-xs ${
                          ward.unresolvedCount > 0 ? 'text-red-700 bg-red-100 font-black' : 'text-zinc-500 font-bold'
                        }`}>
                          {ward.unresolvedCount}
                        </span>
                      </td>

                      {/* Resolved */}
                      <td className="py-4.5 px-6 text-center font-mono text-zinc-600 font-bold">
                        {ward.resolvedCount}
                      </td>

                      {/* Economic Damage */}
                      <td className="py-4.5 px-6 text-right font-mono font-black tabular-nums text-red-600">
                        {formatCurrency(ward.totalUnresolvedCost, 2)}
                      </td>

                      {/* Negligence Score */}
                      <td className="py-4.5 px-6 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-black rounded-none border-2 uppercase ${scoreBadge}`}>
                            {ward.negligenceScore} - {scoreText}
                          </span>
                          {/* Tiny progress bar background */}
                          <div className="w-20 bg-zinc-100 h-2 rounded-none overflow-hidden border-2 border-black">
                            <div 
                              className={`h-full ${
                                ward.negligenceScore > 65 ? 'bg-red-500' : ward.negligenceScore > 35 ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${ward.negligenceScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Explainer Callout */}
      <div className="bg-zinc-50 border-2 border-black rounded-none p-4 flex gap-3.5 items-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="space-y-1 font-sans text-xs text-zinc-800">
          <h4 className="font-mono font-black text-black uppercase">NEGLIGENCE INDEX MATHEMATICAL MATRIX</h4>
          <p className="text-zinc-600 leading-relaxed font-medium">
            The Negligence Score is derived dynamically from: <code className="text-red-700 bg-white border border-zinc-300 px-1 font-bold rounded-none">f(x) = (Outstanding Cost Loss / ₹12,000) + (Active Cases × 8) + (Avg Days Delayed × 1.2)</code>. This index highlights which administrative wards fail to resolve high-frequency, high-burn problems, focusing resources on areas with the highest real societal friction. Zero active complaints translates directly to a negligence index of 0.
          </p>
        </div>
      </div>
    </div>
  );
}

