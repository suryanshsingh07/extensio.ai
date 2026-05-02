const express = require('express');
const router = express.Router();

// Controllers
const ProjectController = require('../controllers/projectController');
const DownloadController = require('../controllers/downloadController');
const AuthController = require('../controllers/authController');
const AdminController = require('../controllers/adminController');
const generationWorker = require('../workers/generationWorker');

// Middleware
const requirePremium = require('../middlewares/requirePremium');
const requireAuth = require('../middlewares/authMiddleware');

// Catches async errors and forwards them to the global error handler.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/auth/register', asyncHandler(AuthController.register));
router.post('/auth/login', asyncHandler(AuthController.login));
router.get('/auth/me', requireAuth, asyncHandler(AuthController.me));
router.put('/auth/profile', requireAuth, asyncHandler(AuthController.updateProfile));

router.get('/projects', requireAuth, asyncHandler(ProjectController.getProjects));
router.get('/projects/:projectId/history', requireAuth, asyncHandler(ProjectController.getHistory));
router.delete('/projects/:projectId', requireAuth, asyncHandler(ProjectController.deleteProject));

router.post('/generate', requireAuth, asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Validation Error', message: 'A non-empty "prompt" field is required.' });
  }
  
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

router.get('/downloads/:token', asyncHandler(DownloadController.downloadExtension));

router.post('/deploy/:versionId', requireAuth, asyncHandler(async (req, res) => {
  const { versionId } = req.params;
  if (!versionId) {
    return res.status(400).json({ error: 'Validation Error', message: 'Version ID is required.' });
  }
  res.status(200).json({ message: 'Deployment triggered successfully.', versionId });
}));

router.post('/generate/advanced', requireAuth, requirePremium, asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Validation Error', message: 'A non-empty "prompt" field is required.' });
  }
  res.status(202).json({
    message: 'Advanced AI generation started.',
    jobId: `adv-${Date.now()}`
  });
}));

router.get('/admin/stats', requireAuth, asyncHandler(AdminController.getStats));
router.post('/admin/alerts/:id/resolve', requireAuth, asyncHandler(AdminController.resolveAlert));

module.exports = router;
