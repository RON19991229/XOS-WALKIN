'use client';

/**
 * TaglineMarquee — vertical rotating marquee that cycles through
 * the same tagline in EN / 中文 / BM, every 3 seconds.
 *
 * Per user spec (mockup v3, option 3):
 *   - Font: Archivo Black for EN + BM (matches WELCOME heading)
 *   - Font: Inter 900 for ZH (Archivo Black has no CJK glyphs)
 *   - Size: 38px display, with yellow-highlighted keyword
 *   - Yellow underline below text + small lang tag at bottom
 *   - 9-second loop = 3 seconds per language, smooth ease-in-out
 */
export default function TaglineMarquee() {
  return (
    <div className="relative overflow-hidden h-[170px] my-6">
      <div className="marquee-track">
        <MarqueeItem
          textNode={
            <>
              REGISTER ONCE.
              <br />
              <span className="text-accent">FAST CHECK-IN</span>
              <br />
              NEXT TIME.
            </>
          }
          langTag="ENGLISH"
          isChinese={false}
        />
        <MarqueeItem
          textNode={
            <>
              只需一次注册
              <br />
              <span className="text-accent">下次快速 CHECK-IN</span>
            </>
          }
          langTag="中文"
          isChinese={true}
        />
        <MarqueeItem
          textNode={
            <>
              SEKALI DAFTAR
              <br />
              <span className="text-accent">SELAMANYA PANTAS</span>
            </>
          }
          langTag="BAHASA MELAYU"
          isChinese={false}
        />
        {/* Duplicate first item for seamless loop */}
        <MarqueeItem
          textNode={
            <>
              REGISTER ONCE.
              <br />
              <span className="text-accent">FAST CHECK-IN</span>
              <br />
              NEXT TIME.
            </>
          }
          langTag="ENGLISH"
          isChinese={false}
        />
      </div>

      <style jsx>{`
        .marquee-track {
          animation: marquee-rotate 9s ease-in-out infinite;
        }
        @keyframes marquee-rotate {
          0%, 27%   { transform: translateY(0); }
          33%, 60%  { transform: translateY(-170px); }
          66%, 93%  { transform: translateY(-340px); }
          100%      { transform: translateY(-510px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </div>
  );
}

function MarqueeItem({
  textNode,
  langTag,
  isChinese,
}: {
  textNode: React.ReactNode;
  langTag: string;
  isChinese: boolean;
}) {
  // Chinese must use Inter 900 (Archivo Black has no CJK chars)
  // EN + BM use font-display (= Archivo Black), matching WELCOME heading
  const fontClass = isChinese
    ? 'font-sans font-black tracking-tight'
    : 'font-display tracking-tighter';

  return (
    <div className="h-[170px] flex flex-col items-center justify-center px-4 text-center">
      <div
        className={`${fontClass} text-bone leading-[0.92]`}
        style={{ fontSize: '38px' }}
      >
        {textNode}
      </div>
      <div className="w-[70px] h-[5px] bg-accent mt-3 mb-1.5" />
      <div className="font-mono text-[9px] tracking-[0.5em] text-neutral-500">
        {langTag}
      </div>
    </div>
  );
}
