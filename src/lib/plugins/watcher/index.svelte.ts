import { watch } from "@tauri-apps/plugin-fs";
import type { DebouncedWatchOptions, WatchOptions, UnwatchFn, WatchEvent } from "@tauri-apps/plugin-fs";

class Watcher {
    item = $state("");
    unwatch: UnwatchFn | null = null;
    defaultfunction = (event: WatchEvent) => {
        console.log(event);
    }
    async startWatch(func: (event: WatchEvent) => void = this.defaultfunction) {
        this.unwatch = await watch(
            this.item,
            (event) => {
                func(event);
            },
            {
                recursive: true,
                delayMs: 1000,
            }
        )
    }

    async stopWatch() {
        if (this.unwatch) {
            await this.unwatch();
            this.unwatch = null;
        }
    }
}

const WatcherPlugin = new Watcher();

export { WatcherPlugin };