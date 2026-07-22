import html,json,re
from datetime import datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
source=html.unescape((ROOT/'.tmp-jojo-volumes.html').read_text(encoding='utf-8'))
all_markers=list(re.finditer(r'<th scope="row" id="(vol[^\"]+)"',source))
markers=[]
for marker in all_markers:
    identifier=marker.group(1)
    global_match=re.search(r'_\((\d+)\)',identifier)
    plain_match=re.fullmatch(r'vol(\d+)(?:/\d+)?',identifier)
    global_number=int(global_match.group(1)) if global_match else (int(plain_match.group(1)) if plain_match else 0)
    if 1<=global_number<=139 and not any(number==global_number for number,_ in markers): markers.append((global_number,marker))
markers.sort(key=lambda pair:pair[0])
chunks=[source[m.start():source.find('</tr>',m.start())+5] for _,m in markers]
if len(chunks)!=139: raise RuntimeError(f'Esperados 139 volumes; encontrados {len(chunks)}; ausentes={[n for n in range(1,140) if n not in {x for x,_ in markers}]}')
groups=[('jojo-classico','JoJo: Partes 1–5',1,63,594),('stone-ocean','Stone Ocean',64,80,158),('steel-ball-run','Steel Ball Run',81,104,95),('jojolion','JoJolion',105,131,110),('the-jojolands','The JOJOLands',132,139,32)]
raw=[]
for index,chunk in enumerate(chunks,1):
    date_matches=re.findall(r'([A-Z][a-z]+ \d{1,2}, \d{4})',chunk)
    isbn_match=re.search(r'(?:978-\d-\d{2}-\d{6}-\d|\d-\d{2}-\d{6}-[\dX])',chunk)
    if not all((date_matches,isbn_match)): raise RuntimeError(f'Metadados incompletos no volume global {index}')
    digits=isbn_match.group(0).replace('-','')
    if len(digits)==10:
        base='978'+digits[:9]; check=(10-sum((1 if i%2==0 else 3)*int(n) for i,n in enumerate(base))%10)%10; digits=base+str(check)
    raw.append({'date':datetime.strptime(date_matches[-1],'%B %d, %Y').strftime('%Y-%m-%d'),'isbn':digits})
volumes=[]
for slug,title,first_global,last_global,final_chapter in groups:
    subset=raw[first_global-1:last_global]
    for offset,item in enumerate(subset):
        local=offset+1
        volumes.append({'globalNumber':first_global+offset,'number':local,'series':slug,'seriesTitle':title,'releaseDate':item['date'],'partChapterTotal':final_chapter,'pageCount':192,'coverSource':f"https://dosbg3xlm0x1t.cloudfront.net/images/items/{item['isbn']}/1200/{item['isbn']}.jpg"})
(ROOT/'scripts'/'jojo-volumes.json').write_text(json.dumps(volumes,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'JoJo: {len(volumes)} volumes em {len(groups)} sequências editoriais.')
