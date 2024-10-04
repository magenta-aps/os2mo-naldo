<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { step } from "$lib/stores/stepStore"
  import Error from "$lib/components/alerts/Error.svelte"
  import Input from "$lib/components/forms/shared/Input.svelte"
  import { form, field } from "svelte-forms"
  import { required, pattern } from "svelte-forms/validators"
  import CprLookup from "$lib/components/CPRLookup.svelte"
  import CPRInput from "$lib/components/brugeropret/CPRInput.svelte"
  import { graphQLClient } from "$lib/util/http"
  import { GetSpConfigDocument } from "./query.generated"
  import { gql } from "graphql-request"
  import Skeleton from "$lib/components/forms/shared/Skeleton.svelte"
  import { employeeInfo } from "$lib/stores/employeeInfoStore"
  import { engagementInfo } from "$lib/stores/engagementInfoStore"
  import { ituserInfo } from "$lib/stores/ituserInfoStore"
  import { managerInfo } from "$lib/stores/managerInfoStore"
  import { addressInfo } from "$lib/stores/addressInfoStore"
  import EmployeeSummary from "$lib/components/brugeropret/EmployeeSummary.svelte"
  import EngagementSummary from "$lib/components/brugeropret/EngagementSummary.svelte"
  import ItUserSummary from "$lib/components/brugeropret/ItUserSummary.svelte"
  import ManagerSummary from "$lib/components/brugeropret/ManagerSummary.svelte"
  import AddressSummary from "$lib/components/brugeropret/AddressSummary.svelte"
</script>

<div class="sm:w-full md:w-3/4 xl:w-1/2 bg-slate-100 rounded">
  <div class="p-8 space-y-5">
    <EmployeeSummary />
    <EngagementSummary />
    <ItUserSummary />
    <ManagerSummary />
    <AddressSummary />
  </div>
</div>
