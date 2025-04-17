<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { watch } from "@tauri-apps/plugin-fs";
  import { onMount } from "svelte";

  onMount(() => {
    watch(
      "C:\\Src\\SevFoxie\\Any\\MeowFun\\config.json5",
      (event) => {
        console.log("app.log event", event);
      },
      {
        delayMs: 500,
      }
    );
  });
</script>
