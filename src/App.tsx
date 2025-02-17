import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home/Home';
import Landing from './pages/Landing/Landing';
import Login from "./pages/auth/LogIn";
import Signup from './pages/auth/Signup';
import Calculateur from './pages/Calculateur/Calculateur';
import Account from './pages/Account/Account';
import Analyses from './pages/Analyses/Analyses';

// Déplacer le PrivateRoute à l'intérieur d'un composant séparé qui sera rendu à l'intérieur de AuthProvider
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container">Chargement...</div>;
  }

  return user ? element : <Navigate to="/login" />;
};

// Nouveau composant pour les routes
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<PrivateRoute element={<Home />} />} />
      <Route path="/calculateur" element={<PrivateRoute element={<Calculateur />} />} />
      <Route path="/compte" element={<PrivateRoute element={<Account />} />} />
      <Route path="/analyses" element={<PrivateRoute element={<Analyses />} />} />
      <Route path="/evenements" element={<PrivateRoute element={<div>Page Événements en construction</div>} />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;