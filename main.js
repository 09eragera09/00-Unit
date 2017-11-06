const Eris = require('eris');
var config = require('./config.json');

const moment = require("moment");

var bot = new Eris.CommandClient(config.token, {}, {
    description: "A shitty bot made with Eris in JS",
    owner: "09eragera09",
    prefix: "!"
});

bot.on('ready', () => {
    console.log("Im alive!");
});

bot.registerCommand("ping", (message, args) => {
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
}, {
    description: "A ping command",
    fullDescription: "A ping command, to keep you entertained.",
    usage: "<text>"
})

bot.registerCommand("userinfo", (message, args)=> {
    if (args == 0) {
        console.log("executed without args")
        username = message.author.username
    }
    else if (message.mentions.length > 0 && !message.mentionEveryone) {
        console.log(message.mentions)
        console.log("executed with mentions")
        username = message.mentions[0].username
    }
    else {
        username = args[0]
    }
    //This is going to be slow as shit....
    member = message.channel.guild.members.find(m => {
        if (m.username == username || m.nick == username) return true;
    })
    var id = message.channel.guild.members.get(member.id)
    embed = {
        color: 0x91244e,
        type: 'rich',
        author: {
            name: `Info of ${member.username}#${member.discriminator}`,
            icon_url: `${member.avatarURL}`
        },
        description: `Playing: ${member.game === null ? `n/a` : ''}${member.game !== null ? '**' + member.game.name+'**' : ''}`,
        thumbnail: {
            url: `${member.avatarURL}`
        },
        fields: [{
            name: `Username`,
            value: `${member.username}#${member.discriminator}`,
            inline: true
        }, {
            name: 'Bot user',
            value: `${member.bot}`, 
            inline: true
        }, {
            name: 'User ID',
            value: `${member.id}`,
            inline: true,
        }, {
            name: 'Nickname',
            value: `${member.nick === null ? `n/a`: ''}${member.nick !== null ? member.nick: ''}`,
            inline: true
        }, {
            name: `Created at`,
            value: `${moment(member.createdAt).utc().format('ddd MMM DD YYYY | kk:mm:ss')} UTC (${moment(member.createdAt).fromNow()})`,
            inline: false
        }, {
            name: `Joined at`,
            value: `${moment(member.joinedAt).utc().format('ddd MMM DD YYYY | kk:mm:ss')} UTC (${moment(member.joinedAt).fromNow()})`,
            inline: false
        }, {
            name: `Status`,
            value: `${member.status}`,
            inline: true
        }, {
            name: `Roles`,
            value: `${member.roles.map(r=>message.channel.guild.roles.get(r).name).join(", ")}`,
            inline: true
        }]
    }
    bot.createMessage(message.channel.id, {
        content: '',
        embed: embed
    })}, {description: 'Gets info on a user',
fullDescription: "Gets full info on a user, including game playing, creation and join date"
})
bot.registerCommand('serverinfo', (message, args) => {
    server = message.channel.guild
    onlinecount = []
    server.members.forEach(function(member) {
        if (member.status != "offline") {
            onlinecount.push(member)
        }
    }, this);
    var owner = server.members.get(server.ownerID)
    embed = {
        color: 0x91244e,
        type: 'rich',
        author: {
            name: `Serverinfo of ${server.name}`,
            icon_url: `${server.iconURL}` 
        },
        description: `Created on ${moment(server.createdAt).utc().format('ddd MMM DD YYYY | kk:mm:ss')} UTC (${moment(server.createdAt).fromNow()})`,
        thumbnail: {
            url: `${server.iconURL}`
        },
        fields: [{
            name: "Region",
            value: `${server.region}`,
            inline: true
        }, {
            name: "Users",
            value: `${onlinecount.length} Online/${server.memberCount}`,
            inline: true
        }, {
            name: "Roles",
            value: `This shit doesnt work yet`,
            inline: true
        }, {
            name: "Owner",
            value: `${owner.username}#${owner.discriminator}`,
            inline: true
        }]
    }
    bot.createMessage(message.channel.id, {
        content: "",
        embed: embed
    })}, {
        description: "Gets the serverinfo",
        fullDescription: "Gets the detailed serverinfo, including region and online count."
    })

bot.connect();
