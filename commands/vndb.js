"use strict";
const VNDB = require("vndb");
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const toggle = require('../commands/toggle');
const path = require('path');
const helperFunctions = require("../commands/helperFunctions/helperFunctions");
let moduleName = path.basename(__filename);

module.exports.make = async (bot, conn) => {
    const vndb = await VNDB.start();
    await vndb.write('login {"protocol":1,"client":"SumikaSearch","clientver":"0.0.1"}');
    await bot.registerCommand("vndb", async (message, argv) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"}).catch((err) => {
                console.log(err.stack)
            });
            return
        }
        let [enabled, res] = await toggle.checkEnabled(message.channel.guild.id, moduleName, conn);
        if (!enabled) {
            bot.createMessage(message.channel.id, {
                content: res
            }).catch((err) => {
                console.log(err.stack)
            });
            return
        }
        let fuckme = await vndb.write(`get vn basic,details,stats (search ~ "${argv.join(' ')}"){"sort": "rating", "reverse": true}`);
        let res1 = JSON.parse(fuckme.substring('results '.length));
        for (let i = 0; i < res1.items.length; i++) {
            res1.items[i].name = res1.items[i].title
        }
        helperFunctions.serviceSearch(bot, message, {
            service: {
                name: "VNDB"
            },
            query: `${argv.join(' ')}`
        }, res1.items, (item, bot) => {
            if (item.description.length >= 1024) {
                item.description = item.description.slice(0, 1019);
                item.description += '...'
            }
            else if (item.description.length <= 0) {
                item.description = "No Synopsis."
            }
            item.description = entities.decode(item.description);
            let embed = {
                color: 0x91244e,
                type: 'rich',
                author: {
                    name: `${item.title}`,
                    icon_url: `${item.image}`
                },
                description: `https://vndb.org/v${item.id}`,
                thumbnail: {
                    url: `${item.image}`
                },
                fields: [
                    {name: 'Description', value: `${item.description}`},
                    {
                        name: 'Length',
                        value: `${item.length === 5 ? 'Very Long (> 50 hours)' : item.length === 4 ? "Long (30-50 hours)" : item.length === 3 ? "Medium (10-30 hours)" : item.length === 2 ? "Short (2-10 hours)" : item.length === 1 ? "Very Short (< 2 hours)" : "Length could not be deciphered!!11!"}`
                    },
                    {name: 'Rating', value: `${item.rating}`},
                    {name: 'Original Language', value: `${item.orig_lang}`}
                ],
                footer: {
                    text: "Search provided by 00-Unit, a shitty bot written in JS by EraTheMonologuer",
                    icon_url: bot.user.avatarURL
                }
            };
            return (embed)
        }).catch((err) => {
            console.log(err.stack)
        });
    }, {
        description: "Generic vndb search",
        fullDescription: "Searches vndb for vn names and returns items from returned search list."
    })
};
