<script lang="ts">
  import { PHP_STATUS } from "@/config/versions";

  let selectedVersion = $state("");

  // Derived state: automatically updates when selectedVersion changes
  let info = $derived(
    selectedVersion
      ? PHP_STATUS[selectedVersion as keyof typeof PHP_STATUS]
      : null,
  );
</script>

<div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
  <div class="flex items-center gap-3 mb-4">
    <div class="p-2 bg-blue-100 rounded-lg text-blue-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        ><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg
      >
    </div>
    <h3 class="font-bold text-slate-900">PHP Health Check</h3>
  </div>

  <select
    bind:value={selectedVersion}
    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select Version</option>
    {#each Object.keys(PHP_STATUS) as v}
      <option value={v}>PHP {v}</option>
    {/each}
  </select>

  {#if info}
    <div class="mt-6 pt-6 border-t border-slate-100 space-y-3 transition-all">
      <div class="flex justify-between items-center">
        <span
          class="text-xs font-bold text-slate-400 uppercase tracking-tighter"
          >Support Status</span
        >
        <span class="text-xs font-black uppercase {info.color}"
          >{info.status}</span
        >
      </div>

      <div class="flex justify-between items-center">
        <span
          class="text-xs font-bold text-slate-400 uppercase tracking-tighter"
          >Initial Release</span
        >
        <span class="text-sm font-mono font-bold">{info.initialRelease}</span>
      </div>

      <div class="flex justify-between items-center">
        <span
          class="text-xs font-bold text-slate-400 uppercase tracking-tighter"
          >Active Until</span
        >
        <span class="text-sm font-mono font-bold">{info.activeUntil}</span>
      </div>

      <div class="flex justify-between items-center">
        <span
          class="text-xs font-bold text-slate-400 uppercase tracking-tighter"
          >Security Until</span
        >
        <span class="text-sm font-mono font-bold">{info.securityUntil}</span>
      </div>

      {#if info.status === "eol"}
        <div
          class="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 text-[11px] text-red-700 font-medium"
        >
          ⚠️ <strong>EOL:</strong> This version is no longer receiving security
          updates.
        </div>
      {/if}
    </div>
  {/if}
</div>
