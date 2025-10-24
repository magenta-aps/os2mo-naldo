import { gql } from "graphql-request"

gql`
  query GetParent($uuid: [UUID!], $currentDate: DateTime) {
    org_units(filter: { uuids: $uuid, from_date: $currentDate }) {
      objects {
        current(at: $currentDate) {
          parent(filter: { from_date: $currentDate }) {
            name
            uuid
          }
        }
      }
    }
  }

  query GetOrgUnitValidities($uuid: [UUID!]) {
    org_units(filter: { uuids: $uuid, from_date: null, to_date: null }) {
      objects {
        validities {
          validity {
            from
            to
          }
        }
      }
    }
  }
  query GetEngagementValidities($uuid: [UUID!]) {
    engagements(filter: { uuids: $uuid, from_date: null, to_date: null }) {
      objects {
        validities {
          validity {
            from
            to
          }
        }
      }
    }
  }
  query GetFacetValidities($uuid: [UUID!]) {
    facets(filter: { uuids: $uuid, from_date: null, to_date: null }) {
      objects {
        validities {
          validity {
            from
            to
          }
        }
      }
    }
  }
  query FacetsAndClasses(
    $currentDate: DateTime
    $orgUuid: [UUID!]
    $facetUserKeys: [String!]
  ) {
    facets(filter: { user_keys: $facetUserKeys }) {
      objects {
        validities {
          uuid
          user_key
          classes(
            filter: {
              from_date: $currentDate
              owner: { include_none: true, descendant: { uuids: $orgUuid } }
            }
          ) {
            name
            uuid
            user_key
          }
        }
      }
    }
  }
  query Facet($uuid: [UUID!], $fromDate: DateTime!) {
    facets(filter: { uuids: $uuid, from_date: $fromDate }) {
      objects {
        validities {
          uuid
          user_key
        }
      }
    }
  }
  query GetPrimaryClasses($primaryClass: String!, $fromDate: DateTime!) {
    facets(filter: { user_keys: ["primary_type"] }) {
      objects {
        validities {
          classes(
            filter: { user_keys: [$primaryClass, "non-primary"], from_date: $fromDate }
          ) {
            name
            uuid
            user_key
          }
          uuid
          user_key
        }
      }
    }
  }
`
