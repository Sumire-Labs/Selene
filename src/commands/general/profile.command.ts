import {type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from 'discord.js';
import {registerCommand} from '../registry.js';
import {getUserXp, getUserRank} from '../../xp/xp-service.js';
import {buildProfileView} from '../../ui/builders/xp/profile.builder.js';

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const guildId = interaction.guildId;
    if (!guildId) return;

    await interaction.deferReply({flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral});

    const data = await getUserXp(guildId, target.id);
    const rank = data ? await getUserRank(guildId, target.id) : 0;

    const member = interaction.guild?.members.cache.get(target.id)
        ?? await interaction.guild?.members.fetch(target.id).catch(() => null);

    const container = buildProfileView(
        target.displayName,
        data?.xp ?? 0,
        rank,
        data?.totalMessages ?? 0,
        data?.totalVoiceMinutes ?? 0,
        member?.joinedAt ?? null,
    );

    await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    });
}

registerCommand({
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('ユーザーのプロフィールを表示')
        .addUserOption(option =>
            option.setName('user').setDescription('対象ユーザー（省略で自分）'),
        )
        .toJSON(),
    execute: execute as (interaction: never) => Promise<void>,
});
