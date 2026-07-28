import React from 'react';
import { Sliders, CheckCircle2, Circle, Target, Award, Sparkles, AlertCircle, Info } from 'lucide-react';

export const RightPropertiesPanel = ({
  experiment,
  params = {},
  onParamChange,
  objectives = [],
  completedObjectives = 0,
  totalObjectives = 0,
  circuitStatus = {},
  circuitEnergized = false,
  addedComponents = []
}) => {
  const isCircuit = experiment.id === 'phys-circuit';
  const isPendulum = experiment.id === 'phys-pendulum';
  const isProjectile = experiment.id === 'phys-projectile';
  const isNeutralization = experiment.id === 'chem-neutralization';
  const isHeating = experiment.id === 'chem-heating';
  const isPHTest = experiment.id === 'chem-ph-test';
  const isLEDCircuit = experiment.id === 'elec-led-circuit';
  const isTrafficLight = experiment.id === 'elec-traffic-light';
  const isTempFan = experiment.id === 'elec-temp-fan';

  const progressPct = totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;

  return (
    <div className="w-80 bg-white/95 backdrop-blur-md border-l border-slate-200 flex flex-col h-full overflow-y-auto p-4 space-y-5 z-10 shadow-xs">
      
      {/* Learning Goal Banner */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">🎯 Learning Goal</span>
          <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
            {progressPct}% Done
          </span>
        </div>
        <h3 className="text-sm font-extrabold leading-tight">
          {isCircuit && "Verify Ohm's Law: I = V / R"}
          {isPendulum && "Explore T = 2π√(L/g) — Period depends on Length & Gravity"}
          {isProjectile && "Investigate Projectile Range: R = v²sin(2θ)/g"}
          {!isCircuit && !isPendulum && !isProjectile && experiment.title}
        </h3>
        <p className="text-[11px] text-indigo-100 leading-relaxed">
          {isCircuit && "Build a DC circuit from scratch. Place components, connect them, and measure current to verify Ohm's Law."}
          {isPendulum && "Adjust pendulum length and gravity to observe how oscillation period changes. Mass does NOT affect period!"}
          {isProjectile && "Set launch angle and velocity to maximize range. 45° gives maximum horizontal displacement."}
          {!isCircuit && !isPendulum && !isProjectile && experiment.description}
        </p>
        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
          <div
            className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Properties Control Section */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center">
            <Sliders className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
            Component Parameters
          </h3>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
            Live Interactive
          </span>
        </div>

        {/* Physics Circuit Parameters */}
        {isCircuit && (
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>DC Voltage (V)</span>
                <span className="text-indigo-600 font-bold">{params.voltage || 12}V</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={params.voltage || 12}
                onChange={(e) => onParamChange('voltage', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Resistor (R)</span>
                <span className="text-indigo-600 font-bold">{params.resistance || 10}Ω</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={params.resistance || 10}
                onChange={(e) => onParamChange('resistance', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Live Calculation Display */}
            {circuitEnergized && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">⚡ Live Ohm's Law Calculation</span>
                <div className="text-xs font-mono text-emerald-800">
                  <div>I = V / R</div>
                  <div>I = {params.voltage || 12} / {params.resistance || 10}</div>
                  <div className="font-black text-emerald-900 text-sm">
                    I = {((params.voltage || 12) / (params.resistance || 10)).toFixed(3)} A
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pendulum Parameters */}
        {isPendulum && (
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Pendulum Length (L)</span>
                <span className="text-indigo-600 font-bold">{params.length || 2.5} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={params.length || 2.5}
                onChange={(e) => onParamChange('length', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Bob Mass (m)</span>
                <span className="text-indigo-600 font-bold">{params.mass || 1.5} kg</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={params.mass || 1.5}
                onChange={(e) => onParamChange('mass', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[10px] text-amber-600 font-bold mt-1 flex items-center">
                <Info className="w-3 h-3 mr-1" />
                Key Insight: Mass does NOT change period T!
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Gravity Preset</span>
                <span className="text-indigo-600 font-bold">{params.gravity || 9.81} m/s²</span>
              </div>
              <select
                value={params.gravity || 9.81}
                onChange={(e) => onParamChange('gravity', parseFloat(e.target.value))}
                className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2 font-medium"
              >
                <option value={9.81}>🌍 Earth (9.81 m/s²)</option>
                <option value={1.62}>🌙 Moon (1.62 m/s²)</option>
                <option value={24.79}>🪐 Jupiter (24.79 m/s²)</option>
                <option value={3.71}>🔴 Mars (3.71 m/s²)</option>
              </select>
            </div>

            {/* Live Period Calculation */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-indigo-700 font-bold uppercase">📐 Live Calculation</span>
              <div className="text-xs font-mono text-indigo-800">
                <div>T = 2π√(L/g)</div>
                <div>T = 2π√({params.length || 2.5}/{params.gravity || 9.81})</div>
                <div className="font-black text-indigo-900 text-sm">
                  T = {(2 * Math.PI * Math.sqrt((params.length || 2.5) / (params.gravity || 9.81))).toFixed(3)} seconds
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projectile Parameters */}
        {isProjectile && (
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Launch Angle (θ)</span>
                <span className="text-indigo-600 font-bold">{params.angle || 45}°</span>
              </div>
              <input
                type="range"
                min="15"
                max="85"
                value={params.angle || 45}
                onChange={(e) => onParamChange('angle', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Initial Velocity (v₀)</span>
                <span className="text-indigo-600 font-bold">{params.velocity || 25} m/s</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={params.velocity || 25}
                onChange={(e) => onParamChange('velocity', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Live Range Calculation */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-indigo-700 font-bold uppercase">📐 Live Calculation</span>
              <div className="text-xs font-mono text-indigo-800">
                <div>R = v²sin(2θ) / g</div>
                <div>R = {params.velocity || 25}² × sin(2×{params.angle || 45}°) / {params.gravity || 9.81}</div>
                <div className="font-black text-indigo-900 text-sm">
                  Range = {(((params.velocity || 25) ** 2 * Math.sin(2 * (params.angle || 45) * Math.PI / 180)) / (params.gravity || 9.81)).toFixed(1)} m
                </div>
                <div>Max Height = {((((params.velocity || 25) * Math.sin((params.angle || 45) * Math.PI / 180)) ** 2) / (2 * (params.gravity || 9.81))).toFixed(1)} m</div>
              </div>
              {(params.angle || 45) === 45 && (
                <p className="text-[10px] text-emerald-700 font-bold mt-1">
                  ✅ 45° gives the MAXIMUM range for a given velocity!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Chemistry Heating Parameters */}
        {isHeating && (
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Flame Intensity</span>
                <span className="text-cyan-600 font-bold">{params.flameIntensity || 75}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={params.flameIntensity || 75}
                onChange={(e) => onParamChange('flameIntensity', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
            </div>
          </div>
        )}

        {/* Chemistry Neutralization Titration Parameters */}
        {isNeutralization && (
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Dispensed Base (0.1M NaOH)</span>
                <span className="text-indigo-600 font-bold">{(params.dispensedBaseVolume || 0).toFixed(1)} mL</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="0.1"
                value={params.dispensedBaseVolume || 0}
                onChange={(e) => onParamChange('dispensedBaseVolume', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-3 space-y-1.5 border border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold uppercase">
                <span>🧪 Live pH Meter Readout</span>
                <span>Phenolphthalein</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {((params.dispensedBaseVolume || 0) >= 24.5 && (params.dispensedBaseVolume || 0) <= 25.5)
                    ? '7.00'
                    : (params.dispensedBaseVolume || 0) > 25.5
                    ? (11.50 + Math.log10(Math.max(0.1, (params.dispensedBaseVolume || 0) - 25))).toFixed(2)
                    : (1.50 + ((params.dispensedBaseVolume || 0) / 25.0) * 1.8).toFixed(2)
                  }
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  (params.dispensedBaseVolume || 0) >= 24.5 && (params.dispensedBaseVolume || 0) <= 25.5
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : (params.dispensedBaseVolume || 0) > 25.5
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                }`}>
                  {(params.dispensedBaseVolume || 0) >= 24.5 && (params.dispensedBaseVolume || 0) <= 25.5
                    ? 'NEUTRAL (PINK)'
                    : (params.dispensedBaseVolume || 0) > 25.5
                    ? 'BASIC (MAGENTA)'
                    : 'ACIDIC (CLEAR)'
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Chemistry pH Test Parameters */}
        {isPHTest && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Select Test Solution Sample
              </label>
              <select
                value={params.selectedSolution || 'water'}
                onChange={(e) => {
                  const val = e.target.value;
                  const solutionData = {
                    lemon: { ph: 2.0, color: '#ef4444', class: 'Strongly Acidic', title: 'Lemon Juice' },
                    coffee: { ph: 5.0, color: '#f59e0b', class: 'Weakly Acidic', title: 'Black Coffee' },
                    water: { ph: 7.0, color: '#22c55e', class: 'Neutral Solution', title: 'Pure Water' },
                    soap: { ph: 10.0, color: '#06b6d4', class: 'Weakly Basic', title: 'Soap Solution' },
                    bleach: { ph: 13.0, color: '#a855f7', class: 'Strongly Basic', title: 'Bleach Titrant' }
                  };
                  const data = solutionData[val] || solutionData.water;
                  onParamChange('selectedSolution', val);
                  onParamChange('stripDipped', true);
                  onParamChange('stripColor', data.color);
                  onParamChange('samplePH', data.ph);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="water">💧 Pure Water (pH 7.0 - Neutral)</option>
                <option value="lemon">🍋 Lemon Juice (pH 2.0 - Strong Acid)</option>
                <option value="coffee">☕ Black Coffee (pH 5.0 - Weak Acid)</option>
                <option value="soap">🧼 Soap Solution (pH 10.0 - Weak Base)</option>
                <option value="bleach">🧪 Bleach Titrant (pH 13.0 - Strong Base)</option>
              </select>
            </div>

            {/* Live pH Meter Readout Card */}
            {(() => {
              const hasBeakerOnStage = addedComponents?.some(c => c.type === 'beaker');
              const hasStripOnStage = addedComponents?.some(c => c.type === 'phstrip');

              if (!hasBeakerOnStage) {
                return (
                  <div className="bg-slate-900 text-white rounded-xl p-3 space-y-2 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      <span>⚠️ NO SAMPLE CONTAINER</span>
                      <span>Beaker Missing</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black font-mono text-slate-500">
                        pH --.--
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-slate-800 text-slate-400 border-slate-700">
                        NO SAMPLE
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-0.5">
                      Place a Glass Beaker from left toolbox to hold solution sample.
                    </div>
                  </div>
                );
              }

              if (!hasStripOnStage) {
                return (
                  <div className="bg-slate-900 text-white rounded-xl p-3 space-y-2 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                      <span>🧪 SAMPLE READY IN BEAKER</span>
                      <span>Strip Missing</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black font-mono text-slate-400">
                        pH --.--
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-indigo-900/40 text-indigo-300 border-indigo-500/40">
                        STRIP READY
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-0.5">
                      Add a pH Indicator Strip from left toolbox to test sample pH.
                    </div>
                  </div>
                );
              }

              const sol = params.selectedSolution || 'water';
              const phData = {
                lemon: { ph: '2.00', label: 'STRONGLY ACIDIC', color: 'bg-red-500/20 text-red-300 border-red-500/40', text: 'Crimson Red Shift' },
                coffee: { ph: '5.00', label: 'WEAKLY ACIDIC', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', text: 'Amber Yellow Shift' },
                water: { ph: '7.00', label: 'NEUTRAL (pH 7.0)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', text: 'Emerald Green' },
                soap: { ph: '10.00', label: 'WEAKLY BASIC', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', text: 'Cyan Blue Shift' },
                bleach: { ph: '13.00', label: 'STRONGLY BASIC', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', text: 'Violet Purple Shift' }
              }[sol] || { ph: '7.00', label: 'NEUTRAL', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', text: 'Green' };

              return (
                <div className="bg-slate-900 text-white rounded-xl p-3 space-y-2 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                    <span>🧪 Live pH Spectrum Reading</span>
                    <span className="text-amber-400">Universal Indicator</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black font-mono text-emerald-400">
                      pH {phData.ph}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${phData.color}`}>
                      {phData.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-0.5 flex justify-between">
                    <span>Indicator Transformation:</span>
                    <span className="font-bold text-white">{phData.text}</span>
                  </div>
                </div>
              );
            })()}

            {/* pH Color Scale Reference Legend */}
            <div className="bg-slate-900 text-white rounded-xl p-3 space-y-2 border border-slate-800">
              <span className="text-[10px] text-cyan-300 font-bold uppercase block">
                🎨 Universal pH Scale Spectrum (0 - 14)
              </span>
              <div className="grid grid-cols-5 gap-1 text-center font-mono text-[9px] font-bold">
                <div className={`p-1.5 rounded text-white ${params.selectedSolution === 'lemon' ? 'ring-2 ring-white scale-105 shadow-md bg-red-600' : 'bg-red-500/80'}`}>
                  pH 2.0<br/>Acid
                </div>
                <div className={`p-1.5 rounded text-white ${params.selectedSolution === 'coffee' ? 'ring-2 ring-white scale-105 shadow-md bg-amber-600' : 'bg-amber-500/80'}`}>
                  pH 5.0<br/>Acid
                </div>
                <div className={`p-1.5 rounded text-white ${params.selectedSolution === 'water' || !params.selectedSolution ? 'ring-2 ring-white scale-105 shadow-md bg-emerald-600' : 'bg-emerald-500/80'}`}>
                  pH 7.0<br/>Neu
                </div>
                <div className={`p-1.5 rounded text-white ${params.selectedSolution === 'soap' ? 'ring-2 ring-white scale-105 shadow-md bg-cyan-600' : 'bg-cyan-500/80'}`}>
                  pH 10.0<br/>Base
                </div>
                <div className={`p-1.5 rounded text-white ${params.selectedSolution === 'bleach' ? 'ring-2 ring-white scale-105 shadow-md bg-purple-700' : 'bg-purple-600/80'}`}>
                  pH 13.0<br/>Base
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Electronics Temp Sensor Parameters */}
        {isTempFan && (
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>TMP36 Temperature</span>
                <span className={`font-bold ${params.temperature >= 30 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {params.temperature || 24}°C
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                value={params.temperature || 24}
                onChange={(e) => onParamChange('temperature', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        )}

      </div>

      {/* Dynamic Experiment Objectives — Tracks REAL student actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center">
            <Target className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
            Step-by-Step Objectives
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            progressPct === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {completedObjectives}/{totalObjectives}
          </span>
        </div>
        <div className="space-y-2">
          {objectives.map((obj, idx) => (
            <div key={idx} className={`flex items-start space-x-2.5 text-xs p-2 rounded-xl transition-all ${
              obj.done ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-slate-100'
            }`}>
              {obj.done
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                : <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
              }
              <span className={`font-medium leading-relaxed ${
                obj.done ? 'text-emerald-800 line-through' : 'text-slate-700'
              }`}>{obj.text}</span>
            </div>
          ))}
        </div>

        {progressPct === 100 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <span className="text-sm font-extrabold text-emerald-700">🎉 All objectives complete!</span>
            <p className="text-[10px] text-emerald-600 mt-1">Click "Finish & Score" to submit your lab report.</p>
          </div>
        )}
      </div>

      {/* Live Status Telemetry Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-indigo-300">Lab Telemetry</span>
          <span className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            circuitEnergized
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
          }`}>
            {circuitEnergized ? '● Energized' : '○ Standby'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 text-center">
          <div className="bg-white/10 p-2 rounded-xl">
            <span className="text-[10px] text-indigo-200 block">Progress</span>
            <span className="text-base font-extrabold text-white">{progressPct}%</span>
          </div>
          <div className="bg-white/10 p-2 rounded-xl">
            <span className="text-[10px] text-indigo-200 block">XP Reward</span>
            <span className="text-base font-extrabold text-amber-300">+{experiment.xpReward || 100}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
