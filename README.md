# Lucky Bastard v5.7 — Bigger Worlds

## v5.7 extended arenas and camera

- Every map now has 360 logical pixels of illustrated overscan on both sides of the original arena.
- The director camera can smoothly pan up to 260 logical pixels while remaining inside the illustrated world.
- Stronger close-up, wrestling, airborne, and final-blow zooms provide more dramatic framing.
- Side extensions continue each scene's walls, floor, rail, grime, warning signs, and foreground apron so blank edges never appear.
- Portrait combat keeps its dedicated midpoint-tracking camera and the mobile creator remains scrollable.

## v5.6 mobile creator fix

- Restores normal vertical scrolling and touch panning throughout the portrait character creator.
- Keeps the active combat screen fixed and full-height after entering the arena.
- Preserves the portrait camera, protected HUD zones, and fighter-first presentation from v5.5.

A self-contained 2D cartoon auto-battler prototype. Create a modular fighter, then see how far they survive across a 25-level disaster tour.

## v5.5 portrait-first combat presentation

- Portrait phones now use the entire visible viewport instead of leaving a black lower letterbox
- The 16:9 arena uses cover-style cropping rather than distortion
- A portrait camera tracks the fighters’ midpoint so both stay within the narrow crop
- Portrait fights start from closer, phone-safe positions while preserving normal combat spacing
- Fighter HUDs occupy protected translucent top corners and nonessential gear text is hidden
- Health remains prominent while stamina and popularity telemetry are compacted
- Announcements, fight cards and speech bubbles use dedicated upper-screen safe zones
- The ticker stays anchored above the phone safe area at the bottom

## v5.4 replay removal

- Instant replay has been completely removed from the HUD and game flow
- Impact screenshots, JPEG encoding, replay timers and replay memory storage are no longer created
- Knockouts remain on the live arena for the full four-second cinematic hold
- Comic recaps now use text-only event panels

## v5.3 cinematic knockout timing

- Every final blow holds the arena in slow motion for four full seconds
- Ordinary knockouts, regular finishers and rare instant kills share the same cinematic hold
- Defeat poses, detachable parts, wounds and finisher announcements remain visible throughout
- Trivia, loot and ending transitions cannot begin until the knockout hold completes

## v5.2 strict performance and trivia expansion

- The crowd is rendered into a dedicated transparent layer at 30 Hz and composited behind 60 Hz fighters, impacts and gameplay
- Speech-bubble positioning runs at 20 Hz instead of forcing DOM layout work every frame
- Performance mode uses stricter effect, debris, confetti and particle budgets during chaotic scenes
- Performance remains the default with a more aggressive high-DPI backing-buffer scale
- The target is stable display-synchronized 60 FPS; high-refresh displays may schedule more frames naturally
- Trivia expands from 50 to exactly 1,000 unique validated questions
- Categories include arithmetic traps, modular arithmetic, number bases, sequences, percentages, geometry, combinatorics, clock angles, capitals, chemistry, computing, scientific units and animal facts
- Every generated question has four distinct choices, one valid answer and a humorous explanation

## v5.1 performance and rare finishers

- Performance quality is now the default, with a lighter backing buffer and a low-latency Canvas presentation path
- Heavy impact effects use bounded particle budgets to protect frame pacing during chaotic scenes
- Spectator role/name labels are removed while invisible crowd roles and behaviors continue working
- Collateral commentary no longer assigns names to spectators
- Very rare clean hits can activate six cinematic instant-kill outcomes
- Outcomes include a body fly-through, uppercut decapitation, head/body impalement, weapon decapitation and a waist slice
- Persistent wounds, missing body sections and airborne detachable parts remain visible through the slow-motion finish
- Reduced Gore replaces graphic outcomes with a bright comic silhouette impact
- Training Lab includes a `RARE FINISH` control for previewing the system

## v5.0 fight-system upgrade

- Three readable dodge levels: head sway, body sway and stamina-expensive step-back jump
- Telegraphs identify incoming head, body, limb, grab and heavy attacks
- Directional high/body/low guards, perfect-block counters, feints and punish windows
- Stamina, exhaustion, momentum, desperation behavior and preferred-range tactics
- Combat memory reduces repeated attacks and teaches fighters to exploit repeated defenses
- Multi-hit punch, kick and mixed combinations with interruption and recovery
- Close, pocket, kick and long range bands with style- and personality-driven positioning
- Directional head snaps, body folds, limb recoils and contested knockdowns
- Ground follow-ups, knockdown struggles and short directed cinematic exchanges
- 25 named crazy attacks spanning crossovers, grabs, carries, rebounds and arena interactions
- Every spectacular move has readable anticipation, a counter window and a possible comic failure
- Training Lab controls expose all three dodges, combinations and the expanded crazy-grab library

The new combat logic lives in `combat.js`, loaded after the existing gameplay, expansion and visual layers.

## Play

Open `index.html` in any modern browser. No installation, build step, server, or internet connection is required. The optional web font falls back cleanly when offline.

## Controls

Combat is fully autonomous. Create a fighter, watch the fight, and choose one of three random rewards after each victory.

