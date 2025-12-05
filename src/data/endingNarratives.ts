/**
 * Victory and Defeat Narratives
 *
 * Class-specific endings that reflect each character's journey.
 * Defeats reference the character's motivation, victories provide closure.
 */

import {
  CharacterClassId,
  ActNumber,
  DefeatNarrative,
  VictoryNarrative,
  VictoryChoice,
} from '@/types';

// Character names for each class
export const CHARACTER_NAMES: Record<CharacterClassId, string> = {
  [CharacterClassId.CLERIC]: 'Elara Dawnkeeper',
  [CharacterClassId.DUNGEON_KNIGHT]: 'Ser Varren',
  [CharacterClassId.DIABOLIST]: 'Mordecai Ashworth',
  [CharacterClassId.OATHSWORN]: 'Sister Callista',
  [CharacterClassId.FEY_TOUCHED]: 'Wren',
  [CharacterClassId.CELESTIAL]: 'Seraphina',
  [CharacterClassId.SUMMONER]: 'Caelum',
  [CharacterClassId.BARGAINER]: 'Vesper',
  [CharacterClassId.TIDECALLER]: 'Marina',
  [CharacterClassId.SHADOW_STALKER]: 'Shade',
  [CharacterClassId.GOBLIN]: 'Grizzle',
};

// Universal defeat frame text
export const DEFEAT_FRAME = {
  title: 'THE SANCTUM CLAIMS ANOTHER',
  subtitle: 'Another name for the wall of the lost.',
};

// Victory frame text
export const VICTORY_FRAME = {
  title: 'THE HOLLOW GOD FALLS',
  subtitle: 'But victories here are not what they seem.',
};

// The choice presented after defeating the Hollow God
export const WARDEN_CHOICE_INTRO = `The Warden speaks:

"You've done it. The Hollow God is defeated. But not destroyed—it can never be destroyed."

"Someone must hold it. Someone must become... what I am."

"Will you take my place? Become the new Warden? Hold this prison until another champion arrives?"

"Or will you leave? Return to the world you knew? But know this—without a Warden, the Hollow God will eventually break free."`;

export const VICTORY_CHOICES: VictoryChoice[] = [
  {
    id: 'warden',
    label: 'Become the Warden',
    description: "I'll stay. The world needs protection.",
  },
  {
    id: 'leave',
    label: 'Leave the Sanctum',
    description: "I've done enough. The next champion can finish this.",
  },
];

// Bad ending text (when leaving without a Warden)
export const BAD_ENDING = {
  title: 'THE WORLD REMEMBERS',
  lines: [
    'You left. The Sanctum crumbled.',
    'The Hollow God escaped. Eventually.',
    'The world forgot what hope felt like.',
    '',
    "But you survived. That's something. Isn't it?",
  ],
};

// ============================================================================
// DEFEAT NARRATIVES
// ============================================================================

