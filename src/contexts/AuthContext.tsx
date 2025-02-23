import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/Firebase';

// Type pour le contexte
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
};

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};

// Provider du contexte
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écouter les changements d'authentification
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('État de l\'authentification changé:', user);
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Création du compte utilisateur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Mise à jour du profil utilisateur avec le prénom
      await updateProfile(user, {
        displayName: userData.first_name
      });

      // Création du profil dans Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        user_id: user.uid,
        first_name: userData.first_name,
        last_name: userData.last_name,
        vehicle_type: userData.vehicle_type,
        preferred_zone: userData.preferred_zone,
        years_of_experience: userData.years_of_experience,
        platforms: userData.platforms,
        work_city: userData.work_city,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return userCredential;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      throw new Error(error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentative de connexion avec:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Connexion réussie:', userCredential.user);
      return userCredential;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 