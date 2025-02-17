import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">
          Gérez vos revenus VTC
          <span className="landing-subtitle">simplement et efficacement</span>
        </h1>
        
        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Objectifs Intelligents</h3>
            <p>Calculez vos objectifs journaliers en fonction de votre rythme de travail</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Suivi Détaillé</h3>
            <p>Visualisez vos performances et adaptez votre stratégie</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Optimisation</h3>
            <p>Identifiez vos meilleurs jours et maximisez vos revenus</p>
          </div>
        </div>

        <div className="landing-cta">
          <button 
            className="cta-button primary"
            onClick={() => navigate('/signup')}
          >
            Commencer
          </button>
          <button 
            className="cta-button secondary"
            onClick={() => navigate('/login')}
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing; 