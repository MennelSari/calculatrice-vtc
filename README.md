# Calculateur d'Objectifs VTC

Une application web moderne pour aider les chauffeurs VTC à gérer leurs objectifs de revenus hebdomadaires.

## Fonctionnalités

- Définition d'un objectif hebdomadaire
- Gestion des coefficients journaliers ajustables
- Calcul automatique des objectifs quotidiens
- Suivi des revenus réalisés
- Recalcul dynamique des objectifs restants
- Interface responsive et intuitive
- Indicateurs visuels de progression

## Technologies utilisées

- React
- TypeScript
- Material-UI (MUI)
- Vite

## Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/vtc-calculator.git

# Accéder au répertoire
cd vtc-calculator

# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm run dev
```

## Utilisation

1. Définissez votre objectif hebdomadaire
2. Ajustez les coefficients journaliers selon vos besoins
3. Entrez vos revenus quotidiens
4. L'application recalcule automatiquement les objectifs restants

## Licence

MIT

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
