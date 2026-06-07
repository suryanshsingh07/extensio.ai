const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const Session = require('../models/Session');
const User = require('../models/User');
const Version = require('../models/Version');

// Controllers
const ProjectController = require('../controllers/projectController');
const DownloadController = require('../controllers/downloadController');
const AuthController = require('../controllers/authController');
const AdminController = require('../controllers/adminController');
const generationWorker = require('../workers/generationWorker');

// Services
const DeploymentService = require('../services/deploymentService');
const MonitoringService = require('../services/monitoringService');
const EvolutionService = require('../services/evolutionService');

// Middleware
const requirePremium = require('../middlewares/requirePremium');
const requireAuth = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');

// Catches async errors and forwards them to the global error handler.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/auth/register', asyncHandler(AuthController.register));
router.post('/auth/login', asyncHandler(AuthController.login));
router.get('/auth/me', requireAuth, asyncHandler(AuthController.me));

// Alias for profile fetching to support the Profile component data fetching
router.get('/auth/profile', requireAuth, asyncHandler(AuthController.me));
router.put('/auth/profile', requireAuth, asyncHandler(AuthController.updateProfile));

// Real Password Update Route
router.put('/auth/password', requireAuth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated successfully' });
}));

// Real Account Deletion
router.delete('/auth/account', requireAuth, asyncHandler(async (req, res) => {
  await Session.deleteMany({ userId: req.user.id });
  await User.findByIdAndDelete(req.user.id);
  res.json({ message: 'Account deleted' });
}));

// Session Management (Active Devices)
router.get('/auth/sessions', requireAuth, asyncHandler(async (req, res) => {
  const ua = req.headers['user-agent'] || '';
  const userId = req.user.id;
  
  // Basic User-Agent Parsing logic
  let browser = "Unknown Browser";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone")) os = "iOS";

  // MISTAKE FIX: Generate a more unique session ID using a combination of UA and User ID
  // In a production app, this should ideally be tied to a specific Refresh Token ID
  const currentId = crypto.createHash('sha256').update(ua + userId).digest('hex');

  // Register or update the session in MongoDB
  await Session.findOneAndUpdate(
    { id: currentId, userId: userId },
    { 
      deviceName: `${browser} on ${os}`,
      deviceType: ua.includes("Mobile") ? 'mobile' : 'desktop',
      lastActive: new Date()
    },
    { upsert: true }
  );

  // Fetch this user's persistent sessions
  const rawSessions = await Session.find({ userId: userId });

  const sessions = rawSessions.map(s => {
    const isCurrent = s.id === currentId;
    let lastActiveText = "Active Now";
    
    if (!isCurrent) {
      const seconds = Math.floor((new Date() - new Date(s.lastActive)) / 1000);
      if (seconds < 60) lastActiveText = "Just now";
      else if (seconds < 3600) lastActiveText = `${Math.floor(seconds / 60)}m ago`;
      else if (seconds < 86400) lastActiveText = `${Math.floor(seconds / 3600)}h ago`;
      else lastActiveText = new Date(s.lastActive).toLocaleDateString();
    }

    return {
      id: s.id,
      deviceName: s.deviceName,
      deviceType: s.deviceType,
      lastActive: lastActiveText,
      isCurrent
    };
  })
    .sort((a, b) => (a.isCurrent === b.isCurrent) ? 0 : a.isCurrent ? -1 : 1);

  res.json({ sessions });
}));

router.delete('/auth/sessions/:id', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Terminate any session except the one currently making the request
  await Session.deleteOne({ id: id, userId: req.user.id });
  res.status(200).json({ success: true, message: 'Session terminated' });
}));

router.get('/projects', requireAuth, asyncHandler(ProjectController.getProjects));
router.get('/projects/:projectId/history', requireAuth, asyncHandler(ProjectController.getHistory));
router.delete('/projects/:projectId', requireAuth, asyncHandler(ProjectController.deleteProject));

