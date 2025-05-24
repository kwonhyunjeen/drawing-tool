# 벡터(SVG) 기반의 드로잉 툴 구현

React, typescript와 드로잉 라이브러리 Konva (https://konvajs.org)를 사용해 프로젝트를 구현해주세요.

구현 내용:

- 드로잉: 자유 그리기, 직선, 타원, 직사각형, 다각형
- 선 두께 선택
- 색상 선택
- Undo, Redo
- 세션 내 데이터 유지 (sessionStorage에 저장)

## 설치 및 실행

### 0. 실행 환경

이 프로젝트는 다음 환경에서 실행됩니다.

- Node.js: `>=20.11.0`
- pnpm: `10.11.0`

### 1. 저장소 복제

```bash
git clone https://github.com/kwonhyunjeen/drawing-tool.git
cd drawing-tool
```

### 2. 패키지 설치

```bash
pnpm install
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

### 5. 브라우저에서 확인

[http://localhost:5173](http://localhost:5173) 주소로 접속하여 결과를 확인합니다.

## 빌드 및 배포

배포는 Vercel을 통해 이루어집니다. 다음 링크를 통해 확인할 수 있습니다.
[https://kwonhyunjeen-drawing-tool.vercel.app](https://kwonhyunjeen-drawing-tool.vercel.app)

## 기술 스택

- TypeScript
- React
- Konva
- Vite
- ESLint, Prettier, Lefthook

## 프로젝트 구조

- `components/ui`: 공통 UI 컴포넌트
- `components/shape`: 도형 컴포넌트
- `domains`: 도형 객체 가공 함수
- `types`: 타입 정의
- `utils`: 유틸리티 함수
