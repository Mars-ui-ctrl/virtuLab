import React, { useRef, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';

/* ============================================================
   TABLETOP DRAGGABLE WRAPPER — 60 FPS X, Y, Z Plane Dragging
   Locks camera during component drag so OrbitControls doesn't move screen!
   ============================================================ */
const DraggableGroup = ({ children, position, rotation, onDragEnd, isDragEnabled, isSelected, onClick, fixedY = 0.6 }) => {
  const groupRef = useRef();
  const { raycaster, controls } = useThree();
  const isDragging = useRef(false);
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -fixedY));
  const planeIntersect = useRef(new THREE.Vector3());
  const offset = useRef(new THREE.Vector3());

  useEffect(() => {
    if (groupRef.current && position) {
      groupRef.current.position.set(position[0], position[1] !== undefined ? position[1] : fixedY, position[2]);
    }
    if (groupRef.current && rotation) {
      groupRef.current.rotation.set(rotation[0] || 0, rotation[1] || 0, rotation[2] || 0);
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
      position={position ? [position[0], position[1] !== undefined ? position[1] : fixedY, position[2]] : [0, fixedY, 0]}
      rotation={rotation || [0, 0, 0]}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {isSelected && (
        <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 0.95, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>
      )}
      {children}
    </group>
  );
};

/* ============================================================
   FALLING 3D LIQUID DROPLET (TITRATION DROP-BY-DROP ANIMATION)
   ============================================================ */
const FallingDroplet3D = ({ startPos = [0, 1.8, 0], endY = 0.4, color = "#e879f9", active = false }) => {
  const dropRef = useRef();

  useFrame(({ clock }) => {
    if (dropRef.current && active) {
      const t = (clock.getElapsedTime() * 4) % 1;
      dropRef.current.position.y = startPos[1] - t * (startPos[1] - endY);
      dropRef.current.position.x = startPos[0];
      dropRef.current.position.z = startPos[2];
      dropRef.current.scale.set(1 - t * 0.3, 1 + t * 0.4, 1 - t * 0.3);
    }
  });

  if (!active) return null;

  return (
    <mesh ref={dropRef} position={startPos}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.1} />
    </mesh>
  );
};

// Steam Particles for Boiling Beaker
const SteamParticles = ({ active = false }) => {
  const pointsRef = useRef();
  const particleCount = 40;

  useFrame(() => {
    if (pointsRef.current && active) {
      const positions = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        let y = positions[i * 3 + 1];
        y += 0.03;
        if (y > 2.5) y = 0.5;
        positions[i * 3 + 1] = y;
        positions[i * 3] += (Math.random() - 0.5) * 0.01;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!active) return null;

  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.6;
    positions[i * 3 + 1] = 0.5 + Math.random() * 1.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.09} color="#e2e8f0" transparent opacity={0.8} />
    </points>
  );
};

/* ============================================================
   HIGH-DETAIL 3D TRIPOD STAND & WIRE GAUZE MESH
   Renders underneath Beaker when attached over Bunsen Burner!
   ============================================================ */
