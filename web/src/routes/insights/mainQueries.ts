export const mainQueries = [
  // {
  //   operation: "addresses",
  //   filter: "AddressFilter",
  //   value: "address",
  //   n: 2,
  //   fields: [
  //     { value: "address_type", subString: "address_type {name}" },
  //     { value: "address", subString: "name" },
  //     { value: "visibility", subString: "visibility {name}" },
  //     { value: "validity", subString: "validity {from to}" },
  //   ],
  // },
  {
    operation: "org_units",
    filter: "OrganisationUnitFilter",
    value: "unit",
    n: 1,
    fields: [
      { value: "name", subString: "name" },
      { value: "parent", subString: "parent {name}" },
      { value: "org_unit_level", subString: "org_unit_level {name}" },
      { value: "validity", subString: "validity {from to}" },
    ],
  },
  {
    operation: "engagements",
    filter: "EngagementFilter",
    value: "engagement",
    n: 2,
    fields: [
      { value: "subject", subString: "__typename" },
      { value: "name", subString: "person {name}" },
      { value: "job_function", subString: "job_function {name}" },
      { value: "engagement_type", subString: "engagement_type {name}" },
      { value: "primary", subString: "primary {name}" },
      { value: "validity", subString: "validity {from to}" },
      {
        value: "email",
        subString:
          'person { email: addresses(filter: { address_type: { scope: "EMAIL" } }) {name}}',
      },
      {
        value: "phone",
        subString:
          'person { phone: addresses(filter: { address_type: { scope: "PHONE" } }) {name}}',
      },
    ],
  },
  {
    operation: "associations",
    filter: "AssociationFilter",
    value: "association",
    n: 2,
    fields: [
      { value: "subject", subString: "__typename" },
      { value: "name", subString: "person {name}" },
      { value: "association_type", subString: "association_type {name}" },
      { value: "substitute", subString: "substitute {name}" },
      { value: "trade_union", subString: "trade_union {name}" },
      { value: "validity", subString: "validity {from to}" },
    ],
  },
  {
    operation: "itusers",
    filter: "ITUserFilter",
    value: "ituser",
    n: 2,
    fields: [
      { value: "subject", subString: "__typename" },
      { value: "itsystem", subString: "itsystem {name}" },
      { value: "account_name", subString: "user_key" },
      { value: "primary", subString: "primary {name}" },
      { value: "validity", subString: "validity {from to}" },
    ],
  },
  {
    operation: "rolebindings",
    filter: "RoleBindingFilter",
    value: "rolebinding",
    n: 2,
    fields: [
      { value: "subject", subString: "__typename" },
      { value: "ituser", subString: "ituser {user_key}" },
      // { value: "it_system", subString: "itsystem {name}" },
      { value: "role", subString: "role {name}" },
      { value: "validity", subString: "validity {from to}" },
    ],
  },
  // TODO: Add KLE
  // { operation: "kles", filter: "KLEFilter", value: "kle", n: 2 },
  {
    operation: "managers",
    filter: "ManagerFilter",
    value: "manager",
    n: 2,
    fields: [
      { value: "subject", subString: "__typename" },
      { value: "name", subString: "person {name}" },
      { value: "manager_responsibility", subString: "responsibilities {name}" },
      { value: "manager_type", subString: "manager_type {name}" },
      { value: "manager_level", subString: "manager_level {name}" },
      { value: "validity", subString: "validity {from to}" },
    ],
  },
  {
    operation: "owners",
    filter: "OwnerFilter",
    value: "owner",
    n: 2,
    fields: [
      { value: "subject", subString: "__typename" },
      { value: "name", subString: "owner {name}" },
      { value: "validity", subString: "validity {from to}" },
    ],
  },
  {
    operation: "related_units",
    filter: "RelatedUnitFilter",
    value: "related_unit",
    n: 2,
    fields: [
      { value: "subject", subString: "__typename" },
      { value: "related_unit", subString: "org_units {name}" },
      // { value: "validity", subString: "validity {from to}" },
    ],
  },
]
