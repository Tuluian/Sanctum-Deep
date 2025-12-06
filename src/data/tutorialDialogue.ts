/**
 * Tutorial Dialogue Data
 *
 * All dialogue content copied verbatim from docs/stories/tutorial-narrative.md
 * DO NOT modify this text - it's written by the narrative team.
 */

import { CharacterClassId } from '@/types';

export interface DialogueLine {
  speaker: 'narrator' | 'warden' | 'enemy';
  text: string;
  stageDirection?: string;
}

export interface TutorialPhase {
  id: string;
  dialogues: DialogueLine[];
  tutorialPrompt?: {
    title: string;
    lines: string[];
  };
}

// Phase 0: Entrance narrative
export const ENTRANCE_NARRATIVE = {
  title: 'SANCTUM RUINS',
  lines: [
    'There is a place where the desperate go.',
    'Where the lost seek answers.',
    'Where the dead walk and the living forget.',
    '',
    'The Sanctum has been here longer than memory.',
    'It will be here after everything ends.',
    '',
    'You are here now.',
    '',
    'Why?',
  ],
};

// Phase 1: Warden greeting (base)
export const WARDEN_GREETING: DialogueLine[] = [
  {
    speaker: 'warden',
    text: 'Ah. Another one.',
    stageDirection: 'A figure emerges from the shadows. They are translucent, tired, ancient—but their eyes are kind.',
  },
  {
    speaker: 'warden',
    text: 'I am the Warden. I have held this place for 347 years. Before me, there were others. After me...',
    stageDirection: 'They look you over.',
  },
  {
    speaker: 'warden',
    text: '...there will be you. Or there will be nothing.',
    stageDirection: 'They smile sadly.',
  },
];

// Class-specific greetings
export const CLASS_GREETINGS: Record<CharacterClassId, DialogueLine[]> = {
  [CharacterClassId.CLERIC]: [
    {
      speaker: 'warden',
      text: "A person of faith. Good. You'll need faith here. But let me warn you—the gods don't hear you in the Sanctum. Whatever you pray to... you'll have to become your own answer.",
    },
  ],
  [CharacterClassId.DUNGEON_KNIGHT]: [
    {
      speaker: 'warden',
      text: "Order of the Sealed Gate. I recognize the armor. Your people guard the entrance. They've been sending champions for generations.",
    },
    {
      speaker: 'warden',
      text: 'Ask yourself: why do they need to keep sending them?',
      stageDirection: 'Pause',
    },
  ],
  [CharacterClassId.DIABOLIST]: [
    {
      speaker: 'warden',
      text: "Mmm. The smell of brimstone. You've made bargains, haven't you? Well, the Sanctum makes bargains too. Fair warning: our contracts are worse than your demon's.",
    },
  ],
  [CharacterClassId.OATHSWORN]: [
    {
      speaker: 'warden',
      text: "The Order of the Burning Truth. You've come to destroy this place, haven't you?",
    },
    {
      speaker: 'warden',
      text: "Every Oathsworn says that. None have succeeded. Perhaps you'll understand why. Eventually.",
      stageDirection: 'Laughs softly',
    },
  ],
  [CharacterClassId.FEY_TOUCHED]: [
    {
      speaker: 'warden',
      text: "Oberon's mark. You're... being watched. By something older than me.",
      stageDirection: 'The Warden flinches',
    },
    {
      speaker: 'warden',
      text: 'Tell your patron I said hello. And tell him: the Sanctum remembers what the fey forgot.',
    },
  ],
  // DLC classes - simplified greetings
  [CharacterClassId.CELESTIAL]: [
    {
      speaker: 'warden',
      text: 'Radiance walks with you. The light you carry... it burns here. Use it wisely.',
    },
  ],
  [CharacterClassId.SUMMONER]: [
    {
      speaker: 'warden',
      text: 'You bring others with you. Companions from beyond. The Sanctum will test their loyalty.',
    },
  ],
  [CharacterClassId.BARGAINER]: [
    {
      speaker: 'warden',
      text: "A dealer. You trade in futures, don't you? Here, futures are... complicated. Be careful what you promise.",
    },
  ],
  [CharacterClassId.TIDECALLER]: [
    {
      speaker: 'warden',
      text: 'The deep calls to you. I hear it too. The waters here remember the first flood.',
    },
  ],
  [CharacterClassId.SHADOW_STALKER]: [
    {
      speaker: 'warden',
      text: 'You move between shadows. Good. The darkness here is thick. Make it your ally.',
    },
  ],
  [CharacterClassId.GOBLIN]: [
    {
      speaker: 'warden',
      text: "Hungry, aren't you? The Sanctum has plenty to consume. Just be careful what consumes you.",
    },
  ],
};

