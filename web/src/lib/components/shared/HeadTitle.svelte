<script lang="ts">
  import { _ } from "svelte-i18n"
  import { capital } from "$lib/util/translationUtils"
  import { page } from "$app/stores"
  import { graphQLClient } from "$lib/util/http"
  import { gql } from "graphql-request"
  import { EmployeeDocument, OrgUnitDocument } from "./query.generated"

  enum Title {
    ORGANISATION = "organisation",
    EMPLOYEE = "employee",
    INSIGHTS = "insights",
    ADMIN = "admin",
    AUDITLOG = "auditlog",
  }

  type TitleType = `${Title}`
  export let type: TitleType

  gql`
    query OrgUnit($uuid: [UUID!]) {
      org_units(filter: { uuids: $uuid }) {
        objects {
          validities {
            name
          }
        }
      }
    }

    query Employee($uuid: [UUID!]) {
      employees(filter: { uuids: $uuid }) {
        objects {
          validities {
            name
          }
        }
      }
    }
  `

  const fetchTitleName = async (uuid: string): Promise<String> => {
    switch (type) {
      case Title.ORGANISATION:
        return (await graphQLClient().request(OrgUnitDocument, { uuid: uuid }))
          .org_units.objects[0].validities[0].name

      case Title.EMPLOYEE:
        return (await graphQLClient().request(EmployeeDocument, { uuid: uuid }))
          .employees.objects[0].validities[0].name

      case Title.INSIGHTS:
        return capital($_("insights"))

      case Title.ADMIN:
        return capital($_("classifications"))

      case Title.AUDITLOG:
        return capital($_("auditlog"))

      default:
        throw TypeError("Wrong or no title type used")
    }
  }
</script>

<svelte:head>
  {#await fetchTitleName($page.params.uuid)}
    <title>... | OS2mo</title>
  {:then value}
    <title>{value} | OS2mo</title>
  {:catch}
    <title>OS2mo</title>
  {/await}
</svelte:head>
