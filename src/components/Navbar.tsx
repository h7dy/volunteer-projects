import { getAuthUser } from '@/lib/auth';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const rawUser = await getAuthUser();
  const user = rawUser ? JSON.parse(JSON.stringify(rawUser)) : null;
  return <NavbarClient user={user} />;
}