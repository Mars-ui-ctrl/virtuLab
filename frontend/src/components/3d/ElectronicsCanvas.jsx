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
          <ringGeometry args={[0.9, 1.05, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>
      )}
      {children}
    </group>
  );
};

/* ============================================================
   POWER JUMPER WIRES (Rendered when Arduino & Breadboard Connect)
   ============================================================ */
const PowerJumperWires3D = ({ startPos = [-1.0, 0.7, 0], endPos = [0.8, 0.7, 0] }) => {
  return (
    <group>
      {/* 5V Red Jumper Wire Curve */}
      <mesh>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(startPos[0], 0.75, startPos[2] - 0.4),
            new THREE.Vector3((startPos[0] + endPos[0]) / 2, 1.2, (startPos[2] + endPos[2]) / 2 - 0.2),
            new THREE.Vector3(endPos[0], 0.75, endPos[2] - 0.4)
          ]),
          24, 0.03, 8, false
        ]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>

      {/* GND Blue Jumper Wire Curve */}
      <mesh>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(startPos[0], 0.75, startPos[2] + 0.4),
            new THREE.Vector3((startPos[0] + endPos[0]) / 2, 1.1, (startPos[2] + endPos[2]) / 2 + 0.2),
            new THREE.Vector3(endPos[0], 0.75, endPos[2] + 0.4)
          ]),
          24, 0.03, 8, false
        ]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.3} />
      </mesh>
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D ARDUINO UNO R3 MICROCONTROLLER BOARD
   ============================================================ */
const ArduinoUno3D = ({ label = "Arduino Uno R3", isSelected = false }) => {
  return (
    <group>
      {/* PCB Board */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 0.14, 1.7]} />
        <meshStandardMaterial color={isSelected ? "#0284c7" : "#005e9e"} metalness={0.4} roughness={0.3} />
      </mesh>
      {/* ATmega328P DIP Chip */}
      <mesh position={[0.2, 0.12, -0.1]}>
        <boxGeometry args={[1.1, 0.09, 0.35]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} />
      </mesh>
      {/* USB Type-B Port */}
      <mesh position={[-1.0, 0.18, -0.4]}>
        <boxGeometry args={[0.45, 0.28, 0.4]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* DC Barrel Jack */}
      <mesh position={[-1.0, 0.18, 0.45]}>
        <boxGeometry args={[0.45, 0.28, 0.35]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} />
      </mesh>
      {/* Digital Pin Headers */}
      <mesh position={[0, 0.12, 0.72]}>
        <boxGeometry args={[1.9, 0.16, 0.14]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Power / Analog Pin Headers */}
      <mesh position={[0, 0.12, -0.72]}>
        <boxGeometry args={[1.9, 0.16, 0.14]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Power LED Indicator */}
      <mesh position={[-0.4, 0.1, 0]}>
        <boxGeometry args={[0.08, 0.05, 0.08]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 0.8, 0]} center className="pointer-events-none select-none">
          <div className="px-2.5 py-1 bg-sky-950/90 text-cyan-300 border border-cyan-400/50 rounded-lg text-[10px] font-extrabold shadow-lg whitespace-nowrap pointer-events-none">
            🤖 {label}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D SOLDERLESS BREADBOARD
   ============================================================ */
