export const STUDENT_PROFILE = {
  name: "Alex Mercer",
  title: "Class 12th - Advanced Science",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
  xp: 2450,
  level: 5,
  completedCount: 24,
  hoursPracticed: 38,
  avgScore: 91,
  currentStreak: 12,
  badgesCount: 8
};

export const SUBJECTS = [
  {
    id: "physics",
    name: "Physics Lab",
    description: "Explore circuit mechanics, simple harmonic motion, and projectile dynamics with interactive 3D tools.",
    icon: "Zap",
    color: "#5B5CEB",
    gradient: "from-indigo-600 to-blue-500",
    progress: 80,
    experimentsCount: 6
  },
  {
    id: "chemistry",
    name: "Chemistry Lab",
    description: "Conduct acid-base titrations, chemical heating, and dynamic pH indicators safely in virtual glassware.",
    icon: "FlaskConical",
    color: "#39C6FF",
    gradient: "from-cyan-500 to-blue-600",
    progress: 65,
    experimentsCount: 5
  },
  {
    id: "electronics",
    name: "Electronics Lab",
    description: "Design Tinkercad-style breadboard circuits, program Arduino controllers, and run sensor hardware.",
    icon: "Cpu",
    color: "#6F8BFF",
    gradient: "from-blue-600 to-indigo-700",
    progress: 70,
    experimentsCount: 7
  }
];

