<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { watch } from "@tauri-apps/plugin-fs";
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import { goto } from "$app/navigation";
</script>

<div class="flex flex-col items-center justify-center h-screen bg-background p-4">
  <div class="max-w-md w-full text-center space-y-6">
    <h1 class="text-3xl font-bold">日志监控工具</h1>
    
    <div class="p-6 bg-card rounded-lg shadow-sm border">
      <div class="text-4xl mb-4">📊</div>
      <p class="text-lg mb-6">欢迎使用日志监控工具</p>
      <p class="text-muted-foreground mb-8">实时监控、筛选和分析您的应用日志</p>
      
      <Button 
        variant="default" 
        class="px-8" 
        onclick={() => goto('/logger')}
      >
        前往日志控制台
      </Button>
    </div>
    
    <p class="text-sm text-muted-foreground">
      您可以在 <span class="font-semibold">/logger</span> 页面查看和管理所有日志
    </p>
  </div>
</div>