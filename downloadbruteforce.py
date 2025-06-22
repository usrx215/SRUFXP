import requests
from datetime import datetime, timedelta
import time

# Configuration
MS_STEP = 1
TIMEOUT = 5
SLEEP_BETWEEN_REQUESTS = 0.0001  # 50ms between requests
RETRY_DELAY = 1  # seconds
MAX_RETRIES = 3
OUTFILE = "found_urls.txt"

# Known confirmed firmware timestamps
CONFIRMED = {
    (1017, 1): "20140310114737045",
    (1021, 1): "20140711145013142"
}

confirmed_timestamps = set(CONFIRMED.values())
blocked_earliest = "00000000000000000"

# Session config
session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0"
})

BASE_URL = "http://downloadcenter.samsung.com/content/FM/{}/{}/BSP-F5700WWB-{}.{}.zip"

# Helpers
def timestamp_str(dt, ms):
    return dt.strftime("%Y%m%d%H%M%S") + f"{ms:03}"

def dt_from_timestamp(ts):
    return datetime.strptime(ts[:17], "%Y%m%d%H%M%S%f")

def test_url(ts, major, minor):
    yyyymm = ts[:6]
    url = BASE_URL.format(yyyymm, ts, major, minor)
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = session.head(url, timeout=TIMEOUT)
            if resp.status_code == 200:
                print(f"[FOUND] {url}")
                confirmed_timestamps.add(ts)
                with open(OUTFILE, "a") as f:
                    f.write(url + "\n")
                    f.flush()
                return ts
            else:
                print(f"[MISS] {url}")
            break  # don't retry on 404s etc.
        except Exception as e:
            print(f"[ERROR] {url} - {e} (attempt {attempt})")
            time.sleep(RETRY_DELAY)
    return None

def generate_timestamps(start_ts, end_ts, blocked_before):
    current = dt_from_timestamp(start_ts)
    end = dt_from_timestamp(end_ts)
    while current <= end:
        for ms in range(0, 1000, MS_STEP):
            ts = timestamp_str(current, ms)
            if ts <= blocked_before or ts in confirmed_timestamps:
                continue
            yield ts
        current += timedelta(seconds=1)

def search_version(major, minor, start_ts, end_ts, blocked_before):
    for ts in generate_timestamps(start_ts, end_ts, blocked_before):
        result = test_url(ts, major, minor)
        time.sleep(SLEEP_BETWEEN_REQUESTS)
        if result:
            return result
    return None

def run_firmware_search():
    global blocked_earliest
    version_range = [(maj, minr) for maj in range(1000, 1022) for minr in range(0, 10)]
    version_range.sort()

    for major, minor in version_range:
        version = (major, minor)

        if version in CONFIRMED:
            print(f"[KNOWN] Skipping confirmed version {version}")
            blocked_earliest = max(blocked_earliest, CONFIRMED[version])
            continue

        if version < (1017, 1):
            ts_start = "20140101001635033"
            ts_end   = "20140310114737045"
        elif version > (1017, 1):
            ts_start = "20140310114737046"
            ts_end   = "20140711145013142"
        else:
            continue  # Already known

        found_ts = search_version(major, minor, ts_start, ts_end, blocked_earliest)
        if found_ts:
            CONFIRMED[version] = found_ts
            blocked_earliest = max(blocked_earliest, found_ts)
        else:
            print(f"[SKIPPED] Version {version} not found in time window.")

    print("Done.")

if __name__ == "__main__":
    run_firmware_search()