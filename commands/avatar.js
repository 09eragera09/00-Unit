"use strict";
const toggle = require('../commands/toggle');
const path = require('path');
let moduleName = path.basename(__filename);

module.exports.make = async (bot, conn) => {
    bot.registerCommand("avatar", async (message, args) => {
        let [enabled, res]= await toggle.checkEnabled(message.channel.guild.id, moduleName, conn)
        if (!enabled) {
            bot.createMessage(message.channel.id, {
                content: res
            });
            return
        }
        if (message.channel.type == 1) {return}
        if (args == 0) {
           var username = message.author.username;
        }
        else if (message.mentions.length > 0 && !message.mentionEveryone) {
           var username = message.mentions[0].username;
        }
        else {
           var username = args[0];
        }
        var member = message.channel.guild.members.find(m => {
            if (m.username == username || m.nick == username) return true;
        })
        if (member === undefined) {
            bot.createMessage(message.channel.id, {
                content: "User not found. Please check if there are typos. Search terms are case sensitive."
            });
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
        })
    }, {
        description: "Returns a user avatar",
        fullDescription: "Returns a user avatar. Accepts message mentions and single word usernames/nicknames, else defaults to message author"
    })
}