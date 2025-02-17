import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter la connexion avec Supabase
    // Redirection temporaire vers /home
    navigate('/home');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Connexion</h1>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="auth-button">
            Se connecter
          </button>
        </form>

        <div className="auth-links">
          <button 
            className="text-button"
            onClick={() => navigate('/signup')}
          >
            Pas encore de compte ? S'inscrire
          </button>
          <button 
            className="text-button"
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;