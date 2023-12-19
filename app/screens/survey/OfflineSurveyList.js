import React, { Component } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StatusBar,
    Text,
    TouchableOpacity,
    TouchableHighlight,
    View,
    FlatList,
    Alert,
    PermissionsAndroid,
    ActivityIndicator,
    Modal,
    ImageBackground
} from 'react-native';
import * as Font from '../../style/Fonts';
import * as Constants from '../../utils/Constants';
import { SafeAreaView } from "react-native-safe-area-context";
import * as Color from "../../style/Colors";
import { ScaledSheet } from "react-native-size-matters";
import * as Dimension from "../../style/Dimensions";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from "react-native-fs";
import * as String from '../../style/Strings';

const { height, width } = Dimensions.get('window');
let backArrow = require('../../images/survey/arrow_back.png')
let closeIcon = require('../../images/survey/closeIcon.png')

/** offline survey list class to handle all stored offline survey */
class OfflineSurveyList extends Component {

    constructor(props) {
        super(props)
        //const { params } = this.props.navigation.state;
        const { params } = this.props.route;
        this.state = {
            offlineMissionList: [],
            isLoading: false,
            modelVisible: false,
            selectedItem: {},
            viewSuerveyArray: [],
            Language: global.language,
            // translation: Platform.OS == 'ios' ? Constants.profile : [],   //TODO remove comment 
            translation: Constants.profile,
        }
    }

    /** Component lifecycle methods */
    async componentDidMount() {
        StatusBar.setHidden(false);

        this.setState({ isLoading: true })
        //let enableOfflineBackup = this.props.navigation.getParam('enableOfflineBackup', false);
        let expData = await AsyncStorage.getItem('offlineExport');
        let expSurveyData = JSON.parse(expData)
        // if (!enableOfflineBackup) {
        //     expSurveyData = expSurveyData && expSurveyData.filter(function (obj) {
        //         return obj.isSynced == false;
        //     });
        // }
        this.setState({ offlineMissionList: expSurveyData, isLoading: false })
    }

    /**
     * render header view layout
     */
    headerView = () => {
        return (
            <View style={[styles.topHeaderView]}>
                <View style={styles.titleView}>
                    <Text style={styles.headerText}
                        numberOfLines={1}>{this.state.translation[this.state.Language].Offline_Mission}</Text>
                </View>
                <TouchableOpacity style={styles.backView} onPress={() => this.props.navigation.goBack(null)}>

                    <Image source={backArrow}
                        style={styles.backArrow} />

                </TouchableOpacity>
            </View>
        )
    }

