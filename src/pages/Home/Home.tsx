import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import CalculateIcon from '@mui/icons-material/Calculate';
import EventIcon from '@mui/icons-material/Event';
import InsightsIcon from '@mui/icons-material/Insights';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import LogoutIcon from '@mui/icons-material/Logout';
import './Home.css';

interface DailyData {
  date: string;
  target: number;
  actual: number;
  isTargetReached: boolean;
  coefficient: number;
}

interface Event {
  title: string;
  date: string;
  description: string;
  expectedImpact: 'high' | 'medium' | 'low';
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [monthlyStats, setMonthlyStats] = useState({
    totalEarnings: 0,
    targetReachedCount: 0,
    totalDays: 0,
    averageDaily: 0
  });

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([
    {
      title: "Concert au Stade de France",
      date: "2024-04-20",
      description: "Grande affluence attendue",
      expectedImpact: "high"
    },
    {
      title: "Salon de l'Agriculture",
      date: "2024-04-22",
      description: "Forte demande de transport",
      expectedImpact: "medium"
    }
  ]);

  const dailyTips = [
    {
      title: "Optimisez vos heures",
      description: "Les meilleures heures sont généralement entre 6h et 9h le matin"
    },
    {
      title: "Zones stratégiques",
      description: "Privilégiez les zones aéroportuaires les lundis et vendredis"
    },
    {
      title: "Gestion du carburant",
      description: "Faites le plein pendant les heures creuses pour éviter les files d'attente"
    }
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const fetchMonthlyData = async () => {
      if (!user) return;

      const db = getFirestore();
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const dailyDataRef = collection(db, 'daily_data');
      const q = query(
        dailyDataRef,
        where('userId', '==', user.uid),
        where('date', '>=', firstDayOfMonth.toISOString()),
        where('date', '<=', lastDayOfMonth.toISOString())
      );

      try {
        const querySnapshot = await getDocs(q);
        let total = 0;
        let targetReached = 0;
        let daysWorked = 0;
        let totalDays = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data() as DailyData;
          if (data.coefficient > 0) {
            total += data.actual;
            if (data.isTargetReached) targetReached++;
            if (data.actual > 0) daysWorked++;
            totalDays++;
          }
        });

        console.log('Données récupérées:', {
          total,
          targetReached,
          daysWorked,
          totalDays
        });

        setMonthlyStats({
          totalEarnings: total,
          targetReachedCount: targetReached,
          totalDays: daysWorked,
          averageDaily: daysWorked > 0 ? total / daysWorked : 0
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };

    fetchMonthlyData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* En-tête avec message de bienvenue */}
      <div className="welcome-section">
        <div className="welcome-text-container">
          <h1 className="dashboard-title">
            Bienvenue {user?.displayName?.split(' ')[0]} 👋
          </h1>
          <p className="welcome-subtitle">
            {formatDate(new Date())}
          </p>
          <p className="welcome-text">
            Voici un aperçu de votre activité ce mois-ci
          </p>
        </div>
        <div className="quick-actions">
          <button className="action-button primary" onClick={() => navigate('/calculateur')}>
            <CalculateIcon /> Calculer Objectifs
          </button>
          <button className="action-button secondary" onClick={() => navigate('/analyses')}>
            <InsightsIcon /> Voir Analyses
          </button>
          <button className="action-button danger" onClick={handleLogout}>
            <LogoutIcon /> Déconnexion
          </button>
        </div>
      </div>

      {/* Grille des statistiques principales */}
      <div className="stats-grid">
        <div className="stat-card main">
          <div className="stat-header">
            <CalendarMonthIcon />
            <span className="stat-label">Total du Mois</span>
          </div>
          <div className="stat-value">
            {monthlyStats.totalEarnings.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="stat-details">
            Moyenne journalière: {monthlyStats.averageDaily.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <CheckCircleIcon />
            <span className="stat-label">Objectifs atteints cette semaine</span>
          </div>
          <div className="stat-value">
            {monthlyStats.targetReachedCount}/{monthlyStats.totalDays}
            <span className="stat-percentage">
              {monthlyStats.totalDays > 0 
                ? ` (${Math.round((monthlyStats.targetReachedCount / monthlyStats.totalDays) * 100)}%)`
                : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Section des événements à venir */}
      <div className="events-section">
        <h2 className="section-title">
          <EventIcon /> Événements à venir
        </h2>
        <div className="events-grid">
          {upcomingEvents.map((event, index) => (
            <div key={index} className={`event-card ${event.expectedImpact}`}>
              <div className="event-date">
                {new Date(event.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short'
                })}
              </div>
              <div className="event-content">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <span className="impact-badge">
                  Impact {event.expectedImpact === 'high' ? 'élevé' : 
                         event.expectedImpact === 'medium' ? 'moyen' : 'faible'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section des conseils */}
      <div className="tips-section">
        <h2 className="section-title">
          <TipsAndUpdatesIcon /> Conseils du jour
        </h2>
        <div className="tips-grid">
          {dailyTips.map((tip, index) => (
            <div key={index} className="tip-card">
              <h3>{tip.title}</h3>
              <p>{tip.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation rapide */}
      <div className="quick-nav-grid">
        <div className="nav-card" onClick={() => navigate('/calculateur')}>
          <CalculateIcon />
          <h3>Calculateur</h3>
          <p>Définissez vos objectifs journaliers</p>
        </div>
        
        <div className="nav-card" onClick={() => navigate('/analyses')}>
          <InsightsIcon />
          <h3>Analyses</h3>
          <p>Visualisez vos performances détaillées</p>
        </div>
        
        <div className="nav-card" onClick={() => navigate('/compte')}>
          <AccountCircleIcon />
          <h3>Profil</h3>
          <p>Gérez vos informations</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