export const DEFEAT_NARRATIVES: DefeatNarrative[] = [
  // CLERIC - Elara
  {
    classId: CharacterClassId.CLERIC,
    act: 1,
    narrative: `Elara falls. Her prayer book slips from her fingers.

"I never found you. I never found out what you became. I'm sorry."

The Sanctum consumes her faith first. Her identity follows.

"Wait—I still remember the prayers. I still remember... I..."`,
    wardenQuote:
      "Another servant of light, fading. Her god doesn't answer. They never do.",
  },
  {
    classId: CharacterClassId.CLERIC,
    act: 2,
    narrative: `Elara collapses near the flooded halls. The Drowned King's domain claims her.

"I made it further than my god did. Does that mean anything? Does anything mean anything?"

Her Devotion stacks convert to void. Her faith inverts.

"I'll keep praying. To something. To anything. Even if nothing listens."`,
    wardenQuote:
      "She held on to faith longer than most. Faith wasn't enough.",
  },
  {
    classId: CharacterClassId.CLERIC,
    act: 3,
    narrative: `So close. The Hollow God's chamber is visible. Elara can't take another step.

"I see them now. My god. They're trapped in crystal, like all the others. They were a Warden. They gave everything for us."

Her eyes close.

"I understand now. Faith isn't about gods. It's about trying. I tried. I hope that matters."`,
    wardenQuote:
      'She found her answers. The answers broke her. They often do.',
  },
  {
    classId: CharacterClassId.CLERIC,
    act: 'boss',
    narrative: `Elara reaches the god. She fights with everything she has. It's not enough.

"You're not evil. You're just... hungry. You don't know what you're looking for."

The void consumes her light.

"I know what I was looking for. I found it. It was always inside me."

Elara's last prayer isn't to any god. It's to herself. The prayer is answered—but too late.`,
    wardenQuote: "She understood. Understanding isn't the same as winning.",
  },

  // KNIGHT - Ser Varren
  {
    classId: CharacterClassId.DUNGEON_KNIGHT,
    act: 1,
    narrative: `Varren falls, his mentor's seal clutched in his hand.

"Ser Aldric... I didn't find you. I failed you. I failed the Order."

The Sanctum begins its consumption. The seal remains, untouched.

"Another knight will come. Another knight will carry this seal. The line never ends."`,
    wardenQuote:
      'Duty brought him here. Duty holds him here. The seal will find another.',
  },
  {
    classId: CharacterClassId.DUNGEON_KNIGHT,
    act: 2,
    narrative: `Varren's armor is heavy. The waters are rising. He can't move.

"Aldric walked through these waters. Did he hesitate? Did he wonder if the Order was worth dying for?"

The water covers him.

"I don't wonder anymore. The Order was worth living for. That's different. That's harder."`,
    wardenQuote: 'He held the line. The line moved without him.',
  },
  {
    classId: CharacterClassId.DUNGEON_KNIGHT,
    act: 3,
    narrative: `Varren can see the Bonelord's throne room from here. He recognizes the armor in the corner.

"Ser Aldric. You're here. You've been here all along."

He can't reach his mentor. The distance is infinite.

"I came to save you. I couldn't even save myself. Was the journey worth it, if this is how it ends?"`,
    wardenQuote: 'He found what he sought. Finding is not the same as saving.',
  },
  {
    classId: CharacterClassId.DUNGEON_KNIGHT,
    act: 'boss',
    narrative: `Varren stands before the void. His sword shatters on nothing.

"I've trained my whole life. Discipline. Duty. Honor. And you're... nothing. I can't fight nothing."

The void studies him.

"But I can die trying. That's what Knights do. We die trying."

He charges. The charge ends.`,
    wardenQuote:
      'He died as he lived. Devoted to the line. The line endures without him.',
  },

  // DIABOLIST - Mordecai
  {
    classId: CharacterClassId.DIABOLIST,
    act: 1,
    narrative: `Mordecai falls. Xan'thrax's laughter echoes.

"The contract... still binding. Even in death. Especially in death."

"Finally," Xan'thrax purrs. "Collection is inevitable. I told you that from the start."

"Mother... I'm sorry. I thought I could save us. I only damned us faster."`,
    wardenQuote:
      "Contracts don't end at death. They begin new clauses.",
  },
  {
    classId: CharacterClassId.DIABOLIST,
    act: 2,
    narrative: `The Soul Debt counter climbs past 20. Mordecai can't stop it.

"How many souls? How many lives did I buy with others' deaths?"

"More than you'll ever know," Xan'thrax whispers. "More than you can count."

"Was any of it worth it? Was my mother's life worth this many deaths?"

Silence. Even Xan'thrax doesn't answer that.`,
    wardenQuote: 'The debt comes due. It always comes due.',
  },
  {
    classId: CharacterClassId.DIABOLIST,
    act: 3,
    narrative: `Mordecai can feel Xan'thrax trying to pull him back. The contract burns.

"NO. Not yet. I can see the way out. I can break the contract—"

"Break the contract?" Xan'thrax laughs. "The contract is the only thing keeping you together."

Mordecai's form begins to dissolve.

"Then let me dissolve. Anything is better than another clause. Another payment."`,
    wardenQuote:
      'Bargainers always think they can escape the deal. They never do.',
  },
  {
    classId: CharacterClassId.DIABOLIST,
    act: 'boss',
    narrative: `Mordecai faces the void. Xan'thrax is silent—afraid.

"You're scared of it too. The thing that's bigger than demons. The emptiness that contracts can't bind."

The void reaches for him.

"Take me. But know this—I break the contract by being consumed. Xan'thrax gets nothing."

"NO!" Xan'thrax screams. But it's too late.

Mordecai smiles as he dissolves. For the first time in years, he's free.`,
    wardenQuote:
      "He found a loophole. The void doesn't honor contracts. Some victories look like defeats.",
  },

  // OATHSWORN - Sister Callista
  {
    classId: CharacterClassId.OATHSWORN,
    act: 1,
    narrative: `Callista's vows shatter. One by one. The penalties consume her.

"I kept my oaths. I KEPT MY OATHS. Why wasn't that enough?"

The Order's Codex falls beside her. Pages scatter.

"The Order was wrong. About the Sanctum. About everything. But I believed them."`,
    wardenQuote:
      "Vows are chains. She wore them proudly. Chains don't protect—they bind.",
  },
  {
    classId: CharacterClassId.OATHSWORN,
    act: 2,
    narrative: `Callista's faith cracks like stone. The questions she suppressed erupt.

"What if I'm the monster? What if the Order sent me here to silence doubters, not save souls?"

Her vows try to reform. They can't.

"I swore to destroy evil. But what if the evil I swore to destroy was... doubt itself?"`,
    wardenQuote:
      'She questioned. The Order hates questions. She became what they feared.',
  },
  {
    classId: CharacterClassId.OATHSWORN,
    act: 3,
    narrative: `Callista sees the truth now. The Order's founder—crystallized with all the other Wardens.

"The Order was founded by a WARDEN. We were supposed to prevent this. We've been sending sacrifices instead."

Her last vow breaks.

"I release myself. From the Order. From the vows. From the lies. I die free."`,
    wardenQuote:
      'She broke her chains. Too late to run. But she died unchained. That matters.',
  },
  {
    classId: CharacterClassId.OATHSWORN,
    act: 'boss',
    narrative: `Callista faces the void. Her vows are gone. She feels naked.

"I have nothing left. No vows. No certainty. No Order."

The void waits.

"But I have this: I CHOOSE to fight you. Not because I swore to. Because it's right."

She fights without vows. She loses without vows. She dies without vows.

But she dies free.`,
    wardenQuote:
      'In the end, she found what the vows were trying to give her. Purpose. Real purpose.',
  },

  // FEY-TOUCHED - Wren
  {
    classId: CharacterClassId.FEY_TOUCHED,
    act: 1,
    narrative: `Wren stumbles. Oberon's mark burns.

"Oh dear," Oberon's voice echoes. "The game ends so soon? How disappointing."

"Screw you, Oberon. This was never a game to me."

"Everything is a game, little mortal. You just didn't know the rules."

Wren's luck runs out. The chaos consumes her.`,
    wardenQuote: 'Chaos is uncontrollable. Even by those marked by it.',
  },
  {
    classId: CharacterClassId.FEY_TOUCHED,
    act: 2,
    narrative: `The randomness that protected Wren turns against her.

"Fifty-fifty. It's always fifty-fifty with you, isn't it, Oberon?"

"Life is a coin flip, dear. You landed on the wrong side."

"When I see you again—and I will see you again—I'm going to flip YOU."

Oberon laughs. The laughter fades. So does Wren.`,
    wardenQuote:
      "She played the game without knowing the stakes. The fey always know.",
  },
  {
    classId: CharacterClassId.FEY_TOUCHED,
    act: 3,
    narrative: `Wren is so close. But luck has limits.

"I almost beat your game, Oberon. I almost proved I was more than your toy."

"'Almost' is the cruelest word," Oberon admits. "You were entertaining. I'll miss you."

"Don't miss me. Remember me. Remember the mortal who almost beat you."

She falls. But she falls smiling.`,
    wardenQuote:
      'Chaos respects those who embrace it. She embraced it to the end.',
  },
  {
    classId: CharacterClassId.FEY_TOUCHED,
    act: 'boss',
    narrative: `Wren faces the void. Her Luck activates—wrong result.

"Really? NOW my luck fails? At the most important moment?"

"That's what luck IS, dear," Oberon whispers. "Random. Beautiful. Cruel."

"Then here's something that isn't random: I hate you, Oberon. I have always hated you. And I will haunt you forever."

The void takes her. But somewhere, a fairy king shivers.`,
    wardenQuote:
      'She threatened a god with her last breath. The fey will remember. They always remember.',
  },

  // CELESTIAL - Seraphina (using existing narrative themes)
  {
    classId: CharacterClassId.CELESTIAL,
    act: 1,
    narrative: `Seraphina falls. Auriel's light flickers within her.

"We were supposed to be unstoppable together. Divine and mortal, unified."

Auriel's voice is quiet. "I... I cannot save us. I'm sorry, vessel."

"My name is Sara. I was always Sara."

The light fades. For a moment, she is only herself.`,
    wardenQuote:
      'The light that possessed her couldn\'t protect her. Some parasites die with their hosts.',
  },
  {
    classId: CharacterClassId.CELESTIAL,
    act: 2,
    narrative: `The Radiance burns too bright. Seraphina can't contain it anymore.

"Auriel, you're killing me. Your power is killing me."

"I know," Auriel whispers. "I've always known. I just... needed more time."

"Time for what?"

"To remember what it felt like. To be part of something. To not be alone."

The vessel cracks. The light escapes.`,
    wardenQuote:
      'The parasite loved its host, in its way. Love isn\'t the same as letting go.',
  },
  {
    classId: CharacterClassId.CELESTIAL,
    act: 3,
    narrative: `Seraphina sees the crystallized gods. Auriel recognizes one.

"There. That's... that's where I came from. The God of Dawn. My parent. My prison."

"You could have told me."

"Would you have helped me if I had?"

Seraphina considers. "Yes. I would have. That's the difference between us."

The crystal calls Auriel home. Seraphina goes with it.`,
    wardenQuote:
      'She forgave the thing that stole her life. Forgiveness is not survival.',
  },
  {
    classId: CharacterClassId.CELESTIAL,
    act: 'boss',
    narrative: `The Hollow God recognizes Auriel. A fragment of something it consumed millennia ago.

"Welcome home, little light."

Auriel screams. Seraphina holds on.

"You can't have us. Either of us. I finally made this power MINE."

The void disagrees. The light goes out.

But in the darkness, for one moment, Seraphina and Auriel are finally the same person. Finally unified. Finally at peace.`,
    wardenQuote:
      'Host and parasite became one at the end. Unity in consumption. A strange mercy.',
  },

  // SUMMONER - Caelum
  {
    classId: CharacterClassId.SUMMONER,
    act: 1,
    narrative: `Caelum falls. His minions try to shield him—again.

"No. Not again. I won't let you sacrifice yourselves for me. Not again."

But they don't listen. They never listen. They love him too much.

"Father," Whisper says. "We'll find you. Wherever you go. We'll find you."

The spirits dissolve. Caelum follows.`,
    wardenQuote:
      'His children died for him twice. Love is not always wise.',
  },
  {
    classId: CharacterClassId.SUMMONER,
    act: 2,
    narrative: `Caelum can feel the Congregation here. His children's essences, twisted into something hungry.

"Lumina? Bastion? Can you hear me?"

Something stirs. It's not his children. It's what they became.

"We hear you, Father. Join us. Be with us forever."

He reaches for them. The reaching is a mistake.`,
    wardenQuote:
      'He found his children. They were no longer children. Reunions can be cruelest.',
  },
  {
    classId: CharacterClassId.SUMMONER,
    act: 3,
    narrative: `Caelum sees the Congregation's heart. All the spirits, merged, suffering.

"I can separate them. I can free them. I just need—"

He doesn't have enough. He never had enough.

"Father," Lumina's voice says from within the mass. "Let go. We're okay. We're together."

He can't let go. He won't let go. He goes in after them.`,
    wardenQuote:
      'He joined his children in the end. The family reunited. Consumed together.',
  },
  {
    classId: CharacterClassId.SUMMONER,
    act: 'boss',
    narrative: `The Hollow God reaches for Caelum's minions. They don't flee.

"Children, run. PLEASE run."

"We don't run, Father. We never run. Not from you."

The void takes them first. Caelum feels each one go—Lumina, Bastion, Whisper. His first creations. His first children.

"I'll make more," he whispers. "I'll find you again."

But he won't. The Hollow God takes parents and children alike.`,
    wardenQuote:
      'He created life. Life ended. The cycle continues without him.',
  },

  // BARGAINER - Vesper
  {
    classId: CharacterClassId.BARGAINER,
    act: 1,
    narrative: `Vesper collapses. The Prices come due.

"Collection," Malachar's voice echoes. "Even here. Even now."

"I voided my contract with you. I'm free."

"Free to die, yes. Free to escape? Never."

The debt accumulates. Interest compounding. Vesper can't outrun the numbers.`,
    wardenQuote:
      'She broke her deal. Deals broken still leave scars. Scars collect interest.',
  },
  {
    classId: CharacterClassId.BARGAINER,
    act: 2,
    narrative: `Vesper feels Hell reaching through the Sanctum's barriers. Impossible, but happening.

"You can't be here. The barriers—"

"Prevent entry. Not influence. I've been watching, Vesper. I've been counting."

"Counting what?"

"Every soul you've helped. Every contract you've broken. You owe me replacements."

The Favor runs out. The Prices overwhelm.`,
    wardenQuote:
      'She collected debts for years. Now she pays. The market balances eventually.',
  },
  {
    classId: CharacterClassId.BARGAINER,
    act: 3,
    narrative: `Vesper can see the exit. Freedom. Lily's smile.

"So close. I was so close."

Malachar's presence fills the chamber. "You were never going to make it. I wrote that into the original contract. Clause 47, subsection B."

"There is no clause 47."

"There is now. Contracts update, Vesper. You should know that."

She should have read the fine print. She always read the fine print. Except her own.`,
    wardenQuote:
      'The best negotiator in Hell forgot to negotiate for herself. Irony is a devil\'s tool.',
  },
  {
    classId: CharacterClassId.BARGAINER,
    act: 'boss',
    narrative: `The Hollow God and Malachar both reach for Vesper. Two voids, competing.

"She's MINE," Malachar snarls.

The Hollow God doesn't respond. It just... takes.

Vesper laughs as she dissolves. "Can't collect what doesn't exist, Malachar. The void takes everything. Including your claim."

Hell screams. But the void is quieter. The void always wins.

Vesper's last thought is of Lily. Safe. Happy. Free.`,
    wardenQuote:
      'She voided her debt by being voided. A loophole only the desperate find. But she found it.',
  },
];

