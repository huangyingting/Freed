import { redirect } from 'next/navigation';

export default function NuxRedirectPage() {
  redirect('/record?nux=1');
}
