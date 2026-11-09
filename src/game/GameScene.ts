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
type TileItem = "coin" | "gem" | "key" | "door" | "trap" | "monster" | "chest" | "switch" | "hidden";

const COLS = 15, ROWS = 23;
const START = { x: 1, y: 1 };
const EXIT = { x: COLS - 2, y: ROWS - 2 };
const keyOf = (x: number, y: number): string => `${x},${y}`;

function rng(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

function generateMaze(seed: number): number[][] {
  const random = rng(seed);
  const grid = Array.from({ length: ROWS }, () => Array<number>(COLS).fill(1));
  const stack = [START];
  grid[1]![1] = 0;
  const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]] as const;
  while (stack.length) {
    const p = stack[stack.length - 1]!;
    const options = dirs.map(([dx, dy]) => ({ x: p.x + dx, y: p.y + dy, dx, dy }))
      .filter(n => n.x > 0 && n.x < COLS - 1 && n.y > 0 && n.y < ROWS - 1 && grid[n.y]![n.x] === 1);
    if (!options.length) { stack.pop(); continue; }
    const n = options[Math.floor(random() * options.length)]!;
    grid[p.y + n.dy / 2]![p.x + n.dx / 2] = 0;
    grid[n.y]![n.x] = 0;
    stack.push({ x: n.x, y: n.y });
  }
  return grid;
}

function shortestPath(grid: number[][]): Array<{x:number;y:number}> {
  const queue = [START];
  const prev = new Map<string, string | null>([[keyOf(1,1), null]]);
  const dirs = [[0,-1],[1,0],[0,1],[-1,0]] as const;
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i]!;
    if (p.x === EXIT.x && p.y === EXIT.y) break;
    for (const [dx,dy] of dirs) {
      const x=p.x+dx,y=p.y+dy,k=keyOf(x,y);
      if (grid[y]?.[x] !== 0 || prev.has(k)) continue;
      prev.set(k,keyOf(p.x,p.y)); queue.push({x,y});
    }
  }
  const path:Array<{x:number;y:number}>=[];
  let cursor:string|null=keyOf(EXIT.x,EXIT.y);
  while(cursor) {
    const [x,y]=cursor.split(",").map(Number);
    path.push({x,y}); cursor=prev.get(cursor) ?? null;
  }
  return path.reverse();
}

export class GameScene extends Phaser.Scene {
  private readonly session: MazeSession;
  private readonly onProgress: (p: MazeProgress) => void;
  private readonly onComplete: (r: MazeReward) => void;
  private grid:number[][]=[];
  private specials=new Map<string,TileItem>();
  private specialSprites=new Map<string,Phaser.GameObjects.Text>();
  private player!:Phaser.GameObjects.Container;
  private px=1; private py=1; private tile=20; private left=0; private top=0;
  private hearts=5; private coins=0; private gems=0; private hasKey=false;
  private invulnerableUntil=0; private complete=false; private hiddenOpen=false;
  private swipeStartX=0; private swipeStartY=0; private swipePointerId=-1;

  constructor(session:MazeSession,onProgress:(p:MazeProgress)=>void,onComplete:(r:MazeReward)=>void) {
    super("MazeScene"); this.session=session; this.onProgress=onProgress; this.onComplete=onComplete;
  }

