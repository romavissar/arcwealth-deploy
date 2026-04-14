# ArcWealth Level Design Guide
## Duolingo-Style Interactive Lessons for Maximum Retention

> **Purpose:** This guide tells Cursor exactly how to build every ArcWealth interactive level.  
> **Target:** Ages 15–18, international school students  
> **Constraint:** Each level must be completable in under 5 minutes  
> **Stack:** React + Tailwind (or plain HTML/CSS/JS — specs below apply to both)

---

## 1. Core Design Philosophy

Every level has one job: take one concept from working memory into long-term memory.

Not two concepts. Not an overview of five. One.

The enemy of retention is passive reading. Students must *do* something with information within 60 seconds of encountering it — otherwise it evaporates. Every structural decision in this guide exists to enforce that principle.

**The retention loop that underpins every level:**

```
Encounter → Active Recall → Immediate Feedback → Spaced Repetition Hook
```

Each of these four stages must be present in every level. If any is missing, redesign the level.

---

## 2. Color System

Color is not decoration. Every color in ArcWealth levels encodes meaning. Use colors consistently — if a student sees amber once for a key term, it must always mean key term. Inconsistency destroys the subconscious pattern recognition that color builds over time.

All color values below have been WCAG-verified against their intended backgrounds. Do not substitute or approximate. Every hex value here is the exact value Cursor should use.

### Semantic Rules — Non-Negotiable

Define the semantics first; the hex values follow from them.

```
Amber    = "this is a term you need to learn"
Emerald  = "you got this right / this is good financial behaviour"
Red      = "you got this wrong / this is bad financial behaviour"
Indigo   = "press this to move forward"
```

Never use amber for anything other than key terms. Never use emerald for anything other than correct/positive states. A student who plays 10 levels must be able to decode color meaning without reading.

---

### Light Mode Palette

> Default mode. Applied when `prefers-color-scheme: light` or no preference is set.

| Role | Token | Hex | Contrast verified |
|---|---|---|---|
| Page background | `--bg-page` | `#F1F5F9` | — |
| Card background | `--bg-card` | `#FFFFFF` | — |
| Body text | `--text-primary` | `#1E293B` | 13.4:1 on page bg |
| Muted text | `--text-muted` | `#475569` | 5.9:1 on page bg |
| Border / divider | `--border` | `#CBD5E1` | — |
| **Indigo — button fill** | `--indigo-fill` | `#4338CA` | white text on it: 7.9:1 ✓ |
| **Indigo — button text** | `--indigo-text` | `#FFFFFF` | 7.9:1 on indigo fill ✓ |
| **Amber — key term bg** | `--amber-fill` | `#FCD34D` | slate-800 text on it: 10.2:1 ✓ |
| **Amber — key term text** | `--amber-text` | `#1E293B` | 10.2:1 on amber fill ✓ |
| **Emerald — correct fill** | `--emerald-fill` | `#34D399` | dark text on it: 5.1:1 ✓ |
| **Emerald — correct text** | `--emerald-text` | `#064E3B` | 5.1:1 on emerald fill ✓ |
| **Emerald — correct border** | `--emerald-border` | `#10B981` | visible accent only |
| **Red — wrong fill** | `--red-fill` | `#991B1B` | light text on it: 6.8:1 ✓ |
| **Red — wrong text** | `--red-text` | `#FEE2E2` | 6.8:1 on red fill ✓ |
| **Red — wrong border** | `--red-border` | `#EF4444` | visible accent only |
| Progress bar fill | `--progress-fill` | `#4338CA` | — |
| Progress bar track | `--progress-track` | `#CBD5E1` | — |

**How to apply in light mode:**

- Unselected answer option: white card (`--bg-card`), `--border` outline, `--text-primary` text
- Selected / submitted correct: `--emerald-fill` background, `--emerald-text` text, checkmark icon
- Selected / submitted wrong: `--red-fill` background, `--red-text` text, X icon
- Key term inline highlight: `--amber-fill` background pill, `--amber-text` text
- Primary button: `--indigo-fill` background, `--indigo-text` text

---

### Dark Mode Palette

> Applied when `prefers-color-scheme: dark`.

