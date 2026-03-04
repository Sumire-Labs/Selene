import type {ContainerBuilder} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createText} from '../base.builder.js';

export function buildLevelUpView(userId: string, newLevel: number): ContainerBuilder {
    return createContainer(SeleneTheme.colors.green)
        .addTextDisplayComponents(
            createText(`🎉 <@${userId}> がレベル **${newLevel}** に到達しました！`),
        );
}
