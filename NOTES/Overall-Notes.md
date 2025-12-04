## 

Run app with:
    npm run dev


If you need to stop running on a port
    Vite auto-increments ports when 3000 is aready in use. Do:
    lsof -ti:3000 | xargs kill

GITLAB:
    git push origin main
    git push heroku main

    to pull:
    git fetch
    git pull
        (if pull fails, do a 'git stash' which will save local changes)

    git remote -v    (checks all remotes for destinations)
HEROKU:
    heroku git:remote -a sanctum-ruins

--------------
To start boss fights or Act 2, open dev console in browser (fn+F12)
    In Console, halfway down, you can paste commands:
  - window.debugCombat('hollow_god') - Fight the Hollow God
  - window.debugCombat('greater_demon') - Fight the Greater
  Demon
  - window.debugCombat('sanctum_warden') - Fight the Sanctum
  Warden
  - window.debugCombat('act3_common') - Fight random Act 3
  common enemies
  - window.debugCombat('act3_elite') - Fight random Act 3
  elite
  - window.debugCombat('shadow_self') - Fight Shadow Self
  alone
  - window.debugCombat('bonelord') - Fight the Bonelord (Act 1
   boss)
  - window.debugCombat('drowned_king') - Fight the Drowned
  King (Act 2 boss)
  - window.giveSoulEchoes(amount) - defaults to 1000 if no amount specified

Thoughts... if I can publish 1 game per month...
    Then EVENTUALLY i should get to a point where I can make enough in salary? (depending on how much we bring in)
    Is it worth quitting to focus on this full-time? (Obviously not yet, its super early, but still.)
    Need an LLC? For Mug Meter, for Sanctum Ruins, etc...

------------------
To-Do:
Add more classes that are locked (6.3-6.6)
We need to add Shrines
    players can choose EITHER to remove a card permanently for this run, or add a new card.
    OR to choose "+1 damage to spells this run" // "+1 to Block spells this run"
We need to add Shops (and gold currency for each run)
Define 3 types of upgrade:
    Rest of this combat
    Rest of this Run
    Permanent, always
Need to add card draw between runs 
Map connection nodes cut off after the last 25% -- or when zooming on screen, they don't follow the same ratio as nodes do.
High Cultist summon and Bonelord summon (round 1) does not function, but phase 3 summon worked... 
Debuffs should last longer (3-5 turns at least)
Center card text for ability and category (not name).
Bonelord HP bar is behind unit - need to raise and make font smaller
Narrative should appear on screen momentarily while fighting boss (such as start of Phase 2 and 3)
Cards that give Health Potions (for later healing) -- like Basic card - deal 2 damage, summon a Healing Potion
Greater Demon self-heal did not work
Need to rename "Exhaust" because that is the mechanic from Slay the Spire - we should 'Exile' or 'Forget' or 'FRACTURE'!
Buy assets from Unity store, find free assets, find UI components, then update emojis and enemies.
Each class should have their own bosses? Tailored to go against their cards?
Player should auto-target living units only (OR killing an enemy should remove them from the battlefield completely, no body).
Weird Meta... if we decide to become the Warden - we could make a Warden class.
    Your role is then to supervise another spirit attempting the dungeon and help them get to the end by playing support cards.
    Similar to Minion - you always have a minion - if it dies, you lose.
    You play cards to heal minions and deal damage (similar to playing for real)
Different color scheme cards for each class!!! (Look at Character-Image-Prompts.txt for color schemes)
Give a running debug log for dev that tells me (and agents) everything that happens when a card is played or enemy acts.
Unlock Tier 4 upgrades when finishing the game as a class