import { phpProxy } from '@/lib/api/phpProxy';
export async function POST(request: Request) {
  return phpProxy('coach/sessions', request);
}