const TripodStand3D = () => {
  return (
    <group position={[0, -0.65, 0]}>
      {/* Top Iron Ring */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.8, 0.04, 16, 32]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Wire Gauze Mesh Screen */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.78, 32]} />
        <meshStandardMaterial color="#94a3b8" wireframe metalness={0.8} />
      </mesh>
      {/* Ceramic Heat Diffuser Center Disc */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 24]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
      </mesh>
      {/* 3 Heavy Metal Tripod Legs */}
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => (
        <mesh key={idx} position={[Math.cos(angle) * 0.75, -0.45, Math.sin(angle) * 0.75]} rotation={[0, 0, 0.12]}>
          <cylinderGeometry args={[0.04, 0.04, 0.9, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D GLASS BEAKER WITH GRADUATION LINES
   ============================================================ */
const Beaker3D = ({ liquidColor = "#38bdf8", liquidLevel = 0.6, label = "Beaker (250mL)", isBoiling = false, isSelected = false, hasTripod = false }) => {
  return (
    <group>
      {/* Tripod Stand & Wire Gauze (rendered under beaker when attached over burner) */}
      {hasTripod && <TripodStand3D />}

      {/* Outer Physical Glass Body */}
      <mesh>
        <cylinderGeometry args={[0.75, 0.75, 1.5, 32]} />
        <meshPhysicalMaterial
          color={isSelected ? "#38bdf8" : "#ffffff"}
          transmission={0.96}
          opacity={0.85}
          transparent
          roughness={0.02}
          ior={1.52}
          thickness={0.35}
        />
      </mesh>
      {/* Glass Top Rim */}
      <mesh position={[0, 0.75, 0]}>
        <torusGeometry args={[0.76, 0.03, 16, 32]} />
        <meshPhysicalMaterial color={isSelected ? "#38bdf8" : "#ffffff"} transmission={0.95} transparent opacity={0.9} roughness={0.02} />
      </mesh>

      {/* Volumetric Graduation Tick Mark Lines */}
      {[-0.3, -0.1, 0.1, 0.3, 0.5].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0.74]}>
          <boxGeometry args={[0.3, 0.015, 0.02]} />
          <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
        </mesh>
      ))}

      {/* Fluid Liquid inside Beaker */}
      <mesh position={[0, -0.7 + (liquidLevel * 0.7), 0]}>
        <cylinderGeometry args={[0.7, 0.7, 1.4 * Math.max(0.05, liquidLevel), 32]} />
        <meshStandardMaterial color={liquidColor} roughness={0.15} transparent opacity={0.88} />
      </mesh>

      <SteamParticles active={isBoiling} />

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 1.1, 0]} center className="pointer-events-none select-none">
          <div className="px-2.5 py-1 bg-slate-900/90 text-cyan-300 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap border border-cyan-500/40 pointer-events-none">
            🧪 {label}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D ERLENMEYER FLASK WITH GRADUATION & MENISCUS
   ============================================================ */
const ErlenmeyerFlask3D = ({ liquidColor = "#e0f2fe", liquidLevel = 0.5, label = "Erlenmeyer Flask", isSelected = false, hasIndicator = false }) => {
  return (
    <group>
      {/* Conical Glass Body */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.75, 1.2, 32]} />
        <meshPhysicalMaterial
          color={isSelected ? "#38bdf8" : "#ffffff"}
          transmission={0.96}
          opacity={0.88}
          transparent
          roughness={0.02}
          ior={1.52}
          thickness={0.3}
        />
      </mesh>
      {/* Glass Neck */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 24]} />
        <meshPhysicalMaterial color={isSelected ? "#38bdf8" : "#ffffff"} transmission={0.96} opacity={0.88} transparent roughness={0.02} ior={1.52} thickness={0.2} />
      </mesh>
      {/* Reinforced Rim Ring */}
      <mesh position={[0, 0.85, 0]}>
        <torusGeometry args={[0.22, 0.04, 16, 32]} />
        <meshPhysicalMaterial color={isSelected ? "#38bdf8" : "#ffffff"} transmission={0.96} opacity={0.9} transparent roughness={0.02} />
      </mesh>

      {/* Graduation Markings */}
      {[-0.5, -0.3, -0.1].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0.5 + idx * 0.08]}>
          <boxGeometry args={[0.25, 0.015, 0.02]} />
          <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
        </mesh>
      ))}

      {/* Dynamic Fluid Liquid inside Flask */}
      <mesh position={[0, -0.5 + (liquidLevel * 0.35), 0]}>
        <cylinderGeometry args={[0.25, 0.7, 0.8 * Math.max(0.1, liquidLevel), 32]} />
        <meshStandardMaterial color={liquidColor} roughness={0.12} transparent opacity={0.9} />
      </mesh>

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 1.2, 0]} center className="pointer-events-none select-none">
          <div className="px-2.5 py-1 bg-slate-900/90 text-cyan-300 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap border border-cyan-500/40 pointer-events-none flex items-center space-x-1">
            <span>🧪 {label}</span>
            {hasIndicator && <span className="text-pink-400 font-extrabold text-[9px] bg-pink-950/80 px-1.5 py-0.5 rounded border border-pink-500/40">+ Indicator</span>}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D TEST TUBE & WOODEN COLLAR
   ============================================================ */
