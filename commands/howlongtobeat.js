"use strict";

const hltb = require("howlongtobeat");
const hltbService = new hltb.HowLongToBeatService()

module.exports.make = async (bot) => {
    await bot.registerCommand('hltb',async (message, argv) => {
        let embedAll = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `HowLongToBeat search for term "${argv.join(' ')}"`,
                icon_url: `${bot.user.avatarURL}`
            },
            description: `The search contains more than 1 result. Please reply with the appropriate entry number in order to view its details.\n`,
            fields: []
        }
        let res1 = await hltbService.search(argv.join(' '))
        if (res1.length == 0) { bot.createMessage(message.channel.id, {content: "Search returned no results."})}
        else if (res1.length == 1) {
            var embed = hltbEmbed(res1[0]);
            bot.createMessage(message.channel.id, {content:'', embed: embed})
        }
        else if (res1.length > 1) {
            for (var i = 0; i < res1.length; i++) {
                embedAll.description = embedAll.description + `\n${i+1}: ${res1[i].name}`
            }
            bot.createMessage(message.channel.id, {content: '', embed: embedAll}).then((msg) => {
                setTimeout( () => {bot.getMessages(msg.channel.id, 10, undefined, msg.id).then((messageArray) => {
                    messageArray.forEach((mesg) => {
                        if (mesg.author == message.author && parseInt(mesg.content) <= res1.length) {
                            var embedS = hltbEmbed(res1[parseInt(mesg.content) - 1])
                            bot.createMessage(message.channel.id, {content: '', embed: embedS})
                        }
                    })
                }).catch(err => console.log(err))}, 7000)
            })
        }
    },  {
        description: "Generic HowLongToBeat search",
    })
    function hltbEmbed(hltbRes) {
        let embed = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `${hltbRes.name}`,
                icon_url: `${hltbRes.imageUrl}`
            },
            description: `https://howlongtobeat.com/game.php?id=${hltbRes.id}`,
            thumbnail: {
                url: `${hltbRes.imageUrl}`
            },
            fields: [
                {name: 'Main Story', value: `${hltbRes.gameplayMain} hours`},
                {name: 'Completionist', value: `${hltbRes.gameplayCompletionist} hours`}
            ],
            footer: {
                text: "Search provided by 00-Unit, a shitty bot written in JS by EraTheMonologuer",
                icon_url: bot.user.avatarURL
            }
        }
        return(embed)
    }
}