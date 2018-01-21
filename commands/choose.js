"use strict";

const random = require('lodash.random')

module.exports.make = (bot) => {
    bot.registerCommand("choose", (message, args) => {
        var choiceResult = args.join(" ").split("|");
        bot.createMessage(message.channel.id, {
            content: `${choiceResult[random(choiceResult.length -1)]}`})
        }, {
            description: "Chooses from given arguments",
            fullDescription: "Chooses one from given arguments. Arguments must be split with a `|`"
        })
}
