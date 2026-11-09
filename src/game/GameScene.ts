import Phaser from "phaser";
import { getCharacter, type CharacterId } from "../data/characters";
import type { ChallengeType, WorldDefinition } from "../data/worlds";
import type { CharacterWardrobe } from "../data/profiles";

export interface MazeSession {
  characterId: CharacterId;
  worldIndex: number;
  levelNumber: number;
  challenge: ChallengeType;
  world: WorldDefinition;
  appearance?: CharacterWardrobe;
}
export interface MazeProgress { hearts: number; coins: number; gems: number; hasKey: boolean; message: string }
export interface MazeReward { coins: number; gems: number; stars: number; challenge: ChallengeType }

type ObstacleKind = "log" | "rock" | "branch" | "monster";
interface Obstacle { x: number; kind: ObstacleKind; sprite: Phaser.GameObjects.Text; handled: boolean }
interface Pickup { x: number; y: number; kind: "coin" | "gem"; sprite: Phaser.GameObjects.Text; collected: boolean }
interface Gap { left: number; right: number }

const WORLD_LENGTH = 3100;
const STATION_X = 1500;
const FINISH_X = 2940;
const GAP_ZONES: Gap[] = [{ left: 990, right: 1110 }, { left: 2180, right: 2310 }];

export class GameScene extends Phaser.Scene {
  private readonly session: MazeSession;
  private readonly onProgress: (p: MazeProgress) => void;
  private readonly onComplete: (r: MazeReward) => void;
  private player!: Phaser.GameObjects.Container;
  private legs!: Phaser.GameObjects.Graphics;
  private groundY = 0;
  private jumpVelocity = 0;
  private jumping = false;
  private duckUntil = 0;
  private facing = 1;
  private hearts = 5;
  private coins = 0;
  private gems = 0;
  private checkpointX = 120;
  private challengeOpen = false;
  private challengeCleared = false;
  private complete = false;
  private overlay?: Phaser.GameObjects.Container;
  private obstacles: Obstacle[] = [];
  private pickups: Pickup[] = [];
  private swipeStartX = 0;
  private swipeStartY = 0;
  private swipePointerId = -1;
  private lastMessage = "";

