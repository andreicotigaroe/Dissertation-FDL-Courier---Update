import {Platform} from 'react-native';

export const AppColors = {
  primary: '#27acb1',
  danger: '#d72318',
  success: '#5cb85c',
  warning: '#f0ad4e',
  grey: 'grey',
  grey2: '#c4c4c4',
  grey3: '#e6e6f2',
  grey4: '#dfdfdf',
  text: '#262626',
  textLight: '#666c6d',
  buttonText: 'white',
  mainBackground: '#f1f2f2',
  grayBackground: '#f2f2f2',

  headerBackground: '#262626',
  headerText: '#dfdfdf',
  white: '#fff',
  placeholder: '#aaaaaa',
};

export const AppFonts = {
  main: {
    regular: 'Montserrat-Regular',
    bold: 'Montserrat-Bold',
    semibold: 'Montserrat-SemiBold',
    medium: 'Montserrat-Medium',
  },
};

export const AppStyles = {
  primaryButtonContainer: {
    backgroundColor: AppColors.primary,
    height: 50,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonText: {
    textAlign: 'center',
    color: AppColors.white,
    fontFamily: AppFonts.main.semibold,
    fontSize: 15,
  },
  dangerButtonContainer: {
    backgroundColor: AppColors.danger,
    height: 50,
    justifyContent: 'center',
  },
  dangerButtonText: {
    textAlign: 'center',
    color: AppColors.white,
    fontFamily: AppFonts.main.semibold,
    fontSize: 15,
  },
  warningButtonContainer: {
    backgroundColor: AppColors.warning,
    height: 50,
    justifyContent: 'center',
  },
  warningButtonText: {
    textAlign: 'center',
    color: AppColors.white,
    fontFamily: AppFonts.main.semibold,
    fontSize: 15,
  },
  transparentButtonContainer: {
    height: 50,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  transparentButtonText: {
    textAlign: 'center',
    color: AppColors.text,
    fontFamily: AppFonts.main.semibold,
    fontSize: 15,
  },
  buttonDanger: {
    padding: 0,
    borderRadius: 4,
    backgroundColor: AppColors.danger,
    borderColor: AppColors.danger,
    borderWidth: 1,
    width: '100%',
  },
  buttonDangerText: {
    fontSize: 14,
    color: AppColors.white,
    fontFamily: AppFonts.main.semibold,
    textAlignVertical: 'center',
    paddingTop: Platform.OS == 'ios' ? 10 : 0,
    height: 40,
  },
  buttonOutlinePrimary: {
    borderColor: AppColors.primary,
    borderWidth: 1,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: 'transparent',
    width: '100%',
  },
  buttonOutlinePrimaryText: {
    fontSize: 14,
    color: AppColors.primary,
    fontFamily: AppFonts.main.semibold,
    height: 40,
    textAlignVertical: 'center',
    paddingTop: Platform.OS == 'ios' ? 10 : 0,
  },
  buttonOutlinePrimaryTextDisabled: {
    fontSize: 14,
    color: AppColors.grey2,
    fontFamily: AppFonts.main.semibold,
    height: 40,
    textAlignVertical: 'center',
    paddingTop: Platform.OS == 'ios' ? 10 : 0,
  },
  buttonSmallPrimary: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    borderWidth: 1,
    width: '100%',
  },
  buttonSmallPrimaryText: {
    fontSize: 10,
    color: 'white',
    height: 25,
    fontFamily: AppFonts.main.semibold,
    textAlignVertical: 'center',
    paddingTop: Platform.OS == 'ios' ? 5 : 0,
  },
  buttonSmallDanger: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: AppColors.danger,
    borderColor: AppColors.danger,
    borderWidth: 1,
    width: '100%',
  },
  buttonSmallDangerText: {
    fontSize: 10,
    color: 'white',
    height: 25,
    fontFamily: AppFonts.main.semibold,
    textAlignVertical: 'center',
    paddingTop: Platform.OS == 'ios' ? 5 : 0,
  },
  buttonTextPrimary: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  buttonTextPrimaryText: {
    fontSize: 14,
    color: AppColors.primary,
    fontFamily: AppFonts.main.semibold,
    textAlignVertical: 'center',
    paddingTop: Platform.OS == 'ios' ? 5 : 0,
  },

  mainContainer: {
    backgroundColor: AppColors.main,
    flex: 1,
  },

  // Modal Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 30,
  },

  // Form Styles
  formGroup: {
    flex: 1,
    marginBottom: 10,
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderColor: AppColors.grey2,
    paddingHorizontal: 10,
    color: AppColors.text,
    width: '100%',
    marginTop: 5,
    borderRadius: 4,
    fontFamily: AppFonts.main.regular,
    fontSize: 13,
  },
  message: {
    fontSize: 16,
    textAlign: 'justify',
    color: AppColors.primary,
    fontFamily: AppFonts.main.regular,
    lineHeight: 30,
  },
  label: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.regular,
    fontSize: 14,
  },
  textDescription: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.regular,
    fontSize: 14,
  },
  value: {
    color: AppColors.text,
    fontFamily: AppFonts.main.regular,
    fontSize: 14,
  },
  signature: {
    color: AppColors.text,
    fontFamily: AppFonts.handwriting,
    fontSize: 20,
  },
  phoneInputText: {
    borderLeftWidth: 1,
    borderColor: AppColors.grey3,
    height: 40,
    fontSize: 13,
    color: AppColors.text,
    borderBottomRightRadius: 25,
    borderTopRightRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
    paddingLeft: 10,
    fontFamily: AppFonts.main.regular,
  },
  textarea: {
    width: '100%',
    fontSize: 13,
    textAlignVertical: 'top',
    lineHeight: 20,
    fontFamily: AppFonts.main.regular,
    color: AppColors.text,
    borderWidth: 1,
    borderColor: AppColors.grey3,
    borderRadius: 4,
    paddingHorizontal: 15,
    marginTop: 5,
    marginBottom: 5,
    alignSelf: 'center',
    height: 150,
  },
  phoneInputFlag: {
    width: 35,
    height: 25,
    borderColor: AppColors.text,
    borderRadius: 5,
  },
  invalidField: {
    color: AppColors.danger,
    textAlign: 'right',
    fontSize: 14,
    width: '100%',
    alignSelf: 'center',
    fontFamily: AppFonts.main.regular,
  },

  // Card Styles
  card: {
    backgroundColor: 'white',
    marginVertical: 10,
    borderRadius: 8,

    // iOS
    shadowColor: AppColors.primary,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.05,
    shadowRadius: 6,

    // Android
    elevation: 4,
  },
  cardTitle: {
    paddingHorizontal: 15,
    paddingVertical: 7,
  },
  cardTitleText: {
    fontSize: 14,
    color: AppColors.text,
    fontFamily: AppFonts.main.semibold,
  },
  divider: {
    borderTopColor: AppColors.grey3,
    borderTopWidth: 1,
  },
  cardBody: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  itemValue: {
    fontSize: 14,
    color: AppColors.text,
    fontFamily: AppFonts.main.regular,
  },

  // Badge
  badgeInactiveContainer: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    backgroundColor: AppColors.grey,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeInactiveText: {
    fontFamily: AppFonts.main.semibold,
    color: AppColors.white,
    fontSize: 10,
  },
  badgeSuccessContainer: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    backgroundColor: AppColors.success,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeSuccessText: {
    fontFamily: AppFonts.main.semibold,
    color: AppColors.white,
    fontSize: 10,
  },
  badgePrimaryContainer: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    backgroundColor: AppColors.primary,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgePrimaryText: {
    fontFamily: AppFonts.main.semibold,
    color: AppColors.white,
    fontSize: 10,
  },
  badgeDangerContainer: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    backgroundColor: AppColors.danger,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeDangerText: {
    fontFamily: AppFonts.main.semibold,
    color: AppColors.white,
    fontSize: 10,
  },
  badgeWarningContainer: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    backgroundColor: AppColors.warning,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeWarningText: {
    fontFamily: AppFonts.main.semibold,
    color: AppColors.white,
    fontSize: 10,
  },
  // Header
  headerRightButton: {
    fontFamily: AppFonts.main.semibold,
    fontSize: 12,
    color: AppColors.primary,
  },

  // Text
  text: {
    fontSize: 14,
    color: AppColors.text,
    fontFamily: AppFonts.main.regular,
    marginBottom: 10,
    textAlign: 'left',
  },
  textsemibold: {
    fontSize: 12,
    color: AppColors.text,
    fontFamily: AppFonts.main.semibold,
    marginBottom: 10,
    textAlign: 'left',
  },
  textbold: {
    fontSize: 12,
    color: AppColors.text,
    fontFamily: AppFonts.main.bold,
    marginBottom: 10,
    textAlign: 'left',
  },

  // Bottom Container
  bottomContainer: {
    paddingVertical: 2,
    backgroundColor: AppColors.grayBackground
  },
  bottomButtonContainer: {
    backgroundColor: AppColors.primary,
    height: 50,
    justifyContent: 'center',
  },
  bottomButtonText: {
    textAlign: 'center',
    color: AppColors.white,
    fontFamily: AppFonts.main.semibold,
    fontSize: 15,
  },

  // Subheader
  subheaderContainer: {
    height: 50,
    backgroundColor: AppColors.headerBackground,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  subheaderTitle: {
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    color: AppColors.headerText,
    textAlign: 'center',
  },
  headerMenuItemContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerMenuItemText: {
    fontFamily: AppFonts.main.medium,
    color: AppColors.text,
    fontSize: 14,
  },

  headerMenuItemDangerText: {
    fontFamily: AppFonts.main.medium,
    color: AppColors.danger,
    fontSize: 14,
  },

  // Section Styles
  roundSection: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    textAlign: 'left',
    color: AppColors.grey2,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    marginBottom: 5,
  },
};

