# Narrative Events — Complete Reference

## Status: Approved

## Overview

Narrative Events appear between dungeon rooms, offering:
- **Flavor moments** (text only, atmosphere building)
- **Stat rewards** (permanent +HP, +Resolve, +Damage)
- **Card rewards** (draw a random card to add to deck)
- **CYOA choices** (multiple options with different outcomes)
- **Stat risks** (some choices can harm you)

---

## Event Categories

| Type | Description | Frequency |
|------|-------------|-----------|
| **Universal** | Any class can encounter | Common |
| **Class-Specific** | Only one class sees this | Uncommon |
| **Act-Locked** | Only appears in specific act | Varies |
| **Boss-Related** | Appears before/after bosses | Guaranteed |
| **Rare** | Low chance, high impact | Rare |

---

## Data Structure

```typescript
interface NarrativeEvent {
  id: string;
  title: string;
  act: 1 | 2 | 3 | 'any';
  classRestriction?: CharacterClassId;
  rarity: 'common' | 'uncommon' | 'rare';
  triggerType: 'random' | 'progress' | 'health' | 'boss_pre' | 'boss_post';
  triggerCondition?: {
    roomsCleared?: number;
    healthBelow?: number;
    healthAbove?: number;
    bossId?: string;
  };
  content: {
    text: string;           // Main narrative text
    speakerName?: string;   // "Lyra", "Wren", etc.
    speakerType?: 'warden' | 'character' | 'unknown';
  };
  choices?: NarrativeChoice[];
  // If no choices, can have automatic reward
  autoReward?: EventReward;
}

interface NarrativeChoice {
  id: string;
  text: string;            // Button text
  flavorText?: string;     // Shown on hover
  outcomes: EventOutcome[];  // Can have multiple (random selection)
}

interface EventOutcome {
  weight: number;          // For random selection (higher = more likely)
  resultText: string;      // What happens
  rewards?: EventReward[];
  penalties?: EventPenalty[];
}

interface EventReward {
  type: 'hp_max' | 'hp_heal' | 'resolve_max' | 'damage_bonus' |
        'block_bonus' | 'card_random' | 'card_specific' | 'gold' | 'relic';
  amount?: number;
  cardId?: string;
  relicId?: string;
}

interface EventPenalty {
  type: 'hp_loss' | 'hp_max_loss' | 'resolve_loss' | 'curse_card' | 'gold_loss';
  amount?: number;
  curseId?: string;
}
```

---

# Part I: Universal Events (All Classes)

## Act 1 — The Entrance Halls

### EVENT: The Abandoned Camp

**ID:** `abandoned_camp`
**Act:** 1 | **Rarity:** Common

> You find the remains of a camp. Bedrolls, scattered supplies, the cold ashes of a fire that died days ago.
>
> Someone made it this far. They didn't make it further.
>
> Among the scattered belongings, you find useful items.

**Choices:**

**[Search the Packs]**
- *"There might be supplies worth taking."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Good | 60% | "You find healing herbs and preserved rations." **+5 Max HP** |
| Neutral | 30% | "Mostly personal effects. A letter never sent. A lock of hair." **No reward** |
| Bad | 10% | "Something was hiding in the pack. It bites." **-3 HP, but find 15 Gold** |

**[Take a Moment of Silence]**
- *"Honor the fallen."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Always | 100% | "You say words for the dead. The Sanctum feels slightly less hostile." **Heal 8 HP** |

**[Move On]**
- *"Nothing here but ghosts."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Always | 100% | "You leave the dead to their rest." **No effect** |

---

### EVENT: The Whispering Walls

**ID:** `whispering_walls`
**Act:** 1 | **Rarity:** Common

> The stones here whisper. Not words—impressions. Fragments of final thoughts from those who died against this wall.
>
> You could listen. You could learn.
>
> Or you could preserve your sanity.

**Choices:**

**[Listen Closely]**
- *"Knowledge is power."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Good | 50% | "A dying knight's last thought: the enemy's weakness. You understand." **+2 Damage for this run** |
| Bad | 50% | "Too many voices. Too much pain. You tear yourself away, shaken." **-5 HP, but Draw 1 Card** |

**[Touch the Wall]**
- *"Feel what they felt."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Good | 40% | "A memory of comfort. Someone's last thought of home." **Heal 10 HP** |
| Neutral | 40% | "Static. The wall has forgotten." **No effect** |
| Bad | 20% | "PAIN. Someone died badly here." **-8 HP** |

**[Walk Past]**
- *"Some knowledge isn't worth having."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Always | 100% | "The whispers fade as you leave. Was that disappointment?" **No effect** |