export const EXPERIMENTS = {
  "phys-circuit": {
    id: "phys-circuit",
    subject: "physics",
    title: "Ohm's Law & Electric Circuit Builder",
    subtitle: "Physics Lab > Electricity > DC Circuits",
    category: "DC Electricity",
    difficulty: "Beginner",
    estimatedTime: "15 mins",
    xpReward: 100,
    description: "Build a complete DC circuit by connecting a battery source, toggle switch, wire traces, and bulb. Adjust voltage and resistance to verify Ohm's Law (I = V / R).",
    objectives: [
      "Drag Battery, Switch, Wire, and Bulb onto the grid canvas",
      "Connect all components to form a closed loop",
      "Toggle the switch to ON position to complete the circuit",
      "Adjust Voltage slider and observe Bulb brightness and Ammeter readout",
      "Verify that Current (I) increases proportionally with Voltage (V)"
    ],
    defaultParams: {
      voltage: 12, // Volts
      resistance: 10, // Ohms
      switchOpen: false
    }
  },
  "phys-pendulum": {
    id: "phys-pendulum",
    subject: "physics",
    title: "Simple Harmonic Motion (Pendulum)",
    subtitle: "Physics Lab > Mechanics > Oscillations",
    category: "Harmonic Motion",
    difficulty: "Intermediate",
    estimatedTime: "20 mins",
    xpReward: 120,
    description: "Investigate the relationship between pendulum length, bob mass, gravity, and the time period of oscillation (T = 2π√(L/g)).",
    objectives: [
      "Adjust Pendulum Length (L) from 0.5m to 5.0m",
      "Set Bob Mass (m) and select Planetary Gravity (g)",
      "Click Start to initiate smooth 3D pendulum swing",
      "Observe real-time sinusoidal Angle vs. Time wave graph",
      "Calculate and verify the oscillation Time Period (T) and Frequency (f)"
    ],
    defaultParams: {
      length: 2.5, // meters
      mass: 1.5, // kg
      gravity: 9.81, // m/s^2
      initialAngle: 25 // degrees
    }
  },
  "phys-projectile": {
    id: "phys-projectile",
    subject: "physics",
    title: "Projectile Motion Dynamics",
    subtitle: "Physics Lab > Kinematics > 2D Motion",
    category: "2D Kinematics",
    difficulty: "Intermediate",
    estimatedTime: "18 mins",
    xpReward: 110,
    description: "Simulate cannonball trajectories. Adjust launch angle, initial velocity, and gravity to analyze horizontal range, apex height, and time of flight.",
    objectives: [
      "Set Cannon Launch Angle (θ) between 15° and 85°",
      "Adjust Initial Velocity (v₀) between 10 m/s and 50 m/s",
      "Click Launch to fire the projectile along its 3D parabolic arc",
      "Measure Maximum Apex Height (H) and Total Range (R)",
      "Determine the optimum angle for maximum horizontal displacement"
    ],
    defaultParams: {
      angle: 45, // degrees
      velocity: 25, // m/s
      gravity: 9.81 // m/s^2
    }
  },
  "chem-neutralization": {
    id: "chem-neutralization",
    subject: "chemistry",
    title: "Acid-Base Neutralization Titration",
    subtitle: "Chemistry Lab > Analytical > Titration",
    category: "Analytical Chemistry",
    difficulty: "Intermediate",
    estimatedTime: "25 mins",
    xpReward: 150,
    description: "Perform an acid-base neutralization titration by adding Sodium Hydroxide (NaOH) from a burette to Hydrochloric Acid (HCl) with Phenolphthalein indicator.",
    objectives: [
      "Select Hydrochloric Acid (HCl) in the Erlenmeyer flask",
      "Fill the burette with Sodium Hydroxide (NaOH) titrant",
      "Add 3 drops of Phenolphthalein indicator to the acid solution",
      "Dispense base solution drop-by-drop until light pink endpoint",
      "Record equivalence volume and verify pH reaches neutralization (~7.0)"
    ],
    defaultParams: {
      acidType: "HCl",
      baseType: "NaOH",
      acidMolarity: 0.1,
      baseMolarity: 0.1,
      acidVolume: 25, // mL
      dispensedBaseVolume: 0 // mL
    }
  },
  "chem-heating": {
    id: "chem-heating",
    subject: "chemistry",
    title: "Thermal Heating & Phase Change",
    subtitle: "Chemistry Lab > Thermochemistry > Water Heating",
    category: "Thermochemistry",
    difficulty: "Beginner",
    estimatedTime: "15 mins",
    xpReward: 90,
    description: "Heat water in a glass beaker using a Bunsen burner. Observe gradual temperature rise, phase change boiling bubbles, and rising steam particles.",
    objectives: [
      "Place beaker filled with 250mL distilled water over the tripod stand",
      "Insert digital thermometer sensor into the beaker",
      "Ignite Bunsen burner flame and set gas valve intensity",
      "Monitor real-time Temperature vs. Time thermal graph",
      "Observe vapor formation at 100°C boiling point"
    ],
    defaultParams: {
      burnerActive: false,
      flameIntensity: 75,
      waterVolume: 250, // mL
      temperature: 22.5 // °C
    }
  },
  "chem-ph-test": {
    id: "chem-ph-test",
    subject: "chemistry",
    title: "pH Scale & Dynamic Indicator Testing",
    subtitle: "Chemistry Lab > Solutions > Acidity & Alkalinity",
    category: "Solution Chemistry",
    difficulty: "Beginner",
    estimatedTime: "12 mins",
    xpReward: 80,
    description: "Dip universal pH indicator strips into various household and chemical solutions to determine their pH levels on the 0-14 color spectrum.",
    objectives: [
      "Select solution sample (Lemon Juice, Coffee, Pure Water, Soap, Bleach)",
      "Dip universal pH indicator strip into the test solution",
      "Match strip color transformation against the standard pH color scale",
      "Classify sample as Strongly Acidic, Weakly Acidic, Neutral, or Basic",
      "Compare pH values across all 5 test solutions"
    ],
    defaultParams: {
      selectedSolution: "water",
      stripDipped: false
    }
  },
  "elec-led-circuit": {
    id: "elec-led-circuit",
    subject: "electronics",
    title: "Smart Arduino LED Circuit",
    subtitle: "Electronics Lab > Microcontrollers > Basic LED",
    category: "Embedded Hardware",
    difficulty: "Beginner",
    estimatedTime: "15 mins",
    xpReward: 100,
    description: "Connect a high-brightness LED and current-limiting resistor to an Arduino Uno breadboard setup. Verify polarity and light emission.",
    objectives: [
      "Place Arduino Uno R3 and Solderless Breadboard on workspace",
      "Insert Red LED and 220Ω Resistor into breadboard rails",
      "Connect Jumper Wires: Pin 13 -> Anode, GND -> Cathode",
      "Click Run Simulation to send 5V digital signal",
      "Observe LED bloom light emission and current metrics"
    ],
    defaultParams: {
      resistorValue: 220, // Ohms
      pinConnected: true,
      correctPolarity: true
    }
  },
  "elec-traffic-light": {
    id: "elec-traffic-light",
    subject: "electronics",
    title: "Arduino Automated Traffic Light System",
    subtitle: "Electronics Lab > Automation > Timed Sequence",
    category: "Automation & Robotics",
    difficulty: "Intermediate",
    estimatedTime: "20 mins",
    xpReward: 130,
    description: "Program an Arduino Uno to cycle Red, Yellow, and Green LEDs in a real-time traffic signal timing loop with live C++ pseudo code execution line tracking.",
    objectives: [
      "Connect Red (Pin 12), Yellow (Pin 11), and Green (Pin 10) LEDs",
      "Load the Traffic Light sequencing code block into Arduino memory",
      "Click Run Simulation to start automated timing loop",
      "Watch active execution line highlight in C++ code panel",
      "Verify timing cycle: Red (3s) → Yellow (1s) → Green (3s)"
    ],
    defaultParams: {
      cycleSpeed: 1.0,
      activeLight: "red",
      currentCodeLine: 8
    }
  },
  "elec-temp-fan": {
    id: "elec-temp-fan",
    subject: "electronics",
    title: "Smart Temp Sensor & DC Motor Fan",
    subtitle: "Electronics Lab > Sensors > Environmental Control",
    category: "Sensors & Actuators",
    difficulty: "Advanced",
    estimatedTime: "25 mins",
    xpReward: 160,
    description: "Build an environmental controller using a TMP36 Temperature Sensor, DC Servo Fan Motor, warning LED, and audio buzzer alert.",
    objectives: [
      "Wire TMP36 Sensor Analog Output to Pin A0 on Arduino",
      "Connect DC Servo Fan to Pin 9 and Alert Buzzer to Pin 5",
      "Adjust Temperature slider from 15°C up to 60°C",
      "Observe automatic fan activation when temperature exceeds 30.0°C",
      "Inspect live oscilloscope signal and status telemetry"
    ],
    defaultParams: {
      temperature: 24, // °C
      threshold: 30, // °C
      fanActive: false,
      fanRPM: 0
    }
  }
};

