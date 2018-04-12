'use strict';

const hltb = require('howlongtobeat');
const hltbService = new hltb.HowLongToBeatService();

const cache = {};

module.exports.make = async (bot) => {

    await bot.on('messageCreate', (message) => {

        const num = parseInt(message.content, 10);
        const cached = cache[message.author.id];

        if(!isNaN(num) && cached) {

            const { result, search } = cached;
            const answer = result[num - 1];

            if(answer) {
                bot.createMessage(message.channel.id, {
                    content: '',
                    embed: embedSingle(answer, search)
                });
            }
        }

    });

    await bot.registerCommand('hltb', async (message, argv) => {

        let search = argv.join(' ');
        let result = await hltbService.search(search);

        if (result.length === 0) {

            bot.createMessage(message.channel.id, {
                content: 'Search returned no results.'
            });

        } else if (result.length === 1) {

            delete cache[message.author.id];

            bot.createMessage(message.channel.id, {
                content: '',
                embed: embedSingle(result[0], search)
            });

        } else if (result.length > 1) {

            cache[message.author.id] = {
                result: result,
                search: search
            };

            bot.createMessage(message.channel.id, {
                content: '',
                embed: embedMultiple(result, search)
            });

        }

    });

    const embedSingle = (result, search) => ({
        color: 0x91244e,
        type: 'rich',
        author: {
            name: `${result.name}`,
            icon_url: `${result.imageUrl}`
        },
        description: `https://howlongtobeat.com/game.php?id=${result.id}`,
        thumbnail: {
            url: `${result.imageUrl}`
        },
        fields: [
            {
                name: 'Main Story',
                value: `${result.gameplayMain} hours`
            },
            {
                name: 'Completionist',
                value: `${result.gameplayCompletionist} hours`
            }
        ]
    });

    const concatDescriptions = (descriptions) => descriptions.map((desc, idx) => `${idx + 1}: ${desc.name}`);

    const embedMultiple = (result, search) => ({
        color: 0x91244e,
        type: 'rich',
        author: {
            name: `HowLongToBeat search for term '${search}'`,
            icon_url: `${bot.user.avatarURL}`
        },
        description: `The search contains more than 1 result. Please reply with the appropriate entry number in order to view its details.\n\n${concatDescriptions(result).join('\n')}`,
        fields: []
    });

}