const TestTube3D = ({ liquidColor = "#38bdf8", liquidLevel = 0.4, label = "Test Tube", isSelected = false }) => {
  return (
    <group>
      {/* Glass Cylinder Body */}
      <mesh rotation={[0, 0, Math.PI / 12]}>
        <cylinderGeometry args={[0.15, 0.15, 1.8, 24]} />
        <meshPhysicalMaterial color={isSelected ? "#38bdf8" : "#ffffff"} transmission={0.96} opacity={0.88} transparent roughness={0.02} ior={1.52} thickness={0.15} />
      </mesh>
      {/* Rounded Bottom Base */}
      <mesh position={[0.22, -0.85, 0]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshPhysicalMaterial color={isSelected ? "#38bdf8" : "#ffffff"} transmission={0.96} opacity={0.88} transparent roughness={0.02} />
      </mesh>
      {/* Wooden Collar Clamp */}
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.18, 0.05, 12, 24]} />
        <meshStandardMaterial color="#b45309" roughness={0.6} />
      </mesh>
      {/* Liquid Contents */}
      <mesh rotation={[0, 0, Math.PI / 12]} position={[0, -0.3 + (liquidLevel * 0.4), 0]}>
        <cylinderGeometry args={[0.13, 0.13, 1.2 * Math.max(0.1, liquidLevel), 24]} />
        <meshStandardMaterial color={liquidColor} roughness={0.2} transparent opacity={0.85} />
      </mesh>

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 1.1, 0]} center className="pointer-events-none select-none">
          <div className="px-2.5 py-1 bg-slate-900/90 text-cyan-300 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap border border-cyan-500/40 pointer-events-none">
            🧪 {label}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D DROPPING PIPETTE WITH ACTION BUTTON
   ============================================================ */
const DroppingPipette3D = ({ label = "Dropping Pipette", isSelected = false, onAddIndicator }) => {
  return (
    <group>
      {/* Glass Tube */}
      <mesh rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.08, 0.08, 1.5, 16]} />
        <meshPhysicalMaterial color={isSelected ? "#38bdf8" : "#ffffff"} transmission={0.96} opacity={0.88} transparent roughness={0.02} thickness={0.1} />
      </mesh>
      {/* Rubber Bulb (Red Suction Squeeze) */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#ef4444" roughness={0.7} />
      </mesh>

      {/* Action Button to Add Indicator Solution */}
      <Html position={[0, 1.3, 0]} center>
        <button
          onClick={(e) => { e.stopPropagation(); onAddIndicator?.(); }}
          className="px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-[10px] font-black shadow-md border border-pink-300 flex items-center space-x-1 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
          title="Click to add Phenolphthalein Indicator drops into Erlenmeyer flask"
        >
          <span>💧 Add Indicator Drops</span>
        </button>
      </Html>

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 1.7, 0]} center className="pointer-events-none select-none">
          <div className="px-2.5 py-1 bg-slate-900/90 text-cyan-300 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap border border-cyan-500/40 pointer-events-none">
            💧 {label}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D UNIVERSAL pH INDICATOR STRIP
   ============================================================ */