const Breadboard3D = ({ label = "Breadboard", isSelected = false }) => {
  return (
    <group>
      {/* White Plastic Base Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.4, 0.16, 1.9]} />
        <meshStandardMaterial color={isSelected ? "#e0f2fe" : "#f8fafc"} roughness={0.3} />
      </mesh>
      {/* Positive Power Rail (Red Line) */}
      <mesh position={[0, 0.09, 0.85]}>
        <boxGeometry args={[3.2, 0.02, 0.05]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      {/* Negative Power Rail (Blue Line) */}
      <mesh position={[0, 0.09, 0.75]}>
        <boxGeometry args={[3.2, 0.02, 0.05]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      {/* Center Divider Groove */}
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[3.3, 0.02, 0.08]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 0.7, 0]} center className="pointer-events-none select-none">
          <div className="px-2.5 py-1 bg-slate-900/90 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap pointer-events-none">
            🔌 {label}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D REALISTIC LED DIODE (VIBRANT RED/YELLOW/GREEN)
   ============================================================ */
const LED3D = ({ type = "led-red", isLit = false, label = "LED", isSelected = false, isInserted = true }) => {
  const lightRef = useRef();

  // Vibrant, true primary LED color spectrum requested by Master
  let baseColor = "#880808"; // Deep Blood Red (Off)
  let glowColor = "#880808"; // Pure Red Glow (On)

  if (type === 'led-yellow') {
    baseColor = "#d97706"; // Amber Gold (Off)
    glowColor = "#ffbb00"; // Pure Yellow-Orange Glow (On)
  } else if (type === 'led-green') {
    baseColor = "#1e8424"; // Forest Green (Off)
    glowColor = "#2DC937"; // Signal Green Glow (On)
  }

  const activeColor = isLit ? glowColor : baseColor;

  return (
    <group>
      {/* Metallic Silver Base Ring Collar */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.08, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Anodized Silver Lead Pins */}
      <mesh position={[-0.05, -0.22, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.35, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} />
      </mesh>
      <mesh position={[0.05, -0.22, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.35, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} />
      </mesh>

      {/* Solid Opaque Vibrant Bulb Dome Body */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.35, 24]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={isLit ? glowColor : "#000000"}
          emissiveIntensity={isLit ? 3.5 : 0}
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>
      {/* Rounded Dome Top */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={isLit ? glowColor : "#000000"}
          emissiveIntensity={isLit ? 3.5 : 0}
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>

      {/* 3D Room PointLight Illumination */}
      {isLit && <pointLight ref={lightRef} color={glowColor} intensity={5.0} distance={6} />}

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 0.7, 0]} center className="pointer-events-none select-none">
          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow-md whitespace-nowrap border border-slate-700 pointer-events-none ${
            isLit ? 'bg-emerald-500 text-white animate-pulse' : !isInserted ? 'bg-amber-950 text-amber-300 border-amber-500/50' : 'bg-slate-900/90 text-cyan-300'
          }`}>
            💡 {label} {!isInserted ? '(NOT ON BREADBOARD)' : isLit ? 'ON (ACTIVE)' : 'OFF'}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D RESISTOR WITH COLOR BANDS (220Ω)
   ============================================================ */
const Resistor3D = ({ label = "220Ω Resistor", isSelected = false }) => {
  return (
    <group>
      {/* Wire Leads */}
      <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>
      {/* Beige Ceramic Body */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshStandardMaterial color={isSelected ? "#38bdf8" : "#fef3c7"} roughness={0.4} />
      </mesh>

      {/* Color Bands (Red-Red-Brown-Gold = 220Ω) */}
      <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.105, 0.105, 0.04, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[-0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.105, 0.105, 0.04, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.105, 0.105, 0.04, 16]} />
        <meshBasicMaterial color="#78350f" />
      </mesh>
      <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.105, 0.105, 0.04, 16]} />
        <meshStandardMaterial color="#d97706" metalness={0.8} />
      </mesh>

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 0.5, 0]} center className="pointer-events-none select-none">
          <div className="px-2.5 py-1 bg-slate-900/90 text-cyan-300 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap border border-cyan-500/40 pointer-events-none">
            ⚡ {label}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D TMP36 TEMPERATURE SENSOR
   ============================================================ */
const TempSensor3D = ({ temperature = 24, label = "TMP36 Sensor", isSelected = false }) => {
  return (
    <group>
      {/* 3 Lead Pins */}
      {[-0.08, 0, 0.08].map((x, idx) => (
        <mesh key={idx} position={[x, -0.2, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>
      ))}
      {/* Black TO-92 Transistor Package Body */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.3, 16, 1, false, 0, Math.PI * 1.5]} />
        <meshStandardMaterial color={isSelected ? "#0284c7" : "#1e293b"} roughness={0.3} />
      </mesh>

      {/* Temperature Digital Readout Display */}
      <Html position={[0, 0.55, 0]} center className="pointer-events-none select-none">
        <div className="px-2 py-0.5 bg-slate-900 text-emerald-400 font-mono text-[9px] font-black rounded border border-emerald-500/40 shadow-md whitespace-nowrap">
          🌡️ {temperature.toFixed(1)}°C
        </div>
      </Html>

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 0.9, 0]} center className="pointer-events-none select-none">
          <div className="px-2.5 py-1 bg-slate-900/90 text-cyan-300 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap border border-cyan-500/40 pointer-events-none">
            🌡️ {label}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D DC SERVO FAN MOTOR
   ============================================================ */
const FanMotor3D = ({ isSpinning = false, rpm = 2400, label = "DC Servo Fan", isSelected = false }) => {
  const bladesRef = useRef();

  useFrame(() => {
    if (bladesRef.current && isSpinning) {
      bladesRef.current.rotation.y += 0.35;
    }
  });

  return (
    <group>
      {/* Motor Casing Base */}
      <mesh>
        <cylinderGeometry args={[0.35, 0.35, 0.45, 16]} />
        <meshStandardMaterial color={isSelected ? "#38bdf8" : "#334155"} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rotating Fan Blades */}
      <group ref={bladesRef} position={[0, 0.28, 0]}>
        <mesh rotation={[0, 0, 0.25]}>
          <boxGeometry args={[1.3, 0.04, 0.22]} />
          <meshStandardMaterial color="#0284c7" metalness={0.5} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0.25]}>
          <boxGeometry args={[1.3, 0.04, 0.22]} />
          <meshStandardMaterial color="#0284c7" metalness={0.5} />
        </mesh>
      </group>

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 0.8, 0]} center className="pointer-events-none select-none">
          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap border border-slate-700 pointer-events-none ${
            isSpinning ? 'bg-cyan-500 text-white animate-pulse' : 'bg-slate-900/90 text-cyan-300'
          }`}>
            🌀 {label} {isSpinning ? `(${rpm} RPM)` : 'IDLE'}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================
   HIGH-DETAIL 3D PUSH BUTTON SWITCH
   ============================================================ */
const PushButton3D = ({ label = "Push Switch Button", isSelected = false }) => {
  return (
    <group>
      {/* Black Square Base */}
      <mesh>
        <boxGeometry args={[0.35, 0.15, 0.35]} />
        <meshStandardMaterial color={isSelected ? "#0284c7" : "#1e293b"} roughness={0.3} />
      </mesh>
      {/* Red Tactile Button Cap */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>

      {/* ONLY SHOW NAME TAG WHEN SELECTED */}
      {isSelected && (
        <Html position={[0, 0.5, 0]} center className="pointer-events-none select-none">
          <div className="px-2.5 py-1 bg-slate-900/90 text-cyan-300 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap border border-cyan-500/40 pointer-events-none">
            🔘 {label}
          </div>
        </Html>
      )}
    </group>
  );
};

export const ElectronicsCanvas = ({
  experimentId,
  params,
  addedComponents = [],
  onSelectComponent,
  selectedComponentId,
  activeTool = 'pointer',
  onMoveComponent,
  isRunning = false
}) => {
  const isLEDCircuit = experimentId === 'elec-led-circuit';
  const isTrafficLight = experimentId === 'elec-traffic-light';
  const isTempFan = experimentId === 'elec-temp-fan';

  const isConnected = params.arduinoConnected || false;
  const activeLight = params.activeLight || 'red';

  const arduinoComp = addedComponents.find(c => c.type === 'arduino');
  const breadboardComp = addedComponents.find(c => c.type === 'breadboard');
  const breadPos = breadboardComp ? (breadboardComp.position || [0.8, 0.6, 0]) : null;

  // Function to check if a component is placed on/connected to the Breadboard grid
  const isOnBreadboard = (compPos) => {
    if (!breadboardComp || !breadPos || !compPos) return false;
    const dx = Math.abs(compPos[0] - breadPos[0]);
    const dz = Math.abs(compPos[2] - breadPos[2]);
    return dx <= 1.8 && dz <= 1.1;
  };

  const motorComp = addedComponents.find(c => c.type === 'motor');
  const isFanOnBoard = motorComp ? isOnBreadboard(motorComp.position) : false;
  const isFanSpinning = isTempFan && isRunning && isConnected && isFanOnBoard && (params.temperature || 24) >= 30;

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      <Canvas
        camera={{ position: [0, 4.0, 6.0], fov: 45 }}
        shadows
        className="w-full h-full"
      >
        <ambientLight intensity={1.3} />
        <hemisphereLight skyColor="#ffffff" groundColor="#334155" intensity={1.5} />
        <directionalLight position={[10, 16, 10]} intensity={2.2} castShadow />

        <Grid
          infiniteGrid
          fadeDistance={30}
          cellSize={0.8}
          cellThickness={1.0}
          cellColor="#475569"
          sectionSize={4}
          sectionColor="#64748b"
        />

        {/* Photorealistic 3D Power Jumper Wires when Arduino and Breadboard connect */}
        {isConnected && arduinoComp && breadboardComp && (
          <PowerJumperWires3D
            startPos={arduinoComp.position || [-1.0, 0.6, 0]}
            endPos={breadboardComp.position || [0.8, 0.6, 0]}
          />
        )}

        {/* Dynamically Placed 3D Electronics Modules (Wrapped in DraggableGroup) */}
        {addedComponents.map((comp, idx) => {
          const isSel = selectedComponentId === comp.id;
          const pos = comp.position || [(idx - (addedComponents.length - 1) / 2) * 2.0, 0.6, 0];
          const rot = comp.rotation || [0, 0, 0];

          // Check if component is inserted onto the Breadboard grid
          const isInserted = isOnBreadboard(pos);

          // Determine LED glowing state: MUST be inserted on Breadboard AND connected to Arduino!
          let isLit = false;
          if (comp.type.startsWith('led')) {
            if (isInserted && isConnected) {
              if (isLEDCircuit) {
                isLit = isRunning && (params.ledBlinking ?? true);
              } else if (isTrafficLight) {
                if (comp.type === 'led-red') isLit = isRunning && activeLight === 'red';
                else if (comp.type === 'led-yellow') isLit = isRunning && activeLight === 'yellow';
                else if (comp.type === 'led-green') isLit = isRunning && activeLight === 'green';
                else isLit = isRunning;
              } else {
                isLit = isRunning;
              }
            }
          }

          return (
            <DraggableGroup
              key={comp.id}
              position={pos}
              rotation={rot}
              isDragEnabled={activeTool === 'move'}
              isSelected={isSel}
              onClick={() => onSelectComponent?.(comp.id)}
              onDragEnd={(newPos) => onMoveComponent?.(comp.id, newPos)}
              fixedY={0.6}
            >
              {comp.type === 'arduino' && (
                <ArduinoUno3D label={comp.name} isSelected={isSel} />
              )}
              {comp.type === 'breadboard' && (
                <Breadboard3D label={comp.name} isSelected={isSel} />
              )}
              {comp.type.startsWith('led') && (
                <LED3D
                  type={comp.type}
                  isLit={isLit}
                  label={comp.name}
                  isSelected={isSel}
                  isInserted={isInserted}
                />
              )}
              {comp.type === 'resistor' && (
                <Resistor3D label={comp.name} isSelected={isSel} />
              )}
              {comp.type === 'sensor' && (
                <TempSensor3D temperature={params.temperature || 24} label={comp.name} isSelected={isSel} />
              )}
              {comp.type === 'motor' && (
                <FanMotor3D isSpinning={isFanSpinning} rpm={2400} label={comp.name} isSelected={isSel} />
              )}
              {comp.type === 'button' && (
                <PushButton3D label={comp.name} isSelected={isSel} />
              )}
            </DraggableGroup>
          );
        })}

        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.02} minDistance={2.5} maxDistance={14} />
      </Canvas>
    </div>
  );
};
