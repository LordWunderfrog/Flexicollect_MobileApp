import { Platform } from 'react-native';

/** Api calling Endpoints that is bind with base URL to pass 
 * inside Api call request
 */
export const REGISTER = 'auth/register';

export const LOGIN = 'auth/login';
export const LOGOUT = 'auth/logout';
export const CHANGEPASSWORD = 'auth/changePassword';

export const CUSTOMER = 'customer';
export const COUNTRIES = 'customer/countries';
export const STATES = 'customer/states/';
export const CITIES = 'customer/cities/';

export const MISSION = 'm_dashboard?history=';
export const MISSION_SURVEY = 'mission_survey?id=';
export const POST_ANSWER = 'survey_answers';
export const FORGOTPASSWORD = 'auth/forgotPassword';
export const POST_ANSWER_COMPLETE = 'survey_finish';
export const POST_UPLOAD_ANSWER = 'survey_answer_with_upload';
export const POST_UPLOAD_ANSWER_BASE64 = 'survey_answer_with_upload_base64';
export const NOTIFICATION = 'notification';
export const BARCODE_LOOKUP = 'barcodelookup?barcode=';
export const MISSION_DETAIL = 'mission?id=';

export const POST_FCM_TOKEN = 'fcmtoken';
export const VALIDATE_NO_RETURN = 'validate_noreturn?mission_id=';
export const OFFLINE_SUBMIT_SERVICE = 'survey_offline_submit';
export const OFFLINE_POST_SERVICE = 'survey_offline_answer';
export const SURVEY_QUESTIONS = 'mission_survey_questions';
export const CLEAR_LOOP_ANSWERS = 'clear_loop_answers?survey_tag_id=';

export const TRANSLATION_PAGE = 'translation?page=';
export const LANGUAGES = 'languages';

export const VERIFY_EMAIL = 'auth/verify?';
export const POST_UPLOAD_ANSWER_MULTIPART = 'survey_answer_with_upload_file';

export const VERSION_CHECK = Platform.OS == 'ios' ? 'ios_version' : 'android_version';

export const GET_LEADERBOARD_DATA = 'availableLeaderBoards'
export const GET_LEADER_TABLE_DATA = 'leaderboard?mission_id='
export const SEND_PEPSICO_CODE = 'codeReleaseMissions?code='