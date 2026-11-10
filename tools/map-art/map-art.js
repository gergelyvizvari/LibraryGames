// Draws the picture of the home map (src/shell/map/map.webp). Run render.cjs to rebuild the image.
// Everything is generated from the lists below with a fixed random seed, so the picture is the same every time.
let sd=4711;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;const R=(a,b)=>a+rnd()*(b-a);
const pick=a=>a[Math.floor(rnd()*a.length)];
const W=1720,H=900,DK='#33284a';
const f=n=>Math.round(n*10)/10;
function cr(p,closed=false){const n=p.length;let d=`M${f(p[0][0])} ${f(p[0][1])}`;
  const g=i=>closed?p[((i%n)+n)%n]:p[Math.max(0,Math.min(n-1,i))];const m=closed?n:n-1;
  for(let i=0;i<m;i++){const a=g(i-1),b=g(i),c=g(i+1),e=g(i+2);
    d+=`C${f(b[0]+(c[0]-a[0])/6)} ${f(b[1]+(c[1]-a[1])/6)} ${f(c[0]-(e[0]-b[0])/6)} ${f(c[1]-(e[1]-b[1])/6)} ${f(c[0])} ${f(c[1])}`}
  return d+(closed?'Z':'')}
function samp(p,step){const out=[];const n=p.length;const g=i=>p[Math.max(0,Math.min(n-1,i))];let acc=0,prev=null;
  for(let i=0;i<n-1;i++){const a=g(i-1),b=g(i),c=g(i+1),e=g(i+2);
    for(let k=0;k<24;k++){const t=k/24,t2=t*t,t3=t2*t;
      const q=j=>.5*((2*b[j])+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-e[j])*t2+(-a[j]+3*b[j]-3*c[j]+e[j])*t3);
      const pt=[q(0),q(1)];if(prev){acc+=Math.hypot(pt[0]-prev[0],pt[1]-prev[1]);if(acc>=step){out.push([pt[0],pt[1],Math.atan2(pt[1]-prev[1],pt[0]-prev[0])]);acc=0}}prev=pt}}
  return out}
const jit=(p,a)=>p.map(([x,y])=>[x+R(-a,a),y+R(-a,a)]);
function blob(cx,cy,rx,ry,n=9,j=.1){const o=[];const ph=R(0,6.28);for(let i=0;i<n;i++){const a=ph+i/n*6.283,k=1+R(-j,j);o.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k])}return o}
function wob(p,a=1,closed=true){const n=p.length;let d=`M${f(p[0][0])} ${f(p[0][1])}`;const m=closed?n:n-1;
  for(let i=0;i<m;i++){const b=p[i],c=p[(i+1)%n];d+=`Q${f((b[0]+c[0])/2+R(-a,a))} ${f((b[1]+c[1])/2+R(-a,a))} ${f(c[0])} ${f(c[1])}`}return d+(closed?'Z':'')}
const line=(d,w=2,c=DK,o=1,x='')=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${o}" ${x}/>`;
const S=(d,fill,o=1,x='')=>`<path d="${d}" fill="${fill}" opacity="${o}" ${x}/>`;
const B=(p,fill,o=1)=>S(cr(p,true),fill,o);
const P=(p,fill,o=1,a=.8)=>S(wob(p,a),fill,o);
const sh=(x,y,rx,ry,o=.22)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#2c5a3a" opacity="${o}"/>`;
const G=(x,y,s,rot,inner)=>`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s})">${inner}</g>`;
// glossy big eye, as in the book's characters
const eye=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${f(x+r*.12)}" cy="${f(y+r*.1)}" r="${f(r*.72)}" fill="${DK}"/><circle cx="${f(x-r*.18)}" cy="${f(y-r*.25)}" r="${f(r*.28)}" fill="#fff"/><circle cx="${f(x+r*.38)}" cy="${f(y+r*.36)}" r="${f(r*.14)}" fill="#fff"/>`;

// ---------- things (no outlines: a base tone, a lit side, a shaded side) ----------
const CAN=[['#2f7f58','#58a866'],['#27725a','#4a9a66'],['#3d8c55','#72b96a'],['#1f6659','#3f8f68']];
function tree(x,y,s=1,c=pick(CAN)){return G(x,y,s,R(-4,4),sh(2,1,12,4)+P([[-2,0],[-1.6,-12],[1.8,-12],[2.2,0]],'#6d4b3c')
  +B(blob(0,-25,14.5,15.5,9,.08),c[0])+B(blob(-3.5,-29,9,9,8,.1),c[1],.85)+B(blob(-5.5,-32,4,3.6,6,.1),'#b9e08a',.5))}
function pine(x,y,s=1,c=pick([['#1f6a5c','#2f8a6c'],['#1b5f5c','#2a7d6b'],['#23705a','#369267']])){let o=sh(1,1,10,3.4)+P([[-1.8,0],[-1.5,-8],[1.5,-8],[1.8,0]],'#5d4038');
  [[12,-6,-23],[9.6,-16,-32],[7,-26,-41]].forEach(([w,b,t])=>{o+=P([[-w,b],[0,t],[w,b],[0,b+2.5]],c[0],1,.6)+P([[-w,b],[0,t],[0,b+2.5]],c[1],.9,.5)});
  return G(x,y,s,R(-3,3),o)}
