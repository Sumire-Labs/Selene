import {MessageFlags, type ModalSubmitInteraction} from 'discord.js';
import {registerModalHandler} from '../handler.js';
import {getRoleRewards, getUserXp, getUserRank, setUserXp} from '../../xp/xp-service.js';
import {buildXpRewardsView} from '../../ui/builders/settings/xp-rewards.builder.js';
import {buildXpUsersView} from '../../ui/builders/settings/xp-users.builder.js';
import {logger} from '../../utils/logger.js';

// Role reward add modal — receives level input, re-renders with RoleSelect
async function handleXpRewardModal(interaction: ModalSubmitInteraction): Promise<void> {
    const guildId = interaction.customId.split(':')[1];
    if (!guildId) return;

    const levelStr = interaction.fields.getTextInputValue('level').trim();
    const level = Number(levelStr);

    if (!Number.isInteger(level) || level < 1 || level > 100) {
        await interaction.reply({
            content: 'レベルは1〜100の整数で入力してください。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    await interaction.deferUpdate();

    const rewards = await getRoleRewards(guildId);
    const view = buildXpRewardsView(guildId, rewards, level);
    await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});

    logger.info('XP reward modal submitted, showing role select', {guildId, level});
}

// User XP edit modal — sets XP value
async function handleXpUserEditModal(interaction: ModalSubmitInteraction): Promise<void> {
    const parts = interaction.customId.split(':');
    const guildId = parts[1];
    const userId = parts[2];
    if (!guildId || !userId) return;

    const xpStr = interaction.fields.getTextInputValue('xp').trim();
    const xp = Number(xpStr);

    if (!Number.isInteger(xp) || xp < 0) {
        await interaction.reply({
            content: 'XPは0以上の整数で入力してください。',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    await interaction.deferUpdate();

    const result = await setUserXp(guildId, userId, xp);
    if (!result.ok) {
        await interaction.followUp({content: result.reason, flags: MessageFlags.Ephemeral});
        return;
    }

    // Re-render user view with updated data
    const data = await getUserXp(guildId, userId);
    if (!data) return;

    const rank = await getUserRank(guildId, userId);
    const member = await interaction.guild!.members.fetch(userId).catch(() => null);
    const displayName = member?.displayName ?? userId;

    const view = buildXpUsersView(guildId, {displayName, data, rank});
    await interaction.editReply({components: [view], flags: MessageFlags.IsComponentsV2});

    logger.info('User XP edited', {guildId, userId, xp});
}

registerModalHandler('settings-xprw', handleXpRewardModal as (interaction: never) => Promise<void>);
registerModalHandler('settings-xpue', handleXpUserEditModal as (interaction: never) => Promise<void>);
