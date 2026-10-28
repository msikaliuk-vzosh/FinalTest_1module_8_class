'use strict';
function previewLists(task,answer){
 const canvas=$('preview');canvas.replaceChildren();$('codePreview').textContent='';$('previewNote').textContent='';
 doc.previewInputs??={};const saved=doc.previewInputs[task.id]??={text:task.inputText??(task.base||[]).join(' '),threshold:String(task.threshold??8)};
 const editable=['square-fixed','square-dynamic','input-lines','pipeline','file-read','file-write','palindrome-reverse','palindrome-pairs','membership','membership-low','threshold-flag','threshold-else','threshold-final'].includes(task.operation);
 const controls=document.createElement('div');controls.className='list-controls';canvas.append(controls);
 if(editable){
   const l=document.createElement('label');l.textContent=task.operation.startsWith('file-')?'input.txt · віртуальний файл':task.operation==='input-lines'?'Значення по одному в рядку':'Власні дані · числа через пропуск';
   const input=document.createElement('textarea');input.rows=task.operation.startsWith('file-')?5:2;input.maxLength=2000;input.value=saved.text;input.setAttribute('aria-label','Дані моделі');
   input.addEventListener('input',()=>{saved.text=input.value;keep();$('previewNote').textContent='Дані змінено. Натисни «Виконати», щоб оновити результат.';});l.append(input);controls.append(l);
 }
 if(task.operation.startsWith('threshold-')){const l=document.createElement('label');l.textContent='Поріг x';const x=document.createElement('input');x.value=saved.threshold;x.inputMode='numeric';x.setAttribute('aria-label','Поріг у моделі');x.addEventListener('input',()=>{saved.threshold=x.value;keep();});l.append(x);controls.append(l);}
 const run=document.createElement('button');run.type='button';run.textContent='Виконати';run.className='run-list';controls.append(run);
 const out=document.createElement('div');out.className='list-output';canvas.append(out);
 const negative=lesson.id.includes('process');
 function chips(values,selected=[]){
   const wrap=document.createElement('div');wrap.className='list-chips';
   if(!values.length){const p=document.createElement('p');p.className='small';p.textContent='[] — порожній список';wrap.append(p);}
   values.forEach((value,i)=>{const chip=document.createElement('div');chip.className='list-chip'+(selected.includes(i)?' selected':'');const index=document.createElement('small');index.textContent=negative?`${i} / ${i-values.length}`:String(i);const text=document.createElement('strong');text.textContent=typeof value==='string'?JSON.stringify(value):String(Number(value.toPrecision(12)));chip.append(index,text);wrap.append(chip);});return wrap;
 }
 function show(result){
   out.replaceChildren();const before=document.createElement('p');before.className='small';before.textContent='Початкові елементи · індекс над значенням';out.append(before,chips(result.before||[]));
   if(result.after){const title=document.createElement('p');title.className='small';title.textContent='Після виконання';out.append(title,chips(result.after,result.selected));}
   if(result.output){const output=document.createElement('pre');output.className='list-result';output.textContent=result.output;output.setAttribute('aria-label','Виведення моделі');out.append(output);}
   if(result.file!==undefined){const label=document.createElement('p');label.textContent='output.txt · віртуальний файл';const file=document.createElement('pre');file.textContent=result.file;file.setAttribute('aria-label','Віртуальний output.txt');out.append(label,file);}
   if(result.error){const p=document.createElement('p');p.className='list-error';p.textContent=result.error;out.append(p);}
   if(result.trace.length){let position=0;const next=document.createElement('button');next.type='button';next.textContent='Крок виконання';const counter=document.createElement('span');counter.className='small';const trace=document.createElement('ol');trace.className='list-trace';next.addEventListener('click',()=>{if(position>=result.trace.length)return;const li=document.createElement('li');li.textContent=result.trace[position++];trace.append(li);counter.textContent=` ${position} / ${result.trace.length}`;next.disabled=position>=result.trace.length;});out.append(next,counter,trace);}
   $('codePreview').textContent=result.code;
 }
 run.addEventListener('click',()=>{
   try{const body={task:task.id,answer:structuredClone(answer),inputs:structuredClone(saved)},result=E.preview(task,answer,saved);show(result);if(result.success)enqueue('preview',null,body);
     const entry=doc.previews[task.id]?.[E.signature(task,answer)];if(task.requiredCases)$('previewNote').textContent=E.inspected(task,entry)?'Потрібні набори даних перевірено.':'Перевірено різних наборів: '+(entry?.runs?.length||0)+'. '+task.inspectionHint;
   }catch(e){$('previewNote').textContent=e.message;}
 });
 try{if(task.operation==='literal'){const values=E.numberList(answer.values);out.append(chips(values));}else if(task.base)out.append(chips(task.base));}catch(e){}
}
