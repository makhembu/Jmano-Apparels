import { AwsClient } from 'aws4fetch';

interface Env {
  BUCKET: R2Bucket;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  R2_ENDPOINT: string;
  ALLOWED_ORIGINS: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
    const isAllowed = allowedOrigins.some(o => origin === o || origin.endsWith(`.${new URL(o).hostname}`));

    const corsHeaders = {
      'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0] || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/presign-upload') {
      return this.handlePresignUpload(request, env, corsHeaders);
    }

    if (request.method === 'GET' && url.pathname === '/list') {
      return this.handleList(request, env, corsHeaders);
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },

  async handlePresignUpload(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    try {
      const { key, contentType, expiresIn = 3600 } = await request.json<{
        key: string;
        contentType: string;
        expiresIn?: number;
      }>();

      if (!key || !contentType) {
        return new Response(JSON.stringify({ error: 'key and contentType required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const client = new AwsClient({
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        region: 'auto',
        service: 's3',
      });

      const endpoint = new URL(env.R2_ENDPOINT);
      endpoint.hostname = `${env.R2_BUCKET_NAME}.${endpoint.hostname}`;

      const presignUrl = new URL(`/${key}`, endpoint);
      presignUrl.searchParams.set('X-Amz-Expires', String(expiresIn));

      const signed = await client.sign(presignUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        aws: { signQuery: true },
      });

      return new Response(JSON.stringify({ url: signed.url, key }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },

  async handleList(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
    try {
      const url = new URL(request.url);
      const prefix = url.searchParams.get('prefix') || '';
      const limit = parseInt(url.searchParams.get('limit') || '100', 10);
      const cursor = url.searchParams.get('cursor') || undefined;

      const listed = await env.BUCKET.list({
        prefix,
        limit,
        cursor,
      });

      const objects = listed.objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        etag: obj.etag,
        lastModified: obj.uploaded,
        url: `${env.R2_ENDPOINT.replace('https://', `https://${env.R2_BUCKET_NAME}.`)}/${obj.key}`,
      }));

      return new Response(JSON.stringify({
        objects,
        truncated: listed.truncated,
        cursor: listed.cursor,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