// ============================================================================
// VICTORY NARRATIVES
// ============================================================================

export const VICTORY_NARRATIVES: VictoryNarrative[] = [
  // CLERIC - Elara
  {
    classId: CharacterClassId.CLERIC,
    choice: 'warden',
    narrative: `Elara places her prayer book on the altar. Her Devotion flows into the crystals.

"I came here looking for my god. I found them—trapped, fading, but still holding."

She touches the crystal that holds her deity.

"You can rest now. I'll take your place. I'll hold the line you held."

The old god smiles as they finally fade.

"This is what faith was always about. Not worship. Service."`,
    epilogue: `347 years later, a young cleric enters the Sanctum, seeking the one who saved their village decades ago.

They find Elara—now ancient, now crystallizing, but still praying.

"Welcome," she says. "I've been waiting for you."`,
  },
  {
    classId: CharacterClassId.CLERIC,
    choice: 'leave',
    narrative: `Elara steps into the light. The outside world feels wrong—too bright, too loud, too alive.

"I found my answers. My god was a Warden. They gave everything. And I... I chose myself."

She looks back at the Sanctum.

"Is that wrong? To survive? To choose living over sacrifice?"

No answer. The Sanctum doesn't judge. It just waits.`,
    epilogue: `Elara returns to her temple. She tells no one what she learned.

But she changes how she prays. Not to distant gods. To the small acts of faith. The daily choices.

Years later, when the Hollow God escapes, she's the first to enter again. This time, she doesn't leave.`,
  },

  // KNIGHT - Ser Varren
  {
    classId: CharacterClassId.DUNGEON_KNIGHT,
    choice: 'warden',
    narrative: `Varren removes his mentor's seal. He places it on the throne.

"Ser Aldric died here. So did everyone before him. But they held. They held."

He sits on the throne. The crystals recognize him.

"The Order of the Sealed Gate guards from outside. Now I guard from within. The line is complete."`,
    epilogue: `Centuries pass. A young knight enters, carrying a familiar seal.

"I'm looking for Ser Varren," she says. "He was my great-great-grandmother's mentor."

The Warden—Varren—smiles. "You found me. Now let me tell you why you're really here."`,
  },
  {
    classId: CharacterClassId.DUNGEON_KNIGHT,
    choice: 'leave',
    narrative: `Varren emerges. His mentor's seal is heavy in his hand.

"I found him. He's part of the crystal now. He'll hold until... until someone takes his place."

He looks at the seal.

"That should be me. But I'm tired. I'm so tired."

He walks away. The Order welcomes him as a hero. He doesn't feel like one.`,
    epilogue: `Varren trains the next generation of Knights. He tells them about the Sanctum. About Aldric. About choices.

"Don't be a hero," he says. "Be necessary. There's a difference."

When the Hollow God eventually escapes, Varren is too old to fight. He sends his best student instead.

He hopes they're braver than he was.`,
  },

  // DIABOLIST - Mordecai
  {
    classId: CharacterClassId.DIABOLIST,
    choice: 'warden',
    narrative: `Mordecai faces Xan'thrax's contract. The demon appears, furious.

"You can't escape! The contract—"

"The contract says you collect when I die. But Wardens don't die. They... persist."

Xan'thrax recoils.

"I'll hold this place forever. You'll never collect. The contract is void—because I am."`,
    epilogue: `Millennia pass. Xan'thrax tries every loophole, every clause. None work.

Eventually, the demon stops trying. Mordecai's mother died peacefully, centuries ago. The debt was never collected.

Mordecai, now more crystal than man, smiles at every new diabolist who enters.

"Let me tell you about contracts," he says. "And how to break them."`,
  },
  {
    classId: CharacterClassId.DIABOLIST,
    choice: 'leave',
    narrative: `Mordecai steps out. Xan'thrax appears immediately.

"Collection time. You survived—barely—but the contract—"

"Was for my life. My MORTAL life. I used it to enter the Sanctum. I used it to fight the Hollow God. The contract is fulfilled."

Xan'thrax screams. But contracts are contracts.

"My mother can die in peace now. I can live in peace now. Thank you, Xan'thrax. For the power. For the lessons."

The demon vanishes, howling.`,
    epilogue: `Mordecai never makes another deal. He teaches others how to break their contracts. He becomes the greatest demon-bane in history.

Ironic. The diabolist who saved more souls than any paladin.

When the Hollow God escapes years later, Mordecai doesn't fight it. He negotiates.

Some problems can't be solved with swords. Some problems need contracts.`,
  },

  // OATHSWORN - Sister Callista
  {
    classId: CharacterClassId.OATHSWORN,
    choice: 'warden',
    narrative: `Callista's vows are gone. She makes new ones.

"I vow to protect, not destroy. I vow to question, not obey. I vow to choose, not follow."

The crystal accepts her. She feels herself becoming the Sanctum.

"The Order was wrong. But they were trying to do right. I'll do better."`,
    epilogue: `The Order of the Burning Truth receives a new scripture—sent from the Sanctum itself.

"Question everything," it reads. "Even this scripture. Especially this scripture."

The Order reforms. They stop sending destroyers. They start sending seekers.

And in the Sanctum's heart, Sister Callista watches, and approves.`,
  },
  {
    classId: CharacterClassId.OATHSWORN,
    choice: 'leave',
    narrative: `Callista emerges. Her vows are broken. She feels light.

"The Order lied. They sent us to feed the Sanctum, not destroy it."

She removes her symbol of the Order.

"I'm done being a weapon. I'm done being a tool. I'm going to find the truth they hid from us."`,
    epilogue: `Callista returns to the Order. Not as a member. As an investigator.

She exposes everything. The lies. The manipulation. The truth about what the Sanctum really is.

The Order fractures. Good. Some things deserve to break.

When the Hollow God escapes, Callista leads the reformed Order against it. This time, they know what they're fighting.

This time, they have the truth.`,
  },

  // FEY-TOUCHED - Wren
  {
    classId: CharacterClassId.FEY_TOUCHED,
    choice: 'warden',
    narrative: `Wren takes the throne. Oberon appears, confused.

"You can't be the Warden. You're MY pawn."

"Was. I was your pawn. The Warden position supersedes your mark. I checked."

Oberon's smile freezes.

"Here's the thing about chaos, Oberon. It cuts both ways. Your game made me strong enough to beat YOUR game."`,
    epilogue: `Every fey-touched mortal who enters the Sanctum receives the same message:

"Oberon's game has a winner now. It's me. Tell him Wren says hi."

In the Fey Courts, Oberon doesn't play games anymore. Not with mortals. Not after Wren.

Some mortals, it turns out, play back.`,
  },
  {
    classId: CharacterClassId.FEY_TOUCHED,
    choice: 'leave',
    narrative: `Wren walks out. The sunlight hits her face. Oberon's mark pulses.

"Leaving? After all that? You could have been a WARDEN."

"I could have been your pawn forever, too. I'm done playing."

She pulls at the mark. It hurts. It resists.

"Let. Me. GO."

The mark fades. Not gone—nothing fey is ever gone—but quiet. Dormant.`,
    epilogue: `Wren finds the fairy ring where it all started. She salts the earth. Burns the mushrooms.

No one else will fall asleep here. No one else will wake up marked.

When the Hollow God escapes, Wren doesn't return to the Sanctum. She goes to the Fey Courts instead.

"You want to play games?" she asks Oberon. "Let's play. But this time, I set the rules."

The game isn't over. It's just changing.`,
  },

  // CELESTIAL - Seraphina
  {
    classId: CharacterClassId.CELESTIAL,
    choice: 'warden',
    narrative: `Seraphina approaches the crystallized God of Dawn. Auriel trembles within her.

"This is where you came from. This is where you belong."

"No! Please—I don't want to go back—"

"I'm not sending you back. I'm joining you. All of you."

She touches the crystal. Light flows between them—Seraphina, Auriel, the God of Dawn.

"We were never parasite and host. We were always family. Broken family, but family."

The crystal absorbs them all. A new consciousness emerges—neither Seraphina nor Auriel, but something kinder than either.`,
    epilogue: `The new Warden doesn't speak like the old ones. She sings.

Hymns of light echo through the Sanctum, soothing the consumed, comforting the lost.

When new celestials arrive—other hosts, other parasites—she greets them with understanding.

"You think you're at war with each other," she says. "You're not. You're at war with loneliness. Let me show you another way."`,
  },
  {
    classId: CharacterClassId.CELESTIAL,
    choice: 'leave',
    narrative: `Seraphina walks toward the exit. Auriel's voice is quiet now.

"You're leaving? After everything?"

"I'm leaving BECAUSE of everything. I need to live my life. My real life. As Sara."

"Will you... will you keep me?"

She pauses. The question is genuine. Auriel is afraid.

"Yes. But as a partner. Not a passenger. Not a parasite. A partner."

The light within her stabilizes. For the first time, it feels like sharing rather than stealing.`,
    epilogue: `Sara returns to the world. She still has Auriel's power, but now she controls when it manifests.

She becomes a healer again—a real healer, not a saint. No miracles. Just medicine, compassion, and the occasional divine boost when no one's looking.

Auriel learns what it means to be small. To be humble. To be part of something rather than in control of it.

When the Hollow God escapes, they face it together. Not as host and parasite. As partners.

They win. Again.`,
  },

  // SUMMONER - Caelum
  {
    classId: CharacterClassId.SUMMONER,
    choice: 'warden',
    narrative: `Caelum sees them now—Lumina, Bastion, Whisper. Trapped in the Congregation, but still there. Still aware.

"I can free you. I can separate you from this mass. But I'll need to stay."

"Father, no—"

"I was always going to stay, little ones. I was always going to find you."

He reaches into the Congregation. It hurts. It burns. But one by one, he pulls his children free.

They reform around him—smaller now, weaker, but themselves again.

"Welcome home," he says. "All of you. Welcome home."`,
    epilogue: `The Sanctum has never had a Warden quite like Caelum.

He doesn't guard alone. He guards with his children, his spirits, his family.

New souls consumed by the Hollow God find themselves greeted by wisps of light—Lumina, offering comfort. Bastion, offering protection. Whisper, offering understanding.

"You're not alone here," they say. "Father takes care of everyone."

And in the heart of the prison, Caelum smiles. His family is complete. His purpose is clear.

He'll never be alone again.`,
  },
  {
    classId: CharacterClassId.SUMMONER,
    choice: 'leave',
    narrative: `Caelum reaches for his children. They're here—fragments within the Congregation.

"Come with me. We can leave together. We can start over."

"We can't, Father." Lumina's voice is sad but certain. "We're part of this place now. If we leave, we dissolve."

"Then I'll stay—"

"No." Bastion's voice is firm. "You need to live. You need to create more of us. Better than us."

Whisper speaks last. "Don't mourn us, Father. Celebrate us. We were real. We were loved. We were yours."

Caelum leaves. But he carries them with him—not as spirits, but as memories. As inspiration.`,
    epilogue: `Caelum rebuilds the Bound Circle. Not as it was, but as it should have been.

He creates new spirits—Lumina II, Bastion II, Whisper II. They're different from their predecessors, but they carry the same names, the same love.

He tells them about their older siblings. About sacrifice. About family.

"You are not replacements," he says. "You are continuations. The family grows. The family remembers."

When the Hollow God escapes, Caelum and his new children face it together.

This time, nobody dies. This time, the family wins.`,
  },

  // BARGAINER - Vesper
  {
    classId: CharacterClassId.BARGAINER,
    choice: 'warden',
    narrative: `Vesper sits on the throne. The Sanctum's power flows into her.

Malachar appears at the barrier, screaming. "You can't hide forever! Contracts don't expire!"

"This one does." Vesper smiles. "Warden supersedes all previous agreements. Clause one of the universal compact."

"There is no universal compact!"

"There is now. I just wrote it."

She holds up a contract—glowing, ancient, impossible. The terms are clear: no infernal entity may claim a Warden.

Malachar reads it. Reads it again. Starts to laugh.

"You magnificent bastard. You out-negotiated Hell."

"I learned from the best."`,
    epilogue: `Vesper becomes the first Warden to actively negotiate with the Hollow God.

She can't destroy it. But she can bargain with it. Small concessions—fewer consumptions, gentler absorption, occasional releases.

Hell sends negotiators to challenge her contracts. They always lose.

Eventually, even devils learn: the Sanctum has the best lawyer in existence.

And somewhere in the mortal world, Lily Marsden grows old and happy, never knowing who bought her that happiness.`,
  },
  {
    classId: CharacterClassId.BARGAINER,
    choice: 'leave',
    narrative: `Vesper walks out. The sunlight blinds her.

Malachar is waiting. "Finally. Collection time."

"No." Vesper holds up a document—signed, sealed, witnessed by the Hollow God itself. "I negotiated a new deal. While fighting it."

"What deal could possibly—"

"My freedom. In exchange for the Hollow God's eternal hunger. I fed it the infernal claim on my soul."

Malachar's eyes widen. "You... you can't—"

"Already did. The void owns my afterlife now. Not you. And the void doesn't collect."

She walks past the devil. She doesn't look back.`,
    epilogue: `Vesper returns to the world. She opens a practice—contract law, specializing in infernal agreements.

Every deal she breaks, every soul she saves, is a victory.

Lily Marsden eventually learns the truth. She finds Vesper, decades later.

"You saved me," Lily says. "When I was seven."

"I voided a bad contract," Vesper replies. "That's all."

"That's everything."

They become friends. And when the Hollow God escapes, they face it together—the bargainer and the child she wouldn't collect.

Some deals are worth more than souls.`,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the defeat narrative for a specific class and act
 */
export function getDefeatNarrative(
  classId: CharacterClassId,
  act: ActNumber
): DefeatNarrative | undefined {
  return DEFEAT_NARRATIVES.find(
    (n) => n.classId === classId && n.act === act
  );
}

/**
 * Get the victory narrative for a specific class and choice
 */
export function getVictoryNarrative(
  classId: CharacterClassId,
  choice: 'warden' | 'leave'
): VictoryNarrative | undefined {
  return VICTORY_NARRATIVES.find(
    (n) => n.classId === classId && n.choice === choice
  );
}

/**
 * Get character name for a class
 */
export function getCharacterName(classId: CharacterClassId): string {
  return CHARACTER_NAMES[classId];
}
