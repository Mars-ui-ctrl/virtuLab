import React from 'react';
import { Play, Pause, RotateCcw, Activity, Gauge, Zap, Thermometer, Droplet } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export const BottomConsole = ({
  experimentId,
  params = {},
  isRunning = false,
  onToggleRun,
  onReset,
  circuitEnergized = false
}) => {
  const isCircuit = experimentId === 'phys-circuit';
  const isPendulum = experimentId === 'phys-pendulum';
  const isProjectile = experimentId === 'phys-projectile';
  const isNeutralization = experimentId === 'chem-neutralization';
  const isHeating = experimentId === 'chem-heating';
  const isPHTest = experimentId === 'chem-ph-test';
  const isLEDCircuit = experimentId === 'elec-led-circuit';
  const isTrafficLight = experimentId === 'elec-traffic-light';
  const isTempFan = experimentId === 'elec-temp-fan';

  // Calculate live values — ONLY when circuit is actually energized
  const voltage = params.voltage || 12;
  const resistance = params.resistance || 10;
  const liveI = circuitEnergized ? (voltage / resistance).toFixed(2) : '0.00';
  const liveP = circuitEnergized ? (voltage * (voltage / resistance)).toFixed(1) : '0.0';
  const liveV = circuitEnergized ? voltage.toFixed(1) : '0.0';

  // Generate telemetry data points for Recharts oscilloscope
  const chartData = Array.from({ length: 15 }, (_, i) => {
    let yVal = 0;
    if (isCircuit && circuitEnergized) yVal = (voltage / resistance) * (1 + Math.sin(i * 0.8) * 0.05);
    else if (isPendulum && isRunning) yVal = 25 * Math.cos(i * 0.6);
    else if (isHeating) yVal = (params.temperature || 22) + i * 1.5;
    else if (isNeutralization) yVal = 1.5 + (params.dispensedBaseVolume || 0) * 0.22;
    else if (isTempFan) yVal = params.temperature || 24;

    return { time: `${i * 2}s`, value: parseFloat(yVal.toFixed(2)) };
  });

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md z-10">
      
      {/* Playback Controls */}
      <div className="flex items-center space-x-3 shrink-0">
        <button
          onClick={onToggleRun}
          className={`px-4 py-2 rounded-xl font-bold text-xs text-white flex items-center space-x-2 shadow-md transition-all active:scale-95 ${
            isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'gradient-primary hover:opacity-95'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isRunning ? 'Pause Simulation' : 'Run Simulation'}</span>
        </button>

        <button
          onClick={onReset}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200"
          title="Reset Parameters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-semibold text-[11px]">Status:</span>
          <span className={`font-bold ${circuitEnergized || (isRunning && !isCircuit) ? 'text-emerald-600' : 'text-slate-400'}`}>
            {circuitEnergized || (isRunning && !isCircuit) ? '● ACTIVE' : '○ STANDBY'}
          </span>
        </div>
      </div>

      {/* Live Measurement Cards */}
      <div className="grid grid-cols-3 gap-3 flex-1 max-w-lg">
        {isCircuit && (
          <>
            <div className={`border p-2.5 rounded-xl text-center ${circuitEnergized ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200/80'}`}>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Voltage (V)</span>
              <span className={`text-sm font-extrabold ${circuitEnergized ? 'text-indigo-600' : 'text-slate-400'}`}>{liveV} V</span>
            </div>
            <div className={`border p-2.5 rounded-xl text-center ${circuitEnergized ? 'bg-cyan-50 border-cyan-200' : 'bg-slate-50 border-slate-200/80'}`}>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Current (I)</span>
              <span className={`text-sm font-extrabold ${circuitEnergized ? 'text-cyan-600' : 'text-slate-400'}`}>{liveI} A</span>
            </div>
            <div className={`border p-2.5 rounded-xl text-center ${circuitEnergized ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200/80'}`}>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Power (P)</span>
              <span className={`text-sm font-extrabold ${circuitEnergized ? 'text-amber-500' : 'text-slate-400'}`}>{liveP} W</span>
            </div>
          </>
        )}

        {isPendulum && (
          <>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Length (L)</span>
              <span className="text-sm font-extrabold text-indigo-600">{params.length || 2.5} m</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Period (T)</span>
              <span className="text-sm font-extrabold text-indigo-600">
                {(2 * Math.PI * Math.sqrt((params.length || 2.5) / (params.gravity || 9.81))).toFixed(2)} s
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Frequency</span>
              <span className="text-sm font-extrabold text-amber-500">
                {(1 / (2 * Math.PI * Math.sqrt((params.length || 2.5) / (params.gravity || 9.81)))).toFixed(3)} Hz
              </span>
            </div>
          </>
        )}

        {isProjectile && (
          <>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Angle (θ)</span>
              <span className="text-sm font-extrabold text-indigo-600">{params.angle || 45}°</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Velocity</span>
              <span className="text-sm font-extrabold text-indigo-600">{params.velocity || 25} m/s</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Range</span>
              <span className="text-sm font-extrabold text-amber-500">
                {(((params.velocity || 25) ** 2 * Math.sin(2 * (params.angle || 45) * Math.PI / 180)) / (params.gravity || 9.81)).toFixed(1)} m
              </span>
            </div>
          </>
        )}

        {isHeating && (
          <>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Temperature</span>
              <span className="text-sm font-extrabold text-indigo-600">{(params.temperature || 22).toFixed(1)}°C</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Water Volume</span>
              <span className="text-sm font-extrabold text-indigo-600">250 mL</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">State</span>
              <span className="text-sm font-extrabold text-cyan-600">
                {(params.temperature || 22) >= 95 ? 'Boiling ♨' : 'Liquid'}
              </span>
            </div>
          </>
        )}

        {isNeutralization && (
          <>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Dispensed Base</span>
              <span className="text-sm font-extrabold text-indigo-600">{(params.dispensedBaseVolume || 0).toFixed(1)} mL</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Calculated pH</span>
              <span className="text-sm font-extrabold text-indigo-600">
                {(1.5 + (params.dispensedBaseVolume || 0) * 0.22).toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Solution Color</span>
              <span className="text-sm font-extrabold text-pink-500">
                {(params.dispensedBaseVolume || 0) >= 24 ? 'Light Pink' : 'Clear Acid'}
              </span>
            </div>
          </>
        )}

        {isTempFan && (
          <>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">TMP36 Temp</span>
              <span className="text-sm font-extrabold text-indigo-600">{params.temperature || 24}°C</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Fan Status</span>
              <span className={`text-sm font-extrabold ${(params.temperature || 24) >= 30 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {(params.temperature || 24) >= 30 ? 'ON (2400 RPM)' : 'OFF'}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Signal Pin</span>
              <span className="text-sm font-extrabold text-indigo-600">Pin A0 (DC)</span>
            </div>
          </>
        )}
      </div>

      {/* Mini Telemetry Graph */}
      <div className="hidden lg:block w-48 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line type="monotone" dataKey="value" stroke="#5B5CEB" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
