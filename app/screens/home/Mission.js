import React, { Component } from 'react';
import {
	View,
	Text,
	Platform,
	TouchableOpacity, AppState,
	Image, FlatList, ActivityIndicator,
	Alert, Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoSubscription, NetInfoState } from '@react-native-community/netinfo';
import { ScaledSheet } from 'react-native-size-matters';
// import firebase from 'react-native-firebase';
// import type { Notification, NotificationOpen, RemoteMessage } from 'react-native-firebase';
import firebase from '@react-native-firebase/app'
//import type { Notification, NotificationOpen, RemoteMessage } from '@react-native-firebase/app'
import messaging from '@react-native-firebase/messaging';

import * as Color from '../../style/Colors';
import * as Dimension from '../../style/Dimensions';
import * as Font from '../../style/Fonts';
import * as Constants from '../../utils/Constants';
import axios from 'axios';
import * as Service from "../../utils/Api";
import * as String from '../../style/Strings';
//import { NavigationActions, SafeAreaView, StackActions } from "react-navigation";
import { CommonActions } from '@react-navigation/native';
import RNFS from "react-native-fs";
import { measureConnectionSpeed } from '../../components/GetNetworkSpeed';

let status;
let totalPoint;
let currentPoint;
let offline_img = '../../images/survey/offline.png';
let connected = true;
//let isDownloadProgress = "";

interface State {
	isConnected: boolean | null;
}

class Mission extends Component {
	state = {
		missionData: [],
		isLoading: true,
		appState: AppState.currentState,
		offlineObj: {},
		totalFiles: {},
		downFiles: {},
		pointBadges: [100, 200, 300, 500, 1000, 2000],
		translation_common: Constants.common_text
	}

	/** components life cycle methods */
	componentWillUnmount() {

		this.onTokenRefreshListener();
		//this.notificationDisplayedListener();
		//this.notificationListener();
		// AppState.removeEventListener('change', this._handleAppStateChange);
		this.notificationOpenedListener();
		this.messageListener();
		this.appstateChangeMission.remove()
		this._subscription && this._subscription();
	}
	componentDidMount() {
		global.mission_mount = true;
		this.checkNetworkSpeed()
		this.getOfflineStatus();
		//this.getMissionDataFromLocal()
		//this.getMissionData();
		this.checkPermissionForFCM();
		this.getFCMToken();
		this.createNotificationChannel();

		this.appstateChangeMission = AppState.addEventListener('change', this._handleAppStateChange);
		this._subscription = NetInfo.addEventListener(
			this._handleConnectivityChange,
		);

		/** token refresh in firebase notification */
		this.onTokenRefreshListener = messaging().onTokenRefresh(async (fcmToken) => {
			this.updateFCMToken(fcmToken);
		})

		/** Notification handling methods */
		this.notificationOpenedListener = messaging().onNotificationOpenedApp(remoteMessage => {
			this.getMissionData();
		});

		this.messageListener = messaging().onMessage((message: RemoteMessage) => {
			if (message.data && message.data.title && message.data.title == 'Invalid Status Update' && message.data.body && message.data.body != '') {
				this.getMissionDataForStatusUpdate('inp_' + message.data.body, message.data.body + '_LastAccess');
			}
			else {
				this.getMissionData();
			}
		});


		messaging().setBackgroundMessageHandler(async remoteMessage => {
			// handleNotificationRedirection(remoteMessage)
		});

		//If your app is closed
		messaging().getInitialNotification().then((notificationOpen) => {
			if (notificationOpen) {
			}
		});

		// this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(fcmToken => {
		// 	// Process your token as required
		// 	this.updateFCMToken(fcmToken);

		// });


		// this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification: Notification) => {
		// 	// Process your notification as required
		// 	// ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
		// });

		// this.notificationListener = firebase.notifications().onNotification((notification: Notification) => {
		// 	if (Platform.OS === 'android') {
		// 		notification.android.setChannelId("eolas-channel");
		// 	}
		// 	firebase.notifications()
		// 		.displayNotification(notification);
		// 	// Process your notification as required
		// 	this.getMissionData();
		// });

		// this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
		// 	// Get the action triggered by the notification being opened
		// 	const action = notificationOpen.action;
		// 	// Get information about the notification that was opened
		// 	const notification: Notification = notificationOpen.notification;
		// 	this.getMissionData();
		// });


		// this.messageListener = firebase.messaging().onMessage((message: RemoteMessage) => {
		// 	// Process your message as required
		// 	if (message.data && message.data.title && message.data.title == 'Invalid Status Update' && message.data.body && message.data.body != '') {
		// 		this.getMissionDataForStatusUpdate('inp_' + message.data.body, message.data.body + '_LastAccess');
		// 	}
		// 	else {
		// 		this.getMissionData();
		// 	}
		// });
	}

	/** check network speed if slow network then set offline mode */
	checkNetworkSpeed = async () => {
		try {
			const networkSpeed = await measureConnectionSpeed();
			if (networkSpeed.finalspeed < 2.1) {
				global.isSlowNetwork = true
			}
			else {
				global.isSlowNetwork = false
			}
		} catch (err) {
			global.isSlowNetwork = false
		}

		/** getting mission data  */
		this.getMissionData();
	}

	/* get mission data when app state changes */
	_handleAppStateChange = (nextAppState) => {
		if (
			this.state.appState.match(/inactive|background/) &&
			nextAppState === 'active'
		) {
			this.checkNetworkSpeed()
			//this.getMissionData();
		}
		this.setState({ appState: nextAppState });

	};

	/**
	 * Check device internet connectivity and notify device online or offline
	 */
	_handleConnectivityChange = (state: NetInfoState) => {
		if (state.isConnected) {
			if (!connected) {
				Constants.saveKey("NetworkState", "online");
				connected = state.isConnected;
				//this.postOfflineAnswers();
				if (global.isSubmitProgress == '') {
					global.isSubmitProgress = 'InProgress';
					this.submitOfflineAnswers();
				}
				//this.syncSurveys();
			}
		} else {
			Constants.saveKey("NetworkState", "offline");
			connected = state.isConnected;
		}
	};

