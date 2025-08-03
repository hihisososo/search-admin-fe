import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from "@/components/layout/Layout"
import { LoadingSpinner } from "@/components/dictionary/common"

const Dashboard = lazy(() => import("@/app/dashboard/page"))
const UserDictionary = lazy(() => import("@/app/dictionary/user/page"))
const SynonymDictionary = lazy(() => import("@/app/dictionary/synonym/page"))
const StopwordDictionary = lazy(() => import("@/app/dictionary/stopword/page"))
const TypoCorrectionDictionary = lazy(() => import("@/app/dictionary/typo/page"))
const SearchLogs = lazy(() => import("@/app/search-logs/page"))
const SearchSimulator = lazy(() => import("@/app/search-simulator/page"))
const SearchDemo = lazy(() => import("@/app/search-demo/page"))
const DeployManagement = lazy(() => import("@/app/deploy/page"))
const AnswerSetManagement = lazy(() => import("@/app/search-evaluation/answer-set/page"))
const EvaluationExecution = lazy(() => import("@/app/search-evaluation/execution/page"))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  )
}

export function AdminRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
        <Route path="/search-evaluation" element={<Navigate to="/search-evaluation/answer-set" replace />} />
        <Route path="/search-evaluation/answer-set" element={<AnswerSetManagement />} />
        <Route path="/search-evaluation/execution" element={<EvaluationExecution />} />
      </Routes>
    </Suspense>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/search-demo" element={
        <Suspense fallback={<PageLoader />}>
          <SearchDemo />
        </Suspense>
      } />
      
      <Route path="*" element={
        <Layout>
          <AdminRoutes />
        </Layout>
      } />
    </Routes>
  )
}