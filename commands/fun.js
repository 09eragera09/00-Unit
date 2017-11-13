"use strict";

module.exports.make = (bot) => {
    var fun = bot.registerCommand("fun", "The following commands are available:- shitwaifu\nPut them after the fun command as subcommands to use.\nIf you have any fun stuff you would like to see in this command, talk to the owner.", {
        description: "A command that holds other basic fun subcommands",
        fullDescription: "A command that holds other basic fun subcommands, such as textfaces and a saber meme. Tell Era#4669 if you have more stuff you'd like added."
    })
    fun.registerSubcommand("shittywaifu", "http://i2.kym-cdn.com/photos/images/original/000/756/008/29d.jpg");
} 