const Eris = require('eris');
var config = require('./config.json');
var cmds = require('./commands');

var bot = new Eris.CommandClient(config.token, {}, {
    description: "A shitty bot made with Eris in JS",
    owner: "09eragera09",
    prefix: config.prefix
});

bot.on('ready', () => {
    console.log("Im alive!");
});
for (let o in cmds) {
    cmds[o].make(bot)
}

bot.connect();