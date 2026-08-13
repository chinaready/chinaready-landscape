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
    "amazon cloudwatch": [
        {
            "name": "Alibaba Cloud CloudMonitor",
            "homepage_url": "https://www.aliyun.com/product/cms",
            "category": "Release, Quality & Operations",
            "subcategory": "Monitoring & Observability (APM / RUM)",
            "source": "research",
            "note": (
                "Alibaba Cloud CloudMonitor is an out-of-the-box enterprise monitoring service for "
                "Alibaba Cloud resources and internet applications. It covers infrastructure metrics, "
                "site/network probing, events, custom metrics, logs, dashboards, application groups, "
                "alerting, and container monitoring — a practical China-stack cloud monitoring path "
                "when AWS China CloudWatch feature limits are not enough."
            ),
        },
        {
            "name": "Tencent Cloud Observability Platform (TCOP)",
            "homepage_url": "https://cloud.tencent.com/product/tcop",
            "category": "Release, Quality & Operations",
            "subcategory": "Monitoring & Observability (APM / RUM)",
            "source": "research",
            "note": (
                "Tencent Cloud Observability Platform (TCOP) is a full-stack observability platform "
                "that unifies metrics, traces, and logs with visualization and alerting. Sub-products "
                "cover APM, frontend/terminal performance, dial testing, load testing, managed "
                "Prometheus/Grafana, cloud-product monitoring, and alert management — strongest when "
                "the China stack already runs on Tencent Cloud."
            ),
        },
    ],
    "azure monitor": [
        {
            "name": "Alibaba Cloud CloudMonitor",
            "homepage_url": "https://www.aliyun.com/product/cms",
            "category": "Release, Quality & Operations",
            "subcategory": "Monitoring & Observability (APM / RUM)",
            "source": "research",
            "note": (
                "Alibaba Cloud CloudMonitor is an out-of-the-box enterprise monitoring service for "
                "Alibaba Cloud resources and internet applications. It covers infrastructure metrics, "
                "site/network probing, events, custom metrics, logs, dashboards, application groups, "
                "alerting, and container monitoring — a practical China-stack cloud monitoring path "
                "when Azure China Monitor feature limits are not enough."
            ),
        },
        {
            "name": "Tencent Cloud Observability Platform (TCOP)",
            "homepage_url": "https://cloud.tencent.com/product/tcop",
            "category": "Release, Quality & Operations",
            "subcategory": "Monitoring & Observability (APM / RUM)",
            "source": "research",
            "note": (
                "Tencent Cloud Observability Platform (TCOP) is a full-stack observability platform "
                "that unifies metrics, traces, and logs with visualization and alerting. Sub-products "
                "cover APM, frontend/terminal performance, dial testing, load testing, managed "
                "Prometheus/Grafana, cloud-product monitoring, and alert management — strongest when "
                "the China stack already runs on Tencent Cloud."
            ),
        },
    ],
    "bugsnag": ["Alibaba Cloud EMAS"],
    "rollbar": ["Alibaba Cloud EMAS"],
    "embrace": ["Alibaba Cloud EMAS"],
    "firebase crashlytics": [
        {
            "name": "Tencent Bugly",
            "homepage_url": "https://bugly.qq.com/",
            "category": "Release, Quality & Operations",
            "subcategory": "Crash Reporting & Performance Monitoring",
            "source": "research",
            "note": (
                "Tencent Bugly is a leading China cross-platform quality-monitoring product for iOS and "
                "Android. It offers a unified dual-platform view, AI-assisted root-cause attribution, "
                "delayed initialization, HarmonyOS-native support, and mainland privacy-compliance "
                "controls — the preferred Crashlytics replacement when covering both mobile ends in "
                "mainland China."
            ),
        },
        {
            "name": "Umeng+",
            "homepage_url": "https://www.umeng.com/",
            "category": "Release, Quality & Operations",
            "subcategory": "Crash Reporting & Performance Monitoring",
            "source": "research",
            "note": (
                "Umeng+ (友盟+) is a fast China-market path for crash and stability monitoring with strong "
                "domestic compliance adaptation, delayed initialization, and compliance configuration — "
                "best when teams need to ship monitoring quickly and pass privacy audits."
            ),
        },
        {
            "name": "Alibaba Cloud EMAS",
            "homepage_url": "https://www.aliyun.com/product/emas",
            "category": "Release, Quality & Operations",
            "subcategory": "Crash Reporting & Performance Monitoring",
            "source": "research",
            "note": (
                "Alibaba Cloud EMAS is the natural crash and performance path when the stack already runs "
                "on Alibaba Cloud — deep cloud integration lowers integration cost and helps connect "
                "crash monitoring to the rest of the Alibaba observability stack."
            ),
        },
    ],
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
    "firebase app distribution": [
        {
            "name": "Pgyer",
            "homepage_url": "https://www.pgyer.com/",
            "category": "Release, Quality & Operations",
            "subcategory": "CI/CD & App Distribution",
            "source": "research",
            "note": (
                "Pgyer (蒲公英) is one of China's earliest and best-known beta distribution platforms. "
                "It supports web and API uploads, QR code and short-link sharing, Android / iOS / "
                "HarmonyOS packages, and a free tier that often covers early projects — commonly the "
                "first domestic shortlist when Firebase App Distribution is slow or unstable from "
                "mainland China."
            ),
        },
        {
            "name": "Tencent Bugly",
            "homepage_url": "https://bugly.qq.com/",
            "category": "Release, Quality & Operations",
            "subcategory": "CI/CD & App Distribution",
            "source": "research",
            "note": (
                "Tencent Bugly beta distribution hosts packages, shares builds, and collects tester "
                "feedback. Distinctive China-market traits include sharing into WeChat / QQ without a "
                "browser detour, QQ-account or password access control, and in-app upgrade prompts — "
                "strong when testers already live in Tencent messaging apps."
            ),
        },
        {
            "name": "Fir.im",
            "homepage_url": "https://fir.im/",
            "category": "Release, Quality & Operations",
            "subcategory": "CI/CD & App Distribution",
            "source": "research",
            "note": (
                "Fir.im is a developer-oriented beta distribution platform that emphasizes linkage with "
                "bug trackers such as Jira and Tapd, associating crash logs with builds and offering "
                "basic gray-release tester limits — a fit for teams that care about issue closure "
                "alongside package sharing."
            ),
        },
        {
            "name": "Xia Fenfa",
            "homepage_url": "https://www.xiafenfa.com/",
            "category": "Release, Quality & Operations",
            "subcategory": "CI/CD & App Distribution",
            "source": "research",
            "note": (
                "Xia Fenfa (虾分发) supports one-click iOS and Android uploads with auto-generated "
                "download links and QR codes, global CDN acceleration, and access controls such as "
                "passwords, download caps, and captchas — useful when teams want lightweight security "
                "around beta package sharing."
            ),
        },
        {
            "name": "Gulu Fenfa",
            "homepage_url": "https://www.gulufenfa.com/",
            "category": "Release, Quality & Operations",
            "subcategory": "CI/CD & App Distribution",
            "source": "research",
            "note": (
                "Gulu Fenfa (咕噜分发) is a broader beta distribution platform with a distributed "
                "architecture for concurrent downloads. Beyond hosting, it positions lifecycle coverage "
                "such as crash analysis, performance monitoring, and smart grouping of testers by "
                "device type or region."
            ),
        },
    ],
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
    "logrocket": [
        {
            "name": "Sensors Data",
            "homepage_url": "https://www.sensorsdata.cn/",
            "category": "Growth, Content & Experience",
            "subcategory": "Product Analytics & User Insights",
            "source": "research",
            "note": (
                "Sensors Data (神策数据) is a leading China user-behavior analytics platform with "
                "private-deployment options and fine-grained collection — commonly evaluated when "
                "finance, ecommerce, and other data-sensitive industries need mainland-ready product "
                "analytics instead of overseas session-replay SaaS."
            ),
        },
        {
            "name": "GrowingIO",
            "homepage_url": "https://www.growingio.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Product Analytics & User Insights",
            "source": "research",
            "note": (
                "GrowingIO is known for no-code / autocapture (无埋点) tracking with unified "
                "collection across mini programs, Apps, and Web — a lower-friction path for "
                "fast-iterating internet products that need China-market behavior analytics."
            ),
        },
        {
            "name": "Umeng+",
            "homepage_url": "https://www.umeng.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Product Analytics & User Insights",
            "source": "research",
            "note": (
                "Umeng+ (友盟+) U-App is a one-stop China mobile analytics platform with a large "
                "device-data base and very simple SDK onboarding — strong for App funnel depth and "
                "stability monitoring on domestic distribution channels."
            ),
        },
    ],
    "okta": ["Authing", "WeChat Login"],
    "onelogin": ["Authing"],
    "ping identity": ["Authing"],
    "keycloak": ["Authing"],
    "clerk": ["Authing"],
    "facebook login": [
        {
            "name": "WeChat Login",
            "homepage_url": "https://open.weixin.qq.com/",
            "category": "Users, Trust & Monetization",
            "subcategory": "Authentication & Identity",
            "source": "research",
            "note": (
                "WeChat Login is mainland China's No. 1 third-party login. Apply via the WeChat Open "
                "Platform for websites, mobile apps, and mini programs; users scan a QR code or "
                "authorize in one tap. Coverage is extremely broad across consumer apps."
            ),
        },
        {
            "name": "QQ Login",
            "homepage_url": "https://connect.qq.com/",
            "category": "Users, Trust & Monetization",
            "subcategory": "Authentication & Identity",
            "source": "research",
            "note": (
                "QQ Login via QQ Connect is one of China's earliest widely adopted social login "
                "methods. Users sign in with a QQ account and can authorize avatar and nickname "
                "access — still popular with younger users and on many PC websites."
            ),
        },
        {
            "name": "Weibo Login",
            "homepage_url": "https://open.weibo.com/",
            "category": "Users, Trust & Monetization",
            "subcategory": "Authentication & Identity",
            "source": "research",
            "note": (
                "Weibo Login via the Weibo Open Platform is common on media, news, and "
                "content-community sites — often the preferred supplement after WeChat and QQ."
            ),
        },
        {
            "name": "Alipay Login",
            "homepage_url": "https://open.alipay.com/",
            "category": "Users, Trust & Monetization",
            "subcategory": "Authentication & Identity",
            "source": "research",
            "note": (
                "Alipay Login is especially common in ecommerce, finance, and lifestyle apps. "
                "Users are typically real-name verified, which helps flows that need stronger "
                "identity assurance."
            ),
        },
        {
            "name": "SMS Login",
            "homepage_url": "https://www.aliyun.com/product/dysms",
            "category": "Engagement & Communication",
            "subcategory": "Push Notifications & Multichannel Messaging",
            "source": "research",
            "note": (
                "SMS Login (phone OTP) is the core mainland identity path: phone numbers are the "
                "primary login identity, support real-name expectations, and let users register or "
                "sign in without passwords via major China cloud SMS APIs."
            ),
        },
    ],
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
    "bombbomb": [
        {
            "name": "U-Mail",
            "homepage_url": "https://www.magvision.com/mail/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "U-Mail is a domestic email marketing platform with video-email sends, open/click "
                "tracking, and automation workflows — the closest China-market EDM path for "
                "BombBomb-style personalized video outreach when paired with a separate recording tool."
            ),
        },
        {
            "name": "TurboEx",
            "homepage_url": "http://www.turboex.cn/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "TurboEx (拓波) is a Xinchuang-ready enterprise mail system that explicitly supports "
                "video email, plus collaboration and security controls — strongest for government and "
                "enterprise teams that need video mail inside a domestic soft/hardware stack."
            ),
        },
        {
            "name": "Tencent Cloud SES",
            "homepage_url": "https://cloud.tencent.com/product/ses",
            "category": "Engagement & Communication",
            "subcategory": "Push Notifications & Multichannel Messaging",
            "source": "research",
            "note": (
                "Tencent Cloud SES (腾讯云邮件推送) provides SMTP/API delivery, dynamic templates, and "
                "personalized fields with high reported deliverability — best when technical teams "
                "self-build a video-email workflow on Tencent Cloud."
            ),
        },
        {
            "name": "Aico Mail",
            "homepage_url": "",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Aico Mail is a lightweight domestic mobile email client that supports voice and video "
                "mail — useful for simple one-to-one video email, not a full BombBomb-style sales "
                "recording and analytics platform."
            ),
        },
    ],
    "mailerlite": [
        {
            "name": "Alibaba Cloud Sendify",
            "homepage_url": "https://help.aliyun.com/zh/sendify/product-overview/what-is-sendify",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Alibaba Cloud Sendify is Alibaba's smart email marketing product with a drag-and-drop "
                "editor and analytics dashboard; entry pricing is often cited around ¥60/month. Best as a "
                "lightweight path for foreign-trade, B2B, and SMB email marketing."
            ),
        },
        {
            "name": "U-Mail",
            "homepage_url": "https://www.magvision.com/mail/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "U-Mail is a long-standing domestic email marketing platform with reported deliverability "
                "above 90%, automation workflows, invalid-address cleaning, and domestic plus international "
                "delivery channels. Strong fit for foreign-trade outreach, large-scale campaigns, and "
                "membership marketing."
            ),
        },
        {
            "name": "TurboEx",
            "homepage_url": "http://www.turboex.cn/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "TurboEx (拓波) is a Xinchuang-ready enterprise mail system with collaboration, approval "
                "workflows, encryption, and related security controls. Best for government and enterprise "
                "teams with strict security and compliance requirements."
            ),
        },
    ],
    "constant contact": [
        {
            "name": "Zoho Campaigns",
            "homepage_url": "https://www.zoho.com.cn/campaigns/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Zoho Campaigns is a B2B / foreign-trade email marketing suite with China local team and "
                "data centers, domain authentication, automation, dedicated IP options, Chinese-language "
                "support, and a free tier often cited around 2,000 contacts — strong when sending to "
                "overseas inboxes with China-friendly operations."
            ),
        },
        {
            "name": "U-Mail",
            "homepage_url": "https://www.magvision.com/mail/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "U-Mail is a domestic enterprise email marketing platform with private-deployment options "
                "so data can stay in mainland China — a practical fit for data-sensitive industries such "
                "as finance and government/enterprise."
            ),
        },
        {
            "name": "SendCloud",
            "homepage_url": "https://www.sendcloud.net/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "SendCloud is a long-standing domestic email push and marketing provider with strong API "
                "coverage — best for technical teams and ecommerce sending workflows."
            ),
        },
        {
            "name": "NetEase Email Marketing",
            "homepage_url": "https://qiye.163.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "NetEase Email Marketing (网易邮件营销) is SMB-oriented bulk email built on the NetEase "
                "mailbox ecosystem, with comparatively reliable domestic deliverability for event notices "
                "and small-scale campaigns."
            ),
        },
    ],
    "convertkit": [
        {
            "name": "U-Mail",
            "homepage_url": "https://www.magvision.com/mail/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "U-Mail is a domestic professional email marketing platform with reported mainland "
                "deliverability above 90%, foreign-trade outreach and membership marketing workflows, "
                "and local advisor support."
            ),
        },
        {
            "name": "Zoho Campaigns",
            "homepage_url": "https://www.zoho.com.cn/campaigns/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Zoho Campaigns is an international email marketing suite usable in China, with Chinese "
                "UI, Zoho CRM linkage, and domestic service nodes — a strong fit for B2B, foreign-trade, "
                "and enterprise teams."
            ),
        },
        {
            "name": "SendCloud",
            "homepage_url": "https://www.sendcloud.net/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "SendCloud is a domestic email delivery infrastructure provider with strong API, SMTP, "
                "template, and webhook coverage — best for technical teams building or integrating their "
                "own sending stack."
            ),
        },
        {
            "name": "MailerLite",
            "homepage_url": "https://www.mailerlite.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "MailerLite is an international creator-oriented email platform that is often reachable "
                "from China, with a generous free plan (about 1,000 subscribers) and a simple UI — a "
                "practical orientation option for creators and small teams."
            ),
        },
    ],
    "drip": [
        {
            "name": "Dida EDM",
            "homepage_url": "https://www.didalinkin.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Dida EDM (滴答EDM) is a cross-border ecommerce email lifecycle system — the closest China "
                "substitute for Drip's abandoned-cart recovery, customer segmentation, and automation flows. "
                "Chinese support and localization; billing is typically by send volume rather than contact count."
            ),
        },
        {
            "name": "U-Mail",
            "homepage_url": "https://www.magvision.com/mail/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "U-Mail is a domestic email marketing platform with strong deliverability focus, behavior "
                "tracking, and automation workflows. Practical fit for foreign-trade and cross-border sellers "
                "running bulk plus automated campaigns."
            ),
        },
        {
            "name": "Shierke",
            "homepage_url": "https://www.12ke.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Shierke (十二客) is a long-standing domestic bulk email provider with million-scale daily "
                "delivery capacity. Best when high-volume promotional email is the primary need."
            ),
        },
        {
            "name": "Reasonable Spread",
            "homepage_url": "https://rspread.cn/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Reasonable Spread (思齐) is a China–Hong Kong email marketing SaaS with a Chinese admin, "
                "multilingual templates, and phone support. Strong when localized service and bilingual "
                "operations matter more than pure Drip feature parity."
            ),
        },
    ],
    "libsyn": [
        {
            "name": "Ximalaya",
            "homepage_url": "https://www.ximalaya.com/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "Comprehensive audio platform plus hosting; Apple Podcasts' only certified hosting partner "
                "in mainland China; hosts 26,000+ podcast albums with 160M+ users and can distribute to "
                "Apple Podcasts alongside domestic reach."
            ),
        },
        {
            "name": "Xiaoyuzhou",
            "homepage_url": "https://www.xiaoyuzhoufm.com/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "Pure podcast community with strong listening UX and creator culture; deep partnership "
                "with QQ Music for domestic podcast distribution."
            ),
        },
        {
            "name": "Shengbo",
            "homepage_url": "https://mp.tencentmusic.com/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "TME Podcast Creation Center (声播); one-click distribution across Tencent Music "
                "platforms including QQ Music, Kuwo Music, and Kugou Music."
            ),
        },
        {
            "name": "Lizhi",
            "homepage_url": "https://www.lizhi.fm/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "Lizhi FM / Lizhi Weike audio creation and livestream stack; practical for knowledge-paid "
                "and voice-livestream creators rather than RSS-first global podcast hosting alone."
            ),
        },
    ],
    "captivate": [
        {
            "name": "Ximalaya",
            "homepage_url": "https://www.ximalaya.com/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "Largest comprehensive China audio platform; Apple Podcasts' only certified hosting "
                "partner in mainland China; hosts 26,000+ podcast albums with 160M+ users."
            ),
        },
        {
            "name": "Xiaoyuzhou",
            "homepage_url": "https://www.xiaoyuzhoufm.com/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "General-purpose podcast client with the strongest community interaction quality among "
                "mainland Chinese podcast apps; supports RSS subscription, polished UI, and a healthy "
                "creator ecosystem."
            ),
        },
        {
            "name": "Qingting FM",
            "homepage_url": "https://www.qingting.fm/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "Long-standing China audio platform among the earliest focused on podcasts; supports "
                "RSS import and redistribution."
            ),
        },
        {
            "name": "Lizhi",
            "homepage_url": "https://www.lizhi.fm/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "Independent-creator-friendly audio platform oriented to younger podcasters; supports "
                "pre-recorded podcast publishing."
            ),
        },
        {
            "name": "Typlog",
            "homepage_url": "https://typlog.com/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "Independent blogging and podcast hosting with custom-domain support; practical when "
                "creators want ownership and independence from large audio platforms."
            ),
        },
    ],
    "buzzsprout": [
        {
            "name": "Ximalaya",
            "homepage_url": "https://www.ximalaya.com/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "China's largest audio platform with 450M+ users; Apple Podcasts' only certified "
                "hosting partner in mainland China; supports RSS distribution, analytics, and "
                "monetization — the closest full-stack Buzzsprout-style path for mainland creators."
            ),
        },
        {
            "name": "Xiaoyuzhou",
            "homepage_url": "https://www.xiaoyuzhoufm.com/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "Pure podcast app from the Jike (即刻) team with the strongest reputation in the "
                "Chinese podcast community; best when community listening experience matters most "
                "for independent creators."
            ),
        },
        {
            "name": "Lizhi",
            "homepage_url": "https://www.lizhi.fm/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "Lizhi FM oriented to younger independent podcasters; supports one-click move to "
                "Apple Podcasts and free unlimited hosting capacity."
            ),
        },
        {
            "name": "Qingting FM",
            "homepage_url": "https://www.qingting.fm/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "Professional / institutional audio platform with close radio-station partnerships; "
                "practical for PGC-style shows rather than hobbyist hosting alone."
            ),
        },
    ],
    "hello audio": [
        {
            "name": "Xiaoe",
            "homepage_url": "https://www.xiaoe-tech.com/",
            "category": "Creator Platforms",
            "subcategory": "Knowledge Commerce & Paid Content",
            "source": "research",
            "note": (
                "Xiaoe (小鹅通) is a private-domain knowledge-commerce SaaS closest to Hello Audio's "
                "core job — packaging audio/video as private, paid, controllable delivery inside the "
                "WeChat ecosystem (mini programs, H5, WeCom). Strong fit for courses, memberships, "
                "bootcamps, and paid podcast-style delivery."
            ),
        },
        {
            "name": "Ximalaya",
            "homepage_url": "https://www.ximalaya.com/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "Ximalaya (喜马拉雅) paid albums cover paid podcast / membership audio with Apple "
                "Podcasts certified hosting in mainland China, so creators can monetize domestically "
                "and still distribute overseas where needed."
            ),
        },
        {
            "name": "Dedao",
            "homepage_url": "https://www.igetget.com/",
            "category": "Creator Platforms",
            "subcategory": "Knowledge Commerce & Paid Content",
            "source": "research",
            "note": (
                "Dedao (得到) is a knowledge-commerce platform that provides instructors and institutions "
                "dedicated audio hosting and distribution channels — a strong fit for structured course "
                "and curriculum-style audio."
            ),
        },
        {
            "name": "Xiaoyuzhou",
            "homepage_url": "https://www.xiaoyuzhoufm.com/",
            "category": "Media Platforms",
            "subcategory": "Podcast Hosting & Distribution",
            "source": "research",
            "note": (
                "Xiaoyuzhou (小宇宙) is China's leading Chinese-language podcast community for public "
                "shows. It does not support private feeds, so treat it as a traffic / discovery path "
                "rather than private paid delivery."
            ),
        },
    ],
    "klaviyo": [
        {
            "name": "Dida EDM",
            "homepage_url": "https://www.didalinkin.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Dida EDM (滴答EDM) is a China-oriented email marketing system for cross-border "
                "independent sites. Chinese UI and local team support, Shopify / Shoplazza "
                "integrations, and send-volume billing without contact-count caps — commonly the "
                "closest domestic Klaviyo-shaped path for China Shopify sellers."
            ),
        },
        {
            "name": "Zoho Campaigns",
            "homepage_url": "https://www.zoho.com.cn/campaigns/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Zoho Campaigns is a foreign-trade / B2B email marketing suite with a China operations "
                "team, strong deliverability focus, and rich automation — a practical fit for cold "
                "outreach and B2B lifecycle email when the audience is domestic or trade-oriented."
            ),
        },
        {
            "name": "Omnisend",
            "homepage_url": "https://www.omnisend.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Omnisend is an ecommerce multichannel marketing platform often compared with Klaviyo "
                "for store email / SMS automation. Typically easier to adopt and more price-friendly "
                "for small and mid-size sellers, though it remains an overseas SaaS with the same "
                "China-access caveats as other global tools."
            ),
        },
        {
            "name": "Brevo",
            "homepage_url": "https://www.brevo.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Brevo (formerly Sendinblue) combines email and SMS. Free-tier contact capacity is "
                "often cited around 100,000 contacts with send-volume billing — a budget-friendly "
                "orientation option for teams that need multichannel outreach without Klaviyo pricing."
            ),
        },
        {
            "name": "MailerLite",
            "homepage_url": "https://www.mailerlite.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "MailerLite is a lightweight email marketing platform. Free-tier capacity is often "
                "cited around 500 subscribers and 12,000 emails/month — useful for early-stage lists, "
                "with the same overseas-SaaS limits Chinaready documents on the MailerLite page."
            ),
        },
    ],
    "brevo": ["SendCloud", "Alibaba Cloud DirectMail"],
    "activecampaign": [
        {
            "name": "Zoho Campaigns",
            "homepage_url": "https://www.zoho.com.cn/campaigns/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Zoho Campaigns is an international email marketing suite with mainland localization, "
                "Chinese-language support, domain authentication, and China-friendly delivery paths — "
                "a strong option when the audience is primarily Chinese and you need campaign automation "
                "plus workable local deliverability."
            ),
        },
        {
            "name": "SendCloud",
            "homepage_url": "https://www.sendcloud.net/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "SendCloud is a long-standing domestic email push and marketing provider with dedicated "
                "China sending channels, strong API/SMTP coverage, and higher inbox placement into "
                "QQ, NetEase, and similar domestic mailboxes than typical overseas ESP paths."
            ),
        },
    ],
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
    "bunnycdn": ["Alibaba Cloud CDN", "Tencent Cloud CDN"],
    "fastly": ["Alibaba Cloud CDN", "Tencent Cloud CDN", "Cloudflare China Network"],
    "imperva": ["Alibaba Cloud CDN", "Tencent Cloud CDN", "GeeTest"],
    "bootstrapcdn": [
        {
            "name": "Staticfile CDN",
            "homepage_url": "https://www.staticfile.net/",
            "category": "Infrastructure & Edge",
            "subcategory": "Open-source library CDN / static hosting",
            "source": "research",
            "note": (
                "Staticfile CDN (staticfile.net) is a free domestic open-source library CDN commonly "
                "used to mirror Bootstrap and related front-end assets for mainland China access. "
                "Best for testing and validation before production hardening."
            ),
        },
        {
            "name": "BootCDN",
            "homepage_url": "https://www.bootcdn.cn/",
            "category": "Infrastructure & Edge",
            "subcategory": "Open-source library CDN / static hosting",
            "source": "research",
            "note": (
                "BootCDN (bootcdn.cn) is a free domestic open-source project CDN closely associated "
                "with Bootstrap China community usage. Best for testing and validation of Bootstrap "
                "and common front-end library loads from mainland China."
            ),
        },
    ],
    "amazon cloudfront": ["Alibaba Cloud CDN", "Tencent Cloud CDN"],
    "akamai": ["Alibaba Cloud CDN", "Tencent Cloud CDN"],
    "cloudflare cdn": ["Alibaba Cloud CDN", "Tencent Cloud CDN", "Cloudflare China Network"],
    "sucuri": ["GeeTest", "Alibaba Cloud CAPTCHA"],
    "hcaptcha": ["GeeTest", "Alibaba Cloud CAPTCHA"],
    "mapbox": ["Amap", "Tencent Location Services"],
    "here": ["Amap", "Tencent Location Services"],
    "openstreetmap": ["Amap", "Tencent Location Services"],
    "ipinfo": ["Amap", "Tencent Location Services"],
    "maxmind": ["Amap", "Tencent Location Services"],
    "apple mapkit": [
        {
            "name": "Amap",
            "homepage_url": "https://lbs.amap.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Location & Map Services",
            "source": "research",
            "note": (
                "Amap (高德地图) is strong on mainland road-network coverage (including rural roads), "
                "real-time traffic, and mobility integrations such as ride-hailing and EV charging — "
                "a primary MapKit alternative for driving, logistics, and travel Apps, plus Android / "
                "cross-platform builds."
            ),
        },
        {
            "name": "Baidu Maps",
            "homepage_url": "https://map.baidu.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Location & Map Services",
            "source": "research",
            "note": (
                "Baidu Maps (百度地图) offers very rich POI coverage, indoor navigation for large malls "
                "and airports, panoramic views, and AI voice interaction — especially useful when MapKit "
                "localization depth is not enough for local-lifestyle or store-discovery Apps."
            ),
        },
        {
            "name": "Tencent Maps",
            "homepage_url": "https://map.qq.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Location & Map Services",
            "source": "research",
            "note": (
                "Tencent Maps (腾讯地图) pairs baseline map coverage with tight WeChat ecosystem linkage "
                "for location sharing and Mini Program-native support — a fit when social sharing matters "
                "more than MapKit's Apple-only system integration."
            ),
        },
    ],
    "google maps platform": [
        {
            "name": "Amap",
            "homepage_url": "https://www.amap.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Location & Map Services",
            "source": "research",
            "note": (
                "Amap (高德地图) is one of mainland China's most mainstream map apps, with timely "
                "updates, strong driving/transit routing, accurate real-time traffic, Amap Earth 3D "
                "city roaming, and AR live-view navigation — a primary Google Maps substitute for "
                "daily commuting and local lifestyle discovery."
            ),
        },
        {
            "name": "Baidu Maps",
            "homepage_url": "https://map.baidu.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Location & Map Services",
            "source": "research",
            "note": (
                "Baidu Maps (百度地图) is strong on AI landmark recognition, crowd-flow prediction "
                "for attractions and malls, indoor 3D maps across thousands of large malls, and rich "
                "nearby POI data — especially useful for exploration and indoor navigation."
            ),
        },
        {
            "name": "Tencent Maps",
            "homepage_url": "https://map.qq.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Location & Map Services",
            "source": "research",
            "note": (
                "Tencent Maps (腾讯地图) is tightly integrated with WeChat for easy location sharing, "
                "plus City Memory Time Machine historical imagery, travel-track videos, and QQ Music "
                "place-based song recommendations — a fit for social and travel-sharing users."
            ),
        },
        {
            "name": "Apple Maps",
            "homepage_url": "https://www.apple.com/maps/",
            "category": "Growth, Content & Experience",
            "subcategory": "Location & Map Services",
            "source": "research",
            "note": (
                "Apple Maps is a strong iPhone option in mainland China: clean ad-free UI, system "
                "integration, English interface support, and Amap-licensed base data covering roads, "
                "POIs, transit/metro lookup, and traffic-aware routing."
            ),
        },
    ],
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
    "google admob": [
        "Pangle",
        "Tencent Ads",
        "Baidu Union",
        "Kuaishou Union",
        "Huawei Ads",
    ],
    "unity levelplay": [
        "Pangle",
        "Tencent Ads",
        "Baidu Union",
        "Kuaishou Union",
        "Huawei Ads",
    ],
    "applovin max": [
        "Pangle",
        "Tencent Ads",
        "Baidu Union",
        "Kuaishou Union",
        "Huawei Ads",
    ],
    "ironsource": [
        "Pangle",
        "Tencent Ads",
        "Baidu Union",
        "Kuaishou Union",
        "Huawei Ads",
    ],
    "chartboost": [
        "Pangle",
        "Tencent Ads",
        "Baidu Union",
        "Kuaishou Union",
        "Huawei Ads",
    ],
    "dt exchange": [
        "Pangle",
        "Tencent Ads",
        "Baidu Union",
        "Kuaishou Union",
        "Huawei Ads",
    ],
    "liftoff": [
        "Ocean Engine",
        "Tencent Advertising",
        "Pangle",
        "Kuaishou Ads",
    ],
    "applovin": [
        "Tencent Advertising",
        "Ocean Engine",
        "Kuaishou Ads",
        "Baidu Marketing",
        "Huawei Ads",
    ],
    "moloco": [
        "Tencent Advertising",
        "Ocean Engine",
        "Kuaishou Ads",
        "Baidu Marketing",
        "Huawei Ads",
    ],
    "apple search ads": [
        "Tencent Advertising",
        "Ocean Engine",
        "Baidu Marketing",
        "Huawei Ads",
    ],
    "meta ads": [
        "Tencent Advertising",
        "Ocean Engine",
        "Kuaishou Ads",
        "Baidu Marketing",
    ],
    "google ads": [
        "Tencent Advertising",
        "Ocean Engine",
        "Kuaishou Ads",
        "Baidu Marketing",
        "Huawei Ads",
    ],
    "tiktok ads": [
        "Ocean Engine",
        "Kuaishou Ads",
        "Tencent Advertising",
    ],
    "crowdstrike": ["GeeTest", "Authing"],
    "barracuda": ["Coremail (CACTER邮件安全网关)", "Topsec"],
    "alert logic": ["Alibaba Cloud ARMS", "GeeTest"],
    "auvik": ["Alibaba Cloud ARMS"],
    "env0": ["AWS China Regions", "Alibaba Cloud"],
    "aws": [
        {
            "name": "Alibaba Cloud",
            "homepage_url": "https://www.alibabacloud.com/",
            "category": "Infrastructure & Edge",
            "subcategory": "Cloud Platform & Hosting",
            "source": "research",
            "note": (
                "Alibaba Cloud is a major mainland China cloud platform with broad compute, storage, "
                "networking, security, data, and application coverage — a common default when teams "
                "evaluate China cloud vendors instead of global AWS assumptions."
            ),
        },
        {
            "name": "Tencent Cloud",
            "homepage_url": "https://cloud.tencent.com/",
            "category": "Infrastructure & Edge",
            "subcategory": "Cloud Platform & Hosting",
            "source": "research",
            "note": (
                "Tencent Cloud is a strong mainland China cloud platform option, especially when the "
                "product already leans on Tencent ecosystems such as WeChat / WeCom and related "
                "Tencent Cloud services."
            ),
        },
    ],
    "docker hub": ["Alibaba Cloud"],
    "bitly": [
        {
            "name": "Aifabu",
            "homepage_url": "https://www.aifabu.com/",
            "category": "Marketing & Automation",
            "subcategory": "Link Shortening & Attribution",
            "source": "research",
            "note": (
                "Aifabu (爱短链) offers a free starting tier with branded short codes, analytics, "
                "WeChat/Douyin anti-block features, and fast mainland redirects — strong for ecommerce "
                "promo, private-domain acquisition, and cross-platform distribution."
            ),
        },
        {
            "name": "Xiaoma Short Link",
            "homepage_url": "https://sourl.cn/",
            "category": "Marketing & Automation",
            "subcategory": "Link Shortening & Attribution",
            "source": "research",
            "note": (
                "Xiaoma Short Link (小码短链接) is free with multi-dimensional reports (visits, IP, "
                "region, device), plus API and custom-domain support — practical for community ops, "
                "creators, and knowledge commerce."
            ),
        },
        {
            "name": "3WT",
            "homepage_url": "https://3wt.cn/",
            "category": "Marketing & Automation",
            "subcategory": "Link Shortening & Attribution",
            "source": "research",
            "note": (
                "3WT (三维推) keeps most features free and emphasizes WeChat card-style short links "
                "with strong anti-block / anti-red capability — best when promotion is mainly inside "
                "the WeChat ecosystem."
            ),
        },
        {
            "name": "Suowo",
            "homepage_url": "https://suowo.cn/",
            "category": "Marketing & Automation",
            "subcategory": "Link Shortening & Attribution",
            "source": "research",
            "note": (
                "Suowo (缩我) is a long-standing domestic short-link provider known for fast redirects "
                "and high stability — commonly evaluated for enterprise short-link workloads."
            ),
        },
        {
            "name": "C1N Short URL",
            "homepage_url": "https://c1n.cn/",
            "category": "Marketing & Automation",
            "subcategory": "Link Shortening & Attribution",
            "source": "research",
            "note": (
                "C1N Short URL (C1N短网址) is a simple domestic shortener with click analytics — "
                "suited to individuals and official-account promotion."
            ),
        },
    ],
    "cloudflare analytics": ["Alibaba Cloud ARMS", "Umeng+"],
    "kong gateway": ["Apache APISIX", "Flomesh", "Higress"],
    "kong": ["Apache APISIX", "Flomesh", "Higress"],
    "airtable": [
        {
            "name": "Feishu Base",
            "homepage_url": "https://www.feishu.cn/product/base",
            "category": "Application Platform",
            "subcategory": "Mobile Backend-as-a-Service (MBaaS)",
            "source": "research",
            "note": (
                "Feishu Base (飞书多维表格) is embedded in the Feishu ecosystem — messaging, collaboration, "
                "and structured data in one stack. Free SaaS option; best for teams already using Feishu."
            ),
        },
        {
            "name": "Mingdao Cloud",
            "homepage_url": "https://www.mingdao.com/",
            "category": "Application Platform",
            "subcategory": "Mobile Backend-as-a-Service (MBaaS)",
            "source": "research",
            "note": (
                "Mingdao Cloud (明道云) is a mature APaaS platform with private deployment options and a "
                "strong business-process engine. Commonly evaluated for mid-to-large enterprise project "
                "management and CRM-style apps."
            ),
        },
        {
            "name": "Teable",
            "homepage_url": "https://teable.ai/",
            "category": "Application Platform",
            "subcategory": "Mobile Backend-as-a-Service (MBaaS)",
            "source": "research",
            "note": (
                "Teable is an open-source Airtable-style spreadsheet database with self-hosted deployment. "
                "Useful for individuals, small teams, or enterprises that need private hosting for "
                "data-compliance or Xinchuang requirements."
            ),
        },
    ],
    "airbase": [
        {
            "name": "SAP Concur",
            "homepage_url": "https://www.concur.com/",
            "category": "Users, Trust & Monetization",
            "subcategory": "Expense & Spend Management",
            "source": "research",
            "note": (
                "Leading global expense platform covering travel, expense, and invoicing, with localized "
                "mainland China service. Best fit for large multinational enterprises with cross-border "
                "spend workflows."
            ),
        },
        {
            "name": "Expensify",
            "homepage_url": "https://www.expensify.com/",
            "category": "Users, Trust & Monetization",
            "subcategory": "Expense & Spend Management",
            "source": "research",
            "note": (
                "Lightweight expense management with SmartScan receipt capture, from about $5 per user "
                "per month. Best fit for small teams and startups that need a simple international "
                "expense path."
            ),
        },
        {
            "name": "Jingbei Guanjia",
            "homepage_url": "https://www.jingbeiguanjia.com/",
            "category": "Users, Trust & Monetization",
            "subcategory": "Expense & Spend Management",
            "source": "research",
            "note": (
                "Domestic AI expense-control and operating-visibility SaaS for mainland China SMBs. "
                "Light deployment, fapiao-oriented workflows, and fast rollout — evaluate when Airbase "
                "has no localization or compliance path."
            ),
        },
    ],
    "smile": [
        {
            "name": "Youzan",
            "homepage_url": "https://www.youzan.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Loyalty & Membership",
            "source": "research",
            "note": (
                "Leading China retail-tech SaaS with a full storefront stack and a strong membership "
                "marketing system. Youzan Loyalty covers points, tiers, stored value, and paid membership "
                "for Taobao/Tmall, JD, Douyin, and other domestic commerce paths. Deep fit for mainland "
                "ecommerce habits and stable local operations."
            ),
        },
        {
            "name": "Weimob",
            "homepage_url": "https://www.weimob.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Loyalty & Membership",
            "source": "research",
            "note": (
                "Major China commerce-cloud vendor with smart-retail solutions where membership is a core "
                "module. Strong inside the WeChat ecosystem for private-domain operations, fine-grained "
                "member marketing, and loyalty programs tied to domestic channels."
            ),
        },
    ],
    "loyaltylion": [
        {
            "name": "Duiba",
            "homepage_url": "https://www.duiba.com.cn/",
            "category": "Growth, Content & Experience",
            "subcategory": "Loyalty & Membership",
            "source": "research",
            "note": (
                "Duiba (兑吧) is a points-mall and gamified user-ops SaaS for App and mini-program "
                "retention — check-ins, campaigns, and reward redemption. Commonly evaluated in banking, "
                "retail, dining, and other high-frequency consumer apps."
            ),
        },
        {
            "name": "Weimob",
            "homepage_url": "https://www.weimob.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Loyalty & Membership",
            "source": "research",
            "note": (
                "Weimob (微盟) provides omnichannel membership management and AI-assisted marketing for "
                "mid-to-large brands and retail chains that need online/offline member identity, WeChat "
                "private-domain ops, and loyalty tied to domestic commerce channels."
            ),
        },
        {
            "name": "Youzan",
            "homepage_url": "https://www.youzan.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Loyalty & Membership",
            "source": "research",
            "note": (
                "Youzan (有赞) offers a lighter membership, points, and stored-value marketing suite for "
                "SMBs and early-stage brands that need a fast mainland loyalty rollout on domestic "
                "storefront and WeChat paths."
            ),
        },
        {
            "name": "ShopEx ECShopX",
            "homepage_url": "https://www.shopex.cn/ecshopx",
            "category": "Growth, Content & Experience",
            "subcategory": "Loyalty & Membership",
            "source": "research",
            "note": (
                "ShopEx ECShopX (商派 ECShopX) is an open-source points-mall / commerce system for teams "
                "with engineering capacity that need deep customization of membership and redemption flows."
            ),
        },
        {
            "name": "Qianmi",
            "homepage_url": "https://www.qianmi.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Loyalty & Membership",
            "source": "research",
            "note": (
                "Qianmi (千米网) focuses on vertical-industry membership and retail SaaS for single-format "
                "offline stores such as dining and retail chains."
            ),
        },
        {
            "name": "Tongduiba",
            "homepage_url": "https://www.tongdui8.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Loyalty & Membership",
            "source": "research",
            "note": (
                "Tongduiba (通兑吧) is a points-operations SaaS for activity, retention, and conversion "
                "scenarios — membership points systems, redemption malls, and gamified campaigns across "
                "App, mini program, and WeChat."
            ),
        },
    ],
    "joy rewards": [
        {
            "name": "Platform membership (Alibaba / JD / Pinduoduo)",
            "homepage_url": "",
            "category": "Growth, Content & Experience",
            "subcategory": "Loyalty & Membership",
            "source": "research",
            "note": (
                "Cross-business platform membership such as Alibaba 88VIP, JD Plus, and Pinduoduo Card. "
                "Shared benefits, paid annual membership, and ecosystem retention — not a single-brand "
                "Shopify loyalty plugin swap."
            ),
        },
        {
            "name": "WeChat-first membership",
            "homepage_url": "https://developers.weixin.qq.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Loyalty & Membership",
            "source": "research",
            "note": (
                "WeChat membership cards, mini programs, customer service, WeChat Pay, and social "
                "referral loops. Users usually stay inside WeChat without downloading a new app — "
                "common for retail brands (for example Coach, Joy City, Chow Tai Fook)."
            ),
        },
        {
            "name": "Native-app membership",
            "homepage_url": "",
            "category": "Growth, Content & Experience",
            "subcategory": "Loyalty & Membership",
            "source": "research",
            "note": (
                "Brand app as the primary membership entry — push notifications, points malls, "
                "personalized recommendations, check-ins, and gamified tasks. Typical of high-frequency "
                "consumer brands such as Luckin Coffee, Starbucks, McDonald's, and Xiaomi."
            ),
        },
        {
            "name": "Coalition loyalty",
            "homepage_url": "",
            "category": "Growth, Content & Experience",
            "subcategory": "Loyalty & Membership",
            "source": "research",
            "note": (
                "Multi-brand shared points across a commercial complex or property group — one "
                "membership covering parking, dining, retail, and related categories. Common for large "
                "malls, airports, and real-estate groups (for example Joy City)."
            ),
        },
    ],
    "marketo": [
        {
            "name": "Fxiaoke",
            "homepage_url": "https://www.fxiaoke.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Marketing Automation & CRM",
            "source": "research",
            "note": (
                "Fxiaoke (纷享销客) is a leading mainland China CRM / marketing-automation suite with "
                "multichannel lead capture, scoring, behavior-triggered automation, WeCom integration, "
                "and PaaS customization. Strong fit for mid-to-large B2B teams."
            ),
        },
        {
            "name": "Tencent Qidian",
            "homepage_url": "https://qidian.qq.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Marketing Automation & CRM",
            "source": "research",
            "note": (
                "Tencent Qidian (腾讯企点) and Tencent Smart Marketing (腾讯智慧营销) sit inside the "
                "Tencent social stack (WeChat, QQ, and related channels) for paid reach plus real-time "
                "feedback. Best when WeChat-centric acquisition and engagement are the core model."
            ),
        },
        {
            "name": "Weimob Marketing Cloud",
            "homepage_url": "https://www.weimob.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Marketing Automation & CRM",
            "source": "research",
            "note": (
                "Weimob Marketing Cloud (微盟营销云) focuses on omnichannel customer data, profiles, and "
                "automated marketing journeys with mature ecommerce / retail playbooks."
            ),
        },
        {
            "name": "Zoho CRM",
            "homepage_url": "https://www.zoho.com.cn/crm/",
            "category": "Growth, Content & Experience",
            "subcategory": "Marketing Automation & CRM",
            "source": "research",
            "note": (
                "Zoho CRM offers a cost-effective, well-localized CRM path for SMBs and trade-oriented "
                "teams, with multi-year Gartner Magic Quadrant recognition for CRM suites."
            ),
        },
    ],
    "bigmarker": [
        {
            "name": "VHall",
            "homepage_url": "https://www.vhall.com/",
            "category": "Communication & Collaboration",
            "subcategory": "Webinars & Virtual Events",
            "source": "research",
            "note": (
                "VHall (微吼) is one of China's earliest enterprise livestream platforms — mature for "
                "training and event livestream, with private-deployment options. Closest research fit when "
                "the job is BigMarker-style webinars, virtual events, and CRM-linked marketing programs."
            ),
        },
        {
            "name": "Polyv",
            "homepage_url": "https://www.polyv.net/",
            "category": "Communication & Collaboration",
            "subcategory": "Webinars & Virtual Events",
            "source": "research",
            "note": (
                "Polyv (保利威) emphasizes video-cloud technology with mature education and enterprise "
                "webinar playbooks — commonly evaluated alongside VHall as the closest BigMarker-style "
                "webinar and virtual-event replacement."
            ),
        },
        {
            "name": "INMUU Live",
            "homepage_url": "https://live.inmuu.com/",
            "category": "Communication & Collaboration",
            "subcategory": "Webinars & Virtual Events",
            "source": "research",
            "note": (
                "INMUU Live (映目直播) covers online/offline hybrid events and private-domain ecommerce "
                "closed loops — strong when marketing webinars need conversion and event operations beyond "
                "a pure meeting stack."
            ),
        },
        {
            "name": "Nuoyun Live",
            "homepage_url": "https://www.nuoyun.tv/",
            "category": "Communication & Collaboration",
            "subcategory": "Webinars & Virtual Events",
            "source": "research",
            "note": (
                "Nuoyun Live (诺云直播) has a decade-long enterprise livestream focus with strong "
                "customization — commonly cited for mid-to-large enterprise training and marketing live "
                "programs."
            ),
        },
        {
            "name": "JD Cloud Enterprise Live",
            "homepage_url": "https://www.jdcloud.com/",
            "category": "Communication & Collaboration",
            "subcategory": "Webinars & Virtual Events",
            "source": "research",
            "note": (
                "JD Cloud Enterprise Live (京东云企业直播) targets very large concurrent events — evaluate "
                "when peak scale is the primary constraint."
            ),
        },
        {
            "name": "Tencent Meeting",
            "homepage_url": "https://meeting.tencent.com/",
            "category": "Communication & Collaboration",
            "subcategory": "Video Conferencing",
            "source": "research",
            "note": (
                "Tencent Meeting (腾讯会议) is lightweight and WeChat-ecosystem friendly — best for SMB "
                "day-to-day meetings and training when you do not need a full BigMarker-style webinar stack."
            ),
        },
        {
            "name": "DingTalk Meeting",
            "homepage_url": "https://www.dingtalk.com/",
            "category": "Communication & Collaboration",
            "subcategory": "Video Conferencing",
            "source": "research",
            "note": (
                "DingTalk Meeting (钉钉会议) sits inside Alibaba's DingTalk suite — natural when the "
                "organization already runs on DingTalk for collaboration and approvals."
            ),
        },
        {
            "name": "Feishu Meeting",
            "homepage_url": "https://www.feishu.cn/product/vc",
            "category": "Communication & Collaboration",
            "subcategory": "Video Conferencing",
            "source": "research",
            "note": (
                "Feishu Meeting (飞书会议) is ByteDance's collaboration-first meeting stack — strong "
                "day-to-day meeting and training experience when the team already uses Feishu."
            ),
        },
        {
            "name": "Huawei Cloud Meeting (WeLink)",
            "homepage_url": "https://www.huaweicloud.com/product/meeting.html",
            "category": "Communication & Collaboration",
            "subcategory": "Video Conferencing",
            "source": "research",
            "note": (
                "Huawei Cloud Meeting / WeLink (华为云会议) is commonly evaluated for government and "
                "enterprise buyers with higher security and compliance requirements."
            ),
        },
        {
            "name": "Haoshitong",
            "homepage_url": "https://www.hst.com/",
            "category": "Communication & Collaboration",
            "subcategory": "Video Conferencing",
            "source": "research",
            "note": (
                "Haoshitong (好视通) is a long-standing government/enterprise video-meeting vendor — "
                "often evaluated for Xinchuang and compliance-heavy replacements."
            ),
        },
        {
            "name": "XYLink",
            "homepage_url": "https://www.xylink.com/",
            "category": "Communication & Collaboration",
            "subcategory": "Video Conferencing",
            "source": "research",
            "note": (
                "XYLink (小鱼易连) supports domestic OS / chip localization paths — common for Xinchuang "
                "video-conferencing shortlists."
            ),
        },
        {
            "name": "OrayMeeting",
            "homepage_url": "https://meeting.oray.com/",
            "category": "Communication & Collaboration",
            "subcategory": "Video Conferencing",
            "source": "research",
            "note": (
                "OrayMeeting (傲瑞会议) emphasizes broad Xinchuang adaptation across domestic OS and "
                "chip stacks — evaluate for localization-mandated deployments."
            ),
        },
    ],
    "on24": [
        {
            "name": "Polyv",
            "homepage_url": "https://www.polyv.net/",
            "category": "Communication & Collaboration",
            "subcategory": "Webinars & Virtual Events",
            "source": "research",
            "note": (
                "Polyv (保利威) is a mainland enterprise video SaaS for livestream and webinars — brand "
                "customization, interactive chat, multi-venue events, overseas push, and China network "
                "adaptation. Commonly evaluated by foreign companies running webinars for mainland audiences."
            ),
        },
        {
            "name": "VHall",
            "homepage_url": "https://www.vhall.com/",
            "category": "Communication & Collaboration",
            "subcategory": "Webinars & Virtual Events",
            "source": "research",
            "note": (
                "VHall (微吼) is a domestic virtual-event and webinar pioneer for large online seminars, "
                "virtual exhibition halls, and post-event analytics. Widely used for enterprise training "
                "and marketing webinars."
            ),
        },
        {
            "name": "Feishu Webinar",
            "homepage_url": "https://www.feishu.cn/product/vc",
            "category": "Communication & Collaboration",
            "subcategory": "Webinars & Virtual Events",
            "source": "research",
            "note": (
                "Feishu Webinar (飞书网络研讨会) supports large-scale attendance, fine-grained permissions, "
                "simultaneous interpretation, rehearsal mode, and automated post-event reports. Strong fit "
                "when the team already runs on Feishu."
            ),
        },
        {
            "name": "NetEase Meeting",
            "homepage_url": "https://meeting.163.com/",
            "category": "Communication & Collaboration",
            "subcategory": "Webinars & Virtual Events",
            "source": "research",
            "note": (
                "NetEase Meeting (网易会议) covers large meetings and livestream scale with Xinchuang / "
                "national-crypto security options and full-stack domestic adaptation — often evaluated for "
                "government and enterprise scenarios."
            ),
        },
        {
            "name": "Lark",
            "homepage_url": "https://www.larksuite.com/",
            "category": "Communication & Collaboration",
            "subcategory": "Webinars & Virtual Events",
            "source": "research",
            "note": (
                "Lark (飞书国际版) combines collaboration with webinars for multinational teams that need "
                "overseas and China-facing workflows, including automation and AI meeting summaries."
            ),
        },
    ],
    "jw player": [
        {
            "name": "Tencent Cloud Player (TCPlayer)",
            "homepage_url": "https://cloud.tencent.com/product/player",
            "category": "Media Platforms",
            "subcategory": "Video Players & Streaming",
            "source": "research",
            "note": (
                "Tencent Cloud Player (TCPlayer / 腾讯云播放器) is a cloud-vendor web/mobile player SDK "
                "deeply integrated with Tencent Cloud VOD and live, covering HLS/DASH/FLV with built-in "
                "CDN acceleration — strongest when the stack already runs on Tencent Cloud."
            ),
        },
        {
            "name": "Alibaba Cloud Player (Aliplayer)",
            "homepage_url": "https://help.aliyun.com/zh/vod/developer-reference/video-player-sdk-for-web-overview/",
            "category": "Media Platforms",
            "subcategory": "Video Players & Streaming",
            "source": "research",
            "note": (
                "Alibaba Cloud Player (Aliplayer / 阿里云播放器) integrates with Alibaba Cloud video "
                "services and supports encryption, DRM, and adaptive bitrate — strongest when the stack "
                "already runs on Alibaba Cloud."
            ),
        },
        {
            "name": "Polyv",
            "homepage_url": "https://www.polyv.net/",
            "category": "Media Platforms",
            "subcategory": "Enterprise Video (VOD & Live)",
            "source": "research",
            "note": (
                "Polyv (保利威) is a mainland enterprise video SaaS for live + VOD + interaction, with "
                "ads and anti-leech controls — closest research fit to JW Player's full hosted-player "
                "plus monetization positioning."
            ),
        },
        {
            "name": "ckplayer",
            "homepage_url": "https://www.ckplayer.com/",
            "category": "Media Platforms",
            "subcategory": "Video Players & Streaming",
            "source": "research",
            "note": (
                "ckplayer is a lightweight open-source web player for mp4/flv-style embeds — practical "
                "when you only need a simple player shell without a full video SaaS."
            ),
        },
        {
            "name": "DPlayer",
            "homepage_url": "https://github.com/DIYgod/DPlayer",
            "category": "Media Platforms",
            "subcategory": "Video Players & Streaming",
            "source": "research",
            "note": (
                "DPlayer is a popular open-source web player with danmaku, subtitles, and live support — "
                "commonly evaluated for community / UGC-style embeds."
            ),
        },
        {
            "name": "Qiniu Player (QPlayer)",
            "homepage_url": "https://www.qiniu.com/products/qnplayer",
            "category": "Media Platforms",
            "subcategory": "Video Players & Streaming",
            "source": "research",
            "note": (
                "Qiniu Player (QPlayer / 七牛播放器) has historically been evaluated with Qiniu storage "
                "and CDN for HLS slicing and seek optimization. Confirm current SDK availability before "
                "adoption — Qiniu has marked the dedicated player product as discontinued on its site, "
                "and many teams now pair Qiniu media delivery with TCPlayer, Aliplayer, or an open-source "
                "player."
            ),
        },
    ],
    "kaltura": [
        {
            "name": "Polyv",
            "homepage_url": "https://www.polyv.net/",
            "category": "Media Platforms",
            "subcategory": "Enterprise Video (VOD & Live)",
            "source": "research",
            "note": (
                "Polyv (保利威) is a mainland enterprise video SaaS for livestream and VOD — private "
                "deployment, PlaySafe encryption, AI captions, and education / finance / government "
                "coverage. Closest research fit when the job is enterprise video management plus live "
                "and on-demand delivery."
            ),
        },
        {
            "name": "Haoshitong",
            "homepage_url": "https://www.hst.com/",
            "category": "Communication & Collaboration",
            "subcategory": "Video Conferencing & Collaboration",
            "source": "research",
            "note": (
                "Haoshitong (好视通) covers cloud video conferencing and collaboration with public, "
                "private, and hybrid deployment, national-crypto encryption, and Xinchuang adaptation — "
                "often evaluated for government, SOE, and finance compliance scenarios."
            ),
        },
        {
            "name": "Agora",
            "homepage_url": "https://www.agora.io/",
            "category": "Engagement & Communication",
            "subcategory": "Real-Time Communication (Voice / Video / Chat)",
            "source": "research",
            "note": (
                "Agora (声网) is a real-time audio/video PaaS with mature SDKs and broad global nodes — "
                "common for teams building custom video apps in consumer entertainment and education."
            ),
        },
        {
            "name": "Tencent Cloud TRTC",
            "homepage_url": "https://cloud.tencent.com/product/trtc",
            "category": "Engagement & Communication",
            "subcategory": "Real-Time Communication (Voice / Video / Chat)",
            "source": "research",
            "note": (
                "Tencent Cloud TRTC (腾讯云实时音视频) is a real-time audio/video PaaS with deep WeChat "
                "and mini-program ecosystem hooks — strong for social and ecommerce livestream stacks."
            ),
        },
        {
            "name": "ZEGO",
            "homepage_url": "https://www.zego.im/",
            "category": "Engagement & Communication",
            "subcategory": "Real-Time Communication (Voice / Video / Chat)",
            "source": "research",
            "note": (
                "ZEGO (即构) is a real-time audio/video PaaS with private-deployment options and "
                "ultra-low-latency paths across education, finance, healthcare, and government scenarios."
            ),
        },
    ],
    "middleware": [
        {
            "name": "Alibaba Cloud Observability",
            "homepage_url": "https://www.aliyun.com/product/arms",
            "category": "Release, Quality & Operations",
            "subcategory": "Monitoring & Observability (APM / RUM)",
            "source": "research",
            "note": (
                "Alibaba Cloud Observability (阿里云可观测) bundles Log Service (SLS), Application Real-Time "
                "Monitoring Service (ARMS), and Managed Grafana on Alibaba Cloud infrastructure — strong "
                "ecosystem fit when the mainland stack already runs on Alibaba Cloud."
            ),
        },
        {
            "name": "Tencent Cloud Observability Platform",
            "homepage_url": "https://cloud.tencent.com/product/tcop",
            "category": "Release, Quality & Operations",
            "subcategory": "Monitoring & Observability (APM / RUM)",
            "source": "research",
            "note": (
                "Tencent Cloud Observability Platform (腾讯云可观测平台 / TCOP) provides one-stop metrics, "
                "tracing, logs, and frontend performance monitoring — natural choice when the stack already "
                "runs on Tencent Cloud."
            ),
        },
        {
            "name": "Guance",
            "homepage_url": "https://www.guance.com/",
            "category": "Release, Quality & Operations",
            "subcategory": "Monitoring & Observability (APM / RUM)",
            "source": "research",
            "note": (
                "Guance (观测云) is a leading independent China observability SaaS covering infrastructure, "
                "APM, user experience, and logs, with strong OpenTelemetry support — useful when you want a "
                "cloud-neutral domestic platform rather than a hyperscaler console."
            ),
        },
        {
            "name": "Cloudwise",
            "homepage_url": "https://www.oneapm.com/",
            "category": "Release, Quality & Operations",
            "subcategory": "Monitoring & Observability (APM / RUM)",
            "source": "research",
            "note": (
                "Cloudwise (云智慧), including the OneAPM product line, is a long-standing domestic APM "
                "vendor with end-to-end full-stack monitoring — commonly evaluated for enterprise APM "
                "replacement paths."
            ),
        },
    ],
    "mia platform": [
        {
            "name": "API7",
            "homepage_url": "https://www.apiseven.com/",
            "category": "Developer Platforms & CI/CD",
            "subcategory": "API Management & Gateways",
            "source": "research",
            "note": (
                "API7 (支流科技) is an enterprise API management platform built on Apache APISIX — full "
                "lifecycle API control, multi-protocol conversion, national-crypto (国密) support, and "
                "Xinchuang adaptation. Commonly evaluated for API gateway plus governance workloads."
            ),
        },
        {
            "name": "RestCloud",
            "homepage_url": "https://www.restcloud.cn/",
            "category": "Developer Platforms & CI/CD",
            "subcategory": "API Management & Gateways",
            "source": "research",
            "note": (
                "RestCloud (谷云科技) is a domestically developed API and hybrid-integration platform "
                "supporting REST/SOAP/RPC and high single-cluster throughput, with South China Xinchuang "
                "adaptation certification — useful for API lifecycle and iPaaS-style integration."
            ),
        },
        {
            "name": "CEC Cloud CSP",
            "homepage_url": "https://www.cecloud.com/",
            "category": "Developer Platforms & CI/CD",
            "subcategory": "Microservices Platforms",
            "source": "research",
            "note": (
                "CEC Cloud CSP (中国电子云 CSP) is a one-stop microservice platform supporting Spring Cloud, "
                "Dubbo, and Service Mesh with development, deployment, governance, and observability — often "
                "evaluated for government, finance, and healthcare mainland stacks."
            ),
        },
        {
            "name": "Snowy-Cloud",
            "homepage_url": "https://www.xiaonuo.vip/",
            "category": "Developer Platforms & CI/CD",
            "subcategory": "Microservices Platforms",
            "source": "research",
            "note": (
                "Snowy-Cloud is an open-source Spring Cloud Alibaba microservice rapid-development platform "
                "integrating Nacos and Sentinel, with national-crypto support — a practical path for smaller "
                "teams that need a fast mainland microservice bootstrap."
            ),
        },
        {
            "name": "Kingdee Cloud Cosmic gPaaS",
            "homepage_url": "https://www.kingdee.com/products/cosmic.html",
            "category": "Developer Platforms & CI/CD",
            "subcategory": "Cloud-Native PaaS & DevOps",
            "source": "research",
            "note": (
                "Kingdee Cloud Cosmic gPaaS (金蝶云苍穹) provides containerized deployment, CI/CD pipelines, "
                "middleware management, and full-link monitoring across public, private, and hybrid cloud — "
                "closer to Mia-Platform's broader platform positioning for large groups."
            ),
        },
        {
            "name": "iSoftStone Cloud iPaaS",
            "homepage_url": "https://www.isoftstone.com/",
            "category": "Developer Platforms & CI/CD",
            "subcategory": "Cloud-Native PaaS & DevOps",
            "source": "research",
            "note": (
                "iSoftStone Cloud iPaaS (软通云) offers a cloud-native development framework, low-code "
                "designer, DevOps integration, and API management, with connectors for Alibaba Cloud, "
                "Huawei Cloud, and Tencent Cloud."
            ),
        },
        {
            "name": "Huawei Cloud DevCloud",
            "homepage_url": "https://www.huaweicloud.com/product/devcloud.html",
            "category": "Developer Platforms & CI/CD",
            "subcategory": "Cloud-Native PaaS & DevOps",
            "source": "research",
            "note": (
                "Huawei Cloud DevCloud (华为云 DevCloud) covers the software delivery lifecycle — code "
                "hosting, build, test, deploy, and release operations — a common mainland DevOps PaaS "
                "path when the stack already runs on Huawei Cloud."
            ),
        },
    ],
    "commerce layer": [
        {
            "name": "Wanmi Shangyun",
            "homepage_url": "https://www.wanmi.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Ecommerce Platforms & APIs",
            "source": "research",
            "note": (
                "Wanmi Shangyun (万米商云) SBC AI is an AI headless ecommerce system with private "
                "deployment and source delivery, six intelligent Agents, and coverage across "
                "B2C / B2B / S2B2C / O2O models — commonly cited for 1000+ mid-to-large enterprise "
                "rollouts. Closest China path when you need Commerce Layer-style API-first commerce "
                "with a custom frontend."
            ),
        },
        {
            "name": "Shushangyun",
            "homepage_url": "https://www.shushangyun.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Ecommerce Platforms & APIs",
            "source": "research",
            "note": (
                "Shushangyun (数商云) is a B2B ecommerce platform with headless frontend/backend "
                "separation and microservice centers for products, orders, and payments — strong when "
                "teams need source-code secondary development on a mainland B2B commerce stack."
            ),
        },
        {
            "name": "Youzan",
            "homepage_url": "https://www.youzan.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Ecommerce Platforms & APIs",
            "source": "research",
            "note": (
                "Youzan (有赞) is a leading omnichannel ecommerce SaaS with strong open APIs across "
                "mini programs, H5, and App — a mature ecosystem path for SMBs and brands that need a "
                "fast mainland launch rather than a pure headless commerce engine."
            ),
        },
        {
            "name": "Weimob",
            "homepage_url": "https://www.weimob.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Ecommerce Platforms & APIs",
            "source": "research",
            "note": (
                "Weimob (微盟) is a smart-retail SaaS suite with deep WeChat ecosystem integration — "
                "commonly evaluated for smart retail, dining, and other WeChat-centric vertical "
                "commerce scenarios."
            ),
        },
        {
            "name": "Raycloud",
            "homepage_url": "https://www.raycloud.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Ecommerce Platforms & APIs",
            "source": "research",
            "note": (
                "Raycloud (光云科技) provides ecommerce SaaS tools such as Kuaimai (快麦) and Superboss "
                "(超级店长) with deep Taobao / JD / Pinduoduo ecosystem integration — best for "
                "multi-platform seller operations rather than a Commerce Layer-style headless API backend."
            ),
        },
    ],
    "aweber": [
        {
            "name": "Fengyou EDM",
            "homepage_url": "https://www.fengemail.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Fengyou EDM (蜂邮) is a domestic professional email marketing platform focused on high "
                "deliverability and smart distribution, with an intelligent delivery engine, template "
                "library, and behavior-triggered automation — strongest for mainland China companies that "
                "need local EDM deliverability and Chinese-market workflows."
            ),
        },
        {
            "name": "Zoho Campaigns",
            "homepage_url": "https://www.zoho.com.cn/campaigns/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Zoho Campaigns is an international suite with a dedicated mainland localization team and "
                "Chinese-language support, domain authentication (SPF/DKIM), dedicated IPs/delivery paths, "
                "and full campaign tooling — best for teams that want global product depth plus workable "
                "China localization and compliance coverage."
            ),
        },
    ],
    "altis": [
        {
            "name": "Longfu BMS DXP",
            "homepage_url": "https://www.dragonsoftbravo.com/",
            "category": "Traditional/Enterprise CMS",
            "subcategory": "Digital Experience Platforms",
            "source": "research",
            "note": (
                "Longfu BMS DXP (龙孚 BMS DXP) is an enterprise omnichannel digital experience platform "
                "covering CMS, DAM, marketing automation, AI recommendations, and multi-site / "
                "multi-language management. It supports private deployment and domestic databases such as "
                "Dameng (达梦) and KingbaseES (人大金仓) — the closest functional China substitute for "
                "Altis-class enterprise WordPress / DXP stacks, especially for mid-to-large enterprises "
                "and outbound brands."
            ),
        },
        {
            "name": "PageAdmin",
            "homepage_url": "https://www.pageadmin.net/",
            "category": "Traditional/Enterprise CMS",
            "subcategory": "Content Management Systems",
            "source": "research",
            "note": (
                "PageAdmin is a fifth-generation domestic CMS plus low-code platform with site-cluster "
                "management and Xinchuang compliance fit — strongest for government, education, and "
                "group portal / multi-site deployments."
            ),
        },
        {
            "name": "Baklib",
            "homepage_url": "https://www.baklib.com/",
            "category": "Traditional/Enterprise CMS",
            "subcategory": "Digital Experience Platforms",
            "source": "research",
            "note": (
                "Baklib is a lightweight domestic DXP SaaS for knowledge bases, help centers, and content "
                "portals — practical for SMBs that need a China-hosted content experience cloud rather "
                "than a full Altis-class enterprise stack."
            ),
        },
    ],
    "sendspark": [
        {
            "name": "Dongli Wuxian",
            "homepage_url": "https://www.btoe.cn/",
            "category": "Growth, Content & Experience",
            "subcategory": "Video Marketing & Personalized Outreach",
            "source": "research",
            "note": (
                "Dongli Wuxian (动力无限) focuses on video-matrix distribution, intelligent video "
                "production, and personalized variable insertion for email/SMS — covering video, email, "
                "and SMS multi-channel marketing when video-led personalized outreach is the center of gravity."
            ),
        },
        {
            "name": "U-Mail",
            "homepage_url": "https://www.magvision.com/mail/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "U-Mail is a long-standing domestic email marketing platform with dynamic per-recipient "
                "variables, automation workflows, and strong reported deliverability — practical for "
                "foreign-trade and B2B teams that need China-ready EDM personalization and automation."
            ),
        },
        {
            "name": "Alibaba Cloud Sendify",
            "homepage_url": "https://help.aliyun.com/zh/sendify/product-overview/what-is-sendify",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Alibaba Cloud Sendify is Alibaba one-stop smart email marketing with an AI assistant for "
                "multilingual copy, personalized sends, and A/B testing — best when teams want "
                "Alibaba-stack email marketing with AI-assisted content and personalization."
            ),
        },
    ],
    "streamlit community cloud": [
        {
            "name": "Pyecharts",
            "homepage_url": "https://pyecharts.org/",
            "category": "Developer Platforms & CI/CD",
            "subcategory": "Data Apps & Visualization",
            "source": "research",
            "note": (
                "Pyecharts is a Python wrapper for Baidu ECharts with a mature China ecosystem, 30+ chart "
                "types, and standalone HTML output — strongest for data visualization dashboards and "
                "report-style displays without Streamlit Community Cloud."
            ),
        },
        {
            "name": "NiceGUI",
            "homepage_url": "https://nicegui.io/",
            "category": "Developer Platforms & CI/CD",
            "subcategory": "Data Apps & Visualization",
            "source": "research",
            "note": (
                "NiceGUI is a browser-based Python GUI with little or no frontend code, native ECharts "
                "support, and reactive data binding — the closest Streamlit-like Python-to-web workflow "
                "for China self-hosting when assets stay local."
            ),
        },
        {
            "name": "Dash (Plotly)",
            "homepage_url": "https://dash.plotly.com/",
            "category": "Developer Platforms & CI/CD",
            "subcategory": "Data Apps & Visualization",
            "source": "research",
            "note": (
                "Dash (Plotly) is an open-source Python framework with callbacks and realtime updates that "
                "can be self-hosted on mainland servers — best for enterprise-style data dashboards."
            ),
        },
        {
            "name": "Gradio",
            "homepage_url": "https://www.gradio.app/",
            "category": "Developer Platforms & CI/CD",
            "subcategory": "Data Apps & Visualization",
            "source": "research",
            "note": (
                "Gradio (Hugging Face stack) provides a minimal API for quick ML model demo UIs — strongest "
                "when the Streamlit job is AI / ML model demos rather than full data apps."
            ),
        },
        {
            "name": "Taipy",
            "homepage_url": "https://taipy.io/",
            "category": "Developer Platforms & CI/CD",
            "subcategory": "Data Apps & Visualization",
            "source": "research",
            "note": (
                "Taipy uses a frontend/backend-separated architecture with background-task support — best "
                "for more complex production-style data applications beyond simple Streamlit demos."
            ),
        },
    ],
    "zoho crm": [
        {
            "name": "Fxiaoke",
            "homepage_url": "https://www.fxiaoke.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Marketing Automation & CRM",
            "source": "research",
            "note": (
                "Fxiaoke (纷享销客) has led China CRM market share for multiple years, with strong PaaS "
                "low-code and AI capabilities — best for mid-to-large and group enterprises."
            ),
        },
        {
            "name": "Neocrm",
            "homepage_url": "https://www.xiaoshouyi.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Marketing Automation & CRM",
            "source": "research",
            "note": (
                "Neocrm (销售易) is Tencent-backed, deeply integrated with WeCom, and a multi-year Gartner "
                "Magic Quadrant CRM vendor — strongest for social selling and Tencent-ecosystem teams."
            ),
        },
    ],
    "zenlayer sd wan": [
        {
            "name": "Nova Technology",
            "homepage_url": "https://www.nova.net.cn/",
            "category": "Infrastructure & Edge",
            "subcategory": "Networking & Connectivity",
            "source": "research",
            "note": (
                "Nova Technology (南凌科技) is a China cross-border SD-WAN managed service provider — "
                "commonly the closest domestic counterpart for multi-branch and hybrid-cloud "
                "interconnection when teams want a China-operated SD-WAN path instead of Zenlayer."
            ),
        },
        {
            "name": "Alibaba Cloud CEN + SAG",
            "homepage_url": "https://www.aliyun.com/product/cen",
            "category": "Infrastructure & Edge",
            "subcategory": "Networking & Connectivity",
            "source": "research",
            "note": (
                "Alibaba Cloud Cloud Enterprise Network (CEN) plus Smart Access Gateway (SAG) is the "
                "cloud-native cross-border interconnection path when the China-side stack already runs "
                "on Alibaba Cloud — often the simplest one-hop on-ramp and cross-region / cross-border "
                "link design inside that ecosystem."
            ),
        },
        {
            "name": "Huawei SD-WAN",
            "homepage_url": "https://e.huawei.com/en/solutions/enterprise-network/campus-network/sd-wan",
            "category": "Infrastructure & Edge",
            "subcategory": "Networking & Connectivity",
            "source": "research",
            "note": (
                "Huawei SD-WAN is a fuller enterprise SD-WAN stack for large-scale cross-border private "
                "line and branch interconnection needs — strongest when the organization already "
                "standardizes on Huawei networking and wants a complete high-end ecosystem."
            ),
        },
    ],
    # === BEGIN HUB P0P1 OVERRIDES ===
    "microsoft teams": [
        {
            "name": "DingTalk",
            "homepage_url": "https://www.dingtalk.com/",
            "category": "Collaboration & Productivity",
            "subcategory": "Team Messaging & Meetings",
            "source": "research",
            "note": (
                "DingTalk (钉钉) is Alibaba's mainstream workplace suite for messaging, meetings, "
                "approvals, and org directories — the default China enterprise collaboration path for "
                "many Alibaba-stack and SMB/mid-market teams."
            ),
        },
        {
            "name": "Feishu",
            "homepage_url": "https://www.feishu.cn/",
            "category": "Collaboration & Productivity",
            "subcategory": "Team Messaging & Meetings",
            "source": "research",
            "note": (
                "Feishu / Lark (飞书) is ByteDance's workplace suite with strong docs, meetings, and "
                "project collaboration — often preferred by product/tech teams and companies that "
                "already standardize on the Feishu ecosystem (international brand: Lark)."
            ),
        },
        {
            "name": "WeCom",
            "homepage_url": "https://work.weixin.qq.com/",
            "category": "Collaboration & Productivity",
            "subcategory": "Team Messaging & Meetings",
            "source": "research",
            "note": (
                "WeCom (企业微信 / WeChat Work) is Tencent's workplace messenger tightly linked to "
                "consumer WeChat — strongest when customer contact, external CRM-style chat, and "
                "WeChat ecosystem reach matter more than a Teams-like meeting grid alone."
            ),
        },
        {
            "name": "Tencent Meeting",
            "homepage_url": "https://meeting.tencent.com/",
            "category": "Collaboration & Productivity",
            "subcategory": "Team Messaging & Meetings",
            "source": "research",
            "note": (
                "Tencent Meeting (腾讯会议) is a mainland-first video meeting product for large-scale "
                "calls and webinars — a practical meetings-layer substitute when Teams calls are the "
                "main pain point rather than the full Microsoft 365 suite."
            ),
        },
    ],
    "webex": [
        {
            "name": "Tencent Meeting",
            "homepage_url": "https://meeting.tencent.com/",
            "category": "Collaboration & Productivity",
            "subcategory": "Team Messaging & Meetings",
            "source": "research",
            "note": (
                "Tencent Meeting (腾讯会议) is the closest mainland-first video meeting substitute for "
                "Webex-style calls and webinars, with strong China network performance and consumer/enterprise reach."
            ),
        },
        {
            "name": "DingTalk",
            "homepage_url": "https://www.dingtalk.com/",
            "category": "Collaboration & Productivity",
            "subcategory": "Team Messaging & Meetings",
            "source": "research",
            "note": (
                "DingTalk (钉钉) covers meetings plus workplace messaging and approvals — useful when "
                "Webex was part of a broader collaboration stack, not meetings alone."
            ),
        },
        {
            "name": "Feishu",
            "homepage_url": "https://www.feishu.cn/",
            "category": "Collaboration & Productivity",
            "subcategory": "Team Messaging & Meetings",
            "source": "research",
            "note": (
                "Feishu / Lark (飞书) combines meetings with docs and async collaboration — a strong "
                "fit for product and cross-functional teams replacing Webex + adjacent tooling."
            ),
        },
        {
            "name": "WeCom",
            "homepage_url": "https://work.weixin.qq.com/",
            "category": "Collaboration & Productivity",
            "subcategory": "Team Messaging & Meetings",
            "source": "research",
            "note": (
                "WeCom (企业微信) is the Tencent workplace path when external WeChat customer "
                "conversations matter alongside internal meetings."
            ),
        },
    ],
    "zoom sdk": [
        {
            "name": "Tencent Meeting",
            "homepage_url": "https://meeting.tencent.com/",
            "category": "Collaboration & Productivity",
            "subcategory": "Team Messaging & Meetings",
            "source": "research",
            "note": (
                "Tencent Meeting SDK (腾讯会议 SDK) is a strong mainland embeddable substitute for Zoom "
                "SDK — product-grade UI SDK, 300+ APIs, WeCom / Tencent Docs depth, stable China "
                "networks, and MLPS Level 3–oriented compliance for general office, large meetings, "
                "and government/enterprise use."
            ),
        },
        {
            "name": "Feishu Meeting",
            "homepage_url": "https://www.feishu.cn/product/vc",
            "category": "Collaboration & Productivity",
            "subcategory": "Team Messaging & Meetings",
            "source": "research",
            "note": (
                "Feishu Meeting SDK (飞书会议 SDK) is a strong mainland embeddable substitute when the "
                "product needs Feishu Docs/Base, calendar/tasks linkage, multi-language SDKs, and AI "
                "Agent / CLI automation for agile collaboration workflows."
            ),
        },
    ],
    "docusign": [
        {
            "name": "eSignBao",
            "homepage_url": "https://www.esign.cn/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Electronic Signature",
            "source": "research",
            "note": (
                "eSignBao (e签宝) is a leading mainland electronic-signature and contract platform with "
                "broad enterprise adoption, China CA / evidence-preservation paths, and deep domestic integrations."
            ),
        },
        {
            "name": "Fadada",
            "homepage_url": "https://www.fadada.com/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Electronic Signature",
            "source": "research",
            "note": (
                "Fadada (法大大) is a major China e-contract platform with strong legal/compliance "
                "positioning and judicial evidence workflows — often shortlisted for legally sensitive contracts."
            ),
        },
        {
            "name": "BestSign",
            "homepage_url": "https://www.bestsign.cn/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Electronic Signature",
            "source": "research",
            "note": (
                "BestSign (上上签) is a mainstream China electronic-signature SaaS for standardized "
                "corporate contract flows, APIs, and high-volume signing."
            ),
        },
        {
            "name": "Tencent eSign",
            "homepage_url": "https://qian.tencent.com/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Electronic Signature",
            "source": "research",
            "note": (
                "Tencent eSign (腾讯电子签) is strongest when WeChat / Tencent Cloud identity and "
                "consumer-facing signing touchpoints matter."
            ),
        },
    ],
    "dropbox sign": [
        {
            "name": "eSignBao",
            "homepage_url": "https://www.esign.cn/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Electronic Signature",
            "source": "research",
            "note": (
                "eSignBao (e签宝) is the primary mainland electronic-signature substitute for Dropbox "
                "Sign (HelloSign)-style workflows with China-legal signing and evidence preservation."
            ),
        },
        {
            "name": "Fadada",
            "homepage_url": "https://www.fadada.com/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Electronic Signature",
            "source": "research",
            "note": (
                "Fadada (法大大) is a strong legal/compliance-oriented e-contract platform for mainland "
                "signers who need China court-friendly evidence packages."
            ),
        },
        {
            "name": "BestSign",
            "homepage_url": "https://www.bestsign.cn/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Electronic Signature",
            "source": "research",
            "note": (
                "BestSign (上上签) fits SMB-to-enterprise SaaS signing when teams want a simpler "
                "Dropbox Sign-like contract workflow onshore."
            ),
        },
        {
            "name": "Tencent eSign",
            "homepage_url": "https://qian.tencent.com/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Electronic Signature",
            "source": "research",
            "note": (
                "Tencent eSign (腾讯电子签) is useful when signing must happen inside WeChat-centric "
                "consumer or employee journeys."
            ),
        },
    ],
    "adobe acrobat sign": [
        {
            "name": "eSignBao",
            "homepage_url": "https://www.esign.cn/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Electronic Signature",
            "source": "research",
            "note": (
                "eSignBao (e签宝) is the leading China electronic-signature platform commonly evaluated "
                "instead of Adobe Acrobat Sign for mainland legal contracts."
            ),
        },
        {
            "name": "Fadada",
            "homepage_url": "https://www.fadada.com/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Electronic Signature",
            "source": "research",
            "note": (
                "Fadada (法大大) emphasizes legal evidence and compliance workflows for enterprise "
                "and government-adjacent contract signing in mainland China."
            ),
        },
        {
            "name": "BestSign",
            "homepage_url": "https://www.bestsign.cn/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Electronic Signature",
            "source": "research",
            "note": (
                "BestSign (上上签) is a practical Adobe Acrobat Sign substitute for high-volume "
                "SaaS contract signing with domestic APIs and CA options."
            ),
        },
        {
            "name": "Tencent eSign",
            "homepage_url": "https://qian.tencent.com/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Electronic Signature",
            "source": "research",
            "note": (
                "Tencent eSign (腾讯电子签) fits Adobe Sign replacements that need WeChat identity "
                "and Tencent ecosystem distribution."
            ),
        },
    ],
    "qualtrics": [
        {
            "name": "WJX",
            "homepage_url": "https://www.wjx.cn/",
            "category": "Growth, Content & Experience",
            "subcategory": "Surveys & Forms",
            "source": "research",
            "note": (
                "WJX (问卷星) is China's most widely used survey/questionnaire platform for market "
                "research, NPS-style feedback, and operational forms — the default Qualtrics substitute for most teams."
            ),
        },
        {
            "name": "Jinshuju",
            "homepage_url": "https://jinshuju.net/",
            "category": "Growth, Content & Experience",
            "subcategory": "Surveys & Forms",
            "source": "research",
            "note": (
                "Jinshuju (金数据) is a form/survey builder popular with product and operations teams "
                "that need cleaner UX and workflow integrations than basic questionnaire tools."
            ),
        },
        {
            "name": "Tencent Questionnaire",
            "homepage_url": "https://wj.qq.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Surveys & Forms",
            "source": "research",
            "note": (
                "Tencent Questionnaire (腾讯问卷) is a practical free/low-friction survey path inside "
                "the Tencent ecosystem for lightweight research and internal polls."
            ),
        },
        {
            "name": "Credamo",
            "homepage_url": "https://www.credamo.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Surveys & Forms",
            "source": "research",
            "note": (
                "Credamo (见数) is oriented to research-grade surveys and academic/enterprise research "
                "panels — closer to Qualtrics when methodology rigor matters more than simple forms."
            ),
        },
    ],
    "surveymonkey": [
        {
            "name": "WJX",
            "homepage_url": "https://www.wjx.cn/",
            "category": "Growth, Content & Experience",
            "subcategory": "Surveys & Forms",
            "source": "research",
            "note": (
                "WJX (问卷星) is the mainstream SurveyMonkey substitute in mainland China for "
                "questionnaires, exams, and customer feedback at scale."
            ),
        },
        {
            "name": "Jinshuju",
            "homepage_url": "https://jinshuju.net/",
            "category": "Growth, Content & Experience",
            "subcategory": "Surveys & Forms",
            "source": "research",
            "note": (
                "Jinshuju (金数据) fits teams that want SurveyMonkey-like forms with stronger "
                "China-product UX and automation hooks."
            ),
        },
        {
            "name": "Tencent Questionnaire",
            "homepage_url": "https://wj.qq.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Surveys & Forms",
            "source": "research",
            "note": (
                "Tencent Questionnaire (腾讯问卷) is a lightweight free survey option for internal "
                "and consumer research inside WeChat/QQ ecosystems."
            ),
        },
    ],
    "typeform": [
        {
            "name": "Jinshuju",
            "homepage_url": "https://jinshuju.net/",
            "category": "Growth, Content & Experience",
            "subcategory": "Surveys & Forms",
            "source": "research",
            "note": (
                "Jinshuju (金数据) is the closest UX-oriented Typeform-style forms platform commonly "
                "used in mainland China for polished intake flows and operational forms."
            ),
        },
        {
            "name": "WJX",
            "homepage_url": "https://www.wjx.cn/",
            "category": "Growth, Content & Experience",
            "subcategory": "Surveys & Forms",
            "source": "research",
            "note": (
                "WJX (问卷星) covers high-volume surveys and quizzes when Typeform was mainly used "
                "for research collection rather than branded conversational UX."
            ),
        },
        {
            "name": "Tencent Questionnaire",
            "homepage_url": "https://wj.qq.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Surveys & Forms",
            "source": "research",
            "note": (
                "Tencent Questionnaire (腾讯问卷) is a simple free path for lightweight Typeform-like "
                "intake when budget and WeChat distribution dominate."
            ),
        },
    ],
    "wordpress": [
        {
            "name": "Self-hosted WordPress on China cloud",
            "homepage_url": "https://www.aliyun.com/product/swas",
            "category": "Growth, Content & Experience",
            "subcategory": "CMS & Website Building",
            "source": "research",
            "note": (
                "Self-hosted WordPress on Alibaba Cloud, Tencent Cloud, or similar mainland hosting "
                "with ICP filing is often the most direct path — WordPress software itself is not "
                "blocked, but overseas WordPress.com / plugin CDN paths are unreliable."
            ),
        },
        {
            "name": "PageAdmin",
            "homepage_url": "https://www.pageadmin.net/",
            "category": "Growth, Content & Experience",
            "subcategory": "CMS & Website Building",
            "source": "research",
            "note": (
                "PageAdmin is a domestic CMS commonly used for government, education, and Xinchuang "
                "site clusters when WordPress plugin ecosystems and overseas updates are a liability."
            ),
        },
        {
            "name": "Baklib",
            "homepage_url": "https://www.baklib.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "CMS & Website Building",
            "source": "research",
            "note": (
                "Baklib is a China SaaS knowledge-base / help-center / content-portal path for teams "
                "that used WordPress mainly for docs portals rather than marketing sites."
            ),
        },
    ],
    "gumroad": [
        {
            "name": "Youzan Cloud",
            "homepage_url": "https://www.youzan.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Ecommerce & Creator Commerce",
            "source": "research",
            "note": (
                "Youzan Cloud (有赞) is a mainland commerce stack for digital and physical products "
                "with WeChat Mini Program storefronts — a common Gumroad substitute for creator/SMB selling in China."
            ),
        },
        {
            "name": "Afdian",
            "homepage_url": "https://afdian.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Ecommerce & Creator Commerce",
            "source": "research",
            "note": (
                "Afdian (爱发电) is a China creator patronage / digital-goods platform closer to "
                "Gumroad for memberships, tips, and digital downloads aimed at Chinese audiences."
            ),
        },
        {
            "name": "WeChat Mini Program Store",
            "homepage_url": "https://mp.weixin.qq.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "Ecommerce & Creator Commerce",
            "source": "research",
            "note": (
                "WeChat Mini Program commerce is often the real distribution surface for creator "
                "products in mainland China — use native Mini Program store capabilities or a Youzan-built storefront."
            ),
        },
    ],
    "n8n": [
        {
            "name": "Jijyun",
            "homepage_url": "https://www.jijyun.cn/",
            "category": "Developer Tools & Platforms",
            "subcategory": "Automation & Integration",
            "source": "research",
            "note": (
                "Jijyun (集简云) is a China iPaaS / automation platform commonly evaluated as an "
                "n8n or Zapier-style connector hub for domestic SaaS integrations."
            ),
        },
        {
            "name": "Jiandaoyun",
            "homepage_url": "https://www.jiandaoyun.com/",
            "category": "Developer Tools & Platforms",
            "subcategory": "Automation & Integration",
            "source": "research",
            "note": (
                "Jiandaoyun (简道云) is a low-code platform with automation and approvals — strong "
                "when n8n was used to glue internal forms, CRM, and ops workflows."
            ),
        },
        {
            "name": "DingTalk Yida",
            "homepage_url": "https://www.aliwork.com/",
            "category": "Developer Tools & Platforms",
            "subcategory": "Automation & Integration",
            "source": "research",
            "note": (
                "DingTalk Yida (宜搭) is Alibaba's low-code automation layer inside DingTalk — best "
                "when the organization already runs on DingTalk and needs workflow automation onshore."
            ),
        },
        {
            "name": "Qingflow",
            "homepage_url": "https://www.qingflow.com/",
            "category": "Developer Tools & Platforms",
            "subcategory": "Automation & Integration",
            "source": "research",
            "note": (
                "Qingflow (轻流) is a China no-code/low-code workflow builder for operational "
                "automation when teams want less DIY than self-hosted n8n."
            ),
        },
    ],
    "hubspot": [
        {
            "name": "Fxiaoke",
            "homepage_url": "https://www.fxiaoke.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "CRM & Marketing Automation",
            "source": "research",
            "note": (
                "Fxiaoke (纷享销客) is a leading China CRM / sales-engagement suite commonly "
                "evaluated instead of HubSpot for mainland go-to-market teams."
            ),
        },
        {
            "name": "Neocrm",
            "homepage_url": "https://www.xiaoshouyi.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "CRM & Marketing Automation",
            "source": "research",
            "note": (
                "Neocrm / Xiaoshouyi (销售易) is an enterprise CRM path with strong sales cloud "
                "depth for mid-to-large China GTM organizations."
            ),
        },
        {
            "name": "Zhichi",
            "homepage_url": "https://www.zhichi.com/",
            "category": "Growth, Content & Experience",
            "subcategory": "CRM & Marketing Automation",
            "source": "research",
            "note": (
                "Zhichi (智齿科技) covers customer engagement / service cloud use cases that often "
                "sit beside HubSpot Service Hub for China-facing support."
            ),
        },
    ],
    "mailchimp": [
        {
            "name": "SendCloud",
            "homepage_url": "https://www.sendcloud.net/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "SendCloud is a long-standing domestic email delivery and marketing provider with "
                "strong API coverage — a practical Mailchimp substitute for technical teams."
            ),
        },
        {
            "name": "U-Mail",
            "homepage_url": "https://www.magvision.com/mail/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "U-Mail is a domestic email marketing platform with automation and domestic plus "
                "international delivery channels for campaigns that Mailchimp cannot reliably deliver in China."
            ),
        },
        {
            "name": "Alibaba Cloud DirectMail",
            "homepage_url": "https://www.aliyun.com/product/directmail",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Alibaba Cloud DirectMail is transactional/marketing email infrastructure on Alibaba "
                "Cloud when Mailchimp was mainly an SMTP / trigger-mail dependency."
            ),
        },
        {
            "name": "Zoho Campaigns",
            "homepage_url": "https://www.zoho.com.cn/campaigns/",
            "category": "Growth, Content & Experience",
            "subcategory": "Email Marketing & EDM",
            "source": "research",
            "note": (
                "Zoho Campaigns offers a more full-featured email marketing suite with China local "
                "presence — useful when teams want Mailchimp-like campaigns with onshore operations."
            ),
        },
    ],
    "github pages": [
        {
            "name": "Alibaba Cloud Static Website Hosting",
            "homepage_url": "https://help.aliyun.com/document_detail/31872.html",
            "category": "Infrastructure & Edge",
            "subcategory": "Static Hosting & CDN",
            "source": "research",
            "note": (
                "Alibaba Cloud OSS static website hosting plus China CDN is a common GitHub Pages "
                "replacement for docs and marketing sites that must load reliably in mainland China."
            ),
        },
        {
            "name": "Tencent Cloud Static Website Hosting",
            "homepage_url": "https://cloud.tencent.com/product/cos",
            "category": "Infrastructure & Edge",
            "subcategory": "Static Hosting & CDN",
            "source": "research",
            "note": (
                "Tencent Cloud COS static website hosting with China CDN is the Tencent-stack "
                "equivalent path for GitHub Pages-style static sites."
            ),
        },
        {
            "name": "Gitee Pages",
            "homepage_url": "https://gitee.com/help/articles/4136",
            "category": "Infrastructure & Edge",
            "subcategory": "Static Hosting & CDN",
            "source": "research",
            "note": (
                "Gitee Pages is a domestic Git-hosted pages product closer to the GitHub Pages "
                "developer workflow for China-based repos (confirm current product availability and ICP needs)."
            ),
        },
    ],
    "google authenticator": [
        {
            "name": "Microsoft Authenticator",
            "homepage_url": "https://www.microsoft.com/en-us/security/mobile-authenticator-app",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Multi-factor Authentication",
            "source": "research",
            "note": (
                "Microsoft Authenticator is often reachable as a TOTP app alternative when Google "
                "Authenticator distribution or Play Store access is the blocker — still validate mainland app-store availability for your users."
            ),
        },
        {
            "name": "Authing MFA",
            "homepage_url": "https://www.authing.cn/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Multi-factor Authentication",
            "source": "research",
            "note": (
                "Authing provides China-oriented identity and MFA for product login stacks that need "
                "onshore IdP controls beyond a consumer authenticator app."
            ),
        },
        {
            "name": "WeChat Login",
            "homepage_url": "https://open.weixin.qq.com/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Multi-factor Authentication",
            "source": "research",
            "note": (
                "For China consumer apps, WeChat Login plus SMS OTP often replaces Google "
                "Authenticator-centric MFA patterns entirely."
            ),
        },
    ],
    "microsoft authenticator": [
        {
            "name": "Authing MFA",
            "homepage_url": "https://www.authing.cn/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Multi-factor Authentication",
            "source": "research",
            "note": (
                "Authing MFA is a China identity platform path when Microsoft Authenticator cannot "
                "be the default second factor for mainland user populations."
            ),
        },
        {
            "name": "WeChat Login",
            "homepage_url": "https://open.weixin.qq.com/",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Multi-factor Authentication",
            "source": "research",
            "note": (
                "WeChat Login with SMS OTP is the mainstream consumer authentication pattern in "
                "mainland China when authenticator-app MFA has poor coverage."
            ),
        },
        {
            "name": "Alibaba Cloud MFA",
            "homepage_url": "https://www.aliyun.com/product/ram",
            "category": "Trust, Identity & Compliance",
            "subcategory": "Multi-factor Authentication",
            "source": "research",
            "note": (
                "Alibaba Cloud RAM MFA covers cloud-console and workforce second-factor needs inside "
                "Alibaba Cloud accounts as a Microsoft Authenticator operational substitute."
            ),
        },
    ],
    # === END HUB P0P1 OVERRIDES ===

}

