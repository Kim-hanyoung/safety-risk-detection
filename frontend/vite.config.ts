import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

const r = (p: string) => path.resolve(__dirname, p);

// NGROK_HOST 환경변수에 프론트 ngrok 도메인 넣어두면(HMR 안정)
// 예: NGROK_HOST=abcd-1234.ngrok-free.app
const NGROK_HOST = process.env.NGROK_HOST || "";

export default defineConfig(({ mode }) => ({
  // ✅ dev/build 모두 client를 루트로 사용
  root: r("client"),

  server: {
    // ✅ 외부 접속 허용(ngrok에서 들어올 수 있게)
    host: true, // 또는 "0.0.0.0"
    port: 5173,

    fs: {
      allow: [r("client"), r("shared")],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },

    // ✅ FastAPI 프록시 (REST + WebSocket)
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
        ws: true, // ← WebSocket 프록시 ON
      },
      "/uploads": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },

    // ✅ ngrok(HTTPS)로 접속할 때 HMR(WebSocket)도 wss로 붙도록
    // NGROK_HOST를 지정한 경우에만 적용 (로컬은 기본값 사용)
    hmr: NGROK_HOST
      ? {
          host: NGROK_HOST,  // ex) abcd-1234.ngrok-free.app
          protocol: "wss",
          clientPort: 443,
        }
      : undefined,
  },

  // ✅ 빌드 산출물(client 기준) → 상위 dist/spa
  build: {
    outDir: "../dist/spa",
    emptyOutDir: true,
  },

  plugins: [react(), expressPlugin()],

  resolve: {
    alias: {
      "@": r("client"),
      "@shared": r("shared"),
    },
  },

  // (선택) vite preview에서도 프록시 쓰고 싶으면 아래 추가
  // preview: {
  //   port: 4173,
  //   proxy: {
  //     "/api": { target: "http://127.0.0.1:8000", changeOrigin: true, rewrite: p => p.replace(/^\/api/, ""), ws: true },
  //     "/uploads": { target: "http://127.0.0.1:8000", changeOrigin: true },
  //   },
  // },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      const app = createServer();

      // ✅ /api 시작 요청은 Vite 프록시로 넘김(Express가 가로채지 않게)
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/api")) return next();
        return app(req, res, next);
      });
    },
  };
}
