import React from 'react';
import {
  View,
  Alert,
  Text,
  Image,
  AppRegistry,
  AppState,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import {default as MaterialIcon} from 'react-native-vector-icons/MaterialIcons';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

import {AppColors, HeaderStyle, AppFonts} from '../../../assets/styles';
import ListTabScreen from './tabs/ListTabScreen';
import {consts} from '../../../assets/values';
import MapTabScreen from './tabs/MapTabScreen';
import SummaryTabScreen from './tabs/SummaryTabScreen';
import CommonTabView from '../../widgets/CommonTabView';
import TouchableDebounce from '../common/TouchableDebounce';
import AuthApi from '~/services/api/AuthApi';
import PushNotification from 'react-native-push-notification';

class ItineraryHomeScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      ...HeaderStyle,
      headerLeft: () => {
        return (
          <View style={{marginLeft: 10}}>
            <TouchableDebounce
              activeOpacity={0.4}
              onPress={() => navigation.openDrawer()}
              style={{opacity: 0.6}}>
              <Image
                source={require('../../../assets/images/logo_sm_1.png')}
                style={{width: 36, height: 36, resizeMode: 'stretch'}}
              />
            </TouchableDebounce>
          </View>
        );
      },
      title: 'ITINERARY',
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      index: 0,
      routes: [
        {key: 'list', title: 'LIST'},
        {key: 'map', title: 'MAP'},
        {key: 'summary', title: 'SUMMARY'},
      ],
    };

    this.renderScene = SceneMap({
      list: this.routeList,
      map: this.routeMap,
      summary: this.routeSummary,
    });
  }

  async componentDidMount() {}

  componentWillUnmount() {}

  routeList = () => <ListTabScreen navigation={this.props.navigation} />;

  routeMap = () => <MapTabScreen />;

  routeSummary = () => <SummaryTabScreen />;

  render() {
    if (this.props.route.calling) {
      return (
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text style={styles.errorText}>Loading itinerary data...</Text>
        </View>
      );
    } else if (this.props.route.stops.length === 0) {
      return (
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text style={styles.errorText}>
            You don't have an assigned work today.
          </Text>
          {/* <TouchableOpacity
            onPress={() => {
              AuthApi.sendTestNotification(this.props.token);
            }}
            style={{padding: 20}}>
            <Text>Press Me</Text>
          </TouchableOpacity> */}
        </View>
      );
    }
    return (
      <CommonTabView
        tabs={[
          {
            title: `LIST (${this.props.route.stops.length})`,
            render: this.routeList,
          },
          {
            title: 'MAP',
            render: this.routeMap,
          },
          {
            title: 'SUMMARY',
            render: this.routeSummary,
          },
        ]}
      />
    );
    // return this.routeList();
  }
}

const mapStateToProps = (state) => ({
  token: state.auth.token,
  user: state.auth.user,
  route: state.route,
});

export default connect(mapStateToProps, {})(ItineraryHomeScreen);

const styles = StyleSheet.create({
  errorText: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    textAlign: 'center',
  },
});
