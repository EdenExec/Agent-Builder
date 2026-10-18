"""Build the weather document the Day Board reads (collection weather, document current).

Usage:  python3 -I projects/day-board/weather.py "LAT,LON,Home label" "LAT,LON,Market label" ... > weather.json
Source: US National Weather Service (api.weather.gov), free for any use, US locations only.
Prints one JSON object. Nothing is written anywhere else; load it with ArtifactData (set weather/current).
"""
import json, re, sys, time, urllib.request
from datetime import datetime, timezone

UA = "Mozilla/5.0 (EdenDayBoard; contact kev@edenexec.com)"

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/geo+json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def nums(s):
    return [int(x) for x in re.findall(r"\d+", str(s or ""))]

def icon_for(text, wind):
    t = (text or "").lower()
    if "thunder" in t: return "storm"
    if any(k in t for k in ("snow", "sleet", "flurr", "freezing", "ice")): return "snow"
    if any(k in t for k in ("rain", "shower", "drizzle")): return "rain"
    if any(k in t for k in ("fog", "haze", "smoke", "mist")): return "fog"
    if wind >= 20: return "wind"
    if "partly" in t or "mostly sunny" in t or "mostly clear" in t: return "partly"
    if "cloud" in t or "overcast" in t: return "cloudy"
    return "clear"

def hour_label(iso):
    d = datetime.fromisoformat(iso)
    return d.strftime("%I %p").lstrip("0")

def build(lat, lon, label):
    pts = get(f"https://api.weather.gov/points/{lat},{lon}")["properties"]
    hourly = get(pts["forecastHourly"])["properties"]["periods"][:24]
    now = hourly[0]
    temps = [p["temperature"] for p in hourly]
    wind = max(nums(now.get("windSpeed")) or [0])
    gust = None
    g = now.get("windGust")
    if g: gust = max(nums(g) or [0]) or None
    pops = [(p.get("probabilityOfPrecipitation") or {}).get("value") or 0 for p in hourly[:12]]
    precip = max(pops) if pops else 0
    summary = now.get("shortForecast") or ""
    icon = icon_for(summary, wind)
    wet = "Snow" if icon == "snow" else "Rain"
    note = summary
    if precip >= 40:
        first = next((i for i, v in enumerate(pops) if v >= 40), 0)
        note = f"{wet} likely" + ("" if first == 0 else " around " + hour_label(hourly[first]["startTime"]))
        if icon not in ("rain", "storm", "snow"):
            icon = "snow" if wet == "Snow" else "rain"
    elif wind >= 20:
        note = "Windy today"
    return {
        "place": label,
        "tempF": now["temperature"],
        "hiF": max(temps), "loF": min(temps),
        "icon": icon, "summary": summary, "note": note,
        "windMph": wind, "gustMph": gust, "windDir": now.get("windDirection") or "",
        "precipPct": precip,
    }

def build_retry(lat, lon, label):
    last = None
    for _ in range(3):
        try:
            return build(lat, lon, label)
        except Exception as e:  # NWS answers 500 now and then
            last = e
            time.sleep(2)
    sys.stderr.write(f"skipped {label}: {last}\n")
    return None

def main():
    # args: "lat,lon,Label" ...; the first place is home
    places = []
    for arg in sys.argv[1:]:
        lat, lon, label = arg.split(",", 2)
        places.append(build_retry(lat.strip(), lon.strip(), label.strip()))
    if not places or places[0] is None:
        sys.exit("home place failed; nothing printed")
    print(json.dumps({
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": "National Weather Service",
        "window": "next 24 hours",
        "places": [p for p in places if p],
    }))

main()
