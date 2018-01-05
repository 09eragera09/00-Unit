"use strict";
const d20 = require('d20');

module.exports.make = (bot) => {
    bot.registerCommand("roll", (message, args) => {
        if (args.length <= 0) { return }
        let array1 = args.toString().split("#");
        let roll = d20.roll(array1[0], true);
        let rollString = roll.join("+");
        let rollTotal = roll.reduce((a, b) => {return a+b});
        let dice = "`"+array1[0]+"`";
        bot.createMessage(message.channel.id, {
            content: `${message.author.mention}`+': '+`${dice}`+' = ('+`${rollString}`+') = ' + `${rollTotal}`
        })
    }, {
        description: "RNGesus is impartial",
        fullDescription: "Rolls x number of y sided dice, do !roll xdy+(any other buffs)"
    })
}