  constructor(session: MazeSession, onProgress: (p: MazeProgress) => void, onComplete: (r: MazeReward) => void) {
    super("MazeScene");
    this.session = session;
    this.onProgress = onProgress;
    this.onComplete = onComplete;
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    this.groundY = Math.floor(height * 0.77);
    this.cameras.main.setBackgroundColor(this.session.world.sky);
    this.drawWorld(width, height);
    this.drawHero();
    this.cameras.main.setBounds(0, 0, WORLD_LENGTH, height);
    this.cameras.main.startFollow(this.player, true, 0.12, 0);
    this.cameras.main.setFollowOffset(-width * 0.18, 0);
    this.input.keyboard?.on("keydown", this.handleKey, this);
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.swipeStartX = pointer.x;
      this.swipeStartY = pointer.y;
      this.swipePointerId = pointer.id;
    });
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== this.swipePointerId) return;
      const dx = pointer.x - this.swipeStartX;
      const dy = pointer.y - this.swipeStartY;
      this.swipePointerId = -1;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 35) return;
      if (Math.abs(dx) > Math.abs(dy)) this.move(dx > 0 ? 1 : -1, 0);
      else this.move(0, dy < 0 ? -1 : 1);
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off("keydown", this.handleKey, this);
      this.input.off("pointerdown");
      this.input.off("pointerup");
    });
    this.publish("Your adventure begins! Tap ▶ to walk, ▲ to jump and ▼ to duck.");
  }

  move(dx: number, dy: number): void {
    if (this.complete || this.challengeOpen || !this.player) return;
    if (dy < 0) {
      if (!this.jumping && this.player.y >= this.groundY - 2) {
        this.jumping = true;
        this.jumpVelocity = -565;
        this.publish("⬆️ Great jump! Clear the obstacle or gap.");
      }
      return;
    }
    if (dy > 0) {
      this.duckUntil = this.time.now + 620;
      this.player.setScale(1, 0.65);
      this.time.delayedCall(650, () => { if (this.player && this.time.now >= this.duckUntil) this.player.setScale(1, 1); });
      this.publish("🙇 Duck! Stay low under the branch.");
      return;
    }
    if (dx === 0) return;
    this.facing = dx > 0 ? 1 : -1;
    const oldX = this.player.x;
    let targetX = Phaser.Math.Clamp(oldX + dx * 78, 85, FINISH_X + 30);
    if (!this.challengeCleared && dx > 0 && targetX >= STATION_X - 70) {
      targetX = STATION_X - 70;
      this.tweens.killTweensOf(this.player);
      this.player.x = targetX;
      this.openChallengeStation();
      return;
    }
    this.tweens.killTweensOf(this.player);
    this.tweens.add({ targets: this.player, x: targetX, duration: 145, ease: "Sine.easeOut" });
    this.player.setScale(this.facing, this.player.scaleY);
    if (!this.jumping && this.time.now > this.duckUntil) {
      this.tweens.add({ targets: this.legs, angle: { from: -18, to: 18 }, duration: 80, yoyo: true, repeat: 2 });
      this.tweens.add({ targets: this.player, y: this.groundY - 4, duration: 75, yoyo: true, repeat: 1 });
    }
    if (dx > 0 && oldX < 760 && targetX >= 760) {
      this.checkpointX = 760;
      this.publish("🏕️ Checkpoint reached! You will restart here if you stumble.");
    }
  }

  update(_time: number, delta: number): void {
    if (!this.player || this.complete || this.challengeOpen) return;
    const dt = Math.min(delta, 40) / 1000;
    const inGap = this.isOverGap(this.player.x);
    if (this.jumping || inGap) {
      this.jumpVelocity += 1420 * dt;
      this.player.y += this.jumpVelocity * dt;
      if (this.player.y >= this.groundY && !this.isOverGap(this.player.x)) {
        this.player.y = this.groundY;
        this.jumpVelocity = 0;
        this.jumping = false;
        this.player.setScale(this.facing, 1);
        this.publish("🌟 Safe landing!");
      } else if (this.player.y > this.scale.height + 105) {
        this.loseHeart("You fell into the gap. Try jumping a little earlier!");
        return;
      }
    }

    for (const pickup of this.pickups) {
      if (pickup.collected) continue;
      if (Math.abs(this.player.x - pickup.x) < 34 && Math.abs(this.player.y - pickup.y) < 58) {
        pickup.collected = true;
        pickup.sprite.destroy();
        if (pickup.kind === "coin") {
          this.coins++;
          this.publish("🪙 Coin collected! Keep looking for treasures.");
        } else {
          this.gems++;
          this.publish("💎 Sparkling gem collected!");
        }
      }
    }

    for (const obstacle of this.obstacles) {
      if (obstacle.handled) continue;
      if (this.player.x > obstacle.x + 45) {
        obstacle.handled = true;
        continue;
      }
      if (Math.abs(this.player.x - obstacle.x) < 29) {
        const airborne = this.player.y < this.groundY - 58;
        const ducking = this.time.now < this.duckUntil;
        const safe = obstacle.kind === "branch" ? ducking : airborne;
        if (!safe) {
          obstacle.handled = true;
          const text: Record<ObstacleKind, string> = {
            log: "🪵 Jump over the fallen log next time!",
            rock: "🪨 Time your jump to clear the rolling rock!",
            branch: "🌿 Duck under the low branch!",
            monster: "👾 Jump over the friendly monster!"
          };
          this.loseHeart(text[obstacle.kind]);
          return;
        }
      }
    }

    if (this.player.x >= 760 && this.checkpointX < 760) this.checkpointX = 760;
    if (this.player.x >= FINISH_X) this.finishAdventure();
  }

  private drawWorld(width: number, height: number): void {
    const sky = this.session.world.sky;
    const floor = this.session.world.floor;
    const accent = this.session.world.accent;
    this.add.rectangle(WORLD_LENGTH / 2, height / 2, WORLD_LENGTH, height, Number.parseInt(sky.replace("#", ""), 16));
    for (let i = 0; i < 13; i++) {
      const x = 100 + i * 255;
      this.add.ellipse(x, this.groundY - 54 - (i % 3) * 15, 340, 150, accent, 0.16);
      this.add.text(x - 70, 54 + (i % 2) * 43, "☁️", { fontFamily: "system-ui", fontSize: "36px" });
      const scenery = this.session.worldIndex === 0 ? ["🪸", "🐚", "🐠"] :
        this.session.worldIndex === 1 ? ["🍭", "🍬", "🍩"] :
        this.session.worldIndex === 4 ? ["🌲", "⛄", "❄️"] :
        this.session.worldIndex === 5 ? ["🪐", "⭐", "🚀"] : ["🌳", "🌼", "🍄"];
      this.add.text(x + 30, this.groundY - 92 - (i % 2) * 22, scenery[i % scenery.length]!, { fontFamily: "system-ui", fontSize: "42px" });
    }

    const groundSegments: Array<[number, number]> = [[0, 990], [1110, 2180], [2310, WORLD_LENGTH]];
    for (const [start, end] of groundSegments) {
      this.add.rectangle((start + end) / 2, this.groundY + 95, end - start, 190, floor);
      this.add.rectangle((start + end) / 2, this.groundY + 5, end - start, 14, accent);
    }
    for (const gap of GAP_ZONES) {
      this.add.rectangle((gap.left + gap.right) / 2, this.groundY + 24, gap.right - gap.left, 48, 0x35435a, 0.9);
      this.add.text((gap.left + gap.right) / 2, this.groundY + 45, "⬇️", { fontFamily: "system-ui", fontSize: "22px" }).setOrigin(0.5);
    }

    const obstacleDefs: Array<[number, ObstacleKind]> = [
      [430, "log"], [735, "rock"], [1265, "branch"], [1845, "monster"], [2020, "rock"], [2510, "log"]
    ];
    for (const [x, kind] of obstacleDefs) {
      const icon: Record<ObstacleKind, string> = { log: "🪵", rock: "🪨", branch: "🌿", monster: "👾" };
      const y = kind === "branch" ? this.groundY - 150 : this.groundY - 27;
      const sprite = this.add.text(x, y, icon[kind], { fontFamily: "system-ui", fontSize: kind === "branch" ? "49px" : "42px" }).setOrigin(0.5);
      if (kind === "rock") this.tweens.add({ targets: sprite, y: y - 12, duration: 420, yoyo: true, repeat: -1 });
      if (kind === "monster") this.tweens.add({ targets: sprite, y: y - 8, duration: 600, yoyo: true, repeat: -1 });
      this.obstacles.push({ x, kind, sprite, handled: false });
    }

    const pickupDefs: Array<[number, number, "coin" | "gem"]> = [
      [245, this.groundY - 85, "coin"], [345, this.groundY - 125, "coin"], [610, this.groundY - 95, "gem"],
      [865, this.groundY - 90, "coin"], [1165, this.groundY - 105, "coin"], [1370, this.groundY - 90, "gem"],
      [1740, this.groundY - 115, "coin"], [1940, this.groundY - 92, "gem"], [2390, this.groundY - 105, "coin"],
      [2700, this.groundY - 92, "coin"]
    ];
    for (const [x, y, kind] of pickupDefs) {
      const sprite = this.add.text(x, y, kind === "coin" ? "🪙" : "💎", { fontFamily: "system-ui", fontSize: "28px" }).setOrigin(0.5);
      this.tweens.add({ targets: sprite, y: y - 9, angle: 12, duration: 650, yoyo: true, repeat: -1 });
      this.pickups.push({ x, y, kind, sprite, collected: false });
    }

    this.add.text(STATION_X, this.groundY - 125, "✨ CHALLENGE ✨", {
      fontFamily: "system-ui", fontSize: "18px", fontStyle: "bold", color: "#ffffff",
      backgroundColor: "#76539b", padding: { x: 10, y: 7 }
    }).setOrigin(0.5);
    this.add.text(STATION_X, this.groundY - 45, "🎪", { fontFamily: "system-ui", fontSize: "58px" }).setOrigin(0.5);
    this.add.text(FINISH_X, this.groundY - 72, "🏁 🏆", { fontFamily: "system-ui", fontSize: "52px" }).setOrigin(0.5);
    this.add.text(width * 0.5, 8, this.session.world.name + "  •  LEVEL " + this.session.levelNumber, {
      fontFamily: "system-ui", fontSize: "12px", fontStyle: "bold", color: "#ffffff",
      backgroundColor: "#00000044", padding: { x: 9, y: 5 }
    }).setOrigin(0.5, 0).setScrollFactor(0);
  }

  private drawHero(): void {
    const character = getCharacter(this.session.characterId);
    const appearance = this.session.appearance ?? { hairstyle: "🌸", outfit: "👗", accessory: "✨" };
    const colour = character.colour;
    const shadow = this.add.ellipse(0, -2, 48, 13, 0x3d3651, 0.18);
    const body = this.add.graphics();
    body.fillStyle(colour, 1);
    body.fillRoundedRect(-14, -48, 28, 34, 9);
    body.fillStyle(0xf4c7a5, 1);
    body.fillCircle(0, -62, 13);
    body.fillStyle(0x47364d, 1);
    body.fillCircle(-4, -64, 1.8);
    body.fillCircle(4, -64, 1.8);
    body.lineStyle(1.5, 0x9c526b, 1);
    body.beginPath(); body.arc(0, -59, 4, 0.15, Math.PI - 0.15, false); body.strokePath();
    body.fillStyle(colour, 1);
    body.fillEllipse(-19, -38, 12, 22);
    body.fillEllipse(19, -38, 12, 22);
    const legs = this.add.graphics();
    legs.lineStyle(6, 0x59435f, 1);
    legs.beginPath(); legs.moveTo(-7, -16); legs.lineTo(-10, 0); legs.strokePath();
    legs.beginPath(); legs.moveTo(7, -16); legs.lineTo(10, 0); legs.strokePath();
    legs.fillStyle(0x70517d, 1);
    legs.fillRoundedRect(-18, -4, 14, 6, 3);
    legs.fillRoundedRect(4, -4, 14, 6, 3);
    this.legs = legs;
    const token = this.add.text(0, -88, character.token, { fontFamily: "system-ui", fontSize: "31px" }).setOrigin(0.5);
    const hair = this.add.text(-14, -82, appearance.hairstyle, { fontFamily: "system-ui", fontSize: "15px" }).setOrigin(0.5);
    const accessory = this.add.text(15, -76, appearance.accessory, { fontFamily: "system-ui", fontSize: "16px" }).setOrigin(0.5);
    const outfit = this.add.text(0, -34, appearance.outfit, { fontFamily: "system-ui", fontSize: "17px" }).setOrigin(0.5);
    this.player = this.add.container(120, this.groundY, [shadow, legs, body, token, hair, accessory, outfit]).setDepth(20);
  }

  private isOverGap(x: number): boolean {
    return GAP_ZONES.some(g => x > g.left && x < g.right);
  }

  private loseHeart(message: string): void {
    this.hearts--;
    if (this.hearts <= 0) {
      this.hearts = 5;
      message = "🧚 A fairy helped you at the checkpoint. Try the obstacle again!";
    }
    this.tweens.killTweensOf(this.player);
    this.player.setPosition(this.checkpointX, this.groundY);
    this.player.setScale(1, 1);
    this.jumping = false;
    this.jumpVelocity = 0;
    this.duckUntil = 0;
    this.publish(message);
  }

  private openChallengeStation(): void {
    this.challengeOpen = true;
    this.publish("✨ Challenge station reached! Your journey is paused.");
    const panel = this.createPanel("Magical Challenge Station", "Your adventure is paused right here. Complete a mini-game to open the path.");
    this.addPanelButton(panel, "START CHALLENGE", () => this.startChallenge());
  }

  private createPanel(title: string, subtitle: string): Phaser.GameObjects.Container {
    this.overlay?.destroy(true);
    const width = this.scale.width;
    const height = this.scale.height;
    const panelWidth = Math.min(width - 28, 370);
    const panelHeight = Math.min(height - 34, 430);
    const container = this.add.container(0, 0).setScrollFactor(0).setDepth(1000);
    container.add(this.add.rectangle(width / 2, height / 2, width, height, 0x302440, 0.72));
    container.add(this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0xfffbff).setStrokeStyle(3, 0xe5c9f0));
    container.add(this.add.text(width / 2, height / 2 - panelHeight / 2 + 28, title, {
      fontFamily: "system-ui", fontSize: width < 380 ? "18px" : "21px", fontStyle: "bold", color: "#674c83",
      align: "center", wordWrap: { width: panelWidth - 28 }
    }).setOrigin(0.5));
    container.add(this.add.text(width / 2, height / 2 - panelHeight / 2 + 78, subtitle, {
      fontFamily: "system-ui", fontSize: "12px", color: "#806d8a", align: "center",
      wordWrap: { width: panelWidth - 34 }
    }).setOrigin(0.5));
    this.overlay = container;
    return container;
  }

  private addPanelButton(panel: Phaser.GameObjects.Container, label: string, action: () => void, x?: number, y?: number, colour = 0x8b68ad): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const bx = x ?? width / 2;
    const by = y ?? height / 2 + 145;
    const button = this.add.rectangle(bx, by, Math.min(width - 72, 260), 48, colour).setInteractive({ useHandCursor: true });
    const text = this.add.text(bx, by, label, { fontFamily: "system-ui", fontSize: "14px", fontStyle: "bold", color: "#ffffff" }).setOrigin(0.5);
    button.on("pointerdown", action);
    panel.add([button, text]);
  }

  private startChallenge(): void {
    if (this.session.levelNumber % 3 === 1) this.startMemoryChallenge();
    else if (this.session.levelNumber % 3 === 2) this.startPatternChallenge();
    else this.startKeyChallenge();
  }

  private startMemoryChallenge(): void {
    const panel = this.createPanel("Ocean Memory", "Find all three matching pairs. Tap two cards at a time!");
    const symbols = ["🐬", "🐠", "🐙", "🐬", "🐠", "🐙"];
    const cards: Array<{ value: string; text: Phaser.GameObjects.Text; button: Phaser.GameObjects.Rectangle; matched: boolean }> = [];
    const order = [2, 0, 4, 1, 5, 3];
    let first = -1;
    let locked = false;
    let pairs = 0;
    const width = this.scale.width;
    const height = this.scale.height;
    const cardW = Math.min(82, (width - 66) / 3);
    const cardH = 62;
    const startX = width / 2 - cardW - 8;
    const startY = height / 2 - 35;
    order.forEach((symbolIndex, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = startX + col * (cardW + 8);
      const y = startY + row * (cardH + 12);
      const button = this.add.rectangle(x, y, cardW, cardH, 0xeadcf5).setStrokeStyle(2, 0xc8a9dc).setInteractive({ useHandCursor: true });
      const text = this.add.text(x, y, "❔", { fontFamily: "system-ui", fontSize: "28px" }).setOrigin(0.5);
      panel.add([button, text]);
      const card = { value: symbols[symbolIndex]!, text, button, matched: false };
      cards.push(card);
      button.on("pointerdown", () => {
        if (locked || card.matched || text.text !== "❔") return;
        text.setText(card.value);
        if (first < 0) { first = index; return; }
        const firstIndex = first;
        first = -1;
        const other = cards[firstIndex]!;
        if (other.value === card.value) {
          other.matched = true; card.matched = true; pairs++;
          if (pairs === 3) this.showChallengeWon();
        } else {
          locked = true;
          this.time.delayedCall(750, () => {
            if (!this.overlay || !this.overlay.active) return;
            other.text.setText("❔"); card.text.setText("❔"); locked = false;
          });
        }
      });
    });
  }

  private startPatternChallenge(): void {
    const panel = this.createPanel("Gem Pattern", "Look at the pattern. Which gem comes next?");
    const width = this.scale.width;
    const height = this.scale.height;
    panel.add(this.add.text(width / 2, height / 2 - 7, "💎   ⭐   💎   ⭐   ?", {
      fontFamily: "system-ui", fontSize: "29px", color: "#674c83"
    }).setOrigin(0.5));
    const options: Array<[string, boolean]> = [["💎", true], ["⭐", false], ["🌙", false]];
    options.forEach(([symbol, correct], index) => {
      const x = width / 2 + (index - 1) * 88;
      const button = this.add.rectangle(x, height / 2 + 75, 70, 62, 0xeadcf5).setStrokeStyle(2, 0xc8a9dc).setInteractive({ useHandCursor: true });
      const text = this.add.text(x, height / 2 + 75, symbol, { fontFamily: "system-ui", fontSize: "30px" }).setOrigin(0.5);
      button.on("pointerdown", () => {
        if (correct) this.showChallengeWon();
        else this.showRetryHint(panel, "Not quite! Look at the repeating pattern: gem, star, gem, star...");
      });
      panel.add([button, text]);
    });
  }

  private startKeyChallenge(): void {
    const panel = this.createPanel("Choose the Magic Key", "The gate is blue. Which key will open it?");
    const width = this.scale.width;
    const height = this.scale.height;
    panel.add(this.add.text(width / 2, height / 2 - 8, "🔵  🚪", { fontFamily: "system-ui", fontSize: "34px" }).setOrigin(0.5));
    const options: Array<[string, boolean, number]> = [["Pink key 🗝️", false, 0xf0c5df], ["Blue key 🔑", true, 0xb9d9f5], ["Gold key 🗝️", false, 0xf2df9e]];
    options.forEach(([label, correct, colour], index) => {
      const y = height / 2 + 52 + index * 48;
      const button = this.add.rectangle(width / 2, y, Math.min(width - 88, 255), 39, colour).setInteractive({ useHandCursor: true });
      const text = this.add.text(width / 2, y, label, { fontFamily: "system-ui", fontSize: "13px", fontStyle: "bold", color: "#51445e" }).setOrigin(0.5);
      button.on("pointerdown", () => {
        if (correct) this.showChallengeWon();
        else this.showRetryHint(panel, "That key does not match the blue gate. Try another key!");
      });
      panel.add([button, text]);
    });
  }

  private showRetryHint(panel: Phaser.GameObjects.Container, message: string): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const hint = this.add.text(width / 2, height - 45, message, {
      fontFamily: "system-ui", fontSize: "11px", color: "#a34d70", align: "center",
      wordWrap: { width: width - 46 }
    }).setOrigin(0.5);
    panel.add(hint);
  }

  private showChallengeWon(): void {
    const panel = this.createPanel("Challenge complete! 🎉", "You earned +10 coins and +1 gem. The magical path is now open!");
    this.addPanelButton(panel, "CONTINUE ADVENTURE", () => {
      this.coins += 10;
      this.gems += 1;
      this.challengeCleared = true;
      this.challengeOpen = false;
      this.overlay?.destroy(true);
      this.overlay = undefined;
      this.player.x = STATION_X + 24;
      this.publish("🌈 Challenge cleared! Your adventure continues from the same place.");
    });
  }

  private finishAdventure(): void {
    if (this.complete) return;
    this.complete = true;
    const stars = this.hearts >= 4 ? 3 : this.hearts >= 2 ? 2 : 1;
    this.publish("🏆 Adventure complete! You reached the magical finish!");
    this.onComplete({
      coins: 25 + this.coins * 2 + stars * 5,
      gems: this.gems,
      stars,
      challenge: this.session.challenge
    });
  }

  private handleKey(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if (key === "arrowright" || key === "d") this.move(1, 0);
    else if (key === "arrowleft" || key === "a") this.move(-1, 0);
    else if (key === "arrowup" || key === "w" || key === " ") this.move(0, -1);
    else if (key === "arrowdown" || key === "s") this.move(0, 1);
  }

  private publish(message: string): void {
    if (message === this.lastMessage) return;
    this.lastMessage = message;
    this.onProgress({
      hearts: this.hearts,
      coins: this.coins,
      gems: this.gems,
      hasKey: this.challengeCleared,
      message
    });
  }
}