export type ItemStatus = 'Available' | 'Reserved' | 'InLoan' | 'Unavailable';
export type RequestStatus = 'Open' | 'Accepted' | 'Closed' | 'Canceled';
export type OfferStatus = 'Open' | 'Accepted' | 'Rejected' | 'Withdrawn';
export type LoanStatus = 'Reserved' | 'InLoan' | 'Returned' | 'Expired';
export type MembershipRole = 'Owner' | 'Member' | 'Moderator';
export type MembershipStatus = 'Invited' | 'Active' | 'Suspended';

export type UserSummaryDto = {
  id: string;
  displayName: string;
  userName: string;
};

export type CommunitySummaryDto = {
  id: string;
  name: string;
  slug: string;
};

export type PagedResponseDto<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type CommunityListItemDto = {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdByUserId: string;
  createdAt: string;
};

export type CommunityDetailsDto = CommunityListItemDto;

export type MembershipListItemDto = {
  id: string;
  userId: string;
  communityId: string;
  role: MembershipRole;
  status: MembershipStatus;
  invitedByUserId: string | null;
  createdAt: string;
  joinedAt: string | null;
};

export type MembershipDetailsDto = MembershipListItemDto;

export type ItemListItemDto = {
  id: string;
  communityId: string;
  owner: UserSummaryDto;
  name: string;
  description: string;
  category: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type ItemDetailsDto = ItemListItemDto;

export type RequestListItemDto = {
  id: string;
  communityId: string;
  owner: UserSummaryDto;
  community: CommunitySummaryDto;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
  neededFrom: string | null;
  neededTo: string | null;
};

export type RequestDetailsDto = RequestListItemDto;

export type OfferListItemDto = {
  id: string;
  communityId: string;
  offerer: UserSummaryDto;
  community: CommunitySummaryDto;
  requestId: string;
  itemId: string | null;
  message: string;
  status: OfferStatus;
  createdAt: string;
};

export type OfferDetailsDto = OfferListItemDto;

export type LoanListItemDto = {
  id: string;
  communityId: string;
  itemId: string;
  lenderUserId: string;
  borrowerUserId: string;
  requestId: string | null;
  offerId: string | null;
  status: LoanStatus;
  startAt: string | null;
  dueAt: string | null;
  returnedAt: string | null;
};

export type LoanDetailsDto = LoanListItemDto;

export type EventListItemDto = {
  id: string;
  communityId: string;
  actorUserId: string;
  entityType: string;
  entityId: string;
  action: string;
  payload: string;
  createdAt: string;
};

export type EventDetailsDto = EventListItemDto;

export type InviteCodeResponseDto = {
  enterCode: string;
  expiresAt: string;
};

export type InviteLinkResponseDto = {
  url: string;
  expiresAt: string;
};

export type OfferStatusResponseDto = {
  id: string;
  status: OfferStatus;
};

export type ReputationDetailsDto = {
  communityId: string;
  userId: string;
  score: number;
  lendCount: number;
  returnCount: number;
  onTimeReturnCount: number;
  weights: {
    lendPoints: number;
    returnPoints: number;
    onTimeReturnBonus: number;
  };
};

export type CreateCommunityRequestDto = {
  name: string;
  slug: string;
  description: string;
};

export type UpdateCommunityRequestDto = Partial<Pick<CreateCommunityRequestDto, 'name' | 'slug' | 'description'>>;

export type CreateMembershipRequestDto = {
  communityId: string;
  enterCode: string;
};

export type UpdateMembershipRequestDto = Partial<Pick<MembershipDetailsDto, 'role' | 'status'>>;

export type UpdateMembershipRoleRequestDto = {
  role: MembershipRole;
};

export type CreateItemRequestDto = {
  communityId: string;
  name: string;
  description: string;
  category: string;
  status: ItemStatus;
};

export type UpdateItemRequestDto = Partial<Pick<CreateItemRequestDto, 'name' | 'description' | 'category' | 'status'>>;

export type CreateRequestRequestDto = {
  communityId: string;
  title: string;
  description: string;
  status: RequestStatus;
  neededFrom: string | null;
  neededTo: string | null;
};

export type UpdateRequestRequestDto = Partial<Pick<CreateRequestRequestDto, 'title' | 'description' | 'status' | 'neededFrom' | 'neededTo'>>;

export type CreateOfferRequestDto = {
  communityId: string;
  requestId: string;
  itemId: string | null;
  message: string;
  status: OfferStatus;
};

export type UpdateOfferRequestDto = Partial<Pick<CreateOfferRequestDto, 'itemId' | 'message' | 'status'>>;

export type CreateLoanRequestDto = {
  communityId: string;
  itemId: string;
  lenderUserId: string;
  borrowerUserId: string;
  requestId: string | null;
  offerId: string | null;
  status: LoanStatus;
  startAt: string | null;
  dueAt: string | null;
};

export type UpdateLoanRequestDto = Partial<Pick<CreateLoanRequestDto, 'status' | 'startAt' | 'dueAt'>>;

export type CreateEventRequestDto = Omit<EventListItemDto, 'id' | 'createdAt'>;
export type UpdateEventRequestDto = Partial<CreateEventRequestDto>;

export type LoginRequestDto = {
  username: string;
  password: string;
};

export type RegisterRequestDto = {
  username: string;
  email: string;
  password: string;
  name: string;
  lastName: string;
};

export type RecoveryRequestDto = {
  email: string;
};

export type ResetRequestDto = {
  token: string;
  password: string;
};

export type VerifyResendRequestDto = {
  email: string;
};

export type RefreshRequestDto = {
  refreshToken: string;
};

export type AcceptOfferRequestDto = {
  borrowerUserId: string;
};

export type JoinCommunityRequestDto = {
  enterCode: string;
};
