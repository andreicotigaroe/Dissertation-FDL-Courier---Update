import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import {ProgressBar} from 'rn-multi-progress-bar';

import {AppColors, AppFonts, AppStyles} from '../../../../assets/styles';
import {consts} from '../../../../assets/values';
import {isDeliveryOrder, isCollectionOrder} from '../../../../utils';

class SummaryTabScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: '',
    };
  }

  async componentDidMount() {}

  componentWillUnmount() {}

  render() {
    const stops = this.props.route ? this.props.route.stops : [];

    var numCollections = 0,
      numSuccessCollections = 0,
      numFailureCollections = 0,
      numDeliveries = 0,
      numSuccessDeliveries = 0,
      numFailureDeliveries = 0;
    for (var i = 0; i < stops.length; i++) {
      const stop = stops[i];
      for (var j = 0; j < stop.orders.length; j++) {
        const order = stop.orders[j];
        if (isDeliveryOrder(order)) {
          numDeliveries++;
          if (
            order.status === consts.ORDER_STATUS.DELIVERED ||
            order.status === consts.ORDER_STATUS.PARTIALLY_DELIVERED
          )
            numSuccessDeliveries++;
          if (order.status === consts.ORDER_STATUS.NOT_DELIVERED)
            numFailureDeliveries++;
        }

        if (isCollectionOrder(order)) {
          numCollections++;
          if (order.status === consts.ORDER_STATUS.COLLECTED)
            numSuccessCollections++;
          if (order.status === consts.ORDER_STATUS.NOT_COLLECTED)
            numFailureCollections++;
        }
      }
    }

    return (
      <View style={AppStyles.mainContainer}>
        <View style={styles.section}>
          <Text
            style={{
              color: AppColors.text,
              fontFamily: AppFonts.main.medium,
              fontSize: 14,
            }}>
            Total {numDeliveries} Delivery Orders
          </Text>
          {numDeliveries > 0 && (
            <>
              <ProgressBar
                shouldAnimate={true} // to enable animation, default false
                animateDuration={1000} // if animation enabled
                data={[
                  {progress: numSuccessDeliveries, color: AppColors.primary},
                  {progress: numFailureDeliveries, color: AppColors.danger},
                  {
                    progress:
                      numDeliveries -
                      numSuccessDeliveries -
                      numFailureDeliveries,
                    color: AppColors.grey,
                  },
                ]}
                barHeight={24}
              />
              <View style={styles.deliveryListItem}>
                <View
                  style={{
                    backgroundColor: AppColors.primary,
                    width: 20,
                    height: 20,
                    marginRight: 15,
                  }}
                />
                <Text style={styles.label}>Successes</Text>
                <Text style={styles.value}>{numSuccessDeliveries}</Text>
                {/* <View style={{justifyContent: 'center', width: 30, alignItems: 'flex-end'}}>
                            <Icon name="ios-chevron-forward" color={AppColors.grey2} size={16} /> 
                        </View> */}
              </View>
              <View style={styles.deliveryListItem}>
                <View
                  style={{
                    backgroundColor: AppColors.danger,
                    width: 20,
                    height: 20,
                    marginRight: 15,
                  }}
                />
                <Text style={styles.label}>Problems</Text>
                <Text style={styles.value}>{numFailureDeliveries}</Text>
                {/* <View style={{justifyContent: 'center', width: 30, alignItems: 'flex-end'}}>
                            <Icon name="ios-chevron-forward" color={AppColors.grey2} size={16} /> 
                        </View> */}
              </View>
              <View style={[styles.deliveryListItem, {borderBottomWidth: 0}]}>
                <View
                  style={{
                    backgroundColor: AppColors.grey,
                    width: 20,
                    height: 20,
                    marginRight: 15,
                  }}
                />
                <Text style={styles.label}>Left</Text>
                <Text style={styles.value}>
                  {numDeliveries - numSuccessDeliveries - numFailureDeliveries}
                </Text>
                {/* <View style={{justifyContent: 'center', width: 30, alignItems: 'flex-end'}}>
                            <Icon name="ios-chevron-forward" color={AppColors.grey2} size={16} /> 
                        </View> */}
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text
            style={{
              color: AppColors.text,
              fontFamily: AppFonts.main.medium,
              fontSize: 14,
            }}>
            Total {numCollections} Collection Orders
          </Text>
          {numCollections > 0 && (
            <>
              <ProgressBar
                shouldAnimate={true} // to enable animation, default false
                animateDuration={1000} // if animation enabled
                data={[
                  {progress: numSuccessCollections, color: AppColors.success},
                  {progress: numFailureCollections, color: AppColors.danger},
                  {
                    progress:
                      numCollections -
                      numSuccessCollections -
                      numFailureCollections,
                    color: AppColors.grey,
                  },
                ]}
                barHeight={24}
              />
              <View style={styles.deliveryListItem}>
                <View
                  style={{
                    backgroundColor: AppColors.success,
                    width: 20,
                    height: 20,
                    marginRight: 15,
                  }}
                />
                <Text style={styles.label}>Successes</Text>
                <Text style={styles.value}>{numSuccessCollections}</Text>
                {/* <View style={{justifyContent: 'center', width: 30, alignItems: 'flex-end'}}>
                            <Icon name="ios-chevron-forward" color={AppColors.grey2} size={16} /> 
                        </View> */}
              </View>
              <View style={styles.deliveryListItem}>
                <View
                  style={{
                    backgroundColor: AppColors.danger,
                    width: 20,
                    height: 20,
                    marginRight: 15,
                  }}
                />
                <Text style={styles.label}>Problems</Text>
                <Text style={styles.value}>{numFailureCollections}</Text>
                {/* <View style={{justifyContent: 'center', width: 30, alignItems: 'flex-end'}}>
                            <Icon name="ios-chevron-forward" color={AppColors.grey2} size={16} /> 
                        </View> */}
              </View>
              <View style={[styles.deliveryListItem, {borderBottomWidth: 0}]}>
                <View
                  style={{
                    backgroundColor: AppColors.grey,
                    width: 20,
                    height: 20,
                    marginRight: 15,
                  }}
                />
                <Text style={styles.label}>Left</Text>
                <Text style={styles.value}>
                  {numCollections -
                    numSuccessCollections -
                    numFailureCollections}
                </Text>
                {/* <View style={{justifyContent: 'center', width: 30, alignItems: 'flex-end'}}>
                            <Icon name="ios-chevron-forward" color={AppColors.grey2} size={16} /> 
                        </View> */}
              </View>
            </>
          )}
        </View>

        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            PAYMENT
                    </Text>
          <View style={styles.deliveryListItem}>
            <View style={{ justifyContent: 'center', width: 35, alignItems: 'flex-start' }}>
              <MaterialCommunityIcon name="cash-multiple" color={AppColors.grey2} size={20} />
            </View>
            <Text style={styles.label}>Cash Received</Text>
            <Text style={styles.value}>£ {cashReceived.toFixed(2)}</Text>
          </View>
          <View style={[styles.deliveryListItem, { borderBottomWidth: 0 }]}>
            <View style={{ justifyContent: 'center', width: 35, alignItems: 'flex-start' }}>
              <Icon name="card-sharp" color={AppColors.grey2} size={16} />
            </View>
            <Text style={styles.label}>Card Received</Text>
            <Text style={styles.value}>£ {cardReceived.toFixed(2)}</Text>
          </View>
        </View> */}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.auth.token,
  user: state.auth.user,
  route: state.route,
});
export default connect(mapStateToProps, {})(SummaryTabScreen);

const styles = StyleSheet.create({
  section: {
    backgroundColor: AppColors.white,
    paddingHorizontal: 30,
    marginBottom: 8,
    paddingVertical: 20,
  },

  sectionTitle: {
    color: AppColors.grey2,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    marginBottom: 7,
  },

  value: {
    textAlign: 'right',
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    width: 80,
  },

  deliveryListItem: {
    borderBottomColor: AppColors.grey3,
    borderBottomWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  label: {
    color: AppColors.text,
    fontFamily: AppFonts.main.regular,
    fontSize: 13,
    flex: 1,
  },
});
