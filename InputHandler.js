const readlineSync = require('readline-sync');

/**
 * Classe pour centraliser la gestion des entrées utilisateur.
 */
class InputHandler {
  /**
   * Demande une entrée texte à l'utilisateur.
   * @param {string} question - La question à poser.
   * @returns {string} - La réponse de l'utilisateur.
   */
  static getTextInput(question) {
    return readlineSync.question(question);
  }

  /**
   * Demande une entrée numérique à l'utilisateur avec des options limitées.
   * @param {string} question - La question à poser.
   * @param {number[]} validOptions - Les options valides.
   * @param {string} limitMessage - Message en cas de choix invalide.
   * @returns {number} - Le choix validé de l'utilisateur.
   */
  static getNumberInput(question, validOptions, limitMessage = "Invalid choice.") {
    return readlineSync.questionInt(question, {
      limit: validOptions,
      limitMessage,
    });
  }
}

module.exports = InputHandler;