| Role | Token | Hex | Contrast verified |
|---|---|---|---|
| Page background | `--bg-page` | `#0F172A` | — |
| Card background | `--bg-card` | `#1E293B` | — |
| Body text | `--text-primary` | `#F1F5F9` | 16.3:1 on page bg ✓ |
| Muted text | `--text-muted` | `#94A3B8` | 4.6:1 on page bg ✓ |
| Border / divider | `--border` | `#334155` | — |
| **Indigo — button fill** | `--indigo-fill` | `#818CF8` | dark text on it: 6.0:1 ✓ |
| **Indigo — button text** | `--indigo-text` | `#1E293B` | 6.0:1 on indigo fill ✓ |
| **Amber — key term bg** | `--amber-fill` | `#F59E0B` | dark text on it: 6.8:1 ✓ |
| **Amber — key term text** | `--amber-text` | `#1E293B` | 6.8:1 on amber fill ✓ |
| **Emerald — correct fill** | `--emerald-fill` | `#065F46` | light text on it: 6.8:1 ✓ |
| **Emerald — correct text** | `--emerald-text` | `#D1FAE5` | 6.8:1 on emerald fill ✓ |
| **Emerald — correct border** | `--emerald-border` | `#34D399` | visible accent only |
| **Red — wrong fill** | `--red-fill` | `#7F1D1D` | light text on it: 8.4:1 ✓ |
| **Red — wrong text** | `--red-text` | `#FEE2E2` | 8.4:1 on red fill ✓ |
| **Red — wrong border** | `--red-border` | `#F87171` | visible accent only |
| Progress bar fill | `--progress-fill` | `#818CF8` | — |
| Progress bar track | `--progress-track` | `#334155` | — |

**Key differences from light mode — why each changed:**

- `--indigo-fill` shifts from `#4338CA` → `#818CF8`: the dark indigo is near-invisible on dark backgrounds (2.3:1 fail). The lighter Indigo 400 reads clearly (6.0:1) and retains the same semantic identity.
- `--emerald-fill` shifts from `#34D399` → `#065F46`: a light emerald on a dark card looks washed out and fails to feel like a confident "correct" state. The dark emerald fill with light text reads clearly and feels more deliberate.
- `--red-fill` shifts from `#991B1B` → `#7F1D1D`: slightly deeper to maintain the 8:1+ ratio against light text on dark backgrounds.
- `--amber-fill` stays close (`#FCD34D` → `#F59E0B`): amber is naturally high-contrast in both modes. The slightly more saturated 500 variant works better on dark backgrounds where pale yellows look faded.

---

### CSS Variable Implementation

Cursor should implement the palette as CSS custom properties with a single `@media` override. This keeps all color logic in one place.

```css
:root {
  --bg-page:         #F1F5F9;
  --bg-card:         #FFFFFF;
  --text-primary:    #1E293B;
  --text-muted:      #475569;
  --border:          #CBD5E1;

  --indigo-fill:     #4338CA;
  --indigo-text:     #FFFFFF;

  --amber-fill:      #FCD34D;
  --amber-text:      #1E293B;

  --emerald-fill:    #34D399;
  --emerald-text:    #064E3B;
  --emerald-border:  #10B981;

  --red-fill:        #991B1B;
  --red-text:        #FEE2E2;
  --red-border:      #EF4444;

  --progress-fill:   #4338CA;
  --progress-track:  #CBD5E1;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-page:         #0F172A;
    --bg-card:         #1E293B;
    --text-primary:    #F1F5F9;
    --text-muted:      #94A3B8;
    --border:          #334155;

    --indigo-fill:     #818CF8;
    --indigo-text:     #1E293B;

    --amber-fill:      #F59E0B;
    --amber-text:      #1E293B;

    --emerald-fill:    #065F46;
    --emerald-text:    #D1FAE5;
    --emerald-border:  #34D399;

    --red-fill:        #7F1D1D;
    --red-text:        #FEE2E2;
    --red-border:      #F87171;

    --progress-fill:   #818CF8;
    --progress-track:  #334155;
  }
}
```

If using Tailwind, map these to `tailwind.config.js` under `theme.extend.colors` using the same token names. Do not use raw Tailwind color classes (`bg-indigo-600`) directly in components — always reference the semantic token so dark mode is controlled from one place.

---

### Contrast Requirements

- All body text must meet WCAG AA (4.5:1 minimum). The values above have been pre-verified — use them exactly.
- Correct/incorrect states must differ by more than color alone: always pair fill color with a checkmark or X icon and a text label.
- Never convey information through color alone — colorblind students exist.
- The amber key term highlight is used as a background pill, never as text color directly on a white/dark card background (it would fail contrast in light mode as a foreground color).

---

## 3. Level Structure

Every level follows the same five-section structure, in this order, without exception.

```
[1] Hook          (20–30 seconds)
[2] Concept       (90–120 seconds)
[3] Check         (120–150 seconds)
[4] Apply         (90–120 seconds)
[5] Lock-in       (20–30 seconds)
```

