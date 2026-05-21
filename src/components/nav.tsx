'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Model', href: '/#model' },
  { label: 'Platform', href: '/#platform' },
  { label: 'Read docs_', href: '/docs', isPill: true },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Github', href: 'https://github.com/The-17/agentsecrets', isExternal: true },
];

export default function Nav({ page }: { page?: string }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileOpen]);

  return (
    <>
      <nav
        className='fixed top-0 left-0 right-0 z-[200] flex items-center justify-between bg-white/10 backdrop-blur-xl border-b border-white/10'
        style={{ 
          padding: 'clamp(14px, 3vw, 18px) 24px'
        }}
      >
        {/* Logo */}
        <div className='flex items-center shrink-0'>
          <Link 
            href='/' 
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              setIsMobileOpen(false);
            }}
          >
            <Image
              src='/Logo.png'
              alt='Agent Secrets'
              width={200}
              height={45}
              className='h-[28px] md:h-[40px] w-auto object-contain'
              priority
            />
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className='hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8'>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
              onClick={(e) => {
                if (!link.isExternal && link.href.startsWith('/#')) {
                  const targetId = link.href.split('#')[1];
                  if (pathname === '/') {
                    e.preventDefault();
                    const el = document.getElementById(targetId);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    e.preventDefault();
                    window.location.href = link.href;
                  }
                } else if (!link.isExternal && link.href === '/docs') {
                  if (pathname !== '/docs') {
                    e.preventDefault();
                    window.location.href = '/docs';
                  }
                }
              }}
              className={
                link.isPill
                  ? 'btn-pill-teal'
                  : 'text-[13px] font-medium text-[#1B1B1B]/50 hover:text-[#1B1B1B] transition-colors font-poppins'
              }
            >
              {link.label}{link.isExternal && ' \u2197'}
            </Link>
          ))}
        </div>

        {/* Desktop Right spacer */}
        <div className='hidden md:block w-[160px] shrink-0' />

        {/* Mobile Hamburger Toggle */}
        <button 
          className='md:hidden flex items-center justify-center p-2 -mr-1 text-[#1B1B1B] z-[210]'
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* FULL SCREEN MOBILE MENU */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[190] bg-white flex flex-col justify-center items-center px-6 md:hidden'
          >
            <div className='flex flex-col gap-9 items-center text-center'>
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      if (!link.isExternal && link.href.startsWith('/#')) {
                        const targetId = link.href.split('#')[1];
                        if (pathname === '/') {
                          e.preventDefault();
                          const el = document.getElementById(targetId);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          }
                        } else {
                          e.preventDefault();
                          window.location.href = link.href;
                        }
                      } else if (!link.isExternal && link.href === '/docs') {
                        if (pathname !== '/docs') {
                          e.preventDefault();
                          window.location.href = '/docs';
                        }
                      }
                      setIsMobileOpen(false);
                    }}
                    target={link.isExternal ? '_blank' : undefined}
                    rel={link.isExternal ? 'noopener noreferrer' : undefined}
                    className={
                      link.isPill
                        ? 'btn-pill-teal inline-flex px-8 py-2.5 text-[15px]'
                        : 'text-[28px] font-medium text-[#1B1B1B] font-poppins'
                    }
                  >
                    {link.label}{link.isExternal && ' \u2197'}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