---

### EVENT: The Broken Shrine

**ID:** `broken_shrine_act1`
**Act:** 1 | **Rarity:** Uncommon

> A small shrine, half-collapsed. The deity's face has been scratched out—deliberately, violently.
>
> But the offering bowl still glows faintly. Something divine lingers.

**Choices:**

**[Make an Offering] (Costs 5 HP)**
- *"Faith requires sacrifice."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Blessed | 60% | "Light warms you. The shrine accepts." **+1 Max Resolve, Heal to Full** |
| Ignored | 40% | "Nothing happens. The god is truly gone." **Just lose the 5 HP** |

**[Pray Without Offering]**
- *"Words should be enough."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Heard | 30% | "Something stirs. A whisper of blessing." **+3 Max HP** |
| Silence | 70% | "Silence. Faith without sacrifice is just hope." **No effect** |

**[Vandalize Further]**
- *"Dead gods deserve no worship."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Power | 50% | "You smash the shrine. Power flows into you—stolen divinity." **+3 Damage, but add Curse: Guilt to deck** |
| Nothing | 50% | "You smash the shrine. Nothing happens. You feel petty." **No effect** |

---

### EVENT: The Merchant's Ghost

**ID:** `merchant_ghost`
**Act:** 1 | **Rarity:** Rare

> A translucent figure sits behind spectral wares. His smile is sad but genuine.
>
> *"I died here, but my inventory didn't. Care to browse? I accept... years."*

**Choices:**

**[Browse the Wares]**
- *"What do you have?"*

| Outcome | Weight | Result |
|---------|--------|--------|
| Always | 100% | Opens shop interface with 3 random cards. **Cost: -5 Max HP each** |

**[Trade a Memory]**
- *"Take something precious."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Good Deal | 100% | "The ghost takes a happy memory. You can't remember your mother's face. But you gain knowledge." **-5 Max HP, +1 Random Rare Card** |

**[Refuse]**
- *"I'll keep my years."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Respectful | 100% | *"Wise. Or foolish. Time will tell."* He fades. **No effect** |

---

## Act 2 — The Flooded Depths

### EVENT: The Drowned Memory

**ID:** `drowned_memory`
**Act:** 2 | **Rarity:** Common

> A memory bubble floats in the corridor—a preserved moment from drowned Thalassar.
>
> Inside, you see a child laughing. A parent lifting them high. The moment before the flood.
>
> You could absorb it. Learn from it. Or let it float on.

**Choices:**

**[Absorb the Memory]**
- *"Experience what they experienced."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Joy | 60% | "You feel the love. The laughter. It fills something empty in you." **Heal 15 HP** |
| Grief | 40% | "You feel the loss. The water. The end." **-5 HP, but +1 Max Resolve** |

**[Pop the Bubble]**
- *"Set it free."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Release | 100% | "The memory dissolves. Somewhere, a child's ghost smiles." **No reward, but skip next encounter (room becomes empty)** |

**[Ignore It]**
- *"Not my memory."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Always | 100% | "The bubble floats away. The moment is preserved." **No effect** |

---

### EVENT: The Coral Throne

**ID:** `coral_throne`
**Act:** 2 | **Rarity:** Uncommon

> An empty throne of living coral. It wasn't Aldric's—too small, too humble. A child's throne.
>
> The coral pulses with preserved life. If you sat in it...

**Choices:**

**[Sit on the Throne]**
- *"See what happens."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Blessed | 40% | "For a moment, you're royalty. The coral accepts you." **+5 Max HP, +5 Block at start of each combat** |
| Rejected | 40% | "The coral stings. You're not worthy." **-10 HP** |
| Vision | 20% | "You see the last princess of Thalassar. She tells you a secret." **Learn Thalassar's Blessing card** |

**[Touch the Coral]**
- *"Just feel it."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Warm | 70% | "Warm. Like being held." **Heal 10 HP** |
| Cold | 30% | "Cold. Like drowning." **-5 HP** |

**[Leave It Alone]**
- *"Some thrones aren't meant to be sat upon."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Always | 100% | "The coral dims slightly. Disappointed?" **No effect** |

---

### EVENT: The Loyal Dead

**ID:** `loyal_dead`
**Act:** 2 | **Rarity:** Common

> A drowned soldier stands at attention. Still guarding. Still loyal. After four hundred years.
>
> He doesn't attack. He just... waits. For orders that will never come.

**Choices:**

**[Give Him Orders]**
- *"Soldier! At ease!"*

