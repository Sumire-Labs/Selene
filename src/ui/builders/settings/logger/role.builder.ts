import type {Role} from 'discord.js';
import type {ContainerBuilder} from 'discord.js';
import {SeleneTheme, createContainer, createDivider, createHeader, createText, timestamp} from './shared.js';

export function buildRoleCreateLog(role: Role): ContainerBuilder {
    return createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('🏷️ ロール作成'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**ロール:** <@&${role.id}> (${role.name})\n` +
                `**色:** #${role.color.toString(16).padStart(6, '0')}`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildRoleUpdateLog(oldRole: Role, newRole: Role): ContainerBuilder {
    const changes: string[] = [`**ロール:** <@&${newRole.id}>`];
    if (oldRole.name !== newRole.name) {
        changes.push(`**名前:** ${oldRole.name} → ${newRole.name}`);
    }
    if (oldRole.color !== newRole.color) {
        changes.push(
            `**色:** #${oldRole.color.toString(16).padStart(6, '0')} → #${newRole.color.toString(16).padStart(6, '0')}`,
        );
    }
    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
        changes.push('**権限:** 変更あり');
    }

    return createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('🏷️ ロール編集'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(changes.join('\n')))
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildRoleDeleteLog(role: Role): ContainerBuilder {
    return createContainer(SeleneTheme.colors.red)
        .addTextDisplayComponents(createHeader('🏷️ ロール削除'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(`**ロール:** ${role.name}`),
        )
        .addTextDisplayComponents(createText(timestamp()));
}
