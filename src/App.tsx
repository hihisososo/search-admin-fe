import './App.css'
import Layout from "./components/layout/Layout"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from "./app/dashboard/page"
import UserDictionary from "./app/dictionary/user/page"
import SynonymDictionary from "./app/dictionary/synonym/page"
import StopwordDictionary from "./app/dictionary/stopword/page"
import TypoCorrectionDictionary from "./app/dictionary/typo/page"
import SearchSimulator from "./app/search-simulator/page"
import SearchDemo from "./app/search-demo/page"
import DeployManagement from "./app/deploy/page"
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
      <Routes>
        {/* 검색 데모는 별도 레이아웃 (전체 영역 사용) */}
        <Route path="/search-demo" element={<SearchDemo />} />
        
        {/* 관리도구 레이아웃 */}
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dictionary" element={<Navigate to="/dictionary/user" replace />} />
              <Route path="/dictionary/user" element={<UserDictionary />} />
              <Route path="/dictionary/synonym" element={<SynonymDictionary />} />
              <Route path="/dictionary/stopword" element={<StopwordDictionary />} />
              <Route path="/dictionary/typo" element={<TypoCorrectionDictionary />} />
              <Route path="/deploy" element={<DeployManagement />} />
              <Route path="/search-simulator" element={<SearchSimulator />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