	/**
	 * get offline mission data from local storage
	 */
	async getOfflineStatus() {
		let offlineObj = await AsyncStorage.getItem('offlineObj');
		if (offlineObj !== null && offlineObj !== undefined && offlineObj.length > 0) {
			this.state.offlineObj = JSON.parse(offlineObj);
		}
	}

	/**
	 * get offline answered survey from local storage
	 * post offline answered survey when device is online
	 */
	async postOfflineAnswers() {
		let missionObject = await AsyncStorage.getItem('missionData');
		let apiKey = await AsyncStorage.getItem("api_key");
		if (missionObject !== null && missionObject !== undefined && missionObject.length > 0) {
			let missionData = JSON.parse(missionObject);
			for (var i = 0; i < missionData.length; i++) {
				try {
					let mid = missionData[i].id;
					let sub_ans = await AsyncStorage.getItem('inp_' + mid.toString());
					//let tag_id = await AsyncStorage.getItem('id_inp_' + mid.toString());
					let data = {}
					let answer = []
					if (sub_ans !== null && sub_ans !== undefined && sub_ans.length > 0) {
						answer = JSON.parse(sub_ans);
						data['mission_id'] = answer[0].mission_id;
						data['survey_id'] = answer[0].survey_id;
						/*if(tag_id && parseInt(tag_id) > -1)
						{
							data['survey_answer_tag'] = parseInt(tag_id);
						}
						else { */
						data['survey_answer_tag'] = answer[0].survey_answer_tag_id;
						for (var j = 0; j < answer.length; j++) {
							if (answer[j].survey_answer_tag_id && answer[j].survey_answer_tag_id != -1) {
								data['survey_answer_tag'] = answer[j].survey_answer_tag_id;
							}
						}
						//} 


						for (var j = 0; j < answer.length; j++) {
							let questionObj = answer[j];
							if (questionObj.question_type === "upload") {
								answer[j].answer['media'] = await RNFS.readFile(questionObj.answer['media'], "base64");
							} else if (questionObj.question_type === "capture") {
								answer[j].answer['image'] = await RNFS.readFile(questionObj.answer['image'], "base64");
							}
							else if (questionObj.question_type === "barcode") {
								answer[j].answer['image'] = await RNFS.readFile(questionObj.answer['image'], "base64");
							}
						}
						data['answers'] = answer;
						let url = Constants.BASE_URL + Service.OFFLINE_POST_SERVICE;
						axios.post(url, data, {
							headers: {
								"Content-Type": "application/json",
								Auth: apiKey
							},
							timeout: Constants.TIMEOUT
						})
							.then(response => {
								//console.log(response)							  
							})
							.catch(error => {
								//console.log(error);					  

							});
					}
				} catch (err) {
					//console.log(err);
				}
			}
		}
		global.isSubmitProgress = '';
	}

	/**
	 * get offline survey details from local storage
	 * submit a survey when device is connected to internet
	 */
	async submitOfflineAnswers() {
		let missionObject = await AsyncStorage.getItem('ans_keys_list');
		let apiKey = await AsyncStorage.getItem("api_key");
		let offlineExpMission = await AsyncStorage.getItem('offlineExport');
		let offlineExpData = JSON.parse(offlineExpMission)

		if (missionObject !== null && missionObject !== undefined && missionObject.length > 0) {
			let missionData = JSON.parse(missionObject);
			for (var i = 0; i < missionData.length; i++) {
				try {
					let sub_ans = await AsyncStorage.getItem(missionData[i]);
					let answer = [];
					let data = {};
					let delList = [];
					if (sub_ans !== null && sub_ans !== undefined && sub_ans.length > 0) {
						answer = JSON.parse(sub_ans);
						data['mission_id'] = answer[0].mission_id;
						data['survey_id'] = answer[0].survey_id;
						data['index'] = missionData[i];
						data['survey_answer_tag'] = answer[0].survey_answer_tag_id;
						data['sub_key'] = '';
						for (var j = 0; j < answer.length; j++) {
							if (answer[j].survey_answer_tag_id && answer[j].survey_answer_tag_id != -1) {
								data['survey_answer_tag'] = answer[j].survey_answer_tag_id;
							}
						}

						for (var j = 0; j < answer.length; j++) {
							if (answer[j].sub_key) {
								data['sub_key'] = answer[j].sub_key;
							}
							if (answer[j].activeTime) {
								data['activeTime'] = answer[j].activeTime;
							}
						}

						for (var j = 0; j < answer.length; j++) {
							let questionObj = answer[j];
							if (questionObj.question_type === "upload") {
								try {

									answer[j].answer['media'] = await RNFS.readFile(questionObj.answer['media'], "base64");
									delList.push(questionObj.answer['media']);

								} catch (err) {
									//console.log(err);
								}
							} else if (questionObj.question_type === "capture") {
								try {

									answer[j].answer['image'] = await RNFS.readFile(questionObj.answer['image'], "base64");
									delList.push(questionObj.answer['image']);

								} catch (err) {
									//console.log(err);
								}
							}
							else if (questionObj.question_type === "barcode") {
								try {

									answer[j].answer['image'] = await RNFS.readFile(questionObj.answer['image'], "base64");
									delList.push(questionObj.answer['image']);

								} catch (err) {
									//console.log(err);
								}
							}
						}
						data['answers'] = answer;
						let url = Constants.BASE_URL + Service.OFFLINE_SUBMIT_SERVICE;
						await axios.post(url, data, {
							headers: {
								"Content-Type": "application/json",
								Auth: apiKey
							},
							timeout: Constants.TIMEOUT
						})
							.then(response => {
								const elementsIndex = offlineExpData && offlineExpData.findIndex(element => element.sub_key == data['index'])
								offlineExpData[elementsIndex].isSynced = true
								Constants.saveKey('offlineExport', JSON.stringify(offlineExpData))

								this.deleteItem(data['index'], delList);
							})
							.catch(error => {
								//console.log(error);
							});
					}
				} catch (err) {
					//console.log(err);
				}
			}

		}
		this.postOfflineAnswers();

	}