| Outcome | Weight | Result |
|---------|--------|--------|
| Obeys | 70% | "He relaxes. Crumbles. Finally at peace. He leaves his sword." **+3 Damage for this run** |
| Attacks | 30% | "You're not his king. He attacks." **Start combat with Drowned Guard (30 HP)** |

**[Ask About Aldric]**
- *"Do you remember your king?"*

| Outcome | Weight | Result |
|---------|--------|--------|
| Remembers | 60% | "...best king... loved us... saved the children..." He weeps and fades. **Learn insight: +10% damage vs Drowned King** |
| Forgotten | 40% | "...who? I don't... I can't..." He wails and attacks. **Start combat with Drowned Guard** |

**[Walk Around Him]**
- *"He's not my problem."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Always | 100% | "He doesn't notice you. Or pretends not to." **No effect** |

---

## Act 3 — The Sanctum Core

### EVENT: The Mirror Self

**ID:** `mirror_self`
**Act:** 3 | **Rarity:** Common

> A mirror that shows you—but wrong. The reflection moves independently. It's studying you.
>
> *"I could be you,"* it says. *"I almost was. Before the void took me."*
>
> It offers a trade.

**Choices:**

**[Trade Strength for Wisdom]**
- *"Make me smarter, not stronger."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Trade | 100% | "Your muscles feel weaker. Your mind feels sharper." **-5 Max HP, +1 Max Resolve, Draw 1 extra card per turn for rest of run** |

**[Trade Wisdom for Strength]**
- *"Make me stronger, not smarter."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Trade | 100% | "Your thoughts feel slower. Your arms feel powerful." **-1 Max Resolve, +5 Max HP, +4 Damage** |

**[Attack the Mirror]**
- *"I don't negotiate with shadows."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Shatter | 70% | "The mirror shatters. Seven years bad luck—or is that just superstition?" **Start next 3 combats with 2 Corruption stacks** |
| Absorb | 30% | "The mirror shatters. Your reflection flows into you." **+3 Max HP, +1 Damage, no penalty** |

**[Refuse]**
- *"I am enough as I am."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Respect | 100% | "The reflection nods. 'Maybe that's why you'll succeed.' It fades." **Heal to full HP** |

---

### EVENT: The Hollow Whisper

**ID:** `hollow_whisper`
**Act:** 3 | **Rarity:** Uncommon

> A voice that isn't a voice. The Hollow God, speaking directly to you.
>
> *"I can give you power. I can give you rest. I can give you nothing at all—and nothing is peaceful."*
>
> It's not lying. That's the terrible part.

**Choices:**

**[Accept Power]**
- *"Make me strong enough to win."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Granted | 100% | "Darkness flows into you. You are stronger. You are... less." **+10 Damage, +10 Max HP, but add 3 Corruption Curse cards to deck** |

**[Accept Rest]**
- *"Let me stop hurting."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Granted | 100% | "Peace, for a moment. The pain stops. The fighting doesn't." **Heal to full, remove all negative status effects, but -3 Max Resolve permanently** |

**[Reject Everything]**
- *"I want nothing from you."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Defiance | 100% | "...interesting. They usually accept something." The voice sounds almost impressed. **+5% damage vs Hollow God, No penalty** |

---

### EVENT: The Warden's Gift

**ID:** `wardens_gift`
**Act:** 3 | **Rarity:** Rare

> Lyra's voice, clearer than it's been in hours.
>
> *"I can't help you fight. But I can give you something I've been saving. A piece of what I was, before."*
>
> *"Take it. Please. Let me be useful one last time."*

**Choices:**

**[Accept Her Gift]**
- *"Thank you, Lyra."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Always | 100% | "Warmth. Light. A healer's blessing, preserved for 347 years." **+10 Max HP, Heal to full, +1 Max Resolve. Lyra's voice fades completely after this.** |

**[Refuse]**
- *"Save your strength. You need it."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Always | 100% | "...you're kind. Foolish, but kind. Thank you." Lyra's voice remains slightly stronger for the rest of Act 3. **+5% damage vs Hollow God from her guidance** |

---

# Part II: Class-Specific Events

## Cleric (Elara) Events

### EVENT: Brother Aldous's Prayer Book

**ID:** `cleric_prayer_book`
**Act:** 2 | **Class:** Cleric | **Rarity:** Uncommon

> Among the drowned relics, you find a prayer book. The handwriting is familiar—it's the same hand that wrote the scriptures you memorized as a novice.
>
> Brother Aldous was here. He wrote prayers in this book. New prayers. Prayers you've never seen.

**Choices:**

