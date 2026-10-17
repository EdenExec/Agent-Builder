"""Corfu Old Town walking tour for Kim and Dave Williams (cruise stop, Thursday 15 October 2026). SCRIPTS ONLY, NOT RENDERED.

Narration text in the same shape as ../kotor/narration.py, so `python3 render.py <out dir>` renders it with the same
voice and model once Kev says yes and the plan has the characters. Written and fact-checked by Atlas on 13 October 2026;
sources are listed in handoff-scripts.md.

Port: Celebrity Ascent, Corfu 15 Oct 08:00-18:00 (cruisetimetables.com). The cruise port is about two miles from the
Old Fortress area; most ships run shuttles (Cruise Critic port guide). The walk starts at the Old Fortress bridge.

Fact-check decisions:
- Venice 1386-1797; Ottoman sieges 1537, 1571, 1716 all failed (Wikipedia: Corfu city, Old Fortress). Contrafossa
  channel made the citadel an island; bastions 1545-1555.
- 1716 siege 8 July to 21 August; about 33,000 Ottoman troops; storm after the 19 August assault; Corfiots credit
  St Spyridon; Schulenburg statue in front of the fortress (Wikipedia: Siege of Corfu 1716).
- Spianada: largest square in Greece (Wikipedia). The "biggest in Europe" claim is not used. Cricket from the British
  protectorate, 1814-1864. Once a firing range for Venetian troops (Wikipedia: Liston).
- Palace of St Michael and St George 1819-1824, Col. George Whitmore, stone from Malta; Maitland's residence, the Ionian
  Senate and the Order of St Michael and St George; royal residence after 1864; Museum of Asian Art. The Order was founded
  in 1818 for the Ionian Islands and Malta; James Bond is "perhaps the best known fictional CMG" (The Gazette).
- Prince Philip born 10 June 1921 on the dining-room table at Mon Repos (Wikipedia via search).
- Liston 1807, French rule, Mathieu de Lesseps, inspired by the Rue de Rivoli; his son Ferdinand built the Suez Canal.
  The "Golden Book" name story is told as one story among two. Ginger beer: a British legacy (several sources).
- St Spyridon: church 1589, bell tower 1620, tallest in the Ionian Islands, like San Giorgio dei Greci in Venice; relics
  brought after the fall of Constantinople (1453) by Georgios Kalochairetis; later part of his daughter's dowry; Venetian
  silver lamp after 1716; processions four times a year (Palm Sunday, Holy Saturday, 11 August, first Sunday of
  November). The saint: a married shepherd from Cyprus, bishop of Trimythous, at the Council of Nicaea in 325.
- Town Hall: built 1693 as the nobles' loggia, a theatre from 1720, first opera 1733 (Wikipedia: Nobile Teatro di San
  Giacomo). Catholic cathedral of St James and St Christopher on the same square: built 1553, cathedral 1632, bombed in
  the Second World War, rebuilt by 1970. Corfu has both a Greek Orthodox and a Roman Catholic archbishop.
- Kapodistrias born on Corfu in 1776, Russian foreign minister, first Governor of Greece (1827); his statue on the
  Spianada by Leonidas Drosis. Ionian Academy founded by Lord Guilford, 1823-1824 (University of Athens: 1837).
Local names are respelled phonetically in the spoken text only. <break> tags are ElevenLabs pauses.
"""

P = '<break time="1.5s" />'
LP = '<break time="3.0s" />'

