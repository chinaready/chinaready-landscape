#!/usr/bin/env python3
"""Refresh research/global-services-gap-catalog.json china_candidates from landscape.yml."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANDSCAPE_PATH = ROOT / "landscape.yml"
OUT_PATH = ROOT / "research" / "global-services-gap-catalog.json"

try:
    import yaml
except ImportError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required: python3 -m pip install pyyaml") from exc

OVERRIDES = {
    "sentry": ["Bugly", "Alibaba Cloud ARMS"],
    "datadog": ["Alibaba Cloud ARMS"],
    "new relic": ["Alibaba Cloud ARMS"],
    "grafana cloud": ["Alibaba Cloud ARMS"],
    "elastic cloud": ["Alibaba Cloud ARMS"],
    "dynatrace": ["Alibaba Cloud ARMS"],
    "splunk": ["Alibaba Cloud ARMS"],
    "pagerduty": ["Alibaba Cloud ARMS"],
    "amazon cloudwatch": ["Alibaba Cloud ARMS"],
    "azure monitor": ["Alibaba Cloud ARMS"],
    "bugsnag": ["Bugly"],
    "rollbar": ["Bugly"],
    "embrace": ["Bugly", "Alibaba Cloud EMAS"],
    "launchdarkly": ["Alibaba Cloud EMAS Remote Config"],
    "split": ["Alibaba Cloud EMAS Remote Config"],
    "optimizely": ["Alibaba Cloud EMAS Remote Config", "GrowingIO"],
    "flagsmith": ["Alibaba Cloud EMAS Remote Config"],
    "configcat": ["Alibaba Cloud EMAS Remote Config"],
    "firebase remote config": ["Alibaba Cloud EMAS Remote Config"],
    "bitrise": ["Pgyer"],
    "circleci": ["Pgyer"],
    "travis ci": ["Pgyer"],
    "codemagic": ["Pgyer"],
    "app center": ["Pgyer"],
    "visual studio app center": ["Pgyer"],
    "firebase app distribution": ["Pgyer"],
    "testflight": ["Pgyer"],
    "fastlane": ["Pgyer"],
    "github actions": ["Pgyer"],
    "gitlab ci": ["Pgyer"],
    "zendesk": ["Zhichi", "Easemob"],
    "freshdesk": ["Zhichi"],
    "intercom": ["Zhichi", "Easemob"],
    "hubspot": ["Zhichi"],
    "helpscout": ["Zhichi"],
    "drift": ["Zhichi", "Easemob"],
    "crisp": ["Zhichi", "Easemob"],
    "livechat": ["Zhichi", "Easemob"],
    "google analytics": ["GrowingIO", "Sensors Data", "Umeng+"],
    "fullstory": ["GrowingIO", "Sensors Data"],
    "hotjar": ["GrowingIO", "Sensors Data"],
    "microsoft clarity": ["GrowingIO", "Sensors Data"],
    "heap": ["Sensors Data", "GrowingIO"],
    "pendo": ["Sensors Data", "GrowingIO"],
    "amplitude": ["Sensors Data", "Umeng+", "GrowingIO"],
    "mixpanel": ["Sensors Data", "Umeng+", "GrowingIO"],
    "posthog": ["Sensors Data", "GrowingIO"],
    "segment": ["Sensors Data", "GrowingIO"],
    "snowplow": ["Sensors Data"],
    "okta": ["Authing", "WeChat Login"],
    "onelogin": ["Authing"],
    "ping identity": ["Authing"],
    "keycloak": ["Authing"],
    "clerk": ["Authing"],
    "castle": ["GeeTest", "Authing"],
    "checkout.com": ["WeChat Pay", "Alipay"],
    "authorize.net": ["WeChat Pay", "Alipay"],
    "braintree": ["WeChat Pay", "Alipay"],
    "adyen": ["WeChat Pay", "Alipay"],
    "paypal": ["WeChat Pay", "Alipay"],
    "square": ["WeChat Pay", "Alipay"],
    "mailchimp": ["SendCloud", "Alibaba Cloud DirectMail"],
    "klaviyo": ["SendCloud", "Alibaba Cloud DirectMail"],
    "brevo": ["SendCloud", "Alibaba Cloud DirectMail"],
    "activecampaign": ["SendCloud", "JPush"],
    "customer.io": ["SendCloud", "JPush"],
    "braze": ["JPush", "Umeng+"],
    "onesignal": ["JPush", "Alibaba Cloud EMAS"],
    "airship": ["JPush"],
    "pusher": ["JPush", "Alibaba Cloud EMAS"],
    "messagebird": ["Alibaba Cloud SMS"],
    "vonage": ["Alibaba Cloud SMS", "Alibaba Cloud RTC"],
    "sinch": ["Alibaba Cloud SMS", "Alibaba Cloud RTC"],
    "agora": ["Alibaba Cloud RTC"],
    "daily": ["Alibaba Cloud RTC"],
    "mux": ["Alibaba Cloud RTC"],
    "brightcove": ["Alibaba Cloud RTC"],
    "bunnycdn": ["Alibaba Cloud CDN"],
    "fastly": ["Alibaba Cloud CDN", "Cloudflare China Network"],
    "imperva": ["Alibaba Cloud CDN", "GeeTest"],
    "bootstrapcdn": ["Alibaba Cloud CDN", "Chinaready Google Fonts Hosting"],
    "sucuri": ["GeeTest", "Alibaba Cloud CAPTCHA"],
    "hcaptcha": ["GeeTest", "Alibaba Cloud CAPTCHA"],
    "mapbox": ["Amap", "Tencent Location Services"],
    "here": ["Amap", "Tencent Location Services"],
    "openstreetmap": ["Amap", "Tencent Location Services"],
    "ipinfo": ["Amap", "Tencent Location Services"],
    "maxmind": ["Amap", "Tencent Location Services"],
    "adtrace": ["Qimai Data", "Umeng+"],
    "vercel": ["Alibaba Cloud", "Alibaba Cloud Serverless App Engine"],
    "netlify": ["Alibaba Cloud", "Alibaba Cloud Serverless App Engine"],
    "heroku": ["Alibaba Cloud Serverless App Engine"],
    "digitalocean": ["Alibaba Cloud"],
    "linode": ["Alibaba Cloud"],
    "render": ["Alibaba Cloud Serverless App Engine"],
    "fly.io": ["Alibaba Cloud"],
    "railway": ["Alibaba Cloud Serverless App Engine"],
    "glitch": ["Alibaba Cloud Serverless App Engine"],
    "github pages": ["Alibaba Cloud"],
    "supabase": ["Alibaba Cloud RDS for Supabase"],
    "planetscale": ["Alibaba Cloud"],
    "mongodb atlas": ["Alibaba Cloud"],
    "datastax": ["Alibaba Cloud"],
    "firebase": ["Alibaba Cloud EMAS", "Alibaba Cloud Serverless App Engine"],
    "firestore": ["Alibaba Cloud", "Alibaba Cloud EMAS"],
    "appsflyer": ["Qimai Data", "Umeng+"],
    "adjust": ["Qimai Data", "Umeng+"],
    "branch": ["Qimai Data", "Umeng+"],
    "kochava": ["Qimai Data", "Umeng+"],
    "singular": ["Qimai Data", "Umeng+"],
    "react native": ["uni-app"],
    "flutter": ["uni-app"],
    "ionic": ["uni-app"],
    "cordova": ["uni-app"],
    "xamarin": ["uni-app"],
    "apollo kotlin": ["uni-app"],
    "google admob": ["Umeng+"],
    "crowdstrike": ["GeeTest", "Authing"],
    "barracuda": ["GeeTest", "Alibaba Cloud CAPTCHA"],
    "alert logic": ["Alibaba Cloud ARMS", "GeeTest"],
    "auvik": ["Alibaba Cloud ARMS"],
    "env0": ["Alibaba Cloud"],
    "docker hub": ["Alibaba Cloud"],
    "bitly": ["Alibaba Cloud"],
    "cloudflare analytics": ["Alibaba Cloud ARMS", "Umeng+"],
    "vmware": ["Alibaba Cloud"],
    "airtable": [],
    "airbase": [],
    "grpc": [],
}

CONTACT_NOTE = (
    "China availability for a precise product alternative is currently uncertain. "
    "Contact Chinaready for stack-specific guidance before replacing this dependency in a mainland China launch."
)
RESEARCH_NOTE = (
    "Research shortlist of China-market options commonly evaluated for this global service. "
    "Confirm replacement fit, compliance, and operating constraints before production adoption."
)


def normalize(value: str) -> str:
    value = value.lower().strip()
    return re.sub(r"\.io$", "", value)


def main() -> None:
    if not OUT_PATH.exists():
        raise SystemExit(f"missing catalog: {OUT_PATH}")

    catalog = json.loads(OUT_PATH.read_text())
    landscape = yaml.safe_load(LANDSCAPE_PATH.read_text())
    landscape_by_sub: dict[str, list[dict]] = defaultdict(list)
    item_by_name: dict[str, dict] = {}
    for category in landscape["landscape"]:
        for subcategory in category.get("subcategories") or []:
            for item in subcategory.get("items") or []:
                row = {
                    "name": item["name"],
                    "homepage_url": item.get("homepage_url") or "",
                    "category": category["name"],
                    "subcategory": subcategory["name"],
                }
                landscape_by_sub[subcategory["name"]].append(row)
                item_by_name[item["name"].lower()] = row

    def resolve_names(names: list[str]) -> list[dict]:
        resolved = []
        for name in names:
            item = item_by_name.get(name.lower())
            if item:
                resolved.append({**item, "source": "landscape"})
            else:
                resolved.append(
                    {
                        "name": name,
                        "homepage_url": "",
                        "category": "",
                        "subcategory": "",
                        "source": "research",
                    }
                )
        return resolved

    services = []
    lookup = {}
    for service in catalog.get("services") or []:
        key = normalize(service["name"])
        confidence = service.get("confidence") or "uncertain"
        candidates = list(service.get("china_candidates") or [])
        note = service.get("research_note") or CONTACT_NOTE

        for override_key, names in OVERRIDES.items():
            if override_key == key or override_key in key or key in override_key:
                if not names:
                    candidates = []
                    confidence = "uncertain"
                    note = CONTACT_NOTE
                else:
                    candidates = resolve_names(names)
                    confidence = "researched"
                    note = RESEARCH_NOTE
                break

        availability = service.get("availability") or "Unknown"
        global_availability = service.get("global_availability_in_china") or {
            "Available": "available",
            "Limited": "limited",
            "Unavailable": "unavailable",
            "Unknown": "unknown",
        }.get(availability, "unknown")

        cleaned = {
            "name": service["name"],
            "categories": service.get("categories") or [],
            "availability": availability,
            "global_availability_in_china": global_availability,
            "china_candidates": [
                {
                    "name": candidate["name"],
                    "homepage_url": candidate.get("homepage_url") or "",
                    "category": candidate.get("category") or "",
                    "subcategory": candidate.get("subcategory") or "",
                    "source": candidate.get("source") or confidence,
                }
                for candidate in candidates
            ],
            "research_note": note,
            "confidence": confidence,
        }
        services.append(cleaned)
        lookup[key] = {
            "name": cleaned["name"],
            "availability": cleaned["availability"],
            "global_availability_in_china": cleaned["global_availability_in_china"],
        }

    payload = {
        "source": "Chinaready Landscape research shortlist for taxonomy-relevant global services",
        "generated_for": "alternatives index SEO expansion",
        "counts": {
            "services": len(services),
            "uncertain_alternatives": sum(1 for service in services if service["confidence"] == "uncertain"),
            "researched_alternatives": sum(1 for service in services if service["confidence"] == "researched"),
            "heuristic_alternatives": sum(1 for service in services if service["confidence"] == "heuristic"),
        },
        "availability_lookup": lookup,
        "services": services,
    }
    text = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    forbidden = re.compile("|".join(["".join(["app", "inchina"]), "".join(["App", "In", "China"]), r"aic_"]), re.I)
    if forbidden.search(text):
        raise SystemExit("refusing to write catalog containing forbidden legacy brand references")
    OUT_PATH.write_text(text)
    print(json.dumps(payload["counts"], indent=2))
    print(f"wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