**[Read the New Prayers]**
- *"Learn what he learned."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Enlightened | 100% | "The prayers are different. Deeper. He found faith here, not despite the darkness, but because of it." **+2 Devotion at start of each combat, Learn 'Aldous's Final Prayer' card** |

**[Pray the Familiar Prayers]**
- *"The old ways are enough."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Comforted | 100% | "The words you know. The faith you trust. It's enough. It always was." **+5 Max HP, +1 Devotion generation per turn** |

---

### EVENT: The Silent Chapel

**ID:** `cleric_silent_chapel`
**Act:** 3 | **Class:** Cleric | **Rarity:** Rare

> A chapel to Brother Aldous. Built by the Wardens who came after him. A place to remember the god who served.
>
> His crystal is visible through a window. He's preserved. Peaceful. Silent.
>
> You could pray to him. He can't answer. But you could try.

**Choices:**

**[Pray to Brother Aldous]**
- *"Hear me, please. One last time."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Heard | 50% | "No words. But warmth. He's proud of you. Even now. Even silent." **Fully restore HP and Resolve. +5% damage vs Hollow God. You feel at peace.** |
| Silence | 50% | "Nothing. Of course nothing. He's gone." But you feel stronger for trying. **+3 Max HP, +10 Gold worth of candles you found** |

**[Say Goodbye]**
- *"Thank you for everything. Rest now."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Farewell | 100% | "The crystal glows, briefly. A farewell. A blessing. A promise that faith was never wasted." **+2 Max Resolve, +10% damage vs Hollow God** |

---

## Knight (Varren) Events

### EVENT: Ser Aldric's Last Camp

**ID:** `knight_aldric_camp`
**Act:** 1 | **Class:** Knight | **Rarity:** Uncommon

> You recognize the Order's symbols. This was Ser Aldric's camp. Your mentor slept here, fifteen years ago.
>
> His journal lies open on a rock. The last entry is unfinished.
>
> *"Tomorrow I face the Bonelord. I am afraid. But fear is not—"*
>
> He never finished the sentence.

**Choices:**

**[Finish His Sentence]**
- *"Fear is not weakness."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Completed | 100% | "You write it in your own hand. His teaching, your truth." **Immune to Fear status effects for this run. +3 Block at start of each combat.** |

**[Take His Journal]**
- *"His words should live on."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Inherited | 100% | "His tactics. His insights. His failures and what he learned from them." **Learn 'Mentor's Wisdom' card: 0 cost, Draw 2 cards, Gain 3 Block** |

**[Leave It]**
- *"Let his words rest where he left them."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Respectful | 100% | "Some things are private. Even from those who loved him." **+5 Max HP from the peace of letting go** |

---

### EVENT: The Crystallized Knight

**ID:** `knight_crystal_mentor`
**Act:** 3 | **Class:** Knight | **Rarity:** Guaranteed (First time reaching Act 3)

> Ser Aldric's crystal. He's here. Preserved. The expression on his face is shame.
>
> The Warden said he hesitated. For one moment, he wanted the peace.
>
> You can see it. The moment captured forever. Your mentor, wanting to give up.

**Choices:**

**[Touch the Crystal]**
- *"I'm here, mentor. I came for you."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Connection | 100% | "The crystal is warm. He knows you're here. He can't speak, but... something transfers. His final technique." **Learn 'Last Stand' card: 3 cost, Deal 20 damage. If this kills an enemy, gain 10 Block and draw 2 cards.** |

**[Forgive Him]**
- *"It's okay. Hesitation isn't failure."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Forgiveness | 100% | "The shame on his face softens. Even crystals can cry." **+10 Max HP, +5% damage vs Hollow God from his blessing** |

**[Promise Victory]**
- *"I'll finish what you started."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Oath | 100% | "You swear on the Order's seal. On his seal. On everything you are." **+15% damage vs Hollow God, but if you lose, the defeat screen shows Aldric's disappointment** |

---

## Diabolist (Mordecai) Events

### EVENT: Xan'thrax's Voice

**ID:** `diabolist_xanthrax_voice`
**Act:** 1 | **Class:** Diabolist | **Rarity:** Common

> The devil's voice, distant but clear.
>
> *"Having fun, little mageling? Remember: every soul you take, I get a percentage. Keep killing. Keep feeding me."*
>
> He laughs. You can feel the contract pulse.

**Choices:**

**[Spit Defiance]**
- *"Go to hell. Oh wait—"*

| Outcome | Weight | Result |
|---------|--------|--------|
| Amused | 100% | "He laughs harder. 'I like you. That's why I chose you.' The contract burns, but you feel stronger." **-3 HP, +2 Damage for this run** |