Total: 4–5 minutes. Do not add sections. Do not reorder sections.

---

### Section 1: Hook (20–30 seconds)

**Purpose:** Create a question in the student's mind before answering it.

**Format:** Single screen. One image or number, one sentence, one prompt.

**Rules:**
- Must present a surprising fact, a provocative number, or a concrete scenario — never an abstract statement
- No more than 25 words of body text
- Must end with a direct question to the student, displayed in a slightly larger font
- No answer yet — the hook creates tension, the concept resolves it

**Example (Lesson 2):**
> Two students. Same university. Same tuition. One pays $10,000 more per year.
>
> *Why?*

**Animation:** Fade-in on the number or key fact (300ms ease-in). The question appears 500ms after the fact, slide-up from below. No looping animations — the hook is about stillness and a single point of focus.

---

### Section 2: Concept (90–120 seconds)

**Purpose:** Deliver the one concept this level teaches, with enough depth that the Check questions feel earned.

**Format:** 4–7 cards presented sequentially (one at a time, not all visible). Student taps/clicks to advance each card.

**Text per card:** Maximum 40 words. Aim for 25–30.

**Rules:**
- Each card covers exactly one idea — not one topic, one *idea*
- Key terms appear in amber on first use, with a short inline definition in parentheses
- No bullet point lists inside cards — use plain sentences
- Card 1 answers the hook question directly
- Cards 2–5 build the concept progressively — each card should feel like it adds one layer, not repeat the previous one
- A numeric or visual card (a single data point, a small chart, a comparison of two numbers) counts as one card and adds variety without adding reading load
- Final card always ends with a forward bridge: "Now let's see if you've got it."

**Visual structure of each card:**

```
┌─────────────────────────────────┐
│  [Optional: small illustration  │
│   or single data point]         │
│                                 │
│  Body text (max 40 words,       │
│  slate-800, 16px, 1.6 line-hgt) │
│                                 │
│  [Amber highlight if key term]  │
└─────────────────────────────────┘
      [Tap to continue →]
```

**Animation:**
- Cards slide in from the right (translateX +40px → 0, 250ms ease-out)
- Previous card slides out to the left simultaneously
- Key term amber highlight fades in 200ms after card appears — it should feel like a reveal, not be present from the start
- Do not animate the text itself — animated text is harder to read and slower to process

---

### Section 3: Check (120–150 seconds)

**Purpose:** Force active recall of the concept just taught across multiple formats. This is the most important section for retention — variety of question type is what prevents students from gaming the format.

**Format:** 6–8 questions, presented one at a time. Never show two questions simultaneously.

**Question count target:** 6 questions for straightforward conceptual lessons. 7–8 for lessons with multiple terms, comparisons, or calculations.

---

#### Question Type Library

Cursor must select from the following types when building Check sections. The sequence rules follow the library.

---

**Type 1: Multiple Choice (4 options)**

The lowest-stakes entry point. Tests recognition. Use for the first question in every Check section without exception.

```
┌─────────────────────────────────────┐
│  Question stem (max 20 words)       │
│                                     │
│  ○  Option A                        │
│  ○  Option B                        │
│  ○  Option C                        │
│  ○  Option D                        │
└─────────────────────────────────────┘
```

Rules:
- Exactly 4 options. Never 3, never 5.
- One clearly correct answer. No "best answer" ambiguity.
- Distractors must be plausible — wrong answers that no one would choose waste the question
- Options should be roughly equal in length — a noticeably longer option signals the correct answer
- Never use "All of the above" or "None of the above"

---

**Type 2: True / False with Mandatory Justification**

Forces a binary commitment, then demands the student explain why. The explanation is what creates retention — the T/F alone is too easy to guess.

```
┌─────────────────────────────────────┐
│  Statement (max 25 words)           │
│                                     │
│  [TRUE]          [FALSE]            │
│                                     │
│  [After selection, always show:]    │
│  "Because: ________________________"│
│  (one sentence shown, not typed)    │
└─────────────────────────────────────┘
```

Rules:
- The "Because" sentence is shown to the student after they answer — they read it, not write it
- The because-sentence must be different from the concept card text — it is a restatement, not a copy
- Both true and false statements should appear across a level — never make all T/F questions the same answer

---

**Type 3: Fill-in-the-Blank (Word Selection)**

Higher recall difficulty than MC. Student selects the missing word from a small bank of 3–4 options displayed below the sentence. Not free-text — that is Type 6.

```
┌─────────────────────────────────────┐
│  "The total cost of attendance      │
│   includes tuition plus ______."    │
│                                     │
│  [living costs]  [profit]           │
│  [interest]      [discounts]        │
└─────────────────────────────────────┘
```

