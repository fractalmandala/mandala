import { describe, expect, it } from "vitest";
import { highlightSvelte } from "../src/demo/syntax";

describe("highlightSvelte", () => {
  it("adds readable token classes for Svelte and TypeScript syntax", () => {
    const highlighted = highlightSvelte(`<!-- comment -->
<MorphIcon icon={open ? X : Menu} spring="bouncy" />
let open = $state(false);`);

    expect(highlighted).toContain("code-token-comment");
    expect(highlighted).toContain("code-token-component");
    expect(highlighted).toContain("code-token-attr");
    expect(highlighted).toContain("code-token-string");
    expect(highlighted).toContain("code-token-keyword");
    expect(highlighted).toContain("code-token-variable");
    expect(highlighted).toContain("code-token-number");
  });

  it("escapes source text before inserting token markup", () => {
    const highlighted = highlightSvelte(`<div title="<img src=x>">&</div>`);

    expect(highlighted).toContain("&lt;img src=x&gt;");
    expect(highlighted).toContain("&amp;");
    expect(highlighted).not.toContain('<img src="x">');
  });
});
