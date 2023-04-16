import React from 'react';

import type { IconProps } from './Icon';
import { icons } from './Icon';
import { wrap } from './wrapper';

/**
 * Make button match Google Calendar's styling
 */

const button = (name: string, classList: string) =>
  wrap<
    'button',
    {
      readonly onClick:
        | ((event: React.MouseEvent<HTMLButtonElement>) => void)
        | undefined;
    }
  >(
    name,
    'button',
    `${className.googleButton} ${classList}`,
    ({ onClick: handleClick, disabled = false, ...props }) => ({
      type: 'button' as const,
      onClick: handleClick,
      disabled: disabled || handleClick === undefined,
      ...props,
    })
  );

export const className = {
  googleButton:
    'border border-solid p-2 rounded flex items-center gap-2 cursor-pointer cursor-pointer',
  buttonPrimary: `bg-white border-[#dadce0] active:bg-[#dadce0]
    [&[aria-pressed]]:bg-[#dadce0] hover:bg-gray-100`,
};

export const Button = {
  Primary: button('Button.Primary', className.buttonPrimary),
  Icon: wrap<
    'button',
    IconProps & {
      readonly onClick:
        | ((event: React.MouseEvent<HTMLButtonElement>) => void)
        | undefined;
    }
  >('Button.Icon', 'button', `icon link rounded`, ({ icon, ...props }) => ({
    ...props,
    'aria-label': props['aria-label'] ?? props.title,
    type: 'button',
    children: icons[icon],
  })),
};

export const Ul = wrap('Ul', 'ul', 'flex flex-col gap-2', { role: 'list' });

export const Label = {
  Inline: wrap(
    'Label.Inline',
    'label',
    'cursor-pointer inline-flex gap-1 items-center'
  ),
  Block: wrap('Label.Block', 'label', 'flex flex-col'),
};

export const ErrorMessage = wrap(
  'ErrorMessage',
  'div',
  'flex flex-col gap-2 p-2 text-white bg-red-500 rounded',
  {
    role: 'alert',
  }
);

export const Input = {
  Checkbox: wrap<
    'input',
    {
      readonly onValueChange?: (isChecked: boolean) => void;
      readonly readOnly?: never;
      readonly isReadOnly?: boolean;
      readonly type?: never;
      readonly children?: undefined;
    }
  >(
    'Input.Checkbox',
    'input',
    `rounded-xs m-0 w-4 h-4`,
    ({ onValueChange, isReadOnly, ...props }) => ({
      ...props,
      type: 'checkbox',
      onChange(event): void {
        // Disable onChange when readOnly
        if (props.disabled === true || isReadOnly === true) return;
        onValueChange?.((event.target as HTMLInputElement).checked);
        props.onChange?.(event);
      },
      readOnly: isReadOnly,
    })
  ),
  Text: wrap<
    'input',
    {
      readonly onValueChange?: (value: string) => void;
      readonly type?: 'If you need to specify type, use Input.Generic';
      readonly readOnly?: never;
      readonly isReadOnly?: boolean;
      readonly children?: undefined;
    }
  >(
    'Input.Text',
    'input',
    `w-full ${className.googleButton}`,
    ({ onValueChange, isReadOnly, ...props }) => ({
      ...props,
      type: 'text',
      onChange(event): void {
        onValueChange?.((event.target as HTMLInputElement).value);
        props.onChange?.(event);
      },
      readOnly: isReadOnly,
    })
  ),
  Generic: wrap<
    'input',
    {
      readonly onValueChange?: (value: string) => void;
      readonly readOnly?: never;
      readonly isReadOnly?: boolean;
      readonly children?: undefined;
    }
  >(
    'Input.Generic',
    'input',
    `w-full ${className.googleButton}`,
    ({ onValueChange, isReadOnly, ...props }) => ({
      ...props,
      onChange(event): void {
        onValueChange?.((event.target as HTMLInputElement).value);
        props.onChange?.(event);
      },
      readOnly: isReadOnly,
    })
  ),
};

export const Select = wrap<
  'select',
  {
    readonly onValueChange?: (value: string) => void;
  }
>(
  'Select',
  'select',
  `w-full pr-5 bg-right ${className.googleButton}`,
  ({ onValueChange: handleValueChange, ...props }) => ({
    ...props,
    onChange(event): void {
      const value = (event.target as HTMLSelectElement).value;

      /*
       * Workaround for Safari weirdness. See more:
       * https://github.com/specify/specify7/issues/1371#issuecomment-1115156978
       */
      if (typeof props.size !== 'number' || props.size < 2 || value !== '')
        handleValueChange?.(value);
      props.onChange?.(event);
    },
  })
);
