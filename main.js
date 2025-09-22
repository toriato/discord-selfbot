import { Client, Message, TextChannel } from 'discord.js-selfbot-v13'

const client = new Client

async function execute () {
    const channel = await client.channels.fetch(process.env.TARGET_CHANNEL_ID)
    if (!(channel instanceof TextChannel)) {
        throw TypeError(`invalid channel: ${channel}`)
    }

    const response = await channel.sendSlash(process.env.TARGET_APPLICATION_ID, process.env.TARGET_COMMAND_NAME)
    if (!(response instanceof Message)) {
        throw Error('application returned non-message response')
    }

    let lines = [response.content]
    if (response.embeds.length > 0) {
        lines.push(...response.embeds.map(
            (embed, index) => 
                embed.description ?? embed.title ?? `empty embed #${index}`
        ))
    }

    let nextIntervalMinutes = parseInt(process.env.LOOP_MINUTES, 10)

    const content = lines.filter(v => v.trim().length > 0).join('\n')
    const matches = content.match(/(?<minutes>\d+)분/)
    if (matches === null) {
        console.log(`server returns unexpected message: ${content}`)
    } else {
        nextIntervalMinutes = parseInt(matches.groups['minutes'], 10)
    }

    return nextIntervalMinutes
}

function handleSignal () {
    console.log('signal received')
    process.exit(0)
}

process.on('SIGINT', handleSignal)
process.on('SIGTERM', handleSignal)

client.on('ready', async () => {
    console.log(`${client.user.displayName}(${client.user.id}) is ready, running executor`)

    while (client.isReady) {
        const nextIntervalMinutes = await execute()
        console.log(`wait for ${nextIntervalMinutes} minute(s)`)
        await new Promise(r => setInterval(r, nextIntervalMinutes * 60 * 1000))
    }
})

client.login(process.env.DISCORD_TOKEN)
