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

export default class DeliveryItem extends Component {
  static defaultProps = {
    order: null,
    onPress: () => {},
    renderButtons: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
    };
  }

  render() {
    const {renderButtons} = this.props;
    const {order} = this.props;

    var deliveredParcels = order.parcels.filter(
      (parcel) => parcel.status === consts.PARCEL_STATUS.DELIVERED,
    );
    const disabled = order.status === consts.ORDER_STATUS.DELIVERED;

    return (
      <View style={[styles.actionItemContainer]}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: AppColors.primary,
            paddingVertical: 8,
            paddingHorizontal: 20,
          }}>
          <MaterialCommunityIcon
            name="truck-fast-outline"
            size={24}
            color={AppColors.white}
          />
          <Text style={{fontSize: 16, color: 'white', paddingLeft: 10, fontFamily: AppFonts.main.medium}}>
            Delivery
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
            {order.recipient_contact}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: AppFonts.main.regular,
              color: AppColors.grey2,
            }}>
            {order.recipient_company_name || '---'}
          </Text>
          <View
            style={{
              marginTop: 5,
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
              {order.recipient_email}
            </Text>
          </View>
          <View style={AppStyles.divider} />
          <View style={{flexDirection: 'row', paddingTop: 10}}>
            {order.status === consts.ORDER_STATUS.DELIVERED ? (
              <Entypo
                name={'check'}
                size={18}
                color={AppColors.success}
                style={{width: 20}}
              />
            ) : order.status === consts.ORDER_STATUS.PARTIALLY_DELIVERED ? (
              <Entypo
                name={'check'}
                size={18}
                color={AppColors.warning}
                style={{width: 20}}
              />
            ) : order.status === consts.ORDER_STATUS.NOT_DELIVERED ? (
              <Entypo
                name={'cross'}
                size={18}
                color={AppColors.danger}
                style={{width: 20}}
              />
            ) : (
              <Entypo
                name={'dot-single'}
                size={18}
                color={AppColors.grey}
                style={{width: 20}}
              />
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
              {deliveredParcels.length} / {order.parcels.length}
            </Text>
          </View>
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
              disabled={order.recipient_phone_number ? false : true}
              onPress={() =>
                Linking.openURL(`tel:${order.recipient_phone_number}`)
              }>
              <Fontisto
                name="phone"
                color={
                  order.recipient_phone_number
                    ? AppColors.primary
                    : AppColors.grey2
                }
                size={16}
              />
              <Text
                style={{
                  ...AppStyles.primaryButtonText,
                  color: order.recipient_phone_number
                    ? AppColors.primary
                    : AppColors.grey2,
                  textDecorationLine: order.recipient_phone_number
                    ? 'underline'
                    : 'none',
                  marginLeft: 10,
                  fontSize: 14,
                }}>
                {order.recipient_phone_number || '---'}
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
                  opacity: disabled ? 0.6 : 1,
                }}
                disabled={disabled}
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
    marginBottom: 20,
  },
});
