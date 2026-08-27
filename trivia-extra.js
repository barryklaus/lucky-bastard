(() => {
  'use strict';
  const bank=window.LB_TRIVIA||(window.LB_TRIVIA=[]),seen=new Set(bank.map(x=>x.q));
  const clean=v=>Number.isFinite(v)?String(Math.round(v*100)/100):String(v);
  function add(q,answer,wrongs,fact){
    if(seen.has(q))return;const a=clean(answer),choices=[a,...wrongs.map(clean)].filter((x,i,all)=>all.indexOf(x)===i);if(choices.length!==4)throw new Error('Trivia choices must be four distinct values: '+q);seen.add(q);bank.push({q,c:choices,a:0,f:fact})
  }
  function wrongNumbers(answer,seed){
    const a=Number(answer),d=1+(seed%9),out=[];[a+d,a-d,a+d*2,a+10+(seed%13),Math.max(0,a-d*3)].forEach(x=>{x=Math.round(x*100)/100;if(x!==a&&!out.includes(x))out.push(x)});return out.slice(0,3)
  }

  // 700 deterministic hard-number questions across eight distinct families.
  for(let i=0;i<100;i++){
    const a=17+i,b=3+(i%13),c=2+(i%8),answer=a*b-c*c;
    add(`Evaluate (${a} × ${b}) − ${c}².`,answer,wrongNumbers(answer,i),`Multiplication and the exponent happen before subtraction. Order of operations has once again rejected improvisation.`)
  }
  for(let i=0;i<100;i++){
    const n=137+i*17,d=7+(i%19),answer=n%d;
    add(`What remainder is left when ${n} is divided by ${d}?`,answer,[((answer+1)%d),((answer+3)%d),((answer+d-1)%d)].filter((x,j,a)=>x!==answer&&a.indexOf(x)===j).concat(wrongNumbers(answer,i)).slice(0,3),`${n} = ${Math.floor(n/d)} × ${d} + ${answer}. The remainder escaped with only ${answer}.`)
  }
  for(let i=0;i<100;i++){
    const n=41+i*5,base=2+(i%7),answer=n.toString(base),candidates=[(n+1).toString(base),(n-1).toString(base),(n+base).toString(base),(n+2).toString(base)].filter(x=>x!==answer);
    add(`Write decimal ${n} in base ${base}.`,answer,candidates.slice(0,3),`${n} in base ${base} is ${answer}. The digits changed uniforms but kept the same value.`)
  }
  for(let i=0;i<100;i++){
    const start=5+i*2,d=2+(i%14),answer=start+d*5,seq=Array.from({length:5},(_,k)=>start+d*k);
    add(`Continue the arithmetic sequence: ${seq.join(', ')}, …`,answer,wrongNumbers(answer,i+4),`Each term increases by ${d}; the next is ${answer}. The sequence believes consistency is a personality.`)
  }
  for(let i=0;i<100;i++){
    const p=5*(2+(i%17)),n=200+i*20,answer=p*n/100;
    add(`What is ${p}% of ${n}?`,answer,wrongNumbers(answer,i+9),`${p}% of ${n} is ${answer}. Percentages are fractions wearing office clothes.`)
  }
  for(let i=0;i<100;i++){
    const w=11+i,h=6+(i%23),area=w*h,perimeter=2*(w+h),askArea=i%2===0,answer=askArea?area:perimeter;
    add(`A rectangle is ${w} by ${h}. What is its ${askArea?'area':'perimeter'}?`,answer,wrongNumbers(answer,i+15),askArea?`Area is ${w} × ${h} = ${area}. The rectangle has been fully monetized.`:`Perimeter is 2(${w} + ${h}) = ${perimeter}. Walking around it was apparently on the exam.`)
  }
  for(let i=0;i<50;i++){
    const people=8+i,answer=people*(people-1)/2;
    add(`If ${people} people each shake hands once with every other person, how many handshakes occur?`,answer,wrongNumbers(answer,i+22),`${people} choose 2 equals ${answer}. Hygiene was not included in the calculation.`)
  }
  for(let i=0;i<50;i++){
    const hour=i%12,minute=(i*7+3)%60,hourLabel=hour||12,raw=Math.abs(30*hour-.5*minute),answer=Math.min(raw,360-raw);
    add(`What is the smaller angle between the clock hands at ${hourLabel}:${String(minute).padStart(2,'0')}?`,answer,wrongNumbers(answer,i+31),`The hour hand moves 0.5° per minute. The smaller angle is ${clean(answer)}°, because clocks quietly contain geometry.`)
  }

  const capitals=[
    ['Mongolia','Ulaanbaatar'],['Bhutan','Thimphu'],['Kyrgyzstan','Bishkek'],['Kazakhstan','Astana'],['Slovenia','Ljubljana'],['Slovakia','Bratislava'],['Moldova','Chișinău'],['Montenegro','Podgorica'],['Burkina Faso','Ouagadougou'],['Côte d’Ivoire','Yamoussoukro'],['Tanzania','Dodoma'],['Burundi','Gitega'],['Belize','Belmopan'],['Suriname','Paramaribo'],['Guyana','Georgetown'],['Sri Lanka','Sri Jayawardenepura Kotte'],['Myanmar','Naypyidaw'],['Palau','Ngerulmud'],['Micronesia','Palikir'],['Vanuatu','Port Vila'],['Madagascar','Antananarivo'],['Mauritania','Nouakchott'],['Brunei','Bandar Seri Begawan'],['Timor-Leste','Dili'],['North Macedonia','Skopje']
  ];
  capitals.forEach((x,i)=>{
    const others=[1,7,13].map(n=>capitals[(i+n)%capitals.length]);
    add(`What is the capital of ${x[0]}?`,x[1],others.map(y=>y[1]),`${x[1]} is the capital of ${x[0]}. Geography has declined your request for easier spelling.`);
    add(`${x[1]} is the capital of which country?`,x[0],others.map(y=>y[0]),`${x[1]} belongs to ${x[0]}. The atlas would like credit for attending.`)
  });

  const elements=[
    ['Antimony','Sb'],['Tungsten','W'],['Mercury','Hg'],['Potassium','K'],['Sodium','Na'],['Silver','Ag'],['Gold','Au'],['Tin','Sn'],['Lead','Pb'],['Iron','Fe'],['Copper','Cu'],['Manganese','Mn'],['Molybdenum','Mo'],['Bismuth','Bi'],['Cobalt','Co'],['Zirconium','Zr'],['Hafnium','Hf'],['Rhenium','Re'],['Osmium','Os'],['Iridium','Ir'],['Tellurium','Te'],['Selenium','Se'],['Gallium','Ga'],['Indium','In'],['Thallium','Tl']
  ];
  elements.forEach((x,i)=>{
    const others=[2,9,16].map(n=>elements[(i+n)%elements.length]);
    add(`Which chemical element has the symbol ${x[1]}?`,x[0],others.map(y=>y[0]),`${x[1]} represents ${x[0]}. Chemistry kept several historical usernames.`);
    add(`What is the chemical symbol for ${x[0]}?`,x[1],others.map(y=>y[1]),`${x[0]} uses ${x[1]}. The periodic table refuses descriptive filenames.`)
  });

  const computing=[
    ['DNS','Domain Name System'],['HTTP','Hypertext Transfer Protocol'],['RAM','Random Access Memory'],['CPU','Central Processing Unit'],['GPU','Graphics Processing Unit'],['SQL','Structured Query Language'],['JSON','JavaScript Object Notation'],['ASCII','American Standard Code for Information Interchange'],['BIOS','Basic Input/Output System'],['URL','Uniform Resource Locator'],['GUI','Graphical User Interface'],['SSH','Secure Shell'],['TLS','Transport Layer Security'],['API','Application Programming Interface'],['IDE','Integrated Development Environment'],['LAN','Local Area Network'],['WAN','Wide Area Network'],['VPN','Virtual Private Network'],['JPEG','Joint Photographic Experts Group'],['PNG','Portable Network Graphics'],['SaaS','Software as a Service'],['SMTP','Simple Mail Transfer Protocol'],['IMAP','Internet Message Access Protocol'],['NAT','Network Address Translation'],['UTF','Unicode Transformation Format']
  ];
  computing.forEach((x,i)=>{
    const others=[3,11,19].map(n=>computing[(i+n)%computing.length]);
    add(`In computing, what does ${x[0]} stand for?`,x[1],others.map(y=>y[1]),`${x[0]} means ${x[1]}. The acronym saved time and then spent it on configuration.`);
    add(`Which abbreviation means “${x[1]}”?`,x[0],others.map(y=>y[0]),`${x[0]} is short for ${x[1]}. Computers adore alphabet soup.`)
  });

  const units=[
    ['electric current','ampere'],['luminous intensity','candela'],['amount of substance','mole'],['frequency','hertz'],['force','newton'],['pressure','pascal'],['energy','joule'],['power','watt'],['electric charge','coulomb'],['voltage','volt'],['capacitance','farad'],['resistance','ohm'],['magnetic flux','weber'],['magnetic flux density','tesla'],['inductance','henry'],['radioactivity','becquerel'],['absorbed radiation dose','gray'],['equivalent radiation dose','sievert'],['catalytic activity','katal'],['illuminance','lux'],['conductance','siemens'],['temperature','kelvin'],['plane angle','radian'],['solid angle','steradian'],['dynamic viscosity','pascal-second']
  ];
  units.forEach((x,i)=>{
    const others=[4,12,20].map(n=>units[(i+n)%units.length]);
    add(`Which SI unit measures ${x[0]}?`,x[1],others.map(y=>y[1]),`${x[0]} is measured in ${x[1]}. Scientists have named the invoice.`);
    add(`The ${x[1]} is an SI unit associated with what?`,x[0],others.map(y=>y[0]),`The ${x[1]} measures ${x[0]}. Metrology remains aggressively specific.`)
  });

  const animals=[
    ['wombat','produces cube-shaped droppings'],['octopus','has three hearts'],['narwhal','has a tusk that is an enlarged tooth'],['koala','has fingerprints similar to humans'],['platypus','has venomous spurs in males'],['axolotl','can regenerate limbs and parts of major organs'],['crow','can remember individual human faces'],['goat','has horizontal rectangular pupils'],['sea cucumber','uses respiratory trees connected to its cloaca'],['cat','lacks a functional sweet-taste receptor'],['sloth','can hold its breath for around forty minutes'],['horned lizard','can squirt blood from its eyes'],['wood frog','can survive with much of its body frozen'],['mantis shrimp','has exceptionally complex color vision'],['lyrebird','can mimic mechanical sounds'],['pistol shrimp','creates a cavitation bubble with its claw'],['greenland shark','may live for several centuries'],['tardigrade','can enter a dried cryptobiotic state'],['hummingbird','can fly backward under its own power'],['electric eel','can generate high-voltage electric discharges'],['emu','has calf muscles suited to running but cannot walk backward easily'],['penguin','has knees hidden inside its body outline'],['butterfly','tastes using receptors on its feet'],['dolphin','can sleep with one brain hemisphere at a time'],['woodpecker','wraps an elongated tongue apparatus around its skull']
  ];
  animals.forEach((x,i)=>{
    const others=[5,13,21].map(n=>animals[(i+n)%animals.length]);
    add(`Which animal ${x[1]}?`,x[0],others.map(y=>y[0]),`The ${x[0]} ${x[1]}. Evolution had an open feature-request queue.`);
    add(`Which claim about the ${x[0]} is accurate?`,x[1],others.map(y=>y[1]),`The ${x[0]} ${x[1]}. Nature continues shipping without patch notes.`)
  });

  add('Which planet in the Solar System has the shortest day?','Jupiter',['Mars','Venus','Mercury'],'Jupiter rotates once in roughly ten hours. The largest planet is apparently late for another appointment.');

  if(bank.length!==1000)throw new Error(`Expected exactly 1000 trivia questions, found ${bank.length}`);
  if(new Set(bank.map(x=>x.q)).size!==1000)throw new Error('Trivia questions must be unique');
  if(bank.some(x=>!Array.isArray(x.c)||x.c.length!==4||new Set(x.c).size!==4||x.a<0||x.a>3||!x.f))throw new Error('Invalid trivia entry detected');
})();
