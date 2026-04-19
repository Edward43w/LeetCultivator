// Pure CSS animations — zero JS overhead, GPU compositor only

const mistClouds = [
  { left: "10%", top: "55%", w: "45%", h: "28%", color: "rgba(16,185,129,0.05)", delay: 0,  dur: 33 },
  { left: "50%", top: "60%", w: "40%", h: "24%", color: "rgba(6,182,212,0.04)",  delay: 4,  dur: 39 },
  { left: "25%", top: "72%", w: "55%", h: "30%", color: "rgba(99,102,241,0.04)", delay: 8,  dur: 45 },
  { left: "5%",  top: "68%", w: "38%", h: "20%", color: "rgba(52,211,153,0.03)", delay: 2,  dur: 36 },
  { left: "60%", top: "50%", w: "42%", h: "26%", color: "rgba(56,189,248,0.05)", delay: 10, dur: 42 },
];

const particles = [
  { left: "15%", top: "30%", size: 2,   delay: 0,   dur: 15, color: "rgba(52,211,153,0.50)",  glow: "rgba(52,211,153,0.3)"  },
  { left: "85%", top: "24%", size: 3,   delay: 2.7, dur: 16, color: "rgba(56,189,248,0.45)",  glow: "rgba(56,189,248,0.2)"  },
  { left: "52%", top: "10%", size: 1.5, delay: 1.1, dur: 15, color: "rgba(251,191,36,0.40)",  glow: "rgba(251,191,36,0.2)"  },
  { left: "62%", top: "82%", size: 2.5, delay: 0.4, dur: 16, color: "rgba(52,211,153,0.45)",  glow: "rgba(52,211,153,0.3)"  },
  { left: "8%",  top: "48%", size: 2,   delay: 4.0, dur: 16, color: "rgba(99,102,241,0.40)",  glow: "rgba(99,102,241,0.2)"  },
  { left: "75%", top: "65%", size: 3,   delay: 3.0, dur: 16, color: "rgba(52,211,153,0.50)",  glow: "rgba(52,211,153,0.3)"  },
  { left: "35%", top: "45%", size: 2.5, delay: 1.8, dur: 14, color: "rgba(16,185,129,0.45)",  glow: "rgba(16,185,129,0.25)" },
  { left: "78%", top: "15%", size: 3,   delay: 4.2, dur: 18, color: "rgba(6,182,212,0.40)",   glow: "rgba(6,182,212,0.2)"   },
  { left: "43%", top: "28%", size: 2.5, delay: 0.3, dur: 17, color: "rgba(99,102,241,0.40)",  glow: "rgba(99,102,241,0.2)"  },
  { left: "20%", top: "15%", size: 2,   delay: 5.5, dur: 16, color: "rgba(245,158,11,0.40)",  glow: "rgba(245,158,11,0.2)"  },
  { left: "68%", top: "75%", size: 2,   delay: 3.7, dur: 16, color: "rgba(99,102,241,0.38)",  glow: "rgba(99,102,241,0.2)"  },
  { left: "45%", top: "40%", size: 3,   delay: 0.8, dur: 16, color: "rgba(16,185,129,0.50)",  glow: "rgba(16,185,129,0.3)"  },
];

export const sharedMistClouds = mistClouds;
export const sharedParticles = particles;

export default function BackgroundParticles() {
  return (
    <>
      <style>{`
        @keyframes bp-mist {
          0%,100% { transform: translate(0,0) scale(1);   opacity: 0.1; }
          40%      { transform: translate(18px,-20px) scale(1.12); opacity: 0.35; }
          70%      { transform: translate(8px,-10px) scale(0.96);  opacity: 0.18; }
        }
        @keyframes bp-particle-even {
          0%,100% { transform: translate(0,0) scale(0.8); opacity: 0; }
          30%     { opacity: 0.75; }
          50%     { transform: translate(14px,-28px) scale(1.3); opacity: 0.4; }
        }
        @keyframes bp-particle-odd {
          0%,100% { transform: translate(0,0) scale(0.8); opacity: 0; }
          30%     { opacity: 0.75; }
          50%     { transform: translate(-14px,-28px) scale(1.3); opacity: 0.4; }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
        {mistClouds.map((m, i) => (
          <div
            key={`mist-${i}`}
            className="absolute rounded-full"
            style={{
              left: m.left, top: m.top, width: m.w, height: m.h,
              background: m.color,
              filter: "blur(60px)",
              willChange: "transform, opacity",
              animation: `bp-mist ${m.dur}s ease-in-out ${m.delay}s infinite`,
            }}
          />
        ))}
        {particles.map((p, i) => (
          <span
            key={`pt-${i}`}
            className="absolute rounded-full mix-blend-screen"
            style={{
              left: p.left, top: p.top,
              width: p.size, height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 4}px ${p.size * 1.5}px ${p.glow}`,
              willChange: "transform, opacity",
              animation: `${i % 2 === 0 ? 'bp-particle-even' : 'bp-particle-odd'} ${p.dur}s ease-in-out ${p.delay}s infinite backwards`,
              opacity: 0,
            }}
          />
        ))}
      </div>
    </>
  );
}
