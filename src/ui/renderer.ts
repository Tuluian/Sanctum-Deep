import { CombatState, IntentType } from '@/types';

export class CombatRenderer {
  private elements: {
    enemies: HTMLElement;
    enemySlots: HTMLElement;
    playerHp: HTMLElement;
    playerBlock: HTMLElement;
    playerResolve: HTMLElement;
    playerDevotion: HTMLElement;
    hand: HTMLElement;
    drawCount: HTMLElement;
    discardCount: HTMLElement;
    turnCount: HTMLElement;
    combatLog: HTMLElement;
  };

  private onCardClick: (cardIndex: number) => void = () => {};
  private onEnemyClick: (enemyIndex: number) => void = () => {};
  private selectedEnemyIndex: number = 0;

  constructor() {
    this.elements = {
      enemies: document.getElementById('enemies')!,
      enemySlots: document.getElementById('enemy-slots')!,
      playerHp: document.getElementById('player-hp')!,
      playerBlock: document.getElementById('player-block')!,
      playerResolve: document.getElementById('player-resolve')!,
      playerDevotion: document.getElementById('player-devotion')!,
      hand: document.getElementById('hand')!,
      drawCount: document.getElementById('draw-count')!,
      discardCount: document.getElementById('discard-count')!,
      turnCount: document.getElementById('turn-count')!,
      combatLog: document.getElementById('combat-log')!,
    };

    // Expose handlers globally for onclick attributes
    (window as unknown as { selectEnemy: (index: number) => void }).selectEnemy = (index: number) => {
      this.onEnemyClick(index);
    };
    (window as unknown as { playCard: (index: number) => void }).playCard = (index: number) => {
      this.onCardClick(index);
    };
  }

  setCardClickHandler(handler: (cardIndex: number) => void): void {
    this.onCardClick = handler;
  }

  setEnemyClickHandler(handler: (enemyIndex: number) => void): void {
    this.onEnemyClick = handler;
  }

  setSelectedEnemy(index: number): void {
    this.selectedEnemyIndex = index;
  }

  getSelectedEnemy(): number {
    return this.selectedEnemyIndex;
  }

  render(state: CombatState): void {
    this.renderEnemies(state);
    this.renderArenaEnemies(state);
    this.renderPlayerStats(state);
    this.renderHand(state);
    this.renderPiles(state);
  }

  private renderEnemies(state: CombatState): void {
    this.elements.enemies.innerHTML = state.enemies
      .map((enemy, index) => {
        const hpPercent = (enemy.currentHp / enemy.maxHp) * 100;
        const isDead = enemy.currentHp <= 0;
        const isSelected = index === this.selectedEnemyIndex && !isDead;

        let intentText = '';
        if (enemy.intent && !isDead) {
          if (enemy.intent.intent === IntentType.ATTACK) {
            intentText = `⚔️ Attack for ${enemy.intent.damage} damage`;
          } else if (enemy.intent.intent === IntentType.DEFEND) {
            intentText = `🛡️ Defend for ${enemy.intent.block} block`;
          }
        }

        return `
          <div class="enemy ${isDead ? 'dead' : ''} ${isSelected ? 'selected' : ''}"
               onclick="selectEnemy(${index})">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div class="enemy-name">${enemy.name}</div>
              ${enemy.block > 0 ? `<div class="block-display">🛡️ ${enemy.block}</div>` : ''}
            </div>
            <div class="hp-bar">
              <div class="hp-fill" style="width: ${hpPercent}%;"></div>
              <div class="hp-text">${enemy.currentHp} / ${enemy.maxHp}</div>
            </div>
            ${!isDead && enemy.intent ? `<div class="intent">${intentText}</div>` : ''}
          </div>
        `;
      })
      .join('');
  }

  private renderArenaEnemies(state: CombatState): void {
    this.elements.enemySlots.innerHTML = state.enemies
      .map((enemy, index) => {
        const hpPercent = (enemy.currentHp / enemy.maxHp) * 100;
        const isDead = enemy.currentHp <= 0;
        const isSelected = index === this.selectedEnemyIndex && !isDead;

        let intentDisplay = '';
        if (enemy.intent && !isDead) {
          if (enemy.intent.intent === IntentType.ATTACK) {
            intentDisplay = `⚔️ ${enemy.intent.damage}`;
          } else if (enemy.intent.intent === IntentType.DEFEND) {
            intentDisplay = `🛡️ ${enemy.intent.block}`;
          } else if (enemy.intent.intent === IntentType.BUFF) {
            intentDisplay = `⬆️`;
          } else if (enemy.intent.intent === IntentType.DEBUFF) {
            intentDisplay = `⬇️`;
          } else {
            intentDisplay = `❓`;
          }
        }

        return `
          <div class="arena-enemy ${isDead ? 'dead' : ''} ${isSelected ? 'selected' : ''}"
               onclick="selectEnemy(${index})"
               data-enemy-id="${enemy.id}">
            ${!isDead && enemy.intent ? `<div class="arena-enemy-intent">${intentDisplay}</div>` : ''}
            <div class="enemy-figure"></div>
            <div class="arena-enemy-hp">
              <div class="arena-enemy-hp-fill" style="width: ${hpPercent}%;"></div>
            </div>
            <div class="arena-enemy-name">${enemy.name}</div>
          </div>
        `;
      })
      .join('');
  }

