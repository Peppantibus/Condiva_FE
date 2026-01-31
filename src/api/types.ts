export type ItemStatus = 'Available' | 'Reserved' | 'InLoan' | 'Unavailable';
export type RequestStatus = 'Open' | 'Accepted' | 'Closed' | 'Canceled';
export type OfferStatus = 'Open' | 'Accepted' | 'Rejected' | 'Withdrawn';
export type LoanStatus = 'Reserved' | 'InLoan' | 'Returned' | 'Expired';
export type MembershipRole = 'Owner' | 'Member' | 'Moderator';
export type MembershipStatus = 'Invited' | 'Active' | 'Suspended';

type NonUndefined<T> = T extends undefined ? never : T;
type DeepRequired<T> =
  T extends Function ? T :
  T extends Array<infer U> ? Array<DeepRequired<NonUndefined<U>>> :
  T extends object ? { [K in keyof T]-?: DeepRequired<NonUndefined<T[K]>> } :
  NonUndefined<T>;

export type AccessTokenResult = DeepRequired<import('./client/client.api').IAccessTokenResult>;
export type RefreshTokenDto = DeepRequired<import('./client/client.api').IRefreshTokenDto>;
export type UserDto = DeepRequired<import('./client/client.api').IUserDto>;
export type UserSummaryDto = DeepRequired<import('./client/client.api').IUserSummaryDto>;
export type CommunitySummaryDto = DeepRequired<import('./client/client.api').ICommunitySummaryDto>;
export type CommunityListItemDto = DeepRequired<import('./client/client.api').ICommunityListItemDto>;
export type CommunityDetailsDto = DeepRequired<import('./client/client.api').ICommunityDetailsDto>;
export type MembershipListItemDto = DeepRequired<import('./client/client.api').IMembershipListItemDto>;
export type MembershipDetailsDto = DeepRequired<import('./client/client.api').IMembershipDetailsDto>;
export type ItemListItemDto = DeepRequired<import('./client/client.api').IItemListItemDto>;
export type ItemDetailsDto = DeepRequired<import('./client/client.api').IItemDetailsDto>;
export type RequestListItemDto = DeepRequired<import('./client/client.api').IRequestListItemDto>;
export type RequestDetailsDto = DeepRequired<import('./client/client.api').IRequestDetailsDto>;
export type OfferListItemDto = DeepRequired<import('./client/client.api').IOfferListItemDto>;
export type OfferDetailsDto = DeepRequired<import('./client/client.api').IOfferDetailsDto>;
export type OfferStatusResponseDto = DeepRequired<import('./client/client.api').IOfferStatusResponseDto>;
export type LoanListItemDto = DeepRequired<import('./client/client.api').ILoanListItemDto>;
export type LoanDetailsDto = DeepRequired<import('./client/client.api').ILoanDetailsDto>;
export type EventListItemDto = DeepRequired<import('./client/client.api').IEventListItemDto>;
export type EventDetailsDto = DeepRequired<import('./client/client.api').IEventDetailsDto>;
export type InviteCodeResponseDto = DeepRequired<import('./client/client.api').IInviteCodeResponseDto>;
export type InviteLinkResponseDto = DeepRequired<import('./client/client.api').IInviteLinkResponseDto>;
export type ReputationDetailsDto = DeepRequired<import('./client/client.api').IReputationDetailsDto>;
export type ReputationWeightsDto = DeepRequired<import('./client/client.api').IReputationWeightsDto>;
export type ItemListItemDtoPagedResponseDto = DeepRequired<import('./client/client.api').IItemListItemDtoPagedResponseDto>;
export type OfferListItemDtoPagedResponseDto = DeepRequired<import('./client/client.api').IOfferListItemDtoPagedResponseDto>;
export type RequestListItemDtoPagedResponseDto = DeepRequired<import('./client/client.api').IRequestListItemDtoPagedResponseDto>;

export type CreateCommunityRequestDto = import('./client/client.api').ICreateCommunityRequestDto;
export type UpdateCommunityRequestDto = import('./client/client.api').IUpdateCommunityRequestDto;
export type JoinCommunityRequestDto = import('./client/client.api').IJoinCommunityRequestDto;
export type CreateMembershipRequestDto = import('./client/client.api').ICreateMembershipRequestDto;
export type UpdateMembershipRequestDto = import('./client/client.api').IUpdateMembershipRequestDto;
export type UpdateMembershipRoleRequestDto = import('./client/client.api').IUpdateMembershipRoleRequestDto;
export type CreateItemRequestDto = import('./client/client.api').ICreateItemRequestDto;
export type UpdateItemRequestDto = import('./client/client.api').IUpdateItemRequestDto;
export type CreateRequestRequestDto = import('./client/client.api').ICreateRequestRequestDto;
export type UpdateRequestRequestDto = import('./client/client.api').IUpdateRequestRequestDto;
export type CreateOfferRequestDto = import('./client/client.api').ICreateOfferRequestDto;
export type UpdateOfferRequestDto = import('./client/client.api').IUpdateOfferRequestDto;
export type AcceptOfferRequestDto = import('./client/client.api').IAcceptOfferRequestDto;
export type CreateLoanRequestDto = import('./client/client.api').ICreateLoanRequestDto;
export type UpdateLoanRequestDto = import('./client/client.api').IUpdateLoanRequestDto;
export type CreateEventRequestDto = import('./client/client.api').ICreateEventRequestDto;
export type UpdateEventRequestDto = import('./client/client.api').IUpdateEventRequestDto;
export type LoginRequestDto = import('./client/client.api').ILoginRequest;
export type RegisterRequestDto = import('./client/client.api').IRegisterRequest;
export type RecoveryRequestDto = import('./client/client.api').IRecoveryRequest;
export type ResetRequestDto = import('./client/client.api').IResetPasswordDto;
export type VerifyResendRequestDto = import('./client/client.api').IResendVerificationRequest;
export type RefreshRequestDto = import('./client/client.api').IRefreshTokenRequest;
