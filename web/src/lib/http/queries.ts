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
          classes(
            filter: {
              from_date: $currentDate
              owner: {
                include_none: true
                descendant: { uuids: $orgUuid, from_date: $currentDate }
                from_date: $currentDate
              }
            }
          ) {
            name
            uuid
            user_key
            scope
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
  query GetRoleClasses($itSystem: UUID!, $fromDate: DateTime!) {
    facets(filter: { user_keys: ["role"] }) {
      objects {
        validities {
          classes(filter: { it_system: { uuids: [$itSystem] }, from_date: $fromDate }) {
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
  query Auditlog($uuid: [UUID!]) {
    registrations(filter: { uuids: $uuid, start: null, end: null }) {
      objects {
        ... on OrganisationUnitRegistration {
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
          validities(start: null, end: null) {
            name
            user_key
            unit_type {
              name
            }
            org_unit_level {
              name
            }
            parent {
              name
            }
            time_planning {
              name
            }
            validity {
              from
              to
            }
          }
        }
        ... on AddressRegistration {
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
          validities(start: null, end: null) {
            address_type {
              name
            }
            address: resolve {
              ... on DefaultAddress {
                __typename
                value
              }
              ... on DARAddress {
                name
              }
              ... on MultifieldAddress {
                value
                value2
              }
            }
            description: user_key
            visibility {
              name
            }
            validity {
              from
              to
            }
          }
        }
        ... on AssociationRegistration {
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
          validities(start: null, end: null) {
            person {
              name
            }
            association_type {
              name
            }

            org_unit {
              name
            }
            primary {
              name
            }
            substitute {
              name
            }
            trade_union {
              name
            }
            validity {
              from
              to
            }
          }
        }
        ... on PersonRegistration {
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
          validities(start: null, end: null) {
            person {
              name
            }
            org_unit {
              name
            }
            engagement_type {
              name
            }
            job_function {
              name
            }
            extension_1
            extension_4
            primary {
              name
            }
            validity {
              from
              to
            }
          }
        }
        ... on ITUserRegistration {
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
          validities(start: null, end: null) {
            user_key
            itsystem {
              name
            }
            external_id
            primary {
              name
            }
            validity {
              from
              to
            }
          }
        }
        ... on KLERegistration {
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
          validities(start: null, end: null) {
            kle_aspects {
              name
            }
            kle_number {
              name
            }
            validity {
              from
              to
            }
          }
        }
        ... on LeaveRegistration {
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
          validities(start: null, end: null) {
            leave_type {
              name
            }
            engagement {
              org_unit {
                name
              }
              job_function {
                name
              }
            }
            validity {
              from
              to
            }
          }
        }
        ... on ManagerRegistration {
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
          validities(start: null, end: null) {
            manager_person: person {
              name
            }
            manager_level {
              name
            }
            manager_type {
              name
            }
            org_unit {
              name
            }
            responsibilities {
              name
            }
            validity {
              from
              to
            }
          }
        }
        ... on OwnerRegistration {
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
          validities(start: null, end: null) {
            owner {
              name
            }
            validity {
              from
              to
            }
          }
        }
        ... on RoleBindingRegistration {
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
          validities(start: null, end: null) {
            role {
              name
            }
            validity {
              from
              to
            }
          }
        }
        ... on RelatedUnitRegistration {
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
          validities(start: null, end: null) {
            org_units {
              name
            }
            validity {
              from
              to
            }
          }
        }
      }
    }
  }
`
