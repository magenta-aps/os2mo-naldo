<script lang="ts">
  import { base } from "$app/paths"
  import { page } from "$app/stores"

  enum Form {
    CREATE = "create",
    RENAME = "rename",
    MOVE = "move",
    TERMINATE = "terminate",
  }
</script>

<div class="navbar bg-primary min-h-8 h-8 py-5 text-base-100">
  <div class="flex-1">
    <a
      href={`${base}/organisation/${Form.CREATE}${
        $page.params.uuid ? `#${$page.params.uuid}` : ""
      }`}
      class="btn btn-sm btn-primary text-base-100 hover:no-underline normal-case font-normal"
    >
      <span class="inline-block align-middle pr-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          ><path
            d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z"
          /></svg
        >
      </span>
      <p class="text-base-100">Opret enhed</p>
    </a>
    <a
      href={`${base}/organisation/${Form.RENAME}${
        $page.params.uuid ? `#${$page.params.uuid}` : ""
      }`}
      class="btn btn-sm btn-primary text-base-100 hover:no-underline normal-case font-normal"
    >
      <span class="inline-block align-middle pr-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          ><path
            d="M8.424 12.282l4.402 4.399-5.826 1.319 1.424-5.718zm15.576-6.748l-9.689 9.804-4.536-4.536 9.689-9.802 4.536 4.534zm-6 8.916v6.55h-16v-12h6.743l1.978-2h-10.721v16h20v-10.573l-2 2.023z"
          /></svg
        >
      </span>
      <p class="text-base-100">Omdøb enhed</p>
    </a>
    <a
      href={`${base}/organisation/${Form.MOVE}${
        $page.params.uuid ? `#${$page.params.uuid}` : ""
      }`}
      class="btn btn-sm btn-primary text-base-100 hover:no-underline normal-case font-normal"
    >
      <span class="inline-block align-middle pr-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="18"
          viewBox="0 0 512 512"
          fill="currentColor"
          ><path
            d="M32 160h319.9l.0791 72c0 9.547 5.652 18.19 14.41 22c8.754 3.812 18.93 2.078 25.93-4.406l112-104c10.24-9.5 10.24-25.69 0-35.19l-112-104c-6.992-6.484-17.17-8.217-25.93-4.408c-8.758 3.816-14.41 12.46-14.41 22L351.9 96H32C14.31 96 0 110.3 0 127.1S14.31 160 32 160zM480 352H160.1L160 279.1c0-9.547-5.652-18.19-14.41-22C136.9 254.2 126.7 255.9 119.7 262.4l-112 104c-10.24 9.5-10.24 25.69 0 35.19l112 104c6.992 6.484 17.17 8.219 25.93 4.406C154.4 506.2 160 497.5 160 488L160.1 416H480c17.69 0 32-14.31 32-32S497.7 352 480 352z"
          /></svg
        >
      </span>
      <p class="text-base-100">Flyt enhed</p>
    </a>
    <a
      href={`${base}/organisation/${Form.TERMINATE}${
        $page.params.uuid ? `#${$page.params.uuid}` : ""
      }`}
      class="btn btn-sm btn-primary text-base-100 hover:no-underline normal-case font-normal"
    >
      <span class="inline-block align-middle pr-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          ><path
            d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 16.538l-4.592-4.548 4.546-4.587-1.416-1.403-4.545 4.589-4.588-4.543-1.405 1.405 4.593 4.552-4.547 4.592 1.405 1.405 4.555-4.596 4.591 4.55 1.403-1.416z"
          /></svg
        >
      </span>
      <p class="text-base-100">Afslut enhed</p>
    </a>
  </div>
</div>
