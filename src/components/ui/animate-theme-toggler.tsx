'use client';

import { Moon, Sun } from 'lucide-react';
import { useRef } from 'react';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

type Props = {
  className?: string;
};

export const AnimatedThemeToggler = ({ className }: Props) => {
  const { theme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);

  const changeTheme = async () => {
    if (!buttonRef.current || !iconRef.current) return;

    const nextTheme = theme === 'light' ? 'dark' : 'light';

    // GSAP animate icon out
    await new Promise<void>(resolve => {
      gsap.fromTo(
        iconRef.current,
        { rotate: 0, scale: 1 },
        {
          rotate: 180,
          scale: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          onComplete: () => resolve(),
        }
      );
    });

    // Trigger view transition + theme change via next-themes
    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    }).ready;

    // Circle reveal animation
    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRad}px at ${x}px ${y}px)`],
      },
      {
        duration: 700,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      }
    );

    // GSAP animate new icon in
    gsap.fromTo(
      iconRef.current,
      { rotate: -180, scale: 0 },
      { rotate: 0, scale: 1, duration: 0.3, ease: 'power2.inOut' }
    );
  };

  return (
    <button ref={buttonRef} onClick={changeTheme} className={cn(className)}>
      <span ref={iconRef} className='flex border p-1.5 rounded-md cursor-pointer border-neutral-200'>
        {theme === 'dark' ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
      </span>
    </button>
  );
};
