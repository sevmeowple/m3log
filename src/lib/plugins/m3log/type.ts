interface BaseLog {
    tags: string[];
    content: string;
}

/**
 * Log interface for the M3Log plugin.
 * 完整的日志接口
 * @property {string[]} tags - The tags associated with the log.
 * @property {string} content - The content of the log.
 * @property {string} [time] - The time when the log was created,采用ISO8601格式
 * @property {string} [level] - The level of the log, such as "info", "warn", "error", etc.
 * @example @2023-04-01T15:30:45Z [user auth login] #INFO: 用户成功登录，ID=12345
 * {
 *      "tags": ["user", "auth", "login"],
 *      "content": "用户成功登录，ID=12345",
 *      "time": "2023-04-01T15:30:45Z",
 *      "level": "INFO"
 * }
 */
interface Log extends BaseLog {
    time?: string;
    level?: string;
}

export type { BaseLog, Log };