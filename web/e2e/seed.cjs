// Seeds the facets, classes and fixture objects the app's forms need into
// MO. Idempotent: existing objects are left alone. Run it after resetting
// the local MO — a completely empty database (CI) is bootstrapped too.
// Usage: node e2e/seed.cjs
const MO = process.env.MO_URL ?? "http://localhost:5000"
const GRAPHQL_VERSION = "v29"
// Locally MO fronts Keycloak on /auth; in CI Keycloak is its own service.
const KEYCLOAK = process.env.KEYCLOAK_URL ?? `${MO}/auth`

// Every facet user_key the frontend requests, with one seed class each.
const FACETS = {
  engagement_type: { name: "Ansat", user_key: "ansat" },
  engagement_job_function: { name: "Jurist", user_key: "jurist" },
  primary_type: { name: "Primær", user_key: "primary", scope: "3000" },
  association_type: { name: "Medlem", user_key: "medlem" },
  employee_address_type: { name: "Email", user_key: "EmailEmployee", scope: "EMAIL" },
  org_unit_address_type: { name: "Email", user_key: "EmailUnit", scope: "EMAIL" },
  visibility: { name: "Må vises", user_key: "Ekstern", scope: "PUBLIC" },
  manager_type: { name: "Leder", user_key: "leder" },
  manager_level: { name: "Niveau 1", user_key: "niveau1" },
  responsibility: { name: "Personaleansvar", user_key: "personaleansvar" },
  leave_type: { name: "Orlov", user_key: "orlov" },
  kle_aspect: { name: "Udførende", user_key: "udfoerende" },
  kle_number: { name: "00.01", user_key: "00.01" },
  org_unit_type: { name: "Afdeling", user_key: "afdeling" },
  org_unit_level: { name: "N1", user_key: "n1" },
  org_unit_hierarchy: { name: "Linjeorganisation", user_key: "linjeorg" },
  time_planning: { name: "Fuldtid", user_key: "fuldtid" },
  role: { name: "Bruger", user_key: "bruger" },
}

