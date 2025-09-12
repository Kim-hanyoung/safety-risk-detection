# safety-risk-detection
# 🛡️ SafeScope: 산업안전 위험 예측 웹 프로그램

산업 현장에서 발생할 수 있는 위험 요소를 실시간으로 감지하고 분석하는 웹 기반 프로그램입니다.  
휴대폰 카메라와 연동하여 실시간 스트리밍 분석이 가능하며, 이미지 업로드 시 LLM 기반 리포트를 자동 생성합니다.  
산업안전포털의 산업 재해 통계 데이터를 시각화하여 메인 페이지에 제공합니다.

> 📊 “예측 기반 안전 인사이트 – 실시간 감지와 AI 리포팅의 만남”
![Animation](https://github.com/user-attachments/assets/f22ae7ea-b5f1-48ea-8e64-24d25291c447)

---

## 🚀 주요 기능

- YOLO 기반 위험 요소 감지 (화재, 연기, PPE 미착용 등)
- 실시간 스트리밍 분석 (휴대폰 카메라 연동)
- 이미지 업로드 → LLM 기반 리포트 자동 생성
- 산업 재해 통계 시각화 대시보드
- 게시판 기능을 통한 팀 협업 및 인사이트 공유

---

## 🧠 기술 스택

[![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?logo=databricks&logoColor=white)](https://www.sqlalchemy.org/)
[![NumPy](https://img.shields.io/badge/NumPy-013243?logo=numpy&logoColor=white)](https://numpy.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-00FFFF?logo=github&logoColor=black)](https://github.com/ultralytics/ultralytics)
[![Figma](https://img.shields.io/badge/Figma-F24E1E?logo=figma&logoColor=white)](https://www.figma.com/)
[![Tableau](https://img.shields.io/badge/Tableau-E97627?logo=tableau&logoColor=white)](https://www.tableau.com/)
[![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](https://code.visualstudio.com/)
[![Jupyter](https://img.shields.io/badge/Jupyter-F37626?logo=jupyter&logoColor=white)](https://jupyter.org/)
[![ngrok](https://img.shields.io/badge/ngrok-1F1E37?logo=ngrok&logoColor=white)](https://ngrok.com/)
[![Notion](https://img.shields.io/badge/Notion-000000?logo=notion&logoColor=white)](https://www.notion.so/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/)


## 📦 설치 방법

### 1. 레포지토리 클론

```bash
git clone [해당 레파지토리 주소]
```

### 2. 백엔드 환경 변수 설정

/backend/.env 파일 생성 후 아래 내용 입력:

```bash
YOLO_FIRE_SMOKE_WEIGHTS=weights/firesmokebest.pt
YOLO_FIRE_SMOKE_LABELS_JSON=weights/firesmokelabels.json

YOLO_PPE_WEIGHTS=weights/ppebest.pt
YOLO_PPE_LABELS_JSON=weights/ppelabels.json

YOLO_DEFAULT_CONF=0.20

ALLOW_ORIGINS=["*"]

GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

### 3. 프런트엔드 실행

```bash
# Node.js 설치 후
cd frontend
npm install vite
npm run dev
```

### 4. 백엔드 실행

```bash
# Python 3.13 환경 추천
cd backend
pip install -r requirements.txt
# PyJWT 설치 확인
pip install uvicorn
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
```

### 5. 모바일 카메라 연동

```bash
# ngrok 설치 및 인증
ngrok http 5173 --host-header=rewrite
# 생성된 주소 뒤에 /mobile-stream 추가 후 모바일로 접속
# 정상 연결 시 /video-detected "WS: Connected" 메시지 확인
```

## 📁 프로젝트 구조

```bash
├── backend
│   ├── app
│   │   ├── core
│   │   ├── models
│   │   ├── routers
│   │   ├── schemas
│   │   ├── services
│   │   └── utils
│   ├── models
│   ├── uploads
│   │   ├── annot
│   │   └── orig
│   ├── weights
│   └── .env (생성 필요)
├── data
├── frontend
│   ├── client
│   │   ├── assets
│   │   ├── components
│   │   │   ├── common
│   │   │   ├── layout
│   │   │   └── ui
│   │   ├── context
│   │   ├── hooks
│   │   ├── lib
│   │   └── pages
│   ├── netlify
│   ├── public
│   ├── scripts
│   ├── server
│   └── shared
├── README.md
└── .env
```

## 📊 사용 데이터셋

| 이름                 | 설명                          | 출처             |
|----------------------|-------------------------------|------------------|
| 전기 설비 공사 위험 판단 | 산업 현장의 위험 요소 이미지     | [AIHub](https://aihub.or.kr/aihubdata/data/view.do?pageIndex=1&currMenu=&topMenu=&srchOptnCnd=OPTNCND001&searchKeyword=%EC%A0%84%EA%B8%B0+%EC%84%A4%EB%B9%84&srchDetailCnd=DETAILCND001&srchOrder=ORDER001&srchPagePer=80&srchDataRealmCode=REALM005&aihubDataSe=data&dataSetSn=71771) |
| 화재 및 연기 감지       | YOLO 기반 화재/연기 이미지       | [Kaggle](https://www.kaggle.com/datasets/sayedgamal99/smoke-fire-detection-yolo) |
| 산업 재해 통계         | 산업 재해 발생 현황 통계         | [산업안전포털](https://portal.kosha.or.kr/archive/indus-acc-statis/indus-status-data) |


## 🗓️ 프로젝트 기간

2025년 8월 28일 ~ 9월 12일 (약 2주)

## 🎯 기대 효과

산업재해 현황의 체계적 파악 및 시각화

AI 기반 사전 위험 예측 및 사고 예방

팀 간 협업 강화 및 인사이트 도출

관리자 의사결정의 정확성 및 속도 향상

## 🛠️ 향후 개선 사항

OAuth 기반 소셜 로그인 및 이메일 인증 기능 추가 예정

YOLO-Pose 모델 도입 및 정확도 개선

게시판 검색/필터 기능 추가 (사고 유형별, 날짜별 등)

Tableau Server를 통한 고급 시각화 기능 확장

## 👥 팀원 역할

| 이름   | 역할                             |
|--------|----------------------------------|
| 박성언 | 통계 분석, 산업재해 시각화       |
| 김한영 | 백엔드 총괄, 화재 감지 API        |
| 유지원 | 데이터셋 정리, 게시판 구성        |
| 정상철 | 시계열 예측, LLM 리포트 가공      |
| 이영서 | 프론트 총괄, 메인 UI              |
| 김유현 | 이미지 업로드 모델, CRUD          |


## 📄 라이선스

MIT License (또는 원하는 라이선스를 명시해주세요)

## 🙋 Q&A

문의사항은 Issues 또는 Discussions 탭을 통해 남겨주세요.
