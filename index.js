const DiscordBot = require('./lib/DiscordBot.class');
const Command = require('./lib/Command.class');
const SoundManager = require('./lib/SoundManager.class');
const vocChanUtils = require('./lib/utils/vocChan');

const { Intents } = require('discord.js');


module.exports = {
  DiscordBot,
  Command,
  SoundManager,
  vocChanUtils,
  Intents
};