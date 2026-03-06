import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    SectionBuilder,
    ThumbnailBuilder,
} from 'discord.js';
import {SeleneTheme} from '../../themes/selene.theme.js';
import {createContainer, createDivider, createHeader, createText} from '../base.builder.js';
import {formatCompactNumber} from '../../../utils/formatters.js';
import type {TikWmData} from '../../../embedfix/tiktok-types.js';

export interface TikTokViewResult {
    container: ContainerBuilder;
    files: AttachmentBuilder[];
}

export function buildTikTokView(data: TikWmData, originalUrl: string, videoBuffer?: Buffer | null): TikTokViewResult {
    const files: AttachmentBuilder[] = [];

    const container = createContainer(SeleneTheme.colors.tiktok)
        .addTextDisplayComponents(createHeader(SeleneTheme.prefixes.tiktok))
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    createText(`**${data.author.nickname}** @${data.author.unique_id}`),
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(data.author.avatar),
                ),
        )
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(createText(data.title));

    if (videoBuffer) {
        const filename = 'video.mp4';
        files.push(new AttachmentBuilder(videoBuffer, {name: filename}));
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(`attachment://${filename}`),
            ),
        );
    } else if (data.cover) {
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(data.cover),
            ),
        );
    }

    // Stats line
    container
        .addSeparatorComponents(createDivider())
        .addTextDisplayComponents(
            createText(
                `♡ ${formatCompactNumber(data.digg_count)}  ○ ${formatCompactNumber(data.comment_count)}  ↻ ${formatCompactNumber(data.share_count)}  ▷ ${formatCompactNumber(data.play_count)}`,
            ),
        );

    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('🔗 元の動画')
                .setURL(originalUrl),
        ),
    );

    return {container, files};
}
