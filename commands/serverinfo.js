"use strict";
const toggle = require('../commands/toggle');
const path = require('path');
let moduleName = path.basename(__filename);
const moment = require('moment');

module.exports.make = (bot, conn) => {
    bot.registerCommand('serverinfo', async (message, args) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"});
            return
        }
        let [enabled, res] = await toggle.checkEnabled(message.channel.guild.id, moduleName, conn);
        if (!enabled) {
            bot.createMessage(message.channel.id, {
                content: res
            });
            return
        }
        if (message.channel.type == 1) {
            return
        }
        var server = message.channel.guild;
        var onlinecount = [];
        server.members.forEach(function (member) {
            if (member.status != "offline") {
                onlinecount.push(member)
            }
        }, this);
        var owner = server.members.get(server.ownerID);
        var embed = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `${server.name}`,
                icon_url: `${server.iconURL}`
            },
            description: `Created on ${moment(server.createdAt).utc().format('ddd MMM DD YYYY | kk:mm:ss')} UTC (${moment(server.createdAt).fromNow()})`,
            thumbnail: {
                url: `${server.iconURL}`
            },
            fields: [{
                name: "Region",
                value: `${server.region}`,
                inline: true
            }, {
                name: "Users",
                value: `${onlinecount.length} Online/${server.memberCount}`,
                inline: true
            }, {
                name: "Roles",
                value: `${server.roles.size}`,
                inline: true
            }, {
                name: "Owner",
                value: `${owner.username}#${owner.discriminator}`,
                inline: true
            }]
        };
        bot.createMessage(message.channel.id, {
            content: "",
            embed: embed
        })
    }, {
        description: "Gets the serverinfo",
        fullDescription: "Gets the detailed serverinfo, including region and online count."
    })
};