<script lang="ts">
  import { onMount } from "svelte"

  let quote = ""

  onMount(async () => {
    let fullUrl = "https://shrekofficial.com/quotes/random"
    fetch(fullUrl)
    .then(response => response.text())
    .then(data => {
      console.log(data)
      quote = data
    })
  })
</script>

<style>
.fixed-background-text {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg); /* Center and rotate */
  font-size: 8em;
  color: rgba(150, 150, 150, 0.8);
  z-index: 0; /* Behind the main content but above the default body background */
  pointer-events: none;
  user-select: none;
}
</style>

<div class="fixed-background-text text-black" style="font-size: 11px">{quote}</div>
