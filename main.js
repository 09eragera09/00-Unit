"use strict";

const Eris = require('eris');
const cmds = require('./commands');
const mysql = require('mysql2/promise');

const bot = new Eris.CommandClient(process.env, {}, {
    description: "A shitty bot made with Eris in Node.js",
    owner: "EraTheMonologuer",
    prefix: process.env.DISCORD_COMMAND_PREFIX,
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
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
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