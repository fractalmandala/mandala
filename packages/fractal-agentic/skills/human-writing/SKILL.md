---
name: human-writing
description: 'Remove AI-writing tells and restore natural voice in docs, emails, PRDs, blog posts, and other prose. Use when editing or reviewing text that sounds generic, inflated, or template-like. Based on Wikipedia WikiProject AI Cleanup patterns (inflated symbolism, promotional tone, vague attribution, AI vocabulary, em-dash overuse, rule of three, and related tells).'
---

# Human writing

Make prose sound like a person wrote it: clear, specific, and voiced — not like a press release generator.

Patterns below draw on Wikipedia’s [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) (WikiProject AI Cleanup).

## When to use

- Editing docs, READMEs, emails, PRDs, blog posts, release notes
- User asks to “humanize,” “de-AI,” “make this sound natural,” or “remove slop”
- Drafts that are clean but soulless (uniform rhythm, no stance, pure summary)

## When not to use

- Legal / compliance text that must stay formulaic
- Code comments that should stay terse and technical (unless user asks)
- Changing meaning or inventing facts while “styling”

## Process

1. Scan for the patterns below.
2. Rewrite only the problematic parts.
3. Keep meaning, facts, and required terminology.
4. Match the intended audience and tone.
5. Prefer specificity over polish.

---

## Voice matters

Avoiding AI tells is half the job. Sterile writing is still obvious.

**Soulless signs:** same sentence length everywhere; no opinions; no uncertainty; no first person when it would fit; no humor or edge; reads like a brochure.

**How to add voice:**

- Have a stance. React, don’t only list.
- Vary rhythm: short punches and longer sentences.
- Acknowledge complexity and tradeoffs.
- Use “I” when appropriate.
- Prefer concrete detail over abstract praise.

**Before (clean but empty):**

> The experiment produced interesting results. The agents generated 3 million lines of code. Some developers were impressed while others were skeptical. The implications remain unclear.

**After (has a pulse):**

> I genuinely don’t know how to feel about this one. 3 million lines of code, generated while the humans presumably slept. Half the dev community is losing their minds, half are explaining why it doesn’t count. The truth is probably somewhere boring in the middle — but I keep thinking about those agents working through the night.

---

## Content patterns

**Inflated significance.** “stands/serves as,” “testament,” “pivotal moment,” “underscores,” “evolving landscape,” “indelible mark.”

Before: “This initiative was part of a broader movement… marking a pivotal moment…”

After: State what happened and why it existed, without the ceremony.

**Undue notability.** “independent coverage,” “national media,” “active social media presence” as filler prestige.

**Superficial -ing analyses.** Trailing “highlighting,” “ensuring,” “reflecting,” “showcasing” clauses that add fake depth.

**Promotional language.** “boasts,” “vibrant,” “stunning,” “groundbreaking,” “nestled in the heart of.”

**Vague attributions.** “Experts argue,” “Industry reports,” “several sources” without a named source.

**Formulaic challenges sections.** “Despite its… faces several challenges… Despite these challenges… Future Outlook.”

---

## Language patterns

**AI vocabulary cluster:** Additionally, align with, crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight (verb), interplay, intricate, landscape (abstract), pivotal, showcase, tapestry, testament, underscore, valuable, vibrant — often stacked.

**Copula avoidance.** “serves as / stands as / boasts / features” instead of “is / has.”

**Negative parallelisms.** “It’s not just X, it’s Y” overused.

**Rule of three.** Forced triads for completeness theater.

**Synonym cycling.** Same entity renamed every sentence (protagonist → main character → hero).

**False ranges.** “from X to Y” where X and Y are not on a scale.

---

## Style patterns

- **Em dash overuse** — thin them out; use commas or periods.
- **Boldface overuse** — unbold mechanical emphasis.
- **Inline-header bullet lists** for every paragraph — turn back into prose when possible.
- **Title Case Headings** — prefer sentence case unless house style says otherwise.
- **Emoji decoration** in professional docs — remove unless brand requires it.
- **Curly quotes** — prefer straight quotes in code-adjacent docs.

---

## Communication artifacts

Strip chatbot residue from final content:

- “I hope this helps,” “Of course!,” “Certainly!,” “You’re absolutely right!”
- “Would you like me to…,” “let me know if…”
- Knowledge-cutoff disclaimers left in published text
- Sycophantic openers (“Great question!”)

---

## Filler and hedging

| Bloated | Prefer |
| --- | --- |
| in order to | to |
| due to the fact that | because |
| at this point in time | now |
| in the event that | if |
| has the ability to | can |
| it is important to note that | (delete; state the point) |

Simplify stacked hedges: “could potentially possibly be argued” → “may.”

Replace generic bright futures with concrete next steps.

---

## Full example

**Before:**

> The new software update serves as a testament to the company’s commitment to innovation. Moreover, it provides a seamless, intuitive, and powerful user experience—ensuring that users can accomplish their goals efficiently. It’s not just an update, it’s a revolution in how we think about productivity. Industry experts believe this will have a lasting impact on the entire sector, highlighting the company’s pivotal role in the evolving technological landscape.

**After:**

> The software update adds batch processing, keyboard shortcuts, and offline mode. Early feedback from beta testers has been positive, with most reporting faster task completion.

---

## Related skills

- `article-writing` — long-form draft in a supplied voice
- `content-research-writer` — research + outline + section feedback
- `brand-voice` — profile-driven voice matching
- `docs-writer` — technical documentation standards

## Credit

**ASI** — https://github.com/plurigrid/asi
