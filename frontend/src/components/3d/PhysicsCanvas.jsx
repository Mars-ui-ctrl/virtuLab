import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';

/* ============================================================
   TABLETOP DRAGGABLE WRAPPER — Locked to flat XZ plane (Y = 0.45)
   ============================================================ */
const DraggableGroup = ({ children, position, rotation, onDragEnd, isDragEnabled, isSelected, onClick, fixedY = 0.45 }) => {
  const groupRef = useRef();
  const { raycaster, controls } = useThree();
  const isDragging = useRef(false);
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -fixedY));
  const planeIntersect = useRef(new THREE.Vector3());
  const offset = useRef(new THREE.Vector3());

  useEffect(() => {
    if (groupRef.current && position) {
      groupRef.current.position.set(position[0], fixedY, position[2]);
    }
    if (groupRef.current && rotation) {
      groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
    }
  }, [position, rotation, fixedY]);

  const handlePointerDown = useCallback((e) => {
    if (!isDragEnabled) return;
    e.stopPropagation();
    isDragging.current = true;
    dragPlane.current.constant = -fixedY;

    if (controls) controls.enabled = false;
    e.target.setPointerCapture?.(e.pointerId);

    if (raycaster.ray.intersectPlane(dragPlane.current, planeIntersect.current)) {
      offset.current.copy(planeIntersect.current).sub(groupRef.current.position);
    }
  }, [isDragEnabled, raycaster, controls, fixedY]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current || !isDragEnabled) return;
    e.stopPropagation();

    if (raycaster.ray.intersectPlane(dragPlane.current, planeIntersect.current)) {
      const newPos = planeIntersect.current.clone().sub(offset.current);
      groupRef.current.position.x = newPos.x;
      groupRef.current.position.y = fixedY;
      groupRef.current.position.z = newPos.z;

      if (onDragEnd && groupRef.current) {
        onDragEnd([
          parseFloat(groupRef.current.position.x.toFixed(2)),
          fixedY,
          parseFloat(groupRef.current.position.z.toFixed(2))
        ]);
      }
    }
  }, [isDragEnabled, raycaster, fixedY, onDragEnd]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (controls) controls.enabled = true;
    e.target.releasePointerCapture?.(e.pointerId);
  }, [controls]);

  return (
    <group
      ref={groupRef}
      position={position ? [position[0], fixedY, position[2]] : [0, fixedY, 0]}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {isSelected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.05, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
      )}
      {children}
    </group>
  );
};

/* ============================================================
   INTERACTIVE WIRE PIN HANDLE — Draggable end pin for jumper wires
   ============================================================ */
