# API Immobilière GraphQL + REST

Une API complète pour la gestion d'annonces immobilières, combinant REST (Swagger) et GraphQL. Le projet utilise Express.js comme serveur HTTP et MongoDB comme base de données.

## 👤 Auteur

**Abir LARAICH**
- Numéro étudiant : LA233225
- Email : abir.laraich@etu.univ-lehavre.fr

## 🚀 Fonctionnalités

- API REST documentée avec Swagger
- API GraphQL avec Playground
- Authentification via Google OAuth 2.0
- Gestion des annonces immobilières (CRUD)
- Système de questions/réponses sur les annonces
- Gestion des utilisateurs et des rôles (client/agent)
- Validation des requêtes GraphQL
- Tests d'intégration

## 🛠️ Installation

1. Cloner le repository
```bash
git clone https://www-apps.univ-lehavre.fr/forge/la233225/graphql-lab

cd graphql-lab
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
Créer un fichier `.env` à la racine du projet :
```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/agenceImmobiliere
JWT_SECRET=votre_secret_jwt
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback
SESSION_SECRET=votre_secret_session
```

4. Démarrer le serveur
```bash
npm start
```

## 🔍 Points d'accès API

- **Swagger Documentation**: `http://localhost:8080/docs`
- **GraphQL Playground**: `http://localhost:8080/playground`
- **GraphQL Endpoint**: `http://localhost:8080/graphql`
- **Google Auth**: `http://localhost:8080/auth/google`

## 📝 Documentation GraphQL

### Types Principaux

- **Annonce**: Représente une annonce immobilière
- **User**: Représente un utilisateur
- **Question**: Questions posées sur une annonce
- **Reponse**: Réponses aux questions


## 🔒 Authentification

Le système utilise deux méthodes d'authentification :
1. **Google OAuth 2.0**: Pour l'authentification utilisateur
2. **JWT**: Pour sécuriser les requêtes API

Les tokens JWT sont requis pour toutes les opérations protégées et doivent être inclus dans le header HTTP :
```
Authorization: Bearer <votre_token>
```

## 🧪 Tests

Exécuter les tests :
```bash
npm test
```

Les tests couvrent :
- Validation des requêtes GraphQL
- Opérations CRUD sur les annonces
- Authentification et autorisation
- Gestion des utilisateurs

## 🛡️ Directives GraphQL

Le schéma utilise plusieurs directives importantes :
- `@auth`: Pour la protection des routes
- `@deprecated`: Pour marquer les champs obsolètes
- `@include`/`@skip`: Pour le contrôle conditionnel des champs

---
_Ce projet a été développé dans le cadre du cours M2 IWOCS WEB_