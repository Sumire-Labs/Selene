import type {UserXp} from '@prisma/client';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ContainerBuilder,
    UserSelectMenuBuilder,
} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {levelProgress} from '../../../xp/xp-table.js';
import {formatCompactNumber} from '../../../utils/formatters.js';

export function buildXpUsersView(
    guildId: string,
    selectedUser?: {displayName: string; data: UserXp; rank: number},
): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('👤 ユーザーXP管理'))
        .addSeparatorComponents(createDivider());

    // User select
    container.addActionRowComponents(
        new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
            new UserSelectMenuBuilder()
                .setCustomId(`settings:xp-usel:${guildId}`)
                .setPlaceholder('ユーザーを選択...'),
        ),
    );

    if (selectedUser) {
        const {displayName, data, rank} = selectedUser;
        const progress = levelProgress(data.xp);

        container.addSeparatorComponents(createDivider());
        container.addTextDisplayComponents(
            createText(
                `**${displayName}**\n` +
                `レベル: ${progress.level} | ランク: #${rank}\n` +
                `XP: ${formatCompactNumber(data.xp)}\n` +
                `メッセージ: ${formatCompactNumber(data.totalMessages)}\n` +
                `通話時間: ${data.totalVoiceMinutes}分`,
            ),
        );

        container.addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`settings:xp-uedit:${guildId}:${data.userId}`)
                    .setLabel('✏️ XP編集')
                    .setStyle(ButtonStyle.Primary),
            ),
        );
    }

    container.addSeparatorComponents(createDivider());

    // Back button
    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`settings:xp-back:${guildId}`)
                .setLabel('◀ 戻る')
                .setStyle(ButtonStyle.Secondary),
        ),
    );

    return container;
}
