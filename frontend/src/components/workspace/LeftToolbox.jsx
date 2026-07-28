import React from 'react';
import { MousePointer, Move, RotateCw, Trash2, Copy, Ruler, Plus, Zap, FlaskConical, Cpu, Layers } from 'lucide-react';

export const LeftToolbox = ({
  subject = 'physics',
  activeTool = 'pointer',
  setActiveTool,
  onAddComponent,
  addedComponents = [],
  selectedComponentId,
  onDeleteSelected
}) => {

  const componentsList = {
    physics: [
      { name: 'Battery (12V)', icon: 'Battery', type: 'battery' },
      { name: 'Incandescent Bulb', icon: 'Lightbulb', type: 'bulb' },
      { name: 'Toggle Switch', icon: 'ToggleLeft', type: 'switch' },
      { name: 'Copper Wire', icon: 'Cable', type: 'wire' },
      { name: 'Resistor (10Ω)', icon: 'Activity', type: 'resistor' },
      { name: 'Digital Ammeter', icon: 'Gauge', type: 'ammeter' },
      { name: 'Digital Voltmeter', icon: 'Zap', type: 'voltmeter' },
      { name: 'Harmonic Pendulum', icon: 'Compass', type: 'pendulum' },
      { name: 'Cannon Launcher', icon: 'Target', type: 'cannon' }
    ],
    chemistry: [
      { name: 'Glass Beaker (250mL)', icon: 'GlassWater', type: 'beaker' },
      { name: 'Erlenmeyer Flask', icon: 'FlaskConical', type: 'erlenmeyer' },
      { name: 'Test Tube', icon: 'TestTube', type: 'testtube' },
      { name: 'Burette & Stand', icon: 'FlaskConical', type: 'burette' },
      { name: 'Bunsen Burner', icon: 'Flame', type: 'burner' },
      { name: 'Dropping Pipette', icon: 'Pipette', type: 'pipette' },
      { name: 'Digital Thermometer', icon: 'Thermometer', type: 'thermometer' },
      { name: 'pH Indicator Strip', icon: 'TestTube', type: 'phstrip' }
    ],
    electronics: [
      { name: 'Arduino Uno R3', icon: 'Cpu', type: 'arduino' },
      { name: 'Breadboard', icon: 'Grid', type: 'breadboard' },
      { name: 'Red LED Diode', icon: 'Sun', type: 'led-red', color: '#880808' },
      { name: 'Yellow LED Diode', icon: 'Sun', type: 'led-yellow', color: '#eab308' },
      { name: 'Green LED Diode', icon: 'Sun', type: 'led-green', color: '#2DC937' },
      { name: '220Ω Resistor', icon: 'Activity', type: 'resistor' },
      { name: 'Push Switch Button', icon: 'Radio', type: 'button' },
      { name: 'TMP36 Temp Sensor', icon: 'Thermometer', type: 'sensor' },
      { name: 'DC Servo Fan Motor', icon: 'Fan', type: 'motor' }
    ]
  };

  const currentItems = componentsList[subject] || componentsList.physics;

  const mainTools = [
    { id: 'pointer', label: 'Pointer', icon: MousePointer },
    { id: 'move', label: 'Move', icon: Move },
    { id: 'rotate', label: 'Rotate', icon: RotateCw },
    { id: 'measure', label: 'Measure', icon: Ruler },
    { id: 'duplicate', label: 'Duplicate', icon: Copy },
    { id: 'delete', label: 'Delete', icon: Trash2 }
  ];

  return (
    <div className="w-64 bg-white/95 backdrop-blur-md border-r border-slate-200 flex flex-col h-full shadow-xs z-10 select-none">
      
      {/* Manipulate Tools Toolbar */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Manipulate Tools
          </span>
          <span className="text-[10px] text-indigo-600 font-extrabold uppercase bg-indigo-50 px-2 py-0.5 rounded-full">
            Active: {activeTool}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {mainTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  if (setActiveTool) setActiveTool(tool.id);
                }}
                className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 font-bold'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium'
                }`}
                title={`Select ${tool.label} tool`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[9px]">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Component Library List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {subject} Components
          </span>
          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
            {addedComponents.length} On Stage
          </span>
        </div>

        <div className="space-y-1.5">
          {currentItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onAddComponent && onAddComponent(item)}
              className="w-full p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl flex items-center justify-between transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] group text-left"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-indigo-600 transition-colors shrink-0 font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-950">
                  {item.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Snap Footbar */}
      <div className="p-3 bg-slate-900 text-white rounded-t-2xl border-t border-slate-800">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold">Grid Snap Enabled</span>
        </div>
        <p className="text-[10px] text-slate-300 mt-0.5">
          Click any component above to place it directly on the 3D stage.
        </p>
      </div>

    </div>
  );
};
