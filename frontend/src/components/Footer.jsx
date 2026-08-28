import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, Lock, Mail, Check } from 'lucide-react';
import {
  LinkedInIcon,
  GitHubIcon,
  InstagramIcon,
  YoutubeIcon,
  XIcon,
  FacebookIcon
} from './icons/BrandIcons';

const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/128134073',
    icon: LinkedInIcon,
    ariaLabel: 'OpportunityX on LinkedIn',
    colorHover: 'hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10'
  },
  {
    name: 'GitHub',
    url: 'https://github.com/Anxraagxchahat',
    icon: GitHubIcon,
    ariaLabel: 'OpportunityX on GitHub',
    colorHover: 'hover:text-text-primary hover:border-border-strong hover:bg-surface-hover'
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/theopportunityx/',
    icon: InstagramIcon,
    ariaLabel: 'OpportunityX on Instagram',
    colorHover: 'hover:text-[#E4405F] hover:border-[#E4405F]/40 hover:bg-[#E4405F]/10'
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@theopportunityX',
    icon: YoutubeIcon,
    ariaLabel: 'OpportunityX on YouTube',
    colorHover: 'hover:text-[#FF0000] hover:border-[#FF0000]/40 hover:bg-[#FF0000]/10'
  },
  {
    name: 'X',
    url: 'https://x.com/TheOpportunityX',
    icon: XIcon,
    ariaLabel: 'OpportunityX on X',
    colorHover: 'hover:text-text-primary hover:border-border-strong hover:bg-surface-hover'
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61590766896275',
    icon: FacebookIcon,
    ariaLabel: 'OpportunityX on Facebook',
    colorHover: 'hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10'
  },
  {
    name: 'Email',
    url: 'mailto:hello@opportunityx.co.in',
    icon: Mail,
    ariaLabel: 'OpportunityX Email',
    colorHover: 'hover:text-accent-brand hover:border-accent-brand/40 hover:bg-accent-subtle'
  }
];

export function Footer({ onOpenAdmin }) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleEmailClick = (e, url) => {
    if (url.startsWith('mailto:')) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText('hello@opportunityx.co.in');
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2500);
      }
    }
  };

  return (
    <footer className="w-full border-t border-border-subtle bg-canvas py-8 sm:py-10 mt-12 text-text-secondary relative transition-colors duration-200">
      
      {/* Toast Notification for Copied Email */}
      {copiedEmail && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-strong text-text-primary font-sans font-semibold text-xs shadow-elevated flex items-center gap-2 animate-fade-in">
          <Check size={14} className="text-emerald-500 stroke-[3]" />
          <span>Email copied: hello@opportunityx.co.in</span>
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        
        {/* Left: Branding & Trust Note */}
        <div className="flex flex-col gap-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="p-1 -m-1 rounded-md text-accent-brand hover:text-accent-hover hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring cursor-pointer"
              title="OpportunityX Security Node"
              aria-label="Security Node"
            >
              <ShieldCheck size={18} className="text-accent-brand" />
            </button>
            <span className="font-sans font-bold text-text-primary text-sm tracking-tight">
              OpportunityX Verification Registry
            </span>
          </div>
          <p className="text-xs text-text-muted max-w-md leading-relaxed font-sans">
            Official cryptographic verification service for credentials, internship completion certificates, and achievements issued by OpportunityX.
          </p>
        </div>

        {/* Right: Social Links & Platform Quick Links */}
        <div className="flex flex-col items-center md:items-end gap-3 text-xs text-text-secondary">
          
          {/* Circular Brand Social Icons */}
          <div className="flex items-center gap-1.5">
            {SOCIAL_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.url}
                  target={item.url.startsWith('mailto:') ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={item.ariaLabel}
                  title={item.name}
                  onClick={(e) => handleEmailClick(e, item.url)}
                  className={`w-7 h-7 rounded-full bg-surface border border-border-subtle text-text-muted flex items-center justify-center transition-all duration-150 shadow-subtle hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${item.colorHover}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>

          {/* Quick Links & Security Info */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 sm:gap-3.5 text-[11px] sm:text-xs text-text-muted font-sans pt-0.5">
            <a
              href="https://opportunityx.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-text-primary transition-colors font-medium"
            >
              <span>OpportunityX Ecosystem</span>
              <ExternalLink size={11} />
            </a>

            <span>•</span>

            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Lock size={11} className="text-accent-brand" />
              ECDSA 256-bit Encrypted
            </span>

            <span>•</span>

            <span>
              © {new Date().getFullYear()} OpportunityX. All rights reserved.
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}

export default Footer;
