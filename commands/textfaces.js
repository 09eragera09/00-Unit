"use strict";

module.exports.make = (bot) => {
    const textfaces = bot.registerCommand("textfaces", "Has the following faces: \n- lenny\n- fiteme\n- shrug\n- tableflip\n- unflip\n- hug\nYou can request for more to be added by asking the owner.", {
        description: "Sends a textface",
        fullDescription: "Sends a textface from the list below"
    });
    textfaces.registerSubcommand("lenny", '( ͡° ͜ʖ ͡°)', {description: "( ͡° ͜ʖ ͡°)"});
    textfaces.registerSubcommand("fiteme", '(ง ͠° ͟ل͜ ͡°)ง', {description: "(ง ͠° ͟ل͜ ͡°)ง"});
    textfaces.registerSubcommand("shrug", '¯\\_(ツ)_/¯', {description: "¯\\_(ツ)_/¯"});
    textfaces.registerSubcommand("tableflip", '(╯°□°）╯︵ ┻━┻', {description: "(╯°□°）╯︵ ┻━┻"});
    textfaces.registerSubcommand("unflip", '┬──┬ ノ( ゜-゜ノ)', {description: "┬──┬ ノ( ゜-゜ノ)"});
    textfaces.registerSubcommand("hug", '༼ つ ◕_◕ ༽つ', {description: "༼ つ ◕_◕ ༽つ"});
};