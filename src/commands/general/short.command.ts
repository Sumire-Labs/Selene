import {type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from 'discord.js';
import {registerCommand} from '../registry.js';
import {buildShortUrlView} from '../../ui/builders/short.builder.js';
import {config} from '../../config/index.js';

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const url = interaction.options.getString('url', true);

    if (!config.xgd.apiKey) {
        await interaction.reply({
            content: 'URL短縮サービスが設定されていません。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    await interaction.deferReply({flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral});

    const endpoint = `https://xgd.io/V1/shorten?key=${encodeURIComponent(config.xgd.apiKey)}&url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint);
    const data = await res.json() as {shorturl?: string; status?: number; message?: string};

    if (!res.ok || !data.shorturl) {
        throw new Error(data.message ?? `API error (${res.status})`);
    }

    const container = buildShortUrlView(data.shorturl);
    await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    });
}

registerCommand({
    data: new SlashCommandBuilder()
        .setName('short')
        .setDescription('URLを短縮する')
        .addStringOption(option =>
            option.setName('url').setDescription('短縮するURL').setRequired(true),
        )
        .toJSON(),
    execute: execute as (interaction: never) => Promise<void>,
});
