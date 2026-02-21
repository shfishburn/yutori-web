declare module '*.mdx' {
  import type { ComponentType } from 'react';
  const Component: ComponentType;
  export const title: string;
  export default Component;
}
