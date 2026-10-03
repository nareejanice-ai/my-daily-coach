const defaults={profile:{age:30,sex:"male",height:180,weight:90,goal:"performance",avoid:"ไม่มี"},daily:{sleep:"03:00",wake:"11:00",freshness:2,dayType:"training",start:"17:00",duration:140,intensity:"moderate",soreness:4},meals:{},customMeals:[]};
const PROFILE_KEY="dailyCoachProfileV12",DAYS_KEY="dailyCoachDaysV12";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const pad=n=>String(n).padStart(2,"0");
const dayKey=()=>{const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`};
const clone=x=>JSON.parse(JSON.stringify(x));
const loadDays=()=>{try{return JSON.parse(localStorage.getItem(DAYS_KEY)||"{}")}catch{return{}}};
let days=loadDays(),state=days[dayKey()]||clone(defaults);
try{const p=JSON.parse(localStorage.getItem(PROFILE_KEY)||"null");if(p)state.profile=p}catch{}
state.meals=state.meals||{};state.customMeals=state.customMeals||[];

function save(){localStorage.setItem(PROFILE_KEY,JSON.stringify(state.profile));days=loadDays();days[dayKey()]=state;const ks=Object.keys(days).sort();while(ks.length>30)delete days[ks.shift()];localStorage.setItem(DAYS_KEY,JSON.stringify(days))}
const toMin=t=>{const [h,m]=(t||"00:00").split(":").map(Number);return h*60+m};
function shift(t,d){let x=toMin(t)+d;while(x<0)x+=1440;x%=1440;return `${pad(Math.floor(x/60))}:${pad(x%60)}`}
function sleepHours(){let d=toMin(state.daily.wake)-toMin(state.daily.sleep);if(d<=0)d+=1440;return d/60}
function readiness(){let s=0,h=sleepHours();s+=h>=7&&h<=9?2:h>=6?1:0;s+=state.daily.freshness>=4?2:state.daily.freshness===3?1:0;s+=state.daily.soreness<=2?2:state.daily.soreness===3?1:0;return s>=5?"ดี":s>=3?"ปานกลาง":"ต่ำ"}
function proteinTarget(){let m=1.6,w=state.profile.weight;if(state.profile.goal==="fatloss")m=1.9;else if(state.profile.goal==="gain")m=1.8;else if(state.daily.dayType!=="rest")m=1.7;return Math.round(w*m)}
function carbTarget(){const d=state.daily,w=state.profile.weight;let m=d.dayType==="rest"?3:d.dayType==="match"?(d.duration>=90?6:5):(d.duration>=120||d.intensity==="high"?5:d.duration>=75?4:3.5);if(state.profile.goal==="fatloss")m=Math.max(2.5,m-.5);return Math.round(w*m)}
function prePortion(){const d=state.daily,w=state.profile.weight;let rice=Math.round(w*(d.dayType==="match"||d.duration>=120?3.5:d.intensity==="low"?2.5:3)),protein=Math.max(120,Math.min(220,Math.round(w*1.7)));return{rice,protein}}
function firstPortion(){const w=state.profile.weight,d=state.daily;return{rice:Math.round(w*(d.dayType==="rest"?2:2.5)),protein:Math.max(120,Math.min(200,Math.round(w*1.5)))}}
const est=(name,portion,note,carb,protein)=>({name,portion,note,carb,protein});

function mealMenus(){
 const d=state.daily,w=state.profile.weight,p=prePortion(),f=firstPortion();
 const first=[
 est("กะเพราหมูสับ + ไข่ต้ม",`ข้าวสุก ~${f.rice} g • หมูสับไม่มัน ~${f.protein} g • ไข่ 1 ฟอง`,"น้ำมันน้อย ไม่เผ็ดจัด",Math.round(f.rice*.28+8),Math.round(f.protein*.25+7)),
 est("ข้าวไก่ย่าง + ไข่ต้ม",`ข้าวสุก ~${f.rice} g • ไก่ ~${f.protein} g • ไข่ 1 ฟอง`,"มื้อแรกกินง่าย",Math.round(f.rice*.28),Math.round(f.protein*.3+7)),
 est("ข้าวต้มหมู + ไข่ลวก","ข้าวต้ม 1 ชามใหญ่ • หมูเพิ่ม • ไข่ 1 ฟอง","เหมาะวันที่ไม่อยากกินหนัก",65,35),
 est("ก๋วยเตี๋ยวหมูน้ำใส + ไข่ต้ม","1 ชามใหญ่ • หมูเพิ่ม • ไข่ 1 ฟอง","เลี่ยงของทอด",70,32)];
 const pre=[
 est("กะเพราไก่ + ไข่ต้ม",`ข้าวสุก ~${p.rice} g • ไก่ ~${p.protein} g • ไข่ 1 ฟอง`,"น้ำมันน้อย ไม่เผ็ดจัด",Math.round(p.rice*.28+8),Math.round(p.protein*.3+7)),
 est("ข้าวไก่ย่าง + กล้วย",`ข้าวสุก ~${p.rice} g • ไก่ ~${p.protein} g • กล้วย 1 ลูก`,"ไขมันไม่สูง",Math.round(p.rice*.28+27),Math.round(p.protein*.3)),
 est("ข้าวต้มไก่ + ไข่ต้ม","ข้าวต้ม 1 ชามใหญ่ • ไก่เพิ่ม • ไข่ 1 ฟอง","ย่อยง่าย",70,38),
 est("สปาเกตตีซอสมะเขือเทศ + อกไก่",`เส้นสุก ~${Math.round(p.rice*.75)} g • อกไก่ ~${p.protein} g`,"เลี่ยงครีมซอส",Math.round(p.rice*.75*.3+12),Math.round(p.protein*.3))];
 const snack=[
 est("กล้วย + ขนมปังน้ำผึ้ง","กล้วย 1 ลูก • ขนมปัง 2 แผ่น • น้ำผึ้งเล็กน้อย","60–90 นาทีก่อน",65,7),
 est("ข้าวปั้นไส้ทูน่า","1–2 ชิ้นเล็ก","ไส้ไม่มัน",55,10),
 est("โยเกิร์ต + กล้วย","โยเกิร์ต 1 ถ้วย • กล้วย 1 ลูก","ถ้าทนนมได้",40,10),
 est("Sports drink + กล้วย","sports drink 1 ขวดเล็ก • กล้วย 1 ลูก","เมื่อกินของแข็งได้น้อย",50,1)];
 const post=[
 est("ข้าวกะเพราหมูสับ + ไข่ต้ม",`ข้าวสุก ~${Math.round(w*3)} g • หมูไม่มัน ~${Math.round(w*1.7)} g • ไข่ 1 ฟอง`,"recovery meal",Math.round(w*3*.28+8),Math.round(w*1.7*.25+7)),
 est("ข้าวไก่ย่าง + ไข่ + ผลไม้",`ข้าวสุก ~${Math.round(w*3)} g • ไก่ ~${Math.round(w*1.7)} g • ไข่ 1 ฟอง • ผลไม้ 1 ส่วน`,"recovery meal",Math.round(w*3*.28+25),Math.round(w*1.7*.3+7)),
 est("ก๋วยเตี๋ยวหมู + ข้าวเพิ่ม","ก๋วยเตี๋ยว 1 ชามใหญ่ • หมูเพิ่ม • ข้าว 1 ถ้วยเล็ก","เพิ่มคาร์บหลังซ้อม",105,38),
 est("ข้าว + ปลาย่าง + ไข่ต้ม",`ข้าวสุก ~${Math.round(w*3)} g • ปลา ~${Math.round(w*1.7)} g • ไข่ 1 ฟอง`,"โปรตีนสูง",Math.round(w*3*.28),Math.round(w*1.7*.25+7))];
 const restMain=[
 est("กะเพราหมูสับ + ไข่ต้ม",`ข้าวสุก ~${Math.round(w*2.2)} g • หมู ~${Math.round(w*1.5)} g • ไข่ 1 ฟอง`,"น้ำมันน้อย",Math.round(w*2.2*.28+8),Math.round(w*1.5*.25+7)),
 est("ข้าว + ปลาเผา + ผัก",`ข้าวสุก ~${Math.round(w*2.2)} g • ปลา ~${Math.round(w*1.6)} g • ผัก`,"มื้อสมดุล",Math.round(w*2.2*.28),Math.round(w*1.6*.25)),
 est("ข้าว + ไก่ผัดขิง",`ข้าวสุก ~${Math.round(w*2.2)} g • ไก่ ~${Math.round(w*1.6)} g`,"น้ำมันไม่เยอะ",Math.round(w*2.2*.28+6),Math.round(w*1.6*.3)),
 est("สุกี้น้ำหมู/ไก่ + ข้าว","สุกี้ 1 ชามใหญ่ • เนื้อสัตว์เพิ่ม • ข้าว 1 ถ้วย","มื้อเบากว่า",75,35)];
 if(d.dayType==="rest")return[{key:"first",title:"มื้อแรก",timing:"หลังตื่น",options:first},{key:"lunch",title:"มื้อกลางวัน",timing:"มื้อหลัก",options:restMain},{key:"snack",title:"Snack",timing:"ช่วงบ่าย",options:snack.slice(0,3)},{key:"dinner",title:"มื้อเย็น",timing:"ก่อนนอน 3–4 ชม.",options:restMain}];
 return[{key:"first",title:"มื้อแรก",timing:"หลังตื่น",options:first},{key:"pre",title:"มื้อหลักก่อนซ้อม",timing:"3–4 ชม.ก่อน",options:pre},{key:"snack",title:"Snack ก่อนซ้อม",timing:"60–90 นาทีก่อน",options:snack},{key:"post",title:"มื้อหลังซ้อม",timing:"ภายใน 30–60 นาที",options:post}];
}
function hydration(){const w=state.profile.weight,d=state.daily;return d.dayType==="rest"?["จิบสม่ำเสมอ","ใช้ความกระหายและสีปัสสาวะเป็นตัวช่วย"]:[`${Math.round(w*5)}–${Math.round(w*7)} ml`,"ช่วงประมาณ 3–4 ชม.ก่อนกิจกรรม"]}
function fuel(){const d=state.daily;if(d.dayType==="rest")return["ไม่จำเป็น","ไม่มี session"];if(d.duration<45&&d.intensity!=="high")return["น้ำเป็นหลัก","session สั้น"];if(d.duration<75)return["คาร์บเล็กน้อย","เมื่อจำเป็น"];if(d.duration<120)return["30–60 g/ชม.","แบ่งเติมระหว่างกิจกรรม"];return["60–90 g/ชม.","ใช้เฉพาะผลิตภัณฑ์/อาหารที่เคยทนได้"]}
function summary(){const r=readiness(),d=state.daily;if(d.dayType==="training"&&r==="ต่ำ")return["Recovery วันนี้ต่ำ","ซ้อมได้ถ้าไม่มีอาการเจ็บเฉพาะจุด แต่ไม่ควรเพิ่มโหลดเอง เน้น fuel, hydration และ recovery"];if(d.dayType==="match"&&r==="ต่ำ")return["วันแข่ง แต่ recovery ต่ำ","ตัดกิจกรรมเสริม ใช้อาหารที่คุ้นเคย และจัด fuel + hydration ให้ตรงเวลา"];if(d.dayType==="rest")return["วันนี้เน้นฟื้นตัว","อาหารครบ น้ำพอ movement เบา และจัดเวลานอนคืนนี้"];return["วันนี้พร้อมตามแผน","ทำตามโปรแกรมเดิมและจัดมื้อรอบ session ให้ตรงเวลา"]}
function timeline(){const d=state.daily,w=d.wake,out=[[w,"หลังตื่น","น้ำก่อน แล้วมื้อแรกภายในประมาณ 45–60 นาที"],[shift(w,45),"มื้อแรก","เลือก 1 เมนู"]];if(d.dayType==="rest"){out.push([shift(w,300),"มื้อกลางวัน","มื้อสมดุล"],["เย็น","มื้อเย็น","โปรตีนครบ"]);return out}const s=d.start,e=shift(s,d.duration);out.push([shift(s,-210),"3–4 ชม.ก่อน","มื้อหลักก่อนซ้อม/แข่ง"],[shift(s,-90),"60–90 นาทีก่อน","Snack คาร์บย่อยง่าย"],[s,"เริ่มกิจกรรม","น้ำ + electrolyte; เติมคาร์บตามระยะเวลา"],[e,"หลังจบ","เริ่มน้ำ/เกลือแร่"],[shift(e,45),"30–60 นาที","คาร์บ + โปรตีน"]);return out}
function coachText(){const r=readiness(),d=state.daily;if(d.dayType==="training"&&r==="ต่ำ")return`อย่าเพิ่มความหนักเอง มื้อหลักก่อน ${d.start} ให้กินให้ทัน, session ${d.duration} นาทีควรมี fuel ระหว่างซ้อม และหลังซ้อมกินคาร์บ + โปรตีนภายใน 30–60 นาที`;if(d.dayType==="match")return"ใช้เฉพาะอาหารและเจลที่เคยกินแล้วสบายท้อง มื้อหลักก่อนแข่ง 3–4 ชั่วโมง";if(d.dayType==="rest")return"รักษาโปรตีนทุกมื้อ ไม่ต้องตัดคาร์บแรง และให้ความสำคัญกับการนอนคืนนี้";return"ทำตามโปรแกรมเดิม กินมื้อหลักให้ทันและอย่าเข้า session แบบหิวหรือขาดน้ำ"}

function renderMealSections(){
 const sections=mealMenus();
 $("#mealSections").innerHTML=sections.map(s=>`<div class="meal-block"><div class="meal-title"><h3>${s.title}</h3><span>${s.timing}</span></div><div class="meal-options">${s.options.map((o,i)=>{const sel=state.meals[s.key]?.name===o.name;return`<div class="meal-option ${sel?"selected":""}"><strong>${i+1}. ${o.name}</strong><div class="portion">${o.portion}</div><small>${o.note}</small><button class="pick-btn" data-meal="${s.key}" data-index="${i}">${sel?"กินมื้อนี้แล้ว ✓":"เลือกเมนูนี้"}</button></div>`}).join("")}</div></div>`).join("");
 $$(".pick-btn").forEach(b=>b.onclick=()=>{const s=mealMenus().find(x=>x.key===b.dataset.meal),o=s.options[Number(b.dataset.index)];state.meals[s.key]={...o,title:s.title};save();renderMealSections();renderMealLog()});
}
function estimateMealText(text){const t=text.toLowerCase();let carb=0,protein=0;let m=t.match(/ข้าว\s*(\d+(?:\.\d+)?)\s*(จาน|ถ้วย)?/);if(m)carb+=Number(m[1])*65;else if(t.includes("ข้าว"))carb+=65;if(/ก๋วยเตี๋ยว|บะหมี่/.test(t))carb+=55;if(/สปาเกตตี|พาสต้า/.test(t))carb+=70;if(t.includes("ขนมปัง")){m=t.match(/ขนมปัง\s*(\d+)/);carb+=(m?Number(m[1]):2)*15}if(t.includes("กล้วย")){m=t.match(/กล้วย\s*(\d+)/);carb+=(m?Number(m[1]):1)*27}if(t.includes("หมู"))protein+=28;if(t.includes("ไก่"))protein+=32;if(t.includes("ปลา"))protein+=30;if(t.includes("ทูน่า"))protein+=25;if(t.includes("เนื้อ"))protein+=30;m=t.match(/ไข่(?:ดาว|ต้ม|ลวก)?\s*(\d+)/);const eggs=m?Number(m[1]):t.includes("ไข่")?1:0;protein+=eggs*7;if(t.includes("โยเกิร์ต")){carb+=20;protein+=8}if(!carb&&!protein){carb=40;protein=20}return{name:text.trim(),carb:Math.round(carb),protein:Math.round(protein),note:"ค่าประเมินจากข้อความ อาจคลาดเคลื่อนหากไม่ระบุปริมาณ"}}
async function addCustomMeal(text){$("#addMealText").classList.add("loading");$("#mealTextHint").textContent="กำลังวิเคราะห์...";let e=null,source="local";try{const r=await fetch("/api/analyze-meal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,profile:state.profile,daily:state.daily})});if(r.ok){const a=await r.json();if(Number.isFinite(Number(a.carbs_g))&&Number.isFinite(Number(a.protein_g))){e={name:a.name||text,carb:Math.round(+a.carbs_g),protein:Math.round(+a.protein_g),note:a.note||"AI estimate"};source="AI"}}}catch{}if(!e)e=estimateMealText(text);state.customMeals.push({id:Date.now(),title:"บันทึกเอง",analysisSource:source,...e});save();renderMealLog();$("#addMealText").classList.remove("loading");$("#mealTextHint").textContent=source==="AI"?"เพิ่มแล้ว • วิเคราะห์ด้วย AI":"เพิ่มแล้ว • ใช้ตัวประเมินในเครื่อง"}
function renderMealLog(){const planned=Object.entries(state.meals).map(([key,m])=>({key,source:"planned",...m})),custom=state.customMeals.map(m=>({key:String(m.id),source:"custom",...m})),all=[...planned,...custom];$("#eatenSummary").innerHTML=all.length?all.map(m=>`<div class="eaten-item"><div><strong>${m.title}: ${m.name}${m.source==="custom"?'<span class="custom-tag">พิมพ์เอง</span>':""}${m.analysisSource==="AI"?'<span class="ai-badge">AI</span>':""}</strong><small>${m.portion?m.portion+" • ":""}คาร์บ ~${m.carb||0} g • โปรตีน ~${m.protein||0} g</small></div><button class="remove-meal" data-source="${m.source}" data-remove="${m.key}">ลบ</button></div>`).join(""):'<div class="empty-state">ยังไม่ได้บันทึกอาหารวันนี้</div>';$$(".remove-meal").forEach(b=>b.onclick=()=>{if(b.dataset.source==="custom")state.customMeals=state.customMeals.filter(x=>String(x.id)!==b.dataset.remove);else delete state.meals[b.dataset.remove];save();renderMealSections();renderMealLog()});const usedC=all.reduce((s,m)=>s+(m.carb||0),0),usedP=all.reduce((s,m)=>s+(m.protein||0),0),rc=Math.max(0,carbTarget()-usedC),rp=Math.max(0,proteinTarget()-usedP);const order=state.daily.dayType==="rest"?["first","lunch","snack","dinner"]:["first","pre","snack","post"],next=order.find(k=>!state.meals[k]),sec=mealMenus().find(s=>s.key===next);$("#remainingBox").innerHTML=`<strong>คงเหลือโดยประมาณวันนี้</strong><div class="remaining-grid"><div class="rem"><span>คาร์บ</span><strong>${rc} g</strong></div><div class="rem"><span>โปรตีน</span><strong>${rp} g</strong></div></div><div class="next-meal">${sec?`มื้อต่อไป: ${sec.title}`:"บันทึกมื้อหลักครบแล้ว"}</div>`}

function renderHistory(){const all=loadDays(),keys=Object.keys(all).sort().reverse().slice(0,7);$("#historyList").innerHTML=keys.length?keys.map(k=>{const d=all[k],type=d.daily?.dayType==="training"?"ซ้อม":d.daily?.dayType==="match"?"แข่ง":"พัก",n=Object.keys(d.meals||{}).length+(d.customMeals||[]).length;return`<div class="history-day"><strong>${new Date(k+"T12:00:00").toLocaleDateString("th-TH",{day:"numeric",month:"short"})} • ${type}</strong><small>สดชื่น ${d.daily?.freshness||"-"}/5 • ล้า ${d.daily?.soreness||"-"}/5 • อาหาร ${n} รายการ</small></div>`}).join(""):'<div class="empty-state">ยังไม่มีประวัติ</div>'}
function showResult(){const [h,s]=summary();$("#headline").textContent=h;$("#summary").textContent=s;$("#targetStrip").innerHTML=`<div class="target-box"><span>โปรตีน/วัน</span><strong>~${proteinTarget()} g</strong></div><div class="target-box"><span>คาร์บ/วัน</span><strong>~${carbTarget()} g</strong></div><div class="target-box"><span>น้ำหนัก</span><strong>${state.profile.weight} kg</strong></div>`;renderMealSections();renderMealLog();const [hy,hn]=hydration(),[fu,fn]=fuel();$("#hydration").textContent=hy;$("#hydrationNote").textContent=hn;$("#fuel").textContent=fu;$("#fuelNote").textContent=fn;$("#timeline").innerHTML=timeline().map(x=>`<div class="row"><div class="time">${x[0]}</div><div><strong>${x[1]}</strong><small>${x[2]}</small></div></div>`).join("");$("#coach").textContent=coachText();$("#result").classList.remove("hidden")}
function render(){const d=new Date();$("#date").textContent=d.toLocaleDateString("th-TH",{weekday:"long",day:"numeric",month:"long",year:"numeric"});["age","height","weight"].forEach(id=>$("#"+id).value=state.profile[id]);$("#sex").value=state.profile.sex;$("#goal").value=state.profile.goal;$("#avoid").value=state.profile.avoid;["sleep","wake","start","duration","intensity","soreness"].forEach(id=>$("#"+id).value=state.daily[id]);$("#freshness").innerHTML=[1,2,3,4,5].map(n=>`<button data-f="${n}" class="${state.daily.freshness===n?"active":""}">${n}</button>`).join("");$$("[data-f]").forEach(b=>b.onclick=()=>{state.daily.freshness=+b.dataset.f;save();render()});$$("#dayType button").forEach(b=>b.classList.toggle("active",b.dataset.v===state.daily.dayType));$("#sessionBox").classList.toggle("hidden",state.daily.dayType==="rest")}

$("#profileBtn").onclick=()=>$("#profilePanel").classList.toggle("hidden");
$("#closeProfile").onclick=()=>$("#profilePanel").classList.add("hidden");
$("#historyBtn").onclick=()=>{renderHistory();$("#historyPanel").classList.toggle("hidden")};
$("#closeHistory").onclick=()=>$("#historyPanel").classList.add("hidden");
$("#saveProfile").onclick=()=>{state.profile={age:+$("#age").value,sex:$("#sex").value,height:+$("#height").value,weight:+$("#weight").value,goal:$("#goal").value,avoid:$("#avoid").value||"ไม่มี"};save();$("#profilePanel").classList.add("hidden");render()};
$$('#dayType button').forEach(b=>b.onclick=()=>{if(state.daily.dayType!==b.dataset.v){state.meals={};state.customMeals=[]}state.daily.dayType=b.dataset.v;save();render()});
$("#analyze").onclick=()=>{state.daily={...state.daily,sleep:$("#sleep").value,wake:$("#wake").value,start:$("#start").value,duration:+$("#duration").value,intensity:$("#intensity").value,soreness:+$("#soreness").value};save();showResult()};
$("#resetMeals").onclick=()=>{state.meals={};state.customMeals=[];save();renderMealSections();renderMealLog()};
$("#addMealText").onclick=async()=>{const v=$("#mealText").value.trim();if(!v){$("#mealTextHint").textContent="พิมพ์อาหารก่อน";return}$("#mealText").value="";await addCustomMeal(v)};
$("#mealText").addEventListener("keydown",e=>{if(e.key==="Enter")$("#addMealText").click()});
render();
if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{});