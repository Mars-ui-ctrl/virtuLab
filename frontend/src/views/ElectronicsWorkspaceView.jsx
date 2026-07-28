import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLab } from '../context/LabContext';
import { Header } from '../components/common/Header';
import { LeftToolbox } from '../components/workspace/LeftToolbox';
import { RightPropertiesPanel } from '../components/workspace/RightPropertiesPanel';
import { BottomConsole } from '../components/workspace/BottomConsole';
import { ElectronicsCanvas } from '../components/3d/ElectronicsCanvas';
import { Ruler, X } from 'lucide-react';

/* ============================================================
   MEASURE TOOL — Telemetry Lookup for Electronics Components
   ============================================================ */
function getElectronicsMeasurement(comp, params) {
  const isConnected = params.arduinoConnected || false;

  switch (comp.type) {
    case 'arduino':
      return {
        title: '🤖 Arduino Uno R3 Telemetry',
        rows: [
          { label: 'Microcontroller', value: 'ATmega328P @ 16 MHz', color: 'text-cyan-400' },
          { label: 'Operating Voltage', value: '5.0 V DC', color: 'text-amber-400' },
          { label: 'Jumper Rails', value: isConnected ? 'CONNECTED TO BREADBOARD' : 'DISCONNECTED', color: isConnected ? 'text-emerald-400' : 'text-slate-400' },
          { label: 'Digital I/O Pins', value: '14 Pins (6 PWM output)', color: 'text-indigo-400' }
        ]
      };
    case 'breadboard':
      return {
        title: '🔌 Breadboard Telemetry',
        rows: [
          { label: 'Tie-Point Grid', value: '830 Solderless Points', color: 'text-amber-400' },
          { label: 'Power Rails Status', value: isConnected ? '+5V Red / GND Blue (LIVE)' : 'UNPOWERED', color: isConnected ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Terminal Strips', value: 'Dual 63-Row Distribution', color: 'text-slate-400' }
        ]
      };
    default:
      if (comp.type && comp.type.startsWith('led')) {
        return {
          title: `💡 ${comp.name} Telemetry`,
          rows: [
            { label: 'Forward Voltage', value: '2.1 V DC', color: 'text-amber-400' },
            { label: 'Operating Current', value: isConnected ? '18.5 mA' : '0.0 mA', color: isConnected ? 'text-cyan-400' : 'text-slate-400' },
            { label: 'Power Supply', value: isConnected ? 'Arduino Digital Pin / 5V Rail' : 'No Circuit Power', color: isConnected ? 'text-emerald-400' : 'text-slate-400' }
          ]
        };
      }
      return {
        title: `⚡ ${comp.name || comp.type || 'Electronics Component'} Telemetry`,
        rows: [
          { label: 'Type', value: comp.type || 'Electronic Module', color: 'text-amber-400' },
          { label: 'Position', value: comp.position ? `[${comp.position.join(', ')}]` : 'Workbench', color: 'text-cyan-400' }
        ]
      };
  }
}

export const ElectronicsWorkspaceView = () => {
  const { currentExperiment, showToast } = useLab();
  const [isRunning, setIsRunning] = useState(false);
  const [activeTool, setActiveTool] = useState('pointer');
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [measurementPopup, setMeasurementPopup] = useState(null);

  // Components placed on workbench (Clean stage)
  const [addedComponents, setAddedComponents] = useState([]);
  const [params, setParams] = useState(currentExperiment.defaultParams || {
    activeLight: 'red',
    temperature: 24,
    threshold: 30,
    currentCodeLine: 8,
    arduinoConnected: false,
    ledBlinking: true
  });

  // Helper to check if a component is placed on the Breadboard grid
  const isComponentOnBreadboard = useCallback((comp, breadboard) => {
    if (!comp || !breadboard || !comp.position || !breadboard.position) return false;
    const dx = Math.abs(comp.position[0] - breadboard.position[0]);
    const dz = Math.abs(comp.position[2] - breadboard.position[2]);
    return dx <= 1.8 && dz <= 1.1;
  }, []);

  // Reset when experiment changes
  useEffect(() => {
    setIsRunning(false);
    setActiveTool('pointer');
    setSelectedComponentId(null);
    setMeasurementPopup(null);
    setParams(currentExperiment.defaultParams || { activeLight: 'red', temperature: 24, threshold: 30, currentCodeLine: 8, arduinoConnected: false, ledBlinking: true });
    setAddedComponents([]);
  }, [currentExperiment.id, currentExperiment.defaultParams]);

  // 1Hz LED Blinking Timer Effect for elec-led-circuit
  useEffect(() => {
    let interval;
    if (isRunning && params.arduinoConnected && currentExperiment.id === 'elec-led-circuit') {
      interval = setInterval(() => {
        setParams(prev => ({ ...prev, ledBlinking: !prev.ledBlinking }));
      }, 500); // 500ms ON / 500ms OFF = 1Hz frequency!
    }
    return () => clearInterval(interval);
  }, [isRunning, params.arduinoConnected, currentExperiment.id]);

  // Traffic Light sequence loop effect
  useEffect(() => {
    let interval;
    if (isRunning && params.arduinoConnected && currentExperiment.id === 'elec-traffic-light') {
      const lights = ['red', 'yellow', 'green'];
      let idx = 0;
      interval = setInterval(() => {
        idx = (idx + 1) % lights.length;
        const active = lights[idx];
        const line = active === 'red' ? 8 : active === 'yellow' ? 14 : 20;
        setParams(prev => ({ ...prev, activeLight: active, currentCodeLine: line }));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isRunning, params.arduinoConnected, currentExperiment.id]);

  /* DYNAMIC OBJECTIVES & PROXIMITY BREADBOARD ERROR HANDLING */
  const objectives = useMemo(() => {
    const hasArduino = addedComponents.some(c => c.type === 'arduino');
    const breadboard = addedComponents.find(c => c.type === 'breadboard');
    const isConnected = params.arduinoConnected || false;

    const redLED = addedComponents.find(c => c.type === 'led' || c.type === 'led-red');
    const yellowLED = addedComponents.find(c => c.type === 'led-yellow');
    const greenLED = addedComponents.find(c => c.type === 'led-green');
    const resistor = addedComponents.find(c => c.type === 'resistor');
    const sensor = addedComponents.find(c => c.type === 'sensor');
    const motor = addedComponents.find(c => c.type === 'motor');

    const isRedOnBoard = redLED && isComponentOnBreadboard(redLED, breadboard);
    const isYellowOnBoard = yellowLED && isComponentOnBreadboard(yellowLED, breadboard);
    const isGreenOnBoard = greenLED && isComponentOnBreadboard(greenLED, breadboard);
    const isResistorOnBoard = resistor && isComponentOnBreadboard(resistor, breadboard);
    const isSensorOnBoard = sensor && isComponentOnBreadboard(sensor, breadboard);
    const isMotorOnBoard = motor && isComponentOnBreadboard(motor, breadboard);

    if (currentExperiment.id === 'elec-led-circuit') {
      return [
        { text: 'Place Arduino Uno R3 board on workbench', done: hasArduino },
        { text: 'Insert Breadboard and connect jumper wires to Arduino', done: Boolean(breadboard) && isConnected },
        { text: 'Place Red LED Diode and 220Ω Resistor on breadboard grid', done: isRedOnBoard && isResistorOnBoard },
        { text: 'Click "Run Simulation" to initiate 16MHz firmware clock', done: isRunning && isConnected && isRedOnBoard },
        { text: 'Verify LED blinks at 1Hz frequency (Digital Pin 13)', done: isRunning && isConnected && isRedOnBoard }
      ];
    }

    if (currentExperiment.id === 'elec-traffic-light') {
      return [
        { text: 'Set up Arduino Uno and Breadboard connected', done: hasArduino && Boolean(breadboard) && isConnected },
        { text: 'Place Red, Yellow, and Green LEDs on breadboard grid', done: isRedOnBoard && isYellowOnBoard && isGreenOnBoard },
        { text: 'Click "Run Simulation" to initiate firmware state machine', done: isRunning && isConnected && isRedOnBoard && isYellowOnBoard && isGreenOnBoard },
        { text: 'Observe Red (3s) → Yellow (1s) → Green (3s) light cycle', done: isRunning && isConnected && isRedOnBoard && isYellowOnBoard && isGreenOnBoard },
        { text: 'Track live firmware code execution line numbers', done: isRunning && isConnected && isRedOnBoard && isYellowOnBoard && isGreenOnBoard }
      ];
    }

    if (currentExperiment.id === 'elec-temp-fan') {
      return [
        { text: 'Set up Arduino Uno and Breadboard connected', done: hasArduino && Boolean(breadboard) && isConnected },
        { text: 'Insert TMP36 Temperature Sensor and DC Fan Motor on breadboard', done: isSensorOnBoard && isMotorOnBoard },
        { text: 'Click "Run Simulation" to activate sensor analog reading', done: isRunning && isConnected && isSensorOnBoard },
        { text: 'Adjust TMP36 Temperature slider in right panel above 30°C threshold', done: (params.temperature || 24) >= 30 },
        { text: 'Observe DC Fan Motor spinning automatically at 2400 RPM above 30°C', done: isRunning && isConnected && isSensorOnBoard && (params.temperature || 24) >= 30 }
      ];
    }

    return currentExperiment.objectives?.map(text => ({ text, done: false })) || [];
  }, [currentExperiment.id, currentExperiment.objectives, addedComponents, isRunning, params, isComponentOnBreadboard]);

  const completedObjectives = objectives.filter(o => o.done).length;
  const totalObjectives = objectives.length;

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleRun = () => {
    const nextRunning = !isRunning;

    if (nextRunning) {
      const hasArduino = addedComponents.some(c => c.type === 'arduino');
      const breadboard = addedComponents.find(c => c.type === 'breadboard');

      if (!hasArduino || !breadboard) {
        showToast("⚠️ Hardware Missing!", "Add Arduino Uno R3 and Breadboard from the left toolbox first.", "⚠️");
        return;
      }

      if (!params.arduinoConnected) {
        showToast("⚠️ Hardware Not Connected!", "Drag Breadboard next to Arduino Uno R3 to attach jumper wires.", "⚠️");
        return;
      }

      // Verify component is on the Breadboard
      const ledsOnBoard = addedComponents.some(c => c.type.startsWith('led') && isComponentOnBreadboard(c, breadboard));
      if (!ledsOnBoard && (currentExperiment.id === 'elec-led-circuit' || currentExperiment.id === 'elec-traffic-light')) {
        showToast("⚠️ LED Not on Breadboard!", "Use Move tool to drag LED onto the Breadboard grid.", "⚠️");
        return;
      }
    }

    setIsRunning(nextRunning);
    showToast(
      nextRunning ? "Arduino Simulation Active ⚡" : "Simulation Halted ⏸",
      nextRunning ? `Executing 16MHz microcontroller firmware loop...` : "Firmware halted."
    );
  };

  const handleReset = () => {
    setIsRunning(false);
    setSelectedComponentId(null);
    setMeasurementPopup(null);
    setParams(currentExperiment.defaultParams || { activeLight: 'red', temperature: 24, threshold: 30, currentCodeLine: 8, arduinoConnected: false, ledBlinking: true });
    setAddedComponents([]);
    showToast("Breadboard Cleared 🔄", "Arduino memory reset.");
  };

  /* SPAWN ON SAME TABLETOP AXIS (Y = 0.6, Z = 0) */
  const handleAddComponent = (item) => {
    const count = addedComponents.length;
    const posX = (count - 1) * 1.6;
    const pos = [posX, 0.6, 0];

    const newComp = {
      ...item,
      id: `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      position: pos,
      rotation: [0, 0, 0]
    };
    setAddedComponents(prev => [...prev, newComp]);
    setSelectedComponentId(newComp.id);
    showToast("Component Placed 🔌", `${item.name} placed on breadboard workbench!`);
  };

  /* 3D DRAG MOVE & PROXIMITY MAGNETIC CONNECTION HANDLER */
  const handleMoveComponent = useCallback((id, newPos) => {
    setAddedComponents(prev => {
      const moved = prev.find(c => c.id === id);
      if (!moved) return prev;

      const arduino = prev.find(c => c.type === 'arduino');
      const breadboard = prev.find(c => c.type === 'breadboard');

      let isConnected = false;
      let targetPos = [...newPos];

      if (arduino && breadboard) {
        const aPos = moved.id === arduino.id ? newPos : (arduino.position || [-1.0, 0.6, 0]);
        const bPos = moved.id === breadboard.id ? newPos : (breadboard.position || [1.0, 0.6, 0]);

        const dist = Math.sqrt((aPos[0] - bPos[0]) ** 2 + (aPos[2] - bPos[2]) ** 2);

        if (dist <= 2.2) {
          isConnected = true;
          // Magnetically snap side-by-side!
          if (moved.type === 'breadboard') {
            targetPos = [aPos[0] + 2.2, 0.6, aPos[2]];
          } else if (moved.type === 'arduino') {
            targetPos = [bPos[0] - 2.2, 0.6, bPos[2]];
          }
        }
      }

      setParams(p => ({ ...p, arduinoConnected: isConnected }));

      return prev.map(c => {
        if (c.id === id) return { ...c, position: targetPos };
        if (isConnected && arduino && breadboard) {
          if (c.type === 'breadboard' && moved.type === 'arduino') return { ...c, position: [targetPos[0] + 2.2, 0.6, targetPos[2]] };
          if (c.type === 'arduino' && moved.type === 'breadboard') return { ...c, position: [targetPos[0] - 2.2, 0.6, targetPos[2]] };
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
      showToast("Component Removed 🗑", "Deleted from breadboard workbench.");
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
      setMeasurementPopup(getElectronicsMeasurement(comp, params));
    } else {
      setSelectedComponentId(id);
    }
  }, [activeTool, addedComponents, handleRotateComponent, params, showToast]);

  const handleDeleteSelected = () => {
    if (selectedComponentId) {
      setAddedComponents(prev => prev.filter(c => c.id !== selectedComponentId));
      setSelectedComponentId(null);
      showToast("Deleted 🗑", "Removed from breadboard workbench.");
    }
  };

  const pseudoCode = [
    { line: 1, text: "// VirtuLab Arduino Uno Traffic Light Controller" },
    { line: 2, text: "const int RED_PIN = 12;" },
    { line: 3, text: "const int YELLOW_PIN = 11;" },
    { line: 4, text: "const int GREEN_PIN = 10;" },
    { line: 5, text: "void setup() { pinMode(RED_PIN, OUTPUT); }" },
    { line: 6, text: "void loop() {" },
    { line: 7, text: "  // Red Signal Phase" },
    { line: 8, text: "  digitalWrite(RED_PIN, HIGH);" },
    { line: 9, text: "  digitalWrite(GREEN_PIN, LOW);" },
    { line: 10, text: "  delay(3000);" },
    { line: 11, text: "  // Yellow Signal Phase" },
    { line: 12, text: "  digitalWrite(RED_PIN, LOW);" },
    { line: 13, text: "  digitalWrite(YELLOW_PIN, HIGH);" },
    { line: 14, text: "  delay(1000);" },
    { line: 15, text: "  // Green Signal Phase" },
    { line: 16, text: "  digitalWrite(YELLOW_PIN, LOW);" },
    { line: 17, text: "  digitalWrite(GREEN_PIN, HIGH);" },
    { line: 18, text: "  delay(3000);" },
    { line: 19, text: "}" }
  ];

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden select-none">
      <Header
        onRunSimulation={handleToggleRun}
        onResetSimulation={handleReset}
        isRunning={isRunning}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <LeftToolbox
          subject="electronics"
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onAddComponent={handleAddComponent}
          addedComponents={addedComponents}
          selectedComponentId={selectedComponentId}
          onDeleteSelected={handleDeleteSelected}
        />

        <div className="flex-1 h-full relative flex flex-col">
          <div className="flex-1 relative">
            <ElectronicsCanvas
              experimentId={currentExperiment.id}
              params={params}
              addedComponents={addedComponents}
              onSelectComponent={handleSelectComponent}
              selectedComponentId={selectedComponentId}
              activeTool={activeTool}
              onMoveComponent={handleMoveComponent}
              isRunning={isRunning}
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
                  {activeTool === 'delete' && '🗑 DELETE — Click any component to remove it'}
                  {activeTool === 'move' && '✋ MOVE — Drag components smoothly across 3D stage'}
                  {activeTool === 'rotate' && '🔄 ROTATE — Click component to spin 45°'}
                  {activeTool === 'measure' && '📏 MEASURE — Click any module for telemetry'}
                  {activeTool === 'duplicate' && '📋 DUPLICATE — Click any component to clone'}
                </div>
              </div>
            )}

            {/* Hardware Status Overlay Banner */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
              <div className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-xl border backdrop-blur-md flex items-center space-x-3 ${
                !params.arduinoConnected
                  ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                  : isRunning
                  ? 'bg-emerald-500/95 text-white border-emerald-400 animate-bounce'
                  : 'bg-slate-900/90 text-cyan-300 border-indigo-500/50'
              }`}>
                <span>
                  {!params.arduinoConnected
                    ? '⚠️ Hardware Not Connected — Drag Breadboard next to Arduino Uno to attach jumper wires!'
                    : isRunning
                    ? '⚡ Microcontroller Active — Executing 16MHz Firmware Loop!'
                    : '⏸ Standby State — Click "Run Simulation" to start firmware clock'
                  }
                </span>
              </div>
            </div>

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

          {currentExperiment.id === 'elec-traffic-light' && (
            <div className="h-36 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-3 overflow-y-auto font-mono text-[11px] text-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                  Arduino IDE Code Execution (C++)
                </span>
                <span className="text-emerald-400 text-[10px] font-bold">
                  ● Status: {isRunning && params.arduinoConnected ? 'Running (16MHz Clock)' : 'Idle'}
                </span>
              </div>
              <div className="space-y-0.5">
                {pseudoCode.map(item => (
                  <div
                    key={item.line}
                    className={`px-2 py-0.5 rounded flex items-center space-x-3 transition-colors ${
                      params.currentCodeLine === item.line && isRunning && params.arduinoConnected
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="w-6 text-slate-500 text-right select-none">{item.line}</span>
                    <span>{item.text}</span>
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
