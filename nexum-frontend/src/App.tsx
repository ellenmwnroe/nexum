import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Triagem from './Triagem';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/triagem" element={<Triagem />} />
      </Routes>
    </Router>
  );
}

export default App;