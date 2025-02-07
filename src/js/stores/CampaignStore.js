import { ReduceStore } from 'flux/utils';
import Dispatcher from '../components/Dispatcher/Dispatcher';
import anonymous from '../../img/global/icons/avatar-generic.png';
import arrayContains from '../utils/arrayContains';
import VoterStore from './VoterStore'; // eslint-disable-line import/no-cycle

class CampaignStore extends ReduceStore {
  getInitialState () {
    return {
      allCachedCampaignXDicts: {}, // key == campaignXWeVoteId, value = campaignX data dict
      allCachedCampaignXOwners: {}, // key == campaignXWeVoteId, value = list of owners of this campaign
      allCachedCampaignXOwnerPhotos: {}, // key == campaignXWeVoteId, value = Tiny Profile Photo to show
      allCachedCampaignXPoliticianLists: {}, // key == campaignXWeVoteId, value = list of politicians supported in this Campaign
      allCachedCampaignXWeVoteIdsBySEOFriendlyPath: {}, // key == SEOFriendlyPath, value = campaignXWeVoteId
      allCachedPoliticians: {}, // key == politicianWeVoteId, value = the Politician
      allCachedPoliticianWeVoteIdsByCampaignX: {}, // key == campaignXWeVoteId, value == list of politicianWeVoteIds in the campaign
      allCachedRecommendedCampaignXWeVoteIdLists: {}, // key == campaignXWeVoteId, value = list of campaigns recommended
      promotedCampaignXWeVoteIds: [], // These are the campaignx_we_vote_id's of the campaigns this voter started
      voterCanVoteForPoliticianWeVoteIds: [], // These are the politician_we_vote_id's this voter can vote for
      voterOwnedCampaignXWeVoteIds: [], // These are the campaignx_we_vote_id's of the campaigns this voter can edit
      voterStartedCampaignXWeVoteIds: [], // These are the campaignx_we_vote_id's of the campaigns this voter started
      voterSupportedCampaignXWeVoteIds: [], // These are the campaignx_we_vote_id's of the campaigns this voter supports
      voterWeVoteId: '',
    };
  }

  resetState () {
    return this.getInitialState();
  }

  extractCampaignXOwnerList (campaignX, allCachedCampaignXOwnersIncoming, allCachedCampaignXOwnerPhotosIncoming, voterOwnedCampaignXWeVoteIdsIncoming) {
    const allCachedCampaignXOwners = allCachedCampaignXOwnersIncoming;
    const allCachedCampaignXOwnerPhotos = allCachedCampaignXOwnerPhotosIncoming;
    const campaignXOwnersFiltered = [];
    let featuredProfileImageFound = false;
    let firstProfileImageFound = false;
    let useThisProfileImage = false;
    const voterOwnedCampaignXWeVoteIds = voterOwnedCampaignXWeVoteIdsIncoming;
    const linkedOrganizationWeVoteId = VoterStore.getLinkedOrganizationWeVoteId();
    // console.log('linkedOrganizationWeVoteId:', linkedOrganizationWeVoteId);
    for (let i = 0; i < campaignX.campaignx_owner_list.length; ++i) {
      // console.log('CampaignStore owner_list i: ', i, ', one_owner: ', campaignX.campaignx_owner_list[i]);
      if (campaignX.campaignx_owner_list[i].organization_we_vote_id &&
          campaignX.campaignx_owner_list[i].organization_we_vote_id === linkedOrganizationWeVoteId) {
        if (!(arrayContains(campaignX.campaignx_we_vote_id, voterOwnedCampaignXWeVoteIds))) {
          voterOwnedCampaignXWeVoteIds.push(campaignX.campaignx_we_vote_id);
        }
      }
      if (campaignX.campaignx_owner_list[i].visible_to_public) {
        if (campaignX.campaignx_owner_list[i].organization_name) {
          campaignXOwnersFiltered.push(campaignX.campaignx_owner_list[i]);
        }
        if (campaignX.campaignx_owner_list[i].we_vote_hosted_profile_image_url_tiny) {
          if (campaignX.campaignx_owner_list[i].feature_this_profile_image) {
            if (!featuredProfileImageFound) {
              // Always use the first profile image found which is featured
              useThisProfileImage = true;
            }
            featuredProfileImageFound = true;
            firstProfileImageFound = true;
          }
          if (!featuredProfileImageFound && !firstProfileImageFound) {
            // Use this image if it is the first image found and a featured image hasn't already been found
            useThisProfileImage = true;
          }
          if (useThisProfileImage) {
            allCachedCampaignXOwnerPhotos[campaignX.campaignx_we_vote_id] = campaignX.campaignx_owner_list[i].we_vote_hosted_profile_image_url_tiny;
          }
        }
      }
    }
    allCachedCampaignXOwners[campaignX.campaignx_we_vote_id] = campaignXOwnersFiltered;

    return {
      allCachedCampaignXOwners,
      allCachedCampaignXOwnerPhotos,
      voterOwnedCampaignXWeVoteIds,
    };
  }

