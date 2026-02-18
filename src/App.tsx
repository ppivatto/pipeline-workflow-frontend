import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Layout from './layouts/Layout';
import Seguimiento from './features/cases/Seguimiento';
import Renovaciones from './features/cases/Renovaciones';
import NewAccount from './features/accounts/NewAccount';
import AccountsList from './features/accounts/AccountsList';
import WorkflowDetail from './features/workflow/Workflow';
import Negotiation from './features/workflow/Negotiation';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Emission from './features/workflow/Emission';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/accounts" element={<PrivateRoute><AccountsList /></PrivateRoute>} />
            <Route path="/seguimiento/:accountId" element={<PrivateRoute><Seguimiento /></PrivateRoute>} />
            <Route path="/dashboard" element={<Navigate to="/accounts" replace />} />
            <Route path="/accounts/new" element={<PrivateRoute><NewAccount /></PrivateRoute>} />
            <Route path="/renovaciones" element={<PrivateRoute><Renovaciones /></PrivateRoute>} />
            <Route path="/workflow/:id" element={<PrivateRoute><WorkflowDetail /></PrivateRoute>} />
            <Route path="/negotiation/:id" element={<PrivateRoute><Negotiation /></PrivateRoute>} />
            <Route path="/emission/:id" element={<PrivateRoute><Emission /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/accounts" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
