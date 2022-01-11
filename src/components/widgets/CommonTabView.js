/**
* Created by sohobloo on 16/9/13.
*/

'use strict';

import React, {
  Component,
} from 'react';

import {
  FlatList,
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableHighlight,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { AppColors, AppFonts } from '../../assets/styles';
import TouchableDebounce from '../screens/common/TouchableDebounce';

export default class CommonTabView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0
    };

    this.onChangeTab = this.onChangeTab.bind(this);
  }

  componentDidMount() {
    
  }

  onChangeTab = (index) => {
    this.setState({tabIndex: index});
  }

  render() {
    const { tabs } = this.props;
    const { tabIndex } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.tabHeaderContainer}>
          {
            tabs.map((tab, index) => {
              return (
                <TouchableDebounce style={{flex: 1, padding: 2}} key={`${index}`} onPress={() => this.onChangeTab(index)}>
                  <Text style={[
                    styles.tabHeader, {
                      borderBottomWidth: index === tabIndex ? 2 : 0, 
                      color: index === tabIndex ? AppColors.grey3 : AppColors.grey2
                    }
                  ]}>
                    {tab.title}
                  </Text>
                </TouchableDebounce>
              );
            })
          }
        </View>
        {
          tabs[tabIndex].render()
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tabHeader: { 
    width: "100%", 
    textAlign: "center", 
    fontFamily: AppFonts.main.medium, 
    fontSize: 14, 
    borderBottomColor: AppColors.primary, 
    paddingVertical: 10 
  },
  tabHeaderContainer: { 
    flexDirection: "row", 
    backgroundColor: AppColors.text,
    elevation: 10,
  }
});