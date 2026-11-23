import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import DashboardLayout from './layouts/DashboardLayout'
import Overview from './pages/Overview'
import Analysis from './pages/Analysis'
import Matches from './pages/Matches'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="matches" element={<Matches />} />
          <Route path="analysis" element={<Analysis />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  )
}