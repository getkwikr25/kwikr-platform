import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

export const workerProfilePageRoutes = new Hono<{ Bindings: Bindings }>()

// Public worker profile page - REDIRECT TO UNIVERSAL PROFILE
workerProfilePageRoutes.get('/worker/:workerId', async (c) => {
  try {
    const workerId = c.req.param('workerId')
    
    // Redirect all /profile/worker/:workerId requests to the new universal profile system
    return c.redirect(`/universal-profile/${workerId}`, 301)

  } catch (error) {
    console.error('Worker profile page redirect error:', error)
    return c.redirect(`/universal-profile/${workerId}`, 301)
  }
})