import requests
from datetime import datetime, timedelta

BASE_URL = "http://downloadcenter.samsung.com/content/FM/{}/{}/BSP-F5700WWB-{}.{}.zip"

# Known range
start_date = datetime(2013, 1, 1, 0, 0, 0, 0)
end_date = datetime(2014, 12, 31, 23, 59, 59, 999000)

# Major version range (focused around known firmware)
major_min = 1000
major_max = 1021
minor_min = 0
minor_max = 9

# Millisecond step (adjust for speed vs. accuracy)
ms_step = 1  # 0–999 in steps of 100ms

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0"
})

def test_url(dt, major, minor, ms):
    yyyymm = dt.strftime("%Y%m")
    yyyymmddhhMMss = dt.strftime("%Y%m%d%H%M%S")
    ms_str = f"{ms:03}"
    timestamp = yyyymmddhhMMss + ms_str
    url = BASE_URL.format(yyyymm, timestamp, major, minor)
    try:
        resp = session.head(url, timeout=5)
        if resp.status_code == 200:
            print(f"[FOUND] {url}")
            with open("found_urls.txt", "a") as f:
                f.write(url + "\n")
            return True
        else:
            print(f"[MISS] {url}")
    except Exception as e:
        print(f"[ERROR] {url} - {e}")
    return False

# Brute-force loop
current = start_date
step = timedelta(seconds=1)

while current <= end_date:
    for ms in range(0, 1000, ms_step):
        for major in range(major_min, major_max + 1):
            for minor in range(minor_min, minor_max + 1):
                test_url(current, major, minor, ms)
    current += step

print("Done scanning.")
