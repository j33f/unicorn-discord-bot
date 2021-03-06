'use strict';
const { SlashCommandBuilder, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandNumberOption, SlashCommandMentionableOption, SlashCommandStringOption, SlashCommandUserOption, SlashCommandRoleOption } = require('@discordjs/builders');
const { interactionUserHaveRoles } = require('./utils/membersAndRoles');

class Command {
  /**
   * The command creator
   * @param command {string} The command name
   * @param description {string} The command description
   * @param handler {function} The command handler
   * @param buttonHandler {function} The command buttons handler
   * @param isSlashCommand {boolean} The command is a slash command ?
   * @param commandOptions {Array<object>} The command options (see @discordjs/builders)
   * @param requiredRoles {Array<string>} The required roles to use this command
   * @param requiredRolesErrorMessage {string} The error message to display if the user doesn't have the required roles
   */
  constructor({ command, description, handler, buttonHandler, isSlashCommand, commandOptions, requiredRoles, requiredRolesErrorMessage }) {
    this.command = command;
    this.description = description;

    this.options = commandOptions || [];

    this.isSlashCommand = isSlashCommand === undefined ? true : isSlashCommand;

    this.requiredRoles = requiredRoles || [];
    this.requiredRolesErrorMessage = requiredRolesErrorMessage || 'You do not have the required roles to use this command.';

    this._def = new SlashCommandBuilder();
    this._def.setName(this.command)
      .setDescription(this.description);

    this.__addOptions();

    /**
     * The command handler
     * It wraps the handler with a check of required roles if any
     * @param interaction
     * @returns {Promise<void>}
     */
    this.handler = async (interaction) => {
      const h = handler || this.defaultHandler;

      if (this.isSlashCommand && this.requiredRoles.length > 0) {
        const haveRoles = await interactionUserHaveRoles(interaction, this.requiredRoles);

        if (!haveRoles) {
          await interaction.reply({ content: this.requiredRolesErrorMessage });
          return;
        }
      }

      await h(interaction);
    };

    this.buttonsHandler = buttonHandler || this.defaultButtonsHandler;
  }

  /**
   * Add all the options to the command definition
   * @private
   */
  __addOptions () {
    this.options.forEach(option => {
      switch (String(option.type).toLowerCase()) {
        case 'attachment':
          this._def.addAttachmentOption(option.handler);
          break;
        case 'boolean':
          this._def.addBooleanOption(option.handler);
          break;
        case 'channel':
          this._def.addChannelOption(option.handler);
          break;
        case 'integer':
          this._def.addIntegerOption(option.handler);
          break;
        case 'number':
        case 'decimal':
          this._def.addNumberOption(option.handler);
          break;
        case 'mentionable':
          this._def.addMentionableOption(option.handler);
          break;
        case 'string':
          this._def.addStringOption(option.handler);
          break;
        case 'user':
          this._def.addUserOption(option.handler);
          break;
        case 'role':
          this._def.addRoleOption(option.handler);
          break;
        default:
          throw new Error('Unknown option type');
      }
    });
  }

  /**
   * Getter for the command definition
   * @returns {object}
   */
  get def() {
    return this._def.toJSON();
  }

  /**
   * Simple getter for a simple command representation easy to manipulate
   * @returns {{handler: Function, def: object, buttonsHandler: Function, isSlashCommand: boolean, thisObject: Command, command: string}}
   */
  get me() {
    return {
      command: this.command,
      def: this.def,
      handler: this.handler,
      buttonsHandler: this.buttonsHandler,
      thisObject: this,
      isSlashCommand: this.isSlashCommand,
    };
  }

  /**
   * Default handler for interactive commands
   * @param interaction
   * @returns {Promise<void>}
   */
  async defaultHandler(interaction) {
    const content = 'The command has been received, but there is nothing to do...';
    await interaction.reply({ content, ephemeral: true });
  }

  /**
   * Default handler for buttons commands, returns 0 because there is no buttons handheld
   * @returns {Promise<number>}
   */
  async defaultButtonsHandler() {
    return 0;
  }
}

module.exports = Command;