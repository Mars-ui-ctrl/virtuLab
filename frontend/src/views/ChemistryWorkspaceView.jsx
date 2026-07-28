import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLab } from '../context/LabContext';
import { Header } from '../components/common/Header';
import { LeftToolbox } from '../components/workspace/LeftToolbox';
import { RightPropertiesPanel } from '../components/workspace/RightPropertiesPanel';
import { BottomConsole } from '../components/workspace/BottomConsole';
import { ChemistryCanvas } from '../components/3d/ChemistryCanvas';
import { Droplet, RotateCw, Trash2, Copy, Ruler, Play, Pause, RefreshCw, Flame, X } from 'lucide-react';

/* ============================================================
   MEASURE TOOL — Telemetry Lookup for Chemistry Reagents
   ============================================================ */
function getChemistryMeasurement(comp, params) {
  const vol = params.dispensedBaseVolume || 0;

  let livepH = 1.50;
  let statusStr = "Acidic Solution (0.1M HCl)";
  let colorStr = "text-cyan-400";

  if (vol < 24.5) {
    livepH = 1.50 + (vol / 25.0) * 1.8;
  } else if (vol >= 24.5 && vol <= 25.5) {
    livepH = 7.00;
    statusStr = "Neutralized Endpoint (pH = 7.0)";
    colorStr = "text-emerald-400";
  } else {
    livepH = 11.50 + Math.log10(Math.max(0.1, vol - 25));
    statusStr = "Basic Over-titration (Excess NaOH)";
    colorStr = "text-rose-400";
  }

  switch (comp.type) {
    case 'erlenmeyer':
      return {
        title: '🧪 Erlenmeyer Flask Telemetry',
        rows: [
          { label: 'Contents', value: '100mL 0.1M HCl + Phenolphthalein', color: 'text-amber-400' },
          { label: 'Calculated pH', value: livepH.toFixed(2), color: colorStr },
          { label: 'Base Added', value: `${vol.toFixed(1)} mL NaOH`, color: 'text-cyan-400' },
          { label: 'Indicator Status', value: statusStr, color: colorStr }
        ]
      };
    case 'burette':
      return {
        title: '🧪 Burette & Clamp Stand Telemetry',
        rows: [
          { label: 'Titrant Solution', value: '0.1M NaOH (Sodium Hydroxide)', color: 'text-amber-400' },
          { label: 'Volume Remaining', value: `${(50.0 - vol).toFixed(1)} mL`, color: 'text-cyan-400' },
          { label: 'Total Dispensed', value: `${vol.toFixed(1)} mL`, color: 'text-indigo-400' },
          { label: 'Stopcock Status', value: params.isDripping ? 'OPEN (Dripping)' : 'CLOSED (Stopped)', color: params.isDripping ? 'text-rose-400' : 'text-emerald-400' }
        ]
      };
    case 'beaker':
      return {
        title: '🧪 Glass Beaker Telemetry',
        rows: [
          { label: 'Sample Solution', value: (params.selectedSolution || 'Water').toUpperCase(), color: 'text-cyan-400' },
          { label: 'Measured pH', value: (params.samplePH || 7.0).toFixed(2), color: 'text-emerald-400' },
          { label: 'Burner Attached', value: params.burnerAttached ? 'YES (On Tripod Stand)' : 'NO', color: params.burnerAttached ? 'text-emerald-400' : 'text-slate-400' },
          { label: 'State', value: params.temperature >= 95 ? 'Vaporizing (100°C Boiling)' : 'Liquid Phase', color: params.temperature >= 95 ? 'text-rose-400' : 'text-emerald-400' }
        ]
      };
    case 'burner':
      return {
        title: '🔥 Bunsen Burner Telemetry',
        rows: [
          { label: 'Ignition State', value: params.burnerActive ? 'IGNITED (Blue Flame)' : 'OFF', color: params.burnerActive ? 'text-cyan-400' : 'text-slate-400' },
          { label: 'Flame Intensity', value: `${params.flameIntensity || 75} %`, color: 'text-amber-400' },
          { label: 'Gas Supply', value: 'Methane / Propane', color: 'text-slate-400' }
        ]
      };
    case 'phstrip':
      return {
        title: '🎨 pH Indicator Strip Telemetry',
        rows: [
          { label: 'Paper Type', value: 'Universal Full-Spectrum Paper', color: 'text-amber-400' },
          { label: 'Sample Tested', value: (params.selectedSolution || 'Water').toUpperCase(), color: 'text-cyan-400' },
          { label: 'Measured pH', value: `pH ${(params.samplePH || 7.0).toFixed(2)}`, color: 'text-emerald-400' },
          { label: 'Strip Status', value: params.stripDipped ? 'DIPPED IN BEAKER SAMPLE' : 'DRY (Ready)', color: params.stripDipped ? 'text-emerald-400' : 'text-slate-400' }
        ]
      };
    case 'testtube':
      return {
        title: '🧪 Test Tube Telemetry',
        rows: [
          { label: 'Capacity', value: '25 mL Borosilicate Glass', color: 'text-amber-400' },
          { label: 'Liquid Level', value: `${((comp.liquidLevel || 0.4) * 25).toFixed(1)} mL`, color: 'text-cyan-400' }
        ]
      };
    case 'pipette':
      return {
        title: '💧 Dropping Pipette Telemetry',
        rows: [
          { label: 'Reagent', value: 'Phenolphthalein Indicator Solution', color: 'text-pink-400' },
          { label: 'Bulb Status', value: 'Rubber Squeeze Active', color: 'text-cyan-400' }
        ]
      };
    case 'thermometer':
      return {
        title: '🌡️ Digital Thermometer Telemetry',
        rows: [
          { label: 'Sensor Shaft', value: 'Stainless Steel Probe', color: 'text-amber-400' },
          { label: 'Live Temperature', value: `${(params.temperature || 22.5).toFixed(1)} °C`, color: 'text-emerald-400' }
        ]
      };
    default:
      return {
        title: `🧪 ${comp.name || comp.type || 'Chemistry Component'} Telemetry`,
        rows: [
          { label: 'Type', value: comp.type || 'Reagent', color: 'text-amber-400' },
          { label: 'Position', value: comp.position ? `[${comp.position.join(', ')}]` : 'Workbench', color: 'text-cyan-400' }
        ]
      };
  }
}

