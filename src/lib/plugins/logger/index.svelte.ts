/**
 * @description 该logger插件依赖于m3log协议及其解析器
 */

import { M3LogPlugin } from "../m3log";
import type { Log } from "../m3log/type";
import { watch, readTextFile, exists, readDir } from "@tauri-apps/plugin-fs";
import type {
    UnwatchFn, WatchEvent, DirEntry
} from "@tauri-apps/plugin-fs";
import { toast } from "svelte-sonner";

class Logger {
    logs: Log[] = [];
    displayLogs: Log[] = $state([]);
    watchPath: string = $state("");
    isWatching: boolean = $state(false);
    unwatchFn: UnwatchFn | null = null;
    
    // 过滤器状态
    private _searchQuery: string = "";
    private _selectedLevel: string = "";
    private _selectedTags: string[] = [];

    /**
     * 设置搜索查询
     */
    setSearchQuery(query: string) {
        this._searchQuery = query;
        this.applyFilters();
    }

    /**
     * 设置级别过滤器
     */
    setLevelFilter(level: string) {
        this._selectedLevel = level;
        this.applyFilters();
    }

    /**
     * 设置标签过滤器
     */
    setTagsFilter(tags: string[]) {
        this._selectedTags = [...tags];
        this.applyFilters();
    }

    /**
     * 应用所有过滤器并更新显示日志
     */
    private applyFilters() {
        // 开始时使用所有日志
        let filtered = [...this.logs];

        // 应用级别过滤
        if (this._selectedLevel) {
            filtered = filtered.filter(log => log.level === this._selectedLevel);
        }

        // 应用标签过滤
        if (this._selectedTags.length > 0) {
            filtered = filtered.filter(log => 
                this._selectedTags.some(tag => log.tags.includes(tag))
            );
        }

        // 应用搜索查询
        if (this._searchQuery) {
            const lowerQuery = this._searchQuery.toLowerCase();
            filtered = filtered.filter(log => 
                log.content.toLowerCase().includes(lowerQuery) ||
                log.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
        }

        // 更新显示的日志
        this.displayLogs = filtered;
    }

    /**
     * 获取所有可用标签
     */
    getAllTags() {
        const tagsSet = new Set<string>();
        
        for (const log of this.logs) {
            for (const tag of log.tags) {
                tagsSet.add(tag);
            }
        }
        
        return Array.from(tagsSet).sort();
    }

    /**
     * 获取所有可用级别
     */
    getAllLevels() {
        const levelsSet = new Set<string>();
        
        for (const log of this.logs) {
            if (log.level) {
                levelsSet.add(log.level);
            }
        }
        
        return Array.from(levelsSet).sort();
    }

    /**
     * 设置监听路径
     * @param path 日志文件或目录路径
     */
    setWatchPath(path: string) {
        this.watchPath = path;
    }

    /**
     * 开始监听日志文件或目录
     */
    async startWatching() {
        if (!this.watchPath) {
            toast.error("请先设置监听路径");
            return;
        }

        if (this.isWatching) {
            toast.info("已在监听中");
            return;
        }

        try {
            // 先尝试读取现有内容
            await this.loadExistingLogs();

            // 开始监听文件变化
            this.unwatchFn = await watch(
                this.watchPath,
                async (event) => {
                    // 检查事件类型并处理文件
                    const eventType = event.type;
                    if (
                        eventType === 'any' ||
                        (typeof eventType === 'object' &&
                            ('modify' in eventType || 'create' in eventType))
                    ) {
                        await this.processLogFile(event.paths[0]);
                    }
                },
                {
                    recursive: true,
                    delayMs: 500,
                }
            );

            this.isWatching = true;
            toast.success("开始监听日志");
        } catch (error) {
            toast.error(`监听失败: ${error}`);
            console.error("监听错误:", error);
        }
    }

    /**
     * 停止监听
     */
    async stopWatching() {
        if (!this.isWatching || !this.unwatchFn) {
            return;
        }

        await this.unwatchFn();
        this.unwatchFn = null;
        this.isWatching = false;
        toast.info("已停止监听");
    }

    /**
     * 加载已存在的日志文件内容
     */
    async loadExistingLogs() {
        try {
            // 首先检查路径是否存在
            const pathExists = await exists(this.watchPath);
            if (!pathExists) {
                console.log("路径不存在:", this.watchPath);
                return;
            }

            // 尝试读取文件信息
            try {
                // 如果是单个文件
                const content = await readTextFile(this.watchPath);
                this.parseAndAddLogs(content);
                console.log("已加载现有日志文件");
            } catch (fileError) {
                // 如果不是文件，尝试作为目录读取
                try {
                    const entries = await readDir(this.watchPath);
                    await this.processLogDirectory(entries);
                    console.log("已加载日志目录中的文件");
                } catch (dirError) {
                    console.error("无法读取路径(既不是文件也不是目录):", dirError);
                }
            }
        } catch (error) {
            console.error("加载现有日志失败:", error);
        }
    }

    /**
     * 递归处理日志目录
     */
    async processLogDirectory(entries: DirEntry[]) {
        for (const entry of entries) {
            const entryPath = `${this.watchPath}/${entry.name}`;
            
            if (entry.isDirectory) {
                // 递归处理子目录
                try {
                    const subEntries = await readDir(entryPath);
                    await this.processLogDirectory(subEntries);
                } catch (error) {
                    console.error(`读取子目录 ${entryPath} 失败:`, error);
                }
            } else if (entry.isFile) {
                // 处理单个日志文件
                if (entry.name.endsWith('.log') || entry.name.endsWith('.txt')) {
                    await this.processLogFile(entryPath);
                }
            }
        }
    }

    /**
     * 处理单个日志文件
     */
    async processLogFile(filePath: string) {
        try {
            // 只处理可能包含日志的文件
            if (filePath.endsWith('.log') || filePath.endsWith('.txt')) {
                const content = await readTextFile(filePath);
                this.parseAndAddLogs(content);
            }
        } catch (error) {
            console.error(`处理日志文件 ${filePath} 失败:`, error);
        }
    }

    /**
     * 解析日志内容并添加到日志列表
     */
    parseAndAddLogs(content: string) {
        const lines = content.split(/\r?\n/);
        
        for (const line of lines) {
            if (!line.trim()) continue;

            try {
                if (M3LogPlugin.isValidLogFormat(line)) {
                    const logObj = M3LogPlugin.toInterface(line);
                    this.addLog(logObj);
                }
            } catch (error) {
                console.warn(`解析日志行失败: ${line}`, error);
            }
        }
    }

    /**
     * 添加日志到列表，避免重复
     */
    addLog(log: Log) {
        // 简单去重检查 (基于时间和内容的组合)
        const logKey = `${log.time}-${log.content}`;
        const exists = this.logs.some(existingLog =>
            `${existingLog.time}-${existingLog.content}` === logKey
        );

        if (!exists) {
            this.logs = [...this.logs, log];
            // 重新应用过滤器更新显示
            this.applyFilters();
        }
    }

    /**
     * 清空日志列表
     */
    clearLogs() {
        this.logs = [];
        this.displayLogs = [];
        toast.info("已清空日志");
    }
}

// 导出单例实例
const LoggerPlugin = new Logger();
export { LoggerPlugin };