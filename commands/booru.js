"use strict";
const cheerio = require('cheerio');
const axios = require('axios')

module.exports.make = (bot) => {
    bot.registerCommand("booru", (message, args) => {
        let imageURL;
        axios.get(`https://gelbooru.com/index.php?page=post&s=list&tags=${args.join('+')}`).then(response => {
            let html = response.data;
            let $ = cheerio.load(html);
            let pageinationLinksCount = $('.pagination a').length + 1;
            console.log(pageinationLinksCount)
            let randomIndex = Math.floor(Math.random() * pageinationLinksCount);
            console.log(randomIndex)
            let randomLink = $(`.pagination a:nth-of-type(${randomIndex > 0 ? randomIndex : 1})`).attr('href');
            if (randomIndex <= 1) {
                randomLink = `?page=post&s=list&tags=${args.join('+')}`
            }
            axios.get(`https://gelbooru.com/index.php${randomLink}`).then(response => {
                const html = response.data;
                let $ = cheerio.load(html);
                let postCount = $('.contain-push .thumbnail-preview').length;
                let randomIndex  = Math.floor(Math.random() * postCount);
                let randomPost = $(`.contain-push .thumbnail-preview:nth-of-type(${randomIndex > 0 ? randomIndex : 1})`)
                let randomPostID = randomPost.find('a').attr('href').split('&id=').pop()
                axios.get('http://gelbooru.com/index.php', {
                    params: {
                        page: 'dapi',
                        q: 'index',
                        s: 'post',
                        id: `${randomPostID}`,
                        json: '1'
                    }
                }).then(results => bot.createMessage(message.channel.id, {
                    content: ``,
                    embed: {
                        color: 0x91244e,
                        image: {
                            url: `${results.data[0].file_url}`
                        }}
                }));
            }).catch((err) => {
                console.log(err.stack);
            });
        }).catch((err) => {
            console.log(err.stack);
        });
    })
}
