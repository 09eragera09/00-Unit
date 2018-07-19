"use strict";

module.exports.make = (bot) => {
    bot.registerCommand("source", "https://github.com/09eragera09/00-Unit", {description: "Gets the bot's source code"});
    bot.registerCommand("invite", `https://discordapp.com/oauth2/authorize/?permissions=8&scope=bot&client_id=376917136980836362`, {description: "Gets the bot invite url"})
};