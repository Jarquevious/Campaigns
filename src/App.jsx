import React, { Component, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import muiTheme from './js/components/Widgets/mui-theme';
import ErrorBoundary from './js/components/Widgets/ErrorBoundary';
import { renderLog } from './js/utils/logging';
import styledTheme from './js/components/Widgets/styled-theme';
import WeVoteRouter from './js/components/Widgets/WeVoteRouter';

// Root URL pages
const Attributions = React.lazy(() => import('./js/pages/Attributions'));
const CampaignDetailsPage = React.lazy(() => import('./js/pages/CampaignDetailsPage'));
const CampaignStartIntro = React.lazy(() => import('./js/pages/CampaignStartIntro'));
const CampaignStartTitle = React.lazy(() => import('./js/pages/CampaignStartTitle'));
const Credits = React.lazy(() => import('./js/pages/Credits'));
const FAQ = React.lazy(() => import('./js/pages/FAQ'));
const HomePage = React.lazy(() => import('./js/pages/HomePage'));
const Membership = React.lazy(() => import('./js/pages/Membership'));
const PageNotFound = React.lazy(() => import('./js/pages/PageNotFound'));
const Privacy = React.lazy(() => import('./js/pages/Privacy'));
const StyleGuidePage = React.lazy(() => import('./js/pages/StyleGuidePage'));
const TermsOfService = React.lazy(() => import('./js/pages/TermsOfService'));

// ////////////
// Test Pages
const CommentsTestPage = React.lazy(() => import('./js/pages/test/CommentsPage'));
const DetailsTestPage = React.lazy(() => import('./js/pages/test/DetailsPage'));
const HomeTestPage = React.lazy(() => import('./js/pages/test/HomeTest'));
const UpdatesTestPage = React.lazy(() => import('./js/pages/test/UpdatesPage'));


class App extends Component {
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

  render () {
    renderLog('App');  // Set LOG_RENDER_EVENTS to log all renders
    // const { location: { pathname } } = window;
    // const { params } = this.props;
    // console.log('App render, pathname:', pathname);
    return (
      <ErrorBoundary>
        <Suspense fallback={<span>Loading...</span>}>
          <MuiThemeProvider theme={muiTheme}>
            <ThemeProvider theme={styledTheme}>
              <WeVoteRouter>
                <Switch>
                  <Route exact path="/attributions"><Attributions /></Route>
                  <Route exact path="/c/:campaignIdentifier" render={(props) => <CampaignDetailsPage match={props.match} />} />
                  <Route exact path="/c/:campaignIdentifier/comments" render={(props) => <CampaignDetailsPage match={props.match} />} />
                  <Route exact path="/c/:campaignIdentifier/updates" render={(props) => <CampaignDetailsPage match={props.match} />} />
                  <Route exact path="/credits"><Credits /></Route>
                  <Route exact path="/faq"><FAQ /></Route>
                  <Route exact path="/privacy"><Privacy /></Route>
                  <Route exact path="/membership"><Membership /></Route>
                  <Route exact path="/start-a-campaign"><CampaignStartIntro /></Route>
                  <Route exact path="/start-a-campaign-title"><CampaignStartTitle /></Route>
                  <Route exact path="/styles"><StyleGuidePage /></Route>
                  <Route exact path="/terms"><TermsOfService /></Route>
                  <Route exact path="/test/comments"><CommentsTestPage /></Route>
                  <Route exact path="/test/details"><DetailsTestPage /></Route>
                  <Route exact path="/test/home"><HomeTestPage /></Route>
                  <Route exact path="/test/updates"><UpdatesTestPage /></Route>
                  <Route exact path="/"><HomePage /></Route>
                  <Route path="*" component={PageNotFound} />
                </Switch>
              </WeVoteRouter>
            </ThemeProvider>
          </MuiThemeProvider>
        </Suspense>
      </ErrorBoundary>
    );
  }
}

export default App;