	/**
	 * delete answer item after sync 
	 * @param {object} fileList - clear offline answer when offline answer is successfully posted to server 
	 */
	async deleteItem(key, fileList) {
		try {
			await AsyncStorage.removeItem(key);
			for (let i = 0; i < fileList.length; i++) {
				RNFS.unlink(fileList[i])
					.then(() => {
						// console.log('File deleted ' + fileList[i]);   
					})
					.catch((err) => {
						//console.log('Error in File delete ' + fileList[i]);   
						// console.log(err)
					});
			}
			// console.log('delete item done...');
		} catch (error) {
			// console.log(error.message);
		}
	}
	/**
	 * If device is online, get mission list api call or get mission list from local storage
	 */
	async syncSurveys() {
		let api_key = await AsyncStorage.getItem("api_key");
		try {
			let url =
				Constants.BASE_URL + Service.SURVEY_QUESTIONS;
			let stateObj = this.state.offlineObj;
			let downloadList = [];

			axios
				.get(url, {
					headers: {
						"Content-Type": "application/json",
						Auth: api_key
					},
					timeout: Constants.TIMEOUT
				})
				.then(response => {
					if (response.data.status === 200) {
						if (response.data.hasOwnProperty("data")) {
							//console.log(response.data.data);
							response.data.data.map(mdata => {

								let mid = mdata.id;
								let surveys = mdata.data;
								let onBoardArr = [];
								let screenerArr = [];
								let mainQuestionArr = [];
								let allQuestions = [];
								let totFiles = 0;
								let fList = [];
								let pList = [];

								surveys.map(data => {

									let gpsHidden =
										data.gps_hidden !== undefined ? data.gps_hidden : 0;
									if (data.hasOwnProperty("survey_type")) {

										/**
										 * onboard
										 * */

										if (data.survey_type === "onboard") {
											if (data.hasOwnProperty("questions")) {
												if (data.questions.length > 0) {
													data.questions.map(result => {
														let que = {
															answer: null,
															properties: result.question.properties,
															survey_id: data.survey_id,
															questionID: result.question.question_id,
															questionType: result.question.type,
															surveyAnsTagId: -1,
															conditions: result.question.hasOwnProperty(
																"conditions"
															)
																? result.question.conditions
																: [],
															handler: result.question.hasOwnProperty(
																"handler"
															)
																? result.question.handler
																: null,
															uniqueID: result.id,
															gpsHidden: gpsHidden
														};

														onBoardArr.push(que);
													});
												}
											}
											if (onBoardArr.length > 0) {
												onBoardArr.map(data => {
													allQuestions.push(data);
												});
											}
										}
										/**
										 * onscreen
										 * */
										if (data.survey_type === "screener") {
											if (data.hasOwnProperty("questions")) {
												if (data.questions.length > 0) {
													data.questions.map(result => {
														let que = {
															answer: null,
															properties: result.question.properties,
															survey_id: data.survey_id,
															questionID: result.question.question_id,
															questionType: result.question.type,
															surveyAnsTagId: -1,
															conditions: result.question.hasOwnProperty(
																"conditions"
															)
																? result.question.conditions
																: [],
															handler: result.question.hasOwnProperty(
																"handler"
															)
																? result.question.handler
																: null,
															uniqueID: result.id,
															gpsHidden: gpsHidden
														};

														screenerArr.push(que);
													});
												}
											}

											if (screenerArr.length > 0) {
												screenerArr.map(data => {
													allQuestions.push(data);
												});
											}

										}

										/**
										 * main
										 * */
										if (data.survey_type === "main") {
											if (data.hasOwnProperty("questions")) {
												if (data.questions.length > 0) {
													data.questions.map(result => {
														let que = {
															answer: "",
															properties: result.question.properties,
															survey_id: data.survey_id,
															questionID: result.question.question_id,
															questionType: result.question.type,
															surveyAnsTagId: -1,
															conditions: result.question.hasOwnProperty(
																"conditions"
															)
																? result.question.conditions
																: [],
															handler: result.question.hasOwnProperty(
																"handler"
															)
																? result.question.handler
																: null,
															uniqueID: result.id,
															gpsHidden: gpsHidden
														};
														if (que.questionType == "info" && que.properties.info_type == "audio" && que.properties.info_audio && que.properties.info_audio != "") {
															let name = que.properties.info_audio;
															let filename = name.substring(name.lastIndexOf("/") + 1, name.length);
															let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
															path_name = path_name.replace(/%20/g, "_");

															//this.downloadfile(que.properties.info_audio, path_name, mid.toString());
															totFiles = totFiles + 1;
															pList.push(path_name);
															fList.push(que.properties.info_audio);
															que.properties.info_audio = "file://" + path_name;


														} else if (que.questionType == "info" && que.properties.info_type == "video" && que.properties.info_video && que.properties.info_video != "") {
															let name = que.properties.info_video;
															let filename = name.substring(name.lastIndexOf("/") + 1, name.length);
															let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
															path_name = path_name.replace(/%20/g, "_");

															//this.downloadfile(que.properties.info_video, path_name, mid.toString());

															totFiles = totFiles + 1;
															pList.push(path_name);
															fList.push(que.properties.info_video);
															que.properties.info_video = "file://" + path_name;

														}
														else if (que.questionType == "info" && que.properties.info_type == "image" && que.properties.info_image && que.properties.info_image != "") {
															let name = que.properties.info_image;
															let filename = name.substring(name.lastIndexOf("/") + 1, name.length);
															let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
															path_name = path_name.replace(/%20/g, "_");

															//this.downloadfile(que.properties.info_image, path_name, mid.toString());

															totFiles = totFiles + 1;
															pList.push(path_name);
															fList.push(que.properties.info_image);
															que.properties.info_image = "file://" + path_name;

														}

														else if (que.questionType == "scale" && que.properties.scale_type == "scale" && que.properties.scale_content) {
															let scaleContents = que.properties.scale_content;
															for (let k = 0; k < scaleContents.length; k++) {
																if (scaleContents[k].image_id && scaleContents[k].image_id != "") {
																	let name = scaleContents[k].image_id;
																	let filename = name.substring(name.lastIndexOf("/") + 1, name.length);
																	let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
																	//this.downloadfile(scaleContents[k].image_id, path_name, mid.toString());
																	totFiles = totFiles + 1;
																	pList.push(path_name);
																	fList.push(scaleContents[k].image_id);

																	que.properties.scale_content[k].remote_image_id = scaleContents[k].image_id;
																	que.properties.scale_content[k].image_id = "file://" + path_name;
																}
															}
														}
														else if (que.questionType == "scale" && que.properties.scale_type == "table" && que.properties.grid_type == "image" && que.properties.table_content
															&& que.properties.table_content.table_value) {
															let table_value = que.properties.table_content.table_value;
															for (let k = 0; k < table_value.length; k++) {
																let images = table_value[k].image;
																if (images) {
																	for (let j = 0; j < images.length; j++) {
																		if (images[j].image_id && images[j].image_id != "") {
																			let name = images[j].image_id;
																			let filename = name.substring(name.lastIndexOf("/") + 1, name.length);
																			let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
																			// this.downloadfile(images[j].image_id, path_name, mid.toString());
																			totFiles = totFiles + 1;
																			pList.push(path_name);
																			fList.push(images[j].image_id);
																			que.properties.table_content.table_value[k].image[j].remote_image_id = images[j].image_id;
																			que.properties.table_content.table_value[k].image[j].image_id = "file://" + path_name;

																		}
																	}
																}
															}
														}

														else if (que.questionType == "capture" && que.properties.scale_enabled && que.properties.scale_enabled == "1" && que.properties.scale_images) {
															let scaleContents = que.properties.scale_images;
															for (let k = 0; k < scaleContents.length; k++) {
																if (scaleContents[k].image && scaleContents[k].image != "") {
																	let name = scaleContents[k].image;
																	let filename = name.substring(name.lastIndexOf("/") + 1, name.length);
																	let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
																	//this.downloadfile(scaleContents[k].image, path_name, mid.toString());
																	totFiles = totFiles + 1;
																	pList.push(path_name);
																	fList.push(scaleContents[k].image);
																	que.properties.scale_images[k].image = "file://" + path_name;

																}
															}
														}
														else if (que.questionType == "choice" && que.properties.options && que.properties.multilevel == 1) {
															let scaleContents = que.properties.options;
															for (let k = 0; k < scaleContents.length; k++) {
																if (scaleContents[k].label_image && scaleContents[k].label_image != "") {
																	let name = scaleContents[k].label_image;
																	let filename = name.substring(name.lastIndexOf("/") + 1, name.length);
																	let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
																	//this.downloadfile(scaleContents[k].image, path_name, mid.toString());
																	totFiles = totFiles + 1;
																	pList.push(path_name);
																	fList.push(scaleContents[k].label_image);
																	que.properties.options[k].remote_label_image = scaleContents[k].label_image;
																	que.properties.options[k].label_image = "file://" + path_name;

																}
																if (scaleContents[k].sublabel) {
																	let subcontents = scaleContents[k].sublabel;
																	for (let c = 0; c < subcontents.length; c++) {
																		if (subcontents[c].label_image && subcontents[c].label_image != "") {
																			let name = subcontents[c].label_image;
																			let filename = name.substring(name.lastIndexOf("/") + 1, name.length);
																			let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
																			//this.downloadfile(scaleContents[k].image, path_name, mid.toString());
																			totFiles = totFiles + 1;
																			pList.push(path_name);
																			fList.push(subcontents[c].label_image);
																			que.properties.options[k].sublabel[c].remote_label_image = subcontents[c].label_image;
																			que.properties.options[k].sublabel[c].label_image = "file://" + path_name;
																		}

																	}

																}
															}
														}
														else if (que.questionType == "choice" && que.properties.options && que.properties.multilevel == 0) {
															let scaleContents = que.properties.options;
															for (let k = 0; k < scaleContents.length; k++) {
																if (scaleContents[k].label_image && scaleContents[k].label_image != "") {
																	let name = scaleContents[k].label_image;
																	let filename = name.substring(name.lastIndexOf("/") + 1, name.length);
																	let path_name = RNFS.DocumentDirectoryPath + "/" + filename;
																	//this.downloadfile(scaleContents[k].image, path_name, mid.toString());
																	totFiles = totFiles + 1;
																	pList.push(path_name);
																	fList.push(scaleContents[k].label_image);
																	que.properties.options[k].remote_label_image = scaleContents[k].label_image;
																	que.properties.options[k].label_image = "file://" + path_name;

																}
															}
														}

														mainQuestionArr.push(que);
													});
												}
											}
											if (mainQuestionArr.length > 0) {
												mainQuestionArr.map(data => {
													allQuestions.push(data);
												});
											}
										}
									}
								});

								/** This is temporary solution to remove extra element - last element is three time while there is loop
								 *  https://api.flexicollect.com/v1/mission_survey_questions - Api having issue so this is temporary solution add filter line
								 *  for removing same object
								 */
								allQuestions = allQuestions && allQuestions.filter((v, i, a) => a.findIndex(t => (t.uniqueID === v.uniqueID)) === i)


								Constants.saveKey(mid.toString(), JSON.stringify(allQuestions));
								this.state.totalFiles[mid.toString()] = totFiles;
								this.state.downFiles[mid.toString()] = 0;


								if (totFiles == 0) {
									stateObj[mid.toString()] = offline_img;
									Constants.saveKey("survey_sync_" + mid.toString(), "success");

								} else {
									let obj = {};
									obj.pList = pList;
									obj.fList = fList;
									obj.id = mid.toString();
									downloadList.push(obj);
								}

							});
						}
					}

					this.downloadFiles(downloadList);
					Constants.saveKey("offlineObj", JSON.stringify(stateObj));
					this.setState({ offlineObj: stateObj });
				})
				.catch(error => {
					//console.log(error)
				});

		} catch (err) {
			//console.log(err)
		}

	}

