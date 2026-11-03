import json,subprocess,os,sys,time
key=os.environ['CRELATE_API_KEY']; out=sys.argv[1]
def get(u):
    for a in range(4):
        r=subprocess.run(['curl','-sS','--max-time','60','-H','X-Api-Key: '+key,u],capture_output=True,text=True).stdout
        try: return json.loads(r)
        except Exception: time.sleep(2*(a+1))
    return {}
o=0; n=0
with open(out,'w') as f:
    while True:
        d=get(f'https://app.crelate.com/api3/contacts?limit=100&offset={o}').get('Data') or []
        for c in d:
            cp=c.get('CurrentPosition') or {}
            addr=c.get('Addresses_Home') or c.get('Addresses_Business') or {}
            if isinstance(addr,list): addr=addr[0] if addr else {}
            f.write(json.dumps(dict(id=c.get('Id'),name=c.get('FullName'),title=cp.get('JobTitle'),co=(cp.get('CompanyId') or {}).get('Title'),
              city=addr.get('City'),state=addr.get('State'),tags=[t['Title'] for v in (c.get('Tags') or {}).values() for t in v],
              owner=[x['Title'] for x in c.get('Owners') or []],last=(c.get('LastActivityDate') or '')[:10],mob=bool(c.get('PhoneNumbers_Mobile')),
              li=bool(c.get('Websites_LinkedIn') or c.get('SocialMedia_LinkedIn'))))+'\n')
        n+=len(d); o+=100
        if len(d)<100: break
print('done',n)
