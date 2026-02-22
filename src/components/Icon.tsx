import {
  ArrowPathIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BeakerIcon,
  BoltIcon,
  BuildingLibraryIcon,
  CloudIcon,
  CpuChipIcon,
  CubeIcon,
  DevicePhoneMobileIcon,
  FireIcon,
  GlobeAltIcon,
  HeartIcon,
  MoonIcon,
  ShieldCheckIcon,
  SignalIcon,
  SparklesIcon,
  SunIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

type HeroProps = SVGProps<SVGSVGElement> & { title?: string };
type HeroIconType = ComponentType<HeroProps>;

const ICON_MAP: Record<string, HeroIconType> = {
  'arrow-path': ArrowPathIcon,
  'beaker': BeakerIcon,
  'bolt': BoltIcon,
  'building-library': BuildingLibraryIcon,
  'cloud': CloudIcon,
  'cpu-chip': CpuChipIcon,
  'cube': CubeIcon,
  'fire': FireIcon,
  'globe': GlobeAltIcon,
  'heart': HeartIcon,
  'moon': MoonIcon,
  'phone': DevicePhoneMobileIcon,
  'shield-check': ShieldCheckIcon,
  'signal': SignalIcon,
  'sparkles': SparklesIcon,
  'sun': SunIcon,
  'trending-down': ArrowTrendingDownIcon,
  'trending-up': ArrowTrendingUpIcon,
  'user': UserIcon,
  'wrench': WrenchScrewdriverIcon,
};

type IconProps = {
  name: string;
  className?: string;
  'aria-label'?: string;
};

export function Icon({ name, className = 'h-6 w-6', 'aria-label': ariaLabel }: IconProps) {
  const Component = ICON_MAP[name];
  if (!Component) return null;
  return <Component className={className} aria-label={ariaLabel} />;
}