const WirePinHandle = ({ position, onMovePin, isDragEnabled, color = "#38bdf8", label = "Pin", size = 0.18, isCenterHandle = false }) => {
  const { raycaster, controls } = useThree();
  const isDragging = useRef(false);
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.45));
  const planeIntersect = useRef(new THREE.Vector3());

  const handlePointerDown = useCallback((e) => {
    if (!isDragEnabled) return;
    e.stopPropagation();
    isDragging.current = true;
    if (controls) controls.enabled = false;
    e.target.setPointerCapture?.(e.pointerId);
  }, [isDragEnabled, controls]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current || !isDragEnabled) return;
    e.stopPropagation();

    if (raycaster.ray.intersectPlane(dragPlane.current, planeIntersect.current)) {
      onMovePin([
        parseFloat(planeIntersect.current.x.toFixed(2)),
        0.45,
        parseFloat(planeIntersect.current.z.toFixed(2))
      ]);
    }
  }, [isDragEnabled, raycaster, onMovePin]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (controls) controls.enabled = true;
    e.target.releasePointerCapture?.(e.pointerId);
  }, [controls]);

  return (
    <group
      position={position}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      {isDragEnabled && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={isCenterHandle ? [0.3, 0.44, 20] : [0.22, 0.32, 16]} />
          <meshBasicMaterial color={isCenterHandle ? "#22c55e" : "#38bdf8"} transparent opacity={0.9} />
        </mesh>
      )}
      {isDragEnabled && (
        <Html position={[0, 0.35, 0]} center className="pointer-events-none">
          <div className={`px-1 py-0.5 bg-slate-900/80 rounded text-[7px] font-bold whitespace-nowrap pointer-events-none select-none ${isCenterHandle ? 'text-emerald-300' : 'text-cyan-300'}`}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   3D Dynamic Curved Flexible Wire (Bézier Cable)
   Stretches between start [x1, y1, z1] and end [x2, y2, z2]
   with animated glowing electron particles!
   ============================================================ */
const CurvedWire3D = ({ startPos, endPos, isEnergized = false, wireColor = "#fbbf24", isSelected = false, label = "Wire", isDragEnabled = false, onMoveStartPin, onMoveEndPin, onMoveWire, onClick }) => {
  const electronRef = useRef();

  const p1 = useMemo(() => new THREE.Vector3(...startPos), [startPos]);
  const p2 = useMemo(() => new THREE.Vector3(...endPos), [endPos]);

  // Compute smooth curve with natural 3D sag
  const curve = useMemo(() => {
    const midX = (p1.x + p2.x) / 2;
    const midZ = (p1.z + p2.z) / 2;
    const dist = p1.distanceTo(p2);
    const sag = Math.min(dist * 0.18, 0.7);

    const ctrl1 = new THREE.Vector3((p1.x + midX) / 2, Math.max(0.1, (p1.y + p2.y) / 2 - sag), (p1.z + midZ) / 2);
    const ctrl2 = new THREE.Vector3((midX + p2.x) / 2, Math.max(0.1, (p1.y + p2.y) / 2 - sag), (midZ + p2.z) / 2);

    return new THREE.CubicBezierCurve3(p1, ctrl1, ctrl2, p2);
  }, [p1, p2]);

  // Animate electron along curve when circuit is energized
  useFrame(({ clock }) => {
    if (electronRef.current && isEnergized) {
      const t = (clock.getElapsedTime() * 1.5) % 1.0;
      const pt = curve.getPoint(t);
      electronRef.current.position.copy(pt);
    }
  });

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 32, 0.07, 8, false);
  }, [curve]);

  const midPoint = useMemo(() => curve.getPoint(0.5), [curve]);

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* 3D Tube Cable */}
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial
          color={isEnergized ? wireColor : isSelected ? "#38bdf8" : "#64748b"}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      {/* Interactive Draggable Pin A Handle */}
      {onMoveStartPin ? (
        <WirePinHandle
          position={startPos}
          onMovePin={onMoveStartPin}
          isDragEnabled={isDragEnabled}
          color="#38bdf8"
          label="Pin A"
        />
      ) : (
        <mesh position={startPos}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={isEnergized ? "#ef4444" : "#3b82f6"} metalness={0.8} />
        </mesh>
      )}

      {/* Center Handle — moves the whole wire */}
      {onMoveWire && (
        <WirePinHandle
          position={[midPoint.x, midPoint.y, midPoint.z]}
          onMovePin={onMoveWire}
          isDragEnabled={isDragEnabled}
          color="#22c55e"
          label="Move Wire"
          size={0.14}
          isCenterHandle
        />
      )}

      {/* Interactive Draggable Pin B Handle */}
      {onMoveEndPin ? (
        <WirePinHandle
          position={endPos}
          onMovePin={onMoveEndPin}
          isDragEnabled={isDragEnabled}
          color="#38bdf8"
          label="Pin B"
        />
      ) : (
        <mesh position={endPos}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={isEnergized ? "#ef4444" : "#3b82f6"} metalness={0.8} />
        </mesh>
      )}

      {/* Animated Glowing Electron Stream */}
      {isEnergized && (
        <mesh ref={electronRef}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      )}

      {/* Midpoint Label Badge — only when dragging or selected */}
      {(isDragEnabled || isSelected) && (
        <Html position={[midPoint.x, midPoint.y + 0.35, midPoint.z]} center className="pointer-events-none">
          <div className="px-1.5 py-0.5 bg-slate-900/80 text-cyan-300 border border-cyan-500/30 rounded text-[8px] font-bold whitespace-nowrap pointer-events-none select-none">
            {isEnergized ? '⚡ Flow' : label}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   3D Component: Battery
   ============================================================ */
const Battery3D = ({ isSelected, voltage = 12 }) => {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.3, 1.1, 0.8]} />
        <meshStandardMaterial color={isSelected ? "#0284c7" : "#1e293b"} metalness={0.4} roughness={0.2} />
      </mesh>
      {/* Red Terminal (+) */}
      <mesh position={[0.45, 0.65, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.25, 16]} />
        <meshStandardMaterial color="#ef4444" metalness={0.8} />
      </mesh>
      {/* Blue Terminal (-) */}
      <mesh position={[-0.45, 0.65, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.25, 16]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.8} />
      </mesh>
      {isSelected && (
        <Html position={[0, -0.8, 0]} center className="pointer-events-none">
          <div className="px-2 py-0.5 bg-indigo-950/85 text-cyan-300 border border-cyan-500/40 rounded text-[9px] font-bold whitespace-nowrap pointer-events-none select-none">
            ⚡ {voltage}V Battery
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   3D Component: Lamp Bulb
   ============================================================ */
const Bulb3D = ({ isSelected, isLit = false, voltage = 12 }) => {
  const lightRef = useRef();

  useFrame(({ clock }) => {
    if (lightRef.current && isLit) {
      lightRef.current.intensity = (voltage / 12) * (2.2 + Math.sin(clock.getElapsedTime() * 8) * 0.2);
    }
  });

  return (
    <group>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
        <meshStandardMaterial color={isSelected ? "#38bdf8" : "#cbd5e1"} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial
          color={isLit ? "#fef08a" : "#f1f5f9"}
          emissive={isLit ? "#f59e0b" : "#000000"}
          emissiveIntensity={isLit ? (voltage / 12) * 3.5 : 0}
          transmission={0.85}
          roughness={0.05}
          ior={1.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      {isLit && (
        <pointLight
          ref={lightRef}
          color="#ffb703"
          intensity={voltage / 2}
          distance={12}
          decay={1.5}
          position={[0, 0.3, 0]}
        />
      )}
      {isSelected && (
        <Html position={[0, 0.95, 0]} center className="pointer-events-none">
          <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold pointer-events-none select-none ${
            isLit
              ? 'bg-amber-400 text-amber-950'
              : 'bg-slate-900/85 text-slate-300 border border-slate-700'
          }`}>
            {isLit ? `💡 ON (${(voltage * 0.12).toFixed(1)}W)` : 'BULB OFF'}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   3D Component: Toggle Switch
   ============================================================ */
const Switch3D = ({ isSelected, isOpen = false, onToggle, isDragMode = false }) => {
  return (
    <group>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[1.2, 0.15, 0.6]} />
        <meshStandardMaterial color={isSelected ? "#38bdf8" : "#475569"} metalness={0.7} />
      </mesh>
      <group position={[-0.3, 0, 0]} rotation={[0, 0, isOpen ? 0.65 : 0]}>
        <mesh position={[0.3, 0.2, 0]}>
          <boxGeometry args={[0.7, 0.12, 0.12]} />
          <meshStandardMaterial color={isOpen ? "#ef4444" : "#10b981"} metalness={0.6} />
        </mesh>
      </group>
      <Html position={[0, 0.7, 0]} center className={isDragMode ? 'pointer-events-none' : ''}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggle && !isDragMode) onToggle();
          }}
          className={`px-2 py-0.5 rounded text-[9px] font-bold transition-transform active:scale-95 ${
            isDragMode ? 'pointer-events-none opacity-60' : 'cursor-pointer'
          } ${!isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
        >
          {!isOpen ? '🟢 ON' : '🔴 OFF'}
        </button>
      </Html>
    </group>
  );
};

/* ============================================================
   3D Component: Resistor
   ============================================================ */
const Resistor3D = ({ isSelected, resistance = 10 }) => {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 1.0, 16]} />
        <meshStandardMaterial color={isSelected ? "#38bdf8" : "#fef08a"} />
      </mesh>
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.21, 0.21, 0.1, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.21, 0.21, 0.1, 16]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      {isSelected && (
        <Html position={[0, 0.6, 0]} center className="pointer-events-none">
          <div className="px-2 py-0.5 bg-slate-900/85 text-amber-300 border border-amber-400/30 rounded text-[9px] font-mono whitespace-nowrap pointer-events-none select-none">
            {resistance}Ω Resistor
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   3D Component: Digital Ammeter
   ============================================================ */
const Ammeter3D = ({ isSelected, current = "1.20", isEnergized = false }) => {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.1, 0.7, 0.7]} />
        <meshStandardMaterial color={isSelected ? "#0284c7" : "#0f172a"} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 0.36]}>
        <boxGeometry args={[0.8, 0.4, 0.05]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>
      <Html position={[0, 0.15, 0.4]} center className="pointer-events-none">
        <div className="font-mono text-[11px] font-black text-white tracking-widest pointer-events-none select-none">
          {isEnergized ? `${current}A` : '0.00A'}
        </div>
      </Html>
      <Html position={[0, -0.6, 0]} center className="pointer-events-none">
        <div className="px-2 py-0.5 bg-slate-900/90 text-cyan-300 rounded text-[9px] font-bold whitespace-nowrap pointer-events-none select-none">
          Digital Ammeter (I)
        </div>
      </Html>
    </group>
  );
};

/* ============================================================
   3D Component: Digital Voltmeter
   ============================================================ */
const Voltmeter3D = ({ isSelected, voltage = "12.0", isEnergized = false }) => {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.1, 0.7, 0.7]} />
        <meshStandardMaterial color={isSelected ? "#0284c7" : "#1e1b4b"} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 0.36]}>
        <boxGeometry args={[0.8, 0.4, 0.05]} />
        <meshBasicMaterial color="#4f46e5" />
      </mesh>
      <Html position={[0, 0.15, 0.4]} center className="pointer-events-none">
        <div className="font-mono text-[11px] font-black text-white tracking-widest pointer-events-none select-none">
          {isEnergized ? `${voltage}V` : '0.0V'}
        </div>
      </Html>
      <Html position={[0, -0.6, 0]} center className="pointer-events-none">
        <div className="px-2 py-0.5 bg-slate-900/90 text-indigo-300 rounded text-[9px] font-bold whitespace-nowrap pointer-events-none select-none">
          Digital Voltmeter (V)
        </div>
      </Html>
    </group>
  );
};