export const ChemistryWorkspaceView = () => {
  const { currentExperiment, showToast } = useLab();
  const [isRunning, setIsRunning] = useState(false);
  const [activeTool, setActiveTool] = useState('pointer');
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [measurementPopup, setMeasurementPopup] = useState(null);

  // Reagents placed on workbench
  const [addedComponents, setAddedComponents] = useState([]);

  const [params, setParams] = useState(currentExperiment.defaultParams || {
    dispensedBaseVolume: 0,
    isDripping: false,
    burnerActive: false,
    flameIntensity: 75,
    temperature: 22.5,
    stripDipped: false,
    stripColor: "#22c55e",
    selectedSolution: "water",
    samplePH: 7.0,
    burnerAttached: false
  });

  // Reset & setup initial components when experiment changes (Clean stage)
  useEffect(() => {
    setIsRunning(false);
    setActiveTool('pointer');
    setSelectedComponentId(null);
    setMeasurementPopup(null);
    setParams(currentExperiment.defaultParams || { dispensedBaseVolume: 0, isDripping: false, burnerActive: false, flameIntensity: 75, temperature: 22.5, selectedSolution: "water", samplePH: 7.0, stripColor: "#22c55e", burnerAttached: false });
    setAddedComponents([]);
  }, [currentExperiment.id, currentExperiment.defaultParams]);

  // Dripping interval effect
  useEffect(() => {
    let interval;
    if (isRunning && currentExperiment.id === 'chem-neutralization' && params.isDripping) {
      interval = setInterval(() => {
        setParams(prev => {
          const currentVol = prev.dispensedBaseVolume || 0;
          if (currentVol >= 35.0) {
            showToast("⚠️ Burette Empty!", "Refill burette to continue titration.", "⚠️");
            return { ...prev, isDripping: false };
          }
          return {
            ...prev,
            dispensedBaseVolume: parseFloat((currentVol + 0.1).toFixed(1))
          };
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isRunning, params.isDripping, currentExperiment.id, showToast]);

  // Heating timer effect
  useEffect(() => {
    let interval;
    if (isRunning && currentExperiment.id === 'chem-heating' && params.burnerActive) {
      interval = setInterval(() => {
        setParams(prev => {
          const nextTemp = Math.min(100, (prev.temperature || 22.5) + 1.2 * ((prev.flameIntensity || 75) / 75));
          return { ...prev, temperature: parseFloat(nextTemp.toFixed(1)) };
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isRunning, params.burnerActive, currentExperiment.id]);

  /* DYNAMIC OBJECTIVES */
  const objectives = useMemo(() => {
    const hasBurette = addedComponents.some(c => c.type === 'burette');
    const hasErlenmeyer = addedComponents.some(c => c.type === 'erlenmeyer');
    const hasPipette = addedComponents.some(c => c.type === 'pipette');
    const hasBeaker = addedComponents.some(c => c.type === 'beaker');
    const hasThermometer = addedComponents.some(c => c.type === 'thermometer');
    const hasBurner = addedComponents.some(c => c.type === 'burner');
    const vol = params.dispensedBaseVolume || 0;

    if (currentExperiment.id === 'chem-neutralization') {
      return [
        { text: 'Place Erlenmeyer flask on the workbench', done: hasErlenmeyer },
        { text: 'Set up burette with stand clamp', done: hasBurette },
        { text: 'Add dropping pipette for indicator', done: hasPipette },
        { text: 'Dispense base solution drop-by-drop until light pink endpoint', done: vol >= 24.5 && vol <= 25.5 },
        { text: 'Record equivalence volume (~25.0 mL)', done: vol >= 24.5 && vol <= 25.5 },
        { text: 'Verify pH reaches neutralization (~7.0)', done: vol >= 24.5 && vol <= 25.5 }
      ];
    }
    if (currentExperiment.id === 'chem-heating') {
      const burnerClose = hasBurner && hasBeaker;
      return [
        { text: 'Place beaker filled with 250mL distilled water', done: hasBeaker },
        { text: 'Insert digital thermometer sensor', done: hasThermometer },
        { text: 'Set up Bunsen burner under the beaker', done: hasBurner && (params.burnerAttached || burnerClose) },
        { text: 'Ignite burner flame and set gas valve intensity', done: params.burnerActive },
        { text: 'Monitor real-time temperature rise', done: isRunning && params.burnerActive },
        { text: 'Observe vapor formation at 100°C boiling point', done: (params.temperature || 22.5) >= 95 }
      ];
    }
    if (currentExperiment.id === 'chem-ph-test') {
      const hasStrip = addedComponents.some(c => c.type === 'phstrip');
      const hasSampleBeaker = addedComponents.some(c => c.type === 'beaker');
      const hasSample = params.selectedSolution !== 'water';
      return [
        { text: 'Select solution sample (Lemon Juice, Coffee, Pure Water, Soap, Bleach)', done: hasSample },
        { text: 'Dip universal pH indicator strip into the test solution beaker', done: hasStrip && hasSampleBeaker },
        { text: 'Match strip color transformation against standard pH color scale', done: params.stripDipped },
        { text: 'Classify sample as Strongly Acidic, Weakly Acidic, Neutral, or Basic', done: params.stripDipped },
        { text: 'Compare pH values across all test solutions', done: params.stripDipped }
      ];
    }
    return currentExperiment.objectives?.map(text => ({ text, done: false })) || [];
  }, [currentExperiment.id, currentExperiment.objectives, params, isRunning, addedComponents]);

  const completedObjectives = objectives.filter(o => o.done).length;
  const totalObjectives = objectives.length;

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  /* HANDLERS */
  const handleDispenseDrop = () => {
    if (!isRunning) setIsRunning(true);
    setParams(prev => {
      const nextVol = parseFloat(((prev.dispensedBaseVolume || 0) + 0.1).toFixed(1));
      if (nextVol >= 24.5 && nextVol <= 25.5) {
        showToast("🌸 Pink Endpoint Reached!", "Neutralization achieved! pH = 7.00 at 25.0 mL.", "🎉");
      }
      return { ...prev, dispensedBaseVolume: nextVol, isDripping: true };
    });
  };

  const handleToggleDrip = () => {
    setParams(prev => {
      const nextDrip = !prev.isDripping;
      if (nextDrip) setIsRunning(true);
      showToast(nextDrip ? "💧 Stopcock Open" : "⏸ Stopcock Closed", nextDrip ? "Dispensing base titrant drop-by-drop..." : "Flow paused.");
      return { ...prev, isDripping: nextDrip };
    });
  };

  const handleToggleFlame = useCallback(() => {
    setParams(prev => {
      const nextActive = !prev.burnerActive;
      if (nextActive) setIsRunning(true);
      showToast(nextActive ? "🔥 Burner Ignited!" : "🔥 Flame Extinguished", nextActive ? "Gas valve open. Blue flame active." : "Burner turned off.");
      return { ...prev, burnerActive: nextActive };
    });
  }, [showToast]);

  const handleSelectSampleSolution = (val) => {
    const solutionData = {
      lemon: { ph: 2.0, color: '#ef4444', class: 'Strongly Acidic', title: 'Lemon Juice' },
      coffee: { ph: 5.0, color: '#d97706', class: 'Weakly Acidic', title: 'Black Coffee' },
      water: { ph: 7.0, color: '#38bdf8', class: 'Neutral Solution', title: 'Pure Water' },
      soap: { ph: 10.0, color: '#06b6d4', class: 'Weakly Basic', title: 'Soap Solution' },
      bleach: { ph: 13.0, color: '#a855f7', class: 'Strongly Basic', title: 'Bleach Titrant' }
    };
    const data = solutionData[val] || solutionData.water;

    setParams(p => ({
      ...p,
      selectedSolution: val,
      stripDipped: true,
      stripColor: data.color,
      samplePH: data.ph
    }));

    // Spawn or update sample Beaker on workbench with correct liquid color
    setAddedComponents(prev => {
      const hasBeaker = prev.some(c => c.type === 'beaker');
      if (!hasBeaker) {
        const beaker = {
          name: `Beaker (${data.title})`,
          type: 'beaker',
          id: `comp-${Date.now()}-beaker`,
          position: [-0.6, 0.6, 0],
          rotation: [0, 0, 0],
          liquidColor: data.color
        };
        const phStrip = prev.find(c => c.type === 'phstrip');
        if (phStrip) {
          return [
            ...prev.map(c => c.type === 'phstrip' ? { ...c, position: [-0.6, 0.6, 0.2] } : c),
            beaker
          ];
        }
        return [...prev, beaker];
      }
      return prev.map(c => c.type === 'beaker' ? { ...c, liquidColor: data.color, name: `Beaker (${data.title})` } : c);
    });

    showToast("🧪 Sample Selected", `Beaker filled with ${data.title} (pH ${data.ph}). pH strip dipped!`, "🎨");
  };

  /* CENTRAL "RUN SIMULATION" MASTER CONTROL BUTTON */
  const handleToggleRun = () => {
    const nextRunning = !isRunning;

    if (nextRunning) {
      if (currentExperiment.id === 'chem-neutralization') {
        const hasBurette = addedComponents.some(c => c.type === 'burette');
        const hasErlenmeyer = addedComponents.some(c => c.type === 'erlenmeyer');
        if (!hasBurette || !hasErlenmeyer) {
          showToast("⚠️ Glassware Missing!", "Add Erlenmeyer flask and Burette to the workbench first.", "⚠️");
          return;
        }
        setParams(p => ({ ...p, isDripping: true }));
      } else if (currentExperiment.id === 'chem-heating') {
        const hasBeaker = addedComponents.some(c => c.type === 'beaker');
        const hasBurner = addedComponents.some(c => c.type === 'burner');
        if (!hasBeaker || !hasBurner) {
          showToast("⚠️ Equipment Missing!", "Add Beaker and Bunsen Burner to the workbench first.", "⚠️");
          return;
        }
        setParams(p => ({ ...p, burnerActive: true }));
      }
    } else {
      setParams(p => ({ ...p, isDripping: false, burnerActive: false }));
    }

    setIsRunning(nextRunning);
    showToast(
      nextRunning ? "Simulation Running ▶" : "Simulation Paused ⏸",
      nextRunning ? `Executing ${currentExperiment.title}...` : "Experiment halted."
    );
  };

  const handleReset = () => {
    setIsRunning(false);
    setMeasurementPopup(null);
    setParams(currentExperiment.defaultParams || { dispensedBaseVolume: 0, isDripping: false, burnerActive: false, flameIntensity: 75, temperature: 22.5, selectedSolution: "water", samplePH: 7.0, stripColor: "#22c55e", burnerAttached: false });
    setAddedComponents([]);
    showToast("Workbench Cleaned 🔄", "Glassware and reagents reset.");
  };

  /* SPAWN ON SAME AXIS (Y = 0.6, Z = 0) */
  const handleAddComponent = (item) => {
    const count = addedComponents.length;
    const posX = (count - 1) * 1.6;
    const pos = [posX, 0.6, 0];

    const liquidColorMap = {
      lemon: '#ef4444',
      coffee: '#d97706',
      water: '#38bdf8',
      soap: '#06b6d4',
      bleach: '#a855f7'
    };

    let customLiquidColor = item.liquidColor;
    if (item.type === 'beaker' && currentExperiment.id === 'chem-ph-test') {
      customLiquidColor = liquidColorMap[params.selectedSolution || 'water'] || '#38bdf8';
    }

    const newComp = {
      ...item,
      id: `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      position: pos,
      rotation: [0, 0, 0],
      liquidColor: customLiquidColor
    };

    // In Experiment 3 (pH Test): If adding pH Strip and no Beaker exists, automatically add sample beaker alongside!
    if (currentExperiment.id === 'chem-ph-test' && item.type === 'phstrip') {
      const hasBeaker = addedComponents.some(c => c.type === 'beaker');
      if (!hasBeaker) {
        const beakerComp = {
          name: `Beaker (${(params.selectedSolution || 'Water').toUpperCase()} Sample)`,
          type: 'beaker',
          id: `comp-${Date.now()}-beaker`,
          position: [posX - 1.4, 0.6, 0],
          rotation: [0, 0, 0],
          liquidColor: liquidColorMap[params.selectedSolution || 'water'] || '#38bdf8'
        };
        newComp.position = [posX - 1.4, 0.6, 0.2];
        setAddedComponents(prev => [...prev, beakerComp, newComp]);
        setSelectedComponentId(newComp.id);
        showToast("Beaker & pH Strip Placed 🧪", `Sample beaker filled with ${(params.selectedSolution || 'water').toUpperCase()}!`);
        return;
      }
    }

    setAddedComponents(prev => [...prev, newComp]);
    setSelectedComponentId(newComp.id);
    showToast("Reagent Placed 🧪", `${item.name} added to 3D workbench!`);
  };

  /* 3D DRAG MOVE & MAGNETIC ATTACHMENT HANDLER */
  const handleMoveComponent = useCallback((id, newPos) => {
    setAddedComponents(prev => {
      const moved = prev.find(c => c.id === id);
      if (!moved) return prev;

      const beaker = prev.find(c => c.type === 'beaker');
      const burner = prev.find(c => c.type === 'burner');

      let isAttached = false;
      let targetPos = [...newPos];

      if (beaker && burner) {
        const bPos = moved.id === beaker.id ? newPos : (beaker.position || [0, 0.6, 0]);
        const rPos = moved.id === burner.id ? newPos : (burner.position || [0, 0.6, 0]);

        const dist = Math.sqrt((bPos[0] - rPos[0]) ** 2 + (bPos[2] - rPos[2]) ** 2);

        if (dist <= 1.4) {
          isAttached = true;
          if (moved.type === 'beaker') {
            targetPos = [rPos[0], 1.35, rPos[2]];
          } else if (moved.type === 'burner') {
            targetPos = [bPos[0], 0.35, bPos[2]];
          }
        }
      }

      setParams(p => ({ ...p, burnerAttached: isAttached }));

      return prev.map(c => {
        if (c.id === id) return { ...c, position: targetPos };
        if (isAttached && beaker && burner) {
          if (c.type === 'beaker' && moved.type === 'burner') return { ...c, position: [targetPos[0], 1.35, targetPos[2]] };
          if (c.type === 'burner' && moved.type === 'beaker') return { ...c, position: [targetPos[0], 0.35, targetPos[2]] };
        }
        return c;
      });
    });
  }, []);

  /* 3D ROTATE HANDLER */
  const handleRotateComponent = useCallback((id) => {
    setAddedComponents(prev => prev.map(c => {
      if (c.id !== id) return c;
      const currentRotY = c.rotation ? c.rotation[1] : 0;
      return { ...c, rotation: [0, currentRotY + Math.PI / 4, 0] };
    }));
    showToast("Rotated 🔄", "Component rotated 45° around Y axis.");
  }, [showToast]);

  const handleSelectComponent = useCallback((id) => {
    const comp = addedComponents.find(c => c.id === id);
    if (!comp) return;

    if (activeTool === 'delete') {
      setAddedComponents(prev => prev.filter(c => c.id !== id));
      setSelectedComponentId(null);
      showToast("Reagent Removed 🗑", "Deleted from chemistry workbench.");
    } else if (activeTool === 'rotate') {
      handleRotateComponent(id);
    } else if (activeTool === 'duplicate') {
      const clone = {
        ...comp,
        id: `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        position: [(comp.position?.[0] || 0) + 1.2, 0.6, (comp.position?.[2] || 0) + 0.3]
      };
      setAddedComponents(prev => [...prev, clone]);
      setSelectedComponentId(clone.id);
      showToast("Duplicated 📋", `Created duplicate of ${comp.name}`);
    } else if (activeTool === 'measure') {
      setMeasurementPopup(getChemistryMeasurement(comp, params));
    } else {
      setSelectedComponentId(id);
    }
  }, [activeTool, addedComponents, handleRotateComponent, params, showToast]);

  const handleDeleteSelected = () => {
    if (selectedComponentId) {
      setAddedComponents(prev => prev.filter(c => c.id !== selectedComponentId));
      setSelectedComponentId(null);
      showToast("Deleted 🗑", "Removed from chemistry workbench.");
    }
  };

  const handleAddIndicator = useCallback(() => {
    setParams(prev => ({ ...prev, indicatorAdded: true }));
    showToast("💧 Phenolphthalein Added!", "2-3 drops of indicator added to Erlenmeyer flask.", "🌸");
  }, [showToast]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden select-none">
      <Header
        onRunSimulation={handleToggleRun}
        onResetSimulation={handleReset}
        isRunning={isRunning}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <LeftToolbox
          subject="chemistry"
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onAddComponent={handleAddComponent}
          addedComponents={addedComponents}
          selectedComponentId={selectedComponentId}
          onDeleteSelected={handleDeleteSelected}
        />

        <div className="flex-1 h-full relative">
          <ChemistryCanvas
            experimentId={currentExperiment.id}
            params={params}
            addedComponents={addedComponents}
            onSelectComponent={handleSelectComponent}
            selectedComponentId={selectedComponentId}
            activeTool={activeTool}
            onMoveComponent={handleMoveComponent}
            onToggleDrip={handleToggleDrip}
            onDispenseDrop={handleDispenseDrop}
            onAddIndicator={handleAddIndicator}
            onToggleFlame={handleToggleFlame}
          />

          {/* Active Tool Mode Indicator */}
          {activeTool !== 'pointer' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
              <div className={`px-4 py-2 rounded-2xl text-xs font-extrabold shadow-lg border backdrop-blur-md ${
                activeTool === 'delete' ? 'bg-rose-500/90 text-white border-rose-400' :
                activeTool === 'move' ? 'bg-cyan-500/90 text-white border-cyan-400' :
                activeTool === 'rotate' ? 'bg-purple-500/90 text-white border-purple-400' :
                activeTool === 'measure' ? 'bg-emerald-500/90 text-white border-emerald-400' :
                'bg-slate-800/90 text-white border-slate-600'
              }`}>
                {activeTool === 'delete' && '🗑 DELETE — Click any glassware to remove'}
                {activeTool === 'move' && '✋ MOVE — Drag components smoothly across 3D stage'}
                {activeTool === 'rotate' && '🔄 ROTATE — Click component to spin 45°'}
                {activeTool === 'measure' && '📏 MEASURE — Click any reagent for live pH & telemetry'}
                {activeTool === 'duplicate' && '📋 DUPLICATE — Click any component to clone'}
              </div>
            </div>
          )}

          {/* Interactive Titration Control Bar (Drop-by-Drop) */}
          {currentExperiment.id === 'chem-neutralization' && (
            <div className="absolute top-3 right-4 z-20 flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md p-2 rounded-2xl shadow-xl">
              <button
                onClick={handleDispenseDrop}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-black shadow-md flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
                title="Dispense exactly 1 drop (0.1 mL)"
              >
                <Droplet className="w-4 h-4 text-cyan-200 animate-bounce" />
                <span>💧 Dispense 1 Drop (+0.1 mL)</span>
              </button>

              <button
                onClick={handleToggleDrip}
                className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-md flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer border ${
                  params.isDripping
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                    : 'bg-emerald-600 text-white border-emerald-400 hover:bg-emerald-500'
                }`}
              >
                {params.isDripping ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{params.isDripping ? '🔴 Stop Drip Flow' : '🟢 Open Stopcock Drip'}</span>
              </button>
            </div>
          )}

          {/* Heating Control Bar */}
          {currentExperiment.id === 'chem-heating' && (
            <div className="absolute top-3 right-4 z-20 flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md p-2 rounded-2xl shadow-xl">
              <button
                onClick={handleToggleFlame}
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer border ${
                  params.burnerActive
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                    : 'bg-amber-600 text-white border-amber-400 hover:bg-amber-500'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>{params.burnerActive ? '🔥 EXTINGUISH FLAME' : '⚡ IGNITE BURNER FLAME'}</span>
              </button>
            </div>
          )}

          {/* pH Indicator Sample Control Bar */}
          {currentExperiment.id === 'chem-ph-test' && (
            <div className="absolute top-3 right-4 z-20 flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md p-2 rounded-2xl shadow-xl">
              <span className="text-xs font-bold text-cyan-300">Select Test Sample:</span>
              <select
                value={params.selectedSolution || 'water'}
                onChange={(e) => handleSelectSampleSolution(e.target.value)}
                className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-600 cursor-pointer"
              >
                <option value="water">💧 Pure Water (pH 7.0 - Neutral)</option>
                <option value="lemon">🍋 Lemon Juice (pH 2.0 - Strong Acid)</option>
                <option value="coffee">☕ Black Coffee (pH 5.0 - Weak Acid)</option>
                <option value="soap">🧼 Soap Solution (pH 10.0 - Weak Base)</option>
                <option value="bleach">🧪 Bleach Titrant (pH 13.0 - Strong Base)</option>
              </select>
            </div>
          )}

          {/* Neutralization Endpoint Status Overlay */}
          {currentExperiment.id === 'chem-neutralization' && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
              <div className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-xl border backdrop-blur-md flex items-center space-x-3 ${
                (params.dispensedBaseVolume || 0) >= 24.5 && (params.dispensedBaseVolume || 0) <= 25.5
                  ? 'bg-emerald-500/95 text-white border-emerald-400 animate-bounce'
                  : (params.dispensedBaseVolume || 0) > 25.5
                  ? 'bg-rose-500/95 text-white border-rose-400'
                  : 'bg-indigo-950/90 text-cyan-300 border-indigo-500/50'
              }`}>
                <span>
                  {(params.dispensedBaseVolume || 0) >= 24.5 && (params.dispensedBaseVolume || 0) <= 25.5
                    ? `🌸 Neutralization Reached! Equivalence Vol = ${(params.dispensedBaseVolume || 0).toFixed(1)} mL | pH ≈ 7.00`
                    : (params.dispensedBaseVolume || 0) > 25.5
                    ? `⚠️ Over-titrated Base Solution! Vol = ${(params.dispensedBaseVolume || 0).toFixed(1)} mL | pH > 11.0`
                    : `💧 Titrating: ${(params.dispensedBaseVolume || 0).toFixed(1)} mL / 25.0 mL Target | pH ≈ ${(1.50 + ((params.dispensedBaseVolume || 0) / 25.0) * 1.8).toFixed(2)}`
                  }
                </span>
              </div>
            </div>
          )}

          {/* Heating Status Overlay */}
          {currentExperiment.id === 'chem-heating' && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
              <div className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-xl border backdrop-blur-md flex items-center space-x-3 ${
                (params.temperature || 22.5) >= 95
                  ? 'bg-emerald-500/95 text-white border-emerald-400 animate-bounce'
                  : isRunning && params.burnerActive
                  ? 'bg-amber-500/95 text-white border-amber-400'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700'
              }`}>
                <span>
                  {(params.temperature || 22.5) >= 95
                    ? `💨 Boiling Point Reached! Temp = 100.0°C | Vapor Phase`
                    : isRunning && params.burnerActive
                    ? `🌡️ Heating Water: ${(params.temperature || 22.5).toFixed(1)}°C / 100.0°C Target`
                    : `⏸ Standby: Click "Run Simulation" or "Ignite Flame" | Temp = ${(params.temperature || 22.5).toFixed(1)}°C`
                  }
                </span>
              </div>
            </div>
          )}

          {/* pH Test Status Overlay */}
          {currentExperiment.id === 'chem-ph-test' && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
              {(() => {
                const hasBeakerOnStage = addedComponents.some(c => c.type === 'beaker');
                const hasStripOnStage = addedComponents.some(c => c.type === 'phstrip');

                return (
                  <div className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-xl border backdrop-blur-md flex items-center space-x-3 ${
                    !hasBeakerOnStage
                      ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                      : !hasStripOnStage
                      ? 'bg-indigo-950/90 text-cyan-300 border-indigo-500/50'
                      : 'bg-slate-900/90 text-cyan-300 border-cyan-500/50'
                  }`}>
                    <span>
                      {!hasBeakerOnStage
                        ? `⚠️ No Solution Sample Container — Place a Glass Beaker from the left toolbox!`
                        : !hasStripOnStage
                        ? `🧪 Solution Sample Ready in Beaker (${(params.selectedSolution || 'Water').toUpperCase()}) — Add pH Indicator Strip to test!`
                        : `🎨 Sample: ${(params.selectedSolution || 'Pure Water').toUpperCase()} | Measured pH: pH ${(params.samplePH || 7.0).toFixed(1)}`
                      }
                    </span>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Live Measurement Readout Popup */}
          {measurementPopup && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 text-white border border-cyan-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-lg w-80">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
                <span className="text-xs font-extrabold text-cyan-300 flex items-center">
                  <Ruler className="w-4 h-4 mr-1.5 text-indigo-400" />
                  {measurementPopup.title}
                </span>
                <button
                  onClick={() => setMeasurementPopup(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {measurementPopup.rows.map((row, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50">
                    <span className="text-slate-300 font-semibold">{row.label}:</span>
                    <span className={`font-bold font-mono ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <RightPropertiesPanel
          experiment={currentExperiment}
          params={params}
          onParamChange={handleParamChange}
          objectives={objectives}
          completedObjectives={completedObjectives}
          totalObjectives={totalObjectives}
          addedComponents={addedComponents}
        />
      </div>

      <BottomConsole
        experimentId={currentExperiment.id}
        params={params}
        isRunning={isRunning}
        onToggleRun={handleToggleRun}
        onReset={handleReset}
      />
    </div>
  );
};
