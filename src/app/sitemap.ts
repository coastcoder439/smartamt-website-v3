import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Im statischen Export entsteht daraus beim Build die Datei sitemap.xml.
export const dynamic = 'force-static';

// Mit trailingSlash liegen alle Seiten unter einer Adresse mit Schrägstrich am Ende.
export default function sitemap(): MetadataRoute.Sitemap {
    const stand = new Date();
    return [
        { url: `${SITE_URL}/`, lastModified: stand, changeFrequency: 'monthly', priority: 1 },
        { url: `${SITE_URL}/ueber-uns/`, lastModified: stand, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${SITE_URL}/fragen/`, lastModified: stand, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${SITE_URL}/impressum/`, lastModified: stand, changeFrequency: 'yearly', priority: 0.2 },
        { url: `${SITE_URL}/datenschutz/`, lastModified: stand, changeFrequency: 'yearly', priority: 0.2 },
        { url: `${SITE_URL}/barrierefreiheit/`, lastModified: stand, changeFrequency: 'yearly', priority: 0.2 },
    ];
}
