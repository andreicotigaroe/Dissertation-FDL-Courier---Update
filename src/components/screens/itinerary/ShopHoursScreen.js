import React from "react";
import { View, Alert, Text, Image, Modal, TouchableOpacity, Dimensions, StyleSheet, SafeAreaView, FlatList, ScrollView } from "react-native";
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import { default as MaterialIcon } from 'react-native-vector-icons/MaterialIcons';
import { default as Ionicon } from 'react-native-vector-icons/Ionicons';
import SwipeButton from 'rn-swipe-button';
import { default as FontAwesomeIcon } from 'react-native-vector-icons/FontAwesome';
import { default as MaterialCommunityIcon } from 'react-native-vector-icons/MaterialCommunityIcons';
import { default as Octicons } from 'react-native-vector-icons/Octicons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { DotIndicator } from 'react-native-indicators';
import { default as BottomModal } from 'react-native-modal';
import CheckBox from 'react-native-check-box';
import Moment from 'moment';

import { AppColors, HeaderStyle, AppFonts, AppStyles } from "../../../assets/styles";
import { setUserData } from "../../../redux/reducers/auth";
import ShipmentApi from "../../../services/api/ShipmentApi";
import { sagaSubmitShopHours } from "../../../redux/sagas/route";
import Waiting from "../../widgets/Waiting";
import { bindActionCreators } from "redux";
import TouchableDebounce from "../common/TouchableDebounce";


const dayTitles = [
  "Sundays",
  "Mondays",
  "Tuesdays",
  "Wednesdays",
  "Thursdays",
  "Fridays",
  "Saturdays"
];


class ShopHoursScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      ...HeaderStyle,
      title: 'WORK HOURS',
      // headerRight: () => {
      //     return (
      //         <Menu onSelect={value => alert(`Selected number: ${value}`)} >
      //             <MenuTrigger style={{ padding: 10 }}>
      //                 <MaterialIcon name="more-vert" color={AppColors.grey2} size={28} />
      //             </MenuTrigger>
      //             <MenuOptions optionsContainerStyle={{ marginTop: 50 }}>
      //                 <MenuOption value={2} style={AppStyles.headerMenuItemContainer}>
      //                     <Text style={AppStyles.headerMenuItemText}>ADD HOURS</Text>
      //                 </MenuOption>
      //             </MenuOptions>
      //         </Menu>
      //     );
      // },
    }
  };

  constructor(props) {
    super(props);

    this.order = this.props.navigation.state.params.order;

    var days = [];
    if (this.order.shop && this.order.shop.hours && this.order.shop.hours.length === 7) {
      for (var i = 0; i < 7; i++) {
        days.push({
          title: this.order.shop.hours[i].title,
          closes_on: this.order.shop.hours[i].closes_on,
          opens_at: new Date(Moment(this.order.shop.hours[i].opens_at, "HH:mm")),
          closes_at: new Date(Moment(this.order.shop.hours[i].closes_at, "HH:mm")),
        })
      }
    } else {
      for (var i = 0; i < 7; i++) {
        days.push({
          title: dayTitles[i],
          closes_on: false,
          opens_at: new Date().setHours(0, 0, 0, 0),
          closes_at: new Date().setHours(23, 59, 0, 0),
        })
      }
    }
    console.log(JSON.stringify(days, null, 2));
    const now = new Date().setHours(0, 0, 0, 0);
    this.state = {
      submitting: false,
      visibleTimeRangeModal: false,

      showOpeningPicker: false,
      showClosingPicker: false,
      openingTime: now,
      closingTime: now,
      sameForAllDays: true,
      closeShop: false,
      dayIndex: -1,
      days: days
    };
  }

  async componentDidMount() {
    this.props.navigation.setParams({ onPressMenu: this.onPressMenu });
  }

  componentWillUnmount() {

  }

  onPressMenu = () => {
    this.dropdownMenu.show();
  }

  onChooseDay = (dayIndex) => {
    console.log(dayIndex);
    this.setState({
      visibleTimeRangeModal: true,
      dayIndex: dayIndex,
      sameForAllDays: false,
      closeShop: this.state.days[dayIndex].closes_on,
      openingTime: this.state.days[dayIndex].opens_at,
      closingTime: this.state.days[dayIndex].closes_at,
    });
  }

  onChangeHours = (cancelled) => {
    if (!cancelled) {
      const { closeShop, dayIndex, sameForAllDays, openingTime, closingTime } = this.state;
      var days = [...this.state.days];
      if (closeShop) {
        days[dayIndex].closes_on = true;
      }
      else if (sameForAllDays) {
        for (var i = 0; i < days.length; i++) {
          days[i].closes_on = false;
          days[i].opens_at = openingTime;
          days[i].closes_at = closingTime;
        }
      }
      else {
        days[dayIndex].closes_on = false;
        days[dayIndex].opens_at = openingTime;
        days[dayIndex].closes_at = closingTime;
      }
      this.setState({ days: days, visibleTimeRangeModal: false, dayIndex: -1 });
    }
    else {
      this.setState({ visibleTimeRangeModal: false, dayIndex: -1 });
    }
  }

  onSubmit = () => {
    this.setState({ submitting: true });
    var hours = [];
    for (var i = 0; i < this.state.days.length; i++) {
      hours.push({
        title: this.state.days[i].title,
        closes_on: this.state.days[i].closes_on,
        opens_at: Moment(this.state.days[i].opens_at).format('HH:mm'),
        closes_at: Moment(this.state.days[i].closes_at).format('HH:mm'),
      })
    }
    this.props.submitShopHours(hours, this.order.id, {
      onSuccess: () => {
        this.props.navigation.pop();
      },
      onFailure: () => {
        Alert.alert("Action Failed", "Submitting work hours of the shop failed.");
      }
    })
    // ShipmentApi.submitShopHours(hours, this.order.id, this.props.token).then(response => {
    //     AuthApi.getAuthUser(this.props.token).then(response => {
    //         this.setState({ submitting: false });
    //         this.props.setUserData(response.data);
    //         this.props.navigation.pop();
    //     });
    // }).catch(error => {
    //     this.setState({ submitting: false });
    //     Alert.alert("Action Failed", "Submitting work hours failed.");
    // });
  }

  render() {
    const { showOpeningPicker, showClosingPicker, openingTime, closingTime, closeShop, days, dayIndex } = this.state;
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Waiting visible={this.props.route.calling} title={"Submitting work hours of the shop..."} />
          <BottomModal
            isVisible={this.state.visibleTimeRangeModal}
            // onBackdropPress={() => this.onCancelEdit()}
            style={styles.bottomModal}
          >
            <View style={styles.bottomModalContainer}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20, opacity: closeShop ? 0.5 : 1.0 }}>
                <View style={{ flex: 1 }}>
                  <View style={AppStyles.formGroup}>
                    <Text style={AppStyles.label}>Opens at</Text>
                    <TouchableDebounce
                      disabled={closeShop}
                      onPress={() => this.setState({ showOpeningPicker: true, showClosingPicker: false })} style={[AppStyles.textInput, { justifyContent: "center" }]}>
                      <Text style={styles.timeText}>{Moment(openingTime).format('HH:mm')}</Text>
                    </TouchableDebounce>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 10, marginTop: 30 }}>
                  <MaterialCommunityIcon name="clock-outline" color={AppColors.grey2} size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={AppStyles.formGroup}>
                    <Text style={AppStyles.label}>Closes at</Text>
                    <TouchableDebounce
                      disabled={closeShop}
                      onPress={() => this.setState({ showOpeningPicker: false, showClosingPicker: true })} style={[AppStyles.textInput, { justifyContent: "center" }]}>
                      <Text style={styles.timeText}>{Moment(closingTime).format('HH:mm')}</Text>
                    </TouchableDebounce>
                  </View>
                </View>
              </View>
              {showOpeningPicker && <DateTimePicker
                value={this.state.openingTime}
                mode={'time'}
                is24Hour={true}
                display="spinner"
                onChange={(event, selectedTime) => {
                  console.log("Time Changed:", selectedTime);
                  if (selectedTime)
                    this.setState({ openingTime: selectedTime, showOpeningPicker: false, showClosingPicker: false });
                }}
              />}
              {showClosingPicker && <DateTimePicker
                value={this.state.closingTime}
                mode={'time'}
                is24Hour={true}
                display="spinner"
                onChange={(event, selectedTime) => {
                  console.log("Time Changed:", selectedTime);
                  if (selectedTime)
                    this.setState({ closingTime: selectedTime, showOpeningPicker: false, showClosingPicker: false });
                }}
              />}
              <View style={{ marginTop: 20, flexDirection: "row", opacity: closeShop ? 0.5 : 1.0 }}>
                <CheckBox
                  style={{ flex: 1 }}
                  onClick={() => {
                    this.setState({
                      sameForAllDays: !this.state.sameForAllDays
                    })
                  }}
                  isChecked={this.state.sameForAllDays}
                  checkedCheckBoxColor={AppColors.primary}
                  uncheckedCheckBoxColor={AppColors.grey3}
                  rightTextStyle={[AppStyles.label, { color: AppColors.text }]}
                  rightText={"Same for all work days"}
                  disabled={closeShop}
                />
              </View>
              <View style={{ marginTop: 20, flexDirection: "row" }}>
                <CheckBox
                  style={{ flex: 1 }}
                  onClick={() => {
                    this.setState({
                      closeShop: !this.state.closeShop
                    })
                  }}
                  isChecked={this.state.closeShop}
                  checkedCheckBoxColor={AppColors.danger}
                  uncheckedCheckBoxColor={AppColors.grey3}
                  rightTextStyle={[AppStyles.label, { color: AppColors.danger }]}
                  rightText={`Closes on ${dayIndex >= 0 ? days[dayIndex].title : ''}`}
                  disabled={false}
                />
              </View>
              <View style={{ marginTop: 40, flexDirection: "row" }}>
                <TouchableDebounce style={[AppStyles.transparentButtonContainer, { flex: 1 }]} activeOpacity={0.6}
                  onPress={() => this.onChangeHours(true)}>
                  <Text style={AppStyles.transparentButtonText}>Cancel</Text>
                </TouchableDebounce>
                <TouchableDebounce style={[AppStyles.primaryButtonContainer, { flex: 1 }]} activeOpacity={0.6}
                  onPress={() => this.onChangeHours(false)}>
                  <Text style={AppStyles.primaryButtonText}>OK</Text>
                </TouchableDebounce>
              </View>
            </View>
          </BottomModal>

          <Text style={styles.title}>
            {this.order.recipient_company_name}
          </Text>
          {
            days.map((day, index) => {
              const opensAt = day.opens_at ? Moment(day.opens_at).format('HH:mm') : null;
              const closesAt = day.closes_at ? Moment(day.closes_at).format('HH:mm') : null;
              return (
                <TouchableDebounce onPress={() => this.onChooseDay(index)} key={`${index}`}>
                  <View style={styles.actionItemContainer}>
                    <View style={{ flex: 1, paddingLeft: 10 }}>
                      <Text style={styles.actionItemText}>{day.title.toUpperCase()}</Text>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ fontFamily: AppFonts.main.medium, fontSize: 14, color: AppColors.grey }}>{day.closes_on ? "Closed" : `${opensAt} - ${closesAt}`}</Text>
                      <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", paddingLeft: 10 }}>
                        <MaterialCommunityIcon name="chevron-right" color={AppColors.grey2} size={24} />
                      </View>
                    </View>
                  </View>
                </TouchableDebounce>
              );
            })
          }
        </View>
        <View style={AppStyles.bottomContainer}>
          <TouchableDebounce style={AppStyles.bottomButtonContainer} activeOpacity={0.6} onPress={() => this.onSubmit()}>
            <Text style={AppStyles.bottomButtonText}>SAVE</Text>
          </TouchableDebounce>
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  token: state.auth.token,
  user: state.auth.user,
  route: state.route,
});

const mapDispatchToProps = (dispatch) => (
  bindActionCreators({
    submitShopHours: sagaSubmitShopHours,
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(ShopHoursScreen);

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
    marginBottom: 22
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
    paddingRight: 10
  },
  actionItemText: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    justifyContent: "center",
  },
  actionItemDescription: {
    marginTop: 5,
    color: AppColors.textLight,
    fontFamily: AppFonts.main.regular,
    fontSize: 12,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    fontFamily: AppFonts.main.medium,
    fontSize: 16,
    color: AppColors.grey,
    paddingVertical: 20,
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  bottomModalContainer: {
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'flex-start',
    // alignItems: 'center',
    borderRadius: 20,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    paddingBottom: 40,
    marginBottom: -20,
    height: 350
  },
  timeText: { fontFamily: AppFonts.main.medium, fontSize: 16, color: AppColors.text, textAlign: "center" }
})

