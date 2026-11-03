import json,csv,re,sys
contacts=sys.argv[1]; path=sys.argv[2]
def n(s): return re.sub(r'[^a-z]','',(s or '').lower())
idx={}
for l in open(contacts):
    c=json.loads(l)
    parts=(c.get('name') or '').split()
    if len(parts)<2: continue
    idx.setdefault((n(parts[0])[:4],n(parts[-1])),[]).append(c)
rows=list(csv.DictReader(open(path))); hdr=list(rows[0].keys())
col='In Crelate (owner, last activity)'; hits=0
for r in rows:
    p=r['Name'].split()
    cands=idx.get((n(p[0])[:4],n(p[-1])),[])
    co=n(r['Company'])[:6]
    m=[c for c in cands if co and (co in n(c.get('co')) or n(c.get('co'))[:6] in n(r['Company']))]
    if m:
        c=m[0]; hits+=1
        r[col]=f"Yes · {c['id']} · owner {', '.join(c['owner']) or 'none'} · last {c['last'] or 'n/a'}"
    elif cands:
        r[col]=f"Possible: same name in Crelate at {cands[0].get('co') or 'unknown company'} · {cands[0]['id']}"
    else:
        r[col]='No · new record'
w=csv.DictWriter(open(path,'w',newline=''),fieldnames=hdr); w.writeheader(); w.writerows(rows)
print(path.split('/')[-1],'rows',len(rows),'in Crelate',hits,'possible',sum(r[col].startswith('Possible') for r in rows))
