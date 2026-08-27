/* Lucky Bastard v5.7 — portrait takeover with extended arena overscan */
(()=>{
  const LB=window.LB3;
  if(!LB)return;
  const {Game,clamp}=LB;
  const portrait=()=>window.matchMedia('(max-width: 600px) and (orientation: portrait)').matches;

  const oldSpawn=Game.prototype.spawnRound;
  Game.prototype.spawnRound=function(){
    oldSpawn.call(this);
    if(!portrait())return;
    /* Start inside the portrait camera window, then let normal spacing take over. */
    this.player.rig.x=480;
    this.enemy.rig.x=800;
    this.player.rig.y=this.floor;
    this.enemy.rig.y=this.floor;
    this.player.rig.dir=1;
    this.enemy.rig.dir=-1;
  };

  const oldDirector=Game.prototype.updateDirector;
  Game.prototype.updateDirector=function(dt){
    oldDirector.call(this,dt);
    if(!portrait())return;
    /* The canvas is height-filled in portrait. Track the fight midpoint through the
       cropped 16:9 stage even when the optional cinematic director is disabled. */
    const midpoint=(this.player.rig.x+this.enemy.rig.x)/2;
    const pixelsPerWorld=(window.innerHeight||720)/720;
    const shift=clamp((640-midpoint)*pixelsPerWorld,-window.innerWidth*1.25,window.innerWidth*1.25);
    const zoom=this.access.director?this.cameraScale:1;
    this.c.style.transform=`translateX(calc(-50% + ${shift}px)) scale(${zoom})`;
  };

  const oldThoughts=Game.prototype.layoutThoughts;
  Game.prototype.layoutThoughts=function(){
    if(!portrait())return oldThoughts.call(this);
    const player=document.querySelector('#thoughtPlayer');
    const enemy=document.querySelector('#thoughtEnemy');
    const playerVisible=!player.classList.contains('hidden');
    const enemyVisible=!enemy.classList.contains('hidden');
    if(!playerVisible&&!enemyVisible)return;
    if(playerVisible){player.style.left='7%';player.style.top=enemyVisible?'27%':'32%'}
    if(enemyVisible){enemy.style.left='55%';enemy.style.top=playerVisible?'38%':'32%'}
  };

  const refresh=()=>{
    if(window.game)window.game.layoutThoughts();
  };
  window.addEventListener('resize',refresh,{passive:true});
  window.addEventListener('orientationchange',refresh,{passive:true});
})();
