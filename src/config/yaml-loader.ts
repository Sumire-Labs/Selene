import {readFileSync} from 'node:fs';
import {parse} from 'yaml';

export function loadYamlConfig(filePath: string): Record<string, unknown> {
    try {
        const raw = readFileSync(filePath, 'utf-8');
        const parsed: unknown = parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            throw new Error('Config file must contain a YAML object');
        }
        return parsed as Record<string, unknown>;
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            throw new Error(`Config file not found: ${filePath}`);
        }
        throw error;
    }
}
