'use strict';
const $=id=>document.getElementById(id),lesson=window.LESSON_DATA,E=window.TrainerEngine;
const STORAGE='informatics-pages:'+lesson.version+':'+new URL('.',location.href).pathname;
let doc,storageOK=true;
const fresh=()=>({version:lesson.version,owner:'local',answers:{},test_answers:{},current:0,stage:'identity',queue:[],histories:{},confirmed:{},previews:{},submissions:[],variant:Math.floor(Math.random()*2)});
function warning(text){if(!text&&!storageOK)text='Не вдається зберегти прогрес у браузері. Не закривай сторінку; після роботи завантаж файл результатів.';$('warning').hidden=!text;$('warningText').textContent=text;}
function keep(){try{localStorage.setItem(STORAGE,JSON.stringify(doc));storageOK=true;return true;}catch(e){storageOK=false;warning('Не вдається зберегти прогрес у браузері. Не закривай сторінку; після роботи завантаж файл результатів.');return false;}}
function draftChanged(){keep();}
const signature=answer=>JSON.stringify(Object.fromEntries(Object.entries(answer||{}).sort().map(([k,v])=>[k,String(v).trim()])));
function currentTask(){return lesson.tasks[doc.current];}
function pending(){return null;}
function history(id){return doc.histories[id]||[];}
function isCorrect(id){return history(id).some(r=>r.evaluation.correct);}
function isChecked(id){return doc.confirmed[id]===signature(doc.answers[id]);}
function stage(name){
  doc.stage=name;['identity','theory','practice','test','results'].forEach(id=>$(id).hidden=id!==name);
  const n=['identity','theory','practice','test','results'].indexOf(name);
  document.querySelectorAll('#stages li').forEach((li,i)=>li.classList.toggle('active',i===n));
  $('loading').hidden=true;keep();
}
function fieldsFor(container,fields,values,onChange,disabled=false){
  container.replaceChildren();
  for(const field of fields){
    const label=document.createElement('label');label.htmlFor='field-'+field.key;label.textContent=field.label;
    const input=document.createElement(field.options?'select':field.kind==='code'?'textarea':'input');input.id=label.htmlFor;input.name=field.key;
    if(field.options){input.add(new Option('Обери…',''));for(const option of field.options)input.add(new Option((['one','two','three'].includes(field.key)?lesson.order_labels?.[option]:null)||option,option));}
    else if(field.kind==='number'){input.inputMode='numeric';input.type='text';input.maxLength=5;}
    else input.maxLength=300;
    input.value=values[field.key]??'';input.disabled=disabled;
    input.addEventListener('input',()=>onChange(field.key,input.value));container.append(label,input);
  }
}
function renderTask(){
  stage('practice');const task=currentTask(),i=doc.current;doc.answers[task.id]??={};
  $('taskCount').textContent=`Завдання ${i+1} із ${lesson.tasks.length}`;
  $('progress').value=Object.keys(doc.histories).length;
  $('taskTitle').textContent=task.title;$('instruction').textContent=task.instruction;
  const nav=$('taskNav');nav.replaceChildren();
  const reachable=Math.min(lesson.tasks.length-1,Math.max(doc.current,Object.keys(doc.histories).length, ...doc.queue.filter(o=>o.type==='check').map(o=>lesson.tasks.findIndex(t=>t.id===o.body.task)+1)));
  lesson.tasks.forEach((t,j)=>{const b=document.createElement('button');b.textContent=String(j+1);b.setAttribute('aria-label','Завдання '+(j+1));b.disabled=j>reachable;b.className=j===i?'current':isCorrect(t.id)?'done':'';b.addEventListener('click',()=>{doc.current=j;draftChanged();renderTask();});nav.append(b);});
  codeBlanks(task);
  const checked=isChecked(task.id),rows=history(task.id),last=rows[rows.length-1];
  $('check').disabled=isCorrect(task.id)||!!pending(task.id);
  $('next').disabled=!checked;
  $('next').textContent=i===lesson.tasks.length-1?'До тесту →':'Далі →';
  $('feedback').className='feedback'+(last?.evaluation.correct?' good':'');
  $('feedback').textContent=last&&checked?`${last.evaluation.hint} Перевірок: ${rows.length}.` : '';
  
}
function codeBlanks(task){
 const box=$('fields');box.replaceChildren();const pre=document.createElement('pre');pre.className='code-blanks';box.append(pre);
 const parts=task.code.split(/(\{\{b\d+\}\})/);
 for(const part of parts){const m=part.match(/^\{\{(b\d+)\}\}$/);if(!m){pre.append(document.createTextNode(part));continue;}
  const f=task.fields.find(f=>f.key===m[1]),s=document.createElement('select');s.setAttribute('aria-label',f.label);s.add(new Option('［ '+f.label+' ］',''));for(const o of f.options)s.add(new Option(o,o));s.value=doc.answers[task.id][f.key]||'';s.disabled=isCorrect(task.id);
  s.addEventListener('change',()=>{doc.answers[task.id][f.key]=s.value;draftChanged();$('feedback').textContent='';$('next').disabled=true;});pre.append(s);
 }
}
function renderTest(){
  stage('test');doc.questions=lesson.tests[doc.variant];fieldsFor($('questions'),doc.questions.map((q,i)=>({...q,label:(i+1)+'. '+q.label})),doc.test_answers,(k,v)=>{doc.test_answers[k]=v;keep();});
}
function renderResults(){
  stage('results');const scores=$('scores');scores.replaceChildren();
  for(const kind of ['practice','test']){
    const sub=doc.submissions.find(s=>s.kind===kind),box=document.createElement('div');box.className='score-card';const h=document.createElement('h2');h.textContent=kind==='practice'?'Практика':'Тест';box.append(h);
    if(sub){const score=document.createElement('div');score.className='score';score.textContent=sub.result.grade+' / 12';const p=document.createElement('p');p.textContent=`Результат тренажера: ${sub.result.raw} із ${sub.result.max} балів.`;box.append(score,p);if(kind==='practice'){const p=document.createElement('p');p.textContent=`З першої спроби: ${sub.result.first_attempt}. Виправлено: ${sub.result.corrected}.`;box.append(p);}}scores.append(box);
  }
  const details=$('deductions');details.replaceChildren();const practice=doc.submissions.find(s=>s.kind==='practice');
  if(practice)for(const r of practice.result.details){const row=document.createElement('div');row.className='result-row';const h=document.createElement('strong');h.textContent=`${r.title} · ${r.earned} / ${r.max}`;const p=document.createElement('p');p.textContent=`Перевірок: ${r.attempts}; зараховано ${Math.round(r.factor*100)}% балів правильних частин. Зменшення за спроби: ${r.deduction}; за неправильні частини не зараховано: ${r.unresolved_loss}.`;row.append(h,p);details.append(row);}
  $('exportArea').hidden=!doc.submissions.some(s=>s.kind==='test');
}
function report(){return {schema:'informatics-pages-report-1',authority:'browser_report_unverified',classroom_submitted:false,lesson:lesson.id,version:lesson.version,title:lesson.title,profile:doc.profile,variant:doc.variant,results:doc.submissions,attempts:doc.histories,previews:doc.previews,test_answers:doc.test_answers,device_export_time:new Date().toISOString()};}
function download(text,name,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
$('exportHTML').addEventListener('click',()=>{
  const r=report(),scores=r.results.map(s=>`${s.kind==='practice'?'Практика':'Тест'}: ${s.result.grade}/12 (${s.result.raw}/${s.result.max})`).join('\n');
  const text='\ufeff'+r.title+'\n'+r.profile.surname+' '+r.profile.first_name+' · '+r.profile.class_name+'\n\n'+scores+'\n\nЦе результат тренажера, обчислений у браузері. Сайт не надсилав роботу в Classroom.\n\n--- Дані роботи для перевірки ---\n'+JSON.stringify(r,null,2);
  download(text,lesson.id+'-result.txt','text/plain;charset=utf-8');$('exportNote').textContent='Файл підготовлено. Прикріпи його до завдання Classroom та натисни «Здати» там.';
});
$('identityForm').addEventListener('submit',event=>{
  event.preventDefault();const profile={surname:$('surname').value.trim(),first_name:$('firstName').value.trim(),class_name:$('className').value.trim()};
  if(!profile.surname||!profile.first_name||!profile.class_name){warning('Укажи прізвище, ім’я та клас.');return;}
  doc.profile=profile;showTheory();
});
function showTheory(){
  stage('theory');
  window.scrollTo(0, 0);
}
$('startPractice').addEventListener('click', () => {
  renderTask();
  window.scrollTo(0, 0);
});
$('reviewTheory').addEventListener('click', showTheory);
$('taskForm').addEventListener('submit',event=>{
  event.preventDefault();const task=currentTask();
  try{const rows=doc.histories[task.id]??=[];E.check(task,doc.answers[task.id],rows,!!doc.previews[task.id]?.[E.signature(task,doc.answers[task.id])]);doc.confirmed[task.id]=signature(doc.answers[task.id]);keep();warning('');renderTask();}
  catch(e){if(!doc.histories[task.id]?.length)delete doc.histories[task.id];warning(e.message);}
});
$('next').addEventListener('click',()=>{
  if(!isChecked(currentTask().id))return;
  if(doc.current<lesson.tasks.length-1){doc.current++;keep();renderTask();window.scrollTo({top:0,behavior:'instant'});}
  else{if(!lesson.tasks.every(t=>history(t.id).length)){warning('Перевір кожне завдання перед тестом.');return;}if(!doc.submissions.some(s=>s.kind==='practice'))doc.submissions.push({kind:'practice',result:E.grade(lesson.tasks,doc.histories,lesson.policy)});keep();renderTest();window.scrollTo({top:0,behavior:'instant'});}
});
$('testForm').addEventListener('submit',event=>{
  event.preventDefault();if(!Object.values(doc.test_answers).some(v=>String(v).trim())){warning('Спочатку дай відповіді на запитання.');return;}
  if(!doc.submissions.some(s=>s.kind==='test'))doc.submissions.push({kind:'test',result:E.test(lesson.tests[doc.variant],doc.test_answers)});keep();renderResults();window.scrollTo({top:0,behavior:'instant'});
});
$('newWork').addEventListener('click',()=>{if(!confirm('Почати нову роботу? Спочатку завантаж результати поточної.'))return;try{localStorage.setItem(STORAGE+':previous',JSON.stringify(doc));}catch(e){}doc=fresh();keep();$('identityForm').reset();stage('identity');});
document.title=lesson.title;document.querySelector('.brand').textContent=lesson.title;
try{const saved=JSON.parse(localStorage.getItem(STORAGE));if(saved?.version===lesson.version&&saved.answers&&saved.histories&&Array.isArray(saved.submissions))doc=saved;}catch(e){}
doc??=fresh();
if(doc.submissions.some(s=>s.kind==='test'))renderResults();else if(doc.submissions.some(s=>s.kind==='practice'))renderTest();else if(doc.profile && doc.stage==='theory')showTheory();else if(doc.profile)renderTask();else stage('identity');
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='127.0.0.1'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{});
