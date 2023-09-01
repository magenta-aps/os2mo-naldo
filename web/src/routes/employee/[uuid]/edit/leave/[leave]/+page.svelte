<script lang="ts">
    import DateInput from "$lib/components/forms/shared/date_input.svelte";
    import Error from "$lib/components/alerts/error.svelte";
    import Select from "$lib/components/forms/shared/select.svelte";
    import { enhance } from "$app/forms";
    import type { SubmitFunction } from "./$types";
    import { goto } from "$app/navigation";
    import { base } from "$app/paths";
    import { success, error } from "$lib/stores/alert";
    import { graphQLClient } from "$lib/util/http";
    import { gql } from "graphql-request";
    import { page } from "$app/stores";
    import { date } from "$lib/stores/date";
    import { getClassesByFacetUserKey } from "$lib/util/get_classes";
    import { activeEmployeeTab } from "$lib/stores/tab";
    import Input from "$lib/components/forms/shared/input.svelte";




    let fromDate: string;
    let toDate: string;
    let leaveType: string;
    let engagementUuid: string;



    gql`query LeaveAndEmployee($uuid: [UUID!], $fromDate: DateTime) {
  employees(uuids: $uuid, from_date: $fromDate) {
    objects {
      name
      engagements {
        org_unit {
          name
        }
        job_function {
          name
        }
      }
      leaves {
        uuid
        validity {
          from
          to
        }
        leave_type {
          uuid
          user_key
        }
      }
    }
  }
}

mutation UpdateLeave($input: LeaveUpdateInput!) {
  leave_update(input: $input) {
    objects {
      person {
        name
      }
    }
  }
}

  `;


    const handler: SubmitFunction = () => async ({ result }) => {
        if (result.type === "success" && result.data) {
            try {
                const mutation = await graphQLClient().request(UpdateLeaveDocument, {
                    input: result.data
                });
                $success = {
                    message: `Orlov for ${mutation.leave_create.objects[0].employee[0].name} er blevet redigeret`,
                    uuid: $page.params.uuid,
                    type: "employee",
                    tab: $activeEmployeeTab
                };
            } catch (err) {
                console.error(err);
                $error = { message: err as string };
            }
        }
    };

    type EngagementTitleAndUuid = {
        uuid: string;
        job_function: { name: string };
        org_unit: { name: string }[];
    };

    const getEngagementTitlesAndUuid = (engagements: EngagementTitleAndUuid[]): { uuid: string; name: string }[] => {
        return engagements.map(engagement => ({
            "uuid": engagement.uuid,
            "name": engagement.job_function.name + ", " + engagement.org_unit[0].name
        }));
    }

</script>

{#await graphQLClient().request( LeaveAndEmployeeDocument, { uuid: $page.params.uuid, fromDate: $date })}
    <!-- TODO: Should have a skeleton for the loading stage -->
    Henter data...
{:then data}
    {@const leave = data.leaves[0].objects[0]}
    {@const facets = data.facets}
    {@const minDate = data.employees[0].objects[0].validity.from.split("T")[0]}
    {@const maxDate = data.employees[0].objects[0].validity?.to?.split("T")[0]}
    {@const engagements=data.employees[0].objects[0].engagements}

    <title>Rediger {leave?.employee[0].name} | OS2mo</title>

    <div class="flex align-center px-6 pt-6 pb-4">
        <h3 class="flex-1">Rediger {leave?.employee[0].name} </h3>
    </div>

    <div class="divider p-0 m-0 mb-4 w-full" />

    <form method="post" class="mx-6" use:enhance={handler}>
        <div class="w-1/2 min-w-fit bg-slate-100 rounded">
            <div class="p-8">
                <div class="flex flex-row gap-6">
                    <DateInput
                            bind:value={fromDate}
                            startValue={leave.validity.from
              ? leave.validity.from.split("T")[0]
              : null}
                            title="Startdato"
                            id="from"
                            min={minDate}
                            max={toDate ? toDate : maxDate}
                    />
                    <DateInput
                            bind:value={toDate}
                            startValue={leave.validity.to
              ? leave.validity.to.split("T")[0]
              : null}
                            title="Slutdato"
                            id="to"
                            min={fromDate ? fromDate : minDate}
                            max={maxDate}
                    />
                </div>
                <div class="flex flex-row gap-6">
                    <Select
                            bind:value={leaveType}
                            startValue={leave.leave_type[0].uuid}
                            title="Orlovstype"
                            id="leave-type-uuid"
                            iterable={getClassesByFacetUserKey(facets, "leave_type")}
                            required={true}
                    />
                    <Select
                            bind:value={engagementUuid}
                            title="Engagementer"
                            id="engagement-uuid"
                            startValue={leave.engagement_uuid[0].uuid}
                            iterable={getEngagementTitlesAndUuid(engagements)}
                            required={true}
                            extra_classes="basis-1/2"
                    />
                </div>
            </div>
        </div>
        <div class="flex py-6 gap-4">
            <button
                    type="submit"
                    class="btn btn-sm btn-primary rounded normal-case font-normal text-base text-base-100"
            >Rediger orlov</button>
            <button
                    type="button"
                    class="btn btn-sm btn-outline btn-primary rounded normal-case font-normal text-base"
                    on:click={() => goto(`${base}/employee/${$page.params.uuid}#${$activeEmployeeTab}`)}
            >
                Annullér
            </button>
        </div>
        <Error />
    </form>
{/await}
