"use strict";

const Eris = require('eris');
const config = require('./config.json');
const cmds = require('./commands');
const mysql = require('mysql2/promise');

const bot = new Eris.CommandClient(config.token, {}, {
    description: "A shitty bot made with Eris in Node.js",
    owner: "EraTheMonologuer",
    prefix: config.prefix
});

bot.on('ready', () => {
    console.log("Im alive!");
});

bot.on('disconnect', () => {
    bot.connect().catch(err => {
        console.log(err.stack)
    })
});

async function initialize(cmds) {
    let con = await mysql.createConnection({
        host: "localhost",
        user: config.sql_user,
        password: config.sql_pass,
    });
    setInterval(function () {
        con.query('SELECT 1');
    }, 5000);

    for (let o in cmds) {
        if (cmds[o].make) {
            cmds[o].make(bot, con)
        }
    }
}

initialize(cmds).catch((err) => {
    console.log(err.stack)
});
bot.connect().catch(err => {
    console.log(err.stack)
});