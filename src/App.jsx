import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  cream:"#FAF7F2", warm:"#F4EFE6", warmDark:"#EDE4D8", white:"#FFFFFF",
  terracotta:"#C47A5A", rose:"#D4977A", roseLight:"#EDD5C5", rosePale:"#FBF3EE",
  sage:"#7A9E87", sagePale:"#EBF4EF",
  lavender:"#9B8EC4", lavPale:"#F0EEF9",
  gold:"#C9A84C", goldPale:"#FBF5E4",
  coral:"#E07B6A", coralPale:"#FDECEA",
  sky:"#6A9EC9", skyPale:"#E8F2FA",
  mint:"#6ABDA8", mintPale:"#E6F5F1",
  charcoal:"#3A3530", muted:"#8A7F78", faint:"#C4BCB6",
  night:"#1C1830", nightMid:"#2E2650",
  success:"#5BAA6E", successPale:"#E8F5EC",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;-webkit-tap-highlight-color:transparent}
  body{font-family:'DM Sans',sans-serif;background:${C.cream};color:${C.charcoal};-webkit-font-smoothing:antialiased}
  textarea,input{outline:none;border:none;font-family:'DM Sans',sans-serif;background:transparent}
  button{cursor:pointer;font-family:'DM Sans',sans-serif;-webkit-tap-highlight-color:transparent}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${C.roseLight};border-radius:2px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes micGlow{0%,100%{box-shadow:0 0 0 0 rgba(196,122,90,.5)}60%{box-shadow:0 0 0 12px rgba(196,122,90,0)}}
  @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.25)}100%{transform:scale(1)}}
  @keyframes toast{0%{opacity:0;transform:translateY(10px)}15%,80%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-6px)}}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
  .fu{animation:fadeUp .38s ease forwards}
  .fi{animation:fadeIn .3s ease forwards}
  .si{animation:slideIn .35s ease forwards}
  .mic-on{animation:micGlow .85s ease-in-out infinite}
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CYCLE_PHASES = {
  menstruation:{label:"Menstruation",emoji:"🌹",days:"J1–J5",color:C.coral,pale:C.coralPale,energy:"Faible",mood:"Introspective, sensible",message:"Ton corps travaille dur. Sois douce avec toi-même.",foods:["Chocolat noir","Lentilles (fer)","Épinards","Framboises","Bouillon chaud","Gingembre","Banane"],avoid:["Alcool","Caféine","Aliments salés","Sucre raffiné"],sport:["Yoga doux","Étirements","Marche légère"],sportNote:"Mouvements doux. Ton corps récupère."},
  folliculaire:{label:"Phase folliculaire",emoji:"🌱",days:"J6–J13",color:C.sage,pale:C.sagePale,energy:"En hausse",mood:"Créative, optimiste",message:"L'énergie revient. C'est le moment d'entreprendre.",foods:["Œufs","Brocoli","Avocat","Quinoa","Graines de courge","Yaourt grec"],avoid:["Repas trop lourds","Aliments transformés"],sport:["Cardio","Musculation","HIIT léger","Course"],sportNote:"Énergie qui monte — profite pour la force."},
  ovulation:{label:"Ovulation",emoji:"✨",days:"J14–J16",color:C.gold,pale:C.goldPale,energy:"Maximum",mood:"Sociable, confiante, rayonnante",message:"Tu es au pic de ton énergie.",foods:["Saumon","Asperges","Figues","Graines de lin","Tomates","Fruits frais"],avoid:["Fast food","Excès de sucre"],sport:["HIIT","Musculation lourde","Spinning"],sportNote:"Pic d'énergie — pousse tes limites !"},
  luteale:{label:"Phase lutéale",emoji:"🍂",days:"J17–J28",color:C.lavender,pale:C.lavPale,energy:"Baisse progressive",mood:"Fatiguée, irritable possible",message:"Ralentis et écoute ton corps.",foods:["Patate douce","Noix","Dinde","Riz complet","Camomille","Myrtilles"],avoid:["Sel","Caféine","Alcool","Sucre"],sport:["Yoga","Natation","Marche","Muscu légère"],sportNote:"Écoute ton corps. Une marche suffit."},
};

const MOODS=[{v:1,e:"😔",l:"Difficile"},{v:2,e:"😕",l:"Moyen"},{v:3,e:"😐",l:"OK"},{v:4,e:"🙂",l:"Bien"},{v:5,e:"😄",l:"Super"}];
const SYMPTOMS=["Crampes","Fatigue","Ballonnements","Maux de tête","Acné","Humeur instable","Envies sucrées","Seins sensibles","Irritabilité","Insomnies"];
const FLOWS=["Léger","Modéré","Abondant","Très abondant"];

const RECIPES=[
  {id:1,name:"Bowl poulet avocat",time:15,phase:["folliculaire","ovulation"],cal:520,tag:"💪 Protéiné",color:C.sagePale,ingredients:["150g poulet cuit","1 avocat","100g quinoa","épinards","citron","huile d'olive"],steps:["Cuire le quinoa 10 min","Couper l'avocat","Assembler quinoa + épinards + poulet + avocat","Assaisonner citron + huile"]},
  {id:2,name:"Pâtes saumon crème",time:20,phase:["ovulation","folliculaire"],cal:580,tag:"🐟 Oméga-3",color:C.skyPale,ingredients:["150g saumon fumé","200g pâtes","100ml crème légère","1 échalote","aneth","citron"],steps:["Cuire les pâtes","Faire revenir l'échalote","Ajouter crème + saumon","Mélanger + aneth + citron"]},
  {id:3,name:"Soupe lentilles gingembre",time:20,phase:["menstruation"],cal:380,tag:"🌹 Réconfortant",color:C.coralPale,ingredients:["200g lentilles corail","1 oignon","gingembre frais","1 carotte","cumin","bouillon légumes"],steps:["Faire revenir oignon + gingembre","Ajouter carottes + lentilles + bouillon","Cuire 15 min","Mixer partiellement"]},
  {id:4,name:"Toast avocat œuf poché",time:10,phase:["folliculaire","luteale"],cal:420,tag:"⚡ Rapide",color:C.goldPale,ingredients:["2 tranches pain complet","1 avocat","2 œufs","piment d'espelette","fleur de sel"],steps:["Pocher les œufs 3 min","Toaster le pain","Écraser l'avocat sur le pain","Déposer les œufs, assaisonner"]},
  {id:5,name:"Curry patate douce",time:20,phase:["luteale"],cal:490,tag:"🍂 Anti-PMS",color:C.lavPale,ingredients:["2 patates douces","1 boîte pois chiches","200ml lait de coco","curry","oignon","ail","gingembre"],steps:["Cuire oignon + ail + épices","Ajouter patates douces","Verser lait de coco + pois chiches","Mijoter 15 min"]},
  {id:6,name:"Pancakes banane avoine",time:12,phase:["menstruation","luteale"],cal:350,tag:"🍌 Doux",color:C.warm,ingredients:["2 bananes","2 œufs","80g flocons d'avoine","cannelle","miel"],steps:["Mixer bananes + œufs + avoine + cannelle","Cuire petites crêpes 2 min/face","Servir avec miel et baies"]},
  {id:7,name:"Salade niçoise express",time:12,phase:["ovulation","folliculaire"],cal:440,tag:"🥗 Frais",color:C.mintPale,ingredients:["1 boîte thon","2 œufs durs","tomates cerises","olives","haricots verts","vinaigrette"],steps:["Cuire les œufs 8 min","Assembler les légumes","Ajouter thon + olives","Assaisonner"]},
  {id:8,name:"Bol açaï maison",time:8,phase:["menstruation","luteale"],cal:320,tag:"🫐 Anti-oxydant",color:C.lavPale,ingredients:["200g myrtilles congelées","1 banane","100ml lait végétal","granola","miel","fruits frais"],steps:["Mixer myrtilles + banane + lait","Verser dans un bol","Garnir granola + fruits + miel"]},
];

const WORKOUTS={
  force:{label:"💪 Force",color:C.sage,pale:C.sagePale,exercises:[{name:"Squat",sets:"4×12",muscle:"Jambes/Fessiers",tip:"Descends jusqu'à 90°, genoux dans l'axe"},{name:"Hip thrust",sets:"4×15",muscle:"Fessiers",tip:"Pousse avec les talons, contracte en haut"},{name:"Tirage poulie",sets:"3×12",muscle:"Dos",tip:"Coudes vers les hanches, omoplates serrées"},{name:"Développé haltères",sets:"3×12",muscle:"Épaules",tip:"Contrôle la descente"},{name:"Curl biceps",sets:"3×15",muscle:"Biceps",tip:"Coudes stables, montée lente"},{name:"Planche",sets:"3×45s",muscle:"Gainage",tip:"Corps droit, respire normalement"}]},
  fessiers:{label:"🍑 Fessiers",color:C.rose,pale:C.rosePale,exercises:[{name:"Hip thrust barre",sets:"5×12",muscle:"Fessiers",tip:"Full amplitude, serre fort en haut"},{name:"Squat sumo",sets:"4×15",muscle:"Fessiers/Adducteurs",tip:"Pieds à 45°, descends profond"},{name:"Fentes marchées",sets:"3×20",muscle:"Fessiers/Quadriceps",tip:"Grand pas, genou avant à 90°"},{name:"Abducteur machine",sets:"4×20",muscle:"Fessiers latéraux",tip:"Contrôle le retour"},{name:"Donkey kicks",sets:"3×20/côté",muscle:"Fessiers",tip:"Contracte en haut"}]},
  cardio:{label:"🏃 Cardio",color:C.sky,pale:C.skyPale,exercises:[{name:"Échauffement tapis",sets:"5 min",muscle:"Corps entier",tip:"Allure progressive"},{name:"Intervalles vélo",sets:"20 min",muscle:"Cardio",tip:"30s sprint / 30s récup × 20"},{name:"Rameur",sets:"10 min",muscle:"Dos/Jambes",tip:"Pousse jambes d'abord puis tire les bras"},{name:"Jumping jacks",sets:"3×30",muscle:"Corps entier",tip:"Rythme constant"},{name:"Corde à sauter",sets:"3×2 min",muscle:"Cardio",tip:"Atterris sur l'avant du pied"}]},
  hiit:{label:"⚡ HIIT",color:C.gold,pale:C.goldPale,exercises:[{name:"Burpees",sets:"4×10",muscle:"Corps entier",tip:"Saut explosif"},{name:"Mountain climbers",sets:"3×30s",muscle:"Gainage/Cardio",tip:"Vitesse + gainage"},{name:"Box jumps",sets:"4×10",muscle:"Jambes",tip:"Atterris genoux fléchis"},{name:"Kettlebell swing",sets:"4×15",muscle:"Fessiers/Cardio",tip:"Propulsion des hanches"},{name:"Push-ups",sets:"3×15",muscle:"Pectoraux",tip:"Corps droit, coudes à 45°"}]},
  yoga:{label:"🧘 Yoga",color:C.lavender,pale:C.lavPale,exercises:[{name:"Salutation au soleil",sets:"5 cycles",muscle:"Corps entier",tip:"Synchronise souffle et mouvement"},{name:"Pigeon",sets:"2 min/côté",muscle:"Hanches",tip:"Respire dans la posture"},{name:"Enfant",sets:"2 min",muscle:"Dos/Hanches",tip:"Front au sol, bras tendus"},{name:"Chien tête en bas",sets:"5 respirations",muscle:"Ischio/Mollets",tip:"Pousse les talons vers le sol"},{name:"Savasana",sets:"5 min",muscle:"Récupération",tip:"Laisse ton corps se détendre"}]},
};

