import os
import google.generativeai as genai
from ..core.config import settings # settings에서 직접 읽기

MODEL_NAME = settings.GEMINI_MODEL or "gemini-1.5-flash"

def _model():
    key = settings.GEMINI_API_KEY  # ✅ os.getenv 대신 settings
    if not key:
        return None
    genai.configure(api_key=key)
    return genai.GenerativeModel(MODEL_NAME)

def make_prompt(detections, meta, lang="ko"):
    # 간단 점수 → 초기 레벨
    labels = [d["label"] for d in detections]
    score = 0
    score += 40 if any("fire" in l.lower() for l in labels) else 0
    score += 20 if any("smoke" in l.lower() for l in labels) else 0
    score += 10 * sum(1 for l in labels if l.startswith("NO-"))
    level = "Critical" if score>=60 else "Warning" if score>=30 else "Normal"

    # 라벨 요약
    from collections import defaultdict
    cnt = defaultdict(int); confs = defaultdict(list)
    for d in detections:
        cnt[d["label"]] += 1
        confs[d["label"]].append(float(d["conf"]))
    rows = []
    for k in sorted(cnt.keys()):
        cs = confs[k]; rows.append((k, cnt[k], f"{min(cs):.2f}~{max(cs):.2f}"))

    # 이미지 링크
    imgs = [f"- 원본: {meta.get('original_url')}"]
    for k,v in (meta.get("annotated") or {}).items():
        imgs.append(f"- {k.upper()} 주석: {v}")

    return f"""
언어: {lang}
당신은 산업안전 전문가입니다. 아래 감지 결과를 바탕으로 실무자/관리자에게 제공할 **정형 리포트(마크다운)** 를 작성하세요.

요구사항:
- 헤더에 제목 포함: `# AI Safety Incident Report`
- 섹션 구성 (각 섹션 제목 포함):
  1) Executive Summary: 3~5문장 요약 (무엇이, 어디에서, 왜 위험한지)
  2) Risk Assessment: 레벨(초안: {level}, 점수 {score})을 검증/조정하고 근거 제시
  3) Detected Items (표): |항목|개수|신뢰도범위|
  4) Root Cause Hypotheses: 가능한 원인 2~4가지 (가설)
  5) Recommended Actions: 체크박스 목록(즉시조치/단기/중기 분류)
  6) Evidence: 아래 링크를 마크다운 이미지로 삽입
- 한국어로 작성.
- 불필요한 수사는 피하고, 실무자가 바로 실행할 수 있는 문장으로.

감지 요약:
{os.linesep.join([f"- {k}: {v}건 (conf {r})" for k,v,r in [(k,*rows[i][1:]) for i,k in enumerate([r[0] for r in rows])]]) or "- (없음)"}

이미지:
{os.linesep.join(imgs)}
"""

def generate_report_md(detections, meta, lang="ko"):
    m = _model()
    if not m:
        return None
    out = m.generate_content(make_prompt(detections, meta, lang=lang))
    return (out.text or "").strip()