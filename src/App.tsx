import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ProtectedLayout } from './routes/ProtectedLayout'
import { RequireAuth } from './routes/RequireAuth'
import { RequireRole } from './routes/RequireRole'
import { PublicLandingPage } from './pages/PublicLandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { PublicVerifyPage } from './pages/PublicVerifyPage'
import { LotDetailPage } from './pages/LotDetailPage'
import { ParcelsPage } from './pages/ParcelsPage'
import { FarmerDashboardPage } from './pages/farmer/FarmerDashboardPage'
import { FarmerCapturePage } from './pages/farmer/FarmerCapturePage'
import { FarmerLotsViewPage } from './pages/farmer/FarmerLotsViewPage'
import { FarmerProfilePageV2 } from './pages/farmer/FarmerProfilePageV2'
import { MinistryDisputesPage } from './pages/ministry/MinistryDisputesPage'
import { DraftsPage } from './pages/farmer/DraftsPage'
import { CooperativeWorkspacePage } from './pages/cooperative/CooperativeWorkspacePage'
import { CooperativeExportsPage } from './pages/cooperative/CooperativeExportsPage'
import { VerifierWorkspacePage } from './pages/verifier/VerifierWorkspacePage'
import { ExporterWorkspacePage } from './pages/exporter/ExporterWorkspacePage'
import { AdminWorkspacePage } from './pages/admin/AdminWorkspacePage'
import { MinistryWorkspacePage } from './pages/ministry/MinistryWorkspacePage'
import { ComplianceWorkspacePage } from './pages/compliance/ComplianceWorkspacePage'

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
        <Route path="/parcels" element={<ParcelsPage />} />

        <Route
          path="/farmer"
          element={
            <RequireRole role="farmer">
              <Outlet />
            </RequireRole>
          }
        >
          <Route index element={<FarmerDashboardPage />} />
          <Route path="new" element={<FarmerCapturePage />} />
          <Route path="lots" element={<FarmerLotsViewPage />} />
          <Route path="profile" element={<FarmerProfilePageV2 />} />
          <Route path="drafts" element={<DraftsPage />} />
        </Route>

        <Route
          path="/cooperative"
          element={
            <RequireRole role="cooperative">
              <Outlet />
            </RequireRole>
          }
        >
          <Route index element={<CooperativeWorkspacePage />} />
          <Route path="exports" element={<CooperativeExportsPage />} />
        </Route>

        <Route
          path="/verifier"
          element={
            <RequireRole role="verifier">
              <Outlet />
            </RequireRole>
          }
        >
          <Route index element={<VerifierWorkspacePage />} />
        </Route>

        <Route
          path="/exporter"
          element={
            <RequireRole role="exporter">
              <Outlet />
            </RequireRole>
          }
        >
          <Route index element={<ExporterWorkspacePage />} />
        </Route>

        <Route
          path="/compliance"
          element={
            <RequireRole role="compliance">
              <Outlet />
            </RequireRole>
          }
        >
          <Route index element={<ComplianceWorkspacePage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <Outlet />
            </RequireRole>
          }
        >
          <Route index element={<AdminWorkspacePage />} />
        </Route>

        <Route
          path="/ministry"
          element={
            <RequireRole role="ministry">
              <Outlet />
            </RequireRole>
          }
        >
          <Route index element={<MinistryWorkspacePage />} />
          <Route path="disputes" element={<MinistryDisputesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
