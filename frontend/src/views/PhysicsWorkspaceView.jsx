import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLab } from '../context/LabContext';
import { Header } from '../components/common/Header';
import { LeftToolbox } from '../components/workspace/LeftToolbox';
import { RightPropertiesPanel } from '../components/workspace/RightPropertiesPanel';
import { BottomConsole } from '../components/workspace/BottomConsole';
import { PhysicsCanvas } from '../components/3d/PhysicsCanvas';

const SNAP_RADIUS = 1.2;

/* ============================================================
   TERMINAL SNAP TARGETS GENERATOR
   ============================================================ */
function getTerminalSnapTargets(components) {
  const targets = [];
  components.forEach(c => {
    const pos = c.position || [0, 0.45, 0];
    if (c.type === 'battery') {
      targets.push({ id: c.id, name: 'Battery (+)', pos: [pos[0] + 0.45, 0.45, pos[2]], compType: 'battery' });
      targets.push({ id: c.id, name: 'Battery (-)', pos: [pos[0] - 0.45, 0.45, pos[2]], compType: 'battery' });
    } else if (c.type === 'switch') {
      targets.push({ id: c.id, name: 'Switch (L)', pos: [pos[0] - 0.4, 0.45, pos[2]], compType: 'switch' });
      targets.push({ id: c.id, name: 'Switch (R)', pos: [pos[0] + 0.4, 0.45, pos[2]], compType: 'switch' });
    } else if (c.type === 'bulb') {
      targets.push({ id: c.id, name: 'Bulb (L)', pos: [pos[0] - 0.3, 0.45, pos[2]], compType: 'bulb' });
      targets.push({ id: c.id, name: 'Bulb (R)', pos: [pos[0] + 0.3, 0.45, pos[2]], compType: 'bulb' });
    } else if (c.type === 'resistor') {
      targets.push({ id: c.id, name: 'Resistor (L)', pos: [pos[0] - 0.5, 0.45, pos[2]], compType: 'resistor' });
      targets.push({ id: c.id, name: 'Resistor (R)', pos: [pos[0] + 0.5, 0.45, pos[2]], compType: 'resistor' });
    }
  });
  return targets;
}

/* ============================================================
   STRICT SNAP-BASED CIRCUIT CONNECTIVITY EVALUATION
   ============================================================ */
