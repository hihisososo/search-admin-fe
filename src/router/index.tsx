import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from "@/components/layout/Layout"
import { LoadingSpinner } from "@/components/common"

const Dashboard = lazy(() => import("@/pages/dashboard"))
const UserDictionary = lazy(() => import("@/pages/dictionary/user"))
const SynonymDictionary = lazy(() => import("@/pages/dictionary/synonym"))
const StopwordDictionary = lazy(() => import("@/pages/dictionary/stopword"))
const UnitDictionary = lazy(() => import("@/pages/dictionary/unit"))
const TypoCorrectionDictionary = lazy(() => import("@/pages/dictionary/typo"))
const CategoryRankingDictionary = lazy(() => import("@/pages/dictionary/category-ranking"))
const MorphemeAnalysis = lazy(() => import("@/pages/dictionary/morpheme-analysis"))
const SearchLogs = lazy(() => import("@/pages/search-logs"))
const SearchSimulator = lazy(() => import("@/pages/search-simulator"))
const SearchSimulatorAutocomplete = lazy(() => import("@/pages/search-simulator/autocomplete"))
const SearchDemo = lazy(() => import("@/pages/search-demo"))
const DeployManagement = lazy(() => import("@/pages/deploy"))
const AnswerSetManagement = lazy(() => import("@/pages/search-evaluation/answer-set"))
const EvaluationExecution = lazy(() => import("@/pages/search-evaluation/execution"))

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
        <Route path="/dictionary/unit" element={<UnitDictionary />} />
        <Route path="/dictionary/typo" element={<TypoCorrectionDictionary />} />
        <Route path="/dictionary/category-ranking" element={<CategoryRankingDictionary />} />
        <Route path="/dictionary/morpheme-analysis" element={<MorphemeAnalysis />} />
        <Route path="/search-logs" element={<SearchLogs />} />
        <Route path="/deploy" element={<DeployManagement />} />
        <Route path="/search-simulator" element={<SearchSimulator />} />
        <Route path="/search-simulator/autocomplete" element={<SearchSimulatorAutocomplete />} />
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