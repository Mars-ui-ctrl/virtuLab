# 🧪 VirtuLab — Complete System Architecture & Validation Engine

Welcome to the comprehensive technical documentation for **VirtuLab**, an interactive 3D Virtual Science Laboratory & Telemetry Platform built with **React 19**, **Three.js / React Three Fiber**, **TailwindCSS**, and **Node.js Express**.

---

## 📐 1. High-Level Architecture Overview

VirtuLab is engineered as a high-performance **3D WebGL Single-Page Application (SPA)** with real-time telemetry validation and cross-tab student/teacher synchronization.

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                VIRTU-LAB FRONTEND                                 │
│  ┌───────────────────────┐  ┌───────────────────────────┐  ┌───────────────────┐  │
│  │   3D WebGL Canvas     │  │   Validation Engine       │  │   UI & Properties │  │
│  │  (Three.js / R3F)     │  │ (Proximity & Simulation)  │  │  (Tailwind / HUD) │  │
│  └───────────┬───────────┘  └─────────────┬─────────────┘  └─────────┬─────────┘  │
└──────────────┼────────────────────────────┼──────────────────────────┼────────────┘
               │                            │                          │
               ▼                            ▼                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                              REACT CONTEXT (LabContext)                           │
│  • Active Stage State (`addedComponents`)     • Master Simulation Control         │
│  • LocalStorage Session (`virtulab_session`)  • XP & Achievement Engine           │
└──────────────┬─────────────────────────────────────────────────────────┬──────────┘
               │                                                         │
               ▼                                                         ▼
┌──────────────────────────────┐                         ┌──────────────────────────┐
│   BACKEND REST API (Express) │                         │   LOCALSTORAGE SYNC      │
│   • /api/ai/ask (Gemini API) │                         │   • Teacher Monitoring   │
│   • /api/reports/submit      │                         │   • Student Roster XP    │
└──────────────────────────────┘                         └──────────────────────────┘
```

---

## 🧮 2. How VirtuLab Knows an Experiment is Correct (Validation Engine)

VirtuLab uses a **multi-layered physical and chemical telemetry engine** to determine whether an experiment is assembled correctly and progressing properly.

### 2.1 Chemistry Lab Validation Architecture

#### **A. Acid-Base Titration & Phenolphthalein Endpoint (`chem-neutralization`)**
* **Physics/Chemistry Formula**:
  $$\text{Equivalence Volume } V_E = 25.0 \text{ mL (0.1M NaOH neutralizing 25mL 0.1M HCl)}$$
  $$\text{pH Curve Formula: } \text{pH} = 1.50 + \left(\frac{V_{\text{dispensed}}}{25.0}\right) \times 1.8$$
* **Validation Algorithm**:
  1. Checks if Burette Stopcock is opened or `1 Drop` is clicked.
  2. Tracks `dispensedBaseVolume` in liquid state.
  3. **Visual Color Shift Engine**:
     * $V < 24.0 \text{ mL}$: Clear transparent liquid ($\text{pH} < 7.0$).
     * $24.5 \text{ mL} \le V \le 25.5 \text{ mL}$: **Faint Pink Equilibrium** ($\text{pH} \approx 7.00$) $\to$ **Objective 4 & 5 Complete!**
     * $V > 25.5 \text{ mL}$: Deep Magenta Pink ($\text{pH} > 11.0$, Over-titrated warning).

#### **B. Universal pH Testing & Sample Validation (`chem-ph-test`)**
* **Stage Component Presence Validation**:
  * `hasBeaker = addedComponents.some(c => c.type === 'beaker')`
  * `hasStrip = addedComponents.some(c => c.type === 'phstrip')`
* **Real-time Rules**:
  * If `!hasBeaker` (e.g. Student deletes beaker): Live pH readout switches to `pH --.--` with warning `⚠️ NO SAMPLE CONTAINER`.
  * If `hasBeaker && !hasStrip`: Live pH readout displays `pH --.--` with warning `🧪 SAMPLE READY IN BEAKER`.
  * If `hasBeaker && hasStrip`: Active sample pH color shift triggers:
    * 🍋 **Lemon Juice**: $\text{pH } 2.00$ (Crimson Red `#ef4444`)
    * ☕ **Black Coffee**: $\text{pH } 5.00$ (Amber Yellow `#f59e0b`)
    * 💧 **Pure Water**: $\text{pH } 7.00$ (Emerald Green `#22c55e`)
    * 🧼 **Soap Solution**: $\text{pH } 10.00$ (Cyan Blue `#06b6d4`)
    * 🧪 **Bleach Titrant**: $\text{pH } 13.00$ (Violet Purple `#a855f7`)

#### **C. Bunsen Burner + Tripod Magnetic Attachment (`chem-heating`)**
* **Distance Formula**:
  $$D = \sqrt{(x_{\text{beaker}} - x_{\text{burner}})^2 + (z_{\text{beaker}} - z_{\text{burner}})^2}$$
