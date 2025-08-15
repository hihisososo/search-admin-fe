import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './router'
import { useEffect } from 'react'
import { logger } from './lib/logger'
import { config } from './lib/config'

function App() {
  useEffect(() => {
    // 앱 초기화
    logger.info('Application started', {
      version: '1.0.0',
      environment: config.get('environment'),
      userAgent: navigator.userAgent,
      url: window.location.href
    })

    document.title = 'Search Admin'

    return () => {
      logger.info('Application unmounting')
    }
  }, [])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