function mtn(x,y,w,h,num,face,c='#6f5f9c',cd='#54467f'){const px=w*R(-.05,.05);
  const Lm=[-w*.29,-h*.5],Rm=[w*.3,-h*.48];const pts=[[-w/2,0],Lm,[px,-h],Rm,[w/2,0],[0,5]];
  let o=sh(0,3,w*.52,7,.18)+P(pts,c,1,2)+P([[px,-h],Rm,[w/2,0],[w*.06,3],[px+w*.07,-h*.5]],cd,1,2);
  const L=[px+(Lm[0]-px)*.56,-h+h*.5*.56],Rr=[px+(Rm[0]-px)*.56,-h+h*.52*.56];
  o+=S(`M${f(px)} ${f(-h)} L${f(L[0])} ${f(L[1])} L${f(px-w*.1)} ${f(-h*.66)} L${f(px-w*.03)} ${f(-h*.76)} L${f(px+w*.04)} ${f(-h*.64)} L${f(px+w*.1)} ${f(-h*.75)} L${f(Rr[0])} ${f(Rr[1])}Z`,'#ffffff');
  o+=S(`M${f(px)} ${f(-h)} L${f(Rr[0])} ${f(Rr[1])} L${f(px+w*.1)} ${f(-h*.75)} L${f(px+w*.04)} ${f(-h*.64)} L${f(px+w*.03)} ${f(-h*.86)}Z`,'#d8d1ee');
  if(face){const fy=-h*.44;o+=line(`M-13 ${f(fy)} q4.5 5 9 0`,2.2)+line(`M3 ${f(fy)} q4.5 5 9 0`,2.2)+line(`M-4 ${f(fy+9)} q3.5 4 7 0`,2)
    +`<circle cx="-16" cy="${f(fy+8)}" r="4.5" fill="#f08aa6" opacity=".7"/><circle cx="15" cy="${f(fy+8)}" r="4.5" fill="#f08aa6" opacity=".7"/>`}
  if(num)o+=`<text x="-2" y="${f(-h*.1)}" text-anchor="middle" font-family="SC" font-weight="800" font-size="${f(h*.27)}" fill="#fff6dc">${num}</text>`;
  return G(x,y,1,0,o)}
const rock=(x,y,s=1)=>G(x,y,s,0,sh(0,1,10,3,.18)+B(blob(0,-6,9,7.5,8,.08),'#b7b2d0')+B(blob(-2,-8,5,3.6,7,.1),'#d6d2e6',.8));
const ROOF=[['#8e3b4c','#6e2c40'],['#a8484a','#86363f'],['#5c3a66','#462b52'],['#7a3346','#5c2638']];
function house(x,y,w,h,tower=false){const c=pick(ROOF);let o=sh(1,1,w*.62,4)+S(`M${-w/2} 0 V${-h} H${w/2} V0Z`,'#f7edd2')+S(`M${f(w*.14)} 0 V${-h} H${w/2} V0Z`,'#e6d6ae');
  const rh=tower?h*.7:w*.42;
  if(tower)o+=P([[-w/2-2.5,-h],[0,-h-rh],[w/2+2.5,-h]],c[0],1,.5)+P([[0,-h-rh],[w/2+2.5,-h],[w*.1,-h]],c[1],1,.4);
  else o+=P([[-w/2-3,-h],[-w/2+5,-h-rh],[w/2-5,-h-rh],[w/2+3,-h]],c[0],1,.5)+P([[w*.12,-h-rh],[w/2-5,-h-rh],[w/2+3,-h],[w*.2,-h]],c[1],1,.4);
  o+=`<path d="M-3 0 v-7 q3 -4.5 6 0 v7Z" fill="#5d3b40" transform="translate(${f(-w*.12)} 0)"/>`;
  const nw=Math.max(1,Math.round(w/11));for(let i=0;i<nw;i++){const wx=-w/2+(i+.5)*w/nw;o+=`<path d="M-1.7 0 v-4 q1.7 -2.6 3.4 0 v4Z" fill="#5a4668" transform="translate(${f(wx)} ${f(-h+11)})"/>`}
  return G(x,y,1,R(-2,2),o)}
function book(x,y,s){let o=sh(0,10,40,7)+P([[-40,-10],[0,-3],[40,-11],[41,14],[0,22],[-41,15]],'#5c3a66');
  o+=S(`M0 -4 C-12 -14 -28 -14 -37 -11 L-37 11 C-28 8 -12 8 0 18Z`,'#fffaea')+S(`M0 -4 C12 -14 28 -15 37 -12 L37 10 C28 8 12 8 0 18Z`,'#f3e6c4');
  [[-30,-5],[-30,1],[-30,7]].forEach(([a,b],i)=>o+=line(`M${a} ${b} q10 -3 ${22-i*3} 3`,1.4,'#c9b48e',.9));
  o+=`<text x="19" y="6" text-anchor="middle" font-family="SC" font-weight="800" font-size="17" fill="#a8484a" transform="rotate(-6 19 0)">Aa</text>`;return G(x,y,s,-4,o)}
