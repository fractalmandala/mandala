import assert from "node:assert/strict";
import test from "node:test";
import { normalizeFileLinkDestinations } from "./normalize-file-links.mjs";

test("normalizes each file link without consuming a later link on the same line", () => {
  assert.equal(
    normalizeFileLinkDestinations(
      "[one](file:///tmp/a b) and [two](file:///tmp/c d)",
    ),
    "[one](file:///tmp/a%20b) and [two](file:///tmp/c%20d)",
  );
});