    /** Class render method */
    render() {
        const { translation, Language } = this.state;
        return (
            <SafeAreaView style={styles.safeArea}
                edges={['right', 'top', 'left']}
                forceInset={{
                    bottom: 'never',
                    // top: Platform.OS === 'ios' ? height === 812 ? 10 : 0 : 0
                }}>
                <StatusBar barStyle="light-content" />
                <View style={styles.container}>
                    {this.headerView()}

                    <FlatList
                        contentContainerStyle={{ flexGrow: 1 }}
                        style={styles.container}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        vertical
                        data={this.state.offlineMissionList}
                        ItemSeparatorComponent={() => { return (<View style={styles.seperator}></View>) }}
                        ListFooterComponent={() => {
                            return (this.state.offlineMissionList && this.state.offlineMissionList.length > 0 ?
                                <><View style={styles.seperator}></View>
                                    <View style={{ height: 20 }}></View></>
                                : null
                            )
                        }}
                        ListHeaderComponent={() => {
                            return (
                                this.state.offlineMissionList && this.state.offlineMissionList.length > 0 ?
                                    <View style={styles.listheaderView}>
                                        <Text style={{ fontFamily: Font.fontRobotoMedium }}>{translation[Language].Delete_All_Mission}</Text>
                                        <TouchableHighlight
                                            style={[styles.saveContainer, { backgroundColor: Color.colorDarkRed, left: 10 }]}
                                            onPress={() => {
                                                this.deleteAllOfflineSurvey()
                                            }}
                                        >
                                            <Text style={styles.skipText}>{translation[Language].DeleteAll_Text}</Text>
                                        </TouchableHighlight>
                                    </View> : null
                            )
                        }}
                        renderItem={
                            ({ item, index }) => {
                                return (
                                    <>
                                        <View style={styles.listItemView}>
                                            <View style={styles.listNameView}>
                                                <Text style={styles.lableText}>{translation[Language].Mission + ':  '}<Text style={styles.missionText}>{item.mission_name}</Text></Text>
                                                <Text style={[styles.lableText, { marginTop: 5 }]}>{translation[Language].Sync_Status + ':  '}<Text style={[styles.statusText, { marginTop: 5 }]}>{item.isSynced == true ? translation[Language].Synced : translation[Language].Not_Synced}</Text></Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginHorizontal: 5, alignItems: 'center' }}>
                                            <TouchableHighlight
                                                underlayColor={'transparent'}
                                                onPress={() => {
                                                    this.viewOfflineSurvey(item, index)
                                                }}>
                                                <Text style={[styles.buttonTextStyle, { color: Color.colorLiteBlue }]}>{translation[Language].View_Survey}</Text>
                                            </TouchableHighlight>
                                            <View style={{ backgroundColor: Color.colorGrey, height: 15, width: 1 }}></View>
                                            <TouchableHighlight
                                                underlayColor={'transparent'}
                                                onPress={() => {
                                                    this.exportOfflineSurvey(item, index)
                                                }}>
                                                <Text style={[styles.buttonTextStyle, { color: Color.colorLiteBlue }]}>{translation[Language].Export}</Text>
                                            </TouchableHighlight>
                                            <View style={{ backgroundColor: Color.colorGrey, height: 15, width: 1 }}></View>
                                            <TouchableHighlight
                                                underlayColor={'transparent'}
                                                onPress={() => {
                                                    this.deleteOfflineSurvey(item, index)
                                                }}>
                                                <Text style={[styles.buttonTextStyle, { color: Color.colorDarkRed }]}>{translation[Language].Delete}</Text>
                                            </TouchableHighlight>
                                        </View>
                                    </>
                                )
                            }
                        }
                        ListEmptyComponent={() => {
                            return (
                                <View style={styles.emptyListView}>
                                    {this.state.isLoading != true ? <Text style={styles.emptyListViewMessage}>{translation[Language].No_Offline_Mission}</Text> : null}
                                </View>
                            )
                        }}
                    />
                    {this.state.isLoading && (
                        <ActivityIndicator style={{
                            position: 'absolute',
                            alignSelf: 'center',
                            top: height / 2,
                            zIndex: 9
                        }}
                            size="large"
                            color={Color.colorDarkBlue} />
                    )}

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={this.state.modelVisible}
                        onRequestClose={() => {
                            console.log('Modal has been closed.')
                        }}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <View style={{ width: '100%', flexDirection: 'row', marginHorizontal: 20, paddingBottom: 15 }}>
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <Text style={styles.modalTitle}>{this.state.selectedItem.mission_name}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => this.setModalVisible(false)}>
                                        <Image source={closeIcon} style={{ borderColor: Color.colorBlack, borderWidth: 1, borderRadius: width / 2 }}></Image>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ height: 1, width: width, backgroundColor: Color.colorGrey }}></View>

                                <View style={{ flex: 1, width: width - 80 }}>
                                    <FlatList
                                        contentContainerStyle={{ flexGrow: 1 }}
                                        bounces={false}
                                        style={{ flex: 1, width: width - 80, backgroundColor: Color.colorWhite }}
                                        showsVerticalScrollIndicator={false}
                                        keyExtractor={(item, index) => index.toString()}
                                        vertical
                                        data={this.state.viewSuerveyArray}
                                        renderItem={
                                            ({ item, index }) => {
                                                return (
                                                    <View style={styles.modelListitemView}>
                                                        <Text style={styles.modalTitle}>{translation[Language].Que + ':   '}<Text style={styles.modalText}>{item.properties.question}</Text></Text>
                                                        {
                                                            item && this.layoutAnswer(
                                                                item,
                                                                index
                                                            )
                                                        }
                                                    </View>
                                                )
                                            }
                                        }
                                        ListEmptyComponent={() => {
                                            return (
                                                <View style={styles.emptyListView}>
                                                    <Text style={styles.emptyListViewMessage}>{translation[Language].Empty_Answer_Msg}</Text>
                                                </View>
                                            )
                                        }}
                                    />
                                </View>

                                <View style={styles.modelButtonView}>
                                    {/* <View style={{ width: 10 }}></View> */}
                                    <TouchableHighlight
                                        style={[styles.exportButton, { backgroundColor: Color.colorDarkBlue }]}
                                        onPress={() => {
                                            this.exportOfflineSurvey(this.state.selectedItem)
                                        }}
                                    >
                                        <Text style={styles.skipText}>{translation[Language].Export}</Text>
                                    </TouchableHighlight>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </SafeAreaView >

        );
    }

    /** Handling all layout of answer for view survey popup
     *  Based on the type all answer appearance managed
     *  @param item - element item to identify type and all data 
     */
    layoutAnswer = (item, index) => {
        const { translation, Language } = this.state;
        if (item.questionType == 'info')
            return (
                <Text style={styles.answerTextstyle}>{item.properties.info_text ? translation[Language].Info_Text + ': ' + (item.properties.info_text && item.properties.info_text.replace(/(<([^>]+)>)/ig, '')) : this.defaultAnswer()}</Text>
            )
        else if (item.answer !== null && item.answer !== "" && item.hasOwnProperty("answer")) {
            if (item.questionType == 'input') {
                return (
                    <Text style={styles.answerTextstyle}>{item.answer.text ? translation[Language].Ans + ': ' + item.answer.text : this.defaultAnswer()}</Text>
                )
            }
            else if (item.questionType == 'gps') {
                return (
                    <Text style={styles.answerTextstyle}>{item.answer.address ? translation[Language].Address + ': ' + item.answer.address : this.defaultAnswer()}</Text>
                )
            }
            else if (item.questionType == 'capture') {
                if (item.answer.image) {
                    return (
                        <Image
                            style={styles.imageStyle}
                            source={{ uri: item.answer.image }}
                            defaultSource={require('../../images/profile/gallery.png')}
                            resizeMode={'contain'}
                        />
                    )
                }
                else {
                    this.defaultAnswer()
                }
            }
            else if (item.questionType == 'upload') {
                if (item.properties.media_type == 'image') {
                    if (item.answer.media) {
                        return (
                            <Image
                                style={styles.imageStyle}
                                source={{ uri: item.answer.media }}
                                defaultSource={require('../../images/profile/gallery.png')}
                                resizeMode={'contain'}
                            />
                        )
                    }
                    else {
                        return (
                            this.defaultAnswer()
                        )
                    }
                }
                else if (item.properties.media_type == 'video') {
                    return (
                        <Text style={styles.answerTextstyle}>{translation[Language].Ans + ': ' + translation[Language].Video_Presented}</Text>
                    )
                }
                else if (item.properties.media_type == 'audio') {
                    return (
                        <Text style={styles.answerTextstyle}>{translation[Language].Ans + ': ' + translation[Language].Audio_Presented}</Text>
                    )
                }
                else {
                    return (
                        this.defaultAnswer()
                    )
                }
            }
            else if (item.questionType == 'barcode') {
                let barcodeId = item.answer.barcode_id != null && item.answer.barcode_id != 'null' && item.answer.barcode_id != undefined ? item.answer.barcode_id : '--'
                return (
                    <>
                        <Text style={styles.answerTextstyle}>{translation[Language].Barcode_Value + ': ' + barcodeId}</Text >
                        {item.answer.image ? <Image
                            style={styles.imageStyle}
                            source={{ uri: item.answer.image }}
                            defaultSource={require('../../images/profile/gallery.png')}
                            resizeMode={'contain'}
                        /> : null}
                    </>
                )
            }
            else if (item.questionType == 'choice') {
                if (item.questionType == 'choice' && item.properties.display_type === "dropdown") {
                    return (
                        <Text style={styles.answerTextstyle}>{translation[Language].Ans + ': ' + item.answer.label_text}</Text>
                    )
                }
                else {
                    if (item.questionType == 'choice') {
                        if (item.properties.multilevel == 1) {
                            return item.answer.selected_option && item.answer.selected_option.map((obj, index) => {
                                return (
                                    <View key={index}>
                                        <Text style={styles.answerTextstyle}>{translation[Language].Option + ': ' + obj.label}</Text>
                                        <Text style={[styles.answerTextstyle, { marginLeft: 10 }]}>{translation[Language].Sub_Option + ': ' + obj.sublabel}</Text>
                                    </View>
                                );
                            })
                        }
                        else if (item.properties.multilevel == 0 && item.properties.choice_type != 'single') {
                            return item.answer.selected_option && item.answer.selected_option.map((obj, index) => {
                                return (
                                    <Text style={styles.answerTextstyle} key={index}>{translation[Language].Option + ': ' + obj.label}</Text>
                                );
                            })
                        }
                        else {
                            return (
                                <Text style={styles.answerTextstyle}>{translation[Language].Ans + ': ' + item.answer.label}</Text>
                            )
                        }
                    }
                }
            }
            else if (item.questionType == 'scale') {
                if (item.answer.scale_type == 'scale') {
                    return (
                        <View style={{ flexDirection: 'row' }}>
                            {item.answer.selected_option && item.answer.selected_option.map((obj, index) => {
                                return (
                                    obj.image_id ? <Image
                                        style={{
                                            width: 40,
                                            height: 40,
                                            resizeMode: "contain"
                                        }}
                                        source={{ uri: obj.image_id }}
                                    /> : <View style={{
                                        width: 20,
                                        height: 20,
                                        margin: 10,
                                        alignSelf: 'center',
                                        backgroundColor: Color.colorYellow,
                                        opacity: 1
                                    }}>
                                    </View>
                                )
                            })}
                        </View>
                    )
                }
                else if (item.answer.scale_type == 'table') {
                    if (item.properties.grid_type === "radio") {
                        let optionValue = ''
                        item.answer.selected_option && item.answer.selected_option.map((obj, index) => {
                            optionValue = optionValue + ' ' + (obj.option + ':' + obj.value)
                        })
                        return (
                            < View style={{ flexDirection: 'row' }}>
                                <Text style={styles.answerTextstyle}>{optionValue ? translation[Language].Option + ': ' + optionValue : this.defaultAnswer()}</Text>
                            </View>
                        )
                    }
                    else {
                        return (
                            <View style={{ flexDirection: 'row' }}>
                                {item.answer.selected_option && item.answer.selected_option.map((obj, index) => {
                                    return (
                                        obj.image.image_id ? <Image
                                            style={{
                                                marginLeft: 5,
                                                width: 40,
                                                height: 40,
                                                resizeMode: "contain"
                                            }}
                                            source={{ uri: obj.image.image_id }}
                                        /> : <View style={{
                                            width: 20,
                                            height: 20,
                                            margin: 10,
                                            alignSelf: 'center',
                                            backgroundColor: Color.colorYellow,
                                            opacity: 1
                                        }}>
                                        </View>
                                    )
                                })}
                            </View>
                        )
                    }
                }
                else if (item.answer.scale_type == 'maxdiff') {
                    let selectedmaxDiffOpt = ''
                    item.answer.selected_option && item.answer.selected_option.map((obj, index) => {
                        if (selectedmaxDiffOpt) {
                            selectedmaxDiffOpt = selectedmaxDiffOpt + ",  " + (obj.isLeastCheck && obj.isLeastCheck == true ? "L:" : "M:") + obj.label
                        }
                        else {
                            selectedmaxDiffOpt = (obj.isLeastCheck && obj.isLeastCheck == true ? "L:" : "M:") + obj.label
                        }
                    })
                    return (
                        < View style={{ flexDirection: 'row' }}>
                            <Text style={styles.answerTextstyle}>{selectedmaxDiffOpt}</Text>
                        </View>
                    )
                }
            }
            else {
                return (
                    this.defaultAnswer()
                )
            }
        }
        else {
            return (
                this.defaultAnswer()
            )
        }
    }

    /** Handling the default answer in case of any answer not found and not given 
     *  then display default answer in view survey popup
     */
    defaultAnswer = () => {
        return (
            <Text style={styles.answerTextstyle}>{this.state.translation[this.state.Language].Ans + ': ' + this.state.translation[this.state.Language].Not_Answered}</Text>
        )
    }

    /** model visible setting */
    setModalVisible = (visible) => {
        this.setState({ modelVisible: visible });
    }

    /** View Offline survey for the selected offline survey list
     *  @param item - selected offline survey
     */
    viewOfflineSurvey = (item, index) => {
        let arrayWithAnswer = []  //array with only answer given
        item.surveyData && item.surveyData.map((obj) => {
            if (obj.questionType == 'info' && obj.properties.info_text) {
                arrayWithAnswer.push(obj)
            }
            else if (obj.answer !== null && obj.answer !== "" && obj.hasOwnProperty("answer")) {
                arrayWithAnswer.push(obj)
            }
        })

        this.setState({
            selectedItem: item,
            viewSuerveyArray: arrayWithAnswer
        }, () => {
            this.setModalVisible(true);
        });

    }

    /** Export Offline survey - Exported data will store on device with the media  
     *  @param item selected item to export
    */
    exportOfflineSurvey = async (item, index) => {
        if (this.state.isLoading == false) {
            let timestamp = new Date().getTime()

            if (Platform.OS == 'ios') {
                this.setState({ isLoading: true })
                let path = RNFS.DocumentDirectoryPath + '/' + item.mission_name + '_' + timestamp + '/' + 'media';
                RNFS.mkdir(path).catch((error) => { console.log(error) })
                let folder = item.mission_name + '_' + timestamp
                let meadiaFolder = item.mission_name + '_' + timestamp + '/' + 'media'
                let path_name = RNFS.DocumentDirectoryPath + '/' + folder + '/' + item.mission_name + '_' + timestamp + ".txt";
                RNFS.writeFile(path_name, JSON.stringify(item), 'utf8')
                    .then(async (success) => {
                        item && item.surveyData.map((obj, index) => {
                            if (obj.answer != null && obj.answer !== "") {
                                if (obj.questionType == "upload") {
                                    this.exportMediaFile(obj.answer.media, meadiaFolder, obj.questionType, obj.answer.media_format, timestamp + index)
                                }
                                else if (obj.questionType == "capture") {
                                    this.exportMediaFile(obj.answer.image, meadiaFolder, obj.questionType, 'jpg', timestamp + index)
                                }
                                else if (obj.questionType == "barcode") {
                                    this.exportMediaFile(obj.answer.image, meadiaFolder, obj.questionType, 'jpg', timestamp + index)
                                }
                            }
                        })
                        this.setState({ isLoading: false })
                        Constants.showSnack(this.state.translation[this.state.Language].Submission_Exported)
                    })
                    .catch((err) => {
                        this.setState({ isLoading: false })
                        console.log('Error in write file', err.message);
                    });
            }
            else {
                try {
                    // const granted = await PermissionsAndroid.request(
                    //     PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    // );
                    // if (granted === PermissionsAndroid.RESULTS.GRANTED) {

                    if (Platform.OS === "android" && Platform.Version >= 23 && Platform.Version < 33) {
                        try {
                            const granted = await PermissionsAndroid.request(
                                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                                {
                                    title: this.state.translation[this.state.Language].Permission_Title,
                                    message: this.state.translation[this.state.Language].External_Storage_Permission
                                }
                            );
                            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                            } else {
                                this.askPermissionAlert(this.state.translation[this.state.Language].External_Storage_Permission)
                                return;
                            }
                        } catch (err) {
                            //console.warn(err);
                            return;
                        }
                    }

                    this.setState({ isLoading: true })
                    let path = RNFS.DownloadDirectoryPath + '/' + item.mission_name + '_' + timestamp + '/' + 'media';
                    RNFS.mkdir(path).then((result) => {
                        console.log('result', result)
                    }).catch((error) => { console.log(error) })

                    let folder = item.mission_name + '_' + timestamp
                    let meadiaFolder = item.mission_name + '_' + timestamp + '/' + 'media'
                    let path_name = RNFS.DownloadDirectoryPath + '/' + folder + '/' + item.mission_name + '_' + timestamp + ".txt";
                    RNFS.writeFile(path_name, JSON.stringify(item), 'utf8')
                        .then(async (success) => {
                            item && item.surveyData.map((obj, index) => {
                                if (obj.answer != null && obj.answer !== "") {
                                    if (obj.questionType == "upload") {
                                        this.exportMediaFile(obj.answer.media, meadiaFolder, obj.questionType, obj.answer.media_format, timestamp + index)
                                    }
                                    else if (obj.questionType == "capture") {
                                        this.exportMediaFile(obj.answer.image, meadiaFolder, obj.questionType, 'jpg', timestamp + index)
                                    }
                                    else if (obj.questionType == "barcode") {
                                        this.exportMediaFile(obj.answer.image, meadiaFolder, obj.questionType, 'jpg', timestamp + index)
                                    }
                                }
                            })
                            this.setState({ isLoading: false })
                            Constants.showSnack(this.state.translation[this.state.Language].Submission_Exported)
                        })
                        .catch((err) => {
                            this.setState({ isLoading: false })
                            console.log('Error in write file', err.message);
                        });
                    // } else {
                    //     console.log("external storage permission denied");
                    // }
                } catch (err) {
                    console.log(err);
                }
            }

        }

        // const generateHTML = value =>
        //     `<div>
        //     <span>Hi ${value},
        //     </span>
        //     </div>`;
        // const html = generateHTML(this.state.offlineMissionList);
        // let options = {
        //     html: `<h1>PDF TEST
        //     <img src="https://devapi.flexicollect.com/images/single_op__1595586679_12EC1A.png" alt="Flowers in Chania" width="460" height="345">
        //     <video width="320" height="240" controls>
        //     <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
        //         Your browser does not support the video tag.
        //   </video>
        //     </h1>`,
        //     fileName: 'test',
        //     directory: 'Documents',
        // };
        // RNHTMLtoPDF.convert(options).then(path => {
        //     // alert(JSON.stringify(path.filePath));
        //     // alert(JSON.stringify(path));
        //     const { navigate } = this.props.navigation;
        //     navigate('PDFOpen', { pdfLink: path.filePath, base64PDF: path.base64 });
        // })
        //alert(file.filePath);

        //}
    }

    /** Export the offline survey meadia file and move it to exported folder 
     *  @param mediaUrl - url to export 
     *  @param folder - path of the folder where meadia file exported
     *  @param mediaformate - type of the extention for the media 
     *  @param timestamp - time stamp to give the uniqe name to media
    */
    exportMediaFile = (mediaUrl, folder, mediatype, mediaformate, timestamp) => {
        /** Exported media copy where exported survey file exist */
        let pathToFile = Platform.OS == 'ios' ? `${RNFS.DocumentDirectoryPath}/${folder}/${mediatype + '_' + timestamp + '.'}${mediaformate}` : `${RNFS.DownloadDirectoryPath}/${folder}/${mediatype + '_' + timestamp + '.'}${mediaformate}`
        RNFS.copyFile(mediaUrl, pathToFile)
            .then((result) => {
                console.log('Copy file result', result)
            })
            .catch((error) => {
                console.log('Copy file error', error)
            });

        /** Working code for download file in ios not work in android */
        // let pathToFile = Platform.OS == 'ios' ? `${RNFS.DocumentDirectoryPath}/${folder}/${mediatype + '_' + timestamp + '.'}${mediaformate}`
        // console.log('pathToFile', pathToFile)
        // RNFS.downloadFile({
        //     fromUrl: mediaUrl,
        //     toFile: pathToFile,
        // }).promise.then((r) => {
        //     console.log('Res', r)
        //     this.setState({ isLoading: false })
        //     return r
        // }).catch((e) => {
        //     console.log('e', e)
        //     this.setState({ isLoading: false })
        // });
    }

    /** Handle Delete stored survey once synced with the server 
     *  @param item - selected item to delete survey
    */
    deleteOfflineSurvey = (item, index) => {
        if (this.state.isLoading == false) {
            if (item.isSynced == true) {
                Alert.alert(
                    String.applicationName,
                    this.state.translation[this.state.Language].Delete_Mission_Confirmation,
                    [
                        {
                            text: 'OK', onPress: () => {
                                let arrOfflineMission = this.state.offlineMissionList
                                arrOfflineMission = arrOfflineMission.filter(function (obj) {
                                    return obj.sub_key != item.sub_key;
                                });

                                this.setState({
                                    offlineMissionList: arrOfflineMission
                                }, () => {
                                    this.deleteItem(item)
                                    Constants.saveKey('offlineExport', JSON.stringify(arrOfflineMission))
                                });
                            }
                        },
                        { text: "Cancel", onPress: () => { }, style: "cancel" }
                    ],
                    { cancelable: false },
                );
            }
            else {
                //'You have offline missions submissions stored. Please check with your PM that all of these submissions have been received',
                Alert.alert(
                    String.applicationName,
                    this.state.translation[this.state.Language].Delete_Mission_Msg,
                    [
                        {
                            text: 'OK', onPress: () => { }
                        },
                    ],
                    { cancelable: false },
                );
            }
        }
    }

    /** Handle Delete All synced offline survey from list 
    */
    deleteAllOfflineSurvey = () => {
        if (this.state.isLoading == false) {
            //'Are you sure you want to delete All offline mission? Please check with your PM that all of these submissions have been received',
            Alert.alert(
                String.applicationName,
                this.state.translation[this.state.Language].DeleteAll_Mission_Confirmation,
                [
                    {
                        text: 'OK', onPress: () => {
                            let arrOfflineMission = []
                            this.state.offlineMissionList && this.state.offlineMissionList.map((object, index) => {
                                if (object.isSynced == true) {
                                    /** delete media file for already synced */
                                    this.deleteItem(object)
                                }
                                else {
                                    arrOfflineMission.push(object)
                                }
                            })
                            this.setState({ offlineMissionList: arrOfflineMission })
                            Constants.saveKey('offlineExport', JSON.stringify(arrOfflineMission))
                        }
                    },
                    { text: "Cancel", onPress: () => { }, style: "cancel" }
                ],
                { cancelable: false },
            );
        }
    }

    /**
    * if mission deleted, clear locally saved files
    */
    async deleteItem(fileList) {
        let delList = [];
        for (var j = 0; j < fileList.surveyData.length; j++) {
            let dquestionObj = fileList.surveyData[j];
            if (dquestionObj.questionType === "upload" && (dquestionObj.answer && dquestionObj.answer['media'] && dquestionObj.answer['media'] != '')) {
                delList.push(dquestionObj.answer['media']);
            }
            else if (dquestionObj.questionType === "capture" && dquestionObj.answer && dquestionObj.answer['image'] && dquestionObj.answer['image'] != '') {
                delList.push(dquestionObj.answer['image']);
            }
            else if (dquestionObj.questionType === "barcode" && dquestionObj.answer && dquestionObj.answer['image'] && dquestionObj.answer['image'] != '') {
                delList.push(dquestionObj.answer['image']);
            }
        }

        try {
            for (let i = 0; i < delList.length; i++) {
                RNFS.unlink(delList[i])
                    .then(() => {
                        //console.log('File deleted ' + fileList[i]);   
                    })
                    .catch((err) => {
                        //console.log('Error in File delete ' + fileList[i]);   
                        // console.log(err)
                    });
            }
            //console.log('delete item done...');
        } catch (error) {
            //console.log(error.message);
        }
    }
}
export default OfflineSurveyList;

