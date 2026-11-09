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
    this.lastGroundedAt = this.time.now;
    this.autoWalkEnabled = false;
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
      this.overlayElement?.remove();
      this.overlayElement = undefined;
    });
    this.publish("Your adventure begins! Tap ▶ to walk, ▲ to jump and ▼ to duck.");
  }

  toggleAutoWalk(): boolean {
    if (this.complete || this.challengeOpen || !this.player) return false;
    this.autoWalkEnabled = !this.autoWalkEnabled;
    this.publish(this.autoWalkEnabled ? "▶️ Your character is walking! Tap ▲ to jump and tap ▶ again to stop." : "⏸️ Walking paused.");
    return this.autoWalkEnabled;
  }

  move(dx: number, dy: number): void {
    if (this.complete || this.challengeOpen || !this.player) return;
    if (dy < 0) {
      const nearGround = this.player.y >= this.groundY - 8;
      const forgivingGapJump = this.isOverGap(this.player.x) && this.time.now - this.lastGroundedAt < 220;
      if (!this.jumping && (nearGround || forgivingGapJump)) {
        this.jumping = true;
        this.jumpVelocity = -630;
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

    if (!inGap && this.player.y >= this.groundY - 2) this.lastGroundedAt = this.time.now;
    if (this.autoWalkEnabled && !this.jumping && !inGap && this.time.now > this.duckUntil) {
      this.walkCycle += dt * 13;
      this.leftLeg.angle = Math.sin(this.walkCycle) * 22;
      this.rightLeg.angle = Math.sin(this.walkCycle + Math.PI) * 22;
      this.leftArm.angle = Math.sin(this.walkCycle + Math.PI) * 17;
      this.rightArm.angle = Math.sin(this.walkCycle) * 17;
      this.player.y = this.groundY + Math.abs(Math.sin(this.walkCycle * 2)) * 2;
    } else if (!this.autoWalkEnabled && !this.jumping && !inGap) {
      this.leftLeg.angle = 0; this.rightLeg.angle = 0;
      this.leftArm.angle = 0; this.rightArm.angle = 0;
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

  private drawWorld(width: number, height: number): void {
    const sky = this.session.world.sky;
    const floor = this.session.world.floor;
    const accent = this.session.world.accent;
    const underwater = this.session.worldIndex === 0;
    this.add.rectangle(WORLD_LENGTH / 2, height / 2, WORLD_LENGTH, height, Number.parseInt(sky.replace("#", ""), 16));

    // Layered scenery fills the tall mobile viewport. Underwater levels use
    // bubbles, fish, coral and sea plants instead of inappropriate sky clouds.
    for (let i = 0; i < 18; i++) {
      const x = 45 + i * 185;
      if (underwater) {
        const bubbleY = 90 + (i % 5) * 92;
        const bubble = this.add.circle(x, bubbleY, 11 + (i % 3) * 5, 0xffffff, 0.18)
          .setStrokeStyle(2, 0xffffff, 0.55);
        this.tweens.add({ targets: bubble, y: bubbleY - 24, alpha: 0.28, duration: 2100 + (i % 4) * 350, yoyo: true, repeat: -1 });
        if (i % 2 === 0) {
          this.add.text(x + 45, 165 + (i % 4) * 72, i % 4 === 0 ? "🐠" : "🐟", {
            fontFamily: "system-ui", fontSize: "27px"
          }).setAlpha(0.76);
        }
        if (i % 3 === 0) {
          this.add.text(x + 10, this.groundY - 145 - (i % 2) * 38, i % 2 === 0 ? "🪸" : "🐚", {
            fontFamily: "system-ui", fontSize: "42px"
          });
        }
      } else {
        this.add.ellipse(x, this.groundY - 54 - (i % 3) * 15, 340, 150, accent, 0.16);
        this.add.text(x - 70, 54 + (i % 2) * 43, "☁️", { fontFamily: "system-ui", fontSize: "36px" });
        const scenery = this.session.worldIndex === 1 ? ["🍭", "🍬", "🍩"] :
          this.session.worldIndex === 4 ? ["🌲", "⛄", "❄️"] :
          this.session.worldIndex === 5 ? ["🪐", "⭐", "🚀"] : ["🌳", "🌼", "🍄"];
        this.add.text(x + 30, this.groundY - 92 - (i % 2) * 22, scenery[i % scenery.length]!, {
          fontFamily: "system-ui", fontSize: "42px"
        });
      }
    }

    // Rolling reef / landscape silhouettes add depth behind the walking path.
    const farLandscape = this.add.graphics();
    farLandscape.fillStyle(accent, underwater ? 0.20 : 0.18);
    for (let i = 0; i < 10; i++) {
      farLandscape.fillEllipse(90 + i * 330, this.groundY - 80 - (i % 2) * 24, 420, 180);
    }

    // Sea plants repeat along the underwater route, with simple layered fronds.
    if (underwater) {
      for (let i = 0; i < 16; i++) {
        const x = 35 + i * 205;
        const plant = this.add.graphics();
        plant.lineStyle(7, i % 2 === 0 ? 0x329d91 : 0x55b9a3, 0.9);
        plant.beginPath(); plant.moveTo(x, this.groundY + 1); plant.lineTo(x - 6, this.groundY - 48); plant.lineTo(x + 13, this.groundY - 88); plant.strokePath();
        plant.beginPath(); plant.moveTo(x + 3, this.groundY - 38); plant.lineTo(x + 32, this.groundY - 70); plant.strokePath();
        plant.beginPath(); plant.moveTo(x - 3, this.groundY - 27); plant.lineTo(x - 28, this.groundY - 54); plant.strokePath();
      }
    }

    const groundSegments: Array<[number, number]> = [[0, 990], [1110, 2180], [2310, WORLD_LENGTH]];
    for (const [start, end] of groundSegments) {
      this.add.rectangle((start + end) / 2, this.groundY + 95, end - start, 190, floor);
      this.add.rectangle((start + end) / 2, this.groundY + 5, end - start, 14, accent);
      if (underwater) {
        this.add.rectangle((start + end) / 2, this.groundY + 18, end - start, 7, 0xffffff, 0.28);
      }
    }
    for (const gap of GAP_ZONES) {
      this.add.rectangle((gap.left + gap.right) / 2, this.groundY + 24, gap.right - gap.left, 48, underwater ? 0x287d9d : 0x35435a, 0.9);
      this.add.text((gap.left + gap.right) / 2, this.groundY + 45, underwater ? "🫧" : "⬇️", {
        fontFamily: "system-ui", fontSize: "22px"
      }).setOrigin(0.5);
    }

    const obstacleDefs: Array<[number, ObstacleKind]> = [
      [330, "log"], [555, "rock"], [770, "monster"], [1270, "branch"], [1390, "log"],
      [1740, "monster"], [1900, "rock"], [2070, "branch"], [2490, "log"], [2635, "rock"], [2800, "monster"]
    ];
    for (const [x, kind] of obstacleDefs) {
      const icon: Record<ObstacleKind, string> = { log: "🪵", rock: "🪨", branch: "🌿", monster: "👾" };
      const y = kind === "branch" ? this.groundY - 150 : this.groundY - 27;
      const sprite = this.add.text(x, y, icon[kind], {
        fontFamily: "system-ui", fontSize: kind === "branch" ? "49px" : "42px"
      }).setOrigin(0.5);
      if (kind === "rock") this.tweens.add({ targets: sprite, x: x + 22, duration: 520, yoyo: true, repeat: -1 });
      if (kind === "monster") this.tweens.add({ targets: sprite, y: y - 11, angle: 7, duration: 600, yoyo: true, repeat: -1 });
      this.obstacles.push({ x, kind, sprite, handled: false });
    }

    // Visual jump cues are placed before both gaps so the timing is readable.
    for (const x of [920, 2110]) {
      const cue = this.add.text(x, this.groundY - 74, "⬆ JUMP!", {
        fontFamily: "system-ui", fontSize: "15px", fontStyle: "bold", color: "#ffffff",
        backgroundColor: "#3b8da4", padding: { x: 7, y: 4 }
      }).setOrigin(0.5);
      this.tweens.add({ targets: cue, y: cue.y - 8, alpha: 0.55, duration: 560, yoyo: true, repeat: -1 });
    }

    const pickupDefs: Array<[number, number, "coin" | "gem"]> = [
      [205, this.groundY - 85, "coin"], [255, this.groundY - 125, "coin"], [440, this.groundY - 95, "gem"],
      [660, this.groundY - 115, "coin"], [900, this.groundY - 90, "coin"], [1165, this.groundY - 105, "coin"],
      [1350, this.groundY - 90, "gem"], [1620, this.groundY - 105, "coin"], [1810, this.groundY - 115, "coin"],
      [1980, this.groundY - 95, "gem"], [2390, this.groundY - 105, "coin"], [2550, this.groundY - 125, "gem"],
      [2740, this.groundY - 92, "coin"]
    ];
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
    const outfitPalette: Record<string, { main: number; shade: number; trim: number }> = {
      "👗": { main: 0xe985b5, shade: 0xc75e91, trim: 0xffd5e7 },
      "🥋": { main: 0xf5eee9, shade: 0xd6b7ad, trim: 0xe985b5 },
      "🦺": { main: 0x69a9d8, shade: 0x3f7eaf, trim: 0xffdc8a },
      "🧥": { main: 0x9279bd, shade: 0x6d5796, trim: 0xe5d7ff },
      "👑": { main: 0xe9a0c1, shade: 0xb96892, trim: 0xf7d67b },
      "🩱": { main: 0x5fc0bd, shade: 0x368e90, trim: 0xb5f0e7 }
    };
    const palette = outfitPalette[appearance.outfit] ?? {
      main: character.colour, shade: 0x76577f, trim: 0xffd5e7
    };
    const isBoy = this.session.characterId === "normal-boy" || this.session.characterId === "prince" ||
      this.session.characterId === "male-explorer" || this.session.characterId === "knight";
    const skin = 0xf4c7a5;

    const shadow = this.add.ellipse(0, -2, 48, 13, 0x3d3651, 0.18);
    const backHair = this.add.graphics();
    backHair.fillStyle(0x533548, 1);
    backHair.fillEllipse(0, -83, 43, 39);
    backHair.fillRoundedRect(-20, -85, 11, 41, 5);
    backHair.fillRoundedRect(9, -85, 11, 41, 5);

    const leftLeg = this.add.graphics();
    leftLeg.lineStyle(6, 0x59435f, 1);
    leftLeg.beginPath(); leftLeg.moveTo(0, 0); leftLeg.lineTo(-2, 14); leftLeg.strokePath();
    leftLeg.fillStyle(0x76577f, 1); leftLeg.fillRoundedRect(-9, 11, 15, 7, 3);
    leftLeg.setPosition(-7, -15);
    const rightLeg = this.add.graphics();
    rightLeg.lineStyle(6, 0x59435f, 1);
    rightLeg.beginPath(); rightLeg.moveTo(0, 0); rightLeg.lineTo(2, 14); rightLeg.strokePath();
    rightLeg.fillStyle(0x76577f, 1); rightLeg.fillRoundedRect(-5, 11, 15, 7, 3);
    rightLeg.setPosition(7, -15);
    this.leftLeg = leftLeg;
    this.rightLeg = rightLeg;

    const leftArm = this.add.graphics();
    leftArm.lineStyle(8, skin, 1);
    leftArm.beginPath(); leftArm.moveTo(0, 0); leftArm.lineTo(-5, 17); leftArm.strokePath();
    leftArm.fillStyle(skin, 1); leftArm.fillCircle(-5, 18, 4);
    leftArm.setPosition(-13, -48);
    const rightArm = this.add.graphics();
    rightArm.lineStyle(8, skin, 1);
    rightArm.beginPath(); rightArm.moveTo(0, 0); rightArm.lineTo(5, 17); rightArm.strokePath();
    rightArm.fillStyle(skin, 1); rightArm.fillCircle(5, 18, 4);
    rightArm.setPosition(13, -48);
    this.leftArm = leftArm;
    this.rightArm = rightArm;

    const clothes = this.add.graphics();
    clothes.fillStyle(palette.shade, 1);
    clothes.fillRoundedRect(-14, -53, 28, 28, 8);
    clothes.fillStyle(palette.main, 1);
    clothes.fillRoundedRect(-12, -52, 24, 25, 7);
    if (isBoy) {
      clothes.fillRoundedRect(-13, -30, 26, 17, 5);
      clothes.fillStyle(palette.shade, 1);
      clothes.fillRoundedRect(-12, -14, 10, 8, 3);
      clothes.fillRoundedRect(2, -14, 10, 8, 3);
    } else {
      // A real flared dress silhouette: fitted bodice, waist and layered skirt.
      clothes.fillStyle(palette.shade, 1);
      clothes.fillTriangle(-12, -31, 12, -31, -22, -2);
      clothes.fillTriangle(12, -31, 22, -2, -22, -2);
      clothes.fillStyle(palette.main, 1);
      clothes.fillTriangle(-10, -31, 10, -31, -18, -4);
      clothes.fillTriangle(10, -31, 18, -4, -18, -4);
      clothes.lineStyle(1.5, palette.trim, 0.95);
      clothes.beginPath(); clothes.moveTo(-18, -5); clothes.lineTo(18, -5); clothes.strokePath();
      clothes.fillStyle(palette.trim, 1);
      clothes.fillCircle(0, -29, 3.2);
      clothes.fillCircle(-7, -13, 1.8); clothes.fillCircle(7, -13, 1.8);
      clothes.fillStyle(palette.shade, 1);
      clothes.fillTriangle(-5, -51, 0, -44, 5, -51);
    }
    clothes.fillStyle(palette.trim, 1);
    clothes.fillCircle(0, -42, 2.1);

    const head = this.add.graphics();
    head.fillStyle(skin, 1);
    head.fillCircle(0, -76, 18);
    head.lineStyle(1.5, 0xd99a86, 1);
    head.strokeCircle(0, -76, 18);
    // Draw the facial details after the fringe so the eyes and smile stay visible.
    const faceDetails = this.add.graphics();
    faceDetails.lineStyle(1.6, 0x583c43, 1);
    faceDetails.beginPath(); faceDetails.moveTo(-10, -83); faceDetails.lineTo(-5, -84); faceDetails.strokePath();
    faceDetails.beginPath(); faceDetails.moveTo(5, -84); faceDetails.lineTo(10, -83); faceDetails.strokePath();
    faceDetails.fillStyle(0x49313e, 1);
    faceDetails.fillEllipse(-6, -77, 3.5, 5.5);
    faceDetails.fillEllipse(6, -77, 3.5, 5.5);
    faceDetails.fillStyle(0xffffff, 1);
    faceDetails.fillCircle(-6.7, -78, 1.1); faceDetails.fillCircle(5.3, -78, 1.1);
    faceDetails.fillStyle(0xf18b9d, 0.35);
    faceDetails.fillEllipse(-11, -69, 5, 3); faceDetails.fillEllipse(11, -69, 5, 3);
    faceDetails.lineStyle(1.7, 0x9b536a, 1);
    faceDetails.beginPath(); faceDetails.arc(0, -70, 4.5, 0.2, Math.PI - 0.2, false); faceDetails.strokePath();

    const frontHair = this.add.graphics();
    frontHair.fillStyle(0x533548, 1);
    frontHair.fillEllipse(0, -91, 39, 19);
    frontHair.fillCircle(-13, -83, 8);
    frontHair.fillCircle(-3, -85, 7);
    frontHair.fillCircle(7, -84, 7);
    frontHair.fillStyle(0x745067, 0.8);
    frontHair.fillEllipse(-9, -96, 13, 4);

    const hairPin = this.add.text(-15, -99, appearance.hairstyle, {
      fontFamily: "system-ui", fontSize: "13px"
    }).setOrigin(0.5);
    const accessory = this.add.text(19, -89, appearance.accessory, {
      fontFamily: "system-ui", fontSize: "13px"
    }).setOrigin(0.5);

    const playerChildren = [shadow, backHair, leftLeg, rightLeg, leftArm, rightArm, clothes, head, frontHair, faceDetails, hairPin, accessory];
    this.player = this.add.container(120, this.groundY, playerChildren).setDepth(20);
  }

  private advanceAutoWalk(dt: number): void {
    if (!this.autoWalkEnabled || !this.player || this.challengeOpen || this.complete) return;
    const nextX = Math.min(FINISH_X + 30, this.player.x + 205 * dt);
    if (!this.challengeCleared && nextX >= STATION_X - 70) {
      this.player.x = STATION_X - 70;
      this.autoWalkEnabled = false;
      this.openChallengeStation();
      return;
    }
    this.player.x = nextX;
    this.player.setScale(this.facing, this.player.scaleY);
  }

  private isOverGap(x: number): boolean {
    return GAP_ZONES.some(g => x > g.left && x < g.right);
  }

  private loseHeart(message: string): void {
    this.autoWalkEnabled = false;
    this.hearts--;
    if (this.hearts <= 0) {
      this.hearts = 5;
      message = "🧚 A fairy helped you at the checkpoint. Try the obstacle again!";
    }
    this.tweens.killTweensOf(this.player);
    this.tweens.killTweensOf([this.leftLeg, this.rightLeg, this.leftArm, this.rightArm]);
    this.player.setPosition(this.checkpointX, this.groundY);
    this.player.setScale(1, 1);
    this.jumping = false;
    this.jumpVelocity = 0;
    this.duckUntil = 0;
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
  private createPanel(title: string, subtitle: string, icon = "✨"): HTMLDivElement {
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

  private challengeContent(panel: HTMLDivElement): HTMLDivElement {
    return panel.querySelector<HTMLDivElement>(".adventure-challenge-content")!;
  }

  private addPanelButton(panel: HTMLDivElement, label: string, action: () => void, variant = "primary"): void {
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

  private addChallengeText(panel: HTMLDivElement, text: string, className = "challenge-instruction"): HTMLParagraphElement {
    const paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = text;
    this.challengeContent(panel).append(paragraph);
    return paragraph;
  }

  private startChallenge(): void {
    if (this.session.levelNumber % 3 === 1) this.startMemoryChallenge();
    else if (this.session.levelNumber % 3 === 2) this.startPatternChallenge();
    else this.startKeyChallenge();
  }

  private startMemoryChallenge(): void {
    const panel = this.createPanel("Ocean Memory", "Find all three matching sea-creature pairs.", "🫧");
    this.addChallengeText(panel, "Tap two shells to reveal their pictures. Match all three pairs!");
    const symbols = ["🐬", "🐠", "🐙", "🐬", "🐠", "🐙"];
    const order = [2, 0, 4, 1, 5, 3];
    const grid = document.createElement("div");
    grid.className = "memory-card-grid";
    this.challengeContent(panel).append(grid);
    const cards: Array<{ value: string; button: HTMLButtonElement; matched: boolean }> = [];
    let first = -1;
    let locked = false;
    let pairs = 0;
    let moves = 0;
    const status = this.addChallengeText(panel, "Pairs: 0 / 3   •   Moves: 0", "challenge-status");

    order.forEach((symbolIndex, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "memory-card";
      button.textContent = "🐚";
      button.setAttribute("aria-label", "Hidden memory card");
      const card = { value: symbols[symbolIndex]!, button, matched: false };
      cards.push(card);
      grid.append(button);
      button.addEventListener("click", () => {
        if (locked || card.matched || button.dataset.revealed === "true" || !this.overlayElement?.isConnected) return;
        button.dataset.revealed = "true";
        button.textContent = card.value;
        button.classList.add("revealed");
        if (first < 0) {
          first = index;
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
          status.textContent = "Pairs: " + pairs + " / 3   •   Moves: " + moves;
          if (pairs === 3) this.showChallengeWon();
        } else {
          locked = true;
          status.textContent = "Not a match yet. Try remembering the pictures!";
          window.setTimeout(() => {
            if (!this.overlayElement?.isConnected) return;
            other.button.textContent = "🐚";
            button.textContent = "🐚";
            other.button.dataset.revealed = "false";
            button.dataset.revealed = "false";
            other.button.classList.remove("revealed");
            button.classList.remove("revealed");
            locked = false;
          }, 850);
        }
      });
    });
  }

  private startPatternChallenge(): void {
    const panel = this.createPanel("Gem Pattern", "Look carefully at the repeating pattern.", "💎");
    this.addChallengeText(panel, "Which gem comes next?");
    const pattern = document.createElement("div");
    pattern.className = "pattern-display";
    pattern.textContent = "💎   ⭐   💎   ⭐   ?";
    this.challengeContent(panel).append(pattern);
    const options = [["💎", true], ["⭐", false], ["🌙", false]] as const;
    const choices = document.createElement("div");
    choices.className = "challenge-choice-row";
    this.challengeContent(panel).append(choices);
    options.forEach(([symbol, correct]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "challenge-choice";
      button.textContent = symbol;
      button.addEventListener("click", () => {
        if (correct) this.showChallengeWon();
        else this.showRetryHint(panel, "Not quite! The pattern repeats: gem, star, gem, star...");
      });
      choices.append(button);
    });
  }

  private startKeyChallenge(): void {
    const panel = this.createPanel("Choose the Magic Key", "Match the key to the gate to continue.", "🔑");
    this.addChallengeText(panel, "The gate is blue. Which key will open it?");
    const door = document.createElement("div");
    door.className = "pattern-display";
    door.textContent = "🔵  🚪";
    this.challengeContent(panel).append(door);
    const options = [
      ["Pink key 🗝️", false, "pink"],
      ["Blue key 🔑", true, "blue"],
      ["Gold key 🗝️", false, "gold"]
    ] as const;
    const choices = document.createElement("div");
    choices.className = "challenge-key-list";
    this.challengeContent(panel).append(choices);
    options.forEach(([label, correct, colour]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "challenge-key " + colour;
      button.textContent = label;
      button.addEventListener("click", () => {
        if (correct) this.showChallengeWon();
        else this.showRetryHint(panel, "That key does not match the blue gate. Try another key!");
      });
      choices.append(button);
    });
  }

  private showRetryHint(panel: HTMLDivElement, message: string): void {
    let hint = panel.querySelector<HTMLParagraphElement>(".challenge-feedback");
    if (!hint) {
      hint = document.createElement("p");
      hint.className = "challenge-feedback";
      this.challengeContent(panel).append(hint);
    }
    hint.textContent = message;
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
      message
    });
  }
}