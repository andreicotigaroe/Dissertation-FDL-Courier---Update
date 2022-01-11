import React, {Component} from 'react';

import {StyleSheet, View, Text, Linking} from 'react-native';
import Collapsible from 'react-native-collapsible';

import {AppFonts, AppColors, AppStyles} from '../../assets/styles';
import {consts} from '../../assets/values';
import TouchableDebounce from '../screens/common/TouchableDebounce';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {default as IonIcon} from 'react-native-vector-icons/Ionicons';
import {default as Fontisto} from 'react-native-vector-icons/Fontisto';
import {default as MaterialCommunityIcon} from 'react-native-vector-icons/MaterialCommunityIcons';
import {default as Entypo} from 'react-native-vector-icons/Entypo';

export default class CollectionItem extends Component {
  static defaultProps = {
    orders: [],
    data: null,
    onPress: () => {},
    renderButtons: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
    };
  }

  renderOrderRow = (order, index) => {
    const collectParcels = order.parcels.filter(
      (parcel) =>
        parcel.status === consts.PARCEL_STATUS.COLLECTED_BY_DRIVER ||
        parcel.status === consts.PARCEL_STATUS.DELIVERED,
    );
    return (
      <View key={index} style={{flexDirection: 'row', paddingVertical: 5}}>
        {order.status === consts.ORDER_STATUS.COLLECTED ? (
          <Entypo name={'check'} size={18} color={AppColors.success} style={{width : 20}} />
        ) : order.status === consts.ORDER_STATUS.NOT_COLLECTED ? (
          <Entypo name={'cross'} size={18} color={AppColors.danger} style={{width : 20}} />
        ) : (
          <Entypo name={'dot-single'} size={18} color={AppColors.grey} style={{width : 20}} />
        )}
        <Text
          style={{
            fontFamily: AppFonts.main.medium,
            fontSize: 14,
            flex: 1,
          }}>
          {order.id}
        </Text>
        <Text style={{fontFamily: AppFonts.main.medium, fontSize: 16}}>
          {collectParcels.length} / {order.parcels.length}
        </Text>
      </View>
    );
  };

  render() {
    const {renderButtons} = this.props;
    const {
      phoneNumber,
      email,
      companyName,
      contactName,
      orders,
    } = this.props.data;

    var parcels = [],
      collectedParcels = [],
      failedParcels = [];
    orders.forEach((order) => {
      parcels = parcels.concat(order.parcels);
      if (order.status === consts.ORDER_STATUS.COLLECTED)
        collectedParcels = collectedParcels.concat(
          order.parcels.filter(
            (parcel) =>
              parcel.status === consts.PARCEL_STATUS.COLLECTED_BY_DRIVER,
          ),
        );
      if (order.status === consts.ORDER_STATUS.NOT_COLLECTED)
        failedParcels = failedParcels.concat(order.parcels);
    });

    return (
      <View style={[styles.actionItemContainer]}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: AppColors.textLight,
            paddingVertical: 8,
            paddingHorizontal: 20,
          }}>
          <FontAwesome5 name="hands" size={20} color={AppColors.white} />
          <Text style={{fontSize: 16, color: 'white', paddingLeft: 10}}>
            Collection
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            paddingVertical: 15,
            paddingHorizontal: 20,
          }}>
          <Text
            style={{
              fontSize: 20,
              fontFamily: AppFonts.main.medium,
              color: AppColors.text,
            }}>
            {contactName}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: AppFonts.main.regular,
              color: AppColors.grey2,
            }}>
            {companyName || '---'}
          </Text>
          <View
            style={{
              marginTop: 10,
              marginBottom: 10,
              flexDirection: 'row',
              // paddingLeft: 20,
            }}>
            <IonIcon name="mail" color={AppColors.grey2} size={20} />
            <Text
              style={{
                fontSize: 14,
                fontFamily: AppFonts.main.medium,
                color: AppColors.grey,
                marginLeft: 10,
              }}>
              {email}
            </Text>
          </View>
          <View style={AppStyles.divider} />
          <TouchableDebounce
            debounceTime={300}
            style={{paddingVertical: 10, flexDirection: 'row'}}
            onPress={() => this.setState({collapsed: !this.state.collapsed})}>
            <IonIcon
              name={`${
                this.state.collapsed ? 'chevron-forward' : 'chevron-down'
              }`}
              color={AppColors.grey}
              size={20}
            />
            <Text
              style={{
                fontSize: 14,
                fontFamily: AppFonts.main.medium,
                flex: 1,
                color: AppColors.text,
                paddingLeft: 10,
              }}>
              {orders.length} Order(s), {parcels.length} Parcel(s)
            </Text>
          </TouchableDebounce>
          <Collapsible collapsed={this.state.collapsed}>
            <View style={{marginLeft: 30}}>
              {orders.map((order, index) => {
                return this.renderOrderRow(order, index);
              })}
            </View>
          </Collapsible>
        </View>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 10,
            paddingBottom: 10,
            // borderTopWidth: 1,
            // borderColor: AppColors.,
            // backgroundColor: AppColors.grey3
          }}>
          <View style={{flex: 1, paddingRight: 5}}>
            <TouchableDebounce
              style={{
                ...AppStyles.primaryButtonContainer,
                backgroundColor: null,
                height: 40,
              }}
              disabled={phoneNumber ? false : true}
              onPress={() => Linking.openURL(`tel:${phoneNumber}`)}>
              <Fontisto
                name="phone"
                color={phoneNumber ? AppColors.primary : AppColors.grey2}
                size={16}
              />
              <Text
                style={{
                  ...AppStyles.primaryButtonText,
                  color: phoneNumber ? AppColors.primary : AppColors.grey2,
                  textDecorationLine: phoneNumber ? 'underline' : 'none',
                  marginLeft: 10,
                  fontSize: 14,
                }}>
                {phoneNumber || '---'}
              </Text>
            </TouchableDebounce>
          </View>
          <View style={{flex: 1, paddingLeft: 5}}>
            {renderButtons && (
              <TouchableDebounce
                style={{
                  ...AppStyles.primaryButtonContainer,
                  height: 36,
                  borderRadius: 5,
                }}
                onPress={() => {
                  if (this.props.onPress) this.props.onPress();
                }}>
                <MaterialCommunityIcon
                  name="qrcode-scan"
                  size={20}
                  color={AppColors.white}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: AppColors.white,
                    fontFamily: AppFonts.main.regular,
                    marginLeft: 10,
                  }}>
                  Start Scan
                </Text>
              </TouchableDebounce>
            )}
          </View>
        </View>
        {/* {renderArrow && (
          <View style={{justifyContent: 'center'}}>
            <FontAwesome5
              name="angle-right"
              size={20}
              color={AppColors.grey2}
            />
          </View>
        )} */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  actionItemContainer: {
    backgroundColor: AppColors.white,
    marginBottom: 2,
    elevation: 2,
  },
});
