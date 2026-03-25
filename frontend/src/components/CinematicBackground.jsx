import React, { useEffect, useRef } from 'react';

const CinematicBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const snowflakes = [];
    const SNOWFLAKE_COUNT = 15;

    for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
      const flake = document.createElement('div');
      flake.textContent = '❄';
      flake.className = 'snowflake';
      flake.style.cssText = `
        left: ${Math.random() * 100}vw;
        font-size: ${Math.random() * 10 + 5}px;
        opacity: ${Math.random() * 0.15 + 0.05};
        animation-duration: ${Math.random() * 20 + 15}s;
        animation-delay: ${Math.random() * -20}s;
      `;
      container.appendChild(flake);
      snowflakes.push(flake);
    }

    return () => snowflakes.forEach(f => f.remove());
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none" ref={containerRef} />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-900/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-rose-800/5 rounded-full blur-[80px] animate-pulse delay-2000" />
      </div>
    </>
  );
};

export default CinematicBackground;
