import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  size?: number;
}

/**
 * AXA Logo component.
 * Renders the official AXA logo with the red diagonal line.
 * Automatically switches between dark-bg (white text) and light-bg (blue text) variants.
 */
export const Logo: React.FC<LogoProps> = ({ size = 40 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AXA brand colors
  const bgColor = isDark ? '#00008f' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#00008f';
  const borderColor = isDark ? 'transparent' : '#00008f';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Background */}
      <rect x="2" y="2" width="96" height="96" fill={bgColor} stroke={borderColor} strokeWidth="3" rx="4" />

      {/* Red diagonal line */}
      <line x1="58" y1="2" x2="88" y2="82" stroke="#ff1721" strokeWidth="8" strokeLinecap="round" />

      {/* AXA text */}
      <text
        x="50"
        y="82"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900"
        fontSize="42"
        fill={textColor}
        letterSpacing="-2"
      >
        AXA
      </text>
    </svg>
  );
};
