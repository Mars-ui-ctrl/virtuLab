import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Dynamic state store (in-memory & API responsive)
let userProfile = {
  name: "Master",
  title: "Class 12th Science - Active Researcher",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
  xp: 0,
  level: 1,
  completedCount: 0,
  hoursPracticed: 0.5,
  avgScore: 0,
  currentStreak: 1
};

let completedExperimentIds = [];
let userReports = [];

let leaderboard = [
  { rank: 1, name: "Master (You)", xp: 0, badge: "🥇" },
  { rank: 2, name: "Emma Watson", xp: 0, badge: "🥈" },
  { rank: 3, name: "Sophia Chen", xp: 0, badge: "🥉" }
];

let studentRoster = [
  { id: 1, name: "Master", class: "Physics 12A", experiment: "Electric Circuit Builder", progress: 0, score: 0, status: "In Progress", xp: 0 }
];

// Dynamically construct weekly activity so today's day reflects real active day
const DAYS_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const currentDayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];

let weeklyActivity = DAYS_ORDER.map(d => ({
  day: d,
  hours: d === currentDayName ? userProfile.hoursPracticed : 0,
  completed: 0
}));

// Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'VirtuLab Dynamic REST API' });
});

app.get('/api/user/profile', (req, res) => {
  res.json(userProfile);
});

app.post('/api/user/profile', (req, res) => {
  userProfile = { ...userProfile, ...req.body };
  res.json({ success: true, profile: userProfile });
});

app.get('/api/students', (req, res) => {
  res.json(studentRoster);
});

app.get('/api/leaderboard', (req, res) => {
  // Sort leaderboard by XP
  leaderboard.sort((a, b) => b.xp - a.xp);
  leaderboard = leaderboard.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    badge: idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"
  }));
  res.json(leaderboard);
});

app.get('/api/activity', (req, res) => {
  // Make sure today's hours match current userProfile.hoursPracticed
  const todayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
  weeklyActivity = weeklyActivity.map(d =>
    d.day === todayName ? { ...d, hours: userProfile.hoursPracticed } : d
  );
  res.json(weeklyActivity);
});

app.get('/api/reports', (req, res) => {
  res.json(userReports);
});

app.post('/api/reports/submit', (req, res) => {
  const report = req.body;
  userReports.push(report);

  // Update dynamic user stats
  const earnedXP = report.earnedXP || 100;
  const score = report.score || 95;

  if (!completedExperimentIds.includes(report.experimentId)) {
    completedExperimentIds.push(report.experimentId);
  }

  userProfile.xp += earnedXP;
  userProfile.completedCount = completedExperimentIds.length;
  userProfile.avgScore = userProfile.avgScore === 0 ? score : Math.round((userProfile.avgScore + score) / 2);
  userProfile.level = Math.floor(userProfile.xp / 200) + 1;
  userProfile.hoursPracticed = parseFloat((userProfile.hoursPracticed + 0.5).toFixed(1));

  // Update leaderboard & roster
  const userEntry = leaderboard.find(u => u.name.includes("Master"));
  if (userEntry) userEntry.xp = userProfile.xp;

  const rosterEntry = studentRoster.find(s => s.name === "Master");
  if (rosterEntry) {
    rosterEntry.progress = 100;
    rosterEntry.score = score;
    rosterEntry.status = "Completed";
    rosterEntry.xp = userProfile.xp;
    rosterEntry.experiment = report.experimentTitle;
  }

  // Update weekly activity for current day
  const todayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
  weeklyActivity = weeklyActivity.map(d =>
    d.day === todayName ? { ...d, hours: userProfile.hoursPracticed, completed: d.completed + 1 } : d
  );

  res.json({
    success: true,
    message: 'Dynamic score and telemetry recorded successfully.',
    profile: userProfile,
    completedCount: completedExperimentIds.length
  });
});

app.listen(PORT, () => {
  console.log(`VirtuLab Dynamic REST Server active at http://localhost:${PORT}`);
});
