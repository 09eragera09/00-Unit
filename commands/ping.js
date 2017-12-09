"use strict";

module.exports.make = (bot) => {
    bot.registerCommand("ping", (message, args) => {
        var before = new Date();
        var mEmbd = {
            color: 0x91244e,
            author: {
                name: `${message.author.username}#${message.author.discriminator}`,
                icon_url: `${message.author.avatarURL}`
            },
            description: `Pong!`
        }
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
}