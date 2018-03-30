"use strict";

const moment = require('moment')

module.exports.make = (bot) => {
    bot.registerCommand("userinfo", (message, args)=> {
        if (message.channel.type == 1) {return}
        if (args == 0) {
            var username = message.author.username
        }
        else if (message.mentions.length > 0 && !message.mentionEveryone) {
            var username = message.mentions[0].username
        }
        else {
            var username = args[0]
        }
        //This is going to be slow as shit....
        var member = message.channel.guild.members.find(m => {
            if (m.username == username || m.nick == username) return true;
        })
        if (member === undefined) {
            bot.createMessage(message.channel.id, {
                content: "User not found. Please check if there are typos. Search terms are case sensitive."
            });
            return
        }
        var id = message.channel.guild.members.get(member.id)
        var embed = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `Info of ${member.username}#${member.discriminator}`,
                icon_url: `${member.avatarURL}`
            },
            description: `Playing: ${member.game === null ? `n/a` : ''}${member.game !== null ? '**' + member.game.name+'**' : ''}`,
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
                value: `${member.nick === null ? `n/a`: ''}${member.nick !== null ? member.nick: ''}`,
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
                value: `${member.roles.map(r=>message.channel.guild.roles.get(r).name).join(", ")}`,
                inline: true
            }]
        }
        bot.createMessage(message.channel.id, {
            content: '',
            embed: embed
        })}, {description: 'Gets info on a user',
    fullDescription: "Gets full info on a user, including game playing, creation and join date"
    })
}