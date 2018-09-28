"use strict";
const startup = Date.now();

module.exports.make = (bot) => {
    bot.registerCommand("status", (message) => {
        if (message.channel.type === 1) {
            return
        }
        const totalseconds = (Date.now() - startup) / 1000;
        const totalminutes = parseInt(totalseconds / 60);
        const seconds = parseInt(totalseconds % 60);
        const totalhours = parseInt(totalminutes / 60);
        const minutes = parseInt(totalminutes % 60);
        const days = parseInt(totalhours / 24);
        const hours = parseInt(totalhours % 24);
        const embed = {
            title: `${bot.user.username}#${bot.user.discriminator}`,
            description: `A shitty bot written in JS`,
            color: 0x91244e,
            thumbnail: {
                url: `${bot.user.avatarURL}`
            },
            fields: [{
                name: "Creator",
                value: `Era#4669`,
                inline: false
            }, {
                name: "Uptime",
                value: `Have been awake for ${days}d${hours}h${minutes}m${seconds}s`,
                inline: false
            }]
        };
        bot.createMessage(message.channel.id, {
            content: '',
            embed: embed
        }).catch(err => console.log(err.stack))
    }, {
        description: "Returns the bot status",
        fullDescription: "Returns the bot's status, including uptime and bot owner."
    })
};