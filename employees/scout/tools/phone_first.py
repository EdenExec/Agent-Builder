# Reorder a lead sheet so phones sit next to the name (Kev, 3 Nov 2026):
# Ref, #, Tier, Name, Mobile, Mobile source, Direct, Phone notes, then every other column in its existing order.
# Merges duplicate phone columns ("Mobile Phone", "Direct Phone", "Phone Notes") into the canonical ones.
# Placeholders ("—", "-", "–", "n/a") count as empty. When a sheet has both "Mobile" (Crelate) and
# "Mobile Phone" (ZoomInfo) filled with different numbers, the Crelate Mobile and its source win, and
# Phone notes gets "ZoomInfo has a different mobile" (never the number itself).
# usage: phone_first.py <in.csv> <out.csv>
import csv,sys
FRONT=["Ref","#","Tier","Name","Mobile","Mobile source","Direct","Phone notes"]
ALIAS={"mobile phone":"Mobile","direct phone":"Direct","phone notes":"Phone notes","mobile":"Mobile","mobile source":"Mobile source","direct":"Direct"}
EMPTY={"","—","-","–","n/a","na","none"}
def blank(v): return v.strip().lower() in EMPTY
def digits(v): return ''.join(ch for ch in v if ch.isdigit())[-10:]
def reorder(rows):
    h=[c.strip() for c in rows[0]]
    canon=[ALIAS.get(c.lower(),c) for c in h]
    rest=[]
    for c in canon:
        if c and c not in FRONT and c not in rest: rest.append(c)
    order=FRONT+rest
    out=[order]
    for r in rows[1:]:
        r=r+['']*(len(h)-len(r)); d={}; mob={}; notes=[]
        for raw,c,v in zip(h,canon,r):
            if not c: continue
            if c=="Mobile":
                mob[raw.lower()]=v; continue
            if c=="Phone notes":
                if not blank(v) and v.strip() not in notes: notes.append(v.strip())
                continue
            if not blank(v) and blank(d.get(c,'')): d[c]=v
            else: d.setdefault(c,v)
        crelate=mob.get("mobile",''); zi=mob.get("mobile phone",'')
        src=d.get("Mobile source",'')
        if not blank(crelate):
            d["Mobile"]=crelate
            if not blank(zi) and digits(zi)!=digits(crelate):
                notes.append("ZoomInfo has a different mobile")
        elif not blank(zi):
            d["Mobile"]=zi
            if blank(src) or src.strip().lower()=="crelate": d["Mobile source"]="ZoomInfo"
        else:
            d["Mobile"]=''
        d["Phone notes"]="; ".join(notes)
        out.append([d.get(c,'') for c in order])
    return out
if __name__=='__main__':
    rows=list(csv.reader(open(sys.argv[1])))
    res=reorder(rows)
    csv.writer(open(sys.argv[2],'w',newline='')).writerows(res)
    print(sys.argv[2], len(rows)-1, 'rows;', ', '.join(res[0][:10]), '...')
