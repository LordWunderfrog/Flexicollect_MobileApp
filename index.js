/**
 * Initial rendering of Project
 * Declare global variables
 * Navigate to App.js file
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

global.previewUri = ''
global.screenKey = ''
global.pageIndex = 0
global.missionId = ''
global.barCode = ''
global.type = ''
global.imageData = ''
global.markerId = 0
global.scaleId = 0
global.captionText = ''
global.mission_mount = false
global.isDownloadProgress = ''
global.language = 'English'
global.isSubmitProgress = ''
global.profileImage = "";
global.isSlowNetwork = false
AppRegistry.registerComponent(appName, () => App);