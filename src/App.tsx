import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home/Home';
import Landing from './pages/Landing/Landing';
import Login from "./pages/auth/LogIn";
import Signup from './pages/auth/Signup';
import Calculateur from './pages/Calculateur/Calculateur';
import Account from './pages/Account/Account';
import Analyses from './pages/Analyses/Analyses';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/calculateur" element={<Calculateur />} />
            <Route path="/compte" element={<Account />} />
            <Route path="/analyses" element={<Analyses />} />
            {/* La route pour Événements sera ajoutée plus tard */}
            <Route path="/evenements" element={<div>Page Événements en construction</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;