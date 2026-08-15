import { Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { IncidentPage } from "./pages/IncidentPage";
import { EvidencePage } from "./pages/EvidencePage";
import { ActionsPage } from "./pages/ActionsPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="incidents/:incidentId" element={<IncidentPage />} />
          <Route path="evidence" element={<EvidencePage />} />
          <Route path="actions" element={<ActionsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
