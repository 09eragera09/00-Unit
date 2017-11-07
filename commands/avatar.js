module.exports.make = (bot) => {
    bot.registerCommand("avatar", (message, args) => {
        if (args == 0) {
            username = message.author.username
        }
        else if (message.mentions.length > 0 && !message.mentionEveryone) {
            username = message.mentions[0].username
        }
        else {
            username = args[0]
        }
        member = message.channel.guild.members.find(m => {
            if (m.username == username || m.nick == username) return true;
        })
        bot.createMessage(message.channel.id, {
            content: '',
            embed: {
                color: 0x91244e,
                title: `${member.username}#${member.discriminator}`,
                image: {
                    url: `${member.user.dynamicAvatarURL("png", 2048)}`
                }
            }
        })
    })
}