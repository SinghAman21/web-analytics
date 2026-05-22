import RequireAuth from '@/components/auth/RequireAuth';

export default function SitesLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
