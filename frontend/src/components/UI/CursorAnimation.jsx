import { useEffect, useRef, useState } from 'react';

export default function CursorAnimation() {
  const spotlightRef = useRef(null);
  const dotRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  useEffect(() => {
    // Check for touch/fine pointer
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    let mouseX = -500;
    let mouseY = -500;
    let spotX = -500;
    let spotY = -500;
    let dotX = -500;
    let dotY = -500;
    let animId;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) setVisible(true);

      // Check if hovering over interactive element
      const target = e.target;
      const interactive = target.closest('button, a, input, select, textarea, .runs-row, .card, .stat-card, .sidebar-link, .tag');
      setIsHoveringInteractive(!!interactive);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    const render = () => {
      // Linear interpolation for smooth trailing
      spotX += (mouseX - spotX) * 0.08;
      spotY += (mouseY - spotY) * 0.08;

      dotX += (mouseX - dotX) * 0.35;
      dotY += (mouseY - dotY) * 0.35;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${spotX}px, ${spotY}px, 0)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      }

      animId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [visible]);

  return (
    <>
      <div
        ref={spotlightRef}
        className="cursor-spotlight"
        style={{
          opacity: visible ? (isHoveringInteractive ? 0.9 : 0.6) : 0,
          transform: isHoveringInteractive ? 'scale(1.25)' : 'scale(1)',
          transition: 'opacity 0.25s ease, transform 0.2s ease',
        }}
      />
      <div
        ref={dotRef}
        className="cursor-dot"
        style={{
          opacity: visible ? 1 : 0,
          width: isHoveringInteractive ? 14 : 8,
          height: isHoveringInteractive ? 14 : 8,
          marginTop: isHoveringInteractive ? -7 : -4,
          marginLeft: isHoveringInteractive ? -7 : -4,
          backgroundColor: isHoveringInteractive ? 'var(--cf-orange)' : '#ffffff',
          boxShadow: isHoveringInteractive ? '0 0 16px var(--cf-orange)' : '0 0 10px rgba(255, 255, 255, 0.8)',
          transition: 'width 0.2s, height 0.2s, background-color 0.2s, box-shadow 0.2s, opacity 0.2s',
        }}
      />
    </>
  );
}
