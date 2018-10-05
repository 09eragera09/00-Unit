"use strict";
const XregExp = require('xregexp');
const toggle = require('../commands/toggle');
const path = require('path');
const helperFunctions = require("../commands/helperFunctions/helperFunctions");
const moduleName = path.basename(__filename);
const apikey = require('../config').itadkey;
const moment = require('moment');
const igdb = require('igdb-api-node').default;
const igdbClient = igdb("79fd60f10c724bfbc2547fd255c37bd2");

module.exports.make = async (bot, conn) => {
    await bot.registerCommand('nominate', async (message, args) => {
        try {
            let res = await igdbClient.games({
                search: args.join("%20"),
                fields: "*",
                limit: "15"
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
                    name: "IGDB Search"
                },
                query: args.join(' ')
            }, arr, (item, bot) => {
                let embed = {
                    color: 0x91244e,
                    type: 'rich',
                    author: {
                        name: `Vote Registered!`,
                        icon_url: `https://images.igdb.com/igdb/image/upload/t_cover_big/${item.cover.cloudinary_id}`
                    },
                    description: `Your Vote for ${item.name} has been registered!`,
                    thumbnail: {
                        url: `https://images.igdb.com/igdb/image/upload/t_cover_big/${item.cover.cloudinary_id}`
                    },
                    fields: [
                        {name: "Released on", value: moment(item.first_release_date).format('Do MMMM YYYY')}
                    ],
                    footer: {
                        text: `Powered by IGDB | ${bot.user.username}, a shitty bot written in JS by EraTheMonologuer`,
                        icon_url: bot.user.avatarURL
                    }
                };
                return (embed)
            })
        } catch (err) {
            console.log(err)
        }
    })
};