# Force mainland China availability labels when research revises the catalog entry.
AVAILABILITY_OVERRIDES = {
    "zoho crm": "Available",
    "amazon cloudwatch": "Available",
    "azure monitor": "Available",
    "zenlayer sd wan": "Available",
    "visual studio app center": "Unavailable",
    "firebase app distribution": "Limited",
    "firebase crashlytics": "Unavailable",
    "klaviyo": "Limited",
    "bitly": "Unavailable",
    "altis": "Unavailable",
    "facebook login": "Unavailable",
    "google maps platform": "Unavailable",
    "apple mapkit": "Available",
    "aws": "Limited",
    "logrocket": "Limited",

    # === BEGIN HUB P0P1 OVERRIDES ===
    "microsoft teams": "Limited",
    "webex": "Limited",
    "zoom sdk": "Unavailable",
    "docusign": "Unavailable",
    "dropbox sign": "Unavailable",
    "adobe acrobat sign": "Unavailable",
    "qualtrics": "Limited",
    "surveymonkey": "Limited",
    "typeform": "Limited",
    "wordpress": "Limited",
    "gumroad": "Unavailable",
    "n8n": "Limited",
    "hubspot": "Limited",
    "mailchimp": "Limited",
    "github pages": "Limited",
    "google authenticator": "Limited",
    "microsoft authenticator": "Limited",
    # === END HUB P0P1 OVERRIDES ===

}

