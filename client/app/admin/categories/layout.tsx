import { NavigationProvider } from '@/contexts/NavigationContext';

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}
