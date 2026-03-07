import {ActivityType, Client, Events, GatewayIntentBits} from 'discord.js';
import {Kazagumo} from 'kazagumo';
import {Connectors, Player} from 'kazagumo/node_modules/shoukaku/dist/index.js';
import {createRequire} from 'node:module';
import {config} from './config/index.js';
import {deployCommands} from './commands/registry.js';
import {handleInteraction} from './interactions/handler.js';
import {wirePlayerEvents} from './music/player-events.js';
import {wireVoiceIdleDetector} from './music/voice-idle-detector.js';
import {handleCounterMessage} from './counter/counter-listener.js';
import {handleEmbedFixMessage} from './embedfix/embedfix-listener.js';
import {handleXpMessage} from './xp/xp-listener.js';
import {handleVoiceStateForXp, startVoiceXpTicker} from './xp/xp-voice-tracker.js';
import {wireLoggerEvents} from './settings/logger-listener.js';
import {handleGuardMessage, handleGuardReaction, handleGuardVoiceState} from './guard/guard-listener.js';
import {logger} from './utils/logger.js';

const require = createRequire(import.meta.url);
const {version} = require('../package.json') as { version: string };

// Monkey-patch Shoukaku Player to include channelId in voice state payload.
// The DAVE build of Lavalink (e141cd9) requires channelId but Shoukaku 4.2.0 omits it.
Player.prototype.sendServerUpdate = async function (connection: any) {
    const playerUpdate = {
        guildId: this.guildId,
        playerOptions: {
            voice: {
                token: connection.serverUpdate.token,
                endpoint: connection.serverUpdate.endpoint,
                sessionId: connection.sessionId,
                channelId: connection.channelId,
            },
        },
    };
    await this.node.rest.updatePlayer(playerUpdate);
};

let kazagumo: Kazagumo;

export function getKazagumo(): Kazagumo {
    return kazagumo;
}

export function createClient(): Client {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildModeration,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildWebhooks,
        ],
    });

    // Initialize Kazagumo with Shoukaku
    kazagumo = new Kazagumo(
        {
            defaultSearchEngine: 'youtube',
            send: (guildId, payload) => {
                const guild = client.guilds.cache.get(guildId);
                if (guild) guild.shard.send(payload);
            },
        },
        new Connectors.DiscordJS(client),
        config.lavalink.nodes.map(n => ({
            name: n.name,
            url: n.url,
            auth: n.auth,
            secure: n.secure,
        })),
    );

    wirePlayerEvents(kazagumo);
    wireLoggerEvents(client);

    // Shoukaku node events
    kazagumo.shoukaku.on('ready', (name) => {
        logger.info(`Lavalink node connected: ${name}`);
    });
    kazagumo.shoukaku.on('error', (name, error) => {
        logger.error(`Lavalink node error: ${name}`, {error: error.message});
    });
    kazagumo.shoukaku.on('close', (name, code, reason) => {
        logger.warn(`Lavalink node closed: ${name}`, {code, reason});
    });

    client.once(Events.ClientReady, async (readyClient) => {
        logger.info(`Logged in as ${readyClient.user.tag}`);
        readyClient.user.setPresence({
            activities: [{name: `v${version}`, type: ActivityType.Listening}],
            status: 'online',
        });
        await deployCommands();
    });

    client.on(Events.InteractionCreate, handleInteraction);
    client.on(Events.MessageCreate, handleCounterMessage);
    client.on(Events.MessageCreate, handleEmbedFixMessage);
    client.on(Events.MessageCreate, handleXpMessage);
    client.on(Events.MessageCreate, handleGuardMessage);
    client.on(Events.MessageReactionAdd, handleGuardReaction);
    client.on(Events.VoiceStateUpdate, handleGuardVoiceState);
    client.on(Events.VoiceStateUpdate, handleVoiceStateForXp);

    // Start voice XP ticker once ready
    client.once(Events.ClientReady, () => {
        startVoiceXpTicker(client);
    });

    // VC empty detection: auto-disconnect after timeout
    wireVoiceIdleDetector(client);

    return client;
}

export async function startBot(): Promise<Client> {
    const client = createClient();
    await client.login(config.discordToken);
    return client;
}
