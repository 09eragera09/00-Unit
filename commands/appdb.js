"use strict";
const cheerio = require('cheerio');
const axios = require('axios');
const toggle = require('../commands/toggle');
const path = require('path');
const helperFunctions = require("../commands/helperFunctions/helperFunctions");
let moduleName = path.basename(__filename);

module.exports.make = async (bot, conn) => {
    await bot.registerCommand("appdb", async (message, args) => {
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
            let url = "https://appdb.winehq.org/objectManager.php?bIsQueue=false&bIsRejected=false&sClass=application&sTitle=&iItemsPerPage=25&iPage=1&sOrderBy=appId&bAscending=true";
            let data = `iappVersion-ratingOp=5&iappCategoryOp=11&iappVersion-licenseOp=5&sappVersion-ratingData=&iversions-idOp=5&sversions-idData=&sappCategoryData=&sappVersion-licenseData=&iappFamily-keywordsOp=2&sappFamily-keywordsData=&iappFamily-appNameOp=2&sappFamily-appNameData=&ionlyDownloadableOp=10&iappFamily-appNameOp0=2&sappFamily-appNameData0=${args.join('%20')}&sFilterSubmit=`;
            const allListings = await axios({
                url: url,
                data: data,
                method: 'post',
            });
            let html = allListings.data;
            let $ = cheerio.load(html);
            let items = [];
            $('.whq-table-full tbody tr').each((index, item) => {
                items.push({
                    name: `${$(item).children().first().children('a').text()}`,
                    link: `${$(item).children().first().children('a').attr('href')}`
                });
            });
            helperFunctions.serviceSearch(bot, message, {
                service: {
                    name: "WineHQ"
                },
                query: `${args.join(' ')}`
            }, items, async (item, bot) => {
                let myPage = await axios.get(item.link);
                let $ = cheerio.load(myPage.data);
                let text1 = ". For more information, see the link below.";
                let appDBInfo = {
                    name: `${$('h1.whq-app-title').text()}`,
                    description: `${$('.col-xs-7').text().trim().substring(20).trim().replace(/\s+/g, ' ').split('.').splice(0, 3).join('.') + text1}`,
                    rating: `${$(`table.whq-table tbody`).children().last().children(`td:nth-child(3)`).text()}`,
                    pageURL: `${item.link}`
                };
                let embed = {
                    color: 0x91244e,
                    type: 'rich',
                    author: {
                        name: `${appDBInfo.name}`,
                        url: `${appDBInfo.pageURL}`
                    },
                    description: `${appDBInfo.description}`,
                    fields: [
                        {name: 'Latest version rating', value: `${appDBInfo.rating}`},
                        {name: 'Link', value: `${appDBInfo.pageURL}`}
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
        } catch (e) {
            console.log(e.stack)
        }

    }, {
        description: "Generic appdb search",
    })
};