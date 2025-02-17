import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { Day } from './types';

// Interface qui définit les props que reçoit le composant
interface DayCardProps {
  day: Day;                   // Les données du jour (nom, coefficient, objectif, réalisé)
  index: number;              // L'index du jour dans le tableau
  onCoefficientChange: (index: number, delta: number) => void;  // Fonction pour modifier le coefficient
  onActualChange: (index: number, value: number) => void;       // Fonction pour modifier le montant réalisé
  onClearDay: (index: number) => void;
}

// Composant qui affiche une carte pour un jour de la semaine
const DayCard: React.FC<DayCardProps> = ({
  day,
  index,
  onCoefficientChange,
  onActualChange,
  onClearDay,
}) => {
  return (
    // La carte est désactivée si le coefficient est 0 (jour non travaillé)
    <div className={`card day-card ${day.coefficient === 0 ? 'disabled' : ''}`}>
      <div className="day-header">
        <div>
          {/* Nom du jour */}
          <h3 className="day-name">{day.name}</h3>
          {/* Contrôles pour ajuster le coefficient */}
          <div className="coefficient-controls">
            <button 
              className="coefficient-button"
              onClick={() => onCoefficientChange(index, -0.1)}
            >
              <RemoveIcon />
            </button>
            <span className="coefficient">
              Coeff: {day.coefficient.toFixed(1)}
            </span>
            <button 
              className="coefficient-button"
              onClick={() => onCoefficientChange(index, 0.1)}
            >
              <AddIcon />
            </button>
          </div>
        </div>
        {/* Zone d'affichage de l'objectif et de saisie du montant réalisé */}
        <div className="input-group">
          <div className="target">
            <p className="target-label">Objectif</p>
            <p className="target-value">{day.target}€</p>
          </div>
          <div className="actual-input-container">
            {/* Input pour saisir le montant réalisé (désactivé si jour non travaillé) */}
            <input
              type="number"
              value={day.actual || ''}
              onChange={(e) => onActualChange(index, Number(e.target.value))}
              placeholder="Réalisé"
              disabled={day.coefficient === 0}
            />
            {day.actual > 0 && (
              <button 
                className="clear-button"
                onClick={() => onClearDay(index)}
                title="Effacer"
              >
                <DeleteIcon />
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Barre de progression qui s'affiche uniquement si un montant a été réalisé */}
      {day.actual > 0 && (
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${Math.min((day.actual / day.target) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default DayCard; 