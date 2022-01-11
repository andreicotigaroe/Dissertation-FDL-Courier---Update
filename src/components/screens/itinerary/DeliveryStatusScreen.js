import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import {connect} from 'react-redux';
import {default as MaterialCommunityIcon} from 'react-native-vector-icons/MaterialCommunityIcons';

import {AppColors, HeaderStyle, AppFonts} from '~/assets/styles';
import {consts} from '../../../assets/values';
import TouchableDebounce from '../common/TouchableDebounce';

class DeliveryStatusScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      ...HeaderStyle,
      title: 'FINISH ORDER',
    };
  };

  constructor(props) {
    super(props);

    this.stop = this.props.navigation.state.params.stop;
    this.order = this.props.navigation.state.params.order;
    this.parcels = this.props.navigation.state.params.parcels;
    this.state = {
      submitting: false,
      order: this.order,
    };
  }

  async componentDidMount() {
    this.props.navigation.setParams({onPressMenu: this.onPressMenu});
  }

  componentWillUnmount() {}

  onPressMenu = () => {
    this.dropdownMenu.show();
  };

  checkScannedParcels = () => {
    if (this.parcels.filter((parcel) => parcel.scanned).length === 0) {
      Alert.alert(
        'Cannot deliver',
        'You cannot deliver the parcels because there is no scanned parcels.',
      );
      return false;
    }
    return true;
  };

  render() {
    const {route} = this.props;
    const {order} = this.state;

    var workHours = '---';
    if (route.currentStopId) {
      const stop = route.stops.find((stop) => stop.id === route.currentStopId);
      if (stop) {
        const dayOfWeek = new Date().getDay();
        if (
          order &&
          order.shop &&
          order.shop.hours &&
          order.shop.hours.length === 7
        ) {
          if (order.shop.hours[dayOfWeek].closes_on) workHours = 'Closed';
          else
            workHours = `${order.shop.hours[dayOfWeek].opens_at} - ${order.shop.hours[dayOfWeek].closes_at}`;
        }
      }
    }
    return (
      <SafeAreaView style={{flex: 1}}>
        {this.order.status === consts.ORDER_STATUS.OUT_FOR_DELIVERY ||
        this.order.status === consts.ORDER_STATUS.NOT_DELIVERED ? (
          <ScrollView contentContainerStyle={{paddingBottom: 20}}>
            <View style={{paddingVertical: 20}}>
              <Text
                style={[
                  styles.sectionTitleText,
                  {textAlign: 'center', color: AppColors.success},
                ]}>
                CAN DELIVER
              </Text>
            </View>
            <TouchableDebounce
              onPress={() => {
                if (this.checkScannedParcels()) {
                  this.props.navigation.navigate('RecipientDetails', {
                    order: this.order,
                    parcels: this.parcels,
                    leave_place: consts.LEAVE_PLACE.CUSTOMER,
                  });
                }
              }}>
              <View style={styles.actionItemContainer}>
                <View style={{flex: 1, paddingLeft: 10}}>
                  <Text style={styles.actionItemText}>Customer</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <MaterialCommunityIcon
                    name="chevron-right"
                    color={AppColors.grey2}
                    size={24}
                  />
                </View>
              </View>
            </TouchableDebounce>
            {!this.order.age_restricted && (
              <>
                <TouchableDebounce
                  onPress={() => {
                    if (this.checkScannedParcels()) {
                      this.props.navigation.navigate('RecipientDetails', {
                        order: this.order,
                        parcels: this.parcels,
                        leave_place: consts.LEAVE_PLACE.NEIGHBOR,
                      });
                    }
                  }}>
                  <View style={styles.actionItemContainer}>
                    <View style={{flex: 1, paddingLeft: 10}}>
                      <Text style={styles.actionItemText}>Neighbor</Text>
                    </View>
                    <View style={styles.arrowContainer}>
                      <MaterialCommunityIcon
                        name="chevron-right"
                        color={AppColors.grey2}
                        size={24}
                      />
                    </View>
                  </View>
                </TouchableDebounce>
                {!this.order.cod && (
                  <>
                    <TouchableDebounce
                      onPress={() => {
                        if (this.checkScannedParcels()) {
                          this.props.navigation.navigate('DropDelivery', {
                            order: this.order,
                            parcels: this.parcels,
                            leave_place: consts.LEAVE_PLACE.FRONT_PORCH,
                          });
                        }
                      }}>
                      <View style={styles.actionItemContainer}>
                        <View style={{flex: 1, paddingLeft: 10}}>
                          <Text style={styles.actionItemText}>Front Porch</Text>
                        </View>
                        <View style={styles.arrowContainer}>
                          <MaterialCommunityIcon
                            name="chevron-right"
                            color={AppColors.grey2}
                            size={24}
                          />
                        </View>
                      </View>
                    </TouchableDebounce>
                    <TouchableDebounce
                      onPress={() => {
                        if (this.checkScannedParcels()) {
                          this.props.navigation.navigate('DropDelivery', {
                            order: this.order,
                            parcels: this.parcels,
                            leave_place: consts.LEAVE_PLACE.REAR_PORCH,
                          });
                        }
                      }}>
                      <View style={styles.actionItemContainer}>
                        <View style={{flex: 1, paddingLeft: 10}}>
                          <Text style={styles.actionItemText}>Rear Porch</Text>
                        </View>
                        <View style={styles.arrowContainer}>
                          <MaterialCommunityIcon
                            name="chevron-right"
                            color={AppColors.grey2}
                            size={24}
                          />
                        </View>
                      </View>
                    </TouchableDebounce>
                    <TouchableDebounce
                      onPress={() => {
                        if (this.checkScannedParcels()) {
                          this.props.navigation.navigate('DropDelivery', {
                            order: this.order,
                            parcels: this.parcels,
                            leave_place: consts.LEAVE_PLACE.GARDEN,
                          });
                        }
                      }}>
                      <View style={styles.actionItemContainer}>
                        <View style={{flex: 1, paddingLeft: 10}}>
                          <Text style={styles.actionItemText}>Garden</Text>
                        </View>
                        <View style={styles.arrowContainer}>
                          <MaterialCommunityIcon
                            name="chevron-right"
                            color={AppColors.grey2}
                            size={24}
                          />
                        </View>
                      </View>
                    </TouchableDebounce>
                    <TouchableDebounce
                      onPress={() => {
                        if (this.checkScannedParcels()) {
                          this.props.navigation.navigate('DropDelivery', {
                            order: this.order,
                            parcels: this.parcels,
                            leave_place: consts.LEAVE_PLACE.BEHIND_WHEELIE_BIN,
                          });
                        }
                      }}>
                      <View style={styles.actionItemContainer}>
                        <View style={{flex: 1, paddingLeft: 10}}>
                          <Text style={styles.actionItemText}>
                            Behind Wheelie Bin
                          </Text>
                        </View>
                        <View style={styles.arrowContainer}>
                          <MaterialCommunityIcon
                            name="chevron-right"
                            color={AppColors.grey2}
                            size={24}
                          />
                        </View>
                      </View>
                    </TouchableDebounce>
                    <TouchableDebounce
                      onPress={() => {
                        if (this.checkScannedParcels()) {
                          this.props.navigation.navigate('DropDelivery', {
                            order: this.order,
                            parcels: this.parcels,
                            leave_place: consts.LEAVE_PLACE.SHED_GARDEN_HOUSE,
                          });
                        }
                      }}>
                      <View style={styles.actionItemContainer}>
                        <View style={{flex: 1, paddingLeft: 10}}>
                          <Text style={styles.actionItemText}>
                            Shed/Garden House
                          </Text>
                        </View>
                        <View style={styles.arrowContainer}>
                          <MaterialCommunityIcon
                            name="chevron-right"
                            color={AppColors.grey2}
                            size={24}
                          />
                        </View>
                      </View>
                    </TouchableDebounce>
                    <TouchableDebounce
                      onPress={() => {
                        if (this.checkScannedParcels()) {
                          this.props.navigation.navigate('DropDelivery', {
                            order: this.order,
                            parcels: this.parcels,
                            leave_place: consts.LEAVE_PLACE.LETTERBOX,
                          });
                        }
                      }}>
                      <View style={styles.actionItemContainer}>
                        <View style={{flex: 1, paddingLeft: 10}}>
                          <Text style={styles.actionItemText}>Letterbox</Text>
                        </View>
                        <View style={styles.arrowContainer}>
                          <MaterialCommunityIcon
                            name="chevron-right"
                            color={AppColors.grey2}
                            size={24}
                          />
                        </View>
                      </View>
                    </TouchableDebounce>
                    <TouchableDebounce
                      onPress={() => {
                        if (this.checkScannedParcels()) {
                          this.props.navigation.navigate('RecipientDetails', {
                            order: this.order,
                            parcels: this.parcels,
                            leave_place: consts.LEAVE_PLACE.MAIL_ROOM,
                          });
                        }
                      }}>
                      <View style={styles.actionItemContainer}>
                        <View style={{flex: 1, paddingLeft: 10}}>
                          <Text style={styles.actionItemText}>Mail Room</Text>
                        </View>
                        <View style={styles.arrowContainer}>
                          <MaterialCommunityIcon
                            name="chevron-right"
                            color={AppColors.grey2}
                            size={24}
                          />
                        </View>
                      </View>
                    </TouchableDebounce>
                    <TouchableDebounce
                      onPress={() => {
                        if (this.checkScannedParcels()) {
                          this.props.navigation.navigate('RecipientDetails', {
                            order: this.order,
                            parcels: this.parcels,
                            leave_place: consts.LEAVE_PLACE.RECEPTION,
                          });
                        }
                      }}>
                      <View style={styles.actionItemContainer}>
                        <View style={{flex: 1, paddingLeft: 10}}>
                          <Text style={styles.actionItemText}>Reception</Text>
                        </View>
                        <View style={styles.arrowContainer}>
                          <MaterialCommunityIcon
                            name="chevron-right"
                            color={AppColors.grey2}
                            size={24}
                          />
                        </View>
                      </View>
                    </TouchableDebounce>
                    <TouchableDebounce
                      onPress={() => {
                        if (this.checkScannedParcels()) {
                          this.props.navigation.navigate('RecipientDetails', {
                            order: this.order,
                            parcels: this.parcels,
                            leave_place: consts.LEAVE_PLACE.SHOP_ASSISTANT,
                          });
                        }
                      }}>
                      <View style={styles.actionItemContainer}>
                        <View style={{flex: 1, paddingLeft: 10}}>
                          <Text style={styles.actionItemText}>
                            Shop Assistant
                          </Text>
                        </View>
                        <View style={styles.arrowContainer}>
                          <MaterialCommunityIcon
                            name="chevron-right"
                            color={AppColors.grey2}
                            size={24}
                          />
                        </View>
                      </View>
                    </TouchableDebounce>
                  </>
                )}
              </>
            )}

            <View style={{paddingVertical: 20}}>
              <Text
                style={[
                  styles.sectionTitleText,
                  {textAlign: 'center', color: AppColors.danger},
                ]}>
                CANNOT DELIVER
              </Text>
            </View>
            <TouchableDebounce
              onPress={() =>
                this.props.navigation.navigate('WrongAddressCall', {
                  order: this.order,
                  stop: this.stop,
                  failure_reason:
                    consts.DELIVERY_FAILURE_TYPES.WRONG_ADDRESS,
                })
              }>
              <View style={styles.actionItemContainer}>
                <View style={{flex: 1, paddingLeft: 10}}>
                  <Text style={styles.actionItemText}>
                    The address is wrong
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
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
                this.props.navigation.navigate('FailureFinish', {
                  order: this.order,
                  parcels: this.parcels,
                  failure_reason: consts.DELIVERY_FAILURE_TYPES.NO_CUSTOMER,
                })
              }>
              <View style={styles.actionItemContainer}>
                <View style={{flex: 1, paddingLeft: 10}}>
                  <Text style={styles.actionItemText}>
                    The customer is not available
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
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
                this.props.navigation.navigate('FailureFinish', {
                  order: this.order,
                  parcels: this.parcels,
                  failure_reason: consts.DELIVERY_FAILURE_TYPES.REJECTED,
                })
              }>
              <View style={styles.actionItemContainer}>
                <View style={{flex: 1, paddingLeft: 10}}>
                  <Text style={styles.actionItemText}>
                    The customer is rejecting the delivery
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
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
                this.props.navigation.navigate('FailureFinish', {
                  order: this.order,
                  parcels: this.parcels,
                  failure_reason: consts.DELIVERY_FAILURE_TYPES.SHOP_CLOSED,
                })
              }>
              <View style={styles.actionItemContainer}>
                <View style={{flex: 1, paddingLeft: 10}}>
                  <Text style={styles.actionItemText}>The shop is closed</Text>
                </View>
                <View style={styles.arrowContainer}>
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
                this.props.navigation.navigate('FailureFinish', {
                  order: this.order,
                  parcels: this.parcels,
                  failure_reason:
                    consts.DELIVERY_FAILURE_TYPES.DAMAGED_IN_TRANSIT,
                })
              }>
              <View style={styles.actionItemContainer}>
                <View style={{flex: 1, paddingLeft: 10}}>
                  <Text style={styles.actionItemText}>
                    The delivery was damaged in transit
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
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
                this.props.navigation.navigate('FailureFinish', {
                  order: this.order,
                  parcels: this.parcels,
                  failure_reason:
                    consts.DELIVERY_FAILURE_TYPES.MISSING,
                })
              }>
              <View style={styles.actionItemContainer}>
                <View style={{flex: 1, paddingLeft: 10}}>
                  <Text style={styles.actionItemText}>Missing parcels</Text>
                </View>
                <View style={styles.arrowContainer}>
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
                this.props.navigation.navigate('FailureFinish', {
                  order: this.order,
                  parcels: this.parcels,
                  failure_reason:
                    consts.DELIVERY_FAILURE_TYPES.CANNOT_ACCESS,
                })
              }>
              <View style={styles.actionItemContainer}>
                <View style={{flex: 1, paddingLeft: 10}}>
                  <Text style={styles.actionItemText}>
                    Cannot access to the address
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
                  <MaterialCommunityIcon
                    name="chevron-right"
                    color={AppColors.grey2}
                    size={24}
                  />
                </View>
              </View>
            </TouchableDebounce>
          </ScrollView>
        ) : (
          <></>
        )}

        {/* {this.order.recipient_type === consts.RECIPIENT_TYPE.BUSINESS &&
          <TouchableDebounce onPress={() => this.props.navigation.navigate('ShopHours', { order: this.order })} style={{ marginTop: 30 }}>
            <View style={styles.actionItemContainer}>
              <View style={{ flex: 1, paddingLeft: 10 }}>
                <Text style={[styles.actionItemText]}>ADD HOURS</Text>
                <Text style={[styles.actionItemDescription]}>This data will help routing further delivery for this shop.</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", paddingLeft: 10 }}>
                <MaterialCommunityIcon name="chevron-right" color={AppColors.grey2} size={24} />
              </View>
            </View>
          </TouchableDebounce>} */}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.auth.token,
  user: state.auth.user,
  route: state.route,
});

export default connect(mapStateToProps, {})(DeliveryStatusScreen);

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
  arrowContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
  },
});
