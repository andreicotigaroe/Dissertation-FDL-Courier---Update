import React from 'react';
import {
  View,
  Alert,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import {default as MaterialIcon} from 'react-native-vector-icons/MaterialIcons';
import {default as Ionicon} from 'react-native-vector-icons/Ionicons';
import SwipeButton from 'rn-swipe-button';
import {default as MaterialCommunityIcon} from 'react-native-vector-icons/MaterialCommunityIcons';

import {DotIndicator} from 'react-native-indicators';

import {
  AppColors,
  HeaderStyle,
  AppFonts,
  AppStyles,
} from '../../../assets/styles';
import {consts} from '../../../assets/values';
import {sagaSubmitDeliverySuccess} from '../../../redux/sagas/route';
import TouchableDebounce from '../common/TouchableDebounce';

class CollectionStatusScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      ...HeaderStyle,
      title: 'FINISH COLLECTION',
    };
  };

  constructor(props) {
    super(props);

    this.stop = this.props.navigation.state.params.stop;
    this.orders = this.props.navigation.state.params.orders;
    this.parcels = this.props.navigation.state.params.parcels;
    this.state = {
      submitting: false,
      orders: this.orders,
    };
  }

  async componentDidMount() {
    this.props.navigation.setParams({onPressMenu: this.onPressMenu});
  }

  componentWillUnmount() {}

  onPressMenu = () => {
    this.dropdownMenu.show();
  };

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <ScrollView contentContainerStyle={{paddingBottom: 20}}>
          <View style={{paddingVertical: 20}}>
            <Text
              style={[
                styles.sectionTitleText,
                {textAlign: 'center', color: AppColors.success},
              ]}>
              CAN COLLECT
            </Text>
          </View>
          <TouchableDebounce
            onPress={() =>
              this.props.navigation.navigate('SenderDetails', {
                orders: this.orders,
                parcels: this.parcels,
                collect_place: consts.COLLECT_PLACE.SENDER,
                stop: this.stop
              })
            }>
            <View style={styles.actionItemContainer}>
              <View style={{flex: 1, paddingLeft: 10}}>
                <Text style={styles.actionItemText}>Sender</Text>
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 10,
                }}>
                <MaterialCommunityIcon
                  name="chevron-right"
                  color={AppColors.grey2}
                  size={24}
                />
              </View>
            </View>
          </TouchableDebounce>

          <View style={{paddingVertical: 20}}>
            <Text
              style={[
                styles.sectionTitleText,
                {textAlign: 'center', color: AppColors.danger},
              ]}>
              CANNOT COLLECT
            </Text>
          </View>
          <TouchableDebounce
            onPress={() =>
              this.props.navigation.navigate('CollectionFailure', {
                orders: this.orders,
                stop: this.stop,
                failure_reason: consts.COLLECTION_FAILURE_TYPES.NO_CUSTOMER,
              })
            }>
            <View style={styles.actionItemContainer}>
              <View style={{flex: 1, paddingLeft: 10}}>
                <Text style={styles.actionItemText}>
                  The supplier is not available
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 10,
                }}>
                <MaterialCommunityIcon
                  name="chevron-right"
                  color={AppColors.grey2}
                  size={24}
                />
              </View>
            </View>
          </TouchableDebounce>
          <TouchableDebounce
            onPress={() =>
              this.props.navigation.navigate('CollectionFailure', {
                orders: this.orders,
                stop: this.stop,
                failure_reason: consts.COLLECTION_FAILURE_TYPES.BUSINESS_CLOSED,
              })
            }>
            <View style={styles.actionItemContainer}>
              <View style={{flex: 1, paddingLeft: 10}}>
                <Text style={styles.actionItemText}>
                  The business is closed
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 10,
                }}>
                <MaterialCommunityIcon
                  name="chevron-right"
                  color={AppColors.grey2}
                  size={24}
                />
              </View>
            </View>
          </TouchableDebounce>
          <TouchableDebounce
            onPress={() =>
              this.props.navigation.navigate('CollectionFailure', {
                orders: this.orders,
                stop: this.stop,
                failure_reason: consts.COLLECTION_FAILURE_TYPES.NO_PARCEL,
              })
            }>
            <View style={styles.actionItemContainer}>
              <View style={{flex: 1, paddingLeft: 10}}>
                <Text style={styles.actionItemText}>
                  There is no parcel to collect
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 10,
                }}>
                <MaterialCommunityIcon
                  name="chevron-right"
                  color={AppColors.grey2}
                  size={24}
                />
              </View>
            </View>
          </TouchableDebounce>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.auth.token,
  user: state.auth.user,
  route: state.route,
});

export default connect(mapStateToProps, {})(CollectionStatusScreen);

const styles = StyleSheet.create({
  label: {
    color: AppColors.textLight,
    fontFamily: AppFonts.main.medium,
    fontSize: 18,
  },
  info: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
  },
  address: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 15,
    marginBottom: 22,
  },
  parcels: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
  },
  actionItemContainer: {
    backgroundColor: AppColors.white,
    flexDirection: 'row',
    marginBottom: 2,
    paddingVertical: 15,
    paddingLeft: 20,
    paddingRight: 10,
  },
  actionItemText: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    justifyContent: 'center',
  },
  sectionTitleText: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 16,
    justifyContent: 'center',
  },
  actionItemDescription: {
    marginTop: 5,
    color: AppColors.textLight,
    fontFamily: AppFonts.main.regular,
    fontSize: 12,
    justifyContent: 'center',
  },
});
