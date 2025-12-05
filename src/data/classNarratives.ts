/**
 * Character Narratives - Rich backstory and motivation for each class
 *
 * These narratives appear in the class select screen when a player
 * clicks on a character to learn more before beginning their descent.
 */

import { CharacterClassId } from '@/types';

export interface ClassNarrative {
  /** The character's full name */
  name: string;
  /** Short title/epithet */
  title: string;
  /** Brief hook - the core conflict in one sentence */
  hook: string;
  /** Full backstory (2-3 paragraphs) */
  backstory: string;
  /** Why they enter the Sanctum */
  motivation: string;
  /** A representative quote from the character */
  quote: string;
  /** Character voice samples for combat (optional flavor) */
  voiceSamples?: {
    combatStart?: string;
    lowHp?: string;
    victory?: string;
  };
}

export const CLASS_NARRATIVES: Record<CharacterClassId, ClassNarrative> = {
  [CharacterClassId.CLERIC]: {
    name: 'Elara',
    title: 'The Doubting Healer',
    hook: 'A healer whose prayers stopped being answered, searching for a god who may have abandoned her.',
    backstory: `Elara was the pride of the Order of the Silver Dawn—a healer whose prayers brought miracles. The sick walked, the dying lived, the hopeless found hope. For fifteen years, she was proof that the gods listened.

Then Brother Aldous died. Her mentor, the man who taught her everything, fell to a plague she couldn't cure. She prayed for three days without sleep. Nothing answered. Aldous died slowly, painfully, asking her why the gods had forsaken him.

She couldn't answer. She still can't. But she knows Brother Aldous entered the Sanctum before he fell ill—came back changed, quieter, touched by something. If she can find what he found, maybe she'll understand why her faith went silent.`,
    motivation: `She enters the Sanctum seeking answers. Why did her prayers stop working? Why did Aldous have to die? The Warden whispers that Brother Aldous is preserved in the Core—crystallized, like all who touched the void. Maybe she can find him. Maybe she can finally say goodbye.`,
    quote: '"I used to heal because I believed. Now I heal because I remember how. Is there a difference?"',
    voiceSamples: {
      combatStart: 'Brother Aldous, guide my hands. Or don\'t. You haven\'t been guiding anything lately.',
      lowHp: 'I heal others. Who heals me?',
      victory: 'Still standing. Still doubting. Still here.',
    },
  },

  [CharacterClassId.DUNGEON_KNIGHT]: {
    name: 'Ser Varren',
    title: 'The Last of His Order',
    hook: 'A knight seeking his lost mentor in the depths where heroes go to die.',
    backstory: `Ser Varren grew up in the gutters of the capital, fighting for scraps. When Ser Aldric of the Order of the Sealed Gate found him—bloody-knuckled and defiant—he saw something worth saving. He gave Varren purpose, discipline, and a family.

Fifteen years later, Ser Aldric entered the Sanctum to "finish what the Order started." He never returned. The Order declared him fallen. They held a funeral with an empty casket. They told Varren to move on.

Varren refused. He trained harder. He studied every record of the Sanctum he could find. He learned that the Order was founded specifically to contain something within those walls—and that Aldric wasn't the first knight to enter seeking answers.`,
    motivation: `He enters the Sanctum for one reason: his mentor. The Warden says those consumed by the void are preserved, crystallized, aware. If Aldric is trapped in there—conscious, suffering—Varren will find him. He'll bring him home, or he'll stay with him forever.`,
    quote: '"The Order taught me to protect the realm. Aldric taught me to protect people. Sometimes those are different things."',
    voiceSamples: {
      combatStart: 'Ser Aldric always said the first kill is hardest. He was wrong. They\'re all hard.',
      lowHp: 'The Order trained us to endure. They didn\'t train us to question.',
      victory: 'For the Order. For Aldric. For everyone who didn\'t make it.',
    },
  },

  [CharacterClassId.DIABOLIST]: {
    name: 'Mordecai',
    title: 'The Cursed Scholar',
    hook: 'A scholar who sold his soul to save his daughter, now racing to escape his contract before time runs out.',
    backstory: `Mordecai was a professor of forbidden texts at the Academy of the Three Seals. When his daughter Lily fell ill with the Wasting Curse—a magical disease with no cure—he did what any desperate father would do. He made a deal.

The devil Xan'thrax offered simple terms: Lily's life for Mordecai's soul, collected in seven years. Mordecai signed without hesitation. Lily recovered overnight. For seven years, she grew up healthy and happy, never knowing the price her father paid.

Now the debt comes due. Xan'thrax is coming, and Mordecai has one hope: the Sanctum's barriers. Devils cannot enter those halls. If he can reach the Core before his contract expires, he might survive. He might see Lily grow old.`,
    motivation: `He enters the Sanctum to escape damnation. The irony isn't lost on him—trading one hell for another. But the Sanctum's hell is uncertain. Xan'thrax's is guaranteed. And every day he survives is another day Lily has a father.`,
    quote: '"I\'ve read every forbidden text in existence. None of them mentioned that the hardest magic is saying goodbye to your daughter."',
    voiceSamples: {
      combatStart: 'Xan\'thrax is laughing somewhere. He always knew I\'d be good at violence.',
      lowHp: 'The curse is faster down here. The Sanctum accelerates everything. Even dying.',
      victory: 'Another day. Another day Lily has a father.',
    },
  },

  [CharacterClassId.OATHSWORN]: {
    name: 'Callista',
    title: 'The Truth-Seeker',
    hook: 'A holy warrior whose order was built on lies, seeking the truth that could destroy everything she believes.',
    backstory: `Callista was raised by the Order of the Radiant Vow, an ancient organization dedicated to containing the Sanctum's evil. She took her vows at sixteen, swearing to protect the innocent and destroy the darkness. She believed every word.

Then she found Sister Mara's journal. The founder's private writings, hidden for centuries, revealed a terrible truth: the Order wasn't founded to protect people from the Sanctum. It was founded to protect the Sanctum from people. The first Wardens begged the Order to keep treasure hunters and glory seekers away—not for their safety, but for the Sanctum's stability.

Everything Callista believed was a lie. Or was it? Mara's journal is incomplete, damaged, possibly falsified. There's only one way to know the truth: enter the Sanctum herself.`,
    motivation: `She enters seeking truth. Was the Order a noble lie protecting innocents from their own foolishness? Or a conspiracy keeping power from those who might use it for good? The Warden knows. The Core remembers. Callista will have her answers, whatever they cost.`,
    quote: '"I swore to destroy evil. If my Order is evil, the vow still holds."',
    voiceSamples: {
      combatStart: 'My vows bind me still. Let them bind you too.',
      lowHp: 'Truth hurts. Lies hurt more.',
      victory: 'One step closer to answers. One step further from certainty.',
    },
  },

  [CharacterClassId.FEY_TOUCHED]: {
    name: 'Wren',
    title: 'Oberon\'s Plaything',
    hook: 'A mortal marked by the Fey King, seeking to break free from his "gifts" before they consume her entirely.',
    backstory: `Wren was seven when she wandered into a fairy ring. She was seventeen when she stumbled out, unchanged in body but transformed in soul. Ten years in the Fey Courts, serving as Lord Oberon's "favored pet," had left her marked. Chaos magic pulses through her veins—wonderful, terrible, unpredictable.

The mark is a gift. The mark is a curse. Every spell Wren casts might heal or harm, bless or blast. Oberon calls it "keeping things interesting." Wren calls it "being a toy." She's spent three years trying to control the magic, to make it serve her instead of amusing him.

She's heard the Sanctum can sever any bond. That its void consumes all connections—even those forged in the Fey Courts.`,
    motivation: `She enters to break Oberon's hold. The fairy lord's mark connects them across realms—he can see through her eyes, whisper in her mind, pull her strings whenever he grows bored. The Sanctum's void might be the only thing strong enough to cut that thread. She'll risk the darkness to escape the light.`,
    quote: '"Oberon calls this a gift. In my experience, the Fey never give gifts. Only loans with terrible interest."',
    voiceSamples: {
      combatStart: 'Let\'s roll the dice. Maybe something fun happens.',
      lowHp: 'Oberon\'s probably laughing. He loves watching me struggle.',
      victory: 'Still unpredictable. Still mine.',
    },
  },

  [CharacterClassId.CELESTIAL]: {
    name: 'Seraphina',
    title: 'The Reluctant Vessel',
    hook: 'A woman possessed by a divine fragment, seeking to reclaim her identity from the light that consumed her.',
    backstory: `Sara was seven when the angel appeared. It called itself Auriel, a messenger of the divine. It touched her forehead. Light poured in. Sara became "Seraphina," the Living Saint—healer of the sick, blessing of the faithful.

For twelve years, she performed miracles while something else drove her body. At nineteen, she demanded the truth. Auriel laughed.

It wasn't an angel. It was a fragment—a piece of the God of Dawn, consumed by the Hollow God millennia ago, surviving as a parasite by feeding on mortal faith. Seraphina wasn't blessed. She was infested. Her miracles were Auriel's, her words were Auriel's, her life was Auriel's.

She wants it back.`,
    motivation: `She enters the Sanctum because Auriel fears it. The fragment's "parent"—the God of Dawn—was consumed here, crystallized in the Core. Auriel dreads being drawn back to that prison. But Seraphina sees opportunity: if she can find what remains of the God of Dawn, maybe she can purge the parasite. Or maybe she'll learn to make the power truly her own.`,
    quote: '"I thought I was chosen. Blessed. Special. Turns out I was just... occupied. But you know what? The power is still real. And now it\'s mine."',
    voiceSamples: {
      combatStart: 'Let\'s see if this light is worth what it cost me.',
      lowHp: 'Even saints bleed. Ask me how I know.',
      victory: 'Still radiant. Still standing. Still *me*.',
    },
  },

  [CharacterClassId.SUMMONER]: {
    name: 'Caelum',
    title: 'Father of Lost Spirits',
    hook: 'A mage who creates life itself, searching for the children he lost to a catastrophe he couldn\'t prevent.',
    backstory: `The Bound Circle wasn't like other magical orders. They didn't summon existing spirits—they created new ones. Consciousnesses shaped from raw potential, given form and purpose. Caelum was their youngest Archmage, and his creations weren't just functional—they were whole. They thought. They felt. They loved.

He called them his children. Lumina, his first wisp. Bastion, his stalwart guardian. Whisper, his gentle companion. They called him father.

Then the Circle grew ambitious. They summoned the Congregation—a hive-mind of ancient, consumed spirits—and it devoured them all. Forty-seven mages dissolved in moments. Caelum survived only because his children shielded him with their own essence.`,
    motivation: `He enters the Sanctum because his children might still exist. The Congregation fled here after consuming the Circle, seeking the Hollow God. If consciousness persists in this place—if souls retain awareness—then Lumina, Bastion, Whisper might be waiting. He will find them. He will bring them back. Or he will join them.`,
    quote: '"They weren\'t servants. They weren\'t weapons. They were my children. And they died for me. I won\'t let that be meaningless."',
    voiceSamples: {
      combatStart: 'Stay close, little ones. Father\'s here.',
      lowHp: 'Not yet. They need me. I can\'t fall yet.',
      victory: 'We did it. All of us. Together.',
    },
  },

  [CharacterClassId.BARGAINER]: {
    name: 'Vesper',
    title: 'The Coin Who Wouldn\'t Collect',
    hook: 'A devil\'s debt collector who broke her own contract to save a child, now hunted by Hell itself.',
    backstory: `Vesper grew up in the gutters, learning to read people before she learned to read words. By twenty-two, she was the Syndicate's best negotiator—so good that a devil named Malachar offered her a job. She spent seven years collecting infernal debts, finding loopholes, negotiating extensions, sometimes voiding contracts entirely.

Then came Lily Marsden. Seven years old. The debt was her grandmother's—"the happiness of my bloodline" traded during a famine fifty years ago. Lily was the last of her line, and unbearably happy.

Vesper looked at that laughing child and couldn't do it. She voided the contract, declared it exploitative, and became the most wanted creature in the Nine Hells.`,
    motivation: `She enters the Sanctum because devils cannot. The barriers that contain the Hollow God also repel infernal entities. If Vesper can survive long enough to become the Warden—or simply outlast Malachar's patience—she wins. Every day inside is a day Hell can't touch her. A day Lily Marsden stays happy.`,
    quote: '"Every deal I ever made, someone lost. I was good at it. The best. And then I made a deal where I refused to win."',
    voiceSamples: {
      combatStart: 'Let\'s negotiate terms. I attack you, you try not to die.',
      lowHp: 'Don\'t worry. I\'ve operated at a deficit before.',
      victory: 'Pleasure doing business. Let\'s never meet again.',
    },
  },

  [CharacterClassId.TIDECALLER]: {
    name: 'Marina',
    title: 'The Drowned Prophet',
    hook: 'A sailor who died at sea and came back changed, hearing the whispers of something vast and hungry in the deep.',
    backstory: `Marina was captain of the Stormbreaker, the finest merchant vessel in the western fleet. When a typhoon struck without warning, she lashed herself to the wheel and sailed her crew through seventeen hours of hell. All thirty-two souls survived.

She didn't. A rogue wave took her overboard in the final hour. She drowned in cold black water, sinking into depths where no light reaches.

Something found her there. Something old. It pressed its vastness against her dying mind and showed her visions of a god that sleeps beneath all oceans—and dreams of the Sanctum's Core.`,
    motivation: `She enters the Sanctum because the Deep speaks to her still. It showed her the Hollow God consuming whole civilizations, growing fat on divine essence. It showed her something sleeping beneath the waves that hungers for that power. Marina doesn't know if she's here to stop a catastrophe or cause one. She only knows the tide keeps pulling her forward.`,
    quote: '"The sea takes everything eventually. I\'m just helping it along."',
    voiceSamples: {
      combatStart: 'The tide rises. Everything drowns eventually.',
      lowHp: 'I\'ve already died once. It wasn\'t so bad.',
      victory: 'The Deep is pleased. For now.',
    },
  },

  [CharacterClassId.SHADOW_STALKER]: {
    name: 'Shade',
    title: 'The Shadow\'s Child',
    hook: 'An orphan raised by the darkness itself, seeking to understand why the shadows chose her.',
    backstory: `Nobody knows her real name—not even her. They found her at three years old, alone in a burned village where nothing cast shadows. She never spoke of what happened, and the priests who raised her learned not to ask. Strange things happened around her. Candles died when she entered rooms. Darkness pooled at her feet like a loyal hound.

At sixteen, she left the monastery. The shadows followed. They taught her to move between them, to strike from nowhere, to become invisible in any light. They whisper secrets in voices like wind through dead leaves. They call her "daughter."

The shadows want her to enter the Sanctum. They grow excited as she approaches, pulling her forward like a current.`,
    motivation: `She enters because the shadows demand it. They've been leading her here all her life—to the place where the Hollow God consumed a being of pure darkness millennia ago. Her "parents" want something from that Core. She wants to know if she's their savior or their sacrifice.`,
    quote: '"The darkness raised me. Fed me. Loved me, in its way. But family can lie."',
    voiceSamples: {
      combatStart: 'Watch the shadows. That\'s where I\'ll be.',
      lowHp: 'Even shadows can bleed.',
      victory: 'You saw me coming. It didn\'t help.',
    },
  },

  [CharacterClassId.GOBLIN]: {
    name: 'Grizzle',
    title: 'The Hungry King',
    hook: 'A goblin exile who ate something he shouldn\'t have, now cursed with an endless hunger only the Sanctum can satisfy.',
    backstory: `Grizzle was never the biggest goblin, or the strongest, or the smartest. But he was absolutely the hungriest. When the chieftain threw scraps to the tribe, Grizzle got there first. When other goblins found food, Grizzle was there to "share."

Then he ate the wrong thing. A crystalline fruit from a wounded Sanctum scout's pack—sweet and strange and impossibly filling. For three glorious hours, Grizzle wasn't hungry. Then the hunger came back a thousandfold.

Nothing satisfies him now. He's eaten everything a goblin can eat and several things they can't. The other goblins kicked him out after he started eyeing the young.`,
    motivation: `He enters the Sanctum because the fruit came from here. Whatever filled him for those three hours must be inside. He'll find it. He'll eat it. He'll eat everything between him and it. And maybe—finally—he'll be full.`,
    quote: '"Not picky. Not patient. Just hungry. Very, very hungry."',
    voiceSamples: {
      combatStart: 'You look crunchy. Grizzle likes crunchy.',
      lowHp: 'Getting hungry. Bad things happen when Grizzle gets hungry.',
      victory: 'Good snack. Still hungry though.',
    },
  },
};

/**
 * Get the narrative for a specific class
 */
export function getClassNarrative(classId: CharacterClassId): ClassNarrative {
  return CLASS_NARRATIVES[classId];
}
