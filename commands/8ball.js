const random = require("lodash.random");
const toggle = require('../commands/toggle');
const path = require('path');
let moduleName = path.basename(__filename);


let basic_hash_function = (string) => {
    let hash_value = 0;
    for (let i = 0; i < string.length; i++) {
        hash_value += (i + 1) * string.charCodeAt(i);
    }
    return hash_value;
};


module.exports.make = async (bot, conn) => {
    bot.registerCommand("8ball", async (message, args) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"})
                .catch(err => console.log(err));
            return
        }
        let [enabled, res] = await toggle.checkEnabled(message.channel.guild.id, moduleName, conn).catch(err => {
            console.log(err.stack)
        });
        if (!enabled) {
            bot.createMessage(message.channel.id, {
                content: res
            }).catch(err => console.log(err));
            return
        }
        let _8ball_array = [
            ['It is certain', 'It is decidedly so', 'Without a doubt',
                'Yes, definitely', 'You may rely on it', 'As I see it, yes', 'Most likely',
                'Outlook good', 'Yes', 'Signs point to yes'
            ], //Positive answers
            ['Reply hazy try again',
                'Ask again later', 'Better not tell you now', 'Cannot predict now',
                'Concentrate and ask again'
            ], //Neutral answers
            ['Don\'t count on it', 'My reply is no',
                'My sources say no', 'Outlook not so good', 'Very doubtful'
            ] //Negative answers
        ];
        let lc_argument_string = args.join(' ').toLowerCase();
        _8ball_reply_group = _8ball_array[basic_hash_function(lc_argument_string) % _8ball_array.length];
        bot.createMessage(message.channel.id, {
            content: `${_8ball_reply_group[random(_8ball_reply_group.length - 1)]}`
        }).catch(err => console.log(err));

    }, {
        description: "Magic 8ball will help you solve all your troubles",
        fullDescription: "Returns 1 of 8 yes/no/maybe messages."
    })
};