function monster(x,y,s=1){const bp=[[-17,0],[-20,-20],[-13,-39],[0,-45],[13,-40],[20,-21],[17,0],[0,3]];
  let o=sh(0,2,19,5)+P([[-11,-39],[-15,-53],[-5,-43]],'#f08aa6')+P([[11,-40],[14,-54],[4,-43]],'#f08aa6');
  o+=B(bp,'#8a67e8')+B([[6,-43],[15,-37],[20,-21],[17,0],[8,1],[13,-20]],'#6a4ccf',.7)+B(blob(-7,-36,6,4,7,.1),'#b49cf5',.6)+B(blob(0,-8,9,6,8,.06),'#b9a2f6',.55);
  o+=eye(-7,-27,8)+eye(8.5,-27,8)+`<path d="M-5 -14 Q1.5 -7 8 -14Z" fill="${DK}"/><circle cx="-14" cy="-17" r="3" fill="#f08aa6" opacity=".7"/><circle cx="15.5" cy="-17" r="3" fill="#f08aa6" opacity=".7"/>`;
  return G(x,y,s,-3,o)}
function rabbit(x,y,s=1,flip=1){let o=sh(0,1,12,3.2)+B(blob(9,-23,2.8,8.5,7,.05),'#fff')+B(blob(13.5,-22,2.8,8.5,7,.05),'#fff')+B(blob(13.5,-22,1.2,5.5,6,.05),'#f6b3c4');
  o+=B(blob(-2,-9,11.5,9,8,.05),'#fff')+B(blob(-4,-5,8,4.5,7,.05),'#e9e3f1',.8)+B(blob(11,-13,6.8,6.2,8,.05),'#fff')+`<circle cx="-13" cy="-10" r="3.8" fill="#fff"/><circle cx="12.5" cy="-14" r="1.7" fill="${DK}"/><circle cx="16.5" cy="-11.5" r="1.3" fill="#f08aa6"/>`;
  return `<g transform="translate(${x} ${y}) scale(${flip*s} ${s})">${o}</g>`}
function swan(x,y,s,flip=1){let o=S(`M-14 0 C-16 -9 -4 -12 6 -9 C12 -8 15 -3 12 0Z`,'#fff')+S(`M-12 0 C-8 -4 4 -4 12 0Z`,'#dfe9f3')+line(`M8 -6 C16 -12 6 -22 13 -26`,3.6,'#fff',1)+`<path d="M14 -27.5 l7 2 l-7 2Z" fill="#f29a3a"/><circle cx="13" cy="-26" r="1" fill="${DK}"/>`;
  return `<g transform="translate(${x} ${y}) scale(${flip*s} ${s})"><g transform="scale(1 -1) translate(0 -3)" opacity=".3">${o}</g>${o}</g>`}
function lily(x,y,s=1,fl=false){let o=S(`M0 0 L9 -3 A9.5 6 0 1 0 9 3Z`,'#4da866')+S(`M0 0 L-9 -2 A9.5 6 0 0 0 -2 6Z`,'#7fc878',.7);
  if(fl)o+=`<circle cx="-2" cy="-1" r="3.4" fill="#f6a7c1"/><circle cx="-2" cy="-1" r="1.3" fill="#ffe27a"/>`;return G(x,y,s,R(0,360),o)}
function frog(x,y,s=1){let o=lily(0,2,1.7)+B(blob(0,-6,8,6.5,8,.05),'#7cc552')+B(blob(0,-3,5,3,7,.05),'#c8e88a',.8)+`<circle cx="-4.5" cy="-12" r="4" fill="#7cc552"/><circle cx="4.5" cy="-12" r="4" fill="#7cc552"/>`
  +eye(-4.5,-12.5,2.9)+eye(4.5,-12.5,2.9)+line(`M-3.5 -5.5 q3.5 2.5 7 0`,1.3);return G(x,y,s,0,o)}
function owl(x,y,s=1){let o=P([[-8,-19],[-9,-27],[-2,-21]],'#9a6a48')+P([[8,-19],[9,-27],[2,-21]],'#9a6a48')+B(blob(0,-11,9.5,11.5,8,.04),'#b5825a')+B(blob(5,-9,4.5,8,7,.05),'#94694a',.7)+B(blob(0,-6,5,5.5,7,.05),'#f1dcb4')
  +eye(-4.2,-15,4.6)+eye(4.2,-15,4.6)+`<path d="M-1.6 -11 l1.6 3.2 l1.6 -3.2Z" fill="#f29a3a"/>`;return G(x,y,s,0,o)}
function mushroom(x,y,s=1){return G(x,y,s,R(-8,8),P([[-2.5,0],[-2,-7],[2,-7],[2.5,0]],'#fbf1dc')+S(`M-9 -6 Q-8 -17 0 -17 Q8 -17 9 -6Z`,'#d9506a')+S(`M2 -17 Q8 -16 9 -6 H4 Q6 -12 2 -17Z`,'#b63c5c',.8)
  +`<circle cx="-4" cy="-11" r="1.6" fill="#fff"/><circle cx="2" cy="-13" r="1.3" fill="#fff"/><circle cx="-1" cy="-8.5" r="1" fill="#fff"/>`)}
function whale(x,y,s=1){const bp=[[-34,-2],[-30,-16],[-12,-24],[10,-22],[26,-12],[36,-12],[30,-2],[14,4],[-14,6]];
  let o=line(`M-16 -24 q-3 -12 -11 -15 M-14 -24 q1 -13 9 -17`,2.4,'#fff',.95)+P([[34,-12],[47,-23],[43,-11],[48,-2]],'#2a5f9a');
  o+=B(bp,'#3a74b4')+B([[-33,0],[-14,6],[14,4],[24,0],[0,-3],[-24,-5]],'#cfe6f2')+B(blob(-8,-18,12,4,8,.1),'#6aa0d6',.6);
  o+=eye(-21,-10,3.6)+line(`M-30 -3 q5 4 11 2`,1.5)+`<circle cx="-15" cy="-4" r="2.6" fill="#f08aa6" opacity=".8"/>`+line(`M-46 5 q8 -3 16 0 M20 9 q8 -3 16 0`,1.6,'#fff',.85);
  return G(x,y,s,-4,o)}
