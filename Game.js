const readlineSync = require('readline-sync'); // Utilisation de readline-sync pour gérer les entrées utilisateur
const PokemiltonMaster = require('./PokemiltonMaster'); // Classe représentant le joueur
const PokemiltonWorld = require('./PokemiltonWorld'); // Classe représentant le monde du jeu
const Pokemilton = require('./Pokemilton'); // Import de la classe Pokemilton™
const fs = require('fs'); // Gestion des fichiers pour sauvegarder et charger l'état du jeu

/**
 * Initialise une nouvelle partie.
 * Demande le nom du joueur et lui permet de choisir un premier Pokemilton™.
 * @returns {object} - Contient l'instance du joueur (master) et du monde (world).
 */
function initializeNewGame() {
  console.log("Let's start a new adventure!");

  // Demande au joueur son nom
  const name = readlineSync.question("What's your name, Pokemilton™ Master? ");
  const master = new PokemiltonMaster(name); // Crée une instance du joueur
  const world = new PokemiltonWorld(); // Crée une instance du monde

  console.log(`Welcome, ${name}!`);
  console.log("Choose your first Pokemilton™:");

  // Génération de trois Pokemilton™ aléatoires
  const options = [new Pokemilton(), new Pokemilton(), new Pokemilton()];
  options.forEach((pokemilton, index) => {
    console.log(
      `${index + 1}. ${pokemilton.name} (Level: ${pokemilton.level}, Health: ${pokemilton.healthPool}/${pokemilton.maxHealthPool}, Attack: ${pokemilton.attackRange}, Defense: ${pokemilton.defenseRange}, Catch Phrase: "${pokemilton.catchPhrase}")`
    );
  });

  // Demande au joueur de sélectionner un Pokemilton™
  const choice = readlineSync.questionInt("Enter the number of your choice: ", {
    limit: [1, 2, 3],
    limitMessage: "Invalid choice. Please select 1, 2, or 3.",
  });

  const chosenPokemilton = options[choice - 1]; // Sélectionne le Pokemilton choisi
  master.pokemiltonCollection.push(chosenPokemilton); // Ajoute le Pokemilton à la collection
  console.log(`${chosenPokemilton.name} has joined your team!`);

  return { master, world }; // Retourne l'état initial du jeu
}

/**
 * Fonction principale pour gérer le jeu.
 * Permet de charger une partie ou d'en démarrer une nouvelle.
 */
function startGame() {
  let gameState; // État du jeu
  const saveFile = './save.json'; // Fichier de sauvegarde

  // Vérifie si un fichier de sauvegarde existe
  if (fs.existsSync(saveFile)) {
    const loadGame = readlineSync.question("Do you want to load the previous game? [y/n]: ").toLowerCase();
    if (loadGame === 'y') {
      try {
        const savedData = JSON.parse(fs.readFileSync(saveFile, 'utf-8')); // Lit le fichier JSON
        gameState = loadGameState(savedData); // Reconstruit l'état du jeu
      } catch (error) {
        console.log("No valid save file found. Starting a new game."); // Gestion des erreurs de sauvegarde corrompue
        gameState = initializeNewGame();
      }
    } else {
      gameState = initializeNewGame(); // Démarre une nouvelle partie
    }
  } else {
    console.log("No save file available. Starting a new game."); // Message clair en l'absence de sauvegarde
    gameState = initializeNewGame();
  }

  const { master, world } = gameState; // Déstructure l'état du jeu

  let running = true; // Contrôle la boucle principale du jeu
  while (running) {
    console.log(`Day ${world.day}: What would you like to do today?`);
    console.log("1. Show your Pokemilton™ collection");
    console.log("2. Pass one day");
    console.log("3. Save and exit");

    // Demande au joueur son choix
    const choice = readlineSync.questionInt("Enter the number of your choice: ", {
      limit: [1, 2, 3],
      limitMessage: "Invalid choice. Please select 1, 2, or 3.",
    });

    if (choice === 1) {
      showCollectionWithOptions(master); // Affiche la collection avec les options disponibles
    } else if (choice === 2) {
      world.oneDayPasses(master, () => saveGameState({ master, world })); // Passe un jour et sauvegarde l'état
    } else if (choice === 3) {
      saveGameState({ master, world }); // Sauvegarde l'état avant de quitter
    //   console.log("Game state saved successfully!");
      running = false; // Arrête la boucle principale
    }
  }
}

/**
 * Affiche la collection de Pokemilton™ et ajoute une option pour voir les objets.
 * @param {PokemiltonMaster} master - Le joueur actuel.
 */
