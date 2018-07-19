"use strict";
const axios = require("axios");
const XregExp = require('xregexp');
const toggle = require('../commands/toggle');
const path = require('path');
const helperFunctions = require("../commands/helperFunctions/helperFunctions");
const moduleName = path.basename(__filename);
const apikey = require('../config').itadkey;
const moment = require('moment');
const igdb = require('igdb-api-node').default;
const igdbClient = igdb("79fd60f10c724bfbc2547fd255c37bd2");
const fs = require('fs');

module.exports.make = async (bot, conn) => {
    await bot.registerCommand('itad', async (message, args) => {
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
        try {
            let res = await igdbClient.games({
                search: args.join("%20"),
                fields: "*",
                limit: "15",
                filters: {
                    'version_parent-not_exists': '1'
                }
            });
            let cregx = new XregExp("([^\\p{L}\\p{N}\\s]+)", "g");
            let arr = [];
            for (let i = 0; i < res.body.length; i++) {
                let bool = true;
                let name = XregExp.replace(res.body[i].slug.split('-').join('').toUpperCase(), cregx, '');
                for (let j = 0; j < args.length; j++) {
                    let search = XregExp.replace(args[j].toUpperCase(), cregx, '');
                    if ((name).indexOf(search) === -1) {
                        bool = false;
                    }
                }
                if (bool) {
                    arr.push(res.body[i]);
                }
            }
            helperFunctions.serviceSearch(bot, message, {
                service: {
                    name: "IGDB Powered IsThereAnyDeal"
                },
                query: `${args.join(" ")}`
            }, arr, async (item, bot) => {
                //let shops = ['origin', 'voidu', 'gog', 'steam', 'uplay', 'fanatical', 'gamesplanet', 'indiegala', 'greenmangaming'];
                let plainItem = await axios({
                    url: `https://api.isthereanydeal.com/v02/game/plain/?key=${apikey}&title=${item.name}`
                });
                let prices = await axios({
                    url: `https://api.isthereanydeal.com/v01/game/prices/?key=${apikey}&plains=${plainItem.data.data.plain}&region=us&country=SK`
                });
                let historicalLow = await axios({
                    url: `https://api.isthereanydeal.com/v01/game/lowest/?key=${apikey}&plains=${plainItem.data.data.plain}&region=us&country=SK`
                });
                prices = prices.data.data;
                historicalLow = historicalLow.data.data;
                prices = prices[Object.keys(prices)[0]];
                historicalLow = historicalLow[Object.keys(historicalLow)[0]];

                let cheapestUnit = {
                    price_new: prices.list[0].price_new,
                    shop: {
                        name: prices.list[0].shop.name
                    },
                    price_old: prices.list[0].price_old,
                    price_cut: prices.list[0].price_cut,
                    url: prices.list[0].url,
                    drm: prices.list[0].drm
                };
                if (prices.list.length > 1) {
                    for (let i = 0; i < prices.list.length; i++) {
                        if (cheapestUnit.price_new > prices.list[i].price_new) {
                            cheapestUnit = prices.list[i];
                        }
                    }
                }
                let embed = {
                    color: 0x91244e,
                    type: 'rich',
                    author: {
                        name: `${item.name}`,
                        url: `${cheapestUnit.url}`
                    },
                    fields: [
                        {name: 'Current Price', value: `$${cheapestUnit.price_new}`, inline: true},
                        {name: 'Original Price', value: `$${cheapestUnit.price_old}`, inline: true},
                        {name: 'Discount', value: `${cheapestUnit.price_cut}%`, inline: true},
                        {name: 'Store', value: cheapestUnit.shop.name, inline: true},
                        {name: 'DRM', value: cheapestUnit.drm[0], inline: true},
                        {name: `Historical Low`, value: `$${historicalLow.price}`, inline: true},
                        {name: `Historical Low Discount`, value: `${historicalLow.cut}%`, inline: true},
                        {name: 'Historical Low Store', value: historicalLow.shop.name, inline: true},
                        {
                            name: `Recorded on`,
                            value: moment.unix(historicalLow.added).format('Do MMMM YYYY'),
                            inline: true
                        }
                    ],
                    footer: {
                        text: `Powered by IGDB and ITAD | ${bot.user.username}, a shitty bot written in JS by EraTheMonologuer`,
                        icon_url: bot.user.avatarURL
                    }
                };
                return (embed)
            }).catch((err) => {
                console.log(err.stack)
            })
        } catch (err) {
            console.error(err.stack)
        }
    });

    bot.registerCommandAlias('deals', 'itad');
};