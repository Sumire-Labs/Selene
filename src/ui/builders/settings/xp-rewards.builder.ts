import type {XpRoleReward} from '@prisma/client';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ContainerBuilder,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {MAX_XP_ROLE_REWARDS} from '../../../config/constants.js';

export function buildXpRewardsView(
    guildId: string,
    rewards: XpRoleReward[],
    pendingLevel?: number,
): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('🎁 ロール報酬'))
        .addSeparatorComponents(createDivider());

    if (rewards.length > 0) {
        const lines = rewards.map(r => `Level ${r.level} → <@&${r.roleId}>`);
        container.addTextDisplayComponents(createText(lines.join('\n')));
    } else {
        container.addTextDisplayComponents(createText('ロール報酬はまだ設定されていません。'));
    }

    container.addSeparatorComponents(createDivider());

    // Pending role selection (after modal level input)
    if (pendingLevel !== undefined) {
        container.addTextDisplayComponents(
            createText(`**Level ${pendingLevel} の報酬ロールを選択:**`),
        );
        container.addActionRowComponents(
            new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId(`settings:xp-rwrole:${guildId}:${pendingLevel}`)
                    .setPlaceholder('ロールを選択...'),
            ),
        );
    }

    // Add button (if under limit and no pending)
    if (pendingLevel === undefined && rewards.length < MAX_XP_ROLE_REWARDS) {
        container.addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`settings:xp-rwadd:${guildId}`)
                    .setLabel('➕ 報酬を追加')
                    .setStyle(ButtonStyle.Success),
            ),
        );
    }

    // Delete select (if rewards exist)
    if (rewards.length > 0) {
        container.addActionRowComponents(
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`settings:xp-rwdel:${guildId}`)
                    .setPlaceholder('報酬を削除...')
                    .addOptions(
                        rewards.map(r =>
                            new StringSelectMenuOptionBuilder()
                                .setLabel(`Level ${r.level}`)
                                .setValue(String(r.id)),
                        ),
                    ),
            ),
        );
    }

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