# Optional display-name polish when the seed catalog spelling differs from brand form.
NAME_OVERRIDES = {
    "zenlayer sd wan": "Zenlayer SD-WAN",
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
    # === BEGIN HUB P0P1 OVERRIDES ===
    "microsoft teams": (
        "Microsoft Teams is Limited in mainland China: the service is often reachable for "
        "international firms, but latency, call quality, and China-workplace ecosystem fit are "
        "weak versus DingTalk, Feishu/Lark, WeCom, and Tencent Meeting. Prefer those domestic "
        "suites for mainland-first collaboration. These appear on the alternatives page only — "
        "not as Explore / Landscape product tiles. Confirm network performance and compliance "
        "before production adoption."
    ),
    "webex": (
        "Webex is Limited in mainland China: meetings may connect, but day-to-day reliability and "
        "China collaboration-ecosystem fit lag Tencent Meeting, DingTalk, Feishu, and WeCom. Prefer "
        "those options for mainland-facing teams. These appear on the alternatives page only — not "
        "as Explore / Landscape product tiles. Confirm call quality and compliance before adoption."
    ),
    "zoom sdk": (
        "Zoom SDK is Unavailable (or extremely unstable) in mainland China: Zoom has stopped offering "
        "direct mainland service, and cross-border network limits plus no China data-center path create "
        "severe connectivity blocks and compliance risk. Prefer Tencent Meeting SDK for general office, "
        "large meetings, government/enterprise compliance, or WeCom ecosystems; prefer Feishu Meeting "
        "SDK for agile collaboration, knowledge/task workflows, and AI Agent automation. These appear "
        "on the alternatives page only — not as Explore / Landscape product tiles. Confirm SDK quality "
        "and compliance before production adoption."
    ),
    "docusign": (
        "DocuSign is Unavailable for practical mainland China legal e-signature workflows: overseas "
        "SaaS signing rarely matches China Electronic Signature Law evidence expectations, CA "
        "practices, and mainland signer UX. Prefer eSignBao (e签宝), Fadada (法大大), BestSign "
        "(上上签), or Tencent eSign. These appear on the alternatives page only — not as Explore / "
        "Landscape product tiles. Confirm legal counsel review before production adoption."
    ),
    "dropbox sign": (
        "Dropbox Sign (HelloSign) is Unavailable for practical mainland China legal e-signature "
        "workflows. Prefer eSignBao (e签宝), Fadada (法大大), BestSign (上上签), or Tencent eSign "
        "for onshore signing and evidence preservation. These appear on the alternatives page only — "
        "not as Explore / Landscape product tiles. Confirm legal fit before production adoption."
    ),
    "adobe acrobat sign": (
        "Adobe Acrobat Sign is Unavailable for practical mainland China legal e-signature workflows. "
        "Prefer eSignBao (e签宝), Fadada (法大大), BestSign (上上签), or Tencent eSign. These appear "
        "on the alternatives page only — not as Explore / Landscape product tiles. Confirm legal "
        "counsel review before production adoption."
    ),
    "qualtrics": (
        "Qualtrics is Limited in mainland China: the overseas XM platform may be reachable for some "
        "enterprises, but research operations usually move to WJX (问卷星), Jinshuju (金数据), "
        "Tencent Questionnaire, or Credamo (见数). These appear on the alternatives page only — not "
        "as Explore / Landscape product tiles. Confirm PIPL consent and panel quality before adoption."
    ),
    "surveymonkey": (
        "SurveyMonkey is Limited in mainland China for production research stacks. Prefer WJX "
        "(问卷星), Jinshuju (金数据), or Tencent Questionnaire. These appear on the alternatives "
        "page only — not as Explore / Landscape product tiles. Confirm consent and deliverability "
        "into China audiences before adoption."
    ),
    "typeform": (
        "Typeform is Limited in mainland China: polished overseas forms are often slow or poorly "
        "adopted versus Jinshuju (金数据), WJX (问卷星), and Tencent Questionnaire. These appear on "
        "the alternatives page only — not as Explore / Landscape product tiles. Confirm UX and PIPL "
        "fit before production adoption."
    ),
    "wordpress": (
        "WordPress is Limited for mainland China production sites when teams rely on WordPress.com "
        "or overseas plugin/theme CDNs: those paths are slow or unreliable. Self-hosted WordPress on "
        "China cloud with ICP filing can work; otherwise evaluate PageAdmin or Baklib for domestic "
        "CMS needs. These appear on the alternatives page only — not as Explore / Landscape product "
        "tiles. Confirm ICP, hosting, and plugin update paths before adoption."
    ),
    "gumroad": (
        "Gumroad is Unavailable for practical mainland China creator commerce: payments, audience "
        "distribution, and WeChat-centric buying journeys do not map cleanly. Prefer Youzan Cloud "
        "(有赞), Afdian (爱发电), or WeChat Mini Program storefronts. These appear on the "
        "alternatives page only — not as Explore / Landscape product tiles. Confirm payments and "
        "content compliance before adoption."
    ),
    "n8n": (
        "n8n is Limited in mainland China: self-hosting can work on China infrastructure, but "
        "n8n Cloud and many global SaaS connectors are a weak fit. Prefer Jijyun (集简云), "
        "Jiandaoyun (简道云), DingTalk Yida (宜搭), or Qingflow (轻流) for onshore automation. "
        "These appear on the alternatives page only — not as Explore / Landscape product tiles. "
        "Confirm connector coverage and data residency before adoption."
    ),
    "hubspot": (
        "HubSpot is Limited in mainland China: the overseas CRM/marketing hub is usually reachable "
        "for international teams, but China GTM usually needs Fxiaoke (纷享销客), Neocrm (销售易), "
        "or adjacent service clouds such as Zhichi. These appear on the alternatives page only — "
        "not as Explore / Landscape product tiles. Confirm WeCom integrations and PIPL before adoption."
    ),
    "mailchimp": (
        "Mailchimp is Limited in mainland China: admin access may work, but deliverability into QQ/"
        "163 and similar domestic inboxes is poor. Prefer SendCloud, U-Mail, Alibaba Cloud "
        "DirectMail, or Zoho Campaigns. These appear on the alternatives page only — not as Explore "
        "/ Landscape product tiles. Confirm deliverability before production adoption."
    ),
    "github pages": (
        "GitHub Pages is Limited for mainland China audiences: GitHub/jsDelivr and related overseas "
        "static paths are often slow or intermittently unreachable. Prefer Alibaba Cloud or Tencent "
        "Cloud static hosting with China CDN, or Gitee Pages for a git-pages workflow. These appear "
        "on the alternatives page only — not as Explore / Landscape product tiles. Confirm ICP "
        "filing needs before public launch."
    ),
    "google authenticator": (
        "Google Authenticator is Limited as a default MFA path for mainland China user bases: Play "
        "Store distribution and Google account assumptions break for many users. Prefer China IdP MFA "
        "(for example Authing), WeChat Login + SMS OTP for consumers, or alternate TOTP apps where "
        "needed. These appear on the alternatives page only — not as Explore / Landscape product "
        "tiles. Confirm app-store coverage before mandating authenticator MFA."
    ),
    "microsoft authenticator": (
        "Microsoft Authenticator is Limited as a universal MFA default in mainland China. Prefer "
        "Authing MFA, WeChat Login + SMS OTP for consumers, or cloud-RAM MFA for Alibaba Cloud "
        "workforce accounts. These appear on the alternatives page only — not as Explore / Landscape "
        "product tiles. Confirm device distribution before mandating the app."
    ),
    # === END HUB P0P1 OVERRIDES ===
    "visual studio app center": (
        "Visual Studio App Center is Unavailable for mainland China: Microsoft retired App Center "
        "on March 31, 2025, and Analytics / Diagnostics ended June 30, 2026. Even before retirement, "
        "mainland use was poor because data and processing stayed in the United States, Microsoft "
        "warned that China Analytics/Diagnostics SDK data could be delayed or fail to publish, and "
        "build/distribution access was often unstable. Prefer Alibaba Cloud Yunxiao and Tencent "
        "Cloud DevOps (CODING) for China CI/CD and mobile-release workflows; replace crash analytics, "
        "beta distribution, and hot update by module as needed. Confirm fit before production adoption."
    ),
    "firebase app distribution": (
        "Firebase App Distribution is Limited in mainland China: the console and download path often "
        "suffer unstable access and high latency, so day-to-day beta sharing is unreliable for "
        "mainland teams. Prefer Pgyer (蒲公英) and Tencent Bugly as the most mature domestic beta "
        "distribution platforms; evaluate Fir.im when bug-tracker linkage matters, Xia Fenfa (虾分发) "
        "for CDN-backed dual-platform sharing with access controls, and Gulu Fenfa (咕噜分发) for "
        "broader lifecycle distribution. Pair iOS coverage with TestFlight when needed. These appear "
        "on the alternatives page only — not as Explore / Landscape product tiles. Confirm platform "
        "coverage, tester access model, and compliance before production adoption."
    ),
    "firebase crashlytics": (
        "Firebase Crashlytics is Unavailable for mainland China users: Firebase servers are not in "
        "mainland China, core Firebase services are blocked on domestic networks, and most mainland "
        "devices lack Google Mobile Services (GMS), so crash collection is unstable or fails. For "
        "dual-platform iOS and Android apps targeting mainland China, prefer Tencent Bugly for a "
        "unified cross-platform view with AI-assisted attribution and privacy-compliance controls; "
        "evaluate Umeng+ (友盟+) for the fastest compliant onboarding, and Alibaba Cloud EMAS when "
        "the stack is already on Alibaba Cloud. These appear on the alternatives page only — Bugly "
        "and Umeng+ are not added as Explore / Landscape product tiles from this rewrite. Confirm "
        "SDK fit, consent, and alerting before production adoption."
    ),
    "amazon cloudwatch": (
        "Amazon CloudWatch is Available in AWS China, but the China-region product set is more "
        "limited than global CloudWatch. When teams need a fuller mainland China monitoring stack, "
        "evaluate Alibaba Cloud CloudMonitor and Tencent Cloud Observability Platform (TCOP). These "
        "appear on the alternatives page only — not as Explore / Landscape product tiles. Confirm "
        "feature fit, alerting, and operating constraints before production adoption."
    ),
    "azure monitor": (
        "Azure Monitor is Available in Azure China, but the China-region product set is more "
        "limited than global Azure Monitor. When teams need a fuller mainland China monitoring stack, "
        "evaluate Alibaba Cloud CloudMonitor and Tencent Cloud Observability Platform (TCOP). These "
        "appear on the alternatives page only — not as Explore / Landscape product tiles. Confirm "
        "feature fit, alerting, and operating constraints before production adoption."
    ),
    "altis": (
        "Altis is Unavailable for practical mainland China use: BuiltWith-style adoption in China is "
        "negligible (on the order of about two sites), the stack depends on overseas AWS "
        "infrastructure with high latency and weak stability, WordPress.org plus plugin/theme "
        "repositories are long blocked or unreliable from mainland China so updates and sync break, "
        "and enterprise data stored outside China conflicts with domestic compliance expectations "
        "(for example MLPS and data localization). Prefer Longfu BMS DXP (龙孚 BMS DXP) as the "
        "closest CMS + DAM + marketing automation + AI recommendation + multi-site substitute with "
        "private deployment and Dameng / KingbaseES support; prefer PageAdmin for government, "
        "education, and Xinchuang site clusters; prefer Baklib for lightweight SMB knowledge-base / "
        "help-center / content-portal SaaS. These appear on the alternatives page only — not as "
        "Explore / Landscape product tiles. Confirm private-deployment fit, compliance, and vendor "
        "fit before production adoption."
    ),
    "bitly": (
        "Bitly is Unavailable for practical mainland China use: the bit.ly domain is blocked by the "
        "GFW, so access and redirects routinely fail; even when a page occasionally loads, overseas "
        "hosting causes high latency and unstable jumps that cannot support real promotion workloads. "
        "Prefer Aifabu (爱短链) or Xiaoma Short Link (小码短链接) for individuals and small teams; "
        "prefer Suowo (缩我) or 3WT (三维推) for enterprise / batch needs; prefer 3WT when WeChat "
        "card-style short links matter most. These appear on the alternatives page only — not as "
        "Explore / Landscape product tiles. Confirm redirect stability, anti-block fit, analytics, "
        "and compliance before production adoption."
    ),
    "drip": (
        "Drip is Limited in mainland China: the US-hosted SaaS is usually reachable and not clearly "
        "blocked, but access speed and stability are unreliable. Deeper misfit comes from ecosystem and "
        "operations — Drip is built around Shopify, WooCommerce, and BigCommerce workflows that barely "
        "exist in mainland ecommerce, with English-only UI, no Chinese support, and USD billing. Prefer "
        "Dida EDM (滴答EDM) as the closest substitute for overseas DTC / independent-site lifecycle "
        "email; prefer U-Mail or Shierke (十二客) for domestic email marketing; evaluate Reasonable "
        "Spread (思齐) when Chinese admin and local support matter most. These appear on the "
        "alternatives page only — not as Explore / Landscape product tiles. Confirm deliverability and "
        "compliance before production adoption."
    ),
    "klaviyo": (
        "Klaviyo is Limited in mainland China: the overseas SaaS is reachable and usable, but there is "
        "no China-region hosting or localization, mainland access can be slow or unstable, the Shopify "
        "app is not translated into Simplified Chinese, deliverability into QQ / 163 and similar "
        "domestic inboxes is weak, and payment typically needs a foreign-currency card. Prefer Dida EDM "
        "(滴答EDM) for China Shopify / independent-site sellers closest to Klaviyo; prefer Zoho "
        "Campaigns for domestic-audience or foreign-trade / B2B email; evaluate Omnisend or Brevo on "
        "budget-constrained free tiers, and MailerLite for lightweight early-stage lists. These appear "
        "on the alternatives page only — not as Explore / Landscape product tiles. Confirm "
        "deliverability and compliance before production adoption."
    ),
    "mailerlite": (
        "MailerLite is Unavailable for practical mainland China use: overseas hosting makes the admin "
        "slow and unreliable, cross-border sends into domestic inboxes (QQ, 163, and similar) are "
        "frequently filtered or spam-foldered, and there is no Chinese support, domestic payment path, "
        "or China compliance fit. Prefer Alibaba Cloud Sendify for lightweight Alibaba-stack email "
        "marketing, U-Mail for professional deliverability and automation, and TurboEx (拓波) for "
        "government/enterprise security and Xinchuang fit. These appear on the alternatives page only — "
        "not as Explore / Landscape product tiles. Confirm deliverability and compliance before "
        "production adoption."
    ),
    "bootstrapcdn": (
        "BootstrapCDN is Limited for mainland China production stacks: overseas library CDN endpoints "
        "are often slow or unreliable for China-facing sites. For production, Chinaready provisions "
        "customer-specific secure domestic Bootstrap hosting on demand, or teams self-host Bootstrap "
        "assets on a China CDN. For testing and validation, prefer Staticfile CDN (staticfile.net) and "
        "BootCDN (bootcdn.cn). These appear on the alternatives page only — not as Explore / Landscape "
        "product tiles. Confirm latency, HTTPS, version pinning, and compliance before production "
        "adoption."
    ),
    "facebook login": (
        "Facebook Login is Unavailable for mainland China production stacks. China's mainstream "
        "third-party login paths are WeChat Login, QQ Login, Weibo Login, Alipay Login, and SMS Login "
        "(phone OTP). Prefer WeChat Login as the default consumer social login and SMS Login as the "
        "baseline real-name / passwordless path; add QQ, Weibo, or Alipay Login for specific audiences "
        "or verticals. QQ Login, Weibo Login, Alipay Login, and SMS Login appear on the alternatives "
        "page as orientation options — not as Explore / Landscape product tiles from this research. "
        "Confirm developer qualification, scopes, and compliance before production adoption."
    ),
    "google maps platform": (
        "Google Maps is Unavailable in mainland China. Prefer Amap (高德地图) or Baidu Maps for daily "
        "driving and navigation, Baidu Maps for mall / indoor navigation, Tencent Maps when WeChat "
        "sharing and travel storytelling matter, and Apple Maps for iPhone users who want a clean "
        "English UI (mainland Apple Maps data is licensed from Amap). Consumer apps are free for end "
        "users; App developers embedding maps typically pay usage-based API fees. Baidu Maps, Tencent "
        "Maps, and Apple Maps appear on the alternatives page as orientation options — not as Explore "
        "/ Landscape product tiles from this research. Confirm product and API fit before production "
        "adoption."
    ),
    "apple mapkit": (
        "Apple MapKit is Available in mainland China: it is a system framework on Apple platforms, and "
        "mainland Apple Maps base data is licensed from Amap. Even so, teams often still evaluate Amap "
        "for mobility / logistics / driving, Baidu Maps for local lifestyle and indoor navigation, and "
        "Tencent Maps when WeChat sharing or Mini Program integration matters — especially for richer "
        "POI depth, advanced navigation features, or Android / cross-platform builds. Watch coordinate "
        "systems (WGS-84 vs GCJ-02 vs BD-09). Baidu Maps and Tencent Maps appear on the alternatives "
        "page as orientation options — not as Explore / Landscape product tiles from this research. "
        "Confirm product and SDK fit before production adoption."
    ),
    "activecampaign": (
        "ActiveCampaign is Limited in mainland China: the product is usually reachable, but marketing "
        "sends face extremely high interception risk into domestic inboxes (spam folder or outright "
        "rejection). Overseas sending IPs have weak reputation with QQ, NetEase, and similar free "
        "mail providers, and overseas ESPs rarely match mainland SPF/DKIM/DMARC and anti-spam "
        "expectations. Prefer Zoho Campaigns or SendCloud for China-audience email marketing with "
        "dedicated domestic delivery channels. These appear on the alternatives page only — not as "
        "Explore / Landscape product tiles. Confirm deliverability and compliance before production "
        "adoption."
    ),
    "logrocket": (
        "LogRocket is Limited in mainland China: availability is poor enough that day-to-day "
        "experience is significantly affected. Overseas cloud storage and global CDN paths are "
        "easily disrupted from mainland networks, which can cause slow access, data loss, or "
        "incomplete session recordings; processing user-interaction data for China also raises "
        "ICP filing and related compliance requirements. Prefer Sensors Data (神策数据) for "
        "private-deployment product analytics in data-sensitive industries, GrowingIO for "
        "no-code / autocapture multi-end collection, and Umeng+ (友盟+) U-App for mobile funnel "
        "and stability monitoring. Confirm consent, PIPL, and event taxonomy before production "
        "adoption."
    ),
    "aweber": (
        "AWeber is Unavailable for practical mainland China use: cross-border experience is poor, and "
        "Chinaready does not recommend domestic China companies adopt it directly. Prefer Fengyou EDM "
        "(蜂邮) for domestic professional email marketing with local deliverability focus, and Zoho "
        "Campaigns for an international suite with mainland localization, Chinese-language support, and "
        "compliance certifications. These appear on the alternatives page only — not as Explore / "
        "Landscape product tiles. Confirm deliverability and compliance before production adoption."
    ),
    "sendspark": (
        "Sendspark is Unavailable for practical mainland China use: US-hosted infrastructure, Cloudflare "
        "CDN with no mainland nodes, embedded video email pages that often load slowly or fail, "
        "English-only UI, and no domestic payment path. There is no full one-to-one mainland match for "
        "AI-personalized video email plus sales outreach. Prefer Dongli Wuxian (动力无限) when video "
        "marketing and multi-channel personalized reach matter most; prefer U-Mail for domestic email "
        "marketing with personalization and automation; prefer Alibaba Cloud Sendify for Alibaba-stack "
        "smart email marketing with AI-assisted copy. These appear on the alternatives page only — not "
        "as Explore / Landscape product tiles. Confirm deliverability, video/email workflows, and "
        "compliance before production adoption."
    ),
    "streamlit community cloud": (
        "Streamlit Community Cloud is Unavailable for mainland China cloud use: underlying infrastructure "
        "is outside China and the CDN has no mainland nodes. Local Streamlit can still be workable for "
        "demos and internal scripts. Prefer Pyecharts for China-native Python/ECharts visualization, "
        "NiceGUI for the closest Streamlit-like Python-to-web workflow, Dash (Plotly) for self-hosted "
        "enterprise dashboards, Gradio for ML demos, and Taipy for more complex data apps. These appear "
        "on the alternatives page only — not as Explore / Landscape product tiles. Confirm hosting "
        "model, dependency mirrors, and compliance before production adoption."
    ),
    "bombbomb": (
        "BombBomb is Unavailable for practical mainland China use: BombBomb's terms warn that access "
        "from outside the United States is at the user's own risk; recording, hosting, and playback "
        "depend on overseas servers with no China nodes, so latency and timeouts are common; the "
        "product is English-only with weak domestic payment and CRM/WeCom/DingTalk fit; and storing "
        "video content overseas raises mainland data-export compliance risk. There is no single "
        "drop-in China substitute for personalized video plus email plus open/play tracking — prefer "
        "U-Mail paired with a recording tool (for example Loom) for mainland customers; evaluate "
        "TurboEx (拓波) for Xinchuang video email; evaluate Tencent Cloud SES for API-built video "
        "email workflows; evaluate Aico Mail for lightweight voice/video mail. Loom, Tencent Meeting "
        "/ Feishu Miaobi, WeCom/DingTalk video messages, and BillionMail may appear in guidance as "
        "recording or lightweight paths. These appear on the alternatives page only — not as Explore "
        "/ Landscape product tiles. Confirm deliverability, video hosting, and compliance before "
        "production adoption."
    ),
    "constant contact": (
        "Constant Contact is Limited in mainland China: the US SaaS is not clearly IP-blocked and can "
        "usually be registered and used, but day-to-day experience is poor — overseas hosting makes "
        "admin access slow and unstable, domestic-to-China deliverability lacks local infrastructure, "
        "and there is no Chinese support, domestic data center, or mainland compliance path. BuiltWith "
        "adoption in China is negligible (on the order of tens of sites). Prefer Zoho Campaigns for "
        "foreign-trade / B2B sends to overseas inboxes with China-local service; prefer U-Mail or "
        "SendCloud for domestic marketing with stronger compliance or API needs; prefer NetEase Email "
        "Marketing for small-scale SMB bulk sends. For domestic-audience engagement, WeChat ecosystem "
        "channels often beat traditional email. These appear on the alternatives page only — not as "
        "Explore / Landscape product tiles. Confirm deliverability and compliance before production "
        "adoption."
    ),
    "convertkit": (
        "ConvertKit (Kit) is Unavailable for practical mainland China use: overseas hosting makes "
        "access slow and often unstable, Commerce depends on Stripe (unsupported in mainland China), "
        "local cloud ecosystems such as China Azure are not supported, and subscriber data stored "
        "overseas creates mainland compliance risk. Prefer U-Mail or Zoho Campaigns for foreign-trade "
        "/ B2B email marketing with local service; prefer MailerLite as a lightweight creator-oriented "
        "orientation option; prefer SendCloud when technical teams need API-driven delivery "
        "infrastructure. These appear on the alternatives page only — not as Explore / Landscape "
        "product tiles. Confirm deliverability and compliance before production adoption."
    ),
    "libsyn": (
        "Libsyn is Limited in mainland China: the site and creator dashboard are usually reachable and "
        "not explicitly blocked, but overseas hosting makes upload and admin access slow or unstable. "
        "Auto-distribution mainly targets overseas directories (Apple Podcasts, Spotify, Amazon Music), "
        "Spotify is unavailable in mainland China, and AdvertiseCast plus paid-subscription monetization "
        "are oriented to Western advertisers and listeners. There is no Chinese UI or support. Prefer "
        "Ximalaya for Apple Podcasts certified hosting and broad mainland reach, Xiaoyuzhou for "
        "podcast-native community listening, Shengbo (TME Podcast Creation Center) for Tencent Music "
        "ecosystem distribution, and Lizhi for knowledge-paid or voice-livestream formats. These appear "
        "on the alternatives page only — not as Explore / Landscape product tiles. Confirm creator "
        "onboarding, distribution rights, and compliance before production adoption."
    ),
    "captivate": (
        "Captivate is Unavailable for practical mainland China use: mainland China has strict media "
        "content-review rules, so overseas podcast hosts (including Captivate) cannot directly "
        "distribute into domestic podcast platforms. The Captivate website may be technically "
        "reachable, but core auto-distribution to Apple Podcasts, Spotify, and similar directories "
        "does not work as a mainland China growth path, and CDN performance from inside China is "
        "often slow. BuiltWith-style adoption signals show only about one China site using Captivate. "
        "Prefer Ximalaya for Apple Podcasts certified hosting and broad mainland reach, Xiaoyuzhou "
        "for high-quality community listening, Qingting FM for RSS import/redistribution, Lizhi for "
        "independent/young creators, and Typlog for custom-domain independent hosting. A common "
        "pattern is Ximalaya as host (with Apple Podcasts sync) plus Xiaoyuzhou for community "
        "traffic. These appear on the alternatives page only — not as Explore / Landscape product "
        "tiles. Confirm creator onboarding, distribution rights, and compliance before production "
        "adoption."
    ),
    "buzzsprout": (
        "Buzzsprout is Unavailable for practical mainland China use for two simple reasons. Network: "
        "Buzzsprout servers sit overseas, so access from inside China is often unstable and may "
        "require a VPN. Distribution: even when the dashboard is reachable, Buzzsprout cannot "
        "distribute shows into mainland listening channels such as Ximalaya or Xiaoyuzhou because "
        "China requires media content review and filing workflows that overseas hosts do not "
        "support. Prefer Ximalaya as the closest full-stack Buzzsprout-style path (largest ecosystem, "
        "Apple Podcasts certified hosting, RSS, analytics, monetization); prefer Xiaoyuzhou when "
        "podcast community and listening experience matter most; evaluate Lizhi for young "
        "independent creators and Qingting FM for professional / PGC shows. These appear on the "
        "alternatives page only — not as Explore / Landscape product tiles. Confirm creator "
        "onboarding, distribution rights, and compliance before production adoption."
    ),
    "hello audio": (
        "Hello Audio is Unavailable for practical mainland China use: its core experience depends on "
        "overseas podcast apps (Apple Podcasts, Spotify, Overcast) that are unavailable or heavily "
        "constrained in mainland China; Stripe Connect does not support WeChat Pay / Alipay; and "
        "overseas hosting plus no China localization make access slow and unstable. Prefer Xiaoe "
        "(小鹅通) for private paid audio/course delivery in the WeChat ecosystem, Ximalaya paid albums "
        "for paid podcast / membership content with Apple Podcasts certified hosting, Dedao (得到) for "
        "structured course audio hosting, and Xiaoyuzhou for public Chinese podcast discovery (not "
        "private feeds). These appear on the alternatives page only — not as Explore / Landscape "
        "product tiles. Confirm creator onboarding, payment, distribution rights, and compliance "
        "before production adoption."
    ),
    "airbase": (
        "Airbase is unavailable in mainland China (no localization and no compliance foundation). "
        "SAP Concur, Expensify, and Jingbei Guanjia are listed as China-ready candidates on the "
        "alternatives page. Airwallex remains orientation-only and is not an Explore entry."
    ),
    "airtable": (
        "Airtable is Limited in mainland China: technically reachable, but slow and unstable, and not "
        "suitable for latency-sensitive production use. Clear compliance risks remain. Prefer Feishu Base, "
        "Mingdao Cloud, or Teable as China-market options on this alternatives page; they are not "
        "Chinaready Landscape product entries. Confirm hosting model, collaboration-suite fit, and "
        "compliance before production adoption."
    ),
    "smile": (
        "Smile.io is Limited in mainland China: the marketing site is usually reachable, but overseas "
        "hosting often means slow loads, laggy admin, and unstable day-to-day use. For mainland ecommerce "
        "loyalty on Taobao/Tmall, JD, Douyin, and related channels, map to Youzan and Weimob. These appear "
        "on the alternatives page only — not as Explore / Landscape product tiles. Confirm channel fit, "
        "membership model, and compliance before production adoption."
    ),
    "commerce layer": (
        "Commerce Layer is Limited in mainland China: the product is usually reachable over the public "
        "internet, but practical production use is hard. Hosting sits on overseas AWS with no China-region "
        "nodes, so API latency and connection stability are poor; WeChat Pay, Alipay, and domestic logistics "
        "integrations are missing; and cross-border transaction data raises Data Security Law / Personal "
        "Information Protection Law compliance risk. Prefer Wanmi Shangyun (SBC AI) for API-first headless "
        "commerce closest to Commerce Layer; prefer Shushangyun for headless B2B platforms; prefer Youzan "
        "or Weimob when WeChat-centric omnichannel SaaS is enough; evaluate Raycloud (Kuaimai / Superboss) "
        "for Taobao / JD / Pinduoduo multi-platform seller tools. These appear on the alternatives page "
        "only — not as Explore / Landscape product tiles. Confirm architecture fit, payments, logistics, "
        "and compliance before production adoption."
    ),
    "loyaltylion": (
        "LoyaltyLion is Unavailable for practical mainland China use: it is a Shopify-centric loyalty "
        "app, Shopify has negligible China ecommerce share, there is no Simplified Chinese UI or Chinese "
        "support, and it does not integrate Taobao, JD, Pinduoduo, or WeChat mini programs. Overseas "
        "hosting also adds latency and compliance risk. Prefer Weimob for mid-to-large omnichannel "
        "membership, Youzan for lighter SMB loyalty, Duiba or Tongduiba for points/gamification SaaS, "
        "ShopEx ECShopX when you need an open-source custom build, and Qianmi for single-format offline "
        "verticals. These appear on the alternatives page only — not as Explore / Landscape product tiles. "
        "Confirm channel fit, membership model, and compliance before production adoption."
    ),
    "joy rewards": (
        "Mainland shoppers rarely use Shopify, so Joy Rewards / Joy.so is not a meaningful China loyalty "
        "path even when reachable with latency. China loyalty is usually designed into platform "
        "membership (Alibaba / JD / Pinduoduo), WeChat-first membership, brand native apps, or coalition "
        "loyalty — not a drop-in Shopify loyalty-plugin replacement. These paths appear on the "
        "alternatives page only — not as Explore / Landscape product tiles. Contact Chinaready for China "
        "ecommerce and loyalty design guidance before production adoption."
    ),
    "marketo": (
        "Marketo is Limited in mainland China: the product is often technically reachable, but practical "
        "experience is poor and core capabilities are constrained — cross-border email delivery is heavily "
        "filtered, there is no China-region data center, Adobe Marketo AI initially excludes mainland China, "
        "and some Microsoft connectors are unavailable in the 21Vianet-operated China cloud. Prefer Fxiaoke "
        "for B2B end-to-end CRM/marketing, Tencent Qidian when WeChat/QQ social reach matters, Weimob "
        "Marketing Cloud for ecommerce/retail journeys, and Zoho CRM for SMB / trade-oriented stacks. "
        "These appear on the alternatives page only — not as Explore / Landscape product tiles. Confirm "
        "channel fit, deliverability, and compliance before production adoption."
    ),
    "bigmarker": (
        "BigMarker is Unavailable for practical mainland China use: servers sit overseas with no China "
        "localization or domestic CDN nodes, so access is slow or unstable, and the product has not adapted "
        "for mainland data-compliance expectations. BuiltWith-style signals show only about three China sites "
        "using BigMarker. Prefer VHall or Polyv for webinar + virtual-event + CRM-linked workloads closest "
        "to BigMarker; prefer Tencent Meeting for day-to-day meetings; prefer Haoshitong, XYLink, or "
        "OrayMeeting for Xinchuang / localization-mandated scenarios. These appear on the alternatives page "
        "only — not as Explore / Landscape product tiles. Confirm event model, concurrent scale, and "
        "compliance before production adoption."
    ),
    "on24": (
        "ON24 is Unavailable for practical mainland China use: overseas servers and CDN nodes are hard to "
        "reach from the mainland, cross-border latency often breaks livestream quality and interaction, and "
        "default overseas data residency plus weak Chinese UI / domestic payment fit create compliance and "
        "operating gaps. Prefer Polyv or VHall for webinar / virtual-event workloads closest to ON24; use "
        "Feishu Webinar, NetEase Meeting, or Lark when the team already lives in those collaboration stacks. "
        "These appear on the alternatives page only — not as Explore / Landscape product tiles. Confirm "
        "audience location, concurrent scale, and compliance before production adoption."
    ),
    "jw player": (
        "JW Player is Limited in mainland China: the player and CDN path (cdn.jwplayer.com) sit overseas "
        "with no mainland nodes, so load times are often very slow or time out and playback quality suffers. "
        "There is also no China-market localization for ICP filing, content review, and related compliance "
        "expectations. Prefer Polyv for enterprise hosted video closest to JW Player's full-stack "
        "positioning; prefer Tencent Cloud Player (TCPlayer) or Alibaba Cloud Player (Aliplayer) when "
        "already on those clouds; prefer DPlayer or ckplayer for lightweight open-source embeds. Qiniu "
        "Player (QPlayer) may appear in older shortlists — confirm current SDK status before adoption. "
        "These appear on the alternatives page only — not as Explore / Landscape product tiles. Confirm "
        "protocol support, CDN path, ads/analytics needs, and compliance before production adoption."
    ),
    "kaltura": (
        "Kaltura is Unavailable for practical mainland China use: deployment regions cover the US, Ireland, "
        "Germany, Australia, and Canada — not mainland China — so cross-border latency and stability are "
        "poor, and overseas hosting cannot meet mainland data-localization or Multi-Level Protection Scheme "
        "(MLPS / 等保) expectations. Prefer Polyv when the job is enterprise video management plus live and "
        "VOD closest to Kaltura; prefer Haoshitong or Tencent Cloud TRTC for video meeting / collaboration; "
        "prefer Agora or ZEGO when building a custom real-time video app on SDK/PaaS. These appear on the "
        "alternatives page only — not as Explore / Landscape product tiles. Confirm workload type, "
        "deployment model, and compliance before production adoption."
    ),
    "zenlayer sd wan": (
        "Zenlayer SD-WAN is Available in mainland China and a strong fit for overseas-cloud ↔ China-cloud "
        "architectures: Zenlayer operates through a compliant China entity (Zenlayer Technology Services "
        "(Shanghai) Co., Ltd. / 臻乐尔科技服务（上海）有限公司) with relevant network access qualifications, "
        "so mainland deployment is technically supported. Global backbone and cross-border private-line "
        "resources help address latency, packet loss, and cross-border network/compliance constraints. "
        "Prefer Nova Technology (南凌科技) for a domestic managed cross-border SD-WAN path, Alibaba Cloud "
        "CEN + SAG when the China stack is already on Alibaba Cloud, and Huawei SD-WAN for large-scale "
        "enterprise private-line needs. These appear on the alternatives page only — not as Explore / "
        "Landscape product tiles. Confirm topology, compliance, and operating constraints before "
        "production adoption."
    ),
    "middleware": (
        "Middleware.io is Unavailable for practical mainland China use: overseas-only infrastructure means "
        "high latency and unstable access across the international gateway, domains or IPs may be "
        "intermittently restricted by the GFW, and shipping APM/logs/traces to overseas servers creates "
        "data-security and PIPL compliance risk. Prefer Alibaba Cloud Observability or Tencent Cloud "
        "Observability Platform when already on those clouds; prefer Guance or Cloudwise (OneAPM) for "
        "independent domestic observability SaaS. These appear on the alternatives page only — not as "
        "Explore / Landscape product tiles. Confirm OpenTelemetry fit, data residency, and compliance "
        "before production adoption."
    ),
    "mia platform": (
        "Mia Platform is Unavailable for practical mainland China use: the Italian vendor has no China-region "
        "deployment or localized service, overseas hosting creates data-localization and PIPL/DSL compliance "
        "obstacles, and mainland access is high-latency with weak fit for domestic cloud and Xinchuang stacks. "
        "Prefer API7 or RestCloud for API management; CEC Cloud CSP or Snowy-Cloud for microservice lifecycle; "
        "Kingdee Cloud Cosmic gPaaS, iSoftStone Cloud iPaaS, or Huawei Cloud DevCloud for broader cloud-native "
        "DevOps / PaaS. These appear on the alternatives page only — not as Explore / Landscape product tiles. "
        "Confirm capability fit, hosting model, and compliance before production adoption."
    ),
    "env0": (
        "For env0-managed Terraform in mainland China, prefer AWS China Regions as the primary cloud target. "
        "Alibaba Cloud is also workable because Terraform supports the Alibaba Cloud provider. "
        "Confirm compliance and operating constraints before production adoption."
    ),
    "aws": (
        "AWS is Limited in mainland China: global AWS is not a China region toggle. AWS China is a "
        "separate partition (Beijing / Ningxia) with its own account rails, catalog gaps, and ICP "
        "adjacency — see chinaready.co/insights/aws-china-what-works/. When evaluating mainland China "
        "cloud vendors instead, prefer Alibaba Cloud and Tencent Cloud. Tencent Cloud appears on the "
        "alternatives page as an orientation option — not as an Explore / Landscape product tile from "
        "this research. Confirm region, ICP, and service catalog fit before production adoption."
    ),
    "google admob": (
        "Pure domestic China ad networks for mainland monetization when replacing Google AdMob. "
        "Confirm SDK access, settlement entity, and PIPL compliance before production adoption. "
        "AdMob is strongly discouraged for mainland users due to GFW latency, near-zero fill, and PIPL risk."
    ),
    "unity levelplay": (
        "Mainland China publisher networks for mediation and in-app monetization when replacing Unity LevelPlay. "
        "Confirm mediation adapters, settlement entity, and PIPL constraints before production adoption."
    ),
    "applovin max": (
        "Mainland China publisher networks for mediation and in-app monetization when replacing AppLovin MAX. "
        "Confirm mediation adapters, settlement entity, and PIPL constraints before production adoption."
    ),
    "ironsource": (
        "Mainland China publisher networks for mediation and in-app monetization when replacing ironSource. "
        "Confirm mediation adapters, settlement entity, and PIPL constraints before production adoption."
    ),
    "chartboost": (
        "Mainland China publisher networks for rewarded video and in-app monetization when replacing Chartboost. "
        "Confirm SDK access, settlement entity, and PIPL constraints before production adoption."
    ),
    "dt exchange": (
        "Mainland China publisher networks for programmatic monetization when replacing DT Exchange. "
        "Confirm SDK access, settlement entity, and PIPL constraints before production adoption."
    ),
    "liftoff": (
        "Mainland China alternatives for Liftoff user acquisition and performance growth. "
        "Prefer Ocean Engine (巨量引擎) and Tencent Advertising (腾讯广告 / TMS) for paid app installs; "
        "evaluate Pangle (穿山甲) when developer-side ad distribution matters; use Kuaishou Ads (快手磁力引擎) for Kuaishou short-video growth."
    ),
    "applovin": (
        "Mainland China advertiser platforms for paid app installs and performance UA when replacing AppLovin. "
        "Prefer Ocean Engine, Tencent Advertising, and Kuaishou Ads; confirm entity and compliance constraints."
    ),
    "moloco": (
        "Mainland China advertiser platforms for programmatic / performance UA when replacing Moloco. "
        "Prefer Ocean Engine, Tencent Advertising, and Kuaishou Ads; confirm entity and compliance constraints."
    ),
    "meta ads": (
        "Meta Ads is unavailable for meaningful mainland China user acquisition. "
        "Prefer Tencent Advertising, Ocean Engine, and Kuaishou Ads for domestic paid growth."
    ),
    "google ads": (
        "Google Ads has limited utility for mainland China app installs. "
        "Prefer Baidu Marketing for search intent and Ocean Engine / Tencent Advertising / Kuaishou Ads for scale."
    ),
    "tiktok ads": (
        "For mainland China Douyin / ByteDance inventory, prefer Ocean Engine rather than global TikTok Ads. "
        "Kuaishou Ads and Tencent Advertising are common complementary routes."
    ),
    "apple search ads": (
        "Apple Search Ads can still matter for App Store traffic, but mainland acquisition usually also needs "
        "domestic networks such as Huawei Ads (AppGallery), Ocean Engine, Tencent Advertising, and Baidu Marketing."
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
    "amazon cloudfront": (
        "Amazon CloudFront is available in AWS China (Beijing and Ningxia) with mainland POPs, but differs from "
        "global CloudFront (ICP/CNAME, no ACM, no Lambda@Edge, and other edge feature limits). Prefer Tencent Cloud "
        "CDN or Alibaba Cloud CDN when a domestic CDN stack fits better than AWS China CloudFront."
    ),
    "zoho crm": (
        "Zoho CRM is Available in mainland China as a deeply localized, compliance-oriented service — not a "
        "thin international login. zoho.com.cn shows a mainland operating entity, China data centers (Tencent "
        "Cloud partnership), ICP filing (京ICP备15015257号-1), and Chinese-language support including a 400 "
        "hotline. Domestic CRM options commonly evaluated alongside it include Fxiaoke (纷享销客) for mid-to-large "
        "/ group enterprises and Neocrm (销售易) for social selling and Tencent-ecosystem teams. These domestic "
        "options appear on the alternatives page only — not as Explore / Landscape product tiles. Confirm "
        "entity fit, WeCom/channel integrations, and compliance before production adoption."
    ),
    "akamai": (
        "Mainland China CDN options commonly evaluated when replacing Akamai. Prefer Alibaba Cloud CDN or "
        "Tencent Cloud CDN; confirm ICP filing and China acceleration planning before production adoption."
    ),
    "cloudflare cdn": (
        "For mainland China acceleration, evaluate Cloudflare China Network for Cloudflare customers, or "
        "domestic CDNs such as Alibaba Cloud CDN and Tencent Cloud CDN. Confirm ICP and operating constraints."
    ),
}


def normalize(value: str) -> str:
    value = value.lower().strip()
    return re.sub(r"\.io$", "", value)


def match_override_key(service_key: str) -> str | None:
    """Match OVERRIDES without letting shorter keys steal longer service names.

    Exact match wins. Otherwise accept an override that is a prefix of the
    service key (e.g. override ``kong`` for service ``kong gateway``). Never
    match the reverse (e.g. a longer override key must not claim a shorter
    service key via substring containment).
    """
    if service_key in OVERRIDES:
        return service_key
    prefix_hits = [
        override_key
        for override_key in OVERRIDES
        if service_key.startswith(f"{override_key} ")
        or service_key.startswith(f"{override_key}-")
    ]
    if not prefix_hits:
        return None
    return max(prefix_hits, key=len)


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

    def resolve_names(names: list) -> list[dict]:
        resolved = []
        for entry in names:
            if isinstance(entry, dict):
                name = entry.get("name") or ""
                item = item_by_name.get(name.lower())
                if item:
                    merged = {**item, "source": entry.get("source") or "landscape"}
                    if entry.get("note"):
                        merged["note"] = entry["note"]
                    resolved.append(merged)
                else:
                    resolved.append(
                        {
                            "name": name,
                            "homepage_url": entry.get("homepage_url") or "",
                            "category": entry.get("category") or "",
                            "subcategory": entry.get("subcategory") or "",
                            "source": entry.get("source") or "research",
                            **({"note": entry["note"]} if entry.get("note") else {}),
                        }
                    )
                continue
            name = entry
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

        matched_override = match_override_key(key)
        if matched_override is not None:
            names = OVERRIDES[matched_override]
            if not names:
                candidates = []
                confidence = "uncertain"
                note = CONTACT_NOTE
            else:
                candidates = resolve_names(names)
                confidence = "researched"
                note = RESEARCH_NOTES.get(matched_override, RESEARCH_NOTE)

        availability = AVAILABILITY_OVERRIDES.get(matched_override or key) or service.get("availability") or "Unknown"
        global_availability = {
            "Available": "available",
            "Limited": "limited",
            "Unavailable": "unavailable",
            "Unknown": "unknown",
        }.get(availability, service.get("global_availability_in_china") or "unknown")

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
            "name": NAME_OVERRIDES.get(matched_override or key) or service["name"],
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
                    **(
                        {"note": candidate["note"]}
                        if candidate.get("note")
                        else {}
                    ),
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

    # Inject researched override services that are missing from the seed catalog.
    # Keep this allowlist tight — OVERRIDES also covers names that should not become
    # standalone catalog pages just because a research note exists.
    INJECT_IF_MISSING = {
        # === BEGIN HUB P0P1 OVERRIDES ===
        "microsoft teams": {
            "name": "Microsoft Teams",
            "categories": ["Collaboration & Productivity"],
        },
        "webex": {
            "name": "Webex",
            "categories": ["Collaboration & Productivity"],
        },
        "docusign": {
            "name": "DocuSign",
            "categories": ["Trust, Identity & Compliance"],
        },
        "dropbox sign": {
            "name": "Dropbox Sign",
            "categories": ["Trust, Identity & Compliance"],
        },
        "adobe acrobat sign": {
            "name": "Adobe Acrobat Sign",
            "categories": ["Trust, Identity & Compliance"],
        },
        "qualtrics": {
            "name": "Qualtrics",
            "categories": ["Growth, Content & Experience"],
        },
        "surveymonkey": {
            "name": "SurveyMonkey",
            "categories": ["Growth, Content & Experience"],
        },
        "typeform": {
            "name": "Typeform",
            "categories": ["Growth, Content & Experience"],
        },
        "wordpress": {
            "name": "WordPress",
            "categories": ["Growth, Content & Experience"],
        },
        "gumroad": {
            "name": "Gumroad",
            "categories": ["Growth, Content & Experience"],
        },
        "n8n": {
            "name": "n8n",
            "categories": ["Developer Tools & Platforms"],
        },
        # === END HUB P0P1 OVERRIDES ===
        "facebook login": {
            "name": "Facebook Login",
            "categories": ["Authentication & Identity"],
        },
        "firebase app distribution": {
            "name": "Firebase App Distribution",
            "categories": ["Release, Quality & Operations"],
        },
        "firebase crashlytics": {
            "name": "Firebase Crashlytics",
            "categories": ["Release, Quality & Operations", "Crash Reporting & Error Tracking"],
        },
        "google maps platform": {
            "name": "Google Maps Platform",
            "categories": ["Location & Map Services"],
        },
        "apple mapkit": {
            "name": "Apple MapKit",
            "categories": ["Location & Map Services"],
        },
        "aws": {
            "name": "AWS",
            "categories": ["Infrastructure & Edge", "Cloud Platform & Hosting"],
        },
    }
    for override_key, meta in INJECT_IF_MISSING.items():
        if override_key in lookup or override_key not in OVERRIDES:
            continue
        names = OVERRIDES[override_key]
        if not names:
            continue
        display_name = meta["name"] if isinstance(meta, dict) else meta
        categories = (
            list(meta.get("categories") or [])
            if isinstance(meta, dict)
            else ["Authentication & Identity"]
        )
        candidates = resolve_names(names)
        availability = AVAILABILITY_OVERRIDES.get(override_key) or "Unknown"
        global_availability = {
            "Available": "available",
            "Limited": "limited",
            "Unavailable": "unavailable",
            "Unknown": "unknown",
        }.get(availability, "unknown")
        cleaned = {
            "name": display_name,
            "categories": categories,
            "availability": availability,
            "global_availability_in_china": global_availability,
            "china_candidates": [
                {
                    "name": candidate["name"],
                    "homepage_url": candidate.get("homepage_url") or "",
                    "category": candidate.get("category") or "",
                    "subcategory": candidate.get("subcategory") or "",
                    "source": candidate.get("source") or "research",
                    **({"note": candidate["note"]} if candidate.get("note") else {}),
                }
                for candidate in candidates
            ],
            "research_note": RESEARCH_NOTES.get(override_key, RESEARCH_NOTE),
            "confidence": "researched",
        }
        services.append(cleaned)
        lookup[override_key] = {
            "name": cleaned["name"],
            "availability": cleaned["availability"],
            "global_availability_in_china": cleaned["global_availability_in_china"],
        }

    services.sort(key=lambda row: row["name"].lower())

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
