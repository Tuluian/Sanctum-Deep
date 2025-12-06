# Tutorial Narrative: First Contact

## Status: Reference Document

> **Note**: This is a narrative reference document containing all dialogue and Warden voice lines for the tutorial system. The implementation story is **Story 7.8: Tutorial Narrative Implementation** (`docs/stories/7.8-tutorial-narrative-implementation.md`).
>
> **Dev agents**: Copy dialogue from this document verbatim. Do not paraphrase or modify the writer's text.

---

## Story

**As a** new player entering the Sanctum for the first time,
**I want** an immersive tutorial that introduces mechanics through story,
**so that** I learn how to play while becoming invested in the world.

---

## Narrative Context: The Warden's Greeting

> *"Every champion is greeted by the Warden. The greeting is always different. The Warden has been doing this for 347 years. They've learned to read people."*

### Design Philosophy

The tutorial should:
- Teach mechanics through Warden dialogue
- Establish the Warden as a character, not a tutorial bot
- Set the tone (dark but not hopeless)
- Make the player feel special—but also mortal
- Connect tutorial elements to the narrative

---

## Tutorial Structure

### Phase 0: The Entrance

**Before any gameplay:**

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                     SANCTUM RUINS                            ║
║                                                              ║
║               [Dark doorway image/animation]                 ║
║                                                              ║
║  "There is a place where the desperate go.                   ║
║   Where the lost seek answers.                               ║
║   Where the dead walk and the living forget.                 ║
║                                                              ║
║   The Sanctum has been here longer than memory.              ║
║   It will be here after everything ends.                     ║
║                                                              ║
║   You are here now.                                          ║
║                                                              ║
║   Why?"                                                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**[Class selection follows, each with their "why"]**

---

### Phase 1: Meeting the Warden

**After selecting a class, the Warden speaks:**

> *[A figure emerges from the shadows. They are translucent, tired, ancient—but their eyes are kind.]*
>
> "Ah. Another one."
>
> *[They look you over.]*
>
> "A [CLASS], this time. It's been... [TIME] since the last [CLASS] entered. They didn't make it. But perhaps you will."
>
> "I am the Warden. I have held this place for 347 years. Before me, there were others. After me..."
>
> *[They smile sadly.]*
>
> "...there will be you. Or there will be nothing."

**Class-Specific Greetings:**

#### Cleric
> "A person of faith. Good. You'll need faith here. But let me warn you—the gods don't hear you in the Sanctum. Whatever you pray to... you'll have to become your own answer."

#### Knight
> "Order of the Sealed Gate. I recognize the armor. Your people guard the entrance. They've been sending champions for generations."
>
> *[Pause]*
>
> "Ask yourself: why do they need to keep sending them?"

#### Diabolist
> "Mmm. The smell of brimstone. You've made bargains, haven't you? Well, the Sanctum makes bargains too. Fair warning: our contracts are worse than your demon's."

#### Oathsworn
> "The Order of the Burning Truth. You've come to destroy this place, haven't you?"
>
> *[Laughs softly]*
>
> "Every Oathsworn says that. None have succeeded. Perhaps you'll understand why. Eventually."

#### Fey-Touched
> *[The Warden flinches]*
>
> "Oberon's mark. You're... being watched. By something older than me."
>
> "Tell your patron I said hello. And tell him: the Sanctum remembers what the fey forgot."

---

### Phase 2: Understanding Cards

**The Warden gestures. Cards appear in your hand.**

> "You fight with cards. This will seem strange. Let me explain."
>
> "The Sanctum doesn't allow steel or spells—not directly. Everything here is filtered through... potential. What you COULD do, given form."
>
> *[Points to a card]*
>
> "That card is a Strike. It represents your ability to hurt. When you play it, you hurt."

**Tutorial prompt appears:**
```
╔══════════════════════════════════════════════════════════════╗
║  PLAYING CARDS                                               ║
║                                                              ║
║  Click a card to select it.                                  ║
║  Click an enemy to target it.                                ║
║                                                              ║
║  [PLAY: Strike - Deal 6 damage]                              ║
╚══════════════════════════════════════════════════════════════╝
```

**After playing the card:**

> "Good. The card is gone now—used. But cards return. Every turn, you shuffle your possibilities. Draw new options."
>
> "In the real Sanctum, your deck grows. You find new cards. New potential. The question isn't what cards you have."
>
> "The question is: what cards will you become?"