**[Negotiate]**
- *"What if I brought you something better than a fragment?"*

| Outcome | Weight | Result |
|---------|--------|--------|
| Intrigued | 100% | "'Better?' He pauses. 'I'm listening.' The contract relaxes slightly." **Soul Debt maximum increased by 5 for this run** |

**[Ignore Him]**
- *"Not worth my time."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Annoyed | 100% | "'Rude.' A small punishment—your next Pain card deals 2 damage instead of 1." **Next 3 Pain cards deal +1 damage** |

---

### EVENT: The Other Contractor

**ID:** `diabolist_other_contract`
**Act:** 2 | **Class:** Diabolist | **Rarity:** Rare

> Another devil's mark. Not Xan'thrax—something older. Something he fears.
>
> *"Child of Xan'thrax,"* a new voice purrs. *"Your contractor has enemies. I could... intervene."*
>
> This is dangerous. This is opportunity.

**Choices:**

**[Hear the Offer]**
- *"What do you want?"*

| Outcome | Weight | Result |
|---------|--------|--------|
| Deal | 100% | "'Kill Xan'thrax's hold. Sign with me instead.' A new contract appears. Better terms. Different trap." **Remove all Pain cards from deck. Add 2 'Debt' cards instead (0 cost, Unplayable, At end of combat lose 5 HP)** |

**[Play Them Against Each Other]**
- *"Xan'thrax would pay well to know you're here."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Leverage | 100% | "Both devils go silent. The silence of fear. You've bought yourself breathing room." **Soul Debt cap removed for this run. +5 Max HP from reduced demonic pressure** |

**[Refuse Both]**
- *"I'm done making deals with devils."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Respect | 100% | "Both voices laugh—but nervously. A mortal refusing power? Unheard of." **+3 Damage, +3 Block at start of each combat from sheer spite** |

---

## Oathsworn (Callista) Events

### EVENT: Sister Mara's Writing

**ID:** `oathsworn_mara_writing`
**Act:** 1 | **Class:** Oathsworn | **Rarity:** Uncommon

> Words carved into the wall. You recognize the hand—Sister Mara's scripture.
>
> But these words aren't in the Order's texts. These are her private thoughts.
>
> *"The truth burns. But some things should burn. Some truths are too dangerous to speak. I'm writing them here instead."*

**Choices:**

**[Read the Forbidden Words]**
- *"The Order deserves to know everything."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Enlightened | 70% | "The truth: the Wardens aren't jailers. They're *volunteers*. They chose this. Mara couldn't accept that." **+1 Max Resolve, +5% damage vs all bosses** |
| Shattered | 30% | "The truth: Mara founded the Order as revenge. She wanted the Sanctum destroyed because it rejected her." **-5 Max HP from the weight of it, but +10% damage vs Hollow God** |

**[Destroy the Writing]**
- *"Some truths should stay buried."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Protected | 100% | "You scrape the words away. The Order's faith is safe. Your certainty returns." **+5 Max HP, +3 Block at start of each combat** |

---

### EVENT: The Oath Stone

**ID:** `oathsworn_oath_stone`
**Act:** 3 | **Class:** Oathsworn | **Rarity:** Uncommon

> A stone where Wardens swore their vows. Names carved into it, dating back millennia.
>
> There's space for one more name.

**Choices:**

**[Carve Your Name]**
- *"I'll take the oath. Whatever it costs."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Sworn | 100% | "Your name joins theirs. The stone accepts you. Power flows—and obligation." **+2 Max Resolve, +10 Max HP, but you MUST become the Warden if you win (no leave option)** |

**[Carve a New Oath]**
- *"The old vows need updating."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Reformed | 100% | "You write: 'To guard, but not to cage. To hold, but not to trap. To choose, always.' The stone glows." **+5% damage vs all enemies. Keep all ending options.** |

**[Leave It Blank]**
- *"I'm not ready for vows."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Free | 100% | "No binding. No obligation. Just you, choosing moment by moment." **Heal to full HP** |

---

## Fey-Touched (Wren) Events

### EVENT: Oberon's Gambit

**ID:** `fey_oberons_gambit`
**Act:** 1 | **Class:** Fey-Touched | **Rarity:** Common

> A card appears in midair. A game piece. Oberon's voice, dripping with amusement.
>
> *"A little gift, Wren. A gamble. Turn it over, and something happens. Maybe good. Maybe bad. Won't that be fun?"*
>
> You hate him. But curiosity is a curse.

**Choices:**

