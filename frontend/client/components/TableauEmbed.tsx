import { useEffect } from "react";

type Props = {
  /** Tableau 대시보드 경로: /views/ 뒤의 부분 */
  name?: string;
  /** 픽셀 단위 고정폭/고정높이 (원하는 값으로 조정) */
  width?: number;
  height?: number;
};

export default function TableauEmbed({
  name = "_17574726192320/5",
  width = 1024,
  height = 1627,
}: Props) {
  useEffect(() => {
    // 중복 로드 방지
    const existed = document.querySelector(
      "script[src='https://public.tableau.com/javascripts/api/viz_v1.js']"
    );
    if (!existed) {
      const s = document.createElement("script");
      s.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
      s.async = true;
      document.body.appendChild(s);
    }
    // object 사이즈도 명시적으로 넣어줌(스크립트가 읽어 사용)
    const el = document.getElementById("tableau-viz-fixed") as HTMLDivElement | null;
    const obj = el?.getElementsByTagName("object")[0] as HTMLObjectElement | undefined;
    if (obj) {
      obj.style.width = `${width}px`;
      obj.style.height = `${height}px`;
    }
  }, [width, height]);

  return (
    <div
      id="tableau-viz-fixed"
      // 가운데 정렬 + 고정 사이즈(부모가 더 넓어도 빈 여백 없이 딱 맞춤)
      style={{ width, height, margin: "0 auto", position: "relative", overflow: "hidden" }}
      className="tableauPlaceholder"
    >
      <noscript>
        <a href="#">
          <img
            alt="대시보드"
            src={`https://public.tableau.com/static/images/_1/${encodeURIComponent(
              "_17574726192320"
            )}/5/1.png`}
            style={{ border: "none" }}
          />
        </a>
      </noscript>
      <object className="tableauViz" style={{ display: "none" }}>
        <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
        <param name="embed_code_version" value="3" />
        <param name="site_root" value="" />
        <param name="name" value={name} />
        <param name="tabs" value="no" />
        <param name="toolbar" value="yes" />
        <param name="animate_transition" value="yes" />
        <param name="display_spinner" value="yes" />
        <param name="display_overlay" value="yes" />
        <param name="display_count" value="yes" />
        <param name="language" value="ko-KR" />
        {/* 디바이스 레이아웃이 있다면 명시 */}
        <param name="device" value="desktop" />
      </object>
    </div>
  );
}
