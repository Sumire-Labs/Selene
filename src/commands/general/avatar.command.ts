import {type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from 'discord.js';
import {registerCommand} from '../registry.js';
import {buildAvatarView} from '../../ui/builders/avatar.builder.js';

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const avatarUrl = target.displayAvatarURL({size: 4096});

    const container = buildAvatarView(target.displayName, avatarUrl);

    await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
}

registerCommand({
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('ユーザーのアバターを表示')
        .addUserOption(option =>
            option.setName('user').setDescription('対象ユーザー（省略で自分）'),
        )
        .toJSON(),
    execute: execute as (interaction: never) => Promise<void>,
});
