const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
ctx.imageSmoothingEnabled = false;

const names = ["Fandango","Sidewinder","Wipeout","Big Dukes","Blaster","Cliffhanger","Huevos Grande","Hurricane Gulch"];
const files = ["fandango","sidewinder","wipeout","big-dukes","blaster","cliffhanger","huevos-grande","hurricane-gulch"];
const colors = ["#ec8be8","#efef28","#a38de2","#c5c5c5"];
const assetRoot = "./assets";
const countries = ["ITALY","FRANCE","JAPAN","CANADA","USA","BRITAIN","AUSTRALIA","GERMANY"];
const upgrades = [
  {label:"NITRO",price:10000,key:"nitro"},
  {label:"ACCELERATION",price:80000,key:"accel"},
  {label:"TIRES",price:40000,key:"tires"},
  {label:"TOP SPEED",price:100000,key:"speed"},
  {label:"SHOCKS",price:60000,key:"shocks"}
];
const awards = [150000,130000,110000,100000];
const routes = [
  [[295,285],[175,295],[125,313],[70,300],[80,250],[150,235],[235,185],[200,145],[155,105],[110,105],[60,80],[73,28],[200,30],[390,30],[525,35],[530,75],[455,110],[390,150],[375,185],[460,210],[525,230],[525,290],[490,320],[385,325]],
  [[110,325],[65,300],[60,245],[75,170],[70,80],[100,40],[230,35],[390,35],[520,35],[540,75],[515,110],[440,120],[310,115],[250,135],[270,180],[400,185],[520,200],[535,255],[510,315],[350,315],[230,310]],
  [[280,325],[170,325],[75,310],[55,275],[80,230],[185,190],[220,160],[170,125],[75,120],[55,80],[75,35],[220,30],[410,30],[530,35],[535,75],[475,115],[405,150],[405,205],[455,245],[480,295],[430,325]],
  [[305,325],[450,320],[525,305],[530,255],[430,230],[270,225],[120,220],[65,180],[60,100],[75,40],[180,35],[360,35],[520,35],[530,80],[450,105],[310,110],[165,105],[120,150],[200,180],[390,180],[515,195]],
  [[95,225],[60,210],[50,145],[65,65],[105,30],[205,35],[255,70],[310,85],[445,70],[525,70],[530,115],[475,145],[340,150],[290,190],[345,210],[500,210],[535,250],[500,310],[375,320],[220,315],[180,270],[125,230]],
  [[325,325],[205,315],[80,300],[55,240],[100,180],[190,145],[130,105],[65,85],[65,40],[230,30],[390,30],[535,35],[535,105],[480,150],[520,215],[500,285],[455,320]],
  [[290,325],[170,320],[80,310],[65,265],[70,170],[90,80],[145,40],[320,35],[470,40],[520,80],[470,120],[370,120],[310,140],[325,185],[455,205],[500,245],[480,305],[420,325]],
  [[285,325],[180,315],[75,300],[55,245],[60,135],[90,55],[185,40],[300,55],[410,50],[520,40],[535,95],[495,155],[445,200],[475,245],[490,300],[430,320]]
];
const starts = [[340,280],[140,280],[310,280],[330,285],[115,195],[340,310],[310,300],[305,290]];
const trackImages = files.map(file => {
  const image = new Image();
  image.src = `${assetRoot}/${file}.png`;
  return image;
});
const hudImages = files.map(file => {
  const image = new Image();
  image.src = `${assetRoot}/hud-${file}.png`;
  return image;
});
const shopBase=new Image();shopBase.src=`${assetRoot}/shop-base.png`;
const shopMenu=new Image();shopMenu.src=`${assetRoot}/shop-menu.png`;
const titleImage=new Image();titleImage.src=`${assetRoot}/title.png`;
const introImage=new Image();introImage.src=`${assetRoot}/race-intro.png`;
const totalsImage=new Image();totalsImage.src=`${assetRoot}/totals-base.png`;
const trophyImage=new Image();trophyImage.src=`${assetRoot}/trophy-header.png`;
const menuImages={};
for(const key of ["player-count","name-entry","country-select","results-podium"]){
  const image=new Image();image.src=`${assetRoot}/${key}.png`;menuImages[key]=image;
}
const truckImages=["pink","yellow","purple","grey"].map(name=>{
  const image=new Image();image.src=`${assetRoot}/truck-${name}.png`;return image;
});
const recordings=new Map();
let playing=null;
function music(name,loop=false,onEnd=null){
  if(playing){playing.pause();playing.currentTime=0;playing.onended=null;}
  if(!name){playing=null;return;}
  let audio=recordings.get(name);
  if(!audio){audio=new Audio(`${assetRoot}/music/${name}.ogg`);recordings.set(name,audio);}
  audio.loop=loop;audio.volume=.45;audio.onended=onEnd;audio.currentTime=0;
  playing=audio;audio.play().catch(()=>{});
}
const anthemFiles=["italy","france","japan","canada","usa","britain","australia","germany"];
const trackPixels = trackImages.map((image, i) => {
  image.addEventListener("load", () => {
    const c = document.createElement("canvas");
    c.width = 600;c.height = 360;
    const g = c.getContext("2d", {willReadFrequently:true});
    g.drawImage(image,0,0);
    trackPixels[i]=g.getImageData(0,0,600,360).data;
  });
  return null;
});