  extractCampaignXPoliticianList (campaignX, allCachedCampaignXPoliticianListsIncoming) {
    const allCachedCampaignXPoliticianLists = allCachedCampaignXPoliticianListsIncoming;
    const campaignXPoliticianListFiltered = [];
    for (let i = 0; i < campaignX.campaignx_politician_list.length; ++i) {
      // console.log('CampaignStore owner_list i: ', i, ', one_owner: ', campaignX.campaignx_politician_list[i]);
      if (campaignX.campaignx_politician_list[i].politician_name) {
        campaignXPoliticianListFiltered.push(campaignX.campaignx_politician_list[i]);
      }
    }
    allCachedCampaignXPoliticianLists[campaignX.campaignx_we_vote_id] = campaignXPoliticianListFiltered;

    return {
      allCachedCampaignXPoliticianLists,
    };
  }

  extractPoliticianWeVoteIdListFromCampaign (campaignX, allCachedPoliticianWeVoteIdsByCampaignXIncoming) {
    const allCachedPoliticianWeVoteIdsByCampaignX = allCachedPoliticianWeVoteIdsByCampaignXIncoming;
    const politicianWeVoteIdListFiltered = [];
    for (let i = 0; i < campaignX.campaignx_politician_list.length; ++i) {
      // console.log('CampaignStore politician i: ', i, ': ', campaignX.campaignx_politician_list[i]);
      if (campaignX.campaignx_politician_list[i].politician_name) {
        politicianWeVoteIdListFiltered.push(campaignX.campaignx_politician_list[i].politician_we_vote_id);
      }
    }
    allCachedPoliticianWeVoteIdsByCampaignX[campaignX.campaignx_we_vote_id] = politicianWeVoteIdListFiltered;

    return {
      allCachedPoliticianWeVoteIdsByCampaignX,
    };
  }

  getCampaignXBySEOFriendlyPath (SEOFriendlyPath) {
    const campaignXWeVoteId = this.getState().allCachedCampaignXWeVoteIdsBySEOFriendlyPath[SEOFriendlyPath] || '';
    const campaignX = this.getState().allCachedCampaignXDicts[campaignXWeVoteId];
    // console.log('CampaignStore getCampaignXBySEOFriendlyPath SEOFriendlyPath:', SEOFriendlyPath, ', campaignXWeVoteId:', campaignXWeVoteId, ', campaignX:', campaignX);
    if (campaignX === undefined) {
      return {};
    }
    return campaignX;
  }

  getCampaignXByWeVoteId (campaignXWeVoteId) {
    const campaignX = this.getState().allCachedCampaignXDicts[campaignXWeVoteId];
    if (campaignX === undefined) {
      return {};
    }
    return campaignX;
  }

  getCampaignXOwnerList (campaignXWeVoteId) {
    return this.getState().allCachedCampaignXOwners[campaignXWeVoteId] || [];
  }

