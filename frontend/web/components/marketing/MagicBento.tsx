'use client';

import { useRef, useEffect, useCallback, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import '@/styles/magic-bento.css';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '255, 255, 255';
const MOBILE_BREAKPOINT = 768;

const createParticleElement = (x: number, y: number, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.45);
    pointer-events: none;
    z-index: 20;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number,
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

type MagicBentoProps = {
  children: ReactNode;
  className?: string;
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
};

export default function MagicBento({
  children,
  className = '',
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
}: MagicBentoProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  const enhanceCard = useCallback(
    (card: HTMLElement) => {
      const particles: HTMLElement[] = [];
      const timeouts: ReturnType<typeof setTimeout>[] = [];
      let hovered = false;
      let magnetTween: gsap.core.Tween | null = null;

      card.style.setProperty('--glow-color', glowColor);
      if (textAutoHide) card.classList.add('magic-bento-card--text-autohide');
      if (enableBorderGlow) card.classList.add('magic-bento-card--border-glow');

      const clearParticles = () => {
        timeouts.forEach(clearTimeout);
        timeouts.length = 0;
        magnetTween?.kill();
        particles.forEach((particle) => {
          gsap.to(particle, {
            scale: 0,
            opacity: 0,
            duration: 0.24,
            ease: 'back.in(1.7)',
            onComplete: () => particle.remove(),
          });
        });
        particles.length = 0;
      };

      const createParticles = () => {
        if (!enableStars || shouldDisableAnimations || !hovered) return;

        const rect = card.getBoundingClientRect();
        Array.from({ length: particleCount }).forEach((_, index) => {
          const timeoutId = setTimeout(() => {
            if (!hovered) return;
            const particle = createParticleElement(
              Math.random() * rect.width,
              Math.random() * rect.height,
              glowColor,
            );

            card.appendChild(particle);
            particles.push(particle);

            gsap.fromTo(
              particle,
              { scale: 0, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.7)' },
            );

            gsap.to(particle, {
              x: (Math.random() - 0.5) * 70,
              y: (Math.random() - 0.5) * 70,
              rotation: Math.random() * 240,
              duration: 1.6 + Math.random() * 1.4,
              ease: 'none',
              repeat: -1,
              yoyo: true,
            });

            gsap.to(particle, {
              opacity: 0.25,
              duration: 1.2,
              ease: 'power2.inOut',
              repeat: -1,
              yoyo: true,
            });
          }, index * 70);

          timeouts.push(timeoutId);
        });
      };

      const onMouseEnter = () => {
        hovered = true;
        createParticles();
        if (enableTilt && !shouldDisableAnimations) {
          gsap.to(card, { rotateX: 5, rotateY: 5, duration: 0.25, ease: 'power2.out', transformPerspective: 1000 });
        }
      };

      const onMouseLeave = () => {
        hovered = false;
        clearParticles();

        if (enableTilt && !shouldDisableAnimations) {
          gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.25, ease: 'power2.out' });
        }

        if (enableMagnetism && !shouldDisableAnimations) {
          gsap.to(card, { x: 0, y: 0, duration: 0.25, ease: 'power2.out' });
        }
      };

      const onMouseMove = (event: MouseEvent) => {
        if (shouldDisableAnimations || (!enableTilt && !enableMagnetism)) return;

        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        if (enableTilt) {
          const rotateX = ((y - centerY) / centerY) * -8;
          const rotateY = ((x - centerX) / centerX) * 8;
          gsap.to(card, {
            rotateX,
            rotateY,
            duration: 0.1,
            ease: 'power2.out',
            transformPerspective: 1000,
          });
        }

        if (enableMagnetism) {
          magnetTween = gsap.to(card, {
            x: (x - centerX) * 0.04,
            y: (y - centerY) * 0.04,
            duration: 0.25,
            ease: 'power2.out',
          });
        }
      };

      const onClick = (event: MouseEvent) => {
        if (!clickEffect || shouldDisableAnimations) return;

        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const maxDistance = Math.max(
          Math.hypot(x, y),
          Math.hypot(x - rect.width, y),
          Math.hypot(x, y - rect.height),
          Math.hypot(x - rect.width, y - rect.height),
        );

        const ripple = document.createElement('div');
        ripple.style.cssText = `
          position: absolute;
          width: ${maxDistance * 2}px;
          height: ${maxDistance * 2}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(${glowColor}, 0.30) 0%, rgba(${glowColor}, 0.14) 34%, transparent 70%);
          left: ${x - maxDistance}px;
          top: ${y - maxDistance}px;
          pointer-events: none;
          z-index: 25;
        `;

        card.appendChild(ripple);
        gsap.fromTo(
          ripple,
          { scale: 0, opacity: 1 },
          {
            scale: 1,
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
            onComplete: () => ripple.remove(),
          },
        );
      };

      card.addEventListener('mouseenter', onMouseEnter);
      card.addEventListener('mouseleave', onMouseLeave);
      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('click', onClick);

      return () => {
        hovered = false;
        card.removeEventListener('mouseenter', onMouseEnter);
        card.removeEventListener('mouseleave', onMouseLeave);
        card.removeEventListener('mousemove', onMouseMove);
        card.removeEventListener('click', onClick);
        clearParticles();
      };
    },
    [
      clickEffect,
      enableBorderGlow,
      enableMagnetism,
      enableStars,
      enableTilt,
      glowColor,
      particleCount,
      shouldDisableAnimations,
      textAutoHide,
    ],
  );

  useEffect(() => {
    if (!gridRef.current) return;

    const cards = Array.from(gridRef.current.querySelectorAll<HTMLElement>('.magic-bento-card'));
    const cleanups = cards.map(enhanceCard).filter(Boolean) as Array<() => void>;

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [enhanceCard]);

  useEffect(() => {
    if (!gridRef.current || !enableSpotlight || shouldDisableAnimations) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 760px;
      height: 760px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.11) 0%,
        rgba(${glowColor}, 0.06) 18%,
        rgba(${glowColor}, 0.03) 36%,
        rgba(${glowColor}, 0.015) 58%,
        transparent 72%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;

    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const onMouseMove = (event: MouseEvent) => {
      if (!gridRef.current || !spotlightRef.current) return;

      const sectionRect = gridRef.current.getBoundingClientRect();
      const mouseInside =
        event.clientX >= sectionRect.left &&
        event.clientX <= sectionRect.right &&
        event.clientY >= sectionRect.top &&
        event.clientY <= sectionRect.bottom;

      const cards = gridRef.current.querySelectorAll<HTMLElement>('.magic-bento-card');

      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        cards.forEach((card) => card.style.setProperty('--glow-intensity', '0'));
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(event.clientX - centerX, event.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;

        const effectiveDistance = Math.max(0, distance);
        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) glowIntensity = 1;
        else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(card, event.clientX, event.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, {
        left: event.clientX,
        top: event.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.4,
        ease: 'power2.out',
      });
    };

    const onMouseLeave = () => {
      if (!gridRef.current || !spotlightRef.current) return;
      gridRef.current.querySelectorAll<HTMLElement>('.magic-bento-card').forEach((card) => {
        card.style.setProperty('--glow-intensity', '0');
      });
      gsap.to(spotlightRef.current, { opacity: 0, duration: 0.25, ease: 'power2.out' });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      spotlightRef.current?.remove();
      spotlightRef.current = null;
    };
  }, [enableSpotlight, glowColor, shouldDisableAnimations, spotlightRadius]);

  return (
    <div ref={gridRef} className={`bento-section ${className}`.trim()}>
      {children}
    </div>
  );
}
