# Blank phone-number values in repo copies of lead sheets (numbers live only in the Drive sheet).
# usage: python3 -I employees/scout/tools/scrub_phones.py <csv>...
import csv,sys,re
PH={"mobile","direct","mobile phone","direct phone","phone","cell"}
for f in sys.argv[1:]:
    rows=list(csv.reader(open(f)));h=[c.strip().lower() for c in rows[0]]
    idx=[i for i,c in enumerate(h) if c in PH]; n=0
    for r in rows[1:]:
        for i in idx:
            if i<len(r) and re.search(r'\d{7}',re.sub(r'\D','',r[i])): r[i]='(in sheet)'; n+=1
    csv.writer(open(f,'w',newline='')).writerows(rows)
    print(f,'scrubbed',n,'cols',[rows[0][i] for i in idx])
