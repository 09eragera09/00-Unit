"use strict";

const Eris = require('eris');
var config = require('./config.json');
var cmds = require('./commands');
const mysql = require('mysql2/promise');

var bot = new Eris.CommandClient(config.token, {}, {
    description: "A shitty bot made with Eris in Node.js",
    owner: "09eragera09",
    prefix: config.prefix
});

bot.on('ready', () => {
    console.log("Im alive!");
});

async function initialize(cmds) {
    let con = await mysql.createConnection({
        host: "localhost",
        user: config.sql_user,
        password: config.sql_pass,
    });

    for (let o in cmds) {
        cmds[o].make(bot, con)
    }
}

async function start(bot){
    try {
        bot.connect();
    } catch (e) {
        console.log(e.stack)
    }
}

initialize(cmds);
//start(bot);
bot.connect().catch(err => {
    console.log(err.stack)
});