function palm(x,y,s=1){let o=sh(1,1,9,3,.2)+line(`M0 0 Q5 -14 1 -27`,3.6,'#a8744e',1)+line(`M1 -1 Q6 -14 2 -26`,1.4,'#7d5238',.8);
  [[-19,-3],[-13,-17],[2,-20],[15,-14],[19,-1]].forEach(([a,b],i)=>{o+=S(`M1 -27 Q${f(a*.5)} ${f(-27+b*.9-5)} ${a} ${-27+b+9} Q${f(a*.55)} ${f(-27+b*.5+2)} 1 -27Z`,i%2?'#2f8a5c':'#4aa862')});
  return G(x,y,s,R(-8,8),o+`<circle cx="2" cy="-25" r="2" fill="#7d5238"/>`)}
function lighthouse(x,y,s=1){let o=S(`M0 -62 L-74 -88 L-74 -42Z`,'#fff3a8',.4)+S(`M0 -62 L66 -94 L74 -54Z`,'#fff3a8',.33)+B(blob(0,2,26,9,9,.08),'#9a94b8')+B(blob(-6,0,14,5,8,.1),'#bdb8d4',.9);
  o+=S(`M-12 0 L-8 -54 L8 -55 L12 0Z`,'#fffaf0')+S(`M-11.3 -9 L11.3 -10 L10.2 -23 L-10.3 -22Z M-9.5 -34 L9.5 -35 L8.6 -47 L-8.6 -46Z`,'#d9506a')+S(`M3 0 L3 -55 L8 -55 L12 0Z`,'#5c3a66',.22);
  o+=S(`M-10 -54 V-58 H10 V-55Z`,'#4a3a5c')+S(`M-6 -58 V-68 H6 V-59Z`,'#ffe27a')+P([[-9,-68],[0,-80],[9,-69]],'#a8484a',1,.4)+`<path d="M-3 0 v-8 q3 -4 6 0 v8Z" fill="#5d3b40"/>`;
  return G(x,y,s,3,o)}
function ship(x,y,s=1){let o=line(`M-34 6 q8 -3 16 0 M14 8 q8 -3 16 0`,1.6,'#fff',.85)+line(`M0 -4 V-44`,2.2,'#5d3b40')+P([[2,-42],[22,-12],[2,-10]],'#fffaf0')+P([[-2,-36],[-17,-11],[-2,-10]],'#f1e2bd')+P([[0,-44],[10,-47],[0,-50]],'#d9506a');
  o+=S(`M-24 -6 Q-20 6 -12 6 H14 Q22 6 26 -7Z`,'#8e3b4c')+S(`M-23 -3 Q-20 6 -12 6 H14 Q21 6 24 -2Z`,'#6e2c40');return G(x,y,s,-5,o)}
function turtle(x,y,s=1){let o=sh(0,1,13,3.5,.2)+B(blob(13,-5,5,4.2,7,.05),'#9ad06a')+eye(15,-6.5,1.9)+B(blob(-8,0,3.5,2.6,6,.05),'#9ad06a')+B(blob(7,0,3.5,2.6,6,.05),'#9ad06a')
  +S(`M-12 -1 Q-11 -15 0 -15 Q11 -15 11 -1Z`,'#2f8a5c')+S(`M-9 -3 Q-8 -12 0 -12 Q-4 -8 -3 -3Z`,'#58b070',.8)+line(`M-6 -3 l3 -6 h6 l3 6`,1.2,'#1f6659',.8);return G(x,y,s,0,o)}
function compass(x,y,s=1){let o=`<circle r="25" fill="#fffaf0" opacity=".9"/><circle r="19" fill="none" stroke="#8c7fb4" stroke-width="1.6"/>`;
  [[0,'#5c3a66'],[90,'#8c7fb4'],[180,'#8c7fb4'],[270,'#8c7fb4']].forEach(([a,c])=>o+=`<g transform="rotate(${a})"><path d="M0 -31 L5 -4 L0 0Z" fill="${c}"/><path d="M0 -31 L-5 -4 L0 0Z" fill="${c}" opacity=".6"/></g>`);
  [45,135,225,315].forEach(a=>o+=`<g transform="rotate(${a})"><path d="M0 -17 L3 -3 L0 0 L-3 -3Z" fill="#b7b2d0"/></g>`);
  return G(x,y,s,-8,o)}
function flower(x,y,c){let o='';for(let i=0;i<5;i++){const a=i/5*6.283+R(0,.4);o+=`<circle cx="${f(Math.cos(a)*3.2)}" cy="${f(-4+Math.sin(a)*3.2)}" r="${f(R(2.1,2.7))}" fill="${c}"/>`}
  return G(x,y,R(.8,1.2),R(-12,12),o+`<circle cy="-4" r="1.7" fill="#ffe27a"/>`)}
