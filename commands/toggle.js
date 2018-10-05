"use strict";
const config = require('../config.json');
const fs = require('fs');

module.exports.make = async (bot, con) => {

    con.query(`CREATE DATABASE IF NOT EXISTS 00Unit;`);
    con.query(`USE 00Unit;`);
    con.query(`
      CREATE TABLE IF NOT EXISTS commands (
        id   int(4) PRIMARY KEY AUTO_INCREMENT,
        name varchar(50) NOT NULL
      );`);
    con.query(`
      CREATE TABLE IF NOT EXISTS servers (
        id   int(10) PRIMARY KEY AUTO_INCREMENT,
        code varchar(50) NOT NULL UNIQUE
      );`);

    con.query(`
      CREATE TABLE IF NOT EXISTS whiteListedCommands (
        id        int(4) PRIMARY KEY AUTO_INCREMENT,
        commandID int(4) NOT NULL,
        serverID  int(4) NOT NULL,
        CONSTRAINT FOREIGN KEY (commandID) REFERENCES commands (id),
        CONSTRAINT FOREIGN KEY (serverID) REFERENCES servers (id),
        CONSTRAINT UNIQUE (commandID, serverID)
      );`);

    con.query(`
      CREATE TABLE IF NOT EXISTS userWishlists (
        id            int PRIMARY KEY AUTO_INCREMENT,
        userID        varchar(255) NOT NULL,
        salePercent   int(3)          DEFAULT 75,
        steamUsername varchar(255) NOT NULL
      );
    `);

    let files = fs.readdirSync('commands/');
    config.required_modules.split(' ').forEach(i => {
        let moduleIndex = files.indexOf(i);
        if (moduleIndex !== -1) {
            files.splice(moduleIndex, 1)
        }
    });
    con.query(`SELECT *
               FROM commands;`, (err, res,) => {
        res.forEach(i => {
            let fileIndex = files.indexOf(i.name);
            if (fileIndex !== -1) {
                files.splice(fileIndex, 1);
            }
        });
        files.forEach(i => {
            con.query(`INSERT INTO commands(name) VALUES("${i}");`)
        })
    });


    function insertServersIntoDB(servers, con) {
        con.query(`SELECT *
                   FROM servers;`, (err, res) => {
            res.forEach(i => {
                let serverIndex = servers.indexOf(i.id);
                if (serverIndex !== -1) {
                    servers.splice(serverIndex, 1)
                }
            });
            servers.forEach(i => {
                con.query(`INSERT IGNORE INTO servers(code) VALUES("${i}") ;`)
            })
        })
    }

    bot.on('ready', () => {
        let servers = [];
        bot.guilds.map(res => {
            servers.push(res.id)
        });
        insertServersIntoDB(servers, con)
    });

    bot.on('guildCreate', (guild) => {
        let server = [guild.id];
        insertServersIntoDB(server, con)
    });
    bot.registerCommand("modules", (message) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"})
                .catch(err => {
                    console.log(err.stack)
                });
            return
        }
        con.query(`SELECT *
                   FROM commands;`, (err, res) => {
            let moduleList = fs.readdirSync('commands/');
            config.required_modules.split(' ').forEach(i => {
                moduleList.splice(moduleList.indexOf(i), 1)
            });
            let commandArray = [];
            res.forEach(i => {
                if (moduleList.indexOf(i.name) !== -1) {
                    commandArray.push({id: `${i.id}`, name: `${i.name.split('.')[0]}`});
                }
            });
            let embedAll = {
                color: 0x91244e,
                type: 'rich',
                author: {
                    name: `List of bot modules`,
                    icon_url: `${bot.user.avatarURL}`
                },
                description: `Here is a list of toggleable modules. To enable/disable, use \\${config.prefix}enable and \\${config.prefix}disable with the module's id, multiple modules seperated by space. To enable all, do '\\${config.prefix}enable all'. To see what a module does and the commands it has, do \\${config.prefix}help \n`,
                fields: []
            };
            commandArray.forEach(i => {
                embedAll.description = embedAll.description + `\nID ${i.id}: ${i.name}`
            });
            bot.createMessage(message.channel.id, {
                content: '',
                embed: embedAll
            }).catch(err => console.log(err))
        })
    });
    bot.registerCommand("enable", async (message, args) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"})
                .catch(err => console.log(err));
            return
        }
        let contentString = "";
        if (args.length === 0 || (isNaN(parseInt(args[0]))) && args[0] !== "all" && args[0] !== "All") {
            bot.createMessage(message.channel.id, {content: "Invalid Usage."})
                .catch(err => console.log(err));
            return
        }
        let member = message.channel.guild.members.find(m => {
            if (m.id === message.author.id) return true;
        });
        let roleList = member.roles.map(r => message.channel.guild.roles.get(r).name);
        if (member.id === config.ownerID || roleList.indexOf(config.admin_role) !== -1) {
            let [serverRes] = await con.query(`SELECT *
                                               FROM servers
                                               where code = ?;`, [message.channel.guild.id]);
            if (args[0] === "all" || args[0] === "All") {
                let [commandRes] = await con.query(`SELECT *
                                                    FROM commands;`);
                for (let i = 0; i < commandRes.length; i++) {
                    try {
                        await con.query(`INSERT INTO whiteListedCommands (commandID, serverID)
                                         VALUES (?, ?);`, [commandRes[i].id, serverRes[0].id]);
                        contentString += `Module ${commandRes[i].name.split('.')[0]} successfully enabled\n`
                    } catch (err) {
                        contentString += `Module ${commandRes[i].name.split('.')[0]} not enabled, ${err.code}: ${err.message}\n`
                    }
                }
                bot.createMessage(message.channel.id, {content: contentString})
                    .catch(err => console.log(err));
                return
            }
            for (let i = 0; i < args.length; i++) {
                if (isNaN(parseInt(args[i]))) {
                    return
                } else {
                    let [commandRes] = await con.query(`SELECT *
                                                        FROM commands
                                                        where id = ?;`, [args[i]]);

                    try {
                        await con.query(`INSERT INTO whiteListedCommands (commandID, serverID)
                                         VALUES (?, ?);`, [commandRes[0].id, serverRes[0].id]);
                        contentString += `Module ${commandRes[0].name.split('.')[0]} successfully enabled\n`
                    } catch (err) {
                        contentString += `Module ${commandRes[0].name.split('.')[0]} not enabled, ${err.code}: ${err.message}\n`
                    }
                }
            }
            bot.createMessage(message.channel.id, {content: contentString})
                .catch(err => console.log(err));

        } else {
            bot.createMessage(message.channel.id, {content: `You do not have the ${config.admin_role} role.`})
                .catch(err => console.log(err));
        }
    });
    bot.registerCommand("disable", async (message, args) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"})
                .catch(err => console.log(err));
            return
        }
        let contentString = "";
        if (args.length === 0 || (isNaN(parseInt(args[0]))) && args[0] !== "all" && args[0] !== "All") {
            bot.createMessage(message.channel.id, {content: "Invalid Usage."})
                .catch(err => console.log(err));
            return
        }
        let member = message.channel.guild.members.find(m => {
            if (m.id === message.author.id) return true;
        });
        let roleList = member.roles.map(r => message.channel.guild.roles.get(r).name);
        if (member.id === config.ownerID || roleList.indexOf(config.admin_role) !== -1) {
            let [serverRes] = await con.query(`SELECT *
                                               FROM servers
                                               where code = ?;`, [message.channel.guild.id]);
            if (args[0] === "all" || args[0] === "All") {
                let [commandRes] = await con.query(`SELECT *
                                                    FROM commands;`);
                for (let i = 0; i < commandRes.length; i++) {
                    try {
                        await con.query(`DELETE
                                         FROM whiteListedCommands
                                         WHERE commandID = ?
                                           AND serverID = ?;`, [commandRes[i].id, serverRes[0].id]);
                        contentString += `Module ${commandRes[i].name.split('.')[0]} successfully disabled\n`
                    } catch (err) {
                        contentString += `Module ${commandRes[i].name.split('.')[0]} not disabled, ${err.code}: ${err.message}\n`
                    }
                }
                bot.createMessage(message.channel.id, {content: contentString})
                    .catch(err => console.log(err));
                return
            }
            for (let i = 0; i < args.length; i++) {
                if (isNaN(parseInt(args[i]))) {
                    return
                } else {
                    let [commandRes] = await con.query(`SELECT *
                                                        FROM commands
                                                        where id = ?;`, [args[i]]);

                    try {
                        await con.query(`DELETE
                                         FROM whiteListedCommands
                                         WHERE commandID = ?
                                           AND serverID = ?;`, [commandRes[0].id, serverRes[0].id]);
                        contentString += `Module ${commandRes[0].name.split('.')[0]} successfully disabled\n`
                    } catch (err) {
                        contentString += `Module ${commandRes[0].name.split('.')[0]} not disabled, ${err.code}: ${err.message}\n`
                    }
                }
            }
            bot.createMessage(message.channel.id, {content: contentString})
                .catch(err => console.log(err));

        } else {
            bot.createMessage(message.channel.id, {content: `You do not have the ${config.admin_role} role.`})
                .catch(err => console.log(err));
        }
    });
    bot.registerCommand("enabledList", async (message) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"})
                .catch(err => console.log(err));
            return
        }
        let [serverRes] = await con.query(`SELECT *
                                           FROM servers
                                           WHERE code = ?;`, [message.channel.guild.id]);
        let [whiteListRes] = await con.query(`SELECT *
                                              FROM whiteListedCommands
                                              WHERE serverID = ?;`, [serverRes[0].id]);
        let moduleList = [];

        for (let i = 0; i < whiteListRes.length; i++) {
            let [commandRes] = await con.query(`SELECT *
                                                FROM commands
                                                where id = ?;`, [whiteListRes[i].commandID]);
            moduleList.push({id: `${commandRes[0].id}`, name: `${commandRes[0].name}`});
        }
        let embedAll = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `List of bot modules`,
                icon_url: `${bot.user.avatarURL}`
            },
            description: `List of enabled modules. To disable, use \\${config.prefix}disable with the module's id, multiple modules seperated by space. To see what a module does and the commands it has, do \\${config.prefix}help \n`,
            fields: []
        };
        moduleList.forEach(i => {
            embedAll.description = embedAll.description + `\nID ${i.id}: ${i.name}`
        });
        if (moduleList.length === 0) {
            embedAll.description = embedAll.description + `\nNo modules enabled, do \\${config.prefix}modules to see available modules.`
        }
        bot.createMessage(message.channel.id, {
            content: '',
            embed: embedAll
        }).catch(err => console.log(err))
    })

};

module.exports.checkEnabled = async function (guildID, moduleName, con) {
    //let [serverRes] = await con.execute(`SELECT * FROM servers where code = ${guildID};`);
    //let [commandRes] = await con.execute(`SELECT * FROM commands where name = "${moduleName}";`);
    let [res] = await con.query(`
      select *
      from whiteListedCommands
             inner join commands on commands.id = whiteListedCommands.commandID
             inner join servers on servers.id = whiteListedCommands.serverID
      where servers.code = ?
        AND commands.name = ?
    `, [guildID, moduleName]);
    if (res.length === 0) {
        return [false, `The ${moduleName.split('.')[0]} module has been disabled by the admins. To enable, do \\${config.prefix}modules `]
    } else {
        return [true, null];
    }
};