// Phase 2: Cards explanation
export const CARDS_TUTORIAL: TutorialPhase = {
  id: 'cards',
  dialogues: [
    {
      speaker: 'warden',
      text: 'You fight with cards. This will seem strange. Let me explain.',
      stageDirection: 'The Warden gestures. Cards appear in your hand.',
    },
    {
      speaker: 'warden',
      text: "The Sanctum doesn't allow steel or spells—not directly. Everything here is filtered through... potential. What you COULD do, given form.",
    },
    {
      speaker: 'warden',
      text: 'That card is a Strike. It represents your ability to hurt. When you play it, you hurt.',
      stageDirection: 'Points to a card',
    },
  ],
  tutorialPrompt: {
    title: 'PLAYING CARDS',
    lines: [
      'Click a card to select it.',
      'Click an enemy to target it.',
    ],
  },
};

export const CARDS_TUTORIAL_AFTER: DialogueLine[] = [
  {
    speaker: 'warden',
    text: "Good. The card is gone now—used. But cards return. Every turn, you shuffle your possibilities. Draw new options.",
  },
  {
    speaker: 'warden',
    text: "In the real Sanctum, your deck grows. You find new cards. New potential. The question isn't what cards you have.",
  },
  {
    speaker: 'warden',
    text: 'The question is: what cards will you become?',
  },
];

// Phase 3: Resolve/Energy explanation
export const RESOLVE_TUTORIAL: TutorialPhase = {
  id: 'resolve',
  dialogues: [
    {
      speaker: 'warden',
      text: 'Resolve. This is your limit—how much potential you can manifest each turn.',
      stageDirection: 'The Warden points to your resolve counter.',
    },
    {
      speaker: 'warden',
      text: 'Every card costs resolve. Strike costs 1. Some cards cost more. Some cost less.',
    },
    {
      speaker: 'warden',
      text: 'Each turn, your resolve returns. Fresh potential. But you cannot carry it over. Use it or lose it.',
      stageDirection: 'The counter refills',
    },
  ],
  tutorialPrompt: {
    title: 'RESOLVE / ENERGY',
    lines: [
      'You have 3 Resolve per turn.',
      'Each card costs Resolve to play.',
      'Unused Resolve is lost when you end your turn.',
    ],
  },
};

// Phase 4: Block explanation
export const BLOCK_TUTORIAL: TutorialPhase = {
  id: 'block',
  dialogues: [
    {
      speaker: 'warden',
      text: 'Now. Defense. In the Sanctum, you cannot simply... avoid. Everything reaches you. The only protection is Block.',
      stageDirection: 'The Warden summons a training dummy.',
    },
    {
      speaker: 'warden',
      text: 'Block absorbs damage. Watch.',
    },
    {
      speaker: 'warden',
      text: 'This is Defend. Play it. See what happens.',
      stageDirection: 'Tutorial shows Defend card',
    },
  ],
  tutorialPrompt: {
    title: 'BLOCK',
    lines: [
      'Block absorbs incoming damage.',
      'Play Defend to gain 5 Block.',
      'Block fades at the start of YOUR turn.',
    ],
  },
};

