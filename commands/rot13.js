"use strict";
const toggle = require('../commands/toggle');
const path = require('path');
let moduleName = path.basename(__filename);

//TODO FIX THIS FUCKING THING YOU AUTISTIC FUCK

module.exports.make = async(bot, conn) => {
    ``;
    bot.registerCommand("spoiler", async(message, args) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, { content: "Bot disabled in DM channels" })
                .catch(err => console.log(err.stack));
            return
        }
        bot.deleteMessage(message.channel.id, message.id, undefined)
            .catch(err => console.log(err.stack));
        let [enabled, res] = await toggle.checkEnabled(message.channel.guild.id, moduleName, conn);
        if (!enabled) {
            bot.createMessage(message.channel.id, {
                content: res
            }).catch(err => console.log(err.stack));
            return
        }
        if (args.length < 2) {
            return
        }

        // Splits the name by escaped underscore, replaces escaped underscores
        // with spaces in each part, and rejoins the parts with an underscore.
        let game = args.shift().split(/\\_/).map(part => part.replace("_", " ")).join('_');
        let spoiler = args.join(' ').replace(/[a-zA-Z]/g, function(c) {
            return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        });
        let embed = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `Spoiler for ${game} by ${message.author.username}#${message.author.discriminator}`
            },
            description: `${spoiler}`,
            footer: {
                text: "To read the spoiler, click on the reaction.",
                icon_url: bot.user.avatarURL
            }
        };
        bot.createMessage(message.channel.id, {
            content: '',
            embed: embed
        }).then(m => {
            m.addReaction("🍌").catch(err => console.log(err.stack))
        })
    }, {
        description: "Parses spoilers",
        fullDescription: "Takes 2 Arguments: Game name in a single word (spaces replaced with underscore), and the spoiler itself.\n Eg. !spoiler GTA_V Trevor is the nicest of the bunch.\nParses spoilers through Rot13 for easy posting and viewing without ruining others' experience."
    });
    bot.on("messageReactionAdd", (message, emoji, userID) => {
        bot.getMessage(message.channel.id, message.id).then(msg => {
            try {
                if (msg.embeds.length !== 0) {
                    if (msg.embeds[0].author.name.split(' ')[0] !== "Spoiler") {
                        return
                    }
                }
            } catch (err) {
                console.log(err);
                return
            }
            try {
                if (userID !== bot.user.id && msg.author.id === bot.user.id && msg.embeds.length !== 0) {
                    bot.getDMChannel(userID).then(res => {
                        let embed = {
                            color: 0x91244e,
                            type: 'rich',
                            author: {
                                name: `${msg.embeds[0].author.name}`
                            },
                            description: `${msg.embeds[0].description.replace(/[a-zA-Z]/g, function (c) {
                            return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
                        })}`,
                            footer: {
                                text: "Spoiler support provided by 00-unit, a shitty bot written in JS by EraTheMonologuer",
                                icon_url: bot.user.avatarURL
                            }
                        };
                        bot.createMessage(res.id, {
                            content: '',
                            embed: embed,
                        }).catch(err => console.log(err.stack))
                    });
                }
            } catch (err) {
                console.log(err);
            }
        });

    })
};