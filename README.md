# RobotGame

Démo pédagogique : programme ton robot, récupère les clés, évite les dangers et termine chaque niveau.

## Prérequis

- Node.js 18+ (recommandé) et npm
- Git (pour cloner le dépôt)

> 💡 Le projet s'appuie sur **Vite**. Assure-toi qu'il est bien installé comme dépendance de développement, sinon la commande `npm run start` échouera.

## Installation

1. **Cloner le dépôt** :

	```powershell
	git clone https://github.com/PaulDelamare/RobotGame.git
	cd RobotGame
	```

2. **Installer les dépendances npm** :

	```powershell
	npm install
	```

3. **Installer Vite en local** (si l'étape précédente ne l'a pas déjà ajouté) :

	```powershell
	npm install -D vite
	```

## Lancer le projet

```powershell
npm run start
```

- L'interface est accessible sur `http://localhost:5173/`.
- Pour autoriser les connexions réseau (smartphone, autre PC), ajoute `--host` :

  ```powershell
  npm run start -- --host
  ```

## Notes

- Le script `start` lance `vite` depuis `node_modules/.bin`. Si tu préfères **bun**, adapte `package.json` (`bunx vite .`).
- En cas de mise à jour de dépendances, relance `npm install` puis `npm run start`.
