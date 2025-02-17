import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    vehicleType: '',
    preferredZone: '',
    yearsOfExperience: '',
    platform: [] as string[],
    email: '',
    password: '',
    confirmPassword: '',
    workCity: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platform: prev.platform.includes(platform)
        ? prev.platform.filter(p => p !== platform)
        : [...prev.platform, platform]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      // On passe toutes les données du formulaire
      const { data, error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        vehicle_type: formData.vehicleType,
        preferred_zone: formData.preferredZone,
        years_of_experience: formData.yearsOfExperience,
        platforms: formData.platform,
        work_city: formData.workCity
      });

      if (error) throw error;
      
      setError('Vérifiez votre email pour confirmer votre inscription');
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Créez votre compte</h1>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
                placeholder="John"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              placeholder="votre@email.com"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preferredZone">Zone préférée</label>
              <select
                id="preferredZone"
                value={formData.preferredZone}
                onChange={(e) => handleChange('preferredZone', e.target.value)}
                required
              >
                <option value="">Sélectionnez votre zone</option>
                <option value="ville">Centre-ville</option>
                <option value="airport">Aéroports</option>
                <option value="suburbs">Banlieue</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="workCity">Ville de travail</label>
              <input
                type="text"
                id="workCity"
                value={formData.workCity}
                onChange={(e) => handleChange('workCity', e.target.value)}
                required
                placeholder="Ex: Paris"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="yearsOfExperience">Expérience</label>
              <select
                id="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
                required
              >
                <option value="">Votre expérience</option>
                <option value="0-1">Moins d'1 an</option>
                <option value="1-3">1 à 3 ans</option>
                <option value="3-5">3 à 5 ans</option>
                <option value="5+">Plus de 5 ans</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="vehicleType">Type de véhicule</label>
              <select
                id="vehicleType"
                value={formData.vehicleType}
                onChange={(e) => handleChange('vehicleType', e.target.value)}
                required
              >
                <option value="">Sélectionnez votre véhicule</option>
                <option value="berline">Berline</option>
                <option value="van">Van</option>
                <option value="premium">Premium</option>
                <option value="electric">Électrique</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Plateformes utilisées</label>
            <div className="checkbox-group">
              {['Uber', 'Bolt', 'Heetch'].map(platform => (
                <label key={platform} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.platform.includes(platform)}
                    onChange={() => handlePlatformToggle(platform)}
                  />
                  {platform}
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="auth-links">
          <button 
            className="text-button"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            Déjà un compte ? Se connecter
          </button>
          <button 
            className="text-button"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup; 