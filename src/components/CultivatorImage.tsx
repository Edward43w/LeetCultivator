"use client";

import { motion } from "framer-motion";

type CultivatorImageProps = {
  mode?: "card" | "cover";
};

const CX = "50%";
const CY_BODY = "56%";
const CY_HANDS = "63%";

const mistClouds = [
  { left: "10%", top: "55%", w: "45%", h: "28%", color: "rgba(16,185,129,0.05)", delay: 0,  dur: 33 },
  { left: "50%", top: "60%", w: "40%", h: "24%", color: "rgba(6,182,212,0.04)",  delay: 4,  dur: 39 },
  { left: "25%", top: "72%", w: "55%", h: "30%", color: "rgba(99,102,241,0.04)", delay: 8,  dur: 45 },
  { left: "5%",  top: "68%", w: "38%", h: "20%", color: "rgba(52,211,153,0.03)", delay: 2,  dur: 36 },
  { left: "60%", top: "50%", w: "42%", h: "26%", color: "rgba(56,189,248,0.05)", delay: 10, dur: 42 },
];

const floatingDust = [
  { left:  "4%", top: "82%", size: 5.5, riseY: 110, driftX:  6, delay:  0.0, dur:  9.0 },
  { left:  "9%", top: "55%", size: 6.0, riseY:  90, driftX: -8, delay:  3.5, dur: 11.0 },
  { left: "14%", top: "70%", size: 4.0, riseY: 130, driftX:  4, delay:  7.2, dur:  8.5 },
  { left: "18%", top: "40%", size: 2.5, riseY:  80, driftX: -5, delay:  1.8, dur: 12.0 },
  { left: "22%", top: "88%", size: 3.5, riseY: 150, driftX:  9, delay:  9.0, dur:  9.5 },
  { left: "27%", top: "62%", size: 4.0, riseY: 100, driftX: -6, delay:  5.5, dur: 10.5 },
  { left: "31%", top: "75%", size: 5.0, riseY: 120, driftX:  3, delay: 13.0, dur:  8.0 },
  { left: "35%", top: "48%", size: 2.5, riseY:  85, driftX: -9, delay:  2.3, dur: 13.5 },
  { left: "39%", top: "85%", size: 3.0, riseY: 140, driftX:  7, delay:  6.8, dur:  7.5 },
  { left: "43%", top: "33%", size: 5.5, riseY:  95, driftX: -4, delay: 11.5, dur: 11.5 },
  { left: "46%", top: "72%", size: 6.0, riseY: 115, driftX:  5, delay:  0.8, dur:  9.0 },
  { left: "48%", top: "90%", size: 5.5, riseY: 160, driftX: -3, delay: 15.0, dur:  8.0 },
  { left: "50%", top: "58%", size: 6.5, riseY: 100, driftX:  8, delay:  4.2, dur: 10.0 },
  { left: "52%", top: "78%", size: 5.0, riseY: 125, driftX: -7, delay: 18.0, dur:  9.5 },
  { left: "54%", top: "42%", size: 5.5, riseY:  80, driftX:  4, delay:  8.5, dur: 12.5 },
  { left: "57%", top: "86%", size: 5.0, riseY: 145, driftX: -5, delay:  2.8, dur:  8.5 },
  { left: "61%", top: "65%", size: 6.0, riseY: 110, driftX:  6, delay: 12.0, dur:  7.0 },
  { left: "65%", top: "50%", size: 5.0, riseY:  90, driftX: -8, delay:  1.2, dur: 13.0 },
  { left: "68%", top: "80%", size: 6.0, riseY: 135, driftX:  3, delay: 16.5, dur:  9.0 },
  { left: "72%", top: "38%", size: 5.5, riseY:  75, driftX: -4, delay:  6.0, dur: 11.0 },
  { left: "75%", top: "72%", size: 6.5, riseY: 120, driftX:  7, delay:  9.8, dur:  8.0 },
  { left: "79%", top: "55%", size: 5.0, riseY: 100, driftX: -6, delay:  3.3, dur: 12.0 },
  { left: "82%", top: "84%", size: 6.0, riseY: 150, driftX:  5, delay: 14.5, dur:  9.5 },
  { left: "86%", top: "45%", size: 5.5, riseY:  85, driftX: -9, delay:  0.5, dur: 10.0 },
  { left: "90%", top: "68%", size: 5.5, riseY: 110, driftX:  4, delay: 19.0, dur:  8.5 },
  { left: "93%", top: "88%", size: 5.5, riseY: 130, driftX: -5, delay:  7.5, dur: 11.5 },
  { left: "11%", top: "30%", size: 5.5, riseY:  95, driftX:  6, delay: 10.5, dur: 10.0 },
  { left: "24%", top: "25%", size: 5.0, riseY:  70, driftX: -7, delay:  4.7, dur: 13.0 },
  { left: "37%", top: "20%", size: 5.5, riseY:  60, driftX:  3, delay: 17.0, dur: 11.0 },
  { left: "55%", top: "28%", size: 5.5, riseY:  65, driftX: -4, delay:  8.0, dur: 12.5 },
  { left: "70%", top: "22%", size: 5.0, riseY:  75, driftX:  5, delay:  1.5, dur: 14.0 },
  { left: "88%", top: "32%", size: 5.5, riseY:  80, driftX: -6, delay: 11.0, dur: 10.5 },
];

