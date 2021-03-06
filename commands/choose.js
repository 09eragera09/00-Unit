"use strict";
const toggle = require('../commands/toggle');
const path = require('path');
let moduleName = path.basename(__filename);
const random = require('lodash.random');

module.exports.make = async (bot, conn) => {

    bot.registerCommand("choose", async (message, args) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"})
                .catch(err => console.log(err));
            return
        }
        let [enabled, res] = await toggle.checkEnabled(message.channel.guild.id, moduleName, conn);
        if (!enabled) {
            bot.createMessage(message.channel.id, {
                content: res
            }).catch(err => console.log(err));
            return
        }
        const choiceResult = args.join(" ").split("|");
        bot.createMessage(message.channel.id, {
            content: `${choiceResult[random(choiceResult.length - 1)]}`
        }).catch(err => console.log(err))
    }, {
        description: "Chooses from given arguments",
        fullDescription: "Chooses one from given arguments. Arguments must be split with a `|`"
    })
};