	/**
	 * download files 
	 * @param {object} downloadList - If device is online, download mission list and survey questions to local storage
	 * 
	 */
	async downloadFiles(downloadList) {
		if (global.isDownloadProgress == "") {
			global.isDownloadProgress = "progress"

			for (let i = 0; i < downloadList.length; i++) {
				let obj = downloadList[i];
				let pList = obj.pList;
				let fList = obj.fList;
				for (let j = 0; j < fList.length; j++) {
					try {
						let download = await RNFS.exists(pList[j]).then(exists => {
							if (exists) {
								this.state.downFiles[obj.id] = this.state.downFiles[obj.id] + 1;

								return false;
							} else {
								return true;
							}
						});
						if (download && global.mission_mount) {
							await RNFS.downloadFile({
								fromUrl: fList[j],
								toFile: pList[j]
							})
								.promise.then(res => {
									if (res && res.statusCode && res.statusCode == 200) {
										this.state.downFiles[obj.id] = this.state.downFiles[obj.id] + 1;
									}
								})
								.catch(err => {
									//console.log("err downloadFile", err);
								});
						} else if (global.mission_mount === false) {
							global.isDownloadProgress = "";
							return;
						}
					} catch (err) {
						//console.log(err);
					}
				}

				if (this.state.downFiles[obj.id] == this.state.totalFiles[obj.id]) {
					this.state.offlineObj[obj.id] = offline_img;
					let offlineObj = this.state.offlineObj;
					Constants.saveKey("survey_sync_" + obj.id, "success");
					this.setState({ offlineObj: offlineObj });
				} else {
					this.state.offlineObj[obj.id] = null;
					Constants.saveKey("survey_sync_" + obj.id, "failed");
				}

			}

			let offlineObj = this.state.offlineObj;

			Constants.saveKey("offlineObj", JSON.stringify(offlineObj));

			this.setState({ offlineObj: offlineObj });
			global.isDownloadProgress = "";
		}
		else {
			//console.log('download in progress ###########')
		}
	}

