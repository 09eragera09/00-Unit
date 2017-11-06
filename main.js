const Eris = require('eris');
var config = require('./config.json');

var bot = new Eris(config.token);

bot.on('ready', () => {
    console.log("Im alive!");
});

bot.on('messageCreate', (message) => {
    if(message.content === "!ping") {
        var before = new Date();
        var mEmbd = {
            color: 0x91244e,
            author: {
                name: `${message.author.username}#${message.author.discriminator}`,
                icon_url: `${message.author.avatarURL}`
            },
            description: `Pong!`
        }
        bot.createMessage(message.channel.id, {
            content: ``,
            embed: mEmbd
        }).then(m => bot.editMessage(m.channel.id, m.id, {
            content: ``,
            embed: {
                color: 0x91244e,
                author: {
                    name: `${message.author.username}#${message.author.discriminator}`,
                    icon_url: `${message.author.avatarURL}`
                },
                description: "Ping! That took " + (Date.now() - before) + " milliseconds"
            }
        })).catch((err) => {
            console.log(err.stack);
        })
    }
});
bot.connect();
