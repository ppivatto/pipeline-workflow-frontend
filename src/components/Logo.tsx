import React from 'react';

interface LogoProps {
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <circle cx="20" cy="4" r="2.3" fill="rgb(37,99,235)" />
      <circle cx="24.94" cy="4.78" r="1.5" fill="rgb(37,104,228)" />
      <circle cx="29.40" cy="7.05" r="1.5" fill="rgb(37,109,220)" />
      <circle cx="32.94" cy="10.59" r="2.3" fill="rgb(37,114,213)" />
      <circle cx="35.21" cy="15.05" r="1.5" fill="rgb(36,120,205)" />
      <circle cx="36" cy="20" r="1.5" fill="rgb(36,125,198)" />
      <circle cx="35.21" cy="24.94" r="2.3" fill="rgb(36,130,190)" />
      <circle cx="32.94" cy="29.40" r="1.5" fill="rgb(36,135,183)" />
      <circle cx="29.40" cy="32.94" r="1.5" fill="rgb(36,140,176)" />
      <circle cx="24.94" cy="35.21" r="2.3" fill="rgb(36,145,168)" />
      <circle cx="20" cy="36" r="1.5" fill="rgb(35,151,161)" />
      <circle cx="15.05" cy="35.21" r="1.5" fill="rgb(35,156,153)" />
      <circle cx="10.59" cy="32.94" r="2.3" fill="rgb(35,161,146)" />
      <circle cx="7.05" cy="29.40" r="1.5" fill="rgb(35,166,139)" />
      <circle cx="4.78" cy="24.94" r="1.5" fill="rgb(35,171,131)" />
      <circle cx="4" cy="20" r="2.3" fill="rgb(35,176,124)" />
      <circle cx="4.78" cy="15.05" r="1.5" fill="rgb(34,182,116)" />
      <circle cx="7.05" cy="10.59" r="1.5" fill="rgb(34,187,109)" />
      <circle cx="10.59" cy="7.05" r="2.3" fill="rgb(34,192,101)" />
      <circle cx="15.05" cy="4.78" r="1.5" fill="rgb(34,197,94)" />
    </svg>
  );
};
