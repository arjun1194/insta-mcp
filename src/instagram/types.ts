export interface AccountOverview {
  userId: string;
  username: string;
  fullName: string;
  bio: string;
  profilePicUrl: string;
  followerCount: number;
  followingCount: number;
  mediaCount: number;
  isPrivate: boolean;
  isVerified: boolean;
  isBusiness: boolean;
  externalUrl: string | null;
}

export interface PostInfo {
  id: string;
  shortcode: string;
  type: 'photo' | 'video' | 'carousel';
  caption: string;
  likeCount: number;
  commentCount: number;
  viewCount?: number;
  timestamp: string;
  mediaUrl: string;
}

export interface UserInfo {
  userId: string;
  username: string;
  fullName: string;
  profilePicUrl: string;
  isPrivate: boolean;
  isVerified: boolean;
}

export interface PostInsights {
  id: string;
  shortcode: string;
  type: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  viewCount?: number;
  timestamp: string;
  mediaUrl: string;
  likers?: UserInfo[];
  comments?: CommentInfo[];
}

export interface CommentInfo {
  id: string;
  text: string;
  timestamp: string;
  user: UserInfo;
  likeCount: number;
}

export interface CompareResult {
  unfollowers: UserInfo[];
  fans: UserInfo[];
}

export interface UserSearchResult {
  userId: string;
  username: string;
  fullName: string;
  profilePicUrl: string;
  isPrivate: boolean;
  isVerified: boolean;
  followerCount?: number;
  profileUrl: string;
}

export interface HashtagSearchResult {
  id: string;
  name: string;
  mediaCount: number;
  searchResultSubtitle: string;
  url: string;
}

export interface PlaceSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  url: string;
}

export interface PublishResult {
  id: string;
  shortcode: string;
  postUrl: string;
  caption: string;
  mediaType: 'photo' | 'video' | 'reel';
}

export interface FollowResult {
  userId: string;
  username: string;
  followedBy: boolean;
  following: boolean;
  outgoingRequest: boolean;
  status: 'followed' | 'requested' | 'unfollowed';
}

export interface LocationInfo {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  city?: string;
}

export interface ProfileEditOptions {
  name?: string;
  username?: string;
  biography?: string;
  website?: string;
  email?: string;
  phoneNumber?: string;
  gender?: 1 | 2 | 3; // 1: male, 2: female, 3: unknown
}

export interface DirectThread {
  threadId: string;
  threadTitle: string;
  users: UserInfo[];
  lastMessage?: string;
  timestamp: string;
}

export interface DirectMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  itemType: string;
}