const RING_DELAYS = [0, 1.8, 3.6, 5.4, 7.2, 9.0];

export default function CultivatorImage({ mode = "card" }: CultivatorImageProps) {
  const isCover = mode === "cover";

  return (
    <div className={`relative mx-auto overflow-hidden bg-[#030712] ${
      isCover
        ? "h-full w-full rounded-none border-0 shadow-none"
        : "aspect-[16/9] w-full rounded-[2rem] border border-emerald-400/10 shadow-[0_0_80px_rgba(2,6,23,0.7)]"
    }`}>
      <style>{`
        @keyframes ci-bg-breathe  { 0%,100% { transform:scale(1); }       50% { transform:scale(1.018); } }
        @keyframes ci-fog-pulse   { 0%,100% { opacity:.5; transform:scaleY(1); }  50% { opacity:1; transform:scaleY(1.08); } }
        @keyframes ci-mist        { 0%,100% { transform:translate(0,0) scale(1); opacity:.15; }
                                    40%     { transform:translate(18px,-18px) scale(1.15); opacity:.5; }
                                    70%     { transform:translate(8px,-8px) scale(.96); opacity:.28; } }
        @keyframes ci-ring        { 0%   { transform:translate(-50%,-50%) scale(.2); opacity:.7; }
                                    100% { transform:translate(-50%,-50%) scale(6);  opacity:0;  } }
        @keyframes ci-core-a      { 0%,100% { opacity:.35; transform:translate(-50%,-50%) scale(1); }
                                    50%     { opacity:.80; transform:translate(-50%,-50%) scale(1.12); } }
        @keyframes ci-core-b      { 0%,100% { opacity:.25; transform:translate(-50%,-50%) scale(1.08); }
                                    50%     { opacity:.65; transform:translate(-50%,-50%) scale(1); } }
        @keyframes ci-hands       { 0%,100% { opacity:.2;  transform:translate(-50%,-50%) scaleX(1); }
                                    50%     { opacity:.70; transform:translate(-50%,-50%) scaleX(1.3); } }
        @keyframes ci-rot-cw      { from { transform:translate(-50%,-50%) rotate(0deg); }
                                    to   { transform:translate(-50%,-50%) rotate(360deg); } }
        @keyframes ci-rot-ccw     { from { transform:translate(-50%,-50%) rotate(360deg); }
                                    to   { transform:translate(-50%,-50%) rotate(0deg); } }
        @keyframes ci-ground      { 0%,100% { opacity:.5; transform:translateX(-50%) scaleX(.85); }
                                    50%     { opacity:1;  transform:translateX(-50%) scaleX(1.15); } }
        @keyframes ci-cultivator  { 0%,100% { transform:scale(1); }       50% { transform:scale(1.008); } }
        @keyframes ci-dust {
          0%   { transform:translate(0,0) scale(.6);                                        opacity:0;    }
          20%  {                                                                             opacity:.75;  }
          80%  {                                                                             opacity:.55;  }
          100% { transform:translate(var(--dx,0px),var(--dy,0px)) scale(.5);               opacity:0;    }
        }
      `}</style>

      {/* 背景圖 */}
      <img
        src="/background.png"
        alt="洞府背景"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ willChange: "transform", animation: "ci-bg-breathe 16s ease-in-out infinite" }}
        draggable={false}
      />

      {/* 暗角 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,6,23,0.15)_58%,rgba(2,6,23,0.55)_100%)]" />

      {/* 底部霧靄 */}
      <div
        className="absolute inset-x-0 bottom-0 z-[5]"
        style={{
          height: "45%",
          background: "linear-gradient(to top, rgba(16,185,129,0.18) 0%, rgba(6,182,212,0.10) 45%, transparent 100%)",
          filter: "blur(22px)",
          willChange: "transform, opacity",
          animation: "ci-fog-pulse 11s ease-in-out infinite",
        }}
      />

      {/* 氤氳雲霧 */}
      {mistClouds.map((m, i) => (
        <div
          key={`mist-${i}`}
          className="absolute z-[6] rounded-full pointer-events-none"
          style={{
            left: m.left, top: m.top, width: m.w, height: m.h,
            background: m.color, filter: "blur(50px)",
            willChange: "transform, opacity",
            animation: `ci-mist ${m.dur}s ease-in-out ${m.delay}s infinite`,
          }}
        />
      ))}

      {/* 靈氣波紋環 */}
      {RING_DELAYS.map((delay, i) => (
        <div
          key={`ring-${i}`}
          className="absolute z-[7] rounded-full pointer-events-none"
          style={{
            left: CX, top: CY_BODY, width: 60, height: 60,
            background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
            filter: "blur(8px)",
            willChange: "transform, opacity",
            animation: `ci-ring 5.5s ease-out ${delay}s infinite`,
          }}
        />
      ))}

      {/* 核心靈氣光暈 */}
      <div
        className={`absolute left-1/2 z-[9] rounded-full bg-emerald-300/20 blur-[55px] ${
          isCover ? "top-[46%] h-[38rem] w-[38rem]" : "top-[47%] h-[22rem] w-[22rem]"
        }`}
        style={{ willChange: "transform, opacity", animation: "ci-core-a 9s ease-in-out infinite" }}
      />
      <div
        className={`absolute left-1/2 z-[9] rounded-full bg-cyan-400/15 blur-[75px] ${
          isCover ? "top-[50%] h-[30rem] w-[30rem]" : "top-[50%] h-72 w-72"
        }`}
        style={{ willChange: "transform, opacity", animation: "ci-core-b 13s ease-in-out 3s infinite" }}
      />
      <div
        className="absolute left-1/2 z-[9] rounded-full bg-amber-300/18 blur-[40px]"
        style={{
          top: CY_HANDS,
          width: isCover ? "18%" : "22%", aspectRatio: "2/1",
          willChange: "transform, opacity",
          animation: "ci-hands 7s ease-in-out 1.5s infinite",
        }}
      />

      {/* 迴旋靈環 */}
      <div
        className="absolute left-1/2 z-[10]"
        style={{
          top: CY_BODY,
          width: isCover ? "22%" : "32%", aspectRatio: "1",
          border: "1px solid rgba(52,211,153,0.30)", borderRadius: "50%",
          boxShadow: "inset 0 0 35px rgba(52,211,153,0.12), 0 0 35px rgba(52,211,153,0.12)",
          filter: "blur(1px)",
          willChange: "transform",
          animation: "ci-rot-cw 30s linear infinite",
        }}
      />
      <div
        className="absolute left-1/2 z-[10]"
        style={{
          top: CY_BODY,
          width: isCover ? "32%" : "48%", aspectRatio: "1",
          border: "1px solid rgba(6,182,212,0.20)", borderRadius: "50%",
          filter: "blur(2px)",
          willChange: "transform",
          animation: "ci-rot-ccw 42s linear infinite",
        }}
      />
      <div
        className="absolute left-1/2 z-[10]"
        style={{
          top: CY_BODY,
          width: isCover ? "44%" : "64%", aspectRatio: "1",
          border: "1px solid rgba(99,102,241,0.12)", borderRadius: "50%",
          filter: "blur(3px)",
          willChange: "transform",
          animation: "ci-rot-cw 60s linear infinite",
        }}
      />

      {/* 修士本體 */}
      <div className="absolute inset-0 z-[15]">
        <div
          className={`absolute left-1/2 top-[72.5%] -translate-x-1/2 -translate-y-[78%] ${
            isCover ? "w-[25.5%] min-w-[240px] max-w-[500px]" : "w-[26%] min-w-[165px] max-w-[240px]"
          }`}
        >
          <div
            className="absolute bottom-[-6%] left-1/2 rounded-full"
            style={{
              width: "90%", height: "20%",
              background: "radial-gradient(ellipse, rgba(52,211,153,0.40) 0%, transparent 70%)",
              filter: "blur(10px)",
              willChange: "transform, opacity",
              animation: "ci-ground 5s ease-in-out infinite",
            }}
          />
          {/* 修士呼吸用 motion（單個，影響小，保留做入場動畫） */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="w-full"
            style={{ willChange: "transform", animation: "ci-cultivator 6s ease-in-out infinite" }}
          >
            <img
              src="/cultivator-transparent.png"
              alt="修士"
              draggable={false}
              className="block w-full h-auto select-none object-contain drop-shadow-[0_0_32px_rgba(16,185,129,0.30)]"
            />
          </motion.div>
        </div>
      </div>

      {/* 淡白靈塵 */}
      <div className="absolute inset-0 z-[20] pointer-events-none">
        {floatingDust.map((p, i) => (
          <div
            key={`dust-${i}`}
            className="absolute rounded-full"
            style={{
              left: p.left, top: p.top,
              width: p.size, height: p.size,
              background: "rgba(255,255,255,0.85)",
              boxShadow: `0 0 ${p.size * 3}px ${p.size * 2}px rgba(255,255,255,0.25)`,
              willChange: "transform, opacity",
              ["--dx" as any]: `${p.driftX}px`,
              ["--dy" as any]: `-${p.riseY}px`,
              animation: `ci-dust ${p.dur}s ease-in-out ${p.delay}s infinite backwards`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* 上下暗化 */}
      <div className="absolute inset-x-0 top-0 z-[3] h-24 bg-gradient-to-b from-black/28 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-[3] h-36 bg-gradient-to-t from-black/38 to-transparent" />
    </div>
  );
}
