import { z } from 'zod';
import { InstagramClient } from '../instagram/client.js';

export const getInboxSchema = z.object({
  limit: z.number().optional().default(20),
});

export const getInboxDescription = 'Get the list of recent direct message threads.';

export async function getInbox(igClient: InstagramClient, params: any) {
  const result = await igClient.getInbox(params.limit);
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
  };
}

export const sendDirectMessageSchema = z.object({
  usernames: z
    .array(z.string())
    .describe('List of usernames to send message to (creates a group if > 1)'),
  text: z.string().describe('The message content'),
});

export const sendDirectMessageDescription = 'Send a direct message to one or more users.';

export async function sendDirectMessage(igClient: InstagramClient, params: any) {
  const userIds = await Promise.all(
    params.usernames.map(async (username: string) => {
      const user = await igClient.resolveUserId(username);
      return user;
    })
  );

  const result = await igClient.sendDirectMessage(userIds, params.text);
  return {
    content: [
      { type: 'text' as const, text: `Message sent successfully. Thread ID: ${result.thread_id}` },
    ],
  };
}

export const getDirectMessagesSchema = z.object({
  threadId: z.string().describe('The ID of the direct message thread'),
  limit: z.number().optional().default(20),
});

export const getDirectMessagesDescription =
  'Get message history for a specific direct message thread.';

export async function getDirectMessages(igClient: InstagramClient, params: any) {
  const result = await igClient.getDirectMessages(params.threadId, params.limit);
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
  };
}

export const reactToMessageSchema = z.object({
  threadId: z.string().describe('The ID of the direct message thread'),
  messageId: z.string().describe('The ID of the specific message to react to'),
  reaction: z
    .string()
    .optional()
    .default('like')
    .describe('The reaction (currently only "like" is widely supported)'),
});

export const reactToMessageDescription = 'React (like) to a specific message in a direct thread.';

export async function reactToMessage(igClient: InstagramClient, params: any) {
  await igClient.reactToMessage(params.threadId, params.messageId, params.reaction);
  return {
    content: [
      { type: 'text' as const, text: `Successfully reacted to message ${params.messageId}` },
    ],
  };
}

export const getPendingRequestsSchema = z.object({});

export const getPendingRequestsDescription = 'Get pending direct message requests.';

export async function getPendingRequests(igClient: InstagramClient, _params: any) {
  const result = await igClient.getPendingDirectRequests();
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
  };
}

export const muteThreadSchema = z.object({
  threadId: z.string().describe('The ID of the thread to mute'),
  mute: z.boolean().optional().default(true).describe('Set to true to mute, false to unmute'),
});

export const muteThreadDescription = 'Mute or unmute a direct message thread.';

export async function muteThread(igClient: InstagramClient, params: any) {
  if (params.mute) {
    await igClient.muteThread(params.threadId);
  } else {
    await igClient.unmuteThread(params.threadId);
  }
  return {
    content: [
      {
        type: 'text' as const,
        text: `Thread ${params.threadId} ${params.mute ? 'muted' : 'unmuted'} successfully`,
      },
    ],
  };
}

export const leaveThreadSchema = z.object({
  threadId: z.string().describe('The ID of the thread to leave'),
});

export const leaveThreadDescription = 'Leave a group direct message thread.';

export async function leaveThread(igClient: InstagramClient, params: any) {
  await igClient.leaveThread(params.threadId);
  return {
    content: [{ type: 'text' as const, text: `Successfully left thread ${params.threadId}` }],
  };
}
