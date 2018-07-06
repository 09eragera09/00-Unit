"use strict";
const cheerio = require("cheerio");
const axios = require("axios");
const XregExp = require('xregexp');
const toggle = require('../commands/toggle');
const path = require('path');
const helperFunctions = require("../commands/helperFunctions/helperFunctions");
const moduleName = path.basename(__filename);
const apikey = require('../config').itadkey;
const moment = require('moment');

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
            let url = "https://store.steampowered.com/search/?term=";
            let resp = await axios.get(`${url + args.join("+") + "&category1=998"}`);
            let $ = cheerio.load(resp.data);
            let itemsAll = [];
            $('div#search_result_container div a.search_result_row').each((index, item) => {
                itemsAll.push({
                    name: `${$(item).find('span.title').text()}`,
                    link: `${$(item).attr('href').split('?')[0]}`
                });
            });
            let items = [];
            itemsAll.forEach(i => {
                let cregx = new XregExp("([^\\p{L}\\p{N}\\s]+)", "g");
                let search = XregExp.replace(args.join(' ').toUpperCase(), cregx, '');
                let name = XregExp.replace(i.name.toUpperCase(), cregx, '');
                if ((name).indexOf(search) !== -1) {
                    items.push(i)
                }
            });
            helperFunctions.serviceSearch(bot, message, {
                service: {
                    name: "Steam Powered IsThereAnyDeal"
                },
                query: `${args.join(" ")}`
            }, items, async (item, bot) => {

                let plainItem = await axios({
                    url: `https://api.isthereanydeal.com/v02/game/plain/?key=${apikey}&shop=steam&game_id=app%2F${item.link.split('/')[4]}`
                });
                let prices = await axios({
                    url: `https://api.isthereanydeal.com/v01/game/prices/?key=${apikey}&plains=${plainItem.data.data.plain}&region=us&country=SK&shops=steam`
                });
                let historicalLow = await axios({
                    url: `https://api.isthereanydeal.com/v01/game/lowest/?key=${apikey}&plains=${plainItem.data.data.plain}&region=us&country=SK&shops=steam`
                });
                prices = prices.data.data;
                historicalLow = historicalLow.data.data;
                prices = prices[Object.keys(prices)[0]];
                historicalLow = historicalLow[Object.keys(historicalLow)[0]];
                let embed = {
                    color: 0x91244e,
                    type: 'rich',
                    author: {
                        name: `${item.name}`,
                        url: `${prices.list[0].url}`
                    },
                    fields: [
                        {name: 'Current Price', value: `$${prices.list[0].price_new}`, inline: true},
                        {name: 'Original Price', value: `$${prices.list[0].price_old}`, inline: true},
                        {name: 'Discount', value: `${prices.list[0].price_cut}%`, inline: true},
                        {name: `Historical Low`, value: `$${historicalLow.price}`, inline: true},
                        {name: `Historical Low Discount`, value: `${historicalLow.cut}%`, inline: true},
                        {
                            name: `Recorded on`,
                            value: moment.unix(historicalLow.added).format('Do MMMM YYYY'),
                            inline: true
                        }
                    ],
                    footer: {
                        text: `Powered by Steam | ${bot.user.username}, a shitty bot written in JS by EraTheMonologuer`,
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
    })
};