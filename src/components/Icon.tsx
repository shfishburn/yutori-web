import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  Bars3Icon,
  BeakerIcon,
  BoltIcon,
  BuildingLibraryIcon,
  CloudIcon,
  CpuChipIcon,
  CubeIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  FireIcon,
  GlobeAltIcon,
  HeartIcon,
  MoonIcon,
  PhotoIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SignalIcon,
  SparklesIcon,
  SunIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

type HeroProps = SVGProps<SVGSVGElement> & { title?: string };
type HeroIconType = ComponentType<HeroProps>;

const ICON_MAP: Record<string, HeroIconType> = {
  'arrow-path': ArrowPathIcon,
  'arrow-top-right': ArrowTopRightOnSquareIcon,
  'bars-3': Bars3Icon,
  'beaker': BeakerIcon,
  'shopping-bag': ShoppingBagIcon,
  'bolt': BoltIcon,
  'building-library': BuildingLibraryIcon,
  'cloud': CloudIcon,
  'cpu-chip': CpuChipIcon,
  'cube': CubeIcon,
  'envelope': EnvelopeIcon,
  'fire': FireIcon,
  'globe': GlobeAltIcon,
  'heart': HeartIcon,
  'moon': MoonIcon,
  'photo': PhotoIcon,
  'phone': DevicePhoneMobileIcon,
  'shield-check': ShieldCheckIcon,
  'signal': SignalIcon,
  'sparkles': SparklesIcon,
  'sun': SunIcon,
  'trending-down': ArrowTrendingDownIcon,
  'trending-up': ArrowTrendingUpIcon,
  'user': UserIcon,
  'wrench': WrenchScrewdriverIcon,
  'x-mark': XMarkIcon,
};

type IconProps = {
  name: string;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
};

export function Icon({ name, className = 'h-6 w-6', 'aria-label': ariaLabel, 'aria-hidden': ariaHidden }: IconProps) {
  const Component = ICON_MAP[name];
  if (!Component) return null;
  return <Component className={className} aria-label={ariaLabel} aria-hidden={ariaHidden} />;
}
