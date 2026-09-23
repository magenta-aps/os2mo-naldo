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
            unit_hierarchy_response {
              uuid
              current {
                name
              }
            }
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
            time_planning_response {
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
            user_key
            name
            orgunit__validity: validity {
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
            visibility_response {
              uuid
              current {
                name
              }
            }
            address__person_response: person_response {
              uuid
              current {
                name
              }
            }
            address__org_unit_response: org_unit_response {
              uuid
              current {
                name
              }
            }
            address__engagement_response: engagement_response {
              uuid
              current {
                user_key
              }
            }
            address__ituser_response: ituser_response {
              uuid
              current {
                user_key
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
            user_key
            address__validity: validity {
              from
              to
            }
          }
        }
        ... on AssociationRegistration {
          validities(start: null, end: null) {
            association_type_response {
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
            primary_response {
              uuid
              current {
                name
              }
            }
            association__person_response: person_response {
              uuid
              current {
                name
              }
            }
            association__org_unit_response: org_unit_response {
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
            association__job_function_response: job_function_response {
              uuid
              current {
                name
              }
            }
            it_user_response {
              uuid
              current {
                user_key
              }
            }
            user_key
            association__validity: validity {
              from
              to
            }
          }
        }
        ... on PersonRegistration {
          validities(start: null, end: null) {
            user_key
            given_name
            nickname_given_name
            surname
            nickname_surname
            person__validity: validity {
              from
              to
            }
          }
        }
        ... on EngagementRegistration {
          validities(start: null, end: null) {
            engagement_type_response {
              uuid
              current {
                name
              }
            }
            engagement__job_function_response: job_function_response {
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
            engagement__person_response: person_response {
              uuid
              current {
                name
              }
            }
            engagement__org_unit_response: org_unit_response {
              uuid
              current {
                name
              }
            }
            user_key
            engagement__validity: validity {
              from
              to
            }
            fraction
            extension_1
            extension_2
            extension_3
            extension_4
            extension_5
            extension_6
            extension_7
            extension_8
            extension_9
            extension_10
          }
        }
        ... on ITSystemRegistration {
          validities(start: null, end: null) {
            name
            user_key
            itsystem__validity: validity {
              from
              to
            }
          }
        }
        ... on ITUserRegistration {
          validities(start: null, end: null) {
            ituser__person_response: person_response {
              uuid
              current {
                name
              }
            }
            ituser__org_unit_response: org_unit_response {
              uuid
              current {
                name
              }
            }
            engagements_responses {
              objects {
                uuid
                current {
                  user_key
                }
              }
            }
            itsystem_response {
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
            user_key
            external_id
            binding_type
            ituser__validity: validity {
              from
              to
            }
          }
        }
        ... on KLERegistration {
          validities(start: null, end: null) {
            kle_number_response {
              uuid
              current {
                name
              }
            }
            kle_aspects_response {
              objects {
                uuid
                current {
                  name
                }
              }
            }
            kle__org_unit_response: org_unit_response {
              uuid
              current {
                name
              }
            }
            user_key
            kle__validity: validity {
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
            leave__person_response: person_response {
              uuid
              current {
                name
              }
            }
            leave__engagement_response: engagement_response {
              uuid
              current {
                user_key
              }
            }
            user_key
            leave__validity: validity {
              from
              to
            }
          }
        }
        ... on ManagerRegistration {
          validities(start: null, end: null) {
            manager_type_response {
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
            responsibilities_response {
              objects {
                uuid
                current {
                  name
                }
              }
            }
            manager__person_response: person_response {
              uuid
              current {
                name
              }
            }
            manager__org_unit_response: org_unit_response {
              uuid
              current {
                name
              }
            }
            manager__engagement_response: engagement_response {
              uuid
              current {
                user_key
              }
            }
            user_key
            manager__validity: validity {
              from
              to
            }
          }
        }
        ... on OwnerRegistration {
          validities(start: null, end: null) {
            owner__org_unit_response: org_unit_response {
              uuid
              current {
                name
              }
            }
            owner__person_response: person_response {
              uuid
              current {
                name
              }
            }
            owner__owner_response: owner_response {
              uuid
              current {
                name
              }
            }
            user_key
            owner__validity: validity {
              from
              to
            }
            owner_inference_priority
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
            rolebinding__ituser_response: ituser_response {
              uuid
              current {
                user_key
              }
            }
            rolebinding__org_unit_response: org_unit_response {
              uuid
              current {
                name
              }
            }
            user_key
            rolebinding__validity: validity {
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
            user_key
            relatedunit__validity: validity {
              from
              to
            }
          }
        }
        ... on ClassRegistration {
          validities(start: null, end: null) {
            parent_class: parent_response {
              uuid
              current {
                name
              }
            }
            facet_response {
              uuid
              current {
                user_key
              }
            }
            it_system_response {
              uuid
              current {
                name
              }
            }
            class__owner_response: owner_response {
              uuid
              current {
                name
              }
            }
            user_key
            name
            scope
            description
            class__validity: validity {
              from
              to
            }
          }
        }
        ... on FacetRegistration {
          validities(start: null, end: null) {
            parent_facet: parent_response {
              uuid
              current {
                user_key
              }
            }
            user_key
            facet__validity: validity {
              from
              to
            }
          }
        }
      }
    }
  }
`
