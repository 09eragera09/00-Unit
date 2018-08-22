"use strict";
const toggle = require('../commands/toggle');
const path = require('path');
const hltb = require("howlongtobeat");
const hltbService = new hltb.HowLongToBeatService();
const axios = require('axios');
const cheerio = require("cheerio");
const helperFunctions = require("../commands/helperFunctions/helperFunctions");
let moduleName = path.basename(__filename);

module.exports.make = async (bot, conn) => {
    await bot.registerCommand('hltb', async (message, argv) => {
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
        let res1 = await hltbService.search(argv.join(' '));
        helperFunctions.serviceSearch(bot, message, {
            service: {
                name: "HowLongToBeat"
            },
            query: `${argv.join(" ")}`
        }, res1, async (item, bot) => {
            let hltbURL = `https://howlongtobeat.com/game.php?id=${item.id}`;
            let request = await axios.request({
                url: hltbURL,
                method: 'get'
            });
            let $ = cheerio.load(request.data);
            let timeObject = {};
            $('.game_times > li').each(function () {
                timeObject[$(this).children('h5').text()] = $(this).children('div').text()
            });
            let embed = {
                color: 0x91244e,
                type: 'rich',
                author: {
                    name: `${item.name}`,
                    icon_url: `${item.imageUrl.replace(' ', '%20')}`
                },
                description: hltbURL,
                thumbnail: {
                    url: `${item.imageUrl.replace(' ', '%20')}`
                },
                fields: [],
                footer: {
                    text: `Search provided by ${bot.user.username}, a shitty bot written in JS by EraTheMonologuer`,
                    icon_url: bot.user.avatarURL
                }
            };
            Object.keys(timeObject).forEach(i => {
                embed.fields.push({
                    name: i,
                    value: timeObject[i]
                })
            });
            if (Object.keys(timeObject).length === 0) {
                embed.description += "\nNothing Found"
            }
            return (embed)
        }).catch((err) => {
            console.log(err.stack)
        })
    }, {
        description: "Generic HowLongToBeat search",
    });
};