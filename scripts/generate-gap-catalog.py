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
    "sentry": ["Alibaba Cloud EMAS", "Alibaba Cloud ARMS"],
    "datadog": ["Alibaba Cloud ARMS"],
    "new relic": ["Alibaba Cloud ARMS"],
    "grafana cloud": ["Alibaba Cloud ARMS"],
    "elastic cloud": ["Alibaba Cloud ARMS"],
    "dynatrace": ["Alibaba Cloud ARMS"],
    "splunk": ["Alibaba Cloud ARMS"],
    "pagerduty": ["Alibaba Cloud ARMS"],
    "amazon cloudwatch": ["Alibaba Cloud ARMS"],
    "azure monitor": ["Alibaba Cloud ARMS"],
    "bugsnag": ["Alibaba Cloud EMAS"],
    "rollbar": ["Alibaba Cloud EMAS"],
    "embrace": ["Alibaba Cloud EMAS"],
    "launchdarkly": ["Alibaba Cloud EMAS Remote Config"],
    "split": ["Alibaba Cloud EMAS Remote Config"],
    "optimizely": ["Alibaba Cloud EMAS Remote Config", "GrowingIO"],
    "flagsmith": ["Alibaba Cloud EMAS Remote Config"],
    "configcat": ["Alibaba Cloud EMAS Remote Config"],
    "firebase remote config": ["Alibaba Cloud EMAS Remote Config"],
    "bitrise": ["Alibaba Cloud Yunxiao", "Tencent Cloud DevOps (CODING)"],
    "circleci": ["Alibaba Cloud Yunxiao", "Tencent Cloud DevOps (CODING)"],
    "travis ci": ["Alibaba Cloud Yunxiao", "Tencent Cloud DevOps (CODING)"],
    "codemagic": ["Alibaba Cloud Yunxiao", "Tencent Cloud DevOps (CODING)"],
    "app center": ["Alibaba Cloud Yunxiao", "Tencent Cloud DevOps (CODING)"],
    "visual studio app center": ["Alibaba Cloud Yunxiao", "Tencent Cloud DevOps (CODING)"],
    "firebase app distribution": ["Alibaba Cloud Yunxiao", "Tencent Cloud DevOps (CODING)"],
    "testflight": ["Alibaba Cloud Yunxiao", "Tencent Cloud DevOps (CODING)"],
    "fastlane": ["Alibaba Cloud Yunxiao", "Tencent Cloud DevOps (CODING)"],
    "github actions": ["Alibaba Cloud Yunxiao", "Tencent Cloud DevOps (CODING)"],
    "gitlab ci": ["Alibaba Cloud Yunxiao", "Tencent Cloud DevOps (CODING)"],
    "azure devops": ["Alibaba Cloud Yunxiao", "Tencent Cloud DevOps (CODING)"],
    "jenkins": ["Alibaba Cloud Yunxiao", "Tencent Cloud DevOps (CODING)"],
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
    "castle": [
        "NetEase Yidun",
        "GeeTest",
        "Alibaba Cloud Risk Identification",
        "Tencent Cloud Tianyu",
    ],
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
    "braze": ["JPush", "Getui", "Umeng U-Push", "Umeng+"],
    "onesignal": ["JPush", "Alibaba Cloud Mobile Push", "Getui", "Umeng U-Push"],
    "airship": ["JPush", "Getui", "Umeng U-Push"],
    "pusher": ["JPush", "Alibaba Cloud Mobile Push", "Getui"],
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
    "cordova": ["uni-app"],
    "xamarin": ["uni-app"],
    "apollo kotlin": ["uni-app"],
    "google admob": [
        "Pangle",
        "Tencent Ads",
        "Baidu Union",
        "Kuaishou Union",
    ],
    "crowdstrike": ["GeeTest", "Authing"],
    "barracuda": ["Coremail (CACTER邮件安全网关)", "Topsec"],
    "alert logic": ["Alibaba Cloud ARMS", "GeeTest"],
    "auvik": ["Alibaba Cloud ARMS"],
    "env0": ["AWS China Regions", "Alibaba Cloud"],
    "docker hub": ["Alibaba Cloud"],
    "bitly": ["Alibaba Cloud"],
    "cloudflare analytics": ["Alibaba Cloud ARMS", "Umeng+"],
    "kong gateway": ["Apache APISIX", "Flomesh", "Higress"],
    "kong": ["Apache APISIX", "Flomesh", "Higress"],
    "airtable": [],
    "airbase": [],
}

CONTACT_NOTE = (
    "China availability for a precise product alternative is currently uncertain. "
    "Contact Chinaready for stack-specific guidance before replacing this dependency in a mainland China launch."
)
RESEARCH_NOTE = (
    "Research shortlist of China-market options commonly evaluated for this global service. "
    "Confirm replacement fit, compliance, and operating constraints before production adoption."
)
RESEARCH_NOTES = {
    "env0": (
        "For env0-managed Terraform in mainland China, prefer AWS China Regions as the primary cloud target. "
        "Alibaba Cloud is also workable because Terraform supports the Alibaba Cloud provider. "
        "Confirm compliance and operating constraints before production adoption."
    ),
    "google admob": (
        "Pure domestic China ad networks for mainland monetization when replacing Google AdMob. "
        "Confirm SDK access, settlement entity, and PIPL compliance before production adoption. "
        "AdMob is strongly discouraged for mainland users due to GFW latency, near-zero fill, and PIPL risk."
    ),
    "barracuda": (
        "Barracuda can be used in mainland China with caveats. Existing stable deployments may continue with "
        "compliance monitoring; new projects — especially government, finance, and critical infrastructure — "
        "should carefully evaluate domestic options. Prefer Coremail (CACTER邮件安全网关) for email security / "
        "email gateway replacement and Topsec (天融信) for network, WAF, and adjacent edge-security controls."
    ),
    "castle": (
        "Chinaready's nationwide mainland probes of api.castle.io across 148 city/carrier paths all returned "
        "HTTP and DNS high latency — treat the Castle API as unavailable in China. Multiple domestic vendors offer "
        "highly similar substitutes, but none fully cover Castle's complete feature set. Prefer NetEase Yidun "
        "and GeeTest for lightweight SaaS trials; prefer Alibaba Cloud Risk Identification or Tencent Cloud "
        "Tianyu when you already run on those clouds."
    ),
}


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
                    note = RESEARCH_NOTES.get(override_key, RESEARCH_NOTE)
                break

        availability = service.get("availability") or "Unknown"
        global_availability = service.get("global_availability_in_china") or {
            "Available": "available",
            "Limited": "limited",
            "Unavailable": "unavailable",
            "Unknown": "unknown",
        }.get(availability, "unknown")

        # Drop stale landscape/heuristic candidates that no longer exist in landscape.yml.
        live_candidates = []
        for candidate in candidates:
            source = candidate.get("source") or confidence
            name = candidate.get("name") or ""
            if source in {"landscape", "category-heuristic"} and name.lower() not in item_by_name:
                continue
            live = item_by_name.get(name.lower())
            if live and source in {"landscape", "category-heuristic"}:
                candidate = {**candidate, **live, "source": source}
            live_candidates.append(candidate)
        candidates = live_candidates

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
