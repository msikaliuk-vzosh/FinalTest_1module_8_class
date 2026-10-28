'use strict';
(function(root){
const E=root.TrainerEngine;
function integer(value,label){const n=Number(value);if(String(value).trim()===''||!Number.isInteger(n)||Math.abs(n)>1000)throw Error(label+': потрібне ціле число.');return n;}
function sliceIndices(n,start,stop,step){
 step=step===''||step==null?1:integer(step,'Крок');if(step===0)throw Error('Крок зрізу не може дорівнювати нулю.');
 function bound(v,missing,low,high){if(v===''||v==null)return missing;let x=integer(v,'Межа');if(x<0)x+=n;return Math.max(low,Math.min(high,x));}
 const from=step>0?bound(start,0,0,n):bound(start,n-1,-1,n-1),to=step>0?bound(stop,n,0,n):bound(stop,-1,-1,n-1),out=[];
 for(let i=from;step>0?i<to:i>to;i+=step){out.push(i);if(out.length>50)throw Error('Занадто багато кроків.');}return out;
}
function sliced(a,expr){const m=String(expr).match(/^a\[(-?\d*)?:(-?\d*)?(?::(-?\d*)?)?\]$/);if(!m)throw Error('Уведи зріз у вигляді a[початок:межа:крок].');const ids=sliceIndices(a.length,m[1]||'',m[2]||'',m[3]||'');return {values:ids.map(i=>a[i]),indices:ids};}
function formula(expr,value){if(expr==='a[i]**2'||expr==='a[i]*a[i]')return value*value;if(expr==='a[i]*2')return value*2;if(expr==='a[i]+2')return value+2;if(expr==='a[i]')return value;throw Error('Модель підтримує прості вирази з a[i], множенням та піднесенням до квадрата.');}
const tidy=n=>Number(n.toPrecision(12));
const floatText=n=>Number.isInteger(n)?n.toFixed(1):String(tidy(n));
function compare(value,x,expr){if(expr==='a[i]>x'||expr==='x<a[i]')return value>x;if(expr==='a[i]>=x'||expr==='x<=a[i]')return value>=x;if(expr==='a[i]<x')return value<x;if(expr==='a[i]==x')return value===x;throw Error('Запиши порівняння елемента a[i] з x.');}
function bool(value){if(value==='True')return true;if(value==='False')return false;throw Error('Обери True або False.');}
function membership(a,expr){
 const groups=expr.split('or');if(groups.length>3)throw Error('Використай перевірки з умови завдання.');
 return groups.some(group=>group.split('and').every(term=>{const m=term.match(/^([123])ina$/);if(!m)throw Error('У цій моделі перевіряємо 1, 2 або 3 через in та логічні операції.');return a.includes(Number(m[1]));}));
}
function execute(task,answer,inputs={}){
 const v=E.normalize(task,answer),op=task.operation;
 let a=E.numberList(inputs.text??task.inputText??task.base??[]),r={success:true,before:[...a],after:[...a],trace:[],code:'',output:'',inputLength:a.length};
 const step=(text)=>r.trace.push(text),show=n=>Array.isArray(n)?'['+n.map(x=>typeof x==='number'?String(tidy(x)):JSON.stringify(x)).join(', ')+']':String(n);
 if(op==='literal'){a=E.numberList(answer.values);r.before=[];r.after=a;r.code='a = '+(answer.brackets==='[]'?show(a):'('+a.join(', ')+')');r.output=answer.brackets==='[]'?'Створено список із '+a.length+' елементів.':'Круглі дужки не утворюють потрібний список.';}
 else if(op==='indices'||op==='length'){r.code=op==='indices'?'a[0]; a[1]; len(a)':'n = len(a)';r.output=op==='indices'?`a[0] = ${a[0]}; a[1] = ${a[1]}; індекси 0…${a.length-1}`:`len(a) = ${a.length}; останній індекс = ${a.length-1}`;}
 else if(op==='assign'){const i=integer(v.index,'Індекс');if(i<0||i>=a.length)throw Error('Індекс виходить за межі списку.');const value=Number(v.value);if(v.value===''||!Number.isFinite(value))throw Error('Уведи числове значення.');r.after=[...a];r.after[i]=value;r.selected=[i];r.code=`a[${i}] = ${value}`;step(`${i}: ${a[i]} → ${value}`);}
 else if(op==='print'||op==='print-unpacked'){
   const commands=op==='print'?[v.all,v.one]:[v.print];r.code=commands.join('\n');r.output=commands.map(cmd=>{if(cmd==='print(a)')return show(a);if(cmd==='print(*a)')return a.map(floatText).join(' ');const m=cmd.match(/^print\(a\[(\d+)\]\)$/);if(m&&Number(m[1])<a.length)return String(a[Number(m[1])]);throw Error('У цій вправі використай print(a), print(a[індекс]) або print(*a).');}).join('\n');
 }
 else if(op==='square-fixed'||op==='square-dynamic'){
   let n;if(op==='square-fixed')n=integer(v.count,'Кількість');else{n=v.length==='len(a)'?a.length:integer(v.length,'n');if(v.loop!=='range(n)')throw Error('Доповни межу циклу for i in range(n).');}
   if(n<0||n>50)throw Error('Для моделі задай від 0 до 50 повторень.');r.after=[...a];r.code=(op==='square-dynamic'?`n = ${answer.length||'…'}\n`:'')+`for i in ${op==='square-fixed'?'range('+n+')':'range(n)'}:\n    a[i] = ${answer.formula||'a[i]**2'}`;
   for(let i=0;i<n;i++){if(i>=a.length){r.success=false;r.error=`i=${i}: у списку лише ${a.length} елементів. Перевір межу циклу.`;break;}const value=formula(op==='square-fixed'?v.formula:'a[i]**2',a[i]);r.after[i]=tidy(value);step(`i=${i}: ${a[i]} → ${tidy(value)}`);}r.output=show(r.after);
 }
 else if(op==='append'){if(v.initial!=='[]'&&v.initial!=='[0]')throw Error('Запиши початковий список.');a=v.initial==='[]'?[]:[0];r.before=[...a];if(v.method!=='append')throw Error('Обраний метод не додає елемент у кінець списку.');if(v.value===''||!Number.isFinite(Number(v.value)))throw Error('Уведи число для додавання.');r.after=[...a,Number(v.value)];r.code=`a = ${v.initial}\na.${v.method}(${v.value})`;step(`${show(a)} → ${show(r.after)}`);}
 else if(op==='input-lines'){
   const text=String(inputs.text??task.base.join('\n')),tokens=text.trim()?text.trim().split(/\s+/):[];if(tokens.length>50)throw Error('До 50 значень у моделі.');
   if(v.read!=='float(input())'&&v.read!=='input()')throw Error('Доповни читання x через input() та перетворення типу.');if(v.append!=='a.append(x)'&&v.append!=='a.append(i)')throw Error('Доповни команду додавання елемента.');
   r.before=[];r.after=[];tokens.forEach((token,i)=>{const value=v.read==='input()'?token:E.numberList(token)[0];r.after.push(v.append==='a.append(i)'?i:value);step(`Введення ${i+1}: ${token}; a = ${show(r.after)}`);});r.code=`a = []\nfor i in range(${tokens.length}):\n    x = ${answer.read||'…'}\n    ${answer.append||'…'}`;
 }
 else if(op==='split'){const tokens=String(inputs.text??task.inputText).trim().split(/\s+/);r.before=[];r.after=tokens;r.code='input().split()';r.output=JSON.stringify(tokens)+' — кожна частина поки що текст.';step('input → текст');step('split → окремі тексти');}
 else if(op==='pipeline'){
   if(v.order!=='input → split → map → list')throw Error('Спочатку введи рядок, потім розділи його на частини й перетвори значення.');
   if(v.wrapper!=='list')throw Error('Цей виклик не створює остаточний список.');const tokens=String(inputs.text??a.join(' ')).trim().split(/\s+/);r.before=[];r.after=v.convert==='float'?E.numberList(tokens.join(' ')):tokens;r.code=`a = ${v.wrapper}(map(${v.convert}, input().split()))`;step('input → '+JSON.stringify(tokens.join(' ')));step('split → '+JSON.stringify(tokens));step('map('+v.convert+') → '+show(r.after));step('list → остаточний список');
 }
 else if(op==='program-order'){
   let list=null,n=null;const lines=[];for(const key of ['one','two','three','four']){const action=v[key];if(action==='введення'){list=[...a];lines.push('a = list(map(float, input().split()))');}else if(action==='довжина'){if(!list)throw Error('Довжину визначають після створення списку.');n=list.length;lines.push('n = len(a)');}else if(action==='квадрати'){if(!list||n===null)throw Error('Перед циклом потрібні список і n.');list=list.map(x=>tidy(x*x));lines.push('for i in range(n): a[i] = a[i]**2');}else if(action==='виведення'){if(!list)throw Error('Перед виведенням потрібен список.');r.output=list.map(floatText).join(' ');lines.push('print(*a)');}else throw Error('Обери всі чотири етапи.');step(action+(list?' → '+show(list):''));}r.after=list||[];r.code=lines.join('\n');
 }
 else if(op==='file-read'||op==='file-write'){
   const text=String(inputs.text??task.inputText);a=E.numberList(text);r.before=[...a];r.fileName=op==='file-read'?'input.txt (модель)':'output.txt (модель)';
   if(op==='file-read'){if(v.mode!=='r')throw Error('Файл у режимі w не читається: обери режим для читання.');r.after=v.convert==='float'?a:text.trim().split(/\s+/);r.code=`f1 = open('input.txt', '${v.mode}')\na = f1.read().split()\na = list(map(${v.convert}, a))\nf1.close()`;step('read → '+JSON.stringify(text.trim().split(/\s+/)));step('map → '+show(r.after));r.output='Зчитано '+r.after.length+' значень.';}
   else{if(v.mode!=='w')throw Error('Для запису потрібен відповідний режим відкриття output.txt.');r.after=a.map(x=>tidy(formula(v.formula,x)));r.file=r.after.map(floatText).join(v.separator==='\\n'?'\n':' ')+(v.separator==='\\n'?'\n':'');r.code=`f2 = open('output.txt', '${v.mode}')\nfor i in range(len(a)):\n    a[i] = ${answer.formula||'…'}\n    f2.write(str(a[i]) + '${v.separator||'…'}')\nf2.${v.close||'…'}`;r.after.forEach((x,i)=>step(`i=${i}: ${a[i]} → ${x} → запис у файл`));if(v.close!=='close()'){r.success=false;r.error='Заверши роботу з файловою змінною.';}}
 }
 else if(op==='negative-index'){r.code='a[-1]; a[-2]';r.output=`a[-1] = ${a.at(-1)}; a[-2] = ${a.at(-2)}`;r.selected=[a.length-1,a.length-2];}
 else if(op==='concat'){if(v.operator!=='+')throw Error('Множення двох списків не об’єднує їх.');r.after=[...a,...task.second];r.code='a + b';r.output=show(r.after);}
 else if(op==='repeat'){if(v.operator!=='*')throw Error('Додавання списку й числа не повторює список.');const n=integer(v.times,'Кількість');if(n<0||n*a.length>50)throw Error('Задай невід’ємну кількість, щоб отримати до 50 елементів.');r.after=Array.from({length:n},()=>a).flat();r.code='a * '+n;r.output=show(r.after);}
 else if(op==='slice'){const ids=sliceIndices(a.length,v.start,v.stop,v.step);r.selected=ids;r.after=ids.map(i=>a[i]);r.code=`a[${v.start}:${v.stop}:${v.step}]`;r.output=show(r.after);}
 else if(op==='slice-omitted'){const prefix=sliced(a,v.prefix),tail=sliced(a,v.tail);r.selected=prefix.indices;r.after=prefix.values;r.code=(answer.prefix||'…')+'\n'+(answer.tail||'…');r.output='Перший зріз: '+show(prefix.values)+'\nДругий зріз: '+show(tail.values);}
 else if(op==='reverse'||op==='negative-slice'){const cut=sliced(a,v.slice);r.selected=cut.indices;r.after=cut.values;r.code=answer.slice||'…';r.output=show(cut.values);}
 else if(op==='palindrome-reverse'){
   const b=sliced(a,v.reverse).values,eq=E.equal(a,b);let found;if(v.compare==='a==b')found=eq;else if(v.compare==='a!=b')found=!eq;else throw Error('Запиши порівняння a та b.');r.after=b;r.code=`b = ${answer.reverse||'…'}\nif ${answer.compare||'…'}: print('Паліндром')`;r.code+="\nelse: print('Не паліндром')";r.output=found?'Паліндром':'Не паліндром';r.caseTruth=E.equal(a,[...a].reverse());step('a = '+show(a));step('b = '+show(b));step('Порівняння → '+(found?'True':'False'));
 }
 else if(op==='palindrome-pairs'){
   let flag=bool(v.initial),limit;if(v.limit==='len(a)//2')limit=Math.floor(a.length/2);else if(v.limit==='len(a)')limit=a.length;else throw Error('Визнач межу циклу через len(a).');
   for(let i=0;i<limit;i++){let j;if(v.mirror==='-i-1')j=a.length-i-1;else if(v.mirror==='i')j=i;else throw Error('Запиши індекс симетричного елемента.');const mismatch=a[i]!==a[j];step(`i=${i}: a[${i}]=${a[i]}, a[${j}]=${a[j]} → ${mismatch?'розбіжність':'збіг'}`);if(mismatch){flag=bool(v.mismatch);if(v.stop==='break'){step('break');break;}}}r.code=`f = ${v.initial}\nfor i in range(${answer.limit||'…'}):\n    if a[i] != a[${answer.mirror||'…'}]:\n        f = ${v.mismatch}\n        ${v.stop==='break'?'break':'# без переривання'}`;r.code+="\nif f: print('Паліндром')\nelse: print('Не паліндром')";r.output=flag?'Паліндром':'Не паліндром';r.caseTruth=E.equal(a,[...a].reverse());
 }
 else if(op==='membership'||op==='membership-low'){const found=membership(a,v.condition);r.code='if '+(answer.condition||'…')+": print('є')\nelse: print('немає')";r.output=found?'є':'немає';r.caseTruth=op==='membership'?a.includes(3):a.some(n=>[1,2,3].includes(n));step('Перевірка умови → '+(found?'True':'False'));}
 else if(op.startsWith('threshold-')){
   const x=integer(inputs.threshold??task.threshold,'Поріг x');r.threshold=x;r.caseTruth=a.some(n=>n>x);r.hasEqual=a.includes(x);const useElse=op==='threshold-else'||op==='threshold-final'&&answer.method==='for…else';
   let flag=op==='threshold-flag'?bool(v.initial):false,broke=false;const outputs=[];
   for(let i=0;i<a.length;i++){const found=compare(a[i],x,v.condition);step(`i=${i}: ${a[i]} ${answer.condition?.includes('>=')?'>=':'?'} ${x} → ${found?'True':'False'}`);if(found){if(useElse)outputs.push(op==='threshold-final'?v.yes:'є');else flag=op==='threshold-flag'?bool(v.found):true;if(v.stop==='break'){broke=true;step('break');break;}}}
   if(useElse){if(!broke){step('Цикл завершився без break → else');outputs.push(op==='threshold-final'?v.no:'немає');}r.output=outputs.join('\n');}
   else r.output=flag?(op==='threshold-final'?v.yes:'є'):(op==='threshold-final'?v.no:'немає');
   r.code=(useElse?'':`f = ${op==='threshold-flag'?v.initial:'False'}\n`)+`for i in range(len(a)):\n    if ${answer.condition||'…'}:\n        ${useElse?"print('є')":'f = '+(v.found||'True')}\n        ${v.stop==='break'?'break':'# без переривання'}\n`+(useElse?"else: print('немає')":"if f: print('є')\nelse: print('немає')");
 }
 else throw Error('Невідома операція моделі.');
 r.inputLength=a.length;r.caseKey=JSON.stringify([a,r.threshold??null]);return r;
}
const legacy=E.preview;
E.preview=(task,answer,inputs)=>task.mode==='list-model'?execute(task,answer,inputs):legacy(task,answer,inputs);
E.inspected=function(task,entry){
 if(!entry)return false;const runs=entry.runs||[];if(!task.requiredCases)return runs.length>0;
 if(task.requiredCases==='two-lengths')return new Set(runs.map(r=>r.result.inputLength)).size>=2;
 const truth=new Set(runs.map(r=>r.result.caseTruth));
 if(task.requiredCases==='both-results')return truth.has(true)&&truth.has(false);
 return task.requiredCases==='threshold-three'&&runs.length>=3&&truth.has(true)&&truth.has(false)&&runs.some(r=>r.result.hasEqual);
};
root.Grade9Model={execute,sliceIndices,sliced};
})(typeof window==='undefined'?globalThis:window);
