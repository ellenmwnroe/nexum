import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Triagem from './Triagem';
import Dashboard from './Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/triagem" element={<Triagem />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
