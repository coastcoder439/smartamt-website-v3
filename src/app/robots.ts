import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Im statischen Export entsteht daraus beim Build die Datei robots.txt.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [{ userAgent: '*', allow: '/' }],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
