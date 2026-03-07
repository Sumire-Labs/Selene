export {SeleneTheme} from '../../../themes/selene.theme.js';
export {createContainer, createDivider, createHeader, createText} from '../../base.builder.js';
export {truncateText} from '../../../../utils/formatters.js';
export {MAX_LOG_CONTENT_LENGTH} from '../../../../config/constants.js';

export function timestamp(): string {
    const now = new Date();
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `-# ${y}-${mo}-${d} ${h}:${mi}:${s}`;
}