**[Turn the Card]**
- *"Fine. Let's play."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Blessing | 25% | "The Ace of Joy. Oberon laughs delightedly." **+10 Max HP, Heal to full, Draw 2 cards at start of each combat for rest of run** |
| Curse | 25% | "The Ace of Tears. Oberon laughs cruelly." **-10 Max HP, Add 2 'Bad Luck' curse cards to deck** |
| Nothing | 50% | "A blank card. 'Maybe next time,' Oberon giggles." **No effect** |

**[Burn the Card]**
- *"I don't play your games."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Spite | 100% | "Oberon gasps in mock offense. 'So RUDE!' But you feel freer." **+5% damage vs all enemies from spite, Oberon's mark burns less** |

---

### EVENT: The Fairy Ring

**ID:** `fey_fairy_ring`
**Act:** 2 | **Class:** Fey-Touched | **Rarity:** Rare

> A fairy ring. Mushrooms in a perfect circle. Stepping inside would take you... somewhere else.
>
> Oberon's domain. His court. Where you were marked.
>
> You could go back. Demand answers. Or burn the whole thing down.

**Choices:**

**[Enter the Ring]**
- *"I have questions."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Audience | 100% | "Oberon is surprised. 'You CAME? Bold little moth.' He offers a second gift—properly this time." **Choose one: +3 Max Resolve OR +15 Max HP OR Remove 2 cards from deck permanently** |

**[Burn the Ring]**
- *"I'm done with fey games."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Destruction | 100% | "The mushrooms burn. Oberon SCREAMS. 'You'll PAY for that!' Worth it." **+5 Damage for rest of run, but Oberon sends fey assassins (extra elite encounter this act)** |

**[Step Over It]**
- *"Nice try."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Caution | 100% | "The ring fades, unused. Oberon sighs. 'Boring.'" **+3 Max HP from not falling for it** |

---

## Celestial (Seraphina) Events

### EVENT: Auriel Speaks

**ID:** `celestial_auriel_speaks`
**Act:** 1 | **Class:** Celestial | **Rarity:** Common

> The fragment stirs. Auriel, for the first time, speaks *with* you instead of *at* you.
>
> *"You're afraid of me. I understand. But... I'm afraid too. The void took my god. I don't want to go back to the nothing."*
>
> It's not asking forgiveness. It's asking for understanding.

**Choices:**

**[Offer Understanding]**
- *"I know what it's like to be afraid."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Partnership | 100% | "Auriel relaxes. For the first time, the light doesn't feel like a leash." **+2 Radiance at start of each combat, Radiance cap increased to 12** |

**[Demand Answers]**
- *"Why did you choose me?"*

| Outcome | Weight | Result |
|---------|--------|--------|
| Truth | 100% | "'Because you were empty. Lost. Like me. I thought we could fill each other.' Honest, at least." **+5 Max HP from self-knowledge, +1 Radiance generation per turn** |

**[Remain Cold]**
- *"I don't care about your fear."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Distance | 100% | "Auriel goes silent. The light is yours to command, but colder." **+3 Damage, but -3 Max HP. Divine Form requires 12 Radiance instead of 10.** |

---

### EVENT: The God of Dawn's Fragment

**ID:** `celestial_god_fragment`
**Act:** 3 | **Class:** Celestial | **Rarity:** Guaranteed

> You find it. The crystallized remains of the God of Dawn. Auriel's source.
>
> Auriel is weeping. Not with sound—with light. Golden tears streaming through you.
>
> *"My god. My home. We were so beautiful once."*
>
> You have a choice to make.

**Choices:**

**[Release Auriel to the Crystal]**
- *"Go home. Be whole again."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Mercy | 100% | "Auriel flows out of you. The crystal glows brighter. You feel... empty. But free." **Lose all Radiance mechanics. Gain +10 Max HP, +5 Damage, +2 Max Resolve. You are purely yourself.** |

**[Merge with Auriel Permanently]**
- *"We're stronger together."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Fusion | 100% | "Auriel settles into you. Not as a parasite—as a partner. You are Seraphina AND something divine." **Radiance cap removed. Start each combat with 5 Radiance. Divine Form grants +3 damage instead of +1.** |

**[Keep Things as They Are]**
- *"I'm not ready to decide."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Status Quo | 100% | "Auriel accepts. 'When you're ready. If you're ever ready.' The choice remains open." **+5 Max HP, +5% damage vs Hollow God** |

---

## Summoner (Caelum) Events

### EVENT: The Wisp's Memory

**ID:** `summoner_wisp_memory`
**Act:** 1 | **Class:** Summoner | **Rarity:** Common