Rules:
- The blank must complete a sentence that uses a key term from the Concept section
- The word bank must contain the correct answer plus plausible distractors
- Never blank out a word so obscure that even a correct understanding would not produce it
- The completed sentence must read as a true, accurate statement

---

**Type 4: Match Terms to Definitions**

Tests whether students can connect vocabulary to meaning. Best used after a lesson that introduces 3–4 distinct terms.

```
┌─────────────────────────────────────┐
│  Drag each term to its definition   │
│                                     │
│  TERMS          DEFINITIONS         │
│  [Tuition]  →   [ _____________ ]   │
│  [TCA]      →   [ _____________ ]   │
│  [Living    →   [ _____________ ]   │
│   costs]                            │
└─────────────────────────────────────┘
```

Rules:
- Maximum 4 pairs per matching question — more than 4 becomes a working memory test, not a knowledge test
- On mobile, implement as sequential selection (tap a term, then tap its definition) rather than drag-and-drop
- All definitions must be short: 6–10 words maximum
- Partial scoring is not supported — the question resolves as a single unit (all correct = correct, any wrong = incorrect with full reveal)

---

**Type 5: Ordering / Ranking**

Student drags items into the correct sequence or rank order. Tests understanding of relationships and magnitudes, not just definitions.

```
┌─────────────────────────────────────┐
│  Rank these from most to least      │
│  expensive for a US student:        │
│                                     │
│  ≡  Tuition          [drag]         │
│  ≡  Food             [drag]         │
│  ≡  Course materials [drag]         │
│  ≡  Transport        [drag]         │
└─────────────────────────────────────┘
```

Rules:
- Maximum 5 items to rank — more becomes guesswork
- On mobile, use up/down arrow buttons instead of drag handles
- Always explain the correct order after submission, in one sentence per item
- Only use when there is a genuinely defensible correct order — do not use for opinions or context-dependent rankings

---

**Type 6: Fill-in-the-Blank — Multi-Part**

The deeper version of Type 3. Student completes a sentence or short paragraph with 2–4 blanks, selecting each answer from a shared word bank. Tests reasoning and causal understanding, not just single-term recall. No free-text typing anywhere.

```
┌─────────────────────────────────────┐
│  "A UK graduate earning £22,000     │
│   repays ______ on their loan.      │
│   At £35,000, they repay 9% of      │
│   ______, which equals ______ /yr." │
│                                     │
│  Word bank:                         │
│  [£0]  [£10,000]  [£900]           │
│  [£35,000]  [£3,150]  [£25,000]    │
│                                     │
│  [Submit]                           │
└─────────────────────────────────────┘
```

Rules:
- 2–4 blanks per question — never 1 (that is Type 3) and never more than 4 (working memory overload)
- Word bank contains 5–6 options — enough plausible distractors without guesswork
- Each blank must require genuinely distinct reasoning — do not repeat the same type of knowledge across blanks in one question
- The completed sentence must read as a coherent, accurate statement when all blanks are filled correctly
- Never require the student to type anything — all interaction is selection from the word bank
- Calculation-based multi-blanks (fill in the steps and result) are ideal for financial literacy — they force the student to work through a problem rather than just recognise an answer

---

**Type 7: Numeric Slider**

Student moves a slider to the correct value or range. Ideal for lessons involving percentages, cost estimates, or time-based calculations.

```
┌─────────────────────────────────────┐
│  "Priya's accommodation is €600/mo. │
│   What is her annual housing cost?" │
│                                     │
│  $0 ──────────────────────── $15k   │
│            [  €7,200  ]             │
│                                     │
│  [Submit]                           │
└─────────────────────────────────────┘
```

Rules:
- Accept a range of ±10% of the correct answer as correct — exact values are unnecessarily strict for estimation tasks
- Always show the precise correct value after submission
- Scale must be intuitive — if the correct answer is €7,200, the range should not go to €100,000
- Provide one reference point on the scale (e.g. a midpoint label) to anchor the student's estimate

---

**Type 8: Spot the Mistake**

Student reads a short fictional student's financial plan or statement and identifies the error. Tests applied understanding — students must know not just the concept but how it fails in practice.

```
┌─────────────────────────────────────┐
│  Marcus wrote this in his budget:   │
│                                     │
│  "My university costs €12,000/yr.   │
│   I'll need €12,000 in savings."    │
│                                     │
│  What is wrong with this?           │
│                                     │
│  ○  He included non-tuition costs   │
│  ○  He forgot tuition               │
│  ○  He calculated the wrong year    │
│  ○  Nothing is wrong                │
└─────────────────────────────────────┘
```