const PhStrip3D = ({ stripColor = "#fbbf24", label = "pH Strip", isSelected = false }) => {
  return (
    <group>
      {/* Strip Paper Base */}
      <mesh rotation={[0, 0, Math.PI / 8]}>
        <boxGeometry args={[0.1, 0.8, 0.02]} />
        <meshStandardMaterial color={isSelected ? "#0284c7" : stripColor} roughness={0.9} />
      </mesh>
      {/* Color Reference Zones */}
      <mesh position={[0, 0.25, 0.015]} rotation={[0, 0, Math.PI / 8]}>
        <boxGeometry args={[0.08, 0.12, 0.01]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 0.1, 0.015]} rotation={[0, 0, Math.PI / 8]}>
        <boxGeometry args={[0.08, 0.12, 0.01]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      <mesh position={[0, -0.05, 0.015]} rotation={[0, 0, Math.PI / 8]}>
        <boxGeometry args={[0.08, 0.12, 0.01]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
      <mesh position={[0, -0.2, 0.015]} rotation={[0, 0, Math.PI / 8]}>
        <boxGeometry args={[0.08, 0.12, 0.01]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 0.6, 0]} center className="pointer-events-none select-none">
          <div className="px-2.5 py-1 bg-slate-900/90 text-cyan-300 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap border border-cyan-500/40 pointer-events-none">
            🎨 {label}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D DIGITAL THERMOMETER
   ============================================================ */
const Thermometer3D = ({ temperature = 22, label = "Digital Thermometer", isSelected = false }) => {
  return (
    <group>
      {/* Metallic Probe Shaft */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Metal Sensing Tip */}
      <mesh position={[0, -0.72, 0]}>
        <coneGeometry args={[0.04, 0.1, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Digital Display Housing */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.38, 0.26, 0.14]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} />
      </mesh>
      {/* LCD Screen Display */}
      <mesh position={[0, 0.3, 0.075]}>
        <boxGeometry args={[0.3, 0.18, 0.01]} />
        <meshBasicMaterial color="#022c22" />
      </mesh>
      {/* Temperature Digital Reading */}
      <Html position={[0, 0.3, 0.1]} center className="pointer-events-none select-none">
        <div className="font-mono text-[9px] font-black text-emerald-400 pointer-events-none select-none">
          {temperature.toFixed(1)}°C
        </div>
      </Html>

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 0.6, 0]} center className="pointer-events-none select-none">
          <div className="px-2.5 py-1 bg-slate-900/90 text-cyan-300 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap border border-cyan-500/40 pointer-events-none">
            🌡️ {label}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D BURETTE & CLAMP STAND WITH BRASS STOPCOCK
   ============================================================ */
const Burette3D = ({ isDripping = false, dispensedVolume = 0, label = "Burette & Stand", isSelected = false, onToggleStopcock }) => {
  const stopcockRef = useRef();

  useFrame(() => {
    if (stopcockRef.current) {
      stopcockRef.current.rotation.z = isDripping ? Math.PI / 2 : 0;
    }
  });

  const liquidHeight = Math.max(0.1, 2.0 * (1 - (dispensedVolume / 50.0)));

  return (
    <group>
      {/* Heavy Metal Base Plate */}
      <mesh position={[-0.8, -0.95, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Vertical Clamp Stand Rod */}
      <mesh position={[-0.8, 0.6, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 3.2, 16]} />
        <meshStandardMaterial color={isSelected ? "#38bdf8" : "#64748b"} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Horizontal Double-Jaw Clamp Arm */}
      <mesh position={[-0.4, 1.1, 0]}>
        <boxGeometry args={[0.8, 0.08, 0.08]} />
        <meshStandardMaterial color={isSelected ? "#38bdf8" : "#334155"} metalness={0.8} />
      </mesh>

      {/* Burette Glass Cylinder Column */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 2.2, 24]} />
        <meshPhysicalMaterial color={isSelected ? "#38bdf8" : "#ffffff"} transmission={0.96} transparent opacity={0.8} roughness={0.02} ior={1.52} />
      </mesh>

      {/* Titrant Liquid inside Burette Tube */}
      <mesh position={[0, 0.0 + (liquidHeight / 2), 0]}>
        <cylinderGeometry args={[0.12, 0.12, liquidHeight, 24]} />
        <meshStandardMaterial color="#e879f9" roughness={0.2} transparent opacity={0.85} />
      </mesh>

      {/* Interactive Stopcock Valve Handle */}
      <group
        position={[0, 0.0, 0]}
        onClick={(e) => { e.stopPropagation(); onToggleStopcock?.(); }}
      >
        <mesh ref={stopcockRef}>
          <cylinderGeometry args={[0.08, 0.08, 0.45, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={isDripping ? "#ef4444" : "#22c55e"} metalness={0.7} />
        </mesh>
        <Html position={[0.4, 0, 0]} center>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStopcock?.(); }}
            className={`px-2 py-0.5 rounded-full text-[9px] font-black shadow-md border transition-all cursor-pointer ${
              isDripping
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-emerald-600 text-white border-emerald-400'
            }`}
          >
            {isDripping ? '🔴 STOPCOCK OPEN (DRIPPING)' : '🟢 CLICK STOPCOCK TO DRIP'}
          </button>
        </Html>
      </group>

      {/* Burette Tapered Tip */}
      <mesh position={[0, -0.3, 0]}>
        <coneGeometry args={[0.1, 0.3, 16]} rotation={[Math.PI, 0, 0]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.8} />
      </mesh>

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 2.4, 0]} center className="pointer-events-none select-none">
          <div className="px-2.5 py-1 bg-slate-900/90 text-cyan-300 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap border border-cyan-500/40 pointer-events-none">
            🧪 {label} ({(50.0 - dispensedVolume).toFixed(1)} mL left)
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D BUNSEN BURNER WITH DUAL CONE FLAME & IGNITION BUTTON
   ============================================================ */
const BunsenBurner3D = ({ isActive = false, intensity = 75, label = "Bunsen Burner", isSelected = false, onToggleFlame }) => {
  return (
    <group>
      {/* Octagonal Heavy Brass Base */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.12, 8]} />
        <meshStandardMaterial color={isSelected ? "#38bdf8" : "#1e293b"} metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Air Adjustment Collar */}
      <mesh position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.12, 16]} />
        <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Chrome Chimney Barrel */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.45, 16]} />
        <meshStandardMaterial color={isSelected ? "#38bdf8" : "#94a3b8"} metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Interactive Button to Ignite / Extinguish Burner Flame */}
      <Html position={[0, 0.4, 0]} center>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFlame?.(); }}
          className={`px-2.5 py-1 rounded-full text-[9px] font-black shadow-md border transition-all cursor-pointer whitespace-nowrap ${
            isActive
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
              : 'bg-amber-600 text-white border-amber-400 hover:bg-amber-500'
          }`}
        >
          {isActive ? '🔥 IGNITED (CLICK TO EXTINGUISH)' : '⚡ CLICK TO IGNITE FLAME'}
        </button>
      </Html>

      {/* Dual Cone Animated Flame */}
      {isActive && (
        <group position={[0, 0.7, 0]}>
          <mesh>
            <coneGeometry args={[0.18, 0.65, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.95} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <coneGeometry args={[0.1, 0.35, 16]} />
            <meshBasicMaterial color="#a5f3fc" transparent opacity={0.9} />
          </mesh>
          <pointLight color="#38bdf8" intensity={intensity / 15} distance={6} />
        </group>
      )}

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 1.2, 0]} center className="pointer-events-none select-none">
          <div className="px-2.5 py-1 bg-slate-900/90 text-cyan-300 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap border border-cyan-500/40 pointer-events-none">
            🔥 {label}
          </div>
        </Html>
      )}
    </group>
  );
};

