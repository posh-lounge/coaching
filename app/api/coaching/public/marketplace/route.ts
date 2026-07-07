import { phpProxyPublic } from '@/lib/api/publicphpProxy';
export async function POST(request: Request) {
  return phpProxyPublic('public/marketplace', request);
}