* **Snapping Logic**:
  * When $D \le 1.4$, Bunsen Burner snaps directly below Beaker.
  * Auto-spawns 3D **Tripod Stand & Wire Gauze Mesh**.
  * Elevates Beaker to $Y = 1.35$ while Burner sits at $Y = 0.35$.
  * Flame ignition unlocks thermal liquid heating up to $100.0^\circ\text{C}$ boiling point.

---

### 2.2 Electronics Lab Validation Architecture

#### **A. Magnetic Proximity Snapping (Arduino Uno R3 + Breadboard)**
* **Proximity Check**:
  $$\text{Distance } D = \sqrt{(x_{\text{arduino}} - x_{\text{breadboard}})^2 + (z_{\text{arduino}} - z_{\text{breadboard}})^2}$$
* **Snapping Algorithm**:
  * When $D \le 2.2$, Arduino and Breadboard snap side-by-side.
  * Sets `params.arduinoConnected = true`.
  * Auto-renders 3D **Red (+5V)** & **Blue (GND)** Power Jumper Wires connecting Arduino headers into Breadboard power rails.

#### **B. Breadboard Component Grid Insertion Validation**
* **Bounding Box Calculation**:
  * Breadboard Grid dimensions: $\Delta x \le 1.8, \Delta z \le 1.1$.
  * Component (LED / Resistor / Sensor / Motor) is inserted if:
    $$\left|x_{\text{comp}} - x_{\text{breadboard}}\right| \le 1.8 \quad \text{AND} \quad \left|z_{\text{comp}} - z_{\text{breadboard}}\right| \le 1.1$$
* **Validation Rules**:
  * Components floating on the table outside the breadboard remain **OFF** (`isLit = false`).
  * LED glow & 1Hz firmware blinking trigger **ONLY** when `arduinoConnected === true` **AND** `isInserted === true`.

#### **C. Exact Color Representation**:
* 🔴 **Red LED**: `#880808` (Opaque Crimson body, `#ff0000` emissive glow)
* 🟡 **Yellow LED**: `#d97706` (Amber body, `#ffbb00` emissive glow)
* 🟢 **Green LED**: `#1e8424` (Forest body, `#2DC937` emissive glow)

---

### 2.3 Physics Lab Validation Architecture

#### **A. Simple Pendulum Harmonic Oscillation (`phys-pendulum`)**
* **Physics Equation**:
  $$T = 2\pi \sqrt{\frac{L}{g}}$$
* **Validation Engine**:
  * Dynamically calculates time period $T$ based on length slider $L$ ($0.5\text{m} - 2.0\text{m}$) and gravity $g$ ($9.81\text{ m/s}^2$).
  * 60 FPS harmonic angular motion: $\theta(t) = \theta_0 \cos\left(\sqrt{\frac{g}{L}} \cdot t\right)$.

#### **B. Ohm's Law Circuit Verification (`phys-circuit`)**
* **Circuit Equation**:
  $$I = \frac{V}{R}$$
* **Validation Engine**:
  * Requires Battery, Bulb/Resistor, and Switch connected in closed loop.
  * Calculates live current $I$, power $P = I^2 R$, and bulb brightness emission.

---

## 🤖 3. How the AI Lab Assistant Works

1. **Context Extraction**:
   When the user opens AI Assistant, VirtuLab extracts:
   ```json
   {
     "experimentId": "elec-traffic-light",
     "subject": "electronics",
     "params": { "arduinoConnected": true, "activeLight": "green" },
     "completedObjectives": 4,
     "totalObjectives": 5
   }
   ```
2. **API Communication**:
   Sends an HTTP request to `POST /api/ai/ask`.
3. **Gemini / Physics Fallback Engine**:
   If `GEMINI_API_KEY` is present, it routes to Google Gemini API. If offline, VirtuLab's domain engine calculates exact physical formulas ($V=IR$, $T=2\pi\sqrt{L/g}$, $C_1V_1=C_2V_2$) and returns pedagogical guidance.

---

## 💾 4. LocalStorage & Student-Teacher Live Telemetry Sync

```
[ STUDENT WORKSPACE ]                               [ TEACHER DASHBOARD ]
Student completes step / earns XP                 Teacher Monitoring Portal
         │                                                   │
         ▼                                                   ▼
Update `localStorage`:                            Listen to `storage` &
• `virtulab_user_stats`                            `virtulab_session_updated`
• `virtulab_live_session` ───────────────────────► Instant Live UI Refresh!
```

### Saved Storage Keys:
* `virtulab_user_stats`: Stores Student Name (**Master**), Level, XP, Average Score, Practice Hours.
* `virtulab_completed_ids`: Stores set of completed experiment IDs.
* `virtulab_live_session`: Stores active experiment title, subject, completed objectives, and live status.

---

## 🎮 5. 60 FPS Tabletop Drag & Camera Lock Engine

To prevent screen wobble while repositioning 3D hardware:
1. `DraggableGroup` component intercepts pointer down events.
2. Disables camera controls (`controls.enabled = false`) during pointer drag.
3. Projects 2D mouse cursor onto 3D horizontal tabletop plane ($Y = \text{fixed}$).
4. Restores camera orbit (`controls.enabled = true`) on pointer up.

---

*Documentation generated locally for VirtuLab.*