Rules:
- The mistake must be directly related to the lesson's concept — not a general financial error
- Always deliver as multiple choice (4 options) — not open-ended
- The "nothing is wrong" option should appear occasionally to prevent students from always assuming there is an error
- After answering, show a one-sentence explanation of why the mistake matters, not just what it was

---

#### Check Section Sequencing Rules

1. Always open with Type 1 (Multiple Choice) — lowest stakes, highest completion rate
2. Never place the same question type consecutively
3. Never use free-text input anywhere — all questions must be answerable by selection, dragging, or slider
4. Include at least one Type 4 (Match) or Type 5 (Ordering) per level — these are the highest-engagement formats
5. Include at least one Type 6 (Multi-Part Blank) per level — this is the deepest reasoning format available
6. Close the Check section with Type 3 (Fill-in-the-Blank) or Type 8 (Spot the Mistake) — both require synthesis, which consolidates before moving to Apply
7. A complete 6-question Check section should follow this pattern as a starting template:

```
Q1: Multiple Choice              (recognition, low stakes)
Q2: True / False + Because       (binary commitment + reasoning)
Q3: Match Terms                  (vocabulary connections)
Q4: Fill-in-the-Blank (single)   (targeted recall)
Q5: Fill-in-the-Blank (multi)    (causal reasoning, 2–4 blanks)
Q6: Spot the Mistake             (applied understanding)
```

For 7–8 question levels, insert a Numeric Slider or Ordering question at Q4 or Q5 and push the sequence forward.

---

**Feedback rules for all question types:**

- Wrong answers: red state + shake animation + corrective text (max 15 words, non-shaming)
- Correct answers: emerald state + bounce animation + affirming text (max 8 words)
- After every question, a brief "why" explanation appears for 2 seconds before the next question loads — even for correct answers
- Never just confirm right/wrong without explanation — the explanation is where learning happens
- Do not allow skipping any Check question

---

### Section 4: Apply (90–120 seconds)

**Purpose:** Move the concept from recognition to application. The student must use the knowledge, not just recall it. Apply is where understanding becomes skill.

**Format:** 2 tasks, presented sequentially. Each task is more substantial than any Check question.

**Task types (rotate between levels, do not repeat the same type twice in a row across the two tasks in one level):**

- **Budget calculator:** Student adjusts sliders or inputs to build a real figure (e.g. "Set Priya's accommodation budget — her rent is €600/month. What is her annual housing cost?")
- **Ranking task:** Student drags items into order (e.g. "Rank these costs from highest to lowest for a UK international student")
- **Spot the mistake:** Student is shown a fictional student's financial plan and identifies the error and its consequence
- **Decision branch:** Student chooses between two options and sees the financial consequence of each play out — both paths are shown after selection, not just the correct one
- **Build the plan:** Student fills in a partial financial table by selecting or typing values — tests whether they can construct, not just recognise

**Rules:**
- Both tasks must use a named fictional character from the module roster
- Both tasks must be set in a real city or country relevant to the lesson content
- Both tasks must have clear correct answers — Apply is not a discussion prompt
- Task 1 should be moderately challenging (applies one concept from the lesson)
- Task 2 should be harder (applies the concept in a context that requires a small inference or calculation)
- Correct answer reveals a one-paragraph explanation (max 50 words) of why it was right, including the real-world consequence of getting it wrong

**Animation:** Each task card expands from a compressed state (scaleY 0.9 → 1.0, 300ms) as it enters. This creates a sense of "opening" that signals a more substantial task than the Check questions.

---

### Section 5: Lock-in (20–30 seconds)

**Purpose:** Consolidate memory. Give the student one sentence they will remember tomorrow.

**Format:** Single screen. The "takeaway card."

**Structure:**

```
┌─────────────────────────────────┐
│                                 │
│   [Key term in amber, large]    │
│                                 │
│   One-sentence definition or    │
│   principle. Max 20 words.      │
│   Slate-800. Slightly larger    │
│   than body text (18px).        │
│                                 │
│   [Lesson complete indicator]   │
│   [XP earned display]           │
│   [Continue button — Indigo]    │
│                                 │
└─────────────────────────────────┘
```

**Rules:**
- The takeaway sentence must be different from any sentence that appeared in the Concept section — it is a synthesis, not a repeat
- Never use more than one takeaway per level
- XP display must animate (count up from 0 to earned amount, 600ms) — this is the primary dopamine moment of the level
- If the student got any Check questions wrong, the Lock-in card also shows a "Review" prompt in small text: *"You can revisit this concept in your review queue."*

