import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import './Account.css';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  vehicleType: string;
  preferredZone: string;
  yearsOfExperience: string;
  platforms: string[];
}

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    vehicleType: '',
    preferredZone: '',
    yearsOfExperience: '',
    platforms: []
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const db = getFirestore();
        const profileDoc = await getDoc(doc(db, 'profiles', user.uid));

        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setProfile({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: user.email || '',
            vehicleType: data.vehicle_type || '',
            preferredZone: data.preferred_zone || '',
            yearsOfExperience: data.years_of_experience || '',
            platforms: data.platforms || []
          });
          setEditedProfile({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: user.email || '',
            vehicleType: data.vehicle_type || '',
            preferredZone: data.preferred_zone || '',
            yearsOfExperience: data.years_of_experience || '',
            platforms: data.platforms || []
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'profiles', user.uid), {
        first_name: editedProfile.firstName,
        last_name: editedProfile.lastName,
        vehicle_type: editedProfile.vehicleType,
        preferred_zone: editedProfile.preferredZone,
        years_of_experience: editedProfile.yearsOfExperience,
        platforms: editedProfile.platforms,
        updated_at: new Date().toISOString()
      });

      setProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    }
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <div className="container">Chargement...</div>;
  }

  return (
    <div className="container">
      {/* En-tête */}
      <div className="account-header">
        <button className="back-button" onClick={() => navigate('/home')}>
          <ArrowBackIcon /> Retour
        </button>
        <h1 className="title">Mon Compte</h1>
      </div>

      {/* Carte principale du profil */}
      <div className="profile-card">
        <div className="card-header">
          <h2>Informations Personnelles</h2>
          <button 
            className="action-button"
            onClick={isEditing ? handleSave : handleEdit}
          >
            {isEditing ? <SaveIcon /> : <EditIcon />}
            {isEditing ? 'Sauvegarder' : 'Modifier'}
          </button>
        </div>

        <div className="profile-grid">
          <div className="profile-field">
            <label>Prénom</label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
            ) : (
              <p>{profile.firstName}</p>
            )}
          </div>

          <div className="profile-field">
            <label>Nom</label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
            ) : (
              <p>{profile.lastName}</p>
            )}
          </div>

          <div className="profile-field">
            <label>Email</label>
            <p>{profile.email}</p>
          </div>

          <div className="profile-field">
            <label>Type de Véhicule</label>
            {isEditing ? (
              <select
                value={editedProfile.vehicleType}
                onChange={(e) => handleChange('vehicleType', e.target.value)}
              >
                <option value="">Sélectionnez un véhicule</option>
                <option value="berline">Berline</option>
                <option value="van">Van</option>
                <option value="premium">Premium</option>
                <option value="electric">Électrique</option>
              </select>
            ) : (
              <p>{profile.vehicleType}</p>
            )}
          </div>

          <div className="profile-field">
            <label>Zone Préférée</label>
            {isEditing ? (
              <select
                value={editedProfile.preferredZone}
                onChange={(e) => handleChange('preferredZone', e.target.value)}
              >
                <option value="">Sélectionnez une zone</option>
                <option value="ville">Centre-ville</option>
                <option value="airport">Aéroports</option>
                <option value="suburbs">Banlieue</option>
              </select>
            ) : (
              <p>{profile.preferredZone}</p>
            )}
          </div>

          <div className="profile-field">
            <label>Expérience</label>
            {isEditing ? (
              <select
                value={editedProfile.yearsOfExperience}
                onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
              >
                <option value="">Votre expérience</option>
                <option value="0-1">Moins d'1 an</option>
                <option value="1-3">1 à 3 ans</option>
                <option value="3-5">3 à 5 ans</option>
                <option value="5+">Plus de 5 ans</option>
              </select>
            ) : (
              <p>{profile.yearsOfExperience}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section des plateformes */}
      <div className="preferences-card">
        <h2>Plateformes utilisées</h2>
        <div className="platforms-grid">
          {['Uber', 'Bolt', 'Heetch'].map(platform => (
            <label key={platform} className="checkbox-label">
              <input
                type="checkbox"
                checked={profile.platforms.includes(platform)}
                onChange={() => {
                  if (isEditing) {
                    const newPlatforms = profile.platforms.includes(platform)
                      ? profile.platforms.filter(p => p !== platform)
                      : [...profile.platforms, platform];
                    setEditedProfile(prev => ({
                      ...prev,
                      platforms: newPlatforms
                    }));
                  }
                }}
                disabled={!isEditing}
              />
              {platform}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Account; 