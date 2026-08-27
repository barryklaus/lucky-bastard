(() => {
  'use strict';
  const LB=window.LB3;if(!LB)return;
  const {Game,POSES,WEAPONS,pick,rnd,chance,clamp}=LB,$=s=>document.querySelector(s),lerp=(a,b,t)=>a+(b-a)*t;

  Object.assign(POSES,{
    headSway:{...POSES.guard,bob:-3,lean:-.18,head:.62,uaL:-1.18,laL:-.7,uaR:-.7,laR:-.72},
    bodySway:{...POSES.guard,bob:8,lean:.58,head:-.32,thL:.42,shL:.28,thR:-.38,shR:-.25},
    stepJump:{...POSES.backstep,bob:-52,lean:-.42,thL:.92,shL:-.62,thR:-.84,shR:.58},
    feint:{...POSES.punchLoad,bob:2,lean:.04,head:-.12,uaR:-.35,laR:-.55},
    parryHigh:{...POSES.guard,bob:-5,lean:.08,uaL:-1.55,laL:-1.5,uaR:-1.15,laR:-1.35},
    parryBody:{...POSES.guard,bob:5,lean:.2,uaL:-.85,laL:-1.22,uaR:-.55,laR:-1.1},
    parryLow:{...POSES.guard,bob:13,lean:.3,uaL:-.45,laL:-1.15,uaR:-.2,laR:-1.05,thL:.38,thR:-.42},
    headSnap:{...POSES.heavyHit,lean:-.48,head:.88,bob:-8},
    bodyFold:{...POSES.hit,lean:.68,head:-.35,bob:12,uaL:-.2,uaR:.28},
    limbRecoil:{...POSES.hit,lean:-.16,head:.1,uaL:1.25,laL:.9,uaR:-1.1,laR:-.8},
    comboCross:{...POSES.punchBody,lean:.38,uaL:-1.62,laL:-1.55,uaR:-.62,laR:-.45},
    comboHook:{...POSES.punchHead,lean:-.28,uaR:-2.65,laR:-1.1,thL:.25,thR:-.25},
    uppercut:{...POSES.punchHead,bob:8,lean:.28,uaR:-.5,laR:-2.38,thL:.42,thR:-.4},
    vault:{...POSES.cartwheelKick,bob:-72,lean:1.72,uaL:-1.65,uaR:-1.35},
    rearGrab:{...POSES.grapple,lean:-.05,uaL:-1.78,laL:-1.42,uaR:-1.55,laR:-1.58},
    spinCarry:{...POSES.lift,lean:.35,head:-.22,uaL:-2.75,uaR:-2.2},
    groundPounce:{...POSES.groundSlam,bob:-25,lean:.92,thL:1.05,thR:-1.05},
    exhausted:{...POSES.idle,bob:12,lean:.22,head:-.35,uaL:.5,laL:.72,uaR:-.42,laR:-.65}
  });

  const ATTACKS={
    straight:{label:'STRAIGHT • HEAD',zone:'head',family:'straight',cost:12,range:160},
    body:{label:'BODY SHOT',zone:'body',family:'bodyPunch',cost:11,range:150},
    hook:{label:'HOOK • HEAD',zone:'head',family:'hook',cost:15,range:148},
    kickBody:{label:'KICK • BODY',zone:'body',family:'kick',cost:19,range:185},
    kickHead:{label:'HIGH KICK',zone:'head',family:'kick',cost:23,range:180},
    weapon:{label:'WEAPON SWING',zone:'body',family:'weapon',cost:18,range:190},
    heavy:{label:'HEAVY COMMITMENT',zone:'body',family:'heavy',cost:28,range:195},
    grab:{label:'GRAB ATTEMPT',zone:'grab',family:'grab',cost:25,range:132}
  };
  const COMBOS=[
    {name:'ONE-TWO-TAX AUDIT',steps:[['punchBody','body',5,4],['punchHead','head',7,7],['comboHook','head',9,12]]},
    {name:'RIBS, CHIN, REGRET',steps:[['punchBody','body',5,4],['uppercut','head',9,10],['kickBody','body',11,16]]},
    {name:'ANKLE-TO-ATTITUDE',steps:[['kickBody','limb',6,5],['comboCross','body',7,6],['spinKick','head',12,18]]},
    {name:'MEETING CANCELLED',steps:[['comboCross','body',6,4],['comboHook','head',8,8],['dropkickImpact','body',13,20]]}
  ];
  const CRAZY=[
    ['LEAPFROG REVERSAL','cross','body',20,29],['BACKYARD AIRLINES','cross','head',21,34],['HUMAN BOWLING BALL','carry','body',19,39],['REJECTED WEDDING DANCE','grapple','head',17,25],['OFFICE CHAIR EXPRESS','arena','body',22,38],['KNEE APPOINTMENT','grapple','body',20,27],['WALL RECEIPT','cross','head',19,31],['POSSUM TRAP','trap','body',18,28],['HUMAN HELICOPTER','spin','limb',23,40],['WRONG-WAY PILEDRIVER','grapple','body',24,32],['DOUBLE CLOTHESLINE FLIP','rebound','head',20,34],['PIGGYBACK PANIC','carry','body',18,31],['ANKLE DELIVERY','spin','limb',19,36],['CEILING FAN SPECIAL','launch','head',23,38],['TRAMPOLINE BETRAYAL','arena','head',21,33],['BUFFET BURRITO','arena','body',19,35],['CROWD-SURF REJECTION','launch','body',20,42],['FAKE FRIENDSHIP','trap','body',17,26],['EMERGENCY EXIT','carry','body',22,45],['MIDAIR ARGUMENT','cross','head',24,36],['HUMAN CATAPULT','launch','body',20,40],['KANGAROO CRISIS','rebound','head',21,32],['SPIN-CYCLE SUPLEX','spin','body',23,35],['WEAPON BOOMERANG SETUP','trap','head',22,34],['LAST-SECOND SWITCHEROO','cross','body',18,30]
  ].map(([name,type,zone,damage,kb])=>({name,type,zone,damage,kb}));

  function fresh(f){
    if(f.fightIQ)return;f.fightIQ=true;f.stamina=100;f.maxStamina=100;f.momentum=0;f.intent=null;f.intentT=0;f.guardZone='body';f.memory={attacks:{},defenses:{}};f.comboChain=0;f.exhausted=false;f.counterWindow=0;f.preferredRange=f.personality==='COWARDLY'?235:f.personality==='AGGRESSIVE'?142:f.personality==='TACTICAL'?180:165;f.decision=rnd(.15,.4);f.dodgeDemo=0
  }
  function remember(obj,key){obj[key]=(obj[key]||0)+1;return obj[key]}
  function rangeBand(d){return d<132?'CLINCH':d<168?'POCKET':d<218?'KICK RANGE':'LONG RANGE'}
  function intentEl(f,g){return $(f===g.player?'#playerIntent':'#enemyIntent')}
  function setIntent(g,f,text,kind=''){
    const e=intentEl(f,g);if(!e)return;e.textContent=text;e.classList.toggle('intent-feint',kind==='feint');e.classList.toggle('intent-danger',kind==='danger')
  }
  function isBusy(f){return f.dead||f.flight||f.motion||f.grappled||f.down>0||f.stun>0}

  const oldFighter=Game.prototype.fighter;
  Game.prototype.fighter=function(...a){const f=oldFighter.apply(this,a);fresh(f);return f};
  const oldSpawn=Game.prototype.spawnRound;
  Game.prototype.spawnRound=function(){oldSpawn.call(this);fresh(this.player);fresh(this.enemy);[this.player,this.enemy].forEach(f=>{f.stamina=100;f.momentum=0;f.intent=null;f.memory={attacks:{},defenses:{}};f.comboChain=0;f.exhausted=false;f.counterWindow=0});this.directedClock=rnd(7,12);this.combatHudClock=0;this.updateCombatHud()};

  Game.prototype.updateCombatHud=function(){
    if(!this.player||!this.enemy)return;[['player',this.player],['enemy',this.enemy]].forEach(([id,f])=>{const bar=$('#'+id+'Stamina');if(bar)bar.style.width=clamp(f.stamina,0,100)+'%';if(!f.intent&&!isBusy(f))setIntent(this,f,`${rangeBand(Math.abs(this.enemy.rig.x-this.player.rig.x))} • ${Math.round(f.momentum)} MOMENTUM`)})
  };

  Game.prototype.chooseIntent=function(f,o,dist){
    const armed=f.weapon.kind!=='fist',low=f.stamina<28,desperate=f.hp/f.maxHp<.24;
    let pool=armed?[f.weapon.kind==='heavy'?'heavy':'weapon','weapon','grab']:
      dist<138?['body','hook','straight','grab']:dist<185?['straight','body','hook','kickBody','kickHead']:['kickBody','straight'];
    if(low)pool=['straight','body'];if(desperate)pool.push('grab','kickHead','heavy');
    const repeated=Object.entries(f.memory.attacks).sort((a,b)=>b[1]-a[1])[0];if(repeated&&repeated[1]>2)pool=pool.filter(x=>x!==repeated[0])||pool;
    const key=pick(pool),base=ATTACKS[key]||ATTACKS.straight,feint=f.stamina>35&&chance((f.personality==='TACTICAL'||f.personality==='OPPORTUNIST')?.22:.08),data={...base,key,feint};
    if(key==='weapon'||key==='heavy'){data.zone=pick(['head','body','limb']);data.label=(key==='heavy'?'HEAVY ':'WEAPON ')+data.zone.toUpperCase()}
    f.intent=data;f.intentT=(data.family==='heavy'?.72:data.family==='grab'?.58:.44)/Math.max(.82,f.speed);f.stamina=Math.max(0,f.stamina-data.cost*(feint?1.18:1));f.rig.setState(feint?'feint':data.family==='kick'?'kickLoad':data.family==='heavy'||data.family==='weapon'?'windup':'punchLoad',.2);f.rig.expression='angry';setIntent(this,f,feint?`? ${data.label} ?`:data.label,feint?'feint':data.family==='heavy'?'danger':'');remember(f.memory.attacks,key)
  };

  Game.prototype.chooseDefense=function(o,intent){
    const skill=clamp(.22+o.dodge+(o.personality==='TACTICAL'?.14:0)+(o.personality==='COWARDLY'?.08:0),.18,.56);if(!chance(skill))return{type:'none'};
    const repeated=Object.entries(o.memory.defenses).sort((a,b)=>b[1]-a[1])[0],family=intent.family;
    let type=family==='straight'||(intent.zone==='head'&&family!=='kick')?'headSway':family==='hook'||family==='weapon'||family==='bodyPunch'?'bodySway':family==='kick'||family==='heavy'||family==='grab'?'stepJump':pick(['headSway','bodySway']);
    if(o.stamina<18&&type==='stepJump')type='block';if(repeated&&repeated[1]>2&&repeated[0]===type&&chance(.65))type='block';
    if(chance(o.personality==='TACTICAL'?.34:.2))type='block';remember(o.memory.defenses,type);return{type,zone:intent.zone}
  };

  Game.prototype.performDodge=function(f,away,type,intent){
    const good=(type==='headSway'&&(intent.family==='straight'||intent.zone==='head')&&intent.family!=='kick')||(type==='bodySway'&&['hook','weapon','bodyPunch'].includes(intent.family))||(type==='stepJump'&&['kick','heavy','grab'].includes(intent.family));
    const vulnerable=(type==='headSway'&&intent.zone==='body')||(type==='bodySway'&&intent.family==='kick');if(vulnerable&&chance(.72))return false;
    if(type==='stepJump'){if(f.stamina<15)return false;f.stamina-=15;f.motion={t:0,dur:.42,start:f.rig.x,end:clamp(f.rig.x+away*118,120,1160)};f.rig.setState('stepJump',.14);f.stun=.48}
    else{f.stamina=Math.max(0,f.stamina-5);f.rig.setState(type,.1);f.stun=.38}
    f.rig.expression=good?'smug':'fear';f.momentum=clamp(f.momentum+(good?9:4),0,100);f.counterWindow=good?.65:.28;this.thought(f,pick(type==='headSway'?['MISSED MY FACE.','HAIR REMAINS PERFECT.','HEAD NOT FOUND.']:type==='bodySway'?['WRONG ZIP CODE.','MY RIBS DECLINED.','SWAYING PROFESSIONALLY.']:['TOO SLOW, GRAVITY!','TACTICAL EXIT!','PERSONAL SPACE!']),1050,'dodge-pop');this.say(`${f.name} uses ${type==='headSway'?'a head sway':type==='bodySway'?'a body sway':'a step-back jump'}${good?' at exactly the wrong time for the attacker.':'.'}`);return true
  };

  Game.prototype.resolveDefense=function(f,o,intent){
    const d=this.chooseDefense(o,intent);if(d.type==='none')return'clean';
    if(d.type==='block'){
      const read=!intent.feint&&chance(o.personality==='TACTICAL'?.78:.58),zone=read?intent.zone:pick(['head','body','limb']);o.guardZone=zone;o.blocking=true;o.rig.setState(zone==='head'?'parryHigh':zone==='limb'?'parryLow':'parryBody',.14);o.stun=.34;o.stamina=Math.max(0,o.stamina-8);this.thought(o,zone===intent.zone?'READ IT.':'GUESSING!',950,'block-pop');if(zone===intent.zone){o.counterWindow=.72;o.momentum=clamp(o.momentum+7,0,100);return'blocked'}return'clean'
    }
    return this.performDodge(o,-f.rig.dir,d.type,intent)?'dodged':'clean'
  };

  Game.prototype.missAttack=function(f,intent){
    f.lastTargetZone=intent.zone;f.rig.setState(intent.family==='kick'?(intent.zone==='head'?'kickHead':'kickBody'):intent.family==='weapon'||intent.family==='heavy'?(intent.zone==='head'?'weaponHead':'weaponBody'):(intent.zone==='head'?'punchHead':'punchBody'),.1);f.rig.smear=.8;f.rig.smearKind=intent.family==='kick'?'kickBody':'punchHead';f.cool=.65;f.stun=.26;setTimeout(()=>{if(!f.dead)f.rig.setState('guard',.2)},230)
  };

  Game.prototype.executeIntent=function(f,o){
    const intent=f.intent;if(!intent)return;f.intent=null;setIntent(this,f,'COMMITTING…','danger');
    if(intent.feint){f.rig.setState('feint',.1);f.momentum=clamp(f.momentum+4,0,100);this.thought(f,'BOUGHT IT.',850);this.say(`${f.name} sells a feint and changes the invoice.`);intent.feint=false;intent.zone=intent.zone==='head'?'body':'head';intent.family=intent.zone==='head'?'hook':'bodyPunch';setTimeout(()=>{if(this.running&&!f.dead&&!o.dead){const result=this.resolveDefense(f,o,intent);if(result==='dodged')this.missAttack(f,intent);else this.attack(f,o,result==='blocked')}},220);return}
    const result=this.resolveDefense(f,o,intent);if(result==='dodged'){this.missAttack(f,intent);return}
    if(result==='blocked'){this.attack(f,o,true);if(o.counterWindow>0&&chance(.48))setTimeout(()=>{if(this.running&&!o.dead&&!f.dead&&!isBusy(o)){o.counterWindow=0;o.cool=0;this.beginCombo(o,f,true)}},420);return}
    const crazyChance=.045+(f.personality==='CHAOTIC'?.045:0)+(f.momentum>65?.035:0),comboChance=.13+(f.personality==='AGGRESSIVE'?.07:0)+(f.counterWindow>0?.15:0);
    if(intent.family==='grab'||chance(crazyChance)){this.crazyMove(f,o);return}if(f.weapon.kind==='fist'&&chance(comboChance)){this.beginCombo(f,o);return}this.attack(f,o,false)
  };

  Game.prototype.beginCombo=function(f,o,counter=false){
    const combo=pick(COMBOS),speed=Math.max(.82,f.speed);f.stamina=Math.max(0,f.stamina-18);f.cool=1.8/speed;f.stun=1.28/speed;f.comboChain=combo.steps.length;this.announce(`${counter?'PERFECT COUNTER!<br>':''}${combo.name}`,700);this.say(`${f.name} starts a combination before the paperwork can separate the hits.`);
    combo.steps.forEach((step,i)=>setTimeout(()=>{if(!this.running||f.dead||o.dead||f.comboChain<=0)return;const [pose,zone,dmg,kb]=step;f.lastTargetZone=zone;f.rig.setState(pose,.09);f.rig.smear=.7;f.rig.smearKind=pose.includes('kick')?'kickBody':'punchHead';const escape=i>0&&o.stamina>12&&chance(.12+(o.personality==='TACTICAL'?.09:0));if(escape){f.comboChain=0;this.performDodge(o,-f.rig.dir,pick(['headSway','bodySway']),{family:zone==='head'?'straight':'bodyPunch',zone});this.announce('COMBO BROKEN!',450);return}this.hit(o,dmg*f.power*rnd(.9,1.08),kb,f,chance((f.luck||0)/230),false)},(180+i*250)/speed));
    setTimeout(()=>{f.comboChain=0;if(!f.dead)f.rig.setState('guard',.22)},(combo.steps.length*260+260)/speed)
  };

  Game.prototype.crazyMove=function(f,o,forced){
    const move=forced||pick(CRAZY),dir=Math.sign(o.rig.x-f.rig.x)||f.rig.dir,fail=chance(clamp(.15-f.momentum/900+(f.exhausted?.1:0),.04,.24)),start=f.rig.x,other=o.rig.x,restore=()=>{f.rig.weapon=f.weapon;o.grappled=false;o.rig.y=this.floor};f.intent=null;f.stamina=Math.max(0,f.stamina-26);f.cool=3.25;f.stun=2.55;o.stun=2.7;o.grappled=true;o.motion=null;o.flight=null;f.rig.weapon=WEAPONS[0];this.announce(move.name,850);this.thought(f,pick(['THIS SEEMED SMART!','WITNESS ME, INSURANCE!','I SAW THIS ONLINE!']),1100);this.say(`${f.name} initiates ${move.name}. Physics requests paid leave.`);
    const crossover=['cross','rebound','trap'].includes(move.type);if(crossover){f.rig.setState('vault',.16);f.motion={t:0,dur:.48,start,end:clamp(other+dir*72,120,1160)};setTimeout(()=>{f.rig.dir=-dir;o.rig.dir=-f.rig.dir},500)}else if(move.type==='spin')f.rig.setState('spinCarry',.2);else if(move.type==='launch')f.rig.setState('groundPounce',.2);else f.rig.setState('rearGrab',.2);o.rig.setState('grabbed',.16);o.rig.expression='fear';
    setTimeout(()=>{if(!this.running||f.dead||o.dead)return;o.rig.x=f.rig.x+f.rig.dir*24;o.rig.y=this.floor-105;f.rig.setState(move.type==='spin'?'spinCarry':'lift',.18);o.rig.setState('carry',.14)},620);
    setTimeout(()=>{if(!this.running||f.dead||o.dead)return;if(fail){restore();f.rig.setState('fall',.15);f.down=.72;f.stun=.8;o.stun=.2;o.momentum=clamp(o.momentum+12,0,100);this.announce('TECHNICALLY A MOVE!',550);this.say(`${f.name} eats shit halfway through ${move.name}, but the floor deals zero damage.`);return}o.grappled=false;f.rig.setState(move.type==='spin'?'throwRelease':move.type==='launch'?'groundPounce':'groundSlam',.12);o.flight={t:0,dur:.68,sx:o.rig.x,sy:o.rig.y,ex:clamp(o.rig.x+f.rig.dir*(move.kb*8.5),120,1160),ey:this.floor,arc:move.type==='launch'?175:move.type==='arena'?120:85,onLand:()=>{restore();if(this.running&&!f.dead&&!o.dead){f.lastTargetZone=move.zone;this.hit(o,move.damage*f.power*rnd(.88,1.12),move.kb,f,chance((f.luck||0)/165),false);f.stun=0;f.momentum=clamp(f.momentum+18,0,100);if(move.type==='arena')this.breakNearestProp(o)}}};this.say(`${o.name} reaches the non-negotiable portion of ${move.name}.`)},1050)
  };

  Game.prototype.breakNearestProp=function(v){const obj=this.objects?.filter(x=>x.active&&!x.broken).sort((a,b)=>Math.abs(a.x-v.rig.x)-Math.abs(b.x-v.rig.x))[0];if(!obj)return;obj.active=false;obj.broken=true;this.property=(this.property||0)+250;this.burst(obj.x,this.floor-45,'#f3d13b',12);this.say(`The ${obj.names?.[obj.kind]||'scenery'} becomes an unwilling co-star.`)};

  const oldEvade=Game.prototype.evade;
  Game.prototype.evade=function(f,away){fresh(f);const fake={family:pick(['straight','hook','kick']),zone:pick(['head','body'])};return this.performDodge(f,away,pick(['headSway','bodySway','stepJump']),fake)||oldEvade.call(this,f,away)};

  const oldHit=Game.prototype.hit;
  Game.prototype.hit=function(v,dmg,kb,attacker,crit,blocked){
    fresh(v);fresh(attacker);oldHit.call(this,v,dmg,kb,attacker,crit,blocked);if(blocked){v.momentum=clamp(v.momentum+5,0,100);attacker.momentum=clamp(attacker.momentum-3,0,100)}else{attacker.momentum=clamp(attacker.momentum+(crit?16:8),0,100);v.momentum=clamp(v.momentum-7,0,100);if(!v.dead){const zone=attacker.lastTargetZone||'body';v.rig.setState(zone==='head'?'headSnap':zone==='limb'?'limbRecoil':'bodyFold',.11);if(v.down>0&&chance(.22)&&attacker.stamina>18)setTimeout(()=>{if(this.running&&!attacker.dead&&!v.dead&&v.down>0){attacker.stamina-=14;attacker.rig.setState('groundPounce',.12);attacker.lastTargetZone='body';this.announce('GROUND FOLLOW-UP!',380);this.hit(v,6*attacker.power,5,attacker,false,false)}},310)}}this.updateCombatHud()
  };

  const oldUpdateFighter=Game.prototype.updateFighter;
  Game.prototype.updateFighter=function(f,o,dt){
    fresh(f);fresh(o);f.counterWindow=Math.max(0,f.counterWindow-dt);f.decision-=dt;const regen=(f.exhausted?7:13)*(f.stun>0?.45:1);f.stamina=clamp(f.stamina+regen*dt,0,100);f.exhausted=f.stamina<8?true:f.stamina>32?false:f.exhausted;
    if(this.training){f.rig.update(dt);return}
    if(isBusy(f)){oldUpdateFighter.call(this,f,o,dt);return}
    f.cool-=dt;const dist=Math.abs(o.rig.x-f.rig.x),dir=Math.sign(o.rig.x-f.rig.x)||1;f.rig.dir=dir;
    if(f.intent){f.intentT-=dt;f.rig.update(dt);if(f.intentT<=0)this.executeIntent(f,o);return}
    if(f.exhausted){f.rig.setState('exhausted',.22);f.rig.expression='fear';setIntent(this,f,'GASPING • EMPTY TANK','danger');f.rig.update(dt);return}
    const hpRatio=f.hp/f.maxHp,desperate=hpRatio<.24,desired=desperate?145:f.preferredRange+(f.weapon.range-90)*.28,tooFar=dist>desired+18,tooClose=dist<desired-22;
    if(f.cool<=0&&dist<Math.max(205,this.engageDistance(f)+36)){this.chooseIntent(f,o,dist)}
    else if(tooFar){
      if(f.cool<=0&&f.weapon.kind!=='fist'&&dist<410&&chance(dt*.16)){f.stamina=Math.max(0,f.stamina-16);this.throwWeapon(f,o);return}
      if(f.cool<=0&&f.personality==='CHAOTIC'&&chance(dt*.12)){f.stamina=Math.max(0,f.stamina-10);this.useEnvironment(f,o);return}
      const sprint=dist>360?190:112;f.rig.x=clamp(f.rig.x+dir*sprint*f.speed*dt,120,1160);f.rig.setState('idle',.16);f.rig.update(dt,dir)
    }
    else if(tooClose&&dist>118){f.rig.x=clamp(f.rig.x-dir*76*f.speed*dt,120,1160);f.rig.setState(f.personality==='TACTICAL'?'guard':'idle',.18);f.rig.update(dt,-dir)}
    else{f.rig.setState(f.personality==='TACTICAL'?'guard':'idle',.2);f.rig.update(dt)}
  };

  const oldUpdate=Game.prototype.update;
  Game.prototype.update=function(dt){oldUpdate.call(this,dt);this.combatHudClock=(this.combatHudClock||0)-dt;if(this.combatHudClock<=0){this.combatHudClock=.12;this.updateCombatHud()}if(!this.running||this.training)return;this.directedClock=(this.directedClock||8)-dt;if(this.directedClock<=0&&!isBusy(this.player)&&!isBusy(this.enemy)&&!this.player.intent&&!this.enemy.intent&&Math.abs(this.player.rig.x-this.enemy.rig.x)<205&&chance(.32)){this.directedClock=rnd(9,15);const first=chance(.5)?this.player:this.enemy,second=first===this.player?this.enemy:this.player;this.announce('CARTOON EXCHANGE!',500);first.cool=second.cool=.8;this.beginCombo(first,second)}else if(this.directedClock<=0)this.directedClock=rnd(5,8)};

  const oldTraining=Game.prototype.trainingMove;
  Game.prototype.trainingMove=function(move){
    if(!this.training)return;if(move==='dodge'){const p=this.player,e=this.enemy;p.dodgeDemo=(p.dodgeDemo+1)%3;const type=['headSway','bodySway','stepJump'][p.dodgeDemo];this.performDodge(p,-1,type,{family:type==='headSway'?'straight':type==='bodySway'?'hook':'kick',zone:type==='headSway'?'head':'body'});return}if(move==='combo'){this.beginCombo(this.player,this.enemy);return}if(move==='grapple'){const pool=CRAZY.filter(m=>!this.lastTrainingCrazy||m.name!==this.lastTrainingCrazy.name),m=pick(pool);this.lastTrainingCrazy=m;this.crazyMove(this.player,this.enemy,m);return}oldTraining.call(this,move)
  };

  window.LB5={ATTACKS,COMBOS,CRAZY,rangeBand};
})();