const tuft=(x,y)=>G(x,y,R(.8,1.3),R(-10,10),line(`M-4 0 q-1 -5 -3 -7 M0 0 q0 -6 1 -9 M4 0 q1 -4 4 -6`,1.6,'#8fb548',.9));
// a row of rounded humps: the book's way of drawing hills
function ridge(x,y,w,n,g='rgL'){let d=`M${f(x)} ${f(y+18)}`;const hw=w/n;for(let i=0;i<n;i++){d+=`Q${f(x+i*hw+hw/2+R(-4,4))} ${f(y+18-R(26,44))} ${f(x+(i+1)*hw)} ${f(y+18+R(-3,3))}`}
  return `<path d="${d} L${f(x+w)} ${f(y+52)} L${f(x)} ${f(y+52)}Z" fill="url(#${g})"/>`}
// a hedge of small dark bumps along a curve
function hedge(pts,c='#2f7f58',c2='#58a866'){let o='';samp(pts,13).forEach(([x,y])=>{const r=R(7,10);o+=`<circle cx="${f(x+R(-2,2))}" cy="${f(y+R(-2,2))}" r="${f(r)}" fill="${c}"/><circle cx="${f(x-2)}" cy="${f(y-3)}" r="${f(r*.5)}" fill="${c2}" opacity=".7"/>`});return o}
function starPts(r,ri){let p=[];const ph=-Math.PI/2;for(let i=0;i<10;i++){const a=ph+i*Math.PI/5,k=(i%2?ri:r);p.push([Math.cos(a)*k,Math.sin(a)*k])}return p}
function star(x,y,st){
  if(st==='next')return G(x,y,1,0,`<circle r="27" fill="#fff8e0" opacity=".45"/><circle r="27" fill="none" stroke="#fffaf0" stroke-width="2" stroke-dasharray="5 6"/><ellipse cx="1" cy="4" rx="19" ry="18" fill="${DK}" opacity=".25"/><circle r="19" fill="#7c5ce0"/><path d="M-14 -12 A19 19 0 0 1 12 -15 A24 24 0 0 0 -14 -12Z" fill="#a48cf0" opacity=".8"/><path d="M-6 -9.5 L10 0 L-6 9.5Z" fill="#fff" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>`);
  const sp=starPts(14,6.8),d=`M${sp.map(p=>p.map(f).join(' ')).join('L')}Z`;const half=`M0 -14 L${f(sp[1][0])} ${f(sp[1][1])} L${f(sp[2][0])} ${f(sp[2][1])} L${f(sp[3][0])} ${f(sp[3][1])} L${f(sp[4][0])} ${f(sp[4][1])} L0 6.8 L0 0Z`;
  if(st==='done')return G(x,y,1.05,R(-12,12),`<path d="${d}" transform="translate(1 3.5)" fill="${DK}" opacity=".25" stroke="${DK}" stroke-width="4" stroke-linejoin="round"/><path d="${d}" fill="#ffd24a" stroke="#ffd24a" stroke-width="4.5" stroke-linejoin="round"/><path d="${half}" fill="#f2a71b" opacity=".75"/><circle cx="-4" cy="-4" r="2.2" fill="#fff7c8"/>`);
  return G(x,y,.92,R(-12,12),`<path d="${d}" transform="translate(1 3.5)" fill="${DK}" opacity=".2" stroke="${DK}" stroke-width="4" stroke-linejoin="round"/><path d="${d}" fill="#fffaf0" stroke="#fffaf0" stroke-width="4.5" stroke-linejoin="round"/><path d="${half}" fill="#d9d3e6" opacity=".7"/>`)}
function label(x,y,lines,subt,col=DK){let o='';lines.forEach((t,i)=>o+=`<text y="${i*23}" text-anchor="middle" font-family="SC" font-weight="800" font-size="22" letter-spacing="3" fill="${col}">${t}</text>`);
  return `<g transform="translate(${x} ${y})">${o}<text y="${(lines.length-1)*23+19}" text-anchor="middle" font-family="Ital" font-size="16.5" fill="${col}" opacity=".85">${subt}</text></g>`}

// ---------- the map ----------
const river=[[372,236],[440,322],[520,398],[640,420],[760,400],[900,430],[1020,400],[1140,360],[1210,300],[1262,262]];
const outflow=[[1440,292],[1500,340],[1500,410],[1540,480],[1590,548],[1616,606]];
const stream=[[238,246],[262,380],[236,470],[214,540],[196,600]];
const seaL=[[-60,588],[60,574],[170,590],[262,640],[318,712],[346,800],[366,990],[-60,990]];
const seaR=[[1780,584],[1650,582],[1540,612],[1452,682],[1416,790],[1400,990],[1780,990]];
const lake=[[1262,250],[1290,196],[1352,172],[1420,184],[1462,228],[1456,286],[1404,322],[1332,326],[1280,300]];
let g='',objs=[];const put=(y,s)=>objs.push([y,s]);

// ground: yellow-green, with tonal areas and rows of humps
g+=`<rect x="-40" y="-40" width="${W+80}" height="${H+80}" fill="#c5d86b"/>`;
[[300,190,330,180,'#a9c95c',.9],[790,200,250,180,'#a4c75a',.95],[1380,250,230,160,'#b4d062',.8],[560,655,200,112,'#d9e67c',.9],[1004,660,180,98,'#e2ec86',.95],[1200,520,240,110,'#b3cf60',.7],[800,545,280,80,'#b6d162',.7],[100,440,170,120,'#b0cd5e',.7],[1620,330,130,220,'#b0cd5e',.7],[1440,690,120,90,'#eadf8c',.6]]
 .forEach(([x,y,rx,ry,c,o])=>g+=B(blob(x,y,rx,ry,12,.14),c,o));
