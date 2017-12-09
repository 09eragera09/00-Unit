"use strict";

const moment = require('moment');
var startup = Date.now();
var config = require('../config.json')

module.exports.make = (bot) => {
    bot.registerCommand("status", (message, args) => {
        var totalseconds = (Date.now() - startup)/1000;
        var totalminutes = parseInt(totalseconds/60);
        var seconds = parseInt(totalseconds%60);
        var totalhours = parseInt(totalminutes/60);
        var minutes = parseInt(totalminutes%60);
        var days = parseInt(totalhours/24);
        var hours = parseInt(totalhours%24)
        var embed = {
            title: `${bot.user.username}#${bot.user.discriminator}`,
            description: `A shitty bot written in JS`,
            color: 0x91244e,
            thumbnail: {
                url: `${bot.user.avatarURL}`
            },
            fields: [{
                name: "Owner",
                value: `Era#4669`,
                inline: false
            }, {
                name: "Uptime",
                value: `Have been awake for ${days}d${hours}h${minutes}m${seconds}s`,
                inline: false
            }]
        }
        bot.createMessage(message.channel.id, {
            content: '',
            embed: embed
        })
    }, {
        description: "Returns the bot status",
        fullDescription: "Returns the bot's status, including uptime and bot owner."
    })
}