let state = "title", players = 1, race = 1, track = 0, reverse = false, paused = false;
let menuIndex = 0, shopPlayer = 0, shopIndex = 0, elapsed = 0, finishDelay = 0, introTime = 0, endTime = 0;
let trucks = [], pickups = [], pickupCount = 0, pickupTimer = 0, placement = [];
const held = new Set(), just = new Set();
const padNitroHeld=[false,false,false,false];
const racerNames = ["PLAYER 1","PLAYER 2","PLAYER 3","PLAYER 4"];
const racerCountries = [4,4,4,4];
const racerStats = Array.from({length:4},()=>({cash:0,points:0,lives:3,nitro:25,tires:0,shocks:0,accel:0,speed:0,active:true}));
let nameBuffer = "", namePlayer = 0, nameLetter = 0;
const nameLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const padMenuPrevious = new Map();
const padMenuRepeat = new Map();
function connectedGamepads(){
  return Array.from(navigator.getGamepads?.()||[]).filter(pad=>pad&&pad.connected!==false);
}
function buttonDown(pad,index){
  const button=pad?.buttons?.[index];
  return typeof button==="number"?button>.5:!!(button?.pressed||button?.value>.5);
}
function padDirection(pad){
  const hat=pad?.mapping!=="standard"&&pad?.axes?.length>6;
  const horizontal=hat?pad.axes[6]:0,vertical=hat?pad.axes[7]:0;
  const dLeft=buttonDown(pad,14)||horizontal<-.5;
  const dRight=buttonDown(pad,15)||horizontal>.5;
  const dUp=buttonDown(pad,12)||vertical<-.5;
  const dDown=buttonDown(pad,13)||vertical>.5;
  return {
    left:dLeft||(pad?.axes?.[0]||0)<-.5,
    right:dRight||(pad?.axes?.[0]||0)>.5,
    up:dUp||(pad?.axes?.[1]||0)<-.5,
    down:dDown||(pad?.axes?.[1]||0)>.5
  };
}