  getCampaignXLeadOwnerProfilePhoto (campaignXWeVoteId, hideAnonymousImage = false) {
    const alternateImage = hideAnonymousImage ? '' : anonymous;
    return this.getState().allCachedCampaignXOwnerPhotos[campaignXWeVoteId] || alternateImage;
  }

  getCampaignXPoliticianList (campaignXWeVoteId) {
    return this.getState().allCachedCampaignXPoliticianLists[campaignXWeVoteId] || [];
  }

  getRecommendedCampaignXList (campaignXWeVoteId) {
    const recommendedCampaignXWeVoteIdList = this.getState().allCachedRecommendedCampaignXWeVoteIdLists[campaignXWeVoteId] || [];
    return this.getCampaignXListFromListOfWeVoteIds(recommendedCampaignXWeVoteIdList);
  }

  getRecommendedCampaignXListCount (campaignXWeVoteId) {
    const recommendedCampaignXWeVoteIdList = this.getState().allCachedRecommendedCampaignXWeVoteIdLists[campaignXWeVoteId] || [];
    return recommendedCampaignXWeVoteIdList.length;
  }

  getRecommendedCampaignXListHasBeenRetrieved (campaignXWeVoteId) {
    if (!campaignXWeVoteId) {
      return null;
    }
    return campaignXWeVoteId in this.getState().allCachedRecommendedCampaignXWeVoteIdLists;
  }

  getCampaignXWeVoteIdFromCampaignSEOFriendlyPath (SEOFriendlyPath) {
    return this.getState().allCachedCampaignXWeVoteIdsBySEOFriendlyPath[SEOFriendlyPath] || '';
  }

  getCampaignXListFromListOfWeVoteIds (listOfCampaignXWeVoteIds) {
    const { allCachedCampaignXDicts } = this.getState();
    // console.log('getCampaignXListFromListOfWeVoteIds listOfCampaignXWeVoteIds: ', listOfCampaignXWeVoteIds);
    // make sure that listOfCampaignXWeVoteIds has unique values
    const uniqListOfCampaignXWeVoteIds = listOfCampaignXWeVoteIds.filter((value, index, self) => self.indexOf(value) === index);

    const campaignXList = [];
    let campaignX;
    uniqListOfCampaignXWeVoteIds.forEach((campaignXWeVoteId) => {
      if (allCachedCampaignXDicts[campaignXWeVoteId]) {
        campaignX = allCachedCampaignXDicts[campaignXWeVoteId];
        campaignXList.push(campaignX);
      }
    });
    // console.log('getCampaignXListFromListOfWeVoteIds campaignXList: ', campaignXList);

    return campaignXList;
  }

  getPromotedCampaignXDicts () {
    return this.getCampaignXListFromListOfWeVoteIds(this.getState().promotedCampaignXWeVoteIds);
  }

  getVoterCanEditThisCampaign (campaignXWeVoteId) {
    // console.log('this.getState().voterOwnedCampaignXWeVoteIds:', this.getState().voterOwnedCampaignXWeVoteIds);
    return arrayContains(campaignXWeVoteId, this.getState().voterOwnedCampaignXWeVoteIds);
  }

  getVoterCanVoteForPoliticianInCampaign (campaignXWeVoteId) {
    const { allCachedPoliticianWeVoteIdsByCampaignX, voterCanVoteForPoliticianWeVoteIds } = this.getState();  //
    // console.log('campaignXWeVoteId:', campaignXWeVoteId);
    if (allCachedPoliticianWeVoteIdsByCampaignX && allCachedPoliticianWeVoteIdsByCampaignX[campaignXWeVoteId]) {
      const politicianWeVoteIdsForCampaign = allCachedPoliticianWeVoteIdsByCampaignX[campaignXWeVoteId];
      const intersection = politicianWeVoteIdsForCampaign.filter((x) => voterCanVoteForPoliticianWeVoteIds.includes(x));
      if (intersection && intersection.length > 0) {
        // console.log('intersection:', intersection);
        return true;
      }
    }
    return false;
  }

  getVoterOwnedCampaignXDicts () {
    return this.getCampaignXListFromListOfWeVoteIds(this.getState().voterOwnedCampaignXWeVoteIds);
  }

