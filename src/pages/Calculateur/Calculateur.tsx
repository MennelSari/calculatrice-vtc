import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Day } from '../../components/Calculateur/types';
import WeeklyGoal from '../../components/Calculateur/WeeklyGoal';
import DayCard from '../../components/Calculateur/DayCard';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, collection, doc, setDoc, query, where, getDocs, getDoc } from 'firebase/firestore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Calculateur: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [weeklyGoal, setWeeklyGoal] = useState<number>(1000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string>(getWeekNumber(new Date()));

  // Vérification de l'authentification
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // Si l'authentification est en cours, afficher le chargement
  if (authLoading) {
    return <div className="container">Chargement de l'authentification...</div>;
  }

  // Si l'utilisateur n'est pas connecté, ne pas rendre le composant
  if (!user) {
    return null;
  }

  // Initialisation des jours avec leurs coefficients par défaut
  const [days, setDays] = useState<Day[]>([
    { name: 'Lundi', coefficient: 1, target: 0, actual: 0 },
    { name: 'Mardi', coefficient: 1, target: 0, actual: 0 },
    { name: 'Mercredi', coefficient: 1, target: 0, actual: 0 },
    { name: 'Jeudi', coefficient: 1.2, target: 0, actual: 0 },
    { name: 'Vendredi', coefficient: 1.5, target: 0, actual: 0 },
    { name: 'Samedi', coefficient: 2, target: 0, actual: 0 },
    { name: 'Dimanche', coefficient: 0, target: 0, actual: 0 },
  ]);

  function getWeekNumber(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  }

  function getDateFromWeek(week: string): Date {
    const [year, weekNum] = week.split('-W').map(Number);
    const firstDayOfYear = new Date(year, 0, 1);
    const days = 1 + (weekNum - 1) * 7;
    const date = new Date(firstDayOfYear.setDate(days));
    
    // Ajuster au lundi de la semaine
    const diff = date.getDay() - 1;
    date.setDate(date.getDate() - diff);
    return date;
  }

  // Fonction pour sauvegarder l'objectif hebdomadaire
  const saveWeeklyGoal = async (goal: number) => {
    if (!user) return;

    const db = getFirestore();
    const weeklyGoalRef = doc(db, 'weekly_goals', `${user.uid}_${selectedWeek}`);

    try {
      await setDoc(weeklyGoalRef, {
        userId: user.uid,
        week: selectedWeek,
        goal: goal,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'objectif:', error);
    }
  };

  // Charge l'objectif hebdomadaire
  const loadWeeklyGoal = async () => {
    if (!user) return;

    const db = getFirestore();
    const weeklyGoalRef = doc(db, 'weekly_goals', `${user.uid}_${selectedWeek}`);

    try {
      const docSnap = await getDoc(weeklyGoalRef);
      if (docSnap.exists()) {
        setWeeklyGoal(docSnap.data().goal);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'objectif:', error);
    }
  };

  // Modifie le useEffect existant pour charger l'objectif
  useEffect(() => {
    const loadWeekData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      setLoading(true);
      
      try {
        const db = getFirestore();
        const monday = getDateFromWeek(selectedWeek);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        // Charge l'objectif hebdomadaire
        const weeklyGoalRef = doc(db, 'weekly_goals', `${user.uid}_${selectedWeek}`);
        const weeklyGoalSnap = await getDoc(weeklyGoalRef);
        
        if (weeklyGoalSnap.exists()) {
          setWeeklyGoal(weeklyGoalSnap.data().goal);
        }

        // Initialise les jours avec les coefficients par défaut
        const defaultDays = [
          { name: 'Lundi', coefficient: 1, target: 0, actual: 0 },
          { name: 'Mardi', coefficient: 1, target: 0, actual: 0 },
          { name: 'Mercredi', coefficient: 1, target: 0, actual: 0 },
          { name: 'Jeudi', coefficient: 1.2, target: 0, actual: 0 },
          { name: 'Vendredi', coefficient: 1.5, target: 0, actual: 0 },
          { name: 'Samedi', coefficient: 2, target: 0, actual: 0 },
          { name: 'Dimanche', coefficient: 0, target: 0, actual: 0 },
        ];

        // Charge les données journalières
        const dailyDataRef = collection(db, 'daily_data');
        const q = query(
          dailyDataRef,
          where('userId', '==', user.uid),
          where('date', '>=', monday.toISOString()),
          where('date', '<=', sunday.toISOString())
        );

        const querySnapshot = await getDocs(q);
        const newDays = [...defaultDays];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const date = new Date(data.date);
          const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Correction pour le dimanche
          if (dayIndex >= 0 && dayIndex < 7) {
            newDays[dayIndex] = {
              ...newDays[dayIndex],
              actual: data.actual || 0,
              coefficient: data.coefficient || newDays[dayIndex].coefficient,
              target: data.target || 0
            };
          }
        });

        // Recalcule les objectifs après avoir chargé les données
        const totalCoefficients = newDays.reduce((sum, day) => sum + day.coefficient, 0);
        const baseTarget = weeklyGoal / totalCoefficients;
        
        const daysWithTargets = newDays.map(day => ({
          ...day,
          target: Math.round(baseTarget * day.coefficient),
        }));

        setDays(daysWithTargets);
        console.log('Données chargées avec succès');

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setSuccessMessage('Erreur lors du chargement des données. Veuillez réessayer.');
        setShowSuccess(true);
      } finally {
        setLoading(false);
      }
    };

    loadWeekData();
  }, [user, selectedWeek, navigate]);

  const saveDailyData = async (dayIndex: number, day: Day) => {
    if (!user) return;

    const db = getFirestore();
    const monday = getDateFromWeek(selectedWeek);
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + dayIndex);

    // Format de la date pour l'ID du document
    const dateString = targetDate.toISOString().split('T')[0];
    const dailyDataRef = doc(db, 'daily_data', `${user.uid}_${dateString}`);

    try {
      await setDoc(dailyDataRef, {
        userId: user.uid,
        date: targetDate.toISOString(),
        target: day.target || 0,
        actual: day.actual || 0,
        coefficient: day.coefficient || 0,
        isTargetReached: day.actual && day.target ? day.actual >= day.target : false,
        updatedAt: new Date().toISOString(),
        weekNumber: selectedWeek
      });

      console.log('Données sauvegardées avec succès pour', dateString);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }
  };

  const calculateDailyTargets = () => {
    const totalCoefficients = days.reduce((sum, day) => sum + day.coefficient, 0);
    const baseTarget = weeklyGoal / totalCoefficients;

    const newDays = days.map(day => ({
      ...day,
      target: Math.round(baseTarget * day.coefficient),
    }));

    setDays(newDays);

    // Sauvegarde les nouveaux objectifs
    newDays.forEach((day, index) => {
      saveDailyData(index, day);
    });
  };

  const handleActualChange = (index: number, value: number) => {
    const newDays = [...days];
    newDays[index].actual = value || 0;
    setDays(newDays);

    // Sauvegarde les données du jour
    saveDailyData(index, newDays[index]);

    const totalActual = newDays.reduce((sum, day) => sum + (day.actual || 0), 0);
    const remaining = weeklyGoal - totalActual;

    if (remaining < 0) {
      setSuccessMessage(`Bravo ! Vous avez dépassé votre objectif de ${Math.abs(remaining)}€`);
      setShowSuccess(true);
    } else {
      setShowSuccess(false);
    }

    // Recalcule les objectifs des jours suivants
    const totalRemainingCoefficients = newDays
      .slice(index + 1)
      .reduce((sum, day) => sum + day.coefficient, 0);

    if (totalRemainingCoefficients > 0) {
      const remainingBaseTarget = Math.max(0, remaining) / totalRemainingCoefficients;

      for (let i = index + 1; i < newDays.length; i++) {
        newDays[i].target = Math.round(remainingBaseTarget * newDays[i].coefficient);
      }
      setDays(newDays);
    }
  };

  const handleCoefficientChange = (index: number, delta: number) => {
    const newDays = [...days];
    const newCoefficient = Math.max(0, Math.min(3, newDays[index].coefficient + delta));
    newDays[index].coefficient = newCoefficient;
    setDays(newDays);
    calculateDailyTargets();

    // Sauvegarde les données du jour avec le nouveau coefficient
    saveDailyData(index, newDays[index]);
  };

  const handleClearDay = (index: number) => {
    const newDays = [...days];
    newDays[index] = {
      ...newDays[index],
      actual: 0
    };
    setDays(newDays);
    saveDailyData(index, newDays[index]);
  };

  useEffect(() => {
    calculateDailyTargets();
  }, [weeklyGoal]);

  if (loading) {
    return <div className="container">Chargement...</div>;
  }

  const formatWeekDate = (week: string): string => {
    const monday = getDateFromWeek(week);
    return monday.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Sauvegarder les données pour chaque jour
      for (let i = 0; i < days.length; i++) {
        await saveDailyData(i, days[i]);
      }
      setSuccessMessage("Données sauvegardées avec succès !");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSuccessMessage("Erreur lors de la sauvegarde");
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  // Modifie la fonction handleWeeklyGoalChange
  const handleWeeklyGoalChange = (newGoal: number) => {
    setWeeklyGoal(newGoal);
    saveWeeklyGoal(newGoal);
    calculateDailyTargets();
  };

  return (
    <div className="container">
      <div className="calculateur-header">
        <button className="back-button" onClick={() => navigate('/home')}>
          <ArrowBackIcon /> Retour
        </button>
        <h1 className="title">Calculateur de Revenus VTC</h1>
      </div>

      <div className="date-selector">
        <div className="date-selector-header">
          <div>
            <label htmlFor="week">Sélectionner la semaine :</label>
            <input
              type="week"
              id="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            />
          </div>
          <button className="save-button" onClick={handleSave}>
            Sauvegarder
          </button>
        </div>
        <p className="selected-date">
          Semaine du {formatWeekDate(selectedWeek)}
        </p>
      </div>

      <WeeklyGoal
        weeklyGoal={weeklyGoal}
        totalActual={days.reduce((sum, day) => sum + day.actual, 0)}
        isEditingGoal={isEditingGoal}
        onWeeklyGoalChange={handleWeeklyGoalChange}
        onEditingGoalChange={setIsEditingGoal}
      />

      <div className="days-grid">
        {days.map((day, index) => (
          <DayCard
            key={day.name}
            day={day}
            index={index}
            onCoefficientChange={handleCoefficientChange}
            onActualChange={handleActualChange}
            onClearDay={handleClearDay}
          />
        ))}
      </div>

      {showSuccess && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default Calculateur; 