export const MOCK_STUDENTS = [
  { id: 1, name: "Aarav Mehta", class: "Physics 12A", experiment: "Electric Circuit Simulation", progress: 100, score: 96, status: "Completed", xp: 2450 },
  { id: 2, name: "Diya Patel", class: "Chemistry 12B", experiment: "Acid-Base Titration", progress: 85, score: 92, status: "In Progress", xp: 2300 },
  { id: 3, name: "Kabir Singh", class: "Electronics 12A", experiment: "Arduino LED Project", progress: 70, score: 88, status: "In Progress", xp: 2150 },
  { id: 4, name: "Meera Joshi", class: "Physics 12A", experiment: "Projectile Motion Lab", progress: 45, score: 78, status: "Pending", xp: 1890 },
  { id: 5, name: "Rohan Verma", class: "Chemistry 12B", experiment: "pH Indicator Testing", progress: 100, score: 94, status: "Completed", xp: 1750 }
];

export const MOCK_ASSIGNMENTS = [
  { id: 1, title: "Ohm's Law Circuit Verification", subject: "Physics", dueDate: "Tomorrow, 5:00 PM", submitted: 28, total: 32 },
  { id: 2, title: "Acid-Base Neutralization Report", subject: "Chemistry", dueDate: "Friday, 11:59 PM", submitted: 22, total: 32 },
  { id: 3, title: "Arduino Traffic Signal Logic", subject: "Electronics", dueDate: "Monday, 10:00 AM", submitted: 15, total: 32 }
];

export const MOCK_WEEKLY_ACTIVITY = [
  { day: "Mon", hours: 2.5, completed: 3 },
  { day: "Tue", hours: 4.0, completed: 5 },
  { day: "Wed", hours: 3.2, completed: 4 },
  { day: "Thu", hours: 5.5, completed: 7 },
  { day: "Fri", hours: 4.8, completed: 6 },
  { day: "Sat", hours: 6.2, completed: 8 },
  { day: "Sun", hours: 7.5, completed: 9 }
];