[[40,330,200,4,'rgL'],[420,470,230,5,'rgD'],[700,505,260,5,'rgL'],[1080,470,240,5,'rgD'],[1130,80,230,5,'rgL'],[1540,150,180,4,'rgD'],[1560,420,150,3,'rgL'],[20,90,90,2,'rgD'],[520,70,130,3,'rgL'],[960,50,150,3,'rgD'],[1210,560,200,4,'rgL'],[720,720,170,4,'rgD'],[1160,740,180,4,'rgL'],[1250,410,170,4,'rgL'],[30,480,150,3,'rgL']]
 .forEach(([x,y,w,n,gr])=>g+=ridge(x,y,w,n,gr));
// The strip along the bottom was added later; it draws with its own seed so the rest of the picture stays as it was.
{const keep=sd;sd=977;[[430,812,190,4,'rgL'],[900,826,220,5,'rgD'],[1190,838,170,4,'rgL'],[640,850,150,3,'rgD']].forEach(([x,y,w,n,gr])=>g+=ridge(x,y,w,n,gr));
 [[520,862],[760,842],[1010,870],[1150,812],[1300,880],[860,880]].forEach(([x,y])=>g+=tuft(x,y));sd=keep}

// seas: sand rim, shallows, deeper water
[['cL',seaL,[[40,650],[120,770],[230,700],[300,775],[70,720],[60,850],[250,860],[160,880]]],['cR',seaR,[[1520,700],[1610,640],[1680,760],[1560,770],[1500,850],[1640,860]]]].forEach(([id,p,wv])=>{
  g+=line(cr(p,true),30,'#f6e28a',1)+line(cr(jit(p,4),true),40,'#f6e28a',.45)+S(cr(p,true),'#27aec4')+`<clipPath id="${id}"><path d="${cr(p,true)}"/></clipPath>`;
  let o=line(cr(p,true),34,'#5fd0d6',.75)+line(cr(p,true),12,'#b5f0ea',.8);
  const c=p.reduce((a,q)=>[a[0]+q[0]/p.length,a[1]+q[1]/p.length],[0,0]);o+=B(blob(c[0],c[1]+40,150,90,10,.15),'#1a94b6',.6);
  g+=`<g clip-path="url(#${id})">${o}</g>`;wv.forEach(([x,y])=>g+=line(`M${x} ${y} q5 -5 10 0 q5 5 10 0`,2,'#e9fbf8',.9))});
// rivers: pale bank, blue ribbon, light middle
const riv=(p,w)=>line(cr(p),w+6,'#d7f0d0',.9)+line(cr(p),w,'#63c3dc',1)+line(cr(jit(p,2)),w*.36,'#a5e2ec',.8);
g+=riv(stream,9)+riv(river,18)+riv(outflow,16);
// lake
g+=line(cr(lake,true),12,'#d7f0d0',.9)+S(cr(lake,true),'#4fbdd6')+`<clipPath id="cK"><path d="${cr(lake,true)}"/></clipPath><g clip-path="url(#cK)">${line(cr(lake,true),20,'#8adbe6',.75)}${B(blob(1366,262,60,34,9,.1),'#35a6c8',.5)}</g>`;
g+=swan(1340,262,1.25,1)+swan(1392,262,1.25,-1)+lily(1310,210,1.2,true)+lily(1420,216,1.2,true)+lily(1306,300,1.1)+lily(1424,300,1.1)+frog(1366,208,1.35);
[[1272,214],[1280,206],[1452,300],[1446,308]].forEach(([x,y])=>g+=line(`M${x} ${y} q-2 -10 1 -20`,1.8,'#2f7f58',1)+`<ellipse cx="${x+1}" cy="${y-21}" rx="2.4" ry="5.5" fill="#6d4b3c"/>`);

// stepping-stone paths
const roads=[[[596,606],[625,520],[640,462],[640,420],[640,380],[676,338],[716,312]],[[640,384],[566,340],[506,300],[470,262]],
 [[1004,604],[1030,520],[1036,470],[1031,438],[1020,400],[1009,362],[990,326],[940,300],[896,292]],[[1006,350],[1058,304],[1124,270],[1186,244],[1242,226]],
 [[660,654],[760,676],[862,662],[934,650]],[[486,668],[420,694],[352,704]],[[1072,660],[1180,690],[1300,668],[1410,654],[1462,646]]];
roads.forEach(r=>samp(r,13).forEach(([x,y,a])=>{if((Math.abs(x-640)<10&&Math.abs(y-420)<28)||Math.hypot(x-1020,y-400)<28)return;
  g+=`<ellipse cx="${f(x+R(-2,2))}" cy="${f(y+R(-2,2))}" rx="${f(R(3.6,5.2))}" ry="${f(R(2.6,3.6))}" fill="#f4ebc6" transform="rotate(${f(a*57.3+R(-20,20))} ${f(x)} ${f(y)})"/>`}));
