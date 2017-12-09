const random = require("lodash.random")

module.exports.make = (bot) => {
    bot.registerCommand("8ball", (message, args) => {
        _8ball_array = ['It is certain', 'It is decidedly so', 'Without a doubt',
        'Yes, definitely', 'You may rely on it', 'As I see it, yes', 'Most likely',
        'Outlook good', 'Yes', 'Signs point to yes', 'Reply hazy try again',
        'Ask again later', 'Better not tell you now', 'Cannot predict now',
        'Concentrate and ask again', 'Don\'t count on it', 'My reply is no',
        'My sources say no', 'Outlook not so good', 'Very doubtful']
        bot.createMessage(message.channel.id, {
            content: `${_8ball_array[random(_8ball_array.length - 1)]}`
        })
        
    }, {
        description: "Magic 8ball will help you solve all your troubles",
        fullDescription: "Returns 1 of 8 yes/no/maybe messages."
    })
}