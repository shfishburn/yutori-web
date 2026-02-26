import {
  ArrowDownRightIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ArrowUpRightIcon,
  Bars3Icon,
  BeakerIcon,
  BoltIcon,
  BuildingLibraryIcon,
  ChevronDownIcon,
  ClockIcon,
  CloudIcon,
  CpuChipIcon,
  CubeIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  FireIcon,
  GlobeAltIcon,
  HeartIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  MinusIcon,
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
  'arrow-down-right': ArrowDownRightIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-path': ArrowPathIcon,
  'arrow-top-right': ArrowTopRightOnSquareIcon,
  'arrow-up-right': ArrowUpRightIcon,
  'bars-3': Bars3Icon,
  'beaker': BeakerIcon,
  'bolt': BoltIcon,
  'building-library': BuildingLibraryIcon,
  'chevron-down': ChevronDownIcon,
  'clock': ClockIcon,
  'cloud': CloudIcon,
  'cpu-chip': CpuChipIcon,
  'cube': CubeIcon,
  'envelope': EnvelopeIcon,
  'fire': FireIcon,
  'globe': GlobeAltIcon,
  'heart': HeartIcon,
  'light-bulb': LightBulbIcon,
  'magnifying-glass': MagnifyingGlassIcon,
  'minus': MinusIcon,
  'moon': MoonIcon,
  'phone': DevicePhoneMobileIcon,
  'photo': PhotoIcon,
  'shield-check': ShieldCheckIcon,
  'shopping-bag': ShoppingBagIcon,
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
