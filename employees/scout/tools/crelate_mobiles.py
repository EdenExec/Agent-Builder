# usage: crelate_mobiles.py <csv> <out_json>  -> fills Mobile/Mobile source from Crelate for "Yes · <id>" rows; writes S:T values JSON
import csv,json,os,re,subprocess,sys
p,outj=sys.argv[1],sys.argv[2]; key=os.environ['CRELATE_API_KEY']
r=list(csv.reader(open(p))); h=r[0]
ci=h.index('In Crelate (owner, last activity)'); mi=h.index('Mobile'); si=h.index('Mobile source')
def mob(cid):
    out=subprocess.run(['curl','-sS','--max-time','30','-H','X-Api-Key: '+key,f'https://app.crelate.com/api3/contacts/{cid}'],capture_output=True,text=True).stdout
    try: d=json.loads(out).get('Data') or {}
    except Exception: return ''
    for k in ('PhoneNumbers_Mobile','PhoneNumbers_Mobile_Other'):
        v=d.get(k)
        if isinstance(v,list): v=v[0] if v else None
        if isinstance(v,dict) and v.get('Value'): return v['Value']
    return ''
filled=0
for row in r[1:]:
    while len(row)<len(h): row.append('')
    m=re.match(r'Yes · ([0-9a-f-]{36})',row[ci])
    if m and not row[mi]:
        v=mob(m.group(1))
        if v: row[mi]=v; row[si]='Crelate'; filled+=1
csv.writer(open(p,'w',newline='')).writerows(r)
json.dump([[x[mi],x[si]] for x in r[1:]],open(outj,'w'))
print(os.path.basename(p),'filled',filled,'of',sum(1 for x in r[1:] if x[ci].startswith('Yes')),'Yes rows; col',chr(65+mi),chr(65+si))