TRACKS = [
("00-Old-Fortress", "The Old Fortress", "The island that never fell", f"""
Stop on the bridge for a moment and look down. That's not a river under you. It's a channel the Venetians cut by hand, from one side of the headland to the other, to turn this rock into an island. They called it the Contrafossa. Now look up at the twin peaks of the fortress on the other side. {P}

Kim, Dave, welcome to Corfu. The Greeks call it Kerkyra. And you are standing at the front door of one of the toughest little places in the Mediterranean.

For more than four hundred years, from 1386 to 1797, Corfu belonged to Venice. Venice was a city of merchants, and Corfu was the guard post at the mouth of the Adriatic Sea, the gateway to Venice itself. So they fortified it, and then fortified it some more. Between 1545 and 1555 their engineers built the great angled bastions you see here, the latest thing in military design.

It worked. The Ottoman Turks came in 1537. They came again in 1571. And in 1716 they came with an army of about thirty-three thousand men and a fleet of more than sixty ships. Every time, Corfu held. While almost all the rest of Greece lived under Ottoman rule for centuries, this island never fell. {P}

Now find the statue standing in front of the fortress. That's Count Johann Matthias von der Schulenburg, a German field marshal Venice hired to defend the island in 1716. The siege lasted six weeks, from early July to late August. Then, the day after the last great Turkish assault, a violent storm blew in and battered the ships, and a few days later the Turks packed up and sailed away, leaving their big guns behind. {P}

Venice gave the credit to Schulenburg, and honored him with this statue. The people of Corfu gave the credit to someone else: their patron saint, Spyridon. Remember that name. We'll visit him later.

The fortress is open to visitors for a ticket, with lovely views from the top. It's a fair climb on old stone ramps, so it's optional.

Your action: walk back off the bridge onto the big open park in front of you. Head to your right, toward the long row of arched buildings with cafés along the edge of the green. When you can see a cricket field, yes, a cricket field, stop and press play on track one.
"""),

("01-Spianada", "The Spianada", "Cricket in Greece", f"""
Welcome to the Spianada, the largest public square in Greece. {P} It's more of a park than a square. In the Venetian days it was open ground in front of the fortress, and Venetian troops used it as a firing range.

Now, look at that big, flat lawn. Notice anything strange? That's a cricket ground. In Greece. {P}

Here's why. After Venice fell in 1797, Corfu changed hands again and again: the French, then the Russians and the Turks together, then the French once more. Then, in 1814, the British arrived. They stayed for fifty years. And they brought what the British always bring: tea, rules, and cricket. When the British left, the cricket stayed. Today Corfu is just about the only place in Greece where people play it, and local teams still play matches right here, on the old Venetian firing range.

The British left other things behind, too. Down at the far end of the park, the round little temple with columns is a monument to Sir Thomas Maitland, the first British governor here. People in town just call it the Rotunda. {P} And nearby, at the south end of the park, stands a statue of Ioannis Kapodistrias. He was born on Corfu in 1776, became the foreign minister of the Tsar of Russia, of all things, and then came home to be the very first head of the new, independent Greece, in 1827. Corfu is very proud of him.

Behind his statue is the old Ionian Academy, founded in the 1820s by an Englishman who loved all things Greek, Lord Guilford. It was a Greek university more than ten years before Athens had one. {LP}

So here you are, standing in a square shaped by Venetian guns, used by French town planners, and played on by English cricketers, in the middle of a Greek island. That's Corfu in a nutshell. Everybody left a layer.

Your action: walk along the edge of the cricket ground toward the far end of the park, where a big pale palace with columns faces the green. Press play on track two when you're in front of it.
"""),

("02-Palace", "The Palace of St. Michael and St. George", "Built for a British governor", f"""
This handsome building is the Palace of Saint Michael and Saint George. It was built between 1819 and 1824, during the British years, for the governor, Sir Thomas Maitland. Look at the color of the stone. That's limestone shipped all the way from Malta, and Maltese stonemasons helped carve it. {P}

It was more than a house. The island's senate met here, and it was the home of a brand-new British order of knighthood, the Order of Saint Michael and Saint George, founded in 1818 to honor people from these islands and from Malta. That order still exists. Today Britain gives it mostly to diplomats. Its members can put the letters CMG after their names. And here's a fun one: the most famous holder of all is fictional. In Ian Fleming's novels, James Bond is a Companion of the Order of Saint Michael and Saint George. {P} So, in a way, this is where 007's medal began.

In 1864, Britain handed Corfu and the other Ionian Islands over to Greece. The building became a palace of the Greek royal family, who used it for state occasions while staying at a villa just south of town called Mon Repos.

And Mon Repos has a famous story. On the tenth of June, 1921, a baby boy was born there, in the dining room, on the dining-room table. He was a prince of Greece. You know him better as Prince Philip, the husband of Queen Elizabeth the Second. {P} The man who stood beside Queen Elizabeth for seventy-three years of marriage was born right here on Corfu, on a table.

Today the palace is the Museum of Asian Art, with thousands of pieces from all over Asia, many of them given by a single collector. If you have time, it's quiet and cool inside. And behind the palace are gardens looking out over the sea, which the town now calls the People's Garden. {LP}

Your action: if the museum appeals, go in, with a small ticket. Otherwise, turn around and walk back along the row of arcades on the town side of the park. Press play on track three when you're under the arches.
"""),

("03-Liston", "The Liston", "A little piece of Paris", f"""
Step in under the arches and look down the long row. Does this remind you of anywhere? {P} If you've ever walked the Rue de Rivoli in Paris, by the Louvre, it should.

This is the Liston. It was built in 1807, during the few years when Napoleon's France ruled Corfu. The French commissioner here, a diplomat named Mathieu de Lesseps, modeled it on the arcades of Paris. And here's a fun connection: his son Ferdinand grew up to build the Suez Canal. {P}

The name Liston is Venetian, from the days before the French. There are a couple of stories about where it comes from. One is that it comes from a list: the Golden Book of the island's noble families. Only people whose names were on the list, so the story goes, were allowed to stroll here. Today anybody can, and everybody does.

This is the living room of Corfu Town. Locals come here to sit for hours over one small coffee, to see and be seen. There's no rush. Nobody will hurry you. So this is the perfect place for a break.

While you're here, try something the British left behind: ginger beer. In Corfu it's called tsitsibira, and they've been making it here since the British soldiers asked for it in the 1800s. It's sweet, a little spicy, and very refreshing on a warm day. You'll also see kumquats everywhere, a tiny orange fruit made into liqueur and sweets. The kumquat is Corfu's signature souvenir. {LP}

Look out at the cricket ground from here, with the fortress beyond it, and think about it. A Venetian square, a French arcade, an English sport, and a Greek coffee. In just one view.

Your action: sit down, order something, and rest your feet. When you're ready, head into the old town from the north end of the Liston, toward the tallest bell tower you can see. Follow the signs for Saint Spyridon, or ask anyone for Agios Spyridon. It's only a couple of minutes. Press play on track four in front of the church.
"""),

("04-St-Spyridon", "The Church of St. Spyridon", "The saint of Corfu", f"""
Look up at the bell tower. It's the tallest bell tower in the Ionian Islands, built in 1620, and it was modeled on a Greek church in Venice. This is the Church of Saint Spyridon, finished in 1589. And it is the heart of Corfu. {P}

Who was Spyridon? He was a shepherd on the island of Cyprus, in the three hundreds. He was married, he had a daughter, and he became a bishop. He was one of the bishops at the great Council of Nicaea, in the year 325, the meeting that gave the Christian church the Nicene Creed. A simple shepherd, standing among the scholars.

So how did a bishop from Cyprus end up here? When Constantinople fell to the Turks in 1453, a monk named Georgios Kalochairetis carried the saint's relics to safety, and he eventually brought them to Corfu. And here's a wonderful detail. He kept them in his family, and when his daughter married, the saint's relics became part of her dowry. {P} Imagine marrying into that family. Later the relics were moved to this church, where they've been ever since.

To the people of Corfu, Spyridon isn't a distant figure. He's family. They believe he saved the island from plague, more than once, and from the Turks in 1716, with that storm. Four times a year, on Palm Sunday, Holy Saturday, the eleventh of August, and the first Sunday in November, his relics are carried through the streets in a great procession, each one remembering a time the island was saved. And you'll meet a lot of men named Spyros in Corfu. Now you know why. {P}

Step inside. Look up at the painted ceiling, and at the many silver lamps hanging in the dim light. One of them was a gift from the Venetian government, as a thank-you to the saint after the siege of 1716. The relics are kept in a silver casket near the altar. People line up to pray there. Please dress modestly, speak softly, and watch for signs about photos. {LP}

Whatever your tradition, it's moving to see. A whole island that, for more than five hundred years, has run to the same saint in trouble, and has kept thanking God for him.

Your action: spend a few minutes inside. Then, when you come out, wander the narrow lanes a little to the south, following signs for the Town Hall Square. It's about three minutes away. Press play on track five when you reach a square with a grand old building with arches.
"""),

("05-Town-Hall-Square", "Town Hall Square", "Opera, nobles and two cathedrals", f"""
You've just walked through the kantounia, the narrow stone lanes of old Corfu. Most are too narrow for cars, and the tall old houses keep them shady. This whole old town has been a UNESCO World Heritage Site since 2007.

Now look at the elegant building with the arches. Today it's the Town Hall. But it was built in 1693 as a meeting place for the Venetian nobles of the island, a kind of gentlemen's club. In 1720 it became a theater, the Theater of San Giacomo, and in 1733 it staged an opera, an Italian one, of course. It's called the first modern theater in Greece. For more than a century, Corfu's high society came here in their finery to hear the latest operas from Italy. {P}

Now find the church on this square: the Catholic Cathedral of Saint James and Saint Christopher. The church here goes back to 1553, and it became a cathedral in 1632. During the Second World War, bombing destroyed whole blocks of this old town, and the inside of this cathedral was wrecked. It took until 1970 to rebuild it. {P}

So think about this. Back at Saint Spyridon, you saw the great Orthodox church of the island. Here, a few minutes' walk away, is the Catholic cathedral. Corfu has an Orthodox archbishop and a Catholic archbishop, side by side, in the same small town. Like Kotor, this was a meeting place of East and West, and for most of its history, the two learned to live as neighbors. {LP}

Have a look around the square. The grand building at the other end, facing the Town Hall, was once the Catholic archbishop's residence, and now it houses the Bank of Greece. The cafés here are a little quieter than the Liston. It's a lovely place to sit in the shade.

Your action: take your time here. When you're ready, press play on track six. It's short, and it will point you home.
"""),

("06-Farewell", "Farewell", "Every layer", f"""
Kim and Dave, that's the walk.

You've crossed a moat cut by Venetians, found a cricket field in Greece, seen the palace where James Bond's medal was born and heard about the prince who was born on a dining-room table. You've sat under a Paris arcade, met a shepherd bishop who is still the island's best friend, and stood in an opera house turned town hall. {P}

That's Corfu. Venice, France, Britain and Greece, all layered on top of each other, and somehow it all fits. And the island that never fell is still standing, still thanking the saint, still playing cricket.

Before you head back, here are a couple of ideas. If you have time and energy, walk along the seafront past the Palace toward the old harbor, with the New Fortress rising above it. Or simply wander the lanes. You can't really get lost: the old town is small, and if you head toward the sea, or toward the green of the Spianada, you'll find your way. {P}

And a word about getting back. The port is about two miles from here. The ship's shuttle usually runs from the Old Fortress area; check the ship's daily planner for the exact stop. Leave yourselves plenty of time, and keep an eye on your all-aboard time.

One last thing. Find a spot with the fortress or the sea behind you, take a picture together, and send it home to the family. Then go get a ginger beer, or a kumquat ice cream, or both. {LP} You've earned it.
"""),
]

# Spoken-only respellings applied at render time (page text keeps the real spelling).
SAY = {
    "Kerkyra": "KER-kee-rah",
    "Contrafossa": "kon-trah-FOS-sah",
    "Schulenburg": "SHOO-len-burg",
    "Spianada": "spee-ah-NAH-dah",
    "Spyridon": "spee-REE-don",
    "Spyros": "SPEE-ros",
    "Kapodistrias": "kah-poh-DEES-tree-ahs",
    "Kalochairetis": "kah-loh-heh-REH-tees",
    "Liston": "lee-STON",
    "Lesseps": "leh-SEPS",
    "tsitsibira": "tsee-tsee-BEE-rah",
    "kantounia": "kahn-DOO-nyah",
    "San Giacomo": "San JAH-koh-moh",
    "Mon Repos": "Mon Reh-POH",
}
