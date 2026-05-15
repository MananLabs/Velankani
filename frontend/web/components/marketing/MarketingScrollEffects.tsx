'use client';

import { useEffect } from 'react';

export function MarketingScrollEffects() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const run = async () => {
      const { gsap } = await import('gsap/dist/gsap');
      const { ScrollTrigger } = await import('gsap/dist/ScrollTrigger');
      const { CustomEase } = await import('gsap/dist/CustomEase');
      gsap.registerPlugin(ScrollTrigger, CustomEase);

      const ctx = gsap.context(() => {
      CustomEase.create('velSmooth', '0.22,1,0.36,1');
      CustomEase.create('velOut', '0.16,1,0.3,1');

      gsap.to('.grok-hero-glow', {
        yPercent: 12,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.1,
        },
      });

      gsap.fromTo(
        '.hero-title',
        { y: 24, autoAlpha: 0, filter: 'blur(10px)' },
        { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.0, ease: 'velSmooth' },
      );

      gsap.fromTo(
        '.hero-subtitle',
        { y: 16, autoAlpha: 0, filter: 'blur(8px)' },
        { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.05, delay: 0.12, ease: 'velSmooth' },
      );

      ScrollTrigger.create({
        trigger: '.hero-section',
        start: 'top top',
        end: '+=220',
        scrub: true,
        onUpdate: (self: { progress: number }) => {
          gsap.to('.nav-shell', {
            scale: 1 - self.progress * 0.035,
            backgroundColor: `rgba(0,0,0,${0.58 + self.progress * 0.16})`,
            borderColor: `rgba(255,255,255,${0.12 + self.progress * 0.08})`,
            duration: 0.12,
            overwrite: true,
          });
        },
      });

      (gsap.utils.toArray('.reveal-up') as HTMLElement[]).forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 48, autoAlpha: 0, filter: 'blur(8px)' },
          {
            y: 0,
            autoAlpha: 1,
            filter: 'blur(0px)',
            duration: 0.9,
            ease: 'velSmooth',
            delay: i * 0.03,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });

      (gsap.utils.toArray('.flip-card') as HTMLElement[]).forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 36, rotationX: 6, transformOrigin: 'center top', autoAlpha: 0.78 },
          {
            y: 0,
            rotationX: 0,
            autoAlpha: 1,
            duration: 0.95,
            ease: 'velSmooth',
            delay: i * 0.05,
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              end: 'bottom 30%',
              scrub: 0.5,
            },
          },
        );
      });

      (gsap.utils.toArray('.parallax-soft') as HTMLElement[]).forEach((el) => {
        gsap.to(el, {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      });

      (gsap.utils.toArray('.workflow-card') as HTMLElement[]).forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 16, autoAlpha: 0.7 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.65,
            ease: 'velOut',
            delay: i * 0.08,
            scrollTrigger: {
              trigger: '.showcase-section',
              start: 'top 70%',
            },
          },
        );
      });

      // Pinned premium workflow moment for the heavy orchestration section.
      ScrollTrigger.matchMedia({
        '(min-width: 1024px)': () => {
          ScrollTrigger.create({
            trigger: '.workflow-pin',
            start: 'top 26%',
            end: '+=320',
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          });
        },
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.workflow-pin',
          start: 'top 55%',
          end: 'bottom 35%',
          scrub: 1,
        },
      });
      tl.fromTo(
        '.workflow-pin .rounded-xl',
        { y: 22, scale: 0.96, autoAlpha: 0.62 },
        { y: 0, scale: 1, autoAlpha: 1, stagger: 0.1, ease: 'velOut' },
      );

      gsap.to('.feature-panel', {
        yPercent: -8,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '.feature-section',
          start: 'top 85%',
          end: 'bottom top',
          scrub: 0.9,
        },
      });

      gsap.to('.workflow-line', {
        strokeDashoffset: 0,
        duration: 1.6,
        ease: 'none',
        repeat: -1,
      });

      gsap.to('.footer-bg-image', {
        yPercent: -6,
        scale: 1.04,
        scrollTrigger: {
          trigger: '.footer-section',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      });
      });

      ScrollTrigger.refresh();
      cleanup = () => ctx.revert();
    };

    run();
    return () => cleanup?.();
  }, []);

  return null;
}
