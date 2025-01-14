export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  CPR: { input: any; output: any; }
  Cursor: { input: any; output: any; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  UUID: { input: any; output: any; }
  Upload: { input: any; output: any; }
  int: { input: any; output: any; }
};

/**
 * Address information for either an employee or organisational unit
 *
 */
export type Address = {
  __typename?: 'Address';
  /**
   * The address category or type.
   *
   * In OS2mo addresses can be of a variety of different types:
   * * Phone numbers
   * * Addresses
   * * Registration numbers
   * * Card codes
   *
   * This field is what encodes the type of an address.
   *
   * Examples of user-keys:
   * * `"EmailUnit"`
   * * `"p-nummer"`
   * * `"PhoneEmployee"`
   *
   */
  address_type: Class;
  /**
   * UUID of the address type class.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `address_type {uuid}` instead.
   *
   */
  address_type_uuid: Scalars['UUID']['output'];
  /**
   * Same as address_type, but with HACKs to enable validities.
   *
   * @deprecated Should only be used to query address_type when validity dates have been specified, "
   * "ex from_date & to_date."
   * "Will be removed when sub-query date handling is implemented.
   *
   */
  address_type_validity?: Maybe<Class>;
  /**
   * Connected employee.
   *
   * Note:
   * This field is mutually exclusive with the `org_unit` field.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   * @deprecated Use 'person' instead. Will be removed in a future version of OS2mo.
   */
  employee?: Maybe<Array<Employee>>;
  /**
   * UUID of the employee related to the address.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `employee {uuid}` instead.
   *
   */
  employee_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Connected engagement.
   *
   * Note:
   * This field is **not** mutually exclusive with neither the `employee` nor the `org_unit` field.
   *
   */
  engagement?: Maybe<Array<Engagement>>;
  /**
   * Optional UUID of an associated engagement.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `engagement {uuid}` instead.
   *
   */
  engagement_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Hypertext Reference of the address.
   *
   * The `href` field makes a hyperlink from the address value, such that the link can be included in user interfaces.
   *
   * Examples:
   * * `null`: For non-hyperlinkable addresses.
   * * `"tel:88888888"`: For phone numbers.
   * * `"mailto:info@magenta.dk"`: For email addresses.
   * * `"https://www.openstreetmap.org/?mlon=11&mlat=56"`: For postal addresses, locations, etc
   *
   * Note:
   * Requesting this field may incur a performance penalty as the returned value may be dynamically resolved from the `value`-field.
   *
   *
   */
  href?: Maybe<Scalars['String']['output']>;
  /**
   * Connected IT-user.
   *
   */
  ituser: Array<ItUser>;
  /**
   * Human readable name of the address.
   *
   * Name is *usually* equal to `value`, but may differ if `value` is not human readable.
   * This may for instance be the case for `DAR` addresses, where the value is the DAR UUID, while the name is a human readable address.
   *
   * This is the value that should be shown to users in UIs.
   *
   * Examples:
   * * `"Vifdam 20, 1. th, 6000 Kolding"`
   * * `"25052943"`
   * * `"info@magenta.dk"`
   * * `"Building 11"`
   *
   * Note:
   * Requesting this field may incur a performance penalty as the returned value may be dynamically resolved from the `value`-field.
   *
   */
  name?: Maybe<Scalars['String']['output']>;
  /**
   * Connected organisation unit.
   *
   * Note:
   * This field is mutually exclusive with the `employee` field.
   *
   */
  org_unit?: Maybe<Array<OrganisationUnit>>;
  /**
   * UUID of the organisation unit related to the address.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `org_unit {uuid}` instead.
   *
   */
  org_unit_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Connected person.
   *
   * Note:
   * This field is mutually exclusive with the `org_unit` field.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  person?: Maybe<Array<Employee>>;
  resolve: ResolvedAddress;
  /**
   * The object type.
   *
   * Always contains the string `address`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /**
   * Short unique key.
   *
   * Usually set to the `value` provided on object creation.
   * May also be set to the key used in external systems.
   *
   * Examples:
   * * `"25052943"`
   * * `"info@magenta.dk"`
   * * `"Building 11"`
   *
   */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the address object. */
  validity: Validity;
  /**
   * Machine processable value of the address.
   *
   * The value of the address, which may or may not be fit for human consumption.
   * If an address for human consumption is required, consider using `name` or `href` instead.
   *
   * Examples:
   * * `"3cb0a0c6-37d0-0e4a-e044-0003ba298018"`
   * * `"25052943"`
   * * `"info@magenta.dk"`
   * * `"Building 11"`
   *
   */
  value: Scalars['String']['output'];
  /**
   * Optional second machine processable value of the address.
   *
   * This value is `null` for most address types, but may be utilized by some address-types for extra information.
   *
   * Examples:
   * * `null`
   * * `"Office 12"`
   * * `"+45"`
   *
   */
  value2?: Maybe<Scalars['String']['output']>;
  /**
   * Determines who can see the address and how it is exported.
   *
   * In OS2mo addresses can be of a variety of privacy classes.
   * For instance OS2mo may contain a list of phone numbers for an employee;
   * * A private mobile phone number
   * * An internal work mobile phone number
   * * A shared external phone number
   *
   * This field is what encodes the privacy class of an address.
   * Thereby stating who should be allowed to see what addresses.
   *
   * Examples of user-keys:
   * * `null`: Undetermined / non-classified.
   * * `"Secret"`: Should be treated carefully and perhaps not be exported.
   * * `"Internal"` Should be treated carefully but perhaps exposed to an internal intranet.
   * * `"External"`: Can probably be exposed to the internet
   *
   */
  visibility?: Maybe<Class>;
  /**
   * UUID of the visibility class of the address.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `visibility {uuid}` instead.
   *
   */
  visibility_uuid?: Maybe<Scalars['UUID']['output']>;
};


/**
 * Address information for either an employee or organisational unit
 *
 */
export type AddressAddress_TypeArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Address information for either an employee or organisational unit
 *
 */
export type AddressEmployeeArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Address information for either an employee or organisational unit
 *
 */
export type AddressEngagementArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEngagementFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Address information for either an employee or organisational unit
 *
 */
export type AddressItuserArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundItUserFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Address information for either an employee or organisational unit
 *
 */
export type AddressOrg_UnitArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundOrganisationUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Address information for either an employee or organisational unit
 *
 */
export type AddressPersonArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Address information for either an employee or organisational unit
 *
 */
export type AddressVisibilityArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type AddressCreateInput = {
  /** Type of the address. */
  address_type: Scalars['UUID']['input'];
  /**
   * UUID for the related person.
   * @deprecated Use 'person' instead. Will be removed in a future version of OS2mo.
   */
  employee?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID for the related engagement. */
  engagement?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID for the related ituser. */
  ituser?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID for the related org unit. */
  org_unit?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID for the related person. */
  person?: InputMaybe<Scalars['UUID']['input']>;
  /** User key of the address. If None, defaults to value */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Validity range for the org-unit. */
  validity: RaValidityInput;
  /** The actual address value. */
  value: Scalars['String']['input'];
  /** Visibility for the address. */
  visibility?: InputMaybe<Scalars['UUID']['input']>;
};

/** Address filter. */
export type AddressFilter = {
  /**
   * Address type filter limiting which entries are returned.
   *
   */
  address_type?: InputMaybe<ClassFilter>;
  /**
   * Address type user-key filter limiting which entries are returned.
   *
   * | `address_type_user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'address_type' filter
   */
  address_type_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * Address type UUID filter limiting which entries are returned.
   *
   * | `address_types`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'address_type' filter
   */
  address_types?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Employee filter limiting which entries are returned.
   *
   */
  employee?: InputMaybe<EmployeeFilter>;
  /**
   * Employee UUID filter limiting which entries are returned.
   *
   * | `employees`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'employee' filter
   */
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Engagement filter limiting which entries are returned.
   *
   */
  engagement?: InputMaybe<EngagementFilter>;
  /**
   * Engagement UUID filter limiting which entries are returned.
   *
   * | `engagements`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'engagement' filter
   */
  engagements?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /** ITUser filter limiting which entries are returned. */
  ituser?: InputMaybe<ItUserFilter>;
  /**
   * Organisation Unit filter limiting which entries are returned.
   *
   */
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Organisational Unit UUID filter limiting which entries are returned.
   *
   * | `org_units`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'org_unit' filter
   */
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<AddressRegistrationFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Visibility filter limiting which entries are returned. */
  visibility?: InputMaybe<ClassFilter>;
};

/** Address registration filter. */
export type AddressRegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type AddressResponse = {
  __typename?: 'AddressResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<Address>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<Address>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<Address>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type AddressResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type AddressResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type AddressResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type AddressResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type AddressResponsePaged = {
  __typename?: 'AddressResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<AddressResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type AddressTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID for the address we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type AddressUpdateInput = {
  /** Type of the address. */
  address_type?: InputMaybe<Scalars['UUID']['input']>;
  /**
   * UUID for the related person.
   * @deprecated Use 'person' instead. Will be removed in a future version of OS2mo.
   */
  employee?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID for the related engagement. */
  engagement?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID for the related ituser. */
  ituser?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID for the related org unit. */
  org_unit?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID for the related person. */
  person?: InputMaybe<Scalars['UUID']['input']>;
  /** User key of the address. If None, defaults to value */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the address we want to update. */
  uuid: Scalars['UUID']['input'];
  /** Validity range for the org-unit. */
  validity: RaValidityInput;
  /** The actual address value. */
  value?: InputMaybe<Scalars['String']['input']>;
  /** Visibility for the address. */
  visibility?: InputMaybe<Scalars['UUID']['input']>;
};

/** Connects organisation units and employees */
export type Association = {
  __typename?: 'Association';
  /**
   * The type of connection that the employee has to the organisation unit.
   *
   * Examples:
   * * `"Chairman"`
   * * `"Leader"`
   * * `"Employee"`
   *
   */
  association_type?: Maybe<Class>;
  /**
   * UUID of the association type.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `association_type {uuid}` instead.
   *
   */
  association_type_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Same as association_type, but with HACKs to enable validities.
   *
   * @deprecated Should only be used to query association_types when validity dates have been specified, "
   * "ex from_date & to_date."
   * "Will be removed when sub-query date handling is implemented.
   *
   */
  association_type_validity?: Maybe<Class>;
  /**
   * List of arbitrary classes.
   *
   * The purpose of this field is ill-defined.
   * It is currently mainly used for (trade) union specification.
   *
   * @deprecated Will be removed in a future version of GraphQL.
   * Currently no replacement is in place, but specialized fields will probably arive in the future.
   *
   */
  dynamic_class?: Maybe<Class>;
  /**
   * UUID of the dynamically attached class.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `dynamic_class {uuid}` instead.
   *
   */
  dynamic_class_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Associated employee.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   * @deprecated Use 'person' instead. Will be removed in a future version of OS2mo.
   */
  employee: Array<Employee>;
  /**
   * UUID of the employee related to the association.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `employee {uuid}` instead.
   *
   */
  employee_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * The IT-user utilized by the employee when fulfilling the association responsibilities.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  it_user: Array<ItUser>;
  /**
   * UUID of an 'ITUser' model, only defined for 'IT associations.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `it_user {uuid}` instead.
   *
   */
  it_user_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * The position held by the employee in the organisation unit.
   *
   * Examples of user-keys:
   * * `"Payroll consultant"`
   * * `"Office student"`
   * * `"Jurist"`
   *
   */
  job_function?: Maybe<Class>;
  /**
   * UUID of a job function class, only defined for 'IT associations.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `job_function {uuid}` instead.
   *
   */
  job_function_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Associated organisation unit.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  org_unit: Array<OrganisationUnit>;
  /**
   * UUID of the organisation unit related to the association.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `org_unit {uuid}` instead.
   *
   */
  org_unit_uuid: Scalars['UUID']['output'];
  /**
   * Associated person.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  person: Array<Employee>;
  /**
   * Marks which association is primary.
   *
   * When exporting data from OS2mo to external systems, that only support a single engagement or associations, this field can be used to export the primary one.
   * What primarity means is vaguely defined, but usually derived from workload or time-allocation.
   *
   * Examples  of user-keys:
   * * `"primary"`
   * * `"non-primary"`
   * * `"explicitly-primary"`
   *
   * It is a convention that at most one association for each employee is set as either `primary` or `explicitly-primary`.
   * This convention is in place as if more associations are primary, the entire purpose of the field breaks down.
   * In the future this convention may become an invariant.
   *
   * Note:
   * The calculate-primary integration can be used to automatically calculate and update primarity fields.
   *
   */
  primary?: Maybe<Class>;
  /**
   * UUID of the primary type of the association.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `primary {uuid}` instead.
   *
   */
  primary_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Optional subsitute if `employee` is unavailable.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  substitute: Array<Employee>;
  /**
   * UUID of the substitute for the employee in the association.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `subsitute {uuid}` instead.
   *
   */
  substitute_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Marks associations with a trade union
   *
   */
  trade_union?: Maybe<Class>;
  /**
   * UUID of the attached trade union.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `trade_union {uuid}` instead.
   *
   */
  trade_union_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * The object type.
   *
   * Always contains the string `association`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /**
   * Short unique key.
   *
   * Usually set to be set to the key used in external systems.
   *
   * Examples:
   * * `"1462"`
   * * `"XSIMP"`
   *
   */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the association object. */
  validity: Validity;
};


/** Connects organisation units and employees */
export type AssociationAssociation_TypeArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Connects organisation units and employees */
export type AssociationDynamic_ClassArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Connects organisation units and employees */
export type AssociationEmployeeArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Connects organisation units and employees */
export type AssociationIt_UserArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundItUserFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Connects organisation units and employees */
export type AssociationJob_FunctionArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Connects organisation units and employees */
export type AssociationOrg_UnitArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundOrganisationUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Connects organisation units and employees */
export type AssociationPersonArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Connects organisation units and employees */
export type AssociationPrimaryArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Connects organisation units and employees */
export type AssociationSubstituteArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Connects organisation units and employees */
export type AssociationTrade_UnionArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type AssociationCreateInput = {
  /** Association type uuid. */
  association_type: Scalars['UUID']['input'];
  /**
   * Employee uuid.
   * @deprecated Use 'person' instead. Will be removed in a future version of OS2mo.
   */
  employee?: InputMaybe<Scalars['UUID']['input']>;
  /** org-unit uuid. */
  org_unit: Scalars['UUID']['input'];
  /** Employee uuid. */
  person?: InputMaybe<Scalars['UUID']['input']>;
  /** Primary field of the association */
  primary?: InputMaybe<Scalars['UUID']['input']>;
  /** Substitute uuid. */
  substitute?: InputMaybe<Scalars['UUID']['input']>;
  /** Trade union uuid. */
  trade_union?: InputMaybe<Scalars['UUID']['input']>;
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Validity range for the org-unit. */
  validity: RaValidityInput;
};

