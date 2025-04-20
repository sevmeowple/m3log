<script lang="ts">
  import { LoggerPlugin } from "$lib/plugins/logger/index.svelte";
  import type { Log } from "$lib/plugins/m3log/type";
  import { onMount, onDestroy } from "svelte";
  import { Toaster } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Select from "$lib/components/ui/select/index.js";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { Badge } from "$lib/components/ui/badge";

  // let watchPath = "C:\\Your\\Log\\Path"; // 默认日志路径
  let searchQuery = "";
  let selectedLevel = "";

  // 新增：定义内容展开状态和最大显示字符数
  const MAX_CONTENT_LENGTH = 200;
  let expandedLogs = new Map<string, boolean>();

  // 切换日志展开状态的函数
  function toggleExpand(logId: string) {
    expandedLogs.set(logId, !expandedLogs.get(logId));
    expandedLogs = expandedLogs; // 触发响应式更新
  }

  onMount(() => {
    LoggerPlugin.setWatchPath(LoggerPlugin.watchPath);
  });

  // onDestroy(async () => {
  //   await LoggerPlugin.stopWatching();
  // });

  function handlePathChange() {
    LoggerPlugin.setWatchPath(LoggerPlugin.watchPath);
  }

  function handleSearchChange() {
    LoggerPlugin.setSearchQuery(searchQuery);
  }

  function handleLevelChange(value: string) {
    selectedLevel = value;
    LoggerPlugin.setLevelFilter(value);
  }

  async function toggleWatching() {
    if (LoggerPlugin.isWatching) {
      await LoggerPlugin.stopWatching();
    } else {
      await LoggerPlugin.startWatching();
    }
  }
</script>

<Toaster />

<div class="flex flex-col h-full container mx-auto py-4">
  <Card>
    <CardHeader>
      <CardTitle class="text-xl">日志监控面板</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="flex flex-col md:flex-row gap-4 items-end w-full mb-4">
        <div class="flex-1">
          <label for="path" class="text-sm font-medium mb-1 block"
            >日志路径</label
          >
          <Input
            id="path"
            type="text"
            bind:value={LoggerPlugin.watchPath}
            onchange={handlePathChange}
            placeholder="日志文件或目录路径"
          />
        </div>

        <div class="flex gap-2">
          <Button
            variant={LoggerPlugin.isWatching ? "destructive" : "default"}
            onclick={toggleWatching}
          >
            {LoggerPlugin.isWatching ? "停止监听" : "开始监听"}
          </Button>

          <Button variant="outline" onclick={() => LoggerPlugin.clearLogs()}>
            清空日志
          </Button>
        </div>
      </div>

      <Separator class="my-4" />

      <div class="flex gap-4 mb-4 items-end">
        <div class="w-48">
          <label for="level" class="text-sm font-medium mb-1 block"
            >日志级别</label
          >

          <Select.Root
            type="single"
            bind:value={selectedLevel}
            onValueChange={handleLevelChange}
          >
            <Select.Trigger id="level" class="w-full">
              {selectedLevel || "所有级别"}
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.GroupHeading>日志级别</Select.GroupHeading>
                <Select.Item value="" label="所有级别">所有级别</Select.Item>
                {#each LoggerPlugin.getAllLevels() as level (level)}
                  <Select.Item value={level} label={level}>{level}</Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </div>

        <div class="flex-1">
          <label for="search" class="text-sm font-medium mb-1 block"
            >搜索日志</label
          >
          <Input
            id="search"
            type="text"
            bind:value={searchQuery}
            oninput={handleSearchChange}
            placeholder="搜索日志内容或标签..."
          />
        </div>
      </div>
    </CardContent>
  </Card>

  <div class="mt-4 flex-1 overflow-hidden">
    <Card class="h-full flex flex-col">
      <CardHeader class="py-3">
        <CardTitle class="text-lg">日志记录</CardTitle>
      </CardHeader>
      <CardContent class="flex-1 overflow-y-auto p-0">
        {#if LoggerPlugin.displayLogs.length === 0}
          <div
            class="flex items-center justify-center h-40 text-muted-foreground italic"
          >
            暂无日志记录
          </div>
        {:else}
          <div class="divide-y">
            {#each LoggerPlugin.displayLogs as log, index}
              <div
                class="p-4 hover:bg-muted/50 transition-colors"
                class:bg-red-50={log.level === "ERROR"}
                class:bg-amber-50={log.level === "WARN"}
                class:bg-blue-50={log.level === "INFO"}
                class:bg-green-50={log.level === "DEBUG"}
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="text-sm text-muted-foreground">{log.time}</div>
                  <Badge
                    variant={log.level === "ERROR"
                      ? "destructive"
                      : log.level === "WARN"
                        ? "secondary"
                        : log.level === "INFO"
                          ? "default"
                          : log.level === "DEBUG"
                            ? "outline"
                            : "secondary"}
                  >
                    {log.level}
                  </Badge>
                </div>

                <div class="mb-2 flex flex-wrap gap-1">
                  {#each log.tags as tag}
                    <Badge variant="secondary" class="text-xs">{tag}</Badge>
                  {/each}
                </div>

                <div class="text-sm mt-2">
                  {#if log.content.length > MAX_CONTENT_LENGTH && !expandedLogs.get(`log-${index}`)}
                    {log.content.substring(0, MAX_CONTENT_LENGTH)}...
                    <Badge
                      variant="outline"
                      class="text-xs ml-1 cursor-pointer hover:bg-primary/10"
                      onclick={() => toggleExpand(`log-${index}`)}
                    >
                      展开
                    </Badge>
                  {:else}
                    {log.content}
                    {#if log.content.length > MAX_CONTENT_LENGTH}
                      <Badge
                        variant="outline"
                        class="text-xs ml-1 cursor-pointer hover:bg-primary/10"
                        onclick={() => toggleExpand(`log-${index}`)}
                      >
                        收起
                      </Badge>
                    {/if}
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>
</div>
