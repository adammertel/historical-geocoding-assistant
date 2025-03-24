declare module "bun:test" {
  export function test(name: string, fn: () => void | Promise<void>): void;

  export interface ExpectResult {
    toBe(value: any): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeGreaterThan(value: number): void;
    toBeLessThan(value: number): void;
    toBeGreaterThanOrEqual(value: number): void;
    toBeLessThanOrEqual(value: number): void;
    toContain(value: any): void;
    toHaveLength(length: number): void;
    toThrow(error?: any): void;
    not: ExpectResult;
  }

  export function expect(value: any): ExpectResult;
}