export const BLOCK_TUTORIAL_AFTER: DialogueLine[] = [
  {
    speaker: 'warden',
    text: 'You have 5 Block now. When the enemy strikes, the block absorbs first. What remains hits you.',
  },
  {
    speaker: 'warden',
    text: "Important: Block fades at the end of YOUR turn. What you don't use, you lose.",
  },
];

// Phase 5: Enemy intent explanation
export const ENEMY_TUTORIAL: TutorialPhase = {
  id: 'enemy',
  dialogues: [
    {
      speaker: 'warden',
      text: "The things you'll fight here... they were people once. Most of them. Remember that.",
      stageDirection: 'The Warden gestures toward shadows.',
    },
    {
      speaker: 'warden',
      text: "They cannot help what they've become. But they will kill you anyway. Pity them—but destroy them.",
    },
    {
      speaker: 'warden',
      text: "Enemies show their intentions. See the symbol above? That tells you what they plan to do.",
    },
    {
      speaker: 'warden',
      text: 'This one plans to attack for 6 damage. Plan accordingly.',
      stageDirection: 'Points to intent icon',
    },
  ],
  tutorialPrompt: {
    title: 'ENEMY INTENTS',
    lines: [
      'Enemies telegraph their next action.',
      '',
      '🗡️ Attack - They will deal damage',
      '🛡️ Defend - They will gain block',
      '⚡ Buff - They will strengthen themselves',
      '💀 Debuff - They will weaken you',
      '',
      'Plan your turn based on what they\'re about to do!',
    ],
  },
};

// Phase 6: First combat
export const FIRST_COMBAT: TutorialPhase = {
  id: 'combat',
  dialogues: [
    {
      speaker: 'warden',
      text: "Now. Let's see what you can do.",
    },
    {
      speaker: 'warden',
      text: 'This is a Skeleton. Once, they were guards. Heroes. Merchants. Parents. Now they\'re just... echoes.',
    },
    {
      speaker: 'warden',
      text: "Defeat them. Don't feel guilty. They're already gone.",
    },
  ],
};

export const SKELETON_DIALOGUE: DialogueLine = {
  speaker: 'enemy',
  text: "I had... a name... it's gone now...",
};

export const COMBAT_VICTORY: DialogueLine[] = [
  {
    speaker: 'warden',
    text: "It's done. They're at peace now. Or as close to peace as anything gets here.",
  },
  {
    speaker: 'warden',
    text: 'You fought well. But fighting well isn\'t enough. Many who fought well still lost.',
    stageDirection: 'Warden studies you',
  },
  {
    speaker: 'warden',
    text: "What separates survivors from statistics is... adaptation. Growth. Learning from each encounter.",
  },
];