  getVoterOwnedCampaignXWeVoteIds () {
    return this.getState().voterOwnedCampaignXWeVoteIds;
  }

  getVoterStartedCampaignXDicts () {
    return this.getCampaignXListFromListOfWeVoteIds(this.getState().voterStartedCampaignXWeVoteIds);
  }

  getVoterSupportedCampaignXDicts () {
    return this.getCampaignXListFromListOfWeVoteIds(this.getState().voterSupportedCampaignXWeVoteIds);
  }

  reduce (state, action) {
    const {
      allCachedCampaignXDicts, allCachedCampaignXWeVoteIdsBySEOFriendlyPath,
      allCachedRecommendedCampaignXWeVoteIdLists, voterSupportedCampaignXWeVoteIds,
    } = state;
    let {
      allCachedCampaignXOwners, allCachedCampaignXPoliticianLists, allCachedCampaignXOwnerPhotos,
      allCachedPoliticianWeVoteIdsByCampaignX,
      promotedCampaignXWeVoteIds, voterCanVoteForPoliticianWeVoteIds, voterOwnedCampaignXWeVoteIds,
      voterStartedCampaignXWeVoteIds,
    } = state;
    let campaignX;
    let campaignXList;
    let recommendedCampaignsCampaignXWeVoteId;
    let revisedState;
    switch (action.type) {
      case 'campaignListRetrieve':
        // See CampaignSupporterStore for code to take in the following campaignX values:
        // - latest_campaignx_supporter_endorsement_list
        // - latest_campaignx_supporter_list
        // - voter_campaignx_supporter

        if (!action.res || !action.res.success) return state;
        revisedState = state;
        campaignXList = action.res.campaignx_list || [];
        recommendedCampaignsCampaignXWeVoteId = '';

        if (action.res.promoted_campaignx_list_returned) {
          if (action.res.promoted_campaignx_we_vote_ids) {
            promotedCampaignXWeVoteIds = action.res.promoted_campaignx_we_vote_ids;
            revisedState = { ...revisedState, promotedCampaignXWeVoteIds };
          }
        }
        if (action.res.recommended_campaigns_for_campaignx_we_vote_id) {
          recommendedCampaignsCampaignXWeVoteId = action.res.recommended_campaigns_for_campaignx_we_vote_id;
          // console.log('recommendedCampaignsCampaignXWeVoteId:', recommendedCampaignsCampaignXWeVoteId);
        }
        if (action.res.voter_can_vote_for_politicians_list_returned) {
          if (action.res.voter_can_vote_for_politician_we_vote_ids) {
            // We want to reset this variable with this incoming value
            voterCanVoteForPoliticianWeVoteIds = action.res.voter_can_vote_for_politician_we_vote_ids;
            revisedState = { ...revisedState, voterCanVoteForPoliticianWeVoteIds };
          }
        }
        if (action.res.voter_owned_campaignx_list_returned) {
          if (action.res.voter_owned_campaignx_we_vote_ids) {
            // We want to reset this variable with this incoming value
            voterOwnedCampaignXWeVoteIds = action.res.voter_owned_campaignx_we_vote_ids;
            // revisedState updated with voterOwnedCampaignXWeVoteIds below
          }
        }
        if (action.res.voter_started_campaignx_list_returned) {
          if (action.res.voter_started_campaignx_we_vote_ids) {
            voterStartedCampaignXWeVoteIds = action.res.voter_started_campaignx_we_vote_ids;
            revisedState = { ...revisedState, voterStartedCampaignXWeVoteIds };
          }
        }
        if (action.res.voter_supported_campaignx_list_returned) {
          if (action.res.voter_supported_campaignx_we_vote_ids) {
            // console.log('action.res.voter_supported_campaignx_we_vote_ids:', action.res.voter_supported_campaignx_we_vote_ids);
            action.res.voter_supported_campaignx_we_vote_ids.forEach((oneCampaignXWeVoteId) => {
              if (!(oneCampaignXWeVoteId in voterSupportedCampaignXWeVoteIds)) {
                voterSupportedCampaignXWeVoteIds.push(oneCampaignXWeVoteId);
              }
            });
            revisedState = { ...revisedState, voterSupportedCampaignXWeVoteIds };
          }
        }

        // console.log('action.res.voter_issues_only:', action.res.voter_issues_only);
        if (recommendedCampaignsCampaignXWeVoteId) {
          if (!(recommendedCampaignsCampaignXWeVoteId in allCachedRecommendedCampaignXWeVoteIdLists)) {
            allCachedRecommendedCampaignXWeVoteIdLists[recommendedCampaignsCampaignXWeVoteId] = [];
          }
        }
        campaignXList.forEach((oneCampaignX) => {
          allCachedCampaignXDicts[oneCampaignX.campaignx_we_vote_id] = oneCampaignX;
          if (recommendedCampaignsCampaignXWeVoteId) {
            allCachedRecommendedCampaignXWeVoteIdLists[recommendedCampaignsCampaignXWeVoteId].push(oneCampaignX.campaignx_we_vote_id);
          }
          if ('campaignx_owner_list' in oneCampaignX) {
            ({
              allCachedCampaignXOwners,
              allCachedCampaignXOwnerPhotos,
              voterOwnedCampaignXWeVoteIds,
            } = this.extractCampaignXOwnerList(oneCampaignX, allCachedCampaignXOwners, allCachedCampaignXOwnerPhotos, voterOwnedCampaignXWeVoteIds));
          }
          if ('campaignx_politician_list' in oneCampaignX) {
            ({ allCachedCampaignXPoliticianLists } = this.extractCampaignXPoliticianList(oneCampaignX, allCachedCampaignXPoliticianLists));
            ({ allCachedPoliticianWeVoteIdsByCampaignX } = this.extractPoliticianWeVoteIdListFromCampaign(oneCampaignX, allCachedPoliticianWeVoteIdsByCampaignX));
          }
          if (!(oneCampaignX.seo_friendly_path in allCachedCampaignXWeVoteIdsBySEOFriendlyPath)) {
            allCachedCampaignXWeVoteIdsBySEOFriendlyPath[oneCampaignX.seo_friendly_path] = oneCampaignX.campaignx_we_vote_id;
          }
          if ('seo_friendly_path_list' in oneCampaignX) {
            //
            let onePath = '';
            for (let i = 0; i < oneCampaignX.seo_friendly_path_list.length; ++i) {
              onePath = oneCampaignX.seo_friendly_path_list[i];
              if (onePath && onePath !== '') {
                if (!(onePath in allCachedCampaignXWeVoteIdsBySEOFriendlyPath)) {
                  allCachedCampaignXWeVoteIdsBySEOFriendlyPath[onePath] = oneCampaignX.campaignx_we_vote_id;
                }
              }
            }
          }
        });
        // console.log('allCachedCampaignXWeVoteIdsBySEOFriendlyPath:', allCachedCampaignXWeVoteIdsBySEOFriendlyPath);
        revisedState = { ...revisedState, allCachedCampaignXDicts };
        revisedState = { ...revisedState, allCachedCampaignXOwners };
        revisedState = { ...revisedState, allCachedCampaignXPoliticianLists };
        revisedState = { ...revisedState, allCachedCampaignXOwnerPhotos };
        revisedState = { ...revisedState, allCachedCampaignXWeVoteIdsBySEOFriendlyPath };
        revisedState = { ...revisedState, allCachedPoliticianWeVoteIdsByCampaignX };
        revisedState = { ...revisedState, allCachedRecommendedCampaignXWeVoteIdLists };
        revisedState = { ...revisedState, voterOwnedCampaignXWeVoteIds };
        return revisedState;

      case 'campaignRetrieve':
      case 'campaignStartSave':
        // See CampaignSupporterStore for code to take in the following campaignX values:
        // - latest_campaignx_supporter_endorsement_list
        // - latest_campaignx_supporter_list
        // - voter_campaignx_supporter

        if (!action.res || !action.res.success) return state;
        revisedState = state;
        campaignX = action.res;
        // console.log('CampaignStore campaignRetrieve, campaignX:', campaignX);
        allCachedCampaignXDicts[campaignX.campaignx_we_vote_id] = campaignX;
        if ('campaignx_owner_list' in campaignX) {
          ({
            allCachedCampaignXOwners,
            allCachedCampaignXOwnerPhotos,
            voterOwnedCampaignXWeVoteIds,
          } = this.extractCampaignXOwnerList(campaignX, allCachedCampaignXOwners, allCachedCampaignXOwnerPhotos, voterOwnedCampaignXWeVoteIds));
        }
        if ('campaignx_politician_list' in campaignX) {
          ({ allCachedCampaignXPoliticianLists } = this.extractCampaignXPoliticianList(campaignX, allCachedCampaignXPoliticianLists));
          ({ allCachedPoliticianWeVoteIdsByCampaignX } = this.extractPoliticianWeVoteIdListFromCampaign(campaignX, allCachedPoliticianWeVoteIdsByCampaignX));
        }
        if (!(campaignX.seo_friendly_path in allCachedCampaignXWeVoteIdsBySEOFriendlyPath)) {
          allCachedCampaignXWeVoteIdsBySEOFriendlyPath[campaignX.seo_friendly_path] = campaignX.campaignx_we_vote_id;
        }
        // console.log('CampaignStore allCachedCampaignXOwners:', allCachedCampaignXOwners);
        if ('seo_friendly_path_list' in campaignX) {
          //
          let onePath = '';
          for (let i = 0; i < campaignX.seo_friendly_path_list.length; ++i) {
            onePath = campaignX.seo_friendly_path_list[i];
            if (onePath && onePath !== '') {
              if (!(onePath in allCachedCampaignXWeVoteIdsBySEOFriendlyPath)) {
                allCachedCampaignXWeVoteIdsBySEOFriendlyPath[onePath] = campaignX.campaignx_we_vote_id;
              }
            }
          }
        }
        if (action.res.voter_can_vote_for_politician_we_vote_ids) {
          // We want to reset this variable with this incoming value
          voterCanVoteForPoliticianWeVoteIds = action.res.voter_can_vote_for_politician_we_vote_ids;
          revisedState = { ...revisedState, voterCanVoteForPoliticianWeVoteIds };
        }
        if ('voter_campaignx_supporter' in action.res) {
          if ('campaign_supported' in action.res.voter_campaignx_supporter) {
            //
            // console.log('action.res.voter_campaignx_supporter.campaign_supported:', action.res.voter_campaignx_supporter.campaign_supported);
            if (action.res.voter_campaignx_supporter.campaign_supported) {
              if (!(action.res.voter_campaignx_supporter.campaignx_we_vote_id in voterSupportedCampaignXWeVoteIds)) {
                voterSupportedCampaignXWeVoteIds.push(action.res.voter_campaignx_supporter.campaignx_we_vote_id);
                revisedState = { ...revisedState, voterSupportedCampaignXWeVoteIds };
              }
            }
          }
        }
        revisedState = { ...revisedState, allCachedCampaignXDicts };
        revisedState = { ...revisedState, allCachedCampaignXOwners };
        revisedState = { ...revisedState, allCachedCampaignXPoliticianLists };
        revisedState = { ...revisedState, allCachedCampaignXOwnerPhotos };
        revisedState = { ...revisedState, allCachedCampaignXWeVoteIdsBySEOFriendlyPath };
        revisedState = { ...revisedState, allCachedPoliticianWeVoteIdsByCampaignX };
        revisedState = { ...revisedState, voterOwnedCampaignXWeVoteIds };
        return revisedState;

      case 'voterSignOut':
        // TODO: We will need to call resetVoterSpecificData in this store
        console.log('CampaignStore voterSignOut, state:', state);
        // return this.resetState();
        return state;

      default:
        return state;
    }
  }
}

export default new CampaignStore(Dispatcher);
