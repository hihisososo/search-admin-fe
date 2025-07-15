import './App.css'
import Layout from "./components/layout/Layout"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import IndexManagement from "./app/index/page"
import IndexAdd from "./app/index/add/page"
import IndexView from "./app/index/view/page"
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

    return () => {
      logger.info('Application unmounting')
    }
  }, [])

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<div>dashboard</div>} />
          <Route path="/index" element={<IndexManagement />} />
          <Route path="/index/add" element={<IndexAdd />} />
          <Route path="/index/view/:id" element={<IndexView />} />
          <Route path="/dictionary" element={<div>dictionary</div>} />
          <Route path="/search-simulator" element={<div>search-simulator</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
