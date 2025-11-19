import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Rocket, Trash2, DollarSign, TrendingUp, Play, RotateCcw, Database, Target, Zap, AlertTriangle, CheckCircle, Settings, Pause, SkipForward, ChevronDown, ChevronUp, FileText, Package } from 'lucide-react';

const SpaceDebrisPrototype = () => {
  const [simState, setSimState] = useState('ready');
  const [step, setStep] = useState(0);
  const [missionDay, setMissionDay] = useState(0);
  const [debrisCatalog, setDebrisCatalog] = useState([]);
  const [collectedDebris, setCollectedDebris] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [missionParams, setMissionParams] = useState({
    numDebris: 15,
    collectionEfficiency: 0.75,
    costPerMission: 5000000,
    missionDuration: 30,
    timeUnit: 'days' // 'days', 'months', 'years'
  });
  const [simulationSpeed, setSimulationSpeed] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [intervalRef, setIntervalRef] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [dailyLog, setDailyLog] = useState([]);
  const [showLog, setShowLog] = useState(true);
  const [simulationMode, setSimulationMode] = useState('short'); // 'short', 'long'
  const [results, setResults] = useState({
    totalCollected: 0,
    totalMass: 0,
    totalValue: 0,
    totalCost: 0,
    profit: 0,
    riskReduced: 0,
    materials: {}
  });

  const materials = {
    'Aluminum': { price: 50000, color: '#94a3b8', density: 2.7 },
    'Titanium': { price: 150000, color: '#60a5fa', density: 4.5 },
    'Steel': { price: 30000, color: '#f59e0b', density: 7.8 },
    'Copper': { price: 80000, color: '#f97316', density: 8.9 },
    'Carbon Fiber': { price: 200000, color: '#8b5cf6', density: 1.6 }
  };

  useEffect(() => {
    generateDebrisCatalog();
  }, []);

  const generateDebrisCatalog = () => {
    const materialTypes = Object.keys(materials);
    
    // Adjust catalog size based on simulation mode
    const catalogSize = simulationMode === 'long' ? missionParams.numDebris : missionParams.numDebris;
    
    const debris = Array.from({ length: catalogSize }, (_, i) => {
      const material = materialTypes[Math.floor(Math.random() * materialTypes.length)];
      const mass = 50 + Math.random() * 950;
      const altitude = 400 + Math.random() * 600;
      const threatLevel = Math.random();
      const accessibility = Math.random();
      
      return {
        id: `DEB-${String(i + 1).padStart(4, '0')}`,
        altitude: altitude,
        mass: mass,
        material: material,
        threatLevel: threatLevel,
        accessibility: accessibility,
        distance: 1000 + Math.random() * 5000,
        priority: 0,
        value: 0,
        collected: false,
        collectionDay: null
      };
    });

    // Calculate priority score and value
    debris.forEach(d => {
      d.value = d.mass * materials[d.material].price * missionParams.collectionEfficiency;
      d.priority = (d.threatLevel * 0.4) + 
                   ((d.value / 100000000) * 0.35) + 
                   (d.accessibility * 0.25);
    });

    // Sort by priority (highest first)
    debris.sort((a, b) => b.priority - a.priority);
    
    setDebrisCatalog(debris);
    setCollectedDebris([]);
    setResults({
      totalCollected: 0,
      totalMass: 0,
      totalValue: 0,
      totalCost: 0,
      profit: 0,
      riskReduced: 0,
      materials: {}
    });
  };

  const startSimulation = () => {
    setSimState('running');
    setStep(1);
    setMissionDay(0);
    setCurrentTarget(null);
    setIsPaused(false);
    setDailyLog([]);
    runMissionSimulation();
  };

  const pauseSimulation = () => {
    setIsPaused(true);
    if (intervalRef) {
      clearInterval(intervalRef);
      setIntervalRef(null);
    }
  };

  const resumeSimulation = () => {
    setIsPaused(false);
    runMissionSimulation();
  };

  const getTimeLabel = () => {
    switch(missionParams.timeUnit) {
      case 'months': return 'Month';
      case 'years': return 'Year';
      default: return 'Day';
    }
  };

  const getTimeLabelPlural = () => {
    switch(missionParams.timeUnit) {
      case 'months': return 'Months';
      case 'years': return 'Years';
      default: return 'Days';
    }
  };

  const stepForward = () => {
    if (missionDay < missionParams.missionDuration) {
      const nextDay = missionDay + 1;
      updateMissionDay(nextDay);
    }
  };

  const updateMissionDay = (day) => {
    // Ensure we don't exceed mission duration
    if (day > missionParams.missionDuration) {
      return;
    }
    
    setMissionDay(day);
    
    // Calculate how many debris should be collected by this day
    const debrisPerDay = missionParams.numDebris / missionParams.missionDuration;
    const targetDebrisCount = Math.min(
      Math.ceil(day * debrisPerDay),
      missionParams.numDebris
    );
    const prevDebrisCount = day > 1 ? Math.min(
      Math.ceil((day - 1) * debrisPerDay),
      missionParams.numDebris
    ) : 0;
    
    const newCollected = debrisCatalog.slice(0, targetDebrisCount).map((d, index) => ({
      ...d,
      collected: true,
      collectionDay: Math.ceil((index + 1) / debrisPerDay),
      recoveredMass: d.mass * missionParams.collectionEfficiency
    }));
    
    // Get debris collected on this specific day
    const todaysDebris = debrisCatalog.slice(prevDebrisCount, targetDebrisCount);
    
    if (todaysDebris.length > 0) {
      const todaysMass = todaysDebris.reduce((sum, d) => sum + (d.mass * missionParams.collectionEfficiency), 0);
      const todaysValue = todaysDebris.reduce((sum, d) => sum + d.value, 0);
      
      const logEntry = {
        day,
        debrisCollected: todaysDebris.map(d => ({
          id: d.id,
          mass: d.mass,
          recoveredMass: d.mass * missionParams.collectionEfficiency,
          material: d.material,
          value: d.value,
          altitude: d.altitude,
          threatLevel: d.threatLevel
        })),
        totalMass: todaysMass,
        totalValue: todaysValue,
        cumulativeDebris: targetDebrisCount,
        cumulativeMass: newCollected.reduce((sum, d) => sum + d.recoveredMass, 0),
        cumulativeValue: newCollected.reduce((sum, d) => sum + d.value, 0)
      };
      
      setDailyLog(prev => [...prev, logEntry]);
    }
    
    if (targetDebrisCount > 0 && targetDebrisCount <= debrisCatalog.length) {
      setCurrentTarget(debrisCatalog[targetDebrisCount - 1]);
    }
    
    setCollectedDebris(newCollected);
    
    // Calculate results
    const materialBreakdown = {};
    let totalMass = 0;
    let totalValue = 0;
    let riskReduced = 0;
    
    newCollected.forEach(d => {
      totalMass += d.recoveredMass;
      totalValue += d.value;
      riskReduced += d.threatLevel;
      materialBreakdown[d.material] = (materialBreakdown[d.material] || 0) + d.recoveredMass;
    });
    
    const dailyCost = missionParams.costPerMission / missionParams.missionDuration;
    const totalCost = dailyCost * day;
    
    setResults({
      totalCollected: newCollected.length,
      totalMass: totalMass,
      totalValue: totalValue,
      totalCost: totalCost,
      profit: totalValue - totalCost,
      riskReduced: (riskReduced / missionParams.numDebris) * 100,
      materials: materialBreakdown
    });
    
    // Update step based on progress
    const progress = day / missionParams.missionDuration;
    if (progress >= 0.75 && step < 4) {
      setStep(4);
    } else if (progress >= 0.5 && step < 3) {
      setStep(3);
    } else if (progress >= 0.25 && step < 2) {
      setStep(2);
    }
    
    // Check if mission complete
    if (day >= missionParams.missionDuration) {
      setSimState('complete');
      setStep(5);
      setCurrentTarget(null);
      if (intervalRef) {
        clearInterval(intervalRef);
        setIntervalRef(null);
      }
    }
  };

  const runMissionSimulation = () => {
    let currentDay = missionDay;
    
    const interval = setInterval(() => {
      currentDay++;
      
      // Stop if we've reached mission duration
      if (currentDay > missionParams.missionDuration) {
        clearInterval(interval);
        setSimState('complete');
        setStep(5);
        setCurrentTarget(null);
        return;
      }
      
      updateMissionDay(currentDay);
    }, simulationSpeed);
    
    setIntervalRef(interval);
  };

  const resetSimulation = () => {
    if (intervalRef) {
      clearInterval(intervalRef);
      setIntervalRef(null);
    }
    generateDebrisCatalog();
    setSimState('ready');
    setStep(0);
    setMissionDay(0);
    setCurrentTarget(null);
    setIsPaused(false);
    setDailyLog([]);
  };

  const materialChartData = Object.entries(results.materials).map(([name, mass]) => ({
    name,
    mass: Math.round(mass),
    value: Math.round(mass * materials[name].price)
  }));

  const priorityData = debrisCatalog.slice(0, 10).map(d => ({
    id: d.id,
    threat: (d.threatLevel * 100).toFixed(0),
    value: (d.value / 1000000).toFixed(2),
    access: (d.accessibility * 100).toFixed(0)
  }));

  const collectionTimeline = Array.from({ length: missionParams.missionDuration }, (_, i) => {
    const day = i + 1;
    const collected = collectedDebris.filter(d => d.collectionDay <= day).length;
    return {
      day,
      collected,
      target: (day / missionParams.missionDuration) * missionParams.numDebris
    };
  });

  const stepTitles = [
    'Mission Setup',
    'Debris Identification',
    'Collection in Progress',
    'Material Processing',
    'Economic Analysis',
    'Mission Complete'
  ];

  const COLORS = ['#94a3b8', '#60a5fa', '#f59e0b', '#f97316', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Rocket className="w-12 h-12 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Space Debris Harvester-Refinery
            </h1>
          </div>
          <p className="text-xl text-blue-300">Simulating Circular Space Economy Mission</p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 mb-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Mission Progress: {stepTitles[step]}</h3>
            <div className="text-2xl font-bold text-blue-400">
              {getTimeLabel()} {missionDay} / {missionParams.missionDuration}
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(missionDay / missionParams.missionDuration) * 100}%` }}
            />
          </div>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Main Controls */}
          <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-blue-500/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                {simState === 'ready' && (
                  <button
                    onClick={startSimulation}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition shadow-lg"
                  >
                    <Play className="w-5 h-5" />
                    Launch Mission
                  </button>
                )}
                
                {simState === 'running' && !isPaused && (
                  <button
                    onClick={pauseSimulation}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition shadow-lg"
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </button>
                )}
                
                {simState === 'running' && isPaused && (
                  <>
                    <button
                      onClick={resumeSimulation}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition shadow-lg"
                    >
                      <Play className="w-5 h-5" />
                      Resume
                    </button>
                    <button
                      onClick={stepForward}
                      disabled={missionDay >= missionParams.missionDuration}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition shadow-lg"
                    >
                      <SkipForward className="w-5 h-5" />
                      Next Day
                    </button>
                  </>
                )}
                
                <button
                  onClick={resetSimulation}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                  {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              
              {currentTarget && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                  <Target className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">Current Target: {currentTarget.id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Mission Parameters
              </h3>
              
              {/* Simulation Mode Selector */}
              <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-blue-500/30">
                <label className="block text-sm font-semibold mb-3">Simulation Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSimulationMode('short');
                      setMissionParams({
                        ...missionParams,
                        timeUnit: 'days',
                        missionDuration: 30,
                        numDebris: 15
                      });
                    }}
                    disabled={simState !== 'ready'}
                    className={`p-4 rounded-lg border-2 transition ${
                      simulationMode === 'short'
                        ? 'bg-blue-600 border-blue-400'
                        : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="font-bold text-lg mb-1">Short Mission</div>
                    <div className="text-xs opacity-75">Days/Weeks (detailed daily log)</div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSimulationMode('long');
                      setMissionParams({
                        ...missionParams,
                        timeUnit: 'years',
                        missionDuration: 10,
                        numDebris: 500
                      });
                    }}
                    disabled={simState !== 'ready'}
                    className={`p-4 rounded-lg border-2 transition ${
                      simulationMode === 'long'
                        ? 'bg-purple-600 border-purple-400'
                        : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="font-bold text-lg mb-1">Long-Term Operation</div>
                    <div className="text-xs opacity-75">Months/Years (scaled view)</div>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Time Unit Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Time Unit
                  </label>
                  <select
                    value={missionParams.timeUnit}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      let newDuration = missionParams.missionDuration;
                      let newDebris = missionParams.numDebris;
                      
                      // Adjust defaults based on unit
                      if (newUnit === 'days') {
                        newDuration = 30;
                        newDebris = 15;
                      } else if (newUnit === 'months') {
                        newDuration = 12;
                        newDebris = 120;
                      } else if (newUnit === 'years') {
                        newDuration = 10;
                        newDebris = 500;
                      }
                      
                      setMissionParams({
                        ...missionParams,
                        timeUnit: newUnit,
                        missionDuration: newDuration,
                        numDebris: newDebris
                      });
                    }}
                    disabled={simState !== 'ready'}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Duration ({getTimeLabelPlural()})
                  </label>
                  <input
                    type="range"
                    min={missionParams.timeUnit === 'days' ? 10 : missionParams.timeUnit === 'months' ? 1 : 1}
                    max={missionParams.timeUnit === 'days' ? 90 : missionParams.timeUnit === 'months' ? 36 : 30}
                    value={missionParams.missionDuration}
                    onChange={(e) => setMissionParams({...missionParams, missionDuration: parseInt(e.target.value)})}
                    disabled={simState !== 'ready'}
                    className="w-full"
                  />
                  <div className="text-center mt-1 text-2xl font-bold text-green-400">
                    {missionParams.missionDuration}
                  </div>
                </div>

                {/* Number of Debris */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Debris Targets
                  </label>
                  <input
                    type="range"
                    min={missionParams.timeUnit === 'years' ? 100 : missionParams.timeUnit === 'months' ? 50 : 5}
                    max={missionParams.timeUnit === 'years' ? 2000 : missionParams.timeUnit === 'months' ? 500 : 50}
                    step={missionParams.timeUnit === 'years' ? 50 : missionParams.timeUnit === 'months' ? 10 : 1}
                    value={missionParams.numDebris}
                    onChange={(e) => {
                      setMissionParams({...missionParams, numDebris: parseInt(e.target.value)});
                      if (simState === 'ready') generateDebrisCatalog();
                    }}
                    disabled={simState !== 'ready'}
                    className="w-full"
                  />
                  <div className="text-center mt-1 text-2xl font-bold text-blue-400">
                    {missionParams.numDebris}
                  </div>
                </div>

                {/* Collection Efficiency */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Recovery Efficiency
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="0.95"
                    step="0.05"
                    value={missionParams.collectionEfficiency}
                    onChange={(e) => setMissionParams({...missionParams, collectionEfficiency: parseFloat(e.target.value)})}
                    disabled={simState !== 'ready'}
                    className="w-full"
                  />
                  <div className="text-center mt-1 text-2xl font-bold text-yellow-400">
                    {(missionParams.collectionEfficiency * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Cost Per Mission */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Total Mission Cost ($M)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={missionParams.costPerMission / 1000000}
                    onChange={(e) => setMissionParams({...missionParams, costPerMission: parseInt(e.target.value) * 1000000})}
                    disabled={simState !== 'ready'}
                    className="w-full"
                  />
                  <div className="text-center mt-1 text-2xl font-bold text-red-400">
                    ${missionParams.costPerMission / 1000000}M
                  </div>
                </div>

                {/* Simulation Speed */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Simulation Speed
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={simulationSpeed}
                    onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center mt-1 text-lg font-bold text-purple-400">
                    {simulationSpeed < 200 ? 'Fast' : simulationSpeed < 500 ? 'Medium' : 'Slow'}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-200">
                  💡 <strong>Tip:</strong> Use "Days" for detailed mission analysis (1-3 months). Use "Months" or "Years" for long-term economic projections (1-30 years).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Trash2 className="w-4 h-4" />
              <div className="text-xs opacity-90">Collected</div>
            </div>
            <div className="text-3xl font-bold">{results.totalCollected}</div>
            <div className="text-xs opacity-75">of {missionParams.numDebris}</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4" />
              <div className="text-xs opacity-90">Mass</div>
            </div>
            <div className="text-3xl font-bold">{(results.totalMass / 1000).toFixed(1)}</div>
            <div className="text-xs opacity-75">metric tons</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4" />
              <div className="text-xs opacity-90">Value</div>
            </div>
            <div className="text-3xl font-bold">${(results.totalValue / 1000000).toFixed(1)}M</div>
            <div className="text-xs opacity-75">recovered</div>
          </div>
          
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4" />
              <div className="text-xs opacity-90">Cost</div>
            </div>
            <div className="text-3xl font-bold">${(results.totalCost / 1000000).toFixed(1)}M</div>
            <div className="text-xs opacity-75">operational</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" />
              <div className="text-xs opacity-90">Profit</div>
            </div>
            <div className={`text-3xl font-bold ${results.profit >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              ${(results.profit / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs opacity-75">{results.profit >= 0 ? 'surplus' : 'deficit'}</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <div className="text-xs opacity-90">Risk ↓</div>
            </div>
            <div className="text-3xl font-bold">{results.riskReduced.toFixed(1)}%</div>
            <div className="text-xs opacity-75">reduced</div>
          </div>
        </div>

        {/* Main Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Daily Mission Log - Takes 2 columns */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur rounded-lg p-5 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Daily Mission Log
              </h3>
              <button
                onClick={() => setShowLog(!showLog)}
                className="text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded transition"
              >
                {showLog ? 'Hide' : 'Show'} Log
              </button>
            </div>
            
            {showLog && (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {dailyLog.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Mission log will appear here once started</p>
                  </div>
                ) : (
                  dailyLog.map((log, idx) => (
                    <div key={idx} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-500 text-white px-2 py-1 rounded font-bold text-sm">
                            {getTimeLabel().toUpperCase()} {log.day}
                          </div>
                          <span className="text-sm text-slate-400">
                            {log.debrisCollected.length} debris collected
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-green-400">
                          +${(log.totalValue / 1000000).toFixed(2)}M
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {log.debrisCollected.map((debris, dIdx) => (
                          <div key={dIdx} className="bg-slate-800/50 rounded p-2 text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-blue-300">{debris.id}</span>
                              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                                {debris.material}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                              <div>Mass: <span className="text-white font-semibold">{debris.mass.toFixed(1)} kg</span></div>
                              <div>Recovered: <span className="text-green-400 font-semibold">{debris.recoveredMass.toFixed(1)} kg</span></div>
                              <div>Altitude: <span className="text-white">{debris.altitude.toFixed(0)} km</span></div>
                              <div>Threat: <span className="text-red-400">{(debris.threatLevel * 100).toFixed(0)}%</span></div>
                              <div className="col-span-2">Value: <span className="text-yellow-400 font-semibold">${(debris.value / 1000000).toFixed(3)}M</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-slate-400">{getTimeLabel()} Total</div>
                          <div className="font-semibold text-green-400">{log.totalMass.toFixed(1)} kg</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Cumulative</div>
                          <div className="font-semibold text-blue-400">{log.cumulativeDebris} debris</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Total Value</div>
                          <div className="font-semibold text-yellow-400">${(log.cumulativeValue / 1000000).toFixed(2)}M</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Priority Selection */}
          <div className="bg-slate-800/50 backdrop-blur rounded-lg p-5 border border-blue-500/30">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Top Priorities
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={priorityData.slice(0, 5)}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="id" stroke="#94a3b8" />
                <PolarRadiusAxis stroke="#94a3b8" />
                <Radar name="Threat" dataKey="threat" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                <Radar name="Value" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                <Radar name="Access" dataKey="access" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Collection Timeline */}
          <div className="bg-slate-800/50 backdrop-blur rounded-lg p-5 border border-blue-500/30">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Collection Timeline
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={collectionTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" label={{ value: `Mission ${getTimeLabel()}`, position: 'insideBottom', offset: -5, fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" label={{ value: 'Debris Count', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #3b82f6' }} />
                <Legend />
                <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={3} name="Collected" />
                <Line type="monotone" dataKey="target" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Material Recovery */}
          <div className="bg-slate-800/50 backdrop-blur rounded-lg p-5 border border-blue-500/30">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Material Recovery
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={materialChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, mass }) => `${name}: ${mass} kg`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="mass"
                >
                  {materialChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #3b82f6' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Third Row Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Economic Breakdown */}
          <div className="bg-slate-800/50 backdrop-blur rounded-lg p-5 border border-blue-500/30">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Economic Value by Material
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={materialChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" label={{ value: 'Value ($M)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #3b82f6' }} />
                <Bar dataKey="value" fill="#3b82f6" name="Value (Thousands $)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orbital Visualization */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-5 mb-6 border border-blue-500/30">
          <h3 className="text-xl font-bold mb-4">Debris Distribution in LEO</h3>
          <div className="mb-3 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Remaining: <strong className="text-red-400">{debrisCatalog.filter(d => !d.collected).length}</strong> objects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Collected: <strong className="text-green-400">{collectedDebris.length}</strong> objects</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                type="number" 
                dataKey="altitude" 
                stroke="#94a3b8" 
                name="Altitude"
                domain={['dataMin - 50', 'dataMax + 50']}
                label={{ value: 'Altitude (km)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 14 }}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                type="number" 
                dataKey="mass" 
                stroke="#94a3b8" 
                name="Mass"
                domain={['dataMin - 50', 'dataMax + 50']}
                label={{ value: 'Mass (kg)', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 14 }}
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div style={{ backgroundColor: '#1e293b', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px' }}>
                        <p style={{ color: '#60a5fa', fontWeight: 'bold', marginBottom: '5px' }}>{data.id}</p>
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Altitude: <span style={{ color: 'white', fontWeight: 'bold' }}>{Math.round(data.altitude)} km</span></p>
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Mass: <span style={{ color: 'white', fontWeight: 'bold' }}>{Math.round(data.mass)} kg</span></p>
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Material: <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>{data.material}</span></p>
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Status: <span style={{ color: data.collected ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{data.collected ? 'Collected' : 'Remaining'}</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Scatter 
                name="Remaining Debris" 
                data={debrisCatalog.filter(d => !d.collected)} 
                fill="#ef4444"
                fillOpacity={0.7}
                r={6}
              />
              <Scatter 
                name="Collected Debris" 
                data={collectedDebris.map(d => ({
                  altitude: d.altitude,
                  mass: d.mass,
                  id: d.id,
                  material: d.material,
                  collected: true
                }))} 
                fill="#10b981"
                fillOpacity={0.9}
                r={7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Results Summary */}
        {simState === 'complete' && (
          <div className="bg-gradient-to-r from-green-900/50 via-blue-900/50 to-purple-900/50 backdrop-blur rounded-lg p-6 border-2 border-green-500/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <h3 className="text-3xl font-bold text-green-400">Mission Successfully Completed!</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-blue-300 mb-3">Mission Achievements</h4>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Successfully collected <strong className="text-green-400">{results.totalCollected}</strong> debris objects</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Recovered <strong className="text-green-400">{(results.totalMass / 1000).toFixed(2)} metric tons</strong> of materials</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Generated <strong className="text-green-400">${(results.totalValue / 1000000).toFixed(2)}M</strong> in material value</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Reduced collision risk by <strong className="text-green-400">{results.riskReduced.toFixed(1)}%</strong></span>
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-purple-300 mb-3">Economic Analysis</h4>
                <p>Mission Cost: <strong className="text-red-400">${(results.totalCost / 1000000).toFixed(2)}M</strong></p>
                <p>Material Value: <strong className="text-green-400">${(results.totalValue / 1000000).toFixed(2)}M</strong></p>
                <p className="text-xl">
                  Net Result: <strong className={results.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {results.profit >= 0 ? '+' : ''} ${(results.profit / 1000000).toFixed(2)}M
                  </strong>
                </p>
                <p className="text-sm text-slate-300 mt-2">
                  {results.profit >= 0 
                    ? '✓ Mission achieved profitability through material recovery!' 
                    : '⚠ Extended missions with larger debris targets would increase profitability'}
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold mb-2 text-lg">Key Demonstration Points:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <li>✓ Smart prioritization algorithm (threat + value + access)</li>
                <li>✓ Efficient multi-target collection strategy</li>
                <li>✓ High material recovery rate ({(missionParams.collectionEfficiency * 100).toFixed(0)}%)</li>
                <li>✓ Real-time mission tracking and analytics</li>
                <li>✓ Economic viability demonstrated</li>
                <li>✓ Significant orbital safety improvement</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-400">
          <p>Space Debris Harvester-Refinery Prototype | Circular Space Economy Concept</p>
          <p>Round 2 Submission - UnStop Innovation Challenge</p>
        </div>
      </div>
    </div>
  );
};

export default SpaceDebrisPrototype;
