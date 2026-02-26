import {loadYamlConfig} from './yaml-loader.js';

const configPath = process.env['CONFIG_PATH'] || './config.yaml';
const yaml = loadYamlConfig(configPath) as {
    bot?: { token?: string; clientId?: string; guildId?: string; databaseUrl?: string };
    lavalink?: { nodes?: Array<{ name?: string; url?: string; auth?: string; secure?: boolean }> };
    music?: { defaultVolume?: number; maxQueueSize?: number; idleTimeoutMs?: number; playerUpdateIntervalMs?: number };
    xgd?: { apiKey?: string };
};

function requireConfig(key: string, value: string | undefined): string {
    if (!value) {
        throw new Error(`Missing required config: "${key}" in config.yaml`);
    }
    return value;
}

export const config = {
    discordToken: requireConfig('bot.token', yaml.bot?.token),
    clientId: requireConfig('bot.client-id', yaml.bot?.clientId),
    guildId: yaml.bot?.guildId,
    databaseUrl: requireConfig('bot.database-url', yaml.bot?.databaseUrl),
    configPath,

    lavalink: {
        nodes: (yaml.lavalink?.nodes ?? []).map(n => ({
            name: n.name ?? 'main',
            url: n.url ?? 'localhost:2333',
            auth: n.auth ?? 'youshallnotpass',
            secure: n.secure ?? false,
        })),
    },

    music: {
        defaultVolume: yaml.music?.defaultVolume ?? 80,
        maxQueueSize: yaml.music?.maxQueueSize ?? 200,
        idleTimeoutMs: yaml.music?.idleTimeoutMs ?? 60_000,
        playerUpdateIntervalMs: yaml.music?.playerUpdateIntervalMs ?? 15_000,
    },

    xgd: {
        apiKey: yaml.xgd?.apiKey,
    },
} as const;

process.env.DATABASE_URL = config.databaseUrl;
