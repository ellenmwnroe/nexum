import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './routes/PrivateRoute'; 

// Suas páginas
import Home from './pages/Home';
import Triagem from './pages/Triagem';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login'; 

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/triagem" element={<Triagem />} />
          <Route path="/login" element={<Login />} />

          {/* Rota Protegida */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;