"use strict";
const axios = require('axios');
const cron = require('node-cron');
const toggle = require('../commands/toggle');
const path = require('path');
const apikey = require('../config').itadkey;
let moduleName = path.basename(__filename);
const fs = require('fs');

module.exports.make = (bot, conn) => {
    bot.registerCommand("monitor", async (message, args) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"});
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
        //TODO make the thing less error prone
        //TODO Make sure user actually enters steam info and not random garbage
        //TODO Consult with Aba why discord userID is bad as Primary Key
        let user = {userID: message.author.id};
        args.forEach(i => {
            if (i.toLowerCase().startsWith("steam")) {
                user.steamUsername = i.split(':')[1];
            }
        });
        await conn.execute(`insert into userWishlists(userID, steamUsername) values("${user.userID}", "${user.steamUsername}")`);

    }, {
        description: "A ping command",
        fullDescription: "A ping command, to keep you entertained."
    });
    bot.registerCommand("manualCheck", async () => {
        let [users,] = await conn.execute("SELECT * FROM userWishlists");
        let userData = {};
        for (let i = 0; i < users.length; i++) {
            userData[users[i].userID] = {'steam': [], 'threshold': users[i].salePercent};
            if (users[i].steamUsername) {
                //TODO Make sure there is actually a valid username in there
                let steamWishlist = await axios.get(`https://store.steampowered.com/wishlist/id/${users[i].steamUsername}/`);
                let wishlistData = JSON.parse(/g_rgWishlistData\s=\s(.+?);/gm.exec(steamWishlist.data)[1]);
                wishlistData.forEach(j => {
                    userData[users[i].userID].steam.push({
                        'appid': j.appid
                    })
                });
            }
        }
        let steamGameArray = returnAllSteamGamesInArray(userData);
        let steamPlain = await axios.get(`https://api.isthereanydeal.com/v01/game/plain/id/?key=${apikey}&shop=steam&ids=app/${steamGameArray.join(',app/')}`); //TODO make sure not making an empty
        let steamPlainArray = [];
        Object.keys(steamPlain.data.data).forEach(i => {
            steamPlainArray.push(steamPlain.data.data[i])
        });
        let priceJSON = await axios.get(`https://api.isthereanydeal.com/v01/game/prices/?key=${apikey}&plains=${steamPlainArray.join(',')}&region=us&country=SK`);
        let priceArray = [];
        Object.keys(priceJSON.data.data).forEach(i => {
            let priceData = cheapestCalculate(i, priceJSON.data.data[i]);
            priceArray.push(priceData)
        });
        Object.keys(userData).forEach(i => {
            let dealArray = checkThreshold(i, priceArray, steamPlain.data.data);
            if (dealArray.length > 0) {
                bot.getDMChannel(Object.keys(i)[0])
                    .then(res => {
                        let dealGreeting = "You have deals!\n\n";
                        dealArray.forEach(i => {
                            dealGreeting += `\t- ${i.plain} is `
                        })
                    })
                    .catch(err => {
                        console.log(err)
                    })
            }
        });
    });


    function returnAllSteamGamesInArray(userData) {
        let games = [];
        Object.keys(userData).forEach(i => {
            userData[i].steam.forEach(j => {
                games.push(j.appid)
            })
        });
        return games
    }

    function cheapestCalculate(name, prices) {

        if (prices.list.length > 0) {
            let cheapestUnit = {
                price_new: prices.list[0].price_new || 0,
                shop: {
                    name: prices.list[0].shop.name || 'No store found.'
                },
                price_old: prices.list[0].price_old || 0,
                price_cut: prices.list[0].price_cut || 0,
                url: prices.list[0].url || 'No URL found',
                drm: prices.list[0].drm
            };
            if (prices.list.length > 1) {
                for (let i = 0; i < prices.list.length; i++) {
                    if (!(typeof cheapestUnit.price_new === "number") || (cheapestUnit.price_new > prices.list[i].price_new)) {
                        cheapestUnit = prices.list[i];
                    }
                }
            }
            return {plain: name, deal: cheapestUnit}
        }
    }

    function checkThreshold(user, priceArray) {
        let deals = [];
        let threshold = Object.keys(user)[0].threshold;
        //TODO Figure out a way to filter out games not in user's wishlist
        //TODO Maybe instead have the dealArray be a catalogue of _all_ user deals, rather than just one, then you just iterate over it all, it takes less looping overall I think?
        //TODO basically if you loop the plain array and the game ID array for every user, itll take more time than if you looped every user per game
        priceArray.forEach(i => {
            if (i.deal.price_cut > (100 - threshold)) {
                deals.push(i)
            }
        });
        return deals
    }

    //TODO DO YOU EVEN NEED NODE CRON? Just have the bot reboot daily and make the thing run on every startup
    cron.schedule('0 0 * * *', () => {

    }, true)
};
