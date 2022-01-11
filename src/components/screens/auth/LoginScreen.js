import React from 'react';
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  Platform,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import { AppFonts, AppColors, AppStyles } from '../../../assets/styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { bindActionCreators } from 'redux';
import { sagaLogin, sagaGetAuthUser } from '../../../redux/sagas/auth';
import Waiting from '../../widgets/Waiting';
import TouchableDebounce from '../common/TouchableDebounce';
import appVersion from '../../../redux/store/helpers/AppVersion';
import { SafeAreaView } from 'react-native-safe-area-context';

class LoginScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',

      submitting: false,

      errors: {},
    };

    this.onSignin = this.onSignin.bind(this);
  }

  componentDidMount() {
    if (!this.props.network.isConnected)
      Alert.alert(
        'LOG IN',
        "Your device is now offline and you won't be able to log in until your mobile is online.",
      );
  }

  onSignin = () => {
    // this.setState({ submitting: true });
    const { email, password } = this.state;
    this.props.login(email, password, {
      onSuccess: () => {
        this.props.navigation.navigate('LoadScreen');
      },
      onFailure: (err) => {
        if (err.response)
          console.log('Login Error:', err.response.data);
        else
          console.log(err);
        Alert.alert('Error', 'Login Failed. Please check your email and password carefully.');
      },
    });
  };

  onRegister = () => {
    this.props.navigation.push('Signup');
  };

  render() {
    const win = Dimensions.get('window');
    const ratio = win.width / 720;
    return (
      <View style={{ backgroundColor: AppColors.primary, flex: 1 }}>
        <SafeAreaView
          style={{
            backgroundColor: AppColors.mainBackground,
            flex: 1,
            flexDirection: 'column',
          }}>
          <Waiting
            visible={this.props.auth.calling || false}
            title={'Signing in now...'}
          />

          <KeyboardAwareScrollView
            contentContainerStyle={{
              backgroundColor: AppColors.primary,
              flexGrow: 1,
            }}>
            <View style={{ paddingRight: 10, paddingTop: 10 }}>
              <Text
                style={[
                  styles.subtitle,
                  { fontSize: 16, color: AppColors.white, textAlign: 'right' },
                ]}>
                v{appVersion}
              </Text>
            </View>
            <View
              style={{
                width: '100%',
                height: 480 * ratio,
                position: 'absolute',
                top: 50,
                zIndex: 999,
              }}>
              <Image
                source={require('../../../assets/images/fdl_van.png')}
                style={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
              />
            </View>

            <View style={{ backgroundColor: AppColors.primary, height: 220 }} />

            <View
              style={{
                width: '100%',
                backgroundColor: AppColors.mainBackground,
                flex: 1,
              }}>
              <Text style={[styles.subtitle, { marginTop: 40 }]}>Welcome to</Text>
              <Text style={styles.title}>Fast Despatch Logistics</Text>

              <View style={styles.signinBox}>
                <View style={styles.formContainer}>
                  <View style={styles.action}>
                    <Icon
                      name="ios-mail-outline"
                      color={AppColors.primary}
                      size={20}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={this.state.email}
                      autoCapitalize="none"
                      onChangeText={(val) => this.setState({ email: val })}
                      placeholder="Email Address"
                      keyboardType="email-address"
                      placeholderTextColor={AppColors.grey2}
                    />
                  </View>
                  <View style={[styles.action, { marginBottom: 30 }]}>
                    <Icon
                      name="ios-lock-closed-outline"
                      color={AppColors.primary}
                      size={20}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={this.state.password}
                      autoCapitalize="none"
                      onChangeText={(val) => this.setState({ password: val })}
                      secureTextEntry={true}
                      placeholder="Password"
                      placeholderTextColor={AppColors.grey2}
                    />
                  </View>
                  <TouchableDebounce
                    style={AppStyles.bottomButtonContainer}
                    activeOpacity={0.6}
                    onPress={() => this.onSignin()}>
                    <Text style={AppStyles.bottomButtonText}>SIGN IN</Text>
                  </TouchableDebounce>
                </View>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  network: state.network,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      login: sagaLogin,
      getAuthUser: sagaGetAuthUser,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);

const styles = StyleSheet.create({
  formContainer: {
    width: '80%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  action: {
    flexDirection: 'row',
    marginTop: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: AppColors.grey2,
    justifyContent: 'center',
    paddingBottom: Platform.OS == 'ios' ? 10 : 0,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS == 'ios' ? 0 : -12,
    paddingLeft: 15,
    color: AppColors.text,
    fontFamily: AppFonts.main.regular,
  },
  signinBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
    flex: 1,
  },
  title: {
    fontFamily: AppFonts.main.bold,
    textAlign: 'center',
    color: AppColors.text,
    fontSize: 24,
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: AppFonts.main.regular,
    textAlign: 'center',
    color: AppColors.text,
    fontSize: 20,
    marginBottom: 5,
  },
});
