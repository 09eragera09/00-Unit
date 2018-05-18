"use strict";
const cheerio = require('cheerio');
const axios = require('axios')

module.exports.make = async (bot) => {
    await bot.registerCommand("appdb", async (message, args) => {
        try {
            let url = "https://appdb.winehq.org/objectManager.php?bIsQueue=false&bIsRejected=false&sClass=application&sTitle=&iItemsPerPage=25&iPage=1&sOrderBy=appId&bAscending=true";
            let data = `iappVersion-ratingOp=5&iappCategoryOp=11&iappVersion-licenseOp=5&sappVersion-ratingData=&iversions-idOp=5&sversions-idData=&sappCategoryData=&sappVersion-licenseData=&iappFamily-keywordsOp=2&sappFamily-keywordsData=&iappFamily-appNameOp=2&sappFamily-appNameData=&ionlyDownloadableOp=10&iappFamily-appNameOp0=2&sappFamily-appNameData0=${args.join('%20')}&sFilterSubmit=`;
            const allListings = await axios({
                url: url,
                data: data,
                method: 'post',
            });
            let html = allListings.data
            let $ = cheerio.load(html);
            let items = [];
            $('.whq-table-full tbody tr').each((index, item) => {
                items.push({
                    title: `${$(item).children().first().children('a').text()}`,
                    link: `${$(item).children().first().children('a').attr('href')}`
                });
            });
            let embedAll = {
                color: 0x91244e,
                type: 'rich',
                author: {
                    name: `WineHQ search for term "${args.join(' ')}"`,
                    icon_url: `${bot.user.avatarURL}`
                },
                description: `The search contains more than 1 result. Please reply with the appropriate entry number in order to view its details.\n`,
                fields: []
            }
            if (items.length == 0) { bot.createMessage(message.channel.id, {content: "Search returned no results."})}
            else if (items.length == 1) {
                let appDBinfo = await appdbResolve(items[0]);
                let appEmbed = appdbEmbed(appDBinfo)
                bot.createMessage(message.channel.id, {
                    content: '',
                    embed: appEmbed
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
                                let appResolve = await appdbResolve(items[parseInt(mesg.content) - 1])
                                let embedS = appdbEmbed(appResolve)
                                bot.createMessage(message.channel.id, {content: '', embed: embedS})
                            }
                        })
                    }).catch(err => console.log(err))}, 7000)
                })
            }
        } catch (err) { console.error(err.stack)}
        function appdbEmbed(appDBInfo) {

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
                        text: "Search provided by 00-Unit, a shitty bot written in JS by EraTheMonologuer",
                        icon_url: bot.user.avatarURL
                    }
                }
                return(embed)

        }
        async function appdbResolve(item) {
            let myPage = await axios.get(item.link);
            let $ = cheerio.load(myPage.data);
            let text1 = ". For more information, see the link below."
            let appDBInfo = {
                name: `${$('h1.whq-app-title').text()}`,
                description: `${$('.col-xs-7').text().trim().substring(20).trim().replace(/\s+/g, ' ').split('.').splice(0, 3).join('.') + text1}`,
                rating: `${$(`table.whq-table tbody`).children().last().children(`td:nth-child(3)`).text()}`,
                pageURL: `${item.link}`
            }
            return appDBInfo
        }


    }, {
        description: "Generic appdb search",
    })
}