function trackForRace(n) {
  if (n > 42) n = 27 + (n - 43) % 16;
  const bands = [[2,false],[5,true],[9,false],[14,true],[20,false],[26,true],[34,false],[42,true]];
  let prev = 0;
  for (const [end,backward] of bands) {
    if (n <= end) return {track:n-prev-1,reverse:backward};
    prev = end;
  }
  return {track:0,reverse:false};
}
function point(i) {
  const route = routes[track];
  return reverse ? route[(route.length - i) % route.length] : route[i % route.length];
}
function startRace() {
  const info=trackForRace(race);track=info.track;reverse=info.reverse;
  const s=starts[track];elapsed=0;pickups=[];pickupCount=0;pickupTimer=2;placement=[];paused=false;finishDelay=0;
  trucks=Array.from({length:4},(_,i)=>({
    x:s[0]+(i%2)*18-9,y:s[1]+Math.floor(i/2)*17-9,
    vx:0,vy:0,angle:reverse ? 0 : Math.PI,lap:1,waypoint:1,finished:false,
    boost:0,rank:0,i
  }));
  state="intro";introTime=4;
  music("race-start");
}
function spawnPickup() {
  const route=routes[track], p=route[(4+pickupCount*3)%route.length];
  pickups.push({x:p[0],y:p[1],kind:pickupCount%2?"nitro":"cash",value:Math.min(5,Math.floor(pickupCount/2)+1),ttl:12});
  pickupCount++;
  if(pickups.length>3)pickups.shift();
}
function road(x,y) {
  if(x<7||x>592||y<3||y>337)return false;
  const data=trackPixels[track];
  if(!data)return true;
  let barriers=0;
  for(const dy of [-4,0,4])for(const dx of [-4,0,4]){
    const px=Math.max(0,Math.min(599,Math.round(x+dx)));
    const py=Math.max(0,Math.min(359,Math.round(y+dy)));
    const j=(py*600+px)*4, r=data[j],g=data[j+1],b=data[j+2];
    if((r>185&&g>170&&b>150)||(r>55&&r<145&&g<15&&b<15))barriers++;
  }
  const s=starts[track];
  return barriers<7 || Math.abs(x-s[0])<120&&Math.abs(y-s[1])<45;
}
function controls(i) {
  const pad=connectedGamepads()[i];
  const direction=padDirection(pad);
  const left=(i===0&&held.has("ArrowLeft"))||(i===1&&held.has("KeyA"))||direction.left;
  const right=(i===0&&held.has("ArrowRight"))||(i===1&&held.has("KeyD"))||direction.right;
  const gas=(i===0&&held.has("KeyX"))||(i===1&&held.has("KeyJ"))||buttonDown(pad,0);
  const nitroKey=i===0?"KeyZ":i===1?"KeyK":null;
  const keyNitro=nitroKey?just.delete(nitroKey):false;
  const padPressed=buttonDown(pad,1);
  const nitro=keyNitro||padPressed&&!padNitroHeld[i];
  padNitroHeld[i]=padPressed;
  return {turn:Number(right)-Number(left),gas,nitro};
}
function updateTruck(t,dt) {
  const stat=racerStats[t.i];
  if(t.i>=players||!stat.active){
    const route=routes[track];
    let length=0;
    const segments=[];
    for(let j=0;j<route.length;j++){
      const a=point(j),b=point(j+1),d=Math.hypot(b[0]-a[0],b[1]-a[1]);
      segments.push(d);length+=d;
    }
    t.aiProgress=(t.aiProgress||0)+(122+Math.min(60,race*.8)+t.i*2)*dt;
    let along=(t.aiProgress+t.i*18)%length, j=0;
    while(along>segments[j]&&j<segments.length-1)along-=segments[j++];
    const a=point(j),b=point(j+1),f=along/segments[j];
    t.x=a[0]+(b[0]-a[0])*f;t.y=a[1]+(b[1]-a[1])*f;
    t.angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
    t.waypoint=(j+1)%route.length;
    t.lap=Math.min(5,1+Math.floor(t.aiProgress/length));
    if(t.lap>4&&!t.finished){t.finished=true;t.rank=placement.length+1;placement.push(t.i);}
    return;
  }
  let steer=0,gas=false,nitro=false;
  ({turn:steer,gas,nitro}=controls(t.i));
  const speed=Math.hypot(t.vx,t.vy);
  const turnSpeed=(2.9+stat.tires*.13)*(speed<18?.7:1);
  t.angle+=steer*turnSpeed*dt;
  if(nitro&&stat.nitro>0&&gas){stat.nitro--;t.boost=.7;}
  t.boost=Math.max(0,t.boost-dt);
  const acceleration=170+stat.accel*18;
  const limit=165+stat.speed*13+(t.boost>0?140:0);
  if(gas){
    t.vx+=Math.cos(t.angle)*acceleration*dt;
    t.vy+=Math.sin(t.angle)*acceleration*dt;
  }
  const drag=Math.exp(-(gas?.7:2.5)*dt);
  t.vx*=drag;t.vy*=drag;
  const v=Math.hypot(t.vx,t.vy);
  if(v>limit){t.vx*=limit/v;t.vy*=limit/v;}
  t.x+=t.vx*dt;t.y+=t.vy*dt;
  if(t.x<7||t.x>592){t.x=Math.max(7,Math.min(592,t.x));t.vx*=-.25;}
  if(t.y<3||t.y>337){t.y=Math.max(3,Math.min(337,t.y));t.vy*=-.25;}
  if(!road(t.x,t.y)){const curbDrag=Math.exp(-4*dt);t.vx*=curbDrag;t.vy*=curbDrag;}
  const p=point(t.waypoint);
  if(Math.hypot(t.x-p[0],t.y-p[1])<25) {
    t.waypoint=(t.waypoint+1)%routes[track].length;
    if(t.waypoint===1){
      t.lap++;
      if(t.lap>4&&!t.finished){t.finished=true;t.rank=placement.length+1;placement.push(t.i);}
    }
  }
  const found=pickups.find(p=>Math.hypot(t.x-p.x,t.y-p.y)<14);
  if(found){
    if(found.kind==="nitro")stat.nitro=Math.min(99,stat.nitro+found.value);
    else {
      const bonus=Math.min(40000,found.value*10000);
      stat.cash+=bonus;stat.points+=bonus/1000;
    }
    pickups.splice(pickups.indexOf(found),1);
  }
}
function update(dt){
  if(state==="totals"){
    endTime-=dt;
    if(endTime<=0)state="highscores";
    return;
  }
  if(state==="intro"){
    introTime-=dt;
    if(introTime<=0){state="race";music(files[track],true);}
    return;
  }
  if(state!=="race"||paused)return;
  elapsed+=dt;
  pickupTimer-=dt;
  if(pickupTimer<=0){spawnPickup();pickupTimer=3.5;}
  pickups=pickups.filter(p=>{p.ttl-=dt;return p.ttl>0;});
  for(const t of trucks)if(!t.finished)updateTruck(t,dt);
  for(let a=0;a<4;a++)for(let b=a+1;b<4;b++){
    const A=trucks[a],B=trucks[b],dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy);
    if(d>0&&d<15){
      const n=(15-d)/2,ax=A.x-dx/d*n,ay=A.y-dy/d*n,bx=B.x+dx/d*n,by=B.y+dy/d*n;
      if(A.i>=players||road(ax,ay)){A.x=ax;A.y=ay;}
      if(B.i>=players||road(bx,by)){B.x=bx;B.y=by;}
      A.vx*=.7;A.vy*=.7;B.vx*=.7;B.vy*=.7;
    }
  }
  if(trucks.every(t=>t.finished)){
    finishDelay+=dt;
    if(finishDelay>=1.5)finishRace();
  }
}
function finishRace(){
  const remaining=trucks.filter(t=>!t.finished).sort((a,b)=>b.lap-a.lap||b.waypoint-a.waypoint);
  placement.push(...remaining.map(t=>t.i));
  placement.forEach((id,position)=>{
    if(id>=players||!racerStats[id].active)return;
    const stat=racerStats[id];
    const beatenByCpu=placement.slice(0,position).some(other=>other>=players||!racerStats[other].active);
    const money=awards[position]-(beatenByCpu?30000:0);
    stat.cash+=money;stat.points+=Math.floor(money/1000);
    if(position===0)stat.lives=Math.min(3,stat.lives+1);
    if(position===3)stat.lives--;
  });
  state="results";
  const winner=placement[0];
  music("race-end",false,()=>{
    if(winner<players&&racerStats[winner].active)music(anthemFiles[racerCountries[winner]]);
  });
}
function nextFromResults(){
  music(null);
  if(race===99){endGame();return;}
  const out=Array.from({length:players},(_,i)=>i).filter(i=>racerStats[i].active&&racerStats[i].lives<=0);
  if(out.length){state="continue";menuIndex=0;return;}
  shopPlayer=Array.from({length:players},(_,i)=>i).find(i=>racerStats[i].active)??0;
  shopIndex=0;state="shop";
}
function continueDecision(yes){
  for(let i=0;i<players;i++)if(racerStats[i].active&&racerStats[i].lives<=0){
    if(yes && race<15){racerStats[i].lives=3;racerStats[i].cash=0;racerStats[i].points=0;}
    else racerStats[i].active=false;
  }
  if(Array.from({length:players},(_,i)=>racerStats[i].active).every(v=>!v)){endGame();return;}
  shopPlayer=Array.from({length:players},(_,i)=>i).find(i=>racerStats[i].active)??0;
  shopIndex=0;state="shop";
}
function endGame(){state="totals";endTime=4;music(null);}
function buy(){
  if(shopIndex===5){
    shopPlayer=Array.from({length:players},(_,i)=>i).find(i=>i>shopPlayer&&racerStats[i].active)??players;
    shopIndex=0;if(shopPlayer>=players){race++;startRace();}return;
  }
  const item=upgrades[shopIndex],stat=racerStats[shopPlayer];
  if(stat.cash<item.price)return;
  if(item.key==="nitro"){if(stat.nitro>=99)return;stat.nitro++;}
  else {if(stat[item.key]>=6)return;stat[item.key]++;}
  stat.cash-=item.price;
}
function handleMenu(key){
  if(state==="title"){if(key==="Enter"||key==="Space"){state="players";menuIndex=0;music("title",true);}return;}
  if(state==="players"){
    if(key==="ArrowLeft"||key==="ArrowUp")players=Math.max(1,players-1);
    if(key==="ArrowRight"||key==="ArrowDown")players=Math.min(4,players+1);
    if(key==="Enter"){state="name";namePlayer=0;nameBuffer="";}
    return;
  }
  if(state==="name"){
    if(key==="Backspace")nameBuffer=nameBuffer.slice(0,-1);
    else if(key==="ArrowLeft")nameLetter=(nameLetter+27)%28;
    else if(key==="ArrowRight")nameLetter=(nameLetter+1)%28;
    else if(key==="ArrowUp")nameLetter=(nameLetter+24)%28;
    else if(key==="ArrowDown")nameLetter=(nameLetter+4)%28;
    else if(key==="GamepadA"&&nameLetter===26)nameBuffer=nameBuffer.slice(0,-1);
    else if(key==="GamepadA"&&nameLetter===27)handleMenu("GamepadStart");
    else if(key==="GamepadA"&&nameBuffer.length<10)nameBuffer+=nameLetters[nameLetter];
    else if(key==="Enter"||key==="GamepadStart"){
      racerNames[namePlayer]=nameBuffer.trim().toUpperCase()||`PLAYER ${namePlayer+1}`;
      namePlayer++;nameBuffer="";nameLetter=0;
      if(namePlayer>=players){state="country";namePlayer=0;menuIndex=4;}
    }else if(key.length===1&&/[a-z0-9 ]/i.test(key)&&nameBuffer.length<10)nameBuffer+=key;
    return;
  }
  if(state==="country"){
    if(key==="ArrowUp"||key==="ArrowLeft")menuIndex=(menuIndex+7)%8;
    if(key==="ArrowDown"||key==="ArrowRight")menuIndex=(menuIndex+1)%8;
    if(key==="Enter"){
      racerCountries[namePlayer]=menuIndex;namePlayer++;menuIndex=4;
      if(namePlayer>=players)startRace();
    }
    return;
  }
  if(state==="race"){if(key==="Enter")paused=!paused;return;}
  if(state==="results"){if(key==="Enter")nextFromResults();return;}
  if(state==="continue"){
    if(key==="ArrowLeft"||key==="ArrowRight")menuIndex=1-menuIndex;
    if(key==="Enter")continueDecision(menuIndex===0);
    return;
  }
  if(state==="shop"){
    if(key==="ArrowUp")shopIndex=(shopIndex+4)%6;
    if(key==="ArrowDown")shopIndex=(shopIndex+2)%6;
    if(key==="ArrowLeft"||key==="ArrowRight")shopIndex=shopIndex%2===0?shopIndex+1:shopIndex-1;
    if(key==="Enter")buy();
    return;
  }
  if(state==="totals"&&key==="Enter"){state="highscores";return;}
  if(state==="highscores"&&key==="Enter"){location.reload();}
}
window.addEventListener("keydown",e=>{
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();
  if(!held.has(e.code))just.add(e.code);
  held.add(e.code);
  if(!e.repeat)handleMenu(e.key);
});
window.addEventListener("keyup",e=>held.delete(e.code));
function pollGamepads(){
  for(const pad of connectedGamepads()){
    const direction=padDirection(pad);
    const pressed={
      ...direction,
      a:buttonDown(pad,0),
      b:buttonDown(pad,1),
      start:buttonDown(pad,9)||buttonDown(pad,8)
    };
    const previous=padMenuPrevious.get(pad.index)??{};
    const repeats=padMenuRepeat.get(pad.index)??{};
    const now=performance.now();
    if(state==="race"){
      if(pressed.start&&!previous.start)handleMenu("Enter");
    }else if(state!=="intro"){
      for(const [button,key] of [["left","ArrowLeft"],["right","ArrowRight"],["up","ArrowUp"],["down","ArrowDown"]]){
        if(pressed[button]&&(!previous[button]||now>=(repeats[button]??Infinity))){
          handleMenu(key);
          repeats[button]=now+(previous[button]?130:350);
        }
        if(!pressed[button])delete repeats[button];
      }
      if(pressed.b&&!previous.b&&state==="name")handleMenu("Backspace");
      if(pressed.a&&!previous.a)handleMenu(state==="name"?"GamepadA":"Enter");
      if(pressed.start&&!previous.start)handleMenu(state==="name"?"GamepadStart":"Enter");
    }
    padMenuPrevious.set(pad.index,pressed);
    padMenuRepeat.set(pad.index,repeats);
  }
}

