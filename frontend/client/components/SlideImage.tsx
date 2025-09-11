import React, { useState, useEffect } from "react";

import Img1 from "@/assets/main_img_1.jpg";
import Img2 from "@/assets/main_img_2.jpg";
import Img3 from "@/assets/main_img_3.jpg";
import Img4 from "@/assets/main_img_4.jpg";
import Img5 from "@/assets/main_img_5.jpg";
import Img6 from "@/assets/main_img_6.jpg";

const images = [Img1, Img2, Img3,Img4,Img5,Img6];

const SlideImage: React.FC = () => {
    const [current, setCurrent] = useState(0);

    // 3초마다 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-2xl shadow-lg">
      {/* 이미지 */}
      <img
        src={images[current]}
        alt={`slide-${current}`}
        className="w-full h-full object-cover transition-all duration-700"
      />

      {/* 좌우 버튼 */}
      <button
        onClick={() =>
          setCurrent((prev) => (prev - 1 + images.length) % images.length)
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full"
      >
        ◀
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % images.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full"
      >
        ▶
      </button>

      {/* 하단 인디케이터 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              current === idx ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SlideImage;