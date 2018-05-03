"use strict";
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require('fs')

module.exports.make = async (bot) => {
    //await bot.registerCommand("steam", "This contains nothing yet.")
    await bot.registerCommand("steam", async (message, args) => {
        try {
            let url = "https://store.steampowered.com/search/?term=";
            let resp = await axios.get(`${url+args.join("+")}`);
            fs.writeFileSync('steamSearch.html', resp.data);
            let $ = cheerio.load(resp.data)
            let items = [];
            $('div#search_result_container div a.search_result_row').each((index, item) => {
                items.push({
                    title: `${$(item).find('span.title').text()}`,
                    link: `${$(item).attr('href').split('?')[0]}`
                });
            });
            let embedAll = {
                color: 0x91244e,
                type: 'rich',
                author: {
                    name: `Steam search for term "${args.join(' ')}"`,
                    icon_url: `${bot.user.avatarURL}`
                },
                description: `The search contains more than 1 result. Please reply with the appropriate entry number in order to view its details.\n`,
                fields: []
            }
            if (items.length == 0) { bot.createMessage(message.channel.id, {content: "Search returned no results."})}
            else if (items.length == 1) {
                let SteamInfo = await SteamResolve(items[0]);
                let SteamEmbed = SteamEmbed(SteamInfo);
                bot.createMessage(message.channel.id, {
                    content: '',
                    embed: SteamEmbed
                })
            }
            else if (items.length > 1) {
                for (var i = 0; i < items.length; i++) {
                    embedAll.description = embedAll.description + `\n${i+1}: ${items[i].title}`
                }
                bot.createMessage(message.channel.id, {content: '', embed: embedAll}).then((msg) => {
                    setTimeout( () => {bot.getMessages(msg.channel.id, 10, undefined, msg.id).then((messageArray) => {
                        messageArray.forEach(async (mesg) => {
                            if (mesg.author == message.author && parseInt(mesg.content) <= items.length) {
                                let appResolve = await SteamResolve(items[parseInt(mesg.content) - 1])
                                let embedS = SteamEmbed(appResolve)
                                bot.createMessage(message.channel.id, {content: '', embed: embedS})
                            }
                        })
                    }).catch(err => console.log(err))}, 7000)
                })
            }

        } catch (err) {console.error(err.stack)}
        async function SteamResolve(SteamItem) {
            let page = await axios.get(SteamItem.link);
            let $ = cheerio.load(page.data);
            let SteamInfo = {
                name: `${SteamItem.title}`,
                description: `${$('div.game_description_snippet').text()}`,
                recent_reviews: `${$('div.user_reviews').children('.user_reviews_summary_row').first().find('.game_review_summary').text()}`,
                all_reviews: `${$('div.user_reviews').children('.user_reviews_summary_row').last().find('.game_review_summary').text()}`,
                release: `${$('div.release_date div.date').text()}`,
                dev: `${$('div#developers_list a').text()}`,
                pageURL: `${SteamItem.link}`,
                icon: `${$('img.game_header_image_full').attr("src")}`
            }
            return SteamInfo
        }
        function SteamEmbed(SteamInfo){

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
                    {name: 'Recent Reviews', value: `${SteamInfo.recent_reviews ? SteamInfo.recent_reviews : "n/a"}`},
                    {name: `All Reviews`, value: `${SteamInfo.all_reviews ? SteamInfo.all_reviews : "n/a"}`},
                    {name: `Link`, value: `${SteamInfo.pageURL}`}
                ],
                footer: {
                    text: "Search provided by 00-Unit, a shitty bot written in JS by EraTheMonologuer",
                    icon_url: bot.user.avatarURL
                }
            }
            return(embed)

        }
    })
}