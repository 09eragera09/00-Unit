"use strict";

module.exports.make = (bot) => {
    var fun = bot.registerCommand("fun", "The following commands are available:- shitwaifu\nPut them after the fun command as subcommands to use.\nIf you have any fun stuff you would like to see in this command, talk to the owner.", {
        description: "A command that holds other basic fun subcommands",
        fullDescription: "A command that holds other basic fun subcommands, such as textfaces and a saber meme. Tell Era#4669 if you have more stuff you'd like added."
    })
    fun.registerSubcommand("shitwaifu", "http://i2.kym-cdn.com/photos/images/original/000/756/008/29d.jpg");
    bot.registerCommand("abuse", (message, args) => {
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
        if (member.id == message.channel.guild.ownerID) {
            if (message.author.id == member.id) {
                bot.createMessage(message.channel.id, {content:"I cant abuse you!"})
                return
            }
            bot.createMessage(message.channel.id, {content: "Nibba fuck off you ain't got nothing on him"})
            return
        }
        let list_of_abuse = ["Fuck you", "Kill yourself", "Your existence is pointless", "You're just a waste of space", "You're just a burden", "Waste of Oxygen"];
        let abuse = list_of_abuse[Math.floor(Math.random() * list_of_abuse.length)] + ', ' + member.mention
        bot.createMessage(message.channel.id, {content: abuse})
    }, {
        description: "Abuses the user",
        fullDescription: "Abuses the mentioned user. Accepts Usernames, User Mentions, and Message Author as proper arguments."
    })
} 