function checkCircuitConnectivity(components) {
  const battery = components.find(c => c.type === 'battery');
  const switchComp = components.find(c => c.type === 'switch');
  const bulb = components.find(c => c.type === 'bulb') || components.find(c => c.type === 'resistor');
  const wires = components.filter(c => c.type === 'wire');

  const status = {
    hasBattery: !!battery,
    hasSwitch: !!switchComp,
    hasBulb: !!bulb,
    hasWire: wires.length >= 1,
    wiresConnected: false,
    isConnected: false,
    missingParts: []
  };

  if (!battery) status.missingParts.push('Battery');
  if (!switchComp) status.missingParts.push('Switch');
  if (!bulb) status.missingParts.push('Bulb or Resistor');
  if (wires.length < 1) status.missingParts.push('Copper Wire');

  if (!battery || !switchComp || !bulb || wires.length < 1) {
    return status;
  }

  const dist3D = (p1, p2) => {
    const dx = (p1[0] || 0) - (p2[0] || 0);
    const dz = (p1[2] || 0) - (p2[2] || 0);
    return Math.sqrt(dx * dx + dz * dz);
  };

  const targets = getTerminalSnapTargets(components);

  const terminalKey = (target) => `${target.compType}:${target.name}`;
  const snapInfoToTerminalKey = (snapInfo) => {
    switch (snapInfo) {
      case 'Battery (+)':
      case 'Connected: Battery (+)':
        return 'battery:Battery (+)';
      case 'Battery (-)':
      case 'Connected: Battery (-)':
        return 'battery:Battery (-)';
      case 'Switch (L)':
      case 'Connected: Switch (L)':
        return 'switch:Switch (L)';
      case 'Switch (R)':
      case 'Connected: Switch (R)':
        return 'switch:Switch (R)';
      case 'Bulb (L)':
      case 'Connected: Bulb (L)':
        return 'bulb:Bulb (L)';
      case 'Bulb (R)':
      case 'Connected: Bulb (R)':
        return 'bulb:Bulb (R)';
      case 'Resistor (L)':
      case 'Connected: Resistor (L)':
        return 'resistor:Resistor (L)';
      case 'Resistor (R)':
      case 'Connected: Resistor (R)':
        return 'resistor:Resistor (R)';
      default:
        return null;
    }
  };
  const terminalLookup = new Map(targets.map(target => [terminalKey(target), target]));
  const terminalNodes = targets.map(terminalKey);
  const graph = new Map(terminalNodes.map(node => [node, new Set()]));

  const closestTerminal = (position) => {
    let bestTarget = null;
    let bestDistance = SNAP_RADIUS;
    for (const target of targets) {
      const distance = dist3D(position, target.pos);
      if (distance <= bestDistance) {
        bestDistance = distance;
        bestTarget = target;
      }
    }
    return bestTarget;
  };

  wires.forEach(wire => {
    const startTarget = terminalLookup.get(snapInfoToTerminalKey(wire.startSnapInfo)) || closestTerminal(wire.startPos || [0, 0, 0]);
    const endTarget = terminalLookup.get(snapInfoToTerminalKey(wire.endSnapInfo)) || closestTerminal(wire.endPos || [0, 0, 0]);
    if (startTarget && endTarget && terminalKey(startTarget) !== terminalKey(endTarget)) {
      graph.get(terminalKey(startTarget))?.add(terminalKey(endTarget));
      graph.get(terminalKey(endTarget))?.add(terminalKey(startTarget));
    }
  });

  const hasLoopPath = (startNode, goalNode) => {
    const visited = new Set();
    const queue = [startNode];

    while (queue.length > 0) {
      const node = queue.shift();
      if (node === goalNode) return true;
      if (visited.has(node)) continue;
      visited.add(node);

      for (const nextNode of graph.get(node) || []) {
        if (!visited.has(nextNode)) queue.push(nextNode);
      }
    }

    return false;
  };

  const batteryPlus = terminalLookup.get('battery:Battery (+)');
  const batteryMinus = terminalLookup.get('battery:Battery (-)');
  const switchLeft = terminalLookup.get('switch:Switch (L)');
  const switchRight = terminalLookup.get('switch:Switch (R)');
  const bulbLeft = terminalLookup.get('bulb:Bulb (L)') || terminalLookup.get('resistor:Resistor (L)');
  const bulbRight = terminalLookup.get('bulb:Bulb (R)') || terminalLookup.get('resistor:Resistor (R)');

  const terminalHasConnection = (node) => {
    if (!node) return false;
    return (graph.get(terminalKey(node)) || new Set()).size > 0;
  };

  // Simplified: just check that components have at least one connection each
  const batteryConnected = terminalHasConnection(batteryPlus) || terminalHasConnection(batteryMinus);
  const switchConnected = terminalHasConnection(switchLeft) || terminalHasConnection(switchRight);
  const bulbConnected = terminalHasConnection(bulbLeft) || terminalHasConnection(bulbRight);

  // Check if there's any path connecting battery to switch to bulb (complete circuit)
  const batteryTerminals = [batteryPlus, batteryMinus].filter(Boolean).map(terminalKey);
  const switchTerminals = [switchLeft, switchRight].filter(Boolean).map(terminalKey);
  const bulbTerminals = [bulbLeft, bulbRight].filter(Boolean).map(terminalKey);

  let closedLoop = false;
  if (batteryTerminals.length > 0 && switchTerminals.length > 0 && bulbTerminals.length > 0) {
    // Check if any battery terminal connects to any switch terminal
    const batteryToSwitch = batteryTerminals.some(bt =>
      switchTerminals.some(st => hasLoopPath(bt, st))
    );
    // Check if any switch terminal connects to any bulb terminal
    const switchToBulb = switchTerminals.some(st =>
      bulbTerminals.some(blt => hasLoopPath(st, blt))
    );
    // Check if any bulb terminal connects back to any battery terminal
    const bulbToBattery = bulbTerminals.some(blt =>
      batteryTerminals.some(bt => hasLoopPath(blt, bt))
    );
    closedLoop = batteryToSwitch && switchToBulb && bulbToBattery;
  }

  status.wiresConnected = batteryConnected && switchConnected && bulbConnected && closedLoop;
  status.isConnected = status.wiresConnected;

  if (!status.wiresConnected) {
    if (!batteryConnected) {
      status.missingParts.push('Wire needed on Battery terminal');
    } else if (!switchConnected) {
      status.missingParts.push('Wire needed on Switch terminal');
    } else if (!bulbConnected) {
      status.missingParts.push('Wire needed on Bulb terminal');
    } else if (!closedLoop) {
      status.missingParts.push('Complete circuit loop needed');
    }
  }

  return status;
}