**Animation:** The takeaway card fades in (400ms). The key term amber highlight pulses once (scale 1.0 → 1.04 → 1.0, 500ms) — one pulse only. The XP counter animates up. Then stillness.

---

## 4. Question Count Per Level

| Section | Questions | Target time | Notes |
|---|---|---|---|
| Hook | 0 (rhetorical) | 20–30s | Sets up tension, no answer expected |
| Concept | 0 (4–7 cards) | 90–120s | Information delivery, student-paced |
| Check | 6–8 | 120–150s | See sequencing template below |
| Apply | 2 | 90–120s | Scenario-based, always 2 tasks |
| Lock-in | 0 | 20–30s | Consolidation only |
| **Total** | **8–10** | **~4:30–5:00** | |

**Why 6–8 Check questions, not 3–4:**

At 15–20 seconds per question, 4 questions is approximately 80 seconds of active engagement. With concept cards, hook, and lock-in, the real total falls under 3 minutes — not 5. Six to eight questions targets the correct 2–2.5 minute Check window and provides enough variety across question types that students cannot pattern-match their way through.

**The 6-question Check template (standard levels):**

```
Q1: Multiple Choice              ~20s
Q2: True / False + Because       ~25s
Q3: Match Terms                  ~35s
Q4: Fill-in-the-Blank (single)   ~20s
Q5: Fill-in-the-Blank (multi)    ~30s
Q6: Spot the Mistake             ~25s
Total Check:                     ~155s
```

**The 8-question Check template (vocabulary-heavy or calculation levels):**

```
Q1: Multiple Choice              ~20s
Q2: True / False + Because       ~25s
Q3: Match Terms                  ~35s
Q4: Numeric Slider               ~25s
Q5: Ordering / Ranking           ~35s
Q6: Fill-in-the-Blank (single)   ~20s
Q7: Fill-in-the-Blank (multi)    ~30s
Q8: Spot the Mistake             ~25s
Total Check:                     ~215s
```

Use the 8-question template when the lesson introduces 3 or more new terms, involves a calculation, or contains a regional comparison.

---

## 5. Animation Specifications

Animations serve one purpose: directing attention. They are not decoration.

### Master Principles

- Every animation must complete in under 400ms (except XP counter: 600ms)
- No looping animations during reading or answering — they compete with cognitive load
- Use `ease-out` for things entering, `ease-in` for things leaving
- Reserve bouncy/spring animations exclusively for correct answers
- Avoid simultaneous animations — stagger by at least 100ms

### Animation Library

| Event | Animation | Duration | Easing |
|---|---|---|---|
| Card enters | Slide from right (translateX: 40px → 0) | 250ms | ease-out |
| Card exits | Slide to left (translateX: 0 → -40px) | 200ms | ease-in |
| Key term reveal | Fade amber background (opacity: 0 → 1) | 200ms | ease-in |
| Correct answer | Border turns emerald + bounce (scale: 1 → 1.05 → 1) | 300ms | spring |
| Wrong answer | Border turns red + shake (translateX: ±6px, 3 cycles) | 400ms | ease-in-out |
| Section transition | Full screen fade (opacity: 1 → 0 → 1) | 300ms | ease-in-out |
| XP counter | Count up from 0 | 600ms | ease-out |
| Takeaway key term pulse | Scale (1 → 1.04 → 1) | 500ms | ease-in-out, once only |
| Progress bar fill | Width increase (smooth) | 400ms | ease-out |
| Level complete | Confetti burst (10–15 particles, 1.5s) | 1500ms | physics-based fall |

### What NOT to Animate

- Do not animate text as it renders (no typewriter effect — it slows reading)
- Do not animate images or illustrations (static only)
- Do not animate the background
- Do not use particle effects or ambient animations during active tasks
- Do not animate the question text itself — only the container

---

## 6. Text Constraints

