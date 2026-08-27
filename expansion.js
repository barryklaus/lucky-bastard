(() => {
  'use strict';
  const LB=window.LB3;if(!LB)return;
  const {Game,Rig,WEAPONS,show,pick,rnd,chance,clamp,circle,poly}=LB;
  const $=s=>document.querySelector(s);
  const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const RELATIONSHIPS=['former cubicle neighbor','estranged bowling teammate','parking-space nemesis','second cousin by paperwork','ex-roommate with receipts','wedding plus-one gone rogue','former group-chat administrator','person who stole the good chair','childhood rival, allegedly','delivery driver from the wrong address'];
  const CROWD_ROLES=[['HECKLER','📢'],['SUPERFAN','⭐'],['GAMBLER','🎲'],['MEDIC','🩹'],['SECURITY','🛡️'],['INFLUENCER','📱'],['RELATIVE','👵']];
  const MUTATIONS=['AUDIT DEMON','GIANT ARM ENERGY','PERFECTLY LEGAL RAGE','TOO ANGRY TO EXPIRE','CARTOON PHYSICS LICENSE'];
  const STYLE_TEXT={brawler:'STREET BRAWLER',wrestler:'WRESTLER',martial:'MARTIAL ARTIST',gymnast:'GYMNAST',drunken:'DRUNKEN DISASTER',coward:'STRATEGIC COWARD',berserker:'BERSERKER',trickster:'TRICKSTER'};

  // Daily challenge: deterministic locally, so the same date produces the same run on GitHub Pages.
  const params=new URLSearchParams(location.search),daily=params.get('daily');
  if(daily){let seed=2166136261;for(const ch of daily){seed^=ch.charCodeAt(0);seed=Math.imul(seed,16777619)}Math.random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};document.body.classList.add('daily-run')}

  function configFromForm(){
    const value=id=>$('#'+id)?.value,checked=id=>!!$('#'+id)?.checked;
    return{name:value('nameInput')||'Unnamed Liability',build:+value('build'),head:value('head'),hair:value('hair'),face:value('face'),accessory:value('accessory'),presentation:value('presentation'),top:value('top'),bottom:value('bottom'),skin:value('skin'),outfit:value('outfit'),hairColor:value('hairColor'),eyeColor:value('eyeColor'),height:+value('height'),style:value('style'),signature:value('signature')||'The Liability Special',gameSpeed:+value('gameSpeed'),reducedGore:checked('reducedGore'),reducedShake:checked('reducedShake'),largeText:checked('largeText'),manual:checked('manual'),director:checked('director'),voice:checked('voice')}
  }
  function addEvent(g,text){g.fightEvents.push(text);if(g.fightEvents.length>8)g.fightEvents.shift()}

  Game.prototype.initDirectorCut=function(){
    if(this.directorCut)return;this.directorCut=true;const r=this.player.rig;this.style=r.style||'brawler';this.signature=r.signature||'The Liability Special';this.gameSpeed=Number(r.gameSpeed)||1;this.access={reducedGore:!!r.reducedGore,reducedShake:!!r.reducedShake,largeText:!!r.largeText,manual:!!r.manual,director:r.director!==false,voice:!!r.voice};this.fightEvents=[];this.defeatedProfiles=[];this.nemesis=null;this.debris=[];this.crowdRoleClock=4;this.cameraMode='WIDE';this.cameraScale=1;this.training=false;this.mutated=false;this.crafted=0;this.applyStyle();document.body.classList.toggle('large-text',this.access.largeText);$('#actionBtn').classList.toggle('hidden',!this.access.manual);$('#directorBadge').classList.toggle('hidden',!this.access.director);if(daily)this.say(`DAILY CHALLENGE ${daily} • Every bad decision is reproducible.`)
  };
  Game.prototype.applyStyle=function(){
    const p=this.player;if(p.styleApplied)return;p.styleApplied=true;p.style=this.style;
    if(this.style==='wrestler'){p.armor+=.06;p.power*=1.08}
    else if(this.style==='martial'){p.speed*=1.12;p.dodge+=.035}
    else if(this.style==='gymnast'){p.speed*=1.08;p.dodge+=.05;p.openingAcrobat=true}
    else if(this.style==='drunken'){p.dodge+=.09;p.luck+=8;p.power*=.96}
    else if(this.style==='coward'){p.dodge+=.13;p.speed*=1.08}
    else if(this.style==='berserker'){p.power*=1.18;p.armor-=.035}
    else if(this.style==='trickster'){p.luck+=18;p.speed*=1.05}
  };

  const oldFighter=Game.prototype.fighter;
  Game.prototype.fighter=function(rig,player=false){const f=oldFighter.call(this,rig,player);f.style=rig.style||'brawler';return f};

  const oldSpawn=Game.prototype.spawnRound;
  Game.prototype.spawnRound=function(){
    this.initDirectorCut();this.fightEvents=[];this.debris=[];oldSpawn.call(this);this.player.openingAcrobat=this.player.openingAcrobat||this.style==='gymnast';this.enemy.relationship=pick(RELATIONSHIPS);this.spectators.forEach(s=>{const role=pick(CROWD_ROLES);s.role=role[0];s.roleIcon=role[1]});this.setupTagTeam();this.updateHud();addEvent(this,`LEVEL ${this.round}: ${this.player.name} met ${this.enemy.name}, their ${this.enemy.relationship}.`);setTimeout(()=>{if(this.running&&!this.pendingFinish&&!this.training)this.announce(`STYLE: ${STYLE_TEXT[this.style]||'BRAWLER'}<br>SIGNATURE: ${esc(this.signature)}`,950)},2500);if(this.sound)this.sfx(95+this.scene.id.length*13,.12)
  };

  const oldRoll=Game.prototype.rollOpponent;
  Game.prototype.rollOpponent=function(){
    if(this.nemesis&&!this.nemesis.used&&this.round>=this.nemesis.returnAt){this.nemesis.used=true;const n=this.nemesis.profile;n.name=`${n.name} — BACK AGAIN`;n.looks.face='scar';n.featured=true;n.stats.maxHp=Math.round(n.stats.maxHp*1.16);n.stats.power*=1.1;return n}
    return oldRoll.call(this)
  };

  const oldUpdate=Game.prototype.update;
  Game.prototype.update=function(dt){oldUpdate.call(this,dt*this.gameSpeed);if(this.access.reducedShake)this.shake=Math.min(this.shake,2);this.updateDirector(dt);this.updateTagTeam(dt);this.updateCrowdRoles(dt)};
  Game.prototype.updateDirector=function(){
    const portrait=matchMedia('(max-width: 600px) and (orientation: portrait)').matches;if(!this.access.director){this.worldPan=(this.worldPan||0)*.86;this.c.style.transform='none';return}const gap=Math.abs(this.player.rig.x-this.enemy.rig.x);let mode='WIDE',scale=1;if(this.player.dead||this.enemy.dead){mode='FINAL BLOW';scale=1.2}else if(this.player.grappled||this.enemy.grappled){mode='WRESTLING CAM';scale=1.16}else if(gap<190){mode='CLOSE CHAOS';scale=1.12}else if(this.player.flight||this.enemy.flight){mode='AIRBORNE LIABILITY';scale=1.1}this.cameraScale+=(scale-this.cameraScale)*.1;const mid=(this.player.rig.x+this.enemy.rig.x)/2,target=portrait?0:clamp(mid-640,-260,260);this.worldPan=(this.worldPan||0)+(target-(this.worldPan||0))*.085;this.c.style.transform=`scale(${this.cameraScale})`;if(mode!==this.cameraMode){this.cameraMode=mode;$('#directorBadge').textContent='🎬 DIRECTOR: '+mode}
  };

  Game.prototype.setupTagTeam=function(){
    this.tagActors=[];if(this.training||this.round<3||!chance(.15))return;const both=chance(.42),make=(side,enemy)=>{const color=enemy?'#dc4054':'#5cd6b3',rig=new Rig({x:side<0?85:1195,y:this.floor,dir:side<0?1:-1,scale:.82,build:rnd(.8,1.2),skin:pick(LB.SKINS),outfit:color,hair:pick(['messy','mohawk','curly','bald']),hairColor:pick(['#241b1c','#d7b65a','#6b3c26']),weapon:WEAPONS[0]});return{rig,enemy,t:0,hit:false,leaving:false}};this.tagActors.push(make(-1,false));if(both)this.tagActors.push(make(1,true));this.announce(both?'SURPRISE TAG TEAM!':'UNLICENSED ASSIST!',1000)
  };
  Game.prototype.updateTagTeam=function(dt){
    (this.tagActors||[]).forEach(a=>{
      a.t+=dt;const target=a.enemy?this.player:this.enemy;
      if(!a.hit){
        a.rig.x+=(a.enemy?-1:1)*190*dt;a.rig.setState('idle',.15);a.rig.update(dt,1);
        if((!a.enemy&&a.rig.x>425)||(a.enemy&&a.rig.x<855)){
          a.hit=true;a.rig.setState('supermanImpact',.12);
          if(!target.dead){this.hit(target,rnd(6,11),12,a.enemy?this.enemy:this.player,false,false);this.say(`${a.enemy?'Enemy':'Friendly'} tag partner delivers one punch and immediately avoids responsibility.`)}
        }
      }else{a.rig.x+=(a.enemy?1:-1)*240*dt;a.rig.update(dt);a.leaving=true}
    });this.tagActors=(this.tagActors||[]).filter(a=>a.rig.x>-90&&a.rig.x<1370)
  };

  Game.prototype.updateCrowdRoles=function(dt){
    this.crowdRoleClock-=dt;if(this.crowdRoleClock>0||!this.running)return;this.crowdRoleClock=rnd(5,9);const s=pick(this.spectators.filter(x=>!x.down));if(!s)return;if(s.role==='MEDIC'&&this.player.popularity>20){this.player.hp=Math.min(this.player.maxHp,this.player.hp+4);this.fxText.push(new LB.ImpactText(this.player.rig.x,this.floor-210,'+4 MEDIC','#5cd6b3',20));this.updateHud()}else if(s.role==='HECKLER'){const victim=chance(.5)?this.player:this.enemy;victim.popularity=clamp(victim.popularity-8,-100,100);this.updatePopularity(victim);this.spawnCrowdShout(s.x)}else if(s.role==='INFLUENCER'){this.property+=125;this.say('An influencer monetized the injury before consent loaded.')}else if(s.role==='SECURITY'&&chance(.4)){this.crowdBarrage(chance(.5)?this.player:this.enemy,false)}};

  const oldDraw=Game.prototype.draw;
  Game.prototype.draw=function(){oldDraw.call(this);const c=this.ctx;c.save();(this.tagActors||[]).forEach(a=>a.rig.draw(c));this.drawDebris(c);c.restore()};
  Game.prototype.drawDebris=function(c){(this.debris||[]).forEach(d=>{c.save();c.translate(d.x,d.y);c.rotate(d.r);c.globalAlpha=d.a;poly(c,[[-d.s,-d.s/2],[d.s,-d.s/3],[d.s*.7,d.s],[-d.s*.8,d.s*.6]],d.color,'#17131f',3);c.restore()})};

  const oldSpectator=Game.prototype.drawSpectator;
  Game.prototype.drawSpectator=function(c,s){oldSpectator.call(this,c,s)};

  const oldRigDraw=Rig.prototype.draw;
  Rig.prototype.draw=function(c){oldRigDraw.call(this,c);if(!this.injuries&&!this.mutationGlow)return;c.save();c.translate(this.x,this.y);c.scale(this.dir*this.scale,this.scale);if(this.mutationGlow){c.globalAlpha=.35+.15*Math.sin(performance.now()/90);c.strokeStyle='#f3d13b';c.lineWidth=9;c.beginPath();c.ellipse(0,-105,58*this.build,105,0,0,Math.PI*2);c.stroke()}const i=this.injuries||{};if(i.blackEye){circle(c,10,-166,9,'#54314f','#17131f',2)}if(i.bandage){c.fillStyle='#f5eedc';c.strokeStyle='#17131f';c.lineWidth=2;c.fillRect(-27,-109,54,13);c.strokeRect(-27,-109,54,13)}if(i.torn){c.strokeStyle='#17131f';c.lineWidth=3;c.beginPath();c.moveTo(-26,-115);c.lineTo(-8,-99);c.lineTo(4,-116);c.lineTo(22,-98);c.stroke()}if(i.missingTooth){c.fillStyle='#17131f';c.fillRect(-2,-148,7,6)}c.restore()};

  const oldHit=Game.prototype.hit;
  Game.prototype.hit=function(v,dmg,kb,attacker,crit,blocked){
    this.initDirectorCut();let signature=false;if(attacker.player&&!blocked&&chance(.055)){signature=true;dmg*=1.7;kb*=1.35;this.announce(`SIGNATURE MOVE!<br>${esc(this.signature)}`,1100);addEvent(this,`${attacker.name} used ${this.signature}. Legal classification pending.`)}
    oldHit.call(this,v,dmg,kb,attacker,crit,blocked);if(!blocked){v.rig.injuries=v.rig.injuries||{};const zone=attacker.lastTargetZone;if(zone==='head'){v.rig.injuries.blackEye=true;if(chance(.32))v.rig.injuries.missingTooth=true}else if(zone==='limb')v.rig.injuries.bandage=true;else if(chance(.32))v.rig.injuries.torn=true;addEvent(this,`${attacker.name} hit ${v.name}'s ${zone||'body'} for ${Math.round(dmg)}.`);this.tryBreakProp(v,dmg)}
    if(this.player.hp>0&&this.player.hp/this.player.maxHp<.2&&!this.mutated&&chance(.22)){this.mutated=true;this.player.power*=1.23;this.player.speed*=1.12;this.player.rig.mutationGlow=true;const m=pick(MUTATIONS);this.announce(`HIDDEN AWAKENING!<br>${m}`,1300);addEvent(this,`${this.player.name} awakened ${m}.`)}
    if(this.training&&v.hp<=0){v.dead=false;v.hp=v.maxHp;v.rig.detached={};v.rig.setState('getup',.2);this.pendingFinish=false;this.running=true;this.updateHud()}
  };
  Game.prototype.tryBreakProp=function(v,dmg){
    if(dmg<15||!chance(.24))return;const obj=this.objects.filter(o=>o.active&&!o.broken).sort((a,b)=>Math.abs(a.x-v.rig.x)-Math.abs(b.x-v.rig.x))[0];if(!obj||Math.abs(obj.x-v.rig.x)>260)return;obj.broken=true;obj.active=false;this.property+=450;for(let i=0;i<8;i++)this.debris.push({x:obj.x+rnd(-35,35),y:this.floor-rnd(10,70),r:rnd(-2,2),s:rnd(7,17),a:rnd(.7,1),color:pick(['#9b6238','#b8bdc6','#f3d13b','#dc4054'])});this.announce('ENVIRONMENT DESTROYED!',650);addEvent(this,`${obj.names[obj.kind]||'Furniture'} became eight smaller liabilities.`)
  };

  const oldUseEnvironment=Game.prototype.useEnvironment;
  Game.prototype.useEnvironment=function(f,o){const obj=this.objects.filter(x=>x.active&&!x.broken).sort((a,b)=>Math.abs(a.x-f.rig.x)-Math.abs(b.x-f.rig.x))[0];oldUseEnvironment.call(this,f,o);if(obj)addEvent(this,`${f.name} destroyed ${obj.names[obj.kind]||'the furniture'} without damaging a fighter.`)};

  const oldKill=Game.prototype.kill;
  Game.prototype.kill=function(v,killer,dmg,crit){
    if(v===this.enemy&&killer.player&&!this.training&&chance(.3)&&!this.nemesis){const looks={x:1110,y:this.floor,dir:-1,scale:v.rig.scale,build:v.rig.build,skin:v.rig.skin,outfit:v.rig.outfit,hairColor:v.rig.hairColor,eyeColor:v.rig.eyeColor,face:'scar',accessory:v.rig.accessory,hair:v.rig.hair,head:v.rig.head,top:v.rig.top,bottom:v.rig.bottom,weapon:v.weapon};this.nemesis={returnAt:Math.min(25,this.round+rnd(4,8)|0),used:false,profile:{name:v.name.replace(/ — BACK AGAIN/,''),personality:'VENGEFUL',weapon:v.weapon,looks,tier:Math.floor((this.round-1)/5),featured:true,stats:{maxHp:v.maxHp,power:v.power,speed:v.speed,luck:v.luck+5,armor:v.armor+.03,dodge:v.dodge+.02}}}}
    oldKill.call(this,v,killer,dmg,crit)
  };

  const oldDetach=Game.prototype.detach;
  Game.prototype.detach=function(v,name){if(this.access.reducedGore){v.rig.setState('dead',.28);v.rig.expression='dead';this.burst(v.rig.x,v.rig.y-120,'#f3d13b',12);return}oldDetach.call(this,v,name)};

  const oldAnnounce=Game.prototype.announce;
  Game.prototype.announce=function(html,ms){oldAnnounce.call(this,html,ms);if(this.access?.voice&&'speechSynthesis'in window&&/FINISH|LEVEL|WIN|AWAKEN|NEMESIS|TAG TEAM/.test(html)){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(html.replace(/<br>/g,' '));u.rate=.92;u.pitch=.72;u.volume=.45;speechSynthesis.speak(u)}};

  const oldHud=Game.prototype.updateHud;
  Game.prototype.updateHud=function(){oldHud.call(this);if(!this.directorCut)return;$('#playerGear').textContent=`${this.player.weapon.name} • ${STYLE_TEXT[this.style]||'BRAWLER'}${this.player.rig.injuries?.blackEye?' • BLACK EYE':''}${this.mutated?' • AWAKENED':''}`;$('#enemyGear').textContent=`${this.enemy.weapon.name} • ${this.enemy.personality}${this.enemy.relationship?' • '+this.enemy.relationship:''}`};

  const oldLoot=Game.prototype.loot;
  Game.prototype.loot=function(){oldLoot.call(this);const events=this.fightEvents.slice(-3);$('#fightRecap').innerHTML=`<b>FIGHT RECAP</b><div>${events.map((x,i)=>`<article><strong>${i+1}</strong><span>${esc(x)}</span></article>`).join('')}</div>`;const obj=this.objects.find(o=>o.broken||!o.active),material=obj?(obj.names[obj.kind]||'Arena Debris'):'Questionable Scrap';$('#craftBench').innerHTML=`<span>🔧 IMPROVISED CRAFTING: combine <b>${esc(this.player.weapon.name)}</b> with <b>${esc(material)}</b></span><button>CRAFT ONCE</button>`;$('#craftBench button').onclick=()=>{if(this.crafted>=3){this.say('Crafting department has reached its insurance limit.');return}this.crafted++;const w=this.player.weapon;this.player.weapon={...w,name:`${w.name} + ${material}`,damage:Math.round(w.damage*1.12+1),kb:Math.round(w.kb*1.12+1),color:pick(['#f3d13b','#5cd6b3','#f05d8b'])};this.player.rig.weapon=this.player.weapon;$('#craftBench').innerHTML='<b>CRAFTED:</b> '+esc(this.player.weapon.name);this.updateHud()}}
  ;

  const oldEnd=Game.prototype.end;
  Game.prototype.end=function(win){oldEnd.call(this,win);$('#runStats').insertAdjacentHTML('beforeend',`<div>FIGHTING STYLE <b>${STYLE_TEXT[this.style]}</b></div><div>SIGNATURE <b>${esc(this.signature)}</b></div><div>CRAFTS <b>${this.crafted}</b></div><div>DAILY SEED <b>${daily||'OFF'}</b></div>`)};

  Game.prototype.manualAction=function(){if(!this.running||this.player.dead||this.enemy.dead)return;const p=this.player,e=this.enemy;if(Math.abs(e.rig.x-p.rig.x)>this.engageDistance(p)+20)p.rig.x=e.rig.x-p.rig.dir*this.engageDistance(p);p.cool=0;this.attack(p,e,false)};
  Game.prototype.trainingMove=function(move){if(!this.training)return;const p=this.player,e=this.enemy;p.rig.x=e.rig.x-p.rig.dir*145;p.cool=0;p.weapon=WEAPONS[0];p.rig.weapon=p.weapon;if(move==='reset'){p.hp=p.maxHp;e.hp=e.maxHp;p.rig.injuries={};e.rig.injuries={};p.rig.x=350;e.rig.x=930;this.updateHud();return}if(move==='grapple')this.wrestlingAttack(p,e);else if(move==='acrobat')this.acrobaticAttack(p,e,(mult,kb)=>this.hit(e,10*mult,kb,p,false,false));else if(move==='kick'){p.lastTargetZone='head';p.rig.setState('kickLoad',.18);setTimeout(()=>p.rig.setState('kickHead',.12),260);setTimeout(()=>this.hit(e,12,14,p,false,false),340);setTimeout(()=>p.rig.setState('kickRecover',.2),500)}else{p.lastTargetZone='body';p.rig.setState('punchLoad',.15);setTimeout(()=>p.rig.setState('punchBody',.1),190);setTimeout(()=>this.hit(e,8,7,p,false,false),255);setTimeout(()=>p.rig.setState('guard',.2),430)}};

  $('#actionBtn').onclick=()=>window.game?.manualAction();
  $('#dailyChallenge').onclick=()=>{const d=new Date().toISOString().slice(0,10);location.search='daily='+d};
  $('#trainingPanel').onclick=e=>{const b=e.target.closest('button');if(b)window.game?.trainingMove(b.dataset.move)};
  $('#trainingBtn').onclick=()=>{show('game');window.game=new Game(configFromForm());const g=window.game;g.training=true;g.player.maxHp=g.player.hp=999;g.enemy.maxHp=g.enemy.hp=999;g.access.manual=true;$('#actionBtn').classList.remove('hidden');$('#trainingPanel').classList.remove('hidden');g.running=true;g.say('TRAINING LAB: infinite health, selectable moves, zero career consequences.');g.announce('TRAINING LAB<br>HIT EVERYTHING',1300);g.updateHud()};
})();
