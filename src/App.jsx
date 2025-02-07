import React, { Component, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import DelayedLoad from './js/components/Widgets/DelayedLoad';
import MainHeaderBar from './js/components/Navigation/MainHeaderBar';
import muiTheme from './js/components/Widgets/mui-theme';
import ErrorBoundary from './js/components/Widgets/ErrorBoundary';
import { renderLog } from './js/utils/logging';
import styledTheme from './js/components/Widgets/styled-theme';
import WeVoteRouter from './js/components/Widgets/WeVoteRouter';

// Lazy loaded component(s) on this page
const MainFooter  = React.lazy(() => import('./js/components/Navigation/MainFooter'));

// Root URL pages
const About = React.lazy(() => import('./js/pages/About'));
const AddContacts = React.lazy(() => import('./js/pages/AddContacts'));
const Attributions = React.lazy(() => import('./js/pages/Attributions'));
const CampaignCommentsPage = React.lazy(() => import('./js/pages/CampaignCommentsPage'));
const CampaignDetailsPage = React.lazy(() => import('./js/pages/CampaignDetailsPage'));
const CampaignRecommendedCampaigns = React.lazy(() => import('./js/pages/CampaignSupport/CampaignRecommendedCampaigns'));
const CampaignStartAddDescription = React.lazy(() => import('./js/pages/CampaignStart/CampaignStartAddDescription'));
const CampaignStartAddPhoto = React.lazy(() => import('./js/pages/CampaignStart/CampaignStartAddPhoto'));
const CampaignStartAddPolitician = React.lazy(() => import('./js/pages/CampaignStart/CampaignStartAddPolitician'));
const CampaignStartAddTitle = React.lazy(() => import('./js/pages/CampaignStart/CampaignStartAddTitle'));
const CampaignStartEditAll = React.lazy(() => import('./js/pages/CampaignStart/CampaignStartEditAll'));
const CampaignStartIntro = React.lazy(() => import('./js/pages/CampaignStart/CampaignStartIntro'));
const CampaignStartPreview = React.lazy(() => import('./js/pages/CampaignStart/CampaignStartPreview'));
const CampaignSupportEndorsement = React.lazy(() => import('./js/pages/CampaignSupport/CampaignSupportEndorsement'));
const CampaignSupportPayToPromote = React.lazy(() => import('./js/pages/CampaignSupport/CampaignSupportPayToPromote'));
const CampaignSupportShare = React.lazy(() => import('./js/pages/CampaignSupport/CampaignSupportShare'));
const CompleteYourProfileMobile = React.lazy(() => import('./js/pages/Settings/CompleteYourProfileMobile'));
const Credits = React.lazy(() => import('./js/pages/Credits'));
const FAQ = React.lazy(() => import('./js/pages/FAQ'));
const HomePage = React.lazy(() => import('./js/pages/HomePage'));
const Impact = React.lazy(() => import('./js/pages/Impact'));
const Membership = React.lazy(() => import('./js/pages/Membership'));
const PageNotFound = React.lazy(() => import('./js/pages/PageNotFound'));
const Privacy = React.lazy(() => import('./js/pages/Privacy'));
const SettingsEditProfile = React.lazy(() => import('./js/pages/Settings/SettingsEditProfile'));
const SettingsYourCampaigns = React.lazy(() => import('./js/pages/Settings/SettingsYourCampaigns'));
const SiteConfigurationRetrieveController = React.lazy(() => import('./js/components/Settings/SiteConfigurationRetrieveController'));
const StyleGuidePage = React.lazy(() => import('./js/pages/StyleGuidePage'));
const TermsOfService = React.lazy(() => import('./js/pages/TermsOfService'));
const TwitterSignInProcess = React.lazy(() => import('./js/pages/TwitterSignInProcess'));


class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      doShowHeader: true,
      doShowFooter: true,
    };
    this.setShowHeader = this.setShowHeader.bind(this);
    this.setShowFooter = this.setShowFooter.bind(this);
    this.setShowHeaderFooter = this.setShowHeaderFooter.bind(this);
  }

  // See https://reactjs.org/docs/error-boundaries.html
  static getDerivedStateFromError (error) { // eslint-disable-line no-unused-vars
    // Update state so the next render will show the fallback UI, We should have a "Oh snap" page
    console.log('App caught error ', error);
    return { hasError: true };
  }

  componentDidCatch (error, info) {
    // We should get this information to Splunk!
    console.error('App caught error: ', `${error} with info: `, info);
  }

  setShowHeader (doShowHeader) {
    this.setState({ doShowHeader });
  }

  setShowFooter (doShowFooter) {
    this.setState({ doShowFooter });
  }

  setShowHeaderFooter (doShow) {
    // console.log('setShowHeaderFooter -------------- doShow:', doShow);
    this.setState({
      doShowHeader: doShow,
      doShowFooter: doShow,
    });
  }

  render () {
    renderLog('App');
    const { doShowHeader, doShowFooter } = this.state;
    // console.log(`App doShowHeader: ${doShowHeader}, doShowFooter:${doShowFooter}`);
    let { hostname } = window.location;
    hostname = hostname || '';
    let useSiteConfigurationRetrieveController = true;
    if (hostname === 'campaigns.wevote.us') {
      useSiteConfigurationRetrieveController = false;
    }
    return (
      <ErrorBoundary>
        <Suspense fallback={<span>&nbsp;</span>}>
          <MuiThemeProvider theme={muiTheme}>
            <ThemeProvider theme={styledTheme}>
              <WeVoteRouter>
                {useSiteConfigurationRetrieveController && (
                  <SiteConfigurationRetrieveController />
                )}
                <MainHeaderBar displayHeader={doShowHeader} />
                <Switch>
                  <Route exact path="/about"><About /></Route>
                  <Route exact path="/addContacts"><AddContacts showFooter={this.setShowFooter} /></Route>
                  <Route exact path="/attributions"><Attributions /></Route>
                  <Route exact path="/c/:campaignSEOFriendlyPath" render={(props) => <CampaignDetailsPage match={props.match} />} />
                  <Route exact path="/c/:campaignSEOFriendlyPath/comments" render={(props) => <CampaignCommentsPage match={props.match} />} />
                  <Route exact path="/c/:campaignSEOFriendlyPath/edit" render={(props) => <CampaignStartEditAll match={props.match} editExistingCampaign setShowHeaderFooter={this.setShowHeaderFooter} />} />
                  <Route exact path="/c/:campaignSEOFriendlyPath/updates" render={(props) => <CampaignDetailsPage match={props.match} />} />
                  <Route exact path="/c/:campaignSEOFriendlyPath/complete-your-support-for-this-campaign" render={(props) => <CompleteYourProfileMobile match={props.match} supportCampaign setShowHeaderFooter={this.setShowHeaderFooter} />} />
                  <Route exact path="/c/:campaignSEOFriendlyPath/pay-to-promote" render={(props) => <CampaignSupportPayToPromote match={props.match} setShowHeaderFooter={this.setShowHeaderFooter} />} />
                  <Route exact path="/c/:campaignSEOFriendlyPath/recommended-campaigns" render={(props) => <CampaignRecommendedCampaigns match={props.match} setShowHeaderFooter={this.setShowHeaderFooter} />} />
                  <Route exact path="/c/:campaignSEOFriendlyPath/share-campaign" render={(props) => <CampaignSupportShare match={props.match} setShowHeaderFooter={this.setShowHeaderFooter} />} />
                  <Route exact path="/c/:campaignSEOFriendlyPath/i-will-share-campaign" render={(props) => <CampaignSupportShare match={props.match} setShowHeaderFooter={this.setShowHeaderFooter} iWillShare />} />
                  <Route exact path="/c/:campaignSEOFriendlyPath/share-campaign-with-one-friend" render={(props) => <CampaignSupportShare match={props.match} setShowHeaderFooter={this.setShowHeaderFooter} showShareCampaignWithOneFriend />} />
                  <Route exact path="/c/:campaignSEOFriendlyPath/why-do-you-support" render={(props) => <CampaignSupportEndorsement match={props.match} setShowHeaderFooter={this.setShowHeaderFooter} />} />
                  <Route exact path="/credits"><Credits /></Route>
                  <Route exact path="/edit-profile"><SettingsEditProfile /></Route>
                  <Route exact path="/faq"><FAQ /></Route>
                  <Route exact path="/id/:campaignXWeVoteId" render={(props) => <CampaignDetailsPage match={props.match} />} />
                  <Route exact path="/id/:campaignXWeVoteId/comments" render={(props) => <CampaignCommentsPage match={props.match} />} />
                  <Route exact path="/id/:campaignXWeVoteId/edit" render={(props) => <CampaignStartEditAll match={props.match} editExistingCampaign setShowHeaderFooter={this.setShowHeaderFooter} />} />
                  <Route exact path="/id/:campaignXWeVoteId/updates" render={(props) => <CampaignDetailsPage match={props.match} />} />
                  <Route exact path="/id/:campaignXWeVoteId/complete-your-support-for-this-campaign" render={(props) => <CompleteYourProfileMobile match={props.match} supportCampaign setShowHeaderFooter={this.setShowHeaderFooter} />} />
                  <Route exact path="/id/:campaignXWeVoteId/pay-to-promote" render={(props) => <CampaignSupportPayToPromote match={props.match} setShowHeaderFooter={this.setShowHeaderFooter} />} />
                  <Route exact path="/id/:campaignXWeVoteId/recommended-campaigns" render={(props) => <CampaignRecommendedCampaigns match={props.match} setShowHeaderFooter={this.setShowHeaderFooter} />} />
                  <Route exact path="/id/:campaignXWeVoteId/share-campaign" render={(props) => <CampaignSupportShare match={props.match} setShowHeaderFooter={this.setShowHeaderFooter} />} />
                  <Route exact path="/id/:campaignXWeVoteId/i-will-share-campaign" render={(props) => <CampaignSupportShare match={props.match} setShowHeaderFooter={this.setShowHeaderFooter} iWillShare />} />
                  <Route exact path="/id/:campaignXWeVoteId/share-campaign-with-one-friend" render={(props) => <CampaignSupportShare match={props.match} setShowHeaderFooter={this.setShowHeaderFooter} showShareCampaignWithOneFriend />} />
                  <Route exact path="/id/:campaignXWeVoteId/why-do-you-support" render={(props) => <CampaignSupportEndorsement match={props.match} setShowHeaderFooter={this.setShowHeaderFooter} />} />
                  <Route exact path="/impact"><Impact /></Route>
                  <Route exact path="/membership"><Membership showFooter={this.setShowFooter} /></Route>
                  <Route exact path="/privacy"><Privacy /></Route>
                  <Route exact path="/profile/started"><SettingsYourCampaigns /></Route>
                  <Route exact path="/profile/supported"><SettingsYourCampaigns /></Route>
                  <Route exact path="/ready"><Redirect to="/" /></Route>
                  <Route exact path="/start-a-campaign"><CampaignStartIntro /></Route>
                  <Route exact path="/who-do-you-want-to-see-elected"><CampaignStartAddPolitician /></Route>
                  <Route exact path="/start-a-campaign-why-winning-matters"><CampaignStartAddDescription /></Route>
                  <Route exact path="/start-a-campaign-add-photo"><CampaignStartAddPhoto /></Route>
                  <Route exact path="/start-a-campaign-add-title"><CampaignStartAddTitle /></Route>
                  <Route exact path="/start-a-campaign-complete-your-profile" render={(props) => <CompleteYourProfileMobile match={props.match} startCampaign setShowHeaderFooter={this.setShowHeaderFooter} />} />
                  <Route exact path="/start-a-campaign-edit-all"><CampaignStartEditAll /></Route>
                  <Route exact path="/start-a-campaign-preview"><CampaignStartPreview /></Route>
                  <Route exact path="/styles"><StyleGuidePage /></Route>
                  <Route exact path="/terms"><TermsOfService /></Route>
                  <Route path="/twitter_sign_in"><TwitterSignInProcess setShowHeaderFooter={this.setShowHeaderFooter} /></Route>
                  <Route exact path="/"><HomePage /></Route>
                  <Route path="*" component={PageNotFound} />
                </Switch>
                <DelayedLoad waitBeforeShow={4000}>
                  <Suspense fallback={<span>&nbsp;</span>}>
                    <MainFooter displayFooter={doShowFooter} />
                  </Suspense>
                </DelayedLoad>
              </WeVoteRouter>
            </ThemeProvider>
          </MuiThemeProvider>
        </Suspense>
      </ErrorBoundary>
    );
  }
}

export default App;
