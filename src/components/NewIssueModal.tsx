import React, { useState, useRef } from 'react';
import { X, Plus, AlertCircle, UploadCloud, Camera, Loader2 } from 'lucide-react';
import { CivicIssue, IssueType, IssueParams } from '../types';
import { getCostPerDay, formatCurrency, CITY_WARD_DATA, generateIssueId } from '../utils/civicUtils';
import { uploadImage } from '../utils/storage';

interface NewIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIssue: (issue: CivicIssue) => void;
  issues: CivicIssue[];
}

const ISSUE_TYPES: IssueType[] = ['pothole', 'water_leak', 'streetlight', 'garbage', 'drain', 'footpath'];

export default function NewIssueModal({ isOpen, onClose, onAddIssue, issues }: NewIssueModalProps) {
  const [type, setType] = useState<IssueType>('pothole');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'critical'>('medium');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState<string>('Bengaluru');
  const [customCity, setCustomCity] = useState<string>('');
  const [selectedWardOption, setSelectedWardOption] = useState<string>('Ward 42 (Indiranagar)');
  const [customWard, setCustomWard] = useState<string>('');
  const [fixCost, setFixCost] = useState<number>(4500);
  
  // Dynamic parameters depending on type
  const [trafficCount, setTrafficCount] = useState<number>(3000);
  const [litersPerHour, setLitersPerHour] = useState<number>(1500);
  const [households, setHouseholds] = useState<number>(250);
  const [accidentDelta, setAccidentDelta] = useState<number>(8.5);

  // Custom image capture / upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageChange(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  if (!isOpen) return null;

  const handleTypeChange = (newType: IssueType) => {
    setType(newType);
    
    // Default parameters by type/severity
    if (newType === 'pothole') {
      setTrafficCount(severity === 'low' ? 800 : severity === 'medium' ? 3000 : 8000);
    } else if (newType === 'water_leak') {
      setLitersPerHour(severity === 'low' ? 300 : severity === 'medium' ? 1500 : 6000);
    } else if (newType === 'garbage') {
      setHouseholds(severity === 'low' ? 80 : severity === 'medium' ? 250 : 600);
    }

    const fixCosts: Record<IssueType, Record<'low' | 'medium' | 'critical', number>> = {
      pothole:     { low: 1500,  medium: 4500,  critical: 12000 },
      water_leak:  { low: 4000,  medium: 12000, critical: 45000 },
      streetlight: { low: 1200,  medium: 3500,  critical: 10000 },
      garbage:     { low: 3000,  medium: 15000, critical: 50000 },
      drain:       { low: 2500,  medium: 9500,  critical: 35000 },
      footpath:    { low: 3000,  medium: 12000, critical: 40000 },
      sewage:      { low: 2500,  medium: 9500,  critical: 35000 },
    };
    setFixCost(fixCosts[newType]?.[severity] ?? 12000);
  };

  const handleSeverityChange = (newSeverity: 'low' | 'medium' | 'critical') => {
    setSeverity(newSeverity);

    // Update typical params based on severity
    if (type === 'pothole') {
      setTrafficCount(newSeverity === 'low' ? 800 : newSeverity === 'medium' ? 3000 : 8000);
    } else if (type === 'water_leak') {
      setLitersPerHour(newSeverity === 'low' ? 300 : newSeverity === 'medium' ? 1500 : 6000);
    } else if (type === 'garbage') {
      setHouseholds(newSeverity === 'low' ? 80 : newSeverity === 'medium' ? 250 : 600);
    }

    const fixCosts: Record<IssueType, Record<'low' | 'medium' | 'critical', number>> = {
      pothole:     { low: 1500,  medium: 4500,  critical: 12000 },
      water_leak:  { low: 4000,  medium: 12000, critical: 45000 },
      streetlight: { low: 1200,  medium: 3500,  critical: 10000 },
      garbage:     { low: 3000,  medium: 15000, critical: 50000 },
      drain:       { low: 2500,  medium: 9500,  critical: 35000 },
      footpath:    { low: 3000,  medium: 12000, critical: 40000 },
      sewage:      { low: 2500,  medium: 9500,  critical: 35000 },
    };
    setFixCost(fixCosts[type]?.[newSeverity] ?? 12000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;

    setIsUploading(true);

    const params: IssueParams = {
      severity,
    };
    
    if (type === 'pothole') {
      params.vehicleDamageCost = 1200;
      params.dailyTrafficCount = trafficCount;
    } else if (type === 'water_leak') {
      params.litersPerHour = litersPerHour;
      params.waterRatePerLiter = 0.15;
    } else if (type === 'streetlight') {
      params.accidentProbabilityDelta = accidentDelta / 100;
      params.avgInsuranceClaimCost = 450000;
    } else if (type === 'garbage') {
      params.healthRiskMultiplier = 1.4;
      params.medicalCostPerHousehold = 3500;
      params.affectedHouseholds = households;
    } else if (type === 'drain' || type === 'sewage' || type === 'footpath') {
      params.dailyTrafficCount = trafficCount;
    }

    // Set a random photo from curated Unsplash related to type as default
    let photoUrl = 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80';
    if (type === 'water_leak') photoUrl = 'https://images.unsplash.com/photo-1542013936693-8848e5744a61?auto=format&fit=crop&w=400&q=80';
    if (type === 'garbage') photoUrl = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=80';
    if (type === 'streetlight') photoUrl = 'https://images.unsplash.com/photo-1509024644558-2f56ce76c0fc?auto=format&fit=crop&w=400&q=80';
    if (type === 'drain' || type === 'sewage') photoUrl = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80';
    if (type === 'footpath') photoUrl = 'https://images.unsplash.com/photo-1513829096999-4978602297f7?auto=format&fit=crop&w=400&q=80';

    try {
      if (imageFile) {
        // Upload real image to Cloud Storage / Fallback
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }
    } catch (err) {
      console.error('Failed to upload custom image:', err);
    } finally {
      setIsUploading(false);
    }

    const finalCity = city === 'custom' ? (customCity.trim() || 'Custom City') : city;
    const finalWard = selectedWardOption === 'custom' ? (customWard.trim() || 'Custom Ward') : selectedWardOption;

    const reportedAt = new Date().toISOString();
    const newId = generateIssueId(reportedAt, finalWard, issues);

    const newIssue: CivicIssue = {
      id: newId,
      type,
      title,
      location,
      ward: finalWard,
      city: finalCity,
      reportedAt,
      status: 'unresolved',
      severity,
      params,
      fixCost,
      photoUrl,
    };

    onAddIssue(newIssue);
    // Reset form
    setTitle('');
    setLocation('');
    setCity('Bengaluru');
    setCustomCity('');
    setSelectedWardOption('Ward 42 (Indiranagar)');
    setCustomWard('');
    setSeverity('medium');
    setFixCost(4500);
    setImageFile(null);
    setImagePreview(null);
    onClose();
  };

  const dailyBleedRate = getCostPerDay(type, severity);

  return (
    <div id="new-issue-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div 
        id="new-issue-modal"
        className="bg-white border-4 border-black rounded-none w-full max-w-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-200 text-zinc-900"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-zinc-50">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-red-600 font-bold" />
            <h2 className="text-base font-mono font-black tracking-tight text-black">COMMENCE NEW CIVIC COST CLOCK</h2>
          </div>
          <button 
            id="close-modal-btn"
            onClick={onClose} 
            className="text-black hover:text-red-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Issue Type */}
          <div>
            <label className="block text-xs font-mono text-zinc-500 uppercase mb-2 font-bold">CIVIC EMERGENCY CLASSIFICATION</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ISSUE_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`px-3 py-2 text-xs font-mono rounded-none border-2 uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${
                    type === t
                      ? 'bg-red-100 text-red-950 border-black font-black'
                      : 'bg-white border-zinc-300 text-zinc-500 hover:text-black hover:border-black font-bold'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-mono text-zinc-500 uppercase mb-2 font-bold">EMERGENCY SEVERITY LEVEL</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'critical'] as const).map((sev) => {
                let activeClass = 'bg-amber-100 text-amber-950 border-black font-black';
                let inactiveClass = 'bg-white border-zinc-300 text-zinc-500 hover:text-black hover:border-black font-bold';
                if (sev === 'critical') activeClass = 'bg-red-100 text-red-950 border-red-600 font-black';
                if (sev === 'low') activeClass = 'bg-yellow-50 text-yellow-950 border-yellow-600 font-black';
                
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => handleSeverityChange(sev)}
                    className={`px-3 py-2 text-xs font-mono rounded-none border-2 uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${
                      severity === sev ? activeClass : inactiveClass
                    }`}
                  >
                    {sev}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="issue-title" className="block text-xs font-mono text-zinc-500 uppercase mb-1 font-bold">EMERGENCY TITLE</label>
            <input
              id="issue-title"
              type="text"
              required
              placeholder="e.g., Toxic Solid Waste Pile Near Hospital Gate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-sm text-black focus:outline-none focus:bg-zinc-50 transition-colors font-sans font-medium"
            />
          </div>

          {/* City Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="issue-city" className="block text-xs font-mono text-zinc-500 uppercase mb-1 font-bold">METROPOLITAN CITY</label>
              <select
                id="issue-city"
                value={city}
                onChange={(e) => {
                  const newCity = e.target.value;
                  setCity(newCity);
                  if (newCity !== 'custom') {
                    const wards = CITY_WARD_DATA[newCity];
                    setSelectedWardOption(wards[0]);
                  } else {
                    setSelectedWardOption('custom');
                  }
                }}
                className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-sm text-black focus:outline-none focus:bg-zinc-50 transition-colors font-mono font-bold"
              >
                {Object.keys(CITY_WARD_DATA).map((c) => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
                <option value="custom">CUSTOM CITY...</option>
              </select>
            </div>

            {city === 'custom' ? (
              <div>
                <label htmlFor="issue-custom-city" className="block text-xs font-mono text-zinc-500 uppercase mb-1 font-bold">ENTER CUSTOM CITY</label>
                <input
                  id="issue-custom-city"
                  type="text"
                  required
                  placeholder="e.g., Kolkata"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-sm text-black focus:outline-none focus:bg-zinc-50 transition-colors font-sans font-medium"
                />
              </div>
            ) : (
              <div className="hidden md:block opacity-0 pointer-events-none" />
            )}
          </div>

          {/* Ward Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="issue-ward-select" className="block text-xs font-mono text-zinc-500 uppercase mb-1 font-bold">MUNICIPAL JURISDICTION (WARD)</label>
              <select
                id="issue-ward-select"
                value={selectedWardOption}
                onChange={(e) => setSelectedWardOption(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-sm text-black focus:outline-none focus:bg-zinc-50 transition-colors font-mono font-bold"
              >
                {city !== 'custom' && CITY_WARD_DATA[city]?.map((w) => (
                  <option key={w} value={w}>{w.toUpperCase()}</option>
                ))}
                <option value="custom">CUSTOM WARD...</option>
              </select>
            </div>

            {selectedWardOption === 'custom' ? (
              <div>
                <label htmlFor="issue-custom-ward" className="block text-xs font-mono text-zinc-500 uppercase mb-1 font-bold">ENTER CUSTOM WARD</label>
                <input
                  id="issue-custom-ward"
                  type="text"
                  required
                  placeholder="e.g., Ward 99 (Salt Lake)"
                  value={customWard}
                  onChange={(e) => setCustomWard(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-sm text-black focus:outline-none focus:bg-zinc-50 transition-colors font-sans font-medium"
                />
              </div>
            ) : (
              <div className="hidden md:block opacity-0 pointer-events-none" />
            )}
          </div>

          {/* Exact Street Location */}
          <div>
            <label htmlFor="issue-location" className="block text-xs font-mono text-zinc-500 uppercase mb-1 font-bold">EXACT STREET LOCATION</label>
            <input
              id="issue-location"
              type="text"
              required
              placeholder="e.g., Double Road, opposite petrol bunk"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-sm text-black focus:outline-none focus:bg-zinc-50 transition-colors font-sans font-medium"
            />
          </div>

          {/* Custom Picture Snapping / Upload */}
          <div className="border-2 border-black p-4 bg-zinc-50 space-y-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <label className="block text-xs font-mono text-zinc-600 uppercase font-bold">
              EMERGENCY EVIDENCE PHOTO
            </label>
            
            {/* Hidden native input files */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="hidden"
            />
            
            <input 
              ref={cameraInputRef}
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handleFileChange}
              className="hidden"
            />

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed border-zinc-400 p-6 flex flex-col items-center justify-center text-center transition-all ${
                dragActive ? 'bg-red-50 border-red-500 scale-[0.99]' : 'bg-white hover:bg-zinc-50'
              }`}
            >
              {imagePreview ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <div className="relative border-2 border-black w-32 h-32 bg-zinc-200 overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <img 
                      src={imagePreview} 
                      alt="Evidence Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white border border-black p-0.5 rounded-none hover:bg-red-700 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                      title="Clear image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-600">
                    ✓ EVIDENCE SNAPSHOT STAGED ({imageFile ? (imageFile.size / 1024).toFixed(1) : 0} KB)
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-black hover:bg-zinc-100 font-mono text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-red-600" />
                      Snap Picture (Mobile)
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-black hover:bg-zinc-100 font-mono text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-zinc-600" />
                      Choose File
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">
                    or drag & drop your evidence image here
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-[9px] font-mono text-zinc-500 leading-normal">
              Processed locally in the browser using secure Base64 storage. Works perfectly offline. Native phone cameras open automatically on mobile devices.
            </p>
          </div>

          {/* Instant Fix Budget */}
          <div>
            <label htmlFor="issue-fix-cost" className="block text-xs font-mono text-zinc-500 uppercase mb-1 font-bold">
              ESTIMATED IMMEDIATE REPAIR COST (₹)
            </label>
            <input
              id="issue-fix-cost"
              type="number"
              required
              min={500}
              placeholder="12000"
              value={fixCost}
              onChange={(e) => setFixCost(Number(e.target.value))}
              className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-sm text-black focus:outline-none focus:bg-zinc-50 transition-colors font-mono font-bold"
            />
            <span className="text-[10px] font-mono text-zinc-500 block mt-1 font-semibold">
              The direct material & labor budget required for civic workers to solve this immediately.
            </span>
          </div>

          {/* DYNAMIC MATHEMATICAL ENGINE INPUTS */}
          <div className="bg-zinc-50 border-2 border-black rounded-none p-4 space-y-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xs font-mono font-black text-black flex items-center gap-2 uppercase">
              <AlertCircle className="w-4 h-4 text-red-600 font-bold" />
              Bleed Rate Parameters (Math Model Variables)
            </h3>

            {/* General dynamic info box */}
            <div className="p-3 bg-red-50 border border-red-300 text-red-950 text-xs font-mono">
              <div className="font-bold uppercase tracking-wider mb-1">Live Damage Accrual:</div>
              <div className="text-sm font-black">
                {formatCurrency(dailyBleedRate, 0)} / day ({formatCurrency(dailyBleedRate / 86400, 4)} / second)
              </div>
            </div>

            {type === 'pothole' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <label htmlFor="pothole-traffic-input" className="text-zinc-600">DAILY COMMUTER TRAFFIC COUNT</label>
                  <span className="text-amber-600 font-black">{trafficCount.toLocaleString()} vehicles/day</span>
                </div>
                <input
                  id="pothole-traffic-input"
                  type="range"
                  min="500"
                  max="15000"
                  step="100"
                  value={trafficCount}
                  onChange={(e) => setTrafficCount(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}

            {type === 'water_leak' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <label htmlFor="leak-liters-input" className="text-zinc-600">WATER LEAKAGE RATE (LITERS/HR)</label>
                  <span className="text-sky-600 font-black">{litersPerHour} Liters/hour</span>
                </div>
                <input
                  id="leak-liters-input"
                  type="range"
                  min="100"
                  max="10000"
                  step="50"
                  value={litersPerHour}
                  onChange={(e) => setLitersPerHour(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            )}

            {type === 'streetlight' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <label htmlFor="streetlight-risk-input" className="text-zinc-600">ACCIDENT RISK DELTA INCREASE</label>
                  <span className="text-zinc-900 font-black">+{accidentDelta}%</span>
                </div>
                <input
                  id="streetlight-risk-input"
                  type="range"
                  min="1"
                  max="25"
                  step="0.5"
                  value={accidentDelta}
                  onChange={(e) => setAccidentDelta(Number(e.target.value))}
                  className="w-full accent-zinc-700 cursor-pointer"
                />
              </div>
            )}

            {type === 'garbage' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <label htmlFor="garbage-households-input" className="text-zinc-600">AFFECTED HOUSEHOLDS (200M RADIUS)</label>
                  <span className="text-emerald-600 font-black">{households} households</span>
                </div>
                <input
                  id="garbage-households-input"
                  type="range"
                  min="10"
                  max="1000"
                  step="5"
                  value={households}
                  onChange={(e) => setHouseholds(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            )}

            {(type === 'drain' || type === 'sewage') && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <label htmlFor="drain-traffic-input" className="text-zinc-600">DAILY COMMUTERS / VEHICLES EXPOSED</label>
                  <span className="text-rose-600 font-black">{trafficCount.toLocaleString()} people/day</span>
                </div>
                <input
                  id="drain-traffic-input"
                  type="range"
                  min="500"
                  max="15000"
                  step="100"
                  value={trafficCount}
                  onChange={(e) => setTrafficCount(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            )}

            {type === 'footpath' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <label htmlFor="footpath-traffic-input" className="text-zinc-600">DAILY PEDESTRIAN FOOTFALL</label>
                  <span className="text-indigo-600 font-black">{trafficCount.toLocaleString()} pedestrians/day</span>
                </div>
                <input
                  id="footpath-traffic-input"
                  type="range"
                  min="300"
                  max="5000"
                  step="100"
                  value={trafficCount}
                  onChange={(e) => setTrafficCount(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4">
            <button
              id="submit-issue-btn"
              type="submit"
              disabled={isUploading}
              className={`w-full border-2 border-black font-mono text-sm py-3 px-4 rounded-none font-black tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] ${
                isUploading 
                  ? 'bg-zinc-400 text-zinc-200 cursor-not-allowed shadow-none' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  Processing and Saving Evidence...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Launch Damage Counter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
