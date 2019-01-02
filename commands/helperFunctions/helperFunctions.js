'use strict';
module.exports.serviceSearch = async function (bot, message, details, searchItems, pickItem) {
    if (searchItems.length === 0) {
        bot.createMessage(message.channel.id, {
            content: "No results found."
        }).catch((err) => {
            console.log(err.stack)
        })
    }
    if (searchItems.length === 1) {
        let res = await pickItem(searchItems[0], bot);
        bot.createMessage(message.channel.id, {
            content: '',
            embed: res
        }).catch((err) => {
            console.log(err.stack)
        })
    }
    if (searchItems.length > 1) {
        let embedAll = {
            color: 0x91244e,
            type: 'rich',
            author: {
                name: `${details.service.name} search for term "${details.query}"`,
                icon_url: `${bot.user.avatarURL}`
            },
            description: `The search contains more than 1 result. Please reply with the appropriate entry number in order to view its details.\n`,
            fields: []
        };
        for (let i = 0; i < searchItems.length; i++) {
            embedAll.description = embedAll.description + `\n${i + 1}: ${searchItems[i].name}`
        }
        bot.createMessage(message.channel.id, {content: '', embed: embedAll}).then((msg) => {
            setTimeout(() => {
                bot.getMessages(msg.channel.id, 10, undefined, msg.id).then(async (messageArray) => {
                    /*messageArray.forEach(async (messageRes) => {
                        if (messageRes.author === message.author && parseInt(messageRes.content) <= searchItems.length) {
                            let res = await pickItem(searchItems[parseInt(messageRes.content) - 1], bot);
                            bot.createMessage(message.channel.id, {content: '', embed: res}).catch((err) => {
                                console.log(err.stack)
                            });
                        }
                    })*/
                    let messageFound = false;
                    for (let i = 0; i < messageArray.length; i++) {
                        if (messageArray.length === 0) {
                            break;
                        }
                        if (messageArray[i].author === message.author && parseInt(messageArray[i].content) <= searchItems.length) {
                            messageFound = true;
                            let res = await pickItem(searchItems[parseInt(messageArray[i].content) - 1], bot);
                            bot.createMessage(message.channel.id, {content: '', embed: res}).catch((err) => {
                                console.log(err.stack)
                            });
                        }
                    }
                    if (!messageFound) {
                        bot.createMessage(message.channel.id, {content: "408 Request Timed Out. (Each Search has a timeout of 7 seconds.)"}).catch((err) => {
                            console.log(err.stack)
                        })
                    }
                }).catch(err => console.log(err))
            }, 7000)
        })
    }
};