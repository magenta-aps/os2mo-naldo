<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import DateInput from "$lib/components/forms/shared/DateInput.svelte"
  import Button from "$lib/components/shared/Button.svelte"
  import Error from "$lib/components/alerts/Error.svelte"
  import { enhance } from "$app/forms"
  import type { SubmitFunction } from "./$types"
  import { base } from "$app/paths"
  import { success, error } from "$lib/stores/alert"
  import { graphQLClient } from "$lib/util/http"
  import { EngagementDocument, TerminateEngagementDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import { page } from "$app/stores"
  import { date } from "$lib/stores/date"
  import { form, field } from "svelte-forms"
  import { required } from "svelte-forms/validators"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { getMinMaxValidities } from "$lib/util/helpers"

  const toDate = field("to", "", [required()])
  const svelteForm = form(toDate)

  function harlem() {
        function setup() {
        const e = document.createElement("link");
        e.setAttribute("type", "text/css");
        e.setAttribute("rel", "stylesheet");
        e.setAttribute("href", "/src/lib/assets/harlem-shake-style.css");
        e.setAttribute("class", "mw_added_css");
        document.body.appendChild(e)
    }
    function strobeLight() {
        var e = document.createElement("div");
        e.setAttribute("class", "mw-strobe_light");
        document.body.appendChild(e);
        setTimeout(function () {
            document.body.removeChild(e)
        }, 100)
    }
    function hasGoodSize(i) {
        var s = { height: i.offsetHeight, width: i.offsetWidth }
        return s.height > e && s.height < n && s.width > t && s.width < r
    }
    function elmOffset(e) {
        var t = e;
        var n = 0;
        while ( !! t) {
            n += t.offsetTop;
            t = t.offsetParent
        }
        return n
    }
    function bottomHeight() {
        var e = document.documentElement;
        if ( !! window.innerWidth) {
            return window.innerHeight }
        else if (e && !isNaN(e.clientHeight)) {
            return e.clientHeight
        }
        return 0
    }
    function isVisible(e) {
        const t = elmOffset(e);
        return t >= window.pageYOffset && t <= bottomHeight() + window.pageYOffset
    }
    function run() {
        var e = document.createElement("audio");
        e.setAttribute("class", "mw_added_css");
        e.src = "https://github.com/moovweb/harlem_shaker/raw/refs/heads/master/harlem-shake.mp3";
        e.loop = false;
        e.addEventListener("canplay", function () {
            setTimeout(function () {
                startingElm.classList.add("mw-harlem_shake_me", "im_first");
            }, 500);
            setTimeout(function () {
                cleanup();
                strobeLight();
                [...document.getElementsByTagName("*")]
                    .filter(hasGoodSize)
                    .forEach(element => {
                        shakeElm(element);
                    })
            }, 15500)
        }, true);
        e.addEventListener("ended", function () {
            cleanup();
            [...document.body.getElementsByClassName("mw_added_css")].forEach(element => {
                document.body.removeChild(element)
            });
        }, true);
        document.body.appendChild(e);
        e.play()
    }
    function shakeElm(e) {
        const u = ["im_drunk", "im_baked", "im_trippin", "im_blown"];
        e.classList.add("mw-harlem_shake_me", u[Math.floor(Math.random() * u.length)]);
    }
    function cleanup() {
        [...document.getElementsByClassName("mw-harlem_shake_me")].forEach(element => {
            element.classList.remove("mw-harlem_shake_me")
        });
    }
    // min+max element width / height (plus)
    const e = 20,
        n = 350,
        t = 20,
        r = 350,
        startingElm = [...document.getElementsByTagName("*")]
            .filter(elm => hasGoodSize(elm) && isVisible(elm))[0];
    setup();
    run();
  }

  gql`
    query Engagement($uuid: [UUID!]) {
      engagements(filter: { uuids: $uuid, from_date: null, to_date: null }) {
        objects {
          validities {
            validity {
              from
              to
            }
            person(filter: { from_date: null, to_date: null }) {
              validity {
                from
                to
              }
            }
          }
        }
      }
    }

    mutation TerminateEngagement($input: EngagementTerminateInput!, $date: DateTime!) {
      engagement_terminate(input: $input) {
        current(at: $date) {
          person {
            name
          }
        }
      }
    }
  `
  const handler: SubmitFunction =
    () =>
    async ({ result }) => {
      // Await the validation, before we continue
      await svelteForm.validate()
      if ($svelteForm.valid) {
        if (result.type === "success" && result.data) {
          try {
            const mutation = await graphQLClient().request(
              TerminateEngagementDocument,
              {
                input: result.data,
                date: result.data.to,
              }
            )

            $success = {
              message: capital(
                $_("success_terminate_item", {
                  values: {
                    item: $_("engagement", { values: { n: 0 } }),
                    name: mutation.engagement_terminate.current?.person?.[0].name,
                  },
                })
              ),
              uuid: $page.params.uuid,
              type: "employee",
            }

            harlem()
          } catch (err) {
            $error = { message: err }
          }
        }
      }
    }
</script>

<title
  >{capital(
    $_("terminate_item", {
      values: { item: $_("engagement", { values: { n: 1 } }) },
    })
  )} | OS2mo</title
>

<div class="flex align-center px-6 pt-6 pb-4">
  <h3 class="flex-1">
    {capital(
      $_("terminate_item", {
        values: { item: $_("engagement", { values: { n: 1 } }) },
      })
    )}
  </h3>
</div>

<div class="divider p-0 m-0 mb-4 w-full" />

{#await graphQLClient().request(EngagementDocument, { uuid: $page.params.engagement })}
  <div class="mx-6">
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <Skeleton />
      </div>
    </div>
  </div>
{:then data}
  {@const engagementValidities = getMinMaxValidities(
    data.engagements.objects[0].validities
  )}
  {@const validities = getMinMaxValidities(
    data.engagements.objects[0].validities[0].person
  )}
  <form method="post" class="mx-6" use:enhance={handler}>
    <div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
      <div class="p-8">
        <DateInput
          startValue={$date}
          bind:value={$toDate.value}
          errors={$toDate.errors}
          title={capital($_("date.end_date"))}
          id="to"
          min={engagementValidities.from}
          max={validities.to}
          required={true}
        />
      </div>
    </div>
    <div class="flex py-6 gap-4">
      <Button
        type="submit"
        title={capital(
          $_("terminate_item", {
            values: { item: $_("engagement", { values: { n: 1 } }) },
          })
        )}
      />
      <Button
        type="button"
        title={capital($_("cancel"))}
        outline={true}
        href="{base}/employee/{$page.params.uuid}"
      />
    </div>
    <Error />
  </form>
{/await}