const moGraphql = async (token, query, variables) => {
  const res = await fetch(`${MO}/graphql/${GRAPHQL_VERSION}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}

;(async () => {
  const token = (
    await (
      await fetch(`${KEYCLOAK}/realms/mo/protocol/openid-connect/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials&client_id=dipex&client_secret=603f1c82-d012-4d04-9382-dbe659c533fb",
      })
    ).json()
  ).access_token

  const existing = await moGraphql(
    token,
    "{ facets { objects { uuid current { user_key classes { name } } } } }"
  )
  const facetsByUserKey = Object.fromEntries(
    existing.facets.objects.map((facet) => [facet.current.user_key, facet])
  )

  for (const [key, seedClass] of Object.entries(FACETS)) {
    let facet = facetsByUserKey[key]?.uuid
    if (!facet) {
      facet = (
        await moGraphql(
          token,
          "mutation ($input: FacetCreateInput!) { facet_create(input: $input) { uuid } }",
          { input: { user_key: key, validity: { from: "1900-01-01" } } }
        )
      ).facet_create.uuid
      console.log("created facet", key)
    }
    if (facetsByUserKey[key]?.current?.classes?.length) continue
    await moGraphql(
      token,
      "mutation ($input: ClassCreateInput!) { class_create(input: $input) { uuid } }",
      {
        input: {
          facet_uuid: facet,
          name: seedClass.name,
          user_key: seedClass.user_key,
          ...(seedClass.scope && { scope: seedClass.scope }),
          validity: { from: "1900-01-01" },
        },
      }
    )
    console.log("created class", seedClass.name, "in", key)
  }
  const facets = await moGraphql(
    token,
    "{ facets { objects { current { user_key classes { uuid user_key } } } } }"
  )
  const classFor = {}
  for (const facet of facets.facets.objects)
    classFor[facet.current.user_key] = facet.current.classes[0]?.uuid

  // A fresh database (CI) is completely empty: bootstrap the organisation
  // and one employee with an engagement, which resolveFixture and the app's
  // pages need. Each step is skipped when the object already exists.
  const org = await moGraphql(token, "{ org { uuid } }").catch(() => null)
  if (!org?.org?.uuid) {
    await moGraphql(
      token,
      "mutation { org_create(input: { municipality_code: null }) { uuid } }"
    )
    console.log("created organisation")
  }
  let rootUnit = (
    await moGraphql(token, "{ org_units(limit: 1) { objects { uuid } } }")
  ).org_units.objects[0]?.uuid
  if (!rootUnit) {
    rootUnit = (
      await moGraphql(
        token,
        "mutation ($input: OrganisationUnitCreateInput!) { org_unit_create(input: $input) { uuid } }",
        {
          input: {
            name: "Seedby Kommune",
            user_key: "seedby",
            org_unit_type: classFor.org_unit_type,
            validity: { from: "1900-01-01" },
          },
        }
      )
    ).org_unit_create.uuid
    console.log("created org unit")
  }
  let seedPerson = (
    await moGraphql(token, "{ employees(limit: 1) { objects { uuid } } }")
  ).employees.objects[0]?.uuid
  if (!seedPerson) {
    seedPerson = (
      await moGraphql(
        token,
        "mutation ($input: EmployeeCreateInput!) { employee_create(input: $input) { uuid } }",
        { input: { given_name: "Seed", surname: "Seedsen" } }
      )
    ).employee_create.uuid
    console.log("created employee")
  }
  const anyEngagement = (
    await moGraphql(token, "{ engagements(limit: 1) { objects { uuid } } }")
  ).engagements.objects.length
  if (!anyEngagement) {
    await moGraphql(
      token,
      "mutation ($input: EngagementCreateInput!) { engagement_create(input: $input) { uuid } }",
      {
        input: {
          person: seedPerson,
          org_unit: rootUnit,
          job_function: classFor.engagement_job_function,
          engagement_type: classFor.engagement_type,
          validity: { from: "2020-01-01" },
        },
      }
    )
    console.log("created engagement")
  }

  // The fixture person/unit: the person and org unit on the first
  // engagement. Everything seeded below lands on these two, and the tests
  // look their objects up by them.
  const fixture = await moGraphql(
    token,
    "{ engagements(limit: 1) { objects { uuid validities { person { uuid } org_unit { uuid } } } } }"
  )
  const engagement = fixture.engagements.objects[0]
  const person = engagement.validities[0].person[0].uuid
  const unit = engagement.validities[0].org_unit[0].uuid

  let itsystem = (
    await moGraphql(token, "{ itsystems(limit: 1) { objects { uuid } } }")
  ).itsystems.objects[0]?.uuid
  if (!itsystem) {
    itsystem = (
      await moGraphql(
        token,
        "mutation ($input: ITSystemCreateInput!) { itsystem_create(input: $input) { uuid } }",
        {
          input: {
            user_key: "AD",
            name: "Active Directory",
            validity: { from: "1900-01-01" },
          },
        }
      )
    ).itsystem_create.uuid
    console.log("created itsystem")
  }

  // The role selects filter classes by IT system, so a role class without an
  // it_system link is invisible to the forms. Link the seeded role class to
  // the itsystem (or create a linked one) when no linked role exists.
  const linkedRoles = await moGraphql(
    token,
    'query ($it: [UUID!]) { classes(filter: { facet: { user_keys: "role" }, it_system: { uuids: $it } }) { objects { uuid } } }',
    { it: [itsystem] }
  )
  if (!linkedRoles.classes.objects.length) {
    const roles = await moGraphql(
      token,
      '{ classes(filter: { facet: { user_keys: "role" } }) { objects { uuid current { name user_key facet { uuid } } } } }'
    )
    const bruger = roles.classes.objects.find(
      (roleClass) => roleClass.current?.user_key === "bruger"
    )
    if (bruger) {
      await moGraphql(
        token,
        "mutation ($input: ClassUpdateInput!) { class_update(input: $input) { uuid } }",
        {
          input: {
            uuid: bruger.uuid,
            facet_uuid: bruger.current.facet.uuid,
            name: bruger.current.name,
            user_key: bruger.current.user_key,
            it_system_uuid: itsystem,
            validity: { from: "1900-01-01" },
          },
        }
      )
      console.log("linked class Bruger to the itsystem")
    } else {
      const roleFacet = (
        await moGraphql(
          token,
          '{ facets(filter: { user_keys: "role" }) { objects { uuid } } }'
        )
      ).facets.objects[0].uuid
      await moGraphql(
        token,
        "mutation ($input: ClassCreateInput!) { class_create(input: $input) { uuid } }",
        {
          input: {
            facet_uuid: roleFacet,
            name: "Bruger",
            user_key: "bruger",
            it_system_uuid: itsystem,
            validity: { from: "1900-01-01" },
          },
        }
      )
      console.log("created linked class Bruger in role")
    }
  }

  const VALIDITY = { from: "2020-01-01" }

  // Does the fixture person/unit already have an object of this type? The
  // suite resolves its edit targets by these owners (resolveEditTargets in
  // helpers.ts), so the existence checks are owner-filtered the same way.
  const exists = async (collection, filterKey, owner) => {
    const data = await moGraphql(
      token,
      `query ($owner: [UUID!]) { ${collection}(filter: { ${filterKey}: $owner }, limit: 1) { objects { uuid } } }`,
      { owner: [owner] }
    )
    return data[collection].objects.length > 0
  }
  const onPerson = (collection) => () => exists(collection, "employees", person)
  const onUnit = (collection) => () => exists(collection, "org_units", unit)
  const onBoth = (collection) => async () =>
    (await exists(collection, "employees", person)) &&
    (await exists(collection, "org_units", unit))

  const SEEDS = [
    {
      label: "person address",
      present: onPerson("addresses"),
      mutation: "address_create",
      inputType: "AddressCreateInput",
      input: {
        address_type: classFor.employee_address_type,
        value: "seed@example.com",
        person,
        visibility: classFor.visibility,
        validity: VALIDITY,
      },
    },
    {
      label: "unit address",
      present: onUnit("addresses"),
      mutation: "address_create",
      inputType: "AddressCreateInput",
      input: {
        address_type: classFor.org_unit_address_type,
        value: "unit@example.com",
        org_unit: unit,
        visibility: classFor.visibility,
        validity: VALIDITY,
      },
    },
    {
      label: "person ituser",
      present: onPerson("itusers"),
      mutation: "ituser_create",
      inputType: "ITUserCreateInput",
      input: { itsystem, user_key: "SEED0001", person, validity: VALIDITY },
    },
    {
      label: "unit ituser",
      present: onUnit("itusers"),
      mutation: "ituser_create",
      inputType: "ITUserCreateInput",
      input: { itsystem, user_key: "SEED0002", org_unit: unit, validity: VALIDITY },
    },
    {
      // One manager carries both owner sides.
      label: "manager",
      present: onBoth("managers"),
      mutation: "manager_create",
      inputType: "ManagerCreateInput",
      input: {
        org_unit: unit,
        person,
        manager_type: classFor.manager_type,
        manager_level: classFor.manager_level,
        responsibility: [classFor.responsibility],
        validity: VALIDITY,
      },
    },
    {
      label: "association",
      present: onBoth("associations"),
      mutation: "association_create",
      inputType: "AssociationCreateInput",
      input: {
        org_unit: unit,
        person,
        association_type: classFor.association_type,
        validity: VALIDITY,
      },
    },
    {
      label: "leave",
      present: onPerson("leaves"),
      mutation: "leave_create",
      inputType: "LeaveCreateInput",
      input: {
        person,
        leave_type: classFor.leave_type,
        engagement: engagement.uuid,
        validity: VALIDITY,
      },
    },
    {
      label: "kle",
      present: onUnit("kles"),
      mutation: "kle_create",
      inputType: "KLECreateInput",
      input: {
        org_unit: unit,
        kle_number: classFor.kle_number,
        kle_aspects: [classFor.kle_aspect],
        validity: VALIDITY,
      },
    },
    {
      label: "owner",
      present: onUnit("owners"),
      mutation: "owner_create",
      inputType: "OwnerCreateInput",
      input: { org_unit: unit, owner: person, validity: VALIDITY },
    },
  ]

  // Failures are logged but don't abort — a partial seed still helps.
  for (const detail of SEEDS) {
    try {
      if (await detail.present()) continue
      await moGraphql(
        token,
        `mutation ($input: ${detail.inputType}!) { ${detail.mutation}(input: $input) { uuid } }`,
        { input: detail.input }
      )
      console.log("created", detail.label)
    } catch (e) {
      console.log("SKIPPED", detail.label, "—", e.message.slice(0, 120))
    }
  }

  // One rolebinding per ituser owner side, on the itusers ensured above.
  for (const side of ["person", "unit"]) {
    try {
      const filterKey = side === "person" ? "employees" : "org_units"
      const owner = side === "person" ? person : unit
      const existing = await moGraphql(
        token,
        `query ($owner: [UUID!]) { rolebindings(filter: { ituser: { ${filterKey}: $owner } }, limit: 1) { objects { uuid } } }`,
        { owner: [owner] }
      )
      if (existing.rolebindings.objects.length) continue
      const itusers = await moGraphql(
        token,
        `query ($owner: [UUID!]) { itusers(filter: { ${filterKey}: $owner }, limit: 1) { objects { uuid } } }`,
        { owner: [owner] }
      )
      const ituser = itusers.itusers.objects[0]
      if (!ituser) continue
      await moGraphql(
        token,
        "mutation ($input: RoleBindingCreateInput!) { rolebinding_create(input: $input) { uuid } }",
        { input: { ituser: ituser.uuid, role: classFor.role, validity: VALIDITY } }
      )
      console.log("created rolebinding on", side, "ituser")
    } catch (e) {
      console.log("SKIPPED", side, "rolebinding —", e.message.slice(0, 120))
    }
  }

  console.log("seed complete")
})().catch((e) => {
  console.error("FAILED:", e.message)
  process.exit(1)
})
