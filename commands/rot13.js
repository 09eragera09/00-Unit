"use strict";

module.exports.make = (bot) => {
    bot.registerCommand("spoiler", (message, args) => {
        bot.deleteMessage(message.channel.id, message.id, undefined)
        if (args.length < 2) {
            return
        }
        let game = args.shift();
        let spoiler = args.join(' ').replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);})
        let embed = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `Spoiler for ${game.split('_').join(' ')} by ${message.author.username}#${message.author.discriminator}`
            },
            description: `${spoiler}`,
            footer: {
                text: "To read the spoiler, click on the reaction.",
                icon_url: bot.user.avatarURL
            }
        }
        bot.createMessage(message.channel.id, {
            content: '',
            embed: embed
        }).then(m=>{m.addReaction("🍌")})
    }, {
        description: "Parses spoilers",
        fullDescription: "Takes 2 Arguments: Game Name in a single word, and the spoiler itself\n Eg. !spoiler GTAV Trevor is the nicest of the bunch\nParses spoilers through Rot13 for easy posting and viewing without ruining others' experience."
    })
    bot.on("messageReactionAdd", (message, emoji, userID) => {
        bot.getMessage(message.channel.id, message.id).then(msg => {
            if (msg.embeds[0].author.name.split(' ')[0] != "Spoiler") {
                return
            }
            if (userID != bot.user.id && msg.author.id == bot.user.id && msg.embeds.length != 0) {
                bot.getDMChannel(userID).then(res => {
                    let embed = {
                        color: 0x91244e,
                        type: 'rich',
                        author: {
                            name: `${msg.embeds[0].author.name}`
                        },
                        description: `${msg.embeds[0].description.replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);})}`,
                        footer: {
                            text: "Spoiler support provided by 00-unit, a shitty bot written in JS by EraTheMonologuer",
                            icon_url: bot.user.avatarURL
                        }
                    }
                    bot.createMessage(res.id, {
                        content: '',
                        embed: embed,
                    })});
            }
        });

    })
}