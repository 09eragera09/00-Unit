'use strict';
const popura = require('popura');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const toggle = require('../toggle');
const path = require('path');
let moduleName = path.basename(__filename);

module.exports.make = async (bot, conn) => {
    let mangaEmbed = (manga) => {
        if (manga.synopsis.length >= 1024) {
            manga.synopsis = manga.synopsis.slice(0, 1019);
            manga.synopsis += '...'
        }
        else if (manga.synopsis.length <= 0) {
            manga.synopsis = "No Synopsis."
        }
        manga.synopsis = entities.decode(manga.synopsis);
        let embed = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `${manga.title}`,
                icon_url: `${manga.image}`,
            },
            description: `http://myanimelist.net/manga/${manga.id}`,
            thumbnail: {
                url: `${manga.image}`
            },
            fields: [
                {name: 'Synopsis', value: `${manga.synopsis}`},
                {name: 'Chapters', value: `${manga.chapters}`},
                {name: 'Score', value: `${manga.score}`},
                {name: 'Status', value: `${manga.status}`}
            ],
            footer: {
                text: "Search provided by 00-Unit, a shitty bot written in JS by EraTheMonologuer",
                icon_url: bot.user.avatarURL
            }
        };
        return (embed)
    };
    let animeEmbed = (anime) => {
        if (anime.synopsis.length >= 1024) {
            anime.synopsis = anime.synopsis.slice(0, 1019);
            anime.synopsis += '...'
        }
        else if (anime.synopsis.length <= 0) {
            anime.synopsis = "No Synopsis."
        }
        anime.synopsis = entities.decode(anime.synopsis);
        let embed = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `${anime.title}`,
                icon_url: `${anime.image}`
            },
            description: `http://myanimelist.net/anime/${anime.id}`,
            thumbnail: {
                url: `${anime.image}`
            },
            fields: [
                {name: 'Synopsis', value: `${anime.synopsis}`},
                {name: 'Episodes', value: `${anime.episodes}`},
                {name: 'Score', value: `${anime.score}`},
                {name: 'Status', value: `${anime.status}`}
            ],
            footer: {
                text: "Search provided by 00-Unit, a shitty bot written in JS by EraTheMonologuer",
                icon_url: bot.user.avatarURL
            }
        };
        return (embed)
    };
    const client = popura(process.env.MYANIMELIST_USERNAME, process.env.MYANIMELIST_PASSWORD);

    function popuraSearchResolve(animeArray, embedAll, message, invokedWith) {
        let embed;
        if (animeArray[0] === null) {
            bot.createMessage(message.channel.id, {content: "Search returned no results. Please try again with a different query"})
                .catch(err => console.log(err.stack))
        }
        else if (animeArray.length === 1) {
            if (invokedWith === "manga") {
                embed = mangaEmbed(animeArray[0]);
            }
            else {
                embed = animeEmbed(animeArray[0]);
            }
            bot.createMessage(message.channel.id, {content: '', embed: embed}).catch(err => console.log(err.stack))
        }
        else if (animeArray.length > 1) {
            for (let i = 0; i < animeArray.length; i++) {
                embedAll.description = embedAll.description + `\n${i + 1}: ${animeArray[i].title}`
            }
            bot.createMessage(message.channel.id, {content: '', embed: embedAll}).then((msg) => {
                setTimeout(() => {
                    bot.getMessages(msg.channel.id, 10, undefined, msg.id).then((messageArray) => {
                        messageArray.forEach((mesg) => {
                            let embedS;
                            if (mesg.author === message.author && parseInt(mesg.content) <= animeArray.length) {
                                if (invokedWith === "manga") {
                                    embedS = mangaEmbed(animeArray[parseInt(mesg.content) - 1]);
                                }
                                else {
                                    embedS = animeEmbed(animeArray[parseInt(mesg.content) - 1]);
                                }
                                bot.createMessage(message.channel.id, {
                                    content: '',
                                    embed: embedS
                                }).catch(err => console.log(err.stack))
                            }
                        })
                    }).catch(err => console.log(err))
                }, 7000)
            })
        }
    }

    bot.registerCommand("anime", async (message, argv) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"}).catch(err => console.log(err.stack));
            return
        }
        let [enabled, res] = await toggle.checkEnabled(message.channel.guild.id, moduleName, conn);
        if (!enabled) {
            bot.createMessage(message.channel.id, {
                content: res
            }).catch(err => console.log(err.stack));
            return
        }
        let embedAll = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `MAL Search for term "${argv.join(' ')}"`,
                icon_url: `${bot.user.avatarURL}`
            },
            description: `The search contains more than 1 result. Please reply with the appropriate entry number in order to view its details.\n`,
            fields: []
        };
        client.searchAnimes(argv.join('_')).then(animeArray => popuraSearchResolve(animeArray, embedAll, message)).catch(err => {
            bot.createMessage(message.channel.id, {content: `${err.statusMessage}`}).catch(err => console.log(err.stack));
        })
    }, {
        description: "Searches MAL for anime",
        fullDescription: "Searches MAL for anime. Accepts anime names as arguments, returns a list of valid names"
    });
    bot.registerCommand("manga", async (message, argv) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"}).catch(err => console.log(err.stack));
            return
        }
        let [enabled, res] = await toggle.checkEnabled(message.channel.guild.id, moduleName, conn);
        if (!enabled) {
            bot.createMessage(message.channel.id, {
                content: res
            }).catch(err => console.log(err.stack));
            return
        }
        let embedAll = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `MAL Search for term "${argv.join(' ')}"`,
                icon_url: `${bot.user.avatarURL}`
            },
            description: `The search contains more than 1 result. Please reply with the appropriate entry number in order to view its details.\n`,
            fields: []
        };
        let invokedWith = "manga";
        client.searchMangas(argv.join('_')).then(animeArray => popuraSearchResolve(animeArray, embedAll, message, invokedWith)).catch(err => {
            bot.createMessage(message.channel.id, {content: `${err.statusMessage}`}).catch(err => console.log(err.stack));
        })
    }, {
        description: "Searches MAL for manga",
        fullDescription: "Searches MAL for manga. Accepts manga names as arguments, returns a list of valid names"
    });
};