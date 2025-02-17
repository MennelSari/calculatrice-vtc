import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';

// Interface qui définit les props que reçoit le composant
interface WeeklyGoalProps {
  weeklyGoal: number;         // L'objectif hebdomadaire en euros
  totalActual: number;        // Le montant total réalisé
  isEditingGoal: boolean;     // Si on est en train d'éditer l'objectif
  onWeeklyGoalChange: (value: number) => void;      // Fonction appelée quand on change l'objectif
  onEditingGoalChange: (isEditing: boolean) => void; // Fonction pour passer en mode édition
}

// Composant qui affiche et permet de modifier l'objectif hebdomadaire
const WeeklyGoal: React.FC<WeeklyGoalProps> = ({
  weeklyGoal,
  totalActual,
  isEditingGoal,
  onWeeklyGoalChange,
  onEditingGoalChange,
}) => {
  // Calcul du pourcentage de progression
  const progress = (totalActual / weeklyGoal) * 100;

  return (
    <div className="card">
      <div className="weekly-goal">
        <h2>Objectif Hebdomadaire</h2>
        {/* Mode édition avec input */}
        {isEditingGoal ? (
          <div className="input-group">
            <input
              type="number"
              value={weeklyGoal === 0 ? '' : weeklyGoal}
              onChange={(e) => onWeeklyGoalChange(Number(e.target.value) || 0)}
              placeholder="Objectif"
            />
            <button onClick={() => onEditingGoalChange(false)}>
              <CheckIcon />
            </button>
          </div>
        ) : (
          // Mode affichage avec bouton d'édition
          <div className="input-group">
            <span className="goal-value">{weeklyGoal}€</span>
            <button onClick={() => onEditingGoalChange(true)}>
              <EditIcon />
            </button>
          </div>
        )}
      </div>

      {/* Barre de progression qui montre visuellement l'avancement */}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {/* Affichage du total réalisé par rapport à l'objectif */}
      <p className="text-center mt-2">
        Total réalisé : {totalActual}€ / {weeklyGoal}€
      </p>
    </div>
  );
};

export default WeeklyGoal; 