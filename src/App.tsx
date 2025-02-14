import React, { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface Day {
  name: string;
  coefficient: number;
  target: number;
  actual: number;
}

function App() {
  const [weeklyGoal, setWeeklyGoal] = useState<number>(1000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [days, setDays] = useState<Day[]>([
    { name: 'Lundi', coefficient: 1, target: 0, actual: 0 },
    { name: 'Mardi', coefficient: 1, target: 0, actual: 0 },
    { name: 'Mercredi', coefficient: 1, target: 0, actual: 0 },
    { name: 'Jeudi', coefficient: 1.2, target: 0, actual: 0 },
    { name: 'Vendredi', coefficient: 1.5, target: 0, actual: 0 },
    { name: 'Samedi', coefficient: 2, target: 0, actual: 0 },
    { name: 'Dimanche', coefficient: 0, target: 0, actual: 0 },
  ]);

  const calculateDailyTargets = () => {
    const totalCoefficients = days.reduce((sum, day) => sum + day.coefficient, 0);
    const baseTarget = weeklyGoal / totalCoefficients;

    const newDays = days.map(day => ({
      ...day,
      target: Math.round(baseTarget * day.coefficient),
    }));

    setDays(newDays);
  };

  const handleActualChange = (index: number, value: number) => {
    const newDays = [...days];
    newDays[index].actual = value;

    const totalActual = newDays.reduce((sum, day) => sum + day.actual, 0);
    const remaining = weeklyGoal - totalActual;

    if (remaining < 0) {
      setSuccessMessage(`Vous avez dépassé votre objectif de ${Math.abs(remaining)}€`);
      setShowSuccess(true);
    } else {
      setShowSuccess(false);
    }

    const totalRemainingCoefficients = newDays
      .slice(index + 1)
      .reduce((sum, day) => sum + day.coefficient, 0);

    if (totalRemainingCoefficients > 0) {
      const remainingBaseTarget = Math.max(0, remaining) / totalRemainingCoefficients;

      for (let i = index + 1; i < newDays.length; i++) {
        newDays[i].target = Math.round(remainingBaseTarget * newDays[i].coefficient);
      }
    }

    setDays(newDays);
  };

  const handleCoefficientChange = (index: number, delta: number) => {
    const newDays = [...days];
    const newCoefficient = Math.max(0, Math.min(3, newDays[index].coefficient + delta));
    newDays[index].coefficient = newCoefficient;
    setDays(newDays);
    calculateDailyTargets();
  };

  useEffect(() => {
    calculateDailyTargets();
  }, [weeklyGoal]);

  const totalActual = days.reduce((sum, day) => sum + day.actual, 0);
  const progress = (totalActual / weeklyGoal) * 100;

  return (
    <div className="container">
      <h1 className="title">Calculateur de Revenus VTC</h1>

      <div className="card">
        <div className="weekly-goal">
          <h2>Objectif Hebdomadaire</h2>
          {isEditingGoal ? (
            <div className="input-group">
              <input
                type="number"
                value={weeklyGoal === 0 ? '' : weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value) || 0)}
                placeholder="Objectif"
              />
              <button onClick={() => setIsEditingGoal(false)}>
                <CheckIcon />
              </button>
            </div>
          ) : (
            <div className="input-group">
              <span className="goal-value">{weeklyGoal}€</span>
              <button onClick={() => setIsEditingGoal(true)}>
                <EditIcon />
              </button>
            </div>
          )}
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-center mt-2">
          Total réalisé : {totalActual}€ / {weeklyGoal}€
        </p>
      </div>

      <div className="days-grid">
        {days.map((day, index) => (
          <div key={day.name} className={`card day-card ${day.coefficient === 0 ? 'disabled' : ''}`}>
            <div className="day-header">
              <div>
                <h3 className="day-name">{day.name}</h3>
                <div className="coefficient-controls">
                  <button 
                    className="coefficient-button"
                    onClick={() => handleCoefficientChange(index, -0.1)}
                  >
                    <RemoveIcon />
                  </button>
                  <span className="coefficient">
                    Coefficient: {day.coefficient.toFixed(1)}
                  </span>
                  <button 
                    className="coefficient-button"
                    onClick={() => handleCoefficientChange(index, 0.1)}
                  >
                    <AddIcon />
                  </button>
                </div>
              </div>
              <div className="input-group">
                <div className="target">
                  <p className="target-label">Objectif</p>
                  <p className="target-value">{day.target}€</p>
                </div>
                <input
                  type="number"
                  value={day.actual || ''}
                  onChange={(e) => handleActualChange(index, Number(e.target.value))}
                  placeholder="Réalisé"
                  disabled={day.coefficient === 0}
                />
              </div>
            </div>
            {day.actual > 0 && (
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${Math.min((day.actual / day.target) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {showSuccess && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
    </div>
  );
}

export default App;