const TASK_CATS={urgent:{label:"🔥 Urgent",c:C.coral,bg:C.coralPale},semaine:{label:"📅 Cette semaine",c:C.sage,bg:C.sagePale},unjour:{label:"✨ Un jour",c:C.lavender,bg:C.lavPale},decision:{label:"🤔 Décision",c:C.gold,bg:C.goldPale},deleger:{label:"👋 Déléguer",c:C.muted,bg:C.warm}};
const EVENING_BLOCKS=[{id:"decompress",e:"🛋️",label:"Décompresser",min:20,c:C.rosePale},{id:"selfcare",e:"🧴",label:"Soins & beauté",min:20,c:C.lavPale},{id:"sport",e:"🏃",label:"Sport léger",min:30,c:C.sagePale},{id:"tv",e:"🎬",label:"Série / Film",min:60,c:C.skyPale},{id:"read",e:"📖",label:"Lecture",min:30,c:C.warm},{id:"bath",e:"🛁",label:"Bain / douche",min:20,c:"#FBF0F5"},{id:"sleep",e:"🌙",label:"Préparer le sommeil",min:15,c:"#F0EEF9"}];

const NAV=[{k:"home",e:"🌸",l:"Moi"},{k:"mental",e:"🧠",l:"Mental"},{k:"sport",e:"💪",l:"Sport"},{k:"repas",e:"🥗",l:"Repas"},{k:"cycle",e:"🌙",l:"Cycle"},{k:"soiree",e:"✨",l:"Soirée"}];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const today=()=>new Date().toISOString().split("T")[0];
const getGreeting=()=>{const h=new Date().getHours();return h<5?"Bonne nuit":h<12?"Bonjour":h<18?"Bon après-midi":"Bonsoir"};
function getCyclePhase(last,len=28){
  if(!last)return null;
  const diff=Math.floor((new Date()-new Date(last))/86400000);
  const day=(diff%len)+1;
  if(day<=5)return{key:"menstruation",day,...CYCLE_PHASES.menstruation};
  if(day<=13)return{key:"folliculaire",day,...CYCLE_PHASES.folliculaire};
  if(day<=16)return{key:"ovulation",day,...CYCLE_PHASES.ovulation};
  return{key:"luteale",day,...CYCLE_PHASES.luteale};
}
function fmtDate(d){return new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"long"})}

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useS(def){const[v,setV]=useState(def);return[v,setV];}

function useSpeech({onFinal,onInterim,lang="fr-FR"}={}){
  const ref=useRef(null);const[on,setOn]=useState(false);
  function start(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert("Micro non disponible sur ce navigateur.");return;}
    const r=new SR();r.lang=lang;r.continuous=true;r.interimResults=true;
    r.onresult=e=>{let fin="",inter="";for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)fin+=e.results[i][0].transcript+" ";else inter+=e.results[i][0].transcript;}if(fin&&onFinal)onFinal(fin);if(inter&&onInterim)onInterim(inter);};
    r.onerror=()=>setOn(false);r.onend=()=>setOn(false);r.start();ref.current=r;setOn(true);
  }
  function stop(){ref.current?.stop();setOn(false);}
  return{on,start,stop,toggle:()=>on?stop():start()};
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const Card=({children,style={}})=><div style={{background:C.white,borderRadius:20,padding:"18px 20px",boxShadow:"0 2px 16px rgba(58,53,48,.07)",...style}}>{children}</div>;
const Label=({children,style={}})=><p style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8,...style}}>{children}</p>;
const Serif=({children,size=22,style={}})=><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:size,fontWeight:400,color:C.charcoal,lineHeight:1.3,...style}}>{children}</p>;
const Pill=({text,c,bg,size=11})=><span style={{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:size,fontWeight:500,color:c,background:bg}}>{text}</span>;
const Spinner=()=><span style={{display:"inline-block",width:14,height:14,border:`2px solid ${C.roseLight}`,borderTopColor:C.terracotta,borderRadius:"50%",animation:"spin .7s linear infinite",verticalAlign:"middle",marginRight:6}}/>;

function Btn({children,onClick,disabled,color=C.terracotta,textColor=C.white,style={}}){
  return <button onClick={onClick} disabled={disabled} style={{background:disabled?C.roseLight:color,color:textColor,border:"none",borderRadius:14,padding:"13px 20px",fontSize:14,fontWeight:600,width:"100%",transition:"all .2s",opacity:disabled?.6:1,...style}}>{children}</button>;
}

