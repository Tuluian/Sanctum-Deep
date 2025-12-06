/**
 * Story Cards Data
 *
 * Brief narrative moments that appear between rooms.
 * Based on story-cards-system.md
 */

import { StoryCard } from '@/types/narrativeEvents';
import { CharacterClassId } from '@/types/index';

// =============================================================================
// ACT 1 — THE ENTRANCE HALLS
// =============================================================================

// Warden Whispers - Act 1
const ACT1_WARDEN_CARDS: StoryCard[] = [
  {
    id: 'warden_act1_first',
    trigger: { type: 'progress', value: 1 },
    act: 1,
    speaker: 'warden',
    text: `**Lyra:** *"You made it past the threshold. That's more than most. The Sanctum is watching you now. So am I."*`,
    priority: 100,
    showOnce: true,
  },
  {
    id: 'warden_act1_mid',
    trigger: { type: 'progress', value: 5 },
    act: 1,
    speaker: 'warden',
    text: `**Lyra:** *"Lord Vexal was a hero once. Remember that when you face him. We all were, once."*`,
    priority: 90,
    showOnce: true,
  },
  {
    id: 'warden_act1_pre_boss',
    trigger: { type: 'pre_boss', bossId: 'bonelord' },
    act: 1,
    speaker: 'warden',
    text: `**Lyra:** *"He's close. I can feel him stirring. Three hundred years of pride, waiting on a throne of bones."*

*"End his suffering, champion. He was a hero once."*`,
    priority: 100,
    showOnce: true,
  },
  {
    id: 'warden_act1_post_boss',
    trigger: { type: 'post_boss', bossId: 'bonelord' },
    act: 1,
    speaker: 'warden',
    text: `**Lyra:** *"It's done. Lord Vexal of the Crimson Banner... rest now."*

*"The path to Act 2 opens. The Drowned King awaits. He was my friend, you know. Before."*`,
    priority: 100,
    showOnce: true,
  },
];

// Environmental Observations - Act 1
const ACT1_ENVIRONMENT_CARDS: StoryCard[] = [
  {
    id: 'env_act1_room2',
    trigger: { type: 'progress', value: 2 },
    act: 1,
    speaker: 'environment',
    text: `*The stones here remember being carved. Names etched into every surface, too worn to read.*`,
    priority: 30,
    showOnce: true,
  },
  {
    id: 'env_act1_room4',
    trigger: { type: 'progress', value: 4 },
    act: 1,
    speaker: 'environment',
    text: `*Tapestries line the walls. The threads show battles, victories, crowns. All faded. All forgotten.*`,
    priority: 30,
    showOnce: true,
  },
  {
    id: 'env_act1_room6',
    trigger: { type: 'progress', value: 6 },
    act: 1,
    speaker: 'environment',
    text: `*The torches aren't lit. The light comes from somewhere else. From everywhere else.*`,
    priority: 30,
    showOnce: true,
  },
  {
    id: 'env_act1_room8',
    trigger: { type: 'progress', value: 8 },
    act: 1,
    speaker: 'environment',
    text: `*Bones in the corners. Not piled—arranged. Someone mourned them once.*`,
    priority: 30,
    showOnce: true,
  },
];

