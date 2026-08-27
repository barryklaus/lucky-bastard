(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const lerp = (a,b,t) => a+(b-a)*t;
  const rnd = (a,b) => a+Math.random()*(b-a);
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const chance = n => Math.random()<n;
  const TAU = Math.PI*2;
  const screens = ['creator','game','loot','trivia','end'];
  function show(id){ screens.forEach(x=>$('#'+x).classList.toggle('active',x===id)); }
  const CANVAS_STATES=new WeakMap();
  function canvasState(canvas){
    let state=CANVAS_STATES.get(canvas);if(state)return state;
    state={cssW:0,cssH:0};CANVAS_STATES.set(canvas,state);
    const measure=entry=>{const box=entry&&entry.contentRect?entry.contentRect:canvas.getBoundingClientRect();state.cssW=box.width;state.cssH=box.height};
    measure();
    if(window.ResizeObserver){const observer=new ResizeObserver(entries=>measure(entries[0]));observer.observe(canvas);state.observer=observer}
    else window.addEventListener('resize',()=>measure(),{passive:true});
    return state
  }
  function prepareCanvas(canvas,ctx,logicalW,logicalH,renderScale=1,maxDpr=3){
    const state=canvasState(canvas);if(!state.cssW||!state.cssH)return false;
    const dpr=Math.min(maxDpr,Math.max(1,window.devicePixelRatio||1)),targetW=Math.max(logicalW,Math.round(state.cssW*dpr*renderScale)),targetH=Math.max(logicalH,Math.round(state.cssH*dpr*renderScale)),changed=canvas.width!==targetW||canvas.height!==targetH;
    if(changed){canvas.width=targetW;canvas.height=targetH}
    ctx.setTransform(targetW/logicalW,0,0,targetH/logicalH,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';return changed
  }

  const WEAPONS = [
    {name:'Fists of Regret',icon:'✊',kind:'fist',damage:7,range:62,speed:1.18,kb:6,color:'#d59b72'},
    {name:'Bent Frying Pan',icon:'🍳',kind:'blunt',damage:10,range:78,speed:1.05,kb:11,color:'#5c6170'},
    {name:'Questionable Bottle',icon:'🍾',kind:'blade',damage:11,range:76,speed:1.18,kb:7,color:'#64aa87'},
    {name:'Union Chair',icon:'🪑',kind:'blunt',damage:14,range:94,speed:.82,kb:18,color:'#9b6238'},
    {name:'Taxpayer Bat',icon:'🏏',kind:'blunt',damage:15,range:102,speed:.94,kb:15,color:'#8f5f32'},
    {name:'Rusty Cleaver',icon:'🔪',kind:'blade',damage:17,range:91,speed:1.02,kb:10,color:'#b8bdc6'},
    {name:'Personal-Space Spear',icon:'🔱',kind:'pole',damage:15,range:132,speed:.89,kb:13,color:'#c7a35b'},
    {name:'Budget Broadsword',icon:'⚔️',kind:'blade',damage:19,range:112,speed:.9,kb:13,color:'#c9d0d4'},
    {name:'Great Axe of HR',icon:'🪓',kind:'heavy',damage:25,range:116,speed:.66,kb:24,color:'#b7c1c5'},
    {name:'Compliance Hammer',icon:'🔨',kind:'heavy',damage:27,range:108,speed:.61,kb:28,color:'#75818a'},
    {name:'Rubber Chicken of Doom',icon:'🐔',kind:'blunt',damage:8,range:82,speed:1.2,kb:9,color:'#f1d246'},
    {name:'Rolling Pin of Judgment',icon:'🥖',kind:'blunt',damage:11,range:88,speed:1.08,kb:12,color:'#c88a4b'},
    {name:'Tactical Plunger',icon:'🪠',kind:'blunt',damage:12,range:96,speed:1.02,kb:14,color:'#b33b3b'},
    {name:'Executive Stapler',icon:'📎',kind:'blunt',damage:10,range:72,speed:1.25,kb:8,color:'#66717a'},
    {name:'Frozen Tuna',icon:'🐟',kind:'blunt',damage:13,range:91,speed:1.0,kb:13,color:'#65a7b8'},
    {name:'Sock Full of Coins',icon:'🧦',kind:'blunt',damage:14,range:86,speed:1.12,kb:16,color:'#8575a8'},
    {name:'Keyboard of Caps Lock',icon:'⌨️',kind:'blunt',damage:13,range:94,speed:1.03,kb:14,color:'#a9adb1'},
    {name:'Nine-Iron Negotiator',icon:'🏌️',kind:'pole',damage:16,range:116,speed:.96,kb:17,color:'#abb4b9'},
    {name:'Pool Cue of Poor Choices',icon:'🎱',kind:'pole',damage:14,range:127,speed:1.08,kb:11,color:'#b98a55'},
    {name:'Mop of Justice',icon:'🧹',kind:'pole',damage:12,range:136,speed:.94,kb:15,color:'#8ac4c9'},
    {name:'Garden Rake Surprise',icon:'🌱',kind:'pole',damage:17,range:124,speed:.84,kb:18,color:'#87938b'},
    {name:'Riot Umbrella',icon:'☂️',kind:'pole',damage:15,range:112,speed:1.04,kb:14,color:'#714d8c'},
    {name:'Shovel of Unemployment',icon:'⛏️',kind:'heavy',damage:20,range:113,speed:.78,kb:22,color:'#8b969b'},
    {name:'Fire Extinguisher',icon:'🧯',kind:'heavy',damage:21,range:92,speed:.72,kb:26,color:'#d94a43'},
    {name:'Emotional Support Cactus',icon:'🌵',kind:'blade',damage:16,range:87,speed:1.0,kb:10,color:'#4b9d5e'},
    {name:'Industrial Pizza Cutter',icon:'🍕',kind:'blade',damage:18,range:83,speed:1.14,kb:9,color:'#c4c9cc'},
    {name:'Sausage Nunchucks',icon:'🌭',kind:'blunt',damage:19,range:101,speed:1.18,kb:15,color:'#b85a47'},
    {name:'Warranty-Void Chainsaw',icon:'🪚',kind:'blade',damage:24,range:107,speed:.76,kb:20,color:'#d46b35'},
    {name:'Participation Trophy',icon:'🏆',kind:'blunt',damage:18,range:89,speed:1.07,kb:16,color:'#d7ae3d'},
    {name:'Municipal Parking Meter',icon:'🅿️',kind:'heavy',damage:29,range:118,speed:.55,kb:31,color:'#63747c'},
    {name:'Briefcase of Burden',icon:'💼',kind:'blunt',damage:15,range:88,speed:1.16,kb:14,color:'#6e4930'},
    {name:'Selfie Stick Sabre',icon:'🤳',kind:'blade',damage:16,range:121,speed:1.23,kb:9,color:'#63a9bd'},
    {name:'Leaf Blower of Destiny',icon:'🍃',kind:'pole',damage:18,range:132,speed:1.02,kb:19,color:'#e1833e'},
    {name:'Traffic Cone Nunchaku',icon:'🚧',kind:'blunt',damage:20,range:104,speed:1.15,kb:17,color:'#ef7f3b'},
    {name:'Golden Toilet Brush',icon:'🪠',kind:'pole',damage:23,range:134,speed:1.0,kb:20,color:'#d7ae3d'},
    {name:'Microwave of Consequences',icon:'📻',kind:'heavy',damage:31,range:98,speed:.48,kb:35,color:'#8c9399'}
  ];
  const LOOT = [
    {name:'Suspicious Vitamins',icon:'💊',type:'stat',desc:'+20 maximum health. Side effects include confidence.',apply:g=>{g.player.maxHp+=20;g.player.hp+=20}},
    {name:'Steel-Toe Crocs',icon:'🥿',type:'stat',desc:'+13% speed. Still banned from polite society.',apply:g=>g.player.speed*=1.13},
    {name:'Unlicensed Plating',icon:'🛡️',type:'stat',desc:'Reduce incoming damage by 12%.',apply:g=>g.player.armor+=.12},
    {name:'Rabbit’s Tax Return',icon:'🍀',type:'stat',desc:'+16 luck. Do not ask how it was acquired.',apply:g=>g.player.luck+=16},
    {name:'Anger Coupon',icon:'🎟️',type:'stat',desc:'+18% damage, redeemable at any face.',apply:g=>g.player.power*=1.18},
    {name:'Dodge Insurance',icon:'📄',type:'stat',desc:'+10% dodge chance. Claim routinely denied.',apply:g=>g.player.dodge+=.10},
    {name:'Very Legal Helmet',icon:'⛑️',type:'armor',desc:'One heavy head hit hurts much less.',apply:g=>{g.player.helmet=true;g.player.armor+=.07}},
    {name:'Last Laugh',icon:'😂',type:'ability',desc:'Hidden ability: retaliate when critically wounded.',apply:g=>g.unlock('LAST LAUGH')},
    {name:'Bar Fighter',icon:'🍺',type:'ability',desc:'Hidden ability: environmental weapons hit harder.',apply:g=>g.unlock('BAR FIGHTER')},
    {name:'Berserker',icon:'😤',type:'ability',desc:'Hidden ability: frenzy below 25% health.',apply:g=>g.unlock('BERSERKER')},
    {name:'Second Wind',icon:'🌬️',type:'ability',desc:'Once per fight, recover 22% health when critically wounded.',apply:g=>g.unlock('SECOND WIND')},
    {name:'Glass Cannon',icon:'💥',type:'ability',desc:'+35% damage, but lose 15 maximum health. Sensible people declined.',apply:g=>{g.unlock('GLASS CANNON');g.player.power*=1.35;g.player.maxHp-=15}},
    {name:'Thick Skull',icon:'🧱',type:'ability',desc:'Gain 12% damage resistance and misunderstand every insult.',apply:g=>{g.unlock('THICK SKULL');g.player.armor+=.12}},
    {name:'Greased Lightning',icon:'⚡',type:'ability',desc:'+18% speed and +5% dodge. Extremely difficult to insure.',apply:g=>{g.unlock('GREASED LIGHTNING');g.player.speed*=1.18;g.player.dodge+=.05}},
    {name:'Crowd Favorite',icon:'📣',type:'ability',desc:'Positive popularity builds 40% faster.',apply:g=>g.unlock('CROWD FAVORITE')},
    {name:'Human Shield',icon:'🚧',type:'ability',desc:'Blocks absorb more damage and dignity.',apply:g=>{g.unlock('HUMAN SHIELD');g.player.armor+=.08}},
    {name:'Pain Enjoyer',icon:'😵',type:'ability',desc:'Gain 12% damage. Complaints become motivational.',apply:g=>{g.unlock('PAIN ENJOYER');g.player.power*=1.12}},
    {name:'Throwing Arm',icon:'🥏',type:'ability',desc:'Thrown weapons deal 45% more damage.',apply:g=>g.unlock('THROWING ARM')},
    {name:'Bone Collector',icon:'🦴',type:'ability',desc:'+18 luck and much worse small talk.',apply:g=>{g.unlock('BONE COLLECTOR');g.player.luck+=18}},
    {name:'Counterpunch',icon:'↩️',type:'ability',desc:'Chance to retaliate immediately after blocking.',apply:g=>g.unlock('COUNTERPUNCH')},
    {name:'Lucky Idiot',icon:'🤪',type:'ability',desc:'+25 luck. Intelligence remains unchanged.',apply:g=>{g.unlock('LUCKY IDIOT');g.player.luck+=25}},
    {name:'Emergency Snack',icon:'🌮',type:'ability',desc:'Add 12 maximum health. The taco is medically binding.',apply:g=>{g.unlock('EMERGENCY SNACK');g.player.maxHp+=12;g.player.hp+=12}},
    {name:'Audience Plant',icon:'🪴',type:'ability',desc:'Crowd barrages become twice as annoying.',apply:g=>g.unlock('AUDIENCE PLANT')},
    {name:'Spring-Loaded Knees',icon:'🦿',type:'ability',desc:'Acrobatic attacks occur more often and hit harder.',apply:g=>g.unlock('SPRING-LOADED KNEES')},
    {name:'Weapon Loyalty',icon:'🤝',type:'ability',desc:'Your fighter stops throwing away equipped weapons.',apply:g=>g.unlock('WEAPON LOYALTY')},
    {name:'Adrenaline Refund',icon:'💉',type:'ability',desc:'+10% speed and faster recovery after knockdowns.',apply:g=>{g.unlock('ADRENALINE REFUND');g.player.speed*=1.1}},
    {name:'Plot Armor',icon:'📖',type:'ability',desc:'Survive one otherwise lethal hit per fight with 1 HP.',apply:g=>g.unlock('PLOT ARMOR')},
    {name:'Vampiric Paper Cut',icon:'🧛',type:'ability',desc:'Successful attacks restore a little health.',apply:g=>g.unlock('VAMPIRIC PAPER CUT')},
    {name:'Punching Up',icon:'📈',type:'ability',desc:'Deal 20% more damage to healthier opponents.',apply:g=>g.unlock('PUNCHING UP')},
    {name:'Apology Immunity',icon:'🙉',type:'ability',desc:'+6% resistance and immunity to feeling responsible.',apply:g=>{g.unlock('APOLOGY IMMUNITY');g.player.armor+=.06}},
    {name:'Grapple Goblin',icon:'🤼',type:'ability',desc:'Wrestling attempts happen more often and land 35% harder.',apply:g=>g.unlock('GRAPPLE GOBLIN')},
    {name:'Heavy Metal',icon:'🤘',type:'ability',desc:'Heavy weapons gain 24% damage and violent extra knockback.',apply:g=>g.unlock('HEAVY METAL')},
    {name:'Blade Parade',icon:'🗡️',type:'ability',desc:'Blade and pole weapons gain 18% damage and better critical odds.',apply:g=>g.unlock('BLADE PARADE')},
    {name:'Crowd Surfing',icon:'🏄',type:'ability',desc:'A friendly crowd barrage also restores 10 health.',apply:g=>g.unlock('CROWD SURFING')},
    {name:'Acrobat Tax Credit',icon:'🤸',type:'ability',desc:'Acrobatic attacks recover 22% faster and hit 18% harder.',apply:g=>g.unlock('ACROBAT TAX CREDIT')},
    {name:'Weapon Boomerang',icon:'🪃',type:'ability',desc:'Thrown weapons have a 70% chance to return after impact.',apply:g=>g.unlock('WEAPON BOOMERANG')},
    {name:'Combo Meal',icon:'🍔',type:'ability',desc:'Each active combo hit adds 5% damage, up to 25%.',apply:g=>g.unlock('COMBO MEAL')}
  ];
  const ABILITY_KEYS={'Last Laugh':'LAST LAUGH','Bar Fighter':'BAR FIGHTER','Berserker':'BERSERKER','Second Wind':'SECOND WIND','Glass Cannon':'GLASS CANNON','Thick Skull':'THICK SKULL','Greased Lightning':'GREASED LIGHTNING','Crowd Favorite':'CROWD FAVORITE','Human Shield':'HUMAN SHIELD','Pain Enjoyer':'PAIN ENJOYER','Throwing Arm':'THROWING ARM','Bone Collector':'BONE COLLECTOR','Counterpunch':'COUNTERPUNCH','Lucky Idiot':'LUCKY IDIOT','Emergency Snack':'EMERGENCY SNACK','Audience Plant':'AUDIENCE PLANT','Spring-Loaded Knees':'SPRING-LOADED KNEES','Weapon Loyalty':'WEAPON LOYALTY','Adrenaline Refund':'ADRENALINE REFUND','Plot Armor':'PLOT ARMOR','Vampiric Paper Cut':'VAMPIRIC PAPER CUT','Punching Up':'PUNCHING UP','Apology Immunity':'APOLOGY IMMUNITY','Grapple Goblin':'GRAPPLE GOBLIN','Heavy Metal':'HEAVY METAL','Blade Parade':'BLADE PARADE','Crowd Surfing':'CROWD SURFING','Acrobat Tax Credit':'ACROBAT TAX CREDIT','Weapon Boomerang':'WEAPON BOOMERANG','Combo Meal':'COMBO MEAL'};
  const RARITY={COMMON:0,UNUSUAL:1,RARE:2,ABSURD:3},rareByName={'Plot Armor':'ABSURD','Vampiric Paper Cut':'RARE','Glass Cannon':'RARE','Second Wind':'RARE','Spring-Loaded Knees':'RARE','Grapple Goblin':'UNUSUAL','Heavy Metal':'RARE','Blade Parade':'RARE','Crowd Surfing':'UNUSUAL','Acrobat Tax Credit':'RARE','Weapon Boomerang':'ABSURD','Combo Meal':'RARE'};
  LOOT.forEach(x=>{x.key=ABILITY_KEYS[x.name]||null;x.rarity=rareByName[x.name]||(x.type==='ability'?'UNUSUAL':'COMMON')});
  const NAMES=['Greg','Susan from Accounting','Big Tony','Kevin, Apparently','Cheryl','Sir Bonksalot','Dave II','Moist Gary','Tax Fraud Terry','Deborah the Unwise','Craig Classic','Linda Danger'];
  const TRAITS=['AGGRESSIVE','TACTICAL','CHAOTIC','COWARDLY','OPPORTUNIST'];
  const SKINS=['#f1c6a5','#d59b72','#aa6f4e','#77472f','#5a3528','#ddb38f'];
  const COLORS=['#e6c229','#e95b78','#4ec9b0','#5e8de6','#9d6bd8','#ef7f3b'];
  const MAX_LEVEL=25;
  const SCENES=[
    {id:'backyard',icon:'🏚️',name:"SOMEBODY'S BACKYARD",subtitle:'CHEAP SUBURBAN BACKYARD',objects:['plasticChair','bbq','trampoline','kiddiePool','gnome','clothesline']},
    {id:'office',icon:'🏢',name:'OFFICE FROM HELL',subtitle:'DEPRESSINGLY NORMAL OFFICE',objects:['cubicle','photocopier','waterCooler','rollingChair','poster']},
    {id:'buffet',icon:'🍗',name:'ALL-YOU-CAN-EAT BUFFET',subtitle:'QUESTIONABLE BUFFET RESTAURANT',objects:['foodTray','buffetTable','highChair','sneezeGuard','dinerTable']},
    {id:'wedding',icon:'💒',name:'CHEAP WEDDING',subtitle:'RECEPTION DEPOSIT: NON-REFUNDABLE',objects:['cake','giftTable','djBooth','weddingChair','champagne']},
    {id:'birthday',icon:'🧸',name:"KIDS' BIRTHDAY PARTY",subtitle:'PARENTS CASUALLY WATCHING',objects:['bouncyCastle','pinata','balloons','clownBox','partyTable']}
  ];
  const DIALOGUE=window.LB_DIALOGUE||{};

  const POSES={
    idle:{bob:0,lean:0,head:0,uaL:-.12,laL:.12,uaR:.12,laR:-.1,thL:.06,shL:.06,thR:-.06,shR:-.06},
    guard:{bob:-2,lean:-.06,head:.05,uaL:-1.1,laL:-.45,uaR:-.55,laR:-.65,thL:.14,shL:.08,thR:-.18,shR:-.05},
    windup:{bob:-3,lean:-.18,head:.10,uaL:-.1,laL:.18,uaR:2.15,laR:.95,thL:.12,shL:.08,thR:-.18,shR:-.08},
    strike:{bob:-4,lean:.18,head:-.08,uaL:-.55,laL:-.2,uaR:-1.22,laR:-.18,thL:-.12,shL:.04,thR:.22,shR:.1},
    punchLoad:{bob:5,lean:-.16,head:.08,uaL:-.85,laL:-.7,uaR:.95,laR:.72,thL:.2,shL:.15,thR:-.22,shR:-.12},
    punchImpact:{bob:-3,lean:.28,head:-.12,uaL:-.82,laL:-.55,uaR:-1.52,laR:-.02,thL:-.18,shL:.05,thR:.28,shR:.12},
    punchHead:{bob:-5,lean:.25,head:-.13,uaL:-.86,laL:-.55,uaR:-1.98,laR:-1.98,thL:-.18,shL:.05,thR:.28,shR:.12},
    punchBody:{bob:1,lean:.3,head:-.08,uaL:-.82,laL:-.55,uaR:-1.42,laR:-1.42,thL:-.16,shL:.05,thR:.25,shR:.1},
    punchRecover:{bob:1,lean:.04,head:0,uaL:-.92,laL:-.5,uaR:-.62,laR:-.55,thL:.08,shL:.08,thR:-.08,shR:-.08},
    stab:{bob:-2,lean:.22,head:-.1,uaL:-.95,laL:-.1,uaR:-1.38,laR:-.02,thL:-.25,shL:.1,thR:.25,shR:.08},
    weaponHead:{bob:-5,lean:.22,head:-.12,uaL:-.9,laL:-.35,uaR:-2.0,laR:-1.85,thL:-.18,shL:.08,thR:.28,shR:.1},
    weaponBody:{bob:-1,lean:.27,head:-.08,uaL:-.9,laL:-.25,uaR:-1.48,laR:-1.4,thL:-.22,shL:.08,thR:.3,shR:.1},
    weaponLimb:{bob:5,lean:.32,head:-.04,uaL:-.85,laL:-.2,uaR:-1.08,laR:-1.12,thL:-.25,shL:.1,thR:.32,shR:.12},
    hit:{bob:-4,lean:-.34,head:.30,uaL:.65,laL:.28,uaR:.82,laR:.22,thL:.22,shL:.18,thR:-.22,shR:-.18},
    dodgeAnticipate:{bob:11,lean:.12,head:.08,uaL:-.7,laL:-.5,uaR:-.45,laR:-.65,thL:.55,shL:.42,thR:-.55,shR:-.42},
    dodge:{bob:-9,lean:-.58,head:.2,uaL:.42,laL:.3,uaR:.82,laR:.3,thL:.72,shL:.5,thR:-.62,shR:-.5},
    backstep:{bob:-18,lean:-.36,head:.12,uaL:.45,laL:.2,uaR:.72,laR:.25,thL:.8,shL:.4,thR:-.75,shR:-.35},
    jump:{bob:-78,lean:.12,head:-.08,uaL:-.75,laL:-.35,uaR:.8,laR:.4,thL:.82,shL:-.55,thR:-.78,shR:.58},
    dive:{bob:-34,lean:1.08,head:-.2,uaL:-1.15,laL:-.1,uaR:-1.35,laR:-.15,thL:.6,shL:.38,thR:-.5,shR:-.35},
    fall:{bob:24,lean:-1.2,head:.3,uaL:.8,laL:.5,uaR:-.9,laR:-.6,thL:.85,shL:.65,thR:-.75,shR:-.5},
    getup:{bob:16,lean:-.65,head:.15,uaL:-1.25,laL:-.25,uaR:.4,laR:.2,thL:.9,shL:.5,thR:-.35,shR:-.6},
    kick:{bob:-3,lean:-.18,head:.1,uaL:.25,laL:.2,uaR:.65,laR:.3,thL:.14,shL:.12,thR:-1.15,shR:-.25},
    kickLoad:{bob:13,lean:.2,head:.06,uaL:-.9,laL:-.55,uaR:.72,laR:.45,thL:.35,shL:.45,thR:-1.08,shR:1.15},
    kickImpact:{bob:-5,lean:-.42,head:.14,uaL:.65,laL:.4,uaR:1.05,laR:.55,thL:.08,shL:.04,thR:-1.52,shR:-.08},
    kickHead:{bob:-8,lean:-.5,head:.16,uaL:.72,laL:.42,uaR:1.08,laR:.58,thL:.06,shL:.02,thR:-2.65,shR:-2.65},
    kickBody:{bob:-4,lean:-.42,head:.12,uaL:.65,laL:.4,uaR:1.02,laR:.54,thL:.08,shL:.04,thR:-2.25,shR:-2.25},
    kickRecover:{bob:8,lean:-.12,head:.08,uaL:-.65,laL:-.5,uaR:.5,laR:.35,thL:.25,shL:.25,thR:-.95,shR:1.0},
    flyingKneeLoad:{bob:14,lean:.18,head:.06,uaL:-.8,laL:-.55,uaR:.72,laR:.5,thL:.42,shL:.52,thR:-1.1,shR:.95},
    flyingKneeImpact:{bob:-72,lean:.34,head:-.12,uaL:.65,laL:.4,uaR:-.75,laR:-.45,thL:.75,shL:-.6,thR:-1.48,shR:.25},
    spinLoad:{bob:8,lean:-.28,head:.2,uaL:.8,laL:.4,uaR:-.82,laR:-.45,thL:.3,shL:.25,thR:-.4,shR:-.3},
    spinKick:{bob:-13,lean:.62,head:-.28,uaL:1.05,laL:.65,uaR:-1.05,laR:-.6,thL:.12,shL:.05,thR:-2.42,shR:-2.42},
    cartwheelLoad:{bob:7,lean:.48,head:-.12,uaL:-1.35,laL:-1.2,uaR:-.9,laR:-1.05,thL:.38,shL:.3,thR:-.45,shR:-.32},
    cartwheelKick:{bob:-42,lean:1.5,head:-.3,uaL:-1.5,laL:-1.45,uaR:-1.25,laR:-1.35,thL:-2.45,shL:-2.45,thR:-.7,shR:-.6},
    supermanLoad:{bob:12,lean:-.2,head:.08,uaL:-.9,laL:-.65,uaR:1.45,laR:.9,thL:.5,shL:.45,thR:-.55,shR:-.48},
    supermanImpact:{bob:-58,lean:.42,head:-.15,uaL:.45,laL:.2,uaR:-1.55,laR:-1.48,thL:.85,shL:.65,thR:-.85,shR:-.65},
    dropkickLoad:{bob:15,lean:.18,head:.05,uaL:-.75,laL:-.55,uaR:.75,laR:.55,thL:.62,shL:.68,thR:-.62,shR:-.68},
    dropkickImpact:{bob:-48,lean:-1.02,head:.22,uaL:.85,laL:.5,uaR:-.8,laR:-.45,thL:-2.05,shL:-2.05,thR:-2.32,shR:-2.32},
    grapple:{bob:9,lean:.28,head:-.08,uaL:-1.45,laL:-1.2,uaR:-1.15,laR:-1.35,thL:.35,shL:.28,thR:-.38,shR:-.3},
    lift:{bob:5,lean:-.18,head:.1,uaL:-2.45,laL:-1.9,uaR:-2.2,laR:-1.8,thL:.28,shL:.2,thR:-.3,shR:-.22},
    grabbed:{bob:0,lean:-1.15,head:.3,uaL:.9,laL:.55,uaR:-.8,laR:-.55,thL:1.05,shL:.7,thR:-.95,shR:-.65},
    carry:{bob:0,lean:-1.5,head:.25,uaL:.65,laL:.4,uaR:-.65,laR:-.4,thL:.85,shL:.55,thR:-.82,shR:-.52},
    throwRelease:{bob:-4,lean:.65,head:-.18,uaL:-1.7,laL:-1.3,uaR:-1.9,laR:-1.45,thL:-.35,shL:.08,thR:.45,shR:.15},
    kneeSlam:{bob:7,lean:-.25,head:.12,uaL:-1.3,laL:-1.05,uaR:-.95,laR:-1.15,thL:.22,shL:.18,thR:-1.38,shR:.45},
    groundSlam:{bob:14,lean:.72,head:-.2,uaL:-1.85,laL:-1.45,uaR:-1.55,laR:-1.35,thL:.5,shL:.35,thR:-.55,shR:-.38},
    dead:{bob:28,lean:-1.48,head:.2,uaL:.4,laL:.2,uaR:-.7,laR:-.5,thL:.65,shL:.35,thR:-.55,shR:-.4}
  };
  function poseMix(a,b,t){const o={};Object.keys(POSES.idle).forEach(k=>o[k]=lerp(a[k],b[k],t));return o}
  function limb(ctx,x,y,len,w,ang,color,outline='#17131f'){
    const x2=x+Math.cos(ang)*len,y2=y+Math.sin(ang)*len;
    ctx.lineCap='round';ctx.lineWidth=w+6;ctx.strokeStyle=outline;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.lineWidth=w;ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();
    return{x:x2,y:y2,a:ang};
  }
  function circle(ctx,x,y,r,fill,stroke='#17131f',lw=4){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}
  function poly(ctx,pts,fill,stroke='#17131f',lw=4){ctx.beginPath();pts.forEach((p,i)=>(i?ctx.lineTo(...p):ctx.moveTo(...p)));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}

  const CROWD_SHOUTS=[
    'HIT HIM WITH THE EXPENSIVE END!','I BET RENT MONEY ON THIS!','DO A FLIP!','THAT LOOKED LEGAL-ISH!','MY THERAPIST WARNED ME ABOUT THIS!','AIM FOR HIS PERSONALITY!','BOO! I HAVE NO IDEA WHY!','SOMEBODY CHECK THE WAIVER!','USE THE CHAIR! IT KNOWS WHAT IT DID!','I CAME FOR THE BUFFET!','THIS IS BETTER THAN COUPLES THERAPY!','PUNCH WITH YOUR FEELINGS!','MY CHILD IS LEARNING SO MUCH!','THAT MAN HAS A FAMILY PROBABLY!','MORE DRAMA! LESS MEDICINE!','THE FLOOR IS UNDEFEATED!','I SAW NOTHING, OFFICER!','MAKE IT WEIRD!','NOT THE FACE! ACTUALLY, THE FACE!','WALK IT OFF, BONE-WISE!','THROW SOMETHING QUESTIONABLE!','THE CROWD DEMANDS POOR JUDGMENT!','WHO TAUGHT YOU PHYSICS?','I LOVE SPORTS NOW!','IS THIS COVERED BY DENTAL?','TEN POINTS FOR EMOTIONAL DAMAGE!','THE REF IS A GARDEN GNOME!','GET UP! I NEED CLOSURE!','THAT WAS ALMOST GRACEFUL!','FIGHT LIKE THE DEPOSIT IS NONREFUNDABLE!','MY HOT DOG HAS SEEN TOO MUCH!','I SUPPORT BOTH BAD DECISIONS!','USE YOUR KNEES RESPONSIBLY!','SOMEBODY SAVE THE FURNITURE!','THIS IS WHY WE CANNOT HAVE BACKYARDS!','I HAVE A COUPON FOR THE ER!','BOOO—WAIT, NICE KICK!','HE BLOCKED IT WITH HIS ENTIRE LIFE!','THE INSURANCE FORM IS ON FIRE!','AGAIN, BUT WITH WORSE CONSEQUENCES!'
  ];

  class Rig{
    constructor(opts){
      Object.assign(this,{x:0,y:0,dir:1,scale:1,build:1,skin:'#d59b72',outfit:'#e6c229',hairColor:'#2a2022',eyeColor:'#382a57',hair:'messy',face:'clean',accessory:'none',head:'round',top:'tee',bottom:'shorts',presentation:'neutral',weapon:WEAPONS[0],state:'idle',stateT:0,fromPose:POSES.idle,pose:POSES.idle,expression:'neutral',blink:0,look:0,detached:{},rag:0,flash:0,smear:0,smearKind:'punch',helmet:false},opts)
    }
    setState(s,d=.35){if(this.state===s)return;this.state=s;this.stateT=0;this.stateDur=d;this.fromPose={...this.pose}}
    update(dt,moving=0){
      this.stateT+=dt;const target=POSES[this.state]||POSES.idle,t=clamp(this.stateT/(this.stateDur||.3),0,1);this.pose=poseMix(this.fromPose,target,1-Math.pow(1-t,3));
      if((this.state==='idle'||this.state==='guard')&&this.stateT>this.stateDur)this.pose.bob+=Math.sin(performance.now()/230)*2;
      if(moving){const cycle=performance.now()/150,s=Math.sin(cycle),c=Math.cos(cycle);this.pose.thL=s*.68;this.pose.thR=-s*.68;this.pose.shL=.08+Math.max(0,-s)*.76;this.pose.shR=-.08-Math.max(0,s)*.76;this.pose.uaL=-s*.4;this.pose.uaR=s*.4;this.pose.laL=-s*.18;this.pose.laR=s*.18;this.pose.lean=s*.035;this.pose.head=-s*.025;this.pose.bob-=Math.abs(c)*5}
      this.blink=Math.random()<dt*.45?1:Math.max(0,this.blink-dt*10);this.flash=Math.max(0,this.flash-dt*5);this.smear=Math.max(0,this.smear-dt*5)
    }
    draw(ctx){
      ctx.save();ctx.translate(this.x,this.y);ctx.globalAlpha=.28;ctx.fillStyle='#120c16';ctx.beginPath();ctx.ellipse(0,3,43*this.scale*this.build,12*this.scale,0,0,TAU);ctx.fill();ctx.restore();ctx.save();ctx.translate(this.x,this.y+this.pose.bob);ctx.scale(this.dir*this.scale,this.scale);const p=this.pose,b=this.build,skin=this.flash>0?'#fff':this.skin;
      const torsoY=-112,hipY=-57,shoulderY=-113,lean=p.lean;
      ctx.rotate(lean);
      // back arm and leg
      const hipR={x:16*b,y:hipY},hipL={x:-16*b,y:hipY},shR={x:22*b,y:shoulderY},shL={x:-22*b,y:shoulderY};
      if(!this.detached.legL){let k=limb(ctx,hipL.x,hipL.y,48,22,p.thL+Math.PI/2,'#4d5268');let f=limb(ctx,k.x,k.y,45,18,p.shL+Math.PI/2,this.skin);this.foot(ctx,f.x,f.y,p.shL*.2)}
      if(!this.detached.armL){let e=limb(ctx,shL.x,shL.y,40,17,p.uaL+Math.PI/2,skin);let h=limb(ctx,e.x,e.y,36,14,p.laL+Math.PI/2,skin);circle(ctx,h.x,h.y,10*b,skin)}
      // torso cutout
      const tw=39*b;poly(ctx,[[-tw,torsoY-4],[tw,torsoY-4],[32*b,hipY],[ -32*b,hipY]],this.outfit);
      if(this.top==='vest'){ctx.strokeStyle='#f5eedc';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-10,torsoY);ctx.lineTo(-4,hipY);ctx.moveTo(10,torsoY);ctx.lineTo(4,hipY);ctx.stroke()}
      if(this.top==='jacket'){ctx.strokeStyle='#17131f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,torsoY-4);ctx.lineTo(0,hipY);ctx.stroke()}
      if(this.top==='tank'){ctx.strokeStyle=this.skin;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-24*b,torsoY-2);ctx.lineTo(-13,torsoY+18);ctx.moveTo(24*b,torsoY-2);ctx.lineTo(13,torsoY+18);ctx.stroke()}
      if(this.top==='hoodie'){ctx.strokeStyle='#17131f';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,torsoY-3,22,0,Math.PI);ctx.moveTo(-5,torsoY+27);ctx.lineTo(0,torsoY+38);ctx.lineTo(5,torsoY+27);ctx.stroke()}
      poly(ctx,[[-34*b,hipY],[34*b,hipY],[29*b,-38],[-28*b,-38]],this.bottom==='skirt'?this.outfit:'#41475c');
      if(this.bottom==='cargo'){ctxRoundRect(ctx,-27*b,hipY+5,18,19,3,'#596078');ctxRoundRect(ctx,9*b,hipY+5,18,19,3,'#596078')}
      if(this.bottom==='leggings'){ctx.fillStyle=this.outfit;ctx.globalAlpha=.35;ctx.fillRect(-28*b,hipY+3,56*b,14);ctx.globalAlpha=1}
      // front leg, then front arm with weapon attachment
      if(!this.detached.legR){let k=limb(ctx,hipR.x,hipR.y,48,23,p.thR+Math.PI/2,'#353a4d');let f=limb(ctx,k.x,k.y,45,19,p.shR+Math.PI/2,skin);this.foot(ctx,f.x,f.y,p.shR*.2)}
      if(!this.detached.armR){let e=limb(ctx,shR.x,shR.y,40,18,p.uaR+Math.PI/2,skin);let h=limb(ctx,e.x,e.y,36,15,p.laR+Math.PI/2,skin);circle(ctx,h.x,h.y,11*b,skin);this.drawWeapon(ctx,h.x,h.y,p.laR+Math.PI*1.5)}
      if(!this.detached.head)this.drawHead(ctx,0,torsoY-45+p.head*8,skin,p.head);if(this.smear>0)this.drawSmear(ctx);
      ctx.restore();
    }
    foot(ctx,x,y,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);poly(ctx,[[-8,-7],[17,-7],[22,5],[-9,7]],'#252432');ctx.restore()}
    drawSmear(ctx){ctx.save();ctx.globalAlpha=this.smear*.72;ctx.strokeStyle='#fff4c2';ctx.lineCap='round';const head=this.smearKind.includes('Head'),kick=this.smearKind.includes('kick'),base=kick?(head?-118:-68):(head?-153:-108);for(let i=0;i<4;i++){ctx.lineWidth=8-i;ctx.beginPath();ctx.moveTo(15,base+i*7);ctx.lineTo(112+i*8,base-8+i*4);ctx.stroke()}ctx.restore()}
    drawHead(ctx,x,y,skin,tilt){
      ctx.save();ctx.translate(x,y);ctx.rotate(tilt);let rx=this.head==='long'?31:this.head==='wide'?43:36*this.build,ry=this.head==='long'?43:this.head==='square'?34:this.head==='wide'?32:37;
      if(this.head==='square')poly(ctx,[[-rx,-ry*.8],[rx,-ry],[rx*.9,ry],[-rx,ry]],skin);else if(this.head==='pointy')poly(ctx,[[-34,-29],[30,-34],[38,12],[0,43],[-37,13]],skin);else{ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.fillStyle=skin;ctx.fill();ctx.lineWidth=5;ctx.strokeStyle='#17131f';ctx.stroke()}
      this.drawHair(ctx,rx,ry);
      if(this.helmet){ctx.beginPath();ctx.arc(0,-3,rx+5,Math.PI,TAU);ctx.fillStyle='#879097';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#17131f';ctx.stroke()}
      const pain=this.expression==='pain'||this.expression==='dead', fear=this.expression==='fear', angry=this.expression==='angry', smug=this.expression==='smug';
      const eyeY=-4,open=this.blink?.8:(pain?5:fear?15:10);[-13,13].forEach((ex,i)=>{ctx.save();ctx.translate(ex,eyeY);ctx.rotate(angry?(i?-.25:.25):pain?(i?.38:-.38):0);ctx.beginPath();ctx.ellipse(0,0,8,open,0,0,TAU);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#17131f';ctx.stroke();if(open>6){circle(ctx,clamp(this.look,-1,1)*2,1,4,this.eyeColor,'#17131f',1);circle(ctx,clamp(this.look,-1,1)*2,1,2,'#17131f','#17131f',1)}ctx.restore()});
      ctx.strokeStyle='#17131f';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-21,-19+(angry?6:0));ctx.lineTo(-6,-21-(angry?3:0));ctx.moveTo(6,-21-(angry?3:0));ctx.lineTo(21,-19+(angry?6:0));ctx.stroke();
      ctx.beginPath();if(pain){ctx.moveTo(-11,19);ctx.quadraticCurveTo(0,6,11,19)}else if(fear){ctx.ellipse(0,18,6,10,0,0,TAU)}else if(angry||smug){ctx.moveTo(-12,15);ctx.quadraticCurveTo(0,27,13,12)}else{ctx.moveTo(-9,18);ctx.lineTo(9,18)}ctx.stroke();
      if(this.face==='stubble'){ctx.fillStyle='#49383a';for(let i=0;i<12;i++)circle(ctx,-18+(i%6)*7,20+Math.floor(i/6)*7,1.1,'#49383a','#49383a',0)}else if(this.face==='mustache'){poly(ctx,[[-1,14],[-20,10],[-13,22],[0,17],[13,22],[20,10],[1,14]],this.hairColor,'#17131f',2)}else if(this.face==='beard'){poly(ctx,[[-24,15],[-18,35],[0,47],[19,34],[24,14],[10,24],[0,20],[-10,24]],this.hairColor,'#17131f',3)}else if(this.face==='scar'){ctx.strokeStyle='#9b3d4b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(15,-13);ctx.lineTo(8,3);ctx.lineTo(17,15);ctx.stroke()}
      if(this.accessory==='glasses'){ctx.strokeStyle='#17131f';ctx.lineWidth=4;ctx.beginPath();ctx.arc(-13,-4,12,0,TAU);ctx.arc(13,-4,12,0,TAU);ctx.moveTo(-1,-4);ctx.lineTo(1,-4);ctx.stroke()}else if(this.accessory==='eyepatch'){ctx.fillStyle='#17131f';ctx.beginPath();ctx.ellipse(13,-4,11,9,0,0,TAU);ctx.fill();ctx.strokeStyle='#17131f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-26,-18);ctx.lineTo(27,-2);ctx.stroke()}else if(this.accessory==='headband'){ctx.strokeStyle='#e95b78';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-rx,-22);ctx.lineTo(rx,-22);ctx.stroke()}
      ctx.restore();
    }
    drawHair(ctx,rx,ry){if(this.hair==='bald')return;ctx.fillStyle=this.hairColor;ctx.strokeStyle='#17131f';ctx.lineWidth=4;ctx.beginPath();if(this.hair==='mohawk'){ctx.moveTo(-14,-ry+4);ctx.lineTo(-10,-ry-24);ctx.lineTo(0,-ry-8);ctx.lineTo(10,-ry-27);ctx.lineTo(16,-ry+4)}else if(this.hair==='slick'){ctx.moveTo(-rx+4,-ry+12);ctx.quadraticCurveTo(5,-ry-19,rx,-ry+10);ctx.lineTo(rx-2,-ry+21);ctx.quadraticCurveTo(0,-ry+5,-rx,-ry+20)}else if(this.hair==='curly'){for(let i=-2;i<=2;i++)ctx.arc(i*12,-ry-2-Math.abs(i)*2,13,0,TAU)}else if(this.hair==='ponytail'){ctx.arc(0,-ry+4,rx*.9,Math.PI,TAU);ctx.arc(rx+12,-ry+5,15,0,TAU)}else if(this.hair==='spikes'){ctx.moveTo(-rx+2,-ry+15);for(let i=0;i<8;i++){const px=-rx+i*rx/3.5;ctx.lineTo(px,-ry-(i%2?25:8))}ctx.lineTo(rx,-ry+15)}else{ctx.moveTo(-rx+3,-ry+16);for(let i=0;i<7;i++){const px=-rx+i*rx/3;ctx.lineTo(px,-ry-(i%2?12:2))}ctx.lineTo(rx-2,-ry+18)}ctx.closePath();ctx.fill();ctx.stroke()}
    drawWeapon(ctx,x,y,a){
      const w=this.weapon;if(!w||w.kind==='fist')return;const n=w.name,L=clamp(w.range*.7,54,91),shaft=(top=-L,color='#8f6037',width=6)=>{ctx.strokeStyle='#17131f';ctx.lineWidth=width+6;ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(0,top);ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()};ctx.save();ctx.translate(x,y-6);ctx.rotate(a-Math.PI*1.25);ctx.lineCap='round';ctx.lineJoin='round';
      if(n.includes('Frying Pan')){shaft(-L+16,'#626975',7);ctx.beginPath();ctx.ellipse(0,-L,22,17,0,0,TAU);ctx.fillStyle='#7d8691';ctx.fill();ctx.lineWidth=5;ctx.strokeStyle='#17131f';ctx.stroke();circle(ctx,-6,-L-4,3,'#cbd0d4','#cbd0d4',0)}
      else if(n.includes('Bottle')){poly(ctx,[[-9,4],[9,4],[10,-32],[5,-42],[4,-L],[-4,-L],[-5,-42],[-10,-32]],'#55a983');ctx.globalAlpha=.45;ctx.fillStyle='#d9fff0';ctx.fillRect(-4,-34,5,26);ctx.globalAlpha=1}
      else if(n.includes('Chair')){shaft(-L+8,'#9b6238',6);ctx.strokeStyle='#17131f';ctx.lineWidth=9;ctx.strokeRect(-22,-L,44,28);ctx.strokeStyle='#b87842';ctx.lineWidth=5;ctx.strokeRect(-22,-L,44,28);ctx.beginPath();ctx.moveTo(-18,-L+28);ctx.lineTo(-27,-L+50);ctx.moveTo(18,-L+28);ctx.lineTo(27,-L+50);ctx.stroke()}
      else if(n.includes('Cleaver')){shaft(-32,'#71452f',7);poly(ctx,[[-8,-29],[27,-36],[28,-L],[-4,-L]],'#c4cbd0');circle(ctx,18,-L+9,3,'#697078','#697078',0)}
      else if(n.includes('Axe')){shaft();poly(ctx,[[-5,-L+12],[-34,-L+4],[-31,-L-22],[0,-L-13],[28,-L-19],[31,-L+5]],'#b7c1c5')}
      else if(n.includes('Hammer')){shaft();ctxRoundRect(ctx,-26,-L-17,52,25,5,'#75818a');ctx.fillStyle='#cbd2d6';ctx.fillRect(-18,-L-12,36,5)}
      else if(n.includes('Chainsaw')){shaft(-28,'#68452f',6);ctxRoundRect(ctx,-17,-67,34,42,7,'#d46b35');poly(ctx,[[-10,-65],[10,-65],[8,-L],[-8,-L]],'#cbd0d4');ctx.strokeStyle='#17131f';ctx.lineWidth=3;for(let y2=-L;y2<-66;y2+=9){ctx.beginPath();ctx.moveTo(-10,y2);ctx.lineTo(-15,y2+4);ctx.moveTo(10,y2);ctx.lineTo(15,y2+4);ctx.stroke()}}
      else if(n.includes('Keyboard')){shaft(-30,'#5f4735',5);ctxRoundRect(ctx,-28,-L,56,30,4,'#a9adb1');ctx.fillStyle='#454b52';for(let yy=-L+6;yy<-L+25;yy+=8)for(let xx=-22;xx<23;xx+=9)ctx.fillRect(xx,yy,6,5)}
      else if(n.includes('Stapler')){shaft(-29,'#594131',5);poly(ctx,[[-25,-L+6],[23,-L],[27,-L+15],[-22,-L+20]],'#66717a');ctx.strokeStyle='#e4e7e8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-17,-L+13);ctx.lineTo(18,-L+8);ctx.stroke()}
      else if(n.includes('Plunger')){shaft();ctx.fillStyle='#b33b3b';ctx.strokeStyle='#17131f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-25,-L);ctx.quadraticCurveTo(0,-L-30,25,-L);ctx.lineTo(18,-L+9);ctx.lineTo(-18,-L+9);ctx.closePath();ctx.fill();ctx.stroke()}
      else if(n.includes('Tuna')||n.includes('Chicken')){shaft(-30,'#72523b',5);ctx.save();ctx.translate(0,-L+8);ctx.rotate(Math.PI/2);ctx.beginPath();ctx.ellipse(0,0,28,13,0,0,TAU);ctx.fillStyle=n.includes('Tuna')?'#65a7b8':'#f1d246';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#17131f';ctx.stroke();poly(ctx,[[-25,0],[-40,-13],[-39,13]],ctx.fillStyle);circle(ctx,17,-3,3,'white');ctx.restore()}
      else if(n.includes('Sock')){shaft(-30,'#5f4735',5);ctx.strokeStyle='#17131f';ctx.lineWidth=20;ctx.beginPath();ctx.moveTo(0,-30);ctx.quadraticCurveTo(-16,-55,4,-L);ctx.stroke();ctx.strokeStyle='#8575a8';ctx.lineWidth=13;ctx.stroke();circle(ctx,3,-L,12,'#69606f')}
      else if(n.includes('Cactus')){shaft(-31,'#76513b',5);ctx.strokeStyle='#17131f';ctx.lineWidth=17;ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(0,-L);ctx.moveTo(0,-L+24);ctx.lineTo(-17,-L+16);ctx.moveTo(0,-L+38);ctx.lineTo(17,-L+29);ctx.stroke();ctx.strokeStyle='#4b9d5e';ctx.lineWidth=10;ctx.stroke()}
      else if(n.includes('Pizza Cutter')){shaft(-L+18,'#7a4e35',7);circle(ctx,0,-L,20,'#c4c9cc');circle(ctx,0,-L,5,'#697178')}
      else if(n.includes('Nunchucks')){shaft(-39,'#b85a47',10);ctx.strokeStyle='#d9c48b';ctx.lineWidth=3;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(0,-39);ctx.quadraticCurveTo(22,-56,5,-70);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#17131f';ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(5,-70);ctx.lineTo(12,-L);ctx.stroke();ctx.strokeStyle='#b85a47';ctx.lineWidth=10;ctx.stroke()}
      else if(n.includes('Trophy')){shaft(-35,'#7d5533',5);ctx.fillStyle='#d7ae3d';ctx.strokeStyle='#17131f';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-L+8,20,0,Math.PI);ctx.lineTo(13,-L+30);ctx.lineTo(-13,-L+30);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeRect(-20,-L+31,40,10)}
      else if(n.includes('Extinguisher')){shaft(-30,'#5a4435',5);ctxRoundRect(ctx,-16,-L,32,54,10,'#d94a43');ctx.strokeStyle='#17131f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-L);ctx.lineTo(17,-L-13);ctx.lineTo(29,-L-8);ctx.stroke()}
      else if(n.includes('Parking Meter')){shaft();ctxRoundRect(ctx,-20,-L-26,40,43,12,'#63747c');circle(ctx,0,-L-9,12,'#a8d2d8');ctx.fillStyle='#17131f';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('EXPIRED',0,-L+11)}
      else if(n.includes('Briefcase')){shaft(-31,'#5b3b2b',6);ctxRoundRect(ctx,-31,-L,62,42,5,'#6e4930');ctxRoundRect(ctx,-13,-L-10,26,13,4,'#9a6a42');ctx.fillStyle='#d7ae3d';ctx.fillRect(-5,-L+17,10,8)}
      else if(n.includes('Selfie Stick')){shaft(-L,'#64747e',4);ctx.save();ctx.translate(0,-L-12);ctx.rotate(-.18);ctxRoundRect(ctx,-17,-25,34,50,5,'#63a9bd');ctx.fillStyle='#17131f';ctx.fillRect(-12,-18,24,32);circle(ctx,10,-20,3,'#d7eef2');ctx.restore()}
      else if(n.includes('Leaf Blower')){shaft(-43,'#59604d',8);ctxRoundRect(ctx,-23,-L+4,46,38,13,'#e1833e');poly(ctx,[[17,-L+13],[48,-L+5],[48,-L+28],[17,-L+27]],'#737d7f');circle(ctx,-11,-L+23,8,'#3e474a')}
      else if(n.includes('Traffic Cone')){shaft(-40,'#ef7f3b',9);ctx.strokeStyle='#d9c48b';ctx.lineWidth=4;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(0,-40);ctx.quadraticCurveTo(23,-57,5,-72);ctx.stroke();ctx.setLineDash([]);poly(ctx,[[-7,-70],[18,-75],[25,-L],[-18,-L]],'#ef7f3b');ctx.strokeStyle='#f5eedc';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-12,-L+18);ctx.lineTo(22,-L+14);ctx.stroke()}
      else if(n.includes('Toilet Brush')){shaft(-L+20,'#d7ae3d',7);ctx.strokeStyle='#17131f';ctx.lineWidth=24;ctx.beginPath();ctx.moveTo(0,-L+20);ctx.lineTo(0,-L-14);ctx.stroke();ctx.strokeStyle='#f3d13b';ctx.lineWidth=17;ctx.stroke();for(let i=-18;i<=18;i+=9){ctx.strokeStyle='#d7ae3d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-L);ctx.lineTo(i,-L-22+Math.abs(i)*.25);ctx.stroke()}}
      else if(n.includes('Microwave')){shaft(-28,'#54453b',7);ctxRoundRect(ctx,-34,-L,68,50,6,'#8c9399');ctx.fillStyle='#252a2d';ctx.fillRect(-27,-L+8,42,29);circle(ctx,25,-L+13,4,'#f3d13b');circle(ctx,25,-L+27,4,'#5cd6b3')}
      else if(n.includes('Bat')){shaft(-L,'#8f5f32',12);ctx.strokeStyle='#d7a25d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-L+8);ctx.lineTo(0,-L+34);ctx.stroke()}
      else if(n.includes('Rolling Pin')){shaft(-L+9,'#9b663c',8);ctx.strokeStyle='#17131f';ctx.lineWidth=20;ctx.beginPath();ctx.moveTo(0,-L+9);ctx.lineTo(0,-L+39);ctx.stroke();ctx.strokeStyle='#c88a4b';ctx.lineWidth=14;ctx.stroke()}
      else if(n.includes('Pool Cue')){shaft(-L,'#b98a55',5);ctx.strokeStyle='#f1e4c8';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-L);ctx.lineTo(0,-L+15);ctx.stroke()}
      else if(n.includes('Umbrella')){shaft();ctx.fillStyle='#714d8c';ctx.strokeStyle='#17131f';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-L,28,Math.PI,TAU);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(8,9,11,0,Math.PI);ctx.stroke()}
      else if(n.includes('Mop')){shaft();ctx.strokeStyle='#dce9e7';ctx.lineWidth=5;for(let i=-18;i<=18;i+=6){ctx.beginPath();ctx.moveTo(0,-L+4);ctx.lineTo(i,-L-25+Math.abs(i)*.25);ctx.stroke()}}
      else if(n.includes('Rake')){shaft();ctx.strokeStyle='#87938b';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-27,-L);ctx.lineTo(27,-L);ctx.stroke();for(let i=-24;i<=24;i+=8){ctx.beginPath();ctx.moveTo(i,-L);ctx.lineTo(i,-L-18);ctx.stroke()}}
      else if(n.includes('Shovel')){shaft();poly(ctx,[[-17,-L+4],[17,-L+4],[25,-L-20],[0,-L-35],[-25,-L-20]],'#8b969b')}
      else if(n.includes('Spear')){shaft();poly(ctx,[[-7,-L],[7,-L],[0,-L-34]],'#d4b76f')}
      else if(n.includes('Nine-Iron')){shaft();ctx.strokeStyle='#abb4b9';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(0,-L);ctx.lineTo(22,-L-10);ctx.stroke()}
      else{shaft();if(w.kind==='blade')poly(ctx,[[-8,-L+8],[8,-L+8],[5,-L-28],[0,-L-39],[-5,-L-28]],w.color);else{ctxRoundRect(ctx,-12,-L-18,24,34,8,w.color);ctx.strokeStyle='#f1d27a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-7,-L-9);ctx.lineTo(7,-L-9);ctx.stroke()}}
      ctx.restore()
    }
  }

  class Particle{
    constructor(x,y,color,kind='dot'){Object.assign(this,{x,y,color,kind,vx:rnd(-240,240),vy:rnd(-310,-70),r:rnd(4,10),life:rnd(.7,1.5),rot:rnd(0,TAU),vr:rnd(-6,6)})}
    update(dt,floor){this.vy+=700*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;this.rot+=this.vr*dt;if(this.y>floor){this.y=floor;this.vy*=-.25;this.vx*=.7}this.life-=dt}
    draw(c){c.save();c.globalAlpha=clamp(this.life,0,1);c.translate(this.x,this.y);c.rotate(this.rot);if(this.kind==='limb'){c.fillStyle=this.color;c.strokeStyle='#17131f';c.lineWidth=4;c.fillRect(-22,-9,44,18);c.strokeRect(-22,-9,44,18);circle(c,22,0,9,this.color)}else if(this.kind==='head'){circle(c,0,0,27,this.color);circle(c,-9,-4,6,'white');circle(c,9,-4,6,'white');circle(c,-8,-3,2,'#17131f','#17131f',1);circle(c,8,-3,2,'#17131f','#17131f',1);c.strokeStyle='#17131f';c.lineWidth=3;c.beginPath();c.ellipse(0,13,6,8,0,0,TAU);c.stroke();poly(c,[[-27,-16],[-18,-35],[-7,-25],[2,-39],[11,-25],[23,-34],[28,-13]],'#282027')}else{circle(c,0,0,this.r,this.color,'#7d1731',2)}c.restore()}
  }

  class ImpactText{
    constructor(x,y,text,color='#f3d13b',size=34){Object.assign(this,{x,y,text,color,size,life:1,vy:-52,rot:rnd(-.16,.16)})}
    update(dt){this.y+=this.vy*dt;this.vy*=.96;this.life-=dt*1.15}
    draw(c){c.save();c.globalAlpha=clamp(this.life,0,1);c.translate(this.x,this.y);c.rotate(this.rot);c.textAlign='center';c.font=`${this.size}px Impact, sans-serif`;c.lineJoin='round';c.lineWidth=8;c.strokeStyle='#17131f';c.strokeText(this.text,0,0);c.fillStyle=this.color;c.fillText(this.text,0,0);c.restore()}
  }

  class Confetti{
    constructor(x,y){Object.assign(this,{x,y,vx:rnd(-330,330),vy:rnd(-520,-170),life:rnd(1.3,2.4),rot:rnd(0,TAU),vr:rnd(-12,12),size:rnd(6,13),color:pick(['#f3d13b','#ef476f','#5cd6b3','#73c7ff','#f68f3c','#ffffff'])})}
    update(dt,floor){this.vy+=620*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;this.rot+=this.vr*dt;if(this.y>floor){this.y=floor;this.vy*=-.3;this.vx*=.72}this.life-=dt}
    draw(c){c.save();c.globalAlpha=clamp(this.life,0,1);c.translate(this.x,this.y);c.rotate(this.rot);c.fillStyle=this.color;c.fillRect(-this.size/2,-this.size/3,this.size,this.size*.66);c.restore()}
  }

  class CrowdProjectile{
    constructor(sx,sy,target,kind,onHit){Object.assign(this,{sx,sy,x:sx,y:sy,target,kind,onHit,t:0,dur:rnd(.55,.82),dead:false,rot:0})}
    update(dt){if(this.dead)return;this.t+=dt/this.dur;const p=clamp(this.t,0,1),tx=this.target.rig.x,ty=this.target.rig.y-115;this.x=lerp(this.sx,tx,p);this.y=lerp(this.sy,ty,p)-Math.sin(p*Math.PI)*rnd(65,115);this.rot+=dt*12;if(p>=1){this.dead=true;this.onHit(this.target)}}
    draw(c){c.save();c.translate(this.x,this.y);c.rotate(this.rot);if(this.kind==='tomato'){circle(c,0,0,10,'#e44343','#641d28',3);c.strokeStyle='#3f7c3a';c.lineWidth=3;c.beginPath();c.moveTo(0,-8);c.lineTo(5,-14);c.stroke()}else{poly(c,[[-9,-7],[4,-11],[11,-2],[7,10],[-8,8]],'#aeb1b5','#34323a',3)}c.restore()}
  }

  class WeaponProjectile{
    constructor(owner,target,weapon,onHit){Object.assign(this,{owner,target,weapon,onHit,x:owner.rig.x,y:owner.rig.y-118,t:0,dur:.48,dead:false,rot:0,sx:owner.rig.x,sy:owner.rig.y-118})}
    update(dt){if(this.dead)return;this.t+=dt/this.dur;const p=clamp(this.t,0,1);this.x=lerp(this.sx,this.target.rig.x,p);this.y=lerp(this.sy,this.target.rig.y-110,p)-Math.sin(p*Math.PI)*42;this.rot+=dt*18;if(p>=1){this.dead=true;this.onHit(this.target,this.owner,this.weapon)}}
    draw(c){c.save();c.translate(this.x,this.y);c.rotate(this.rot);c.lineCap='round';c.strokeStyle='#17131f';c.lineWidth=10;c.beginPath();c.moveTo(-28,0);c.lineTo(25,0);c.stroke();c.strokeStyle='#8a603a';c.lineWidth=5;c.stroke();if(this.weapon.kind==='blunt'||this.weapon.kind==='heavy')circle(c,28,0,this.weapon.kind==='heavy'?16:11,this.weapon.color);else poly(c,[[18,-8],[48,-4],[60,0],[48,4],[18,8]],this.weapon.color);c.restore()}
  }

  class ArenaObject{
    constructor(x,kind){this.x=x;this.y=0;this.kind=kind;this.broken=false;this.vx=0;this.rot=0;this.active=true;this.names={plasticChair:'PLASTIC CHAIR',bbq:'BARBECUE',trampoline:'TRAMPOLINE',kiddiePool:'KIDDIE POOL',gnome:'GARDEN GNOME',clothesline:'CLOTHESLINE',cubicle:'CUBICLE PANEL',photocopier:'PHOTOCOPIER',waterCooler:'WATER COOLER',rollingChair:'ROLLING CHAIR',poster:'MOTIVATIONAL POSTER',foodTray:'FOOD TRAY',buffetTable:'BUFFET TABLE',highChair:'HIGH CHAIR',sneezeGuard:'SNEEZE GUARD',dinerTable:'DINER TABLE',cake:'WEDDING CAKE',giftTable:'GIFT TABLE',djBooth:'DJ BOOTH',weddingChair:'FOLDING CHAIR',champagne:'CHAMPAGNE BOTTLE',bouncyCastle:'BOUNCY CASTLE',pinata:'PIÑATA',balloons:'BALLOON BUNCH',clownBox:'CLOWN PROPS',partyTable:'PARTY TABLE'};this.w=52}
    draw(c,floor){
      if(!this.active)return;const k=this.kind;c.save();c.translate(this.x,floor-4);c.rotate(this.rot);c.lineWidth=4;c.strokeStyle='#17131f';
      if(k.includes('Chair')){c.strokeStyle='#17131f';c.lineWidth=9;c.beginPath();c.moveTo(-18,0);c.lineTo(-14,-49);c.lineTo(17,-49);c.lineTo(20,0);c.moveTo(-14,-47);c.lineTo(-20,-89);c.stroke();c.strokeStyle=k==='rollingChair'?'#596078':k==='weddingChair'?'#f0e9da':'#e57d58';c.lineWidth=5;c.stroke();if(k==='rollingChair'){c.beginPath();c.moveTo(2,-5);c.lineTo(2,10);c.moveTo(-20,10);c.lineTo(23,10);c.stroke();circle(c,-20,13,5,'#333');circle(c,23,13,5,'#333')}}
      else if(k==='bbq'){ctxRoundRect(c,-32,-58,64,48,9,'#343841');c.strokeStyle='#17131f';c.lineWidth=6;c.beginPath();c.moveTo(-22,-10);c.lineTo(-27,4);c.moveTo(22,-10);c.lineTo(27,4);c.stroke();poly(c,[[-38,-58],[38,-58],[29,-76],[-29,-76]],'#d65246');circle(c,18,-66,3,'#f3d13b')}
      else if(k==='trampoline'){c.strokeStyle='#17131f';c.lineWidth=8;c.beginPath();c.ellipse(0,-35,48,13,0,0,TAU);c.moveTo(-37,-28);c.lineTo(-43,2);c.moveTo(37,-28);c.lineTo(43,2);c.stroke();c.strokeStyle='#4f8fb5';c.lineWidth=4;c.beginPath();c.ellipse(0,-35,42,9,0,0,TAU);c.stroke()}
      else if(k==='kiddiePool'){ctxRoundRect(c,-50,-27,100,27,12,'#55b6d1');c.strokeStyle='#f4dd5a';c.lineWidth=6;c.beginPath();c.moveTo(-45,-17);c.lineTo(45,-17);c.stroke()}
      else if(k==='gnome'){poly(c,[[-17,-35],[0,-70],[18,-35]],'#dc4054');circle(c,0,-30,15,'#f1c6a5');poly(c,[[-19,-15],[19,-15],[14,0],[-14,0]],'#4b77a8');poly(c,[[-11,-24],[0,-5],[11,-24]],'#f5eedc')}
      else if(k==='clothesline'){c.strokeStyle='#7c5538';c.lineWidth=7;c.beginPath();c.moveTo(-45,0);c.lineTo(-45,-100);c.moveTo(45,0);c.lineTo(45,-100);c.stroke();c.strokeStyle='#ddd';c.lineWidth=3;c.beginPath();c.moveTo(-45,-92);c.lineTo(45,-84);c.stroke();poly(c,[[-28,-90],[-7,-88],[-10,-55],[-31,-58]],'#e95b78');poly(c,[[8,-86],[30,-84],[27,-53],[5,-56]],'#5e8de6')}
      else if(k==='cubicle'){ctxRoundRect(c,-47,-82,94,82,3,'#7d8990');c.strokeStyle='#aeb9be';c.lineWidth=5;c.beginPath();c.moveTo(-40,-63);c.lineTo(40,-63);c.stroke()}
      else if(k==='photocopier'){ctxRoundRect(c,-34,-75,68,75,6,'#dadfe1');ctxRoundRect(c,-28,-86,56,22,3,'#89949a');c.fillStyle='#31363a';c.fillRect(-18,-55,36,18);circle(c,22,-48,4,'#5cd6b3')}
      else if(k==='waterCooler'){ctxRoundRect(c,-22,-50,44,50,5,'#d8dde0');ctxRoundRect(c,-17,-91,34,43,14,'#82d1e0');c.strokeStyle='#dc4054';c.lineWidth=4;c.beginPath();c.moveTo(-8,-42);c.lineTo(-8,-28);c.stroke();c.strokeStyle='#5e8de6';c.beginPath();c.moveTo(8,-42);c.lineTo(8,-28);c.stroke()}
      else if(k==='poster'){ctxRoundRect(c,-37,-78,74,78,2,'#f5eedc');c.fillStyle='#17131f';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText('HANG',0,-53);c.fillText('IN THERE',0,-38);c.fillText('OR ELSE',0,-23)}
      else if(k==='foodTray'){ctxRoundRect(c,-43,-22,86,22,4,'#c4c9cc');circle(c,-20,-18,12,'#bf6b3d');circle(c,8,-18,12,'#d9b54a');circle(c,29,-18,9,'#6a9c58')}
      else if(k==='buffetTable'||k==='dinerTable'||k==='giftTable'||k==='partyTable'){ctxRoundRect(c,-52,-50,104,18,3,k==='giftTable'?'#f2d3df':k==='partyTable'?'#f3d13b':'#8d5c3d');c.strokeStyle='#17131f';c.lineWidth=7;c.beginPath();c.moveTo(-43,-32);c.lineTo(-47,0);c.moveTo(43,-32);c.lineTo(47,0);c.stroke();if(k==='giftTable'){ctxRoundRect(c,-20,-79,38,29,2,'#5cd6b3');c.strokeStyle='#f05d8b';c.lineWidth=5;c.beginPath();c.moveTo(-1,-79);c.lineTo(-1,-50);c.stroke()}}
      else if(k==='highChair'){ctxRoundRect(c,-24,-64,48,24,5,'#d6a95d');c.strokeStyle='#17131f';c.lineWidth=7;c.beginPath();c.moveTo(-17,-40);c.lineTo(-25,0);c.moveTo(17,-40);c.lineTo(25,0);c.moveTo(-23,-61);c.lineTo(-28,-96);c.stroke()}
      else if(k==='sneezeGuard'){c.strokeStyle='#17131f';c.lineWidth=7;c.beginPath();c.moveTo(-45,0);c.lineTo(-45,-75);c.lineTo(45,-75);c.lineTo(45,0);c.stroke();c.fillStyle='#bde8ef55';c.fillRect(-41,-70,82,45);c.strokeStyle='#bde8ef';c.lineWidth=3;c.strokeRect(-41,-70,82,45)}
      else if(k==='cake'){for(let i=0;i<3;i++)ctxRoundRect(c,-38+i*9,-22-i*25,76-i*18,23,5,i%2?'#f7cbd7':'#fff1e5');circle(c,0,-88,8,'#e95b78')}
      else if(k==='djBooth'){ctxRoundRect(c,-53,-62,106,62,4,'#33263f');circle(c,-25,-32,20,'#17131f');circle(c,25,-32,20,'#17131f');circle(c,-25,-32,7,'#9d6bd8');circle(c,25,-32,7,'#5cd6b3')}
      else if(k==='champagne'){poly(c,[[-10,0],[10,0],[8,-50],[4,-63],[3,-82],[-3,-82],[-4,-63],[-8,-50]],'#4c9b67');c.fillStyle='#f1d27a';c.fillRect(-8,-45,16,17)}
      else if(k==='bouncyCastle'){ctxRoundRect(c,-58,-65,116,65,12,'#9d6bd8');ctxRoundRect(c,-49,-91,25,36,4,'#f05d8b');ctxRoundRect(c,24,-91,25,36,4,'#5e8de6');c.fillStyle='#17131f';c.fillRect(-16,-38,32,38)}
      else if(k==='pinata'){c.strokeStyle='#ddd';c.lineWidth=3;c.beginPath();c.moveTo(0,-118);c.lineTo(0,-78);c.stroke();poly(c,[[-34,-66],[-12,-82],[19,-77],[35,-57],[12,-38],[-20,-42]],'#f05d8b');poly(c,[[29,-60],[49,-71],[38,-47]],'#f3d13b');c.strokeStyle='#5cd6b3';c.lineWidth=5;for(let y=-70;y<-40;y+=10){c.beginPath();c.moveTo(-25,y);c.lineTo(28,y+4);c.stroke()}}
      else if(k==='balloons'){['#f05d8b','#5cd6b3','#f3d13b','#5e8de6'].forEach((col,i)=>{circle(c,-24+i*16,-62-Math.abs(1.5-i)*10,14,col);c.strokeStyle='#ddd';c.lineWidth=2;c.beginPath();c.moveTo(-24+i*16,-48);c.lineTo(0,0);c.stroke()})}
      else if(k==='clownBox'){ctxRoundRect(c,-38,-45,76,45,4,'#f3d13b');circle(c,0,-67,24,'#f1c6a5');circle(c,-18,-72,12,'#5e8de6');circle(c,18,-72,12,'#f05d8b');circle(c,0,-64,7,'#dc4054')}
      c.restore()
    }
  }
  function ctxRoundRect(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();c.lineWidth=4;c.strokeStyle='#17131f';c.stroke()}

  class Game{
    constructor(config){
      this.c=$('#arena');this.ctx=this.c.getContext('2d',{alpha:false,desynchronized:true});this.gameScreen=$('#game');this.bgCache=document.createElement('canvas');this.bgCtx=this.bgCache.getContext('2d',{alpha:false});this.bgKey='';this.qualityMode='PERFORMANCE';this.renderScale=.55;this.fps=60;this.perfFrames=0;this.perfSince=performance.now();this.fastWindows=0;this.floor=520;this.round=1;this.wins=0;this.time=0;this.running=false;this.aftermath=false;this.pendingFinish=false;this.slowmo=1;this.banterCool=8;this.crowdShoutCool=rnd(3.5,6);this.crowdShouts=[];this.lastCrowdShout='';this.triviaUsed=false;this.triviaClock=null;this.last=performance.now();this.particles=[];this.projectiles=[];this.fxText=[];this.confetti=[];this.objects=[];this.spectators=[];this.collateral=0;this.property=0;this.abilities=[];this.abilityRanks={};this.events=[];this.dialogueBags={};this.lastDialogue={};this.sound=true;this.shake=0;this.hitStop=0;this.combo=0;this.comboTimer=0;
      const base={...config,x:270,y:this.floor,dir:1,scale:config.height/100,weapon:WEAPONS[0]};
      this.player=this.fighter(base,true);this.player.name=config.name||'Unnamed Liability';this.spawnRound();this.bind();requestAnimationFrame(t=>this.loop(t));
    }
    fighter(rig,player=false){return{rig:new Rig(rig),name:'',hp:100,maxHp:100,power:1,speed:1,armor:0,luck:player?12:6,dodge:.04,helmet:false,weapon:rig.weapon||WEAPONS[0],cool:0,state:'approach',stateT:0,stun:0,down:0,dead:false,blocking:false,motion:null,popularity:0,player,personality:player?'OPPORTUNIST':pick(TRAITS),lastLaugh:false,firstAttack:true,openingAcrobat:false}}
    rollOpponent(){
      const tier=Math.floor((this.round-1)/5),featured=this.round%5===0,hpScale=[1,1.06,1.12,1.2,1.3][tier],powerScale=[1,1.04,1.08,1.13,1.18][tier],speedScale=[1,1.02,1.04,1.07,1.1][tier],weaponCap=[17,19,21,24,31][tier],weapon=pick(WEAPONS.filter(w=>w.damage<=weaponCap)),looks={x:1110,y:this.floor,dir:-1,scale:rnd(.9,1.1),build:rnd(.78,1.28),skin:pick(SKINS),outfit:pick(COLORS),hairColor:pick(['#2a2022','#6b3c26','#d7b65a','#9b3d65','#324b75']),eyeColor:pick(['#382a57','#3d6d64','#6b4226','#346d9b']),face:pick(['clean','clean','stubble','mustache','beard','scar']),accessory:pick(['none','none','glasses','eyepatch','headband']),hair:pick(['messy','mohawk','slick','curly','ponytail','spikes','bald']),head:pick(['round','square','long','wide','pointy']),top:pick(['tee','vest','jacket','tank','hoodie']),bottom:pick(['shorts','pants','skirt','cargo','leggings']),weapon};
      return{name:pick(NAMES),personality:pick(TRAITS),weapon,looks,tier,featured,stats:{maxHp:Math.round(rnd(92,109)*hpScale*(featured?1.08:1)),power:rnd(.88,1.05)*powerScale*(featured?1.06:1),speed:rnd(.9,1.07)*speedScale,luck:rnd(4,11)+tier*2,armor:rnd(0,.055)+tier*.015,dodge:rnd(.025,.07)+tier*.009}}
    }
    spawnRound(){
      this.running=false;this.aftermath=false;this.pendingFinish=false;this.slowmo=1;this.projectiles=[];if((this.round-1)%5===0)this.triviaUsed=false;this.scene=SCENES[Math.floor((this.round-1)/5)];const sceneObjects=[...this.scene.objects].sort(()=>Math.random()-.5);this.objects=[new ArenaObject(470,sceneObjects[0]),new ArenaObject(730,sceneObjects[1]),new ArenaObject(950,sceneObjects[2])];
      this.crowdShouts=[];this.crowdShoutCool=rnd(2.2,3.6);this.spectators=Array.from({length:11},(_,i)=>({x:80+i*112+rnd(-18,18),y:275+rnd(-12,15),scale:rnd(.78,1.08),build:rnd(.78,1.22),skin:pick(SKINS),shirt:pick(COLORS),pants:pick(['#25344b','#51384f','#6c4937','#2f5853','#6d6f75','#9b5b34']),shoes:pick(['#17131f','#f5eedc','#dc4054','#5e8de6']),hair:pick(['messy','mohawk','slick','curly','ponytail','spikes','bald']),hairColor:pick(['#241b1c','#6b3c26','#d7b65a','#9b3d65','#324b75','#d7d1c4']),accessory:pick(['none','none','none','glasses','headband','hat']),pattern:pick(['plain','plain','stripe','badge']),phase:rnd(0,TAU),fear:0,down:0,hitT:0,vx:0,spin:0,rot:0}));
      const profile=this.nextOpponent||this.rollOpponent(),{weapon,looks,stats}=profile;this.nextOpponent=null;
      this.enemy=this.fighter(looks);this.enemy.name=profile.name;this.enemy.personality=profile.personality;this.enemy.ai=profile.tier;this.enemy.featured=profile.featured;this.player.hp=this.player.maxHp;this.enemy.maxHp=this.enemy.hp=stats.maxHp;this.enemy.power=stats.power;this.enemy.speed=stats.speed;this.enemy.luck=stats.luck;this.enemy.armor=stats.armor;this.enemy.dodge=stats.dodge;this.player.dead=false;this.player.secondWindUsed=false;this.player.plotArmorUsed=false;this.player.popularity=0;this.enemy.popularity=0;this.player.grappled=this.enemy.grappled=false;this.player.flight=this.enemy.flight=null;this.player.firstAttack=this.enemy.firstAttack=true;this.player.openingAcrobat=chance(.28);this.enemy.openingAcrobat=chance(.28);this.player.rig.detached={};this.player.rig.x=170;this.enemy.rig.x=1110;this.player.rig.y=this.floor;this.enemy.rig.y=this.floor;this.player.rig.dir=1;this.enemy.rig.dir=-1;this.player.rig.weapon=this.player.weapon;this.enemy.rig.weapon=weapon;
      const freshMap=(this.round-1)%5===0;this.banterCool=rnd(8,13);this.updateHud();this.roundPips();this.card(`LEVEL ${this.round}${profile.featured?'<br>FEATURED FIGHT':''}<small>${this.scene.icon} ${this.scene.name}<br>${this.enemy.name} • ${weapon.name}${freshMap?'<br>TRIVIA SAVE REFRESHED':''}</small>`,1700,()=>{this.running=true;this.say(`${this.scene.subtitle}. The waiver remains decorative.`);setTimeout(()=>{if(this.running&&!this.crowdShouts.length)this.spawnCrowdShout()},2100);if(chance(.45)){const speaker=chance(.5)?this.player:this.enemy;this.thought(speaker,this.line('intro'),1500)}});
    }
    bind(){
      $('#mute').onclick=()=>{this.sound=!this.sound;$('#mute').textContent='SOUND: '+(this.sound?'ON':'OFF')};
      $('#quality').onclick=()=>{const modes=['AUTO','NATIVE','PERFORMANCE'];this.qualityMode=modes[(modes.indexOf(this.qualityMode)+1)%modes.length];this.renderScale=1;this.fastWindows=0;this.perfFrames=0;this.perfSince=performance.now();this.updateQualityLabel()};this.updateQualityLabel()
    }
    updateQualityLabel(){$('#quality').textContent=`QUALITY: ${this.qualityMode} • ${this.fps} FPS`}
    canvasScale(){
      if(this.qualityMode==='NATIVE')return 1;if(this.qualityMode==='PERFORMANCE')return .42;
      const state=canvasState(this.c),dpr=Math.min(3,Math.max(1,window.devicePixelRatio||1)),nativePixels=Math.max(1,state.cssW*state.cssH*dpr*dpr),pixelCap=Math.min(1,Math.sqrt(4000000/nativePixels));return Math.min(pixelCap,this.renderScale)
    }
    monitorPerformance(t){
      this.perfFrames++;const elapsed=t-this.perfSince;if(elapsed<1500)return;this.fps=Math.round(this.perfFrames*1000/elapsed);
      if(this.qualityMode==='AUTO'){
        if(this.fps<53){this.renderScale=Math.max(.5,this.renderScale-.1);this.fastWindows=0}
        else if(this.fps>=59){this.fastWindows++;if(this.fastWindows>=3){this.renderScale=Math.min(1,this.renderScale+.05);this.fastWindows=0}}
        else this.fastWindows=0
      }
      this.perfFrames=0;this.perfSince=t;this.updateQualityLabel()
    }
    unlock(name){if(!this.abilities.includes(name)){this.abilities.push(name);this.abilityRanks[name]=1;this.announce('HIDDEN ABILITY<br>'+name,1300)}}
    upgradeAbility(name){if(!this.abilities.includes(name)||this.abilityRanks[name]>=2)return;this.abilityRanks[name]=2;this.player.power*=1.08;this.player.speed*=1.04;this.player.maxHp+=6;this.player.hp+=6;this.announce(`${name}<br>MASTERY II`,1300)}
    roundPips(){$('#roundPips').innerHTML=`<b>LEVEL ${this.round} / ${MAX_LEVEL}</b><span>${Array.from({length:MAX_LEVEL},(_,i)=>`<i class="${i<this.wins?'done':i===this.round-1?'current':''}"></i>`).join('')}</span>`}
    card(html,ms,done){const e=$('#fightCard');e.innerHTML=html;e.classList.remove('hidden');setTimeout(()=>{e.classList.add('hidden');done&&done()},ms)}
    announce(html,ms=850){const e=$('#announcement');clearTimeout(e.hideTimer);e.innerHTML=html;e.classList.remove('hidden');e.hideTimer=setTimeout(()=>e.classList.add('hidden'),ms)}
    say(s){$('#tickerText').textContent=s}
    line(category){
      const source=DIALOGUE[category]||['...'];let bag=this.dialogueBags[category];if(!bag||!bag.length){bag=[...source];for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}if(bag.length>1&&bag[bag.length-1]===this.lastDialogue[category])[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];this.dialogueBags[category]=bag}const text=bag.pop();this.lastDialogue[category]=text;return text
    }
    thought(f,s,ms=1500,type=''){
      const e=$(f===this.player?'#thoughtPlayer':'#thoughtEnemy');e.textContent=s;e.classList.remove('dodge-pop','block-pop');if(type)e.classList.add(type);e.classList.remove('hidden');clearTimeout(e.hideTimer);this.layoutThoughts();e.hideTimer=setTimeout(()=>{e.classList.add('hidden');this.layoutThoughts()},ms)
    }
    layoutThoughts(){
      const p=$('#thoughtPlayer'),e=$('#thoughtEnemy'),pv=!p.classList.contains('hidden'),ev=!e.classList.contains('hidden');if(!pv&&!ev)return;const px=clamp(this.player.rig.x/12.8,6,76),ex=clamp(this.enemy.rig.x/12.8,6,76);
      if(pv){p.style.left=px+'%';p.style.top='42%'}if(ev){e.style.left=ex+'%';e.style.top='42%'}
      if(pv&&ev&&Math.abs(px-ex)<27){p.style.left=clamp(px-11,4,55)+'%';p.style.top='34%';e.style.left=clamp(ex+7,44,78)+'%';e.style.top='53%'}
    }
    loop(t){const raw=Math.min(.034,(t-this.last)/1000);this.last=t;const visible=this.gameScreen.classList.contains('active');if(visible){this.time+=raw;const dt=raw*this.slowmo;if(this.hitStop>0)this.hitStop-=raw;else if(this.running||this.aftermath)this.update(dt);this.draw();this.uiFrame=(this.uiFrame||0)+1;if(this.uiFrame%3===0)this.layoutThoughts();this.monitorPerformance(t)}else{this.perfFrames=0;this.perfSince=t}requestAnimationFrame(x=>this.loop(x))}
    update(dt){
      if(this.running){this.updateFighter(this.player,this.enemy,dt);this.updateFighter(this.enemy,this.player,dt);this.enforceSpacing();this.banterCool-=dt;if(this.banterCool<=0)this.banter()}else{this.player.rig.update(dt);this.enemy.rig.update(dt)}
      this.updateSpectators(dt);this.particles.forEach(p=>p.update(dt,this.floor));this.particles=this.particles.filter(p=>p.life>0);this.projectiles.forEach(p=>p.update(dt));this.projectiles=this.projectiles.filter(p=>!p.dead);this.fxText.forEach(p=>p.update(dt));this.fxText=this.fxText.filter(p=>p.life>0);this.confetti.forEach(p=>p.update(dt,this.floor));this.confetti=this.confetti.filter(p=>p.life>0);this.shake=Math.max(0,this.shake-dt*32);this.comboTimer-=dt;if(this.comboTimer<=0&&this.combo){this.combo=0;$('#comboPop').classList.add('hidden')}
      if((this.player.dead||this.enemy.dead)&&!this.pendingFinish){this.pendingFinish=true;this.running=false;this.aftermath=true;this.slowmo=.22;setTimeout(()=>{this.slowmo=1;this.aftermath=false;this.finishFight()},4000)}
    }
    enforceSpacing(){
      const a=this.player,b=this.enemy;if(a.dead||b.dead||a.grappled||b.grappled||a.flight||b.flight)return;const gap=Math.abs(b.rig.x-a.rig.x),minimum=122;if(gap>=minimum)return;const dir=b.rig.x>=a.rig.x?1:-1,push=(minimum-gap)/2;a.rig.x=clamp(a.rig.x-dir*push,120,1160);b.rig.x=clamp(b.rig.x+dir*push,120,1160)
    }
    updateSpectators(dt){
      this.spectators.forEach(s=>{if(!s.down)return;s.hitT=Math.min(1,s.hitT+dt*1.3);s.x=clamp(s.x+s.vx*dt,35,1245);s.vx*=Math.pow(.09,dt);s.rot=lerp(0,s.spin,1-Math.pow(1-s.hitT,3))});
      this.crowdShouts.forEach(s=>s.life-=dt);this.crowdShouts=this.crowdShouts.filter(s=>s.life>0&&s.person&&!s.person.down);
      if(this.running&&!this.crowdShouts.length){this.crowdShoutCool-=dt;if(this.crowdShoutCool<=0){this.spawnCrowdShout();this.crowdShoutCool=rnd(5.5,10)}}
    }
    spawnCrowdShout(preferred){
      const available=this.spectators.filter(s=>!s.down&&(!preferred||Math.abs(s.x-preferred)<260));if(!available.length)return;const person=pick(available);let text=pick(CROWD_SHOUTS);if(CROWD_SHOUTS.length>1&&text===this.lastCrowdShout)text=CROWD_SHOUTS[(CROWD_SHOUTS.indexOf(text)+1+Math.floor(rnd(0,CROWD_SHOUTS.length-1)))%CROWD_SHOUTS.length];this.lastCrowdShout=text;this.crowdShoutCool=rnd(5.5,10);this.crowdShouts=[{person,text,life:2.6,maxLife:2.6}]
    }
    engageDistance(f){return Math.max(122,Math.min(154,72+f.weapon.range*.55))}
    banter(){
      const busy=!$('#thoughtPlayer').classList.contains('hidden')||!$('#thoughtEnemy').classList.contains('hidden');if(busy){this.banterCool=rnd(3,5);return}this.banterCool=rnd(9,16);const f=chance(.5)?this.player:this.enemy,o=f===this.player?this.enemy:this.player,low=f.hp/f.maxHp<.3,winning=f.hp/f.maxHp>o.hp/o.maxHp+.25;
      this.thought(f,this.line(low?'low':winning?'winning':'neutral'),1550);if(chance(.22))setTimeout(()=>{if(this.running&&!o.dead&&$('#thoughtEnemy').classList.contains('hidden')!==$('#thoughtPlayer').classList.contains('hidden'))this.thought(o,this.line('response'),1450)},800)
    }
    updateFighter(f,o,dt){
      if(f.dead){f.rig.update(dt);return}f.cool-=dt;f.stun-=dt;f.stateT+=dt;
      if(f.flight){const m=f.flight;m.t+=dt;const p=clamp(m.t/m.dur,0,1),ease=1-Math.pow(1-p,2);f.rig.x=lerp(m.sx,m.ex,ease);f.rig.y=lerp(m.sy,m.ey,p)-Math.sin(p*Math.PI)*m.arc;f.rig.setState('fall',.1);f.rig.update(dt);if(p>=1){f.flight=null;f.rig.y=this.floor;f.down=Math.max(f.down,.85);m.onLand&&m.onLand()}return}
      if(f.grappled){f.rig.update(dt);return}
      if(f.motion){f.motion.t+=dt;const p=clamp(f.motion.t/f.motion.dur,0,1),ease=.5-Math.cos(p*Math.PI)/2;f.rig.x=lerp(f.motion.start,f.motion.end,ease);f.rig.update(dt);if(p>=1){f.motion=null;f.stun=.08}return}
      if(f.down>0){f.down-=dt;if(f.down<=0){f.rig.setState('getup',.45);f.rig.expression='angry';f.stun=.55}else f.rig.update(dt);return}
      if(f.stun>0){f.rig.update(dt);return}
      const dist=Math.abs(o.rig.x-f.rig.x),dir=Math.sign(o.rig.x-f.rig.x)||1;f.rig.dir=dir;
      const berserk=this.abilities.includes('BERSERKER')&&f.player&&f.hp/f.maxHp<.25;if(berserk&&!f.berserk){f.berserk=true;this.announce('BERSERKER!',700);f.rig.expression='angry'}
      const moveSpeed=(dist>360?178:108)*f.speed*(berserk?1.45:1);let walking=false;
      if(dist>this.engageDistance(f)){
        if(f.cool<=0&&f.weapon.kind!=='fist'&&!(f.player&&this.abilities.includes('WEAPON LOYALTY'))&&dist<410&&chance(dt*.14))this.throwWeapon(f,o);
        else if(dist<330&&chance(dt*.24))this.stunt(f,dir,pick(f.personality==='COWARDLY'?['backstep','backstep','jump']:['jump','dive','backstep']));
        else if(chance(dt*(.18+(f.ai||0)*.04))&&f.personality==='CHAOTIC')this.useEnvironment(f,o);
        else{f.rig.x+=dir*moveSpeed*dt;f.rig.setState('idle',.2);f.state='approach';walking=true}
      }else if(f.cool<=0){
        if(chance(o.dodge+(o.personality==='COWARDLY'?.08:0))){this.evade(o,-dir);f.rig.setState(f.weapon.kind==='fist'?'punchImpact':'strike',.12);f.cool=.55/(f.speed*(f.weapon.speed||1));this.say(`${o.name} compressed, slipped back, and avoided responsibility.`);this.sfx(220,.05)}
        else if(chance(.13+(o.personality==='TACTICAL'?.14:0)+(o.ai||0)*.015)){o.blocking=true;o.rig.setState('guard',.18);o.rig.expression='angry';o.stun=.25;this.thought(o,this.line('block'),1300,'block-pop');this.attack(f,o,true)}
        else this.attack(f,o,false)
      }else if(chance(dt*.12))this.stunt(f,dir,'backstep');
      else{f.rig.setState(f.personality==='TACTICAL'?'guard':'idle',.2)}
      f.rig.x=clamp(f.rig.x,120,1160);f.rig.update(dt,walking?dir:0)
    }
    stunt(f,dir,type){const distance=type==='dive'?135:type==='jump'?95:-78;f.motion={t:0,dur:type==='dive'?.46:type==='jump'?.52:.3,start:f.rig.x,end:clamp(f.rig.x+dir*distance,120,1160)};f.rig.setState(type,.12);f.rig.expression=type==='backstep'?'fear':'angry';this.say(`${f.name} attempts a ${type.toUpperCase()} because walking was too sensible.`)}
    evade(f,away){f.rig.setState('dodgeAnticipate',.07);f.rig.expression='fear';f.stun=.42;this.thought(f,this.line('dodge'),1300,'dodge-pop');setTimeout(()=>{if(f.dead)return;f.motion={t:0,dur:.27,start:f.rig.x,end:clamp(f.rig.x+away*82,120,1160)};f.rig.setState('dodge',.08);f.rig.smear=.65;f.rig.smearKind='punch'},65)}
    useEnvironment(f,o){const obj=this.objects.filter(x=>x.active).sort((a,b)=>Math.abs(a.x-f.rig.x)-Math.abs(b.x-f.rig.x))[0];if(!obj)return;this.thought(f,pick(['CHAIR.','I HAVE A PLAN.','PROPERTY DAMAGE.']));obj.active=false;f.weapon={...pick(WEAPONS.slice(1,4)),name:obj.names[obj.kind]||'Arena Debris'};f.rig.weapon=f.weapon;f.cool=.5;this.property+=125;this.say(`${f.name} has discovered interior decorating.`)}
    attack(f,o,blocked){
      const heavy=f.weapon.kind==='heavy',stab=f.weapon.kind==='pole'||f.weapon.kind==='blade',unarmed=f.weapon.kind==='fist',kick=unarmed&&chance(.38),zone=unarmed?pick(['head','body','body']):pick(['head','body','body','limb']);f.lastTargetZone=zone;
      const connect=(mult=1,kbBoost=1)=>{if(!this.running||f.dead||o.dead)return;let dmg=f.weapon.damage*f.power*rnd(.82,1.18)*mult,critChance=(f.luck||0)/170,abilityKb=1;if(f.player&&this.abilities.includes('BAR FIGHTER')&&['CHAIR','BOTTLE'].some(x=>f.weapon.name.includes(x)))dmg*=1.4;if(f.player&&this.abilities.includes('PUNCHING UP')&&o.hp/o.maxHp>f.hp/f.maxHp)dmg*=1.2;if(f.player&&this.abilities.includes('HEAVY METAL')&&f.weapon.kind==='heavy'){dmg*=1.24;abilityKb=1.28}if(f.player&&this.abilities.includes('BLADE PARADE')&&['blade','pole'].includes(f.weapon.kind)){dmg*=1.18;critChance+=.08}if(f.player&&this.abilities.includes('COMBO MEAL'))dmg*=1+Math.min(5,this.combo)*.05;if(blocked)dmg*=o.player&&this.abilities.includes('HUMAN SHIELD')?.16:.3;dmg*=1-clamp(o.armor,0,.65);const crit=chance(critChance);if(crit)dmg*=1.65;this.hit(o,dmg,f.weapon.kb*kbBoost*abilityKb*(crit?1.5:1),f,crit,blocked)};
      f.rig.expression='angry';
      const openingAcrobat=f.firstAttack&&f.openingAcrobat;f.firstAttack=false;if(openingAcrobat&&!blocked){this.acrobaticAttack(f,o,connect,true);return}
      if(!blocked&&!o.grappled&&!f.grappled&&chance(.075+(f.personality==='CHAOTIC'?.035:0)+(f.ai||0)*.012+(f.player&&this.abilities.includes('GRAPPLE GOBLIN')?.09:0))){this.wrestlingAttack(f,o);return}
      if(unarmed&&chance(f.player&&(this.abilities.includes('SPRING-LOADED KNEES')||this.abilities.includes('ACROBAT TAX CREDIT'))?.42:.2)){this.acrobaticAttack(f,o,connect);return}
      if(kick){
        f.cool=1.38/(f.speed*(f.weapon.speed||1));f.rig.setState('kickLoad',.2);this.say(`${f.name} drops their weight, coils the knee, and loads a kick.`);
        setTimeout(()=>{if(f.dead)return;f.rig.setState(zone==='head'?'kickHead':'kickBody',.12);f.rig.smear=1;f.rig.smearKind=zone==='head'?'kickHead':'kickBody'},260);
        setTimeout(connect,335);setTimeout(()=>{if(!f.dead)f.rig.setState('kickRecover',.22)},455);setTimeout(()=>{if(!f.dead)f.rig.setState('guard',.24)},720)
      }else if(unarmed){
        f.cool=1.08/(f.speed*(f.weapon.speed||1));f.rig.setState('punchLoad',.16);this.say(`${f.name} pulls the fist back and commits to the paperwork.`);
        setTimeout(()=>{if(f.dead)return;f.rig.setState(zone==='head'?'punchHead':'punchBody',.095);f.rig.smear=1;f.rig.smearKind=zone==='head'?'punchHead':'punchBody'},190);
        setTimeout(connect,245);setTimeout(()=>{if(!f.dead)f.rig.setState('punchRecover',.18)},335);setTimeout(()=>{if(!f.dead)f.rig.setState('guard',.21)},545)
      }else{
        f.rig.setState('windup',heavy?.34:.2);f.cool=(heavy?1.48:1.06)/(f.speed*(f.weapon.speed||1));const impact=zone==='head'?'weaponHead':zone==='limb'?'weaponLimb':'weaponBody',delay=heavy?390:225;
        setTimeout(()=>{if(f.dead)return;f.rig.setState(impact,.12);f.rig.smear=.72;f.rig.smearKind=zone==='head'?'punchHead':'punchBody'},delay);setTimeout(connect,delay+75);setTimeout(()=>{if(!f.dead)f.rig.setState('guard',.25)},delay+300)
      }
    }
    wrestlingAttack(f,o){
      const finish=pick(['throw','knee','slam']),dir=f.rig.dir,finishName=finish==='throw'?'HUMAN JAVELIN':finish==='knee'?'KNEE DELIVERY':'GROUND EXPRESS',grappleBoost=f.player&&this.abilities.includes('GRAPPLE GOBLIN')?1.35:1,restoreWeapon=()=>f.rig.weapon=f.weapon;f.rig.weapon=WEAPONS[0];f.cool=2.8/(f.speed*(f.weapon.speed||1));f.stun=2.15;o.stun=2.3;o.grappled=true;o.motion=null;o.flight=null;f.rig.setState('grapple',.18);o.rig.setState('grabbed',.18);o.rig.expression='fear';this.thought(f,this.line('grapple'),1500);this.thought(o,this.line('grabbed'),1500);this.say(`${f.name} grabs ${o.name}. The arena has misplaced the rulebook.`);
      setTimeout(()=>{if(!this.running||f.dead||o.dead)return;o.rig.x=f.rig.x+dir*24;o.rig.y=this.floor-118;o.rig.dir=-dir;f.rig.setState('lift',.2);o.rig.setState('carry',.18);this.announce(finishName,650)},300);
      if(finish==='throw')setTimeout(()=>{if(!this.running||f.dead||o.dead)return;o.grappled=false;f.rig.setState('throwRelease',.12);o.flight={t:0,dur:.72,sx:o.rig.x,sy:o.rig.y,ex:clamp(o.rig.x+dir*rnd(330,470),120,1160),ey:this.floor,arc:rnd(90,150),onLand:()=>{restoreWeapon();if(this.running&&!f.dead&&!o.dead){f.lastTargetZone='body';this.hit(o,16*grappleBoost*f.power*rnd(.9,1.15),31,f,chance((f.luck||0)/180),false);f.stun=0}}};this.say(`${o.name} has been upgraded to airborne luggage.`)},760);
      else if(finish==='knee')setTimeout(()=>{if(!this.running||f.dead||o.dead)return;f.rig.setState('kneeSlam',.12);o.rig.y=this.floor-70;o.rig.setState('hit',.1);this.say(`${f.name} introduces ${o.name} to the emergency knee.`);setTimeout(()=>{restoreWeapon();if(this.running&&!f.dead&&!o.dead){o.grappled=false;o.rig.y=this.floor;f.lastTargetZone='body';this.hit(o,18*grappleBoost*f.power*rnd(.9,1.15),23,f,chance((f.luck||0)/175),false);f.stun=0}},260)},760);
      else setTimeout(()=>{if(!this.running||f.dead||o.dead)return;f.rig.setState('groundSlam',.16);o.rig.y=this.floor-155;o.rig.setState('carry',.1);this.say(`${f.name} selects the floor as ${o.name}'s destination.`);setTimeout(()=>{restoreWeapon();if(this.running&&!f.dead&&!o.dead){o.grappled=false;o.rig.y=this.floor;f.lastTargetZone='body';this.shake=15;this.hit(o,21*grappleBoost*f.power*rnd(.9,1.15),28,f,chance((f.luck||0)/165),false);f.stun=0}},310)},760)
    }
    acrobaticAttack(f,o,connect,opening=false){
      const move=opening?pick([{name:'FLYING SIDE KICK',load:'flyingKneeLoad',impact:'kickBody',zone:'body',travel:112},{name:'DOUBLE-FOOT DROPKICK',load:'dropkickLoad',impact:'dropkickImpact',zone:'body',travel:96},{name:'FLYING KNEE',load:'flyingKneeLoad',impact:'flyingKneeImpact',zone:'body',travel:90}]):pick([{name:'FLYING KNEE',load:'flyingKneeLoad',impact:'flyingKneeImpact',zone:'body',travel:76},{name:'FLYING SIDE KICK',load:'flyingKneeLoad',impact:'kickBody',zone:'body',travel:102},{name:'SPINNING HEEL KICK',load:'spinLoad',impact:'spinKick',zone:'head',travel:48},{name:'CARTWHEEL KICK',load:'cartwheelLoad',impact:'cartwheelKick',zone:'head',travel:92},{name:'SUPERMAN PUNCH',load:'supermanLoad',impact:'supermanImpact',zone:'head',travel:105},{name:'DOUBLE-FOOT DROPKICK',load:'dropkickLoad',impact:'dropkickImpact',zone:'body',travel:88}]);
      f.lastTargetZone=move.zone;const acrobatCredit=f.player&&this.abilities.includes('ACROBAT TAX CREDIT');f.cool=1.82/(f.speed*(f.weapon.speed||1))*(acrobatCredit?.78:1);f.rig.setState(move.load,.24);this.thought(f,move.name+'!');this.say(`${f.name} begins a medically inadvisable ${move.name.toLowerCase()}.`);
      setTimeout(()=>{if(f.dead)return;f.motion={t:0,dur:.46,start:f.rig.x,end:clamp(f.rig.x+f.rig.dir*move.travel,120,1160)};f.rig.setState(move.impact,.14);f.rig.smear=1;f.rig.smearKind=move.zone==='head'?'kickHead':'kickBody'},310);
      let boost=f.player&&this.abilities.includes('SPRING-LOADED KNEES')?1.7:1.35;if(acrobatCredit)boost*=1.18;setTimeout(()=>connect(boost,3.6),405);setTimeout(()=>{if(!f.dead)f.rig.setState('getup',.28)},650);setTimeout(()=>{if(!f.dead)f.rig.setState('guard',.28)},940)
    }
    throwWeapon(f,o){const thrown=f.weapon;f.weapon=WEAPONS[0];f.rig.weapon=f.weapon;f.cool=1.45/(f.speed*(thrown.speed||1));f.rig.setState('windup',.2);this.thought(f,'CATCH.');this.say(`${f.name} throws ${thrown.name}. Returning it was not discussed.`);setTimeout(()=>{if(f.dead)return;f.rig.setState('strike',.13);f.rig.smear=.8;f.rig.smearKind='punch';this.projectiles.push(new WeaponProjectile(f,o,thrown,(target,owner,weapon)=>{if(!this.running||target.dead)return;const crit=chance((owner.luck||0)/145),throwBoost=owner.player&&this.abilities.includes('THROWING ARM')?1.45:1;this.hit(target,weapon.damage*owner.power*(crit?1.5:.9)*throwBoost,weapon.kb*1.25,owner,crit,false);if(owner.player&&this.abilities.includes('WEAPON BOOMERANG')&&chance(.7)&&!owner.dead){owner.weapon=weapon;owner.rig.weapon=weapon;this.thought(owner,'IT CAME BACK.');this.updateHud()}}))},230)}
    hit(v,dmg,kb,attacker,crit,blocked){
      const plotSave=v.player&&this.abilities.includes('PLOT ARMOR')&&!v.plotArmorUsed&&v.hp-dmg<=0;if(plotSave){v.plotArmorUsed=true;v.hp=1;this.announce('PLOT ARMOR!<br>CONTINUITY SAVED',900)}else v.hp=Math.max(0,v.hp-dmg);
      if(attacker.player&&this.abilities.includes('VAMPIRIC PAPER CUT')&&!blocked)attacker.hp=Math.min(attacker.maxHp,attacker.hp+dmg*.12);
      if(v.player&&this.abilities.includes('SECOND WIND')&&!v.secondWindUsed&&v.hp>0&&v.hp/v.maxHp<.25){v.secondWindUsed=true;v.hp=Math.min(v.maxHp,v.hp+v.maxHp*.22);this.announce('SECOND WIND!',750)}
      v.rig.flash=1;v.rig.expression=v.hp/v.maxHp<.27?'fear':'pain';v.rig.setState(blocked?'guard':'hit',.15);v.rig.x+=attacker.rig.dir*kb*1.7;v.stun=blocked?.28:.35;this.burst(v.rig.x,v.rig.y-110,blocked?'#f3d13b':'#dc4054',crit?14:7);this.impact(v.rig.x,v.rig.y-(attacker.lastTargetZone==='head'?180:112),dmg,crit,blocked,attacker);this.sfx(crit?90:125,crit?.18:.08);this.updateHud();
      this.changePopularity(attacker,v,blocked?5:crit?25:16);
      if(blocked){this.say(`${v.name} blocked the attack aimed at the ${attacker.lastTargetZone||'body'}.`);if(v.player&&this.abilities.includes('COUNTERPUNCH')&&chance(.35))setTimeout(()=>{if(this.running&&!v.dead&&!attacker.dead)this.attack(v,attacker,false)},230)}else if(crit){this.announce('LUCKY HIT!',520);this.say(`${attacker.name} connects cleanly with the ${attacker.lastTargetZone||'body'}. Probability files an appeal.`);this.thought(v,this.line('crit'),1350)}else{this.say(pick([`${attacker.name} connects with ${v.name}'s ${attacker.lastTargetZone||'body'}.`,`That ${attacker.lastTargetZone||'body'} hit looked medically expensive.`,`Clear contact with the ${attacker.lastTargetZone||'body'}. Consent was not.`]));if(chance(.2)&&$('#thoughtPlayer').classList.contains('hidden')&&$('#thoughtEnemy').classList.contains('hidden'))this.thought(v,this.line('hit'),1000)}
      if(v.hp<=0){this.kill(v,attacker,dmg,crit)}else if(kb>19||dmg>22){v.down=v.player&&this.abilities.includes('ADRENALINE REFUND')?.48:.75;v.rig.setState('fall',.22);v.stun=.8;this.checkCollateral(v)}
      else if(v.player&&this.abilities.includes('LAST LAUGH')&&!v.lastLaugh&&v.hp/v.maxHp<.18){v.lastLaugh=true;this.announce('LAST LAUGH!',700);setTimeout(()=>this.attack(v,attacker,false),160)}
    }
    impact(x,y,dmg,crit,blocked,attacker){
      const words=blocked?['CLANG!','NOPE!','DENIED!']:crit?['KRA-KOOM!','YIKES!','CRUNCH!']:['BAM!','THWACK!','BONK!','POW!'];this.fxText.push(new ImpactText(x+rnd(-18,18),y,pick(words),blocked?'#73c7ff':crit?'#ff4e77':'#f3d13b',crit?48:34));if(!blocked)this.fxText.push(new ImpactText(x+rnd(-20,20),y+34,'-'+Math.max(1,Math.round(dmg)),'#ffffff',20));
      this.shake=Math.max(this.shake,blocked?3:crit?14:7);this.hitStop=crit?.075:blocked?.025:.045;const flash=$('#impactFlash');flash.classList.remove('bang');void flash.offsetWidth;flash.classList.add('bang');
      if(attacker.player&&!blocked){this.combo++;this.comboTimer=2.2;if(this.combo>=2)this.showCombo()}else if(!attacker.player&&!blocked){this.combo=0;$('#comboPop').classList.add('hidden')}
    }
    showCombo(){const e=$('#comboPop'),labels=['BAD DECISIONS','MEDICAL BILLS','QUESTIONABLE HITS','CHAOS COMBO','HR VIOLATIONS'];e.innerHTML=`<b>${this.combo}×</b><span>${pick(labels)}</span>`;e.classList.remove('hidden');e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}
    changePopularity(attacker,victim,amount){
      if(attacker.player&&amount>0&&this.abilities.includes('CROWD FAVORITE'))amount*=1.4;attacker.popularity=clamp(attacker.popularity+amount,-100,100);victim.popularity=clamp(victim.popularity-amount*.55,-100,100);this.updatePopularity(attacker);this.updatePopularity(victim);this.checkPopularity(attacker);this.checkPopularity(victim)
    }
    checkPopularity(f){if(Math.abs(f.popularity)<100)return;const positive=f.popularity>0,target=positive?(f===this.player?this.enemy:this.player):f;f.popularity=0;this.updatePopularity(f);this.crowdBarrage(target,positive)}
    updatePopularity(f){const id=f===this.player?'player':'enemy',fill=$('#'+id+'Popularity'),label=$('#'+id+'PopularityLabel'),v=f.popularity;fill.style.width=(Math.abs(v)/2)+'%';fill.style.left=(v<0?(50-Math.abs(v)/2):50)+'%';fill.style.background=v<0?'#f05d8b':'#5cd6b3';label.textContent=v>55?'LOVED':v>15?'CHEERS':v<-55?'HATED':v<-15?'BOOED':'UNDECIDED'}
    crowdBarrage(target,positive){
      this.announce(positive?'CROWD FAVOR!<br>TOMATO TIME':'CROWD REVOLT!<br>TRASH THE PLAYER',1250);this.say(positive?'Popularity weaponized. The opponent is being composted.':'The audience has reviewed your performance. It was negative.');
      if(positive&&target===this.enemy&&this.abilities.includes('CROWD SURFING')){this.player.hp=Math.min(this.player.maxHp,this.player.hp+10);this.updateHud()}
      this.spectators.filter(s=>!s.down).slice(0,9).forEach((s,i)=>setTimeout(()=>{if(target.dead)return;this.projectiles.push(new CrowdProjectile(s.x,s.y+30,target,chance(.62)?'tomato':'trash',t=>this.crowdHit(t)))},i*75))
    }
    crowdHit(target){if(target.dead)return;const crowdDamage=target===this.enemy&&this.abilities.includes('AUDIENCE PLANT')?4:2;target.hp=Math.max(1,target.hp-crowdDamage);target.stun=Math.max(target.stun,.6);target.rig.setState('hit',.12);target.rig.expression='pain';this.burst(target.rig.x,target.rig.y-110,'#e44343',3);this.updateHud();this.sfx(165,.04)}
    kill(v,killer,dmg,crit){
      v.dead=true;this.shake=18;this.hitStop=.11;this.fxText.push(new ImpactText(v.rig.x,v.rig.y-210,'FINAL!',killer.player?'#f3d13b':'#ff4e77',58));if(killer.player)this.celebrate(killer.rig.x);const finisher=crit||killer.weapon.kind==='heavy'||chance(.18+(killer.luck||0)/190);if(finisher){const options=killer.weapon.kind==='heavy'?['SPLIT DECISION','OVERKILL','FLYING FINISH']:killer.weapon.kind==='blade'||killer.weapon.kind==='pole'?['CLEAN CUT','DISARMED','SPLIT DECISION']:['HEAVY IMPACT','FLYING FINISH'];const name=pick(options);this.announce(`SLOW-MO FINISHER<br>${name}`,3900);this.detach(v,name);this.say(`Arena ruling: ${name.toLowerCase()} was “probably necessary.”`)}else{this.announce('FINAL BLOW<br>SLOW MOTION',3900);v.rig.setState('dead',.35);v.rig.expression='dead';this.say(`${v.name} has fallen down and left the payroll.`)}v.rig.rag=1;this.sfx(55,.28)
    }
    detach(v,name){const parts=name==='OVERKILL'?['head','armL','armR','legL']:name==='SPLIT DECISION'?['armL','legR','head']:name==='CLEAN CUT'?['head']:name==='DISARMED'?['armR']:[];parts.forEach((p,i)=>{v.rig.detached[p]=true;const part=new Particle(v.rig.x+rnd(-15,15),v.rig.y-150+i*28,v.rig.skin,p==='head'?'head':'limb');part.vx+=(v.rig.dir*-1)*rnd(p==='head'?210:120,p==='head'?360:260);part.vy-=p==='head'?170:0;part.life=p==='head'?2.4:part.life;this.particles.push(part)});v.rig.setState('dead',.28);v.rig.expression='dead';this.property+=parts.length*250;this.checkCollateral(v,true)}
    checkCollateral(v,force=false){const near=this.spectators.filter(s=>Math.abs(s.x-v.rig.x)<135&&!s.down);if(near.length&&(force||chance(.48))){const s=pick(near),away=Math.sign(s.x-v.rig.x)||pick([-1,1]);s.down=1;s.hitT=.001;s.vx=away*rnd(105,185);s.spin=away*rnd(1.05,1.55);s.rot=0;this.collateral++;this.property+=600;this.burst(s.x,s.y+28,'#f3d13b',8);this.fxText.push(new ImpactText(s.x,s.y-24,'CIVILIAN!', '#f05d8b',30));this.shake=Math.max(this.shake,9);this.spawnCrowdShout(s.x);if(!v.dead)this.announce('COLLATERAL!',800);this.say('An anonymous spectator has joined the incident report.')}}
    burst(x,y,color,n){for(let i=0;i<n;i++)this.particles.push(new Particle(x,y,color))}
    celebrate(x){for(let i=0;i<58;i++){const p=new Confetti(x+rnd(-150,150),this.floor-rnd(40,170));p.vx+=rnd(-180,180);this.confetti.push(p)}this.say('The arena deploys its legally mandated victory confetti!')}
    updateHud(){$('#playerName').textContent=this.player.name;$('#enemyName').textContent=this.enemy.name;$('#playerHealth').style.width=(this.player.hp/this.player.maxHp*100)+'%';$('#enemyHealth').style.width=(this.enemy.hp/this.enemy.maxHp*100)+'%';$('#playerGear').textContent=this.player.weapon.name+ (this.abilities.length?' • '+this.abilities.join(' / '):'');$('#enemyGear').textContent=this.enemy.weapon.name+' • '+this.enemy.personality;this.player.rig.helmet=this.player.helmet;this.updatePopularity(this.player);this.updatePopularity(this.enemy)}
    finishFight(){if(this.ended)return;if(this.player.dead){if(!this.triviaUsed){this.triviaUsed=true;setTimeout(()=>this.showTrivia(),350)}else{this.ended=true;setTimeout(()=>this.end(false),500)}}else{this.wins++;if(this.round>=MAX_LEVEL){this.ended=true;setTimeout(()=>this.end(true),600)}else{this.round++;this.nextOpponent=this.rollOpponent();setTimeout(()=>this.loot(),450)}}}
    showTrivia(){
      this.running=false;this.aftermath=false;show('trivia');const bank=window.LB_TRIVIA||[];if(!this.triviaBag?.length){this.triviaBag=[...bank];for(let i=this.triviaBag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[this.triviaBag[i],this.triviaBag[j]]=[this.triviaBag[j],this.triviaBag[i]]}}const q=this.triviaBag.pop(),answers=q.c.map((text,i)=>({text,correct:i===q.a})).sort(()=>Math.random()-.5);let remaining=15,resolved=false;
      $('#triviaQuestion').textContent=q.q;$('#triviaFact').textContent='Answer correctly to rebuild your fighter and continue this exact fight.';$('#triviaChoices').innerHTML=answers.map((x,i)=>`<button data-i="${i}">${String.fromCharCode(65+i)}. ${x.text}</button>`).join('');
      const paint=()=>{$('#triviaSeconds').textContent=Math.max(0,Math.ceil(remaining));$('#triviaTimer').style.width=(remaining/15*100)+'%'};paint();
      const resolve=(choice,button)=>{if(resolved)return;resolved=true;clearInterval(this.triviaClock);const correct=choice&&choice.correct;[...$('#triviaChoices').children].forEach((b,i)=>{b.disabled=true;if(answers[i].correct)b.classList.add('correct')});if(button&&!correct)button.classList.add('wrong');$('#triviaFact').textContent=(correct?'CORRECT — ':choice?'WRONG — ':'TIME EXPIRED — ')+q.f;setTimeout(()=>correct?this.reviveFromTrivia():this.failTrivia(),1550)};
      $('#triviaChoices').onclick=e=>{const b=e.target.closest('button');if(!b)return;resolve(answers[+b.dataset.i],b)};
      this.triviaClock=setInterval(()=>{remaining-=.1;paint();if(remaining<=0)resolve(null,null)},100)
    }
    reviveFromTrivia(){
      clearInterval(this.triviaClock);const p=this.player,e=this.enemy;p.dead=false;p.hp=Math.max(35,Math.ceil(p.maxHp*.42));p.down=0;p.stun=1.1;p.motion=null;p.rig.detached={};p.rig.rag=0;p.rig.expression='smug';p.rig.setState('getup',.45);p.rig.x=390;
      if(e.dead){e.dead=false;e.hp=1;e.rig.detached={};e.rig.rag=0;e.rig.setState('getup',.4)}e.stun=1.1;e.rig.x=890;this.pendingFinish=false;this.slowmo=1;this.projectiles=[];show('game');this.updateHud();this.announce('CORRECT!<br>GET BACK IN THERE',1400);this.say('Knowledge has reversed death. The arena regrets adding trivia.');this.running=true
    }
    failTrivia(){clearInterval(this.triviaClock);this.ended=true;show('game');this.end(false)}
    loot(){
      show('loot');const cards=[],foe=this.nextOpponent,weight={COMMON:6,UNUSUAL:3,RARE:1.5,ABSURD:.55};let pool=LOOT.filter(x=>!x.key||!this.abilities.includes(x.key));
      const draw=()=>{const total=pool.reduce((n,x)=>n+weight[x.rarity],0);let roll=rnd(0,total),chosen=pool[pool.length-1];for(const x of pool){roll-=weight[x.rarity];if(roll<=0){chosen=x;break}}pool=pool.filter(x=>x!==chosen);return chosen};
      while(cards.length<2&&pool.length)cards.push(draw());
      if(this.round%4===0){const kind=this.player.weapon.kind,keys=kind==='heavy'?['HEAVY METAL','COMBO MEAL']:['blade','pole'].includes(kind)?['BLADE PARADE','WEAPON BOOMERANG']:kind==='fist'?['SPRING-LOADED KNEES','ACROBAT TAX CREDIT','GRAPPLE GOBLIN']:['COMBO MEAL','WEAPON BOOMERANG'];if(this.abilities.includes('CROWD FAVORITE'))keys.unshift('CROWD SURFING');if(this.abilities.includes('THROWING ARM'))keys.unshift('WEAPON BOOMERANG');const synergy=LOOT.find(x=>x.key&&keys.includes(x.key)&&!this.abilities.includes(x.key)&&!cards.includes(x));if(synergy)cards[0]=synergy}
      if(this.abilities.length&&chance(.22)){const eligible=this.abilities.filter(a=>(this.abilityRanks[a]||1)<2);if(eligible.length){const key=pick(eligible);cards[Math.floor(rnd(0,cards.length))]={name:key.replace(/\b\w/g,c=>c.toUpperCase())+' II',icon:'⬆️',type:'upgrade',rarity:'RARE',desc:'Mastery: +8% damage, +4% speed and +6 maximum health.',apply:g=>g.upgradeAbility(key)}}}
      const weapons=WEAPONS.filter(w=>w.damage>this.player.weapon.damage*.85),w=pick(weapons),weaponRarity=w.damage>=29?'ABSURD':w.damage>=23?'RARE':w.damage>=18?'UNUSUAL':'COMMON';cards.splice(Math.floor(rnd(0,3)),0,{name:w.name,icon:w.icon,type:'weapon',rarity:weaponRarity,desc:`${w.damage} damage • ${w.kind} • ${w.range} reach • ${Math.round(w.speed*100)} handling`,apply:g=>{g.player.weapon=w;g.player.rig.weapon=w}});
      $('#nextOpponent').innerHTML=`<b>${foe.featured?'FEATURED FIGHT • ':''}UP NEXT: ${foe.name}</b><span>TIER ${foe.tier+1} • ${foe.personality} • ${foe.weapon.name}</span><small>${foe.stats.maxHp} health • ${foe.weapon.damage} damage • ${foe.weapon.range} reach • ${Math.round(foe.weapon.speed*100)} handling</small>`;
      $('#lootChoices').innerHTML=cards.slice(0,3).map((x,i)=>`<article class="loot-card rarity-${x.rarity.toLowerCase()}"><div class="icon">${x.icon}</div><em>${x.rarity} ${x.type.toUpperCase()}</em><h3>${x.name}</h3><p>${x.desc}</p><button data-i="${i}">TAKE IT</button></article>`).join('');$('#lootChoices').onclick=e=>{const b=e.target.closest('button');if(!b)return;cards[+b.dataset.i].apply(this);show('game');this.spawnRound()}
    }
    end(win){show('end');$('#endKicker').textContent=win?'BACKYARD-TO-BIRTHDAY CHAMPION • 25–0':`RUN OVER • REACHED LEVEL ${Math.min(MAX_LEVEL,this.round)}`;$('#endTitle').innerHTML=win?'LUCKY<br><i>BASTARD!</i>':'YOU DIED<br><i>UNLUCKILY</i>';$('#runStats').innerHTML=`<div>LEVEL REACHED <b>${Math.min(MAX_LEVEL,this.round)}/${MAX_LEVEL}</b></div><div>ENEMIES DEFEATED <b>${this.wins}</b></div><div>SPECTATORS HARMED <b>${this.collateral}</b></div><div>PROPERTY DAMAGE <b>$${this.property.toLocaleString()}</b></div><div>FINAL WEAPON <b>${this.player.weapon.name}</b></div><div>ABILITIES FOUND <b>${this.abilities.length}</b></div>`}
    draw(){const c=this.ctx,w=1280,h=720;prepareCanvas(this.c,c,w,h,this.canvasScale());c.save();if(this.shake){const s=this.shake;c.translate(rnd(-s,s),rnd(-s*.55,s*.55))}c.translate(-(this.worldPan||0),0);this.drawWorldOverscan(c,w,h);this.drawCachedBackground(c,w,h);this.drawCrowdLayer(c,w,h);this.objects.forEach(o=>o.draw(c,this.floor));this.player.rig.draw(c);this.enemy.rig.draw(c);this.particles.forEach(p=>p.draw(c));this.projectiles.forEach(p=>p.draw(c));this.confetti.forEach(p=>p.draw(c));this.fxText.forEach(p=>p.draw(c));this.foreground(c,w,h);c.restore()}
    drawWorldOverscan(c,w,h){
      const id=(this.scene||SCENES[0]).id,pad=360,pal={backyard:['#78c3d3','#c59870','#5f8e64'],office:['#c7cbcc','#8f9295','#647078'],buffet:['#a85d4c','#956040','#6d352f'],wedding:['#e6b8ca','#c99ea8','#78546d'],birthday:['#85ccdc','#d69b67','#61a34d']}[id]||['#78c3d3','#c59870','#5f8e64'];
      c.fillStyle=pal[0];c.fillRect(-pad,0,w+pad*2,310);c.fillStyle=pal[1];c.fillRect(-pad,308,w+pad*2,h-308);
      c.strokeStyle='rgba(40,28,40,.28)';c.lineWidth=3;for(let y=340;y<h;y+=47){c.beginPath();c.moveTo(-pad,y);c.lineTo(w+pad,y+3);c.stroke()}for(let x=-pad;x<w+pad;x+=100){c.beginPath();c.moveTo(x,308);c.lineTo(x-72,h);c.stroke()}
      c.fillStyle=pal[2];c.globalAlpha=.72;for(let x=-330;x<w+330;x+=165){c.beginPath();c.moveTo(x,308);c.lineTo(x+32,190);c.lineTo(x+72,308);c.fill()}c.globalAlpha=1;
      const sideProp=(x,label,flip=1)=>{c.save();c.translate(x,0);c.scale(flip,1);ctxRoundRect(c,-112,116,224,68,4,'#f5eedc');c.fillStyle='#17131f';c.font='900 13px Space Mono, monospace';c.textAlign='center';c.fillText(label,0,143);c.font='9px Space Mono, monospace';c.fillText('CAMERA LIABILITY ZONE',0,164);c.restore()};
      sideProp(-185,id==='office'?'UNPAID OVERTIME':'NO REFUNDS');sideProp(w+185,id==='birthday'?'PARENTS LOOKING AWAY':'KEEP FIGHTING',-1);
      c.fillStyle='#312638';c.fillRect(-pad,this.floor-112,w+pad*2,18);c.strokeStyle='#17131f';c.lineWidth=6;c.beginPath();c.moveTo(-pad,this.floor-112);c.lineTo(w+pad,this.floor-112);c.moveTo(-pad,this.floor-94);c.lineTo(w+pad,this.floor-94);c.stroke();
      const lip=this.floor+58;c.fillStyle='#241827';c.fillRect(-pad,lip,w+pad*2,h-lip);c.fillStyle='#f3d13b';for(let x=-pad;x<w+pad;x+=130){c.save();c.translate(x,lip+15);c.rotate(-.18);c.fillRect(0,0,72,12);c.restore()}
      c.fillStyle='rgba(60,35,42,.22)';for(let i=0;i<18;i++){const x=-pad+((i*173+61)%(w+pad*2)),y=342+(i*71)%250;c.beginPath();c.ellipse(x,y,14+i%4*6,4+i%3,.2,0,TAU);c.fill()}
    }
    drawCrowdLayer(c,w,h){
      if(this.qualityMode!=='PERFORMANCE'){this.spectators.forEach(s=>this.drawSpectator(c,s));this.drawCrowdShouts(c);this.drawCrowdRail(c,w);return}
      if(!this.crowdCache){this.crowdCache=document.createElement('canvas');this.crowdCache.width=w;this.crowdCache.height=h;this.crowdCtx=this.crowdCache.getContext('2d',{alpha:true,desynchronized:true});this.crowdFrame=0;this.crowdScene=''}
      const scene=this.scene?.id||'',refresh=this.crowdScene!==scene||this.crowdFrame++%2===0;if(refresh){const q=this.crowdCtx;q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,w,h);this.spectators.forEach(s=>this.drawSpectator(q,s));this.drawCrowdShouts(q);this.drawCrowdRail(q,w);this.crowdScene=scene}c.drawImage(this.crowdCache,0,0,w,h)
    }
    drawCachedBackground(c,w,h){
      const key=`${this.scene?this.scene.id:'none'}:${this.c.width}x${this.c.height}`;
      if(this.bgKey!==key){this.bgCache.width=this.c.width;this.bgCache.height=this.c.height;const b=this.bgCtx;b.setTransform(this.c.width/w,0,0,this.c.height/h,0,0);b.clearRect(0,0,w,h);this.background(b,w,h);this.bgKey=key}
      c.drawImage(this.bgCache,0,0,w,h)
    }
    background(c,w,h){
      const id=(this.scene||SCENES[0]).id,top=c.createLinearGradient(0,0,0,310);
      if(id==='backyard'){
        top.addColorStop(0,'#67b9d1');top.addColorStop(1,'#c9e8d3');c.fillStyle=top;c.fillRect(0,0,w,310);circle(c,1080,68,43,'#f5dc69','#e5b94f',4);ctxRoundRect(c,45,70,250,205,3,'#d98767');poly(c,[[25,76],[170,8],[320,76]],'#66474d');c.fillStyle='#9ad06d';c.fillRect(0,275,w,375);c.fillStyle='#ead8ad';for(let x=0;x<w;x+=82){c.fillRect(x,217,72,66);c.strokeStyle='#8b744e';c.lineWidth=4;c.strokeRect(x,217,72,66)}c.strokeStyle='#444';c.lineWidth=3;c.beginPath();c.moveTo(350,88);c.lineTo(930,142);c.stroke();for(let x=390;x<900;x+=110)poly(c,[[x,95],[x+55,101],[x+48,150],[x+5,147]],COLORS[Math.floor((x-390)/110)%COLORS.length]);
      }else if(id==='office'){
        top.addColorStop(0,'#b9bec2');top.addColorStop(1,'#e1ded6');c.fillStyle=top;c.fillRect(0,0,w,h);c.fillStyle='#f4f1dc';for(let x=70;x<w;x+=245)ctxRoundRect(c,x,22,170,28,3,'#eef4df');c.fillStyle='#77828a';c.fillRect(0,236,w,72);for(let x=0;x<w;x+=155){ctxRoundRect(c,x+8,96,139,151,3,x%310?'#74848a':'#87969b');c.fillStyle='#41484c';c.fillRect(x+29,145,70,38);c.fillStyle='#d5d8d9';c.fillRect(x+48,184,43,48)}
      }else if(id==='buffet'){
        top.addColorStop(0,'#7f3f3d');top.addColorStop(1,'#c77b55');c.fillStyle=top;c.fillRect(0,0,w,h);c.fillStyle='#f2c168';c.fillRect(0,211,w,97);c.strokeStyle='#6c382f';c.lineWidth=7;c.strokeRect(-5,211,w+10,97);for(let x=20;x<w;x+=190){ctxRoundRect(c,x,103,150,77,7,'#f5eedc');c.fillStyle='#7d2f38';c.font='bold 17px sans-serif';c.textAlign='center';c.fillText(['MEAT?','SOUP-ish','HOT FOOD','DESSERT'][Math.floor(x/190)%4],x+75,145)}c.fillStyle='#9a5d3d';c.fillRect(0,308,w,h-308);c.strokeStyle='#d7a36e';c.lineWidth=3;for(let x=0;x<w;x+=85){c.beginPath();c.moveTo(x,308);c.lineTo(x-60,h);c.stroke()}
      }else if(id==='wedding'){
        top.addColorStop(0,'#dba9bd');top.addColorStop(1,'#f6dedf');c.fillStyle=top;c.fillRect(0,0,w,h);for(let x=0;x<w;x+=170){c.fillStyle=x%340?'#f4c9d6':'#fff0e8';c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+85,175,x+170,0);c.lineTo(x+170,310);c.lineTo(x,310);c.fill()}c.fillStyle='#60435f';c.fillRect(0,256,w,52);for(let x=40;x<w;x+=135){circle(c,x,235,11,'#f5eedc');circle(c,x+17,224,9,'#f05d8b');circle(c,x-15,221,8,'#5cd6b3')}c.fillStyle='#d2a6b0';c.fillRect(0,308,w,h-308);c.strokeStyle='#f4e2df';c.lineWidth=3;for(let y=340;y<h;y+=55){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}for(let x=0;x<w;x+=85){c.beginPath();c.moveTo(x,308);c.lineTo(x,h);c.stroke()}
      }else{
        top.addColorStop(0,'#6cc4dc');top.addColorStop(1,'#d9efcb');c.fillStyle=top;c.fillRect(0,0,w,h);c.fillStyle='#72b953';c.fillRect(0,270,w,h-270);ctxRoundRect(c,55,85,245,188,16,'#9d6bd8');ctxRoundRect(c,85,52,55,75,7,'#f05d8b');ctxRoundRect(c,215,52,55,75,7,'#5e8de6');for(let i=0;i<14;i++){const bx=330+i*70,by=58+Math.sin(i)*25;circle(c,bx,by,13,COLORS[i%COLORS.length]);c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(bx,by+13);c.lineTo(bx,145);c.stroke()}c.fillStyle='#d69b67';c.fillRect(0,308,w,h-308);
      }
      if(id!=='buffet'&&id!=='wedding'&&id!=='birthday'){c.fillStyle=id==='office'?'#8f9295':'#c59870';c.fillRect(0,308,w,h-308)}
      c.strokeStyle=id==='office'?'#c7c9ca':'#8f6d54';c.lineWidth=3;for(let y=335;y<h;y+=46){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}for(let x=0;x<w;x+=100){c.beginPath();c.moveTo(x,308);c.lineTo(x-70,h);c.stroke()}
      const banner=this.scene||SCENES[0];ctxRoundRect(c,365,32,550,78,3,'#f5eedc');c.fillStyle='#17131f';c.font='30px Impact';c.textAlign='center';c.fillText(`${banner.icon} ${banner.name}`,640,70);c.font='bold 12px sans-serif';c.fillText(`LEVELS ${SCENES.indexOf(banner)*5+1}–${SCENES.indexOf(banner)*5+5} • ${banner.subtitle}`,640,92)
    }
    drawSpectator(c,s){
      c.save();const hype=Math.max(Math.abs(this.player.popularity),Math.abs(this.enemy.popularity))/100,wave=Math.sin(this.time*(5+hype*4)+s.phase),bounce=s.down?0:Math.abs(Math.sin(this.time*(3.3+hype*3)+s.phase))*(2+hype*5),flight=s.down&&s.hitT<1?-Math.sin(s.hitT*Math.PI)*92:0;c.translate(s.x,s.y-bounce+flight);if(s.down)c.rotate(s.rot);c.scale(s.scale,s.scale);
      const fear=s.down||Math.abs(this.player.rig.x-s.x)<120||Math.abs(this.enemy.rig.x-s.x)<120,body=s.build,hipY=70,shoulderY=31,skin=s.skin;
      let armL=1.95+wave*.28,armR=1.2-wave*.28;if(fear){armL=-2.05+wave*.1;armR=-1.08-wave*.1}else if(hype>.35){armL=-1.95+wave*.35;armR=-1.2-wave*.35}
      const legWave=s.down?0:wave*.12,lKnee=limb(c,-11*body,hipY,31,10,1.52+legWave,s.pants),rKnee=limb(c,11*body,hipY,31,10,1.62-legWave,s.pants);const lFoot=limb(c,lKnee.x,lKnee.y,30,9,1.48-legWave*.4,s.pants),rFoot=limb(c,rKnee.x,rKnee.y,30,9,1.66+legWave*.4,s.pants);limb(c,lFoot.x-2,lFoot.y,14,8,.02,s.shoes);limb(c,rFoot.x-2,rFoot.y,14,8,.02,s.shoes);
      const lElbow=limb(c,-19*body,shoulderY,27,9,armL,skin),rElbow=limb(c,19*body,shoulderY,27,9,armR,skin);limb(c,lElbow.x,lElbow.y,25,8,armL+(fear?-.18:.25),skin);limb(c,rElbow.x,rElbow.y,25,8,armR+(fear?.18:-.25),skin);
      poly(c,[[-22*body,24],[22*body,24],[25*body,68],[-22*body,72]],s.shirt,'#17131f',4);if(s.pattern==='stripe'){c.strokeStyle='#f5eedc';c.lineWidth=5;c.beginPath();c.moveTo(-19*body,46);c.lineTo(22*body,45);c.stroke()}else if(s.pattern==='badge')circle(c,10*body,38,5,'#f3d13b','#17131f',2);
      c.fillStyle=s.hairColor;c.beginPath();c.arc(0,2,25,-Math.PI,0);c.fill();circle(c,0,0,21,skin,'#17131f',4);
      this.drawCrowdHair(c,s);c.strokeStyle='#17131f';c.lineWidth=3;c.lineCap='round';
      if(fear){circle(c,-8,-3,4,'white','#17131f',2);circle(c,8,-3,4,'white','#17131f',2);c.beginPath();c.ellipse(0,11,5,8,0,0,TAU);c.stroke()}else{c.beginPath();c.moveTo(-12,-4);c.lineTo(-4,-5-wave);c.moveTo(4,-5+wave);c.lineTo(12,-4);c.moveTo(-8,10);c.quadraticCurveTo(0,16+hype*5,9,9);c.stroke()}
      if(s.accessory==='glasses'){c.strokeStyle='#17131f';c.lineWidth=3;c.strokeRect(-16,-9,13,10);c.strokeRect(3,-9,13,10);c.beginPath();c.moveTo(-3,-5);c.lineTo(3,-5);c.stroke()}else if(s.accessory==='headband'){c.strokeStyle='#f05d8b';c.lineWidth=6;c.beginPath();c.moveTo(-21,-13);c.lineTo(21,-13);c.stroke()}else if(s.accessory==='hat'){poly(c,[[-24,-16],[24,-16],[15,-25],[-13,-25]],'#5e8de6','#17131f',3)}
      c.restore()
    }
    drawCrowdHair(c,s){
      const col=s.hairColor;c.fillStyle=col;c.strokeStyle='#17131f';c.lineWidth=3;
      if(s.hair==='bald')return;
      if(s.hair==='mohawk'){poly(c,[[-12,-18],[-7,-41],[0,-23],[8,-43],[13,-17]],col,'#17131f',3)}
      else if(s.hair==='spikes')poly(c,[[-20,-14],[-18,-32],[-8,-23],[-2,-39],[6,-23],[17,-35],[20,-13]],col,'#17131f',3);
      else if(s.hair==='curly')[-15,-5,6,16].forEach((x,i)=>circle(c,x,-18-Math.abs(1.5-i)*3,9,col,'#17131f',2));
      else if(s.hair==='ponytail'){circle(c,20,-13,10,col,'#17131f',3);c.beginPath();c.arc(20,-1,12,-1.5,1.3);c.stroke();poly(c,[[-21,-13],[-14,-27],[16,-25],[21,-12]],col,'#17131f',3)}
      else if(s.hair==='slick')poly(c,[[-21,-12],[-11,-27],[20,-22],[22,-11]],col,'#17131f',3);
      else poly(c,[[-21,-11],[-17,-28],[-8,-22],[0,-34],[8,-23],[18,-29],[22,-10]],col,'#17131f',3)
    }
    drawCrowdShouts(c){
      this.crowdShouts.forEach(shout=>{const s=shout.person,a=clamp(Math.min((shout.maxLife-shout.life)*5,shout.life*3),0,1),x=clamp(s.x,105,1175),y=Math.max(132,s.y-72*s.scale);c.save();c.globalAlpha=a;c.font='900 12px Space Mono, monospace';const width=clamp(c.measureText(shout.text).width+24,110,270),left=clamp(x-width/2,12,1268-width);ctxRoundRect(c,left,y-34,width,31,12,'#f5eedc');poly(c,[[x-8,y-4],[x+8,y-4],[x,y+10]],'#f5eedc','#17131f',3);c.fillStyle='#17131f';c.textAlign='center';c.textBaseline='middle';let text=shout.text;if(c.measureText(text).width>width-18)text=text.slice(0,Math.max(10,Math.floor((width-34)/7)))+'…';c.fillText(text,left+width/2,y-18);c.restore()})
    }
    drawCrowdRail(c,w){const y=this.floor-112;c.fillStyle='#312638';c.fillRect(0,y,w,18);c.strokeStyle='#17131f';c.lineWidth=6;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.moveTo(0,y+18);c.lineTo(w,y+18);for(let x=25;x<w;x+=112){c.moveTo(x,y-5);c.lineTo(x,y+52)}c.stroke();c.fillStyle='#f3d13b';for(let x=0;x<w;x+=150)c.fillRect(x,y+5,74,7)}
    foreground(c,w,h){const lip=this.floor+58;c.fillStyle='#241827';c.fillRect(0,lip,w,h-lip);c.fillStyle='#f3d13b';for(let x=0;x<w;x+=130){c.save();c.translate(x,lip+15);c.rotate(-.18);c.fillRect(0,0,72,12);c.restore()}}
    sfx(freq,dur){if(!this.sound)return;try{this.ac=this.ac||new (AudioContext||webkitAudioContext)();const o=this.ac.createOscillator(),g=this.ac.createGain();o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(.035,this.ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ac.currentTime+dur);o.connect(g).connect(this.ac.destination);o.start();o.stop(this.ac.currentTime+dur)}catch(e){}}
  }

  const creator={name:'Barry',build:1,head:'round',hair:'messy',face:'clean',accessory:'none',presentation:'masc',top:'tee',bottom:'shorts',skin:'#d59b72',outfit:'#e6c229',hairColor:'#2a2022',eyeColor:'#382a57',height:100,style:'brawler',signature:'The Liability Special',gameSpeed:1,reducedGore:false,reducedShake:false,largeText:false,manual:false,director:true,voice:false};
  const pc=$('#preview'),pctx=pc.getContext('2d'),previewRig=new Rig({...creator,x:210,y:435,scale:1.25,weapon:WEAPONS[7]});
  function readCreator(){creator.name=$('#nameInput').value.trim()||'Unnamed Liability';['build','head','hair','face','accessory','presentation','top','bottom','skin','outfit','hairColor','eyeColor','height','style','signature','gameSpeed'].forEach(k=>creator[k]=$('#'+k).value);['reducedGore','reducedShake','largeText','manual','director','voice'].forEach(k=>creator[k]=$('#'+k).checked);creator.build=+creator.build;creator.height=+creator.height;creator.gameSpeed=+creator.gameSpeed;$('#heightOut').value=creator.height+'%';Object.assign(previewRig,creator,{scale:1.25*creator.height/100});}
  let previewLast=0;
  function preview(t){
    if(!$('#creator').classList.contains('active')||t-previewLast<33){requestAnimationFrame(preview);return}previewLast=t;prepareCanvas(pc,pctx,420,510,1,2);pctx.clearRect(0,0,420,510);
    const wall=pctx.createLinearGradient(0,0,0,420);wall.addColorStop(0,'#8cc9ba');wall.addColorStop(1,'#6ea992');pctx.fillStyle=wall;pctx.fillRect(0,0,420,420);pctx.fillStyle='rgba(37,53,50,.14)';for(let i=0;i<22;i++){pctx.beginPath();pctx.ellipse((i*83)%430,(i*47)%390,9+i%4*5,3+i%2,.2,0,TAU);pctx.fill()}
    ctxRoundRect(pctx,23,42,117,86,4,'#e7dcbf');pctx.fillStyle='#17131f';pctx.font='bold 12px Space Mono';pctx.textAlign='center';pctx.fillText('HR APPROVED',81,67);pctx.fillText('(reluctantly)',81,88);pctx.strokeStyle='#324f47';pctx.lineWidth=2;for(let y=170;y<390;y+=35){pctx.beginPath();pctx.moveTo(370,y);pctx.lineTo(397,y);pctx.stroke();pctx.fillStyle='#324f47';pctx.textAlign='left';pctx.font='9px Space Mono';pctx.fillText(220-y/3+'?',373,y-4)}
    pctx.fillStyle='#ad7d5d';pctx.fillRect(0,410,420,100);pctx.strokeStyle='#17131f';pctx.lineWidth=5;pctx.beginPath();pctx.moveTo(0,410);pctx.quadraticCurveTo(210,416,420,409);pctx.stroke();pctx.strokeStyle='rgba(75,46,40,.35)';pctx.lineWidth=2;for(let x=-60;x<460;x+=70){pctx.beginPath();pctx.moveTo(x,410);pctx.lineTo(x-35,510);pctx.stroke()}
    previewRig.pose={...POSES.idle,bob:Math.sin(t/350)*3,uaR:.25+Math.sin(t/600)*.08};previewRig.expression='smug';previewRig.draw(pctx);requestAnimationFrame(preview)
  }
  $('#creatorForm').addEventListener('input',readCreator);$('#creatorForm').addEventListener('submit',e=>{e.preventDefault();readCreator();show('game');window.game=new Game({...creator})});
  $('#randomize').onclick=()=>{const names=['Barry','Crisis Janet','Uncle Damage','Mild Steve','Problem Child','Gary the Third'],moves=['The Liability Special','Tax-Deductible Uppercut','The Unpaid Internship','Knee of Consequence','The Beige Tornado','Final Written Warning'];$('#nameInput').value=pick(names);$('#signature').value=pick(moves);['build','head','hair','face','accessory','presentation','top','bottom','style'].forEach(id=>{const e=$('#'+id);e.selectedIndex=Math.floor(rnd(0,e.options.length))});$('#skin').value=pick(SKINS);$('#outfit').value=pick(COLORS);$('#hairColor').value=pick(['#2a2022','#6b3c26','#d7b65a','#9b3d65','#324b75']);$('#eyeColor').value=pick(['#382a57','#3d6d64','#6b4226','#346d9b']);$('#height').value=Math.floor(rnd(88,115));readCreator()};
  $('#again').onclick=()=>location.reload();window.LB3={Game,Rig,ArenaObject,Particle,Confetti,ImpactText,WeaponProjectile,CrowdProjectile,WEAPONS,LOOT,SCENES,POSES,SKINS,COLORS,TRAITS,NAMES,show,pick,rnd,chance,clamp,circle,poly,limb,ctxRoundRect};readCreator();requestAnimationFrame(preview);
})();
