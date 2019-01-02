"use strict";
const toggle = require('../commands/toggle');
const path = require('path');
let moduleName = path.basename(__filename);

module.exports.make = async (bot, conn) => {
    let fun = bot.registerCommand("fun", "The following commands are available:- shitwaifu\nPut them after the fun command as subcommands to use.\nIf you have any fun stuff you would like to see in this command, talk to the owner.", {
        description: "A command that holds other basic fun subcommands",
        fullDescription: "A command that holds other basic fun subcommands, such as textfaces and a saber meme. Tell Era#4669 if you have more stuff you'd like added."
    });
    fun.registerSubcommand("shitwaifu", "http://i2.kym-cdn.com/photos/images/original/000/756/008/29d.jpg");
    bot.registerCommand("abuse", async (message, args) => {
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
        //This is going to be slow as shit....
        const member = message.channel.guild.members.find(m => {
            if (m.username === username || m.nick === username) return true;
        });
        if (member === undefined) {
            bot.createMessage(message.channel.id, {
                content: "User not found. Please check if there are typos. Search terms are case sensitive."
            }).catch(err => console.log(err));
            return
        }
        if (member.id === message.channel.guild.ownerID) {
            if (message.author.id === member.id) {
                bot.createMessage(message.channel.id, {content: "I cant abuse you!"}).catch(err => console.log(err));
                return
            }
            bot.createMessage(message.channel.id, {content: "Nibba fuck off you ain't got nothing on him"}).catch(err => console.log(err));
            return
        }
        let list_of_abuse = ["Fuck you", "Kill yourself", "Your existence is pointless", "You're just a waste of space", "You're just a burden", "Waste of Oxygen"];
        let abuse = list_of_abuse[Math.floor(Math.random() * list_of_abuse.length)] + ', ' + member.mention;
        bot.createMessage(message.channel.id, {content: abuse}).catch(err => console.log(err))
    }, {
        description: "Abuses the user",
        fullDescription: "Abuses the mentioned user. Accepts Usernames, User Mentions, and Message Author as proper arguments."
    });
    bot.registerCommand("say", async (message, args) => {
        let [enabled, res] = await toggle.checkEnabled(message.channel.guild.id, moduleName, conn);
        if (!enabled) {
            bot.createMessage(message.channel.id, {
                content: res
            }).catch(err => console.log(err));
            return
        }
        bot.createMessage(message.channel.id, {
            content: `${args.join(' ')}`
        }).catch(err => console.log(err))
    }, {
        description: "Make the bot say stuff",
    })
};