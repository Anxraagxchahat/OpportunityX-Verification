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
    colorHover: 'hover:text-[#0A66C2] hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10'
  },
  {
    name: 'GitHub',
    url: 'https://github.com/Anxraagxchahat/opportunityx',
    icon: GitHubIcon,
    ariaLabel: 'OpportunityX on GitHub',
    colorHover: 'hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-500/50 hover:bg-purple-500/10'
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/theopportunityx/',
    icon: InstagramIcon,
    ariaLabel: 'OpportunityX on Instagram',
    colorHover: 'hover:text-[#E4405F] hover:border-[#E4405F]/50 hover:bg-[#E4405F]/10'
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@theopportunityX',
    icon: YoutubeIcon,
    ariaLabel: 'OpportunityX on YouTube',
    colorHover: 'hover:text-[#FF0000] hover:border-[#FF0000]/50 hover:bg-[#FF0000]/10'
  },
  {
    name: 'X',
    url: 'https://x.com/TheOpportunityX',
    icon: XIcon,
    ariaLabel: 'OpportunityX on X',
    colorHover: 'hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-500/10'
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61590766896275',
    icon: FacebookIcon,
    ariaLabel: 'OpportunityX on Facebook',
    colorHover: 'hover:text-[#1877F2] hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10'
  },
  {
    name: 'Email',
    url: 'mailto:hello@opportunityx.co.in',
    icon: Mail,
    ariaLabel: 'OpportunityX Email',
    colorHover: 'hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10'
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
    <footer className="w-full border-t border-slate-200 dark:border-slate-800/60 bg-slate-100 dark:bg-black py-10 mt-16 text-slate-600 dark:text-slate-400 relative">
      
      {/* Toast Notification for Copied Email */}
      {copiedEmail && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xl animate-bounce flex items-center gap-2">
          <Check size={14} className="stroke-[3]" />
          <span>Email copied: hello@opportunityx.co.in</span>
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        
        {/* Left: Branding & Trust Note */}
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="p-1 -m-1 rounded-md text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 hover:scale-110 active:scale-95 transition-all focus:outline-none cursor-pointer"
              title="OpportunityX Security Node"
              aria-label="Security Node"
            >
              <ShieldCheck size={19} className="text-orange-500" />
            </button>
            <span className="font-sans font-bold text-slate-900 dark:text-slate-200 text-sm tracking-wide">
              OpportunityX Verification Platform
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-500 max-w-md leading-relaxed">
            Official cryptographic verification service for credentials, internship completion certificates, and achievements issued by OpportunityX.
          </p>
        </div>

        {/* Right: Social Links & Platform Quick Links */}
        <div className="flex flex-col items-center md:items-end gap-3 text-xs text-slate-600 dark:text-slate-400">
          
          {/* Circular Brand Social Icons */}
          <div className="flex items-center gap-2">
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
                  className={`w-8 h-8 rounded-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 cursor-pointer focus:outline-none ${item.colorHover}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>

          {/* Quick Links & Security Info */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 pt-1">
            <a
              href="https://opportunityx.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium"
            >
              <span>OpportunityX Ecosystem</span>
              <ExternalLink size={12} />
            </a>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-500 font-medium">
              <Lock size={12} className="text-slate-500 dark:text-slate-400" />
              ECDSA 256-bit Encrypted
            </span>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <span className="text-slate-500">
              © {new Date().getFullYear()} OpportunityX. All rights reserved.
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}

export default Footer;