// bridges exactly where the paths cross the river: one of stone, one of planks
g+=G(640,420,1,0,`<path d="M-12 -27 Q-15 0 -12 27 H12 Q15 0 12 -27Z" fill="#2c5a3a" opacity=".25" transform="translate(2 3)"/><path d="M-12 -27 Q-15 0 -12 27 H12 Q15 0 12 -27Z" fill="#c9c4dc"/><path d="M-12 -27 Q-15 0 -12 27 H-7 Q-10 0 -7 -27Z" fill="#9a94b8"/><path d="M12 -27 Q15 0 12 27 H7 Q10 0 7 -27Z" fill="#9a94b8"/>`+[-16,-5,6,17].map(q=>`<rect x="-5" y="${q}" width="${f(R(4,6))}" height="3" rx="1.5" fill="#b0aac8"/>`).join(''));
g+=G(1020,400,1,-16,`<rect x="-11" y="-27" width="22" height="54" rx="2" fill="#2c5a3a" opacity=".25" transform="translate(2 3)"/><rect x="-11" y="-27" width="22" height="54" rx="2" fill="#c08a58"/>`+[-21,-12,-3,6,15].map(q=>`<rect x="-11" y="${q}" width="22" height="2" fill="#8a5a3c" opacity=".7"/>`).join('')+`<rect x="-13" y="-28" width="3.4" height="56" rx="1.7" fill="#7d5238"/><rect x="9.6" y="-28" width="3.4" height="56" rx="1.7" fill="#7d5238"/>`);
g+=line(`M344 706 L300 716`,5,'#c08a58',1);

for(let i=0;i<70;i++){const x=R(20,W-20),y=R(40,780);
  const no=(x<360&&y>560)||(x>1400&&y>570)||Math.hypot((x-1362)/125,(y-250)/95)<1||Math.hypot((x-290)/230,(y-190)/130)<1||Math.hypot((x-790)/175,(y-205)/145)<1||Math.hypot((x-560)/120,(y-660)/80)<1;
  if(!no)g+=tuft(x,y)}

// --- Számhegyek
put(150,mtn(190,150,124,100,null,false,'#8274ad','#685a94'));put(140,mtn(420,140,118,94,null,false,'#8a7cb4','#6e609a'));
put(250,mtn(170,250,156,132,'1',true));put(236,mtn(304,236,166,164,'2',true,'#65558f','#4c3f75'));put(262,mtn(440,262,154,138,'3',true,'#756598','#5a4b84'));
[[70,262,1.1],[100,270,.8],[250,268,.9],[366,268,1],[522,262,1.1],[548,270,.8]].forEach(([x,y,s])=>put(y+12,rock(x,y,s)));
[[86,300],[112,316],[540,300],[566,312]].forEach(([x,y])=>put(y,pine(x,y,R(.9,1.1))));
// --- Útvesztő-erdő
{const cx=790,cy=206;g+=B(blob(cx,cy,166,132,14,.08),'#2f7f58')+B(blob(cx,cy-6,150,112,13,.08),'#27725a',.7)+B(blob(cx,cy+4,66,54,11,.05),'#d9e67c');
 let sp=[];for(let t=0;t<=2.75*6.283;t+=.33){const r=6+t*3.05;sp.push([cx+Math.cos(t+1.2)*r*1.08,cy+4+Math.sin(t+1.2)*r*.86])}
 g+=line(cr(sp),10,'#1f6659',1)+line(cr(sp.map(([x,y])=>[x-1,y-1.5])),5,'#3d8c55',1);
 let n=0,tries=0;const placed=[];while(n<40&&tries<1200){tries++;const a=R(0,6.283),k=R(.55,1);const x=cx+Math.cos(a)*170*k,y=cy+14+Math.sin(a)*128*k;
   if(Math.hypot((x-cx)/78,(y-cy-8)/70)<1)continue;if(placed.some(([px,py])=>Math.hypot(px-x,py-y)<24))continue;
   if(Math.hypot(x-716,y-312)<30||Math.hypot(x-896,y-292)<30||y<50)continue;
   placed.push([x,y]);n++;put(y,rnd()<.4?pine(x,y,R(1,1.3)):tree(x,y,R(1,1.3)))}
 put(cy+62,mushroom(cx-78,cy+62,1.1));put(cy+70,mushroom(cx+70,cy+70,.95));put(cy+68,mushroom(cx-66,cy+68,.8));put(cy-30,owl(cx+96,cy-58,1.7));}
// --- Mesefalu: a close cluster of cream houses with dark red roofs
[[478,618,26,22],[506,606,18,30,1],[532,614,30,24],[566,600,22,34,1],[596,612,32,26],[632,624,24,22],[470,660,30,24],[660,660,26,24],[648,700,20,32,1],[500,716,28,22],[620,726,30,24],[474,700,18,20]]
 .forEach(([x,y,w,h,t])=>put(y,house(x,y,w*1.15,h*1.15,!!t)));
put(674,book(560,668,.8));put(740,monster(566,742,1.1));
[[440,640],[694,626],[446,742],[690,744]].forEach(([x,y],i)=>put(y,i%2?pine(x,y,1.1):tree(x,y,1.05)));
g+=`<circle cx="570" cy="548" r="5" fill="#fff" opacity=".85"/><circle cx="577" cy="538" r="6.5" fill="#fff" opacity=".85"/><circle cx="588" cy="530" r="5" fill="#fff" opacity=".85"/>`;
// --- Fürge rét: a light glade ringed by a low hedge
g+=hedge([[858,700],[850,650],[880,610],[940,592],[990,590]])+hedge([[1040,592],[1100,600],[1150,636],[1160,690],[1130,734],[1070,752]])+hedge([[920,746],[980,758],[1030,756]]);
for(let i=0;i<34;i++){const a=R(0,6.283),k=Math.sqrt(R(.02,1));const x=1004+Math.cos(a)*128*k,y=670+Math.sin(a)*66*k;
  if(Math.hypot(x-1004,y-640)<24)continue;put(y,flower(x,y,pick(['#f6a7c1','#ffffff','#ffffff','#f2a71b','#b79cf0','#ffe27a'])))}
