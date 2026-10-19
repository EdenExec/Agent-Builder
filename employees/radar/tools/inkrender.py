import json,glob,collections,sys
src,out=sys.argv[1],sys.argv[2]
pages=collections.defaultdict(list)
for f in glob.glob(src+'/*.json'):
  d=json.load(open(f)); pages[str(d['p']).replace(':','_')].append(d)
for k,ss in pages.items():
  ss.sort(key=lambda d:d.get('at',''))
  paths=[]
  for d in ss:
    p=d['pts']; pts=[(p[i],p[i+1]) for i in range(0,len(p)-2,3)]
    if not pts: continue
    dd='M'+' L'.join(f'{x:.1f},{y:.1f}' for x,y in pts)
    col='#e8c000' if d.get('k')=='hi' else '#000'
    w=10 if d.get('k')=='hi' else 2.2
    paths.append(f'<path d="{dd}" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>')
  svg=f'<html><body style="margin:0;background:#fff"><svg xmlns="http://www.w3.org/2000/svg" width="1040" height="800" viewBox="0 0 1040 800">{"".join(paths)}</svg></body></html>'
  open(f'{out}/{k}.html','w').write(svg)
  print(k,len(ss))
