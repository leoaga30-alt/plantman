import { describe, expect, it } from "vitest";
import { parseJsonResponse } from "../json";

describe("parseJsonResponse", () => {
  it("parses plain JSON", () => {
    expect(parseJsonResponse('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips ```json fences", () => {
    expect(parseJsonResponse('```json\n{\n  "a": { "b": [1, 2] }\n}\n```')).toEqual({
      a: { b: [1, 2] },
    });
  });

  it("ignores text around the JSON", () => {
    expect(parseJsonResponse('Voici le profil :\n```\n{"a":"}"}\n```\nBonne culture !')).toEqual({
      a: "}",
    });
  });

  it("still throws on invalid JSON", () => {
    expect(() => parseJsonResponse("pas de json")).toThrow();
    expect(() => parseJsonResponse("```json\n{ cassé \n```")).toThrow();
  });
});
