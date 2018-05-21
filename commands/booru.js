"use strict";
const cheerio = require('cheerio');
const axios = require('axios');
const toggle = require('../commands/toggle');
const path = require('path');
let moduleName = path.basename(__filename);


module.exports.make = async (bot, conn) => {

    await bot.registerCommand("booru", async (message, args) => {
        let [enabled, res]= await toggle.checkEnabled(message.channel.guild.id, moduleName, conn)
        if (!enabled) {
            bot.createMessage(message.channel.id, {
                content: res
            });
            return
        }
        try {
            const allListings = await axios.get(`https://gelbooru.com/index.php?page=post&s=list&tags=${args.join('+')}`);
            let pageLink = ((allListings) => {
                let html = allListings.data;
                let $ = cheerio.load(html);
                let pageinationLinksCount = $('.pagination a').length + 1;
                let randomIndex = Math.floor(Math.random() * pageinationLinksCount);
                let randomLink = $(`.pagination a:nth-of-type(${randomIndex > 0 ? randomIndex : 1})`).attr('href');
                if (randomIndex <= 1) {
                    randomLink = `?page=post&s=list&tags=${args.join('+')}`
                }
                return randomLink;
            })(allListings)
            const pageListings = await axios.get(`https://gelbooru.com/index.php${pageLink}`);
            let postID = ((pageListings)=>{
                const html = pageListings.data;
                let $ = cheerio.load(html);
                let postCount = $('.contain-push .thumbnail-preview').length;
                let randomIndex  = Math.floor(Math.random() * postCount);
                let randomPost = $(`.contain-push .thumbnail-preview:nth-of-type(${randomIndex > 0 ? randomIndex : 1})`);
                let randomPostID = randomPost.find('a').attr('href').split('&id=').pop();
                return randomPostID
            })(pageListings)
            const image = await axios.get('http://gelbooru.com/index.php', {
                params: {
                    page: 'dapi',
                    q: 'index',
                    s: 'post',
                    id: `${postID}`,
                    json: '1'
                }});
            ((image) => {
                bot.createMessage(message.channel.id, {
                    content:'',
                    embed: {
                        color: 0x91244e,
                        fields: [{
                            name: `View in Browser`,
                            value: `https://gelbooru.com/index.php?page=post&s=view&id=${image.data[0].id}`
                        }, {
                            name: `Source`,
                            value: `${image.data[0].file_url}`
                        }, {
                            name: `Rating`,
                            value: `${image.data[0].rating == 's' ? `Safe` : image.data[0] == 'q' ? `Questionable` : `Explicit`}`
                        }],
                        image: {
                            url: `${image.data[0].file_url}`
                        }}
                    })
            })(image)
        } catch (err) {
            console.error(err.stack);
        }

    }, {
        description: "Generic gelbooru search",
        fullDescription: "Searches gelbooru for particular tags and returns items picked randomly from returned search list. Accepts all meta tags."
    })
}
