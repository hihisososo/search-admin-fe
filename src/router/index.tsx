import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from "@/components/layout/Layout"
import Dashboard from "@/app/dashboard/page"
import UserDictionary from "@/app/dictionary/user/page"
import SynonymDictionary from "@/app/dictionary/synonym/page"
import StopwordDictionary from "@/app/dictionary/stopword/page"
import TypoCorrectionDictionary from "@/app/dictionary/typo/page"
import SearchLogs from "@/app/search-logs/page"
import SearchSimulator from "@/app/search-simulator/page"
import SearchDemo from "@/app/search-demo/page"
import DeployManagement from "@/app/deploy/page"

// 관리도구 라우트들 (Layout 포함)
export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dictionary" element={<Navigate to="/dictionary/user" replace />} />
      <Route path="/dictionary/user" element={<UserDictionary />} />
      <Route path="/dictionary/synonym" element={<SynonymDictionary />} />
      <Route path="/dictionary/stopword" element={<StopwordDictionary />} />
      <Route path="/dictionary/typo" element={<TypoCorrectionDictionary />} />
      <Route path="/search-logs" element={<SearchLogs />} />
      <Route path="/deploy" element={<DeployManagement />} />
      <Route path="/search-simulator" element={<SearchSimulator />} />
    </Routes>
  )
}

// 전체 앱 라우트들
export function AppRoutes() {
  return (
    <Routes>
      {/* 검색 데모는 별도 레이아웃 (전체 영역 사용) */}
      <Route path="/search-demo" element={<SearchDemo />} />
      
      {/* 관리도구 레이아웃 */}
      <Route path="*" element={
        <Layout>
          <AdminRoutes />
        </Layout>
      } />
    </Routes>
  )
} 