function showCollectionWithOptions(master) {
  console.log(`Pokemilton™ collection of ${master.name}:`);
  master.pokemiltonCollection.forEach((pokemilton, index) => {
    console.log(
      `${index + 1}. ${pokemilton.name} (Level: ${pokemilton.level}, Health: ${pokemilton.healthPool}/${pokemilton.maxHealthPool}, Attack: ${pokemilton.attackRange}, Defense: ${pokemilton.defenseRange}, Catch Phrase: "${pokemilton.catchPhrase}")`
    );
  });

  console.log("\nWhat would you like to do?");
  console.log("1. Heal a Pokemilton™");
  console.log("2. Revive a Pokemilton™"); // Option pour ressusciter un Pokemilton™
  console.log("3. View items");
  console.log("4. Go back");

  const action = readlineSync.questionInt("Enter your choice: ", {
    limit: [1, 2, 3, 4],
    limitMessage: "Invalid choice. Please select 1, 2, 3 or 4.",
  });

  if (action === 1) {
    if (master.healingItems > 0) {
      const damagedPokemiltons = master.pokemiltonCollection.filter(
        pokemilton => pokemilton.healthPool < pokemilton.maxHealthPool
      );
      if (damagedPokemiltons.length > 0) {
        console.log("Damaged Pokemilton™:");
        damagedPokemiltons.forEach((pokemilton, index) => {
          console.log(`${index + 1}. ${pokemilton.name} (Health: ${pokemilton.healthPool}/${pokemilton.maxHealthPool})`);
        });
      const choice = readlineSync.questionInt("Choose a Pokemilton™ to heal (enter number): ", {
        limit: Array.from({ length: master.pokemiltonCollection.length }, (_, i) => i + 1),
        limitMessage: "Invalid choice. Please select a valid number.",
      });
      const selectedPokemilton = master.pokemiltonCollection[choice - 1];
      master.healPokemilton(selectedPokemilton); // Soigne le Pokemilton sélectionné
    } else {
      console.log("You don't have any healing items left!"); // Message d'erreur si aucun soin disponible
    }
  }
  }  else if (action === 2) {
    if (master.reviveItems > 0) {
      const faintedPokemiltons = master.pokemiltonCollection.filter(p => p.healthPool === 0);
      if (faintedPokemiltons.length > 0) {
        console.log("\nFainted Pokemilton™:");
        faintedPokemiltons.forEach((pokemilton, index) => {
          console.log(`${index + 1}. ${pokemilton.name}`);
        });
        const choice = readlineSync.questionInt("Choose a Pokemilton™ to revive (enter number): ", {
          limit: Array.from({ length: faintedPokemiltons.length }, (_, i) => i + 1),
          limitMessage: "Invalid choice. Please select a valid number.",
        });
        const selectedPokemilton = faintedPokemiltons[choice - 1];
        master.revivePokemilton(selectedPokemilton); // Ressuscite le Pokemilton sélectionné
      } else {
        console.log("No fainted Pokemilton™ to revive."); // Aucun Pokémon à ressusciter
      }
    } else {
      console.log("You don't have any revive items left!"); // Pas d'objets de résurrection disponibles
    }
    } else if (action === 3) {
    viewItems(master, () => showCollectionWithOptions(master)); // Appelle la fonction pour afficher les objets
  }
}

/**
 * Affiche les objets du joueur avec une option pour retourner au menu précédent.
 * @param {PokemiltonMaster} master - Le joueur actuel.
 * @param {function} callback - Fonction de rappel pour retourner au menu précédent.
 */
function viewItems(master, callback) {
  let inInventory = true;

  while (inInventory) {
    console.log("\nItems in your inventory:");
    console.log(`- Healing items: ${master.healingItems}`);
    console.log(`- Revive items: ${master.reviveItems}`);
    console.log(`- Pokeballs: ${master.POKEBALLS}`);

    const choice = readlineSync.questionInt(
      "\nWhat would you like to do?\n1. Back\nEnter your choice: ",
      { limit: [1], limitMessage: "Invalid choice. Please select 1 to go back." }
    );

    if (choice === 1) {
      inInventory = false; // Quitte l'inventaire
      callback(); // Retourne au menu précédent
    }
  }
}

/**
 * Sauvegarde l'état du jeu dans un fichier JSON.
 * @param {object} gameState - L'état actuel du jeu.
 */
function saveGameState(gameState) {
  const saveData = {
    saved_on: new Date().toISOString(),
    PokemiltonMaster: {
      name: gameState.master.name,
      pokemiltonCollection: gameState.master.pokemiltonCollection,
      healingItems: gameState.master.healingItems,
      reviveItems: gameState.master.reviveItems,
      POKEBALLS: gameState.master.POKEBALLS,
    },
    day: gameState.world.day,
    logs: gameState.world.logs,
  };
  fs.writeFileSync('./save.json', JSON.stringify(saveData, null, 2)); // Sauvegarde dans un fichier JSON
  console.log("Game state saved successfully!");
}

/**
 * Charge l'état du jeu depuis les données sauvegardées.
 * @param {object} data - Les données sauvegardées.
 * @returns {object} - L'état du jeu reconstruit.
 */
function loadGameState(data) {
  if (!data.PokemiltonMaster || !data.PokemiltonMaster.name) {
    throw new Error("Invalid save file: Missing PokemiltonMaster data."); // Vérifie si les données sont valides
  }

  const master = Object.assign(new PokemiltonMaster(data.PokemiltonMaster.name), {
    pokemiltonCollection: data.PokemiltonMaster.pokemiltonCollection.map((pokemilton) =>
      Object.assign(new Pokemilton(), pokemilton)
    ),
    healingItems: data.PokemiltonMaster.healingItems,
    reviveItems: data.PokemiltonMaster.reviveItems,
    POKEBALLS: data.PokemiltonMaster.POKEBALLS,
  });

  const world = Object.assign(new PokemiltonWorld(), {
    day: data.day,
    logs: data.logs,
  });

  console.log("Game state loaded successfully!");
  return { master, world };
}

// Lancement du jeu
startGame();
