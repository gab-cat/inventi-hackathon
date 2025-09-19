import { Id } from '../../../../convex/_generated/dataModel';

export interface Poll {
  _id: Id<'polls'>;
  _creationTime: number;
  propertyId: Id<'properties'>;
  createdBy: Id<'users'>;
  title: string;
  description: string;
  question: string;
  options: string[];
  pollType: 'single_choice' | 'multiple_choice' | 'rating' | 'text';
  isActive: boolean;
  allowAnonymous: boolean;
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
  // Denormalized fields
  creatorName?: string;
  creatorEmail?: string;
}

export interface PollResponse {
  _id: Id<'pollResponses'>;
  _creationTime: number;
  pollId: Id<'polls'>;
  userId?: Id<'users'>;
  selectedOptions: number[];
  textResponse?: string;
  submittedAt: number;
  // Denormalized fields
  userName?: string;
  userEmail?: string;
}

export interface PollWithResponses extends Poll {
  responses: PollResponse[];
}

export interface PollStats {
  totalResponses: number;
  optionCounts: { [key: string]: number };
  textResponses: string[];
  poll: Poll;
}

export interface CreatePollForm {
  propertyId: Id<'properties'>;
  title: string;
  description: string;
  question: string;
  options: string[];
  pollType: 'single_choice' | 'multiple_choice' | 'rating' | 'text';
  allowAnonymous: boolean;
  expiresAt?: number;
}

export interface UpdatePollForm {
  title?: string;
  description?: string;
  question?: string;
  options?: string[];
  pollType?: 'single_choice' | 'multiple_choice' | 'rating' | 'text';
  allowAnonymous?: boolean;
  expiresAt?: number;
  isActive?: boolean;
}

export interface PollFilters {
  propertyId?: Id<'properties'>;
  isActive?: boolean;
  pollType?: string;
  createdBy?: Id<'users'>;
}

export interface UsePollsReturn {
  polls: Poll[];
  isLoading: boolean;
  error?: string;
  refetch: () => void;
}

export interface UsePollMutationsReturn {
  createPoll: (data: CreatePollForm) => Promise<void>;
  updatePoll: (pollId: Id<'polls'>, data: UpdatePollForm) => Promise<void>;
  deletePoll: (pollId: Id<'polls'>) => Promise<void>;
  submitResponse: (pollId: Id<'polls'>, selectedOptions?: number[], textResponse?: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
}
