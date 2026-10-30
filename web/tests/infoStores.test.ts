import { validateAddress } from "$lib/stores/addressInfoStore"
import { validateEmployee } from "$lib/stores/employeeInfoStore"
import { validateEngagement } from "$lib/stores/engagementInfoStore"
import { validateItuser } from "$lib/stores/ituserInfoStore"
import { validateManager } from "$lib/stores/managerInfoStore"
import { describe, expect, it } from "vitest"
import { address, employee, engagement, ituser, manager } from "./fixtures"

describe("validateEmployee", () => {
  it.each([
    ["complete", {}, true],
    ["CPR with a dash", { cprNumber: { name: "", cpr_no: "010101-2345" } }, true],
    ["no first name", { firstName: "" }, false],
    ["no last name", { lastName: "" }, false],
    ["short CPR", { cprNumber: { name: "", cpr_no: "12345" } }, false],
    ["CPR with a letter", { cprNumber: { name: "", cpr_no: "123456789a" } }, false],
  ])("%s: %s", (_, patch, expected) => {
    expect(validateEmployee(employee(patch))).toBe(expected)
  })
})

describe("validateEngagement", () => {
  it.each([
    ["complete", {}, true],
    ["no start date", { fromDate: null }, false],
    ["no unit", { orgUnit: undefined }, false],
    ["no job function", { jobFunction: undefined }, false],
    ["no engagement type", { engagementType: undefined }, false],
  ])("%s: %s", (_, patch, expected) => {
    expect(validateEngagement(engagement(patch))).toBe(expected)
  })
})

describe("validateItuser", () => {
  it.each([
    ["complete", {}, true],
    ["no start date", { fromDate: null }, false],
    ["no IT system", { itSystem: undefined }, false],
    ["no account name", { user_key: "" }, false],
  ])("%s: %s", (_, patch, expected) => {
    expect(validateItuser(ituser(patch))).toBe(expected)
  })
})

describe("validateManager", () => {
  it.each([
    ["complete", {}, true],
    ["no start date", { fromDate: null }, false],
    ["no unit", { orgUnit: undefined }, false],
    ["no manager type", { managerType: undefined }, false],
    ["no manager level", { managerLevel: undefined }, false],
    ["no responsibilities", { responsibilities: [] }, false],
  ])("%s: %s", (_, patch, expected) => {
    expect(validateManager(manager(patch))).toBe(expected)
  })
})

describe("validateAddress", () => {
  const typed = (scope: string, value: string) => ({
    addressType: { uuid: "at", name: scope, scope },
    addressValue: { name: "", value },
  })

  it.each([
    ["an email", typed("EMAIL", "a@b.dk"), true],
    ["a malformed email", typed("EMAIL", "a@"), false],
    ["a phone number", typed("PHONE", "+4512345678"), true],
    ["a phone number with letters", typed("PHONE", "12 34 ab"), false],
    ["any text for other types", typed("TEXT", "Main St 1"), true],
    ["no start date", { fromDate: null }, false],
    ["no address type", { addressType: undefined }, false],
    ["no value", typed("TEXT", ""), false],
  ])("%s: %s", (_, patch, expected) => {
    expect(validateAddress(address(patch))).toBe(expected)
  })
})