> Your wisps find something—a fragment of consciousness, old and faded. A wisp that died here long ago.
>
> Your children gather around it. They're... singing? Mourning?
>
> They want you to absorb it. To give it form again through you.

**Choices:**

**[Absorb the Fragment]**
- *"Every consciousness deserves another chance."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Rebirth | 100% | "The old wisp joins your family. It's different—older, wiser, sadder. But it's alive again." **Gain 'Ancient Wisp' minion option: 6 HP, 4 damage, and enemies it attacks are Weakened** |

**[Let It Rest]**
- *"Some things should stay at peace."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Peace | 100% | "The fragment fades. Your wisps sing it to sleep. They seem... proud of you." **+1 to all minion HP permanently, +1 to all minion damage** |

---

### EVENT: The Congregation Approaches

**ID:** `summoner_congregation`
**Act:** 2 | **Class:** Summoner | **Rarity:** Uncommon

> You feel them. The Congregation—the hive-mind that consumed your order. They're nearby.
>
> Fragments of your colleagues' consciousness call out.
>
> *"Archmage... help us... we remember you..."*
>
> You could save some of them. If you're fast. If you're willing to risk.

**Choices:**

**[Reach Into the Congregation]**
- *"I'll save whoever I can."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Rescue | 60% | "You pull fragments free. Three colleagues, barely conscious but grateful." **+3 Max Minions for this run. Gain unique minion: 'Bound Circle Remnant' (10 HP, 3 damage, on death draw 1 card)** |
| Pulled In | 40% | "The Congregation grabs back. You barely escape." **-10 HP, but gain +5% damage vs all Act 2 enemies from rage** |

**[Attack the Congregation]**
- *"You're not getting anyone else."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Scattered | 100% | "You blast the hive-mind apart. The fragments scatter. Some will reform. Some won't." **+5 Damage for this run, but add 'Guilt' curse card to deck** |

**[Wait for Your Children]**
- *"My family is here. I can't risk them for ghosts."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Protected | 100% | "Your wisps huddle close. The Congregation passes. You're safe." **All minions gain +2 HP permanently** |

---

### EVENT: Lumina Returns

**ID:** `summoner_lumina_returns`
**Act:** 3 | **Class:** Summoner | **Rarity:** Guaranteed

> A spark of light in the darkness. A familiar warmth.
>
> *"Father? Father, is that you?"*
>
> Lumina. Your first wisp. The one who died protecting you. She's here. Preserved by love. Waiting.

**Choices:**

**[Embrace Her]**
- *"Lumina. My light. I found you."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Reunion | 100% | "She flows into you. Part of you again. Where she always belonged." **Lumina becomes permanent companion: 8 HP, 5 damage, cannot be permanently killed (reforms at start of next combat)** |

**[Set Her Free]**
- *"You don't have to stay. You've earned rest."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Freedom | 100% | "'But... father... I want to stay.' She looks at you with pure love. 'Let me stay. Please.'" **If you insist on freedom: +10 Max HP, +5% damage vs Hollow God. If you let her stay: same as Embrace** |

---

## Bargainer (Vesper) Events

### EVENT: Malachar's Rage

**ID:** `bargainer_malachar_rage`
**Act:** 1 | **Class:** Bargainer | **Rarity:** Common

> The devil's screams at the barrier intensify.
>
> *"YOU THINK WALLS CAN SAVE YOU? I HAVE ETERNITY! I HAVE PATIENCE! THE MOMENT YOU STEP OUTSIDE—"*
>
> He's terrified. Desperate. A devil, scared of losing.
>
> You could torment him. Or you could focus.

**Choices:**

**[Taunt Him]**
- *"How's it feel to lose, Malachar?"*

| Outcome | Weight | Result |
|---------|--------|--------|
| Rage | 100% | "His screams become incoherent. It's... satisfying." **+3 Damage from pure spite, Heal 10 HP from joy** |

**[Negotiate]**
- *"We could make a new deal."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Intrigued | 100% | "'...I'm listening.' He stops screaming. 'What do you want?' The barriers don't let deals through, but he doesn't know that." **Bluff gives +5% damage vs all enemies from confidence** |

**[Ignore Him]**
- *"Not worth my time."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Focus | 100% | "You focus inward. His screams fade to background noise." **+5 Max HP from inner peace** |

---

### EVENT: The Child's Prayer

**ID:** `bargainer_lily_prayer`
**Act:** 2 | **Class:** Bargainer | **Rarity:** Rare

> A whisper reaches you. Not Malachar. Something pure.
>
> *"Dear kind lady who saved me, please be okay. I pray for you every night. Please come home."*
>
> Lily. The child you saved. She's praying for you.
>
> Malachar was telling the truth—she's sick. But she's still praying. For you.

