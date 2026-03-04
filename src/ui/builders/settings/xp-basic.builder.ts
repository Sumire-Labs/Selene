import type {XpConfig} from '@prisma/client';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ContainerBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {
    MULTIPLIER_OPTIONS,
    MESSAGE_XP_OPTIONS,
    VOICE_XP_OPTIONS,
    COOLDOWN_OPTIONS,
} from '../../../xp/types.js';

export function buildXpBasicView(guildId: string, config: XpConfig): ContainerBuilder {
    const container = createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('⚙️ XP基本設定'))
        .addSeparatorComponents(createDivider());

    // Multiplier
    container.addTextDisplayComponents(createText('**倍率:**'));
    const currentMult = String(config.multiplier);
    container.addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`settings:xp-mult:${guildId}`)
                .addOptions(
                    MULTIPLIER_OPTIONS.map(opt =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(opt.label)
                            .setValue(opt.value)
                            .setDefault(opt.value === currentMult),
                    ),
                ),
        ),
    );

    // Message XP
    container.addTextDisplayComponents(createText('**メッセージXP:**'));
    const currentMsgXp = String(config.messageXp);
    container.addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`settings:xp-msgxp:${guildId}`)
                .addOptions(
                    MESSAGE_XP_OPTIONS.map(opt =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(opt.label)
                            .setValue(opt.value)
                            .setDefault(opt.value === currentMsgXp),
                    ),
                ),
        ),
    );

    // Voice XP
    container.addTextDisplayComponents(createText('**ボイスXP:**'));
    const currentVcXp = String(config.voiceXpPerMinute);
    container.addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`settings:xp-vcxp:${guildId}`)
                .addOptions(
                    VOICE_XP_OPTIONS.map(opt =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(opt.label)
                            .setValue(opt.value)
                            .setDefault(opt.value === currentVcXp),
                    ),
                ),
        ),
    );

    // Cooldown - need to fit in 5 action rows max, so put it here
    container.addTextDisplayComponents(createText('**クールダウン:**'));
    const currentCd = String(config.cooldownSeconds);
    container.addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`settings:xp-cd:${guildId}`)
                .addOptions(
                    COOLDOWN_OPTIONS.map(opt =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(opt.label)
                            .setValue(opt.value)
                            .setDefault(opt.value === currentCd),
                    ),
                ),
        ),
    );

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
