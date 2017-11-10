const random = require('lodash.random')

module.exports.make = (bot) => {
    bot.registerCommand("choose", (message, args) => {
        choiceResult = args.join("").split("|");
        bot.createMessage(message.channel.id, {
            content: `${choiceResult[random(choiceResult.length -1)]}`})
        })
}