// Lore Fragments - Act 1 (Random)
const ACT1_LORE_CARDS: StoryCard[] = [
  {
    id: 'lore_act1_toy',
    trigger: { type: 'random', chance: 0.15 },
    act: 1,
    speaker: 'lore',
    text: `*A child's toy, preserved in crystal. The Sanctum remembers strange things.*`,
    priority: 10,
  },
  {
    id: 'lore_act1_carving',
    trigger: { type: 'random', chance: 0.15 },
    act: 1,
    speaker: 'lore',
    text: `*Carved into the wall: "MIRA WAS HERE. MIRA IS GONE." Below it, fresher: "SO WAS I."*`,
    priority: 10,
  },
  {
    id: 'lore_act1_armor',
    trigger: { type: 'random', chance: 0.15 },
    act: 1,
    speaker: 'lore',
    text: `*A suit of armor, empty, still standing at attention. Still guarding a door that no longer exists.*`,
    priority: 10,
  },
  {
    id: 'lore_act1_symbol',
    trigger: { type: 'random', chance: 0.15 },
    act: 1,
    speaker: 'lore',
    text: `*The Warden's symbol appears everywhere. A circle containing nothing. A door that never opens.*`,
    priority: 10,
  },
  {
    id: 'lore_act1_flowers',
    trigger: { type: 'random', chance: 0.15 },
    act: 1,
    speaker: 'lore',
    text: `*Flowers grow here. Impossible. Nothing should grow here. But they do.*`,
    priority: 10,
  },
];

