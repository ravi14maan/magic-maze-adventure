import Phaser from "phaser";
import type { CharacterId } from "../data/characters";
import { difficultyForLevel, type ChallengeType, type WorldDefinition } from "../data/worlds";
import { getCharacterArtUrl, getCharacterArtPosition } from "../data/characterArt";
import { WORLD_ART_ORDER, getWorldAtlasUrl } from "../data/worldArt";
import type { CharacterWardrobe } from "../data/profiles";

export interface MazeSession {
  characterId: CharacterId;
  worldIndex: number;
  levelNumber: number;
  challenge: ChallengeType;
  world: WorldDefinition;
  appearance?: CharacterWardrobe;
}
export interface MazeProgress { hearts: number; coins: number; gems: number; hasKey: boolean; walking: boolean; message: string }
export interface MazeReward { coins: number; gems: number; stars: number; challenge: ChallengeType }

type ObstacleKind = "log" | "rock" | "branch" | "monster";
interface Obstacle { x: number; kind: ObstacleKind; sprite: Phaser.GameObjects.GameObject; handled: boolean; prompted: boolean; actionStarted: boolean; bumped: boolean }
interface Pickup { x: number; y: number; kind: "coin" | "gem"; sprite: Phaser.GameObjects.Text; collected: boolean }
interface Gap { left: number; right: number }

const WORLD_LENGTH = 3100;
const STATION_X = 1500;
const FINISH_X = 2940;
const SUPPLIED_ART_BY_CHARACTER: Record<CharacterId, CharacterId> = {
  "normal-girl": "normal-girl",
  "normal-boy": "normal-boy",
  unicorn: "unicorn",
  witch: "witch",
  princess: "princess",
  prince: "princess",
  "male-explorer": "normal-boy",
  knight: "normal-boy",
  mermaid: "mermaid",
  fairy: "fairy",
  "dragon-rider": "dragon-rider",
  "star-explorer": "star-explorer",
  "crystal-knight": "crystal-knight"
};
const HERO_ATLAS_ROW: Record<CharacterId, number> = {
  "normal-girl": 0,
  "normal-boy": 1,
  unicorn: 2,
  witch: 3,
  princess: 4,
  prince: 4,
  "male-explorer": 8,
  knight: 9,
  mermaid: 5,
  fairy: 6,
  "dragon-rider": 7,
  "star-explorer": 8,
  "crystal-knight": 9
};

export class GameScene extends Phaser.Scene {
  private readonly session: MazeSession;
  private readonly onProgress: (p: MazeProgress) => void;
  private readonly onComplete: (r: MazeReward) => void;
  private player!: Phaser.GameObjects.Container;
  private leftLeg!: Phaser.GameObjects.Graphics;
  private rightLeg!: Phaser.GameObjects.Graphics;
  private leftArm!: Phaser.GameObjects.Graphics;
  private rightArm!: Phaser.GameObjects.Graphics;
  private groundY = 0;
  private jumpVelocity = 0;
  private jumping = false;
  private lastGroundedAt = 0;
  private duckUntil = 0;
  private facing = 1;
  private hearts = 5;
  private coins = 0;
  private gems = 0;
  private checkpointX = 120;
  private challengeOpen = false;
  private challengeCleared = false;
  private complete = false;
  private overlayElement?: HTMLDivElement;
  private autoWalkEnabled = false;
  private walkCycle = 0;
  private heroImage?: Phaser.GameObjects.Sprite;
  private heroAnimationKey = "";
  private heroIdleFrame = 0;
  private heroJumpFrame = 3;
  private playerShadow?: Phaser.GameObjects.Ellipse;
  private heroBaseScale = 1;
  private gapZones: Gap[] = [];
  private challengeTimer: number | null = null;
  private readonly gapPrompted = [false, false];
  private readonly gapActionStarted = [false, false];
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

