import {AuditLogEvent, type ContainerBuilder} from 'discord.js';
import {SeleneTheme, createContainer, createDivider, createHeader, createText, timestamp} from './shared.js';

export function buildWebhookLog(
    channelId: string,
    auditAction: AuditLogEvent,
): ContainerBuilder {
    let title: string;
    let color: number;

    switch (auditAction) {
        case AuditLogEvent.WebhookCreate:
            title = '🔗 Webhook作成';
            color = SeleneTheme.colors.blue;
            break;
        case AuditLogEvent.WebhookUpdate:
            title = '🔗 Webhook更新';
            color = SeleneTheme.colors.blue;
            break;
        case AuditLogEvent.WebhookDelete:
            title = '🔗 Webhook削除';
            color = SeleneTheme.colors.red;
            break;
        default:
            title = '🔗 Webhook変更';
            color = SeleneTheme.colors.blue;
    }

    return createContainer(color)
        .addTextDisplayComponents(createHeader(title))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(`**チャンネル:** <#${channelId}>`),
        )
        .addTextDisplayComponents(createText(timestamp()));
}