// Cleric Character Thoughts - Act 1
const ACT1_CLERIC_CARDS: StoryCard[] = [
  {
    id: 'cleric_act1_first_blood',
    trigger: { type: 'first_blood' },
    act: 1,
    classId: CharacterClassId.CLERIC,
    speaker: 'character',
    text: `*Brother Aldous, guide my hands. Or don't. You haven't been guiding anything lately, have you?*`,
    priority: 80,
    showOnce: true,
  },
  {
    id: 'cleric_act1_low_hp',
    trigger: { type: 'health_threshold', hpThreshold: 0.3 },
    act: 1,
    classId: CharacterClassId.CLERIC,
    speaker: 'character',
    text: `*I heal others. Who heals me? The silence where my prayers used to go.*`,
    priority: 70,
  },
  {
    id: 'cleric_act1_pre_boss',
    trigger: { type: 'pre_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.CLERIC,
    speaker: 'character',
    text: `*A warrior who sought immortality. Did he pray, too? Did something answer?*`,
    priority: 85,
    showOnce: true,
  },
  {
    id: 'cleric_act1_post_boss',
    trigger: { type: 'post_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.CLERIC,
    speaker: 'character',
    text: `*He forgot his purpose. I'm looking for mine. Are we really so different?*`,
    priority: 85,
    showOnce: true,
  },
];

// Knight Character Thoughts - Act 1
const ACT1_KNIGHT_CARDS: StoryCard[] = [
  {
    id: 'knight_act1_first_blood',
    trigger: { type: 'first_blood' },
    act: 1,
    classId: CharacterClassId.DUNGEON_KNIGHT,
    speaker: 'character',
    text: `*First blood. Ser Aldric always said: "The first kill is the hardest." He was wrong. They're all hard.*`,
    priority: 80,
    showOnce: true,
  },
  {
    id: 'knight_act1_low_hp',
    trigger: { type: 'health_threshold', hpThreshold: 0.3 },
    act: 1,
    classId: CharacterClassId.DUNGEON_KNIGHT,
    speaker: 'character',
    text: `*The Order trained us to endure. They didn't train us to question. Maybe they should have.*`,
    priority: 70,
  },
  {
    id: 'knight_act1_pre_boss',
    trigger: { type: 'pre_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.DUNGEON_KNIGHT,
    speaker: 'character',
    text: `*Lord Vexal trained with the Order. These techniques I'm using—he invented some of them.*`,
    priority: 85,
    showOnce: true,
  },
  {
    id: 'knight_act1_post_boss',
    trigger: { type: 'post_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.DUNGEON_KNIGHT,
    speaker: 'character',
    text: `*He remembered the stance. At the end, he recognized me as a Knight. Was that comfort or cruelty?*`,
    priority: 85,
    showOnce: true,
  },
];

// Diabolist Character Thoughts - Act 1
const ACT1_DIABOLIST_CARDS: StoryCard[] = [
  {
    id: 'diabolist_act1_first_blood',
    trigger: { type: 'first_blood' },
    act: 1,
    classId: CharacterClassId.DIABOLIST,
    speaker: 'character',
    text: `*Xan'thrax is laughing somewhere. He always knew I'd be good at violence.*`,
    priority: 80,
    showOnce: true,
  },
  {
    id: 'diabolist_act1_low_hp',
    trigger: { type: 'health_threshold', hpThreshold: 0.3 },
    act: 1,
    classId: CharacterClassId.DIABOLIST,
    speaker: 'character',
    text: `*The curse is faster down here. The Sanctum accelerates everything. Even dying.*`,
    priority: 70,
  },
  {
    id: 'diabolist_act1_pre_boss',
    trigger: { type: 'pre_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.DIABOLIST,
    speaker: 'character',
    text: `*A king who bargained for eternity. Sound familiar? At least he got what he paid for.*`,
    priority: 85,
    showOnce: true,
  },
  {
    id: 'diabolist_act1_post_boss',
    trigger: { type: 'post_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.DIABOLIST,
    speaker: 'character',
    text: `*Three hundred years of immortality, and he forgot why he wanted it. Note to self: have an exit strategy.*`,
    priority: 85,
    showOnce: true,
  },
];

// Oathsworn Character Thoughts - Act 1
const ACT1_OATHSWORN_CARDS: StoryCard[] = [
  {
    id: 'oathsworn_act1_first_blood',
    trigger: { type: 'first_blood' },
    act: 1,
    classId: CharacterClassId.OATHSWORN,
    speaker: 'character',
    text: `*The Order says these souls are prisoners. I'm starting to think they're refugees.*`,
    priority: 80,
    showOnce: true,
  },
  {
    id: 'oathsworn_act1_low_hp',
    trigger: { type: 'health_threshold', hpThreshold: 0.3 },
    act: 1,
    classId: CharacterClassId.OATHSWORN,
    speaker: 'character',
    text: `*"Pain is truth made manifest." That's what Sister Mara wrote. Easy to say when you're not bleeding.*`,
    priority: 70,
  },
  {
    id: 'oathsworn_act1_pre_boss',
    trigger: { type: 'pre_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.OATHSWORN,
    speaker: 'character',
    text: `*He ruled here. Another kind of Warden. The Order says they're all the same—monsters guarding a cage.*`,
    priority: 85,
    showOnce: true,
  },
  {
    id: 'oathsworn_act1_post_boss',
    trigger: { type: 'post_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.OATHSWORN,
    speaker: 'character',
    text: `*He thanked me. At the end. Monsters don't thank their killers. What if the Order is wrong about everything?*`,
    priority: 85,
    showOnce: true,
  },
];

// Fey-Touched Character Thoughts - Act 1
const ACT1_FEY_TOUCHED_CARDS: StoryCard[] = [
  {
    id: 'fey_act1_first_blood',
    trigger: { type: 'first_blood' },
    act: 1,
    classId: CharacterClassId.FEY_TOUCHED,
    speaker: 'character',
    text: `*Oberon is watching. I can feel him giggling. This is all a game to him.*`,
    priority: 80,
    showOnce: true,
  },
  {
    id: 'fey_act1_low_hp',
    trigger: { type: 'health_threshold', hpThreshold: 0.3 },
    act: 1,
    classId: CharacterClassId.FEY_TOUCHED,
    speaker: 'character',
    text: `*"Good luck, little mortal." His voice, in my head, laughing at my blood.*`,
    priority: 70,
  },
  {
    id: 'fey_act1_pre_boss',
    trigger: { type: 'pre_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.FEY_TOUCHED,
    speaker: 'character',
    text: `*A skeleton king? Sure. Why not. Nothing in my life makes sense anymore. Why should death?*`,
    priority: 85,
    showOnce: true,
  },
  {
    id: 'fey_act1_post_boss',
    trigger: { type: 'post_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.FEY_TOUCHED,
    speaker: 'character',
    text: `*He was someone's lord. Someone's hero. And Oberon threw me at him like a coin into a well.*

*At least the coin sank. Spite is fuel.*`,
    priority: 85,
    showOnce: true,
  },
];

// Celestial Character Thoughts - Act 1
const ACT1_CELESTIAL_CARDS: StoryCard[] = [
  {
    id: 'celestial_act1_first_blood',
    trigger: { type: 'first_blood' },
    act: 1,
    classId: CharacterClassId.CELESTIAL,
    speaker: 'character',
    text: `*Auriel is excited. It likes the violence. That's... concerning.*`,
    priority: 80,
    showOnce: true,
  },
  {
    id: 'celestial_act1_low_hp',
    trigger: { type: 'health_threshold', hpThreshold: 0.3 },
    act: 1,
    classId: CharacterClassId.CELESTIAL,
    speaker: 'character',
    text: `*"We're hurt, little host. We should be more careful. I don't want a new vessel."*

*Always "we." Never "you."*`,
    priority: 70,
  },
  {
    id: 'celestial_act1_pre_boss',
    trigger: { type: 'pre_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.CELESTIAL,
    speaker: 'character',
    text: `*He sought immortality. Auriel offers something similar. Eternal existence as someone else's battery.*`,
    priority: 85,
    showOnce: true,
  },
  {
    id: 'celestial_act1_post_boss',
    trigger: { type: 'post_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.CELESTIAL,
    speaker: 'character',
    text: `*The light burned him. MY light. Not Auriel's—mine. I'm starting to tell the difference.*`,
    priority: 85,
    showOnce: true,
  },
];

// Summoner Character Thoughts - Act 1
const ACT1_SUMMONER_CARDS: StoryCard[] = [
  {
    id: 'summoner_act1_first_blood',
    trigger: { type: 'first_blood' },
    act: 1,
    classId: CharacterClassId.SUMMONER,
    speaker: 'character',
    text: `*My wisps are holding together. This place—it makes them more solid. More real.*`,
    priority: 80,
    showOnce: true,
  },
  {
    id: 'summoner_act1_low_hp',
    trigger: { type: 'health_threshold', hpThreshold: 0.3 },
    act: 1,
    classId: CharacterClassId.SUMMONER,
    speaker: 'character',
    text: `*They throw themselves in front of me. I didn't ask them to. I can't stop them.*

*Is this love or programming? Does it matter?*`,
    priority: 70,
  },
  {
    id: 'summoner_act1_pre_boss',
    trigger: { type: 'pre_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.SUMMONER,
    speaker: 'character',
    text: `*He commands dead soldiers. Memories given form. My children are different. They're new. Fresh. Right?*`,
    priority: 85,
    showOnce: true,
  },
  {
    id: 'summoner_act1_post_boss',
    trigger: { type: 'post_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.SUMMONER,
    speaker: 'character',
    text: `*His soldiers faded when he died. They only existed because he remembered them.*

*My wisps—when I forget them, what happens to them?*`,
    priority: 85,
    showOnce: true,
  },
];

// Bargainer Character Thoughts - Act 1
const ACT1_BARGAINER_CARDS: StoryCard[] = [
  {
    id: 'bargainer_act1_first_blood',
    trigger: { type: 'first_blood' },
    act: 1,
    classId: CharacterClassId.BARGAINER,
    speaker: 'character',
    text: `*Malachar is screaming at the barriers. I can feel it. He's so close, and so helpless.*

*Good.*`,
    priority: 80,
    showOnce: true,
  },
  {
    id: 'bargainer_act1_low_hp',
    trigger: { type: 'health_threshold', hpThreshold: 0.3 },
    act: 1,
    classId: CharacterClassId.BARGAINER,
    speaker: 'character',
    text: `*Lily. I saved Lily. That's worth any price. Even this one.*`,
    priority: 70,
  },
  {
    id: 'bargainer_act1_pre_boss',
    trigger: { type: 'pre_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.BARGAINER,
    speaker: 'character',
    text: `*A king who made a bad deal. Glory for eternity. Should have read the fine print, your majesty.*`,
    priority: 85,
    showOnce: true,
  },
  {
    id: 'bargainer_act1_post_boss',
    trigger: { type: 'post_boss', bossId: 'bonelord' },
    act: 1,
    classId: CharacterClassId.BARGAINER,
    speaker: 'character',
    text: `*He was a client, in a way. The Sanctum collected when he couldn't pay. Harsh terms.*

*I can do better.*`,
    priority: 85,
    showOnce: true,
  },
];

// =============================================================================
// ACT 2 — THE FLOODED DEPTHS
// =============================================================================

// Warden Whispers - Act 2
const ACT2_WARDEN_CARDS: StoryCard[] = [
  {
    id: 'warden_act2_first',
    trigger: { type: 'progress', value: 1 },
    act: 2,
    speaker: 'warden',
    text: `**Lyra:** *"Welcome to Thalassar. Or what remains of it. A kingdom drowned in one man's love."*`,
    priority: 100,
    showOnce: true,
  },
  {
    id: 'warden_act2_mid',
    trigger: { type: 'progress', value: 4 },
    act: 2,
    speaker: 'warden',
    text: `**Lyra:** *"Aldric and I were friends, once. Before the drowning. Before the forgetting."*

*"I still remember his wedding. Elara was beautiful. He couldn't stop smiling."*`,
    priority: 90,
    showOnce: true,
  },
  {
    id: 'warden_act2_pre_boss',
    trigger: { type: 'pre_boss', bossId: 'drowned_king' },
    act: 2,
    speaker: 'warden',
    text: `**Lyra:** *"He's waiting for you. He's been waiting for four hundred years."*

*"Don't hate him for what he's become. Hate what took him from himself."*`,
    priority: 100,
    showOnce: true,
  },
  {
    id: 'warden_act2_post_boss',
    trigger: { type: 'post_boss', bossId: 'drowned_king' },
    act: 2,
    speaker: 'warden',
    text: `**Lyra:** *"Aldric... goodbye, old friend. Say hello to Elara for me."*

*"The Core awaits. The Hollow God stirs. Remember what Aldric gave. Remember what love costs."*`,
    priority: 100,
    showOnce: true,
  },
];

// Environmental Observations - Act 2
const ACT2_ENVIRONMENT_CARDS: StoryCard[] = [
  {
    id: 'env_act2_room1',
    trigger: { type: 'progress', value: 1 },
    act: 2,
    speaker: 'environment',
    text: `*The water isn't cold. It's warm, like tears.*`,
    priority: 30,
    showOnce: true,
  },
  {
    id: 'env_act2_room3',
    trigger: { type: 'progress', value: 3 },
    act: 2,
    speaker: 'environment',
    text: `*Underwater tapestries show a wedding. The king's face is scratched out. The queen's face is pristine.*`,
    priority: 30,
    showOnce: true,
  },
  {
    id: 'env_act2_room5',
    trigger: { type: 'progress', value: 5 },
    act: 2,
    speaker: 'environment',
    text: `*Nurseries, preserved. Toys for children who grew up and forgot the king who saved them.*`,
    priority: 30,
    showOnce: true,
  },
  {
    id: 'env_act2_room7',
    trigger: { type: 'progress', value: 7 },
    act: 2,
    speaker: 'environment',
    text: `*Love letters, water-damaged but readable. "Come back to me." "I can't." "Then I'll come to you."*`,
    priority: 30,
    showOnce: true,
  },
];

// Lore Fragments - Act 2 (Random)
const ACT2_LORE_CARDS: StoryCard[] = [
  {
    id: 'lore_act2_portrait',
    trigger: { type: 'random', chance: 0.15 },
    act: 2,
    speaker: 'lore',
    text: `*A portrait of Queen Elara. Someone has added new paint to keep her colors bright. For four hundred years.*`,
    priority: 10,
  },
  {
    id: 'lore_act2_carving',
    trigger: { type: 'random', chance: 0.15 },
    act: 2,
    speaker: 'lore',
    text: `*"THALASSAR STANDS." Carved into the wall. It doesn't stand anymore. Hasn't for centuries.*`,
    priority: 10,
  },
  {
    id: 'lore_act2_drawings',
    trigger: { type: 'random', chance: 0.15 },
    act: 2,
    speaker: 'lore',
    text: `*Children's drawings, preserved in crystal. "MY HERO" with a crown and a smile.*`,
    priority: 10,
  },
  {
    id: 'lore_act2_seal',
    trigger: { type: 'random', chance: 0.15 },
    act: 2,
    speaker: 'lore',
    text: `*The seal of Thalassar: a wave encircling a heart. The kingdom is gone. The symbol remains.*`,
    priority: 10,
  },
  {
    id: 'lore_act2_plea',
    trigger: { type: 'random', chance: 0.15 },
    act: 2,
    speaker: 'lore',
    text: `*"Elara forgive me" written a thousand times. The same handwriting. The same plea.*`,
    priority: 10,
  },
];

// =============================================================================
// ACT 3 — THE SANCTUM CORE
// =============================================================================

// Warden Whispers - Act 3
const ACT3_WARDEN_CARDS: StoryCard[] = [
  {
    id: 'warden_act3_first',
    trigger: { type: 'progress', value: 1 },
    act: 3,
    speaker: 'warden',
    text: `**Lyra:** *"You're close now. I can barely reach you. The void interferes with... everything."*

*"Remember who you are. Remember why you came. Don't let it take that."*`,
    priority: 100,
    showOnce: true,
  },
  {
    id: 'warden_act3_mid',
    trigger: { type: 'progress', value: 4 },
    act: 3,
    speaker: 'warden',
    text: `**Lyra:** *"I've been... Warden... 347 years. Soon it will be... someone else..."*

*"...your choice... always... your choice..."*`,
    priority: 90,
    showOnce: true,
  },
  {
    id: 'warden_act3_pre_boss',
    trigger: { type: 'pre_boss', bossId: 'hollow_god' },
    act: 3,
    speaker: 'warden',
    text: `**Lyra:** *"It's here. The nothing that hungers. The shadow where Kael used to be."*

*"I can't help you anymore. I'm too faded. But I believe in you."*

*"Win or lose... thank you. For trying. For being brave enough to reach the end."*`,
    priority: 100,
    showOnce: true,
  },
  {
    id: 'warden_act3_post_boss',
    trigger: { type: 'post_boss', bossId: 'hollow_god' },
    act: 3,
    speaker: 'warden',
    text: `**Lyra:** (clear, for the first time)

*"You did it. You held on. You remembered."*

*"Now... the choice."*`,
    priority: 100,
    showOnce: true,
  },
];

// Environmental Observations - Act 3
const ACT3_ENVIRONMENT_CARDS: StoryCard[] = [
  {
    id: 'env_act3_room1',
    trigger: { type: 'progress', value: 1 },
    act: 3,
    speaker: 'environment',
    text: `*The walls are crystallized Wardens. Dozens of them. Centuries of guardians, preserved in their final moments.*`,
    priority: 30,
    showOnce: true,
  },
  {
    id: 'env_act3_room3',
    trigger: { type: 'progress', value: 3 },
    act: 3,
    speaker: 'environment',
    text: `*Reality isn't solid here. Corners don't quite meet. Shadows fall in the wrong direction.*`,
    priority: 30,
    showOnce: true,
  },
  {
    id: 'env_act3_room5',
    trigger: { type: 'progress', value: 5 },
    act: 3,
    speaker: 'environment',
    text: `*Your reflection in the crystal is wrong. It blinks when you don't. It smiles when you're not smiling.*`,
    priority: 30,
    showOnce: true,
  },
  {
    id: 'env_act3_room7',
    trigger: { type: 'progress', value: 7 },
    act: 3,
    speaker: 'environment',
    text: `*Names whisper in the darkness. Thousands of names. Everyone the void has consumed.*`,
    priority: 30,
    showOnce: true,
  },
];

// Universal Character Thoughts - Act 3
const ACT3_UNIVERSAL_CARDS: StoryCard[] = [
  {
    id: 'universal_act3_room1',
    trigger: { type: 'progress', value: 1 },
    act: 3,
    speaker: 'character',
    text: `*Colors are wrong here. Sounds have edges. My name feels slippery.*`,
    priority: 50,
    showOnce: true,
  },
  {
    id: 'universal_act3_mid',
    trigger: { type: 'progress', value: 4 },
    act: 3,
    speaker: 'character',
    text: `*What was I looking for? Why did I come here? I had a reason. I HAD A REASON.*`,
    priority: 50,
    showOnce: true,
  },
];

// Lore Fragments - Act 3 (Random)
const ACT3_LORE_CARDS: StoryCard[] = [
  {
    id: 'lore_act3_kael',
    trigger: { type: 'random', chance: 0.15 },
    act: 3,
    speaker: 'lore',
    text: `*A name floats past: "KAEL." The oldest name here. The first consumed.*`,
    priority: 10,
  },
  {
    id: 'lore_act3_void',
    trigger: { type: 'random', chance: 0.15 },
    act: 3,
    speaker: 'lore',
    text: `*The void isn't dark. It's colorless. The absence of even black.*`,
    priority: 10,
  },
  {
    id: 'lore_act3_remember',
    trigger: { type: 'random', chance: 0.15 },
    act: 3,
    speaker: 'lore',
    text: `*"I REMEMBER" carved into crystal. Then, below it: "I FORGET." Same handwriting.*`,
    priority: 10,
  },
  {
    id: 'lore_act3_skeleton',
    trigger: { type: 'random', chance: 0.15 },
    act: 3,
    speaker: 'lore',
    text: `*A complete skeleton, arranged in meditation pose. Peaceful. Chosen.*`,
    priority: 10,
  },
  {
    id: 'lore_act3_name',
    trigger: { type: 'random', chance: 0.15 },
    act: 3,
    speaker: 'lore',
    text: `*Your name, whispered by something that has no voice. It knows you already.*`,
    priority: 10,
  },
];

// =============================================================================
// EXPORTS
// =============================================================================

export const ALL_STORY_CARDS: StoryCard[] = [
  // Act 1
  ...ACT1_WARDEN_CARDS,
  ...ACT1_ENVIRONMENT_CARDS,
  ...ACT1_LORE_CARDS,
  ...ACT1_CLERIC_CARDS,
  ...ACT1_KNIGHT_CARDS,
  ...ACT1_DIABOLIST_CARDS,
  ...ACT1_OATHSWORN_CARDS,
  ...ACT1_FEY_TOUCHED_CARDS,
  ...ACT1_CELESTIAL_CARDS,
  ...ACT1_SUMMONER_CARDS,
  ...ACT1_BARGAINER_CARDS,
  // Act 2
  ...ACT2_WARDEN_CARDS,
  ...ACT2_ENVIRONMENT_CARDS,
  ...ACT2_LORE_CARDS,
  // Act 3
  ...ACT3_WARDEN_CARDS,
  ...ACT3_ENVIRONMENT_CARDS,
  ...ACT3_UNIVERSAL_CARDS,
  ...ACT3_LORE_CARDS,
];

/**
 * Get story cards by act
 */
export function getStoryCardsByAct(act: 1 | 2 | 3): StoryCard[] {
  return ALL_STORY_CARDS.filter(
    (card) => card.act === act || card.act === 'all'
  );
}

/**
 * Get story card by ID
 */
export function getStoryCardById(id: string): StoryCard | undefined {
  return ALL_STORY_CARDS.find((card) => card.id === id);
}
