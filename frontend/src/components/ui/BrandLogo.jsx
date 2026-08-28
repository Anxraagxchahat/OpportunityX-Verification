import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * OpportunityX Canonical Brand Logo Component
 * Adheres strictly to the official Brand Asset Registry rules:
 * - Dark Mode: Dark Icon + White "Opportunity" + Orange "#FF6B00" "X"
 * - Light Mode: Light Icon + Black/Dark "Opportunity" + Orange "#FF6B00" "X"
 * - Monochromatic: Monochrome Icon + Black "Opportunity" + Pure Black "#000000" "X" (ZERO orange)
 */
export const BrandLogo = ({
  variant = 'full',
  className = '',
  height = 32,
  themeOverride = null,
  showSubtext = false,
  subtext = 'Credential Verification Registry',
}) => {
  const { theme: contextTheme } = useTheme();
  const theme = themeOverride || contextTheme || 'dark';

  // Canonical folder names per Brand Asset Registry
  const folderName = theme === 'monochromatic' ? 'monochrome' : theme === 'light' ? 'light' : 'dark';
  const iconSrc = `/brand/icon/${folderName}/opportunityx-icon-${folderName}.png`;

  if (variant === 'icon') {
    return (
      <img
        src={iconSrc}
        alt="OpportunityX Core Mark"
        width={height}
        height={height}
        className={`inline-block select-none object-contain ${className}`}
        style={{ height: `${height}px`, width: `${height}px` }}
        loading="eager"
        decoding="async"
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={iconSrc}
        alt="OpportunityX Logo Mark"
        width={height}
        height={height}
        className="object-contain shrink-0"
        style={{ height: `${height}px`, width: `${height}px` }}
        loading="eager"
        decoding="async"
      />
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline font-bold tracking-tight text-base sm:text-lg leading-none font-sans">
          <span className="text-text-primary">
            Opportunity
          </span>
          <span
            className={
              theme === 'monochromatic'
                ? 'text-text-primary font-extrabold ml-[1px]'
                : 'text-accent-brand font-extrabold ml-[1px]'
            }
          >
            X
          </span>
        </div>
        {showSubtext && (
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase mt-0.5 text-text-muted font-sans">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