/* ============================================================
   MEASURE TOOL — Property lookup
   ============================================================ */
function getMeasurement(comp, params, circuitEnergized) {
  const V = params.voltage || 12;
  const R = params.resistance || 10;
  const I = V / R;

  switch (comp.type) {
    case 'battery':
      return {
        title: '⚡ Battery Measurement',
        rows: [
          { label: 'EMF', value: `${V} V`, color: 'text-indigo-400' },
          { label: 'Terminal Voltage', value: circuitEnergized ? `${(V - I * 0.5).toFixed(1)} V` : `${V} V`, color: 'text-cyan-400' },
          { label: 'Internal Resistance', value: '0.5 Ω', color: 'text-slate-400' },
          { label: 'Status', value: circuitEnergized ? 'Supplying Current' : 'Open Circuit', color: circuitEnergized ? 'text-emerald-400' : 'text-amber-400' }
        ]
      };
    case 'bulb':
      return {
        title: '💡 Bulb Measurement',
        rows: [
          { label: 'Voltage Across', value: circuitEnergized ? `${V.toFixed(1)} V` : '0.0 V', color: 'text-indigo-400' },
          { label: 'Current Through', value: circuitEnergized ? `${I.toFixed(2)} A` : '0.00 A', color: 'text-cyan-400' },
          { label: 'Power Dissipated', value: circuitEnergized ? `${(V * I).toFixed(1)} W` : '0.0 W', color: 'text-amber-400' },
          { label: 'Status', value: circuitEnergized ? 'Glowing' : 'OFF', color: circuitEnergized ? 'text-emerald-400' : 'text-slate-400' }
        ]
      };
    case 'switch':
      return {
        title: '🔘 Switch Measurement',
        rows: [
          { label: 'State', value: comp._switchOpen ? 'OPEN (OFF)' : 'CLOSED (ON)', color: comp._switchOpen ? 'text-rose-400' : 'text-emerald-400' },
          { label: 'Resistance', value: comp._switchOpen ? '∞ (Infinite)' : '≈ 0 Ω', color: 'text-indigo-400' },
          { label: 'Voltage Drop', value: comp._switchOpen ? `${V} V` : '0.0 V', color: 'text-cyan-400' }
        ]
      };
    case 'resistor':
      return {
        title: '🟡 Resistor Measurement',
        rows: [
          { label: 'Resistance', value: `${R} Ω`, color: 'text-amber-400' },
          { label: 'Voltage Drop', value: circuitEnergized ? `${(I * R).toFixed(1)} V` : '0.0 V', color: 'text-indigo-400' },
          { label: 'Current Through', value: circuitEnergized ? `${I.toFixed(2)} A` : '0.00 A', color: 'text-cyan-400' },
          { label: 'Power (I²R)', value: circuitEnergized ? `${(I * I * R).toFixed(1)} W` : '0.0 W', color: 'text-rose-400' }
        ]
      };
    case 'wire':
      return {
        title: '──── Copper Jumper Wire',
        rows: [
          { label: 'Type', value: 'Interactive Flexible Cable', color: 'text-amber-400' },
          { label: 'Resistance', value: '≈ 0 Ω (ideal)', color: 'text-slate-400' },
          { label: 'Current Flow', value: circuitEnergized ? `${I.toFixed(2)} A` : '0.00 A', color: 'text-cyan-400' }
        ]
      };
    default:
      return { title: '📏 Measurement', rows: [{ label: 'Type', value: comp.type, color: 'text-slate-400' }] };
  }
}