function text(s,x,y,size=18,color="#f6ea88",align="left"){
  ctx.fillStyle=color;ctx.font=`bold ${size}px monospace`;ctx.textAlign=align;
  ctx.fillText(s,x,y);
}
function box(x,y,w,h,fill="#170000",stroke="#a6541a"){
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.strokeRect(x+1.5,y+1.5,w-3,h-3);
}
function drawTruck(t){
  ctx.save();ctx.translate(t.x,t.y+88);
  let displayAngle=Math.atan2(Math.sin(t.angle),Math.cos(t.angle));
  let mirrored=false;
  if(displayAngle>Math.PI/2){displayAngle-=Math.PI;mirrored=true;}
  if(displayAngle< -Math.PI/2){displayAngle+=Math.PI;mirrored=true;}
  ctx.rotate(displayAngle);ctx.scale(mirrored?-1:1,1);
  if(t.boost>0){
    ctx.fillStyle="#fff8e8";
    ctx.fillRect(-26,-5,5,3);ctx.fillRect(-31,3,4,3);ctx.fillRect(-35,-1,3,2);
  }
  const im=truckImages[t.i];
  if(im.complete&&im.naturalWidth)ctx.drawImage(im,-20,-11,40,22);
  ctx.restore();
}
function drawRace(){
  ctx.fillStyle="#000";ctx.fillRect(0,0,600,448);
  const im=trackImages[track];if(im.complete&&im.naturalWidth)ctx.drawImage(im,0,88,600,360);
  const hud=hudImages[track];if(hud.complete&&hud.naturalWidth)ctx.drawImage(hud,0,0,600,88);
  for(let life=Math.max(0,racerStats[0].lives);life<3;life++){
    ctx.fillStyle="#000";ctx.fillRect(35+life*56,10,25,14);
  }
  trucks.forEach((t,i)=>{
    const x=264+i*39;
    ctx.fillStyle=["#f76fcc","#bebd00","#c47afa","#b9b9b9"][i];
    ctx.fillRect(x,40,34,17);ctx.fillRect(x,59,34,13);
    text(String(Math.min(4,t.lap)),x+17,54,16,"#140412","center");
    text(String(racerStats[i].nitro).padStart(2,"0"),x+17,70,13,"#140412","center");
  });
  ctx.fillStyle="#050000";ctx.fillRect(447,35,104,35);
  const clock=`${String(Math.floor(elapsed)%100).padStart(2,"0")}:${String(Math.floor(elapsed*100)%100).padStart(2,"0")}`;
  ctx.font="bold 29px monospace";ctx.textAlign="center";ctx.lineWidth=2;ctx.strokeStyle="#ae5d16";
  ctx.strokeText(clock,499,63);ctx.fillStyle="#fff6ed";ctx.fillText(clock,499,63);
  for(const pickup of pickups){
    ctx.fillStyle="#dc77e2";ctx.fillRect(pickup.x-8,pickup.y+80,16,16);
    ctx.strokeStyle="#51225b";ctx.lineWidth=2;ctx.strokeRect(pickup.x-7,pickup.y+81,14,14);
    text(String(pickup.value),pickup.x,pickup.y+93,12,"#42113f","center");
  }
  trucks.forEach(drawTruck);
  if(paused){box(170,177,260,70);text("PAUSED",300,222,32,"#f4ea73","center");}
}
function drawTitle(){
  ctx.fillStyle="#050000";ctx.fillRect(0,0,600,448);
  if(titleImage.complete&&titleImage.naturalWidth)ctx.drawImage(titleImage,0,0,600,448);
}
function menuImage(name){
  const image=menuImages[name];
  if(image.complete&&image.naturalWidth)ctx.drawImage(image,0,0,600,448);
}
function drawMenu(){
  ctx.fillStyle="#000";ctx.fillRect(0,0,600,448);
  if(state==="title")return drawTitle();
  if(state==="intro"){
    if(introImage.complete&&introImage.naturalWidth)ctx.drawImage(introImage,0,0,600,448);
    if(race>=15){
      ctx.fillStyle="#000";ctx.fillRect(90,239,435,110);
      text("TOURNAMENT RACES",300,271,22,"#fa8b7a","center");
      text("-- NO CONTINUES ALLOWED --",300,336,19,"#f1e9e5","center");
    }
  } else if(state==="players"){
    menuImage("player-count");
    text(">",49,74+players*75,32,"#f1ae34","center");
  } else if(state==="name"){
    menuImage("name-entry");
    ctx.fillStyle="#000";ctx.fillRect(43,419,154,29);
    text(nameBuffer.toUpperCase()+"_",115,440,20,"#f18a77","center");
    text(`P${namePlayer+1}  ${nameLetter===26?"DELETE":nameLetter===27?"FINISH":nameLetters[nameLetter]}`,293,440,14,"#f18a77","center");
    if(nameLetter<26){
      ctx.strokeStyle="#f4e833";ctx.lineWidth=2;
      ctx.strokeRect(74+(nameLetter%4)*19,207+Math.floor(nameLetter/4)*19,18,18);
    }else{
      ctx.strokeStyle="#f4e833";ctx.lineWidth=2;
      if(nameLetter===26)ctx.strokeRect(111,337,25,21);
      else ctx.strokeRect(53,373,115,23);
    }
  } else if(state==="country"){
    menuImage("country-select");
    ctx.strokeStyle="#f4e833";ctx.lineWidth=4;
    ctx.strokeRect(260,menuIndex*56+1,79,54);
    text(`P${namePlayer+1}`,32,435,15,"#f4e833");
  } else if(state==="results"){
    menuImage("results-podium");
    placement.forEach((id,i)=>{
      const x=8+i*151;
      ctx.fillStyle=["#c6c6c6","#0060f0","#b5a700","#ad3a00"][i];
      ctx.fillRect(x,0,133,86);
      text(`${i+1}${["ST","ND","RD","TH"][i]} ${id<players?racerNames[id]:"IVAN"}`,x+5,27,13,"#fff2ce");
      const beatenByCpu=placement.slice(0,i).some(other=>other>=players||!racerStats[other].active);
      const winnings=id<players&&racerStats[id].active?awards[i]-(beatenByCpu?30000:0):0;
      text(`$ ${String(winnings).padStart(6,"0")}`,x+5,53,14,"#fff2ce");
      text(`NITRO ${racerStats[id].nitro}`,x+5,76,12,"#fff2ce");
    });
  } else if(state==="continue"){
    text("CONTINUE RACING?",300,130,30,"#f5dd71","center");
    text(race<15?"UPGRADES STAY · CASH AND POINTS RESET":"TOURNAMENT: NO CONTINUES",300,207,17,"#e9a687","center");
    if(race<15)text(menuIndex===0?"> YES     NO":"  YES   > NO",300,300,23,"#f4d36e","center");
    else text("PRESS ENTER",300,300,23,"#f4d36e","center");
  } else if(state==="shop"){
    if(shopBase.complete&&shopBase.naturalWidth)ctx.drawImage(shopBase,0,0,600,448);
    for(let p=0;p<4;p++){
      const x=50+p*130,st=racerStats[p];
      if(p<players&&shopMenu.complete&&shopMenu.naturalWidth){
        ctx.save();
        ctx.filter=["none","hue-rotate(65deg)","hue-rotate(215deg)","hue-rotate(115deg)"][p];
        ctx.drawImage(shopMenu,x,146,124,290);
        ctx.restore();
      }
      ctx.fillStyle="#160000";ctx.fillRect(x+42,162,77,15);
      text(String(st.cash),x+119,174,14,"#f8f5e3","right");
      if(p===shopPlayer){
        const row=Math.floor(shopIndex/2),col=shopIndex%2;
        ctx.strokeStyle="#fff36b";ctx.lineWidth=3;
        ctx.strokeRect(x+col*58+5,194+row*80,54,77);
      }
    }
    text(`${racerNames[shopPlayer]}  LIVES ${racerStats[shopPlayer].lives}  RACE ${race+1}: ${names[trackForRace(race+1).track]}`,300,442,13,"#fff4a8","center");
  } else if(state==="totals"){
    if(totalsImage.complete&&totalsImage.naturalWidth)ctx.drawImage(totalsImage,0,0,600,448);
    ctx.fillStyle="#000";ctx.fillRect(235,35,340,345);
    for(let p=0;p<4;p++)text(`TOTAL ${String(p<players?racerStats[p].points:0).padStart(6,"0")}`,260,80+p*96,21,["#f4b5ab","#eff3a0","#c3c8ff","#acf5aa"][p]);
  } else if(state==="highscores"){
    if(trophyImage.complete&&trophyImage.naturalWidth)ctx.drawImage(trophyImage,0,0,600,160);
    const defaults=[["PAUL",15000],["TREV",12500],["CTJS",10000],["TIM",7500],["MARK",5000],["KEV",2500],["LOU",1000],["ANIE",500],["SIM",250]];
    const leaders=defaults.concat(Array.from({length:players},(_,i)=>[racerNames[i],racerStats[i].points])).sort((a,b)=>b[1]-a[1]).slice(0,10);
    leaders.forEach(([name,score],i)=>{
      const suffix=["st","nd","rd"][i]||"th",color=["#fff","#e7d775","#d5cf6e","#eeb2ad","#f0979c","#ef8eaf","#ed8ae5","#c488ed","#9ba4f3","#76c9ef"][i];
      text(`${i+1}${suffix}`,90,191+i*17,17,color);
      text(String(name).slice(0,10),175,191+i*17,17,color);
      text(String(score).padStart(6,"0"),425,191+i*17,17,color,"right");
    });
  }
}
let last=performance.now(),accumulator=0;
function frame(now){
  pollGamepads();
  const dt=Math.min(.05,(now-last)/1000);last=now;accumulator+=dt;
  while(accumulator>=1/60){update(1/60);accumulator-=1/60;}
  if(state==="race")drawRace();else drawMenu();
  just.clear();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__superOffRoad = {
  get state(){return state},
  get players(){return players},
  get nameLetter(){return nameLetter},
  get paused(){return paused},
  get trucks(){return trucks.map(t=>({x:t.x,y:t.y,angle:t.angle,lap:t.lap,waypoint:t.waypoint}))},
  get pickups(){return pickups.map(p=>({...p}))},
  road,
  get route(){return routes[track].map((_,i)=>point(i))},
  get track(){return track},
  get reverse(){return reverse},
  get race(){return race},
  get placement(){return placement.slice()},
  get stats(){return racerStats.map(s=>({...s}))},
  pollGamepads,
  advance(seconds){for(let i=0;i<seconds*60;i++)update(1/60)}
};