## v4.0 visual renderer replacement

The placeholder geometric visual language has been replaced with an original, code-rendered adult TV-cartoon presentation. Gameplay rules remain unchanged.

- New `visuals.js` module cleanly separates presentation from combat rules, physics and progression
- Organic, deliberately irregular inked paths replace rectangle-and-circle character construction
- Modular layered fighters include back hair, neck, ears, asymmetrical heads, eyes, brows, noses, mouths, facial hair, torso clothing, jointed upper/lower limbs, proper hands, fingers and shaped shoes
- Larger expressive heads, varied jaw silhouettes, cel-shadow patches and distinct body proportions improve character readability
- Independent eye direction, blinking, eyebrows, protruding noses and mouth shapes support neutral, angry, scared, confused, smug, laughing, hurt, shocked and unconscious states
- Pose-driven animation supports breathing, weight shifting, walking, attacks, blocks, dodges, heavy reactions, falls, knockdowns, get-ups, stunned, victory, defeat, pickup and environmental interaction
- Anticipation, follow-through, squash/stretch and hand-attached weapons preserve the existing combat choreography
- Persistent black eyes, missing teeth, bandages and torn clothing integrate with the v3.0 injury system
- Five arenas now use illustrated scene-specific composition, crooked architecture, painted gradients, stains, cracks, grime, signs, trash and small comedy details
- Background, gameplay and foreground artwork remain separate; collision geometry is unchanged
- Spectators use a second modular cartoon rig with varied heads, hair, clothing, shoes and reactive behaviors including cheering, laughing, booing, wincing, filming, pointing, talking, looking away and ducking
- Impacts create drawn stars, sweat droplets, dust clouds, debris, smears and exaggerated heavy-hit poses
- Foreground silhouettes and moving venue details add depth without restoring the removed vignette
- Static arena artwork remains cached, and Performance quality continued to report 60 FPS during browser tests
- The character creator remains fully compatible and now previews fighters inside an illustrated HR assembly room

## v3.0 Director's Cut

This major update implements the complete cinematic-chaos roadmap while remaining a static, offline-friendly browser game.

1. Destructible arena props burst into persistent cartoon debris and increase the damage bill.
2. Defeated opponents can become scarred nemeses and return several levels later with upgraded stats.
3. A four-second live knockout hold keeps final impacts visible without leaving the arena.
4. The dynamic camera smoothly switches between wide, close-chaos, wrestling, airborne and final-blow framing.
5. Eight selectable fighting styles provide distinct stat and behavioral tendencies.
6. Persistent black eyes, bandages, torn clothing and missing teeth visualize accumulated injuries.
7. Each venue has a named environmental finisher tied to its scenery.
8. Spectators receive visible roles: heckler, superfan, gambler, medic, security, influencer or relative.
9. Reward screens allow improvised crafting by combining the equipped weapon with destroyed scenery.
10. Every opponent receives a randomized relationship to the player, shown in the fight HUD.
11. Critical low health can trigger one of five rare mid-fight awakenings.
12. Rare tag-team interruptions send friendly and enemy assistants running into the fight.
13. Players name a signature move in the creator; it can activate as a high-power cinematic attack.
14. Each victory generates a three-panel comic-style event recap.
15. Daily seeded challenges generate repeatable opponents, loot, trivia and events from the date.
16. The Training Lab provides infinite health and direct Punch, Kick, Acrobat, Grapple and Reset controls.
17. Venue tones, expanded impact audio and an optional speech-synthesis announcer improve sound presentation.
18. Combat speed, reduced gore, reduced shake, larger text, camera control and a manual action assist are available in the creator.

Performance remains adaptive, with no screenshot encoding or replay-image memory overhead.

## v2.2 crowd highlights

- Full-body miniature crowd rigs with segmented upper arms, forearms, thighs, shins and feet
- Independent cheering, jumping, fear, recoil, launch, spin and fallen poses
- Randomized height, build, skin, shirt, trousers, shoes, patterns and accessories
- Seven hairstyles with varied hair colors, plus glasses, headbands and hats
- Expressive eyes and mouths react when fighters or flying bodies get too close
- 40 shuffled-style crowd shouts appear in compact speech bubbles
- Shouts are throttled to one bubble at a time and become immediate around collateral accidents

## v2.1 performance highlights

- Targets 60 FPS with an adaptive canvas render scale in the default Auto mode
- Caches each venue's static background instead of rebuilding all scenery every frame
- Measures canvas layout only when its size changes, removing forced layout work from the animation loop
- Skips arena rendering while reward, trivia and ending screens are active
- Character creator preview pauses when hidden and runs at an efficient 30 FPS while visible
- Quality button offers Auto, Native and Performance modes with a live FPS readout
- Native keeps maximum display resolution; Performance prioritizes frame rate on older phones and 4K displays

## Existing game highlights

