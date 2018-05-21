"use strict";
const toggle = require('../commands/toggle');
const path = require('path');
let moduleName = path.basename(__filename);
const random = require('lodash.random')

module.exports.make = async (bot, conn) => {

    bot.registerCommand("choose", async (message, args) => {
        let [enabled, res]= await toggle.checkEnabled(message.channel.guild.id, moduleName, conn)
        if (!enabled) {
            bot.createMessage(message.channel.id, {
                content: res
            });
            return
        }
        var choiceResult = args.join(" ").split("|");
        bot.createMessage(message.channel.id, {
            content: `${choiceResult[random(choiceResult.length -1)]}`})
        }, {
            description: "Chooses from given arguments",
            fullDescription: "Chooses one from given arguments. Arguments must be split with a `|`"
        })
}