	/**
	 * 
	 * unused function
	 */
	async downloadfile(filename, path_name, mid) {
		try {
			let download = await RNFS.exists(path_name).then(exists => {
				if (exists) {
					return false;
				} else {
					return true;
				}
			});
			if (download) {
				await RNFS.downloadFile({
					fromUrl: filename,
					toFile: path_name
				})
					.promise.then(res => {
						//console.log("File Downloaded", res);				
					})
					.catch(err => {
						//console.log("err downloadFile", err);
					});
			}

		} catch (err) {
			//console.log(err)
		}

	}

	/** set notification chanel for android */
	async createNotificationChannel() {
		if (Platform.OS === 'android') {
			// Build a channel
			// const channel = new firebase.notifications.Android.Channel('eolas-channel', 'Eolas Channel', firebase.notifications.Android.Importance.Max)
			// .setDescription('Eolas Notifications channel');

			const channel = new messaging().Android.chanel('eolas-channel', 'Eolas Channel', messaging().Android.Importance.Max).setDescription('Eolas Notifications channel')

			// Create the channel
			// firebase.notifications().android.createChannel(channel)
			messaging().android.createChannel(channel)
		}

	}

	/** check FCM permission */
	async checkPermissionForFCM() {
		// firebase.messaging().hasPermission()
		// 	.then(enabled => {
		// 		if (enabled) {
		// 			// user has permissions
		// 		} else {
		// 			// user doesn't have permission
		// 			firebase.messaging().requestPermission()
		// 				.then(() => {
		// 					// User has authorised  
		// 				})
		// 				.catch(error => {
		// 					// User has rejected permissions  
		// 					// if (Platform.OS == 'ios') {
		// 					// 	this.askNotificationPermission();
		// 					// }
		// 				});
		// 		}
		// 	});
		const hasPermission = await messaging().hasPermission();
		const enabled = hasPermission === messaging.AuthorizationStatus.AUTHORIZED || hasPermission === messaging.AuthorizationStatus.PROVISIONAL;
		if (hasPermission === messaging.AuthorizationStatus.AUTHORIZED || hasPermission === messaging.AuthorizationStatus.PROVISIONAL) {
			await this.getFCMToken();
		}
		else if (hasPermission === messaging.AuthorizationStatus.DENIED || hasPermission === messaging.AuthorizationStatus.NOT_DETERMINED) {
			const isPermission = await this.requestUserPermission();
			if (!isPermission) {
				return false;
			}
			else this.getFCMToken();
		}
		else {
			const isPermission = await this.requestUserPermission();
			if (!isPermission) {
				return false;
			}
			else this.getFCMToken();
		}


	}
	// askNotificationPermission = () => {
	// 	Alert.alert(
	// 		"Permission",
	// 		"Please turn on notification permission",
	// 		[
	// 			{
	// 				text: "Cancel",
	// 				onPress: () => { },
	// 				style: "cancel"
	// 			},
	// 			{
	// 				text: "OK",
	// 				onPress: () => {
	// 					Linking.openURL('app-settings:')
	// 				}
	// 			}
	// 		],
	// 		{ cancelable: false }
	// 	)
	// }
	/**request notification permission */
	requestUserPermission = async () => {
		const settings = await messaging().requestPermission({
			provisional: false,
		});
		if (settings) {
			return settings;
		}
	}

