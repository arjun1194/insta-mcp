import { z } from 'zod';
import { InstagramClient } from '../instagram/client.js';

export const uploadAlbumSchema = z.object({
  urls: z.array(z.string()).describe('List of image/video URLs to include in the album'),
  caption: z.string().optional().default(''),
});

export const uploadAlbumDescription = 'Post a carousel/album with multiple images or videos.';

export async function uploadAlbum(igClient: InstagramClient, params: any) {
  const items = await Promise.all(
    params.urls.map(async (url: string) => {
      const response = await fetch(url);
      const buffer = Buffer.from(await response.arrayBuffer());
      // Simple detection based on extension for demo, in real world we should use content-type
      const type = url.toLowerCase().endsWith('.mp4') ? 'video' : 'photo';
      return { file: buffer, type: type as 'photo' | 'video' };
    })
  );

  const result = await igClient.uploadAlbum(items, params.caption);
  return {
    content: [{ type: 'text' as const, text: `Album posted successfully: ${result.postUrl}` }],
  };
}

export const searchLocationsSchema = z.object({
  query: z.string().describe('Search query for location'),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const searchLocationsDescription = 'Search for Instagram locations/places.';

export async function searchLocations(igClient: InstagramClient, params: any) {
  const result = await igClient.searchLocations(params.query, params.lat, params.lng);
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
  };
}