  preload(): void {
    this.load.image("hero-roster-atlas", getCharacterArtUrl("normal-girl"));
    this.load.image("world-atlas", getWorldAtlasUrl());
    this.load.spritesheet("world-bg-atlas", "assets/worlds/world-atlas-hd.webp", {
      frameWidth: 576,
      frameHeight: 384
    });
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    this.groundY = Math.floor(height * 0.77);
    this.lastGroundedAt = this.time.now;
    this.autoWalkEnabled = false;
    this.gapZones = this.buildGapLayout();
    this.buildHeroRunAtlas();
    this.buildWorldAtlasFrames();
    this.cameras.main.setBackgroundColor(this.session.world.sky);
    this.drawWorld(width, height);
    this.drawHero();
    this.cameras.main.setBounds(0, 0, WORLD_LENGTH, height);
    // A little camera lag lets players see the hero advance across the screen.
    this.cameras.main.startFollow(this.player, true, 0.055, 0);
    this.cameras.main.setFollowOffset(-width * 0.12, 0);
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
      this.clearChallengeTimer();
      this.overlayElement?.remove();
      this.overlayElement = undefined;
    });
    this.publish("Your adventure begins! Tap ▶ to walk, ▲ to jump and ▼ to duck.");
  }

  toggleAutoWalk(): boolean {
    if (this.complete || this.challengeOpen || !this.player) return false;
    this.autoWalkEnabled = !this.autoWalkEnabled;
    if (this.autoWalkEnabled) {
      this.facing = 1;
      this.player.setScale(1, this.player.scaleY);
    }
    this.publish(this.autoWalkEnabled ? "▶️ Walking forward! Tap ▲ to jump and ▼ to duck." : "⏸️ Walking paused.");
    return this.autoWalkEnabled;
  }

  move(dx: number, dy: number): void {
    if (this.complete || this.challengeOpen || !this.player) return;
    if (dy < 0) {
      const nearGround = this.player.y >= this.groundY - 8;
      const coyoteWindow = this.time.now - this.lastGroundedAt < 260;
      if (!this.jumping && (nearGround || coyoteWindow)) {
        this.jumping = true;
        this.jumpVelocity = -690;
        this.player.setAngle(-7);
        if (this.heroImage) {
          this.heroImage.setAngle(-8 * this.facing);
          this.heroImage.setScale(this.heroBaseScale * 0.92, this.heroBaseScale * 1.08);
        }
        const pendingObstacle = this.obstacles.find(o => o.prompted && !o.actionStarted && !o.handled);
        if (pendingObstacle) {
          pendingObstacle.actionStarted = true;
          this.autoWalkEnabled = true;
        }
        this.publish("⬆️ Jump! Keep moving to clear the obstacle.");
      }
      return;
    }
    if (dy > 0) {
      this.duckUntil = this.time.now + 1550;
      this.player.setScale(1, 0.72);
      const pendingBranch = this.obstacles.find(o => o.kind === "branch" && o.prompted && !o.actionStarted && !o.handled);
      if (pendingBranch) {
        pendingBranch.actionStarted = true;
        this.autoWalkEnabled = true;
      }
      this.time.delayedCall(1600, () => {
        if (this.player && this.time.now >= this.duckUntil && !this.jumping) this.player.setScale(this.facing, 1);
      });
      this.publish("🙇 Duck! Keep moving under the branch.");
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
      this.tweens.killTweensOf([this.leftLeg, this.rightLeg, this.leftArm, this.rightArm]);
      this.tweens.add({ targets: this.leftLeg, angle: -22, duration: 95, yoyo: true, repeat: 1 });
      this.tweens.add({ targets: this.rightLeg, angle: 22, duration: 95, yoyo: true, repeat: 1 });
      this.tweens.add({ targets: this.leftArm, angle: 14, duration: 95, yoyo: true, repeat: 1 });
      this.tweens.add({ targets: this.rightArm, angle: -14, duration: 95, yoyo: true, repeat: 1 });
      this.tweens.add({ targets: this.player, y: this.groundY - 3, duration: 75, yoyo: true, repeat: 1 });
    }
  }

  update(_time: number, delta: number): void {
    if (!this.player || this.complete || this.challengeOpen) return;
    const dt = Math.min(delta, 40) / 1000;
    if (this.autoWalkEnabled) this.advanceAutoWalk(dt);
    if (this.challengeOpen || this.complete) return;
    const inGap = this.isOverGap(this.player.x);
    if (this.jumping) {
      const jumpHeight = Phaser.Math.Clamp((this.groundY - this.player.y) / 190, 0, 1);
      if (this.heroImage) {
        this.heroImage.anims.stop();
        this.heroImage.setFrame(this.heroJumpFrame);
        this.heroImage.setAngle(-7 * this.facing * jumpHeight);
        this.heroImage.setScale(this.heroBaseScale * (1 - jumpHeight * 0.07), this.heroBaseScale * (1 + jumpHeight * 0.1));
      }
      if (this.playerShadow) {
        this.playerShadow.setScale(1 - jumpHeight * 0.34, 1);
        this.playerShadow.setAlpha(0.38 - jumpHeight * 0.23);
      }
    }
    if (this.jumping || inGap) {
      this.jumpVelocity += 840 * dt;
      this.player.y += this.jumpVelocity * dt;
      if (this.player.y >= this.groundY && !this.isOverGap(this.player.x)) {
        this.player.y = this.groundY;
        this.jumpVelocity = 0;
        this.jumping = false;
        this.player.setScale(this.facing, 1);
        this.player.setAngle(0);
        if (this.heroImage) {
          this.heroImage.anims.stop();
          this.heroImage.setFrame(this.heroIdleFrame);
          this.heroImage.setAngle(0);
          this.heroImage.setScale(this.heroBaseScale);
          this.heroImage.y = 0;
        }
        if (this.playerShadow) {
          this.playerShadow.setScale(1, 1);
          this.playerShadow.setAlpha(0.38);
        }
        this.tweens.add({ targets: this.player, scaleX: this.facing * 1.07, scaleY: 0.93, duration: 95, yoyo: true, ease: "Quad.easeOut" });
        this.time.delayedCall(110, () => {
          if (this.player && !this.jumping) this.player.setScale(this.facing, 1);
        });
        this.emitLandingSparkles();
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
        obstacle.prompted = false;
        obstacle.actionStarted = false;
        obstacle.bumped = false;
        continue;
      }
      // Once a collision has caused a recoil, don't repeatedly damage the
      // player as the auto-run continues past that same obstacle.
      if (obstacle.bumped) continue;
      if (Math.abs(this.player.x - obstacle.x) < 29) {
        const airborne = this.player.y < this.groundY - 58;
        const ducking = this.time.now < this.duckUntil;
        const safe = obstacle.kind === "branch" ? ducking : airborne;
        if (!safe) {
          // Keep the obstacle active after a checkpoint reset so the player
          // must actually clear it on the next attempt.
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

    if (!inGap && this.player.y >= this.groundY - 2) this.lastGroundedAt = this.time.now;
    if (this.autoWalkEnabled && !this.jumping && !inGap && this.time.now > this.duckUntil) {
      this.walkCycle += dt * 10;
      this.leftLeg.angle = Math.sin(this.walkCycle) * 22;
      this.rightLeg.angle = Math.sin(this.walkCycle + Math.PI) * 22;
      this.leftArm.angle = Math.sin(this.walkCycle + Math.PI) * 17;
      this.rightArm.angle = Math.sin(this.walkCycle) * 17;
      const stride = Math.sin(this.walkCycle);
      const bounce = Math.abs(Math.sin(this.walkCycle * 2));
      this.player.y = this.groundY + bounce * 3;
      this.player.setAngle(stride * 2.3);
      if (this.heroImage) {
        if (this.heroAnimationKey && !this.heroImage.anims.isPlaying) this.heroImage.play(this.heroAnimationKey);
        this.heroImage.setAngle(stride * 2.2);
        const stretch = Math.sin(this.walkCycle * 2) * 0.018;
        this.heroImage.setScale(this.heroBaseScale * (1 + stretch), this.heroBaseScale * (1 - stretch * 0.72));
        this.heroImage.y = -bounce * 4.5;
      }
      if (this.playerShadow) {
        this.playerShadow.setScale(1 - bounce * 0.1, 1);
        this.playerShadow.setAlpha(0.34 - bounce * 0.04);
      }
    } else if (!this.autoWalkEnabled && !this.jumping && !inGap) {
      this.leftLeg.angle = 0; this.rightLeg.angle = 0;
      this.leftArm.angle = 0; this.rightArm.angle = 0;
      this.player.setAngle(0);
      if (this.heroImage) {
        this.heroImage.anims.stop();
        this.heroImage.setFrame(this.heroIdleFrame);
        this.heroImage.setAngle(0);
        this.heroImage.setScale(this.heroBaseScale);
        this.heroImage.y = 0;
      }
      if (this.playerShadow) {
        this.playerShadow.setScale(1, 1);
        this.playerShadow.setAlpha(0.38);
      }
    }
    if (this.player.x >= 820 && this.checkpointX < 820) {
      this.checkpointX = 820;
      this.publish("🏕️ Checkpoint saved! You can keep exploring.");
    }
    if (this.player.x >= 2380 && this.checkpointX < 2380) {
      this.checkpointX = 2380;
      this.publish("🏕️ Another checkpoint saved!");
    }
    if (this.player.x >= FINISH_X) this.finishAdventure();
  }

  private buildGapLayout(): Gap[] {
    const rank = difficultyForLevel(this.session.levelNumber, this.session.worldIndex).rank;
    if (rank === 0) return [];
    if (rank === 1) return [{ left: 1100, right: 1190 }];
    const width = Math.min(142, 90 + (rank - 2) * 6);
    return [
      { left: 990, right: 990 + width },
      { left: 2180, right: 2180 + width }
    ];
  }

  private emitLandingSparkles(): void {
    for (let i = 0; i < 7; i++) {
      const particle = this.add.circle(
        this.player.x + (i - 3) * 12,
        this.groundY - 5,
        2 + (i % 3),
        i % 2 ? 0xffe88b : 0xb8fbff,
        0.9
      ).setDepth(22);
      this.tweens.add({
        targets: particle,
        x: particle.x + (i - 3) * 5,
        y: particle.y - 14 - (i % 3) * 6,
        alpha: 0,
        scale: 0.25,
        duration: 360 + i * 24,
        onComplete: () => particle.destroy()
      });
    }
  }

  private drawWorldLandmarks(height: number): void {
    const index = this.session.worldIndex;
    const g = this.add.graphics().setScrollFactor(0.3).setDepth(-2);
    if (index === 1) {
      // Candy Kingdom: giant lollipops, candy canes and gumdrop hills.
      const candy = [0xff5d9e, 0xffcd4f, 0x55d8ca, 0xa979e8];
      for (let i = 0; i < 12; i++) {
        const x = 125 + i * 260;
        const y = height * (0.47 + (i % 3) * 0.055);
        const colour = candy[i % candy.length]!;
        g.fillStyle(colour, 0.92); g.fillCircle(x, y, 48 + (i % 2) * 13);
        g.lineStyle(8, 0xffffff, 0.82); g.strokeCircle(x, y, 42 + (i % 2) * 13);
        g.lineStyle(17, 0xfff0f5, 0.9); g.lineBetween(x, y + 40, x + 14, height * 0.88);
        g.lineStyle(7, 0xff82b8, 0.8); g.lineBetween(x - 25, y - 22, x + 25, y + 22);
      }
      g.fillStyle(0xffe4f4, 0.3);
      for (let i = 0; i < 12; i++) g.fillEllipse(i * 310, height * 0.82, 300, 95);
    } else if (index === 2) {
      // Enchanted Forest: tall trunks, layered canopies and glowing mushrooms.
      for (let i = 0; i < 15; i++) {
        const x = 85 + i * 225;
        const base = height * 0.88;
        g.fillStyle(0x594b42, 0.88); g.fillRoundedRect(x - 16, base - 210 - (i % 3) * 36, 34, 230, 12);
        const leaves = [0x2cae78, 0x49c98b, 0x65ce7c];
        g.fillStyle(leaves[i % 3]!, 0.82);
        g.fillCircle(x, base - 220 - (i % 3) * 36, 75);
        g.fillCircle(x - 48, base - 185 - (i % 2) * 20, 53);
        g.fillCircle(x + 49, base - 187, 55);
      }
      for (let i = 0; i < 14; i++) {
        const x = 65 + i * 245;
        g.fillStyle(0xff8dad, 0.95); g.fillEllipse(x, height * 0.86, 36, 17);
        g.fillStyle(0xfff4e4, 0.95); g.fillRoundedRect(x - 7, height * 0.86, 14, 34, 7);
      }
    } else if (index === 3) {
      // Scary Cave: stalactites, stone shelves and glowing cave crystals.
      g.fillStyle(0x241f45, 0.75);
      for (let i = 0; i < 22; i++) {
        const x = i * 165;
        const h = 65 + (i % 5) * 25;
        g.fillTriangle(x - 30, 0, x + 30, 0, x, h);
        g.fillTriangle(x - 25, height, x + 25, height, x, height - h * 0.8);
      }
      const glow = [0x77efff, 0xc38aff, 0xff8bc8];
      for (let i = 0; i < 18; i++) {
        const x = 100 + i * 205;
        const y = height * (0.58 + (i % 3) * 0.08);
        const colour = glow[i % 3]!;
        g.fillStyle(colour, 0.2); g.fillCircle(x, y, 47);
        g.fillStyle(colour, 0.92);
        g.fillTriangle(x, y - 44, x + 26, y, x, y + 55);
        g.fillTriangle(x, y - 44, x - 26, y, x, y + 55);
      }
    } else if (index === 4) {
      // Frozen Kingdom: blue icebergs and snow banks.
      for (let i = 0; i < 13; i++) {
        const x = 90 + i * 270;
        const y = height * (0.76 + (i % 2) * 0.04);
        g.fillStyle(0x82d9fa, 0.8);
        g.fillTriangle(x - 70, y, x, y - 210 - (i % 3) * 35, x + 77, y);
        g.fillStyle(0xe8fbff, 0.82);
        g.fillTriangle(x - 20, y - 90, x, y - 210 - (i % 3) * 35, x + 28, y - 88);
      }
      g.fillStyle(0xe8fbff, 0.32);
      for (let i = 0; i < 22; i++) g.fillCircle(70 + i * 150, 90 + (i % 4) * 70, 5 + (i % 3));
    } else if (index === 5) {
      // Space: ringed planets, moons and tiny star clusters.
      const planets = [[240, 250, 92, 0x9c78df], [820, 190, 64, 0x53d4d4], [1400, 300, 112, 0xf08cae], [1950, 170, 58, 0xffcf66]];
      for (const [x, y, r, colour] of planets) {
        g.fillStyle(colour, 0.88); g.fillCircle(x!, y!, r!);
        g.lineStyle(10, 0xffffff, 0.42); g.strokeCircle(x!, y!, r! * 0.74);
        g.lineStyle(8, 0xffffff, 0.55); g.strokeEllipse(x! - r! * 0.9, y! - r! * 0.24, r! * 1.8, r! * 0.48);
      }
      g.fillStyle(0xffffff, 0.8);
      for (let i = 0; i < 35; i++) {
        const x = (i * 197) % WORLD_LENGTH;
        const y = 48 + (i * 71) % Math.max(100, height * 0.64);
        g.fillCircle(x, y, 2 + (i % 3));
      }
    } else if (index === 6) {
      // Magic Castle: towers, battlements, glowing windows and royal flags.
      for (let i = 0; i < 5; i++) {
        const x = 220 + i * 620;
        const base = height * 0.82;
        const h = 210 + (i % 3) * 45;
        g.fillStyle(0x725a91, 0.86); g.fillRoundedRect(x, base - h, 130, h, 14);
        g.fillStyle(0xbca3df, 0.92); g.fillTriangle(x - 16, base - h, x + 65, base - h - 110, x + 146, base - h);
        g.fillStyle(0x3c326d, 0.9);
        for (let w = 0; w < 3; w++) g.fillRoundedRect(x + 20 + w * 37, base - 88, 19, 45, 9);
        g.fillStyle(0xffda72, 0.92); g.fillRect(x + 64, base - h - 160, 5, 54);
        g.fillStyle(0xff6caa, 0.95); g.fillTriangle(x + 68, base - h - 158, x + 123, base - h - 137, x + 68, base - h - 119);
      }
    } else if (index === 7) {
      // Ghost World: moon glow, haunted turrets and fog banks.
      g.fillStyle(0xffefbd, 0.82); g.fillCircle(1430, height * 0.18, 105);
      g.fillStyle(0x4d4a87, 0.8);
      for (let i = 0; i < 9; i++) {
        const x = 150 + i * 360;
        const base = height * 0.84;
        g.fillRoundedRect(x, base - 185 - (i % 3) * 30, 110, 185, 8);
        g.fillTriangle(x - 10, base - 185 - (i % 3) * 30, x + 55, base - 250 - (i % 3) * 30, x + 120, base - 185 - (i % 3) * 30);
        g.fillStyle(0x9ed6ef, 0.75); g.fillRoundedRect(x + 26, base - 110, 18, 24, 9); g.fillRoundedRect(x + 67, base - 110, 18, 24, 9);
        g.fillStyle(0x4d4a87, 0.8);
      }
      g.fillStyle(0xc9d4ff, 0.2);
      for (let i = 0; i < 10; i++) g.fillEllipse(i * 300, height * 0.8, 280, 38);
    } else if (index === 8) {
      // Fairy World: oversized flowers, glowing petals and floating light motes.
      const petal = [0xff8ec2, 0xffcf73, 0xb98bff, 0x76ddd1];
      for (let i = 0; i < 16; i++) {
        const x = 100 + i * 220;
        const y = height * (0.56 + (i % 3) * 0.1);
        const colour = petal[i % petal.length]!;
        g.lineStyle(8, 0x3b9b7f, 0.75); g.lineBetween(x, y + 8, x - 3, height * 0.92);
        g.fillStyle(colour, 0.82);
        for (let p = 0; p < 5; p++) {
          const angle = p * Math.PI * 2 / 5;
          g.fillEllipse(x + Math.cos(angle) * 28, y + Math.sin(angle) * 28, 31, 20);
        }
        g.fillStyle(0xffed8d, 0.95); g.fillCircle(x, y, 12);
      }
    } else if (index === 9) {
      // Crystal Cave: translucent crystal clusters with bright cut facets.
      for (let i = 0; i < 18; i++) {
        const x = 80 + i * 210;
        const y = height * (0.78 + (i % 2) * 0.045);
        const h = 110 + (i % 4) * 27;
        const colour = i % 2 ? 0x61d8ff : 0xa888ff;
        g.fillStyle(colour, 0.78);
        g.fillTriangle(x - 33, y, x, y - h, x + 39, y);
        g.fillStyle(0xeaffff, 0.82);
        g.fillTriangle(x, y - h, x + 9, y - 8, x - 6, y - 11);
        g.fillStyle(0xffffff, 0.42);
        g.lineStyle(3, 0xffffff, 0.55); g.lineBetween(x, y - h + 14, x - 10, y - 12);
      }
    } else if (index === 10) {
      // Dragon Valley: layered mountains, waterfall and a distant dragon silhouette.
      g.fillStyle(0x315c66, 0.82);
      g.fillTriangle(0, height * 0.78, 390, height * 0.16, 760, height * 0.78);
      g.fillTriangle(530, height * 0.8, 980, height * 0.1, 1440, height * 0.8);
      g.fillTriangle(1210, height * 0.8, 1510, height * 0.22, 1800, height * 0.8);
      g.fillStyle(0xb2f1f1, 0.72);
      g.fillTriangle(890, height * 0.35, 940, height * 0.63, 980, height * 0.35);
      g.fillStyle(0x93e9ea, 0.55);
      g.fillRect(915, height * 0.43, 28, height * 0.29);
      g.fillStyle(0x193f54, 0.78);
      g.fillEllipse(520, height * 0.25, 96, 25);
      g.fillTriangle(485, height * 0.25, 440, height * 0.15, 505, height * 0.23);
      g.fillTriangle(545, height * 0.25, 596, height * 0.14, 558, height * 0.24);
      g.fillTriangle(488, height * 0.23, 457, height * 0.06, 520, height * 0.22);
      g.fillTriangle(536, height * 0.23, 577, height * 0.04, 549, height * 0.24);
    } else if (index === 11) {
      // Sky Islands: cloud banks and floating grass-topped islands.
      g.fillStyle(0xffffff, 0.28);
      for (let i = 0; i < 12; i++) {
        const x = 120 + i * 270;
        const y = height * (0.42 + (i % 3) * 0.08);
        g.fillEllipse(x, y, 240, 46);
        g.fillEllipse(x + 54, y - 18, 150, 42);
      }
      for (let i = 0; i < 6; i++) {
        const x = 180 + i * 560;
        const y = height * (0.56 + (i % 2) * 0.08);
        g.fillStyle(0x79bd8d, 0.88);
        g.fillEllipse(x, y, 260, 58);
        g.fillStyle(0x5d7196, 0.72);
        g.fillTriangle(x - 116, y + 12, x + 116, y + 12, x, y + 160);
        g.fillStyle(0x9cf0bd, 0.85);
        g.fillEllipse(x - 42, y - 20, 68, 30);
        g.fillEllipse(x + 38, y - 18, 72, 28);
      }
    } else if (index === 12) {
      // Volcano Realm: jagged peaks and glowing lava channels in the distance.
      g.fillStyle(0x4c354a, 0.92);
      for (let i = 0; i < 7; i++) {
        const x = i * 570 - 100;
        g.fillTriangle(x, height * 0.84, x + 285, height * (0.15 + (i % 3) * 0.07), x + 570, height * 0.84);
      }
      g.lineStyle(12, 0xffa23b, 0.78);
      for (let i = 0; i < 6; i++) {
        const x = 250 + i * 510;
        g.beginPath();
        g.moveTo(x, height * 0.36);
        g.lineTo(x + 18, height * 0.55);
        g.lineTo(x - 3, height * 0.74);
        g.strokePath();
      }
      g.fillStyle(0xffd16b, 0.25);
      for (let i = 0; i < 28; i++) g.fillCircle(80 + i * 117, 80 + (i % 5) * 54, 3 + (i % 3));
    } else if (index === 13) {
      // Desert Ruins: warm sandstone arches, pillars and distant dunes.
      g.fillStyle(0xa96b55, 0.55);
      for (let i = 0; i < 5; i++) {
        const x = 250 + i * 690;
        g.fillRoundedRect(x, height * 0.34, 42, height * 0.42, 10);
        g.fillRoundedRect(x + 170, height * 0.34, 42, height * 0.42, 10);
        g.lineStyle(20, 0xe5b57b, 0.65);
        g.beginPath(); g.arc(x + 105, height * 0.35, 105, Math.PI, 0, false); g.strokePath();
        g.fillStyle(0xc18a63, 0.6);
        g.fillRoundedRect(x - 15, height * 0.33, 242, 30, 9);
      }
      g.fillStyle(0xffdb98, 0.33);
      for (let i = 0; i < 14; i++) g.fillEllipse(i * 310, height * 0.77, 330, 90);
    } else if (index === 14) {
      // Rainbow City: colourful distant towers and a luminous rainbow bridge.
      const colours = [0x2b9bd8, 0x8e6be8, 0xe85a9a, 0xf39c43, 0x3bbd9d];
      for (let i = 0; i < 18; i++) {
        const x = 75 + i * 190;
        const top = height * (0.25 + (i % 4) * 0.075);
        g.fillStyle(colours[i % colours.length]!, 0.62);
        g.fillRoundedRect(x, top, 92, height * 0.56, 14);
        g.fillStyle(0xffffff, 0.42);
        for (let w = 0; w < 3; w++) for (let h = 0; h < 3; h++) {
          g.fillRoundedRect(x + 14 + w * 24, top + 25 + h * 44, 10, 17, 4);
        }
      }
      const bridge = this.add.graphics().setScrollFactor(0.25).setDepth(-1);
      bridge.lineStyle(30, 0xff7da9, 0.65); bridge.beginPath(); bridge.arc(920, height * 0.73, 370, Math.PI, 0, false); bridge.strokePath();
      bridge.lineStyle(21, 0xffdc69, 0.65); bridge.beginPath(); bridge.arc(920, height * 0.73, 340, Math.PI, 0, false); bridge.strokePath();
      bridge.lineStyle(17, 0x77e4bd, 0.65); bridge.beginPath(); bridge.arc(920, height * 0.73, 308, Math.PI, 0, false); bridge.strokePath();
      bridge.lineStyle(13, 0x79caff, 0.65); bridge.beginPath(); bridge.arc(920, height * 0.73, 279, Math.PI, 0, false); bridge.strokePath();
    }
  }

  private drawAmbientParallax(width: number, height: number, underwater: boolean): void {
    const themes: string[][] = [
      ["🫧", "🐠", "🪼", "✨", "🐚"],
      ["🍭", "🍬", "🍩", "✨", "🍓"],
      ["🦋", "🍃", "🌼", "✨", "🍄"],
      ["🦇", "🔮", "🕯️", "✨", "🕸️"],
      ["❄️", "🧊", "🌨️", "✨", "⛄"],
      ["⭐", "🪐", "☄️", "✨", "🌙"],
      ["👑", "🏰", "🛡️", "✨", "💫"],
      ["👻", "🌙", "🦇", "✨", "🕯️"],
      ["🧚", "🌸", "🦋", "✨", "🌷"],
      ["💎", "🔷", "🔮", "✨", "🪩"],
      ["🐉", "🥚", "🌿", "✨", "🪽"],
      ["☁️", "🏝️", "🪽", "✨", "⭐"],
      ["🌋", "🔥", "🌋", "✨", "🪨"],
      ["🏜️", "🏺", "🐪", "✨", "🌵"],
      ["🌈", "🏙️", "⭐", "✨", "🎈"]
    ];
    const symbols = themes[this.session.worldIndex] ?? themes[0]!;
    const itemCount = underwater ? 20 : 15;
    for (let i = 0; i < itemCount; i++) {
      const x = 30 + (i * 83) % (width * 2.15);
      const y = 44 + (i * 59) % Math.max(120, height * 0.58);
      const symbol = symbols[i % symbols.length]!;
      const particle = this.add.text(x, y, symbol, {
        fontFamily: "system-ui",
        fontSize: (underwater ? 17 + (i % 4) * 5 : 20 + (i % 3) * 7) + "px"
      }).setOrigin(0.5).setAlpha(underwater ? 0.28 : 0.22)
        .setScrollFactor(0.16 + (i % 3) * 0.08)
        .setDepth(0);
      this.tweens.add({
        targets: particle,
        y: y - 12 - (i % 4) * 5,
        angle: i % 2 ? 12 : -12,
        alpha: underwater ? 0.42 : 0.36,
        duration: 1900 + (i % 5) * 370,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    // Soft foreground glints move at a different depth from the distant icons.
    for (let i = 0; i < 12; i++) {
      const x = 45 + (i * 97) % width;
      const y = 24 + (i * 71) % Math.max(100, height * 0.68);
      const glint = this.add.circle(x, y, 2 + (i % 3), 0xe5ffff, 0.24)
        .setScrollFactor(0.46)
        .setDepth(0);
      this.tweens.add({
        targets: glint,
        alpha: 0.75,
        scale: 1.8,
        duration: 1200 + (i % 4) * 260,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private drawWorld(width: number, height: number): void {
    const floor = this.session.world.floor;
    const accent = this.session.world.accent;
    const underwater = this.session.worldIndex === 0;

    if (underwater) {
      // Deep-to-surface ocean gradient: bright shafts above, rich blue water below.
      const hdOcean = this.textures.exists("world-bg-atlas");
      if (hdOcean) {
        const ocean = this.add.tileSprite(0, 0, WORLD_LENGTH, height, "world-bg-atlas", 0)
          .setOrigin(0, 0).setDepth(-7).setScrollFactor(0.14);
        ocean.setTileScale(height / 384, height / 384);
      } else {
        const water = this.add.graphics().setDepth(-7);
        water.fillGradientStyle(0x39d9f2, 0x19a6d5, 0x075a9c, 0x032d61, 1);
        water.fillRect(0, 0, WORLD_LENGTH, height);
      }

      // Sun rays break up the large open water area and move gently with the current.
      for (let i = 0; i < 9; i++) {
        const x = 100 + i * 365;
        const ray = this.add.graphics();
        ray.fillStyle(0xb9f6ff, 0.10 + (i % 3) * 0.025);
        ray.fillTriangle(x, 0, x + 105, 0, x + 315, this.groundY + 12);
        this.tweens.add({ targets: ray, alpha: 0.52, duration: 2400 + (i % 3) * 450, yoyo: true, repeat: -1 });
      }

      // Blue silhouettes of reef ridges and a distant seabed give the route depth.
      const reef = this.add.graphics();
      reef.fillStyle(0x064e7d, 0.64);
      for (let i = 0; i < 12; i++) {
        reef.fillEllipse(70 + i * 285, this.groundY - 46 - (i % 3) * 28, 410, 180 + (i % 2) * 45);
      }
      reef.fillStyle(0x0b7192, 0.46);
      for (let i = 0; i < 14; i++) {
        reef.fillEllipse(120 + i * 245, this.groundY + 25, 300, 100);
      }

      // Ancient submerged columns and broken arches form recognisable landmarks.
      for (const ruinX of [250, 1040, 1810, 2670]) {
        const ruin = this.add.graphics();
        ruin.fillStyle(0x496f83, 0.78);
        ruin.fillRoundedRect(ruinX, this.groundY - 255, 28, 185, 7);
        ruin.fillRoundedRect(ruinX + 100, this.groundY - 255, 28, 185, 7);
        ruin.fillRoundedRect(ruinX - 13, this.groundY - 265, 155, 20, 5);
        ruin.lineStyle(12, 0x5a8996, 0.72);
        ruin.beginPath();
        ruin.arc(ruinX + 64, this.groundY - 249, 62, Math.PI, 0, false);
        ruin.strokePath();
        ruin.lineStyle(3, 0xa7d2c9, 0.36);
        ruin.lineBetween(ruinX + 8, this.groundY - 210, ruinX + 8, this.groundY - 100);
        ruin.lineBetween(ruinX + 108, this.groundY - 210, ruinX + 108, this.groundY - 100);
      }

      // Schools of fish are drawn as small independent shapes, not emoji clouds.
      const fishColours = [0xff9d3b, 0x21d4d0, 0xff5e9b, 0xffd84b, 0x79e7ff];
      for (let i = 0; i < 24; i++) {
        const x = 80 + i * 128;
        const y = 95 + (i % 5) * 64;
        const scale = 0.62 + (i % 3) * 0.15;
        const fish = this.add.graphics();
        fish.fillStyle(fishColours[i % fishColours.length]!, 0.94);
        fish.fillEllipse(0, 0, 34 * scale, 19 * scale);
        fish.fillTriangle(-15 * scale, 0, -29 * scale, -12 * scale, -29 * scale, 12 * scale);
        fish.fillStyle(0xffffff, 1);
        fish.fillCircle(10 * scale, -3 * scale, 3 * scale);
        fish.fillStyle(0x082d4b, 1);
        fish.fillCircle(11 * scale, -3 * scale, 1.5 * scale);
        fish.setPosition(x, y);
        this.tweens.add({ targets: fish, x: x + 34 + (i % 4) * 15, y: y - 7, duration: 2600 + (i % 5) * 300, yoyo: true, repeat: -1 });
      }

      // Seaweed sways at the reef floor in rich greens, turquoise and coral pink.
      for (let i = 0; i < 18; i++) {
        const x = 25 + i * 178;
        const colour = [0x13b89e, 0x43d6a1, 0x0b9a85, 0xf26b9b][i % 4]!;
        const plant = this.add.graphics();
        plant.lineStyle(7 + (i % 2) * 2, colour, 0.98);
        plant.beginPath(); plant.moveTo(x, this.groundY + 9); plant.lineTo(x - 10, this.groundY - 48); plant.lineTo(x + 14, this.groundY - 103); plant.strokePath();
        plant.beginPath(); plant.moveTo(x - 4, this.groundY - 30); plant.lineTo(x - 32, this.groundY - 66); plant.strokePath();
        plant.beginPath(); plant.moveTo(x + 8, this.groundY - 59); plant.lineTo(x + 38, this.groundY - 91); plant.strokePath();
        this.tweens.add({ targets: plant, angle: i % 2 ? 6 : -6, duration: 1500 + (i % 4) * 250, yoyo: true, repeat: -1 });
      }

      // Branching reef coral in saturated pink, red, orange and purple.
      for (let i = 0; i < 16; i++) {
        const x = 85 + i * 205;
        const y = this.groundY - 16 - (i % 3) * 12;
        const colour = [0xff5fa7, 0xff784e, 0x9f70ed, 0xffb33f, 0x2fe1d1][i % 5]!;
        const coral = this.add.graphics();
        coral.lineStyle(8, colour, 0.98);
        coral.beginPath(); coral.moveTo(x, y); coral.lineTo(x - 7, y - 36); coral.lineTo(x - 22, y - 58); coral.strokePath();
        coral.beginPath(); coral.moveTo(x - 7, y - 36); coral.lineTo(x + 10, y - 62); coral.lineTo(x + 12, y - 81); coral.strokePath();
        coral.beginPath(); coral.moveTo(x + 4, y - 47); coral.lineTo(x + 30, y - 58); coral.strokePath();
        coral.fillStyle(colour, 1);
        coral.fillCircle(x - 22, y - 58, 5); coral.fillCircle(x + 12, y - 81, 5); coral.fillCircle(x + 30, y - 58, 5);
      }

      // Bubble trails in several sizes drift upward across the full playfield.
      for (let i = 0; i < 48; i++) {
        const x = 28 + (i * 173) % (WORLD_LENGTH - 45);
        const y = 45 + (i * 79) % (this.groundY - 70);
        const radius = 3 + (i % 5) * 2;
        const bubble = this.add.circle(x, y, radius, 0xc9f8ff, 0.12).setStrokeStyle(1.5, 0xe7ffff, 0.58);
        this.tweens.add({ targets: bubble, y: y - 40 - (i % 4) * 8, alpha: 0.03, duration: 2800 + (i % 5) * 420, yoyo: true, repeat: -1 });
      }
    } else {
      const hdBackdropFrame: Record<string, number> = { candy: 1, forest: 2, crystal: 3 };
      const selectedFrame = hdBackdropFrame[this.session.world.backdrop];
      const hasHdBackdrop = selectedFrame !== undefined && this.textures.exists("world-bg-atlas");
      const background = hasHdBackdrop
        ? this.add.tileSprite(0, 0, WORLD_LENGTH, height, "world-bg-atlas", selectedFrame)
        : this.add.tileSprite(0, 0, WORLD_LENGTH, height, "world-atlas", this.session.world.backdrop);
      background.setOrigin(0, 0).setDepth(-6).setScrollFactor(0.16);
      const backgroundScale = hasHdBackdrop ? height / 384 : height / 540;
      background.setTileScale(backgroundScale, backgroundScale);
      for (let i = 0; i < 16; i++) {
        const x = 65 + i * 205;
        this.add.ellipse(x, this.groundY - 54 - (i % 3) * 15, 340, 150, accent, 0.20);
        const sceneryByWorld: string[][] = [
          ["🐠", "🪸", "🐬"], ["🍭", "🍬", "🍩"], ["🌳", "🌼", "🍄"],
          ["🦇", "🔮", "🕸️"], ["🌲", "⛄", "❄️"], ["🪐", "⭐", "🚀"],
          ["🏰", "🛡️", "👑"], ["👻", "🌙", "🦇"], ["🌷", "🧚", "🦋"],
          ["💎", "🔷", "🔮"], ["🐉", "🥚", "🏞️"], ["☁️", "🏝️", "🪽"],
          ["🌋", "🔥", "🪨"], ["🏜️", "🏺", "🐪"], ["🌈", "🏙️", "⭐"]
        ];
        const scenery = sceneryByWorld[this.session.worldIndex] ?? ["🌳", "🌼", "🍄"];
        this.add.text(x, this.groundY - 115 - (i % 2) * 24, scenery[i % scenery.length]!, {
          fontFamily: "system-ui", fontSize: "43px"
        });
      }
    }

    this.drawAmbientParallax(width, height, underwater);
    this.drawWorldLandmarks(height);

    const groundSegments: Array<[number, number]> = [];
    let segmentStart = 0;
    for (const gap of this.gapZones) {
      groundSegments.push([segmentStart, gap.left]);
      segmentStart = gap.right;
    }
    groundSegments.push([segmentStart, WORLD_LENGTH]);
    for (const [start, end] of groundSegments) {
      const platformColour = underwater ? 0x28616d : floor;
      const topColour = underwater ? 0x36c8d0 : accent;
      this.add.rectangle((start + end) / 2, this.groundY + 95, end - start, 190, platformColour);
      this.add.rectangle((start + end) / 2, this.groundY + 5, end - start, 18, topColour);
      this.add.rectangle((start + end) / 2, this.groundY - 4, end - start, 4, underwater ? 0xc1fff5 : 0xffffff, 0.72);
      if (underwater) {
        const stones = this.add.graphics();
        stones.lineStyle(2, 0x93e0d7, 0.32);
        for (let x = start + 12; x < end - 18; x += 62) {
          stones.strokeRoundedRect(x, this.groundY + 34 + ((x / 62) % 2) * 20, 52, 28, 5);
          stones.lineBetween(x + 10, this.groundY + 73, x + 44, this.groundY + 73);
        }
      }
    }

    for (const gap of this.gapZones) {
      this.add.rectangle((gap.left + gap.right) / 2, this.groundY + 24, gap.right - gap.left, 48, underwater ? 0x021c48 : 0x35435a, 0.96);
      if (underwater) {
        this.add.text((gap.left + gap.right) / 2, this.groundY + 45, "🫧", { fontFamily: "system-ui", fontSize: "22px" }).setOrigin(0.5);
      } else {
        this.add.text((gap.left + gap.right) / 2, this.groundY + 45, "⬇️", { fontFamily: "system-ui", fontSize: "22px" }).setOrigin(0.5);
      }
    }

    const difficulty = difficultyForLevel(this.session.levelNumber, this.session.worldIndex);
    let seed = (this.session.worldIndex + 1) * 997 + this.session.levelNumber * 131;
    const random = (): number => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const obstacleKinds: ObstacleKind[] = difficulty.rank === 0
      ? ["log", "rock"]
      : difficulty.rank < 3
        ? ["log", "rock", "monster"]
        : ["log", "rock", "monster", "branch"];
    const obstacleDefs: Array<[number, ObstacleKind]> = [];
    const obstacleCount = difficulty.hazardCount;
    const routeStart = 290;
    const routeEnd = FINISH_X - 210;
    for (let i = 0; i < obstacleCount; i++) {
      const progress = (i + 0.5 + (random() - 0.5) * 0.45) / obstacleCount;
      let x = Math.round(routeStart + progress * (routeEnd - routeStart));
      // Keep a clear approach to the challenge station and enough room around gaps.
      if (Math.abs(x - STATION_X) < 175) x = x < STATION_X ? STATION_X - 190 : STATION_X + 190;
      for (const gap of this.gapZones) {
        if (Math.abs(x - gap.left) < 155) x = gap.left - 165;
        else if (Math.abs(x - gap.right) < 155) x = gap.right + 165;
      }
      x = Phaser.Math.Clamp(x, routeStart, routeEnd);
      const kind = obstacleKinds[Math.floor(random() * obstacleKinds.length)]!;
      obstacleDefs.push([x, kind]);
    }
    obstacleDefs.sort((a, b) => a[0] - b[0]);

    for (const [x, kind] of obstacleDefs) {
      let sprite: Phaser.GameObjects.GameObject;
      const y = kind === "branch" ? this.groundY - 150 : this.groundY - 27;
      if (kind === "monster") {
        const monster = this.add.container(x, y).setDepth(14);
        const body = this.add.graphics();
        body.fillStyle(0x633bc2, 1);
        body.fillRoundedRect(-29, -29, 58, 54, 20);
        body.fillTriangle(-24, -16, -34, -43, -7, -28);
        body.fillTriangle(24, -16, 34, -43, 7, -28);
        body.fillStyle(0x8f66ea, 1);
        body.fillCircle(-16, -20, 10);
        body.fillCircle(16, -20, 10);
        body.fillStyle(0xffffff, 1);
        body.fillEllipse(-12, -5, 14, 18);
        body.fillEllipse(12, -5, 14, 18);
        body.fillStyle(0x1b1641, 1);
        body.fillCircle(-10, -3, 5);
        body.fillCircle(10, -3, 5);
        body.fillStyle(0xfff5a6, 1);
        body.fillTriangle(-13, 10, -6, 10, -10, 18);
        body.fillTriangle(7, 10, 14, 10, 10, 18);
        body.lineStyle(3, 0x341c76, 1);
        body.beginPath(); body.arc(0, 4, 13, 0.2, Math.PI - 0.2, false); body.strokePath();
        body.fillStyle(0x48e5d1, 1);
        body.fillCircle(-26, 11, 5);
        body.fillCircle(26, 11, 5);
        monster.add(body);
        const eyesGlow = this.add.circle(0, -5, 27, 0xffdb5e, 0.08);
        monster.add(eyesGlow);
        this.tweens.add({ targets: monster, y: y - 12 - difficulty.rank, angle: 5, duration: Math.max(320, 760 / difficulty.obstacleSpeed), yoyo: true, repeat: -1 });
        sprite = monster;
      } else {
        const icon: Record<Exclude<ObstacleKind, "monster">, string> = { log: "🪵", rock: "🪨", branch: "🌿" };
        const text = this.add.text(x, y, icon[kind], {
          fontFamily: "system-ui", fontSize: kind === "branch" ? "49px" : "42px"
        }).setOrigin(0.5).setDepth(14);
        if (kind === "rock") this.tweens.add({ targets: text, x: x + 22 + difficulty.rank * 2, duration: Math.max(260, 620 / difficulty.obstacleSpeed), yoyo: true, repeat: -1 });
        sprite = text;
      }
      this.obstacles.push({ x, kind, sprite, handled: false, prompted: false, actionStarted: false, bumped: false });
    }

    for (const gap of this.gapZones) {
      const x = (gap.left + gap.right) / 2 - 42;
      const cue = this.add.text(x, this.groundY - 74, "⬆ JUMP!", {
        fontFamily: "system-ui", fontSize: "15px", fontStyle: "bold", color: "#ffffff",
        backgroundColor: "#087fa6", padding: { x: 7, y: 4 }
      }).setOrigin(0.5);
      this.tweens.add({ targets: cue, y: cue.y - 8, alpha: 0.55, duration: 560, yoyo: true, repeat: -1 });
    }

    const pickupDefs: Array<[number, number, "coin" | "gem"]> = [];
    const pickupCount = 8 + Math.floor(difficulty.rank * 0.9);
    for (let i = 0; i < pickupCount; i++) {
      const progress = (i + 0.5 + (random() - 0.5) * 0.55) / pickupCount;
      let x = Math.round(185 + progress * (FINISH_X - 365));
      if (Math.abs(x - STATION_X) < 100) x += x < STATION_X ? -105 : 105;
      const y = this.groundY - 74 - Math.round(random() * (40 + difficulty.rank * 4));
      const kind: "coin" | "gem" = random() > (0.72 - difficulty.rank * 0.015) ? "gem" : "coin";
      pickupDefs.push([x, y, kind]);
    }
    for (const [x, y, kind] of pickupDefs) {
      const sprite = this.add.text(x, y, kind === "coin" ? "🪙" : "💎", {
        fontFamily: "system-ui", fontSize: "28px"
      }).setOrigin(0.5);
      this.tweens.add({ targets: sprite, y: y - 9, angle: 12, duration: 650, yoyo: true, repeat: -1 });
      this.pickups.push({ x, y, kind, sprite, collected: false });
    }

    this.add.text(STATION_X, this.groundY - 125, "✨ CHALLENGE ✨", {
      fontFamily: "system-ui", fontSize: "18px", fontStyle: "bold", color: "#ffffff",
      backgroundColor: "#76539b", padding: { x: 10, y: 7 }
    }).setOrigin(0.5);
    this.add.text(STATION_X, this.groundY - 45, underwater ? "🐚" : "🎪", { fontFamily: "system-ui", fontSize: "58px" }).setOrigin(0.5);
    this.add.text(FINISH_X, this.groundY - 72, "🏁 🏆", { fontFamily: "system-ui", fontSize: "52px" }).setOrigin(0.5);
    this.add.text(width * 0.5, 8, this.session.world.name + "  •  LEVEL " + this.session.levelNumber, {
      fontFamily: "system-ui", fontSize: "12px", fontStyle: "bold", color: "#ffffff",
      backgroundColor: "#00000066", padding: { x: 9, y: 5 }
    }).setOrigin(0.5, 0).setScrollFactor(0);
  }

  private buildWorldAtlasFrames(): void {
    const atlas = this.textures.get("world-atlas");
    WORLD_ART_ORDER.forEach((backdrop, index) => {
      atlas.add(backdrop, 0, (index % 4) * 960, Math.floor(index / 4) * 540, 960, 540);
    });
  }

  private buildHeroRunAtlas(): void {
    const frameWidth = 128;
    const frameHeight = 192;
    const ids: CharacterId[] = [
      "normal-girl", "normal-boy", "unicorn", "witch", "princess",
      "mermaid", "fairy", "dragon-rider", "star-explorer", "crystal-knight"
    ];
    const sheet = this.textures.get("hero-roster-atlas").getSourceImage() as HTMLImageElement;
    const atlas = document.createElement("canvas");
    atlas.width = frameWidth * 4;
    atlas.height = frameHeight * ids.length;
    const atlasContext = atlas.getContext("2d");
    if (!atlasContext || !sheet) return;

    const makeCharacterFrame = (id: CharacterId): HTMLCanvasElement => {
      const position = getCharacterArtPosition(id);
      const sourceCell = document.createElement("canvas");
      sourceCell.width = position.cellWidth;
      sourceCell.height = position.cellHeight;
      const sourceContext = sourceCell.getContext("2d");
      if (!sourceContext) return sourceCell;
      sourceContext.drawImage(
        sheet,
        position.column * position.cellWidth,
        position.row * position.cellHeight,
        position.cellWidth,
        position.cellHeight,
        0,
        0,
        position.cellWidth,
        position.cellHeight
      );

      const frame = document.createElement("canvas");
      frame.width = frameWidth;
      frame.height = frameHeight;
      const frameContext = frame.getContext("2d");
      if (!frameContext) return frame;
      const scale = Math.min(118 / position.cellWidth, 178 / position.cellHeight);
      const width = position.cellWidth * scale;
      const height = position.cellHeight * scale;
      frameContext.drawImage(sourceCell, (frameWidth - width) / 2, frameHeight - height - 4, width, height);
      return frame;
    };

    const drawPose = (
      ctx: CanvasRenderingContext2D,
      base: HTMLCanvasElement,
      x: number,
      row: number,
      frame: number,
      id: CharacterId
    ): void => {
      const top = row * frameHeight;
      if (frame === 0) {
        ctx.drawImage(base, x, top);
        return;
      }
      if (frame === 3) {
        ctx.save();
        ctx.translate(x + frameWidth / 2, top + frameHeight * 0.56);
        ctx.rotate(-0.075);
        ctx.translate(-(x + frameWidth / 2), -(top + frameHeight * 0.56));
        ctx.drawImage(base, x, top - 8);
        ctx.restore();
        return;
      }

      const phase = frame === 1 ? 1 : -1;
      const nonHuman = id === "unicorn" || id === "mermaid";
      if (!nonHuman) {
        const cutY = Math.floor(frameHeight * (
          id === "normal-boy" || id === "star-explorer" || id === "crystal-knight" ? 0.69 : 0.73
        ));
        ctx.save();
        ctx.beginPath(); ctx.rect(x, top + cutY, frameWidth / 2, frameHeight - cutY); ctx.clip();
        ctx.translate(x + frameWidth * 0.25, top + cutY);
        ctx.rotate(-phase * 0.22);
        ctx.translate(-(x + frameWidth * 0.25), -(top + cutY));
        ctx.drawImage(base, x, top);
        ctx.restore();

        ctx.save();
        ctx.beginPath(); ctx.rect(x + frameWidth / 2, top + cutY, frameWidth / 2, frameHeight - cutY); ctx.clip();
        ctx.translate(x + frameWidth * 0.75, top + cutY);
        ctx.rotate(phase * 0.22);
        ctx.translate(-(x + frameWidth * 0.75), -(top + cutY));
        ctx.drawImage(base, x, top);
        ctx.restore();

        ctx.save();
        ctx.beginPath(); ctx.rect(x, top, frameWidth, cutY + 2); ctx.clip();
        ctx.drawImage(base, x, top);
        ctx.restore();
        return;
      }

      ctx.save();
      ctx.translate(x + frameWidth / 2, top + frameHeight * 0.56);
      ctx.rotate(phase * (id === "mermaid" ? 0.075 : 0.045));
      ctx.translate(-(x + frameWidth / 2), -(top + frameHeight * 0.56));
      ctx.drawImage(base, x, top + (frame === 1 ? -2 : 0));
      ctx.restore();
    };

    ids.forEach((id, row) => {
      const base = makeCharacterFrame(id);
      for (let frame = 0; frame < 4; frame++) drawPose(atlasContext, base, frame * frameWidth, row, frame, id);
    });

    if (this.textures.exists("hero-run-atlas")) this.textures.remove("hero-run-atlas");
    const atlasTexture = this.textures.addCanvas("hero-run-atlas", atlas);
    if (!atlasTexture) return;
    for (let row = 0; row < ids.length; row++) {
      for (let frame = 0; frame < 4; frame++) {
        const frameIndex = row * 4 + frame;
        atlasTexture.add(String(frameIndex), 0, frame * frameWidth, row * frameHeight, frameWidth, frameHeight);
      }
    }
  }

  private drawHero(): void {
    const suppliedArtId = SUPPLIED_ART_BY_CHARACTER[this.session.characterId];
    const row = HERO_ATLAS_ROW[this.session.characterId];
    const firstFrame = row * 4;
    const key = "hero-run-atlas";
    if (this.textures.exists(key)) {
      const animationKey = "hero-run-" + suppliedArtId;
      if (!this.anims.exists(animationKey)) {
        this.anims.create({
          key: animationKey,
          frames: this.anims.generateFrameNumbers(key, { start: firstFrame, end: firstFrame + 2 }),
          frameRate: 9,
          repeat: -1
        });
      }
      const shadow = this.add.ellipse(0, -2, 66, 15, 0x001b3c, 0.38);
      const heroImage = this.add.sprite(0, 0, key, firstFrame).setOrigin(0.5, 1);
      const scale = Math.min(154 / 128, 218 / 192);
      heroImage.setScale(scale);
      heroImage.setPosition(0, 0);
      this.heroImage = heroImage;
      this.heroAnimationKey = animationKey;
      this.heroIdleFrame = firstFrame;
      this.heroJumpFrame = firstFrame + 3;
      this.heroBaseScale = scale;
      this.playerShadow = shadow;
      this.leftLeg = this.add.graphics();
      this.rightLeg = this.add.graphics();
      this.leftArm = this.add.graphics();
      this.rightArm = this.add.graphics();
      const wardrobe = this.session.appearance ?? { hairstyle: "🌸", outfit: "👗", accessory: "✨" };
      const hairBadge = this.add.text(-48, -178, wardrobe.hairstyle, { fontFamily: "system-ui", fontSize: "19px" }).setOrigin(0.5);
      const outfitBadge = this.add.text(48, -94, wardrobe.outfit, { fontFamily: "system-ui", fontSize: "18px" }).setOrigin(0.5);
      const accessoryBadge = this.add.text(48, -171, wardrobe.accessory, { fontFamily: "system-ui", fontSize: "17px" }).setOrigin(0.5);
      const children: Phaser.GameObjects.GameObject[] = [shadow, heroImage, hairBadge, outfitBadge, accessoryBadge];
      this.player = this.add.container(120, this.groundY, children).setDepth(20);
      return;
    }

    const isBoy = this.session.characterId === "normal-boy" || this.session.characterId === "prince" ||
      this.session.characterId === "male-explorer" || this.session.characterId === "knight";
    const defaultOutfit = isBoy ? "🦺" : "👗";
    const appearance = this.session.appearance ?? { hairstyle: "🎀", outfit: defaultOutfit, accessory: "✨" };
    const heroPalettes: Record<CharacterId, { hair: number; eyes: number; main: number; shade: number; trim: number }> = {
      "normal-girl": { hair: 0x5b2e38, eyes: 0x653b9c, main: 0xff4e9b, shade: 0xc92e78, trim: 0xffe66b },
      "normal-boy": { hair: 0x382b32, eyes: 0x2986ba, main: 0x168ee0, shade: 0x0c579f, trim: 0xffd35b },
      unicorn: { hair: 0xa24bbd, eyes: 0x328dcb, main: 0x9b68f5, shade: 0x6841c5, trim: 0x79edfa },
      witch: { hair: 0x3b245b, eyes: 0x6b4bc0, main: 0x7544c8, shade: 0x49258d, trim: 0xffd65c },
      princess: { hair: 0x813c2f, eyes: 0x3d8eae, main: 0xbd60ef, shade: 0x7e32b6, trim: 0xffdf62 },
      prince: { hair: 0x402b2d, eyes: 0x3286d1, main: 0x2674d8, shade: 0x17458f, trim: 0xffd45b },
      "male-explorer": { hair: 0x684126, eyes: 0x3f9a76, main: 0x24a889, shade: 0x14745f, trim: 0xf4c34e },
      knight: { hair: 0x4a5262, eyes: 0x4b8fca, main: 0x9db2c6, shade: 0x596d89, trim: 0xffdf71 },
      mermaid: { hair: 0x0b8fa7, eyes: 0x218fc1, main: 0x21c9bc, shade: 0x087e9a, trim: 0xff85c6 },
      fairy: { hair: 0xe69ad4, eyes: 0x5b6cc8, main: 0xb987ef, shade: 0x805acb, trim: 0x8bf0e2 },
      "dragon-rider": { hair: 0x9b5739, eyes: 0x365d9c, main: 0x36ad9b, shade: 0x1b756c, trim: 0xffcf6b },
      "star-explorer": { hair: 0x44364e, eyes: 0x3a66ad, main: 0x438be0, shade: 0x2854aa, trim: 0xffdc73 },
      "crystal-knight": { hair: 0x463c61, eyes: 0x47529d, main: 0x91bce0, shade: 0x566baf, trim: 0xc6f7ff }
    };
    const hero = heroPalettes[this.session.characterId];
    const outfitPalette: Record<string, { main: number; shade: number; trim: number }> = {
      "👗": { main: hero.main, shade: hero.shade, trim: hero.trim },
      "🥋": { main: 0xfff8ef, shade: 0xd7b9b1, trim: 0xff91c2 },
      "🦺": { main: hero.main, shade: hero.shade, trim: hero.trim },
      "🧥": { main: 0x8656db, shade: 0x5738a4, trim: 0xffdf70 },
      "👑": { main: 0xffa2c8, shade: 0xc54b91, trim: 0xffe66b },
      "🩱": { main: 0x16c6bb, shade: 0x087f9f, trim: 0xff8bd0 }
    };
    const palette = outfitPalette[appearance.outfit] ?? { main: hero.main, shade: hero.shade, trim: hero.trim };
    const skin = 0xffd0af;

    const shadow = this.add.ellipse(0, -2, 50, 13, 0x001d43, 0.34);
    const backHair = this.add.graphics();
    backHair.fillStyle(hero.hair, 1);
    backHair.fillEllipse(0, -84, isBoy ? 41 : 48, isBoy ? 38 : 54);
    if (!isBoy) {
      backHair.fillEllipse(-20, -62, 17, 42);
      backHair.fillEllipse(20, -61, 17, 44);
      backHair.fillTriangle(-25, -51, -8, -53, -24, -25);
      backHair.fillTriangle(23, -50, 9, -52, 26, -27);
    }

    const leftLeg = this.add.graphics();
    leftLeg.lineStyle(7, 0x3c3155, 1);
    leftLeg.beginPath(); leftLeg.moveTo(0, 0); leftLeg.lineTo(-3, 15); leftLeg.strokePath();
    leftLeg.fillStyle(0xffd05b, 1); leftLeg.fillRoundedRect(-11, 12, 18, 8, 4);
    leftLeg.setPosition(-7, -15);
    const rightLeg = this.add.graphics();
    rightLeg.lineStyle(7, 0x3c3155, 1);
    rightLeg.beginPath(); rightLeg.moveTo(0, 0); rightLeg.lineTo(3, 15); rightLeg.strokePath();
    rightLeg.fillStyle(0xffd05b, 1); rightLeg.fillRoundedRect(-6, 12, 18, 8, 4);
    rightLeg.setPosition(7, -15);
    this.leftLeg = leftLeg;
    this.rightLeg = rightLeg;

    const leftArm = this.add.graphics();
    leftArm.lineStyle(9, skin, 1);
    leftArm.beginPath(); leftArm.moveTo(0, 0); leftArm.lineTo(-7, 17); leftArm.strokePath();
    leftArm.fillStyle(skin, 1); leftArm.fillCircle(-7, 18, 5);
    leftArm.setPosition(-14, -47);
    const rightArm = this.add.graphics();
    rightArm.lineStyle(9, skin, 1);
    rightArm.beginPath(); rightArm.moveTo(0, 0); rightArm.lineTo(7, 17); rightArm.strokePath();
    rightArm.fillStyle(skin, 1); rightArm.fillCircle(7, 18, 5);
    rightArm.setPosition(14, -47);
    this.leftArm = leftArm;
    this.rightArm = rightArm;

    const clothes = this.add.graphics();
    clothes.fillStyle(palette.shade, 1);
    clothes.fillRoundedRect(-15, -54, 30, 29, 9);
    clothes.fillStyle(palette.main, 1);
    clothes.fillRoundedRect(-13, -53, 26, 26, 8);
    if (isBoy) {
      clothes.fillRoundedRect(-14, -30, 28, 17, 5);
      clothes.fillStyle(palette.shade, 1);
      clothes.fillRoundedRect(-13, -15, 11, 9, 3);
      clothes.fillRoundedRect(2, -15, 11, 9, 3);
      clothes.fillStyle(palette.trim, 1);
      clothes.fillTriangle(-4, -50, 0, -41, 4, -50);
      clothes.fillCircle(0, -31, 3);
    } else {
      // Layered, flared fantasy dress with a bright bodice, skirt and trim.
      clothes.fillStyle(palette.shade, 1);
      clothes.fillTriangle(-12, -32, 12, -32, -24, -1);
      clothes.fillTriangle(12, -32, 24, -1, -24, -1);
      clothes.fillStyle(palette.main, 1);
      clothes.fillTriangle(-10, -32, 10, -32, -20, -4);
      clothes.fillTriangle(10, -32, 20, -4, -20, -4);
      clothes.fillStyle(palette.trim, 1);
      clothes.fillRoundedRect(-13, -34, 26, 5, 2);
      clothes.lineStyle(2, 0xffffff, 0.9);
      clothes.lineBetween(-19, -5, 19, -5);
      clothes.fillStyle(0xffffff, 0.9);
      clothes.fillCircle(-9, -13, 2); clothes.fillCircle(0, -8, 2); clothes.fillCircle(9, -13, 2);
      clothes.fillStyle(palette.trim, 1);
      clothes.fillCircle(0, -29, 4);
      clothes.fillTriangle(-6, -52, 0, -44, 6, -52);
      // Tiny shoulder frills make the dress read as clothing rather than a block.
      clothes.fillCircle(-13, -46, 5); clothes.fillCircle(13, -46, 5);
    }

    const head = this.add.graphics();
    head.fillStyle(skin, 1);
    head.fillCircle(0, -78, 21);
    head.lineStyle(1.4, 0xe9a78f, 1);
    head.strokeCircle(0, -78, 21);

    const frontHair = this.add.graphics();
    frontHair.fillStyle(hero.hair, 1);
    frontHair.fillEllipse(0, -94, 45, 22);
    frontHair.fillCircle(-15, -84, 9);
    frontHair.fillCircle(-3, -87, 8);
    frontHair.fillCircle(9, -85, 8);
    if (isBoy) {
      frontHair.fillTriangle(-18, -91, -23, -105, -7, -93);
      frontHair.fillTriangle(-3, -92, 1, -108, 8, -93);
      frontHair.fillTriangle(8, -92, 17, -103, 17, -86);
    } else {
      frontHair.fillEllipse(-21, -74, 11, 30);
      frontHair.fillEllipse(21, -74, 11, 30);
    }
    frontHair.lineStyle(2, 0xffdfab, 0.72);
    frontHair.lineBetween(-17, -99, -7, -102);
    frontHair.lineBetween(2, -101, 13, -99);

    // Big anime-style eyes, bright irises, catchlights, blush and a smile.
    const faceDetails = this.add.graphics();
    faceDetails.lineStyle(1.8, hero.hair, 1);
    faceDetails.beginPath(); faceDetails.moveTo(-12, -86); faceDetails.lineTo(-6, -88); faceDetails.strokePath();
    faceDetails.beginPath(); faceDetails.moveTo(6, -88); faceDetails.lineTo(12, -86); faceDetails.strokePath();
    faceDetails.fillStyle(0xffffff, 1);
    faceDetails.fillEllipse(-7, -79, 7.8, 10);
    faceDetails.fillEllipse(7, -79, 7.8, 10);
    faceDetails.fillStyle(hero.eyes, 1);
    faceDetails.fillEllipse(-7, -78, 5.3, 7.5);
    faceDetails.fillEllipse(7, -78, 5.3, 7.5);
    faceDetails.fillStyle(0x211c39, 1);
    faceDetails.fillCircle(-7, -77, 2.1);
    faceDetails.fillCircle(7, -77, 2.1);
    faceDetails.fillStyle(0xffffff, 1);
    faceDetails.fillCircle(-8.5, -81, 2.1);
    faceDetails.fillCircle(5.5, -81, 2.1);
    faceDetails.fillStyle(0xff8da4, 0.5);
    faceDetails.fillEllipse(-13, -69, 6, 3.2);
    faceDetails.fillEllipse(13, -69, 6, 3.2);
    faceDetails.lineStyle(2, 0xa34868, 1);
    faceDetails.beginPath(); faceDetails.arc(0, -69, 5.5, 0.18, Math.PI - 0.18, false); faceDetails.strokePath();

    const characterDetails = this.add.graphics();
    if (this.session.characterId === "princess" || this.session.characterId === "prince") {
      characterDetails.fillStyle(0xffd94c, 1);
      characterDetails.fillTriangle(-15, -98, -9, -116, -3, -98);
      characterDetails.fillTriangle(-4, -98, 3, -119, 10, -98);
      characterDetails.fillTriangle(7, -98, 14, -114, 19, -98);
      characterDetails.fillRoundedRect(-16, -100, 37, 5, 2);
      characterDetails.fillStyle(0xffffff, 0.95);
      characterDetails.fillCircle(3, -109, 2);
    } else if (this.session.characterId === "witch") {
      characterDetails.fillStyle(0x33215e, 1);
      characterDetails.fillTriangle(-24, -98, 0, -148, 25, -98);
      characterDetails.fillStyle(0x9e5bdb, 1);
      characterDetails.fillRoundedRect(-25, -101, 50, 8, 4);
      characterDetails.fillStyle(0xffdf5d, 1);
      characterDetails.fillCircle(0, -103, 4);
    } else if (this.session.characterId === "unicorn") {
      characterDetails.fillStyle(0xffd45a, 1);
      characterDetails.fillTriangle(-4, -96, 0, -125, 5, -96);
      characterDetails.lineStyle(3, 0xff88d3, 1);
      characterDetails.lineBetween(-18, -88, -24, -102);
      characterDetails.lineStyle(3, 0x6ce7f1, 1);
      characterDetails.lineBetween(-12, -91, -17, -104);
    } else if (this.session.characterId === "knight") {
      characterDetails.fillStyle(0x98bbd2, 1);
      characterDetails.fillRoundedRect(-21, -103, 42, 13, 6);
      characterDetails.fillStyle(0xffd45b, 1);
      characterDetails.fillRect(-2, -102, 4, 10);
    } else if (this.session.characterId === "male-explorer") {
      characterDetails.fillStyle(0xc18b41, 1);
      characterDetails.fillEllipse(0, -101, 44, 10);
      characterDetails.fillRoundedRect(-13, -114, 26, 15, 6);
      characterDetails.fillStyle(0x6d472d, 1);
      characterDetails.fillCircle(0, -112, 3);
    } else if (this.session.characterId === "mermaid") {
      characterDetails.fillStyle(0x48e0cd, 1);
      characterDetails.fillEllipse(0, -100, 45, 10);
      characterDetails.fillTriangle(-12, -96, -20, -108, -1, -98);
      characterDetails.fillStyle(0xff9bd4, 1);
      characterDetails.fillCircle(0, -101, 5);
    }

    const hairPin = this.add.text(-17, -106, appearance.hairstyle, {
      fontFamily: "system-ui", fontSize: "12px"
    }).setOrigin(0.5);
    const accessory = this.add.text(20, -96, appearance.accessory, {
      fontFamily: "system-ui", fontSize: "13px"
    }).setOrigin(0.5);
    const playerChildren = [shadow, backHair, leftLeg, rightLeg, leftArm, rightArm, clothes, head, frontHair, faceDetails, characterDetails, hairPin, accessory];
    this.player = this.add.container(120, this.groundY, playerChildren).setDepth(20);
  }

  private advanceAutoWalk(dt: number): void {
    if (!this.autoWalkEnabled || !this.player || this.challengeOpen || this.complete) return;
    const walkSpeed = 100;
    const nextX = Math.min(FINISH_X + 30, this.player.x + walkSpeed * dt);

    // Keep moving past rocks and gaps. Jumping is entirely player-controlled;
    // a missed jump causes a fall/recoil instead of an automatic stop prompt.
    if (!this.challengeCleared && nextX >= STATION_X - 70) {
      this.player.x = STATION_X - 70;
      this.autoWalkEnabled = false;
      this.openChallengeStation();
      return;
    }

    this.player.x = nextX;
    this.facing = 1;
    this.player.setScale(1, this.player.scaleY);
  }

  private isOverGap(x: number): boolean {
    return this.gapZones.some(g => x > g.left && x < g.right);
  }

  private loseHeart(message: string): void {
    const hitObstacle = this.obstacles.find(o => Math.abs(o.x - this.player.x) < 55 && !o.handled && !o.bumped);
    const collisionX = this.player.x;
    let respawnX = Math.max(this.checkpointX, collisionX - 72);
    let resumeRunningAfterBump = Boolean(hitObstacle);

    if (hitObstacle) {
      // The runner never stops in front of a rock. A missed jump causes a
      // short backward bump, then the auto-run continues past this obstacle.
      hitObstacle.prompted = false;
      hitObstacle.actionStarted = false;
      hitObstacle.bumped = true;
      respawnX = Math.max(this.checkpointX, Math.min(collisionX - 82, hitObstacle.x - 88));
      if (hitObstacle.kind === "rock") {
        message = "🪨 Bump! The rock pushed you back a little. Running continues — tap ▲ next time to jump over it!";
      } else if (hitObstacle.kind === "branch") {
        message = "🌿 Bump! Duck under the next branch with ▼. Running continues!";
      } else {
        message = "💥 Bump! You were pushed back a little. Running continues — tap ▲ before the next obstacle!";
      }
    }

    const fallenGap = this.gapZones.findIndex(g => this.player.x > g.left - 20 && this.player.x < g.right + 20);
    if (fallenGap >= 0) {
      this.gapPrompted[fallenGap] = false;
      this.gapActionStarted[fallenGap] = false;
      respawnX = Math.max(this.checkpointX, this.gapZones[fallenGap]!.left - 65);
      resumeRunningAfterBump = true;
      message = "🌊 Splash! You fell into the gap and bounced back. Running continues — tap ▲ to jump across!";
    }

    this.hearts--;
    if (this.hearts <= 0) {
      this.hearts = 5;
      message = "🧚 A fairy helped you at the checkpoint. Try that jump again!";
    }

    this.tweens.killTweensOf(this.player);
    this.tweens.killTweensOf([this.leftLeg, this.rightLeg, this.leftArm, this.rightArm]);
    this.player.setPosition(collisionX, this.groundY);
    this.player.setScale(this.facing, 1);
    this.player.setAngle(5);
    this.player.setAlpha(1);
    this.autoWalkEnabled = false;
    this.jumping = false;
    this.jumpVelocity = 0;
    this.duckUntil = 0;
    if (this.heroImage) {
      this.heroImage.anims.stop();
      this.heroImage.setFrame(this.heroIdleFrame);
      this.heroImage.setScale(this.heroBaseScale);
      this.heroImage.setAngle(0);
      this.heroImage.y = 0;
    }
    this.cameras.main.shake(110, 0.0025);
    this.tweens.add({
      targets: this.player,
      x: respawnX,
      angle: 0,
      duration: 230,
      ease: "Cubic.easeOut",
      onComplete: () => {
        if (this.player && this.player.active) {
          this.player.setAngle(0);
          this.player.setAlpha(1);
          if (resumeRunningAfterBump && hitObstacle) {
            this.facing = 1;
            this.autoWalkEnabled = true;
            this.publish("▶️ Running again! Tap ▲ whenever you want to jump.");
          } else {
            this.publish(message);
          }
        }
      }
    });
    this.publish(message);
  }

  private openChallengeStation(): void {
    this.autoWalkEnabled = false;
    this.challengeOpen = true;
    this.publish("✨ Challenge station reached! Your journey is paused.");
    const panel = this.createPanel("Magical Challenge Station", "Your adventure is paused right here. Complete a mini-game to open the path.", "🐚");
    this.addPanelButton(panel, "START CHALLENGE", () => this.startChallenge(), "primary");
  }

  // Native DOM overlays are used instead of Phaser canvas hit areas. Android
  // WebView reliably dispatches taps to real buttons, including inside cards.
  private clearChallengeTimer(): void {
    if (this.challengeTimer !== null) {
      window.clearInterval(this.challengeTimer);
      this.challengeTimer = null;
    }
  }

  private createPanel(title: string, subtitle: string, icon = "✨"): HTMLElement {
    this.clearChallengeTimer();
    this.overlayElement?.remove();
    const host = document.getElementById("maze-host") ?? document.body;
    const overlay = document.createElement("div");
    overlay.className = "adventure-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const card = document.createElement("section");
    card.className = "adventure-challenge-card";
    const badge = document.createElement("div");
    badge.className = "adventure-challenge-icon";
    badge.textContent = icon;
    const heading = document.createElement("h2");
    heading.textContent = title;
    const description = document.createElement("p");
    description.textContent = subtitle;
    const content = document.createElement("div");
    content.className = "adventure-challenge-content";
    card.append(badge, heading, description, content);
    overlay.append(card);
    host.append(overlay);
    this.overlayElement = overlay;
    card.dataset.content = "challenge";
    return card;
  }

  private challengeContent(panel: HTMLElement): HTMLDivElement {
    return panel.querySelector<HTMLDivElement>(".adventure-challenge-content")!;
  }

  private addPanelButton(panel: HTMLElement, label: string, action: () => void, variant = "primary"): void {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "adventure-challenge-button " + variant;
    button.textContent = label;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!button.disabled) action();
    });
    this.challengeContent(panel).append(button);
  }

  private addChallengeCountdown(panel: HTMLElement, retryMessage: string, retry: () => void): void {
    let seconds = difficultyForLevel(this.session.levelNumber, this.session.worldIndex).challengeSeconds;
    const timer = this.addChallengeText(panel, "Time left: " + seconds + "s", "challenge-countdown");
    this.challengeTimer = window.setInterval(() => {
      if (!this.overlayElement?.isConnected) {
        this.clearChallengeTimer();
        return;
      }
      seconds--;
      timer.textContent = "Time left: " + seconds + "s";
      if (seconds <= 0) this.showChallengeFailed(retryMessage, retry);
    }, 1000);
  }

  private addChallengeText(panel: HTMLElement, text: string, className = "challenge-instruction"): HTMLParagraphElement {
    const paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = text;
    this.challengeContent(panel).append(paragraph);
    return paragraph;
  }

  private startChallenge(): void {
    // Five genuinely different mini-game mechanics rotate across levels and worlds.
    switch (this.session.challenge) {
      case "classic": this.startMemoryChallenge(); break;
      case "monster": this.startPatternChallenge(); break;
      case "obstacle": this.startObstacleSequenceChallenge(); break;
      case "key-door": this.startKeyChallenge(); break;
      case "tricky": this.startRuneSequenceChallenge(); break;
    }
  }

  private startMemoryChallenge(): void {
    const difficulty = difficultyForLevel(this.session.levelNumber, this.session.worldIndex);
    const pairCount = difficulty.memoryPairs;
    const themes: string[][] = [
      ["🐬", "🐠", "🐙", "🦀", "🐢", "🦑", "🪼", "🐳"],
      ["🍬", "🍭", "🍩", "🧁", "🍓", "🍦", "🍪", "🍉"],
      ["🦋", "🍄", "🌻", "🐿️", "🪵", "🌼", "🐝", "🍃"],
      ["🦇", "💎", "🕯️", "🕸️", "🦂", "🦉", "🔮", "🪨"],
      ["❄️", "⛄", "🧤", "🛷", "🧊", "🐧", "🦭", "🌨️"],
      ["🪐", "🚀", "🌙", "⭐", "🛸", "☄️", "🌍", "👽"],
      ["👑", "🏰", "🗝️", "🛡️", "⚔️", "💍", "🕯️", "📜"],
      ["👻", "🦇", "🕯️", "🪦", "🕸️", "🧟", "🔮", "🌙"],
      ["🧚", "🌷", "🦋", "🌸", "🍀", "✨", "🐝", "🌈"],
      ["💎", "🔷", "🔮", "🪩", "🧊", "🟣", "🟦", "⭐"]
    ];
    const symbols = (themes[this.session.worldIndex] ?? themes[0]!).slice(0, pairCount);
    const deck = [...symbols, ...symbols];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j]!, deck[i]!];
    }

    const panel = this.createPanel("Memory Reef Challenge", "Find every matching pair before time runs out.", "🫧");
    this.addChallengeText(panel, "Remember the pictures. Tap two shells each turn and match all the creatures.");
    const grid = document.createElement("div");
    grid.className = "memory-card-grid";
    grid.dataset.cards = String(deck.length);
    this.challengeContent(panel).append(grid);
    const cards: Array<{ value: string; button: HTMLButtonElement; matched: boolean }> = [];
    let first = -1;
    let locked = false;
    let pairs = 0;
    let moves = 0;
    let timeLeft = difficulty.challengeSeconds;
    const moveLimit = Math.max(pairCount * 2, Math.ceil(pairCount * (3 - difficulty.rank * 0.08)));
    const status = this.addChallengeText(panel, "", "challenge-status");
    const refreshStatus = (): void => {
      status.textContent = "Pairs " + pairs + "/" + pairCount + "  •  Moves left " + Math.max(0, moveLimit - moves) + "  •  " + timeLeft + "s";
    };
    refreshStatus();

    deck.forEach((symbol) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "memory-card";
      button.textContent = "🐚";
      button.setAttribute("aria-label", "Hidden memory shell");
      const card = { value: symbol, button, matched: false };
      cards.push(card);
      grid.append(button);
      button.addEventListener("click", () => {
        if (locked || card.matched || button.dataset.revealed === "true" || !this.overlayElement?.isConnected) return;
        button.dataset.revealed = "true";
        button.textContent = card.value;
        button.classList.add("revealed");
        if (first < 0) {
          first = cards.indexOf(card);
          return;
        }
        const firstIndex = first;
        first = -1;
        moves++;
        const other = cards[firstIndex]!;
        if (other.value === card.value) {
          other.matched = true;
          card.matched = true;
          other.button.classList.add("matched");
          button.classList.add("matched");
          pairs++;
          refreshStatus();
          if (pairs === pairCount) this.showChallengeWon();
        } else {
          locked = true;
          status.textContent = "Not a match. Remember both pictures and try another pair!";
          window.setTimeout(() => {
            if (!this.overlayElement?.isConnected) return;
            other.button.textContent = "🐚";
            button.textContent = "🐚";
            other.button.dataset.revealed = "false";
            button.dataset.revealed = "false";
            other.button.classList.remove("revealed");
            button.classList.remove("revealed");
            locked = false;
            refreshStatus();
          }, 720);
        }
        if (moves >= moveLimit && pairs < pairCount) {
          window.setTimeout(() => {
            if (this.overlayElement?.isConnected) {
              this.showChallengeFailed("Move limit reached. Try to remember the shells in fewer moves!", () => this.startMemoryChallenge());
            }
          }, 760);
        }
      });
    });

    this.challengeTimer = window.setInterval(() => {
      if (!this.overlayElement?.isConnected) {
        this.clearChallengeTimer();
        return;
      }
      timeLeft--;
      refreshStatus();
      if (timeLeft <= 0) {
        this.showChallengeFailed("Time is up! Take a breath and try the memory challenge again.", () => this.startMemoryChallenge());
      }
    }, 1000);
  }

  private startPatternChallenge(): void {
    const difficulty = difficultyForLevel(this.session.levelNumber, this.session.worldIndex);
    const patterns = [
      { series: ["💎", "⭐", "🐚", "💎", "⭐", "?"], answer: "🐚", choices: ["🐚", "💎", "🦀", "🌙"] },
      { series: ["🔵", "🔴", "🟡", "🔵", "🔴", "?"], answer: "🟡", choices: ["🟡", "🔵", "🟢", "⭐"] },
      { series: ["🐚", "🐠", "🦀", "🐚", "🐠", "?"], answer: "🦀", choices: ["🦀", "🐢", "🐬", "🐚"] },
      { series: ["🌙", "⭐", "☀️", "🌙", "⭐", "?"], answer: "☀️", choices: ["☀️", "🌙", "⭐", "💎"] },
      { series: ["🔴", "🔴", "🔵", "🔴", "🔴", "🔵", "🔴", "?"], answer: "🔴", choices: ["🔴", "🔵", "🟡", "🟢"] },
      { series: ["1", "2", "4", "8", "16", "?"], answer: "32", choices: ["24", "30", "32", "36"] }
    ];
    const puzzle = patterns[(this.session.worldIndex * 3 + this.session.levelNumber + difficulty.rank) % patterns.length]!;
    const panel = this.createPanel("Monster Pattern", "A monster guards this pattern gate. Solve its clue to continue.", "👾");
    const monsterBanner = document.createElement("div");
    monsterBanner.className = "challenge-monster";
    monsterBanner.innerHTML = '<div class="challenge-monster-face">👹</div><div class="challenge-monster-copy"><strong>Grumble the Gatekeeper</strong><small>“Solve my sequence and I will open the path!”</small></div>';
    this.challengeContent(panel).append(monsterBanner);
    this.addChallengeText(panel, "Study the repeating pattern or number sequence. Which symbol belongs next?");
    this.addChallengeCountdown(panel, "Time is up. Try the creature pattern again.", () => this.startPatternChallenge());
    const pattern = document.createElement("div");
    pattern.className = "pattern-display";
    pattern.textContent = puzzle.series.join("   ");
    this.challengeContent(panel).append(pattern);
    const choices = document.createElement("div");
    choices.className = "challenge-choice-row";
    this.challengeContent(panel).append(choices);
    for (const symbol of puzzle.choices) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "challenge-choice";
      button.textContent = symbol;
      button.addEventListener("click", () => {
        if (symbol === puzzle.answer) this.showChallengeWon();
        else this.showRetryHint(panel, "Not quite. Look at how the sequence changes from one symbol to the next.");
      });
      choices.append(button);
    }
  }

  private startObstacleSequenceChallenge(): void {
    const difficulty = difficultyForLevel(this.session.levelNumber, this.session.worldIndex);
    const length = Math.min(7, 3 + Math.floor(difficulty.rank / 2));
    const actionSymbols = ["⬆️", "⬇️"];
    let seed = (this.session.worldIndex + 3) * 127 + this.session.levelNumber * 59;
    const nextRandom = (): number => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const sequence: string[] = [];
    for (let i = 0; i < length; i++) {
      let pick = Math.floor(nextRandom() * actionSymbols.length);
      if (i >= 2 && sequence[i - 1] === sequence[i - 2] && sequence[i - 1] === actionSymbols[pick]) pick = 1 - pick;
      sequence.push(actionSymbols[pick]!);
    }
    const panel = this.createPanel("Obstacle Reflex Course", "Watch the action pattern, then repeat it in order.", "⚡");
    this.addChallengeText(panel, "Memorise the jump and duck sequence. The symbols disappear before you enter it.");
    this.addChallengeCountdown(panel, "Time is up. Try the obstacle reflex course again.", () => this.startObstacleSequenceChallenge());
    const display = document.createElement("div");
    display.className = "pattern-display";
    display.textContent = sequence.join("   →   ");
    this.challengeContent(panel).append(display);
    let step = 0;
    const status = this.addChallengeText(panel, "Actions completed: 0 / " + length, "challenge-status");
    const hideDelay = Math.max(900, 2500 - difficulty.rank * 150);
    window.setTimeout(() => {
      if (this.overlayElement?.isConnected) {
        display.textContent = Array.from({ length }, () => "❔").join("   →   ");
        this.addChallengeText(panel, "Now tap the correct actions in the same order.");
      }
    }, hideDelay);
    const choices = document.createElement("div");
    choices.className = "challenge-choice-row";
    this.challengeContent(panel).append(choices);
    const actionButtons = [
      { symbol: "⬆️", label: "JUMP" },
      { symbol: "⬇️", label: "DUCK" }
    ];
    for (const action of actionButtons) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "challenge-choice";
      button.textContent = action.symbol + " " + action.label;
      button.addEventListener("click", () => {
        if (action.symbol === sequence[step]) {
          step++;
          status.textContent = "Actions completed: " + step + " / " + length;
          if (step === sequence.length) this.showChallengeWon();
        } else {
          step = 0;
          status.textContent = "Wrong action. Start again: 0 / " + length;
          this.showRetryHint(panel, "Watch the action order again and try to repeat it.");
          display.textContent = sequence.join("   →   ");
          window.setTimeout(() => {
            if (this.overlayElement?.isConnected) display.textContent = Array.from({ length }, () => "❔").join("   →   ");
          }, hideDelay);
        }
      });
      choices.append(button);
    }
  }

  private startKeyChallenge(): void {
    const difficulty = difficultyForLevel(this.session.levelNumber, this.session.worldIndex);
    const panel = this.createPanel("The Royal Lock", "The gate needs a key matching every clue.", "🗝️");
    this.addChallengeText(panel, "The gate shows a BLUE STAR. Choose the only key matching both colour and symbol.");
    this.addChallengeCountdown(panel, "Time is up. Try the royal lock again.", () => this.startKeyChallenge());
    const door = document.createElement("div");
    door.className = "pattern-display";
    door.textContent = "🔵  ⭐  🚪";
    this.challengeContent(panel).append(door);
    const options: Array<[string, boolean, string]> = [
      ["🔴  ⭐  Red star key", false, "pink"],
      ["🔵  🌙  Blue moon key", false, "blue"],
      ["🔵  ⭐  Blue star key", true, "blue"],
      ["🟡  ⭐  Gold star key", false, "gold"]
    ];
    if (difficulty.rank >= 3) {
      options.push(["🔵  💎  Blue crystal key", false, "blue"], ["🟣  ⭐  Purple star key", false, "purple"]);
    }
    if (difficulty.rank >= 6) {
      options.push(["🔴  🌙  Red moon key", false, "pink"], ["🟡  🌙  Gold moon key", false, "gold"]);
    }
    const choices = document.createElement("div");
    choices.className = "challenge-key-list";
    this.challengeContent(panel).append(choices);
    for (const [label, correct, colour] of options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "challenge-key " + colour;
      button.textContent = label;
      button.addEventListener("click", () => {
        if (correct) this.showChallengeWon();
        else this.showRetryHint(panel, "Check both clues: the key must be blue AND have a star.");
      });
      choices.append(button);
    }
  }

  private startRuneSequenceChallenge(): void {
    const difficulty = difficultyForLevel(this.session.levelNumber, this.session.worldIndex);
    const runes = ["🐚", "⭐", "🐠", "💎", "🦀", "🌙", "🪼", "🔮"];
    const length = Math.min(7, 3 + Math.floor(difficulty.rank / 2));
    const target = Array.from({ length }, (_, i) => runes[(i * 3 + this.session.worldIndex + this.session.levelNumber) % runes.length]!);
    const panel = this.createPanel("Ancient Rune Code", "Remember the order and enter every rune.", "🔮");
    this.addChallengeText(panel, "Memorise this code. The runes disappear after a short preview.");
    this.addChallengeCountdown(panel, "Time is up. Try the rune sequence again.", () => this.startRuneSequenceChallenge());
    const code = document.createElement("div");
    code.className = "pattern-display rune-code";
    code.textContent = target.join("  →  ");
    this.challengeContent(panel).append(code);
    let step = 0;
    const preview = Math.max(900, 2500 - difficulty.rank * 160);
    window.setTimeout(() => {
      if (this.overlayElement?.isConnected) {
        code.textContent = Array.from({ length }, () => "❔").join("  →  ");
        this.addChallengeText(panel, "Now enter the rune code from memory.");
      }
    }, preview);
    const status = this.addChallengeText(panel, "Code progress: 0 / " + length, "challenge-status");
    const choices = document.createElement("div");
    choices.className = "challenge-choice-row";
    this.challengeContent(panel).append(choices);
    const symbols = runes;
    for (const symbol of symbols) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "challenge-choice rune-choice";
      button.textContent = symbol;
      button.addEventListener("click", () => {
        if (symbol === target[step]) {
          step++;
          status.textContent = "Code progress: " + step + " / " + length;
          if (step === target.length) this.showChallengeWon();
        } else {
          step = 0;
          status.textContent = "Wrong order! Code progress reset to 0 / " + length + ".";
          this.showRetryHint(panel, "Start again and remember the complete rune order.");
        }
      });
      choices.append(button);
    }
  }

  private showRetryHint(panel: HTMLElement, message: string): void {
    let hint = panel.querySelector<HTMLParagraphElement>(".challenge-feedback");
    if (!hint) {
      hint = document.createElement("p");
      hint.className = "challenge-feedback";
      this.challengeContent(panel).append(hint);
    }
    hint.textContent = message;
  }

  private showChallengeFailed(message: string, retry: () => void): void {
    const failed = this.createPanel("Almost there!", message, "🧩");
    this.addChallengeText(failed, "Your adventure is paused here. You do not lose your progress.");
    this.addPanelButton(failed, "TRY AGAIN", retry, "primary");
  }

  private showChallengeWon(): void {
    const panel = this.createPanel("Challenge complete!", "You earned +10 coins and +1 gem. The magical path is open!", "🏆");
    this.addChallengeText(panel, "Amazing work, explorer! Your adventure is ready to continue.");
    const reward = document.createElement("div");
    reward.className = "challenge-rewards";
    reward.textContent = "🪙 +10       💎 +1       ⭐ +1";
    this.challengeContent(panel).append(reward);
    this.addPanelButton(panel, "CONTINUE ADVENTURE ▶", () => {
      this.coins += 10;
      this.gems += 1;
      this.challengeCleared = true;
      this.challengeOpen = false;
      this.overlayElement?.remove();
      this.overlayElement = undefined;
      this.player.x = STATION_X + 24;
      this.autoWalkEnabled = true;
      this.publish("🌈 Challenge cleared! Your character is walking again.");
    }, "primary");
  }

  private finishAdventure(): void {
    if (this.complete) return;
    this.complete = true;
    this.autoWalkEnabled = false;
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
      walking: this.autoWalkEnabled,
      message
    });
  }
}