'use strict';
(function(root){
const clone=v=>JSON.parse(JSON.stringify(v));
const equal=(a,b)=>Array.isArray(a)&&Array.isArray(b)?a.length===b.length&&a.every((v,i)=>equal(v,b[i])):typeof a==='number'&&typeof b==='number'?Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b)):JSON.stringify(a)===JSON.stringify(b);
function numberList(value){
 if(Array.isArray(value)){if(value.length>50||!value.every(n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=1e6))throw Error('Уведи до 50 звичайних чисел.');return [...value];}
 let text=String(value??'').trim().replace(/[−–]/g,'-').replace(/^a\s*=\s*/,'');
 if(text.startsWith('[')){if(!text.endsWith(']'))throw Error('Закрий квадратні дужки списку.');text=text.slice(1,-1).trim();}
 if(!text)return [];
 const parts=text.includes(',')?text.split(',').map(v=>v.trim()):text.split(/\s+/);
 if(parts.length>50||parts.some(v=>!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(v)))throw Error('Запиши числа через пропуск або кому; дробову частину — через крапку.');
 const nums=parts.map(Number);if(!nums.every(n=>Number.isFinite(n)&&Math.abs(n)<=1e6))throw Error('Числа мають бути скінченними й не більшими за мільйон за модулем.');return nums;
}
function command(source){
  const m=String(source||'').match(/^\s*(button|label)\s*\[\s*(['"])(text|width|bg|fg)\2\s*\]\s*=\s*(?:(['"])(.*?)\4|([+-]?\d+))\s*;?\s*(?:#[^\n]*)?$/s);
  return m?{target:m[1],prop:m[3],value:m[5]??Number(m[6])}:null;
}
function normalize(task,answer){
  const out={};for(const f of task.fields){let value=String(answer?.[f.key]??'').trim();
    if(f.kind==='fragment'||f.kind==='pyexpr')value=value.replace(/\s/g,'');
    if(f.kind==='numlist'){try{value=numberList(value);}catch(e){}}
    if(f.kind==='tokens')value=value?value.split(/\s+/):[];
    if(f.key==='event'&&value==='<Button-1>')value='<1>';
    if(f.kind==='number'&&value!==''&&Number.isFinite(Number(value))&&Math.abs(Number(value))<=1e9)value=Number(value);
    if(f.kind==='code')value=command(value)||value;
    if(f.aliases?.some(alias=>(f.kind==='pyexpr'?alias.replace(/\s/g,''):alias)===value))value=f.kind==='pyexpr'?String(f.expected).replace(/\s/g,''):f.expected;
    out[f.key]=value;
  }return out;
}
const signature=(task,answer)=>JSON.stringify(normalize(task,answer));
function evaluate(task,answer,inspected=false){
  const norm=normalize(task,answer),components=[];
  for(const f of task.fields){const value=norm[f.key],expected=f.kind==='pyexpr'?String(f.expected).replace(/\s/g,''):f.expected;
    if(Array.isArray(expected))components.push({component:f.label,correct:equal(value,expected),hint:f.hint});
    else if(expected&&typeof expected==='object')for(const [part,want] of Object.entries(expected))components.push({component:f.label+' · '+({target:'об’єкт',prop:'властивість',value:'значення'}[part]),correct:!!(value&&typeof value==='object'&&value[part]===want),hint:f.hint});
    else components.push({component:f.label,correct:value===expected,hint:f.hint});
  }
  if(task.inspect)components.push({component:task.inspectionLabel||'Випробування події',correct:!!inspected,hint:task.inspectionHint||'Випробуй налаштовану подію в перегляді, а потім перевір рішення.'});
  return {raw:components.filter(c=>c.correct).length/components.length*task.points,max:task.points,correct:components.every(c=>c.correct),components,hint:components.find(c=>!c.correct)?.hint||'Правильно. Можна рухатися далі.'};
}
function preview(task,answer,inputs={}){
  const v=normalize(task,answer);
  if(task.mode==='entry-copy')return {success:v.target==='label'&&v.prop==='text'&&v.read==='entry.get()',result:{value:String(inputs.text||'')}};
  if(['entry-predict','entry-sum'].includes(task.mode)){
    const x=Number(inputs.x??'2.5'),y=Number(inputs.y??'1.5');
    if(String(inputs.x??'2.5').trim()===''||String(inputs.y??'1.5').trim()===''||![x,y].every(n=>Number.isFinite(n)&&Math.abs(n)<=1e9))throw Error('Уведи два числа; дробову частину відділяй крапкою.');
    return {success:task.mode==='entry-predict'||v.convert==='float'&&v.operation==='x + y'&&v.target==='label'&&v.output==='str(z)',result:{x,y,value:x+y}};
  }
  return {success:task.mode==='predict'||(task.mode==='label-event'?v.handler==='click'&&v.event==='<1>':v.command==='click')};
}
function check(task,answer,rows=[],inspected=false){
  if(!Object.values(answer||{}).some(v=>String(v).trim()))throw Error('Спочатку запропонуй рішення; порожня відповідь не є спробою.');
  const sig=signature(task,answer),norm=normalize(task,answer);
  if(!Object.values(norm).some(v=>typeof v==='object'||String(v).trim()))throw Error('Спочатку запропонуй рішення; порожня відповідь не є спробою.');
  const old=rows.find(r=>r.signature===sig);
  if(old){const updated=evaluate(task,answer,inspected);if(updated.raw>old.evaluation.raw)old.evaluation=updated;return {row:old,duplicate:true};}
  if(rows.some(r=>r.evaluation.correct))throw Error('Це завдання вже розв’язано. Результат збережено.');
  const row={signature:sig,ordinal:rows.length+1,answer:clone(answer),evaluation:evaluate(task,answer,inspected)};rows.push(row);return {row,duplicate:false};
}
function factor(n,p){return n===1?p.first:n===2?p.second:p.later;}
function round(n){return Math.round((n+Number.EPSILON)*100)/100;}
function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
function grade(tasks,histories,p={first:1,second:.9,later:.8}){
  // Exact integer credit units avoid rounding each component before the final 1–12 grade.
  let denominator=1;for(const t of tasks){const n=evaluate(t,{}).components.length*100;denominator=denominator/gcd(denominator,n)*n;}
  let units=0;const details=[];
  for(const t of tasks){const rows=histories[t.id]||[],correct=rows.find(r=>r.evaluation.correct);
    const score=r=>r.evaluation.components.filter(c=>c.correct).length*t.points*Math.round(factor(r.ordinal,p)*100)*(denominator/(r.evaluation.components.length*100));
    const best=correct||rows.reduce((a,r)=>!a||score(r)>score(a)?r:a,null);
    const raw=best?best.evaluation.raw:0,mult=best?factor(best.ordinal,p):1,credit=best?score(best):0;units+=credit;
    details.push({task:t.id,title:t.title,raw:round(raw),max:t.points,factor:mult,earned:round(credit/denominator),attempts:rows.length,correct:!!correct,deduction:round(raw-credit/denominator),unresolved_loss:round(t.points-raw),components:best?.evaluation.components||[]});
  }
  const max=tasks.reduce((n,t)=>n+t.points,0);
  return {raw:round(units/denominator),max,grade:Math.max(1,Math.min(12,Math.floor((24*units+max*denominator)/(2*max*denominator)))),first_attempt:details.filter(d=>d.correct&&d.attempts===1).length,corrected:details.filter(d=>d.correct&&d.attempts>1).length,details,policy:p,authority:'browser_training_only'};
}
function test(questions,answers){
  const norm=normalize({fields:questions},answers),details=questions.map(q=>({question:q.key,score:Number(equal(norm[q.key],q.kind==='pyexpr'?String(q.expected).replace(/\s/g,''):q.expected)),max:1}));
  const raw=details.reduce((n,q)=>n+q.score,0),max=questions.length;
  return {raw,max,grade:Math.max(1,Math.min(12,Math.floor((24*raw+max)/(2*max)))),details,authority:'browser_training_only'};
}
const api={normalize,signature,evaluate,preview,check,grade,test,command,numberList,equal};
if(typeof module==='object'&&module.exports)module.exports=api;else root.TrainerEngine=api;
})(typeof window==='undefined'?{}:window);
