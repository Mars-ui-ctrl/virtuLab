# 🔬 VirtuLab — Comprehensive Virtual Experiments Curriculum & Telemetry Guide

This document details all **9 interactive 3D virtual experiments** across the Physics, Chemistry, and Electronics laboratories in **VirtuLab**, explaining their scientific purpose, mathematical/chemical principles, learning outcomes, interactive 3D parameters, and how progress and XP telemetry are tracked across the Student and Teacher dashboards.

---

## 📚 Table of Contents
1. [Physics Laboratory Experiments](#1-physics-laboratory-experiments)
   - 1.1 [Ohm's Law & Electric Circuit Builder (`phys-circuit`)](#11-ohms-law--electric-circuit-builder-phys-circuit)
   - 1.2 [Simple Harmonic Motion Pendulum (`phys-pendulum`)](#12-simple-harmonic-motion-pendulum-phys-pendulum)
   - 1.3 [Projectile Motion Dynamics (`phys-projectile`)](#13-projectile-motion-dynamics-phys-projectile)
2. [Chemistry Laboratory Experiments](#2-chemistry-laboratory-experiments)
   - 2.1 [Acid-Base Neutralization Titration (`chem-neutralization`)](#21-acid-base-neutralization-titration-chem-neutralization)
   - 2.2 [Thermal Heating & Phase Change (`chem-heating`)](#22-thermal-heating--phase-change-chem-heating)
   - 2.3 [pH Scale & Dynamic Indicator Testing (`chem-ph-test`)](#23-ph-scale--dynamic-indicator-testing-chem-ph-test)
3. [Electronics Laboratory Experiments](#3-electronics-laboratory-experiments)
   - 3.1 [Smart Arduino LED Circuit (`elec-led-circuit`)](#31-smart-arduino-led-circuit-elec-led-circuit)
   - 3.2 [Arduino Automated Traffic Light System (`elec-traffic-light`)](#32-arduino-automated-traffic-light-system-elec-traffic-light)
   - 3.3 [Smart Temp Sensor & DC Servo Fan Motor (`elec-temp-fan`)](#33-smart-temp-sensor--dc-servo-fan-motor-elec-temp-fan)
4. [Student & Teacher Dashboard Progress Synchronization](#4-student--teacher-dashboard-progress-synchronization)

---

## ⚡ 1. Physics Laboratory Experiments

### 1.1 Ohm's Law & Electric Circuit Builder (`phys-circuit`)
* **Category**: DC Electricity
* **Difficulty**: Beginner | **XP Reward**: +100 XP
* **Scientific Purpose**:
  To investigate the fundamental relationship between voltage ($V$), current ($I$), and electrical resistance ($R$) in a direct current (DC) closed circuit loop.
* **Core Physics Principle & Equation**:
  $$\text{Ohm's Law: } V = I \times R \quad \implies \quad I = \frac{V}{R} \quad (\text{Amperes})$$
  $$\text{Electrical Power Dissipation: } P = V \times I = I^2 R \quad (\text{Watts})$$
* **Interactive 3D Parameters & Controls**:
  * **Voltage Slider ($V$)**: Adjustable from $1\text{V}$ to $24\text{V}$ DC battery source.
  * **Resistance Slider ($R$)**: Adjustable from $1\Omega$ to $100\Omega$.
  * **Interactive Knife Switch**: 3D click to open/close circuit loop.
  * **3D Bulb Glow**: Emissive bloom intensity dynamically scales with power $P = I^2 R$.
* **Student Learning Outcomes**:
  1. Understand closed-circuit continuity and how opening a switch halts current flow ($I = 0$).
  2. Directly verify that electric current $I$ is directly proportional to voltage $V$ and inversely proportional to resistance $R$.
  3. Master using virtual ammeters and voltmeters to measure circuit telemetry.

---

### 1.2 Simple Harmonic Motion Pendulum (`phys-pendulum`)
* **Category**: Mechanics & Oscillations
* **Difficulty**: Intermediate | **XP Reward**: +120 XP
* **Scientific Purpose**:
  To analyze simple harmonic motion (SHM) by determining how pendulum length ($L$), bob mass ($m$), and gravitational acceleration ($g$) affect oscillation period ($T$).
* **Core Physics Principle & Equation**:
  $$T = 2\pi \sqrt{\frac{L}{g}} \quad (\text{Seconds})$$
  $$\text{Angular Oscillation: } \theta(t) = \theta_0 \cos\left(\sqrt{\frac{g}{L}} \cdot t\right)$$
* **Interactive 3D Parameters & Controls**:
  * **Length Slider ($L$)**: Adjustable string length from $0.5\text{m}$ to $5.0\text{m}$.
  * **Bob Mass Slider ($m$)**: Adjustable from $0.1\text{kg}$ to $5.0\text{kg}$.
  * **Gravity Selection ($g$)**: Earth ($9.81\text{ m/s}^2$), Moon ($1.62\text{ m/s}^2$), Jupiter ($24.79\text{ m/s}^2$).
  * **Initial Release Angle ($\theta_0$)**: $5^\circ$ to $45^\circ$.
* **Student Learning Outcomes**:
  1. Prove empirically that pendulum period $T$ depends **only** on length $L$ and gravity $g$, and is independent of bob mass $m$ (for small angle approximations).
  2. Observe energy conservation between potential energy ($PE = mgh$) at apex and kinetic energy ($KE = \frac{1}{2}mv^2$) at lowest equilibrium point.

---

### 1.3 Projectile Motion Dynamics (`phys-projectile`)
* **Category**: 2D Kinematics
* **Difficulty**: Intermediate | **XP Reward**: +110 XP
* **Scientific Purpose**:
  To study 2D parabolic trajectory kinematics by adjusting launch angle ($\theta$) and initial velocity ($v_0$) to measure range and apex height.
* **Core Physics Principle & Equations**:
  $$\text{Horizontal Range: } R = \frac{v_0^2 \sin(2\theta)}{g}$$
  $$\text{Maximum Apex Height: } H = \frac{v_0^2 \sin^2(\theta)}{2g}$$
  $$\text{Total Flight Time: } T = \frac{2v_0 \sin(\theta)}{g}$$
* **Interactive 3D Parameters & Controls**:
  * **Launch Angle ($\theta$)**: $15^\circ$ to $85^\circ$.
  * **Initial Velocity ($v_0$)**: $5\text{ m/s}$ to $50\text{ m/s}$.
  * **Target Marker**: Drag target along 3D terrain grid to test precision hits.
* **Student Learning Outcomes**:
  1. Understand independence of horizontal ($v_x = v_0 \cos\theta$) and vertical ($v_y = v_0 \sin\theta - gt$) velocity vectors.
  2. Prove that maximum horizontal range $R_{\text{max}}$ occurs at launch angle $\theta = 45^\circ$.

---

## 🧪 2. Chemistry Laboratory Experiments

### 2.1 Acid-Base Neutralization Titration (`chem-neutralization`)
* **Category**: Analytical Chemistry
* **Difficulty**: Intermediate | **XP Reward**: +150 XP
* **Scientific Purpose**:
  To determine the concentration of an acid solution ($\text{HCl}$) by volumetric titration against a standard base solution ($\text{NaOH}$) using phenolphthalein indicator.
* **Core Chemical Principle & Equation**:
  $$\text{HCl (aq)} + \text{NaOH (aq)} \longrightarrow \text{NaCl (aq)} + \text{H}_2\text{O (l)}$$
  $$\text{Equivalence Condition: } M_{\text{acid}} \times V_{\text{acid}} = M_{\text{base}} \times V_{\text{base}}$$
* **Interactive 3D Parameters & Controls**:
  * **Interactive Stopcock**: Tap to open burette or click `1 Drop` button.
  * **Phenolphthalein Indicator**: Drop indicator into Erlenmeyer flask.
  * **Dynamic Color Shift Engine**: Clear ($\text{pH} < 7.0$) $\longrightarrow$ **Faint Pink Equilibrium** ($\text{pH} \approx 7.00$, $V = 25.0\text{ mL}$) $\longrightarrow$ Deep Magenta ($\text{pH} > 11.0$, Over-titrated).
* **Student Learning Outcomes**:
  1. Master precise burette reading and drop-by-drop volumetric titrations.
  2. Identify the exact stoichiometry endpoint where acid moles equal base moles.

---

### 2.2 Thermal Heating & Phase Change (`chem-heating`)
* **Category**: Thermochemistry
* **Difficulty**: Beginner | **XP Reward**: +90 XP
* **Scientific Purpose**:
  To measure thermal energy absorption, temperature rise, and phase change boiling dynamics of liquid water over a Bunsen burner flame.
* **Core Chemical Principle & Equation**:
  $$\text{Sensible Heat Addition: } Q = m \cdot c \cdot \Delta T \quad (c_{\text{water}} = 4.184 \text{ J/g}^\circ\text{C})$$
  $$\text{Latent Heat of Vaporization: } Q_v = m \cdot L_v \quad (L_v = 2260 \text{ J/g})$$
* **Interactive 3D Parameters & Controls**:
  * **Magnetic Bunsen Burner & Tripod Stand**: Burner snaps below beaker elevated on tripod ($Y = 1.35$).
  * **Interactive Flame Ignition**: Flame ignites with dual-cone 3D particle fire effect.
  * **Digital Thermometer**: Real-time LCD temperature readout rising to $100.0^\circ\text{C}$.
* **Student Learning Outcomes**:
  1. Differentiate between sensible heat (temperature rise) and latent heat (phase change plateau at $100^\circ\text{C}$).
  2. Observe thermal steam convection and boiling bubble generation.

---

### 2.3 pH Scale & Dynamic Indicator Testing (`chem-ph-test`)
* **Category**: Solution Chemistry
* **Difficulty**: Beginner | **XP Reward**: +80 XP
* **Scientific Purpose**:
  To classify household and laboratory sample solutions along the universal $0 - 14$ pH spectrum using colorimetric indicator strips.
* **Core Chemical Principle & Equation**:
  $$\text{pH} = -\log_{10} \left[ \text{H}^+ \right]$$
  * $\text{pH} < 7$: Acidic ($\text{[H}^+] > \text{[OH}^-]$)
  * $\text{pH} = 7$: Neutral ($\text{[H}^+] = \text{[OH}^-]$)
  * $\text{pH} > 7$: Basic ($\text{[OH}^-] > \text{[H}^+]$)
* **Interactive 3D Parameters & Controls**:
  * **Sample Solution Selector**: Lemon Juice ($\text{pH } 2.0$), Coffee ($\text{pH } 5.0$), Pure Water ($\text{pH } 7.0$), Soap ($\text{pH } 10.0$), Bleach ($\text{pH } 13.0$).
  * **Beaker Validation**: Requiring Glass Beaker + pH Strip on stage for active readout.
* **Student Learning Outcomes**:
  1. Understand logarithmic $\text{H}^+$ concentration scaling.
  2. Read universal indicator color spectrum transformation from Crimson Red to Violet Purple.

---

## 🔌 3. Electronics Laboratory Experiments

### 3.1 Smart Arduino LED Circuit (`elec-led-circuit`)
* **Category**: Microcontrollers & Embedded Hardware
* **Difficulty**: Beginner | **XP Reward**: +100 XP
* **Scientific Purpose**:
  To assemble an Arduino Uno digital output circuit using breadboard rails, current-limiting resistor ($220\Omega$), and LED diode.
* **Core Electronics Principle & Equations**:
  $$V_{\text{resistor}} = V_{\text{digital}} - V_{\text{LED}} = 5.0\text{V} - 2.1\text{V} = 2.9\text{V}$$
  $$I_{\text{LED}} = \frac{2.9\text{V}}{220\Omega} \approx 13.18 \text{ mA}$$
* **Interactive 3D Parameters & Controls**:
  * **Magnetic Breadboard Snapping**: Arduino and Breadboard snap together, spawning 3D +5V Red & GND Blue jumper wires.
  * **1Hz Firmware Clock**: 500ms ON / 500ms OFF real-time LED blinking animation.
* **Student Learning Outcomes**:
  1. Learn breadboard terminal strip architecture and power rail distribution.
  2. Understand current-limiting resistor calculation to prevent LED thermal burnout.

---

### 3.2 Arduino Automated Traffic Light System (`elec-traffic-light`)
* **Category**: Automation & Robotics
* **Difficulty**: Intermediate | **XP Reward**: +130 XP
* **Scientific Purpose**:
  To build an automated 3-phase traffic light controller using digital output pins (Pins 12, 11, 10) and C++ state machine timing firmware.
* **Core Electronics Principle & Sequence**:
  $$\text{Red Phase (3s)} \longrightarrow \text{Yellow Phase (1s)} \longrightarrow \text{Green Phase (3s)}$$
* **Interactive 3D Parameters & Controls**:
  * **Primary Diode Models**: Red (`#880808`), Yellow (`#eab308`), Green (`#2DC937`).
  * **Live C++ Code Execution Console**: Highlights active lines in real-time.
* **Student Learning Outcomes**:
  1. Understand finite state machine (FSM) control logic in embedded C++.
  2. Program GPIO output timing intervals using delay functions.

---

### 3.3 Smart Temp Sensor & DC Servo Fan Motor (`elec-temp-fan`)
* **Category**: Sensors & Actuators
* **Difficulty**: Advanced | **XP Reward**: +160 XP
* **Scientific Purpose**:
  To design an automated closed-loop thermal control system where a TMP36 temperature sensor triggers a DC motor fan above $30.0^\circ\text{C}$.
* **Core Electronics Principle & Equations**:
  $$V_{\text{out}} = (10\text{ mV/}^\circ\text{C} \times T) + 500\text{ mV}$$
  $$\text{ADC Reading (10-bit): } \text{ADC} = \frac{V_{\text{out}}}{5.0\text{V}} \times 1023$$
* **Interactive 3D Parameters & Controls**:
  * **Temperature Slider**: $15^\circ\text{C}$ to $60^\circ\text{C}$ on TMP36 sensor.
  * **2400 RPM DC Servo Fan**: Blade rotation triggers automatically when $T \ge 30.0^\circ\text{C}$.
* **Student Learning Outcomes**:
  1. Understand analog sensor signal conditioning and ADC scaling.
  2. Implement closed-loop threshold control for actuators based on environmental telemetry.

---

## 📊 4. Student & Teacher Dashboard Progress Synchronization

VirtuLab features a **two-way real-time progress synchronization engine** using browser `localStorage` and custom cross-tab events.

```
┌───────────────────────────┐                        ┌───────────────────────────┐
│     STUDENT DASHBOARD     │                        │     TEACHER DASHBOARD     │
│  (`StudentDashboardView`) │                        │  (`TeacherDashboardView`) │
│                           │                        │                           │
│  • Overall Progress (%)   │   Syncs in Real-Time   │  • Live Student Roster    │
│  • Total Earned XP        │ ─────────────────────► │  • Active Lab Telemetry   │
│  • Subject Progress Bars  │    (LocalStorage &    │  • Real-Time XP Monitor   │
│  • Completed Lab Badges   │     Event Listener)    │  • Session Timestamp      │
└───────────────────────────┘                        └───────────────────────────┘
```

### 🔐 How Progress is Saved & Displayed:
1. **Completion & XP Award**:
   When a student finishes all 5 objectives in any experiment and clicks **"Finish & Score"**:
   * `completeExperiment(expId, metrics)` runs in `LabContext.jsx`.
   * Adds experiment ID to `completedExperiments` Set.
   * Adds `+xpReward` (e.g. +100 XP) to `studentStats.xp`.
   * Recomputes average score and increments `completedCount`.
2. **LocalStorage Persistence**:
   * `virtulab_user_stats`: Saved automatically via React `useEffect`.
   * `virtulab_completed_ids`: Saved automatically as JSON array.
   * `virtulab_live_session`: Updated with current experiment title, subject, completed objectives %, and timestamp.
3. **Real-Time Cross-Tab Listener**:
   * Both `StudentDashboardView` and `TeacherDashboardView` attach `window.addEventListener('storage', ...)` and `window.addEventListener('virtulab_session_updated', ...)`.
   * When Master completes a lab in one tab, the Teacher Console in another tab **instantly updates** without needing a page refresh!

---

*Curriculum and Telemetry Guide generated for VirtuLab.*
