"use strict";

const Eris = require('eris');
var config = require('./config.json');
var cmds = require('./commands');

var bot = new Eris.CommandClient(config.token, {}, {
    description: "A shitty bot made with Eris in Node.js",
    owner: "09eragera09",
    prefix: config.prefix
});

bot.on('ready', () => {
    console.log("Im alive!");
});
for (let o in cmds) {
    cmds[o].make(bot)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function start(bot){
    try {
        bot.connect();
    } catch (e) {
        if (e instanceof ConnectionResetError) {
            await start(bot);
        }
    }
}
start(bot);