  private renderPlayerStats(state: CombatState): void {
    const player = state.player;
    this.elements.playerHp.textContent = `${player.currentHp}/${player.maxHp}`;
    this.elements.playerBlock.textContent = `🛡️ ${player.block}`;
    this.elements.playerResolve.textContent = `${player.resolve}/${player.maxResolve}`;
    this.elements.playerDevotion.textContent = String(player.devotion);
  }

  private renderHand(state: CombatState): void {
    const player = state.player;
    this.elements.hand.innerHTML = player.hand
      .map((card, index) => {
        const canPlay = card.cost <= player.resolve && !state.gameOver;
        const typeClass = card.type.toLowerCase();

        return `
          <div class="card ${typeClass} ${!canPlay ? 'unplayable' : ''}"
               onclick="playCard(${index})">
            <div class="card-header">
              <div class="card-name">${card.name}</div>
              <div class="card-cost">${card.cost}</div>
            </div>
            <div class="card-type">${card.type}</div>
            <div class="card-description">${card.description}</div>
          </div>
        `;
      })
      .join('');
  }

  private renderPiles(state: CombatState): void {
    this.elements.drawCount.textContent = String(state.player.drawPile.length);
    this.elements.discardCount.textContent = String(state.player.discardPile.length);
    this.elements.turnCount.textContent = String(state.turn);
  }

  addLog(message: string, isError: boolean = false): void {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    if (isError) entry.style.color = '#e74c3c';
    entry.textContent = message;
    this.elements.combatLog.appendChild(entry);
    this.elements.combatLog.scrollTop = this.elements.combatLog.scrollHeight;
  }

  clearLog(): void {
    this.elements.combatLog.innerHTML = '';
  }

  showGameOver(victory: boolean, onContinue?: () => void): void {
    const existing = document.querySelector('.game-over');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = `game-over ${victory ? 'victory' : 'defeat'}`;

    const soulEchoesEarned = victory ? 50 : 10;

    div.innerHTML = `
      <h2>${victory ? '🎉 VICTORY! 🎉' : '💀 DEFEAT 💀'}</h2>
      <p style="font-size: 1em; margin: 15px 0;">
        ${victory ? 'You defeated all enemies!' : 'You were defeated...'}
      </p>
      <p style="font-size: 0.9em; color: #9b59b6; margin-bottom: 15px;">
        +${soulEchoesEarned} 🔮 Soul Echoes
      </p>
      <button id="game-over-continue" style="margin-top: 10px;">Return to Menu</button>
    `;
    document.body.appendChild(div);

    const continueBtn = document.getElementById('game-over-continue');
    if (continueBtn && onContinue) {
      continueBtn.addEventListener('click', onContinue);
    } else if (continueBtn) {
      continueBtn.addEventListener('click', () => location.reload());
    }
  }

  removeGameOver(): void {
    const gameOverDiv = document.querySelector('.game-over');
    if (gameOverDiv) gameOverDiv.remove();
  }

  // Combat animations
  playPlayerAttackAnimation(targetEnemyIndex: number): void {
    const playerSilhouette = document.querySelector('.player-silhouette');
    const enemyElements = this.elements.enemySlots.querySelectorAll('.arena-enemy');
    const targetEnemy = enemyElements[targetEnemyIndex];

    if (playerSilhouette) {
      playerSilhouette.classList.add('attacking');
      setTimeout(() => playerSilhouette.classList.remove('attacking'), 400);
    }

    if (targetEnemy) {
      setTimeout(() => {
        targetEnemy.classList.add('hit');
        setTimeout(() => targetEnemy.classList.remove('hit'), 400);
      }, 200);
    }
  }

  playEnemyAttackAnimation(enemyIndex: number): void {
    const playerSilhouette = document.querySelector('.player-silhouette');
    const enemyElements = this.elements.enemySlots.querySelectorAll('.arena-enemy');
    const attackingEnemy = enemyElements[enemyIndex];

    if (attackingEnemy) {
      attackingEnemy.classList.add('attacking');
      setTimeout(() => attackingEnemy.classList.remove('attacking'), 400);
    }

    if (playerSilhouette) {
      setTimeout(() => {
        playerSilhouette.classList.add('hit');
        setTimeout(() => playerSilhouette.classList.remove('hit'), 500);
      }, 250);
    }
  }
}