export const ChemistryCanvas = ({
  experimentId,
  params,
  addedComponents = [],
  onSelectComponent,
  selectedComponentId,
  activeTool = 'pointer',
  onMoveComponent,
  onToggleDrip,
  onDispenseDrop,
  onAddIndicator,
  onToggleFlame
}) => {
  const isNeutralization = experimentId === 'chem-neutralization';

  // Check if burner is attached under beaker
  const burnerAttached = params.burnerAttached || false;

  // Live Liquid Color Calculation
  let liquidColor = "#38bdf8";
  if (isNeutralization) {
    const vol = params.dispensedBaseVolume || 0;
    if (vol >= 24.5 && vol <= 25.5) {
      liquidColor = "#f472b6"; // Light Pink Neutral Endpoint
    } else if (vol > 25.5) {
      liquidColor = "#c026d3"; // Dark Magenta Base
    } else {
      liquidColor = "#e0f2fe"; // Clear Acid
    }
  }

  const isDripping = params.isDripping || false;

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      <Canvas camera={{ position: [0, 2.5, 6.0], fov: 45 }} shadows className="w-full h-full">
        <ambientLight intensity={1.3} />
        <hemisphereLight skyColor="#ffffff" groundColor="#334155" intensity={1.5} />
        <directionalLight position={[8, 14, 8]} intensity={2.2} castShadow />

        <Grid
          infiniteGrid
          fadeDistance={30}
          cellSize={0.8}
          cellThickness={1.0}
          cellColor="#475569"
          sectionSize={4}
          sectionColor="#64748b"
        />

        {/* Dynamic 3D Droplet Particles during Titration Drip */}
        {isNeutralization && (
          <FallingDroplet3D
            startPos={[0, 1.8, 0]}
            endY={0.5}
            color="#e879f9"
            active={isDripping}
          />
        )}

        {/* Render 3D Components Wrapped in Tabletop DraggableGroup */}
        {addedComponents.map((comp, idx) => {
          const isSel = selectedComponentId === comp.id;
          const pos = comp.position || [(idx - (addedComponents.length - 1) / 2) * 2.0, 0.6, 0];
          const rot = comp.rotation || [0, 0, 0];

          return (
            <DraggableGroup
              key={comp.id}
              position={pos}
              rotation={rot}
              isDragEnabled={activeTool === 'move'}
              isSelected={isSel}
              onClick={() => onSelectComponent?.(comp.id)}
              onDragEnd={(newPos) => onMoveComponent?.(comp.id, newPos)}
              fixedY={comp.type === 'beaker' && burnerAttached ? 1.35 : comp.type === 'burner' && burnerAttached ? 0.35 : 0.6}
            >
              {comp.type === 'beaker' && (
                <Beaker3D
                  liquidColor={comp.liquidColor || "#38bdf8"}
                  liquidLevel={comp.liquidLevel || 0.6}
                  label={comp.name}
                  isBoiling={params.temperature >= 95}
                  isSelected={isSel}
                  hasTripod={burnerAttached}
                />
              )}
              {comp.type === 'erlenmeyer' && (
                <ErlenmeyerFlask3D
                  liquidColor={liquidColor}
                  liquidLevel={0.4 + (params.dispensedBaseVolume || 0) * 0.01}
                  label={comp.name}
                  isSelected={isSel}
                  hasIndicator={params.indicatorAdded}
                />
              )}
              {comp.type === 'testtube' && (
                <TestTube3D
                  liquidColor={comp.liquidColor || "#22c55e"}
                  liquidLevel={comp.liquidLevel || 0.4}
                  label={comp.name}
                  isSelected={isSel}
                />
              )}
              {comp.type === 'pipette' && (
                <DroppingPipette3D label={comp.name} isSelected={isSel} onAddIndicator={onAddIndicator} />
              )}
              {comp.type === 'phstrip' && (
                <PhStrip3D stripColor={params.stripColor || "#fbbf24"} label={comp.name} isSelected={isSel} />
              )}
              {comp.type === 'thermometer' && (
                <Thermometer3D temperature={params.temperature || 22.5} label={comp.name} isSelected={isSel} />
              )}
              {comp.type === 'burette' && (
                <Burette3D
                  isDripping={isDripping}
                  dispensedVolume={params.dispensedBaseVolume || 0}
                  label={comp.name}
                  isSelected={isSel}
                  onToggleStopcock={onToggleDrip}
                />
              )}
              {comp.type === 'burner' && (
                <BunsenBurner3D
                  isActive={params.burnerActive}
                  intensity={params.flameIntensity || 75}
                  label={comp.name}
                  isSelected={isSel}
                  onToggleFlame={onToggleFlame}
                />
              )}
            </DraggableGroup>
          );
        })}

        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.02} minDistance={2.5} maxDistance={14} />
      </Canvas>
    </div>
  );
};
