/* Lucky Bastard v6.1 — explicit adult banter and modern street talk */
(()=>{
  'use strict';
  const LB=window.LB3,D=window.LB_DIALOGUE;if(!LB||!D)return;
  const extra={
    intro:[
      'Aight, bet. Run the damn hands.','No cap, I woke up ready for bullshit.','You the opp? Damn, standards fell off.','Square up, fam. The waiver already gave up.','This fit is clean. Yours is a fucking emergency.','Say less. I came for smoke and parking validation.','Bro really spawned in looking that mid.','On God, this arena smells like bad choices.','You got main-character confidence and NPC footwork.','Respectfully, I am about to disrespect the shit out of you.','Whole crowd watching you get caught lacking.','Let us lock in before my common sense returns.','Big aura, tiny health bar. That is wild.','I did not come all this way for a soft launch.','Nah, this beef is officially live.','Ready or not, your deductible is cooked.'
    ],
    neutral:[
      'Bro, what the fuck is that stance?','No cap, your footwork is giving free trial.','I am lowkey calm and highkey dangerous.','You keep yapping; I keep collecting receipts.','That weapon is doing all the aura work.','We outside, unfortunately for your face.','You look pressed, fam. Breathe before I fix that.','This fight is messy as hell. I respect it.','Your whole vibe needs a patch update.','Bet you practiced that shit in a group chat.','I have zero chill and one functioning knee.','Do not get it twisted—I can fail upward violently.','You are moving mad for somebody in punching range.','This is not beef anymore; this is content.','I came locked in. My joints did not.','That guard is weak as shit, respectfully.'
    ],
    winning:[
      'Damn, you are getting absolutely cooked.','That health bar is down catastrophic.','Bro got ratioed by my left hand.','No cap, the floor has more wins than you.','Your comeback is fake news, fam.','You are losing aura by the second.','This ass-whooping is going platinum.','You got folded like a cheap-ass lawn chair.','Stay mad. I am still landing clean.','Your defense is giving thoughts and prayers.','I brought smoke; you brought a damn coupon.','You are one hit from becoming background lore.','Whole crowd knows you are cooked.','That was not a combo. That was rent collection.','Your fighting style is straight-up buffering.','I would say lock in, but the door is gone.'
    ],
    low:[
      'Oh shit, my health bar is cooked.','Time out, fam. I am down horrendous.','No cap, I suddenly support peace.','Bro, chill! My organs are not respawning.','I am not scared; I am strategically fucked.','Can we squash the beef before I become soup?','My knees said nah, and honestly they valid.','This shit stopped being content real fast.','I got caught lacking. We all saw it.','Please, I have a family group chat to ignore.','I am one punch from meeting the loading screen.','Damn, my whole skeleton just logged off.','Lowkey begging. Highkey serious.','I surrender, you violent-ass overachiever.','Do not finish me; I owe too many people money.','My last words are: this matchup was bullshit.'
    ],
    response:[
      'That was weak as hell.','Keep yapping, bro. I need the coordinates.','Cap. Your fists cannot back that up.','Damn, you rehearsed that and still missed.','Stay pressed. It makes you easier to hit.','Nobody asked, but your mouth kept spawning dialogue.','Talk your shit while the health bar allows it.','Bet. I am saving that receipt for your funeral.','Your banter is mid and your guard is worse.','You got jokes? Cute. I got knuckles.','That insult had zero aura. Try again.','Bro thinks volume equals damage.','Say less. Actually, say nothing.','You are doing side quests with your mouth.','All that cap is blocking the camera.','Respectfully, shut the fuck up and swing.'
    ],
    dodge:[
      'MISS ME WITH THAT SHIT.','TOO SLOW, BRO.','CAUGHT YOU LACKING.','NAH. HOLD THAT AIR.','Clean whiff. Zero fucking contact.','You swung at my previous location, fam.','That punch got ghosted.','Skill issue, respectfully.','Bro hit nothing and celebrated.','I slipped that shit like unpaid rent.','Your aim is cooked.','No cap, the breeze was nice.','Delete that move from your loadout.','You almost hit me in another timeline.','That swing had negative aura.','Try again when the lag clears.'
    ],
    block:[
      'BLOCKED, BITCH.','NAH, THAT SHIT IS DENIED.','HOLD THIS GUARD, FAM.','ACCESS FUCKING DENIED.','Your hit got left on read.','Not today, you loud-ass NPC.','That attack was mid. My guard is valid.','Returned to sender with disrespect.','Bro brought damage; I brought receipts.','Your combo just hit a paywall.','Absolutely the fuck not.','Guard game crazy. Stay mad.','That shit bounced like your confidence.','Denied. Go touch grass.','My defense said bet and stood on business.','You hit the block—literally.'
    ],
    grapple:[
      'UP YOU FUCKING GO.','WELCOME TO AIR JAIL, BRO.','YOUR FLOOR PRIVILEGES ARE REVOKED.','Bet, now you are carry-on luggage.','This slam is about to be disrespectful as hell.','Caught lacking at grabbing distance.','No cap, gravity wants the assist.','Hold still, you slippery little shit.','Your ass is getting express shipped.','Bro thought personal space was real.','We wrestling now. Stay mad.','Time to fold you for storage.','You wanted smoke; enjoy the altitude.','This pickup has terrible customer service.','On God, the landing will be loud.','Say hi to the floor for me.'
    ],
    grabbed:[
      'PUT ME THE FUCK DOWN!','BRO, THIS IS MAD DISRESPECTFUL!','NAH, MY FEET NEED RIGHTS!','I DID NOT ORDER THIS SHIT!','Unhand me, you built-ass forklift!','No cap, I hate this camera angle.','Fam, we can talk about the landing.','My back is already cooked!','This is not how consent works, asshole!','I am too expensive to throw!','Bro, gravity and I have beef.','Why am I suddenly luggage?','Lowkey panicking. Highkey put me down.','My chiropractor is going to love this shit.','I left my aura on the ground!','Not the slam, you unhinged bastard!'
    ],
    hit:[
      'OW, FUCK! THAT WAS A REAL ORGAN!','Damn, that shit had receipts.','Bro just punched my Wi-Fi out.','My rib said log off.','That hit was disrespectful as hell.','No cap, I felt that in my search history.','You cracked my whole damn vibe.','My spine just rage-quit.','That was clean. Fuck you, but clean.','I got folded and I hate the evidence.','My soul got caught lacking.','That punch had landlord energy.','Shit! My health bar felt that first.','You hit like overdue consequences.','My body just filed a damn bug report.','Okay, that one was valid. Asshole.'
    ],
    crit:[
      'HOLY SHIT, MY SOUL BUFFERED!','WHAT THE FUCK WAS THAT, BRO?','Damn, I saw the respawn menu.','That crit stole my entire aura.','My ancestors just yelled “run.”','No cap, reality lagged on impact.','You hit me into next week, asshole.','My whole bloodline felt that shit.','Bro just factory-reset my face.','That was criminally fucking clean.','I tasted colors and unpaid taxes.','My skeleton unfollowed me.','That hit came with patch notes.','I am cooked, plated, and served.','The health bar did not consent to that.','Somebody nerf this violent bastard.'
    ]
  };
  Object.entries(extra).forEach(([key,lines])=>{D[key]=D[key]||[];D[key].push(...lines)});
  LB.CROWD_SHOUTS.push(
    'RUN HIS SHIT, FAM!','NO CAP, THAT KICK WAS CLEAN!','BRO IS GETTING COOKED!','STOP YAPPING AND SWING!','THAT COMBO HAD CRAZY AURA!','HE GOT CAUGHT LACKING!','DAMN, SOMEBODY CLIP THAT!','STAND ON BUSINESS!','THIS FIGHT IS WILD AS HELL!','BOO! THAT SHIT WAS MID!','LOCK IN, BRO!','WHO LET THIS NPC FIGHT?','THROW HANDS, NOT EXCUSES!','THE HEALTH BAR IS DOWN BAD!','NO WAY HE ATE THAT SHIT!','SHEESH! THAT WAS DISRESPECTFUL!','BRO GOT FOLDED!','THE FLOOR SAID BET!','YALL ARE MOVING MAD!','THAT DODGE WAS CLEAN AS FUCK!','HOLD THAT L, FAM!','SOMEBODY CHECK HIS AURA!','THIS BEEF GOT PATCH NOTES!','HE IS COOKED, NO CAP!','GET YOUR ASS UP!','THAT BLOCK STOOD ON BUSINESS!','WHO ORDERED THE ASS-WHOOPING?','THE CROWD WANTS MORE SMOKE!','AIN’T NO WAY THAT CONNECTED!','THIS SHIT IS CINEMA!'
  );
})();
