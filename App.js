/**
 * import library for routing
 */
// import { createAppContainer } from 'react-navigation';
// import { createStackNavigator } from 'react-navigation-stack';
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

/**
 * import all components of project for routing
 */
import SignIn from "./app/screens/login/SignIn";
import SignUp from "./app/screens/login/SignUp";
import Home from "./app/screens/home/Home/";
import Mission from "./app/screens/home/Mission";
import History from "./app/screens/home/History";
import Notification from "./app/screens/home/Notification";
import Profile from "./app/screens/home/Profile";
import ProfileScreen from "./app/screens/profile/ProfileScreen";
import TabContainerBase from "./app/screens/home/TabContainerBase";
import ChangePassword from "./app/screens/ChangePassword";
import SurveyBox from "./app/screens/survey/SurveyBox";
import TakePicture from "./app/screens/survey/TakePicture";
import PreviewImage from "./app/screens/survey/PreviewImage";
import MarkerScreen from "./app/screens/survey/MarkerScreen";
import TextBoxScreen from "./app/screens/survey/TextBoxScreen";
import ScaledImage from "./app/screens/survey/ScaledImage";
import BarCodeScanner from "./app/screens/survey/BarCodeScanner";
import ScannedPreviewImage from "./app/screens/survey/ScannedPreviewImage";
import TermsAndPolicy from "./app/screens/survey/TermsAndPolicy";
import { isUserLoggedIn } from "./app/utils/Constants";
import PreviewVideo from "./app/screens/survey/PreviewVideo";
import ResetPassword from "./app/screens/login/ResetPassword";
import OfflineSurveyList from "./app/screens/survey/OfflineSurveyList";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
/**
 * Construct routing for all screens
 * Initial routing signin
 */
const Stack = createNativeStackNavigator();
const StackNavigator = () => {
    return (
        <Stack.Navigator initialRouteName='SignIn'>
            <Stack.Screen name={'SignIn'} component={SignIn} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'SignUp'} component={SignUp} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'Home'} component={Home} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'Mission'} component={Mission} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'History'} component={History} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'Notification'} component={Notification} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'Profile'} component={Profile} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'ProfileScreen'} component={ProfileScreen} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'TabContainerBase'} component={TabContainerBase} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'ChangePassword'} component={ChangePassword} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'SurveyBox'} component={SurveyBox} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'TakePicture'} component={TakePicture} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'PreviewImage'} component={PreviewImage} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'MarkerScreen'} component={MarkerScreen} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'TextBoxScreen'} component={TextBoxScreen} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'ScaledImage'} component={ScaledImage} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'BarCodeScanner'} component={BarCodeScanner} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'ScannedPreviewImage'} component={ScannedPreviewImage} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'TermsAndPolicy'} component={TermsAndPolicy} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'PreviewVideo'} component={PreviewVideo} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'ResetPassword'} component={ResetPassword} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name={'OfflineSurveyList'} component={OfflineSurveyList} options={{ headerShown: false, gestureEnabled: false }} />
        </Stack.Navigator>
    )
}

// /**
//  *  App container to initiate app navigation
//  */
export default class App extends Component {
    render() {
        return (
            <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <NavigationContainer>
                        <StackNavigator />
                    </NavigationContainer>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        )
    }
}

// const AppNavigator = createStackNavigator({
//     SignIn: {
//         screen: SignIn,
//         navigationOptions: {
//             header: null,
//             gesturesEnabled: false
//         }
//     },
//     SignUp: {
//         screen: SignUp,
//         navigationOptions: {
//             header: null,
//             gesturesEnabled: false

//         }
//     },
//     ProfileScreen: {
//         screen: ProfileScreen,
//         navigationOptions: {
//             header: null,
//             gesturesEnabled: false
//         }
//     },
//     Home: {
//         screen: Home,
//         navigationOptions: {
//             header: null,
//             gesturesEnabled: false
//         }
//     },
//     Mission: {
//         screen: Mission,
//         navigationOptions: {
//             header: null,
//             gesturesEnabled: false
//         }
//     },
//     History: {
//         screen: History,
//         navigationOptions: {
//             header: null,
//             gesturesEnabled: false
//         }
//     },
//     Notifications: {
//         screen: Notification,
//         navigationOptions: {
//             header: null,
//             gesturesEnabled: false
//         }
//     },
//     Profile: {
//         screen: Profile,
//         navigationOptions: {
//             header: null,
//             gesturesEnabled: false
//         }
//     },
//     TabContainerBase: {
//         screen: TabContainerBase,
//         navigationOptions: {
//             header: null,
//             gesturesEnabled: false
//         }
//     },
//     ChangePassword: {
//         screen: ChangePassword,
//         navigationOptions: {
//             header: null,
//             gesturesEnabled: false
//         }
//     },
//     SurveyBox: {
//         screen: SurveyBox,
//         navigationOptions: {
//             header: null,
//             gesturesEnabled: false
//         }
//     },
//     TakePicture: {
//         screen: TakePicture,
//         navigationOptions: {
//             header: null,
//             statusBarHidden: true,
//             gesturesEnabled: false
//         }
//     },
//     PreviewImage: {
//         screen: PreviewImage,
//         navigationOptions: {
//             header: null,
//             statusBarHidden: true,
//             gesturesEnabled: false
//         }
//     },
//     MarkerScreen: {
//         screen: MarkerScreen,
//         navigationOptions: {
//             header: null,
//             statusBarHidden: true,
//             gesturesEnabled: false
//         }
//     },
//     TextBoxScreen: {
//         screen: TextBoxScreen,
//         navigationOptions: {
//             header: null,
//             statusBarHidden: true,
//             gesturesEnabled: false
//         }
//     },

//     ScaledImage: {
//         screen: ScaledImage,
//         navigationOptions: {
//             header: null,
//             statusBarHidden: true,
//             gesturesEnabled: false
//         }
//     },

//     BarCodeScanner: {
//         screen: BarCodeScanner,
//         navigationOptions: {
//             header: null,
//             statusBarHidden: true,
//             gesturesEnabled: false
//         }
//     },
//     ScannedPreviewImage: {
//         screen: ScannedPreviewImage,
//         navigationOptions: {
//             header: null,
//             statusBarHidden: true,
//             gesturesEnabled: false
//         }
//     },
//     TermsAndPolicy: {
//         screen: TermsAndPolicy,
//         navigationOptions: {
//             header: null,
//             statusBarHidden: true,
//             gesturesEnabled: false
//         }
//     },
//     PreviewVideo: {
//         screen: PreviewVideo,
//         navigationOptions: {
//             header: null,
//             statusBarHidden: true,
//             gesturesEnabled: false
//         }
//     },
//     ResetPassword: {
//         screen: ResetPassword,
//         navigationOptions: {
//             header: null,
//             gesturesEnabled: false
//         }
//     },
//     offlineSurveyList: {
//         screen: OfflineSurveyList,
//         navigationOptions: {
//             header: null,
//             gesturesEnabled: false
//         }
//     }
// },
//     {

//         initialRouteName: 'SignIn'
//     }
// );

// /**
//  *  App container to initiate app navigation
//  */
// const AppContainer = createAppContainer(AppNavigator);

// export default AppContainer;