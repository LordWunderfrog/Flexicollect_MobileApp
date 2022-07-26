import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import SignIn from "../screens/login/SignIn";
import SignUp from "../screens/login/SignUp";
import Home from "../screens/home/Home/";
import Mission from "../screens/home/Mission";
import History from "../screens/home/History";
import Notification from "../screens/home/Notification";
import Profile from "../screens/home/Profile";
import ProfileScreen from "../screens/profile/ProfileScreen";
import TabContainerBase from "../screens/home/TabContainerBase";
import ChangePassword from "../screens/ChangePassword";
import SurveyBox from "../screens/survey/SurveyBox";
import TakePicture from "../screens/survey/TakePicture";
import PreviewImage from "../screens/survey/PreviewImage";
import MarkerScreen from "../screens/survey/MarkerScreen";
import TextBoxScreen from "../screens/survey/TextBoxScreen";
import ScaledImage from "../screens/survey/ScaledImage";
import BarCodeScanner from "../screens/survey/BarCodeScanner";
import ScannedPreviewImage from "../screens/survey/ScannedPreviewImage";
import TermsAndPolicy from "../screens/survey/TermsAndPolicy";
import { isUserLoggedIn } from "../utils/Constants";
import PreviewVideo from "../screens/survey/PreviewVideo";
import ResetPassword from "../screens/login/ResetPassword";

/** App navigator 
 *  Not used this file its manage from app.js file 
 */
const AppNavigator = createStackNavigator({
    SignIn: {
        screen: SignIn,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    SignUp: {
        screen: SignUp,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    ProfileScreen: {
        screen: ProfileScreen,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    Home: {
        screen: Home,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    Mission: {
        screen: Mission,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    History: {
        screen: History,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    Notifications: {
        screen: Notification,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    Profile: {
        screen: Profile,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    TabContainerBase: {
        screen: TabContainerBase,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    ChangePassword: {
        screen: ChangePassword,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    SurveyBox: {
        screen: SurveyBox,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    TakePicture: {
        screen: TakePicture,
        navigationOptions: {
            header: null,
            statusBarHidden: true,
            gesturesEnabled: false
        }
    },
    PreviewImage: {
        screen: PreviewImage,
        navigationOptions: {
            header: null,
            statusBarHidden: true,
            gesturesEnabled: false
        }
    },
    MarkerScreen: {
        screen: MarkerScreen,
        navigationOptions: {
            header: null,
            statusBarHidden: true,
            gesturesEnabled: false
        }
    },
    TextBoxScreen: {
        screen: TextBoxScreen,
        navigationOptions: {
            header: null,
            statusBarHidden: true,
            gesturesEnabled: false
        }
    },

    ScaledImage: {
        screen: ScaledImage,
        navigationOptions: {
            header: null,
            statusBarHidden: true,
            gesturesEnabled: false
        }
    },

    BarCodeScanner: {
        screen: BarCodeScanner,
        navigationOptions: {
            header: null,
            statusBarHidden: true,
            gesturesEnabled: false
        }
    },
    ScannedPreviewImage: {
        screen: ScannedPreviewImage,
        navigationOptions: {
            header: null,
            statusBarHidden: true,
            gesturesEnabled: false
        }
    },
    TermsAndPolicy: {
        screen: TermsAndPolicy,
        navigationOptions: {
            header: null,
            statusBarHidden: true,
            gesturesEnabled: false
        }
    },
    PreviewVideo: {
        screen: PreviewVideo,
        navigationOptions: {
            header: null,
            statusBarHidden: true,
            gesturesEnabled: false
        }
    },
    ResetPassword: {
        screen: ResetPassword,
        navigationOptions: {
            header: null,
            gesturesEnabled: false

        }
    }
},
    {

        initialRouteName: 'SignIn'
    }
);

/**
 *  App container to initiate app navigation
 */
const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;