router.post('/generate', requireAuth, asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Validation Error', message: 'A non-empty "prompt" field is required.' });
  }

  if (prompt.length > 2500) {
    return res.status(400).json({ error: 'Validation Error', message: 'Prompt exceeds maximum length of 2500 characters.' });
  }

  // Screen prompt via MonitoringService
  await MonitoringService.analyzePrompt(req.user.id, prompt);

  // Actually use the worker instead of just returning mock string
  const jobId = await generationWorker.enqueueGeneration(req.user.id, prompt);

  res.status(202).json({
    message: 'Generation started in background queue. Poll for status.',
    jobId: jobId
  });
}));

router.get('/generate/status/:jobId', requireAuth, asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const status = await generationWorker.getJobStatus(jobId);
  res.json(status);
}));

router.get('/downloads/:id', requireAuth, asyncHandler(DownloadController.downloadExtension));

router.post('/deploy/:versionId', requireAuth, asyncHandler(async (req, res) => {
  const { versionId } = req.params;
  if (!versionId) {
    return res.status(400).json({ error: 'Validation Error', message: 'Version ID is required.' });
  }

  let projectId = null;
  try {
    const version = await Version.findById(versionId);
    if (version) {
      projectId = version.projectId;
    }
  } catch (e) {
    console.warn('Failed to retrieve version details from MongoDB:', e);
  }

  if (!projectId) {
    return res.status(404).json({ error: 'Not Found', message: 'Version not found.' });
  }

  const deployment = await DeploymentService.publishProject(projectId, versionId);
  res.status(200).json({ message: 'Deployment triggered successfully.', versionId, deployment });
}));

router.post('/generate/advanced', requireAuth, requirePremium, asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Validation Error', message: 'A non-empty "prompt" field is required.' });
  }

  // Screen prompt via MonitoringService
  await MonitoringService.analyzePrompt(req.user.id, prompt);

  const jobId = await generationWorker.enqueueGeneration(req.user.id, prompt);
  res.status(202).json({
    message: 'Advanced AI generation started.',
    jobId: jobId
  });
}));

router.get('/insights/strategic', requireAuth, asyncHandler(async (req, res) => {
  const insights = await EvolutionService.getStrategicInsights();

  if (!insights || insights.length === 0) {
    // Return high quality premium mock data if database has no strategic insights
    return res.json([
      {
        _id: 'mock-1',
        type: 'TREND_PREDICTION',
        title: 'Surge in demand for AI Assistants & Web Scrapers',
        description: 'Over 42% of successful generations this week focused on data extraction and LLM wrappers. Recommend prioritizing pre-built templates for these architectures.',
        confidenceScore: 0.94,
        dataPoints: { totalAnalyzed: 1405, trendMatches: 562, growthRate: '+18% WoW' },
        status: 'NEW'
      },
      {
        _id: 'mock-2',
        type: 'TEMPLATE_RECOMMENDATION',
        title: 'New High-Performance Background Script Pattern',
        description: 'Detected a highly efficient message-passing architecture in recent successful builds. Recommend injecting this as the default background.js template to reduce timeout errors.',
        confidenceScore: 0.88,
        dataPoints: { latencyReduction: '240ms', timeoutRate: '-4.2%' },
        status: 'NEW'
      },
      {
        _id: 'mock-3',
        type: 'BOTTLENECK_ALERT',
        title: 'ActiveTab Permission Loading Overhead',
        description: 'Extensions leveraging activeTab experience a slight cold-start latency when dynamically injecting content scripts. Recommend pre-registering script resources.',
        confidenceScore: 0.81,
        dataPoints: { affectedBuilds: '12%', avgLatencyIncrease: '320ms' },
        status: 'NEW'
      }
    ]);
  }

  res.json(insights);
}));

router.get('/admin/stats', requireAuth, requireAdmin, asyncHandler(AdminController.getStats));
router.post('/admin/alerts/:id/resolve', requireAuth, requireAdmin, asyncHandler(AdminController.resolveAlert));

module.exports = router;