**Choices:**

**[Listen to the Full Prayer]**
- *"Let me hear it."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Love | 100% | "She prays for ten minutes. Lists everyone she loves. You're on the list. Third. After her mother and her cat." **Heal to full. +5 Max HP. You have something worth fighting for.** |

**[Send a Response]**
- *"I'm okay. I'm coming home."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Message | 100% | "Something in the Sanctum carries your words. You don't know if she'll hear them. But you had to try." **+10% damage vs Hollow God. You MUST choose 'Leave' ending if you win.** |

**[Close the Connection]**
- *"I can't be distracted. Not now."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Focus | 100% | "The prayer fades. You feel cold. But focused." **+3 Damage, +1 Max Resolve** |

---

### EVENT: The Final Negotiation

**ID:** `bargainer_final_deal`
**Act:** 3 | **Class:** Bargainer | **Rarity:** Guaranteed

> The Hollow God's presence, before the final battle.
>
> You've been thinking about this. Devils. Contracts. Fair exchange.
>
> What if you could make a deal with the void?
>
> Not fighting. *Negotiating*.

**Choices:**

**[Open Negotiations]**
- *"I want to propose terms."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Listening | 100% | "The void... pauses. It's never been addressed this way. 'Terms?' it asks. It's curious." **Hollow God fight has special dialogue options. +20% damage vs Hollow God if you say the right things.** |

**[Prepare for Combat]**
- *"Some things can't be negotiated."*

| Outcome | Weight | Result |
|---------|--------|--------|
| Ready | 100% | "You're a bargainer. But some deals aren't worth making." **+5 Damage, +5 Max HP. Standard boss fight.** |

**[Offer Yourself]**
- *"What if I traded myself for everyone it's consumed?"*

| Outcome | Weight | Result |
|---------|--------|--------|
| Consideration | 100% | "'...interesting. You would unmake yourself to remake others?' The void is genuinely confused." **If you lose to Hollow God, the defeat screen shows your sacrifice saving hundreds of trapped souls** |

---

# Part III: Act-Specific Random Events

## Act 1 Random Events

| ID | Name | Effect |
|----|------|--------|
| `found_supplies` | Found Supplies | +5 Gold |
| `healing_spring` | Healing Spring | Heal 15 HP |
| `danger_sense` | Danger Sense | +1 Block at start of next combat |
| `old_weapon` | Old Weapon | +1 Damage for this run |
| `trap_avoided` | Trap Avoided | No effect, just flavor |
| `strange_noise` | Strange Noise | No effect, builds atmosphere |

## Act 2 Random Events

| ID | Name | Effect |
|----|------|--------|
| `thalassar_coin` | Thalassar Coin | +10 Gold |
| `drowned_blessing` | Drowned Blessing | +3 Block at start of next combat |
| `memory_surge` | Memory Surge | Draw 1 extra card next combat |
| `water_pressure` | Water Pressure | -3 HP, but find Rare card |
| `aldric_memory` | Aldric's Memory | +5% damage vs Drowned King |
| `coral_growth` | Coral Growth | +2 Max HP |

## Act 3 Random Events

| ID | Name | Effect |
|----|------|--------|
| `void_whisper` | Void Whisper | -3 HP OR +2 Corruption |
| `warden_echo` | Warden Echo | +1 Max Resolve |
| `reality_tear` | Reality Tear | Random effect (any of the above) |
| `identity_slip` | Identity Slip | Lose a random card, gain a random card |
| `hollow_offer` | Hollow Offer | +5 Damage, +3 Corruption |
| `final_blessing` | Final Blessing | +5 Max HP |

---

# Implementation Notes

## Event Frequency

| Act | Events per run | Guaranteed | Random chance |
|-----|---------------|------------|---------------|
| Act 1 | 3-5 | 1 (Class intro) | 20% per room |
| Act 2 | 3-5 | 1 (Mid-story) | 20% per room |
| Act 3 | 2-4 | 1-2 (Class climax) | 15% per room |

## UI Recommendations

- Events appear as full-screen overlays with parchment texture
- Character portrait shown for class-specific events
- Choice buttons with hover text showing risk assessment
- Outcome animation before reward display
- Skip button for returning players (after first playthrough)

## Balance Notes

- Stat boosts should be meaningful but not game-breaking (+3-5 HP, +1-3 Damage)
- Risk/reward choices should have real consequences
- Class-specific events should reinforce class fantasy
- Guaranteed events should advance character arc

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-12-04 | 1.0 | Initial narrative events creation | World Builder Agent |
