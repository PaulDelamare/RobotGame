# RobotGame

Petite application de démonstration.

Pour lancer le projet sans bun (Node + npm) :

1. Installer les dépendances :

```powershell
npm install
```

2. Installer vite en local si ce n'est pas déjà fait :

```powershell
npm install -D vite
```

3. Lancer le serveur de développement :

```powershell
npm run start
```

Le serveur s'ouvrira par défaut sur `http://localhost:5173/`.

Notes :
- Le script `start` utilise le binaire local `vite` (résolu par npm). Si vous préférez bun, remplacez `start` par `bunx vite .` dans `package.json`.
- Pour exposer le serveur sur le réseau, lancez `npm run start -- --host`.
