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
function enqueue(type,_path,body){
  if(type!=='preview')return;
  try{const task=lesson.tasks.find(t=>t.id===body.task),result=E.preview(task,body.answer,body.inputs);if(result.success){doc.previews[task.id]??={};const entry=doc.previews[task.id][E.signature(task,body.answer)]??={runs:[]};if(!entry.runs.some(r=>r.result.caseKey===result.caseKey))entry.runs.push({inputs:body.inputs||{},result});keep();}}
  catch(e){$('previewNote').textContent=e.message;}
}
function stage(name){
  doc.stage=name;['identity','practice','test','results'].forEach(id=>$(id).hidden=id!==name);
  const n=['identity','practice','test','results'].indexOf(name);
  document.querySelectorAll('#stages li').forEach((li,i)=>li.classList.toggle('active',i===n));
  $('loading').hidden=true;keep();
}
function fieldsFor(container,fields,values,onChange,disabled=false){
  container.replaceChildren();
  for(const field of fields){
    const label=document.createElement('label');label.htmlFor='field-'+field.key;label.textContent=field.label;
    const input=document.createElement(field.options?'select':field.kind==='code'?'textarea':'input');input.id=label.htmlFor;input.name=field.key;
    if(field.options){input.add(new Option('Обери…',''));for(const option of field.options)input.add(new Option((['one','two','three'].includes(field.key)?lesson.order_labels?.[option]:null)||(option===' '?'пропуск':option),option));}
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
  fieldsFor($('fields'),task.fields,doc.answers[task.id],(k,v)=>{doc.answers[task.id][k]=v;draftChanged();$('feedback').textContent='';$('feedback').className='feedback';$('next').disabled=true;preview(task,doc.answers[task.id]);},isCorrect(task.id)||!!pending(task.id));
  const checked=isChecked(task.id),rows=history(task.id),last=rows[rows.length-1];
  $('check').disabled=isCorrect(task.id)||!!pending(task.id);
  $('next').disabled=!checked;
  $('next').textContent=i===lesson.tasks.length-1?'До тесту →':'Далі →';
  $('feedback').className='feedback'+(last?.evaluation.correct?' good':'');
  $('feedback').textContent=last&&checked?`${last.evaluation.hint} Перевірок: ${rows.length}.` : '';
  preview(task,doc.answers[task.id]);
}
function parseCommand(source){
  const m=String(source||'').match(/^\s*(button|label)\s*\[\s*(['"])(text|width|bg|fg)\2\s*\]\s*=\s*(?:(['"])(.*?)\4|([+-]?\d+))\s*;?\s*$/s);
  return m?{target:m[1],prop:m[3],value:m[5]??Number(m[6])}:null;
}
function applyProps(el,props){
  if(props.text!==undefined)el.textContent=props.text||'…';
  if(CSS.supports('color',props.bg||''))el.style.backgroundColor=props.bg;
  if(CSS.supports('color',props.fg||''))el.style.color=props.fg;
  if(Number(props.width)>0)el.style.width=Math.min(40,Number(props.width))+'ch';
  if(Number(props.height)>0)el.style.minHeight=Math.min(5,Number(props.height))*22+'px';
  if(Number(props.size)>0)el.style.fontSize=Math.min(32,Number(props.size))+'px';
  if(props.family)el.style.fontFamily=props.family;
  if(props.style==='bold')el.style.fontWeight='bold';if(props.style==='italic')el.style.fontStyle='italic';
}
function preview(task,answer){
  const canvas=$('preview');canvas.replaceChildren();$('previewNote').textContent='';$('codePreview').textContent='';
  const values={...(task.base||{}),...answer};
  if(task.mode==='list-model'){previewLists(task,answer);return;}
  if(task.widget==='Entry'||task.mode==='entry-output'){previewEntry(task,answer);return;}
  if(task.mode==='order'){
    $('codePreview').textContent=['one','two','three'].map(k=>lesson.order_labels?.[answer[k]]||'…').join('\n');
    const p=document.createElement('span');p.className='empty';p.textContent='Послідовність команд →';canvas.append(p);return;
  }
  const kind=task.widget||answer.kind;
  if(!kind){const p=document.createElement('span');p.className='empty';p.textContent='Тут з’явиться твій елемент';canvas.append(p);return;}
  const object=document.createElement(kind==='Button'?'button':'div');object.className=kind==='Label'?'sim-label':'';object.textContent=values.text|| (kind==='Button'?'Кнопка':'Напис');object.setAttribute('aria-label',kind==='Button'?'Кнопка в перегляді':'Напис у перегляді');if(kind==='Button')object.type='button';
  applyProps(object,values);canvas.append(object);
  if(values.layout==='place'){object.style.position='absolute';object.style.left=Math.max(0,Math.min(180,Number(values.x)||0))+'px';object.style.top=Math.max(0,Math.min(140,Number(values.y)||0))+'px';}
  else if(Number(values.pady)>=0)object.style.marginTop=Math.min(70,Number(values.pady))+'px';
  if(task.mode==='command'){
    const command=parseCommand(answer.code);if(command&&command.target===(kind==='Button'?'button':'label'))applyProps(object,{[command.prop]:command.value});
    $('codePreview').textContent=answer.code||'';
  }
  if(['event','combined','predict','label-event'].includes(task.mode)){
    let label=null;
    if(task.mode==='combined'){label=document.createElement('div');label.className='sim-label';label.textContent=answer.labelText||'…';canvas.append(label);}
    const click=()=>{
      if(!isCorrect(task.id))enqueue('preview',null,{task:task.id,answer:structuredClone(answer)});
      if(task.mode==='predict'){applyProps(object,{text:'Далі',width:30});$('previewNote').textContent='Обробник виконався.';return;}
      const active=task.mode==='label-event'?answer.handler==='click'&&['<1>','<Button-1>'].includes(answer.event):answer.command==='click';
      if(!active){$('previewNote').textContent='Натискання не запустило обробник. Перевір зв’язок.';return;}
      const target=task.mode==='combined'&&answer.target==='label'?label:object;
      applyProps(target,{[task.mode==='label-event'?'bg':answer.prop]:answer.value});$('previewNote').textContent='Дію виконано. Зістав результат з умовою.';
    };
    if(task.mode==='label-event'){object.classList.add('interactive');object.role='button';object.tabIndex=0;object.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();click();}});}
    object.addEventListener('click',click);
  }
}
function previewEntry(task,answer){
  const canvas=$('preview');const v={...(task.base||{}),...answer};
  if(task.fields.some(f=>f.key==='kind')&&!answer.kind){const p=document.createElement('p');p.className='empty';p.textContent='Обери елемент у конструкторі';canvas.append(p);return;}
  doc.previewInputs??={};const inputs=doc.previewInputs[task.id]??={text:'Мій текст',x:'2.5',y:'1.5'};
  function input(label,value,key,readonly=false){const l=document.createElement('label');l.textContent=label;const el=document.createElement('input');el.value=value;el.readOnly=readonly;el.setAttribute('aria-label',label+' у перегляді');el.addEventListener('input',()=>{inputs[key]=el.value;keep();});l.append(el);canvas.append(l);return el;}
  function output(value){const el=document.createElement('div');el.className='sim-label';el.textContent=value;el.setAttribute('aria-label','Результат у перегляді');canvas.append(el);return el;}
  if(['entry-copy','entry-predict','entry-sum','entry-two'].includes(task.mode)){
    const copy=task.mode==='entry-copy';
    const a=input(copy?'Повідомлення':answer.label1||'Перше число',copy?inputs.text:inputs.x,copy?'text':'x',task.mode==='entry-predict');
    const b=copy?null:input(answer.label2||'Друге число',inputs.y,'y',task.mode==='entry-predict');
    if(task.mode==='entry-two'){$('codePreview').textContent=task.id==='p10'?`x = ${answer.x||'…'}\ny = ${answer.y||'…'}`:`z = ${answer.operation||'…'}\n${answer.order||'…'}`;return;}
    const button=document.createElement('button');button.type='button';button.textContent=copy?'Показати':'Сума';button.setAttribute('aria-label','Кнопка в перегляді');canvas.append(button);const result=output('…');
    button.addEventListener('click',()=>{
      let body={task:task.id,answer:structuredClone(answer),inputs:copy?{text:a.value}:{x:a.value,y:b.value}};
      if(copy){
        if(answer.target==='label'&&answer.prop==='text'&&answer.read==='entry.get()')result.textContent=a.value;
        else $('previewNote').textContent='Дія не вивела текст у напис. Перевір зв’язки.';
      }else{
        const x=Number(a.value),y=Number(b.value);
        if(!a.value.trim()||!b.value.trim()||!Number.isFinite(x)||!Number.isFinite(y)){ $('previewNote').textContent='Уведи два числа; дробову частину відділяй крапкою.';return;}
        if(task.mode==='entry-predict'){result.textContent=String(x+y);}
        else if(answer.convert!=='float'){result.textContent=a.value+b.value;}
        else if(answer.target==='label'&&answer.output==='str(z)')result.textContent=String(answer.operation==='x + y'?x+y:answer.operation==='x - y'?x-y:x*y);
        else $('previewNote').textContent='Обчислення не виведене в напис. Перевір спосіб виведення.';
      }
      if(!isCorrect(task.id))enqueue('preview',null,body);
    });return;
  }
  if(task.mode==='entry-output'){const el=output('…');applyProps(el,{[answer.prop]:answer.output==='str(z)'?'4.0':answer.output||'…'});$('codePreview').textContent=`label['${answer.prop||'…'}'] = ${answer.output||'…'}`;return;}
  const kind=answer.kind||'Entry';if(kind!=='Entry'){output(kind==='Button'?'Кнопка':'Напис');return;}
  let content=v.content||'';
  if(task.mode==='entry-append')content=answer.method==='insert'?(answer.position==='END'?'8 '+(answer.content||''):(answer.content||'')+'8'):'8';
  if(task.mode==='entry-delete')content=answer.method==='delete'&&String(answer.start)==='0'&&answer.end==='END'?'':'Старий результат';
  if(task.mode==='entry-edit'&&answer.method!=='insert')content='';
  if(task.mode==='entry-result'){
    content='12';for(const cmd of [answer.first,answer.second]){if(cmd==='entry3.delete(0, END)')content='';if(cmd==='entry3.insert(0, str(z))')content='4.0'+content;}
  }
  const entry=input('Поле',content,'text');entry.style.maxWidth='100%';if(Number(v.width)>0)entry.style.width=Math.min(30,Number(v.width))+'ch';
  if(CSS.supports('color',v.bg||''))entry.style.backgroundColor=v.bg;if(CSS.supports('color',v.fg||''))entry.style.color=v.fg;
  if(Number(v.bd)>0)entry.style.borderWidth=Math.min(8,Number(v.bd))+'px';if(Number(v.size)>0)entry.style.fontSize=Math.min(28,Number(v.size))+'px';if(v.family)entry.style.fontFamily=v.family;
  if(task.mode==='entry-read'){$('codePreview').textContent=answer.code||'';if(String(answer.code||'').replace(/\s/g,'')==='entry.get()')output('Отримано: '+entry.value);}
  if(task.mode==='entry-edit'||task.mode==='entry-append')$('codePreview').textContent=`entry.${answer.method||'…'}(${answer.position??'…'}, ${JSON.stringify(answer.content||'')})`;
  if(task.mode==='entry-delete')$('codePreview').textContent=`entry.${answer.method||'…'}(${answer.start??'…'}, ${answer.end||'…'})`;
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
  event.preventDefault();const profile={surname:$('surname').value.trim(),first_name:$('firstName').value.trim(),class_name:$('className').value};
  if(!profile.surname||!profile.first_name||!profile.class_name){warning('Укажи прізвище, ім’я та клас.');return;}
  doc.profile=profile;keep();renderTask();
});
$('taskForm').addEventListener('submit',event=>{
  event.preventDefault();const task=currentTask();
  try{const rows=doc.histories[task.id]??=[];E.check(task,doc.answers[task.id],rows,E.inspected(task,doc.previews[task.id]?.[E.signature(task,doc.answers[task.id])]));doc.confirmed[task.id]=signature(doc.answers[task.id]);keep();warning('');renderTask();}
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
for(const cls of lesson.classes)$('className').add(new Option(cls,cls));
document.title=lesson.title;document.querySelector('.brand').textContent=lesson.title;
document.querySelector('#identity .small').textContent='15 завдань і короткий тест із 6 запитань. Це модель окремих команд Python; файли в ній віртуальні. Ім’я та клас лишаються в браузері та файлі результатів.';
try{const saved=JSON.parse(localStorage.getItem(STORAGE));if(saved?.version===lesson.version&&saved.answers&&saved.histories&&Array.isArray(saved.submissions))doc=saved;}catch(e){}
doc??=fresh();
if(doc.submissions.some(s=>s.kind==='test'))renderResults();else if(doc.submissions.some(s=>s.kind==='practice'))renderTest();else if(doc.profile)renderTask();else stage('identity');
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='127.0.0.1'||location.hostname==='localhost'))navigator.serviceWorker.register('../sw.js').catch(()=>{});
