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

const triggerRevalidation = async (slug = null) => {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) return;
  
  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://exanor.com';
  
  const pathsToRevalidate = ['/blog'];
  if (slug) {
    pathsToRevalidate.push(`/blog/${slug}`);
  }

  try {
    for (const path of pathsToRevalidate) {
      await fetch(`${baseUrl}/api/revalidate?secret=${secret}&path=${path}`, { method: 'POST' });
      console.log(`Revalidated path: ${path}`);
    }
  } catch (error) {
    console.error('Failed to trigger revalidation:', error);
  }
};

module.exports = { triggerVercelDeploy, triggerRevalidation };
