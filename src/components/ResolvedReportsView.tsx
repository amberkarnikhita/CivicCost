import React from 'react';
import { ShieldCheck, CalendarRange, HeartHandshake, ChevronRight, AlertTriangle, MessageSquare } from 'lucide-react';
import { CivicIssue } from '../types';
import { 
  getAccruingRatePerSecond, 
  getElapsedSeconds, 
  formatCurrency, 
  getResolvedReport 
} from '../utils/civicUtils';

interface ResolvedReportsViewProps {
  issues: CivicIssue[];
}

export default function ResolvedReportsView({ issues }: ResolvedReportsViewProps) {
  const resolvedIssues = issues.filter(i => i.status === 'resolved');

  // Compute stats across all resolved issues
  const totalWastedCapital = resolvedIssues.reduce((acc, issue) => {
    const elapsedSec = getElapsedSeconds(issue.reportedAt, issue.resolvedAt);
    const totalCost = elapsedSec * getAccruingRatePerSecond(issue.type, issue.params);
    return acc + Math.max(0, totalCost - issue.fixCost);
  }, 0);

  const avgDaysToResolve = resolvedIssues.length > 0
    ? Number((resolvedIssues.reduce((acc, issue) => {
        const elapsedSec = getElapsedSeconds(issue.reportedAt, issue.resolvedAt);
        return acc + (elapsedSec / 86400);
      }, 0) / resolvedIssues.length).toFixed(1))
    : 0;

  return (
    <div className="space-y-6 text-zinc-900">
      {/* Top Ledger for Resolved/Closed Cases */}
      <div className="bg-white border-2 border-black rounded-none p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-1.5 max-w-xl">
          <h2 className="text-sm font-mono font-black text-black uppercase tracking-widest flex items-center gap-2">
            <HeartHandshake className="w-4.5 h-4.5 text-emerald-600" /> COMMUNITY RESOLUTION SUMMARY
          </h2>
          <p className="text-xs text-zinc-600 font-sans leading-relaxed font-medium">
            These civic issues have been fixed and closed by public engineers. The reports below quantify the total accumulated cost paid by taxpayers prior to resolution.
          </p>
        </div>

        <div className="flex gap-6 divide-x-2 divide-black">
          <div className="pl-0">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">TOTAL DELAY TAX PAID</span>
            <span className="text-2xl font-mono text-red-600 font-black tracking-tight">{formatCurrency(totalWastedCapital, 0)}</span>
          </div>
          <div className="pl-6">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">AVG RESOLUTION DELAY</span>
            <span className="text-2xl font-mono text-amber-600 font-black tracking-tight">{avgDaysToResolve} Days</span>
          </div>
        </div>
      </div>

      {/* Grid of Report Cards */}
      {resolvedIssues.length === 0 ? (
        <div className="text-center py-12 bg-white border-2 border-black rounded-none space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CalendarRange className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-zinc-800 font-mono text-sm font-black uppercase">NO ARCHIVED REPORTS</h3>
          <p className="text-zinc-500 text-xs font-sans max-w-md mx-auto px-4">
            No issues have been marked as resolved in this session yet. Go to the "Active Clocks" feed and click "Resolve" on any active issue card to populate this archive.
          </p>
        </div>
      ) : (
        <div id="resolved-reports-grid" className="space-y-6">
          {resolvedIssues.map((issue) => {
            const elapsedSec = getElapsedSeconds(issue.reportedAt, issue.resolvedAt);
            const totalIncurred = elapsedSec * getAccruingRatePerSecond(issue.type, issue.params);
            const daysTaken = (elapsedSec / 86400).toFixed(1);
            const opportunityCostLost = Math.max(0, totalIncurred - issue.fixCost);
            const wasteRatio = issue.fixCost > 0 ? (totalIncurred / issue.fixCost) : 1;

            let typeBadgeStyle = "bg-amber-100 text-amber-950 border-amber-500";
            if (issue.type === 'water_leak') typeBadgeStyle = "bg-sky-100 text-sky-950 border-sky-500";
            if (issue.type === 'streetlight') typeBadgeStyle = "bg-zinc-100 text-zinc-950 border-zinc-500";
            if (issue.type === 'garbage') typeBadgeStyle = "bg-emerald-100 text-emerald-950 border-emerald-500";
            if (issue.type === 'sewage' || issue.type === 'drain') typeBadgeStyle = "bg-rose-100 text-rose-950 border-rose-500";
            if (issue.type === 'footpath') typeBadgeStyle = "bg-indigo-100 text-indigo-950 border-indigo-500";

            return (
              <div 
                key={issue.id} 
                id={`resolved-card-${issue.id}`}
                className="bg-white border-2 border-black rounded-none p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all relative overflow-hidden text-zinc-900"
              >
                {/* Resolved Watermark Stamp */}
                <div className="absolute -top-1 -right-1 bg-emerald-100 border-2 border-black text-emerald-950 font-mono text-[9px] font-black px-4 py-2 uppercase tracking-widest rounded-none flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" /> RECONCILED & REPAIRED
                </div>

                {/* Card Title & Location */}
                <div className="space-y-1 max-w-[70%]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 border-2 border-black text-[8px] font-mono font-black tracking-widest uppercase ${typeBadgeStyle}`}>
                      {issue.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">{issue.ward}</span>
                  </div>
                  <h3 className="text-base font-black font-sans text-black tracking-tight leading-snug">
                    {issue.title}
                  </h3>
                  <p className="text-xs font-mono text-zinc-600 font-semibold">📍 Location: {issue.location}</p>
                </div>

                {/* Analytical Numbers (Side-by-side) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-50 p-4 rounded-none border-2 border-black">
                  {/* Metric 1: Actual Work Cost */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">DIRECT FIX BUDGET</span>
                    <div className="text-lg font-mono font-black text-emerald-600">
                      {formatCurrency(issue.fixCost, 0)}
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 font-medium">Material & Labor Cost</span>
                  </div>

                  {/* Metric 2: Final Accumulated Cost */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">FINAL ACCUMULATED LOSS</span>
                    <div className="text-lg font-mono font-black text-red-600">
                      {formatCurrency(totalIncurred, 0)}
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 font-medium">Incurred in {daysTaken} days</span>
                  </div>

                  {/* Metric 3: Opportunity Capital Wasted */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">COMMUNITY LOSS WASTE</span>
                    <div className="text-lg font-mono font-black text-amber-600">
                      {formatCurrency(opportunityCostLost, 0)}
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 font-medium">Capital Sunk during Delay</span>
                  </div>

                  {/* Metric 4: Loss Factor Ratio */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">EFFICIENCY BURDEN</span>
                    <div className="text-lg font-mono font-black text-zinc-900">
                      {wasteRatio.toFixed(1)}x
                    </div>
                    <span className="text-[9px] font-mono text-red-600 uppercase font-black">{wasteRatio > 10 ? 'HIGH INEFFICIENCY' : 'MODERATE BURDEN'}</span>
                  </div>
                </div>

                {/* Narrative Breakdown */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-600 font-black uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-red-600" /> SYSTEM RESOLUTION REPORT AUDIT
                  </span>
                  <div className="bg-zinc-100 border-2 border-black rounded-none p-4">
                    <p className="text-xs font-sans text-zinc-800 leading-relaxed font-medium italic">
                      "{getResolvedReport(issue)}"
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