// Phase 7: Class mechanics
export const CLASS_MECHANICS: Record<CharacterClassId, DialogueLine[]> = {
  [CharacterClassId.CLERIC]: [
    {
      speaker: 'warden',
      text: 'You carry faith. Here, we call it Devotion. It builds with each holy act—and it empowers your gifts.',
    },
    {
      speaker: 'warden',
      text: 'Some of your cards add Devotion. Others consume it. The balance is yours to manage.',
    },
    {
      speaker: 'warden',
      text: "But hear this: Devotion isn't worship. Your god can't hear you here. Devotion is about YOU believing—not about them answering.",
    },
  ],
  [CharacterClassId.DUNGEON_KNIGHT]: [
    {
      speaker: 'warden',
      text: 'You know discipline. The Order trained you well. In the Sanctum, discipline becomes Fortify.',
    },
    {
      speaker: 'warden',
      text: "When you Fortify, your Block doesn't fade at turn's end. It persists. Compounds. Becomes armor that lasts.",
    },
    {
      speaker: 'warden',
      text: 'But Fortify requires setup. Patience. The Sanctum tests patience. Many Knights rush. They die rushing.',
    },
  ],
  [CharacterClassId.DIABOLIST]: [
    {
      speaker: 'warden',
      text: "Your contract follows you here. The demon's mark on your soul. We call it Soul Debt.",
    },
    {
      speaker: 'warden',
      text: 'As you fight, your debt grows. Powers become stronger—but more dangerous. Spend too much...',
    },
    {
      speaker: 'warden',
      text: '...and the debt comes due. Here. Not after death. Here.',
      stageDirection: "The Warden's eyes darken",
    },
  ],
  [CharacterClassId.OATHSWORN]: [
    {
      speaker: 'warden',
      text: 'You carry vows. Binding promises. The Order taught you that vows have power.',
    },
    {
      speaker: 'warden',
      text: "They're right. Vows here ARE power. Swear to attack, and your attacks strengthen. Swear to defend, and your defenses multiply.",
    },
    {
      speaker: 'warden',
      text: 'But break a vow...',
    },
    {
      speaker: 'warden',
      text: '...and there are consequences. The Sanctum enforces contracts. Even the ones you make with yourself.',
      stageDirection: 'Pause',
    },
  ],
  [CharacterClassId.FEY_TOUCHED]: [
    {
      speaker: 'warden',
      text: "Oberon's mark gives you... unpredictability. Luck. Chaos. We call it Whimsy here.",
    },
    {
      speaker: 'warden',
      text: 'Your cards have a chance to do more—or less—than expected. Good outcomes. Bad outcomes. The fey love gambling.',
    },
    {
      speaker: 'warden',
      text: 'You cannot control it. But you can... lean into it. Build around it. Make chaos your strategy.',
    },
    {
      speaker: 'warden',
      text: "It's what the fey want. And the fey get what they want. Eventually.",
    },
  ],
  // DLC classes - simplified
  [CharacterClassId.CELESTIAL]: [
    {
      speaker: 'warden',
      text: 'Your Radiance burns the darkness. Build it with light, release it with fury.',
    },
  ],
  [CharacterClassId.SUMMONER]: [
    {
      speaker: 'warden',
      text: 'Your minions fight alongside you. Protect them, and they will protect you.',
    },
  ],
  [CharacterClassId.BARGAINER]: [
    {
      speaker: 'warden',
      text: 'Favor is your currency. Earn it, spend it. The deals you make shape your power.',
    },
  ],
  [CharacterClassId.TIDECALLER]: [
    {
      speaker: 'warden',
      text: 'The Tide ebbs and flows. Gather it, then unleash the flood. Soak your enemies in the deep.',
    },
  ],
  [CharacterClassId.SHADOW_STALKER]: [
    {
      speaker: 'warden',
      text: 'Shadow Energy builds with each strike from darkness. Use it to vanish, to strike, to survive.',
    },
  ],
  [CharacterClassId.GOBLIN]: [
    {
      speaker: 'warden',
      text: 'Gobble what you defeat. Their power becomes your power. Just... pace yourself.',
    },
  ],
};

// Phase 8: Tutorial completion
export const TUTORIAL_COMPLETION: DialogueLine[] = [
  {
    speaker: 'warden',
    text: "That's enough teaching. The rest you'll learn by doing. Or by dying.",
    stageDirection: 'The Warden steps back.',
  },
  {
    speaker: 'warden',
    text: 'Before you go deeper—one last truth.',
  },
  {
    speaker: 'warden',
    text: "I am dying. Not quickly—it takes centuries for a Warden to fade. But I'm fading.",
    stageDirection: "The Warden's voice becomes serious",
  },
  {
    speaker: 'warden',
    text: 'Someone needs to take my place. To hold the Hollow God in check. To become what I am.',
  },
  {
    speaker: 'warden',
    text: 'That someone... might be you.',
  },
  {
    speaker: 'warden',
    text: "Or it might be the thing that kills you. The Sanctum doesn't care who serves. Only that someone does.",
    stageDirection: 'They look toward the darkness beyond.',
  },
];

