import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import './Analyses.css';

interface DailyData {
  date: string;
  target: number;
  actual: number;
  isTargetReached: boolean;
  coefficient: number;
  updatedAt: string;
}

interface WeeklyStats {
  weekNumber: number;
  totalEarnings: number;
  targetReachedCount: number;
  averageDaily: number;
  bestDay: {
    date: string;
    amount: number;
    coefficient: number;
  };
  targetReachRate: number;
  totalTarget: number;
}

const Analyses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const db = getFirestore();
      const now = new Date();
      let startDate = new Date();

      // Définir la période de recherche
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const dailyDataRef = collection(db, 'daily_data');
      const q = query(
        dailyDataRef,
        where('userId', '==', user.uid),
        where('date', '>=', startDate.toISOString()),
        where('date', '<=', now.toISOString())
      );

      try {
        const querySnapshot = await getDocs(q);
        const data: DailyData[] = [];
        
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          data.push({
            date: docData.date,
            target: docData.target || 0,
            actual: docData.actual || 0,
            isTargetReached: docData.isTargetReached || false,
            coefficient: docData.coefficient || 0,
            updatedAt: docData.updatedAt
          });
        });

        console.log('Données récupérées dans Analyses:', data);

        // Trier les données par date
        data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Grouper les données par semaine
        const weeklyData: { [key: string]: DailyData[] } = {};
        data.forEach(day => {
          const date = new Date(day.date);
          const weekKey = getWeekNumber(date);
          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = [];
          }
          weeklyData[weekKey].push(day);
        });

        setDailyData(data);
        
        // Calculer les statistiques hebdomadaires
        const weeklyStats: WeeklyStats[] = Object.entries(weeklyData)
          .filter(([_, days]) => days.some(day => day.coefficient > 0))
          .map(([weekKey, days], index) => {
            const daysWorked = days.filter(day => day.coefficient > 0);
            return {
              weekNumber: index + 1,
              totalEarnings: days.reduce((sum, day) => sum + day.actual, 0),
              targetReachedCount: days.filter(day => day.isTargetReached).length,
              averageDaily: daysWorked.length > 0 
                ? days.reduce((sum, day) => sum + day.actual, 0) / daysWorked.length 
                : 0,
              bestDay: {
                date: new Date(days.reduce((best, current) => 
                  current.actual > best.actual ? current : best
                , days[0]).date).toLocaleDateString('fr-FR'),
                amount: Math.max(...days.map(d => d.actual)),
                coefficient: days.find(d => d.actual === Math.max(...days.map(d => d.actual)))?.coefficient || 0
              },
              targetReachRate: daysWorked.length > 0
                ? (days.filter(day => day.isTargetReached).length / daysWorked.length) * 100
                : 0,
              totalTarget: days.reduce((sum, day) => sum + day.target, 0)
            };
          });

        console.log('Statistiques hebdomadaires:', weeklyStats);
        setWeeklyStats(weeklyStats);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, selectedPeriod]);

  // Fonction pour obtenir le numéro de semaine
  function getWeekNumber(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return <div className="container">Chargement...</div>;
  }

  return (
    <div className="container">
      <div className="analyses-header">
        <button className="back-button" onClick={() => navigate('/home')}>
          <ArrowBackIcon /> Retour
        </button>
        <h1 className="title">Analyses Détaillées</h1>
      </div>

      {/* Sélecteur de période */}
      <div className="period-selector">
        <button 
          className={`period-button ${selectedPeriod === 'week' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('week')}
        >
          7 derniers jours
        </button>
        <button 
          className={`period-button ${selectedPeriod === 'month' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('month')}
        >
          30 derniers jours
        </button>
        <button 
          className={`period-button ${selectedPeriod === 'year' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('year')}
        >
          12 derniers mois
        </button>
      </div>

      {/* Statistiques globales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <CalendarMonthIcon />
            <span className="stat-label">Total de la période</span>
          </div>
          <div className="stat-value">
            {dailyData.reduce((sum, day) => sum + day.actual, 0)
              .toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="stat-details">
            Objectif : {dailyData.reduce((sum, day) => sum + day.target, 0)
              .toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <TrendingUpIcon />
            <span className="stat-label">Moyenne journalière</span>
          </div>
          <div className="stat-value">
            {(dailyData.reduce((sum, day) => sum + day.actual, 0) / 
              dailyData.filter(day => day.coefficient > 0).length)
              .toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="stat-details">
            Sur les jours travaillés uniquement
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <CheckCircleIcon />
            <span className="stat-label">Objectifs atteints</span>
          </div>
          <div className="stat-value">
            {dailyData.filter(day => day.isTargetReached).length}/
            {dailyData.filter(day => day.coefficient > 0).length}
            <span className="stat-percentage">
              ({Math.round((dailyData.filter(day => day.isTargetReached).length / 
                dailyData.filter(day => day.coefficient > 0).length) * 100)}%)
            </span>
          </div>
          <div className="stat-details">
            Sur les jours travaillés uniquement
          </div>
        </div>
      </div>

      {/* Graphique des revenus journaliers */}
      <div className="chart-container">
        <h2>Revenus Journaliers</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData.map(day => ({
            ...day,
            date: new Date(day.date).toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric'
            })
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => 
                value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            />
            <Legend />
            <Bar dataKey="actual" name="Réalisé" fill="#3b82f6" />
            <Bar dataKey="target" name="Objectif" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau des performances par semaine */}
      <div className="best-performances">
        <h2>Performances par Semaine</h2>
        <div className="performance-grid">
          {weeklyStats.map((week, index) => (
            <div key={index} className="performance-card">
              <h3>Semaine {week.weekNumber}</h3>
              <div className="performance-stats">
                <div className="stat-row">
                  <span>Total :</span>
                  <span>{week.totalEarnings.toLocaleString('fr-FR', { 
                    style: 'currency', currency: 'EUR' 
                  })}</span>
                </div>
                <div className="stat-row">
                  <span>Objectif :</span>
                  <span>{week.totalTarget.toLocaleString('fr-FR', { 
                    style: 'currency', currency: 'EUR' 
                  })}</span>
                </div>
                <div className="stat-row">
                  <span>Moyenne/jour :</span>
                  <span>{week.averageDaily.toLocaleString('fr-FR', { 
                    style: 'currency', currency: 'EUR' 
                  })}</span>
                </div>
                <div className="stat-row">
                  <span>Meilleur jour :</span>
                  <span>{week.bestDay.date}</span>
                </div>
                <div className="stat-row">
                  <span>Montant :</span>
                  <span>{week.bestDay.amount.toLocaleString('fr-FR', { 
                    style: 'currency', currency: 'EUR' 
                  })}</span>
                </div>
                <div className="stat-row">
                  <span>Objectifs atteints :</span>
                  <span>{week.targetReachedCount} jours ({Math.round(week.targetReachRate)}%)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analyses; 