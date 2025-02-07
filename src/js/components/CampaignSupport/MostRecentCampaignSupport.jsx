import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { AccountCircle } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import anonymous from '../../../img/global/icons/avatar-generic.png';
import CampaignSupporterStore from '../../stores/CampaignSupporterStore';
import CampaignStore from '../../stores/CampaignStore';
import LazyImage from '../../utils/LazyImage';
import { renderLog } from '../../utils/logging';
import { timeFromDate } from '../../utils/dateFormat';
import { stringContains } from '../../utils/textFormat';

class MostRecentCampaignSupport extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      countOfStageQueueItemsMovedOnStage: 0,
      stageQueue: [],
      supportersOnStageNow: [],
      waitingForInitialData: true,
    };
  }

  componentDidMount () {
    // Both use onCampaignSupporterStoreChange
    this.campaignSupporterStoreListener = CampaignSupporterStore.addListener(this.onCampaignSupporterStoreChange.bind(this));
    this.campaignStoreListener = CampaignStore.addListener(this.onCampaignSupporterStoreChange.bind(this));
    const { campaignXWeVoteId } = this.props;
    // console.log('componentDidMount campaignXWeVoteId:', campaignXWeVoteId);
    if (campaignXWeVoteId) {
      const allLatestSupporters = CampaignSupporterStore.getCampaignXSupportersList(campaignXWeVoteId);
      // console.log('componentDidMount allLatestSupporters:', allLatestSupporters);
      if (allLatestSupporters && allLatestSupporters.length) {
        this.setState({
          waitingForInitialData: false,
        });
        // The first time we aren't waiting for initial data, fill it
        this.onFirstLoadOfSupporterData(allLatestSupporters);
      }
    }

    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
    // this.timeInterval = setInterval(() => this.setCommentsToDisplay(), 30000);
    this.timeInterval = setInterval(() => this.moveSupportersOnStage(), 3000);
  }

  componentDidUpdate (prevProps, prevState) {
    // console.log('MostRecentCampaignSupport componentDidUpdate');
    const {
      campaignXWeVoteId,
    } = this.props;
    const {
      waitingForInitialData: waitingForInitialDataPrevious,
    } = prevState;
    // console.log('componentDidUpdate campaignXWeVoteId:', campaignXWeVoteId, ', waitingForInitialData:', waitingForInitialData);
    if (campaignXWeVoteId) {
      const allLatestSupporters = CampaignSupporterStore.getCampaignXSupportersList(campaignXWeVoteId);
      // console.log('componentDidUpdate allLatestSupporters:', allLatestSupporters, ', waitingForInitialDataPrevious:', waitingForInitialDataPrevious, ', waitingForInitialData:', waitingForInitialData);
      const dataExists = allLatestSupporters && allLatestSupporters.length > 0;
      const waitingForInitialData = !dataExists;
      // The first time we aren't waiting for initial data, fill it
      if (!waitingForInitialData) {
        if (waitingForInitialData !== waitingForInitialDataPrevious) {
          this.setState({
            waitingForInitialData: false,
          });
          this.onFirstLoadOfSupporterData(allLatestSupporters);
        }
      }
    }
  }

  componentWillUnmount () {
    this.campaignSupporterStoreListener.remove();
    this.campaignStoreListener.remove();
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  }

  onFirstLoadOfSupporterData (allLatestSupporters) {
    // The first time we aren't waiting for initial data, fill it
    const stageQueue = this.fillStageQueue(allLatestSupporters);
    let countOfStageQueueItemsMovedOnStage = 0;
    // Reverse this so newest is at top of array
    const supportersToMoveOnStage = [];
    if (stageQueue.length === 0) {
      // Do nothing
    } else if (stageQueue.length === 1) {
      supportersToMoveOnStage.push(stageQueue[0]);
      countOfStageQueueItemsMovedOnStage = 1;
    } else {
      supportersToMoveOnStage.unshift(stageQueue[0]);
      supportersToMoveOnStage.unshift(stageQueue[1]);
      countOfStageQueueItemsMovedOnStage = 2;
    }
    this.setState({
      countOfStageQueueItemsMovedOnStage,
      stageQueue,
      supportersOnStageNow: supportersToMoveOnStage,
    });
  }

  onCampaignSupporterStoreChange () {
    const { campaignXWeVoteId } = this.props;
    // console.log('onCampaignSupporterStoreChange campaignXWeVoteId:', campaignXWeVoteId);
    if (campaignXWeVoteId) {
      const allLatestSupporters = CampaignSupporterStore.getCampaignXSupportersList(campaignXWeVoteId);
      if (allLatestSupporters && allLatestSupporters.length) {
        const stageQueue = this.fillStageQueue(allLatestSupporters);
        this.setState({
          stageQueue,
          waitingForInitialData: false,
        });
      }
    }
  }

  fillStageQueue (allLatestSupporters) {
    const { stageQueue } = this.state;
    // stageQueue is oldest-to-newest
    // Find newest entry in stageQueue
    let dateClosestToPresent;
    for (let i = 0; i < stageQueue.length; ++i) {
      if (!dateClosestToPresent) {
        dateClosestToPresent = stageQueue[i].date_supported;
      } else if (Date.parse(stageQueue[i].date_supported) > Date.parse(dateClosestToPresent)) {
        dateClosestToPresent = stageQueue[i].date_supported;
      }
    }
    // console.log('dateClosestToPresent:', dateClosestToPresent);

    // Order allLatestSupporters oldest-to-newest
    allLatestSupporters.sort((optionA, optionB) => Date.parse(optionA.date_supported) - Date.parse(optionB.date_supported));
    // console.log('allLatestSupporters after sort:', allLatestSupporters);
    for (let i = 0; i < allLatestSupporters.length; ++i) {
      if (!dateClosestToPresent) {
        stageQueue.push(allLatestSupporters[i]);
      } else if (Date.parse(allLatestSupporters[i].date_supported) > Date.parse(dateClosestToPresent)) {
        stageQueue.push(allLatestSupporters[i]);
      }
    }

    // console.log('stageQueue at end:', stageQueue);
    return stageQueue;
  }

  moveSupportersOnStage () {
    const { countOfStageQueueItemsMovedOnStage, stageQueue, supportersOnStageNow } = this.state;
    if (stageQueue && countOfStageQueueItemsMovedOnStage < stageQueue.length) {
      // console.log('moveSupportersOnStage, countOfStageQueueItemsMovedOnStage:', countOfStageQueueItemsMovedOnStage);
      // Add the next most recent supporter to the top of the display array
      supportersOnStageNow.unshift(stageQueue[countOfStageQueueItemsMovedOnStage]);
      this.setState({
        countOfStageQueueItemsMovedOnStage: countOfStageQueueItemsMovedOnStage + 1,
        supportersOnStageNow,
      });
    }
  }

  render () {
    renderLog('MostRecentCampaignSupport');  // Set LOG_RENDER_EVENTS to log all renders
    const { classes } = this.props;
    const { supportersOnStageNow } = this.state;

    const voterPhotoUrlMedium = null;
    return (
      <Wrapper>
        <CommentsWrapper id="comments-wrapper">
          {supportersOnStageNow && supportersOnStageNow.length > 0 ? (
            <div>
              {supportersOnStageNow.map((comment) => (
                <CommentWrapper className="comment" key={comment.id}>
                  <CommentVoterPhotoWrapper>
                    {voterPhotoUrlMedium ? (
                      <LazyImage
                        src={voterPhotoUrlMedium}
                        placeholder={anonymous}
                        className="profile-photo"
                        height={24}
                        width={24}
                        alt="Your Settings"
                      />
                    ) : (
                      <AccountCircle classes={{ root: classes.accountCircleRoot }} />
                    )}
                  </CommentVoterPhotoWrapper>
                  <CommentTextWrapper>
                    <Comment>{comment.supporter_endorsement}</Comment>
                    <CommentNameWrapper>
                      {!stringContains('Voter-', comment.supporter_name) && (
                        <CommentName>
                          {comment.supporter_name}
                          {' '}
                        </CommentName>
                      )}
                      supported
                      {' '}
                      {timeFromDate(comment.date_supported)}
                    </CommentNameWrapper>
                  </CommentTextWrapper>
                </CommentWrapper>
              ))}
            </div>
          ) : null }
        </CommentsWrapper>
      </Wrapper>
    );
  }
}
MostRecentCampaignSupport.propTypes = {
  campaignXWeVoteId: PropTypes.string,
  classes: PropTypes.object,
};

const styles = () => ({
  accountCircleRoot: {
    color: '#999',
    marginRight: 8,
  },
});

const Wrapper = styled.div`
`;

const CommentsWrapper = styled.div`
  height: 100px;
  max-height: 140px;
  overflow-y: scroll;
  transition-duration: .3s;
  // scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  .comment {
    // scroll-snap-align: start;
  }

  ::-webkit-scrollbar {
    width: 0;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: transparent;
    z-index: 9999;
    border-radius: 50px;
  }
`;

const CommentTextWrapper = styled.div`
`;

const CommentVoterPhotoWrapper = styled.div`
  margin-right: 6px;
`;

const CommentWrapper = styled.div`
  border-radius: 10px;
  border-top-left-radius: 0;
  display: flex;
  justify-content: flex-start;
  margin: 8px 0;
  width: 100%;
`;

const Comment = styled.p`
  color: #999;
  font-size: 14px;
  margin: 0;
`;

const CommentName = styled.span`
  color: #808080;
  font-weight: 500 !important;
`;

const CommentNameWrapper = styled.div`
  color: #999;
  font-size: 12px;
`;

export default withStyles(styles)(MostRecentCampaignSupport);
