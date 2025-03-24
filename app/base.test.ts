import { test, expect } from "bun:test";
import Base from "./base";
import { LatLng } from "./types";

test("Base.validGeo validates coordinates correctly", () => {
  // Valid coordinates
  expect(Base.validGeo([0, 0] as LatLng)).toBe(true);
  expect(Base.validGeo([10.5, 20.3] as LatLng)).toBe(true);
  expect(Base.validGeo([-180, -90] as LatLng)).toBe(true);
  expect(Base.validGeo([180, 90] as LatLng)).toBe(true);

  // Invalid coordinates
  expect(Base.validGeo(null)).toBe(false);
  expect(Base.validGeo(undefined)).toBe(false);
  expect(Base.validGeo([] as unknown as LatLng)).toBe(false);
  expect(Base.validGeo([null, null] as unknown as LatLng)).toBe(false);
  expect(Base.validGeo([NaN, NaN] as LatLng)).toBe(false);
});

test("Base.simScore calculates similarity correctly", () => {
  // Identical strings
  expect(Base.simScore("paris", "paris")).toBe(1);

  // Similar strings
  expect(Base.simScore("paris", "pari")).toBeGreaterThan(0.7);

  // Different strings
  expect(Base.simScore("paris", "london")).toBeLessThan(0.5);
});

test("Base.shortenText works correctly", () => {
  expect(Base.shortenText("Hello World", 5)).toBe("Hello...");
  expect(Base.shortenText("Hello", 10)).toBe("Hello");
});