put(650,rabbit(940,650,1.5,1));put(708,rabbit(1070,708,1.45,-1));put(634,rabbit(1088,634,1.1,1));
// --- Felfedezők partja
put(640,lighthouse(1500,640,1.2));put(672,palm(1440,676,1.3));put(742,palm(1408,742,1.15));put(628,palm(1566,620,1.1));put(708,turtle(1456,716,1.5));
g+=ship(1606,726,1.3)+compass(1662,648,.85)+B(blob(1690,760,12,8,8,.1),'#9a94b8')+B(blob(1546,790,14,8,8,.1),'#9a94b8');
g+=line(`M1372 598 q20 -14 44 -4 q20 8 34 -8`,1.8,DK,.5,'stroke-dasharray="3 7"')+line(`M1364 592 l12 12 M1376 592 l-12 12`,3,'#d9506a',1);
// --- Betűtenger
[['A',76,690,-12],['B',196,736,8],['C',96,790,-6]].forEach(([ch,x,y,r])=>{const t=`<text text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="74"`;
  g+=`<g transform="translate(${x} ${y}) rotate(${r})">${t} stroke="#f6e28a" stroke-width="12" stroke-linejoin="round" fill="#f6e28a">${ch}</text>${t} fill="#7cc552">${ch}</text>${t} fill="#4da866" opacity=".5" transform="translate(2 2)" clip-path="inset(50% 0 0 0)">${ch}</text></g>`});
g+=palm(84,640,.95)+palm(214,690,.9)+whale(268,770,1.25)+B(blob(30,610,12,7,8,.1),'#9a94b8')+B(blob(316,790,10,6,8,.1),'#9a94b8');
g+=G(300,712,1,-8,P([[-12,0],[12,0],[7,7],[-7,7]],'#fffaf0')+P([[0,0],[0,-17],[11,-2]],'#fffaf0')+P([[0,0],[0,-17],[4,-2]],'#e6dcc8'));
// loose pines in small groups, as on the book's map
[[60,400],[86,412],[1180,150],[1210,162],[1196,136],[1600,230],[1632,246],[1660,470],[1632,486],[1250,490],[1282,476],[356,480],[380,494],[1150,580],[600,120],[624,132],[1010,110],[760,770],[790,782],[1250,770],[1286,782],[900,540],[1680,110],[420,850],[446,864],[1340,846],[1366,860],[1316,866]]
 .forEach(([x,y],i)=>put(y,i%5===4?tree(x,y,R(1,1.2)):pine(x,y,R(.95,1.25))));
objs.sort((a,b)=>a[0]-b[0]).forEach(o=>g+=o[1]);

// corner cloud with the title ribbon
{const cl=[[1560,-10,60],[1630,6,70],[1700,20,64],[1500,-20,44],[1590,40,40],[1668,58,44],[1724,70,40]];let o='';cl.forEach(([x,y,r])=>o+=`<circle cx="${x}" cy="${y+70}" r="${r}" fill="#fff"/>`);cl.slice(0,3).forEach(([x,y,r])=>o+=`<circle cx="${x+6}" cy="${y+82}" r="${r*.7}" fill="#e6ecf7" opacity=".6"/>`);
 g+=o}

// Labels, the title ribbon and the game stars are not part of the picture: the app draws them on top (src/shell/map).
const defs=`<defs>
<linearGradient id="rgL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcea7e"/><stop offset=".45" stop-color="#d2e274" stop-opacity=".7"/><stop offset="1" stop-color="#c5d86b" stop-opacity="0"/></linearGradient>
<linearGradient id="rgD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc254"/><stop offset=".45" stop-color="#a6c95a" stop-opacity=".7"/><stop offset="1" stop-color="#b6d162" stop-opacity="0"/></linearGradient>
<filter id="soft" filterUnits="userSpaceOnUse" x="-40" y="-40" width="${W+80}" height="${H+80}">
 <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="5" result="n1"/><feDisplacementMap in="SourceGraphic" in2="n1" scale="4" xChannelSelector="R" yChannelSelector="G" result="d1"/>
 <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="9" result="n2"/><feDisplacementMap in="d1" in2="n2" scale="1.6" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="blotch" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feTurbulence type="fractalNoise" baseFrequency=".008" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .3  0 0 0 0 .25  2.6 0 0 0 -1.1"/></filter>
<filter id="grain" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .15  0 0 0 0 .2  0 0 0 0 .25  1.9 0 0 0 -.78"/></filter>
<filter id="grainL" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="8"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 .9  1.9 0 0 0 -.85"/></filter>
<g id="map"><g filter="url(#soft)">${g}</g>
 <rect width="${W}" height="${H}" filter="url(#blotch)" opacity=".16" style="mix-blend-mode:multiply"/></g></defs>`;


document.body.innerHTML=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">${defs}<use href="#map"/></svg>`;