- Raised combat floor places fighters around the visual center instead of along the bottom edge
- Spectators now occupy the visible mid-ground immediately behind the fighters
- A new arena safety rail separates the crowd row from the combat floor
- Collateral victims launch upward, slide sideways, spin and fall instead of instantly rotating in place
- Wider collateral detection makes knockbacks, wrestling throws, heavy attacks and finishers visibly reach the crowd
- Dedicated CIVILIAN impact typography, particles, camera shake and longer collateral announcements

- Device-pixel-aware arena rendering redraws Canvas 2D art at the display's native resolution
- Crisp scalable character rigs, weapons, scenery, typography and effects on 1440p, 4K and Retina displays
- High-quality smoothing and automatic backing-buffer updates when the window or fullscreen size changes
- High-DPI character creator preview instead of a stretched 420×510 bitmap
- Dedicated UHD layout rules enlarge health bars, names, dialogue, loot cards and controls on very large screens

- Five transparent CPU tiers raise health, damage, speed, defense and weapon ceilings every five levels
- Featured opponents at Levels 5, 10, 15, 20 and 25 receive a modest boss bonus
- Six illustrated weapons expand the arsenal to 36: briefcase, selfie-stick sabre, leaf blower, cone nunchaku, golden toilet brush and microwave
- Seven build-focused abilities expand the hidden ability pool to 30
- Common, unusual, rare and absurd reward tiers with color-coded loot cards
- Collected abilities no longer reappear; occasional Mastery II cards improve owned abilities
- Every fourth reward screen attempts to offer a weapon- or ability-synergy choice

- Persistent player health, power, speed, armor, luck and dodge upgrades now remain real advantages
- Opponents scale by visible five-level tiers without copying the player's accumulated build
- Weapon handling values now directly affect attack recovery, making fast and heavy weapons meaningfully different
- Loot screens reveal the next opponent's personality, weapon, damage, reach and handling before selection
- One trivia resurrection refreshes at the start of each five-level venue
- Monte Carlo balance target: roughly 15% completion with strategic reward choices

- Segmented forward-kinematic character rigs with blended poses
- Walk, idle, attack, block, dodge, hit, stumble, fall and get-up motion
- Independent eyes, eyebrows, pupils and mouth expressions
- Weapons and equipment attached to animated hand/head bones
- Short limited-ragdoll transitions on heavy hits
- Cinematic slow motion on lethal blows and animated defeat falls
- Two-sided popularity meter with spectator tomato/trash barrages
- Jump, dive, backstep and evasive stunt motions
- Multi-phase punch and kick choreography with anticipation, impact, recovery and speed smears
- Independent signed popularity meters beneath both fighters' health bars
- Chance-based equipped-weapon throws with spinning flight
- Recognizable flying heads during decapitation finishers
- Proper alternating left/right gait with knee lift, heel travel, arm counter-swing and body weight shift
- Head, torso and limb targeting poses for fists, feet and weapons
- Two-character combat banter, taunts, jokes and low-health begging
- Slower, more readable attack anticipation, impact, recovery and cooldown timing
- Six rare acrobatic attacks: flying side kick, flying knee, spinning heel kick, cartwheel kick, Superman punch and dropkick
- One trivia-based resurrection chance per five-level venue
- 50 hard multiple-choice questions with a 15-second countdown and humorous explanations
- 36 total weapon varieties across improvised, blunt, blade, pole and heavy families
- 30 total hidden abilities with combat, survival, crowd, acrobatic, wrestling and loot effects
- Collision-aware dual speech bubbles with dodge and block reactions
- Rare animated wrestling grabs with human-javelin throws, knee slams and ground slams
- Collision-aware combat spacing keeps fighters apart until a wrestling grab begins
- Centered title-first creator layout with expanded body, head, hair, face, accessory and color options
- Larger half-screen health bars and higher, character-safe event announcements
- Weapon-specific illustrated silhouettes for the full 36-weapon roster
- Fighters reset to opposite arena gates, sprint inward and may open with a flying kick
- Responsive 16:9 arena scaling for desktop, mobile landscape and portrait screens
- 25-level survival run with five clearly previewed CPU difficulty tiers
- Baseline-balanced opponents with independent weapon rolls and bounded map-tier scaling
- Five themed maps changing every five levels: backyard, office, buffet, wedding and birthday party
- Map-specific interactive props, environmental flavor, banners and scenery
- 160 unique dialogue lines across intros, banter, insults, replies, begging, dodges, blocks, grapples and hit reactions
- Shuffled dialogue decks prevent a category from repeating until every line in it has played
- Casual banter now waits 9–16 seconds, pauses while another bubble is visible and receives replies only occasionally
- Ordinary hit chatter reduced to a sparse 20% chance while important combat reactions remain immediate
- Clear arena presentation without the dark vignette overlay
- Dynamic spotlights, animated spectators, camera shake, hit-stop, impact flashes, damage typography, combos, shadows, confetti and cinematic arena grading
- Modular cartoon finishers with detachable body parts
- Animated arena objects, cover, throws, breakage and spectator collateral
- Twenty-five-fight run, character creator, loot, hidden abilities and detailed run stats

Everything is drawn at runtime with the Canvas 2D API, so the project is GitHub Pages-compatible and has no external game-engine dependency.
