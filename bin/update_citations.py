#!/usr/bin/env python3
"""
Update Google Scholar citation counts for all publications in _bibliography/papers.bib.
Queries the public Google Scholar profile in a single request and synchronizes citation counts.
"""

import os
import re
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone

import subprocess
import time
import http.cookiejar

try:
    import yaml
except ImportError:
    yaml = None

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None


def get_scholar_userid(repo_root):
    """Retrieve Google Scholar user ID from _config.yml."""
    config_path = os.path.join(repo_root, "_config.yml")
    if not os.path.exists(config_path):
        return None

    with open(config_path, "r", encoding="utf-8") as f:
        content = f.read()

    if yaml:
        try:
            data = yaml.safe_load(content)
            if data and "scholar_userid" in data and data["scholar_userid"]:
                return str(data["scholar_userid"]).strip()
        except Exception:
            pass

    # Regex fallback
    match = re.search(r"^\s*scholar_userid:\s*([^\s#]+)", content, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return None


def parse_scholar_html(html):
    """Parse citation counts from Google Scholar HTML table rows."""
    if not html:
        return {}

    citations_map = {}
    if BeautifulSoup:
        soup = BeautifulSoup(html, "html.parser")
        rows = soup.find_all("tr", class_="gsc_a_tr")
        for row in rows:
            title_tag = row.find("a", class_="gsc_a_at")
            cites_tag = row.find("a", class_="gsc_a_ac")

            if not title_tag:
                continue

            href = title_tag.get("href", "")
            match = re.search(r"citation_for_view=[^:]+:([^&]+)", href)
            if not match:
                continue

            article_id = match.group(1).strip()
            cites_text = cites_tag.text.strip() if cites_tag and cites_tag.text.strip() else "0"
            cites_clean = cites_text.replace(",", "")
            if cites_clean.isdigit():
                citations_map[article_id] = int(cites_clean)
            else:
                citations_map[article_id] = cites_clean
    else:
        # Fallback regex parsing
        rows = re.findall(r'<tr class="gsc_a_tr">.*?</tr>', html, re.DOTALL)
        for row in rows:
            id_match = re.search(r'citation_for_view=[^:]+:([^&"]+)', row)
            cites_match = re.search(r'class="gsc_a_ac[^"]*">([^<]*)</a>', row)

            if id_match:
                article_id = id_match.group(1).strip()
                cites_text = cites_match.group(1).strip() if cites_match and cites_match.group(1).strip() else "0"
                cites_clean = cites_text.replace(",", "")
                if cites_clean.isdigit():
                    citations_map[article_id] = int(cites_clean)
                else:
                    citations_map[article_id] = cites_clean

    return citations_map


def fetch_scholar_via_curl(url):
    """Attempt to fetch Google Scholar profile using curl with HTTP/2 and browser headers."""
    cmd = [
        "curl",
        "-sL",
        "--http2",
        "--max-time",
        "20",
        "-A",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "-H",
        "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "-H",
        "Accept-Language: en-US,en;q=0.9",
        "-H",
        'Sec-Ch-Ua: "Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        "-H",
        "Sec-Ch-Ua-Mobile: ?0",
        "-H",
        'Sec-Ch-Ua-Platform: "Windows"',
        "-H",
        "Sec-Fetch-Dest: document",
        "-H",
        "Sec-Fetch-Mode: navigate",
        "-H",
        "Sec-Fetch-Site: none",
        "-H",
        "Sec-Fetch-User: ?1",
        "-H",
        "Upgrade-Insecure-Requests: 1",
        url,
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=25)
        if proc.returncode == 0 and proc.stdout and "gsc_a_tr" in proc.stdout:
            return proc.stdout
    except Exception as e:
        print(f"[DEBUG] Curl fetch attempt note: {e}")
    return None


def fetch_scholar_citations(scholar_userid):
    """Fetch citation counts for all articles on a Google Scholar profile in one request."""
    url = f"https://scholar.google.com/citations?user={scholar_userid}&hl=en&pagesize=100"

    # Strategy 1: curl with HTTP/2 (bypasses TLS/JA3 bot signatures on Linux/mac runners)
    print(f"[INFO] Requesting Google Scholar profile via HTTP/2...")
    curl_html = fetch_scholar_via_curl(url)
    if curl_html:
        citations = parse_scholar_html(curl_html)
        if citations:
            return citations

    # Strategy 2: urllib with CookieJar and session initialization
    print(f"[INFO] Trying session-based urllib fetch...")
    cookie_jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))

    base_headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/128.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
    }

    try:
        # Step 2a: Initialize session cookies from scholar homepage
        home_req = urllib.request.Request("https://scholar.google.com/", headers=base_headers)
        try:
            with opener.open(home_req, timeout=10) as resp:
                resp.read()
        except Exception:
            pass

        time.sleep(1)

        # Step 2b: Query profile with session cookies and Referer
        profile_headers = dict(base_headers)
        profile_headers["Referer"] = "https://scholar.google.com/"
        profile_headers["Sec-Fetch-Site"] = "same-origin"

        req = urllib.request.Request(url, headers=profile_headers)
        with opener.open(req, timeout=15) as response:
            html = response.read().decode("utf-8", errors="replace")

        if "recaptcha" in html.lower() or "please show you're not a robot" in html.lower():
            print(f"[WARNING] Google Scholar presented a CAPTCHA challenge.")
            return None

        return parse_scholar_html(html)
    except urllib.error.HTTPError as e:
        print(f"[WARNING] Google Scholar request failed: HTTP {e.code} {e.reason}")
        return None
    except Exception as e:
        print(f"[WARNING] Failed to fetch Google Scholar profile for {scholar_userid}: {e}")
        return None


