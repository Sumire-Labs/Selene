import {
    ActionRowBuilder,
    type ButtonInteraction,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import {getXpConfig, toggleXp, getRoleRewards, getUserXp} from '../../xp/xp-service.js';
import {buildXpOverview} from '../../ui/builders/settings/xp-overview.builder.js';
import {buildXpBasicView} from '../../ui/builders/settings/xp-basic.builder.js';
import {buildXpNotificationView} from '../../ui/builders/settings/xp-notification.builder.js';
import {buildXpRewardsView} from '../../ui/builders/settings/xp-rewards.builder.js';
import {buildXpUsersView} from '../../ui/builders/settings/xp-users.builder.js';

export async function handleXpButton(
    interaction: ButtonInteraction, action: string, guildId: string, param?: string,
): Promise<void> {
    switch (action) {
        case 'xp-rwadd': {
            const modal = new ModalBuilder()
                .setCustomId(`settings-xprw:${guildId}`)
                .setTitle('ロール報酬の追加')
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('level')
                            .setLabel('レベル (1〜100)')
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(3)
                            .setRequired(true),
                    ),
                );
            await interaction.showModal(modal);
            return;
        }

        case 'xp-uedit': {
            const userId = param;
            if (!userId) return;

            const userData = await getUserXp(guildId, userId);
            const modal = new ModalBuilder()
                .setCustomId(`settings-xpue:${guildId}:${userId}`)
                .setTitle('ユーザーXP編集')
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('xp')
                            .setLabel('XP値')
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(10)
                            .setValue(String(userData?.xp ?? 0))
                            .setRequired(true),
                    ),
                );
            await interaction.showModal(modal);
            return;
        }

        case 'xp-toggle': {
            const toggleResult = await toggleXp(guildId);
            if (!toggleResult.ok) {
                await interaction.editReply({content: toggleResult.reason});
                return;
            }
            const xpConfig = await getXpConfig(guildId);
            if (!xpConfig) return;
            const rewards = await getRoleRewards(guildId);
            const view = buildXpOverview(guildId, xpConfig, rewards.length);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'xp-basic': {
            const xpConfig = await getXpConfig(guildId);
            if (!xpConfig) return;
            const view = buildXpBasicView(guildId, xpConfig);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'xp-notif': {
            const xpConfig = await getXpConfig(guildId);
            if (!xpConfig) return;
            const view = buildXpNotificationView(guildId, xpConfig);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'xp-rewards': {
            const rewards = await getRoleRewards(guildId);
            const view = buildXpRewardsView(guildId, rewards);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'xp-users': {
            const view = buildXpUsersView(guildId);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }

        case 'xp-back': {
            const xpConfig = await getXpConfig(guildId);
            if (!xpConfig) return;
            const rewards = await getRoleRewards(guildId);
            const view = buildXpOverview(guildId, xpConfig, rewards.length);
            await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});
            break;
        }
    }
}
