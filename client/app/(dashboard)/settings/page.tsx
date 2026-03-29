// redirect to /settings/profile
import { redirect } from 'next/navigation';
export default function SettingsPage() {
  redirect('/settings/profile');
}
