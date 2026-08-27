/* Lucky Bastard v6.0 — genuine 2,400px ultra-wide illustrated worlds */
(()=>{
  'use strict';
  const LB=window.LB3;if(!LB)return;
  const {Game,SCENES,prepareCanvas,ctxRoundRect,circle,poly,clamp}=LB;
  const VIEW_W=1280,VIEW_H=720,WORLD_W=2400,ORIGIN=560,TAU=Math.PI*2;

  const NEW_SCENES=[
    {id:'hoa',icon:'🚧',name:'HOA APOCALYPSE BLOCK PARTY',subtitle:'COMPLIANCE IS NO LONGER AVAILABLE',objects:['plasticChair','bbq','gnome','kiddiePool','clothesline']},
    {id:'mall',icon:'🛍️',name:'DEAD MALL FOOD COURT',subtitle:'EVERYTHING MUST GO, INCLUDING YOU',objects:['rollingChair','waterCooler','foodTray','highChair','poster']},
    {id:'space',icon:'🛸',name:'DISCOUNT SPACE MUSEUM',subtitle:'THE MOON ROCK IS PAINTED CONCRETE',objects:['photocopier','sneezeGuard','trampoline','clownBox','poster']},
    {id:'cruise',icon:'🚢',name:'CRUISE SHIP DIVORCE DECK',subtitle:'ALL-INCLUSIVE EXCEPT EMOTIONAL CLOSURE',objects:['buffetTable','champagne','weddingChair','foodTray','djBooth']},
    {id:'retreat',icon:'🌋',name:'DOOMSDAY CORPORATE RETREAT',subtitle:'TEAM BUILDING UNTIL CIVILIZATION ENDS',objects:['cubicle','giftTable','cake','partyTable','balloons']}
  ];
  SCENES.splice(0,SCENES.length,...NEW_SCENES);

  const palette={
    hoa:{sky:['#71c7da','#d7ecc8'],wall:'#9bc56d',floor:'#b97d5d',dark:'#493847',accent:'#f0cf4a'},
    mall:{sky:['#303a57','#79739a'],wall:'#7f8793',floor:'#77747c',dark:'#2b2737',accent:'#f05d8b'},
    space:{sky:['#10162f','#42346d'],wall:'#677a96',floor:'#676d78',dark:'#151527',accent:'#5cd6d0'},
    cruise:{sky:['#55b9df','#d9f0dc'],wall:'#e9e0c6',floor:'#a26e55',dark:'#254757',accent:'#f3d13b'},
    retreat:{sky:['#6e3d55','#e27a55'],wall:'#5f685e',floor:'#69544a',dark:'#2c242a',accent:'#ffbd45'}
  };

  function sign(c,x,y,w,h,title,sub,fill='#f5eedc'){
    ctxRoundRect(c,x,y,w,h,5,fill);c.strokeStyle='#17131f';c.lineWidth=5;c.strokeRect(x+2,y+2,w-4,h-4);c.fillStyle='#17131f';c.textAlign='center';c.font='900 27px Impact, sans-serif';c.fillText(title,x+w/2,y+35);c.font='900 10px Space Mono, monospace';c.fillText(sub,x+w/2,y+57)
  }
  function grime(c,seed,floor){
    c.fillStyle='rgba(42,27,35,.18)';for(let i=0;i<70;i++){const x=(i*193+seed*71)%WORLD_W,y=floor+28+(i*83+seed*19)%(VIEW_H-floor-45);c.beginPath();c.ellipse(x,y,9+i%5*6,3+i%3,(i%7)*.08,0,TAU);c.fill()}
    c.strokeStyle='rgba(31,24,32,.25)';c.lineWidth=3;for(let x=-50;x<WORLD_W;x+=145){c.beginPath();c.moveTo(x,floor);c.lineTo(x-90,VIEW_H);c.stroke()}for(let y=floor+36;y<VIEW_H;y+=52){c.beginPath();c.moveTo(0,y);c.lineTo(WORLD_W,y+4);c.stroke()}
  }
  function crowdSilhouettes(c,col){
    c.fillStyle=col;for(let x=20;x<WORLD_W;x+=78){const y=278+(x%5)*3,r=15+(x%4);c.beginPath();c.arc(x,y-42,r,0,TAU);c.fill();c.fillRect(x-r+2,y-27,r*2-4,43)}
  }
  function rails(c,y){
    c.fillStyle='#312638';c.fillRect(0,y,WORLD_W,19);c.strokeStyle='#17131f';c.lineWidth=6;c.beginPath();c.moveTo(0,y);c.lineTo(WORLD_W,y);c.moveTo(0,y+19);c.lineTo(WORLD_W,y+19);for(let x=26;x<WORLD_W;x+=112){c.moveTo(x,y-5);c.lineTo(x,y+55)}c.stroke();c.fillStyle='#f3d13b';for(let x=0;x<WORLD_W;x+=150)c.fillRect(x,y+6,74,7)
  }
  function worldTitle(c,scene){sign(c,WORLD_W/2-310,24,620,78,`${scene.icon} ${scene.name}`,`LEVELS ${SCENES.indexOf(scene)*5+1}–${SCENES.indexOf(scene)*5+5} • ${scene.subtitle}`)}

  function drawHOA(c){
    for(let x=-80;x<WORLD_W;x+=350){c.fillStyle=x%700?'#d58a6f':'#c77675';c.fillRect(x+25,115,285,173);poly(c,[[x,122],[x+170,28],[x+340,122]],x%700?'#655064':'#4d5666','#17131f',4);c.fillStyle='#83a7bb';for(let i=0;i<3;i++)ctxRoundRect(c,x+58+i*76,163,48,55,3,'#a8d4dc')}
    c.strokeStyle='#39303d';c.lineWidth=4;c.beginPath();c.moveTo(0,185);c.quadraticCurveTo(1200,92,2400,176);c.stroke();for(let x=55;x<WORLD_W;x+=150){poly(c,[[x,160],[x+53,155],[x+47,204],[x+7,207]],['#e95b78','#e6c229','#4ec9b0'][Math.floor(x/150)%3])}
    for(let x=0;x<WORLD_W;x+=92){c.fillStyle='#ead8ad';c.fillRect(x,232,82,58);c.strokeStyle='#806f50';c.strokeRect(x,232,82,58)}
    sign(c,92,67,250,70,'HOA VIOLATION #9001','FUN DETECTED ON PREMISES','#f3d13b');sign(c,2030,88,260,70,'CUL-DE-SAC COURT','JUDGE: SOME GUY NAMED TODD')
  }
  function drawMall(c){
    c.fillStyle='#3a364b';c.fillRect(0,55,WORLD_W,236);for(let x=25;x<WORLD_W;x+=330){ctxRoundRect(c,x,86,280,178,5,x%660?'#606b78':'#586376');ctxRoundRect(c,x+18,126,244,104,2,'#171923');c.fillStyle=['#f05d8b','#5cd6b3','#f3d13b'][Math.floor(x/330)%3];c.font='900 20px Impact';c.textAlign='center';c.fillText(['SAD PRETZEL','PHONE CASE KING','FINAL SALE FOREVER'][Math.floor(x/330)%3],x+140,116)}
    c.strokeStyle='#d1c1e8';c.lineWidth=8;for(let x=170;x<WORLD_W;x+=520){c.beginPath();c.moveTo(x,274);c.lineTo(x+230,94);c.lineTo(x+340,94);c.stroke();for(let i=0;i<8;i++){c.beginPath();c.moveTo(x+i*30,274-i*22);c.lineTo(x+100+i*30,274-i*22);c.stroke()}}
    sign(c,76,42,255,67,'FOUNTAIN: DRY','WISHES HAVE BEEN LIQUIDATED');sign(c,2070,44,250,67,'PARKING: INFINITE','YOUR CAR IS NOW FOLKLORE')
  }
  function drawSpace(c){
    c.fillStyle='#0d1228';c.fillRect(0,0,WORLD_W,305);for(let i=0;i<90;i++){const x=(i*181)%WORLD_W,y=(i*67)%245;c.fillStyle=i%7?'#f5eedc':'#78dddc';circle(c,x,y,1+i%3,c.fillStyle)}
    circle(c,220,92,72,'#c7648c','#17131f',5);circle(c,2140,82,55,'#70cbd6','#17131f',5);c.strokeStyle='#e7c66a';c.lineWidth=8;c.beginPath();c.ellipse(2140,82,94,23,-.2,0,TAU);c.stroke();
    for(let x=70;x<WORLD_W;x+=420){ctxRoundRect(c,x,135,330,150,18,'#76849a');ctxRoundRect(c,x+24,158,282,94,12,'#243151');c.fillStyle='#78dddc';for(let i=0;i<5;i++)circle(c,x+58+i*52,207,9,i%2?'#f05d8b':'#78dddc')}
    c.save();c.translate(1200,286);poly(c,[[-58,0],[-34,-145],[0,-225],[34,-145],[58,0]],'#efeee2','#17131f',6);poly(c,[[-34,-145],[0,-225],[34,-145]],'#f05d8b');c.restore();sign(c,72,44,265,68,'TOUCH THE METEOR','IT IS DEFINITELY FOAM');sign(c,2058,45,265,68,'ZERO-GIFT SHOP','GRAVITY PRICED SEPARATELY')
  }
  function drawCruise(c){
    c.fillStyle='#70c5e3';c.fillRect(0,0,WORLD_W,206);c.fillStyle='#b9e4df';for(let x=-80;x<WORLD_W;x+=180){c.beginPath();c.arc(x,215,120,Math.PI,TAU);c.fill()}c.fillStyle='#267b9a';c.fillRect(0,207,WORLD_W,100);for(let x=0;x<WORLD_W;x+=95){c.strokeStyle='#79cfe1';c.lineWidth=6;c.beginPath();c.arc(x,260,58,Math.PI,TAU);c.stroke()}
    c.fillStyle='#f2ead2';c.fillRect(0,278,WORLD_W,36);c.strokeStyle='#244553';c.lineWidth=7;c.beginPath();c.moveTo(0,278);c.lineTo(WORLD_W,278);for(let x=20;x<WORLD_W;x+=90){c.moveTo(x,216);c.lineTo(x,308)}c.stroke();
    for(let x=120;x<WORLD_W;x+=480){c.fillStyle='#ef8f55';c.beginPath();c.ellipse(x,165,104,36,0,0,TAU);c.fill();c.strokeStyle='#17131f';c.stroke();c.fillStyle='#f5eedc';c.fillRect(x-76,155,152,20)}
    sign(c,73,43,280,70,'MUSTER STATION B','PANIC IN AN ORDERLY FASHION');sign(c,2040,43,280,70,'CAPTAIN: UNAVAILABLE','CURRENTLY HIDING IN GIFT SHOP')
  }
  function drawRetreat(c){
    c.fillStyle='#713f54';c.fillRect(0,0,WORLD_W,305);for(let x=-120;x<WORLD_W;x+=480){poly(c,[[x,285],[x+210,68],[x+430,285]],x%960?'#4a3a46':'#5a3d49');poly(c,[[x+150,130],[x+210,68],[x+274,137]],'#f29a66')}
    c.fillStyle='#e86444';c.beginPath();c.moveTo(1170,90);c.quadraticCurveTo(1200,12,1235,95);c.lineTo(1270,260);c.lineTo(1120,260);c.closePath();c.fill();
    for(let x=45;x<WORLD_W;x+=360){ctxRoundRect(c,x,135,300,153,8,'#687169');ctxRoundRect(c,x+24,158,252,91,5,'#d9d2b4');c.fillStyle='#17131f';c.font='900 18px Impact';c.textAlign='center';c.fillText(['SYNERGY BUNKER','PANIC KPI','Q4: SURVIVE'][Math.floor(x/360)%3],x+150,191);c.fillStyle='#dc4054';c.fillRect(x+52,210,196,17)}
    sign(c,70,40,280,70,'MANDATORY RETREAT','ATTENDANCE SURVIVAL OPTIONAL','#f3d13b');sign(c,2045,40,280,70,'EMERGENCY OKR','1. OUTRUN THE LAVA')
  }

  Game.prototype.drawUltraBackground=function(c){
    const scene=this.scene||SCENES[0],p=palette[scene.id]||palette.hoa,g=c.createLinearGradient(0,0,0,330);g.addColorStop(0,p.sky[0]);g.addColorStop(1,p.sky[1]);c.fillStyle=g;c.fillRect(0,0,WORLD_W,330);c.fillStyle=p.wall;c.fillRect(0,250,WORLD_W,80);
    ({hoa:drawHOA,mall:drawMall,space:drawSpace,cruise:drawCruise,retreat:drawRetreat}[scene.id]||drawHOA)(c);c.fillStyle=p.floor;c.fillRect(0,308,WORLD_W,VIEW_H-308);grime(c,SCENES.indexOf(scene)+1,308);crowdSilhouettes(c,p.dark);rails(c,this.floor-112);worldTitle(c,scene)
  };
  Game.prototype.drawUltraForeground=function(c){
    const lip=this.floor+58;c.fillStyle='#211724';c.fillRect(0,lip,WORLD_W,VIEW_H-lip);c.fillStyle='#f3d13b';for(let x=-20;x<WORLD_W;x+=132){c.save();c.translate(x,lip+16);c.rotate(-.17);c.fillRect(0,0,74,12);c.restore()}c.fillStyle='rgba(0,0,0,.18)';for(let x=50;x<WORLD_W;x+=310)ctxRoundRect(c,x,lip+52,125,24,7,'rgba(0,0,0,.18)')
  };
  Game.prototype.drawUltraBackgroundCached=function(c){
    const scene=this.scene?.id||'hoa',scale=this.qualityMode==='PERFORMANCE'?1:2,key=`${scene}:${scale}`;if(this.ultraMapKey!==key){this.ultraMapCache=this.ultraMapCache||document.createElement('canvas');this.ultraMapCache.width=WORLD_W*scale;this.ultraMapCache.height=VIEW_H*scale;const q=this.ultraMapCache.getContext('2d',{alpha:false,desynchronized:true});q.setTransform(scale,0,0,scale,0,0);this.drawUltraBackground(q);this.ultraMapKey=key}c.drawImage(this.ultraMapCache,0,0,WORLD_W,VIEW_H)
  };

  Game.prototype.updateDirector=function(){
    const portrait=matchMedia('(max-width: 600px) and (orientation: portrait)').matches,gap=Math.abs(this.player.rig.x-this.enemy.rig.x),enabled=!!this.access.director;let mode='WIDE',scale=1;
    if(enabled){if(this.player.dead||this.enemy.dead){mode='FINAL BLOW';scale=1.2}else if(this.player.grappled||this.enemy.grappled){mode='WRESTLING CAM';scale=1.16}else if(gap<190){mode='CLOSE CHAOS';scale=1.12}else if(this.player.flight||this.enemy.flight){mode='AIRBORNE LIABILITY';scale=1.1}}
    this.cameraScale=(this.cameraScale||1)+(scale-(this.cameraScale||1))*.1;const mid=(this.player.rig.x+this.enemy.rig.x)/2,target=portrait||!enabled?ORIGIN:clamp(ORIGIN+mid-VIEW_W/2,0,WORLD_W-VIEW_W);this.worldCameraX=(this.worldCameraX??ORIGIN)+(target-(this.worldCameraX??ORIGIN))*.085;
    if(portrait){const px=(innerHeight||720)/720,shift=clamp((640-mid)*px,-innerWidth*1.25,innerWidth*1.25);this.c.style.transform=`translateX(calc(-50% + ${shift}px)) scale(${this.cameraScale})`}else this.c.style.transform=enabled?`scale(${this.cameraScale})`:'none';
    if(mode!==this.cameraMode){this.cameraMode=mode;const badge=document.querySelector('#directorBadge');if(badge)badge.textContent='🎬 DIRECTOR: '+mode}
  };

  Game.prototype.draw=function(){
    const c=this.ctx;prepareCanvas(this.c,c,VIEW_W,VIEW_H,this.canvasScale());c.save();if(this.shake){const s=this.shake;c.translate(LB.rnd(-s,s),LB.rnd(-s*.55,s*.55))}c.translate(-(this.worldCameraX??ORIGIN),0);this.drawUltraBackgroundCached(c);c.save();c.translate(ORIGIN,0);this.drawCrowdLayer(c,VIEW_W,VIEW_H);this.objects.forEach(o=>o.draw(c,this.floor));this.player.rig.draw(c);this.enemy.rig.draw(c);this.particles.forEach(p=>p.draw(c));this.projectiles.forEach(p=>p.draw(c));this.confetti.forEach(p=>p.draw(c));this.fxText.forEach(p=>p.draw(c));(this.tagActors||[]).forEach(a=>a.rig.draw(c));if(this.drawDebris)this.drawDebris(c);(this.visualFx||[]).forEach(x=>x.draw(c));c.restore();this.drawUltraForeground(c);c.restore()
  };
})();
