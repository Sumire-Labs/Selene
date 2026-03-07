import type {Message, PartialMessage} from 'discord.js';
import type {ContainerBuilder, ReadonlyCollection, Snowflake} from 'discord.js';
import {
    SeleneTheme,
    createContainer, createDivider, createHeader, createText,
    truncateText, MAX_LOG_CONTENT_LENGTH, timestamp,
} from './shared.js';

export function buildMessageDeleteLog(message: Message | PartialMessage): ContainerBuilder {
    const content = message.content
        ? truncateText(message.content, MAX_LOG_CONTENT_LENGTH)
        : '*（内容を取得できません）*';

    return createContainer(SeleneTheme.colors.red)
        .addTextDisplayComponents(createHeader('🗑️ メッセージ削除'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**送信者:** <@${message.author?.id ?? 'unknown'}>\n` +
                `**チャンネル:** <#${message.channelId}>\n` +
                `**内容:**\n${content}`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildMessageEditLog(
    oldMessage: Message | PartialMessage,
    newMessage: Message | PartialMessage,
): ContainerBuilder {
    const oldContent = oldMessage.content
        ? truncateText(oldMessage.content, MAX_LOG_CONTENT_LENGTH)
        : '*（取得不可）*';
    const newContent = newMessage.content
        ? truncateText(newMessage.content, MAX_LOG_CONTENT_LENGTH)
        : '*（取得不可）*';

    return createContainer(SeleneTheme.colors.blue)
        .addTextDisplayComponents(createHeader('✏️ メッセージ編集'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**送信者:** <@${newMessage.author?.id ?? 'unknown'}>\n` +
                `**チャンネル:** <#${newMessage.channelId}>\n` +
                `**編集前:**\n${oldContent}\n` +
                `**編集後:**\n${newContent}`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}

export function buildMessageBulkDeleteLog(
    messages: ReadonlyCollection<Snowflake, Message | PartialMessage>,
    channelId: string,
): ContainerBuilder {
    return createContainer(SeleneTheme.colors.red)
        .addTextDisplayComponents(createHeader('🗑️ メッセージ一括削除'))
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `**チャンネル:** <#${channelId}>\n` +
                `**削除数:** ${messages.size}件`,
            ),
        )
        .addTextDisplayComponents(createText(timestamp()));
}
