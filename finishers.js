(() => {
  'use strict';
  const LB=window.LB3;if(!LB)return;
  const {Game,Rig,Particle,ImpactText,WEAPONS,pick,rnd,chance,clamp}=LB;

  const FINISHERS={
    flyThrough:{name:'EXPRESS CHECKOUT',line:'flies straight through the body',zone:'body'},
    uppercut:{name:'UPPERCUT EVICTION',line:'uppercuts the head into a new postal district',zone:'head'},
    stabBody:{name:'FULL-BODY PAPERWORK',line:'drives the weapon through the body',zone:'body'},
    stabHead:{name:'POINT TAKEN',line:'lands a terminal head strike',zone:'head'},
    decapitate:{name:'HEAD OF DEPARTMENT',line:'removes the head from active duty',zone:'head'},
    bisect:{name:'HALF-DAY APPROVED',line:'slices the body cleanly across the waist',zone:'body'}
  };

  function poolFor(attacker){
    const kind=attacker.weapon?.kind||'fist';
    if(kind==='fist')return['flyThrough','uppercut'];
    if(kind==='blade'||kind==='pole')return['stabBody','stabHead','decapitate','bisect'];
    if(kind==='heavy')return['decapitate','bisect','flyThrough'];
    return['decapitate','stabBody','uppercut']
  }
  function resetWounds(r){r.torsoHole=false;r.splitBody=false;r.impaledZone='';r.fatalGlow=0}

  const oldSpawn=Game.prototype.spawnRound;
  Game.prototype.spawnRound=function(){oldSpawn.call(this);resetWounds(this.player.rig);resetWounds(this.enemy.rig);this.instantFinisher=null};

  Game.prototype.rollInstantKill=function(v,attacker,crit,blocked){
    if(blocked||this.training||this.pendingFinish||v.dead||attacker.dead||v.hp<=1)return null;
    const kind=attacker.weapon?.kind||'fist',base=.006+(crit?.018:0)+(['blade','pole','heavy'].includes(kind)?.004:0)+(attacker.momentum>82?.003:0);
    return chance(base)?pick(poolFor(attacker)):null
  };

  const oldHit=Game.prototype.hit;
  Game.prototype.hit=function(v,dmg,kb,attacker,crit,blocked){
    const type=this.rollInstantKill(v,attacker,crit,blocked);if(!type)return oldHit.call(this,v,dmg,kb,attacker,crit,blocked);
    this.instantFinisher={v,attacker,type};attacker.lastTargetZone=FINISHERS[type].zone;oldHit.call(this,v,v.hp+v.maxHp+999,Math.max(kb,28),attacker,true,false);if(!v.dead)this.instantFinisher=null
  };

  Game.prototype.spawnFatalPart=function(v,type,xOffset=0,yOffset=0){
    const p=new Particle(v.rig.x+xOffset,v.rig.y-150+yOffset,v.rig.skin,type);p.vx+=-v.rig.dir*rnd(type==='head'?250:135,type==='head'?390:270);p.vy-=type==='head'?rnd(190,270):rnd(60,145);p.life=type==='head'?2.7:1.9;this.particles.push(p)
  };

  const oldKill=Game.prototype.kill;
  Game.prototype.kill=function(v,killer,dmg,crit){
    const event=this.instantFinisher;if(!event||event.v!==v)return oldKill.call(this,v,killer,dmg,crit);this.instantFinisher=null;const fin=FINISHERS[event.type],reduced=!!this.access?.reducedGore;
    v.dead=true;v.hp=0;v.rig.rag=1;v.rig.expression='dead';v.rig.fatalGlow=1;v.rig.setState('dead',.22);this.shake=reduced?8:20;this.hitStop=.14;this.fxText.push(new ImpactText(v.rig.x,v.rig.y-220,reduced?'COMIC KO!':'INSTANT!',killer.player?'#f3d13b':'#ff4e77',62));if(killer.player)this.celebrate(killer.rig.x);
    if(reduced){this.announce(`RARE INSTANT FINISH<br>${fin.name}`,3900);this.burst(v.rig.x,v.rig.y-120,'#f3d13b',12);this.say(`${killer.name} lands ${fin.name}. Reduced Gore converts the evidence into tasteful sparkles.`)}
    else{
      if(event.type==='flyThrough'){v.rig.torsoHole=true;killer.rig.setState('supermanImpact',.1);killer.motion={t:0,dur:.38,start:killer.rig.x,end:clamp(v.rig.x+killer.rig.dir*170,120,1160)};this.burst(v.rig.x,v.rig.y-105,'#8d1f34',10)}
      else if(event.type==='uppercut'||event.type==='decapitate'){v.rig.detached.head=true;this.spawnFatalPart(v,'head');killer.rig.setState(event.type==='uppercut'?'uppercut':'weaponHead',.1)}
      else if(event.type==='bisect'){v.rig.splitBody=true;v.rig.detached.legL=true;v.rig.detached.legR=true;this.spawnFatalPart(v,'limb',-18,78);this.spawnFatalPart(v,'limb',18,88);killer.rig.setState('weaponBody',.1)}
      else{v.rig.impaledZone=event.type==='stabHead'?'head':'body';killer.rig.setState(event.type==='stabHead'?'weaponHead':'stab',.1);this.burst(v.rig.x,v.rig.y-(event.type==='stabHead'?175:108),'#8d1f34',8)}
      this.announce(`RARE INSTANT KILL<br>${fin.name}`,3900);this.say(`${killer.name} ${fin.line}. Anatomy submits its resignation.`);this.property+=900
    }
    this.checkCollateral(v,true);this.sfx(48,.32)
  };

  const oldRigDraw=Rig.prototype.draw;
  Rig.prototype.draw=function(c){
    oldRigDraw.call(this,c);if(!this.torsoHole&&!this.splitBody&&!this.impaledZone&&!this.fatalGlow)return;c.save();c.translate(this.x,this.y);c.scale(this.dir*this.scale,this.scale);
    if(this.fatalGlow){c.globalAlpha=.16+Math.sin(performance.now()/65)*.05;c.fillStyle='#fff2a8';c.beginPath();c.ellipse(0,-116,70*this.build,126,0,0,Math.PI*2);c.fill();c.globalAlpha=1}
    if(this.torsoHole){c.fillStyle='#35101d';c.strokeStyle='#17131f';c.lineWidth=8;c.beginPath();c.ellipse(0,-101,25*this.build,32,0,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#a5273e';c.lineWidth=5;c.beginPath();c.ellipse(0,-101,32*this.build,38,.05,0,Math.PI*2);c.stroke();c.fillStyle='#100b12';c.beginPath();c.ellipse(0,-101,17*this.build,24,0,0,Math.PI*2);c.fill()}
    if(this.splitBody){c.strokeStyle='#17131f';c.lineWidth=12;c.beginPath();c.moveTo(-39*this.build,-61);c.lineTo(39*this.build,-58);c.stroke();c.strokeStyle='#a5273e';c.lineWidth=7;c.setLineDash([10,6]);c.beginPath();c.moveTo(-37*this.build,-63);c.lineTo(37*this.build,-60);c.stroke();c.setLineDash([])}
    if(this.impaledZone){const y=this.impaledZone==='head'?-174:-105;c.strokeStyle='#17131f';c.lineWidth=13;c.beginPath();c.moveTo(-58,y+5);c.lineTo(62,y-5);c.stroke();c.strokeStyle='#bcc5cb';c.lineWidth=7;c.stroke();c.fillStyle='#8d1f34';c.beginPath();c.ellipse(0,y,17,11,0,0,Math.PI*2);c.fill();c.strokeStyle='#17131f';c.lineWidth=4;c.stroke()}
    c.restore()
  };

  const oldUpdate=Game.prototype.update;
  Game.prototype.update=function(dt){oldUpdate.call(this,dt);if(this.qualityMode!=='PERFORMANCE')return;if(this.particles.length>60)this.particles.splice(0,this.particles.length-60);if(this.confetti.length>45)this.confetti.splice(0,this.confetti.length-45);if(this.fxText.length>20)this.fxText.splice(0,this.fxText.length-20);if(this.debris?.length>28)this.debris.splice(0,this.debris.length-28);if(this.visualFx?.length>32)this.visualFx.splice(0,this.visualFx.length-32)};

  const oldTraining=Game.prototype.trainingMove;
  Game.prototype.trainingMove=function(move){
    if(move!=='instant')return oldTraining.call(this,move);const p=this.player,e=this.enemy,types=Object.keys(FINISHERS),type=types[(this.trainingFinisherIndex||0)%types.length],fin=FINISHERS[type];this.trainingFinisherIndex=(this.trainingFinisherIndex||0)+1;resetWounds(e.rig);e.rig.detached={};p.rig.x=500;e.rig.x=700;p.rig.dir=1;e.rig.dir=-1;if(!['flyThrough','uppercut'].includes(type)){p.weapon=WEAPONS.find(w=>w.kind==='blade')||p.weapon;p.rig.weapon=p.weapon}else{p.weapon=WEAPONS[0];p.rig.weapon=p.weapon}p.lastTargetZone=fin.zone;p.rig.setState(type==='uppercut'?'uppercut':type==='flyThrough'?'supermanImpact':'weaponBody',.1);e.rig.setState('dead',.2);e.rig.expression='dead';if(type==='flyThrough')e.rig.torsoHole=true;else if(type==='uppercut'||type==='decapitate'){e.rig.detached.head=true;this.spawnFatalPart(e,'head')}else if(type==='bisect'){e.rig.splitBody=true;e.rig.detached.legL=e.rig.detached.legR=true}else e.rig.impaledZone=type==='stabHead'?'head':'body';this.announce(`RARE FINISH PREVIEW<br>${fin.name}`,3900);this.say(`${p.name} previews ${fin.name}. Training insurance refuses to watch.`);setTimeout(()=>{resetWounds(e.rig);e.rig.detached={};e.rig.expression='angry';e.rig.setState('getup',.3)},4000)
  };

  window.LB51={FINISHERS,poolFor};
})();
