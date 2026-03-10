import { gql } from "graphql-request"

gql`
  query GetParent($uuid: [UUID!], $currentDate: DateTime) {
    org_units(filter: { uuids: $uuid, from_date: $currentDate }) {
      objects {
        current(at: $currentDate) {
          parent_response {
            uuid
            current(at: $currentDate) {
              name
            }
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
  query GetPersonValidities($uuid: [UUID!]) {
    employees(filter: { uuids: $uuid, from_date: null, to_date: null }) {
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
  query GetItuserValidities($uuid: [UUID!]) {
    itusers(filter: { uuids: $uuid, from_date: null, to_date: null }) {
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
          classes_responses(
            filter: {
              from_date: $currentDate
              owner: {
                include_none: true
                descendant: { uuids: $orgUuid, from_date: $currentDate }
                from_date: $currentDate
              }
            }
          ) {
            objects {
              uuid
              current(at: $currentDate) {
                name
                user_key
                scope
              }
            }
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
          classes_responses(
            filter: { user_keys: [$primaryClass, "non-primary"], from_date: $fromDate }
          ) {
            objects {
              uuid
              current(at: $fromDate) {
                name
                user_key
              }
            }
          }
          uuid
          user_key
        }
      }
    }
  }
  query GetRoleClasses($itSystem: UUID!, $fromDate: DateTime!) {
    facets(filter: { user_keys: ["role"] }) {
      objects {
        validities {
          classes_responses(
            filter: { it_system: { uuids: [$itSystem] }, from_date: $fromDate }
          ) {
            objects {
              uuid
              current(at: $fromDate) {
                name
                user_key
              }
            }
          }
          uuid
          user_key
        }
      }
    }
  }
  query Auditlog($uuid: [UUID!]) {
    registrations(filter: { uuids: $uuid, start: null, end: null }) {
      objects {
        actor_object {
          ... on SpecialActor {
            display_name
            uuid
          }
          ... on UnknownActor {
            display_name
            uuid
          }
        }
        uuid
        start
        end
        note
        ... on OrganisationUnitRegistration {
          validities(start: null, end: null) {
            name
            user_key
            unit_type_response {
              uuid
              current {
                name
              }
            }
            unit_level_response {
              uuid
              current {
                name
              }
            }
            parent_response {
              uuid
              current {
                name
              }
            }
            time_planning_response {
              uuid
              current {
                name
              }
            }
            validity {
              from
              to
            }
          }
        }
        ... on AddressRegistration {
          validities(start: null, end: null) {
            address_type_response {
              uuid
              current {
                name
              }
            }
            address: resolve {
              ... on DefaultAddress {
                __typename
                value
              }
              ... on DARAddress {
                name
              }
            }
            description: user_key
            visibility_response {
              uuid
              current {
                name
              }
            }
            validity {
              from
              to
            }
          }
        }
        ... on AssociationRegistration {
          validities(start: null, end: null) {
            association_person: person_response {
              uuid
              current {
                name
              }
            }
            association_type_response {
              uuid
              current {
                name
              }
            }

            org_unit_response {
              uuid
              current {
                name
              }
            }
            primary_response {
              uuid
              current {
                name
              }
            }
            substitute_response {
              uuid
              current {
                name
              }
            }
            trade_union_response {
              uuid
              current {
                name
              }
            }
            validity {
              from
              to
            }
          }
        }
        ... on PersonRegistration {
          validities(start: null, end: null) {
            given_name
            surname
            nickname_given_name
            nickname_surname
            person_validity: validity {
              from
              to
            }
          }
        }
        ... on EngagementRegistration {
          validities(start: null, end: null) {
            person_response {
              uuid
              current {
                name
              }
            }
            org_unit_response {
              uuid
              current {
                name
              }
            }
            engagement_type_response {
              uuid
              current {
                name
              }
            }
            job_function_response {
              uuid
              current {
                name
              }
            }
            extension_1
            extension_4
            primary_response {
              uuid
              current {
                name
              }
            }
            validity {
              from
              to
            }
          }
        }
        ... on ITSystemRegistration {
          validities(start: null, end: null) {
            user_key
            name
            class_validity: validity {
              from
              to
            }
          }
        }
        ... on ITUserRegistration {
          validities(start: null, end: null) {
            user_key
            itsystem_response {
              uuid
              current {
                name
              }
            }
            external_id
            primary_response {
              uuid
              current {
                name
              }
            }
            validity {
              from
              to
            }
          }
        }
        ... on KLERegistration {
          validities(start: null, end: null) {
            kle_aspects_response {
              objects {
                uuid
                current {
                  name
                }
              }
            }
            kle_number_response {
              uuid
              current {
                name
              }
            }
            validity {
              from
              to
            }
          }
        }
        ... on LeaveRegistration {
          validities(start: null, end: null) {
            leave_type_response {
              uuid
              current {
                name
              }
            }
            engagement_response {
              uuid
              current {
                user_key
              }
            }
            validity {
              from
              to
            }
          }
        }
        ... on ManagerRegistration {
          validities(start: null, end: null) {
            manager_person: person_response {
              uuid
              current {
                name
              }
            }
            manager_level_response {
              uuid
              current {
                name
              }
            }
            manager_type_response {
              uuid
              current {
                name
              }
            }
            org_unit_response {
              uuid
              current {
                name
              }
            }
            responsibilities_response {
              objects {
                uuid
                current {
                  name
                }
              }
            }
            validity {
              from
              to
            }
          }
        }
        ... on OwnerRegistration {
          validities(start: null, end: null) {
            owner_response {
              uuid
              current {
                name
              }
            }
            validity {
              from
              to
            }
          }
        }
        ... on RoleBindingRegistration {
          validities(start: null, end: null) {
            role_response {
              uuid
              current {
                name
              }
            }
            validity {
              from
              to
            }
          }
        }
        ... on RelatedUnitRegistration {
          validities(start: null, end: null) {
            org_units_response {
              objects {
                uuid
                current {
                  name
                }
              }
            }
            validity {
              from
              to
            }
          }
        }
        ... on ClassRegistration {
          validities(start: null, end: null) {
            user_key
            name
            class_owner: owner
            scope
            facet_response {
              uuid
              current {
                user_key
              }
            }
            class_validity: validity {
              from
              to
            }
          }
        }
        ... on FacetRegistration {
          validities(start: null, end: null) {
            user_key
            class_validity: validity {
              from
              to
            }
          }
        }
      }
    }
  }
`