export const PhysicsWorkspaceView = () => {
  const { currentExperiment, showToast } = useLab();
  const [isRunning, setIsRunning] = useState(false);
  const [activeTool, setActiveTool] = useState('pointer');
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [switchOpen, setSwitchOpen] = useState(true);
  const [voltageWasAdjusted, setVoltageWasAdjusted] = useState(false);
  const [measurementPopup, setMeasurementPopup] = useState(null);

  /* START EMPTY — Students build circuit from scratch */
  const [addedComponents, setAddedComponents] = useState([]);

  const [params, setParams] = useState(currentExperiment.defaultParams || {
    voltage: 12,
    resistance: 10,
    length: 2.5,
    mass: 1.5,
    gravity: 9.81,
    angle: 45,
    velocity: 25
  });

  // Reset when experiment changes
  useEffect(() => {
    setAddedComponents([]);
    setSwitchOpen(true);
    setIsRunning(false);
    setSelectedComponentId(null);
    setVoltageWasAdjusted(false);
    setMeasurementPopup(null);
    setParams(currentExperiment.defaultParams || {});
  }, [currentExperiment.defaultParams]);

  /* STRICT SNAP-BASED CIRCUIT EVALUATION */
  const circuitStatus = useMemo(() =>
    checkCircuitConnectivity(addedComponents),
    [addedComponents]
  );

  const circuitEnergized = currentExperiment.id === 'phys-circuit'
    && isRunning
    && !switchOpen
    && circuitStatus.isConnected;

  /* DYNAMIC OBJECTIVES */
  const objectives = useMemo(() => {
    if (currentExperiment.id === 'phys-circuit') {
      return [
        { text: 'Place a Battery onto the workspace', done: circuitStatus.hasBattery },
        { text: 'Place a Toggle Switch', done: circuitStatus.hasSwitch },
        { text: 'Place an Incandescent Bulb', done: circuitStatus.hasBulb },
        { text: 'Place & Snap Copper Wires onto terminals', done: circuitStatus.wiresConnected },
        { text: 'Close the Switch (toggle to ON)', done: !switchOpen && circuitStatus.hasSwitch },
        { text: 'Click "Run Simulation" to energize circuit', done: isRunning && circuitStatus.isConnected },
        { text: 'Adjust Voltage slider and observe Bulb brightness change', done: voltageWasAdjusted },
        { text: 'Verify I = V/R using Ammeter readings (add Ammeter)', done: addedComponents.some(c => c.type === 'ammeter') },
      ];
    }
    if (currentExperiment.id === 'phys-pendulum') {
      return [
        { text: 'Click "Run Simulation" to start pendulum swing', done: isRunning },
        { text: 'Adjust Pendulum Length (L) slider', done: (params.length || 2.5) !== 2.5 },
        { text: 'Change Bob Mass (m) to observe it does NOT affect period', done: (params.mass || 1.5) !== 1.5 },
        { text: 'Select a different planet gravity (Moon, Mars, Jupiter)', done: (params.gravity || 9.81) !== 9.81 },
        { text: 'Observe: T = 2π√(L/g) — longer L = slower swing', done: isRunning && (params.length || 2.5) !== 2.5 },
      ];
    }
    if (currentExperiment.id === 'phys-projectile') {
      return [
        { text: 'Click "Run Simulation" to fire the projectile', done: isRunning },
        { text: 'Adjust Launch Angle (θ) slider', done: (params.angle || 45) !== 45 },
        { text: 'Adjust Initial Velocity (v₀) slider', done: (params.velocity || 25) !== 25 },
        { text: 'Find the angle that gives maximum horizontal range', done: (params.angle || 45) === 45 && isRunning },
        { text: 'Observe: Range = v²sin(2θ)/g — 45° gives max range', done: isRunning },
      ];
    }
    return currentExperiment.objectives?.map(text => ({ text, done: false })) || [];
  }, [currentExperiment.id, currentExperiment.objectives, circuitStatus, switchOpen, isRunning, voltageWasAdjusted, addedComponents, params]);

  const completedObjectives = objectives.filter(o => o.done).length;
  const totalObjectives = objectives.length;

  /* HANDLERS */
  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
    if (key === 'voltage') setVoltageWasAdjusted(true);
  };

  const handleToggleRun = () => {
    const nextRunning = !isRunning;

    if (nextRunning && currentExperiment.id === 'phys-circuit') {
      if (!circuitStatus.hasBattery || !circuitStatus.hasSwitch || !circuitStatus.hasBulb) {
        showToast("⚠️ Circuit Incomplete!", `Missing: ${circuitStatus.missingParts.join(', ')}. Add components from left toolbox.`, '⚠️');
        return;
      }
      if (!circuitStatus.wiresConnected) {
        showToast("⚠️ Wires Not Connected!", "Use Move tool to drag wire end pins (Pin A / Pin B) onto component terminals.", '⚠️');
        return;
      }
      if (switchOpen) {
        showToast("⚠️ Switch is Open!", "Click the switch to CLOSE it (turn ON) to complete the circuit loop.", '⚠️');
        return;
      }
    }

    setIsRunning(nextRunning);
    showToast(
      nextRunning ? "Simulation Energized ▶" : "Simulation Halted ⏸",
      nextRunning
        ? (currentExperiment.id === 'phys-circuit'
          ? `Circuit ON — I = ${((params.voltage || 12) / (params.resistance || 10)).toFixed(2)}A`
          : "Animation active")
        : "Standby state"
    );
  };

  const handleReset = () => {
    setIsRunning(false);
    setSwitchOpen(true);
    setSelectedComponentId(null);
    setVoltageWasAdjusted(false);
    setMeasurementPopup(null);
    setParams(currentExperiment.defaultParams || {});
    setAddedComponents([]);
    showToast("Workspace Reset 🔄", "Empty workspace — add components from the left toolbox.");
  };

  const handleAddComponent = (item) => {
    const existingCount = addedComponents.length;
    const pos = [existingCount * 1.5 - 2.0, 0.45, 0];

    const newComp = {
      ...item,
      id: `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      position: [pos[0], 0.45, 0],
      rotation: [0, 0, 0],
      // If adding wire, give it two initial endpoints:
      ...(item.type === 'wire' ? {
        startPos: [pos[0] - 0.8, 0.45, 0],
        endPos: [pos[0] + 0.8, 0.45, 0]
      } : {})
    };

    setAddedComponents(prev => [...prev, newComp]);
    setSelectedComponentId(newComp.id);

    if (currentExperiment.id === 'phys-circuit') {
      const tips = {
        battery: "Battery placed! Now add a Toggle Switch and Bulb.",
        switch: "Switch added! Now place an Incandescent Bulb.",
        bulb: "Bulb placed! Add Copper Wires and drag their end pins to connect.",
        wire: "Copper Wire added! Use Pin A / Pin B for terminals and the green center handle to move the whole wire.",
        resistor: "Resistor placed. It limits current (I = V/R).",
        ammeter: "Ammeter placed! It measures current in Amperes.",
        voltmeter: "Voltmeter placed! It measures voltage across components.",
      };
      showToast("Component Placed ⚡", tips[item.type] || `${item.name} added to stage!`);
    } else {
      showToast("Component Added ⚡", `${item.name} placed onto 3D workspace stage!`);
    }
  };

  /* MOVE WIRE PIN & TERMINAL SNAPPING HANDLER */
  const handleMoveWirePin = useCallback((wireId, pinKey, newPos) => {
    setAddedComponents(prev => {
      const addVec3 = (a, b) => [
        (a?.[0] || 0) + (b?.[0] || 0),
        (a?.[1] || 0) + (b?.[1] || 0),
        (a?.[2] || 0) + (b?.[2] || 0)
      ];

      const wire = prev.find(c => c.id === wireId);
      if (!wire) return prev;

      const currentStart = wire.startPos || [0, 0.45, 0];
      const currentEnd = wire.endPos || [0, 0.45, 0];
      const targets = getTerminalSnapTargets(prev);
      const dist3D = (p1, p2) => Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[2] - p2[2]) ** 2);

      if (pinKey === 'center') {
        const currentMid = [
          (currentStart[0] + currentEnd[0]) / 2,
          (currentStart[1] + currentEnd[1]) / 2,
          (currentStart[2] + currentEnd[2]) / 2
        ];
        const delta = [
          (newPos?.[0] || 0) - currentMid[0],
          (newPos?.[1] || 0) - currentMid[1],
          (newPos?.[2] || 0) - currentMid[2]
        ];

        return prev.map(c => {
          if (c.id !== wireId) return c;
          const updated = {
            ...c,
            startPos: addVec3(currentStart, delta),
            endPos: addVec3(currentEnd, delta)
          };
          delete updated.startSnapInfo;
          delete updated.endSnapInfo;
          delete updated.snappedInfo;
          return updated;
        });
      }

      // Check if newPos is close to any snap target
      let finalPos = [...newPos];
      let snappedTargetName = null;

      for (const t of targets) {
        if (dist3D(newPos, t.pos) <= SNAP_RADIUS) {
          finalPos = [...t.pos]; // Snap exact coordinate!
          snappedTargetName = t.name;
          break;
        }
      }

      return prev.map(c => {
        if (c.id !== wireId) return c;
        const updated = { ...c };
        if (pinKey === 'start') {
          updated.startPos = finalPos;
          if (snappedTargetName) updated.startSnapInfo = snappedTargetName;
          else delete updated.startSnapInfo;
        }
        if (pinKey === 'end') {
          updated.endPos = finalPos;
          if (snappedTargetName) updated.endSnapInfo = snappedTargetName;
          else delete updated.endSnapInfo;
        }
        if (snappedTargetName) updated.snappedInfo = `${pinKey === 'start' ? 'Pin A' : 'Pin B'}: ${snappedTargetName}`;
        else delete updated.snappedInfo;
        return updated;
      });
    });
  }, []);

  const handleSelectComponent = useCallback((id) => {
    if (activeTool === 'delete') {
      setAddedComponents(prev => prev.filter(c => c.id !== id));
      setSelectedComponentId(null);
      showToast("Component Removed 🗑", "Deleted from 3D stage.");
    } else if (activeTool === 'duplicate') {
      const target = addedComponents.find(c => c.id === id);
      if (target) {
        const clone = {
          ...target,
          id: `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          position: [
            (target.position?.[0] || 0) + 1.2,
            0.45,
            (target.position?.[2] || 0) + 0.5
          ],
          ...(target.type === 'wire' ? {
            startPos: [(target.startPos?.[0] || 0) + 1.2, 0.45, (target.startPos?.[2] || 0) + 0.5],
            endPos: [(target.endPos?.[0] || 0) + 1.2, 0.45, (target.endPos?.[2] || 0) + 0.5]
          } : {})
        };
        setAddedComponents(prev => [...prev, clone]);
        setSelectedComponentId(clone.id);
        showToast("Duplicated 📋", `Cloned ${target.name}`);
      }
    } else if (activeTool === 'measure') {
      const target = addedComponents.find(c => c.id === id);
      if (target) {
        const enriched = { ...target, _switchOpen: switchOpen };
        const measurement = getMeasurement(enriched, params, circuitEnergized);
        setMeasurementPopup(measurement);
        setSelectedComponentId(id);
        setTimeout(() => setMeasurementPopup(null), 6000);
      }
    } else {
      setSelectedComponentId(id);
      setMeasurementPopup(null);
    }
  }, [activeTool, addedComponents, showToast, switchOpen, params, circuitEnergized]);

  const handleMoveComponent = useCallback((id, newPos) => {
    setAddedComponents(prev => {
      const nextComponents = prev.map(c =>
        c.id === id ? { ...c, position: newPos } : c
      );
      const targets = getTerminalSnapTargets(nextComponents);
      const targetByName = new Map(targets.map(t => [t.name, t.pos]));

      return nextComponents.map(c => {
        if (c.type !== 'wire') return c;
        const updated = { ...c };
        if (c.startSnapInfo && targetByName.has(c.startSnapInfo)) {
          updated.startPos = [...targetByName.get(c.startSnapInfo)];
        }
        if (c.endSnapInfo && targetByName.has(c.endSnapInfo)) {
          updated.endPos = [...targetByName.get(c.endSnapInfo)];
        }
        return updated;
      });
    });
  }, []);

  const handleRotateComponent = useCallback((id) => {
    setAddedComponents(prev => prev.map(c => {
      if (c.id !== id) return c;
      const currentY = c.rotation?.[1] || 0;
      return { ...c, rotation: [0, currentY + Math.PI / 4, 0] };
    }));
    showToast("Rotated 🔄", "Component rotated 45°");
  }, [showToast]);

  const handleDeleteSelected = () => {
    if (selectedComponentId) {
      setAddedComponents(prev => prev.filter(c => c.id !== selectedComponentId));
      setSelectedComponentId(null);
      showToast("Deleted 🗑", "Removed from 3D stage.");
    }
  };

  const handleToggleSwitch = useCallback(() => {
    setSwitchOpen(prev => {
      const next = !prev;
      if (next && isRunning) {
        showToast("Circuit Broken! 🔴", "Switch opened — current flow stopped.");
      } else if (!next) {
        showToast("Switch Closed! 🟢", "Circuit loop completed.");
      }
      return next;
    });
  }, [isRunning, showToast]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden select-none">
      <Header
        onRunSimulation={handleToggleRun}
        onResetSimulation={handleReset}
        isRunning={isRunning}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <LeftToolbox
          subject="physics"
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onAddComponent={handleAddComponent}
          addedComponents={addedComponents}
          selectedComponentId={selectedComponentId}
          onDeleteSelected={handleDeleteSelected}
        />

        <div className="flex-1 h-full relative">
          <PhysicsCanvas
            experimentId={currentExperiment.id}
            params={params}
            addedComponents={addedComponents}
            isRunning={isRunning}
            activeTool={activeTool}
            onSelectComponent={handleSelectComponent}
            selectedComponentId={selectedComponentId}
            onMoveComponent={handleMoveComponent}
            onRotateComponent={handleRotateComponent}
            onMoveWirePin={handleMoveWirePin}
            switchOpen={switchOpen}
            onToggleSwitch={handleToggleSwitch}
          />

          {/* Active tool mode indicator */}
          {activeTool !== 'pointer' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
              <div className={`px-4 py-2 rounded-2xl text-xs font-extrabold shadow-lg border backdrop-blur-md ${
                activeTool === 'delete' ? 'bg-rose-500/90 text-white border-rose-400' :
                activeTool === 'move' ? 'bg-cyan-500/90 text-white border-cyan-400' :
                activeTool === 'rotate' ? 'bg-amber-500/90 text-white border-amber-400' :
                activeTool === 'duplicate' ? 'bg-indigo-500/90 text-white border-indigo-400' :
                activeTool === 'measure' ? 'bg-emerald-500/90 text-white border-emerald-400' :
                'bg-slate-800/90 text-white border-slate-600'
              }`}>
                {activeTool === 'delete' && '🗑 DELETE — Click any component to remove it'}
                {activeTool === 'move' && '✋ MOVE — Drag components or Wire Pins (Pin A & Pin B) to connect'}
                {activeTool === 'rotate' && '🔄 ROTATE — Click any component to rotate 45°'}
                {activeTool === 'duplicate' && '📋 DUPLICATE — Click any component to clone it'}
                {activeTool === 'measure' && '📏 MEASURE — Click any component to inspect its values'}
              </div>
            </div>
          )}

          {/* Circuit Status Overlay */}
          {currentExperiment.id === 'phys-circuit' && addedComponents.length > 0 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
              <div className={`px-4 py-2 rounded-2xl text-xs font-bold shadow-lg border backdrop-blur-md ${
                circuitEnergized
                  ? 'bg-emerald-500/90 text-white border-emerald-400'
                  : circuitStatus.isConnected && !switchOpen
                    ? 'bg-amber-500/90 text-white border-amber-400'
                    : 'bg-rose-500/90 text-white border-rose-400'
              }`}>
                {circuitEnergized
                  ? `✅ Circuit Energized — I = ${((params.voltage || 12) / (params.resistance || 10)).toFixed(2)}A`
                  : circuitStatus.isConnected && !switchOpen
                    ? '⏸ Circuit Complete — Click "Run Simulation" to energize'
                    : `❌ Circuit Incomplete — ${circuitStatus.missingParts.join(', ')}`
                }
              </div>
            </div>
          )}

          {/* Empty workspace guide */}
          {addedComponents.length === 0 && currentExperiment.id === 'phys-circuit' && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 rounded-3xl p-8 max-w-md text-center space-y-4">
                <div className="text-4xl">🔬</div>
                <h3 className="text-lg font-extrabold text-white">Build Your Circuit</h3>
                <p className="text-sm text-indigo-200 leading-relaxed">
                  Start by clicking components from the <strong className="text-cyan-300">left toolbox</strong> to place them on the 3D grid.
                  <br /><br />
                  Add a <strong className="text-amber-300">Battery</strong>, <strong className="text-emerald-300">Switch</strong>, <strong className="text-amber-300">Bulb</strong>, and <strong className="text-cyan-300">Copper Wires</strong>. Select <strong className="text-cyan-300">Move tool</strong> to drag Wire Pins onto terminals!
                </p>
                <div className="text-[11px] text-slate-400 font-semibold">
                  Follow the objectives panel on the right →
                </div>
              </div>
            </div>
          )}

          {/* Measurement Popup Overlay */}
          {measurementPopup && (
            <div className="absolute top-16 right-4 z-30 animate-in fade-in">
              <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 w-64 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-extrabold text-white">{measurementPopup.title}</h4>
                  <button
                    type="button"
                    onClick={() => setMeasurementPopup(null)}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >✕</button>
                </div>
                <div className="space-y-2">
                  {measurementPopup.rows.map((row) => (
                    <div key={`${row.label}-${row.value}`} className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold">{row.label}</span>
                      <span className={`font-mono font-bold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
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
          circuitStatus={circuitStatus}
          circuitEnergized={circuitEnergized}
        />
      </div>

      <BottomConsole
        experimentId={currentExperiment.id}
        params={params}
        isRunning={isRunning}
        onToggleRun={handleToggleRun}
        onReset={handleReset}
        circuitEnergized={circuitEnergized}
      />
    </div>
  );
};