---

### Phase 3: Understanding Resolve/Energy

**The Warden points to your resolve counter.**

> "Resolve. [Or Energy for Knight, etc.]. This is your limit—how much potential you can manifest each turn."
>
> "Every card costs resolve. Strike costs 1. Some cards cost more. Some cost less."
>
> *[The counter refills]*
>
> "Each turn, your resolve returns. Fresh potential. But you cannot carry it over. Use it or lose it."

**Tutorial prompt:**
```
╔══════════════════════════════════════════════════════════════╗
║  RESOLVE / ENERGY                                            ║
║                                                              ║
║  You have 3 Resolve per turn.                                ║
║  Each card costs Resolve to play.                            ║
║  Unused Resolve is lost when you end your turn.              ║
║                                                              ║
║  [Current: 3/3]                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

### Phase 4: Understanding Block

**The Warden summons a training dummy.**

> "Now. Defense. In the Sanctum, you cannot simply... avoid. Everything reaches you. The only protection is Block."
>
> "Block absorbs damage. Watch."

**Tutorial shows Defend card:**

> "This is Defend. Play it. See what happens."

**After playing Defend:**

> "You have 5 Block now. When the enemy strikes, the block absorbs first. What remains hits you."
>
> *[Training dummy attacks for 3]*
>
> "You had 5 block. The attack was 3. You take no damage. But your block is now 2."
>
> "Important: Block fades at the end of YOUR turn. What you don't use, you lose."

---

### Phase 5: Understanding Enemies

**The Warden gestures toward shadows.**

> "The things you'll fight here... they were people once. Most of them. Remember that."
>
> "They cannot help what they've become. But they will kill you anyway. Pity them—but destroy them."

**A skeleton appears:**

> "Enemies show their intentions. See the symbol above? That tells you what they plan to do."
>
> *[Points to intent icon]*
>
> "This one plans to attack for 6 damage. Plan accordingly."

**Tutorial prompt:**
```
╔══════════════════════════════════════════════════════════════╗
║  ENEMY INTENTS                                               ║
║                                                              ║
║  Enemies telegraph their next action.                        ║
║                                                              ║
║  🗡️ Attack - They will deal damage                           ║
║  🛡️ Defend - They will gain block                            ║
║  ⚡ Buff - They will strengthen themselves                   ║
║  💀 Debuff - They will weaken you                            ║
║                                                              ║
║  Plan your turn based on what they're about to do!           ║
╚══════════════════════════════════════════════════════════════╝
```

---

### Phase 6: First Combat

**Full tutorial combat begins.**

> "Now. Let's see what you can do."
>
> "This is a Skeleton. Once, they were guards. Heroes. Merchants. Parents. Now they're just... echoes."
>
> "Defeat them. Don't feel guilty. They're already gone."

**Skeleton appears (20 HP for tutorial):**

**Combat dialogue from skeleton:**
> *"I had... a name... it's gone now..."*

**After victory:**

> "It's done. They're at peace now. Or as close to peace as anything gets here."
>
> *[Warden studies you]*
>
> "You fought well. But fighting well isn't enough. Many who fought well still lost."
>
> "What separates survivors from statistics is... adaptation. Growth. Learning from each encounter."

---

### Phase 7: Class Mechanic Introduction

**Based on class, the Warden explains their unique mechanic:**

#### Cleric: Devotion

> "You carry faith. Here, we call it Devotion. It builds with each holy act—and it empowers your gifts."
>
> "Some of your cards add Devotion. Others consume it. The balance is yours to manage."
>
> "But hear this: Devotion isn't worship. Your god can't hear you here. Devotion is about YOU believing—not about them answering."

#### Knight: Fortify

> "You know discipline. The Order trained you well. In the Sanctum, discipline becomes Fortify."
>
> "When you Fortify, your Block doesn't fade at turn's end. It persists. Compounds. Becomes armor that lasts."
>
> "But Fortify requires setup. Patience. The Sanctum tests patience. Many Knights rush. They die rushing."

#### Diabolist: Soul Debt

> "Your contract follows you here. The demon's mark on your soul. We call it Soul Debt."
>
> "As you fight, your debt grows. Powers become stronger—but more dangerous. Spend too much..."
>
> *[The Warden's eyes darken]*
>
> "...and the debt comes due. Here. Not after death. Here."

#### Oathsworn: Vows

> "You carry vows. Binding promises. The Order taught you that vows have power."
>
> "They're right. Vows here ARE power. Swear to attack, and your attacks strengthen. Swear to defend, and your defenses multiply."
>
> "But break a vow..."
>
> *[Pause]*
>
> "...and there are consequences. The Sanctum enforces contracts. Even the ones you make with yourself."

#### Fey-Touched: Luck and Whimsy

> "Oberon's mark gives you... unpredictability. Luck. Chaos. We call it Whimsy here."
>
> "Your cards have a chance to do more—or less—than expected. Good outcomes. Bad outcomes. The fey love gambling."
>
> "You cannot control it. But you can... lean into it. Build around it. Make chaos your strategy."
>
> "It's what the fey want. And the fey get what they want. Eventually."

---

### Phase 8: Tutorial Completion

**The Warden steps back.**

> "That's enough teaching. The rest you'll learn by doing. Or by dying."
>
> "Before you go deeper—one last truth."

**The Warden's voice becomes serious:**

> "I am dying. Not quickly—it takes centuries for a Warden to fade. But I'm fading."
>
> "Someone needs to take my place. To hold the Hollow God in check. To become what I am."
>
> "That someone... might be you."
>
> *[They look toward the darkness beyond.]*
>
> "Or it might be the thing that kills you. The Sanctum doesn't care who serves. Only that someone does."

**Final prompt:**

> "Go now. Find the Bonelord in the depths below. He was a king once. A proud king."
>
> "Now he's a warning. A reminder of what pride becomes in this place."
>
> "Remember: the enemies you fight were all people once. They all had reasons to enter. They all thought they'd succeed."
>
> *[The Warden begins to fade into the shadows.]*
>
> "Prove them wrong. Prove me wrong. Be the one who makes it."
>
> "I'll be watching. I always watch. It's the only thing I can still do."

---

## Skip Tutorial Option

For returning players:

```
╔══════════════════════════════════════════════════════════════╗
║  WARDEN'S GREETING                                           ║
║                                                              ║
║  "Ah. You've returned. The Sanctum remembers you."           ║
║                                                              ║
║  [Full Tutorial] - "Remind me how this works."               ║
║  [Skip Tutorial] - "I know what I'm doing."                  ║
║                                                              ║
║  "Either way... welcome back. I wish I could say it gets     ║
║   easier. It doesn't."                                       ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Tutorial Tooltips (In-Game)

