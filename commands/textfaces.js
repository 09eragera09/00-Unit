module.exports.make = (bot) => {
    var textfaces = bot.registerCommand("textfaces", "Has the following faces: \n- lenny\n- fiteme\n- shrug\n- tableflip\n- unflip\n- hug\nYou can request for more to be added by asking the owner.")
    textfaces.registerSubcommand("lenny", '( ͡° ͜ʖ ͡°)');
    textfaces.registerSubcommand("fiteme", '(ง ͠° ͟ل͜ ͡°)ง');
    textfaces.registerSubcommand("shrug", '¯\_(ツ)_/¯');
    textfaces.registerSubcommand("tableflip", '(╯°□°）╯︵ ┻━┻');
    textfaces.registerSubcommand("unflip", '┬──┬ ノ( ゜-゜ノ)');
    textfaces.registerSubcommand("hug", '༼ つ ◕_◕ ༽つ');
}