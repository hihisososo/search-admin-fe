import './App.css'
import Layout from "./components/layout/Layout"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import IndexManagement from "./app/index/page"
import IndexAdd from "./app/index/add/page"
import IndexView from "./app/index/view/page"

function App() {

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
