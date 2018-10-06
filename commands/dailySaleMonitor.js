"use strict";
const axios = require('axios');
const cron = require('node-cron');
const toggle = require('../commands/toggle');
const path = require('path');
const apikey = require('../config').itadkey;
let moduleName = path.basename(__filename);

module.exports.make = (bot, conn) => {
    bot.registerCommand("monitor", async (message, args) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"})
                .catch(err => console.log(err));
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

        let user = {userID: message.author.id};
        args.forEach(i => {
            if (i.toLowerCase().startsWith("steam")) {
                user.steamUsernameFormatted = i.split(':')[1];
                user.steamUsername = user.steamUsernameFormatted.toLowerCase();
            }
            if (i.toLowerCase().startsWith("threshold")) {
                user.threshold = parseInt(i.split(':')[1])
            }
        });
        if (!(user.threshold > 0 && user.threshold < 100)) {
            user.threshold = 75
        }
        try {
            await conn.execute(`insert into userWishlists (userID, steamUsername, salePercent)
                                values (?, ?, ?)`, [user.userID, user.steamUsername, user.threshold]);
            bot.createMessage(message.channel.id, {
                content: `Now monitoring steam user ${user.steamUsernameFormatted} with a discount threshold of ${user.threshold}. Please make sure that the profile exists and is public. Note that the username is **not** your visible name, but rather the username you login with.`
            }).catch(e => console.log(e))
        } catch (e) {
            let content = `Something broke.\n${e.code}: ${e.message}`;
            if (e.code === "ER_DUP_ENTRY") {
                content += "\nThe bot is already monitoring a wishlist for you. Please delete the old one first."
            }
            bot.createMessage(message.channel.id, {
                content: content
            }).catch(err => console.log(err))
        }

    }, {
        description: "A ping command",
        fullDescription: "A ping command, to keep you entertained."
    });
    bot.registerCommand("manualCheck", async (message) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"}).catch(err => console.log(err));
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
        await checkForDeals(conn)
    });

    async function checkForDeals(conn) {
        let [users,] = await conn.execute("SELECT * FROM userWishlists");
        if (users.length === 0) {
            return
        }
        let userData = {};
        for (let i = 0; i < users.length; i++) {
            userData[users[i].userID] = {'steam': [], 'threshold': users[i].salePercent};
            if (users[i].steamUsername) {
                try {
                    let steamWishlist = await axios.get(`https://store.steampowered.com/wishlist/id/${users[i].steamUsername}/`);
                    let wishlistData = JSON.parse(/g_rgWishlistData\s=\s(.+?);/gm.exec(steamWishlist.data)[1]);
                    let gameInfo = JSON.parse(/g_rgAppInfo\s=\s(.+?);/gm.exec(steamWishlist.data)[1]);
                    wishlistData.forEach(j => {
                        let gameName = gameInfo[j.appid].name;
                        userData[users[i].userID].steam.push({
                            'app': {id: j.appid, name: gameName}
                        })
                    });
                } catch (e) {
                    let errString = e.toString();
                    if (errString === "TypeError: Cannot read property '1' of null") {
                        await conn.execute("DELETE FROM userWishlists where steamUsername = ?;", [users[i].steamUsername])
                    }
                }
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
        priceArray = priceArray.filter(n => n); //Remove all the null and dead values
        let dealArray = checkThreshold(userData, priceArray, steamPlain.data.data);
        if (dealArray.length > 0) {
            dealArray.forEach(i => {
                bot.getDMChannel(i.userID)
                    .then(channel => {
                        let dealGreeting = "You have deals!\n";
                        i.deals.forEach(j => {
                            dealGreeting += `\n${j.name} is on sale for ${j.price_cut}% on ${j.shop.name}. Visit here <${j.shop.url}>`
                        });
                        bot.createMessage(channel.id, {content: dealGreeting})
                            .catch(err => console.log(err))
                    })
            })
        }
    }

    function returnAllSteamGamesInArray(userData) {
        let games = [];
        Object.keys(userData).forEach(i => {
            userData[i].steam.forEach(j => {
                games.push(j.app.id)
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

    function checkThreshold(userData, priceArray, plainData) {
        let deals = [];

        for (let userID in userData) {
            let threshold = 10; //This is some arbitrary amount for now, will fix after testing is over
            let dealArrayItem = {userID: userID, deals: []};
            userData[userID].steam.forEach(appArray => {
                let plainName = plainData[`app/${appArray.app.id}`];
                let item = priceArray.find(x => x.plain === plainName);
                if (typeof item !== "undefined") {
                    let dealPrice = item.deal;
                    if (dealPrice.price_cut > threshold) {
                        //idk, oof
                        dealArrayItem.deals.push({
                            name: appArray.app.name,
                            price_cut: dealPrice.price_cut,
                            shop: {
                                name: dealPrice.shop.name,
                                url: dealPrice.url
                            }
                        })
                    }
                }
            });
            if (dealArrayItem.deals.length > 0) {
                deals.push(dealArrayItem);
            }
        }
        return deals
    }

    //TODO DO YOU EVEN NEED NODE CRON? Just have the bot reboot daily and make the thing run on every startup
    cron.schedule('0 0 * * *', () => {

    }, true)
};