/** UI styles used for this class */
const styles = ScaledSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Color.colorDarkBlue
    },
    container: {
        flex: 1,
        backgroundColor: Color.colorWhite
    },
    backArrow: {
        width: 18,
        height: 16,
        marginLeft: '10@ms',
        alignSelf: 'center',
    },
    topHeaderView: {
        width: '100%',
        flexDirection: 'row',
        backgroundColor: Color.colorDarkBlue,
        alignItems: Platform.OS === 'ios' ? 'flex-end' : 'center',
        justifyContent: 'flex-start',
        height: Platform.OS === 'ios' ? 56 : 70 - 14,
        // marginTop: Platform.OS === 'ios' ? 0 : 25,
    },
    backView: {
        height: '100%',
        flexDirection: 'row',
        flex: 0.5,
    },
    titleView: {
        top: Platform.OS === 'ios' ? 0 : 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
    },
    headerText: {
        width: '100%',
        color: Color.colorWhite,
        fontSize: Dimension.extraLargeText + '@ms0.3',
        fontWeight: '500',
        textAlign: 'center',
        alignSelf: 'center',
        paddingLeft: '80@ms',
        paddingRight: '80@ms',
    },
    rightView: {
        height: '100%',
        flexDirection: 'row',
        flex: 0.2
    },
    seperator: {
        height: 0.5,
        backgroundColor: Color.colorLitGrey
    },
    listheaderView: {
        height: 80,
        padding: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderBottomColor: Color.colorLitGrey
    },
    listItemView: {
        width: width,
        padding: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    listNameView: {
        flex: 1,
        flexDirection: 'column',
        marginHorizontal: 5
    },
    saveContainer: {
        borderRadius: 20,
        borderColor: Color.colorWhiteBg,
        borderWidth: 1,
        width: 80,
        height: 40
    },
    buttonTextStyle: {
        padding: 10,
        fontSize: Dimension.normalText,
        fontFamily: Font.fontRobotoMedium,
        textDecorationLine: 'underline',
    },
    skipText: {
        fontSize: Dimension.normalText,
        fontFamily: Font.fontRobotoMedium,
        fontWeight: 'bold',
        color: Color.colorWhite,
        alignSelf: 'center',
        paddingTop: 10,
        paddingBottom: 10
    },
    lableText: {
        fontSize: Dimension.normalText,
        fontFamily: Font.fontRobotoLight,
        color: Color.colorGrey
    },
    answerTextstyle: {
        fontSize: Dimension.normalText,
        fontFamily: Font.fontRobotoLight,
        color: Color.colorGrey
    },
    missionText: {
        fontSize: Dimension.normalText,
        fontFamily: Font.fontRobotoMedium,
        color: Color.colorBlack
    },
    statusText: {
        fontSize: Dimension.normalText,
        fontFamily: Font.fontRobotoMedium,
        color: Color.colorOrange
    },
    emptyListView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyListViewMessage: {
        color: Color.colorGrey,
        fontSize: 14,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalView: {
        padding: 15,
        flex: 1,
        maxHeight: height - 80,
        minWidth: width - 40,
        maxWidth: width - 40,
        backgroundColor: Color.colorWhite,
        borderRadius: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    modelListitemView: {
        flex: 1,
        paddingVertical: 10
    },
    modelButtonView: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    modalTitle: {
        flex: 1,
        color: Color.colorBlack,
        fontSize: Dimension.mediumText,
        fontFamily: Font.fontRobotoBold,
    },
    modalText: {
        flex: 1,
        color: Color.colorBlack,
        fontSize: Dimension.normalText,
        fontFamily: Font.fontRobotoMedium,
    },
    exportButton: {
        borderRadius: 20,
        borderColor: Color.colorWhiteBg,
        borderWidth: 1,
        width: width - 80,
        height: 40
    },
    imageStyle: {
        marginTop: 10,
        height: width / 2,
        width: width - 100,
        borderRadius: 5
    }
});