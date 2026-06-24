const triggerVercelDeploy = async () => {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK;
  if (!hookUrl) return;
  try {
    await fetch(hookUrl, { method: 'POST' });
    console.log('Vercel deploy triggered successfully');
  } catch (error) {
    console.error('Failed to trigger Vercel deploy:', error);
  }
};

module.exports = { triggerVercelDeploy };
