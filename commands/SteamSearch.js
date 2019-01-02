"use strict";
const cheerio = require("cheerio");
const axios = require("axios");
const XregExp = require('xregexp');
const toggle = require('../commands/toggle');
const path = require('path');
const helperFunctions = require("../commands/helperFunctions/helperFunctions");
let moduleName = path.basename(__filename);

module.exports.make = async (bot, conn) => {
    await bot.registerCommand("steam", async (message, args) => {
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
            let resp = await axios.get(`${url + args.join("+")}`);
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
                    name: "Steam"
                },
                query: `${args.join(" ")}`
            }, items, async (item, bot) => {
                let page = await axios.request({
                    url: `${item.link}`,
                    method: "get",
                    headers: {
                        Cookie: "birthtime=28801; path=/; domain=store.steampowered.com; mature_content=1"
                    }
                });
                let $ = cheerio.load(page.data);
                let userReviewDiv = $('div.user_reviews');
                let SteamInfo = {
                    name: `${item.name}`,
                    description: `${$('div.game_description_snippet').text()}`,
                    recent_reviews: `${userReviewDiv.children('.user_reviews_summary_row').first().find('.game_review_summary').text()}`,
                    all_reviews: `${userReviewDiv.children('.user_reviews_summary_row').last().find('.game_review_summary').text()}`,
                    release: `${$('div.release_date div.date').text()}`,
                    dev: `${$('div#developers_list a').text()}`,
                    pageURL: `${item.link}`,
                    icon: `${$('img.game_header_image_full').attr("src")}`
                };
                let embed = {
                    color: 0x91244e,
                    type: 'rich',
                    author: {
                        name: `${SteamInfo.name}`,
                        url: `${SteamInfo.pageURL}`,
                        icon_url: `${SteamInfo.icon}`
                    },
                    description: `${SteamInfo.description}`,
                    thumbnail: {
                        url: `${SteamInfo.icon}`
                    },
                    fields: [
                        {name: 'Release', value: `${SteamInfo.release ? SteamInfo.release : "n/a"}`},
                        {name: 'Developer', value: `${SteamInfo.dev ? SteamInfo.dev : "n/a"}`},
                        {
                            name: 'Recent Reviews',
                            value: `${SteamInfo.recent_reviews ? SteamInfo.recent_reviews : "n/a"}`
                        },
                        {name: `All Reviews`, value: `${SteamInfo.all_reviews ? SteamInfo.all_reviews : "n/a"}`},
                        {name: `Link`, value: `${SteamInfo.pageURL}`}
                    ],
                    footer: {
                        text: `Search provided by ${bot.user.username}, a shitty bot written in JS by EraTheMonologuer`,
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
    }, {
        description: "Generic Steam Search"
    })
};