/* ============================================================
   3D Component: Simple Harmonic Pendulum
   ============================================================ */
const Pendulum3D = ({ length = 2.5, mass = 1.5, gravity = 9.81, isSwinging = false }) => {
  const pendulumRef = useRef();

  useFrame(({ clock }) => {
    if (pendulumRef.current) {
      if (isSwinging) {
        const omega = Math.sqrt(gravity / Math.max(0.5, length));
        const angle = 0.45 * Math.cos(omega * clock.getElapsedTime());
        pendulumRef.current.rotation.z = angle;
      } else {
        pendulumRef.current.rotation.z = 0;
      }
    }
  });

  const bobRadius = 0.25 + (mass * 0.05);

  return (
    <group position={[0, 3.8, 0]}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[3.2, 0.25, 0.5]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      <mesh position={[-1.4, -1.9, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 3.8, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>
      <mesh position={[1.4, -1.9, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 3.8, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>

      <group ref={pendulumRef}>
        <mesh position={[0, -length / 2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, length, 8]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[0, -length, 0]}>
          <sphereGeometry args={[bobRadius, 32, 32]} />
          <meshStandardMaterial color="#6366f1" metalness={0.9} roughness={0.1} />
        </mesh>

        <Html position={[0, -length - 0.6, 0]} center className="pointer-events-none">
          <div className="bg-slate-900/95 text-cyan-300 border border-cyan-400/60 px-3 py-1.5 rounded-xl text-[11px] font-mono shadow-2xl whitespace-nowrap pointer-events-none select-none">
            L={length}m | m={mass}kg | T={(2 * Math.PI * Math.sqrt(length / gravity)).toFixed(2)}s
          </div>
        </Html>
      </group>
    </group>
  );
};

/* ============================================================
   3D Component: Projectile Cannon
   ============================================================ */
const Projectile3D = ({ angle = 45, velocity = 25, gravity = 9.81, isFired = false }) => {
  const ballRef = useRef();
  const rad = (angle * Math.PI) / 180;
  const v0x = velocity * Math.cos(rad);
  const v0y = velocity * Math.sin(rad);
  const totalTime = (2 * v0y) / gravity;

  const points = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * totalTime;
    const x = -4 + (v0x * t * 0.18);
    const y = (v0y * t - 0.5 * gravity * t * t) * 0.18;
    if (y >= 0) points.push(new THREE.Vector3(x, y + 0.4, 0));
  }

  useFrame(({ clock }) => {
    if (ballRef.current && isFired && points.length > 0) {
      const progress = (clock.getElapsedTime() % 2.5) / 2.5;
      const idx = Math.floor(progress * (points.length - 1));
      const pt = points[idx] || points[0];
      ballRef.current.position.copy(pt);
    }
  });

  return (
    <group>
      <group position={[-4, 0.5, 0]} rotation={[0, 0, rad]}>
        <mesh position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.35, 1.4, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
      </group>

      {points.length > 1 && (
        <line>
          <bufferGeometry attach="geometry" setFromPoints={points} />
          <lineBasicMaterial attach="material" color="#38bdf8" linewidth={3} />
        </line>
      )}

      <mesh ref={ballRef} position={[-4, 0.5, 0]}>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshStandardMaterial color="#f43f5e" metalness={0.6} roughness={0.2} />
      </mesh>

      <Html position={[-4, 1.6, 0]} center className="pointer-events-none">
        <div className="bg-slate-900/95 text-cyan-300 border border-cyan-500/50 px-3 py-1 rounded-xl text-[10px] font-mono shadow-xl whitespace-nowrap pointer-events-none select-none">
          v₀={velocity}m/s | θ={angle}° | Range={((v0x * totalTime)).toFixed(1)}m
        </div>
      </Html>
    </group>
  );
};

/* ============================================================
   ORBIT CONTROLS WRAPPER
   ============================================================ */
const SmartOrbitControls = ({ isDragging }) => {
  return (
    <OrbitControls
      makeDefault
      maxPolarAngle={Math.PI / 2 - 0.02}
      minDistance={3}
      maxDistance={18}
      enabled={!isDragging}
    />
  );
};

/* ============================================================
   MAIN PHYSICS CANVAS EXPORT
   ============================================================ */
export const PhysicsCanvas = ({
  experimentId,
  params,
  addedComponents = [],
  isRunning = false,
  activeTool = 'pointer',
  onSelectComponent,
  selectedComponentId,
  onMoveComponent,
  onRotateComponent,
  onMoveWirePin,
  switchOpen = false,
  onToggleSwitch
}) => {
  const isCircuitMode = experimentId === 'phys-circuit';
  const isPendulumMode = experimentId === 'phys-pendulum';
  const isProjectileMode = experimentId === 'phys-projectile';

  const isCircuitEnergized = isCircuitMode && isRunning && !switchOpen;
  const calculatedCurrent = ((params.voltage || 12) / (params.resistance || 10)).toFixed(2);

  const isDragMode = activeTool === 'move';

  const handleComponentClick = (compId) => {
    if (activeTool === 'rotate' && onRotateComponent) {
      onRotateComponent(compId);
    } else {
      onSelectComponent?.(compId);
    }
  };

  const handleDragEnd = (compId, newPos) => {
    if (onMoveComponent) {
      onMoveComponent(compId, newPos);
    }
  };

  const wireComponents = addedComponents.filter(c => c.type === 'wire');

  /* Render a single managed component by its type */
  const renderComponent = (comp) => {
    if (comp.type === 'wire') return null; // Wires rendered with interactive pin handles below

    const isSel = selectedComponentId === comp.id;

    const commonProps = {
      key: comp.id,
      position: comp.position || [0, 0.45, 0],
      rotation: comp.rotation || [0, 0, 0],
      fixedY: 0.45,
      isSelected: isSel,
      isDragEnabled: isDragMode,
      onClick: () => handleComponentClick(comp.id),
      onDragEnd: (newPos) => handleDragEnd(comp.id, newPos)
    };

    switch (comp.type) {
      case 'battery':
        return (
          <DraggableGroup {...commonProps}>
            <Battery3D isSelected={isSel} voltage={params.voltage || 12} />
          </DraggableGroup>
        );
      case 'bulb':
        return (
          <DraggableGroup {...commonProps}>
            <Bulb3D isSelected={isSel} isLit={isCircuitEnergized} voltage={params.voltage || 12} />
          </DraggableGroup>
        );
      case 'switch':
        return (
          <DraggableGroup {...commonProps}>
            <Switch3D isSelected={isSel} isOpen={switchOpen} onToggle={onToggleSwitch} isDragMode={isDragMode} />
          </DraggableGroup>
        );
      case 'resistor':
        return (
          <DraggableGroup {...commonProps}>
            <Resistor3D isSelected={isSel} resistance={params.resistance || 10} />
          </DraggableGroup>
        );
      case 'ammeter':
        return (
          <DraggableGroup {...commonProps}>
            <Ammeter3D isSelected={isSel} current={calculatedCurrent} isEnergized={isCircuitEnergized} />
          </DraggableGroup>
        );
      case 'voltmeter':
        return (
          <DraggableGroup {...commonProps}>
            <Voltmeter3D isSelected={isSel} voltage={(params.voltage || 12).toFixed(1)} isEnergized={isCircuitEnergized} />
          </DraggableGroup>
        );
      case 'pendulum':
        return (
          <DraggableGroup {...commonProps}>
            <Pendulum3D length={params.length || 2.5} mass={params.mass || 1.5} gravity={params.gravity || 9.81} isSwinging={isRunning} />
          </DraggableGroup>
        );
      case 'cannon':
        return (
          <DraggableGroup {...commonProps}>
            <Projectile3D angle={params.angle || 45} velocity={params.velocity || 25} gravity={params.gravity || 9.81} isFired={isRunning} />
          </DraggableGroup>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full relative bg-linear-to-b from-slate-900 via-indigo-950 to-slate-900">
      <Canvas
        camera={{ position: [0, 4.5, 9.0], fov: 48 }}
        shadows
        className="w-full h-full"
      >
        <ambientLight intensity={1.2} />
        <hemisphereLight skyColor="#ffffff" groundColor="#334155" intensity={1.5} />
        <directionalLight position={[10, 18, 10]} intensity={2.0} castShadow />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} />
        <pointLight position={[0, 8, 0]} intensity={1.0} color="#38bdf8" />

        <Grid
          infiniteGrid
          fadeDistance={35}
          fadeStrength={3}
          cellSize={1}
          cellThickness={1.2}
          cellColor="#475569"
          sectionSize={5}
          sectionThickness={1.8}
          sectionColor="#64748b"
        />

        {/* Render ALL managed 3D components */}
        {addedComponents.map(renderComponent)}

        {/* 3D FLEXIBLE JUMPER WIRES WITH INTERACTIVE DRAGGABLE PIN HANDLES */}
        {isCircuitMode && wireComponents.map((w, idx) => {
          const startPos = w.startPos || [w.position?.[0] - 0.8 || -1.5, 0.45, w.position?.[2] || 0];
          const endPos = w.endPos || [w.position?.[0] + 0.8 || 0.5, 0.45, w.position?.[2] || 0];
          const isSel = selectedComponentId === w.id;

          return (
            <CurvedWire3D
              key={w.id}
              startPos={startPos}
              endPos={endPos}
              isEnergized={isCircuitEnergized}
              wireColor={idx === 0 ? "#ef4444" : idx === 1 ? "#fbbf24" : "#3b82f6"}
              isSelected={isSel}
              label={w.startSnapInfo && w.endSnapInfo
                ? `${w.startSnapInfo} ↔ ${w.endSnapInfo}`
                : w.startSnapInfo || w.endSnapInfo
                  ? `Snap: ${w.startSnapInfo || w.endSnapInfo}`
                  : `Wire #${idx + 1}`}
              isDragEnabled={isDragMode}
              onMoveStartPin={(newPos) => onMoveWirePin?.(w.id, 'start', newPos)}
              onMoveWire={(newPos) => onMoveWirePin?.(w.id, 'center', newPos)}
              onMoveEndPin={(newPos) => onMoveWirePin?.(w.id, 'end', newPos)}
              onClick={() => handleComponentClick(w.id)}
            />
          );
        })}

        {/* Standalone Pendulum */}
        {isPendulumMode && addedComponents.filter(c => c.type === 'pendulum').length === 0 && (
          <Pendulum3D
            length={params.length || 2.5}
            mass={params.mass || 1.5}
            gravity={params.gravity || 9.81}
            isSwinging={isRunning}
          />
        )}

        {/* Standalone Projectile */}
        {isProjectileMode && addedComponents.filter(c => c.type === 'cannon').length === 0 && (
          <Projectile3D
            angle={params.angle || 45}
            velocity={params.velocity || 25}
            gravity={params.gravity || 9.81}
            isFired={isRunning}
          />
        )}

        <SmartOrbitControls isDragging={isDragMode} />
      </Canvas>
    </div>
  );
};
