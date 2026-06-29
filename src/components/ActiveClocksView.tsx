import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, ArrowUpRight, CheckCircle, Flame, Eye, Plus } from 'lucide-react';
import { CivicIssue, IssueType } from '../types';
import { 
  getAccruingRatePerSecond, 
  getDailyAccrualRate, 
  calculateCurrentCost, 
  formatCurrency, 
  formatDuration 
} from '../utils/civicUtils';

interface ActiveClocksViewProps {
  issues: CivicIssue[];
  tick: number;
  onSelectIssue: (issue: CivicIssue) => void;
  onResolveIssue: (id: string) => void;
  onOpenNewIssueModal: () => void;
  userInteractions?: {
    verified: string[];
    affected: string[];
  };
  onVerifyIssue?: (id: string) => void;
  onAffectedIssue?: (id: string) => void;
  onFlagIssue?: (id: string) => void;
}

export default function ActiveClocksView({ 
  issues, 
  tick, 
  onSelectIssue, 
  onResolveIssue,
  onOpenNewIssueModal,
  userInteractions,
  onVerifyIssue,
  onAffectedIssue,
  onFlagIssue
}: ActiveClocksViewProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  
  // Track open formulation index for inline preview
  const [expandedFormulaId, setExpandedFormulaId] = useState<string | null>(null);

  const activeIssues = issues.filter(i => i.status === 'unresolved');

  // Filter issues based on criteria
  const filteredIssues = activeIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase()) || 
                          issue.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || issue.type === selectedType;
    
    // Fuzzy matching for ward name to match select value
    const matchesWard = selectedWard === 'all' || issue.ward.includes(selectedWard);

    return matchesSearch && matchesType && matchesWard;
  });

  // Calculate total city bleeding rate per second
  const totalRatePerSecond = activeIssues.reduce((acc, issue) => {
    return acc + getAccruingRatePerSecond(issue.type, issue.params);
  }, 0);

  // Calculate cumulative real-time cost of all active issues
  const cumulativeCost = activeIssues.reduce((acc, issue) => {
    return acc + calculateCurrentCost(issue);
  }, 0);

  // Extract list of unique wards from issues for the filter dropdown
  const uniqueWards = Array.from(new Set(issues.map(i => {
    // extract "Ward XX" prefix
    const match = i.ward.match(/Ward \d+/);
    return match ? match[0] : i.ward;
  })));

  return (
    <div className="space-y-6">
      {/* City Wide Massive Live Damage Clock banner */}
      <div 
        id="city-bleeding-board"
        className="bg-white border-4 border-black rounded-none p-6 md:p-8 relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-zinc-900"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] font-mono font-black tracking-widest text-white bg-red-600 border border-black uppercase">
              <Flame className="w-3.5 h-3.5 animate-pulse" /> LIVE ACCUMULATED COMMUNITY LOSS
            </span>
            <h1 className="text-xl md:text-2xl font-mono font-black text-black uppercase tracking-tight">
              METROPOLITAN LOSS TRACKER
            </h1>
          </div>

          <div className="text-right md:text-right">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
              TOTAL ACCUMULATING LOSS RATE (SEC)
            </span>
            <span className="text-xl font-mono text-red-600 font-extrabold tracking-tight">
              +{formatCurrency(totalRatePerSecond, 2)} / sec
            </span>
          </div>
        </div>

        {/* Huge Counter */}
        <div className="mt-6 border-t-2 border-black pt-6">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div className="text-[10px] font-mono text-zinc-700 uppercase tracking-wider font-bold">
              REAL-TIME TAXPAYER INJURY TOTAL
            </div>
            <div className="text-[10px] font-mono text-red-600 font-bold uppercase tracking-wider animate-pulse">
              ● UPDATE SPEED 10 SEC
            </div>
          </div>
          <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-black text-red-600 tracking-tighter tabular-nums mt-1 truncate">
            {formatCurrency(cumulativeCost)}
          </div>
          <div className="mt-2 text-xs font-mono text-zinc-600 font-medium">
            Across <span className="text-red-600 font-black">{activeIssues.length} unresolved</span> chronic civic failures.
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border-2 border-black rounded-none p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-zinc-900">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-700" />
          <input
            id="issue-search"
            type="text"
            placeholder="Search active leaks, potholes, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-black rounded-none pl-9 pr-4 py-2 text-sm text-zinc-900 focus:outline-none focus:bg-zinc-50 font-sans"
          />
        </div>

        {/* Selects & CTA */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
          {/* Filter Type */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-700" />
            <select
              id="filter-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white border-2 border-black text-zinc-900 rounded-none px-3 py-1.5 text-xs font-mono font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">ALL HAZARDS</option>
              <option value="pothole">POTHOLES</option>
              <option value="water_leak">WATER LEAKS</option>
              <option value="streetlight">STREETLIGHTS</option>
              <option value="garbage">GARBAGE PILES</option>
              <option value="drain">DRAINAGE FAILURES</option>
              <option value="footpath">FOOTPATHS</option>
            </select>
          </div>

          {/* Filter Ward */}
          <select
            id="filter-ward"
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="bg-white border-2 border-black text-zinc-900 rounded-none px-3 py-1.5 text-xs font-mono font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">ALL WARDS</option>
            {uniqueWards.map(w => (
              <option key={w} value={w}>{w.toUpperCase()}</option>
            ))}
          </select>

          {/* Create Floating-Style Trigger */}
          <button
            id="launch-clock-modal-trigger"
            onClick={onOpenNewIssueModal}
            className="bg-black hover:bg-zinc-800 text-white font-mono text-xs font-black py-2.5 px-5 rounded-none border-2 border-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(239,68,68,1)] uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Declare Emergency
          </button>
        </div>
      </div>

      {/* Grid of Ticking Cards */}
      {filteredIssues.length === 0 ? (
        <div className="text-center py-12 bg-white border-2 border-black rounded-none space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <AlertTriangle className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-zinc-800 font-mono text-sm font-black uppercase">NO ACTIVE BLEEDING LOCATED</h3>
          <p className="text-zinc-500 text-xs font-sans max-w-md mx-auto px-4">
            All reports match zero current records or have been fully reconciled. Create a new emergency card to observe the math-engine clock.
          </p>
        </div>
      ) : (
        <div id="active-clocks-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => {
            const currentCost = calculateCurrentCost(issue);
            const dailyRate = getDailyAccrualRate(issue.type, issue.params);
            
            const isVerified = userInteractions?.verified.includes(issue.id) || false;
            const isAffected = userInteractions?.affected.includes(issue.id) || false;
            const verifications = issue.verificationsCount || 0;
            const upvotes = issue.upvotesCount || 0;
            const flaggedCount = issue.flaggedCount || 0;

            // Set styles based on issue type
            let badgeStyle = "bg-amber-100 text-amber-950 border-amber-500";
            if (issue.type === 'water_leak') badgeStyle = "bg-sky-100 text-sky-950 border-sky-500";
            if (issue.type === 'streetlight') badgeStyle = "bg-zinc-100 text-zinc-950 border-zinc-500";
            if (issue.type === 'garbage') badgeStyle = "bg-emerald-100 text-emerald-950 border-emerald-500";
            if (issue.type === 'sewage' || issue.type === 'drain') badgeStyle = "bg-rose-100 text-rose-950 border-rose-500";
            if (issue.type === 'footpath') badgeStyle = "bg-indigo-100 text-indigo-950 border-indigo-500";

            return (
              <div 
                key={issue.id}
                id={`issue-card-${issue.id}`}
                className="bg-white border-2 border-black rounded-none overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
              >
                {/* Visual Thumbnail with Google Earth / Maps HUD overlay */}
                <div className="relative h-40 bg-zinc-950 overflow-hidden shrink-0 border-b-2 border-black">
                  <img 
                    src={issue.photoUrl} 
                    alt={issue.title} 
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Scanner Lines & Vignette effect */}
                  <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-transparent to-black/40" />
                  
                  {/* Google Maps / Earth HUD Layer */}
                    <div className="absolute inset-0 flex flex-col justify-between p-2.5 select-none pointer-events-none z-10">
                      {/* Top HUD */}
                      <div className="flex justify-between items-center text-[7px] font-mono text-white tracking-widest bg-black/75 px-1.5 py-0.5 border border-white/20 uppercase font-black">
                        <span className="flex items-center gap-1">
                          {issue.type === 'water_leak' || issue.type === 'garbage' || issue.type === 'sewage' || issue.type === 'drain' ? '🛰️ GOOGLE EARTH PRO SATELLITE' : '📷 GOOGLE STREET VIEW'}
                        </span>
                        <span className="animate-pulse text-red-500 font-extrabold flex items-center gap-0.5">● LIVE</span>
                      </div>
  
                      {/* Bottom Coordinates Overlay */}
                      <div className="bg-black/85 border border-white/20 p-1 font-mono text-[7px] text-zinc-300 space-y-0.5 leading-none">
                        <div className="flex justify-between font-black">
                          <span>LAT: {issue.type === 'water_leak' ? '12.9716° N' : issue.type === 'pothole' ? '12.9743° N' : issue.type === 'garbage' ? '12.9648° N' : (issue.type === 'sewage' || issue.type === 'drain') ? '12.9318° N' : '12.9224° N'}</span>
                          <span>LON: {issue.type === 'water_leak' ? '77.6412° E' : issue.type === 'pothole' ? '77.6111° E' : issue.type === 'garbage' ? '77.5756° E' : (issue.type === 'sewage' || issue.type === 'drain') ? '77.6224° E' : '77.6804° E'}</span>
                        </div>
                        <div className="flex justify-between text-zinc-400 font-bold">
                          <span>EYE ALT: {issue.type === 'water_leak' || issue.type === 'garbage' || issue.type === 'sewage' || issue.type === 'drain' ? '410m' : '2.4m'}</span>
                          <span>IMAGERY: JUN 2026</span>
                        </div>
                      </div>
                    </div>

                  {/* Badges Overlay */}
                  <div className="absolute top-8 left-2.5 right-2.5 flex items-start justify-between gap-2 z-10">
                    <span className={`px-2 py-0.5 border-2 border-black text-[9px] font-mono font-black tracking-widest uppercase ${badgeStyle}`}>
                      {issue.type.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-black tracking-wider bg-white text-zinc-900 border-2 border-black uppercase truncate max-w-[140px]" title={`${issue.ward}${issue.city ? ` (${issue.city})` : ''}`}>
                      {issue.ward}{issue.city ? ` (${issue.city})` : ''}
                    </span>
                  </div>

                  {/* Absolute Bottom text */}
                  <div className="absolute bottom-[38px] left-2.5 right-2.5 z-10">
                    <div className="text-[9px] font-mono text-white font-bold bg-black/50 px-1.5 py-0.5 rounded-none border border-white/10 backdrop-blur-xs inline-block truncate max-w-full">
                      📍 {issue.location}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-zinc-900 line-clamp-2 hover:text-red-600 transition-colors">
                      {issue.title}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">
                      UNRESOLVED FOR: {formatDuration(issue.reportedAt)}
                    </p>
                  </div>

                  {/* Ticking Digital Display */}
                  <div className="bg-zinc-50 border-2 border-black rounded-none p-3 space-y-1 text-center shadow-[inset_2px_2px_0px_rgba(0,0,0,0.06)]">
                    <span className="text-[9px] font-mono text-zinc-500 tracking-wider block font-bold uppercase">CURRENT ACCRUED LOSS</span>
                    <div className="text-2xl font-mono font-black text-red-600 tracking-tight tabular-nums">
                      {formatCurrency(currentCost, 2)}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-600">
                      Compounding at <span className="text-red-600 font-black">{formatCurrency(dailyRate, 0)}</span> / day
                    </div>
                  </div>

                  {/* Community Verification Actions */}
                  <div className="pt-3 border-t border-dashed border-zinc-200 flex items-center gap-1.5 shrink-0">
                    <button
                      id={`btn-verify-${issue.id}`}
                      disabled={isVerified}
                      onClick={(e) => {
                        e.stopPropagation();
                        onVerifyIssue?.(issue.id);
                      }}
                      className={`flex-1 font-mono text-[9px] font-black uppercase py-1.5 px-2 border-2 border-black rounded-none transition-all flex items-center justify-center gap-1 select-none ${
                        isVerified 
                          ? 'bg-zinc-100 text-zinc-400 border-zinc-300 cursor-not-allowed' 
                          : 'bg-white hover:bg-emerald-50 text-emerald-800 border-black cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      {isVerified ? `✓ You Verified (${verifications})` : `✓ Verify Real (${verifications})`}
                    </button>

                    <button
                      id={`btn-affected-${issue.id}`}
                      disabled={isAffected}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAffectedIssue?.(issue.id);
                      }}
                      className={`flex-1 font-mono text-[9px] font-black uppercase py-1.5 px-2 border-2 border-black rounded-none transition-all flex items-center justify-center gap-1 select-none ${
                        isAffected 
                          ? 'bg-zinc-100 text-zinc-400 border-zinc-300 cursor-not-allowed' 
                          : 'bg-white hover:bg-amber-50 text-amber-800 border-black cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      {isAffected ? `⚠ Reported (${upvotes})` : `⚠ I'm Affected (${upvotes})`}
                    </button>

                    <button
                      id={`btn-flag-${issue.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onFlagIssue?.(issue.id);
                      }}
                      className="px-2 py-1.5 border-2 border-black font-mono text-[9px] font-black uppercase bg-white hover:bg-red-50 text-red-600 rounded-none transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-0.5 select-none"
                      title="Flag duplicate / inappropriate"
                    >
                      🚩 {flaggedCount > 0 ? `(${flaggedCount})` : ''}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 pt-1 border-t-2 border-black flex items-center justify-between gap-2.5">
                  <button
                    id={`btn-audit-${issue.id}`}
                    onClick={() => onSelectIssue(issue)}
                    className="flex-1 bg-white border-2 border-black text-zinc-900 hover:bg-zinc-50 font-mono text-xs py-2 rounded-none font-black transition-all flex items-center justify-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Eye className="w-3.5 h-3.5" /> Full Audit
                  </button>

                  <button
                    id={`btn-resolve-${issue.id}`}
                    onClick={() => onResolveIssue(issue.id)}
                    className="flex-1 bg-emerald-500 border-2 border-black text-white hover:bg-emerald-600 font-mono text-xs py-2 rounded-none font-black transition-all flex items-center justify-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-white" /> Resolve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