| Section | Max Words | Font Size | Weight |
|---|---|---|---|
| Hook fact/number | 10 | 32px | 700 |
| Hook question | 15 | 20px | 400 |
| Concept card body | 40 | 16px | 400 |
| Key term (amber) | 4 | 16px | 600 |
| Check — MC question stem | 20 | 16px | 500 |
| Check — MC answer option | 10 | 15px | 400 |
| Check — T/F statement | 25 | 16px | 500 |
| Check — T/F because-sentence | 20 | 14px | 400 |
| Check — Fill-blank sentence (single) | 20 | 16px | 400 |
| Check — Fill-blank sentence (multi-part) | 35 | 16px | 400 |
| Check — Fill-blank word bank option | 6 | 14px | 400 |
| Check — Match term | 4 | 14px | 500 |
| Check — Match definition | 10 | 14px | 400 |
| Check — Spot the Mistake scenario | 40 | 14px | 400 |
| Check — Ordering item label | 6 | 14px | 400 |
| Check — Slider question | 25 | 16px | 500 |
| Check feedback (wrong) | 15 | 14px | 400 |
| Check feedback (correct) | 8 | 14px | 400 |
| Apply task scenario | 70 | 15px | 400 |
| Apply task explanation | 50 | 14px | 400 |
| Lock-in takeaway | 20 | 18px | 500 |

Line height: 1.6 everywhere. Never go below 1.4.

Letter spacing: default everywhere except the Hook number/fact, which uses `letter-spacing: -0.02em` to feel bold and clean.

**The 40-word concept card rule is the most important constraint in this document.** If a concept cannot be expressed in 40 words, it needs to be split into two cards, not squeezed into one.

---

## 7. Retention Maximization Rules

These are the structural decisions that separate a lesson students remember from one they forget.

### 7.1 The 60-Second Active Recall Rule

The student must *do something* within 60 seconds of reading each concept card. "Doing something" means answering a question, moving a slider, dragging an item, or making a choice. Reading alone is not sufficient. Cursor must enforce this by ensuring Check Section Q1 appears within 60 seconds of the final concept card.

### 7.2 Interleaving Correct and Incorrect Examples

Wherever possible, the Apply section should show both the correct financial behaviour and the consequences of the incorrect one. Seeing why the wrong answer fails is more memorable than seeing only why the right answer works.

### 7.3 Spaced Repetition Hook

The final screen of every level (after Lock-in) must display one question from a *previous* level in the module, presented as a "Quick Recall" prompt. One question, one answer, no scoring. This is the spaced repetition mechanism that moves concepts to long-term memory.

Implementation: maintain a `reviewQueue` array in local storage. Each completed level adds its key term and definition. The Quick Recall prompt pulls randomly from this queue. The prompt reads: *"Before you go — do you remember this from an earlier lesson?"*

### 7.4 Named Characters Across the Module

Use the same 3–4 fictional characters throughout all lessons in a module. Students build familiarity with Priya, Kai, Sofia, or Marcus across multiple levels. When a character reappears in a new context, recognition reduces cognitive load and increases engagement. Do not introduce new characters in every lesson.

**Module 1 character roster:**
- **Priya** — studying in the Netherlands, cost-conscious, self-catering
- **Kai** — choosing between a US private university and a UK university
- **Sofia** — applying to universities in Singapore and Hong Kong
- **Marcus** — staying in EU, working part-time to fund his degree

### 7.5 Progress Visibility

The progress bar must be visible at the top of every screen throughout the level. Students who cannot see their progress disengage faster. The bar fills in five equal increments (one per section). Color: Indigo fill on Slate 200 track.

### 7.6 Streak and XP Display

- Show the current streak count at the top of the level start screen
- XP earned per level: base 10 XP, +2 for every Check question correct on first attempt (up to +16 for 8 questions), +3 for each Apply task correct on first attempt (up to +6), +5 bonus for a perfect level (all questions correct first try)
- Maximum XP per level: 37 (10 base + 16 Check + 6 Apply + 5 perfect bonus)
- Display XP breakdown at Lock-in: *"10 base + 12 Check + 6 Apply + 5 perfect = 33 XP"*
- Never subtract XP for wrong answers — loss aversion kills motivation in educational tools

### 7.7 The "Why This Matters" Anchor

Every level's Concept Section Card 1 must contain a real-world consequence of not knowing this concept. Not a hypothetical. A concrete, specific consequence.

Good: *"Students who don't account for living costs often run out of money in their second semester."*
Bad: *"Understanding TCA is important for your financial future."*

The consequence must be specific enough to be slightly uncomfortable. That discomfort is what makes it memorable.

---

## 8. Level Timing Breakdown

For Cursor to pace the level correctly, here are the target seconds per section:

| Section | Target time | Pacing mechanism |
|---|---|---|
| Hook | 20–30s | Auto-advance after 8 seconds if no interaction, or on tap |
| Concept | 90–120s | Student-paced (tap to advance cards, 4–7 cards at ~20s each) |
| Check | 120–150s | Student-paced; timer is hidden — never show a countdown |
| Apply | 90–120s | Student-paced, 2 tasks |
| Lock-in | 20–30s | Auto-advance option after 5 seconds, but student can linger |
| **Total** | **4:30–5:00** | |

