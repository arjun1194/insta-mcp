import { z } from 'zod';
import { readFile } from 'fs/promises';
import { InstagramClient } from '../instagram/client.js';
import { formatErrorForMcp } from '../utils/errors.js';

// Photo Upload
export const uploadPhotoSchema = {
  file_path: z.string().describe('Absolute path to the image file to upload (JPEG or PNG).'),
  caption: z.string().optional().describe('Caption for the photo post. Default is empty.'),
};

export const uploadPhotoDescription = 'Upload a photo to Instagram as a new post.';

export async function uploadPhoto(
  client: InstagramClient,
  params: { file_path: string; caption?: string }
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const imageBuffer = await readFile(params.file_path);
    const result = await client.uploadPhoto(imageBuffer, params.caption || '');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message: 'Photo uploaded successfully',
              post: result,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: formatErrorForMcp(error),
        },
      ],
    };
  }
}

// Video Upload
export const uploadVideoSchema = {
  video_path: z
    .string()
    .describe('Absolute path to the video file to upload (MP4, H.264 codec recommended).'),
  cover_image_path: z
    .string()
    .describe('Absolute path to the cover image for the video (JPEG or PNG).'),
  caption: z.string().optional().describe('Caption for the video post. Default is empty.'),
};

export const uploadVideoDescription =
  'Upload a video to Instagram as a new post. Requires a cover image.';

export async function uploadVideo(
  client: InstagramClient,
  params: { video_path: string; cover_image_path: string; caption?: string }
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const [videoBuffer, coverBuffer] = await Promise.all([
      readFile(params.video_path),
      readFile(params.cover_image_path),
    ]);

    const result = await client.uploadVideo(videoBuffer, coverBuffer, params.caption || '');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message: 'Video uploaded successfully',
              post: result,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: formatErrorForMcp(error),
        },
      ],
    };
  }
}

// Reel Upload
export const uploadReelSchema = {
  video_path: z
    .string()
    .describe(
      'Absolute path to the reel video file (MP4, H.264 codec, vertical 9:16 aspect ratio recommended, max 90 seconds).'
    ),
  cover_image_path: z
    .string()
    .describe('Absolute path to the cover image for the reel (JPEG or PNG).'),
  caption: z.string().optional().describe('Caption for the reel. Default is empty.'),
};

export const uploadReelDescription =
  'Upload a video as an Instagram Reel. Best with vertical 9:16 aspect ratio, max 90 seconds.';

export async function uploadReel(
  client: InstagramClient,
  params: { video_path: string; cover_image_path: string; caption?: string }
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    const [videoBuffer, coverBuffer] = await Promise.all([
      readFile(params.video_path),
      readFile(params.cover_image_path),
    ]);

    const result = await client.uploadReel(videoBuffer, coverBuffer, params.caption || '');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message: 'Reel uploaded successfully',
              post: result,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: formatErrorForMcp(error),
        },
      ],
    };
  }
}