export const TUTORIAL_FAREWELL: DialogueLine[] = [
  {
    speaker: 'warden',
    text: 'Go now. Find the Bonelord in the depths below. He was a king once. A proud king.',
  },
  {
    speaker: 'warden',
    text: "Now he's a warning. A reminder of what pride becomes in this place.",
  },
  {
    speaker: 'warden',
    text: 'Remember: the enemies you fight were all people once. They all had reasons to enter. They all thought they\'d succeed.',
  },
  {
    speaker: 'warden',
    text: 'Prove them wrong. Prove me wrong. Be the one who makes it.',
    stageDirection: 'The Warden begins to fade into the shadows.',
  },
  {
    speaker: 'warden',
    text: "I'll be watching. I always watch. It's the only thing I can still do.",
  },
];

// Skip tutorial dialogue
export const SKIP_TUTORIAL_DIALOGUE: DialogueLine[] = [
  {
    speaker: 'warden',
    text: "Ah. You've returned. The Sanctum remembers you.",
  },
  {
    speaker: 'warden',
    text: "Either way... welcome back. I wish I could say it gets easier. It doesn't.",
  },
];

// Tooltips - Warden voiced
export const WARDEN_TOOLTIPS = {
  healthBar: "Your life. Obvious, but important. When it empties, you become another echo in these halls.",
  drawPile: "Your potential. Everything you could become. Shuffle well. The Sanctum cheats—so should you.",
  discardPile: "Used cards return here. They're not gone—just resting. They'll come back when you need them.",
  endTurnButton: "Ending your turn means accepting consequences. Whatever they were planning—it happens now.",
  enemyHp: "How much they can take before they stop. Remember—they didn't choose to be here either.",
  relicSlot: "Items from those who came before. Their power is yours now. Use it well.",
  potionSlot: "Emergency options. Single use. Save them for when everything else fails.",
};

// Post-tutorial messages (full dialogues)
export const POST_TUTORIAL_MESSAGES = {
  firstElite: [
    {
      speaker: 'warden' as const,
      text: "This one was strong. Strong enough to survive longer than most. That's why they're called elites.",
    },
    {
      speaker: 'warden' as const,
      text: "They'll test you. That's the point. If you can't beat them, you definitely can't beat what's below.",
    },
  ],
  firstBoss: [
    {
      speaker: 'warden' as const,
      text: 'Here. This is where many end. The first test. The first real test.',
    },
    {
      speaker: 'warden' as const,
      text: "Everything before was preparation. This is what you've been preparing for.",
    },
    {
      speaker: 'warden' as const,
      text: "Don't hesitate. Don't doubt. Fight like everything depends on it.",
    },
    {
      speaker: 'warden' as const,
      text: 'Because it does.',
    },
  ],
  firstShrine: [
    {
      speaker: 'warden' as const,
      text: 'A shrine. Previous champions built these. Anchors of sanity in a place that erases identity.',
    },
    {
      speaker: 'warden' as const,
      text: 'They offer gifts. Gifts always have costs. Decide if the cost is worth it.',
    },
  ],
  firstMerchant: [
    {
      speaker: 'warden' as const,
      text: 'A trader. Yes, even here. The economy of the damned is... complicated.',
    },
    {
      speaker: 'warden' as const,
      text: "Buy what you need. But remember—gold you don't spend is gold you can't use if you die.",
    },
  ],
};

// Quick one-liner messages for first encounters (shown as toast messages)
export const FIRST_ELITE_MESSAGE = "An elite. They're stronger than the rest. Prepare yourself.";
export const FIRST_BOSS_MESSAGE = "The guardian of this floor. Everything before was practice. This is real.";
export const FIRST_SHRINE_MESSAGE = "A shrine. They offer power, but nothing here is free.";
export const FIRST_MERCHANT_MESSAGE = "A trader from beyond. Gold for power. Choose wisely.";
