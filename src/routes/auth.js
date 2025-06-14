const express = require('express')

module.exports = (container) => {
  const router = express.Router()
  const spotifyAuth = container.spotifyAuthService

  const buildErrorRedirect = (errorMessage) => {
    const baseUrl = container.config.app.frontendUrl

    return `${baseUrl}/#error=${encodeURIComponent(errorMessage)}`
  }

  router.get('/login', async (req, res) => {
    try {
      container.logger.log('🔐 Login endpoint accessed')
      container.logger.log('🍪 Existing cookies:', req.cookies)

      const authUrl = await spotifyAuth.getAuthUrl(res)
      container.logger.log('🔗 Auth URL generated:', authUrl)

      res.redirect(authUrl)
    } catch (loginError) {
      container.logger.error('Login failed:', loginError)
      res.redirect(buildErrorRedirect('Login failed'))
    }
  })

  router.get('/callback', async (req, res) => {
    try {
      container.logger.log('Callback endpoint accessed')
      const redirectUrl = await spotifyAuth.handleCallback(req, res)

      container.logger.log('Callback successful')
      res.redirect(redirectUrl)
    } catch (callbackError) {
      container.logger.error('Callback failed:', callbackError)
      res.redirect(buildErrorRedirect('Authentication failed'))
    }
  })

  router.get('/refresh_token', async (_req, res) => {
    try {
      container.logger.log('Refresh token endpoint accessed')
      const redirectUrl = await spotifyAuth.refreshAccessToken()
      res.redirect(redirectUrl)
    } catch (refreshError) {
      container.logger.error('Token refresh failed:', refreshError)
      res.redirect(buildErrorRedirect('Token refresh failed'))
    }
  })

  return router
}