Throughout the game, hovering over elements shows Warden-voiced tooltips:

### On Health Bar
> "Your life. Obvious, but important. When it empties, you become another echo in these halls."

### On Draw Pile
> "Your potential. Everything you could become. Shuffle well. The Sanctum cheats—so should you."

### On Discard Pile
> "Used cards return here. They're not gone—just resting. They'll come back when you need them."

### On End Turn Button
> "Ending your turn means accepting consequences. Whatever they were planning—it happens now."

### On Enemy HP
> "How much they can take before they stop. Remember—they didn't choose to be here either."

### On Relic Slot
> "Items from those who came before. Their power is yours now. Use it well."

### On Potion Slot
> "Emergency options. Single use. Save them for when everything else fails."

---

## Post-Tutorial Messages

After leaving the tutorial area, the Warden occasionally speaks:

**First Elite Encounter:**
> "This one was strong. Strong enough to survive longer than most. That's why they're called elites."
>
> "They'll test you. That's the point. If you can't beat them, you definitely can't beat what's below."

**First Boss Encounter:**
> "Here. This is where many end. The first test. The first real test."
>
> "Everything before was preparation. This is what you've been preparing for."
>
> "Don't hesitate. Don't doubt. Fight like everything depends on it."
>
> "Because it does."

**First Shrine:**
> "A shrine. Previous champions built these. Anchors of sanity in a place that erases identity."
>
> "They offer gifts. Gifts always have costs. Decide if the cost is worth it."

**First Merchant:**
> "A trader. Yes, even here. The economy of the damned is... complicated."
>
> "Buy what you need. But remember—gold you don't spend is gold you can't use if you die."

---

## Acceptance Criteria

1. Tutorial teaches all core mechanics through narrative
2. Warden dialogue establishes tone and character
3. Class-specific tutorials explain unique mechanics
4. Tutorial is skippable for returning players
5. Tooltips throughout game maintain Warden voice
6. Post-tutorial moments continue the narrative

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-12-03 | 1.0 | Initial story creation | World Builder Agent |
