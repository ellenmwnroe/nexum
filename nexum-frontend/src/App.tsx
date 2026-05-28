import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './routes/PrivateRoute'; 

// Suas páginas
import Home from './pages/Home';
import Triagem from './pages/Triagem';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login'; 
import Configuracoes from './pages/Configuracoes';
import { ConfiguracoesEscritorio } from './pages/ConfiguracoesEscritorio'; 
import { ConfiguracoesChatbot } from './pages/ConfiguracoesChatbot';
import { AdminLayout } from './components/AdminLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/triagem/:officeId" element={<Triagem />} />

          {/* Rotas Protegidas com o AdminLayout */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/configuracoes" 
            element={
              <PrivateRoute>
                <AdminLayout>
                  <Configuracoes />
                </AdminLayout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/configuracoes/escritorio" 
            element={
              <PrivateRoute>
                <AdminLayout>
                  <ConfiguracoesEscritorio />
                </AdminLayout>
              </PrivateRoute>
            } 
          />

          <Route 
            path="/configuracoes/chatbot" 
            element={
              <PrivateRoute>
                <AdminLayout>
                  <ConfiguracoesChatbot />
                </AdminLayout>
              </PrivateRoute>
            } 
          />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;