/** Association filter. */
export type AssociationFilter = {
  /**
   * Address type filter limiting which entries are returned.
   *
   */
  association_type?: InputMaybe<ClassFilter>;
  /**
   * Association type user-key filter limiting which entries are returned.
   *
   * | `association_type_user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'association_type' filter
   */
  association_type_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * Association type UUID filter limiting which entries are returned.
   *
   * | `association_types`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'association_type' filter
   */
  association_types?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Employee filter limiting which entries are returned.
   *
   */
  employee?: InputMaybe<EmployeeFilter>;
  /**
   * Employee UUID filter limiting which entries are returned.
   *
   * | `employees`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'employee' filter
   */
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Query for either IT-Associations or "normal" Associations. `None` returns all.
   *
   * This field is needed to replicate the functionality in the service API:
   * `?it=1`
   *
   */
  it_association?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Organisation Unit filter limiting which entries are returned.
   *
   */
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Organisational Unit UUID filter limiting which entries are returned.
   *
   * | `org_units`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'org_unit' filter
   */
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<AssociationRegistrationFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** Association registration filter. */
export type AssociationRegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type AssociationResponse = {
  __typename?: 'AssociationResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<Association>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<Association>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<Association>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type AssociationResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type AssociationResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type AssociationResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type AssociationResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type AssociationResponsePaged = {
  __typename?: 'AssociationResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<AssociationResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type AssociationTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID for the association we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type AssociationUpdateInput = {
  /** Association type uuid. */
  association_type?: InputMaybe<Scalars['UUID']['input']>;
  /**
   * Employee uuid.
   * @deprecated Use 'person' instead. Will be removed in a future version of OS2mo.
   */
  employee?: InputMaybe<Scalars['UUID']['input']>;
  /** org-unit uuid. */
  org_unit?: InputMaybe<Scalars['UUID']['input']>;
  /** Employee uuid. */
  person?: InputMaybe<Scalars['UUID']['input']>;
  /** Primary field of the association */
  primary?: InputMaybe<Scalars['UUID']['input']>;
  /** Substitute uuid. */
  substitute?: InputMaybe<Scalars['UUID']['input']>;
  /** Trade union uuid. */
  trade_union?: InputMaybe<Scalars['UUID']['input']>;
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the association we want to update. */
  uuid: Scalars['UUID']['input'];
  /** Validity range for the org-unit. */
  validity: RaValidityInput;
};

/**
 * AuditLog entry.
 *
 * Mostly useful for auditing purposes seeing when data-reads were done and by whom.
 *
 */
export type AuditLog = {
  __typename?: 'AuditLog';
  /**
   * UUID of the actor (integration or user) who changed the data.
   *
   * Note:
   * Currently mostly returns `"42c432e8-9c4a-11e6-9f62-873cf34a735f"`.
   * Will eventually contain for the UUID of the integration or user who mutated data, based on the JWT token.
   *
   */
  actor: Scalars['UUID']['output'];
  /**
   * UUID of the audit entry itself.
   *
   */
  id: Scalars['UUID']['output'];
  /**
   * Model of the modified entity.
   *
   */
  model: AuditLogModel;
  /**
   * When the read occured.
   *
   * Examples:
   * * `"1970-01-01T00:00:00.000000+00:00"`
   * * `"2019-12-18T12:55:15.348614+00:00"`
   *
   */
  time: Scalars['DateTime']['output'];
  /**
   * UUIDs of entities that were read.
   *
   */
  uuids: Array<Scalars['UUID']['output']>;
};

/** Audit log filter. */
export type AuditLogFilter = {
  /**
   * Filter audit events by their reading actor.
   *
   * Can be used to select all data read by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * ID filter limiting which entries are returned.
   *
   * | `ids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  ids?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Filter audit events by their model type.
   *
   * Can be used to select all reads for a data type.
   *
   * Can be one of:
   * * `"AuditLog"`
   * * `"Bruger"`
   * * `"Facet"`
   * * `"ItSystem"`
   * * `"Klasse"`
   * * `"Organisation"`
   * * `"OrganisationEnhed"`
   * * `"OrganisationFunktion"`
   *
   * | `models`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  models?: InputMaybe<Array<AuditLogModel>>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export enum AuditLogModel {
  AuditLog = 'AUDIT_LOG',
  Class = 'CLASS',
  Facet = 'FACET',
  ItSystem = 'IT_SYSTEM',
  /** @deprecated The root organisation concept will be removed in a future version of OS2mo. */
  Organisation = 'ORGANISATION',
  OrganisationFunction = 'ORGANISATION_FUNCTION',
  OrganisationUnit = 'ORGANISATION_UNIT',
  Person = 'PERSON'
}

/** Result page in cursor-based pagination. */
export type AuditLogPaged = {
  __typename?: 'AuditLogPaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<AuditLog>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

/**
 * A value in the facet sample space.
 *
 * Classes can also be thought of as the value component of the facet/class key-value setup.
 *
 */
export type Class = {
  __typename?: 'Class';
  /**
   * Class children.
   *
   * Almost always an empty list as class hierarchies are rare.
   * Currently mostly used to describe (trade) union hierachies.
   *
   * The inverse operation of `parent`.
   *
   */
  children: Array<Class>;
  /**
   * Example usage.
   *
   * Almost always `null`.
   *
   * @deprecated Will be removed in a future version of GraphQL.
   * This field is almost never used, and serves no real purpose.
   * May be reintroduced in the future if the demand for it increases.
   *
   */
  example?: Maybe<Scalars['String']['output']>;
  /**
   * Facet this class is defined under.
   *
   * Examples of user-keys:
   * * `"employee_address_type"`
   * * `"primary_type"`
   * * `"engagement_job_function"`
   *
   */
  facet: Facet;
  /**
   * UUID of the related facet.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `facet {uuid}` instead.
   *
   */
  facet_uuid: Scalars['UUID']['output'];
  /**
   * Full name of the class, exactly the same as `name`.
   *
   * @deprecated Will be removed in a future version of GraphQL.
   * Returns exactly the same as `name`, use that instead.
   *
   */
  full_name: Scalars['String']['output'];
  /**
   * The IT-System associated with the class.
   *
   * This is intended to be used for (IT) roles.
   *
   */
  it_system?: Maybe<ItSystem>;
  /**
   * The IT-System associated with the class.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `it_system {uuid}` instead.
   *
   */
  it_system_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Human readable name of the class.
   *
   * This is the value that should be shown to users in UIs.
   *
   * Examples:
   * * `"Primary"`
   * * `"Phone number"`
   * * `"Jurist"`
   * * `"Paragraph 11 Hire"`
   *
   */
  name: Scalars['String']['output'];
  /**
   * UUID of the related organisation.
   * @deprecated The root organisation concept will be removed in a future version of OS2mo.
   *
   */
  org_uuid: Scalars['UUID']['output'];
  /** Owner of class */
  owner?: Maybe<Scalars['UUID']['output']>;
  /**
   * Parent class.
   *
   * Almost always `null` as class hierarchies are rare.
   * Currently mostly used to describe (trade) union hierachies.
   *
   * The inverse operation of `children`.
   *
   */
  parent?: Maybe<Class>;
  /**
   * UUID of the employee related to the address.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `parent {uuid}` instead.
   *
   */
  parent_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Published state of the class object.
   *
   * Whether the class is published or not, aka. if it should be shown.
   *
   * Examples:
   * * `"Publiceret"`
   * * `"IkkePubliceret"`
   * * `"Normal"`
   *
   * Note:
   * Return change may change to an enum in the future.
   *
   * May eventually be superseeded by validities on classes.
   *
   */
  published?: Maybe<Scalars['String']['output']>;
  /**
   * Scope of the class.
   *
   * The scope of the class describes the kind of values that can be contained when using the class.
   * It has different implications depending on the associated facet.
   *
   * Below is a non-exhaustive list of scope values for a non-exhaustive list of facets:
   *
   * Facet `visibility`; scope controls visibility classes:
   * * `"PUBLIC"`: The entity can be shared publicly.
   * * `"SECRET"`: The entity should not be shared publicly.
   *
   * Facet `primary_type`; scope controls how primary the class is:
   * * `"0"`: Not primary.
   * * `"3000"`: Primary.
   * * `"5000"`: Explicitly primary / override.
   *
   * A lot of facets; scope controls input-validation:
   * * `"TEXT"`: The input can be any text string.
   * * `"PHONE"`: The input must match OS2mo's phone number regex.
   * * `"PNUMBER"`: The input must match OS2mo's p-number regex.
   * * `"EMAIL"`: The input must match OS2mo's email regex.
   * * `"DAR"`: The input must be a DAR UUID.
   *
   */
  scope?: Maybe<Scalars['String']['output']>;
  /**
   * Facet of this class's upmost parent.
   *
   * The result of following `parent` until `parent` becomes `null`, then calling `facet`.
   *
   * Almost always the same as `facet` as class hierarchies are rare.
   * Currently mostly used to describe (trade) union hierachies.
   *
   * @deprecated Will be removed in a future version of GraphQL.
   * Will either be replaced by client-side recursion, an ancestor field or a recursive schema directive.
   * For now client-side recursion is the preferred replacement.
   *
   */
  top_level_facet: Facet;
  /**
   * The object type.
   *
   * Always contains the string `class`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /**
   * Short unique key.
   *
   * Usually set to the `name` provided on object creation.
   * May also be set to the key used in external systems or a system-name.
   *
   * Usually also used as the machine "value" for the class.
   *
   * Examples:
   * * `"primary"`
   * * `"PhoneEmployee"`
   * * `"Jurist"`
   * * `"X-418"`
   *
   */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the class. */
  validity: OpenValidity;
};


/**
 * A value in the facet sample space.
 *
 * Classes can also be thought of as the value component of the facet/class key-value setup.
 *
 */
export type ClassChildrenArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ParentsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * A value in the facet sample space.
 *
 * Classes can also be thought of as the value component of the facet/class key-value setup.
 *
 */
export type ClassFacetArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundFacetFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * A value in the facet sample space.
 *
 * Classes can also be thought of as the value component of the facet/class key-value setup.
 *
 */
export type ClassIt_SystemArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundItSystemFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * A value in the facet sample space.
 *
 * Classes can also be thought of as the value component of the facet/class key-value setup.
 *
 */
export type ClassParentArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type ClassCreateInput = {
  /** Example usage. */
  example?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the related facet. */
  facet_uuid: Scalars['UUID']['input'];
  /** UUID of the associated IT-system. */
  it_system_uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Mo-class name. */
  name: Scalars['String']['input'];
  /** Owner of class */
  owner?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the parent class. */
  parent_uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Published state of the class object. */
  published?: Scalars['String']['input'];
  /** Scope of the class. */
  scope?: InputMaybe<Scalars['String']['input']>;
  /** Extra info or uuid */
  user_key: Scalars['String']['input'];
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Validity range for the class. */
  validity: ValidityInput;
};

/** Class filter. */
export type ClassFilter = {
  /**
   * Facet filter limiting which entries are returned.
   *
   */
  facet?: InputMaybe<FacetFilter>;
  /**
   * Facet user-key filter limiting which entries are returned.
   *
   * | `facet_user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'facet' filter
   */
  facet_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * Facet UUID filter limiting which entries are returned.
   *
   * | `facets`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'facet' filter
   */
  facets?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * IT-System filter limiting which entries are returned.
   *
   */
  it_system?: InputMaybe<ItSystemFilter>;
  /**
   * Owner filter limiting which entries are returned.
   *
   */
  owner?: InputMaybe<ClassOwnerFilter>;
  /**
   * Parent filter limiting which entries are returned.
   *
   */
  parent?: InputMaybe<ClassFilter>;
  /**
   * Parent user-key filter limiting which entries are returned.
   *
   * | `parent_user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'parent' filter
   */
  parent_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * Parent UUID filter limiting which entries are returned.
   *
   * | `parents`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'parent' filter
   */
  parents?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<ClassRegistrationFilter>;
  /**
   * Scope filter limiting which entries are returned.
   *
   * | `scope`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  scope?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** Class owner filter */
export type ClassOwnerFilter = {
  /**
   * Select organisation units which have an ancestor matching the given filter.
   *
   * Note that every node is its own ancestor as per [CLRS] 12.2-6.
   *
   * Given the following tree:
   * ```
   * A
   * ├── B
   * │   ├── C
   * │   │   └── D
   * │   └── E
   * └── F
   * ```
   * the `ancestor` filter behaves according to the following table:
   *
   * | Filter | Returned    |
   * |--------|-------------|
   * |      A | A B C D E F |
   * |      B | B C D E     |
   * |      C | C D         |
   * |      D | D           |
   * |      E | E           |
   * |      F | F           |
   *
   */
  ancestor?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Select organisation units which have a descendant matching the given filter.
   *
   * Note that every node is its own descendant as per [CLRS] 12.2-6.
   *
   * Given the following tree:
   * ```
   * A
   * ├── B
   * │   ├── C
   * │   │   └── D
   * │   └── E
   * └── F
   * ```
   * the `descendant` filter behaves according to the following table:
   *
   * | Filter | Returned    |
   * |--------|-------------|
   * |      A | A           |
   * |      B | A B         |
   * |      C | A B C       |
   * |      D | A B C D     |
   * |      E | A B E       |
   * |      F | A F         |
   *
   */
  descendant?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Filter organisation units to only include matches pointed to by engagements.
   *
   * Can be used to find organisation units for certain engagements.
   *
   */
  engagement?: InputMaybe<EngagementFilter>;
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Filter organisation units by their organisational hierarchy labels.
   *
   * Can be used to extract a subset of the organisational structure.
   *
   * Examples of user-keys:
   * * `"Line-management"`
   * * `"Self-owned institution"`
   * * `"Outside organisation"`
   * * `"Hidden"`
   *
   * Note:
   * The organisation-gatekeeper integration is one option to keep hierarchy labels up-to-date.
   *
   * | `hierarchies`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'hierarchy' filter
   */
  hierarchies?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Hierarchy filter limiting which entries are returned.
   *
   * Filter organisation units by their organisational hierarchy labels.
   *
   * Can be used to extract a subset of the organisational structure.
   *
   * Examples of user-keys:
   * * `"Line-management"`
   * * `"Self-owned institution"`
   * * `"Outside organisation"`
   * * `"Hidden"`
   *
   * Note:
   * The organisation-gatekeeper integration is one option to keep hierarchy labels up-to-date.
   *
   */
  hierarchy?: InputMaybe<ClassFilter>;
  /**
   * Include classes with `owner=None`.
   *
   */
  include_none?: Scalars['Boolean']['input'];
  /**
   * Name filter finding exact matches by name.
   *
   * | `names`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  names?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * Select organisation units whose parent matches the given filter.
   *
   * Set to `None` to find root units.
   *
   */
  parent?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Parent UUID filter limiting which entries are returned.
   *
   * | `parents`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'parent' filter
   */
  parents?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Free text search.
   *
   * Does best effort lookup to find entities matching the query string.
   * No quarantees are given w.r.t. the entries returned.
   *
   */
  query?: InputMaybe<Scalars['String']['input']>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<OrganisationUnitRegistrationFilter>;
  /** @deprecated Renamed to 'descendant' */
  subtree?: InputMaybe<OrganisationUnitFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** Class registration filter. */
export type ClassRegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ClassResponse = {
  __typename?: 'ClassResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<Class>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<Class>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<Class>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ClassResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ClassResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ClassResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ClassResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type ClassResponsePaged = {
  __typename?: 'ClassResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<ClassResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type ClassTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID for the class we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type ClassUpdateInput = {
  /** Example usage. */
  example?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the related facet. */
  facet_uuid: Scalars['UUID']['input'];
  /** UUID of the associated IT-system. */
  it_system_uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Mo-class name. */
  name: Scalars['String']['input'];
  /** Owner of class */
  owner?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the parent class. */
  parent_uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Published state of the class object. */
  published?: Scalars['String']['input'];
  /** Scope of the class. */
  scope?: InputMaybe<Scalars['String']['input']>;
  /** Extra info or uuid */
  user_key: Scalars['String']['input'];
  /** UUID of the class to update. */
  uuid: Scalars['UUID']['input'];
  /** Validity range for the class. */
  validity: ValidityInput;
};

/** A configuration setting. */
export type Configuration = {
  __typename?: 'Configuration';
  /**
   * JSONified settings value.
   *
   * Examples:
   * * `"true"`
   * * `"\"\""`
   * * `"null"`
   * * `"[]"`
   *
   */
  jsonified_value: Scalars['String']['output'];
  /**
   * The unique settings identifier.
   *
   * Examples:
   * * `commit_tag`
   * * `environment`
   * * `confdb_show_roles`
   *
   */
  key: Scalars['String']['output'];
  /**
   * Stringified settings value.
   *
   * Examples:
   * * `"True"`
   * * `""`
   * * `"None"`
   * * `"[]"`
   *
   */
  stringified_value: Scalars['String']['output'];
};

/** Configuration filter. */
export type ConfigurationFilter = {
  /**
   * Key filter limiting which entries are returned.
   *
   * | `identifiers`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  identifiers?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Result page in cursor-based pagination. */
export type ConfigurationPaged = {
  __typename?: 'ConfigurationPaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<Configuration>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type DarAddress = ResolvedAddress & {
  __typename?: 'DARAddress';
  description: Scalars['String']['output'];
  door?: Maybe<Scalars['String']['output']>;
  floor?: Maybe<Scalars['String']['output']>;
  house_number: Scalars['String']['output'];
  href: Scalars['String']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  municipality_code: Scalars['String']['output'];
  name: Scalars['String']['output'];
  road_code: Scalars['Int']['output'];
  road_name: Scalars['String']['output'];
  streetmap_href?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
  zip_code: Scalars['String']['output'];
  zip_code_name: Scalars['String']['output'];
};

export type DefaultAddress = ResolvedAddress & {
  __typename?: 'DefaultAddress';
  value: Scalars['String']['output'];
};

/** Employee/identity specific information */
export type Employee = {
  __typename?: 'Employee';
  /**
   * Addresses for the employee.
   *
   * Commonly contain addresses such as, their:
   * * Work location
   * * Office number
   * * Work phone number
   * * Work email
   * * Personal phone number
   * * Personal email
   *
   */
  addresses: Array<Address>;
  /**
   * Same as addresses(), but with HACKs to enable validities.
   *
   * @deprecated Should only be used to query addresses when validity dates have been specified, "
   * "ex from_date & to_date."
   * "Will be removed when sub-query date handling is implemented.
   *
   */
  addresses_validity: Array<Address>;
  /**
   * Associations for the employee.
   *
   * May be an empty list if the employee is not associated with projects, etc.
   *
   */
  associations: Array<Association>;
  /**
   * Same as associations(), but with HACKs to enable validities.
   *
   * @deprecated Should only be used to query associations when validity dates have been specified, "
   * "ex from_date & to_date."
   * "Will be removed when sub-query date handling is implemented.
   *
   */
  associations_validity: Array<Association>;
  /**
   * CPR number of the employee.
   * @deprecated Use 'cpr_number' instead. Will be removed in a future version of OS2mo.
   */
  cpr_no?: Maybe<Scalars['CPR']['output']>;
  /** CPR number of the employee. */
  cpr_number?: Maybe<Scalars['CPR']['output']>;
  /**
   * Engagements for the employee.
   *
   * May be an empty list if the employee is not employeed.
   *
   */
  engagements: Array<Engagement>;
  /**
   * Same as engagements(), but with HACKs to enable validities.
   *
   * @deprecated Should only be used to query engagements when validity dates have been specified, "
   * "ex from_date & to_date."
   * "Will be removed when sub-query date handling is implemented.
   *
   */
  engagements_validity: Array<Engagement>;
  /** Given name of the employee. */
  given_name: Scalars['String']['output'];
  /**
   * Given name of the employee.
   * @deprecated Use 'given_name' instead. Will be removed in a future version of OS2mo.
   */
  givenname: Scalars['String']['output'];
  /**
   * IT accounts for the employee.
   *
   * May be an empty list if the employee does not have any IT-access whatsoever.
   *
   */
  itusers: Array<ItUser>;
  /**
   * Same as itusers(), but with HACKs to enable validities.
   *
   * @deprecated Should only be used to query itusers when validity dates have been specified, "
   * "ex from_date & to_date."
   * "Will be removed when sub-query date handling is implemented.
   *
   */
  itusers_validity: Array<ItUser>;
  /**
   * Leaves of absence for the employee.
   *
   * Usually empty as most employees are not on leaves of absence.
   *
   */
  leaves: Array<Leave>;
  /**
   * Managerial roles for the employee.
   *
   * Usually an empty list as most employees are not managers.
   *
   */
  manager_roles: Array<Manager>;
  /** Full name of the employee */
  name: Scalars['String']['output'];
  /** Full nickname of the employee */
  nickname: Scalars['String']['output'];
  /** Given name part of nickname of the employee. */
  nickname_given_name?: Maybe<Scalars['String']['output']>;
  /**
   * Given name part of nickname of the employee.
   * @deprecated Use 'nickname_given_name' instead. Will be removed in a future version of OS2mo.
   */
  nickname_givenname?: Maybe<Scalars['String']['output']>;
  /** Surname part of nickname of the employee. */
  nickname_surname?: Maybe<Scalars['String']['output']>;
  /** Seniority of the employee. */
  seniority?: Maybe<Scalars['Date']['output']>;
  /** Surname of the employee. */
  surname: Scalars['String']['output'];
  /**
   * The object type.
   *
   * Always contains the string `employee`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /**
   * Short unique key.
   *
   * Usually set to be set to the key used in external systems.
   *
   * Defaults to the `uuid` generated on object creation.
   *
   * Examples:
   * * `"1462"`
   * * `"XSIMP"`
   *
   */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the employee. */
  validity: OpenValidity;
};


/** Employee/identity specific information */
export type EmployeeAddressesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EmployeesBoundAddressFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Employee/identity specific information */
export type EmployeeAssociationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EmployeesBoundAssociationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Employee/identity specific information */
export type EmployeeEngagementsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EmployeesBoundEngagementFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Employee/identity specific information */
export type EmployeeItusersArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EmployeesBoundItUserFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Employee/identity specific information */
export type EmployeeLeavesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EmployeesBoundLeaveFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Employee/identity specific information */
export type EmployeeManager_RolesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EmployeesBoundManagerFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type EmployeeCreateInput = {
  /** Danish CPR number of the employee. */
  cpr_number?: InputMaybe<Scalars['CPR']['input']>;
  /** Givenname (firstname) of the employee. */
  given_name: Scalars['String']['input'];
  /** Nickname givenname (firstname) of the employee. */
  nickname_given_name?: InputMaybe<Scalars['String']['input']>;
  /** Nickname surname (lastname) of the employee. */
  nickname_surname?: InputMaybe<Scalars['String']['input']>;
  /** New seniority value of the employee. */
  seniority?: InputMaybe<Scalars['Date']['input']>;
  /** Surname (lastname) of the employee. */
  surname: Scalars['String']['input'];
  /** Short, unique key for the employee (defaults to object UUID on creation). */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
};

/** Employee filter. */
export type EmployeeFilter = {
  /**
   * CPR number filter limiting which entries are returned.
   *
   * | `cpr_numbers`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  cpr_numbers?: InputMaybe<Array<Scalars['CPR']['input']>>;
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Free text search.
   *
   * Does best effort lookup to find entities matching the query string.
   * No quarantees are given w.r.t. the entries returned.
   *
   */
  query?: InputMaybe<Scalars['String']['input']>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<EmployeeRegistrationFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** Employee registration filter. */
export type EmployeeRegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type EmployeeResponse = {
  __typename?: 'EmployeeResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<Employee>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<Employee>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<Employee>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type EmployeeResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type EmployeeResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type EmployeeResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type EmployeeResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type EmployeeResponsePaged = {
  __typename?: 'EmployeeResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<EmployeeResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type EmployeeTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID for the employee we want to terminate. */
  uuid: Scalars['UUID']['input'];
  /** Mark related manager functions as vacated */
  vacate?: Scalars['Boolean']['input'];
};

export type EmployeeUpdateInput = {
  /** Danish CPR number of the employee. */
  cpr_number?: InputMaybe<Scalars['CPR']['input']>;
  /** New first-name value of the employee nickname. */
  given_name?: InputMaybe<Scalars['String']['input']>;
  /** Nickname givenname (firstname) of the employee. */
  nickname_given_name?: InputMaybe<Scalars['String']['input']>;
  /** Nickname surname (lastname) of the employee. */
  nickname_surname?: InputMaybe<Scalars['String']['input']>;
  /** New seniority value of the employee. */
  seniority?: InputMaybe<Scalars['Date']['input']>;
  /** New last-name value of the employee nickname. */
  surname?: InputMaybe<Scalars['String']['input']>;
  /** Short, unique key for the employee (defaults to object UUID on creation). */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the employee to be updated. */
  uuid: Scalars['UUID']['input'];
  /** Validity range for the change. */
  validity: RaValidityInput;
};

export type EmployeesBoundAddressFilter = {
  address_type?: InputMaybe<ClassFilter>;
  address_type_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  address_types?: InputMaybe<Array<Scalars['UUID']['input']>>;
  employee?: InputMaybe<EmployeeFilter>;
  engagement?: InputMaybe<EngagementFilter>;
  engagements?: InputMaybe<Array<Scalars['UUID']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  ituser?: InputMaybe<ItUserFilter>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<AddressRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
  visibility?: InputMaybe<ClassFilter>;
};

export type EmployeesBoundAssociationFilter = {
  association_type?: InputMaybe<ClassFilter>;
  association_type_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  association_types?: InputMaybe<Array<Scalars['UUID']['input']>>;
  employee?: InputMaybe<EmployeeFilter>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  it_association?: InputMaybe<Scalars['Boolean']['input']>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<AssociationRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type EmployeesBoundEngagementFilter = {
  employee?: InputMaybe<EmployeeFilter>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  job_function?: InputMaybe<ClassFilter>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<EngagementRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type EmployeesBoundItUserFilter = {
  employee?: InputMaybe<EmployeeFilter>;
  engagement?: InputMaybe<EngagementFilter>;
  external_ids?: InputMaybe<Array<Scalars['String']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  itsystem?: InputMaybe<ItSystemFilter>;
  itsystem_uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<ItUserRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type EmployeesBoundLeaveFilter = {
  employee?: InputMaybe<EmployeeFilter>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<LeaveRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type EmployeesBoundManagerFilter = {
  employee?: InputMaybe<EmployeeFilter>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<ManagerRegistrationFilter>;
  responsibility?: InputMaybe<ClassFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** Employee engagement in an organisation unit */
export type Engagement = {
  __typename?: 'Engagement';
  /**
   * The employee fulfilling the engagement.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   * @deprecated Use 'person' instead. Will be removed in a future version of OS2mo.
   */
  employee: Array<Employee>;
  /**
   * UUID of the employee related to the engagement.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `employee {uuid}` instead.
   *
   */
  employee_uuid: Scalars['UUID']['output'];
  /**
   * Describes the employee's affiliation to an organisation unit
   *
   * Examples:
   * * `"Employed"`
   * * `"Social worker"`
   * * `"Employee (hourly wage)"`
   *
   */
  engagement_type: Class;
  /**
   * UUID of the engagement type class.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `engagement_type {uuid}` instead.
   *
   */
  engagement_type_uuid: Scalars['UUID']['output'];
  /**
   * Same as engagement_type, but with HACKs to enable validities.
   *
   * @deprecated Should only be used to query engagement_type when validity dates have been specified, "
   * "ex from_date & to_date."
   * "Will be removed when sub-query date handling is implemented.
   *
   */
  engagement_type_validity?: Maybe<Class>;
  /** Optional extra information. */
  extension_1?: Maybe<Scalars['String']['output']>;
  /** Optional extra information. */
  extension_2?: Maybe<Scalars['String']['output']>;
  /** Optional extra information. */
  extension_3?: Maybe<Scalars['String']['output']>;
  /** Optional extra information. */
  extension_4?: Maybe<Scalars['String']['output']>;
  /** Optional extra information. */
  extension_5?: Maybe<Scalars['String']['output']>;
  /** Optional extra information. */
  extension_6?: Maybe<Scalars['String']['output']>;
  /** Optional extra information. */
  extension_7?: Maybe<Scalars['String']['output']>;
  /** Optional extra information. */
  extension_8?: Maybe<Scalars['String']['output']>;
  /** Optional extra information. */
  extension_9?: Maybe<Scalars['String']['output']>;
  /** Optional extra information. */
  extension_10?: Maybe<Scalars['String']['output']>;
  /** Indication of contribution to the collection of engagements for the given employee. */
  fraction?: Maybe<Scalars['Int']['output']>;
  /**
   * Whether this engagement is the primary engagement.
   *
   * Checks if the `primary` field contains either a class with user-key: `"primary"` or `"explicitly-primary"`.
   *
   */
  is_primary: Scalars['Boolean']['output'];
  /**
   * Describes the position of the employee in the organisation unit
   *
   * Examples:
   * * `"Payroll consultant"`
   * * `"Office student"`
   * * `"Jurist"`
   *
   */
  job_function: Class;
  /**
   * UUID of the job function class.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `job_function {uuid}` instead.
   *
   */
  job_function_uuid: Scalars['UUID']['output'];
  /** Related leave */
  leave?: Maybe<Leave>;
  /**
   * UUID of the leave related to the engagement.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `leave {uuid}` instead.
   *
   */
  leave_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * The organisation unit where the engagement is being fulfilled.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  org_unit: Array<OrganisationUnit>;
  /**
   * UUID of the organisation unit related to the engagement.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `org_unit {uuid}` instead.
   *
   */
  org_unit_uuid: Scalars['UUID']['output'];
  /**
   * The person fulfilling the engagement.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  person: Array<Employee>;
  /**
   * Marks which engagement is primary.
   *
   * When exporting data from OS2mo to external systems, that only support a single engagement or associations, this field can be used to export the primary one.
   * What primarity means is vaguely defined, but usually derived from workload or time-allocation.
   *
   * Examples  of user-keys:
   * * `"primary"`
   * * `"non-primary"`
   * * `"explicitly-primary"`
   *
   * It is a convention that at most one engagement for each employee is set as either `primary` or `explicitly-primary`.
   * This convention is in place as if more engagements are primary, the entire purpose of the field breaks down.
   * In the future this convention may become an invariant.
   *
   * Note:
   * The calculate-primary integration can be used to automatically calculate and update primarity fields.
   *
   */
  primary?: Maybe<Class>;
  /**
   * UUID of the primary klasse of the engagement.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `primary {uuid}` instead.
   *
   */
  primary_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * The object type.
   *
   * Always contains the string `engagement`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /**
   * Short unique key.
   *
   * Usually set to the `id` used in external systems.
   *
   * Examples:
   * * `"11009"`
   * * `"02782"`
   *
   */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the engagement object. */
  validity: Validity;
};


/** Employee engagement in an organisation unit */
export type EngagementEmployeeArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Employee engagement in an organisation unit */
export type EngagementEngagement_TypeArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Employee engagement in an organisation unit */
export type EngagementJob_FunctionArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Employee engagement in an organisation unit */
export type EngagementLeaveArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundLeaveFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Employee engagement in an organisation unit */
export type EngagementOrg_UnitArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundOrganisationUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Employee engagement in an organisation unit */
export type EngagementPersonArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Employee engagement in an organisation unit */
export type EngagementPrimaryArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type EngagementCreateInput = {
  /**
   * UUID of the related employee.
   * @deprecated Use 'person' instead. Will be removed in a future version of OS2mo.
   */
  employee?: InputMaybe<Scalars['UUID']['input']>;
  engagement_type: Scalars['UUID']['input'];
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_1?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_2?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_3?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_4?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_5?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_6?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_7?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_8?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_9?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_10?: InputMaybe<Scalars['String']['input']>;
  job_function: Scalars['UUID']['input'];
  /** The related org-unit object. */
  org_unit: Scalars['UUID']['input'];
  /** UUID of the related employee. */
  person?: InputMaybe<Scalars['UUID']['input']>;
  /** Primary field of the engagement */
  primary?: InputMaybe<Scalars['UUID']['input']>;
  /** Name or UUID of the related engagement. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Validity of the engagement object. */
  validity: RaValidityInput;
};

/** Engagement filter. */
export type EngagementFilter = {
  /**
   * Employee filter limiting which entries are returned.
   *
   */
  employee?: InputMaybe<EmployeeFilter>;
  /**
   * Employee UUID filter limiting which entries are returned.
   *
   * | `employees`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'employee' filter
   */
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Job function filter limiting which entries are returned.
   *
   */
  job_function?: InputMaybe<ClassFilter>;
  /**
   * Organisation Unit filter limiting which entries are returned.
   *
   */
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Organisational Unit UUID filter limiting which entries are returned.
   *
   * | `org_units`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'org_unit' filter
   */
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<EngagementRegistrationFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** Engagement registration filter. */
export type EngagementRegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type EngagementResponse = {
  __typename?: 'EngagementResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<Engagement>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<Engagement>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<Engagement>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type EngagementResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type EngagementResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type EngagementResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type EngagementResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type EngagementResponsePaged = {
  __typename?: 'EngagementResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<EngagementResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type EngagementTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID for the engagement we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type EngagementUpdateInput = {
  /**
   * UUID of the related employee.
   * @deprecated Use 'person' instead. Will be removed in a future version of OS2mo.
   */
  employee?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the engagement type. */
  engagement_type?: InputMaybe<Scalars['UUID']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_1?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_2?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_3?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_4?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_5?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_6?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_7?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_8?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_9?: InputMaybe<Scalars['String']['input']>;
  /**
   * Arbitrary value extension fields.
   *
   * A collection of field for storing arbitrary extra data.
   * Can be used for extraordinary occasions when no standardized field to model the data exists.
   *
   *
   */
  extension_10?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the job function. */
  job_function?: InputMaybe<Scalars['UUID']['input']>;
  /** The related org-unit object. */
  org_unit?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the related employee. */
  person?: InputMaybe<Scalars['UUID']['input']>;
  /** Primary field of the engagement */
  primary?: InputMaybe<Scalars['UUID']['input']>;
  /** Name or UUID of the related engagement. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the Engagement you want to update. */
  uuid: Scalars['UUID']['input'];
  /** Validity of the engagement object. */
  validity: RaValidityInput;
};

/** The key component of the class/facet choice setup */
export type Facet = {
  __typename?: 'Facet';
  /**
   * Facet children.
   *
   * Almost always an empty list as facet hierarchies are rare.
   * Currently mostly used to describe (trade) union hierachies.
   *
   * The inverse operation of `parent`.
   *
   */
  children: Array<Facet>;
  /** Associated classes */
  classes: Array<Class>;
  /**
   * Description of the facet object.
   *
   * Almost always `""`.
   *
   * @deprecated Will be removed in a future version of GraphQL.
   * This field is almost never used, and serves no real purpose.
   * May be reintroduced in the future if the demand for it increases.
   *
   */
  description?: Maybe<Scalars['String']['output']>;
  /**
   * UUID of the related organisation.
   * @deprecated The root organisation concept will be removed in a future version of OS2mo.
   *
   */
  org_uuid: Scalars['UUID']['output'];
  /**
   * Parent facet.
   *
   * Almost always `null` as facet hierarchies are rare.
   * Currently mostly used to describe (trade) union hierachies.
   *
   * The inverse operation of `children`.
   *
   */
  parent?: Maybe<Facet>;
  /**
   * UUID of the parent facet.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `parent {uuid}` instead.
   *
   */
  parent_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Published state of the facet object.
   *
   * Whether the facet is published or not, aka. if it should be shown.
   *
   * Examples:
   * * `"Publiceret"`
   * * `"IkkePubliceret"`
   * * `"Normal"`
   *
   * Note:
   * Return change may change to an enum in the future.
   *
   * May eventually be superseeded by validities on facets.
   *
   */
  published?: Maybe<Scalars['String']['output']>;
  /**
   * The object type.
   *
   * Always contains the string `facet`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /** Short, unique key. */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the facet. */
  validity: OpenValidity;
};


/** The key component of the class/facet choice setup */
export type FacetChildrenArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ParentsBoundFacetFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** The key component of the class/facet choice setup */
export type FacetClassesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<FacetsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** The key component of the class/facet choice setup */
export type FacetParentArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundFacetFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type FacetCreateInput = {
  /** Published state of the facet object. */
  published?: Scalars['String']['input'];
  /** Facet name. */
  user_key: Scalars['String']['input'];
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Validity range for the facet. Default to ['-infinity', 'infinity'] */
  validity: ValidityInput;
};

/** Facet filter. */
export type FacetFilter = {
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Parent filter limiting which entries are returned.
   *
   */
  parent?: InputMaybe<FacetFilter>;
  /**
   * Parent user-key filter limiting which entries are returned.
   *
   * | `parent_user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'parent' filter
   */
  parent_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * Parent UUID filter limiting which entries are returned.
   *
   * | `parents`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'parent' filter
   */
  parents?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<FacetRegistrationFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** Facet registration filter. */
export type FacetRegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type FacetResponse = {
  __typename?: 'FacetResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<Facet>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<Facet>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<Facet>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type FacetResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type FacetResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type FacetResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type FacetResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type FacetResponsePaged = {
  __typename?: 'FacetResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<FacetResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type FacetTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID for the facet we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type FacetUpdateInput = {
  /** Published state of the facet object. */
  published?: Scalars['String']['input'];
  /** Facet name. */
  user_key: Scalars['String']['input'];
  /** UUID of the facet to update. */
  uuid: Scalars['UUID']['input'];
  /** Validity range for the facet. Default to ['-infinity', 'infinity'] */
  validity: ValidityInput;
};

export type FacetsBoundClassFilter = {
  facet?: InputMaybe<FacetFilter>;
  facet_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  it_system?: InputMaybe<ItSystemFilter>;
  owner?: InputMaybe<ClassOwnerFilter>;
  parent?: InputMaybe<ClassFilter>;
  parent_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  parents?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<ClassRegistrationFilter>;
  scope?: InputMaybe<Array<Scalars['String']['input']>>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** A stored file available for download. */
export type File = {
  __typename?: 'File';
  /**
   * The base64 encoded contents of the file.
   *
   * Examples:
   * * A text file:
   * ```
   * TW96aWxsYSBQdWJsaWMgTGljZW5zZSBWZXJzaW9uIDIuMAo
   * ...
   * ```
   * * A binary file:
   * ```
   * f0VMRgIBAQAAAAAAAAAAAAIAPgABAAAAoF5GAAAA
   * ...
   * ```
   *
   * Note:
   * While this works for binary and text files alike, it may be preferable to use `text_contents` for text files.
   *
   */
  base64_contents: Scalars['String']['output'];
  /**
   * Name of the file.
   *
   * Examples:
   * * `"report.odt"`
   * * `"result.csv"`
   *
   */
  file_name: Scalars['String']['output'];
  /**
   * The store the file is in.
   *
   * The FileStore type lists all possible enum values.
   *
   */
  file_store: FileStore;
  /**
   * The textual contents of the file.
   *
   * Examples:
   * * A csv-file:
   * ```
   * Year,Model,Make
   * 1997,Ford,E350
   * 2000,Mercury,Cougar
   * ...
   * ```
   * * A textual report:
   * ```
   * Status of this Memo
   *
   * This document specifies an Internet standards track
   * ...
   * ```
   *
   * Note:
   * This should only be used for text files formats such as `.txt` or `.csv`.
   * For binary formats please use `base64_contents` instead.
   *
   */
  text_contents: Scalars['String']['output'];
};

/** File filter. */
export type FileFilter = {
  /**
   * Filename filter limiting which entries are returned.
   *
   * | `file_names`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  file_names?: InputMaybe<Array<Scalars['String']['input']>>;
  /** File Store enum deciding which file-store to fetch files from. */
  file_store: FileStore;
};

/** Result page in cursor-based pagination. */
export type FilePaged = {
  __typename?: 'FilePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<File>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

/**
 * Enum for all the supported file stores.
 *
 * File stores can be thought of a separate folders or drives in desktop computing.
 *
 */
export enum FileStore {
  /**
   * The exports file store.
   *
   * Used to hold files uploaded by export jobs.
   *
   */
  Exports = 'EXPORTS',
  /**
   * The insights file store.
   *
   * Used to hold data-files supporting the insights functionality in OS2mo.
   *
   */
  Insights = 'INSIGHTS'
}

/** Status on whether a specific subsystem is working */
export type Health = {
  __typename?: 'Health';
  /**
   * Healthcheck identifier.
   *
   * Examples:
   * * `"dataset"`
   * * `"dar"`
   * * `"amqp"`
   *
   */
  identifier: Scalars['String']['output'];
  /**
   * Healthcheck status.
   *
   * Returns:
   * * `true` if the healthcheck passed
   * * `false` if the healthcheck failed
   * * `null` if the healthcheck is irrelevant (submodule not loaded, etc)
   *
   * Note:
   * Querying the healthcheck status executes the underlying healthcheck directly.
   * Excessively querying this endpoint may have performance implications.
   *
   */
  status?: Maybe<Scalars['Boolean']['output']>;
};

/** Health filter. */
export type HealthFilter = {
  /**
   * Healthcheck identifiers filter limiting which entries are returned.
   *
   * | `identifiers`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  identifiers?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Result page in cursor-based pagination. */
export type HealthPaged = {
  __typename?: 'HealthPaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<Health>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type ItAssociationCreateInput = {
  /** IT-user UUID */
  it_user: Scalars['UUID']['input'];
  /** Job function UUID */
  job_function: Scalars['UUID']['input'];
  /** org-unit uuid. */
  org_unit: Scalars['UUID']['input'];
  /** UUID of the employee */
  person: Scalars['UUID']['input'];
  /** Primary field of the association */
  primary?: InputMaybe<Scalars['UUID']['input']>;
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Validity range for the org-unit. */
  validity: RaValidityInput;
};

export type ItAssociationTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID for the ITAssociation we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type ItAssociationUpdateInput = {
  /** IT-user UUID */
  it_user?: InputMaybe<Scalars['UUID']['input']>;
  /** Job function UUID */
  job_function?: InputMaybe<Scalars['UUID']['input']>;
  /** org-unit uuid. */
  org_unit?: InputMaybe<Scalars['UUID']['input']>;
  /** Primary field of the association */
  primary?: InputMaybe<Scalars['UUID']['input']>;
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the ITAssociation you want to update. */
  uuid: Scalars['UUID']['input'];
  /** Validity range for the org-unit. */
  validity: RaValidityInput;
};

/** Systems that IT users are connected to */
export type ItSystem = {
  __typename?: 'ITSystem';
  /**
   * Human readable name of the itsystem.
   *
   * This is the value that should be shown to users in UIs.
   *
   * Examples:
   * * `"SAP"`
   * * `"Active Directory"`
   * * `"SD UUID"`
   *
   */
  name: Scalars['String']['output'];
  /** The ITSystem type. */
  system_type?: Maybe<Scalars['String']['output']>;
  /**
   * The object type.
   *
   * Always contains the string `itsystem`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /**
   * Short unique key.
   *
   * Usually set to be set to the key used in external systems.
   *
   * Examples:
   * * `"sap_user_uuid"`
   * * `"ad_guid"`
   * * `"sd_employee_uuid"`
   *
   */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the IT system object. */
  validity: OpenValidity;
};

export type ItSystemCreateInput = {
  name: Scalars['String']['input'];
  user_key: Scalars['String']['input'];
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Validity range for the itsystem */
  validity: RaOpenValidityInput;
};

/** IT system filter. */
export type ItSystemFilter = {
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<ItSystemRegistrationFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** ITSystem registration filter. */
export type ItSystemRegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ItSystemResponse = {
  __typename?: 'ITSystemResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<ItSystem>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<ItSystem>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<ItSystem>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ItSystemResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ItSystemResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ItSystemResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ItSystemResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type ItSystemResponsePaged = {
  __typename?: 'ITSystemResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<ItSystemResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type ItSystemTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID for the it-system we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type ItSystemUpdateInput = {
  name: Scalars['String']['input'];
  user_key: Scalars['String']['input'];
  /** UUID for the it-system we want to edit. */
  uuid: Scalars['UUID']['input'];
  /** Validity range for the itsystem */
  validity: RaOpenValidityInput;
};

/**
 * User information related to IT systems.
 *
 * This is commonly used to map out IT accounts or IT service accounts.
 * It is however also used to hold IT system specific identifiers for correlation purposes.
 *
 */
export type ItUser = {
  __typename?: 'ITUser';
  /**
   * Addresses connected with the IT-user.
   *
   * Commonly contain addresses such as:
   * * Email
   * * AD GUID
   * * FK-org UUID
   *
   */
  addresses: Array<Address>;
  /**
   * Employee using the IT account.
   *
   * Note:
   * This field is mutually exclusive with the `org_unit` field.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   * @deprecated Use 'person' instead. Will be removed in a future version of OS2mo.
   */
  employee?: Maybe<Array<Employee>>;
  /**
   * UUID of the employee related to the user.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `employee {uuid}` instead.
   *
   */
  employee_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Engagement scoping of the account.
   *
   * A person may have multiple IT accounts with each account being relevant for only a single engagement.
   * This field allows scoping IT accounts such that it is obvious which engagement has given which it-access.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  engagement?: Maybe<Array<Engagement>>;
  /**
   * UUID of the engagement related to the user.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `engagement {uuid}` instead.
   *
   */
  engagement_uuid?: Maybe<Scalars['UUID']['output']>;
  /** ID of the user account in the external system. */
  external_id?: Maybe<Scalars['String']['output']>;
  /**
   * ITSystem this account is for.
   *
   */
  itsystem: ItSystem;
  /**
   * UUID of the ITSystem related to the user.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `itsystem {uuid}` instead.
   *
   */
  itsystem_uuid: Scalars['UUID']['output'];
  /**
   * Same as itsystem, but with HACKs to enable validities.
   *
   * @deprecated Should only be used to query itsystem when validity dates have been specified, "
   * "ex from_date & to_date."
   * "Will be removed when sub-query date handling is implemented.
   *
   */
  itsystem_validity: ItSystem;
  /**
   * Organisation unit using the IT account.
   *
   * This is mostly set for service accounts.
   *
   * Note:
   * This field is mutually exclusive with the `org_unit` field.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  org_unit?: Maybe<Array<OrganisationUnit>>;
  /**
   * UUID of the organisation unit related to the user.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `org_unit {uuid}` instead.
   *
   */
  org_unit_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Person using the IT account.
   *
   * Note:
   * This field is mutually exclusive with the `org_unit` field.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  person?: Maybe<Array<Employee>>;
  /**
   * Marks which IT account is primary.
   *
   * When exporting data from OS2mo to external systems, that only support a single IT account, this field can be used to export the primary one.
   * What primarity means is vaguely defined, but usually derived from workload or time-allocation.
   *
   * Examples  of user-keys:
   * * `"primary"`
   * * `"non-primary"`
   * * `"explicitly-primary"`
   *
   * It is a convention that at most one IT account for each employee / employee+engagement is set as either `primary` or `explicitly-primary`.
   * This convention is in place as if more IT accounts are primary, the entire purpose of the field breaks down.
   * In the future this convention may become an invariant.
   *
   */
  primary?: Maybe<Class>;
  /**
   * UUID of the primary klasse of the user.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `primary {uuid}` instead.
   *
   */
  primary_uuid?: Maybe<Scalars['UUID']['output']>;
  /** Rolebindings this IT User has in the connected IT system. */
  rolebindings: Array<RoleBinding>;
  /**
   * The object type.
   *
   * Always contains the string `it`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /**
   * Short unique key.
   *
   * Usually set to the key used in external systems.
   *
   * Examples:
   * * `"KarK"`
   * * `"AnkS"`
   * * `"XSIMP"`
   * * `"04184cb6-a5de-47e6-8a08-03cae9ee4c54"`
   *
   */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the IT user object. */
  validity: Validity;
};


/**
 * User information related to IT systems.
 *
 * This is commonly used to map out IT accounts or IT service accounts.
 * It is however also used to hold IT system specific identifiers for correlation purposes.
 *
 */
export type ItUserAddressesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ItuserBoundAddressFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * User information related to IT systems.
 *
 * This is commonly used to map out IT accounts or IT service accounts.
 * It is however also used to hold IT system specific identifiers for correlation purposes.
 *
 */
export type ItUserEmployeeArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * User information related to IT systems.
 *
 * This is commonly used to map out IT accounts or IT service accounts.
 * It is however also used to hold IT system specific identifiers for correlation purposes.
 *
 */
export type ItUserEngagementArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEngagementFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * User information related to IT systems.
 *
 * This is commonly used to map out IT accounts or IT service accounts.
 * It is however also used to hold IT system specific identifiers for correlation purposes.
 *
 */
export type ItUserItsystemArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundItSystemFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * User information related to IT systems.
 *
 * This is commonly used to map out IT accounts or IT service accounts.
 * It is however also used to hold IT system specific identifiers for correlation purposes.
 *
 */
export type ItUserOrg_UnitArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundOrganisationUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * User information related to IT systems.
 *
 * This is commonly used to map out IT accounts or IT service accounts.
 * It is however also used to hold IT system specific identifiers for correlation purposes.
 *
 */
export type ItUserPersonArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * User information related to IT systems.
 *
 * This is commonly used to map out IT accounts or IT service accounts.
 * It is however also used to hold IT system specific identifiers for correlation purposes.
 *
 */
export type ItUserPrimaryArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * User information related to IT systems.
 *
 * This is commonly used to map out IT accounts or IT service accounts.
 * It is however also used to hold IT system specific identifiers for correlation purposes.
 *
 */
export type ItUserRolebindingsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ItuserBoundRoleBindingFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type ItUserCreateInput = {
  /** Reference to the engagement of the IT user (if any). */
  engagement?: InputMaybe<Scalars['UUID']['input']>;
  /** ID of the user account in the external system. */
  external_id?: InputMaybe<Scalars['String']['input']>;
  /** Reference to the IT system for the IT user. */
  itsystem: Scalars['UUID']['input'];
  /** Note associated with the creation of this IT user. */
  note?: InputMaybe<Scalars['String']['input']>;
  /** Reference to the organisation unit of the IT user (if any). */
  org_unit?: InputMaybe<Scalars['UUID']['input']>;
  /** Reference to the employee for the IT user (if any). */
  person?: InputMaybe<Scalars['UUID']['input']>;
  /** Primary field of the IT user object */
  primary?: InputMaybe<Scalars['UUID']['input']>;
  /** The IT user account name. */
  user_key: Scalars['String']['input'];
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Validity of the created IT user object. */
  validity: RaValidityInput;
};

/** IT user filter. */
export type ItUserFilter = {
  /**
   * Employee filter limiting which entries are returned.
   *
   */
  employee?: InputMaybe<EmployeeFilter>;
  /**
   * Employee UUID filter limiting which entries are returned.
   *
   * | `employees`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'employee' filter
   */
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Engagement filter limiting which entries are returned.
   *
   */
  engagement?: InputMaybe<EngagementFilter>;
  /**
   * Only return IT users with this `external_id` filter limiting which entries are returned.
   *
   * | `external_id`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  external_ids?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * ITSystem filter limiting which entries are returned.
   *
   */
  itsystem?: InputMaybe<ItSystemFilter>;
  /**
   * Only return IT users of ITSystem with these UUIDs filter limiting which entries are returned.
   *
   * | `itsystem_uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'itsystem' filter
   */
  itsystem_uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Organisation Unit filter limiting which entries are returned.
   *
   */
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Organisational Unit UUID filter limiting which entries are returned.
   *
   * | `org_units`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'org_unit' filter
   */
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<ItUserRegistrationFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** ITUser registration filter. */
export type ItUserRegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ItUserResponse = {
  __typename?: 'ITUserResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<ItUser>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<ItUser>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<ItUser>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ItUserResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ItUserResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ItUserResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ItUserResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type ItUserResponsePaged = {
  __typename?: 'ITUserResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<ItUserResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type ItUserTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID for the it-user we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type ItUserUpdateInput = {
  /** Reference to the engagement of the IT user (if any). */
  engagement?: InputMaybe<Scalars['UUID']['input']>;
  /** ID of the user account in the external system. */
  external_id?: InputMaybe<Scalars['String']['input']>;
  /** Reference to the IT system for the IT user. */
  itsystem?: InputMaybe<Scalars['UUID']['input']>;
  /** Note associated with the update of this IT user. */
  note?: InputMaybe<Scalars['String']['input']>;
  /** Reference to the organisation unit of the IT user (if any). */
  org_unit?: InputMaybe<Scalars['UUID']['input']>;
  /** Reference to the employee for the IT user (if any). */
  person?: InputMaybe<Scalars['UUID']['input']>;
  /** Primary field of the IT user object */
  primary?: InputMaybe<Scalars['UUID']['input']>;
  /** The IT user account name. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the IT-user you want to update. */
  uuid: Scalars['UUID']['input'];
  /** Validity of the created IT user object. */
  validity: RaValidityInput;
};

export type ItuserBoundAddressFilter = {
  address_type?: InputMaybe<ClassFilter>;
  address_type_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  address_types?: InputMaybe<Array<Scalars['UUID']['input']>>;
  employee?: InputMaybe<EmployeeFilter>;
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  engagement?: InputMaybe<EngagementFilter>;
  engagements?: InputMaybe<Array<Scalars['UUID']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<AddressRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
  visibility?: InputMaybe<ClassFilter>;
};

export type ItuserBoundRoleBindingFilter = {
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<RoleRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/**
 * KLE responsibility mapping.
 *
 * KLE stands for "Kommunernes Landsforenings Emnesystematik" which is a municipality taxonomy for mapping out municipality tasks.
 *
 * In OS2mo KLE responsibilities can be mapped to organisation units to signify that a given organisational unit operates within certain municipality tasks.
 * Adding KLE responsibilities to organisational units can help out with regards to GDPR by identifying which organisational units operate with sensitive tasks.
 *
 * The KLE numbers themselves are dot seperated structured numbers alike this:
 * * `"00.75.00"`: General data exchanges
 * * `"21.02.05"`: Library study cafes
 * * `"32.15.08"`: Alimony
 *
 * The first number specifies the main-group, such as:
 * * `"00"`: Municipality operations (Kommunens styrelse)
 * * `"21"`: Libraries
 * * `"31"`: Monetary benefits
 *
 * The second number specifies the group, such as (for libraries):
 * * `"02"`: On-site usage
 * * `"05"`: AV Materials
 * * `"20"`: Online services
 *
 * The third and final number specifies the topic, such as (for library on-site usage):
 * * `"00"`: General usage
 * * `"05"`: Study cafes
 * * `"10"`: Study centers
 *
 * Some KLE ranges are pre-reserved by The National Association of Municipalities (Kommunernes Landsforenings), however outside of these pre-reserved ranges municipalies are allowed to add their own local numbers.
 * Specifically no main-groups can be added, only groups and topics, both above 79.
 *
 * For more details see: https://www.kle-online.dk
 *
 */
export type Kle = {
  __typename?: 'KLE';
  /**
   * List of UUIDs of the KLE aspect.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `kle_aspects {uuid}` instead.
   *
   */
  kle_aspect_uuids: Array<Scalars['UUID']['output']>;
  /**
   * KLE Aspects.
   *
   * The KLE aspect describes the kind of relationship the organisation unit has with the responsibility given by the KLE number.
   *
   * Examples of user-keys:
   * * `"Insight"`
   * * `"Executive"`
   * * `"Responsible"`
   *
   */
  kle_aspects: Array<Class>;
  /**
   * The KLE number specifies the responsibility.
   *
   * For more details read the `KLE` description.
   *
   */
  kle_number: Class;
  /**
   * UUID of the KLE number.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `kle_number {uuid}` instead.
   *
   */
  kle_number_uuid: Scalars['UUID']['output'];
  /**
   * The organisation unit the responsibility is mapped to.
   *
   */
  org_unit: Array<OrganisationUnit>;
  /**
   * UUID of the organisation unit related to the KLE.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `org_unit {uuid}` instead.
   *
   */
  org_unit_uuid: Scalars['UUID']['output'];
  /**
   * The object type.
   *
   * Always contains the string `kle`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /**
   * Short unique key.
   *
   * Usually set to be set to the kle number itself.
   *
   * Examples:
   * * `"00.75.00"`
   * * `"21.02.05"`
   * * `"32.15.08"`
   *
   */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the kle object. */
  validity: Validity;
};


/**
 * KLE responsibility mapping.
 *
 * KLE stands for "Kommunernes Landsforenings Emnesystematik" which is a municipality taxonomy for mapping out municipality tasks.
 *
 * In OS2mo KLE responsibilities can be mapped to organisation units to signify that a given organisational unit operates within certain municipality tasks.
 * Adding KLE responsibilities to organisational units can help out with regards to GDPR by identifying which organisational units operate with sensitive tasks.
 *
 * The KLE numbers themselves are dot seperated structured numbers alike this:
 * * `"00.75.00"`: General data exchanges
 * * `"21.02.05"`: Library study cafes
 * * `"32.15.08"`: Alimony
 *
 * The first number specifies the main-group, such as:
 * * `"00"`: Municipality operations (Kommunens styrelse)
 * * `"21"`: Libraries
 * * `"31"`: Monetary benefits
 *
 * The second number specifies the group, such as (for libraries):
 * * `"02"`: On-site usage
 * * `"05"`: AV Materials
 * * `"20"`: Online services
 *
 * The third and final number specifies the topic, such as (for library on-site usage):
 * * `"00"`: General usage
 * * `"05"`: Study cafes
 * * `"10"`: Study centers
 *
 * Some KLE ranges are pre-reserved by The National Association of Municipalities (Kommunernes Landsforenings), however outside of these pre-reserved ranges municipalies are allowed to add their own local numbers.
 * Specifically no main-groups can be added, only groups and topics, both above 79.
 *
 * For more details see: https://www.kle-online.dk
 *
 */
export type KleKle_AspectsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * KLE responsibility mapping.
 *
 * KLE stands for "Kommunernes Landsforenings Emnesystematik" which is a municipality taxonomy for mapping out municipality tasks.
 *
 * In OS2mo KLE responsibilities can be mapped to organisation units to signify that a given organisational unit operates within certain municipality tasks.
 * Adding KLE responsibilities to organisational units can help out with regards to GDPR by identifying which organisational units operate with sensitive tasks.
 *
 * The KLE numbers themselves are dot seperated structured numbers alike this:
 * * `"00.75.00"`: General data exchanges
 * * `"21.02.05"`: Library study cafes
 * * `"32.15.08"`: Alimony
 *
 * The first number specifies the main-group, such as:
 * * `"00"`: Municipality operations (Kommunens styrelse)
 * * `"21"`: Libraries
 * * `"31"`: Monetary benefits
 *
 * The second number specifies the group, such as (for libraries):
 * * `"02"`: On-site usage
 * * `"05"`: AV Materials
 * * `"20"`: Online services
 *
 * The third and final number specifies the topic, such as (for library on-site usage):
 * * `"00"`: General usage
 * * `"05"`: Study cafes
 * * `"10"`: Study centers
 *
 * Some KLE ranges are pre-reserved by The National Association of Municipalities (Kommunernes Landsforenings), however outside of these pre-reserved ranges municipalies are allowed to add their own local numbers.
 * Specifically no main-groups can be added, only groups and topics, both above 79.
 *
 * For more details see: https://www.kle-online.dk
 *
 */
export type KleKle_NumberArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * KLE responsibility mapping.
 *
 * KLE stands for "Kommunernes Landsforenings Emnesystematik" which is a municipality taxonomy for mapping out municipality tasks.
 *
 * In OS2mo KLE responsibilities can be mapped to organisation units to signify that a given organisational unit operates within certain municipality tasks.
 * Adding KLE responsibilities to organisational units can help out with regards to GDPR by identifying which organisational units operate with sensitive tasks.
 *
 * The KLE numbers themselves are dot seperated structured numbers alike this:
 * * `"00.75.00"`: General data exchanges
 * * `"21.02.05"`: Library study cafes
 * * `"32.15.08"`: Alimony
 *
 * The first number specifies the main-group, such as:
 * * `"00"`: Municipality operations (Kommunens styrelse)
 * * `"21"`: Libraries
 * * `"31"`: Monetary benefits
 *
 * The second number specifies the group, such as (for libraries):
 * * `"02"`: On-site usage
 * * `"05"`: AV Materials
 * * `"20"`: Online services
 *
 * The third and final number specifies the topic, such as (for library on-site usage):
 * * `"00"`: General usage
 * * `"05"`: Study cafes
 * * `"10"`: Study centers
 *
 * Some KLE ranges are pre-reserved by The National Association of Municipalities (Kommunernes Landsforenings), however outside of these pre-reserved ranges municipalies are allowed to add their own local numbers.
 * Specifically no main-groups can be added, only groups and topics, both above 79.
 *
 * For more details see: https://www.kle-online.dk
 *
 */
export type KleOrg_UnitArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundOrganisationUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type KleCreateInput = {
  /** List of UUIDs of the KLE aspects. */
  kle_aspects: Array<Scalars['UUID']['input']>;
  /** UUID of the KLE number. */
  kle_number: Scalars['UUID']['input'];
  /** UUID of the organisation unit of the KLE. */
  org_unit: Scalars['UUID']['input'];
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Validity range for the KLE. */
  validity: RaValidityInput;
};

/** KLE filter. */
export type KleFilter = {
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Organisation Unit filter limiting which entries are returned.
   *
   */
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Organisational Unit UUID filter limiting which entries are returned.
   *
   * | `org_units`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'org_unit' filter
   */
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<KleRegistrationFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** KLE registration filter. */
export type KleRegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type KleResponse = {
  __typename?: 'KLEResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<Kle>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<Kle>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<Kle>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type KleResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type KleResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type KleResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type KleResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type KleResponsePaged = {
  __typename?: 'KLEResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<KleResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type KleTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID of the KLE annotation we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type KleUpdateInput = {
  /** UUID of the kle_aspects. */
  kle_aspects?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** UUID of the KLE number. */
  kle_number?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the KLE's organisation unit to be updated. */
  org_unit?: InputMaybe<Scalars['UUID']['input']>;
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the KLE annotation to be updated. */
  uuid: Scalars['UUID']['input'];
  /** Validity range for the KLE to be updated. */
  validity: RaValidityInput;
};

/**
 * A leave of absence for an employee.
 *
 * Can be everything from a pregnancy or maternity leave to a furlough or a garden leave.
 * The `leave_type` can be used to determine the type of leave in question.
 *
 */
export type Leave = {
  __typename?: 'Leave';
  /**
   * The absent employee.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   * @deprecated Use 'person' instead. Will be removed in a future version of OS2mo.
   */
  employee: Array<Employee>;
  /**
   * UUID of the KLE number.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `employee {uuid}` instead.
   *
   */
  employee_uuid: Scalars['UUID']['output'];
  /**
   * The engagement the employee is absent from.
   *
   */
  engagement: Engagement;
  /**
   * UUID of the KLE number.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `engagement {uuid}` instead.
   *
   */
  engagement_uuid: Scalars['UUID']['output'];
  /**
   * The kind of leave of absence.
   *
   * Examples:
   * * `"Maternity leave"`
   * * `"Parental leave"`
   * * `"Furlough"`
   * * `"Garden Leave"`
   *
   */
  leave_type: Class;
  /**
   * UUID of the KLE number.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `leave_type {uuid}` instead.
   *
   */
  leave_type_uuid: Scalars['UUID']['output'];
  /**
   * The absent person.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  person: Array<Employee>;
  /**
   * The object type.
   *
   * Always contains the string `leave`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /** Short, unique key. Defaults to object UUID. */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the leave object. */
  validity: Validity;
};


/**
 * A leave of absence for an employee.
 *
 * Can be everything from a pregnancy or maternity leave to a furlough or a garden leave.
 * The `leave_type` can be used to determine the type of leave in question.
 *
 */
export type LeaveEmployeeArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * A leave of absence for an employee.
 *
 * Can be everything from a pregnancy or maternity leave to a furlough or a garden leave.
 * The `leave_type` can be used to determine the type of leave in question.
 *
 */
export type LeaveEngagementArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEngagementFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * A leave of absence for an employee.
 *
 * Can be everything from a pregnancy or maternity leave to a furlough or a garden leave.
 * The `leave_type` can be used to determine the type of leave in question.
 *
 */
export type LeaveLeave_TypeArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * A leave of absence for an employee.
 *
 * Can be everything from a pregnancy or maternity leave to a furlough or a garden leave.
 * The `leave_type` can be used to determine the type of leave in question.
 *
 */
export type LeavePersonArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type LeaveCreateInput = {
  /** UUID of the related engagement. */
  engagement: Scalars['UUID']['input'];
  /** UUID of the leave type */
  leave_type: Scalars['UUID']['input'];
  /** UUID of the person. */
  person: Scalars['UUID']['input'];
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Validity range for the leave. */
  validity: RaValidityInput;
};

/** Leave filter. */
export type LeaveFilter = {
  /**
   * Employee filter limiting which entries are returned.
   *
   */
  employee?: InputMaybe<EmployeeFilter>;
  /**
   * Employee UUID filter limiting which entries are returned.
   *
   * | `employees`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'employee' filter
   */
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Organisation Unit filter limiting which entries are returned.
   *
   */
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Organisational Unit UUID filter limiting which entries are returned.
   *
   * | `org_units`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'org_unit' filter
   */
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<LeaveRegistrationFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** Leave registration filter. */
export type LeaveRegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type LeaveResponse = {
  __typename?: 'LeaveResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<Leave>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<Leave>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<Leave>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type LeaveResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type LeaveResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type LeaveResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type LeaveResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type LeaveResponsePaged = {
  __typename?: 'LeaveResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<LeaveResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type LeaveTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID of the leave we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type LeaveUpdateInput = {
  /** UUID of the related engagement. */
  engagement?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the leave type */
  leave_type?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the person. */
  person?: InputMaybe<Scalars['UUID']['input']>;
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the leave. */
  uuid: Scalars['UUID']['input'];
  /** Validity range for the leave. */
  validity: RaValidityInput;
};

/**
 * Managers of organisation units and their connected identities.
 *
 */
export type Manager = {
  __typename?: 'Manager';
  /**
   * Employee fulfilling the managerial position.
   *
   * May be empty in which case the managerial position is unfilfilled (vacant).
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   * @deprecated Use 'person' instead. Will be removed in a future version of OS2mo.
   */
  employee?: Maybe<Array<Employee>>;
  /**
   * UUID of the employee related to the manager.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `employee {uuid}` instead.
   *
   */
  employee_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Hierarchical level of the manager.
   *
   * Examples:
   * * `"Level 1"`
   * * `"Level 2"`
   * * `"Level 3"`
   *
   */
  manager_level: Class;
  /**
   * UUID of the manager level.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `manager_level {uuid}` instead.
   *
   */
  manager_level_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Title of the manager.
   *
   * Examples:
   * * `"Director"`
   * * `"Area manager"`
   * * `"Center manager"`
   *
   */
  manager_type: Class;
  /**
   * UUID of the manager type.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `manager_type {uuid}` instead.
   *
   */
  manager_type_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Organisation unit being managed.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  org_unit: Array<OrganisationUnit>;
  /**
   * UUID of the organisation unit related to the manager.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `org_unit {uuid}` instead.
   *
   */
  org_unit_uuid: Scalars['UUID']['output'];
  /**
   * Person fulfilling the managerial position.
   *
   * May be empty in which case the managerial position is unfilfilled (vacant).
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  person?: Maybe<Array<Employee>>;
  /**
   * Responsibilities that the manager takes care of.
   *
   * Examples:
   * * `["Responsible for buildings and areas"]`
   * * `["Responsible for buildings and areas", "Staff: Sick leave"]`
   * * `[]`
   *
   */
  responsibilities: Array<Class>;
  /**
   * List of UUID's of the responsibilities.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `responsibilities {uuid}` instead.
   *
   */
  responsibility_uuids?: Maybe<Array<Scalars['UUID']['output']>>;
  /**
   * The object type.
   *
   * Always contains the string `manager`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /** Short, unique key. Defaults to object UUID. */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the manager object. */
  validity: Validity;
};


/**
 * Managers of organisation units and their connected identities.
 *
 */
export type ManagerEmployeeArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Managers of organisation units and their connected identities.
 *
 */
export type ManagerManager_LevelArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Managers of organisation units and their connected identities.
 *
 */
export type ManagerManager_TypeArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Managers of organisation units and their connected identities.
 *
 */
export type ManagerOrg_UnitArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundOrganisationUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Managers of organisation units and their connected identities.
 *
 */
export type ManagerPersonArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Managers of organisation units and their connected identities.
 *
 */
export type ManagerResponsibilitiesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type ManagerCreateInput = {
  /** UUID of the managers level. */
  manager_level: Scalars['UUID']['input'];
  /** UUID of the managers type.. */
  manager_type: Scalars['UUID']['input'];
  /** UUID of the managers organisation unit. */
  org_unit: Scalars['UUID']['input'];
  /** UUID of the manager as person. */
  person?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the managers responsibilities. */
  responsibility: Array<Scalars['UUID']['input']>;
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Validity range for the manager. */
  validity: RaValidityInput;
};

/** Manager filter. */
export type ManagerFilter = {
  /**
   * Employee filter limiting which entries are returned.
   *
   */
  employee?: InputMaybe<EmployeeFilter>;
  /**
   * Employee UUID filter limiting which entries are returned.
   *
   * | `employees`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'employee' filter
   */
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Organisation Unit filter limiting which entries are returned.
   *
   */
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Organisational Unit UUID filter limiting which entries are returned.
   *
   * | `org_units`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'org_unit' filter
   */
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<ManagerRegistrationFilter>;
  /**
   * Responsibility filter limiting which entries are returned.
   *
   */
  responsibility?: InputMaybe<ClassFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** Manager registration filter. */
export type ManagerRegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ManagerResponse = {
  __typename?: 'ManagerResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<Manager>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<Manager>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<Manager>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ManagerResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ManagerResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ManagerResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type ManagerResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type ManagerResponsePaged = {
  __typename?: 'ManagerResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<ManagerResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type ManagerTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID of the manager we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type ManagerUpdateInput = {
  /** UUID of the managers level to be updated. */
  manager_level?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the managers type to be updated. */
  manager_type?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the managers organisation unit to be updated. */
  org_unit?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the manager as person to be updated. */
  person?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the managers responsibilities to be updated. */
  responsibility?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the manager to be updated. */
  uuid: Scalars['UUID']['input'];
  /** Validity range for the manager to be updated. */
  validity: RaValidityInput;
};

export type ModelsUuidsBoundRegistrationFilter = {
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

export type MultifieldAddress = ResolvedAddress & {
  __typename?: 'MultifieldAddress';
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
  value2: Scalars['String']['output'];
};

/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type Mutation = {
  __typename?: 'Mutation';
  /** Creates an address. */
  address_create: AddressResponse;
  /**
   * Deletes an address.
   * **Warning**:
   * This mutator does bitemporal deletion, **not** temporal termination.
   * Do **not** use this mutator **unless** you **fully understand** its implications.
   *
   * Bitemporal deletion and temporal termination are **very** different operations and should **not** be confused.
   * If you do not know which of the operations you need, you most likely need temporal termination.
   *
   * Bitemporal deletion works on the bitemporal time-axis, and should **only** be used by clients that **fully understand** the underlying bitemporal model, including how a bitemporal delete affects the registration history.
   *
   * After this call the deleted entity will no longer show up in **any** temporal listing.
   *
   * Note:
   * It is currently the callers responsibility to ensure that references are dealt with before doing bitemporal deletions.
   * Failure to do so **will** leave dangling references breaking temporal foreign-keys, and potentially breaking invariants in the data.
   *
   */
  address_delete: AddressResponse;
  /** Refresh addresses. */
  address_refresh: UuidPaged;
  /** Terminates an address. */
  address_terminate: AddressResponse;
  /** Updates an address. */
  address_update: AddressResponse;
  /** Creates a list of address. */
  addresses_create: Array<AddressResponse>;
  /** Creates an association. */
  association_create: AssociationResponse;
  /** Refresh associations. */
  association_refresh: UuidPaged;
  /** Terminates an association */
  association_terminate: AssociationResponse;
  /** Updates an association. */
  association_update: AssociationResponse;
  /** Creates a class. */
  class_create: ClassResponse;
  /**
   * Deletes a class.
   * **Warning**:
   * This mutator does bitemporal deletion, **not** temporal termination.
   * Do **not** use this mutator **unless** you **fully understand** its implications.
   *
   * Bitemporal deletion and temporal termination are **very** different operations and should **not** be confused.
   * If you do not know which of the operations you need, you most likely need temporal termination.
   *
   * Bitemporal deletion works on the bitemporal time-axis, and should **only** be used by clients that **fully understand** the underlying bitemporal model, including how a bitemporal delete affects the registration history.
   *
   * After this call the deleted entity will no longer show up in **any** temporal listing.
   *
   * Note:
   * It is currently the callers responsibility to ensure that references are dealt with before doing bitemporal deletions.
   * Failure to do so **will** leave dangling references breaking temporal foreign-keys, and potentially breaking invariants in the data.
   *
   */
  class_delete: ClassResponse;
  /** Refresh classes. */
  class_refresh: UuidPaged;
  /** Terminates a class. */
  class_terminate: ClassResponse;
  /** Updates a class. */
  class_update: ClassResponse;
  /** Creates an employee. */
  employee_create: EmployeeResponse;
  /**
   * Deletes an employee.
   * **Warning**:
   * This mutator does bitemporal deletion, **not** temporal termination.
   * Do **not** use this mutator **unless** you **fully understand** its implications.
   *
   * Bitemporal deletion and temporal termination are **very** different operations and should **not** be confused.
   * If you do not know which of the operations you need, you most likely need temporal termination.
   *
   * Bitemporal deletion works on the bitemporal time-axis, and should **only** be used by clients that **fully understand** the underlying bitemporal model, including how a bitemporal delete affects the registration history.
   *
   * After this call the deleted entity will no longer show up in **any** temporal listing.
   *
   * Note:
   * It is currently the callers responsibility to ensure that references are dealt with before doing bitemporal deletions.
   * Failure to do so **will** leave dangling references breaking temporal foreign-keys, and potentially breaking invariants in the data.
   *
   */
  employee_delete: EmployeeResponse;
  /** Refresh employees. */
  employee_refresh: UuidPaged;
  /** Terminates an employee. */
  employee_terminate: EmployeeResponse;
  /** Updates an employee. */
  employee_update: EmployeeResponse;
  /** Creates an engagement. */
  engagement_create: EngagementResponse;
  /**
   * Deletes an engagement.
   * **Warning**:
   * This mutator does bitemporal deletion, **not** temporal termination.
   * Do **not** use this mutator **unless** you **fully understand** its implications.
   *
   * Bitemporal deletion and temporal termination are **very** different operations and should **not** be confused.
   * If you do not know which of the operations you need, you most likely need temporal termination.
   *
   * Bitemporal deletion works on the bitemporal time-axis, and should **only** be used by clients that **fully understand** the underlying bitemporal model, including how a bitemporal delete affects the registration history.
   *
   * After this call the deleted entity will no longer show up in **any** temporal listing.
   *
   * Note:
   * It is currently the callers responsibility to ensure that references are dealt with before doing bitemporal deletions.
   * Failure to do so **will** leave dangling references breaking temporal foreign-keys, and potentially breaking invariants in the data.
   *
   */
  engagement_delete: EngagementResponse;
  /** Refresh engagements. */
  engagement_refresh: UuidPaged;
  /** Terminates an engagement. */
  engagement_terminate: EngagementResponse;
  /** Updates an engagement. */
  engagement_update: EngagementResponse;
  /** Creates a list of engagements. */
  engagements_create: Array<EngagementResponse>;
  /**
   * Updates a list of engagements.
   *
   * Note: If any of the updates in the transaction is a noop, the whole
   * transaction will fail with the error:
   * `(psycopg.errors.InFailedSqlTransaction) current transaction is aborted,
   * commands ignored until end of transaction block`
   *
   * https://redmine.magenta.dk/issues/60573
   *
   */
  engagements_update: Array<EngagementResponse>;
  /** Creates a facet. */
  facet_create: FacetResponse;
  /**
   * Deletes a facet.
   * **Warning**:
   * This mutator does bitemporal deletion, **not** temporal termination.
   * Do **not** use this mutator **unless** you **fully understand** its implications.
   *
   * Bitemporal deletion and temporal termination are **very** different operations and should **not** be confused.
   * If you do not know which of the operations you need, you most likely need temporal termination.
   *
   * Bitemporal deletion works on the bitemporal time-axis, and should **only** be used by clients that **fully understand** the underlying bitemporal model, including how a bitemporal delete affects the registration history.
   *
   * After this call the deleted entity will no longer show up in **any** temporal listing.
   *
   * Note:
   * It is currently the callers responsibility to ensure that references are dealt with before doing bitemporal deletions.
   * Failure to do so **will** leave dangling references breaking temporal foreign-keys, and potentially breaking invariants in the data.
   *
   */
  facet_delete: FacetResponse;
  /** Refresh facets. */
  facet_refresh: UuidPaged;
  /** Terminates a facet. */
  facet_terminate: FacetResponse;
  /** Updates a facet. */
  facet_update: FacetResponse;
  /** Creates an IT-Association. */
  itassociation_create: AssociationResponse;
  /** Terminates an ITAssociation. */
  itassociation_terminate: AssociationResponse;
  /** Updates an IT-Association. */
  itassociation_update: AssociationResponse;
  /** Creates an ITSystem. */
  itsystem_create: ItSystemResponse;
  /**
   * Deletes an ITSystem.
   * **Warning**:
   * This mutator does bitemporal deletion, **not** temporal termination.
   * Do **not** use this mutator **unless** you **fully understand** its implications.
   *
   * Bitemporal deletion and temporal termination are **very** different operations and should **not** be confused.
   * If you do not know which of the operations you need, you most likely need temporal termination.
   *
   * Bitemporal deletion works on the bitemporal time-axis, and should **only** be used by clients that **fully understand** the underlying bitemporal model, including how a bitemporal delete affects the registration history.
   *
   * After this call the deleted entity will no longer show up in **any** temporal listing.
   *
   * Note:
   * It is currently the callers responsibility to ensure that references are dealt with before doing bitemporal deletions.
   * Failure to do so **will** leave dangling references breaking temporal foreign-keys, and potentially breaking invariants in the data.
   *
   */
  itsystem_delete: ItSystemResponse;
  /** Refresh ITSystems. */
  itsystem_refresh: UuidPaged;
  /** Terminates an IT-System. */
  itsystem_terminate: ItSystemResponse;
  /** Updates an ITSystem. */
  itsystem_update: ItSystemResponse;
  /** Creates an IT-User. */
  ituser_create: ItUserResponse;
  /**
   * Deletes an IT-User.
   * **Warning**:
   * This mutator does bitemporal deletion, **not** temporal termination.
   * Do **not** use this mutator **unless** you **fully understand** its implications.
   *
   * Bitemporal deletion and temporal termination are **very** different operations and should **not** be confused.
   * If you do not know which of the operations you need, you most likely need temporal termination.
   *
   * Bitemporal deletion works on the bitemporal time-axis, and should **only** be used by clients that **fully understand** the underlying bitemporal model, including how a bitemporal delete affects the registration history.
   *
   * After this call the deleted entity will no longer show up in **any** temporal listing.
   *
   * Note:
   * It is currently the callers responsibility to ensure that references are dealt with before doing bitemporal deletions.
   * Failure to do so **will** leave dangling references breaking temporal foreign-keys, and potentially breaking invariants in the data.
   *
   */
  ituser_delete: ItUserResponse;
  /** Refresh IT-Users. */
  ituser_refresh: UuidPaged;
  /** Terminates IT-User. */
  ituser_terminate: ItUserResponse;
  /** Updates an IT-User. */
  ituser_update: ItUserResponse;
  /** Creates a list of itusers. */
  itusers_create: Array<ItUserResponse>;
  /** Creates a KLE annotation. */
  kle_create: KleResponse;
  /** Refresh KLEs. */
  kle_refresh: UuidPaged;
  /** Terminates a KLE annotation. */
  kle_terminate: KleResponse;
  /** Updates a KLE annotation. */
  kle_update: KleResponse;
  /** Creates a leave. */
  leave_create: LeaveResponse;
  /** Refresh leaves. */
  leave_refresh: UuidPaged;
  /** Terminates a leave. */
  leave_terminate: LeaveResponse;
  /** Updates a leave. */
  leave_update: LeaveResponse;
  /** Creates a manager relation. */
  manager_create: ManagerResponse;
  /** Refresh managers. */
  manager_refresh: UuidPaged;
  /** Terminates a manager relation. */
  manager_terminate: ManagerResponse;
  /** Updates a manager relation. */
  manager_update: ManagerResponse;
  /** Creates a list of managers. */
  managers_create: Array<ManagerResponse>;
  /**
   * Creates the root-organisation.
   * @deprecated The root organisation concept will be removed in a future version of OS2mo.
   */
  org_create: Organisation;
  /** Creates an organisation unit. */
  org_unit_create: OrganisationUnitResponse;
  /** Refresh organization units. */
  org_unit_refresh: UuidPaged;
  /** Terminates an organization unit. */
  org_unit_terminate: OrganisationUnitResponse;
  /** Updates an organisation unit. */
  org_unit_update: OrganisationUnitResponse;
  /** Creates an owner. */
  owner_create: OwnerResponse;
  /** Refresh owners. */
  owner_refresh: UuidPaged;
  /** Terminates an owner. */
  owner_terminate: OwnerResponse;
  /** Updates an owner. */
  owner_update: OwnerResponse;
  /** Refresh a related unit. */
  related_unit_refresh: UuidPaged;
  /** Updates relations for an org_unit. */
  related_units_update: RelatedUnitResponse;
  /** Create a rolebinding. */
  rolebinding_create: RoleBindingResponse;
  /** Refresh rolebindings. */
  rolebinding_refresh: UuidPaged;
  /** Terminate a rolebinding. */
  rolebinding_terminate: RoleBindingResponse;
  /** Update a rolebinding. */
  rolebinding_update: RoleBindingResponse;
  /** Creates a list of rolebindings. */
  rolebindings_create: Array<RoleBindingResponse>;
  /**
   * Upload a file.
   *
   * File upload must be done via multipart form-data.
   *
   * How to do this is client-specific, but below is an example using [curl](https://curl.se/):
   * ```console
   * curl https://{{MO_URL}}/graphql/v7 \
   *   -H "Authorization: Bearer {{TOKEN}}" \
   *   -F operations="{\"query\": \"{{QUERY}}\", \
   *       \"variables\": {\"file\": null}}" \
   *   -F map='{"file": ["variables.file"]}' \
   *   -F file=@myfile.txt
   * ```
   * Where:
   * * `myfile.txt` is the file to upload.
   * * `{{MO_URL}}` is the base-url for the OS2mo instance to upload the file to.
   * * `{{TOKEN}}` is a valid JWT-token acquired from Keycloak.
   * * `{{QUERY}}` is the upload query:
   * ```gql
   * mutation($file: Upload!) {
   *   upload_file(
   *     file_store: EXPORTS,
   *     file: $file
   *   )
   * }
   * ```
   *
   * Note:
   * As GraphiQL does not support sending multipart form-data payloads, it is unfortunately not possible to upload files from GraphiQL.
   *
   */
  upload_file: Scalars['String']['output'];
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationAddress_CreateArgs = {
  input: AddressCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationAddress_DeleteArgs = {
  uuid: Scalars['UUID']['input'];
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationAddress_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<AddressFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationAddress_TerminateArgs = {
  input: AddressTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationAddress_UpdateArgs = {
  input: AddressUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationAddresses_CreateArgs = {
  input: Array<AddressCreateInput>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationAssociation_CreateArgs = {
  input: AssociationCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationAssociation_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<AssociationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationAssociation_TerminateArgs = {
  input: AssociationTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationAssociation_UpdateArgs = {
  input: AssociationUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationClass_CreateArgs = {
  input: ClassCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationClass_DeleteArgs = {
  uuid: Scalars['UUID']['input'];
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationClass_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationClass_TerminateArgs = {
  input: ClassTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationClass_UpdateArgs = {
  input: ClassUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationEmployee_CreateArgs = {
  input: EmployeeCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationEmployee_DeleteArgs = {
  uuid: Scalars['UUID']['input'];
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationEmployee_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<EmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationEmployee_TerminateArgs = {
  input: EmployeeTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationEmployee_UpdateArgs = {
  input: EmployeeUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationEngagement_CreateArgs = {
  input: EngagementCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationEngagement_DeleteArgs = {
  uuid: Scalars['UUID']['input'];
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationEngagement_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<EngagementFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationEngagement_TerminateArgs = {
  input: EngagementTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationEngagement_UpdateArgs = {
  input: EngagementUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationEngagements_CreateArgs = {
  input: Array<EngagementCreateInput>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationEngagements_UpdateArgs = {
  input: Array<EngagementUpdateInput>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationFacet_CreateArgs = {
  input: FacetCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationFacet_DeleteArgs = {
  uuid: Scalars['UUID']['input'];
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationFacet_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FacetFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationFacet_TerminateArgs = {
  input: FacetTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationFacet_UpdateArgs = {
  input: FacetUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItassociation_CreateArgs = {
  input: ItAssociationCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItassociation_TerminateArgs = {
  input: ItAssociationTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItassociation_UpdateArgs = {
  input: ItAssociationUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItsystem_CreateArgs = {
  input: ItSystemCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItsystem_DeleteArgs = {
  uuid: Scalars['UUID']['input'];
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItsystem_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ItSystemFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItsystem_TerminateArgs = {
  input: ItSystemTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItsystem_UpdateArgs = {
  input: ItSystemUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItuser_CreateArgs = {
  input: ItUserCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItuser_DeleteArgs = {
  uuid: Scalars['UUID']['input'];
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItuser_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ItUserFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItuser_TerminateArgs = {
  input: ItUserTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItuser_UpdateArgs = {
  input: ItUserUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationItusers_CreateArgs = {
  input: Array<ItUserCreateInput>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationKle_CreateArgs = {
  input: KleCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationKle_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<KleFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationKle_TerminateArgs = {
  input: KleTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationKle_UpdateArgs = {
  input: KleUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationLeave_CreateArgs = {
  input: LeaveCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationLeave_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<LeaveFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationLeave_TerminateArgs = {
  input: LeaveTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationLeave_UpdateArgs = {
  input: LeaveUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationManager_CreateArgs = {
  input: ManagerCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationManager_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ManagerFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationManager_TerminateArgs = {
  input: ManagerTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationManager_UpdateArgs = {
  input: ManagerUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationManagers_CreateArgs = {
  input: Array<ManagerCreateInput>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationOrg_CreateArgs = {
  input: OrganisationCreate;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationOrg_Unit_CreateArgs = {
  input: OrganisationUnitCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationOrg_Unit_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<OrganisationUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationOrg_Unit_TerminateArgs = {
  input: OrganisationUnitTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationOrg_Unit_UpdateArgs = {
  input: OrganisationUnitUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationOwner_CreateArgs = {
  input: OwnerCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationOwner_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<OwnerFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationOwner_TerminateArgs = {
  input: OwnerTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationOwner_UpdateArgs = {
  input: OwnerUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationRelated_Unit_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<RelatedUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationRelated_Units_UpdateArgs = {
  input: RelatedUnitsUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationRolebinding_CreateArgs = {
  input: RoleBindingCreateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationRolebinding_RefreshArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  exchange?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<RoleBindingFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
  queue?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationRolebinding_TerminateArgs = {
  input: RoleBindingTerminateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationRolebinding_UpdateArgs = {
  input: RoleBindingUpdateInput;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationRolebindings_CreateArgs = {
  input: Array<RoleBindingCreateInput>;
};


/**
 * Entrypoint for all modification-operations.
 *
 * **Warning**:
 * Do **not** use any `*_delete`-mutators without **thoroughly** understanding its implications and the documentation.
 *
 */
export type MutationUpload_FileArgs = {
  file: Scalars['Upload']['input'];
  file_store: FileStore;
  force?: Scalars['Boolean']['input'];
};

/** Validity of objects with optional from date */
export type OpenValidity = {
  __typename?: 'OpenValidity';
  /** Start date of the validity. */
  from?: Maybe<Scalars['DateTime']['output']>;
  /** End date of the validity, if applicable. */
  to?: Maybe<Scalars['DateTime']['output']>;
};

export type OrgUnitsboundaddressfilter = {
  address_type?: InputMaybe<ClassFilter>;
  address_type_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  address_types?: InputMaybe<Array<Scalars['UUID']['input']>>;
  employee?: InputMaybe<EmployeeFilter>;
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  engagement?: InputMaybe<EngagementFilter>;
  engagements?: InputMaybe<Array<Scalars['UUID']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  ituser?: InputMaybe<ItUserFilter>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  registration?: InputMaybe<AddressRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
  visibility?: InputMaybe<ClassFilter>;
};

export type OrgUnitsboundassociationfilter = {
  association_type?: InputMaybe<ClassFilter>;
  association_type_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  association_types?: InputMaybe<Array<Scalars['UUID']['input']>>;
  employee?: InputMaybe<EmployeeFilter>;
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  it_association?: InputMaybe<Scalars['Boolean']['input']>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  registration?: InputMaybe<AssociationRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type OrgUnitsboundengagementfilter = {
  employee?: InputMaybe<EmployeeFilter>;
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  job_function?: InputMaybe<ClassFilter>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  registration?: InputMaybe<EngagementRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type OrgUnitsboundituserfilter = {
  employee?: InputMaybe<EmployeeFilter>;
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  engagement?: InputMaybe<EngagementFilter>;
  external_ids?: InputMaybe<Array<Scalars['String']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  itsystem?: InputMaybe<ItSystemFilter>;
  itsystem_uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  registration?: InputMaybe<ItUserRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type OrgUnitsboundklefilter = {
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  registration?: InputMaybe<KleRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type OrgUnitsboundleavefilter = {
  employee?: InputMaybe<EmployeeFilter>;
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  registration?: InputMaybe<LeaveRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type OrgUnitsboundrelatedunitfilter = {
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** Root organisation - one and only one of these can exist */
export type Organisation = {
  __typename?: 'Organisation';
  /**
   * The municipality code.
   *
   * In Denmark; a 3 digit number uniquely identifying a municipality.
   * Generally used to map the Local administrative units (LAU) of the
   * Nomenclature of Territorial Units for Statistics (NUTS) standard.
   *
   * A list of all danish municipality codes can be found here:
   * * https://danmarksadresser.dk/adressedata/kodelister/kommunekodeliste
   *
   * Examples:
   * * `null` (unset)
   * * `101` (Copenhagen)
   * * `461` (Odense)
   * * `751` (Aarhus)
   *
   */
  municipality_code?: Maybe<Scalars['Int']['output']>;
  /**
   * Name of the organisation.
   *
   * Examples:
   * * `root`
   * * `Kolding Kommune` (or similar municipality name)
   * * `Magenta ApS` (or similar company name)
   *
   */
  name: Scalars['String']['output'];
  /**
   * The object type.
   *
   * Always contains the string `organisation`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /**
   * Short unique key.
   *
   * Examples:
   * * `root`
   * * `0751` (municipality code)
   * * `3b866d97-0b1f-48e0-8078-686d96f430b3` (copied entity UUID)
   * * `Kolding Kommune` (municipality name)
   * * `Magenta ApS` (company name)
   *
   */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
};

export type OrganisationCreate = {
  /**
   * The municipality code.
   *
   * In Denmark; a 3 digit number uniquely identifying a municipality.
   * Generally used to map the Local administrative units (LAU) of the
   * Nomenclature of Territorial Units for Statistics (NUTS) standard.
   *
   * A list of all danish municipality codes can be found here:
   * * https://danmarksadresser.dk/adressedata/kodelister/kommunekodeliste
   *
   * Examples:
   * * `null` (unset)
   * * `101` (Copenhagen)
   * * `461` (Odense)
   * * `751` (Aarhus)
   *
   */
  municipality_code?: InputMaybe<Scalars['Int']['input']>;
};

/** Organisation unit within the organisation tree */
export type OrganisationUnit = {
  __typename?: 'OrganisationUnit';
  /**
   * Addresses for the organisation unit.
   *
   * Commonly contain addresses such as, their:
   * * Location
   * * Contact phone number
   * * Contact email
   *
   */
  addresses: Array<Address>;
  /**
   * Same as addresses(), but with HACKs to enable validities.
   *
   * @deprecated Should only be used to query addresses when validity dates have been specified, "
   * "ex from_date & to_date."
   * "Will be removed when sub-query date handling is implemented.
   *
   */
  addresses_validity: Array<Address>;
  /**
   * All ancestor organisational units in the organisation tree.
   *
   * The result of collecting organisational units by following `parent` until `parent` becomes `null`.
   * I.e. the list of all ancestors on the way to the organisation tree root.
   *
   */
  ancestors: Array<OrganisationUnit>;
  /**
   * Same as ancestors(), but with HACKs to enable validities.
   *
   * @deprecated Should only be used to query ancestors when validity dates have been specified, "
   * "ex from_date & to_date."
   * "Will be removed when sub-query date handling is implemented.
   *
   */
  ancestors_validity: Array<OrganisationUnit>;
  /**
   * Associations for the organistion unit.
   *
   * May be an empty list if the organistion unit is purely hierarchical.
   * This situation may occur especially in the middle or the organisation tree.
   *
   */
  associations: Array<Association>;
  /**
   * Same as associations(), but with HACKs to enable validities.
   *
   * @deprecated Should only be used to query associations when validity dates have been specified, "
   * "ex from_date & to_date."
   * "Will be removed when sub-query date handling is implemented.
   *
   */
  associations_validity: Array<Association>;
  /** Children count of the organisation unit. For performance, consider if `has_children` can answer your query instead. */
  child_count: Scalars['Int']['output'];
  /**
   * The immediate descendants in the organisation tree
   *
   */
  children: Array<OrganisationUnit>;
  /**
   * Engagements for the organistion unit.
   *
   * May be an empty list if the organistion unit does not have any people employeed.
   * This situation may occur especially in the middle or the organisation tree.
   *
   */
  engagements: Array<Engagement>;
  /** Returns whether the organisation unit has children. */
  has_children: Scalars['Boolean']['output'];
  /**
   * IT (service) accounts.
   *
   * May be an empty list if the organistion unit does not have any IT (service) accounts whatsoever.
   * This situation may occur especially in the middle or the organisation tree.
   *
   */
  itusers: Array<ItUser>;
  /**
   * Same as itusers(), but with HACKs to enable validities.
   *
   * @deprecated Should only be used to query itusers when validity dates have been specified, "
   * "ex from_date & to_date."
   * "Will be removed when sub-query date handling is implemented.
   *
   */
  itusers_validity: Array<ItUser>;
  /**
   * KLE responsibilities for the organisation unit.
   *
   * Can help out with regards to GDPR by identifying which organisational units operate with sensitive tasks.
   *
   */
  kles: Array<Kle>;
  /**
   * Connection to employees leaves of absence relevant for the organisation unit.
   *
   */
  leaves: Array<Leave>;
  /**
   * Managerial roles for the organisation unit.
   *
   * May be empty in which case managers are usually inherited from parents.
   * See the `inherit`-flag for details.
   *
   */
  managers: Array<Manager>;
  /**
   * Human readable name of the organisation unit.
   *
   * This is the value that should be shown to users in UIs.
   *
   * Examples:
   * * `"Lunderskov skole"`
   * * `"IT-Support"`
   * * `"Teknik og Miljø"`
   *
   */
  name: Scalars['String']['output'];
  /**
   * UUID of the parent organisation unit.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `org_unit_hierarchy_model {uuid}` instead.
   *
   */
  org_unit_hierarchy?: Maybe<Scalars['UUID']['output']>;
  /**
   * Organisation unit hierarchy.
   *
   * Can be used to label an organisational structure to belong to a certain subset of the organisation tree.
   *
   * Examples of user-keys:
   * * `"Line-management"`
   * * `"Self-owned institution"`
   * * `"Outside organisation"`
   * * `"Hidden"`
   *
   * Note:
   * The organisation-gatekeeper integration is one option to keep hierarchy labels up-to-date.
   *
   */
  org_unit_hierarchy_model?: Maybe<Class>;
  /**
   * Organisation unit level.
   *
   * Examples of user-keys:
   * * `"N1"`
   * * `"N5"`
   * * `"N7"`
   *
   */
  org_unit_level?: Maybe<Class>;
  /**
   * UUID of the organisation unit level.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `org_unit_level {uuid}` instead.
   *
   */
  org_unit_level_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Owner roles for the organisation unit.
   *
   * May be empty in which case owners are usually inherited from parents.
   * See the `inherit`-flag for details.
   *
   */
  owners: Array<Owner>;
  /**
   * The parent organisation unit in the organisation tree.
   *
   */
  parent?: Maybe<OrganisationUnit>;
  /**
   * UUID of the parent organisation unit.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `parent {uuid}` instead.
   *
   */
  parent_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Related units for the organisational unit.
   *
   */
  related_units: Array<RelatedUnit>;
  /**
   * Time planning strategy.
   *
   */
  time_planning?: Maybe<Class>;
  /**
   * UUID of the time planning object.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `time_planning {uuid}` instead.
   *
   */
  time_planning_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * The object type.
   *
   * Always contains the string `org_unit`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /**
   * Organisation unit type.
   *
   * Organisation units can represent a lot of different classes of hierarchical structures.
   * Sometimes they represent cooperations, governments, NGOs or other true organisation types.
   * Oftentimes they represent the inner structure of these organisations.
   * Othertimes they represent project management structures such as project or teams.
   *
   * This field is used to distriguish all these different types of organisations.
   *
   * Examples of user-keys:
   * * `"Private Company"`
   * * `"Educational Institution"`
   * * `"Activity Center"`
   * * `"Daycare"`
   * * `"Team"`
   * * `"Project"`
   *
   */
  unit_type?: Maybe<Class>;
  /**
   * UUID of the organisation unit type.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `unit_type {uuid}` instead.
   *
   */
  unit_type_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Short unique key.
   *
   * Usually set to be set to the key used in external systems.
   *
   * Examples:
   * * `"CBCM"`
   * * `"SPHA"`
   * * `"1414"`
   *
   */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the created organisation unit. */
  validity: Validity;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitAddressesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OrgUnitsboundaddressfilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitAssociationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OrgUnitsboundassociationfilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitChild_CountArgs = {
  filter?: InputMaybe<ParentsBoundOrganisationUnitFilter>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitChildrenArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ParentsBoundOrganisationUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitEngagementsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OrgUnitsboundengagementfilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitHas_ChildrenArgs = {
  filter?: InputMaybe<ParentsBoundOrganisationUnitFilter>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitItusersArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OrgUnitsboundituserfilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitKlesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OrgUnitsboundklefilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitLeavesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OrgUnitsboundleavefilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitManagersArgs = {
  filter?: InputMaybe<ManagerFilter>;
  inherit?: Scalars['Boolean']['input'];
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitOrg_Unit_Hierarchy_ModelArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitOrg_Unit_LevelArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitOwnersArgs = {
  filter?: InputMaybe<OwnerFilter>;
  inherit?: Scalars['Boolean']['input'];
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitParentArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundOrganisationUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitRelated_UnitsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OrgUnitsboundrelatedunitfilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitTime_PlanningArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Organisation unit within the organisation tree */
export type OrganisationUnitUnit_TypeArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type OrganisationUnitCreateInput = {
  name: Scalars['String']['input'];
  org_unit_hierarchy?: InputMaybe<Scalars['UUID']['input']>;
  org_unit_level?: InputMaybe<Scalars['UUID']['input']>;
  org_unit_type: Scalars['UUID']['input'];
  parent?: InputMaybe<Scalars['UUID']['input']>;
  time_planning?: InputMaybe<Scalars['UUID']['input']>;
  user_key?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  validity: RaValidityInput;
};

/** Organisation unit filter. */
export type OrganisationUnitFilter = {
  /**
   * Select organisation units which have an ancestor matching the given filter.
   *
   * Note that every node is its own ancestor as per [CLRS] 12.2-6.
   *
   * Given the following tree:
   * ```
   * A
   * ├── B
   * │   ├── C
   * │   │   └── D
   * │   └── E
   * └── F
   * ```
   * the `ancestor` filter behaves according to the following table:
   *
   * | Filter | Returned    |
   * |--------|-------------|
   * |      A | A B C D E F |
   * |      B | B C D E     |
   * |      C | C D         |
   * |      D | D           |
   * |      E | E           |
   * |      F | F           |
   *
   */
  ancestor?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Select organisation units which have a descendant matching the given filter.
   *
   * Note that every node is its own descendant as per [CLRS] 12.2-6.
   *
   * Given the following tree:
   * ```
   * A
   * ├── B
   * │   ├── C
   * │   │   └── D
   * │   └── E
   * └── F
   * ```
   * the `descendant` filter behaves according to the following table:
   *
   * | Filter | Returned    |
   * |--------|-------------|
   * |      A | A           |
   * |      B | A B         |
   * |      C | A B C       |
   * |      D | A B C D     |
   * |      E | A B E       |
   * |      F | A F         |
   *
   */
  descendant?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Filter organisation units to only include matches pointed to by engagements.
   *
   * Can be used to find organisation units for certain engagements.
   *
   */
  engagement?: InputMaybe<EngagementFilter>;
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Filter organisation units by their organisational hierarchy labels.
   *
   * Can be used to extract a subset of the organisational structure.
   *
   * Examples of user-keys:
   * * `"Line-management"`
   * * `"Self-owned institution"`
   * * `"Outside organisation"`
   * * `"Hidden"`
   *
   * Note:
   * The organisation-gatekeeper integration is one option to keep hierarchy labels up-to-date.
   *
   * | `hierarchies`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'hierarchy' filter
   */
  hierarchies?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Hierarchy filter limiting which entries are returned.
   *
   * Filter organisation units by their organisational hierarchy labels.
   *
   * Can be used to extract a subset of the organisational structure.
   *
   * Examples of user-keys:
   * * `"Line-management"`
   * * `"Self-owned institution"`
   * * `"Outside organisation"`
   * * `"Hidden"`
   *
   * Note:
   * The organisation-gatekeeper integration is one option to keep hierarchy labels up-to-date.
   *
   */
  hierarchy?: InputMaybe<ClassFilter>;
  /**
   * Name filter finding exact matches by name.
   *
   * | `names`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  names?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * Select organisation units whose parent matches the given filter.
   *
   * Set to `None` to find root units.
   *
   */
  parent?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Parent UUID filter limiting which entries are returned.
   *
   * | `parents`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'parent' filter
   */
  parents?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Free text search.
   *
   * Does best effort lookup to find entities matching the query string.
   * No quarantees are given w.r.t. the entries returned.
   *
   */
  query?: InputMaybe<Scalars['String']['input']>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<OrganisationUnitRegistrationFilter>;
  /** @deprecated Renamed to 'descendant' */
  subtree?: InputMaybe<OrganisationUnitFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** OrganisationUnit registration filter. */
export type OrganisationUnitRegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type OrganisationUnitResponse = {
  __typename?: 'OrganisationUnitResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<OrganisationUnit>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<OrganisationUnit>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<OrganisationUnit>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type OrganisationUnitResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type OrganisationUnitResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type OrganisationUnitResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type OrganisationUnitResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type OrganisationUnitResponsePaged = {
  __typename?: 'OrganisationUnitResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<OrganisationUnitResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type OrganisationUnitTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID for the org-unit we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type OrganisationUnitUpdateInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  org_unit_hierarchy?: InputMaybe<Scalars['UUID']['input']>;
  org_unit_level?: InputMaybe<Scalars['UUID']['input']>;
  org_unit_type?: InputMaybe<Scalars['UUID']['input']>;
  parent?: InputMaybe<Scalars['UUID']['input']>;
  time_planning?: InputMaybe<Scalars['UUID']['input']>;
  user_key?: InputMaybe<Scalars['String']['input']>;
  uuid: Scalars['UUID']['input'];
  validity: RaValidityInput;
};

/**
 *
 * Owner of organisation units/employees and their connected identities.
 *
 */
export type Owner = {
  __typename?: 'Owner';
  /**
   * UUID of the employee related to the owner.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `employee {uuid}` instead.
   *
   */
  employee_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * The owned organisation unit.
   *
   * Note:
   * This field is mutually exclusive with the `employee` field.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  org_unit?: Maybe<Array<OrganisationUnit>>;
  /**
   * UUID of the organisation unit related to the owner.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `org_unit {uuid}` instead.
   *
   */
  org_unit_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * Owner of the connected person or organisation unit.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  owner?: Maybe<Array<Employee>>;
  /** Inference priority, if set: `engagement_priority` or `association_priority` */
  owner_inference_priority?: Maybe<OwnerInferencePriority>;
  /**
   * UUID of the owner.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `owner {uuid}` instead.
   *
   */
  owner_uuid?: Maybe<Scalars['UUID']['output']>;
  /**
   * The owned person.
   *
   * Note:
   * This field is mutually exclusive with the `org_unit` field.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  person?: Maybe<Array<Employee>>;
  /**
   *
   * The object type.
   *
   * Always contains the string `owner`.
   *
   * @deprecated
   * Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /** Short, unique key. Defaults to object UUID. */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the owner object. */
  validity: Validity;
};


/**
 *
 * Owner of organisation units/employees and their connected identities.
 *
 */
export type OwnerOrg_UnitArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundOrganisationUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 *
 * Owner of organisation units/employees and their connected identities.
 *
 */
export type OwnerOwnerArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 *
 * Owner of organisation units/employees and their connected identities.
 *
 */
export type OwnerPersonArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundEmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type OwnerCreateInput = {
  /** Inference priority, if set: `engagement_priority` or `association_priority` */
  inference_priority?: InputMaybe<OwnerInferencePriority>;
  /** UUID of the org unit */
  org_unit?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the owner */
  owner?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the person */
  person?: InputMaybe<Scalars['UUID']['input']>;
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Validity range for the owner. */
  validity: RaValidityInput;
};

/** Owner filter. */
export type OwnerFilter = {
  /**
   * Employee filter limiting which entries are returned.
   *
   */
  employee?: InputMaybe<EmployeeFilter>;
  /**
   * Employee UUID filter limiting which entries are returned.
   *
   * | `employees`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'employee' filter
   */
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Organisation Unit filter limiting which entries are returned.
   *
   */
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Organisational Unit UUID filter limiting which entries are returned.
   *
   * | `org_units`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'org_unit' filter
   */
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Owner filter limiting which entries are returned.
   *
   */
  owner?: InputMaybe<EmployeeFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/**
 * Enum for the supported inference priorities.
 *
 */
export enum OwnerInferencePriority {
  /**
   * The association priority.
   *
   */
  Association = 'ASSOCIATION',
  /**
   * The engagement priority.
   *
   */
  Engagement = 'ENGAGEMENT'
}

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type OwnerResponse = {
  __typename?: 'OwnerResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<Owner>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<Owner>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<Owner>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type OwnerResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type OwnerResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type OwnerResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type OwnerResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type OwnerResponsePaged = {
  __typename?: 'OwnerResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<OwnerResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type OwnerTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID of the owner we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type OwnerUpdateInput = {
  /** Inference priority, if set: `engagement_priority` or `association_priority` */
  inference_priority?: InputMaybe<OwnerInferencePriority>;
  /** UUID of the org unit */
  org_unit?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the owner */
  owner?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the person */
  person?: InputMaybe<Scalars['UUID']['input']>;
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the owner to be updated. */
  uuid: Scalars['UUID']['input'];
  /** Validity range for the owner. */
  validity: RaValidityInput;
};

/**
 * Container for page information.
 *
 * Contains the cursors necessary to fetch other pages.
 * Contains information on when to stop iteration.
 *
 */
export type PageInfo = {
  __typename?: 'PageInfo';
  /**
   * Cursor for the next page of results.
   *
   * Should be provided to the `cursor` argument to iterate forwards.
   *
   */
  next_cursor?: Maybe<Scalars['Cursor']['output']>;
};

export type ParentsBoundClassFilter = {
  facet?: InputMaybe<FacetFilter>;
  facet_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  facets?: InputMaybe<Array<Scalars['UUID']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  it_system?: InputMaybe<ItSystemFilter>;
  owner?: InputMaybe<ClassOwnerFilter>;
  parent?: InputMaybe<ClassFilter>;
  parent_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  registration?: InputMaybe<ClassRegistrationFilter>;
  scope?: InputMaybe<Array<Scalars['String']['input']>>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type ParentsBoundFacetFilter = {
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  parent?: InputMaybe<FacetFilter>;
  parent_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  registration?: InputMaybe<FacetRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type ParentsBoundOrganisationUnitFilter = {
  ancestor?: InputMaybe<OrganisationUnitFilter>;
  descendant?: InputMaybe<OrganisationUnitFilter>;
  engagement?: InputMaybe<EngagementFilter>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  hierarchies?: InputMaybe<Array<Scalars['UUID']['input']>>;
  hierarchy?: InputMaybe<ClassFilter>;
  names?: InputMaybe<Array<Scalars['String']['input']>>;
  parent?: InputMaybe<OrganisationUnitFilter>;
  query?: InputMaybe<Scalars['String']['input']>;
  registration?: InputMaybe<OrganisationUnitRegistrationFilter>;
  subtree?: InputMaybe<OrganisationUnitFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** Entrypoint for all read-operations */
export type Query = {
  __typename?: 'Query';
  /** Get addresses. */
  addresses: AddressResponsePaged;
  /** Get associations. */
  associations: AssociationResponsePaged;
  /**
   * Get a list of audit events.
   *
   * Mostly useful for auditing purposes seeing when data was read and by whom.
   *
   */
  auditlog: AuditLogPaged;
  /** Get classes. */
  classes: ClassResponsePaged;
  /** Get configuration variables. */
  configuration: ConfigurationPaged;
  /** Get employees. */
  employees: EmployeeResponsePaged;
  /** Get engagements. */
  engagements: EngagementResponsePaged;
  /** Get facets. */
  facets: FacetResponsePaged;
  /**
   * Fetch files from the configured file backend (if any).
   * @deprecated The file-store functionality will be removed in a future version of OS2mo.
   */
  files: FilePaged;
  /** Query healthcheck status. */
  healths: HealthPaged;
  /** Get it-systems. */
  itsystems: ItSystemResponsePaged;
  /** Get it-users. */
  itusers: ItUserResponsePaged;
  /** Get kles. */
  kles: KleResponsePaged;
  /** Get leaves. */
  leaves: LeaveResponsePaged;
  /** Get manager roles. */
  managers: ManagerResponsePaged;
  /**
   * Get the root organisation.
   *
   * This endpoint fails if not exactly one exists in LoRa.
   *
   * @deprecated The root organisation concept will be removed in a future version of OS2mo.
   */
  org: Organisation;
  /** Get organisation units. */
  org_units: OrganisationUnitResponsePaged;
  /** Get owners. */
  owners: OwnerResponsePaged;
  /**
   * Get a list of registrations.
   *
   * Mostly useful for auditing purposes seeing when data-changes were made and by whom.
   *
   * **Warning**:
   * This entry should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: RegistrationPaged;
  /** Get related organisation units. */
  related_units: RelatedUnitResponsePaged;
  /** Get role-mappings. */
  rolebindings: RoleBindingResponsePaged;
  /** Get component versions of OS2mo. */
  version: Version;
};


/** Entrypoint for all read-operations */
export type QueryAddressesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<AddressFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryAssociationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<AssociationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryAuditlogArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<AuditLogFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryClassesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryConfigurationArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ConfigurationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryEmployeesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EmployeeFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryEngagementsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<EngagementFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryFacetsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<FacetFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryFilesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter: FileFilter;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryHealthsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<HealthFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryItsystemsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ItSystemFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryItusersArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ItUserFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryKlesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<KleFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryLeavesArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<LeaveFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryManagersArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ManagerFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryOrg_UnitsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OrganisationUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryOwnersArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<OwnerFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<RegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryRelated_UnitsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<RelatedUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** Entrypoint for all read-operations */
export type QueryRolebindingsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<RoleBindingFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type RaOpenValidityInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** End date of the validity, if applicable. */
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export type RaValidityInput = {
  /** Start date of the validity. */
  from: Scalars['DateTime']['input'];
  /** End date of the validity, if applicable. */
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Bitemporal container.
 *
 * Mostly useful for auditing purposes seeing when data-changes were made and by whom.
 *
 * Note:
 * Will eventually contain a full temporal axis per bitemporal container.
 *
 * **Warning**:
 * This entry should **not** be used to implement event-driven integrations.
 * Such integration should rather utilize the AMQP-based event-system.
 *
 */
export type Registration = {
  __typename?: 'Registration';
  /**
   * UUID of the actor (integration or user) who changed the data.
   *
   * Note:
   * Currently mostly returns `"42c432e8-9c4a-11e6-9f62-873cf34a735f"`.
   * Will eventually contain for the UUID of the integration or user who mutated data, based on the JWT token.
   *
   */
  actor: Scalars['UUID']['output'];
  /**
   * End of the bitemporal interval.
   *
   * `null` indicates the open interval, aka. infinity.
   *
   * Examples:
   * * `"1970-01-01T00:00:00.000000+00:00"`
   * * `"2019-12-18T12:55:15.348614+00:00"`
   * * `null`
   *
   */
  end?: Maybe<Scalars['DateTime']['output']>;
  /**
   * Model of the modified entity.
   *
   * Examples:
   * * `"class"`
   * * `"employee"`
   * * `"org_unit"`
   *
   */
  model: Scalars['String']['output'];
  /** Note associated with the registration. */
  note?: Maybe<Scalars['String']['output']>;
  /**
   * Internal registration ID for the registration.
   *
   * @deprecated May be removed in the future once the bitemporal scheme is finished.
   *
   */
  registration_id: Scalars['Int']['output'];
  /**
   * Start of the bitemporal interval.
   *
   * Examples:
   * * `"1970-01-01T00:00:00.000000+00:00"`
   * * `"2019-12-18T12:55:15.348614+00:00"`
   *
   */
  start: Scalars['DateTime']['output'];
  /**
   * UUID of the modified entity.
   *
   */
  uuid: Scalars['UUID']['output'];
};

/** Registration filter. */
export type RegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Filter registrations by their model type.
   *
   * Can be used to select all changes of a type.
   *
   * | `models`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  models?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/** Result page in cursor-based pagination. */
export type RegistrationPaged = {
  __typename?: 'RegistrationPaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<Registration>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

/** An organisation unit relation mapping */
export type RelatedUnit = {
  __typename?: 'RelatedUnit';
  /**
   * UUIDs of the related organisation units.
   * @deprecated Will be removed in a future version of GraphQL.
   * Use `org_units {uuid}` instead.
   *
   */
  org_unit_uuids: Array<Scalars['UUID']['output']>;
  /**
   * Related organisation units.
   *
   * Examples of user-keys:
   * * `["Administrative", "Payroll"]`
   * * `["IT-Support", "IT-Support]`
   * * `["Majora School", "Alias School"]`
   *
   * Note:
   * The result list should always be of length 2, corresponding to the elements of the bijection.
   *
   */
  org_units: Array<OrganisationUnit>;
  /**
   * The object type.
   *
   * Always contains the string `related_units`.
   *
   * @deprecated Unintentionally exposed implementation detail.
   * Provides no value whatsoever.
   *
   */
  type: Scalars['String']['output'];
  /**
   * User-key of the entity.
   *
   * Usually constructed from the user-keys of our organisation units at creation time.
   *
   * Examples:
   * * `"Administrative <-> Payroll"`
   * * `"IT-Support <-> IT-Support`
   * * `"Majora School <-> Alias School"`
   *
   */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the relatedUnit object. */
  validity: Validity;
};


/** An organisation unit relation mapping */
export type RelatedUnitOrg_UnitsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundOrganisationUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

/** Related unit filter. */
export type RelatedUnitFilter = {
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * Organisation Unit filter limiting which entries are returned.
   *
   */
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Organisational Unit UUID filter limiting which entries are returned.
   *
   * | `org_units`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'org_unit' filter
   */
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type RelatedUnitResponse = {
  __typename?: 'RelatedUnitResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<RelatedUnit>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<RelatedUnit>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<RelatedUnit>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type RelatedUnitResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type RelatedUnitResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type RelatedUnitResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type RelatedUnitResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type RelatedUnitResponsePaged = {
  __typename?: 'RelatedUnitResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<RelatedUnitResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type RelatedUnitsUpdateInput = {
  /** UUID of the units to create relations to. */
  destination?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** UUID of the unit to create relations under. */
  origin: Scalars['UUID']['input'];
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** From date. */
  validity: RaValidityInput;
};

export type ResolvedAddress = {
  value: Scalars['String']['output'];
};

/** The role a person has within an organisation unit */
export type RoleBinding = {
  __typename?: 'RoleBinding';
  /**
   * The IT-user that should be granted this role
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  ituser: Array<ItUser>;
  /**
   * The organisational unit in which the role is being fulfilled.
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  org_unit: Array<OrganisationUnit>;
  /**
   * The role that is being fulfilled.
   *
   * Examples of user-keys:
   * * `"AD Read"`
   * * `"AD Write"`
   * * `"SAP Admin"`
   *
   * **Warning**:
   * This field will probably become an optional entity instead of a list in the future.
   *
   */
  role: Array<Class>;
  /** Short, unique key. Defaults to object UUID. */
  user_key: Scalars['String']['output'];
  /** UUID of the entity */
  uuid: Scalars['UUID']['output'];
  /** Validity of the role object. */
  validity: Validity;
};


/** The role a person has within an organisation unit */
export type RoleBindingItuserArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundItUserFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** The role a person has within an organisation unit */
export type RoleBindingOrg_UnitArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundOrganisationUnitFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/** The role a person has within an organisation unit */
export type RoleBindingRoleArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<UuidsBoundClassFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};

export type RoleBindingCreateInput = {
  /** UUID of the ituser */
  ituser: Scalars['UUID']['input'];
  /** UUID of the org_unit */
  org_unit?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the role type */
  role: Scalars['UUID']['input'];
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID to be created. Will be autogenerated if not specified. */
  uuid?: InputMaybe<Scalars['UUID']['input']>;
  /** Validity range for the role. */
  validity: RaValidityInput;
};

/** Rolebinding filter. */
export type RoleBindingFilter = {
  /** Limit the elements returned by their starting validity. */
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * ITUser filter limiting which entries are returned.
   *
   */
  ituser?: InputMaybe<ItUserFilter>;
  /**
   * Organisation Unit filter limiting which entries are returned.
   *
   */
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  /**
   * Organisational Unit UUID filter limiting which entries are returned.
   *
   * | `org_units`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   * @deprecated Replaced by the 'org_unit' filter
   */
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /**
   * Registration filter limiting which entries are returned.
   *
   */
  registration?: InputMaybe<RoleRegistrationFilter>;
  /** Limit the elements returned by their ending validity. */
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  /**
   * User-key filter limiting which entries are returned.
   *
   * | `user_keys`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * UUID filter limiting which entries are returned.
   *
   * | `uuids`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type RoleBindingResponse = {
  __typename?: 'RoleBindingResponse';
  /**
   * Actual / current state entrypoint.
   *
   * Returns the state of the object at current validity and current assertion time.
   *
   * A single object is returned as only one validity can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint is appropriate to use for actual-state integrations and UIs.
   *
   */
  current?: Maybe<RoleBinding>;
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   * @deprecated
   * Will be removed in a future version of GraphQL.
   * Use validities instead.
   *
   */
  objects: Array<RoleBinding>;
  /**
   * Bitemporal state entrypoint.
   *
   * Returns the state of the object at varying validities and varying assertion times.
   *
   * A list of bitemporal container objects are returned, each containing many different validity intervals.
   *
   * Note:
   * This the entrypoint should only be used for bitemporal integrations and UIs, such as for auditing purposes.
   * For temporal integration, please consider using `objects` instead.
   * For actual-state integrations, please consider using `current` instead.
   *
   * **Warning**:
   * This entrypoint should **not** be used to implement event-driven integrations.
   * Such integration should rather utilize the AMQP-based event-system.
   *
   */
  registrations: Array<Registration>;
  /** UUID of the bitemporal object */
  uuid: Scalars['UUID']['output'];
  /**
   * Temporal state entrypoint.
   *
   * Returns the state of the object at varying validities and current assertion time.
   *
   * A list of objects are returned as only many different validity intervals can be active at a given assertion time.
   *
   * Note:
   * This the entrypoint should be used for temporal integrations and UIs.
   * For actual-state integrations, please consider using `current` instead.
   *
   */
  validities: Array<RoleBinding>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type RoleBindingResponseCurrentArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type RoleBindingResponseObjectsArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type RoleBindingResponseRegistrationsArgs = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ModelsUuidsBoundRegistrationFilter>;
  limit?: InputMaybe<Scalars['int']['input']>;
};


/**
 * Top-level container for (bi)-temporal and actual state data access.
 *
 * Contains a UUID uniquely denoting the bitemporal object.
 *
 * Contains three different object temporality axis:
 *
 * | entrypoint      | temporal axis | validity time | assertion time |
 * |-----------------|---------------|---------------|----------------|
 * | `current`       | actual state  | current       | current        |
 * | `objects`       | temporal      | varying       | current        |
 * | `registrations` | bitemporal    | varying       | varying        |
 *
 * The argument for having three different entrypoints into the data is limiting complexity according to use-case.
 *
 * That is, if a certain integration or UI only needs, say, actual state data, the complexities of the bitemporal data modelling is unwanted complexity, and as such, better left out.
 *
 */
export type RoleBindingResponseValiditiesArgs = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type RoleBindingResponsePaged = {
  __typename?: 'RoleBindingResponsePaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<RoleBindingResponse>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type RoleBindingTerminateInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** When the validity should end - required when terminating */
  to: Scalars['DateTime']['input'];
  /** UUID of the role we want to terminate. */
  uuid: Scalars['UUID']['input'];
};

export type RoleBindingUpdateInput = {
  /** UUID of the ituser */
  ituser: Scalars['UUID']['input'];
  /** UUID of the role's organisation unit to be updated. */
  org_unit?: InputMaybe<Scalars['UUID']['input']>;
  /** UUID of the role type */
  role?: InputMaybe<Scalars['UUID']['input']>;
  /** Extra info or uuid. */
  user_key?: InputMaybe<Scalars['String']['input']>;
  /** UUID of the role to be updated. */
  uuid: Scalars['UUID']['input'];
  /** Validity range for the role to be updated. */
  validity: RaValidityInput;
};

/** Role registration filter. */
export type RoleRegistrationFilter = {
  /**
   * Filter registrations by their changing actor.
   *
   * Can be used to select all changes made by a particular user or integration.
   *
   * | `actors`      | Elements returned                            |
   * |--------------|----------------------------------------------|
   * | not provided | All                                          |
   * | `null`       | All                                          |
   * | `[]`         | None                                         |
   * | `"x"`        | `["x"]` or `[]` (`*`)                        |
   * | `["x", "y"]` | `["x", "y"]`, `["x"]`, `["y"]` or `[]` (`*`) |
   *
   * `*`: Elements returned depends on which elements were found.
   *
   */
  actors?: InputMaybe<Array<Scalars['UUID']['input']>>;
  /** Limit the elements returned by their ending validity. */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Limit the elements returned by their starting validity. */
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Result page in cursor-based pagination. */
export type UuidPaged = {
  __typename?: 'UUIDPaged';
  /**
   * List of results.
   *
   * The number of elements is defined by the `limit` argument.
   *
   */
  objects: Array<Scalars['UUID']['output']>;
  /**
   * Container for page information.
   *
   * Contains the cursors necessary to fetch other pages.
   * Contains information on when to stop iteration.
   *
   */
  page_info: PageInfo;
};

export type UuidsBoundClassFilter = {
  facet?: InputMaybe<FacetFilter>;
  facet_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  facets?: InputMaybe<Array<Scalars['UUID']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  it_system?: InputMaybe<ItSystemFilter>;
  owner?: InputMaybe<ClassOwnerFilter>;
  parent?: InputMaybe<ClassFilter>;
  parent_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  parents?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<ClassRegistrationFilter>;
  scope?: InputMaybe<Array<Scalars['String']['input']>>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UuidsBoundEmployeeFilter = {
  cpr_numbers?: InputMaybe<Array<Scalars['CPR']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  registration?: InputMaybe<EmployeeRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UuidsBoundEngagementFilter = {
  employee?: InputMaybe<EmployeeFilter>;
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  job_function?: InputMaybe<ClassFilter>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<EngagementRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UuidsBoundFacetFilter = {
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  parent?: InputMaybe<FacetFilter>;
  parent_user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
  parents?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<FacetRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UuidsBoundItSystemFilter = {
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  registration?: InputMaybe<ItSystemRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UuidsBoundItUserFilter = {
  employee?: InputMaybe<EmployeeFilter>;
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  engagement?: InputMaybe<EngagementFilter>;
  external_ids?: InputMaybe<Array<Scalars['String']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  itsystem?: InputMaybe<ItSystemFilter>;
  itsystem_uuids?: InputMaybe<Array<Scalars['UUID']['input']>>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<ItUserRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UuidsBoundLeaveFilter = {
  employee?: InputMaybe<EmployeeFilter>;
  employees?: InputMaybe<Array<Scalars['UUID']['input']>>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  org_unit?: InputMaybe<OrganisationUnitFilter>;
  org_units?: InputMaybe<Array<Scalars['UUID']['input']>>;
  registration?: InputMaybe<LeaveRegistrationFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UuidsBoundOrganisationUnitFilter = {
  ancestor?: InputMaybe<OrganisationUnitFilter>;
  descendant?: InputMaybe<OrganisationUnitFilter>;
  engagement?: InputMaybe<EngagementFilter>;
  from_date?: InputMaybe<Scalars['DateTime']['input']>;
  hierarchies?: InputMaybe<Array<Scalars['UUID']['input']>>;
  hierarchy?: InputMaybe<ClassFilter>;
  names?: InputMaybe<Array<Scalars['String']['input']>>;
  parent?: InputMaybe<OrganisationUnitFilter>;
  parents?: InputMaybe<Array<Scalars['UUID']['input']>>;
  query?: InputMaybe<Scalars['String']['input']>;
  registration?: InputMaybe<OrganisationUnitRegistrationFilter>;
  subtree?: InputMaybe<OrganisationUnitFilter>;
  to_date?: InputMaybe<Scalars['DateTime']['input']>;
  user_keys?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Validity of objects with required from date */
export type Validity = {
  __typename?: 'Validity';
  /** Start date of the validity. */
  from: Scalars['DateTime']['output'];
  /** End date of the validity, if applicable. */
  to?: Maybe<Scalars['DateTime']['output']>;
};

export type ValidityInput = {
  /** Start date of the validity. */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** End date of the validity, if applicable. */
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

/** MO and DIPEX versions */
export type Version = {
  __typename?: 'Version';
  /**
   * DIPEX version.
   *
   * Contains a [semantic version](https://semver.org/) if configured.
   * Contains the `null` on development builds of OS2mo.
   *
   * Examples:
   * * `null`
   * * `4.34.1`
   * * `4.28.0`
   *
   */
  dipex_version?: Maybe<Scalars['String']['output']>;
  /**
   * LoRa version. Returns the exact same as `mo_version`.
   * @deprecated MO and LoRa are shipped and versioned together
   */
  lora_version?: Maybe<Scalars['String']['output']>;
  /**
   * OS2mo commit hash.
   *
   * Contains a git hash on released versions of OS2mo.
   * Contains the empty string on development builds of OS2mo.
   *
   * Examples:
   * * `""`
   * * `880bd2009baccbdf795a8cef3b5b32b42c91c51b`
   * * `b29e45449a857cf78725eff10c5856075417ea51`
   *
   */
  mo_hash?: Maybe<Scalars['String']['output']>;
  /**
   * OS2mo Version.
   *
   * Contains a [semantic version](https://semver.org/) on released versions of OS2mo.
   * Contains the string `HEAD` on development builds of OS2mo.
   *
   * Examples:
   * * `HEAD`
   * * `22.2.6`
   * * `21.0.0`
   *
   */
  mo_version?: Maybe<Scalars['String']['output']>;
};
