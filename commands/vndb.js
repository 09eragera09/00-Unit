"use strict";
const VNDB = require("vndb");
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

module.exports.make = async (bot) => {
    const vndb = await VNDB.start();
    const res0 = await vndb.write('login {"protocol":1,"client":"SumikaSearch","clientver":"0.0.1"}')
    await bot.registerCommand("vndb", async (message, argv) => {
        let embedAll = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `VNDB search for term "${argv.join(' ')}"`,
                icon_url: `${bot.user.avatarURL}`
            },
            description: `The search contains more than 1 result. Please reply with the appropriate entry number in order to view its details.`,
            fields: []
        }
        let fuckme = await vndb.write(`get vn basic,details,stats (search ~ "${argv.join(' ')}"){"sort": "rating", "reverse": true}`);
        let res1 = JSON.parse(fuckme.substring('results '.length));
        if (res1.items.length == 0) { bot.createMessage(message.channel.id, {content: "Search returned no results."})}
        else if (res1.items.length == 1) {
            var embed = vndbEmbed(res1.items[0]);
            bot.createMessage(message.channel.id, {content:'', embed: embed})
        }
        else if (res1.items.length > 1) {
            for (var i = 0; i < res1.items.length; i++) {
                let element = {};
                element.name = '​​';
                element.value = String(i+1) + ': ' + res1.items[i].title;
                embedAll.fields.push(element);
            }
            bot.createMessage(message.channel.id, {content: '', embed: embedAll}).then((msg) => {
                setTimeout( () => {bot.getMessages(msg.channel.id, 10, undefined, msg.id).then((messageArray) => {
                    messageArray.forEach((mesg) => {
                        if (mesg.author == message.author && parseInt(mesg.content) <= res1.items.length) {
                            var embedS = vndbEmbed(res1.items[parseInt(mesg.content) - 1])
                            bot.createMessage(message.channel.id, {content: '', embed: embedS})
                        }
                    })
                }).catch(err => console.log(err))}, 7000)
            })
        }
        function vndbEmbed(vndbRes) {
            if (vndbRes.description.length >= 1024) {
                vndbRes.description = vndbRes.description.slice(0, 1019);
                vndbRes.description += '...'
            }
            else if (vndbRes.description.length <= 0) {
                vndbRes.description = "No Synopsis."
            }
            vndbRes.description = entities.decode(vndbRes.description);
            let embed = {
                color: 0x91244e,
                type: 'rich',
                author: {
                    name: `${vndbRes.title}`,
                    icon_url: `${vndbRes.image}`
                },
                description: `https://vndb.org/v${vndbRes.id}`,
                thumbnail: {
                    url: `${vndbRes.image}`
                },
                fields: [
                    {name: 'Description', value: `${vndbRes.description}`},
                    {name: 'Length', value: `${vndbRes.length == 5 ? 'Very Long (> 50 hours)': vndbRes.length == 4 ? "Long (30-50 hours)": vndbRes.length == 3 ? "Medium (10-30 hours)": vndbRes.length == 2 ? "Short (2-10 hours)": vndbRes.length == 1 ? "Very Short (< 2 hours)": "Length could not be deciphered!!11!"}`},
                    {name: 'Rating', value: `${vndbRes.rating}`},
                    {name: 'Original Language', value: `${vndbRes.orig_lang}`}
                ]
            }
            return(embed)
        }
    }, {
        description: "Generic gelbooru search",
        fullDescription: "Searches gelbooru for particular tags and returns items picked randomly from returned search list. Accepts all meta tags."
    })
}
