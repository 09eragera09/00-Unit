"use strict";
const config = require('../config.json');
const fs = require('fs');

module.exports.make = async (bot, con) => {

    con.query("CREATE DATABASE IF NOT EXISTS 00Unit;");
    con.query("USE 00Unit;");
    con.query("CREATE TABLE IF NOT EXISTS commands(" +
        "id int(4) PRIMARY KEY AUTO_INCREMENT," +
        "name varchar(50) NOT NULL);");
    con.query("CREATE TABLE IF NOT EXISTS servers(" +
        "id int(10) PRIMARY KEY AUTO_INCREMENT," +
        "code bigint NOT NULL," +
        "name VARCHAR(1024) NOT NULL," +
        "CONSTRAINT UNIQUE(code, name));");
    con.query("CREATE TABLE IF NOT EXISTS whiteListedCommands(" +
        "id int(4) PRIMARY KEY AUTO_INCREMENT," +
        "commandID int(4) NOT NULL," +
        "serverID int(4) NOT NULL," +
        "CONSTRAINT FOREIGN KEY (commandID) REFERENCES commands(id)," +
        "CONSTRAINT FOREIGN KEY (serverID) REFERENCES servers(id)," +
        "CONSTRAINT UNIQUE (commandID, serverID)" +
        ");");

    let files = fs.readdirSync('commands/');
    config.required_modules.split(' ').forEach(i => {
        files.splice(files.indexOf(i), 1)
    });
    con.query(`SELECT * FROM commands;`, (err, res, fields) => {
        res.forEach(i => {
            files.splice(files.indexOf(i.name), 1);
        });
        files.forEach(i => {
            con.query(`INSERT INTO commands(name) VALUES("${i}");`)
        })
    });

    bot.on('ready', () => {
        let servers = [];
        bot.guilds.map(res => {
            servers.push({id: `${res.id}`, name: `${res.name}`})
        });
        con.query(`SELECT * FROM servers;`, (err, res, fields) => {
            res.forEach(i => {
                servers.splice(servers.indexOf({id: `${i.code}`, name: `${i.name}`}), 1);
            });
            servers.forEach(i => {
                con.query(`INSERT INTO servers(code, name) VALUES("${i.id}", "${i.name}");`)
            })
        })
    });
    bot.on('guildCreate', (guild) => {
        let servers = [{id: `${guild.id}`, name: `${guild.name}`}];
        con.query(`SELECT * FROM servers;`, (err, res, fields) => {
            res.forEach(i => {
                servers.splice(servers.indexOf({id: `${i.code}`, name: `${i.name}`}), 1);
            });
            servers.forEach(i => {
                con.query(`INSERT INTO servers(code, name) VALUES("${i.id}", "${i.name}");`)
            })
        })
    });
    bot.registerCommand("modules", (message, args) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"});
            return
        }
        con.query(`SELECT * FROM commands;`, (err, res, fields) => {
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
            })
        })
    });
    bot.registerCommand("enable", async (message, args) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"});
            return
        }
        let contentString = "";
        if (args.length == 0 || (isNaN(parseInt(args[0]))) && args[0] !== "all" && args[0] !== "All") {
            bot.createMessage(message.channel.id, {content: "Invalid Usage."});
            return
        }
        let member = message.channel.guild.members.find(m => {
            if (m.id == message.author.id) return true;
        });
        let roleList = member.roles.map(r => message.channel.guild.roles.get(r).name);
        if (member.id == config.ownerID || roleList.indexOf(config.admin_role) != -1) {
            let [serverRes, fields] = await con.query(`SELECT * FROM servers where code = ${message.channel.guild.id};`);
            if (args[0] === "all" || args[0] === "All") {
                let [commandRes, commandFields] = await con.query(`SELECT * FROM commands;`);
                for (let i = 0; i < commandRes.length; i++) {
                    try {
                        await con.query(`INSERT INTO whiteListedCommands(commandID, serverID) VALUES("${commandRes[i].id}", "${serverRes[0].id}");`);
                        contentString += `Module ${commandRes[i].name.split('.')[0]} successfully enabled\n`
                    } catch (err) {
                        contentString += `Module ${commandRes[i].name.split('.')[0]} not enabled, ${err.code}: ${err.message}\n`
                    }
                }
                bot.createMessage(message.channel.id, {content: contentString});
                return
            }
            for (let i = 0; i < args.length; i++) {
                if (isNaN(parseInt(args[i]))) {
                    return
                } else {
                    let [commandRes, commandFields] = await con.query(`SELECT * FROM commands where id = ${args[i]};`);

                    try {
                        await con.query(`INSERT INTO whiteListedCommands(commandID, serverID) VALUES("${commandRes[0].id}", "${serverRes[0].id}");`);
                        contentString += `Module ${commandRes[0].name.split('.')[0]} successfully enabled\n`
                    } catch (err) {
                        contentString += `Module ${commandRes[0].name.split('.')[0]} not enabled, ${err.code}: ${err.message}\n`
                    }
                }
            }
            bot.createMessage(message.channel.id, {content: contentString});

        } else {
            bot.createMessage(message.channel.id, {content: `You do not have the ${config.admin_role} role.`})
        }
    });
    bot.registerCommand("disable", async (message, args) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"});
            return
        }
        let contentString = "";
        if (args.length == 0 || (isNaN(parseInt(args[0]))) && args[0] !== "all" && args[0] !== "All") {
            bot.createMessage(message.channel.id, {content: "Invalid Usage."});
            return
        }
        let member = message.channel.guild.members.find(m => {
            if (m.id == message.author.id) return true;
        });
        let roleList = member.roles.map(r => message.channel.guild.roles.get(r).name);
        if (member.id == config.ownerID || roleList.indexOf(config.admin_role) != -1) {
            let [serverRes, fields] = await con.query(`SELECT * FROM servers where code = ${message.channel.guild.id};`);
            if (args[0] === "all" || args[0] === "All") {
                let [commandRes, commandFields] = await con.query(`SELECT * FROM commands;`);
                for (let i = 0; i < commandRes.length; i++) {
                    try {
                        await con.query(`DELETE FROM whiteListedCommands WHERE commandID=${commandRes[i].id} AND serverID=${serverRes[0].id};`);
                        contentString += `Module ${commandRes[i].name.split('.')[0]} successfully disabled\n`
                    } catch (err) {
                        contentString += `Module ${commandRes[i].name.split('.')[0]} not disabled, ${err.code}: ${err.message}\n`
                    }
                }
                bot.createMessage(message.channel.id, {content: contentString});
                return
            }
            for (let i = 0; i < args.length; i++) {
                if (isNaN(parseInt(args[i]))) {
                    return
                } else {
                    let [commandRes, commandFields] = await con.query(`SELECT * FROM commands where id = ${args[i]};`);

                    try {
                        await con.query(`DELETE FROM whiteListedCommands WHERE commandID=${commandRes[0].id} AND serverID=${serverRes[0].id};`);
                        contentString += `Module ${commandRes[0].name.split('.')[0]} successfully disabled\n`
                    } catch (err) {
                        contentString += `Module ${commandRes[0].name.split('.')[0]} not disabled, ${err.code}: ${err.message}\n`
                    }
                }
            }
            bot.createMessage(message.channel.id, {content: contentString});

        } else {
            bot.createMessage(message.channel.id, {content: `You do not have the ${config.admin_role} role.`})
        }
    });
    bot.registerCommand("enabledList", async (message, args) => {
        if (message.channel.type === 1) {
            bot.createMessage(message.channel.id, {content: "Bot disabled in DM channels"});
            return
        }
        let [serverRes, Serverfields] = await con.query(`SELECT * FROM servers WHERE code=${message.channel.guild.id};`);
        let [whiteListRes, fields] = await con.query(`SELECT * FROM whiteListedCommands WHERE serverID = ${serverRes[0].id};`);
        let moduleList = [];
        let s = [];
        for (let i = 0; i < whiteListRes.length; i++) {
            let [commandRes, commandFields] = await con.query(`SELECT * FROM commands where id = ${whiteListRes[i].commandID};`);
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
        })
    })

};

module.exports.checkEnabled = async function (guildID, moduleName, con) {
    let [serverRes, Serverfields] = await con.execute(`SELECT * FROM servers where code = ${guildID};`);
    let [commandRes, Commandfields] = await con.execute(`SELECT * FROM commands where name = "${moduleName}";`);
    let [res, fields] = await con.execute(`SELECT * FROM whiteListedCommands where commandID = ${commandRes[0].id} AND serverID = ${serverRes[0].id};`);
    if (res.length === 0) {
        return [false, `The ${moduleName.split('.')[0]} module has been disabled by the admins. To enable, do \\${config.prefix}modules `]
    } else {
        return [true, null];
    }
};