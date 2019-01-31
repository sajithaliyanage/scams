import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';

import Navigation from '../Navigation';
import LandingPage from '../Landing';
import SignUpPage from '../SignUp';
import SignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
import AccountPage from '../Account';
import AdminPage from '../Admin';
import ExplorerPage from '../Explorer';
import Page404 from '../Page404';
import UserAccountPage from '../UserAccount';
// import ReportPage from '../Report';
// import TaggingPage from '../Tagging';
import FooterPagePro from '../Footer';

import * as ROUTES from '../../constants/routes';
import { withAuthentication } from '../Session';

const App = () => (
    <Router>
        <div>
            <Navigation/>
            <Switch>
                <Route exact path={ROUTES.LANDING} component={LandingPage}/>
                <Route path={ROUTES.SIGN_UP} component={SignUpPage}/>
                <Route path={ROUTES.SIGN_IN} component={SignInPage}/>
                <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage}/>
                <Route path={ROUTES.ACCOUNT} component={AccountPage}/>
                <Route path={ROUTES.ADMIN} component={AdminPage}/>
                <Route path={ROUTES.EXPLORER_ADDRESS} render={(props) => <ExplorerPage {...props} />}/>
                <Route path={ROUTES.USERS} render={(props) => <UserAccountPage {...props} />}/>
                <Route path={ROUTES.NOT_FOUND} render={(props) => <Page404 {...props} />}/>
                {/*<Route path={ROUTES.REPORT} component={ReportPage} />*/}
                {/*<Route path={ROUTES.TAG} component={TaggingPage} />*/}
                <Route path='*' exact={true} component={Page404}/>
            </Switch>
            <FooterPagePro/>
        </div>
    </Router>
);

export default withAuthentication(App);