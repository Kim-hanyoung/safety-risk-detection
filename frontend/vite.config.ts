import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

const r = (p: string) => path.resolve(__dirname, p);

// NGROK_HOST 환경변수에 프론트 ngrok 도메인 넣어두면(HMR 안정)
// 예: NGROK_HOST=abcd-1234.ngrok-free.app
const H = process.env.NGROK_HOST || "";


export default defineConfig(() => ({
  // SPA 코드 루트
  root: r("client"),

  server: {
    host: "::",              // 외부 접속 허용 (ngrok에서 접근 가능)
    port: 5173,

    fs: {
      allow: [r("client"), r("shared")],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },

    // FastAPI 프록시 (REST + WebSocket)
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
        ws: true,
      },
      "/uploads": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },

    // ngrok HTTPS에서 HMR이 wss:443으로 붙도록
    hmr: H
      ? {
          host: H,         // 예: abcd1234.ngrok-free.app
          protocol: "wss",
          clientPort: 443, // ← 오타 주의(433 아님)
        }
      : true,
  },

  build: {
    outDir: "../dist/spa",
    emptyOutDir: true,
  },

  plugins: [react()],

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