export const MOCK_CLASS_PERFORMANCE = [
  { subject: "Physics", avgScore: 92, completion: 82 },
  { subject: "Chemistry", avgScore: 88, completion: 76 },
  { subject: "Electronics", avgScore: 94, completion: 91 }
];

export const ACHIEVEMENTS = [
  { id: "ach-1", title: "First Experiment", description: "Successfully performed your first virtual laboratory experiment.", icon: "Trophy", color: "from-amber-400 to-yellow-600", unlocked: true },
  { id: "ach-2", title: "Circuit Master", description: "Completed all DC circuit and Ohm's Law challenges without errors.", icon: "Zap", color: "from-blue-500 to-indigo-600", unlocked: true },
  { id: "ach-3", title: "Chemistry Explorer", description: "Mastered neutralization titrations and pH scale analysis.", icon: "FlaskConical", color: "from-emerald-400 to-teal-600", unlocked: true },
  { id: "ach-4", title: "Fast Learner", description: "Achieved a perfect 100% accuracy score in under 10 minutes.", icon: "Rocket", color: "from-purple-500 to-pink-600", unlocked: true },
  { id: "ach-5", title: "Physics Prodigy", description: "Calculated pendulum harmonic frequencies across 3 planets.", icon: "Compass", color: "from-cyan-400 to-blue-600", unlocked: false },
  { id: "ach-6", title: "Master Educator", description: "Submitted 10 consecutive verified laboratory reports.", icon: "Award", color: "from-rose-500 to-red-600", unlocked: false }
];

export const AI_ASSISTANT_PROMPTS = {
  general: [
    { question: "How do I start an experiment?", answer: "Choose a subject from your dashboard or click any experiment card to open the 3D workspace. Follow the step-by-step objectives panel on the right." },
    { question: "How are scores calculated?", answer: "Scores are based on component placement accuracy, theoretical value precision, experiment completion time, and safety protocol steps." }
  ],
  physics: [
    { question: "Why is my bulb not glowing in the circuit?", answer: "Ensure you have created a complete closed loop! Check that the battery positive/negative terminals connect through the wire, switch, and bulb. Make sure the switch is toggled to ON." },
    { question: "What happens when I increase the voltage?", answer: "According to Ohm's Law (I = V / R), increasing voltage increases electrical current flow proportionally, causing the bulb filament to glow brighter." },
    { question: "How does pendulum length affect time period?", answer: "The period T = 2π√(L/g). Increasing pendulum length (L) increases the time period T, making oscillations slower. Bob mass does NOT alter period!" }
  ],
  chemistry: [
    { question: "Why is the solution still acidic after adding base?", answer: "You haven't added enough Sodium Hydroxide (NaOH) to neutralize the Hydrochloric Acid (HCl). Continue dispensing base drop-by-drop until pH reaches ~7.0." },
    { question: "Why does the phenolphthalein indicator change color?", answer: "Phenolphthalein is colorless in acidic solutions (pH < 8.2) and turns bright pink/magenta in alkaline conditions (pH > 8.2) when base exceeds acid volume." },
    { question: "At what temperature does water boil?", answer: "Water boils at 100°C under standard atmospheric pressure, causing rapid liquid bubble formation and visible rising water vapor steam." }
  ],
  electronics: [
    { question: "Why is my LED not turning on?", answer: "Check LED polarity! LEDs are directional diodes: the longer lead (Anode) must connect to positive 5V / Pin 13, and Cathode connects to GND." },
    { question: "Why do we need a resistor with an LED?", answer: "LEDs have low internal resistance. A 220Ω current-limiting resistor prevents excess current from burning out the LED diode mesh." },
    { question: "How does the temperature fan controller work?", answer: "The TMP36 sensor converts thermal reading to analog voltage. When temperature exceeds 30.0°C, Arduino triggers Digital Pin 9 to spin the DC fan motor." }
  ]
};
