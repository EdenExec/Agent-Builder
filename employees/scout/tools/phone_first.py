# Reorder a lead sheet so phones sit next to the name (Kev, 3 Nov 2026):
# Ref, #, Tier, Name, Mobile, Mobile source, Direct, Phone notes, then every other column in its existing order.
# Merges duplicate phone columns ("Mobile Phone", "Direct Phone", "Phone Notes") into the canonical ones.
# usage: phone_first.py <in.csv> <out.csv>
import csv,sys
FRONT=["Ref","#","Tier","Name","Mobile","Mobile source","Direct","Phone notes"]
ALIAS={"mobile phone":"Mobile","direct phone":"Direct","phone notes":"Phone notes","mobile":"Mobile","mobile source":"Mobile source","direct":"Direct"}
def reorder(rows):
    h=[c.strip() for c in rows[0]]
    canon=[ALIAS.get(c.lower(),c) for c in h]
    rest=[]
    for c in canon:
        if c and c not in FRONT and c not in rest: rest.append(c)
    order=FRONT+rest
    out=[order]
    for r in rows[1:]:
        r=r+['']*(len(h)-len(r)); d={}
        for c,v in zip(canon,r):
            if not c: continue
            if v.strip() and not d.get(c,'').strip(): d[c]=v
            else: d.setdefault(c,v)
        out.append([d.get(c,'') for c in order])
    return out
if __name__=='__main__':
    rows=list(csv.reader(open(sys.argv[1])))
    csv.writer(open(sys.argv[2],'w',newline='')).writerows(reorder(rows))
    print(sys.argv[2], len(rows)-1, 'rows;', ', '.join(reorder(rows)[0][:10]), '...')