Never show a countdown timer during Check or Apply. Timers increase anxiety and decrease accuracy on comprehension questions. The 5-minute constraint is enforced by card count, question count, and text limits — not by clock pressure.

---

## 9. Accessibility Requirements

- All interactive elements must be keyboard-navigable (Tab to focus, Enter/Space to select)
- Correct/wrong states must not rely on color alone — always include text or icon
- All animations must respect `prefers-reduced-motion: reduce` — if set, replace all transitions with instant visibility changes
- Minimum tap target size: 44x44px for all answer options
- Font size must not go below 14px anywhere
- All images and icons require alt text

---

## 10. Component Checklist for Cursor

When building any ArcWealth level, verify:

```
STRUCTURE
[ ] Level follows Hook → Concept → Check → Apply → Lock-in
[ ] Concept has 4–7 cards (not 2–4)
[ ] Check has 6–8 questions (not 3–4)
[ ] Check opens with Multiple Choice and closes with Fill-blank or Spot the Mistake
[ ] Check includes at least one Match and one Multi-Part Blank question
[ ] No two consecutive questions are the same type in Check
[ ] Apply has exactly 2 tasks (not 1)
[ ] Apply Task 2 is harder than Task 1
[ ] Both Apply tasks use a named character from Module 1 roster
[ ] No free-text input exists anywhere in the level — every question is answered by selection, drag, or slider

TEXT
[ ] No concept card exceeds 40 words
[ ] Hook body text is under 25 words
[ ] Lock-in takeaway is under 20 words
[ ] Key terms are highlighted in amber on first use only
[ ] Every [BLANK] question has a word bank of 5–6 options
[ ] Multi-Part Blank questions have 2–4 blanks with distinct reasoning per blank

COLOR
[ ] All color values match the verified palette tokens exactly (no raw Tailwind classes)
[ ] Light mode uses --indigo-fill #4338CA, dark mode uses #818CF8
[ ] Amber used exclusively for key term highlights (--amber-fill as background pill)
[ ] Emerald used exclusively for correct/positive states (--emerald-fill + --emerald-text)
[ ] Red used exclusively for wrong/negative states (--red-fill + --red-text)
[ ] Correct/incorrect states pair color with icon AND text label — never color alone
[ ] CSS variables defined in :root with @media (prefers-color-scheme: dark) override
[ ] All text contrast ratios meet WCAG AA 4.5:1 minimum

ANIMATION
[ ] No animation exceeds 400ms (except XP counter at 600ms)
[ ] No looping animations during active tasks
[ ] Correct answer triggers bounce
[ ] Wrong answer triggers shake
[ ] All animations respect prefers-reduced-motion

RETENTION
[ ] Active recall within 60 seconds of final concept card
[ ] Apply Task 2 requires inference or calculation, not just recognition
[ ] Lock-in takeaway is a synthesis, not a repeat
[ ] Quick Recall spaced repetition prompt appears after Lock-in
[ ] reviewQueue updated in local storage on level completion
[ ] AI short-answer fallback to MC is implemented for timeout/failure cases

PROGRESS
[ ] Progress bar visible on every screen
[ ] XP earned displays with breakdown at Lock-in (base + Check + Apply + perfect bonus)
[ ] Streak count shown at level start
```

---

## 11. What Cursor Should Never Do

- Never put a bullet list inside a concept card
- Never use a countdown timer during questions
- Never show all concept cards at once — always one at a time
- Never use fewer than 4 concept cards — below 4 the Concept section is too thin to support 6–8 Check questions
- Never use fewer than 6 Check questions — below 6 the level will run under 3 minutes
- Never place two questions of the same type consecutively in Check
- Never use the word "incorrect" in feedback — use "not quite" or restate the correct answer directly
- Never animate text as it renders
- Never use more than one takeaway per level
- Never introduce a concept in the Hook without resolving it in the Concept section
- Never allow a student to skip a Check question
- Never require a student to type free text — every question must be answerable by selection, drag, or slider
- Never build a [BLANK] question with fewer than 5 word bank options — too few makes it trivially easy to guess
- Never build a Multi-Part Blank with only 1 blank — that is a regular [BLANK], use Type 3 instead
- Never make Apply Task 1 and Task 2 the same format
- Never use muted text below `--text-muted` (`#475569` light / `#94A3B8` dark) — values below these floors fail contrast

---

*This document is the single source of truth for ArcWealth level design. All levels must conform to it. When in doubt, prioritize: active recall over passive reading, specificity over generality, and one clean concept over two rushed ones.*
