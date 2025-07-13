import './App.css'
import Layout from "./components/layout/Layout"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MENU_ITEMS } from "@/constants/menu"

function App() {

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {MENU_ITEMS.map((item) => (
            <Route 
              key={item.id}
              path={item.path} 
              element={<div>{item.title} 페이지</div>} 
            />
          ))}
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
