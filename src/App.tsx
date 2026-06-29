import { useState, useEffect } from 'react';
import { 
  Flame, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  HelpCircle, 
  Briefcase, 
  MapPin, 
  Plus, 
  Menu, 
  X,
  AlertTriangle
} from 'lucide-react';
import { CivicIssue } from './types';
import { INITIAL_ISSUES } from './data/mockIssues';
import ActiveClocksView from './components/ActiveClocksView';
import LeaderboardView from './components/LeaderboardView';
import ResolvedReportsView from './components/ResolvedReportsView';
import IssueDetailPanel from './components/IssueDetailPanel';
import NewIssueModal from './components/NewIssueModal';
import { ensureCompliantIds } from './utils/civicUtils';

export default function App() {
  const [issues, setIssues] = useState<CivicIssue[]>(() => {
    // Attempt local storage load for state preservation across refreshes, falling back to initial data
    const saved = localStorage.getItem('civic_cost_issues');
    const loaded = saved ? JSON.parse(saved) : INITIAL_ISSUES;
    return ensureCompliantIds(loaded);
  });

  const [activeView, setActiveView] = useState<'clocks' | 'leaderboard' | 'resolved_reports'>('clocks');
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tick, setTick] = useState(0);

  // User interactions for verifying and upvoting
  const [userInteractions, setUserInteractions] = useState<{
    verified: string[];
    affected: string[];
  }>(() => {
    const saved = localStorage.getItem('civic_cost_user_interactions');
    return saved ? JSON.parse(saved) : { verified: [], affected: [] };
  });

  // Sync state to local storage when issues array updates
  useEffect(() => {
    localStorage.setItem('civic_cost_issues', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem('civic_cost_user_interactions', JSON.stringify(userInteractions));
  }, [userInteractions]);

  // Global ticking interval (10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyIssue = (id: string) => {
    if (userInteractions.verified.includes(id)) return;
    setUserInteractions((prev) => ({
      ...prev,
      verified: [...prev.verified, id]
    }));
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === id) {
          return {
            ...issue,
            verificationsCount: (issue.verificationsCount || 0) + 1
          };
        }
        return issue;
      })
    );
    setSelectedIssue((current) => {
      if (current && current.id === id) {
        return {
          ...current,
          verificationsCount: (current.verificationsCount || 0) + 1
        };
      }
      return current;
    });
  };

  const handleAffectedIssue = (id: string) => {
    if (userInteractions.affected.includes(id)) return;
    setUserInteractions((prev) => ({
      ...prev,
      affected: [...prev.affected, id]
    }));
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === id) {
          return {
            ...issue,
            upvotesCount: (issue.upvotesCount || 0) + 1
          };
        }
        return issue;
      })
    );
    setSelectedIssue((current) => {
      if (current && current.id === id) {
        return {
          ...current,
          upvotesCount: (current.upvotesCount || 0) + 1
        };
      }
      return current;
    });
  };

  const handleFlagIssue = (id: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === id) {
          return {
            ...issue,
            flaggedCount: (issue.flaggedCount || 0) + 1
          };
        }
        return issue;
      })
    );
    setSelectedIssue((current) => {
      if (current && current.id === id) {
        return {
          ...current,
          flaggedCount: (current.flaggedCount || 0) + 1
        };
      }
      return current;
    });
  };

  // Handle adding a new issue
  const handleAddIssue = (newIssue: CivicIssue) => {
    setIssues((prev) => [newIssue, ...prev]);
  };

  // Handle resolving an issue, transitioning it from active to post-mortem archive
  const handleResolveIssue = (id: string) => {
    setIssues((prev) => 
      prev.map((issue) => {
        if (issue.id === id) {
          return {
            ...issue,
            status: 'resolved',
            resolvedAt: new Date().toISOString()
          };
        }
        return issue;
      })
    );
    // If the resolved issue was open in the details panel, refresh it
    setSelectedIssue((current) => {
      if (current && current.id === id) {
        return {
          ...current,
          status: 'resolved',
          resolvedAt: new Date().toISOString()
        };
      }
      return current;
    });
  };

  // Quick reset to initial mock issues
  const handleResetData = () => {
    if (confirm("Reset current database prototype to default mock data? Any custom entries will be cleared.")) {
      setIssues(INITIAL_ISSUES);
      setSelectedIssue(null);
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#f0f0f0] text-zinc-900 flex flex-col font-sans selection:bg-red-500/35 selection:text-white">
      
      {/* Mobile Top Header (Visible on small viewports only) */}
      <header className="lg:hidden h-14 bg-white border-b-2 border-black px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-none border border-black bg-red-600 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="font-mono font-black tracking-widest text-sm text-black uppercase">CIVICCOST</span>
        </div>
        <button 
          id="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-black hover:bg-zinc-100 border-2 border-black"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Full-Height Container */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* Left Sidebar Layout */}
        <aside 
          id="desktop-sidebar"
          className={`fixed lg:static inset-0 lg:inset-auto z-40 lg:z-10 w-64 bg-zinc-950 border-r-2 border-black flex flex-col justify-between transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out text-white`}
        >
          <div className="flex flex-col">
            {/* Sidebar Brand Logo */}
            <div className="h-16 border-b border-zinc-800 px-6 flex items-center gap-3">
              <div className="w-9 h-9 rounded-none bg-red-600 border border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <Flame className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h1 className="font-mono font-extrabold tracking-widest text-base text-zinc-400 leading-tight">
                  CIVIC<span className="text-white">COST</span>
                </h1>
                <span className="text-[9px] font-mono text-red-500 font-bold uppercase tracking-wider block">Economic Damage Clock</span>
              </div>
            </div>

            {/* Navigation Menus */}
            <nav className="p-4 space-y-1.5">
              <span className="px-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2 font-bold">MONITOR SHEETS</span>
              
              <button
                id="nav-clocks-btn"
                onClick={() => {
                  setActiveView('clocks');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-3 rounded-none font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all ${
                  activeView === 'clocks'
                    ? 'bg-red-600 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white border border-transparent'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                Active Clocks
              </button>

              <button
                id="nav-leaderboard-btn"
                onClick={() => {
                  setActiveView('leaderboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-3 rounded-none font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all ${
                  activeView === 'leaderboard'
                    ? 'bg-red-600 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white border border-transparent'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                Ward Leaderboard
              </button>

              <button
                id="nav-necropsy-btn"
                onClick={() => {
                  setActiveView('resolved_reports');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-3 rounded-none font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all ${
                  activeView === 'resolved_reports'
                    ? 'bg-red-600 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white border border-transparent'
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0" />
                Resolved Reports
              </button>
            </nav>
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950 space-y-4">
            <div className="flex items-center gap-2.5 p-2 rounded-none bg-zinc-900 border border-zinc-800">
              <Briefcase className="w-4.5 h-4.5 text-zinc-500" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide block font-bold leading-none">AUDITOR ACCOUNT</span>
                <span className="text-[9px] font-mono text-zinc-500 block truncate">lavenderwitch001@gmail.com</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                id="reset-state-btn"
                onClick={handleResetData}
                className="w-full bg-zinc-900 border border-zinc-800 hover:border-red-500/50 text-zinc-500 hover:text-red-400 font-mono text-[9px] font-bold py-2 rounded-none uppercase transition-colors tracking-widest cursor-pointer"
              >
                Reset Prototype Data
              </button>
              
              <div className="text-center">
                <span className="text-[9px] font-mono text-zinc-600 block uppercase">CIVICCOST V1.1.0 - LATEST RELEASE</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar slide out */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-sidebar-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs lg:hidden z-30"
          />
        )}

        {/* Core Workspace Frame */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          
          {/* Main Views Mount */}
          {activeView === 'clocks' && (
            <ActiveClocksView 
              issues={issues}
              tick={tick}
              onSelectIssue={setSelectedIssue}
              onResolveIssue={handleResolveIssue}
              onOpenNewIssueModal={() => setIsNewModalOpen(true)}
              userInteractions={userInteractions}
              onVerifyIssue={handleVerifyIssue}
              onAffectedIssue={handleAffectedIssue}
              onFlagIssue={handleFlagIssue}
            />
          )}

          {activeView === 'leaderboard' && (
            <LeaderboardView 
              issues={issues}
              tick={tick}
            />
          )}

          {activeView === 'resolved_reports' && (
            <ResolvedReportsView 
              issues={issues}
            />
          )}
        </main>
      </div>

      {/* Floating Panel / Sliders & Modals */}
      <IssueDetailPanel 
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onResolveIssue={handleResolveIssue}
      />

      <NewIssueModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddIssue={handleAddIssue}
        issues={issues}
      />
    </div>
  );
}
