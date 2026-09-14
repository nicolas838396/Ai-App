import { validateEnv } from "./env.validation";

describe("validateEnv", () => {
  const validConfig = {
    DATABASE_URL: "postgresql://app:app@localhost:5432/mentalhealth",
    REDIS_URL: "redis://localhost:6379",
    SUPABASE_URL: "https://example.supabase.co",
    ANTHROPIC_API_KEY: "sk-ant-test",
  };

  it("accepts a valid config and applies defaults", () => {
    const result = validateEnv(validConfig);
    expect(result.PORT).toBe(4000);
    expect(result.NODE_ENV).toBe("development");
    expect(result.ANTHROPIC_MODEL).toBe("claude-sonnet-5");
  });

  it("throws when a required variable is missing", () => {
    const rest = { ...validConfig, DATABASE_URL: undefined };
    expect(() => validateEnv(rest)).toThrow(/DATABASE_URL/);
  });
});
