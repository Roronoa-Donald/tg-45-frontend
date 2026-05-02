import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedLayout } from './routes/ProtectedLayout'
import { RequireAuth } from './routes/RequireAuth'
import { RequireRole } from './routes/RequireRole'
import { PublicLandingPage } from './pages/PublicLandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { PublicVerifyPage } from './pages/PublicVerifyPage'
import { LotDetailPage } from './pages/LotDetailPage'
import { FarmerDashboardPage } from './pages/farmer/FarmerDashboardPage'
import { FarmerCapturePage } from './pages/farmer/FarmerCapturePage'
import { FarmerLotsViewPage } from './pages/farmer/FarmerLotsViewPage'
import { FarmerProfileViewPage } from './pages/farmer/FarmerProfileViewPage'
import { DraftsPage } from './pages/farmer/DraftsPage'
import { CooperativeWorkspacePage } from './pages/cooperative/CooperativeWorkspacePage'
import { VerifierWorkspacePage } from './pages/verifier/VerifierWorkspacePage'
import { ExporterWorkspacePage } from './pages/exporter/ExporterWorkspacePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLandingPage />} />
      <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
      <Route path="/public/verify" element={<PublicVerifyPage />} />
      <Route path="/public/verify/:lotCode" element={<PublicVerifyPage />} />

      <Route
        element={
          <RequireAuth>
            <ProtectedLayout />
          </RequireAuth>
        }
      >
        <Route path="/lots/:lotId" element={<LotDetailPage />} />

        <Route
          path="/farmer"
          element={
            <RequireRole role="farmer">
              <ProtectedLayout />
            </RequireRole>
          }
        >
          <Route index element={<FarmerDashboardPage />} />
          <Route path="new" element={<FarmerCapturePage />} />
          <Route path="lots" element={<FarmerLotsViewPage />} />
          <Route path="profile" element={<FarmerProfileViewPage />} />
          <Route path="drafts" element={<DraftsPage />} />
        </Route>

        <Route
          path="/cooperative"
          element={
            <RequireRole role="cooperative">
              <ProtectedLayout />
            </RequireRole>
          }
        >
          <Route index element={<CooperativeWorkspacePage />} />
        </Route>

        <Route
          path="/verifier"
          element={
            <RequireRole role="verifier">
              <ProtectedLayout />
            </RequireRole>
          }
        >
          <Route index element={<VerifierWorkspacePage />} />
        </Route>

        <Route
          path="/exporter"
          element={
            <RequireRole role="exporter">
              <ProtectedLayout />
            </RequireRole>
          }
        >
          <Route index element={<ExporterWorkspacePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
