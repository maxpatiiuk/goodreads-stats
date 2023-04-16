/**
 * All icons are either from https://heroicons.dev/, or created manually
 * Licenced under MIT
 * All icons have the "solid" style as it is better for small icons
 */

import React from 'react';

export const iconClassName = 'w-6 h-6 flex-shrink-0';

/**
 * When adding new icons, remember to change className to iconClassName
 * and add aria-hidden=true
 */
// eslint-disable-next-line capitalized-comments
// prettier-ignore
export const icons = {
  chevronDown: <svg aria-hidden className={iconClassName} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" fillRule="evenodd" /></svg>,
  chevronRight: <svg aria-hidden className={iconClassName} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" fillRule="evenodd" /></svg>,
} as const;

export type IconProps = {
  // Require title attribute
  readonly title: string;
  // Require passing one of the defined icons
  readonly icon: Icon;
  // Don't allow passing children
  readonly children?: undefined;
};

export type Icon = keyof typeof icons;