	/**
	 * get mission data from local storage
	 * */
	async getMissionDataFromLocal() {
		let missionObject = await AsyncStorage.getItem('missionData');
		if (missionObject != null) {
			/** case when offline mission available then take from there */
			let mData = JSON.parse(missionObject);

			for (let i = 0; i < mData.length; i++) {
				let stat = await AsyncStorage.getItem("inp_" + mData[i].id.toString());
				if (stat != null && stat != "") {
					mData[i].survey_status = "In Progress";
				} else {
					mData[i].survey_status = "";
				}

				/** by - k  remove submission exided mission from list */
				if (mData[i].per_user_submission_type === 'single' && mData[i].total_submissionDone_perUser > 0) {
					mData.splice(i, 1);
				}
				else if (mData[i].per_user_submission_type === 'multiple' &&
					mData[i].no_submissions_per_user > 0 && mData[i].total_submissionDone_perUser >= mData[i].no_submissions_per_user) {
					mData.splice(i, 1);
				} else if (mData[i].submission > 0 &&
					mData[i].user_submission >= mData[i].submission) {
					mData.splice(i, 1);
				}
			}

			if (missionObject !== null && missionObject !== undefined && missionObject.length > 0) {
				this.setState({ missionData: mData, isLoading: false })
			}
		}
		else if (missionObject == null && global.isSlowNetwork == true) {
			/** case when first time local mission data not available then forcefully slow network make false  
			 *  and get missin data online */
			global.isSlowNetwork = false
			this.getMissionData()
		}
	}

	async getMissionDataForStatusUpdate(key, lastAccess) {
		let tmpList = [];
		await AsyncStorage.setItem(key, JSON.stringify(tmpList));
		await AsyncStorage.setItem(lastAccess, '');
		this.getMissionData();
	}

	/**
	 * api call to get mission data
	 * */
	async getMissionData() {
		try {
			let xpPoints;
			let api_key = await AsyncStorage.getItem('api_key');
			let url = Constants.BASE_URL + Service.MISSION + 'false';
			/** set forcefully offline if user profile set offine true then survey submit should be offline*/
			let setOffline = await AsyncStorage.getItem('setOffline') || false;
			let missionObject = await AsyncStorage.getItem('missionData');

			NetInfo.fetch().then(state => {
				// NetInfo.isConnected.fetch().then(isChromeConnected => { // This usage is depcreated in the new version
				status = state.isConnected ? 'online' : 'offline'
				if (status === 'online' && global.isSlowNetwork != true) {
					Constants.saveKey("NetworkState", "online");
					axios.get(url, {
						headers: {
							'Content-Type': 'application/json',
							'Auth': api_key
						},
						timeout: Constants.TIMEOUT,
					}).then(response => {
						if (response.data.status === 200) {
							if (this.props.isPepsicoUser == '1') {
								/** for pepsico user progrss increment is based on pointBadges array */
								let currentXP = response.data.current_customer_xp
								for (let i = 0; i < this.state.pointBadges.length; i++) {
									if (this.state.pointBadges[i] >= currentXP) {
										xpPoints = currentXP + '/' + this.state.pointBadges[i];
										break;
									}
									else if (currentXP > this.state.pointBadges[this.state.pointBadges.length - 1]) {
										xpPoints = currentXP + '/' + this.state.pointBadges[this.state.pointBadges.length - 1]
									}
								}
							}
							else {
								xpPoints = response.data.current_customer_xp + '/' + response.data.total_customer_xp;
							}
							Constants.saveKey("xpPoint", xpPoints);
							const missionNewArray = response.data.mission_data && response.data.mission_data.map(obj => ({ ...obj, total_submissionDone_perUser: 0 }))

							// /** get per user count done while user is online mode and set it as default value for key for offline mode and add total_submissionDone_perUser key for locally manage to submittion limit  */
							if (missionObject !== null && missionObject !== undefined && missionObject.length > 0) {
								let missionData = JSON.parse(missionObject);
								missionNewArray && missionNewArray.map((obj, index) => {
									const indexOfObj = missionData.findIndex(el => el["id"] == obj["id"]);
									const offlineObj = indexOfObj !== -1 ? missionData[index] : {};
									if (offlineObj) {
										obj.total_submissionDone_perUser = (offlineObj.total_submissionDone_perUser ? offlineObj.total_submissionDone_perUser : 0)
									}
								});
							}

							Constants.saveKey("missionData", JSON.stringify(missionNewArray));

							/** by - k  remove submission exided mission from list */
							missionNewArray && missionNewArray.map((obj, index) => {
								if (obj.per_user_submission_type === 'single' && obj.total_submissionDone_perUser > 0) {
									missionNewArray.splice(index, 1);
								}
								else if (obj.per_user_submission_type === 'multiple' &&
									obj.no_submissions_per_user > 0 && obj.total_submissionDone_perUser >= obj.no_submissions_per_user) {
									missionNewArray.splice(index, 1);
								} else if (obj.submission > 0 &&
									obj.user_submission >= obj.submission) {
									missionNewArray.splice(index, 1);
								}
							})

							this.setState({ missionData: missionNewArray }, () => {
								setTimeout(() => {
									this.setState({ isLoading: false });
								}, 1000)

							})
							this.syncSurveys();

							this.props.xpPoint()
						}
					}).catch((error) => {
						this.setState({ isLoading: false });
						if (error.hasOwnProperty('response')) {
							let errorResponse = error.response;
							if (errorResponse.hasOwnProperty('data')) {
								if (errorResponse.data.status === 401) {
									Constants.showSnack(this.state.translation_common[this.props.Language].Session_Expired);
									this.moveToSignInScreen()
									// setTimeout(() => {
									// 	this.moveToSignInScreen()
									// }, 1000)

								}
							}
						}
					})
				} else {
					Constants.saveKey("NetworkState", "offline");
					this.getMissionDataFromLocal();
				}
			});
		} catch (e) {
			//console.log(e)
		}
	}

	/** get FCM token and update for the notification */
	async getFCMToken() {
		// firebase.messaging().getToken()
		// 	.then(fcmToken => {
		// 		if (fcmToken) {
		// 			// user has a device token
		// 			this.updateFCMToken(fcmToken);
		// 		}
		// 	}).catch((error) => {
		// 		//error
		// 	});
		const token = await messaging().getToken();
		if (token) {
			this.updateFCMToken(token);
		}

	}

