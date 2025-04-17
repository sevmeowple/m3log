/** 
 * @description m3log协议工具插件
*/

import type { Log, BaseLog } from "./type";

class M3Log {
    /**
     * 将m3log格式的字符串解析为Log接口对象
     * @param log m3log格式的日志字符串
     * @returns 解析后的Log对象
     * @throws 当日志格式不正确时抛出错误
     * @example
     * const logger = new M3Log();
     * const logObj = logger.toInterface("@2023-04-01T15:30:45Z [user,auth,login] #INFO: 用户成功登录，ID=12345");
     */
    toInterface(log: string): Log {
        const regex = /@(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) \[(.*?)\] #(\w+): (.*)/;
        const match = log.match(regex);
        if (!match) {
            throw new Error("Invalid log format");
        }
        const [_, time, tags, level, content] = match;
        return {
            time,
            tags: tags.split(",").map(tag => tag.trim()),
            level,
            content
        };
    }

    /**
     * 将Log对象转换为m3log格式的字符串
     * @param log Log对象
     * @returns m3log格式的日志字符串
     */
    fromInterface(log: Log): string {
        const timeStr = log.time || new Date().toISOString();
        const tagsStr = log.tags.join(", ");
        const levelStr = log.level || "INFO";

        return `@${timeStr} [${tagsStr}] #${levelStr}: ${log.content}`;
    }

    /**
     * 创建一个新的日志对象
     * @param content 日志内容
     * @param tags 日志标签
     * @param level 日志级别，默认为"INFO"
     * @returns 创建的Log对象
     */
    createLog(content: string, tags: string[] = [], level: string = "INFO"): Log {
        return {
            time: new Date().toISOString(),
            tags,
            level,
            content
        };
    }

    /**
     * 验证日志字符串是否符合m3log格式
     * @param log 要验证的日志字符串
     * @returns 是否符合m3log格式
     */
    isValidLogFormat(log: string): boolean {
        const regex = /@(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) \[(.*?)\] #(\w+): (.*)/;
        return regex.test(log);
    }
}

const M3LogPlugin = new M3Log();
export { M3LogPlugin };