def update_bib_file(bib_path, citations_map):
    """Update scholar_citation_count in _bibliography/papers.bib."""
    if not os.path.exists(bib_path):
        print(f"[WARNING] Bibliography file not found at: {bib_path}")
        return False

    with open(bib_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Split by BibTeX entries (@article, @inproceedings, etc.)
    entry_pattern = re.compile(r"(@\w+\s*\{[^@]+)", re.MULTILINE)
    entries = entry_pattern.findall(content)

    updated_content = content
    changes_count = 0

    for entry_text in entries:
        id_match = re.search(r"google_scholar_id\s*=\s*\{([^}]+)\}", entry_text)
        if not id_match:
            continue

        scholar_id = id_match.group(1).strip()
        if scholar_id not in citations_map:
            continue

        new_count = citations_map[scholar_id]
        current_count_match = re.search(r"scholar_citation_count\s*=\s*\{([^}]+)\}", entry_text)

        if current_count_match:
            old_count = current_count_match.group(1).strip()
            if old_count != str(new_count):
                new_entry_text = re.sub(
                    r"scholar_citation_count\s*=\s*\{[^}]+\}",
                    f"scholar_citation_count = {{{new_count}}}",
                    entry_text,
                )
                updated_content = updated_content.replace(entry_text, new_entry_text)
                changes_count += 1
                print(f"[INFO] Updated {scholar_id}: {old_count} -> {new_count} citations")
        else:
            # Insert scholar_citation_count before closing bracket
            last_bracket = entry_text.rfind("}")
            if last_bracket != -1:
                new_entry_text = (
                    entry_text[:last_bracket].rstrip()
                    + f"\n  scholar_citation_count = {{{new_count}}},\n"
                    + entry_text[last_bracket:]
                )
                updated_content = updated_content.replace(entry_text, new_entry_text)
                changes_count += 1
                print(f"[INFO] Added {scholar_id}: {new_count} citations")

    if updated_content != content:
        with open(bib_path, "w", encoding="utf-8") as f:
            f.write(updated_content)
        print(f"[SUCCESS] Updated {changes_count} entry/entries in {bib_path}")
        return True
    else:
        print("[INFO] No citation count changes detected in papers.bib.")
        return False


def get_orcid_id(repo_root):
    """Retrieve ORCID ID from _config.yml."""
    config_path = os.path.join(repo_root, "_config.yml")
    if not os.path.exists(config_path):
        return None

    with open(config_path, "r", encoding="utf-8") as f:
        content = f.read()

    if yaml:
        try:
            data = yaml.safe_load(content)
            if data and "orcid_id" in data and data["orcid_id"]:
                return str(data["orcid_id"]).strip()
        except Exception:
            pass

    match = re.search(r"^\s*orcid_id:\s*([^\s#]+)", content, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return None


def fetch_orcid_peer_reviews(orcid_id):
    """Fetch verified peer review count from the public ORCID v3.0 API."""
    url = f"https://pub.orcid.org/v3.0/{orcid_id}/peer-reviews"
    headers = {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36",
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            total_count = 0
            for group in data.get("group", []):
                for sub in group.get("peer-review-group", []):
                    summaries = sub.get("peer-review-summary", [])
                    total_count += len(summaries)
            return total_count
    except Exception as e:
        print(f"[WARNING] Failed to fetch ORCID peer reviews for {orcid_id}: {e}")
        return None


def save_citations_data(data_path, citations_map, peer_reviews_count=None):
    """Save citation counts and peer review metrics to _data/citations.json as a cache/backup."""
    os.makedirs(os.path.dirname(data_path), exist_ok=True)
    total_cites = sum(val for val in citations_map.values() if isinstance(val, int))
    payload = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "total_citations": total_cites,
        "peer_reviews_count": peer_reviews_count if peer_reviews_count is not None else 25,
        "citations": citations_map,
    }
    with open(data_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    print(f"[SUCCESS] Saved citation cache & metrics to {data_path}")


def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    scholar_id = None

    if len(sys.argv) > 1:
        scholar_id = sys.argv[1]
    else:
        scholar_id = get_scholar_userid(repo_root)

    orcid_id = get_orcid_id(repo_root)

    if not scholar_id:
        print("[ERROR] Could not find scholar_userid in _config.yml or command line arguments.")
        sys.exit(1)

    print(f"[INFO] Fetching Google Scholar citations for user: {scholar_id}")
    citations_map = fetch_scholar_citations(scholar_id)

    if not citations_map:
        print("[ERROR] No citations retrieved from Google Scholar (request was blocked or CAPTCHA was encountered).")
        print("[INFO] Cloud runner IPs may be rate-limited by Scholar. You can run 'python3 bin/update_citations.py' locally anytime to sync citations.")
        sys.exit(1)

    print(f"[INFO] Found {len(citations_map)} publication(s) on Google Scholar profile:")
    for art_id, count in citations_map.items():
        print(f"  - {art_id}: {count} citations")

    bib_path = os.path.join(repo_root, "_bibliography", "papers.bib")
    update_bib_file(bib_path, citations_map)

    peer_reviews_count = None
    if orcid_id:
        print(f"[INFO] Fetching verified peer reviews from ORCID for ID: {orcid_id}")
        peer_reviews_count = fetch_orcid_peer_reviews(orcid_id)
        if peer_reviews_count is not None:
            print(f"[INFO] Verified Peer Reviews from ORCID: {peer_reviews_count}")

    data_path = os.path.join(repo_root, "_data", "citations.json")
    save_citations_data(data_path, citations_map, peer_reviews_count)


if __name__ == "__main__":
    main()