  create():void {
    this.cameras.main.setBackgroundColor(this.session.world.sky);
    this.buildLevel(); this.drawBoard();
    this.input.keyboard?.on("keydown",this.handleKey,this);
    this.input.on("pointerdown",(pointer:Phaser.Input.Pointer)=>{
      this.swipeStartX=pointer.x;
      this.swipeStartY=pointer.y;
      this.swipePointerId=pointer.id;
    });
    this.input.on("pointerup",(pointer:Phaser.Input.Pointer)=>{
      if(pointer.id!==this.swipePointerId)return;
      const dx=pointer.x-this.swipeStartX;
      const dy=pointer.y-this.swipeStartY;
      this.swipePointerId=-1;
      if(Math.max(Math.abs(dx),Math.abs(dy))<28)return;
      if(Math.abs(dx)>Math.abs(dy))this.move(dx>0?1:-1,0);
      else this.move(0,dy>0?1:-1);
    });
    this.scale.on(Phaser.Scale.Events.RESIZE,this.drawBoard,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.input.keyboard?.off("keydown",this.handleKey,this);
      this.input.off("pointerdown");
      this.input.off("pointerup");
      this.scale.off(Phaser.Scale.Events.RESIZE,this.drawBoard,this);
    });
    this.publish("Find the key, dodge the hazards and reach the portal!");
  }

  move(dx:number,dy:number):void {
    if(this.complete || !this.player)return;
    let x=this.px+dx,y=this.py+dy;
    const targetCell=this.grid[y]?.[x];
    if(targetCell!==0 && !(targetCell===2 && this.hiddenOpen)){
      this.publish(targetCell===2?"🔮 The secret path is still hidden. Find its switch!":"🧱 A wall blocks this way. Try another turn.");
      return;
    }
    const key=keyOf(x,y),item=this.specials.get(key);
    let message="Keep exploring!";
    let redraw=false;
    if(item==="door"&&!this.hasKey){this.publish("🔒 Find the golden key to open this door!");return;}
    if(item==="key"){this.hasKey=true;this.removeItem(key);message="🗝️ Golden key found! The magic door will open.";}
    else if(item==="coin"){this.coins++;this.removeItem(key);message="🪙 Coin collected!";}
    else if(item==="gem"){this.gems++;this.removeItem(key);message="💎 Sparkling gem collected!";}
    else if(item==="chest"){this.coins+=8;this.gems++;this.removeItem(key);message="🎁 Treasure chest! +8 coins and +1 gem!";}
    else if(item==="switch"){this.hiddenOpen=true;this.removeItem(key);message="✨ Switch activated! A secret passage has appeared.";redraw=true;}
    else if(item==="hidden"){this.removeItem(key);message="🌟 You discovered a hidden shortcut!";}
    else if((item==="trap"||item==="monster")&&Date.now()>this.invulnerableUntil){
      this.hearts--;this.invulnerableUntil=Date.now()+950;this.removeItem(key);
      message=item==="trap"?"⚡ Magic trap! One heart lost.":"👾 Monster bump! One heart lost.";
      if(this.hearts<=0){this.hearts=5;x=START.x;y=START.y;message="🧚 A fairy brought you safely back to the start. Keep going!";}
    }
    this.px=x;this.py=y;
    if(redraw)this.drawBoard();
    else this.player.setPosition(this.cellX(x),this.cellY(y));
    if(x===EXIT.x&&y===EXIT.y){
      if((this.session.challenge==="key-door"||this.session.challenge==="tricky")&&!this.hasKey){this.publish("The portal needs the golden key. Search the maze!");return;}
      this.complete=true;
      const stars=this.hearts>=4?3:this.hearts>=2?2:1;
      this.publish("🌟 Level complete! Portal reached!");
      this.onComplete({coins:25+this.coins*3+stars*5,gems:this.gems,stars,challenge:this.session.challenge});
      return;
    }
    this.publish(message);
  }

  private buildLevel():void {
    const seed=(this.session.worldIndex+1)*7919+this.session.levelNumber*104729;
    this.grid=generateMaze(seed);this.specials.clear();
    const path=shortestPath(this.grid),random=rng(seed^0x5f3759df);
    const reserved=new Set([keyOf(START.x,START.y),keyOf(EXIT.x,EXIT.y)]);
    const put=(x:number,y:number,t:TileItem):void=>{
      const k=keyOf(x,y);if(reserved.has(k)||this.specials.has(k))return;
      this.specials.set(k,t);reserved.add(k);
    };
    if(this.session.challenge==="key-door"||this.session.challenge==="tricky"){
      const k=path[Math.floor(path.length*.29)]!,d=path[Math.floor(path.length*.72)]!;
      put(k.x,k.y,"key");put(d.x,d.y,"door");
    }
    if(this.session.challenge==="tricky"){
      const switchStart=Math.floor(path.length*.48);
      for(let offset=0;offset<path.length/3;offset++){
        const candidate=path[Math.min(path.length-2,switchStart+offset)]!;
        if(!reserved.has(keyOf(candidate.x,candidate.y))){put(candidate.x,candidate.y,"switch");break;}
      }
      const hiddenCandidates:Array<{x:number;y:number}>=[];
      for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
        if(this.grid[y]![x]!==1)continue;
        const horizontal=this.grid[y]![x-1]===0&&this.grid[y]![x+1]===0;
        const vertical=this.grid[y-1]![x]===0&&this.grid[y+1]![x]===0;
        if(horizontal||vertical)hiddenCandidates.push({x,y});
      }
      if(hiddenCandidates.length){
        const hidden=hiddenCandidates[Math.floor(random()*hiddenCandidates.length)]!;
        this.grid[hidden.y]![hidden.x]=2;
        this.specials.set(keyOf(hidden.x,hidden.y),"hidden");
        reserved.add(keyOf(hidden.x,hidden.y));
      }
    }
    for(let i=10;i<path.length-6;i+=9){const p=path[i]!;put(p.x,p.y,"coin");}
    const cells:Array<{x:number;y:number}>=[];
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(this.grid[y]![x]===0&&!reserved.has(keyOf(x,y)))cells.push({x,y});
    for(let i=cells.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cells[i],cells[j]]=[cells[j]!,cells[i]!];}
    let coins=0,gems=0,traps=0,monsters=0,chests=0;
    const trapLimit=this.session.challenge==="obstacle"||this.session.challenge==="tricky"?14:8;
    const monsterLimit=this.session.challenge==="monster"?10:5;
    for(const p of cells){
      const r=random();
      if(coins<14&&r<.24){put(p.x,p.y,"coin");coins++;}
      else if(gems<5&&r<.34){put(p.x,p.y,"gem");gems++;}
      else if(traps<trapLimit&&r<.53){put(p.x,p.y,"trap");traps++;}
      else if(monsters<monsterLimit&&r<.66){put(p.x,p.y,"monster");monsters++;}
      else if(chests<2&&r>.95){put(p.x,p.y,"chest");chests++;}
      if(coins>=14&&gems>=5&&traps>=trapLimit&&monsters>=monsterLimit&&chests>=2)break;
    }
    const routeHazards=this.session.challenge==="obstacle"||this.session.challenge==="tricky"?5:3;
    for(let i=17,n=0;i<path.length-9&&n<routeHazards;i+=16){
      const p=path[i]!;const k=keyOf(p.x,p.y);
      if(!reserved.has(k)){put(p.x,p.y,"trap");n++;}
    }
  }

  private drawBoard():void {
    this.tweens.killAll();
    this.children.removeAll(true);this.specialSprites.clear();
    const w=this.scale.width,h=this.scale.height;
    this.tile=Math.max(11,Math.min(36,(w-12)/COLS,(h-12)/ROWS));
    this.left=(w-COLS*this.tile)/2;this.top=(h-ROWS*this.tile)/2;
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
      const cx=this.cellX(x),cy=this.cellY(y);
      if(this.grid[y]?.[x]!==0 && !(this.grid[y]?.[x]===2 && this.hiddenOpen)){
        this.add.rectangle(cx,cy,this.tile-1,this.tile-1,this.session.world.wall).setStrokeStyle(1,this.session.world.accent,.65);
        this.add.circle(cx,cy,Math.max(1,this.tile*.055),this.session.world.accent,.3);
      }else{
        this.add.rectangle(cx,cy,this.tile-1,this.tile-1,this.session.world.floor).setStrokeStyle(1,this.session.world.accent,.28);
      }
    }
    const icons:Record<TileItem,string>={coin:"🪙",gem:"💎",key:"🗝️",door:"🚪",trap:"⚡",monster:"👾",chest:"🎁",switch:"🔘",hidden:"🌟"};
    for(const [key,item] of this.specials){
      if(item==="hidden"&&!this.hiddenOpen)continue;
      const [x,y]=key.split(",").map(Number);
      const sprite=this.add.text(this.cellX(x!),this.cellY(y!),icons[item],{fontFamily:"system-ui",fontSize:`${Math.max(11,this.tile*.72)}px`}).setOrigin(.5);
      this.specialSprites.set(key,sprite);
      if(item==="monster")this.tweens.add({targets:sprite,y:sprite.y-2,duration:500,yoyo:true,repeat:-1});
      if(item==="coin"||item==="gem")this.tweens.add({targets:sprite,angle:12,duration:750,yoyo:true,repeat:-1});
    }
    const portal=this.add.text(this.cellX(EXIT.x),this.cellY(EXIT.y),"🌀",{fontFamily:"system-ui",fontSize:`${Math.max(13,this.tile*.88)}px`}).setOrigin(.5);
    this.tweens.add({targets:portal,scale:1.15,duration:700,yoyo:true,repeat:-1});
    const character=getCharacter(this.session.characterId);
    const appearance=this.session.appearance ?? {hairstyle:"🌸",outfit:"👗",accessory:"✨"};
    this.player=this.add.container(this.cellX(this.px),this.cellY(this.py)).setDepth(10);
    this.player.add([
      this.add.circle(0,0,this.tile*.43,character.colour).setStrokeStyle(1.5,0xffffff),
      this.add.text(0,-this.tile*.02,character.token,{fontFamily:"system-ui",fontSize:`${Math.max(14,this.tile*.77)}px`}).setOrigin(.5),
      this.add.text(-this.tile*.28,-this.tile*.38,appearance.hairstyle,{fontFamily:"system-ui",fontSize:`${Math.max(7,this.tile*.34)}px`}).setOrigin(.5),
      this.add.text(this.tile*.30,-this.tile*.37,appearance.accessory,{fontFamily:"system-ui",fontSize:`${Math.max(7,this.tile*.34)}px`}).setOrigin(.5),
      this.add.text(0,this.tile*.38,appearance.outfit,{fontFamily:"system-ui",fontSize:`${Math.max(7,this.tile*.38)}px`}).setOrigin(.5)
    ]);
    const ink=this.session.world.id==="space"?"#ffffff":"#59446c";
    this.add.text(w/2,6,`${this.session.world.icon} ${this.session.world.name}  •  LEVEL ${this.session.levelNumber}`,{fontFamily:"system-ui",fontSize:"12px",fontStyle:"bold",color:ink,backgroundColor:"#00000033",padding:{x:8,y:4}}).setOrigin(.5,0);
  }

  private removeItem(key:string):void {
    this.specials.delete(key);const sprite=this.specialSprites.get(key);
    if(sprite){this.tweens.killTweensOf(sprite);sprite.destroy();this.specialSprites.delete(key);}
  }
  private handleKey(event:KeyboardEvent):void {
    const k=event.key.toLowerCase();
    if(k==="arrowup"||k==="w")this.move(0,-1);
    else if(k==="arrowdown"||k==="s")this.move(0,1);
    else if(k==="arrowleft"||k==="a")this.move(-1,0);
    else if(k==="arrowright"||k==="d")this.move(1,0);
  }
  private publish(message:string):void {
    this.onProgress({hearts:this.hearts,coins:this.coins,gems:this.gems,hasKey:this.hasKey,message});
  }
  private cellX(x:number):number{return this.left+x*this.tile+this.tile/2;}
  private cellY(y:number):number{return this.top+y*this.tile+this.tile/2;}
}
