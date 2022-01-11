import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {default as Ionicon} from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-community/async-storage';
import {default as MaterialCommunityIcon} from 'react-native-vector-icons/MaterialCommunityIcons';

import {AppColors, AppFonts, AppStyles} from '../../../assets/styles';
import {logout, setUserData} from '../../../redux/reducers/auth';
import {consts} from '../../../assets/values';
import {sagaLogout} from '../../../redux/sagas/auth';
import {bindActionCreators} from 'redux';
import TouchableDebounce from '../common/TouchableDebounce';

class DrawerContainer extends React.Component {
  onLogout = () => {
    const logout = () => {
      this.props.logout({
        onSuccess: () => {
          this.props.navigation.navigate('LoginStack');
        },
      });
    };
    if (!this.props.network.isConnected) {
      Alert.alert(
        'LOG OUT',
        "You are now offline and you won't be able to log in until your mobile is online once you log out.\nAre you sure to log out anyway?",
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => {
              logout();
            },
          },
        ],
        {cancelable: false},
      );
    } else {
      logout();
    }
  };

  render() {
    const {navigation, route} = this.props;
    const {stops} = route;
    const finishDisabled =
      route.status === consts.ROUTE_STATUS.CREATED ||
      route.status === consts.ROUTE_STATUS.FINISHED ||
      route.currentStopId !== null ||
      stops.filter((stop) => stop.type === consts.STOP_TYPES.CUSTOMER)
        .length !==
        stops.filter(
          (stop) =>
            stop.status === consts.STOP_STATUS.FINISHED &&
            stop.type === consts.STOP_TYPES.CUSTOMER,
        ).length;

    return (
      <View style={styles.content}>
        <View style={styles.container}>
          <View
            style={{
              backgroundColor: AppColors.primary,
              width: '100%',
              height: Platform.OS === 'ios' ? 130 : 100,
            }}>
            <View style={{marginTop: Platform.OS === 'ios' ? 30 : 0}}>
              <TouchableDebounce
                activeOpacity={0.4}
                style={{opacity: 0.6, alignSelf: 'flex-end'}}
                onPress={() => this.props.navigation.closeDrawer()}>
                <Ionicon name="close" color={AppColors.white} size={32} />
              </TouchableDebounce>
            </View>
            <View style={{flex: 1, paddingTop: 10, marginLeft: 20}}>
              <Text
                style={{
                  fontFamily: AppFonts.main.bold,
                  fontSize: 15,
                  color: AppColors.white,
                }}>
                {this.props.user
                  ? `${this.props.user.first_name} ${this.props.user.last_name}`
                  : '---'}
              </Text>
              <View style={{flex: 1, flexDirection: 'row', marginTop: 5}}>
                <FontAwesome
                  name="mobile-phone"
                  color={AppColors.white}
                  size={20}
                />
                <Text
                  style={{
                    fontFamily: AppFonts.main.semibold,
                    fontSize: 13,
                    color: AppColors.white,
                    paddingLeft: 10,
                  }}>
                  {this.props.user ? this.props.user.phone_number : '---'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.menuContainer}>
            <TouchableDebounce
              activeOpacity={0.6}
              style={{marginBottom: 10}}
              onPress={() => {
                this.props.navigation.navigate('ItineraryHome');
              }}>
              <View style={styles.menuItem}>
                <MaterialCommunityIcon
                  name="truck-delivery-outline"
                  color={AppColors.grey}
                  size={20}
                  style={{width: 40}}
                />
                <Text style={styles.menuItemText}>Itinerary</Text>
              </View>
            </TouchableDebounce>
            <TouchableDebounce
              activeOpacity={0.6}
              style={{
                marginBottom: 10,
                opacity: finishDisabled ? 0.4 : 1,
              }}
              disabled={finishDisabled}
              onPress={() => {
                if (!this.props.network.isConnected) {
                  Alert.alert(
                    'You are offline',
                    'Please connect to Internet and try again to finish. We are a bit behind with what you have been doing today.',
                  );
                  return;
                }
                this.props.navigation.navigate('FinishWorkLocation');
              }}>
              <View style={styles.menuItem}>
                <Ionicon
                  name="checkmark-done-sharp"
                  color={AppColors.grey}
                  size={20}
                  style={{width: 40}}
                />
                <Text style={styles.menuItemText}>Finish Work</Text>
              </View>
            </TouchableDebounce>
            <TouchableDebounce
              activeOpacity={0.6}
              style={{marginBottom: 10}}
              onPress={() => {
                this.props.navigation.navigate('PickupOrders');
              }}>
              <View style={styles.menuItem}>
                <MaterialCommunityIcon
                  name="text-box-check-outline"
                  color={AppColors.grey}
                  size={20}
                  style={{width: 40}}
                />
                <Text style={styles.menuItemText}>Pickup Orders</Text>
              </View>
            </TouchableDebounce>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.footerItem}>
            <TouchableDebounce
              style={AppStyles.dangerButtonContainer}
              activeOpacity={0.6}
              onPress={() => this.onLogout()}>
              <Text style={AppStyles.dangerButtonText}>SIGN OUT</Text>
            </TouchableDebounce>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
  token: state.auth.token,
  route: state.route,
  network: state.network,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      logout: sagaLogout,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(DrawerContainer);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    alignItems: 'flex-start',
  },
  menuContainer: {
    paddingTop: 50,
    paddingLeft: 30,
    paddingRight: 20,
    width: '100%',
  },
  menuItem: {
    height: 40,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomColor: AppColors.grey3,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 14,
    color: AppColors.textLight,
    fontFamily: AppFonts.main.medium,
  },
  footerContainer: {
    height: 50,
    width: '100%',
    bottom: 20,
    position: 'absolute',
  },
  footerItem: {
    marginHorizontal: 40,
  },
});