	/** Api call for the FCM token update to receive push notification*/
	async updateFCMToken(fcmToken) {
		if (fcmToken) {
			// user has a device token
			let api_key = await AsyncStorage.getItem('api_key');
			let url = Constants.BASE_URL + Service.POST_FCM_TOKEN;

			let token = {
				fcmtoken: fcmToken
			}
			axios.post(url, token, {
				headers: {
					'Content-Type': 'application/json',
					'Auth': api_key
				},
				timeout: Constants.TIMEOUT,
			}).then(response => {
				//success
			}).catch((error) => {
				//error
			})

		}

	}

	/**
	 * move to signin page when session expired
	 */
	moveToSignInScreen() {
		AsyncStorage.clear();
		// navigate to signIn page
		setTimeout(() => {
			// const resetAction = StackActions.reset({
			// 	index: 0,
			// 	actions: [NavigationActions.navigate({ routeName: 'SignIn' })],
			// });
			// this.props.navigation.dispatch(resetAction);
			const resetAction = CommonActions.reset({
				index: 0,
				routes: [{ name: 'SignIn' }],
			});
			this.props.navigation.dispatch(resetAction);
		}, 500)

	}

	/**
	 * getHeight
	 * */
	getHeightValue(height) {
		let newHeight = height / 100 * 54;
		if (height === 100) {
			newHeight = newHeight - 1.8;
		}
		return newHeight;
	}

	/**
	 * navigate to tab container and need to replace home page by survey page for that we use 'surveyCheck' param set to true
	 * */
	navigateToPage(id, missionName) {
		Constants.saveKey('surveyCheck', 'true');
		Constants.saveKey('missionName', missionName);
		this.props.navigation.navigate('SurveyBox', { missionId: id, missionName: missionName, from: 'home' })
		// const resetAction = StackActions.reset({
		//     index: 0,
		//     actions: [NavigationActions.navigate({routeName: 'SurveyBox',params:{missionId:id}})],
		// });
		// this.props.navigation.dispatch(resetAction);
	}

	/** Class render method*/
	render() {
		const { isLoading, missionData, offlineObj } = this.state;
		return (
			<View style={styles.viewContainer}>

				{!isLoading && missionData.length > 0 && (
					<FlatList
						contentContainerStyle={{ paddingBottom: 10 }}
						style={styles.resultFlatListContainer}
						showsVerticalScrollIndicator={false}
						vertical
						data={missionData}
						renderItem={
							({ item, index }) => {
								return (
									<View style={styles.parentView}>
										<TouchableOpacity
											style={Platform.OS === 'ios' ? styles.itemIosContainer : styles.itemContainer}
											onPress={() => {
												this.navigateToPage(item.id, item.mission_name)
											}}
											activeOpacity={0.8}>
											<View
												style={Platform.OS === 'ios' ? styles.iosContainer : styles.imageContainer}>
												{item.mission_image != null ? <Image
													style={styles.iosImageBanner}
													source={{ uri: item.mission_image }}
												/> :
													<Image
														style={styles.iosImageBanner}
														source={require('../../images/home/mission/product_bg.png')}
													/>
												}

												{/*<View style={styles.imgOverlay}/>*/}
												{/*<View style={styles.vectorContainer}>*/}
												{/*<Image*/}
												{/*style={styles.vectorImage}*/}
												{/*source={require('../../images/home/mission/vector.png')}/>*/}
												{/*<View style={{position: 'absolute', justifyContent: 'center'}}>*/}
												{/*<Text*/}
												{/*style={[styles.vectorText, {fontFamily: Font.fontRobotoMedium}]}>{item.mission_points !== '' ? item.mission_points : 0}</Text>*/}
												{/*<Text style={[styles.vectorText, {paddingBottom: 10}]}>XP</Text>*/}
												{/*</View>*/}

												{/*</View>*/}
												<View style={styles.imgOverlay} />
												<Text style={styles.productName}>{item.mission_name}</Text>
											</View>


											<View style={{
												flexDirection: 'row',
												// borderWidth:2,
												borderBottomLeftRadius: 4,
												borderBottomRightRadius: 4,
												borderBottomWidth: 1.5,
												borderLeftWidth: 1.5,
												borderRightWidth: 1.5,
												borderBottomColor: '#c0bebe',
												borderLeftColor: '#c0bebe',
												borderRightColor: '#c0bebe'
											}}>
												<View style={styles.iconTextView}>
													{offlineObj[item.id.toString()] != null &&
														<Image
															style={{ width: 50, height: 50, alignSelf: 'center', alignItems: 'center' }}
															source={require('../../images/survey/offline.png')} />
													}

												</View>
												<View style={styles.iconsContainer}>
													<View>
														<Text style={styles.percentText}>{item.survey_status ? item.survey_status : ""}</Text>

													</View>
												</View>

											</View>
											{Platform.OS === 'android' && (
												<View style={styles.vectorContainer}>
													<Image
														style={styles.vectorImage}
														source={require('../../images/home/mission/vector.png')} />
													<View style={{ position: 'absolute', justifyContent: 'center' }}>
														<Text
															style={[styles.vectorText, { fontFamily: Font.fontRobotoMedium }]}>{item.mission_points !== '' ? item.mission_points.toString().substring(0, 3) : 0}</Text>
														<Text style={[styles.vectorText, { paddingBottom: 10 }]}>XP</Text>
													</View>

												</View>
											)}

										</TouchableOpacity>
										{Platform.OS === 'ios' && (
											<View style={styles.vectorContainer}>
												<Image
													style={styles.vectorImage}
													source={require('../../images/home/mission/vector.png')} />
												<View style={{ position: 'absolute', justifyContent: 'center' }}>
													<Text
														style={[styles.vectorText, { fontFamily: Font.fontRobotoMedium }]}>{item.mission_points !== '' ? item.mission_points.toString().substring(0, 3) : 0}</Text>
													<Text style={[styles.vectorText, { paddingBottom: 10 }]}>XP</Text>
												</View>

											</View>
										)}


									</View>
								)

							}}
						keyExtractor={(item, index) => index.toString()}
					/>)}

				{
					isLoading && (
						<ActivityIndicator style={{ alignSelf: 'center', flex: 1, justifyContent: 'center' }}
							size="large"
							color={Color.colorDarkBlue} />
					)
				}

				{!isLoading && missionData.length === 0 && (
					<View style={{ alignSelf: 'center', flex: 1, justifyContent: 'center' }}>
						<Text style={{ color: Color.colorBlack, fontSize: 20 }}>{this.props.translation[this.props.Language].No_Survey}</Text>
					</View>
				)}


			</View>
		)
	}
}

