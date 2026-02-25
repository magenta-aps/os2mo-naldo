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
            unit_type {
              uuid
            }
            org_unit_level {
              uuid
            }
            parent_response {
              uuid
            }
            time_planning {
              uuid
            }
            validity {
              from
              to
            }
          }
        }
        ... on AddressRegistration {
          validities(start: null, end: null) {
            address_type {
              uuid
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
            visibility {
              uuid
            }
            validity {
              from
              to
            }
          }
        }
        ... on AssociationRegistration {
          validities(start: null, end: null) {
            person {
              uuid
            }
            association_type {
              uuid
            }

            org_unit {
              uuid
            }
            primary {
              uuid
            }
            substitute {
              uuid
            }
            trade_union {
              uuid
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
            person {
              uuid
            }
            org_unit {
              uuid
            }
            engagement_type {
              uuid
            }
            job_function {
              uuid
            }
            extension_1
            extension_4
            primary {
              uuid
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
            itsystem {
              uuid
            }
            external_id
            primary {
              uuid
            }
            validity {
              from
              to
            }
          }
        }
        ... on KLERegistration {
          validities(start: null, end: null) {
            kle_aspects {
              uuid
            }
            kle_number {
              uuid
            }
            validity {
              from
              to
            }
          }
        }
        ... on LeaveRegistration {
          validities(start: null, end: null) {
            leave_type {
              uuid
            }
            engagement {
              uuid
            }
            validity {
              from
              to
            }
          }
        }
        ... on ManagerRegistration {
          validities(start: null, end: null) {
            manager_person: person {
              uuid
            }
            manager_level {
              uuid
            }
            manager_type {
              uuid
            }
            org_unit {
              uuid
            }
            responsibilities {
              uuid
            }
            validity {
              from
              to
            }
          }
        }
        ... on OwnerRegistration {
          validities(start: null, end: null) {
            owner {
              uuid
            }
            validity {
              from
              to
            }
          }
        }
        ... on RoleBindingRegistration {
          validities(start: null, end: null) {
            role {
              uuid
            }
            validity {
              from
              to
            }
          }
        }
        ... on RelatedUnitRegistration {
          validities(start: null, end: null) {
            org_units {
              uuid
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
            facet {
              uuid
            }
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