function CheckBox({done,onToggle,color=C.sage}){
  return(
    <button onClick={onToggle} style={{width:22,height:22,borderRadius:7,border:`2px solid ${done?color:C.roseLight}`,background:done?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .25s"}}>
      {done&&<span style={{color:C.white,fontSize:11,animation:"checkPop .25s ease"}}>✓</span>}
    </button>
  );
}

function MicBtn({on,onToggle,size=44}){
  return(
    <button onClick={onToggle} className={on?"mic-on":""} title={on?"Arrêter":"Parler"}
      style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:on?C.terracotta:C.white,border:`2px solid ${on?C.terracotta:C.roseLight}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",boxShadow:on?"none":"0 2px 8px rgba(58,53,48,.12)"}}>
      {on?(
        <div style={{display:"flex",gap:2.5,alignItems:"center"}}>
          {[1,1.8,1.3,2,1.4].map((h,i)=><div key={i} style={{width:2.5,borderRadius:2,background:C.white,height:`${h*7}px`,animation:`pulse ${.45+i*.12}s ease-in-out infinite alternate`}}/>)}
        </div>
      ):(
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.terracotta} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      )}
    </button>
  );
}

function Toast({msg,visible}){
  if(!visible)return null;
  return(
    <div style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",background:C.charcoal,color:C.white,borderRadius:20,padding:"10px 20px",fontSize:13,fontWeight:500,zIndex:200,animation:"toast 2.5s ease forwards",whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.2)"}}>
      {msg}
    </div>
  );
}

function VoiceBanner({on,onStop}){
  if(!on)return null;
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,background:C.rosePale,borderRadius:12,padding:"11px 14px",marginBottom:12,animation:"fadeIn .2s ease"}}>
      <div style={{display:"flex",gap:3,alignItems:"center"}}>
        {[1.2,2,1.5,2.3,1.6].map((h,i)=><div key={i} style={{width:3,borderRadius:2,background:C.terracotta,height:`${h*5}px`,animation:`pulse ${.4+i*.1}s ease-in-out infinite alternate`}}/>)}
      </div>
      <p style={{fontSize:13,color:C.terracotta,fontWeight:500,flex:1}}>Je t'écoute… 🎙️</p>
      <button onClick={onStop} style={{fontSize:12,color:C.muted,background:"none",border:"none",padding:"0 4px"}}>Arrêter</button>
    </div>
  );
}

function EmptyState({emoji,title,subtitle,cta,onCta}){
  return(
    <div style={{textAlign:"center",padding:"40px 20px",animation:"fadeUp .4s ease"}}>
      <div style={{fontSize:44,marginBottom:12,animation:"breathe 3s ease-in-out infinite"}}>{emoji}</div>
      <Serif size={20} style={{marginBottom:6}}>{title}</Serif>
      <p style={{fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:cta?20:0}}>{subtitle}</p>
      {cta&&<button onClick={onCta} style={{background:C.terracotta,color:C.white,border:"none",borderRadius:14,padding:"11px 24px",fontSize:13,fontWeight:600}}>{cta}</button>}
    </div>
  );
}

// ─── API CALL ─────────────────────────────────────────────────────────────────
async function callClaude(system,userMsg,maxTokens=400){
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":"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","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTokens,system,messages:[{role:"user",content:userMsg}]})});
  const d=await res.json();return d.content?.find(b=>b.type==="text")?.text||"";
}
async function callClaudeJSON(system,userMsg,maxTokens=1000){
  const raw=await callClaude(system,userMsg,maxTokens);
  try{return JSON.parse(raw.replace(/```json|```/g,"").trim());}catch{return null;}
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ONBOARDING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Onboarding({onDone}){
  const[step,setStep]=useState(0);
  const[name,setName]=useState("");
  const[lastPeriod,setLastPeriod]=useState("");
  const[cycleLen,setCycleLen]=useState(28);
  const nameRef=useRef(null);

  useEffect(()=>{if(step===0)setTimeout(()=>nameRef.current?.focus(),300);},[step]);

  const steps=[
    // Step 0 — Welcome
    <div key={0} className="fu" style={{textAlign:"center"}}>
      <div style={{fontSize:58,marginBottom:16,animation:"breathe 3s ease-in-out infinite"}}>🌸</div>
      <Serif size={38} style={{marginBottom:8,lineHeight:1.1}}>Respire</Serif>
      <p style={{fontSize:15,color:C.muted,lineHeight:1.8,marginBottom:8}}>Ton jardin secret.</p>
      <p style={{fontSize:13,color:C.faint,lineHeight:1.9,marginBottom:40}}>Charge mentale · Humeur · Sport<br/>Repas · Cycle · Soirée</p>
      <div style={{width:"100%"}}>
        <input ref={nameRef} value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&name.trim())setStep(1);}}
          placeholder="Ton prénom…"
          style={{width:"100%",fontSize:18,color:C.charcoal,background:C.white,borderRadius:16,padding:"16px 20px",boxShadow:"0 2px 20px rgba(58,53,48,.1)",marginBottom:14,display:"block",textAlign:"center"}}/>
        <Btn onClick={()=>{if(name.trim())setStep(1);}} disabled={!name.trim()}>C'est parti →</Btn>
      </div>
    </div>,

    // Step 1 — Cycle setup
    <div key={1} className="si" style={{width:"100%"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:36,marginBottom:10}}>🌙</div>
        <Serif size={26} style={{marginBottom:6}}>Bonjour {name} !</Serif>
        <p style={{fontSize:13,color:C.muted,lineHeight:1.7}}>Pour personnaliser tes recommandations,<br/>j'ai besoin de connaître ton cycle.</p>
      </div>
      <Card style={{marginBottom:14}}>
        <Label>Premier jour de tes dernières règles</Label>
        <input type="date" value={lastPeriod} onChange={e=>setLastPeriod(e.target.value)}
          style={{width:"100%",fontSize:15,color:C.charcoal,background:C.warm,borderRadius:12,padding:"12px 16px"}}/>
      </Card>
      <Card style={{marginBottom:24}}>
        <Label>Durée de ton cycle : <strong style={{color:C.charcoal}}>{cycleLen} jours</strong></Label>
        <input type="range" min={21} max={35} value={cycleLen} onChange={e=>setCycleLen(parseInt(e.target.value))} style={{width:"100%",marginBottom:6}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.faint}}>
          <span>21j (court)</span><span>28j (moyen)</span><span>35j (long)</span>
        </div>
      </Card>
      <Btn onClick={()=>onDone({name,lastPeriodStart:lastPeriod,cycleLength:cycleLen})} color={lastPeriod?C.terracotta:C.night}>
        {lastPeriod?"Entrer dans mon espace →":"Passer cette étape →"}
      </Btn>
      {!lastPeriod&&<p style={{fontSize:12,color:C.faint,textAlign:"center",marginTop:10}}>Tu pourras configurer ça plus tard dans l'onglet Cycle</p>}
    </div>,
  ];

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${C.cream} 0%,${C.roseLight}40 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px"}}>
      {step>0&&(
        <div style={{width:"100%",maxWidth:380,display:"flex",gap:6,marginBottom:32}}>
          {[0,1].map(i=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?C.terracotta:C.roseLight,transition:"background .4s"}}/>)}
        </div>
      )}
      <div style={{width:"100%",maxWidth:380}}>{steps[step]}</div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VIEW 1 — MOI (AUJOURD'HUI)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MoiView({name,tasks,onCheck,onAdd,moodToday,onMood,cyclePhase,onNavigate,showToast}){
  const[input,setInput]=useState("");const[aiTip,setAiTip]=useState("");const[loadingTip,setLoadingTip]=useState(false);
  const voice=useSpeech({onFinal:t=>setInput(p=>p+t)});
  const urgentTasks=tasks.filter(t=>t.category==="urgent"&&!t.done);
  const done=tasks.filter(t=>t.done).length;const total=tasks.length;

  async function getAiTip(mood){
    setLoadingTip(true);setAiTip("");
    try{
      const txt=await callClaude("Tu es une coach de vie bienveillante. 2-3 phrases douces et concrètes en français. Pas de liste. Pas d'introduction.",`Je me sens ${mood.l} (${mood.v}/5).${cyclePhase?` Phase ${cyclePhase.label}.`:""} Ton conseil ?`);
      setAiTip(txt);
    }catch(e){}
    setLoadingTip(false);
  }

  function addTask(){if(input.trim()){onAdd(input.trim(),"semaine");setInput("");voice.stop();showToast("✅ Tâche ajoutée");}}

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${C.terracotta},${C.rose})`,borderRadius:22,padding:"22px 22px 20px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-20,top:-20,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,.07)"}}/>
        <div style={{position:"absolute",right:20,bottom:-30,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,.05)"}}/>
        <p style={{color:"rgba(255,255,255,.75)",fontSize:13,marginBottom:4,position:"relative"}}>{getGreeting()}, {name} 🌸</p>
        <Serif size={22} style={{color:C.white,position:"relative"}}>{moodToday?`Tu te sens ${moodToday.l.toLowerCase()} aujourd'hui`:"Comment tu vas ce matin ?"}</Serif>
        {cyclePhase&&(
          <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.18)",borderRadius:10,padding:"5px 12px",position:"relative"}}>
            <span style={{fontSize:14}}>{cyclePhase.emoji}</span>
            <span style={{fontSize:12,color:C.white,fontWeight:500}}>{cyclePhase.label} · J{cyclePhase.day}</span>
          </div>
        )}
        {total>0&&(
          <div style={{marginTop:14,position:"relative"}}>
            <div style={{background:"rgba(255,255,255,.25)",borderRadius:6,height:5,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.round(done/total*100)}%`,background:"rgba(255,255,255,.9)",borderRadius:6,transition:"width .6s ease"}}/>
            </div>
            <p style={{color:"rgba(255,255,255,.65)",fontSize:11,marginTop:5}}>{done} sur {total} tâche{total>1?"s":""} accomplie{done>1?"s":""}</p>
          </div>
        )}
      </div>

      {/* Mood check */}
      <Card>
        <Label>Comment tu te sens ce matin ?</Label>
        <div style={{display:"flex",gap:8}}>
          {MOODS.map(m=>(
            <button key={m.v} onClick={()=>{onMood(m);getAiTip(m);}}
              style={{flex:1,padding:"10px 4px",borderRadius:14,border:`2px solid ${moodToday?.v===m.v?C.terracotta:"transparent"}`,background:moodToday?.v===m.v?C.rosePale:C.warm,display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all .2s"}}>
              <span style={{fontSize:22}}>{m.e}</span>
              <span style={{fontSize:10,color:moodToday?.v===m.v?C.terracotta:C.muted,fontWeight:500}}>{m.l}</span>
            </button>
          ))}
        </div>
        {(loadingTip||aiTip)&&(
          <div style={{marginTop:12,background:C.rosePale,borderRadius:14,padding:"13px 15px",animation:"fadeUp .3s ease",borderLeft:`3px solid ${C.roseLight}`}}>
            {loadingTip?<p style={{fontSize:13,color:C.muted,display:"flex",alignItems:"center",gap:6}}><Spinner/>Réflexion en cours…</p>:<p style={{fontSize:13,color:C.charcoal,lineHeight:1.7,fontStyle:"italic"}}>💬 {aiTip}</p>}
          </div>
        )}
      </Card>

      {/* Conseil cycle du jour */}
      {cyclePhase&&(
        <Card style={{background:cyclePhase.pale,borderLeft:`3px solid ${cyclePhase.color}`}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
            <span style={{fontSize:22,marginTop:2}}>{cyclePhase.emoji}</span>
            <div style={{flex:1}}>
              <p style={{fontSize:13,fontWeight:600,color:cyclePhase.color,marginBottom:4}}>{cyclePhase.label} · {cyclePhase.energy}</p>
              <p style={{fontSize:13,color:C.charcoal,lineHeight:1.6,fontStyle:"italic"}}>"{cyclePhase.message}"</p>
              <p style={{fontSize:12,color:C.muted,marginTop:6}}>🥗 {cyclePhase.foods.slice(0,3).join(" · ")}</p>
              <p style={{fontSize:12,color:C.muted,marginTop:2}}>🏋️ {cyclePhase.sport[0]}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tâches urgentes */}
      {urgentTasks.length>0&&(
        <Card style={{borderLeft:`3px solid ${C.coral}`}}>
          <Label style={{color:C.coral}}>🔥 Priorités du jour</Label>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {urgentTasks.slice(0,3).map(t=>(
              <div key={t.id} style={{display:"flex",gap:10,alignItems:"center"}}>
                <CheckBox done={t.done} onToggle={()=>onCheck(t.id)} color={C.coral}/>
                <p style={{fontSize:14,color:C.charcoal,flex:1}}>{t.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Ajout rapide */}
      <Card style={{padding:"13px 16px"}}>
        <VoiceBanner on={voice.on} onStop={voice.stop}/>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <MicBtn on={voice.on} onToggle={voice.toggle} size={40}/>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addTask();}}
            placeholder="Ajouter une tâche rapide…"
            style={{flex:1,fontSize:14,color:C.charcoal,padding:"4px 0"}}/>
          {input.trim()&&<button onClick={addTask} style={{background:C.terracotta,color:C.white,border:"none",borderRadius:10,padding:"8px 14px",fontSize:13,fontWeight:600}}>＋</button>}
        </div>
      </Card>

      {/* Toutes les tâches */}
      {tasks.filter(t=>!t.done).length>0?(
        <Card>
          <Label>Toutes les tâches</Label>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {Object.keys(TASK_CATS).map(cat=>{
              const items=tasks.filter(t=>t.category===cat&&!t.done);
              if(!items.length)return null;
              const cfg=TASK_CATS[cat];
              return(
                <div key={cat}>
                  <Pill text={cfg.label} c={cfg.c} bg={cfg.bg}/>
                  <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:7}}>
                    {items.map(t=>(
                      <div key={t.id} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                        <CheckBox done={t.done} onToggle={()=>{onCheck(t.id);showToast("✅ Tâche faite !");}} color={cfg.c}/>
                        <div style={{flex:1}}>
                          <p style={{fontSize:14,color:C.charcoal,lineHeight:1.4}}>{t.text}</p>
                          {t.note&&<p style={{fontSize:12,color:C.muted,fontStyle:"italic",marginTop:2}}>{t.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ):(
        <EmptyState emoji="🌿" title="Aucune tâche pour l'instant" subtitle="Vide ta tête en vocal pour laisser l'IA tout organiser pour toi." cta="Vider ma tête 🧠" onCta={()=>onNavigate("mental")}/>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VIEW 2 — MENTAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MentalView({onImport,showToast,tasks}){
  const[tab,setTab]=useState("dump");
  const[dump,setDump]=useState("");const[result,setResult]=useState(null);const[loading,setLoading]=useState(false);const[selected,setSelected]=useState({});
  const[q,setQ]=useState("");const[options,setOptions]=useState(["",""]);const[decResult,setDecResult]=useState(null);const[loadingDec,setLoadingDec]=useState(false);
  const[prioContext,setPrioContext]=useState("");const[prioResult,setPrioResult]=useState(null);const[loadingPrio,setLoadingPrio]=useState(false);
  const voiceDump=useSpeech({onFinal:t=>setDump(p=>p+t)});
  const voiceDec=useSpeech({onFinal:t=>setQ(p=>p+t)});
  const voicePrio=useSpeech({onFinal:t=>setPrioContext(p=>p+t)});
  const pendingTasks=(tasks||[]).filter(t=>!t.done);

  async function prioritize(){
    setLoadingPrio(true);setPrioResult(null);
    const taskList=pendingTasks.map((t,i)=>`${i+1}. [${t.category}] ${t.text}`).join("\n");
    const context=prioContext.trim()?`\nContexte : ${prioContext}`:"";
    const r=await callClaudeJSON(
      `Coach de vie bienveillante, experte en priorités. Classe les tâches de la PLUS à la MOINS importante selon urgence réelle et impact. Distingue URGENT/IMPORTANT (deadline, obligation), IMPORTANT mais flexible (social, bien-être), PEUT ATTENDRE. JSON sans backticks : {"ranked":[{"id":0,"text":"...","niveau":"critique|important|flexible|optionnel","raison":"1 phrase","quand":"suggestion concrète : ce soir / demain matin / ce week-end / quand tu peux","emoji":"🔴|🟠|🟡|🟢"}],"message":"1 phrase bienveillante"}`,
      `Mes tâches :\n${taskList}${context}`,1200
    );
    if(r)setPrioResult(r);
    setLoadingPrio(false);
  }

  async function analyze(){
    if(!dump.trim())return;setLoading(true);setResult(null);
    const r=await callClaudeJSON(`Assistante organisation. Classe chaque élément du brain dump dans : urgent (24-48h), semaine, unjour, decision, deleger. JSON sans backticks : {"items":[{"text":"...","category":"...","note":"conseil 1 phrase"}],"insight":"observation bienveillante 1 phrase"}`,dump,1000);
    if(r){setResult(r);const sel={};r.items?.forEach((_,i)=>{sel[i]=true});setSelected(sel);}
    setLoading(false);
  }

  async function decide(){
    if(!q.trim())return;setLoadingDec(true);setDecResult(null);
    const opts=options.filter(o=>o.trim());
    const r=await callClaudeJSON(`Coach de vie bienveillant. JSON sans backticks : {"reframe":"vraie question sous-jacente","options":[{"name":"...","pour":["..."],"contre":["..."]}],"conseil":"2-3 phrases directes","question_cle":"seule question à se poser"}`,`Décision : ${q}\nOptions : ${opts.length?opts.join(", "):"non précisées"}`,800);
    if(r)setDecResult(r);setLoadingDec(false);
  }

  function importSelected(){
    const toImport=result.items.filter((_,i)=>selected[i]);
    onImport(toImport);setDump("");setResult(null);showToast(`✅ ${toImport.length} tâche${toImport.length>1?"s":""} ajoutée${toImport.length>1?"s":""}`);
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card style={{background:`linear-gradient(135deg,${C.lavender}30,${C.lavPale})`}}>
        <Serif size={23}>Espace mental 🧠</Serif>
        <p style={{fontSize:13,color:C.muted,marginTop:6,lineHeight:1.6}}>Vide ta tête ou résous une décision difficile.</p>
      </Card>

      {/* Tabs */}
      <div style={{display:"flex",gap:0,background:C.warm,borderRadius:14,padding:4}}>
        {[["dump","🧠 Brain"],["priorites","🎯 Priorités"],["decision","🤔 Décision"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{flex:1,padding:"9px 6px",borderRadius:11,fontSize:12,fontWeight:500,background:tab===k?C.white:C.warm,color:tab===k?C.charcoal:C.muted,border:"none",boxShadow:tab===k?"0 1px 6px rgba(58,53,48,.1)":"none",transition:"all .2s"}}>
            {l}
          </button>
        ))}
      </div>

      {/* Brain Dump */}
      {tab==="dump"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Card>
            <p style={{fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:12}}>Parle ou écris <strong>tout</strong> ce qui tourne dans ta tête. Sans filtre, sans ordre. L'IA va trier et prioriser.</p>
            <VoiceBanner on={voiceDump.on} onStop={voiceDump.stop}/>
            <textarea value={dump} onChange={e=>setDump(e.target.value)}
              placeholder="Ma machine à faire, appeler maman, décider pour le master, voir Sarah ce week-end, dossier jeudi…"
              rows={6} style={{width:"100%",fontSize:14,color:C.charcoal,lineHeight:1.7,background:C.warm,borderRadius:12,padding:"14px 16px"}}/>
            <div style={{display:"flex",gap:10,marginTop:12}}>
              <MicBtn on={voiceDump.on} onToggle={voiceDump.toggle} size={48}/>
              <Btn onClick={analyze} disabled={loading||!dump.trim()} color={dump.trim()?C.lavender:C.lavPale}
                style={{fontSize:13}}>
                {loading?<><Spinner/>Analyse…</>:"✨ Trier & Prioriser"}
              </Btn>
            </div>
          </Card>

          {result&&(
            <div className="fu" style={{display:"flex",flexDirection:"column",gap:10}}>
              {result.insight&&(
                <Card style={{background:C.sagePale,borderLeft:`3px solid ${C.sage}`}}>
                  <p style={{fontSize:14,fontStyle:"italic",color:C.charcoal,lineHeight:1.7}}>💬 {result.insight}</p>
                </Card>
              )}
              <Card>
                <Label>Sélectionne ce que tu veux ajouter</Label>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {result.items?.map((item,i)=>{
                    const cfg=TASK_CATS[item.category]||TASK_CATS.semaine;const sel=selected[i];
                    return(
                      <div key={i} onClick={()=>setSelected(s=>({...s,[i]:!s[i]}))}
                        style={{display:"flex",gap:10,alignItems:"flex-start",padding:"12px 14px",borderRadius:14,background:sel?cfg.bg:C.warm,border:`1.5px solid ${sel?cfg.c+"44":"transparent"}`,cursor:"pointer",transition:"all .2s"}}>
                        <CheckBox done={sel} onToggle={()=>setSelected(s=>({...s,[i]:!s[i]}))} color={cfg.c}/>
                        <div style={{flex:1}}>
                          <Pill text={cfg.label} c={cfg.c} bg={cfg.bg}/>
                          <p style={{fontSize:14,color:C.charcoal,marginTop:5,lineHeight:1.4}}>{item.text}</p>
                          {item.note&&<p style={{fontSize:12,color:C.muted,fontStyle:"italic",marginTop:2}}>{item.note}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Btn onClick={importSelected} color={C.sage} style={{marginTop:14,fontSize:13}}>
                  ✅ Ajouter {Object.values(selected).filter(Boolean).length} tâche{Object.values(selected).filter(Boolean).length>1?"s":""}
                </Btn>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Priorités */}
      {tab==="priorites"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {pendingTasks.length===0?(
            <EmptyState emoji="🎯" title="Aucune tâche à prioriser" subtitle="Ajoute d'abord des tâches via le Brain Dump ou l'écran d'accueil."/>
          ):(
            <>
              <Card style={{background:`linear-gradient(135deg,${C.terracotta}18,${C.rosePale})`}}>
                <Serif size={20}>Prioriser ma semaine 🎯</Serif>
                <p style={{fontSize:13,color:C.muted,marginTop:6,lineHeight:1.6}}>L'IA analyse tes {pendingTasks.length} tâche{pendingTasks.length>1?"s":""} et les classe de la plus à la moins importante. Tu peux ajouter du contexte pour l'aider.</p>
              </Card>
              <Card>
                <Label>Contexte (optionnel)</Label>
                <VoiceBanner on={voicePrio.on} onStop={voicePrio.stop}/>
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <MicBtn on={voicePrio.on} onToggle={voicePrio.toggle} size={40}/>
                  <input value={prioContext} onChange={e=>setPrioContext(e.target.value)}
                    placeholder="Ex : j'ai un exam vendredi, je suis épuisée ce soir…"
                    style={{flex:1,fontSize:13,color:C.charcoal,background:C.warm,borderRadius:12,padding:"10px 14px"}}/>
                </div>
                <Btn onClick={prioritize} disabled={loadingPrio} color={C.terracotta} style={{fontSize:13}}>
                  {loadingPrio?<><Spinner/>Analyse en cours…</>:"🎯 Classer mes priorités"}
                </Btn>
              </Card>
              {prioResult&&(
                <div className="fu" style={{display:"flex",flexDirection:"column",gap:10}}>
                  {prioResult.message&&(
                    <Card style={{background:C.sagePale,borderLeft:`3px solid ${C.sage}`}}>
                      <p style={{fontSize:14,fontStyle:"italic",color:C.charcoal,lineHeight:1.7}}>💬 {prioResult.message}</p>
                    </Card>
                  )}
                  <Card>
                    <Label>Du plus au moins important</Label>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {prioResult.ranked?.map((item,i)=>{
                        const niveauColors={critique:{bg:C.coralPale,c:C.coral,border:C.coral},important:{bg:C.goldPale,c:C.gold,border:C.gold},flexible:{bg:C.sagePale,c:C.sage,border:C.sage},optionnel:{bg:C.warm,c:C.muted,border:C.faint}};
                        const nc=niveauColors[item.niveau]||niveauColors.optionnel;
                        return(
                          <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"13px 14px",borderRadius:14,background:nc.bg,border:`1.5px solid ${nc.border}22`}}>
                            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
                              <div style={{width:28,height:28,borderRadius:"50%",background:nc.c,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <span style={{fontSize:12,fontWeight:700,color:C.white}}>#{i+1}</span>
                              </div>
                              <span style={{fontSize:16}}>{item.emoji}</span>
                            </div>
                            <div style={{flex:1}}>
                              <p style={{fontSize:14,fontWeight:600,color:C.charcoal,lineHeight:1.4,marginBottom:4}}>{item.text}</p>
                              <p style={{fontSize:12,color:nc.c,fontWeight:500,marginBottom:3}}>{item.raison}</p>
                              <div style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,255,255,.6)",borderRadius:8,padding:"3px 8px"}}>
                                <span style={{fontSize:11}}>⏰</span>
                                <span style={{fontSize:11,color:C.charcoal,fontWeight:500}}>{item.quand}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                  <Card style={{background:C.lavPale,borderLeft:`3px solid ${C.lavender}`}}>
                    <p style={{fontSize:12,fontWeight:600,color:C.lavender,textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>À retenir</p>
                    <p style={{fontSize:13,color:C.charcoal,lineHeight:1.7}}>
                      {prioResult.ranked?.filter(t=>t.niveau==="critique").length>0
                        ?`🔴 ${prioResult.ranked.filter(t=>t.niveau==="critique").length} tâche${prioResult.ranked.filter(t=>t.niveau==="critique").length>1?"s critiques":" critique"} à traiter en premier. `
                        :""}
                      {prioResult.ranked?.filter(t=>t.niveau==="flexible"||t.niveau==="optionnel").length>0
                        ?`🟢 ${prioResult.ranked.filter(t=>t.niveau==="flexible"||t.niveau==="optionnel").length} tâche${prioResult.ranked.filter(t=>t.niveau==="flexible"||t.niveau==="optionnel").length>1?"s peuvent":"  peut"} être repoussée${prioResult.ranked.filter(t=>t.niveau==="flexible"||t.niveau==="optionnel").length>1?"s":""} sans conséquence.`
                        :""}
                    </p>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Décision */}
      {tab==="decision"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Card>
            <Label>Ta question</Label>
            <div style={{position:"relative",marginBottom:14}}>
              <VoiceBanner on={voiceDec.on} onStop={voiceDec.stop}/>
              <textarea value={q} onChange={e=>setQ(e.target.value)}
                placeholder="Est-ce que je fais un master ou une année sabbatique ?"
                rows={3} style={{width:"100%",fontSize:14,color:C.charcoal,lineHeight:1.6,background:C.warm,borderRadius:12,padding:"12px 50px 12px 14px"}}/>
              <div style={{position:"absolute",right:8,top:8}}><MicBtn on={voiceDec.on} onToggle={voiceDec.toggle} size={36}/></div>
            </div>
            <Label>Les options (optionnel)</Label>
            {options.map((opt,i)=><input key={i} value={opt} onChange={e=>setOptions(o=>{const n=[...o];n[i]=e.target.value;return n;})}
              placeholder={`Option ${i+1}…`}
              style={{display:"block",width:"100%",fontSize:14,color:C.charcoal,background:C.warm,borderRadius:12,padding:"10px 14px",marginBottom:8}}/>)}
            <button onClick={()=>setOptions(o=>[...o,""])} style={{fontSize:12,color:C.muted,background:"none",border:"none",marginBottom:14}}>＋ Ajouter une option</button>
            <Btn onClick={decide} disabled={loadingDec||!q.trim()} color={q.trim()?C.gold:C.goldPale} textColor={C.charcoal}>
              {loadingDec?<><Spinner/>Réflexion…</>:"✨ M'aider à décider"}
            </Btn>
          </Card>

          {decResult&&(
            <div className="fu" style={{display:"flex",flexDirection:"column",gap:12}}>
              {decResult.reframe&&<Card style={{background:C.goldPale,borderLeft:`3px solid ${C.gold}`}}><p style={{fontSize:11,fontWeight:600,color:C.gold,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>La vraie question</p><Serif size={19} style={{fontStyle:"italic"}}>"{decResult.reframe}"</Serif></Card>}
              {decResult.options?.length>0&&(
                <Card>
                  <Label>Analyse</Label>
                  {decResult.options.map((opt,i)=>(
                    <div key={i} style={{background:C.warm,borderRadius:14,padding:"14px",marginBottom:10}}>
                      <p style={{fontWeight:600,fontSize:15,marginBottom:10}}>{opt.name||`Option ${i+1}`}</p>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        <div><p style={{fontSize:11,color:C.sage,fontWeight:600,textTransform:"uppercase",marginBottom:5}}>Pour</p>{opt.pour?.map((p,j)=><p key={j} style={{fontSize:12,color:C.charcoal,marginBottom:3}}>✓ {p}</p>)}</div>
                        <div><p style={{fontSize:11,color:C.coral,fontWeight:600,textTransform:"uppercase",marginBottom:5}}>Contre</p>{opt.contre?.map((p,j)=><p key={j} style={{fontSize:12,color:C.charcoal,marginBottom:3}}>✗ {p}</p>)}</div>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
              {decResult.conseil&&<Card style={{background:C.sagePale}}><p style={{fontSize:11,fontWeight:600,color:C.sage,textTransform:"uppercase",marginBottom:6}}>Mon conseil</p><p style={{fontSize:14,color:C.charcoal,lineHeight:1.7}}>{decResult.conseil}</p></Card>}
              {decResult.question_cle&&<Card style={{background:C.lavPale,textAlign:"center",padding:"22px"}}><p style={{fontSize:11,fontWeight:600,color:C.lavender,textTransform:"uppercase",marginBottom:10}}>La seule question à te poser</p><Serif size={21} style={{fontStyle:"italic"}}>"{decResult.question_cle}"</Serif></Card>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VIEW 3 — SPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SportView({cyclePhase,workouts,onLogWorkout,showToast}){
  const[selectedType,setSelectedType]=useState(null);const[activeEx,setActiveEx]=useState(null);const[duration,setDuration]=useState(45);const[note,setNote]=useState("");
  const PHASE_MAP={"Yoga doux":"yoga","Étirements":"yoga","Marche légère":"yoga","Cardio":"cardio","Musculation":"force","HIIT léger":"hiit","Course":"cardio","HIIT":"hiit","Musculation lourde":"force","Natation":"cardio","Marche":"yoga","Yoga":"yoga","Muscu légère":"force","Spinning":"cardio"};

  function log(){if(!selectedType)return;onLogWorkout({date:today(),type:selectedType,duration,note});showToast("💪 Séance enregistrée !");setNote("");}

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card style={{background:`linear-gradient(135deg,${C.sage},${C.mint})`}}>
        <Serif size={23} style={{color:C.white}}>Séance du jour 💪</Serif>
        {cyclePhase&&<p style={{fontSize:13,color:"rgba(255,255,255,.85)",marginTop:7,lineHeight:1.6}}>{cyclePhase.emoji} {cyclePhase.sportNote}</p>}
      </Card>

      {!cyclePhase&&<Card style={{background:C.goldPale,borderLeft:`3px solid ${C.gold}`}}><p style={{fontSize:13,color:C.charcoal,lineHeight:1.6}}>💡 Configure ton cycle pour recevoir des recommandations de sport adaptées à ta phase.</p></Card>}

      {cyclePhase&&(
        <Card>
          <Label>✨ Recommandé pour ta phase</Label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {cyclePhase.sport.map((s,i)=>(
              <button key={i} onClick={()=>setSelectedType(PHASE_MAP[s]||"force")}
                style={{padding:"8px 16px",borderRadius:20,fontSize:13,fontWeight:500,background:selectedType===PHASE_MAP[s]?cyclePhase.color:cyclePhase.pale,color:selectedType===PHASE_MAP[s]?C.white:cyclePhase.color,border:"none",transition:"all .2s"}}>
                {s}
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <Label>Ou choisis librement</Label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {Object.entries(WORKOUTS).map(([key,w])=>(
            <button key={key} onClick={()=>setSelectedType(key)}
              style={{padding:"13px 12px",borderRadius:16,textAlign:"left",background:selectedType===key?w.pale:C.warm,border:`2px solid ${selectedType===key?w.color:"transparent"}`,transition:"all .2s"}}>
              <p style={{fontSize:15,fontWeight:600,color:C.charcoal}}>{w.label}</p>
              <p style={{fontSize:11,color:C.muted,marginTop:3}}>{w.exercises.length} exercices</p>
            </button>
          ))}
        </div>
      </Card>

      {selectedType&&(
        <Card className="fu">
          <Label>{WORKOUTS[selectedType].label}</Label>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {WORKOUTS[selectedType].exercises.map((ex,i)=>(
              <div key={i} onClick={()=>setActiveEx(activeEx===i?null:i)} style={{borderRadius:14,overflow:"hidden",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:activeEx===i?WORKOUTS[selectedType].pale:C.warm,transition:"background .2s"}}>
                  <div style={{width:30,height:30,borderRadius:10,background:WORKOUTS[selectedType].color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:12,fontWeight:700,color:WORKOUTS[selectedType].color}}>{i+1}</span>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,fontWeight:500,color:C.charcoal}}>{ex.name}</p>
                    <p style={{fontSize:12,color:C.muted}}>{ex.sets} · {ex.muscle}</p>
                  </div>
                  <span style={{fontSize:11,color:C.faint}}>{activeEx===i?"▲":"▼"}</span>
                </div>
                {activeEx===i&&(
                  <div style={{padding:"10px 14px",background:WORKOUTS[selectedType].pale,borderTop:`1px solid ${WORKOUTS[selectedType].color}20`}}>
                    <p style={{fontSize:13,color:C.charcoal,lineHeight:1.6}}>💡 {ex.tip}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{marginTop:16,borderTop:`1px solid ${C.warm}`,paddingTop:16}}>
            <Label>Enregistrer la séance</Label>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <p style={{fontSize:13,color:C.muted}}>Durée :</p>
              {[30,45,60,90].map(d=>(
                <button key={d} onClick={()=>setDuration(d)}
                  style={{padding:"7px 13px",borderRadius:10,fontSize:12,fontWeight:500,background:duration===d?C.sage:C.warm,color:duration===d?C.white:C.charcoal,border:"none",transition:"all .2s"}}>
                  {d} min
                </button>
              ))}
            </div>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note : sensations, PR, fatigue…"
              style={{width:"100%",fontSize:13,color:C.charcoal,background:C.warm,borderRadius:12,padding:"10px 14px",marginBottom:10}}/>
            <Btn onClick={log} color={C.terracotta}>🏋️ Enregistrer la séance</Btn>
          </div>
        </Card>
      )}

      {workouts.length>0?(
        <Card>
          <Label>Historique récent</Label>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {workouts.slice(-5).reverse().map((w,i)=>{
              const wt=WORKOUTS[w.type];
              return(
                <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 14px",background:wt?.pale||C.warm,borderRadius:14}}>
                  <span style={{fontSize:20}}>{wt?.label.split(" ")[0]||"💪"}</span>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,fontWeight:500,color:C.charcoal}}>{wt?.label||w.type}</p>
                    <p style={{fontSize:12,color:C.muted}}>{w.date} · {w.duration} min{w.note&&` · ${w.note.substring(0,30)}…`}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ):(
        !selectedType&&<EmptyState emoji="💪" title="Choisis ta séance" subtitle="Sélectionne un type d'entraînement ci-dessus pour voir les exercices."/>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VIEW 4 — REPAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function RepasView({cyclePhase,showToast}){
  const[filter,setFilter]=useState(cyclePhase?"cycle":"all");const[activeRecipe,setActiveRecipe]=useState(null);const[shopList,setShopList]=useState([]);const[aiRecipe,setAiRecipe]=useState("");const[loadingAi,setLoadingAi]=useState(false);const[prompt,setPrompt]=useState("");
  const voice=useSpeech({onFinal:t=>setPrompt(p=>p+t)});

  const filtered=RECIPES.filter(r=>{
    if(filter==="rapide")return r.time<=12;
    if(filter==="cycle"&&cyclePhase)return r.phase.includes(cyclePhase.key);
    return true;
  });

  function addToShop(recipe){setShopList(l=>[...new Set([...l,...recipe.ingredients])]);showToast("🛒 Ingrédients ajoutés !");}

  async function generateAiRecipe(){
    if(!prompt.trim())return;setLoadingAi(true);setAiRecipe("");
    const txt=await callClaude("Nutritionniste bienveillante. Recette simple <20 min, healthy, ingrédients courants. Nom, ingrédients (liste courte), étapes (3-4 max). En français, sans markdown.",`${prompt}${cyclePhase?` Phase ${cyclePhase.label}.`:""}`);
    setAiRecipe(txt);setLoadingAi(false);
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card style={{background:`linear-gradient(135deg,${C.gold},${C.rose})`}}>
        <Serif size={23} style={{color:C.white}}>Repas simples 🥗</Serif>
        <p style={{fontSize:13,color:"rgba(255,255,255,.85)",marginTop:6}}>Des recettes rapides adaptées à ton cycle.</p>
      </Card>

      {cyclePhase&&(
        <Card style={{background:cyclePhase.pale,borderLeft:`3px solid ${cyclePhase.color}`}}>
          <p style={{fontSize:12,fontWeight:600,color:cyclePhase.color,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>{cyclePhase.emoji} Mange ça cette semaine</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
            {cyclePhase.foods.map((f,i)=><span key={i} style={{background:"rgba(255,255,255,.75)",borderRadius:20,padding:"4px 10px",fontSize:12,color:C.charcoal}}>{f}</span>)}
          </div>
          <p style={{fontSize:12,color:C.muted}}>🚫 Évite : {cyclePhase.avoid.join(", ")}</p>
        </Card>
      )}

      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
        {[["all","Tout"],["rapide","⚡ Rapide"],["cycle",`${cyclePhase?.emoji||"🌙"} Ma phase`]].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)}
            style={{padding:"8px 16px",borderRadius:20,fontSize:13,fontWeight:500,background:filter===k?C.charcoal:C.white,color:filter===k?C.white:C.muted,border:"none",boxShadow:filter===k?"none":"0 1px 4px rgba(58,53,48,.07)",whiteSpace:"nowrap",flexShrink:0}}>
            {l}
          </button>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.length===0&&<EmptyState emoji="🍽️" title="Aucune recette trouvée" subtitle="Essaie un autre filtre ou demande une recette à l'IA."/>}
        {filtered.map(r=>(
          <div key={r.id}>
            <div onClick={()=>setActiveRecipe(activeRecipe===r.id?null:r.id)}
              style={{background:r.color||C.warm,borderRadius:18,padding:"15px 18px",cursor:"pointer",transition:"all .2s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <p style={{fontSize:15,fontWeight:600,color:C.charcoal}}>{r.name}</p>
                  <div style={{display:"flex",gap:10,marginTop:5,flexWrap:"wrap"}}>
                    <span style={{fontSize:12,color:C.muted}}>⏱ {r.time} min</span>
                    <span style={{fontSize:12,color:C.muted}}>🔥 {r.cal} kcal</span>
                    <span style={{fontSize:12,color:C.terracotta,fontWeight:500}}>{r.tag}</span>
                  </div>
                </div>
                <span style={{fontSize:13,color:C.faint,marginLeft:8}}>{activeRecipe===r.id?"▲":"▼"}</span>
              </div>
            </div>
            {activeRecipe===r.id&&(
              <div className="fu" style={{background:C.white,borderRadius:"0 0 18px 18px",padding:"16px 18px",marginTop:-4,boxShadow:"0 6px 16px rgba(58,53,48,.07)"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div><Label>Ingrédients</Label>{r.ingredients.map((ing,i)=><p key={i} style={{fontSize:13,color:C.charcoal,marginBottom:5,lineHeight:1.4}}>· {ing}</p>)}</div>
                  <div><Label>Étapes</Label>{r.steps.map((s,i)=><p key={i} style={{fontSize:12,color:C.charcoal,marginBottom:6,lineHeight:1.5}}><strong style={{color:C.terracotta}}>{i+1}.</strong> {s}</p>)}</div>
                </div>
                <Btn onClick={()=>addToShop(r)} color={C.gold} textColor={C.charcoal} style={{marginTop:14,fontSize:13}}>🛒 Ajouter à ma liste de courses</Btn>
              </div>
            )}
          </div>
        ))}
      </div>

      <Card>
        <Label>✨ Demande une recette à l'IA</Label>
        <VoiceBanner on={voice.on} onStop={voice.stop}/>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <MicBtn on={voice.on} onToggle={voice.toggle} size={40}/>
          <input value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")generateAiRecipe();}}
            placeholder="Quelque chose de chaud avec peu d'ingrédients…"
            style={{flex:1,fontSize:13,color:C.charcoal,background:C.warm,borderRadius:12,padding:"10px 14px"}}/>
        </div>
        <Btn onClick={generateAiRecipe} disabled={loadingAi||!prompt.trim()} color={prompt.trim()?C.terracotta:C.roseLight} style={{fontSize:13}}>
          {loadingAi?<><Spinner/>Inspiration…</>:"🍳 Générer une recette"}
        </Btn>
        {aiRecipe&&(
          <div className="fu" style={{marginTop:12,background:C.warm,borderRadius:14,padding:"14px 16px"}}>
            <p style={{fontSize:13,color:C.charcoal,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiRecipe}</p>
          </div>
        )}
      </Card>

      {shopList.length>0&&(
        <Card>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <Label style={{marginBottom:0}}>🛒 Ma liste de courses</Label>
            <button onClick={()=>setShopList([])} style={{fontSize:12,color:C.muted,background:"none",border:"none"}}>Vider</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {shopList.map((item,i)=><span key={i} style={{background:C.goldPale,borderRadius:20,padding:"5px 12px",fontSize:13,color:C.charcoal}}>{item}</span>)}
          </div>
        </Card>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VIEW 5 — CYCLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CycleView({cycleData,onUpdate,showToast,onNavigate}){
  const[tab,setTab]=useState("suivi");const[logFlow,setLogFlow]=useState("Modéré");const[logSymptoms,setLogSymptoms]=useState([]);const[logNote,setLogNote]=useState("");
  const phase=getCyclePhase(cycleData.lastPeriodStart,cycleData.cycleLength);
  const phases=["menstruation","folliculaire","ovulation","luteale"];
  const phaseWidths=[5,8,3,12];
  const nextPeriod=cycleData.lastPeriodStart?(()=>{const d=new Date(cycleData.lastPeriodStart);d.setDate(d.getDate()+cycleData.cycleLength);return fmtDate(d);})():null;

  function saveLog(){
    const newLog={date:today(),flow:logFlow,symptoms:logSymptoms,note:logNote};
    onUpdate({...cycleData,log:[...(cycleData.log||[]).filter(l=>l.date!==today()),newLog]});
    setLogSymptoms([]);setLogNote("");showToast("💾 Journalisé !");
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card style={{background:`linear-gradient(135deg,${C.night},${C.nightMid})`}}>
        <Serif size={23} style={{color:C.white}}>Mon cycle 🌙</Serif>
        {phase?(
          <div style={{marginTop:10}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.13)",borderRadius:14,padding:"9px 16px"}}>
              <span style={{fontSize:22}}>{phase.emoji}</span>
              <div><p style={{fontSize:14,fontWeight:500,color:C.white}}>{phase.label}</p><p style={{fontSize:12,color:"rgba(255,255,255,.6)"}}>Jour {phase.day} · {phase.days}</p></div>
            </div>
            <p style={{fontSize:13,color:"rgba(255,255,255,.65)",marginTop:10,lineHeight:1.7,fontStyle:"italic"}}>"{phase.message}"</p>
          </div>
        ):(
          <div style={{marginTop:10}}>
            <p style={{fontSize:13,color:"rgba(255,255,255,.55)",lineHeight:1.6}}>Configure ton cycle pour des recommandations personnalisées 👇</p>
            <button onClick={()=>setTab("config")} style={{marginTop:10,background:"rgba(255,255,255,.15)",color:C.white,border:"none",borderRadius:10,padding:"8px 16px",fontSize:13}}>⚙️ Configurer maintenant</button>
          </div>
        )}
      </Card>

      {phase&&(
        <Card>
          <Label>Progression dans ton cycle</Label>
          <div style={{display:"flex",gap:3,height:12,borderRadius:8,overflow:"hidden",marginBottom:10}}>
            {phases.map((p,i)=>{const cfg=CYCLE_PHASES[p];const isActive=p===phase.key;return <div key={p} style={{flex:phaseWidths[i],background:isActive?cfg.color:cfg.pale,borderRadius:i===0?"8px 0 0 8px":i===3?"0 8px 8px 0":"0"}}/>;
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            {phases.map(p=>{const cfg=CYCLE_PHASES[p];const isActive=p===phase.key;return <div key={p} style={{textAlign:"center"}}><span style={{fontSize:14}}>{cfg.emoji}</span><p style={{fontSize:10,color:isActive?cfg.color:C.faint,fontWeight:isActive?600:400,marginTop:2}}>{cfg.label.split(" ")[0]}</p></div>;})}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div style={{display:"flex",gap:0,background:C.warm,borderRadius:14,padding:4}}>
        {[["suivi","📅 Suivi"],["config","⚙️ Config"],["phases","🌸 Phases"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{flex:1,padding:"9px 4px",borderRadius:11,fontSize:12,fontWeight:500,background:tab===k?C.white:C.warm,color:tab===k?C.charcoal:C.muted,border:"none",boxShadow:tab===k?"0 1px 6px rgba(58,53,48,.1)":"none",transition:"all .2s"}}>
            {l}
          </button>
        ))}
      </div>

      {tab==="suivi"&&(
        <Card>
          <Label>Journaliser aujourd'hui</Label>
          <p style={{fontSize:13,color:C.muted,marginBottom:8}}>Flux</p>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {FLOWS.map(f=><button key={f} onClick={()=>setLogFlow(f)} style={{flex:1,padding:"8px 4px",borderRadius:10,fontSize:11,fontWeight:500,background:logFlow===f?C.coral:C.warm,color:logFlow===f?C.white:C.muted,border:"none",transition:"all .2s"}}>{f}</button>)}
          </div>
          <p style={{fontSize:13,color:C.muted,marginBottom:8}}>Symptômes</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
            {SYMPTOMS.map(s=>{const sel=logSymptoms.includes(s);return(
              <button key={s} onClick={()=>setLogSymptoms(p=>sel?p.filter(x=>x!==s):[...p,s])}
                style={{padding:"6px 12px",borderRadius:20,fontSize:12,background:sel?C.coralPale:C.warm,border:`1.5px solid ${sel?C.coral:"transparent"}`,color:sel?C.coral:C.muted,fontWeight:sel?500:400,transition:"all .2s"}}>
                {s}
              </button>
            );})}
          </div>
          <input value={logNote} onChange={e=>setLogNote(e.target.value)} placeholder="Note : humeur, douleur, ressenti…"
            style={{width:"100%",fontSize:13,color:C.charcoal,background:C.warm,borderRadius:12,padding:"10px 14px",marginBottom:14}}/>
          <Btn onClick={saveLog} color={C.coral}>💾 Enregistrer</Btn>
          {cycleData.log?.length>0&&(
            <div style={{marginTop:14}}>
              <Label>Entrées récentes</Label>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {cycleData.log.slice(-3).reverse().map((l,i)=>(
                  <div key={i} style={{padding:"10px 14px",background:C.warm,borderRadius:12}}>
                    <p style={{fontSize:13,fontWeight:500,color:C.charcoal}}>{l.date} · {l.flow}</p>
                    {l.symptoms?.length>0&&<p style={{fontSize:12,color:C.muted,marginTop:2}}>{l.symptoms.join(", ")}</p>}
                    {l.note&&<p style={{fontSize:12,color:C.muted,fontStyle:"italic",marginTop:1}}>{l.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {tab==="config"&&(
        <Card>
          <Label>Mon cycle</Label>
          <p style={{fontSize:13,color:C.muted,marginBottom:6}}>Premier jour des dernières règles</p>
          <input type="date" value={cycleData.lastPeriodStart||""} onChange={e=>onUpdate({...cycleData,lastPeriodStart:e.target.value})}
            style={{width:"100%",fontSize:14,color:C.charcoal,background:C.warm,borderRadius:12,padding:"12px 16px",marginBottom:16}}/>
          <p style={{fontSize:13,color:C.muted,marginBottom:6}}>Longueur du cycle : <strong style={{color:C.charcoal}}>{cycleData.cycleLength} jours</strong></p>
          <input type="range" min={21} max={35} value={cycleData.cycleLength} onChange={e=>onUpdate({...cycleData,cycleLength:parseInt(e.target.value)})} style={{width:"100%",marginBottom:4}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.faint,marginBottom:16}}><span>21j</span><span>28j</span><span>35j</span></div>
          {nextPeriod&&(
            <div style={{background:C.coralPale,borderRadius:14,padding:"14px 18px",textAlign:"center"}}>
              <p style={{fontSize:12,color:C.muted,marginBottom:4}}>Prochaines règles estimées</p>
              <p style={{fontSize:20,fontWeight:600,color:C.coral}}>{nextPeriod}</p>
            </div>
          )}
        </Card>
      )}

      {tab==="phases"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {phases.map(p=>{const cfg=CYCLE_PHASES[p];const isActive=phase?.key===p;return(
            <Card key={p} style={{borderLeft:`3px solid ${isActive?cfg.color:"transparent"}`,transition:"border-color .3s"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontSize:24}}>{cfg.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <p style={{fontSize:15,fontWeight:600,color:C.charcoal}}>{cfg.label}</p>
                    {isActive&&<span style={{background:cfg.color,color:C.white,borderRadius:8,padding:"2px 8px",fontSize:10,fontWeight:600}}>Maintenant</span>}
                  </div>
                  <p style={{fontSize:12,color:C.muted}}>{cfg.days} · {cfg.energy}</p>
                </div>
              </div>
              <p style={{fontSize:13,color:C.muted,fontStyle:"italic",marginBottom:10}}>{cfg.mood}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                {cfg.foods.slice(0,5).map((f,i)=><span key={i} style={{background:cfg.pale,color:cfg.color,borderRadius:20,padding:"3px 10px",fontSize:11}}>{f}</span>)}
              </div>
              <p style={{fontSize:12,color:C.muted}}>🏋️ {cfg.sport.join(" · ")}</p>
            </Card>
          );})}
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VIEW 6 — SOIRÉE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SoireeView({tasks,showToast}){
  const[plan,setPlan]=useState({decompress:true,selfcare:true,tv:true,sleep:true});
  const[customTasks,setCustomTasks]=useState([]);
  const[input,setInput]=useState("");const[inputMin,setInputMin]=useState(15);
  const[generated,setGenerated]=useState(false);const[checked,setChecked]=useState({});
  const voice=useSpeech({onFinal:t=>setInput(p=>p+t)});
  const urgentTasks=tasks.filter(t=>t.category==="urgent"&&!t.done);
  const totalMin=EVENING_BLOCKS.filter(b=>plan[b.id]).reduce((a,b)=>a+b.min,0)+customTasks.reduce((a,t)=>a+t.min,0);

  function addCustom(){
    if(!input.trim())return;
    setCustomTasks(p=>[...p,{id:Date.now(),label:input.trim(),e:"📌",min:inputMin,c:"#F2EFED",custom:true}]);
    setInput("");setInputMin(15);setGenerated(false);voice.stop();
  }

  function getTimeline(){
    const now=new Date();let cur=now.getHours()*60+now.getMinutes();
    return[...EVENING_BLOCKS.filter(b=>plan[b.id]),...customTasks].map(b=>{
      const s=`${String(Math.floor(cur/60)).padStart(2,"0")}h${String(cur%60).padStart(2,"0")}`;
      cur+=b.min;
      const e=`${String(Math.floor(cur/60)).padStart(2,"0")}h${String(cur%60).padStart(2,"0")}`;
      return{...b,start:s,end:e};
    });
  }
  const timeline=generated?getTimeline():[];
  const endHour=timeline.length?timeline[timeline.length-1].end:null;
  const checkedCount=Object.values(checked).filter(Boolean).length;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card style={{background:`linear-gradient(135deg,${C.night},${C.nightMid})`}}>
        <Serif size={23} style={{color:C.white}}>Ma soirée à moi ✨</Serif>
        <p style={{fontSize:13,color:"rgba(255,255,255,.55)",marginTop:6}}>Ton seul moment rien qu'à toi. Organise-le avec intention.</p>
        {generated&&timeline.length>0&&<p style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:8}}>{checkedCount}/{timeline.length} accomplis</p>}
      </Card>

      {urgentTasks.length>0&&(
        <Card style={{borderLeft:`3px solid ${C.coral}`}}>
          <Label style={{color:C.coral}}>🔥 À faire ce soir</Label>
          {urgentTasks.slice(0,3).map(t=><p key={t.id} style={{fontSize:14,color:C.charcoal,marginBottom:3}}>· {t.text}</p>)}
        </Card>
      )}

      <Card>
        <Label>Que veux-tu faire ce soir ?</Label>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {EVENING_BLOCKS.map(b=>(
            <div key={b.id} onClick={()=>{setPlan(p=>({...p,[b.id]:!p[b.id]}));setGenerated(false);}}
              style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:14,background:plan[b.id]?b.c:C.warm,cursor:"pointer",transition:"all .2s",border:`1.5px solid ${plan[b.id]?"rgba(0,0,0,.06)":"transparent"}`}}>
              <span style={{fontSize:20}}>{b.e}</span>
              <div style={{flex:1}}><p style={{fontSize:14,fontWeight:500,color:C.charcoal}}>{b.label}</p><p style={{fontSize:12,color:C.muted}}>{b.min} min</p></div>
              <CheckBox done={plan[b.id]} onToggle={()=>{setPlan(p=>({...p,[b.id]:!p[b.id]}));setGenerated(false);}} color={C.sage}/>
            </div>
          ))}
        </div>

        {customTasks.length>0&&(
          <div style={{marginTop:12}}>
            <Label>Mes tâches personnalisées</Label>
            {customTasks.map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:14,background:"#F2EFED",marginBottom:6}}>
                <span style={{fontSize:18}}>📌</span>
                <div style={{flex:1}}><p style={{fontSize:14,fontWeight:500,color:C.charcoal}}>{t.label}</p><p style={{fontSize:12,color:C.muted}}>{t.min} min</p></div>
                <button onClick={()=>{setCustomTasks(p=>p.filter(x=>x.id!==t.id));setGenerated(false);}} style={{background:"none",border:"none",fontSize:16,color:C.faint,padding:"0 4px"}}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Ajouter tâche */}
        <div style={{marginTop:14,borderTop:`1px solid ${C.warm}`,paddingTop:14}}>
          <Label>＋ Ajouter une tâche</Label>
          <VoiceBanner on={voice.on} onStop={voice.stop}/>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <MicBtn on={voice.on} onToggle={voice.toggle} size={40}/>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addCustom();}}
              placeholder="Ex : appeler maman, finir le dossier…"
              style={{flex:1,fontSize:13,color:C.charcoal,background:C.warm,borderRadius:12,padding:"10px 14px"}}/>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:C.muted,alignSelf:"center"}}>Durée :</span>
            {[10,15,20,30,45,60].map(m=>(
              <button key={m} onClick={()=>setInputMin(m)}
                style={{padding:"6px 10px",borderRadius:10,fontSize:12,fontWeight:500,border:"none",background:inputMin===m?C.night:C.warm,color:inputMin===m?C.white:C.muted,transition:"all .2s"}}>
                {m}min
              </button>
            ))}
          </div>
          <Btn onClick={addCustom} disabled={!input.trim()} color={input.trim()?C.terracotta:C.roseLight} style={{fontSize:13}}>
            Ajouter à ma soirée
          </Btn>
        </div>

        <div style={{margin:"14px 0 12px",padding:"12px 16px",background:C.warm,borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,color:C.muted}}>Durée totale</span>
          <span style={{fontSize:15,fontWeight:600,color:C.charcoal}}>{totalMin} min</span>
        </div>
        <Btn onClick={()=>setGenerated(true)} color={C.night}>🌙 Générer mon planning soirée</Btn>
      </Card>

      {generated&&(
        <Card className="fu">
          <Serif size={20} style={{marginBottom:4,fontStyle:"italic"}}>Ta soirée idéale</Serif>
          {endHour&&<p style={{fontSize:12,color:C.muted,marginBottom:16}}>Coucher estimé à {endHour} 💤</p>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {timeline.map((block,i)=>{
              const done=checked[i];
              return(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",opacity:done?.5:1,transition:"opacity .3s"}}>
                  <div style={{width:52,textAlign:"right",flexShrink:0,paddingTop:11}}>
                    <p style={{fontSize:12,fontWeight:600,color:C.charcoal}}>{block.start}</p>
                    <p style={{fontSize:10,color:C.faint}}>→{block.end}</p>
                  </div>
                  <div style={{width:2,background:done?C.sage:C.roseLight,borderRadius:2,alignSelf:"stretch",flexShrink:0,transition:"background .3s"}}/>
                  <div style={{flex:1,background:done?C.sagePale:block.c,borderRadius:12,padding:"10px 14px",transition:"background .3s",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1}}>
                      <p style={{fontSize:14,fontWeight:500,color:C.charcoal,textDecoration:done?"line-through":"none"}}>{block.e} {block.label}</p>
                      {block.id==="urgent"&&urgentTasks[0]&&<p style={{fontSize:12,color:C.muted,marginTop:2}}>→ {urgentTasks[0].text}</p>}
                    </div>
                    <CheckBox done={done} onToggle={()=>{setChecked(c=>({...c,[i]:!c[i]}));if(!done)showToast("✅ Accompli !");}} color={C.sage}/>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{fontSize:12,color:C.faint,textAlign:"center",marginTop:16}}>Tu mérites ce temps 🌸</p>
        </Card>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FLOATING MIC — accessible depuis tous les onglets
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FloatingMic({onResult,showToast}){
  const[open,setOpen]=useState(false);const[text,setText]=useState("");const[loading,setLoading]=useState(false);
  const voice=useSpeech({onFinal:t=>setText(p=>p+t),onInterim:t=>{if(!text)setText(t);}});

  async function submit(){
    if(!text.trim())return;setLoading(true);
    const r=await callClaudeJSON(`Classe ce message dans une tâche. JSON sans backticks : {"text":"tâche claire et concise","category":"urgent|semaine|unjour","note":"conseil optionnel"}`,text);
    if(r){onResult(r);showToast("✅ Tâche créée !");}
    setText("");setOpen(false);setLoading(false);voice.stop();
  }

  return(
    <>
      {open&&(
        <div className="fi" style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:448,background:C.white,borderRadius:22,padding:"16px 18px",boxShadow:"0 8px 40px rgba(58,53,48,.18)",zIndex:100}}>
          <p style={{fontSize:12,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Ajouter une tâche rapidement</p>
          <VoiceBanner on={voice.on} onStop={voice.stop}/>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <MicBtn on={voice.on} onToggle={voice.toggle} size={42}/>
            <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")submit();}}
              autoFocus placeholder="Parle ou écris…"
              style={{flex:1,fontSize:15,color:C.charcoal,background:C.warm,borderRadius:12,padding:"10px 14px"}}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setOpen(false);voice.stop();setText("");}} style={{flex:1,background:C.warm,color:C.muted,border:"none",borderRadius:12,padding:"11px",fontSize:13,fontWeight:500}}>Annuler</button>
            <button onClick={submit} disabled={loading||!text.trim()} style={{flex:2,background:text.trim()?C.terracotta:C.roseLight,color:C.white,border:"none",borderRadius:12,padding:"11px",fontSize:13,fontWeight:600,transition:"background .2s"}}>
              {loading?<><Spinner/>…</>:"✅ Ajouter"}
            </button>
          </div>
        </div>
      )}
      {open&&<div onClick={()=>{setOpen(false);voice.stop();}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.2)",zIndex:99}}/>}
      <button onClick={()=>setOpen(o=>!o)}
        style={{position:"fixed",bottom:76,right:16,width:52,height:52,borderRadius:"50%",background:open?C.charcoal:C.terracotta,boxShadow:"0 4px 20px rgba(196,122,90,.45)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",zIndex:101,transition:"all .25s",transform:open?"rotate(45deg)":"none"}}>
        {open?(
          <span style={{color:C.white,fontSize:22,lineHeight:1}}>✕</span>
        ):(
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        )}
      </button>
    </>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App(){
  const[onboarded,setOnboarded]=useState(false);
  const[name,setName]=useState("");
  const[view,setView]=useState("home");
  const[tasks,setTasks]=useState([]);
  const[workouts,setWorkouts]=useState([]);
  const[cycleData,setCycleData]=useState({lastPeriodStart:"",cycleLength:28,log:[]});
  const[moods,setMoods]=useState([]);
  const[toast,setToast]=useState({msg:"",visible:false});
  const scrollRef=useRef(null);
  const cyclePhase=getCyclePhase(cycleData.lastPeriodStart,cycleData.cycleLength);
  const moodToday=moods.find(m=>m.date===today());

  useEffect(()=>{scrollRef.current?.scrollTo({top:0,behavior:"smooth"});},[view]);

  function showToast(msg){setToast({msg,visible:true});setTimeout(()=>setToast({msg:"",visible:false}),2500);}
  function handleOnboardingDone({name:n,lastPeriodStart,cycleLength}){
    setName(n);
    setCycleData(d=>({...d,lastPeriodStart,cycleLength}));
    setOnboarded(true);
  }
  function addTask(text,cat){setTasks(t=>[...t,{id:Date.now(),text,category:cat,done:false}]);}
  function addTaskFromFloat(item){setTasks(t=>[...t,{id:Date.now(),text:item.text,category:item.category||"semaine",note:item.note,done:false}]);}
  function checkTask(id){setTasks(t=>t.map(x=>x.id===id?{...x,done:!x.done}:x));}
  function importTasks(items){setTasks(t=>[...t,...items.map(i=>({id:Date.now()+Math.random(),text:i.text,category:i.category,note:i.note,done:false}))]);setView("home");}
  function saveMood(m){setMoods(ms=>[...ms.filter(x=>x.date!==today()),{...m,date:today()}]);}

  if(!onboarded)return <Onboarding onDone={handleOnboardingDone}/>;

  const currentNav=NAV.find(n=>n.k===view);

  return(
    <>
      <style dangerouslySetInnerHTML={{__html:FONTS}}/>
      <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",display:"flex",flexDirection:"column",background:C.cream}}>

        {/* Sticky header */}
        <div style={{padding:"14px 18px 0",background:C.cream,position:"sticky",top:0,zIndex:20,borderBottom:"1px solid transparent"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,color:C.charcoal,lineHeight:1.1}}>{currentNav?.e} {name}</p>
              {cyclePhase?(
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:cyclePhase.color,display:"inline-block"}}/>
                  <p style={{fontSize:11,color:cyclePhase.color,fontWeight:600}}>{cyclePhase.label} · J{cyclePhase.day}</p>
                </div>
              ):(
                <p style={{fontSize:11,color:C.faint,marginTop:2}}>Configure ton cycle 🌙</p>
              )}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {moodToday&&<span style={{fontSize:22}}>{moodToday.e}</span>}
              <div style={{background:C.coralPale,borderRadius:12,padding:"5px 12px"}}>
                <span style={{fontSize:13,fontWeight:600,color:C.coral}}>{tasks.filter(t=>!t.done).length}</span>
                <span style={{fontSize:11,color:C.coral}}> tâches</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"12px 14px 100px"}}>
          {view==="home"&&<MoiView name={name} tasks={tasks} onCheck={checkTask} onAdd={addTask} moodToday={moodToday} onMood={saveMood} cyclePhase={cyclePhase} onNavigate={setView} showToast={showToast}/>}
          {view==="mental"&&<MentalView onImport={importTasks} showToast={showToast} tasks={tasks}/>}
          {view==="sport"&&<SportView cyclePhase={cyclePhase} workouts={workouts} onLogWorkout={w=>setWorkouts(ws=>[...ws,w])} showToast={showToast}/>}
          {view==="repas"&&<RepasView cyclePhase={cyclePhase} showToast={showToast}/>}
          {view==="cycle"&&<CycleView cycleData={cycleData} onUpdate={setCycleData} showToast={showToast} onNavigate={setView}/>}
          {view==="soiree"&&<SoireeView tasks={tasks} showToast={showToast}/>}
        </div>

        {/* Bottom nav */}
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(255,255,255,.97)",backdropFilter:"blur(10px)",borderTop:`1px solid ${C.warm}`,display:"grid",gridTemplateColumns:`repeat(${NAV.length},1fr)`,padding:"8px 0 14px",boxShadow:"0 -4px 24px rgba(58,53,48,.08)",zIndex:30}}>
          {NAV.map(n=>(
            <button key={n.k} onClick={()=>setView(n.k)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",padding:"4px 0",position:"relative"}}>
              {view===n.k&&<div style={{position:"absolute",top:-8,width:20,height:3,borderRadius:2,background:C.terracotta}}/>}
              <span style={{fontSize:18,transition:"transform .2s",transform:view===n.k?"scale(1.15)":"scale(1)"}}>{n.e}</span>
              <span style={{fontSize:9,fontWeight:600,color:view===n.k?C.terracotta:C.faint,letterSpacing:".03em",textTransform:"uppercase",transition:"color .2s"}}>{n.l}</span>
            </button>
          ))}
        </div>

        {/* Floating mic */}
        <FloatingMic onResult={addTaskFromFloat} showToast={showToast}/>

        {/* Toast */}
        <Toast msg={toast.msg} visible={toast.visible}/>
      </div>
    </>
  );
}