export default Mission;

/** UI styles used for this class */
const width = '100%',
	height = 162,
	borders = {
		tl: 7,
		tr: 7,
		bl: 0,
		br: 0,
	};

const baseStyle = {
	width: width,
	height: height,
	borderTopLeftRadius: borders.tl,
	borderTopRightRadius: borders.tr,
	borderBottomLeftRadius: borders.bl,
	borderBottomRightRadius: borders.br,
};

const styles = ScaledSheet.create({
	viewContainer: {
		flex: 1,
		backgroundColor: Color.colorWhiteBg
	},
	searchView: {
		flexDirection: 'row',
		height: 45,
		alignSelf: 'stretch',
		marginLeft: Dimension.marginEight,
		marginRight: Dimension.marginEight,
		marginTop: Dimension.marginEight,
		borderRadius: Dimension.radius,
		borderLeftWidth: 0,
		borderRightWidth: 0,
		borderBottomWidth: 1,
		borderBottomColor: Color.colorGridGrey,
		shadowColor: Color.colorGrey,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.8,
		shadowRadius: 2,
		elevation: 2
	},
	iconTextView: {
		flex: 0.6,
		flexDirection: 'row',
		marginLeft: 5
	},
	searchIcon: {
		width: 18,
		height: 18,
		alignSelf: 'center',
		marginLeft: 12
	},
	searchText: {
		fontSize: Dimension.mediumText + '@ms0.3',
		alignSelf: 'center',
		color: Color.colorSearchGrey,
		marginLeft: Dimension.marginFifteen
	},
	iconsContainer: {
		flex: 0.4,
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	micIcon: {
		width: 14,
		height: 19,
		alignSelf: 'center'
	},
	settingIcon: {
		width: 4,
		height: 16,
		alignSelf: 'center',
		marginRight: 18,
		marginLeft: 23
	},
	resultFlatListContainer: {
		flex: 1,
		marginLeft: Dimension.marginEight,
		marginRight: Dimension.marginEight,
	},
	itemContainer: {
		alignSelf: 'stretch',
		borderRadius: 7,
		marginTop: 13,
		borderTopColor: Color.colorWhite,
		borderBottomColor: Color.colorGridGrey,
	},
	itemIosContainer: {
		borderRadius: 7,
		marginTop: 13,
	},
	imageContainer: {
		borderTopLeftRadius: Dimension.radius,
		borderTopRightRadius: Dimension.radius,
		alignSelf: 'stretch',
		height: 162
	},
	imageBanner: {
		borderTopLeftRadius: Dimension.radius,
		borderTopRightRadius: Dimension.radius,
		alignSelf: 'stretch',
		height: 162
	},
	parentView: {
		alignSelf: 'stretch',
		backgroundColor: Color.colorWhiteBg,
		shadowOffset: { width: 0, height: 1 },
	},
	iosContainer: {
		overflow: 'hidden',
		...baseStyle,
	},
	iosImageBanner: baseStyle,
	imgOverlay: {
		position: 'absolute',
		alignSelf: 'center',
		backgroundColor: Color.colorBlack,
		opacity: 0.4,
		...baseStyle
	},
	vectorContainer: {
		position: 'absolute',
		top: Platform.OS === 'ios' ? 6 : 0,
		right: 0,
		marginRight: 11,
		alignItems: 'center',
		justifyContent: 'center',
	},
	vectorImage: {
		width: 42,
		height: 50,
		marginTop: Platform.OS === 'ios' ? 0 : -7
	},
	vectorText: {
		color: Color.colorWhite,
		fontSize: Dimension.mediumText,
		alignSelf: 'center',
		paddingRight: 10
	},
	productName: {
		fontSize: Dimension.veryLargeText,
		position: 'absolute',
		fontFamily: Font.fontRobotoBold,
		fontWeight: 'bold',
		color: Color.colorWhite,
		paddingLeft: 8,
		paddingBottom: 8,
		left: 0,
		bottom: 0
	},
	descriptionText: {
		fontSize: Dimension.normalText,
		color: Color.colorDescription,
		paddingLeft: 8,
		paddingTop: 8,
		paddingBottom: 8
	},
	percentText: {
		fontSize: Dimension.normalText,
		color: Color.colorOrange,
		alignSelf: 'flex-start',
		marginRight: 8,
		marginTop: 5,
		paddingLeft: 8,
		paddingRight: 8,
		paddingTop: 8,
		paddingBottom: 16
	},
	progressContainer: {
		width: 54,
		height: 10,
		borderRadius: 20,
		marginRight: 8,
		marginTop: 8,
		marginBottom: 8,
		justifyContent: 'flex-start',
		flexDirection: 'row',
		borderColor: Color.colorProgressBorder,
		backgroundColor: Color.colorProgressBg,
		borderWidth: 1
	},
	fillColor: {
		width: 6,
		bottom: 0.1,
		flexDirection: 'row',
		borderBottomLeftRadius: 10,
		borderBottomRightRadius: 10,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		backgroundColor: Color.colorGreen,
		borderColor: Color.colorTinyGrey
	}
})