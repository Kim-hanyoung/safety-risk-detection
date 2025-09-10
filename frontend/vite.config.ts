import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// 경로 유틸 (절대경로)
const r = (p: string) => path.resolve(__dirname, p);

export default defineConfig(({ mode }) => ({
  // ✅ dev/build 모두 client를 루트로 사용
  root: r("client"),

  server: {
    host: "::",
    port: 5173,
    fs: {
      // ✅ Vite가 읽을 수 있는 디렉터리 화이트리스트 (절대경로 권장)
      allow: [r("client"), r("shared")],
      // deny는 그대로 둬도 됨 (패턴)
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
    // ✅ FastAPI 프록시
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
      "/uploads": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true
      },
    },
  },

  // ✅ 빌드 산출물 경로 (client 기준이므로 상위로 나가서 dist/spa 에 출력)
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
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      const app = createServer();

      // ✅ /api 로 시작하는 요청은 Vite 프록시로 넘긴다 (Express가 가로채지 않게)
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/api")) return next(); // ← 중요!
        return app(req, res, next);
      });
    },
  };
}