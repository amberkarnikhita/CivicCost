import React, { useState, useEffect } from 'react';
import { X, Share2, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Calculator, HelpCircle, ShieldCheck } from 'lucide-react';
import { CivicIssue } from '../types';
import { 
  getAccruingRatePerSecond, 
  getDailyAccrualRate, 
  calculateCurrentCost, 
  formatCurrency, 
  formatDuration, 
  getFormulaBreakdown,
  getElapsedSeconds
} from '../utils/civicUtils';

interface IssueDetailPanelProps {
  issue: CivicIssue | null;
  onClose: () => void;
  onResolveIssue?: (id: string) => void;
}

export default function IssueDetailPanel({ issue, onClose, onResolveIssue }: IssueDetailPanelProps) {
  const [copied, setCopied] = useState(false);
  const [currentCost, setCurrentCost] = useState(0);

  // States for dynamic Shame Card Image Generation
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [generatedCardUrl, setGeneratedCardUrl] = useState<string | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [canvasError, setCanvasError] = useState<string | null>(null);

  useEffect(() => {
    if (!issue) return;

    // Update the live ticking counter specifically for this panel as well (10s update interval)
    setCurrentCost(calculateCurrentCost(issue));
    const interval = setInterval(() => {
      setCurrentCost(calculateCurrentCost(issue));
    }, 10000);

    return () => clearInterval(interval);
  }, [issue]);

  if (!issue) return null;

  const dailyAccrual = getDailyAccrualRate(issue.type, issue.params);
  const projected30Days = dailyAccrual * 30;
  const delayMultiplier = issue.fixCost > 0 ? (projected30Days / issue.fixCost) : 1;
  const formulaInfo = getFormulaBreakdown(issue.type, issue.params);

  // Helper for dynamic short forms like ₹2L+ or ₹18K+
  const formatLakhsShort = (amount: number): string => {
    if (amount >= 100000) {
      const lakhs = amount / 100000;
      return `₹${lakhs >= 10 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L+`;
    }
    if (amount >= 1000) {
      return `₹${Math.round(amount / 1000)}K+`;
    }
    return `₹${Math.round(amount)}`;
  };

  const handleShare = () => {
    const shareText = `⚠️ CIVIL BLEEDING ALERT (CivicCost) ⚠️\n📍 Location: ${issue.location}\n🚨 Issue: ${issue.title}\n💸 Live Economic Loss: ${formatCurrency(currentCost, 0)} (Ticking Live!)\n🛠️ Instant Fix Budget: ${formatCurrency(issue.fixCost, 0)}\n⏳ Compounding Delay Penalty: ${Math.round(delayMultiplier)}x more expensive to wait 30 days!\n\nReframe complaints into civic math. Stop the leak.`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const generateShameCardImage = () => {
    setIsGeneratingCard(true);
    setCanvasError(null);
    setIsCardModalOpen(true);

    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 550;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCanvasError("Could not initialize 2D context");
      setIsGeneratingCard(false);
      return;
    }

    // Load Left Image
    const img = new Image();

    const drawRestOfCanvas = (imageLoaded: boolean) => {
      // Clear whole canvas
      ctx.fillStyle = '#FAF6EE';
      ctx.fillRect(0, 0, 1000, 550);

      // Step 1: Draw Left Column Image (flush & borderless)
      if (imageLoaded) {
        ctx.save();
        const imgWidth = img.width;
        const imgHeight = img.height;
        const targetW = 415;
        const targetH = 550;
        const imgRatio = imgWidth / imgHeight;
        const targetRatio = targetW / targetH;
        let sWidth = imgWidth;
        let sHeight = imgHeight;
        let sx = 0;
        let sy = 0;

        if (imgRatio > targetRatio) {
          sWidth = imgHeight * targetRatio;
          sx = (imgWidth - sWidth) / 2;
        } else {
          sHeight = imgWidth / targetRatio;
          sy = (imgHeight - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);
        ctx.restore();
      } else {
        // Fallback grid if image load fails
        ctx.fillStyle = '#EBE5D8';
        ctx.fillRect(0, 0, 415, 550);
        
        ctx.strokeStyle = 'rgba(156, 150, 138, 0.25)';
        ctx.lineWidth = 1;
        for (let x = 0; x < 415; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 550);
          ctx.stroke();
        }
        for (let y = 0; y < 550; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(415, y);
          ctx.stroke();
        }

        ctx.fillStyle = '#8C867A';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📷 CIVIC CAMERA ACTIVE', 207, 260);
        ctx.font = '11px monospace';
        ctx.fillText('Location Imagery Feed', 207, 285);
        ctx.fillText(issue.location.substring(0, 32).toUpperCase(), 207, 310);
      }

      // Step 2: Draw Procedural Cityscape Background Sketch on the Right
      ctx.save();
      const drawPencilSkyscraper = (bx: number, bw: number, bh: number, style: string) => {
        ctx.strokeStyle = '#EAE4D5';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#FAF6EE'; // to hide overlapping lines
        
        const by = 550 - bh;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx, by, bw, bh);
        
        // Draw decorative architectural lines
        if (style === 'grid') {
          const colSpacing = 8;
          const rowSpacing = 12;
          for (let cx = bx + 6; cx < bx + bw - 4; cx += colSpacing) {
            for (let cy = by + 10; cy < 540; cy += rowSpacing) {
              ctx.strokeRect(cx, cy, 3, 4);
            }
          }
        } else if (style === 'stripes') {
          const colSpacing = 6;
          for (let cx = bx + 4; cx < bx + bw - 4; cx += colSpacing) {
            ctx.beginPath();
            ctx.moveTo(cx, by);
            ctx.lineTo(cx, 550);
            ctx.stroke();
          }
        } else if (style === 'horizontal') {
          const rowSpacing = 14;
          for (let cy = by + 10; cy < 540; cy += rowSpacing) {
            ctx.beginPath();
            ctx.moveTo(bx, cy);
            ctx.lineTo(bx + bw, cy);
            ctx.stroke();
          }
        } else if (style === 'spire') {
          ctx.beginPath();
          ctx.moveTo(bx + bw/2, by);
          ctx.lineTo(bx + bw/2, by - 30);
          ctx.stroke();
        }
      };

      // Draw towers from left to right (covering x: 415 to 1000)
      drawPencilSkyscraper(430, 45, 220, 'stripes');
      drawPencilSkyscraper(475, 65, 320, 'grid');
      drawPencilSkyscraper(530, 50, 170, 'horizontal');
      drawPencilSkyscraper(570, 70, 280, 'spire');
      drawPencilSkyscraper(635, 40, 390, 'stripes');
      drawPencilSkyscraper(670, 60, 240, 'grid');
      drawPencilSkyscraper(725, 80, 190, 'horizontal');
      drawPencilSkyscraper(800, 55, 340, 'spire');
      drawPencilSkyscraper(850, 50, 260, 'stripes');
      drawPencilSkyscraper(895, 75, 310, 'grid');
      drawPencilSkyscraper(960, 35, 150, 'horizontal');
      ctx.restore();

      // Step 3: Draw Text and HUD on the Right
      ctx.textAlign = 'left';

      // "SHAME CARD 🤡"
      ctx.fillStyle = '#000000';
      ctx.font = '900 48px sans-serif';
      ctx.fillText('SHAME CARD 🤡', 445, 95);

      // Huge Cost Amount (e.g. ₹2,14,350 with zero decimals)
      ctx.fillStyle = '#EF4444';
      ctx.font = '900 80px sans-serif';
      const costStr = formatCurrency(currentCost, 0);
      ctx.fillText(costStr, 440, 205);

      // HUD Labels Row (y = 255)
      // Left label: "LIVE TOTAL COMMUNITY COST ACCRUED"
      ctx.font = '900 13px monospace';
      ctx.fillStyle = '#EF4444';
      ctx.fillText('LIVE', 445, 255);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(' TOTAL ACCUMULATED COMMUNITY LOSS', 480, 255);

      // Right label: "TIME ACTIVE: X DAYS"
      ctx.textAlign = 'right';
      const elapsedSec = getElapsedSeconds(issue.reportedAt, issue.resolvedAt);
      const daysActive = Math.ceil(elapsedSec / 86400);
      ctx.fillText(`TIME ACTIVE: ${daysActive} DAYS`, 955, 255);
      
      // Reset textAlign to left
      ctx.textAlign = 'left';

      // Subtitle (y = 315)
      ctx.fillStyle = '#000000';
      ctx.font = '800 24px sans-serif';
      const shortLakhs = formatLakhsShort(currentCost);
      const titleType = issue.type === 'pothole' ? 'pothole' : issue.type === 'water_leak' ? 'pipeline leak' : issue.type === 'streetlight' ? 'dark street' : issue.type === 'sewage' ? 'sewage flood' : issue.type === 'drain' ? 'drainage failure' : issue.type === 'footpath' ? 'broken footpath' : 'garbage pile';
      ctx.fillText(`This ${titleType} has cost our ward ${shortLakhs}`, 445, 315);

      // Dynamic Description block (y = 370 onwards)
      let descLines: string[] = [];
      if (issue.type === 'pothole') {
        const vehicleDamage = issue.params?.vehicleDamageCost !== undefined ? formatCurrency(issue.params.vehicleDamageCost, 0) : '₹1,200';
        const trafficCount = issue.params?.dailyTrafficCount !== undefined ? issue.params.dailyTrafficCount.toLocaleString() : '4,500';
        descLines = [
          'Estimated damages based on : 🚗 Vehicle repair',
          `averages - ${vehicleDamage} per car, ⛽ Fuel waste from delays,`,
          `🚴 back pain and ⏱️ ${trafficCount} daily traffic count.`
        ];
      } else if (issue.type === 'water_leak') {
        const rate = issue.params?.waterRatePerLiter !== undefined ? issue.params.waterRatePerLiter : 0.15;
        const flow = issue.params?.litersPerHour !== undefined ? issue.params.litersPerHour : 850;
        descLines = [
          'Estimated damages based on : 💧 Treated water',
          `main waste of ₹${rate}/L, ⚡ electricity for pressurized`,
          `pumping, and 🐳 ${flow.toLocaleString()} L/hr leaked flow.`
        ];
      } else if (issue.type === 'streetlight') {
        const delta = issue.params?.accidentProbabilityDelta !== undefined ? (issue.params.accidentProbabilityDelta * 100).toFixed(1) : '8.5';
        const claim = issue.params?.avgInsuranceClaimCost !== undefined ? formatCurrency(issue.params.avgInsuranceClaimCost, 0) : '₹4.5L';
        descLines = [
          `Estimated damages based on : 🚗 +${delta}% accident risk`,
          `with typical claims of ${claim}, ⚡ BESCOM power safety`,
          'risk, and 👜 night security auto detours.'
        ];
      } else if (issue.type === 'garbage') {
        const households = issue.params?.affectedHouseholds !== undefined ? issue.params.affectedHouseholds.toLocaleString() : '250';
        const medCost = issue.params?.medicalCostPerHousehold !== undefined ? formatCurrency(issue.params.medicalCostPerHousehold, 0) : '₹3,500';
        descLines = [
          `Estimated damages based on : 🦟 Disease risk for`,
          `${households} households with typical ${medCost} medical cost,`,
          '🤢 putrid odor discomfort, and 🐀 rodent infestation.'
        ];
      } else if (issue.type === 'sewage' || issue.type === 'drain') {
        const trafficCount = issue.params?.dailyTrafficCount !== undefined ? issue.params.dailyTrafficCount.toLocaleString() : '3,800';
        descLines = [
          'Estimated damages based on : 🚶‍♂️ Flooded detour delay',
          `for ⏱️ ${trafficCount} daily commuters, 🩹 infection treatment`,
          'costs, and 🤮 putrid odor discomfort penalty.'
        ];
      } else if (issue.type === 'footpath') {
        const trafficCount = issue.params?.dailyTrafficCount !== undefined ? issue.params.dailyTrafficCount.toLocaleString() : '1,000';
        descLines = [
          `Estimated damages based on : 🚶‍♂️ Fall injuries for`,
          `${trafficCount} daily pedestrians, 🩹 medical bills, 🚗 traffic`,
          'spillover accident risk, and ♿ mobility exclusion.'
        ];
      }

      ctx.fillStyle = '#27272A'; // Dark zinc color
      ctx.font = '500 16px sans-serif';
      const startY = 375;
      const lineHeight = 28;
      descLines.forEach((line, index) => {
        ctx.fillText(line, 445, startY + (index * lineHeight));
      });

      try {
        const dataUrl = canvas.toDataURL('image/png');
        setGeneratedCardUrl(dataUrl);
        setIsGeneratingCard(false);
      } catch (err: any) {
        setCanvasError(err.message || "Failed to convert canvas to dataURL");
        setIsGeneratingCard(false);
      }
    };

    // Load Image cleanly using fetch as a Blob, then Data URL
    if (issue.photoUrl.startsWith('data:')) {
      img.src = issue.photoUrl;
      img.onload = () => drawRestOfCanvas(true);
      img.onerror = () => drawRestOfCanvas(false);
    } else {
      fetch(issue.photoUrl, { mode: 'cors' })
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            img.src = reader.result as string;
            img.onload = () => drawRestOfCanvas(true);
            img.onerror = () => drawRestOfCanvas(false);
          };
          reader.readAsDataURL(blob);
        })
        .catch(err => {
          console.warn("CORS fetch failed, trying direct load as fallback", err);
          // direct load fallback
          img.crossOrigin = 'anonymous';
          img.src = issue.photoUrl;
          img.onload = () => drawRestOfCanvas(true);
          img.onerror = () => drawRestOfCanvas(false);
        });
    }
  };

  return (
    <div id="detail-panel-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 flex justify-end">
      {/* Click outside to close */}
      <div id="detail-backdrop-click" className="absolute inset-0" onClick={onClose} />
      
      {/* Sliding Panel */}
      <div 
        id="detail-slideout-body"
        className="relative w-full max-w-lg bg-white border-l-4 border-black h-full flex flex-col shadow-[-4px_0px_0px_0px_rgba(0,0,0,1)] z-50 animate-in slide-in-from-right duration-300 overflow-hidden text-zinc-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-black bg-zinc-50">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-white bg-red-600 border border-black px-2 py-0.5 rounded-none font-bold uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE ECONOMIC AUDIT
            </span>
            <h2 className="text-sm font-mono font-black text-black uppercase truncate max-w-[320px]">
              ID: {issue.id.toUpperCase()}
            </h2>
          </div>
          <button 
            id="close-detail-panel-btn"
            onClick={onClose} 
            className="p-2 text-black hover:bg-zinc-100 border-2 border-black rounded-none transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Title & Metadata */}
          <div className="space-y-2">
            <h3 className="text-xl font-black font-sans tracking-tight text-black leading-tight">
              {issue.title}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs font-mono font-bold text-zinc-700">
              <span>📍 {issue.location}</span>
              <span className="text-zinc-400">|</span>
              <span className="text-red-600">{issue.ward}</span>
            </div>
          </div>

          {/* A. Shame Number Share Card */}
          <div 
            id="shame-number-card"
            className="border-2 border-black rounded-none p-5 bg-white space-y-4 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="absolute top-0 right-0 bg-red-600 border border-black text-white font-mono text-[9px] font-black px-3 py-1 uppercase tracking-wider transform rotate-12 translate-x-3 translate-y-2 shadow-sm">
              SHAME INDEX
            </div>

            <div className="flex gap-4">
              <img 
                src={issue.photoUrl} 
                alt="Civic Hazard Photo" 
                className="w-20 h-20 rounded-none object-cover border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">TOTAL LOSS</span>
                <div className="text-2xl font-mono font-black text-red-600 tracking-tight tabular-nums truncate">
                  {formatCurrency(currentCost, 0)}
                </div>
                <div className="text-[11px] font-mono text-zinc-700 font-medium">
                  Accumulating at <span className="text-red-600 font-black">{formatCurrency(getDailyAccrualRate(issue.type, issue.params), 0)}</span> per day
                </div>
                <div className="text-[10px] font-mono text-zinc-500 font-semibold">
                  Unresolved for: {formatDuration(issue.reportedAt)}
                </div>
              </div>
            </div>

            {/* Social Share Call-to-action */}
            <button
              id="generate-social-card-btn"
              onClick={generateShameCardImage}
              className="w-full bg-black hover:bg-zinc-800 text-white border-2 border-black font-mono text-xs py-2.5 rounded-none font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(239,68,68,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(239,68,68,1)]"
            >
              <Share2 className="w-4 h-4 text-red-400 animate-pulse" />
              GENERATE SOCIAL SHAME CARD IMAGE
            </button>

            {copied && (
              <div className="absolute inset-0 bg-white border-2 border-black flex items-center justify-center p-4 text-center animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-mono font-black text-black uppercase">COPIED SHAME DATA TO CLIPBOARD!</p>
                  <p className="text-[10px] font-mono text-zinc-600 font-medium">Paste in Twitter, WhatsApp, or Instagram to tag authorities.</p>
                </div>
              </div>
            )}
          </div>

          {/* B. ROI Flip — Fix Cost vs Delay Cost */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> ROI COMPARISON — FIX COST VS COMPENSATING DELAY
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Left Side: Fix cost */}
              <div className="bg-white border-2 border-black p-4 rounded-none flex flex-col justify-between h-28 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider">ESTIMATED FIX COST</span>
                <div className="text-xl font-mono font-black text-emerald-600">
                  {formatCurrency(issue.fixCost, 0)}
                </div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase font-semibold">One-Time Repair Budget</span>
              </div>

              {/* Right Side: Delay Cost (30 Days) */}
              <div className="bg-white border-2 border-black p-4 rounded-none flex flex-col justify-between h-28 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <span className="text-[10px] font-mono text-red-600 font-bold uppercase tracking-wider">PROJECTED 30-DAY DELAY COST</span>
                <div className="text-xl font-mono font-black text-red-600">
                  {formatCurrency(projected30Days, 0)}
                </div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase font-semibold">Compounding Economic Bleed</span>
              </div>
            </div>

            {/* Delay Multiplier Badge */}
            <div className="bg-amber-100 border-2 border-black p-3.5 rounded-none flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <div className="text-xs font-mono text-amber-950">
                  <div className="text-amber-900 font-black uppercase">DELAY RISK MULTIPLIER: {Math.round(delayMultiplier)}x</div>
                  <div className="text-zinc-700 text-[10px] font-medium leading-tight">It is {Math.round(delayMultiplier)}x more cost-efficient to deploy engineers today than delay 30 days.</div>
                </div>
              </div>
            </div>
          </div>

          {/* C. COMMUNITY TRUST & VERIFICATION METRICS */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> COMMUNITY TRUST & VERIFICATION METRICS
            </h4>

            {(() => {
              const verifications = issue.verificationsCount || 0;
              const upvotes = issue.upvotesCount || 0;
              const flags = issue.flaggedCount || 0;
              
              let trustScore = 80; // base trust
              if (verifications > 0 || upvotes > 0 || flags > 0) {
                trustScore = Math.min(100, Math.max(0, 80 + (verifications * 10) + (upvotes * 5) - (flags * 25)));
              }

              let ratingLabel = "MODERATE - Needs Verification";
              let ratingStyle = "bg-amber-50 border-amber-500 text-amber-950";
              let progressColor = "bg-amber-500";
              
              if (trustScore >= 90) {
                ratingLabel = "HIGH - Community Verified";
                ratingStyle = "bg-emerald-50 border-emerald-500 text-emerald-950";
                progressColor = "bg-emerald-500";
              } else if (trustScore >= 70) {
                ratingLabel = "MODERATE - Trustworthy";
                ratingStyle = "bg-yellow-50 border-yellow-500 text-yellow-950";
                progressColor = "bg-yellow-500";
              } else if (trustScore >= 40) {
                ratingLabel = "LOW - Under Dispute";
                ratingStyle = "bg-orange-50 border-orange-500 text-orange-950";
                progressColor = "bg-orange-500";
              } else {
                ratingLabel = "CRITICAL - High Dispute / Flagged";
                ratingStyle = "bg-red-50 border-red-500 text-red-950";
                progressColor = "bg-red-500";
              }

              return (
                <div className="bg-white border-2 border-black p-4 rounded-none space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider">TRUST SCORE</span>
                      <div className="text-2xl font-mono font-black text-black">
                        {trustScore}%
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-[9px] font-mono font-black border-2 border-black uppercase ${ratingStyle}`}>
                      {ratingLabel}
                    </span>
                  </div>

                  {/* Meter/Progress Bar */}
                  <div className="w-full bg-zinc-100 h-2.5 rounded-none overflow-hidden border-2 border-black">
                    <div 
                      className={`h-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${trustScore}%` }}
                    />
                  </div>

                  {/* Verification Counters Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-dashed border-zinc-200">
                    <div className="text-center bg-zinc-50 border border-zinc-200 p-2">
                      <div className="text-xs font-mono font-black text-emerald-700">✓ {verifications}</div>
                      <div className="text-[8px] font-mono font-black uppercase text-zinc-500 mt-0.5">VERIFIED REAL</div>
                    </div>
                    <div className="text-center bg-zinc-50 border border-zinc-200 p-2">
                      <div className="text-xs font-mono font-black text-amber-700">⚠ {upvotes}</div>
                      <div className="text-[8px] font-mono font-black uppercase text-zinc-500 mt-0.5">AFFECTED</div>
                    </div>
                    <div className="text-center bg-zinc-50 border border-zinc-200 p-2">
                      <div className="text-xs font-mono font-black text-red-600">🚩 {flags}</div>
                      <div className="text-[8px] font-mono font-black uppercase text-zinc-500 mt-0.5">FLAGGED</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* AI Math Formula Breakdown Tooltip Panel */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Calculator className="w-4 h-4 text-zinc-700" /> CIVIC COST FORMULATION & DERIVATION
            </h4>

            <div className="bg-zinc-50 border-2 border-black rounded-none p-4 space-y-3 font-mono text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <span className="text-zinc-500 uppercase text-[10px] block mb-1 font-bold">MUNICIPAL COST FORMULA</span>
                <div className="bg-white border border-black p-2.5 rounded-none font-bold text-red-600 tracking-tight text-[11px]">
                  {formulaInfo.formula}
                </div>
              </div>

              <div>
                <span className="text-zinc-500 uppercase text-[10px] block mb-1 font-bold">LIVE PARAMETER EVALUATION</span>
                <div className="text-zinc-800 bg-white p-2.5 rounded-none border border-black font-semibold">
                  {formulaInfo.values}
                </div>
              </div>

              <div>
                <span className="text-zinc-500 uppercase text-[10px] block mb-1 font-bold">ECONOMIC BURDEN LOGIC</span>
                <p className="text-zinc-600 text-[11px] leading-relaxed font-sans font-medium">
                  {formulaInfo.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar (Footer) */}
        {onResolveIssue && (
          <div className="p-6 border-t-2 border-black bg-zinc-50 flex gap-3">
            <button
              id="resolve-issue-direct-btn"
              onClick={() => {
                onResolveIssue(issue.id);
                onClose();
              }}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 border-2 border-black text-white font-mono text-xs py-3 rounded-none font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
            >
              <CheckCircle2 className="w-4 h-4" /> RECONCILE & CLOSE CASE
            </button>
          </div>
        )}
      </div>

      {/* SHAME CARD IMAGE RENDER MODAL */}
      {isCardModalOpen && (
        <div id="shame-card-modal-backdrop" className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-4 border-black w-full max-w-4xl rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-zinc-900">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-500 font-bold" />
                <h3 className="text-sm font-mono font-black tracking-tight text-white uppercase">GENERATED SOCIAL SHAME CARD IMAGE</h3>
              </div>
              <button 
                id="close-card-modal-btn"
                onClick={() => setIsCardModalOpen(false)}
                className="text-white hover:text-red-500 border border-white/20 p-1 bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col items-center gap-6 flex-1 bg-zinc-900">
              {isGeneratingCard ? (
                <div className="py-24 text-center space-y-4">
                  <div className="w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-full animate-spin mx-auto" />
                  <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest font-bold">Rendering civic loss matrix into high-contrast social card...</p>
                </div>
              ) : canvasError ? (
                <div className="py-12 text-center text-red-500 space-y-2">
                  <p className="font-bold">❌ Error generating image canvas:</p>
                  <p className="text-xs font-mono bg-black p-3 text-red-400 max-w-md mx-auto">{canvasError}</p>
                  <button onClick={() => setIsCardModalOpen(false)} className="bg-white text-black font-mono text-xs px-4 py-2 mt-4 font-bold border border-black hover:bg-zinc-100">
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4 w-full">
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-black tracking-widest text-emerald-400 bg-emerald-950 border border-emerald-800 uppercase rounded-none mb-2">
                      ✔ PNG IMAGE RENDERED WITH 0 DECIMALS
                    </span>
                    <p className="text-[11px] font-mono text-zinc-400 max-w-lg mx-auto">
                      Contains the dynamic Google Maps camera HUD, total accumulated loss, time active, and official board metrics.
                    </p>
                  </div>

                  {/* Rendered Image Box */}
                  <div className="w-full flex justify-center p-2 bg-black border border-zinc-800">
                    <img 
                      src={generatedCardUrl || ''} 
                      alt="BBMP Civic Cost Shame Card" 
                      className="max-w-full max-h-[45vh] object-contain shadow-2xl border border-zinc-700" 
                    />
                  </div>

                  {/* Interactive Button Ribbon */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {/* 1. Download PNG */}
                    <button
                      id="download-png-card-btn"
                      onClick={() => {
                        if (!generatedCardUrl) return;
                        const link = document.createElement('a');
                        link.download = `Shame_Card_Ward_${issue.ward.split(' ')[1] || 'Audit'}_${issue.id}.png`;
                        link.href = generatedCardUrl;
                        link.click();
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs py-3 px-4 rounded-none font-black flex items-center justify-center gap-2 cursor-pointer transition-colors border border-emerald-600 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      💾 DOWNLOAD PNG IMAGE
                    </button>

                    {/* 2. Copy to Clipboard */}
                    <button
                      id="copy-png-card-btn"
                      onClick={async () => {
                        if (!generatedCardUrl) return;
                        try {
                          const res = await fetch(generatedCardUrl);
                          const blob = await res.blob();
                          await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                          ]);
                          alert("✔ SUCCESS! The social shame image card has been copied directly to your clipboard. You can now press Ctrl+V / paste it directly into Twitter, Instagram, or WhatsApp chats!");
                        } catch (err) {
                          alert("Browser/iframe restrictions blocked direct clipboard writes. Please use the 'DOWNLOAD PNG IMAGE' button to save and post!");
                        }
                      }}
                      className="bg-black hover:bg-zinc-800 text-white border border-zinc-800 font-mono text-xs py-3 px-4 rounded-none font-black flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      📋 COPY TO CLIPBOARD
                    </button>

                    {/* 3. Twitter Share */}
                    <button
                      id="twitter-share-card-btn"
                      onClick={() => {
                        const tweetText = `⚠️ INDEPENDENT CIVIC LOSS AUDIT FOR ${issue.ward.toUpperCase()} ⚠️\nThis ${issue.type.replace('_', ' ')} on ${issue.location} has bled ${formatCurrency(currentCost, 0)} of taxpayer money! Stop the bleed. #CivicCost #Bangalore`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                      }}
                      className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-mono text-xs py-3 px-4 rounded-none font-black flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      🐦 POST SHAME TEXT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
