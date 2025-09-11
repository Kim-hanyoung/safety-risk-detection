import { useEffect } from "react";

// TSX에서 커스텀 태그 허용
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "tableau-viz": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        toolbar?: string;
        "hide-tabs"?: boolean | "";
      };
    }
  }
}

type Props = {
  /** Tableau Public의 views/ 뒤 경로 예) "_17574726192320/5" */
  viewPath: string;
  /** 1번 스샷처럼 보이게 하려면 1024 x 1627 권장 */
  width?: number;
  height?: number;
};

export default function TableauEmbed({
  viewPath,
  width = 1024,
  height = 1627,
}: Props) {
  useEffect(() => {
    // v1/v2 잔여 스크립트 제거(충돌 방지)
    document
      .querySelectorAll(
        "script[src*='viz_v1.js'],script[src*='tableau-2.min.js']"
      )
      .forEach((n) => n.parentNode?.removeChild(n));

    // v3 스크립트(모듈) 주입
    const existed = document.querySelector(
      "script[src='https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js']"
    );
    if (!existed) {
      const s = document.createElement("script");
      s.type = "module"; // ★ 중요: v3는 모듈
      s.src =
        "https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js";
      document.head.appendChild(s);
    }
  }, [viewPath]);

  const src = `https://public.tableau.com/views/${viewPath}` +
            `?:showVizHome=no` +       // 홈 숨김
            `&:embed=yes` +            // 임베드 모드
            `&:toolbar=no` +           // 툴바 비표시
            `&:display_count=n` +      // "Tableau Public에서 보기/조회수" 바 숨김
            `&:showShareOptions=false`;// 공유 아이콘 숨김

  return (
    <div style={{ width, height, margin: "0 auto", overflow: "hidden" }}>
      {/* 커스텀 엘리먼트는 스크립트가 로드되면 자동 업그레이드됨 */}
      <tableau-viz
        src={src}
        toolbar="hidden"     // 툴바 숨김
        hide-tabs            // 탭 숨김
        style={{
          display: "block",
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    </div>
  );
}
