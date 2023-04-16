import type { IR, RA, RR } from '../../utils/types';
import type { TagProps } from './wrapper';
import { wrap } from './wrapper';

/**
 * A wrapper for wrap() to generate links that have [href] attribute required
 */
const linkComponent = <EXTRA_PROPS extends IR<unknown> = RR<never, never>>(
  name: string,
  className: string,
  initialProps?:
    | TagProps<'a'>
    | ((props: Readonly<EXTRA_PROPS> & TagProps<'a'>) => TagProps<'a'>)
) =>
  wrap<
    'a',
    EXTRA_PROPS & {
      readonly href: string;
      readonly children?:
        | JSX.Element
        | RA<JSX.Element | string | false | undefined>
        | string;
      readonly title?: string | undefined;
      readonly 'aria-label'?: string | undefined;
    }
  >(name, 'a', className, initialProps);

export const Link = {
  Default: linkComponent('Link.Default', 'link'),
} as const;
