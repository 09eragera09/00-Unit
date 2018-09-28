"use strict";
const toggle = require('../commands/toggle');
const path = require('path');
let moduleName = path.basename(__filename);

module.exports.make = async (bot, conn) => {
    bot.registerCommand("avatar", async (message, args) => {
        let username;
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
        if (args.length === 0) {
            username = message.author.username;
        }
        else if (message.mentions.length > 0 && !message.mentionEveryone) {
            username = message.mentions[0].username;
        }
        else {
            username = args[0];
        }
        const member = message.channel.guild.members.find(m => {
            if (m.username === username || m.nick === username) return true;
        });
        if (member === undefined) {
            bot.createMessage(message.channel.id, {
                content: "User not found. Please check if there are typos. Search terms are case sensitive."
            }).catch(err => console.log(err));
            return
        }
        bot.createMessage(message.channel.id, {
            content: '',
            embed: {
                color: 0x91244e,
                title: `${member.username}#${member.discriminator}`,
                image: {
                    url: `${member.user.dynamicAvatarURL("png", 2048)}`
                }
            }
        }).catch(err => console.log(err))
    }, {
        description: "Returns a user avatar",
        fullDescription: "Returns a user avatar. Accepts message mentions and single word usernames/nicknames, else defaults to message author"
    })
};