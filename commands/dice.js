"use strict";
const d20 = require('d20');
const toggle = require('../commands/toggle');
const path = require('path');
let moduleName = path.basename(__filename);

module.exports.make = async (bot, conn) => {
    bot.registerCommand("roll", async (message, args) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"});
            return
        }
        let [enabled, res] = await toggle.checkEnabled(message.channel.guild.id, moduleName, conn);
        if (!enabled) {
            bot.createMessage(message.channel.id, {
                content: res
            });
            return
        }
        if (args.length <= 0) {
            return
        }
        let array1 = args.toString().split("#");
        let roll = d20.roll(array1[0], true);
        let rollString = roll.join("+");
        let rollTotal = roll.reduce((a, b) => {
            return a + b
        });
        let dice = "`" + array1[0] + "`";
        bot.createMessage(message.channel.id, {
            content: `${message.author.mention}` + ': ' + `${dice}` + ' = (' + `${rollString}` + ') = ' + `${rollTotal}`
        })
    }, {
        description: "RNGesus is impartial",
        fullDescription: "Rolls x number of y sided dice, do !roll xdy+(any other buffs)"
    })
};