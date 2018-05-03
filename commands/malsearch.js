'use strict';
const popura = require('popura');
const config = require('../config.json');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

module.exports.make = (bot) => {
    const client = popura(config.username, config.malpassword);

    function popuraSearchResolve(animeArray, embedAll, message, invokedWith){
        if (animeArray[0] === null) { bot.createMessage(message.channel.id, { content: "Search returned no results. Please try again with a different query"})}
        else if (animeArray.length == 1) {
            if (invokedWith == "manga") {var embed = mangaEmbed(animeArray[0])}
            else {var embed = animeEmbed(animeArray[0])}
            bot.createMessage(message.channel.id, {content:'', embed: embed })
        }
        else if (animeArray.length > 1) {
            for (var i = 0; i < animeArray.length; i++) {
                /*let element = {};
                element.name = '​​';
                element.value = String(i+1) + ': ' + animeArray[i].title;
                embedAll.fields.push(element);*/
                embedAll.description = embedAll.description + `\n${i+1}: ${animeArray[i].title}`
            }
            bot.createMessage(message.channel.id, {content: '', embed: embedAll}).then((msg) => {
                setTimeout( () => {bot.getMessages(msg.channel.id, 10, undefined, msg.id).then((messageArray) => {
                    messageArray.forEach((mesg) => {
                        if (mesg.author == message.author && parseInt(mesg.content) <= animeArray.length) {
                            if (invokedWith == "manga") {var embedS = mangaEmbed(animeArray[parseInt(mesg.content) - 1])}
                            else {var embedS = animeEmbed(animeArray[parseInt(mesg.content) - 1])}
                            bot.createMessage(message.channel.id, {content: '', embed: embedS})
                        }
                    })
                }).catch(err => console.log(err))}, 7000)
            })
        }
    }
    bot.registerCommand("anime", (message, argv) => {
        let embedAll = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `MAL Search for term "${argv.join(' ')}"`,
                icon_url: `${bot.user.avatarURL}`
            },
            description: `The search contains more than 1 result. Please reply with the appropriate entry number in order to view its details.\n`,
            fields: []
        }
        client.searchAnimes(argv.join('_')).then(animeArray => popuraSearchResolve(animeArray, embedAll, message)).catch(err => console.log(err))
    }, {description: "Searches MAL for anime",
        fullDescription: "Searches MAL for anime. Accepts anime names as arguments, returns a list of valid names"})
    bot.registerCommand("manga", (message, argv) => {
        let embedAll = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `MAL Search for term "${argv.join(' ')}"`,
                icon_url: `${bot.user.avatarURL}`
            },
            description: `The search contains more than 1 result. Please reply with the appropriate entry number in order to view its details.\n`,
            fields: []
        }
        let invokedWith = "manga";
        client.searchMangas(argv.join('_')).then(animeArray => popuraSearchResolve(animeArray, embedAll, message, invokedWith)).catch(err => console.log(err))
    }, {description: "Searches MAL for manga",
        fullDescription: "Searches MAL for manga. Accepts manga names as arguments, returns a list of valid names"})
    var animeEmbed = (anime) => {
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
        }
        return(embed)
    }
    var mangaEmbed = (manga) => {
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
        }
        return(embed)
    }
}