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
  - window.debugCombat('drowned_cultist', 'cleric')     ADD AN ENEMY TO CONFIRM THEIR IMAGE
  - window.debugCombat('bone_archer', 'cleric')
  - window.debugCombat('ghoul', 'cleric')
  - window.debugCombat('shade', 'cleric')
  - window.debugCombat('drowned_king', 'cleric')
  - window.debugCombat('slime', 'cleric')
  - window.debugCombat('high_cultist', 'cleric')
  - window.debugCombat('tomb_guardian', 'cleric')
  - window.debugCombat('bonelord', 'cleric')

Thoughts... if I can publish 1 game per month...
    Then EVENTUALLY i should get to a point where I can make enough in salary? (depending on how much we bring in)
    Is it worth quitting to focus on this full-time? (Obviously not yet, its super early, but still.)
    Need an LLC? For Mug Meter, for Sanctum Ruins, etc...
------------------
/src/data/EndingNarratives.ts
/src/data/classNarratives.ts 
/src/data/narrativeEvents/universal.ts    # all random events
/src/data/narrativeEvents/classSpecific.ts  # class events
    Update these stories and revise to be more human.
------------------
To-Do:  (PO makes work, Dev does it, QA REVIEWS!!!!, then PO Closes)

We need to add to Shrines a random option to choose "+1 damage to spells this run" // "+1 to Block spells this run"
We need to add Shops (and gold currency for each run)
Connection nodes overlap a lot. They should only go to nodes one or two away, but not bypassing strings. 
Decrease the lowest tier of upgrades, but increase significantly the better tiers
    And give more volume of options for Universal. 
Need animation for drinking potion
More animations, characters and should move slowly, at random times. 
Need to pen-test.