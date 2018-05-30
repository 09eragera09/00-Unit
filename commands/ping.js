"use strict";
const toggle = require('../commands/toggle');
const path = require('path');
let moduleName = path.basename(__filename);

module.exports.make = (bot, conn) => {
    bot.registerCommand("ping", async (message) => {
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
        var before = new Date();
        var mEmbd = {
            color: 0x91244e,
            author: {
                name: `${message.author.username}#${message.author.discriminator}`,
                icon_url: `${message.author.avatarURL}`
            },
            description: `Pong!`
        };
        bot.createMessage(message.channel.id, {
            content: ``,
            embed: mEmbd
        }).then(m => bot.editMessage(m.channel.id, m.id, {
            content: ``,
            embed: {
                color: 0x91244e,
                author: {
                    name: `${message.author.username}#${message.author.discriminator}`,
                    icon_url: `${message.author.avatarURL}`
                },
                description: "Ping! That took " + (Date.now() - before) + " milliseconds"
            }
        })).catch((err) => {
            console.log(err.stack);
        })
    }, {
        description: "A ping command",
        fullDescription: "A ping command, to keep you entertained."
    })
};