export const HeaderStyle = {
  headerStyle: {
    backgroundColor: AppColors.headerBackground,
    elevation: 0, // remove shadow on Android
    shadowOpacity: 0, // remove shadow on iOS
  },
  headerTintColor: AppColors.headerText,
  headerTitleStyle: {
    fontFamily: AppFonts.main.semibold,
    fontSize: 18,
  },
  headerBackTitleStyle: {
    fontFamily: AppFonts.main.semibold,
    fontSize: 12,
  },
  headerBackTitle: 'BACK',
  gestureEnabled: true,
};

export const pickerSelectStyle = {
  inputIOS: {
    height: 40,
    borderWidth: 1,
    borderColor: AppColors.grey2,
    paddingLeft: 10,
    color: AppColors.text,
    width: '100%',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 4,
    fontFamily: AppFonts.main.regular,
    fontSize: 13,
  },
  inputAndroid: {
    height: 40,
    borderWidth: 1,
    borderColor: AppColors.grey2,
    paddingLeft: 10,
    color: AppColors.text,
    width: '100%',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 4,
    fontFamily: AppFonts.main.regular,
    fontSize: 13,
    backgroundColor: 'white',
  },
  placeholderColor: 'white',
  underline: {borderTopWidth: 0},
  icon: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopWidth: 5,
    borderTopColor: '#00000099',
    borderRightWidth: 5,
    borderRightColor: 'transparent',
    borderLeftWidth: 5,
    borderLeftColor: 'transparent',
    width: 0,
    height: 0,
    top: 20,
    right: 15,
  },
};
