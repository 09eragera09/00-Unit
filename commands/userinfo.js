"use strict";
const toggle = require('../commands/toggle');
const path = require('path');
let moduleName = path.basename(__filename);
const moment = require('moment');

module.exports.make = async (bot, conn) => {
    bot.registerCommand("userinfo", async (message, args) => {
        let username;
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"})
                .catch(err => console.log(err));
            return
        }
        let [enabled, res] = await toggle.checkEnabled(message.channel.guild.id, moduleName, conn);
        if (!enabled) {
            bot.createMessage(message.channel.id, {
                content: res
            }).catch(err => console.log(err));
            return
        }
        if (args.length === 0) {
            username = message.author.username;
        }
        else if (message.mentions.length > 0 && !message.mentionEveryone) {
            username = message.mentions[0].username;
        }
        else {
            username = args[0];
        }
        //This is going to be slow as shit....
        const member = message.channel.guild.members.find(m => {
            if (m.username === username || m.nick === username) return true;
        });
        if (member === undefined) {
            bot.createMessage(message.channel.id, {
                content: "User not found. Please check if there are typos. Search terms are case sensitive."
            }).catch(err => console.log(err));
            return
        }
        console.log(member);
        const embed = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `Info of ${member.username}#${member.discriminator}`,
                icon_url: `${member.avatarURL}`
            },
            description: `Playing: ${member.game === null ? `n/a` : ''}${member.game !== null ? '**' + member.game.name + '**' : ''}`,
            thumbnail: {
                url: `${member.avatarURL}`
            },
            fields: [{
                name: `Username`,
                value: `${member.username}#${member.discriminator}`,
                inline: true
            }, {
                name: 'Bot user',
                value: `${member.bot}`,
                inline: true
            }, {
                name: 'User ID',
                value: `${member.id}`,
                inline: true,
            }, {
                name: 'Nickname',
                value: `${member.nick === null ? `n/a` : ''}${member.nick !== null ? member.nick : ''}`,
                inline: true
            }, {
                name: `Created at`,
                value: `${moment(member.createdAt).utc().format('ddd MMM DD YYYY | kk:mm:ss')} UTC (${moment(member.createdAt).fromNow()})`,
                inline: false
            }, {
                name: `Joined at`,
                value: `${moment(member.joinedAt).utc().format('ddd MMM DD YYYY | kk:mm:ss')} UTC (${moment(member.joinedAt).fromNow()})`,
                inline: false
            }, {
                name: `Status`,
                value: `${member.status}`,
                inline: true
            }, {
                name: `Roles`,
                value: `${member.roles.map(r => message.channel.guild.roles.get(r).name).join(", ")}`,
                inline: true
            }]
        };
        bot.createMessage(message.channel.id, {
            content: '',
            embed: embed
        }).catch(err => console.log(err))
    }, {
        description: 'Gets info on a user',
        fullDescription: "Gets full info on a user, including game playing, creation and join date"
    })
};