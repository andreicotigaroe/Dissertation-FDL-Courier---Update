import React, {Component} from 'react';

import {StyleSheet, View, Text} from 'react-native';

import {AppFonts, AppColors} from '../../assets/styles';
import TouchableDebounce from '../screens/common/TouchableDebounce';
import {default as MaterialCommunityIcon} from 'react-native-vector-icons/MaterialCommunityIcons';

export default class ListItem extends Component {
  static defaultProps = {
    disabled: false,
    onPress: () => {},
    renderArrow: true,
    title: '',
    description: '',
    indicatorColor: AppColors.primary,
    renderIndicator: true,
    titleColor: AppColors.text,
    descriptionColor: AppColors.grey,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {
      onPress,
      disabled,
      renderArrow,
      title,
      description,
      indicatorColor,
      renderIndicator,
      titleColor,
      descriptionColor,
    } = this.props;
    return (
      <TouchableDebounce
        style={{opacity: disabled ? 0.6 : 1}}
        disabled={disabled}
        onPress={onPress}>
        <View style={styles.actionItemContainer}>
          {renderIndicator && (
            <View
              style={[
                styles.actionItemIndicator,
                {backgroundColor: indicatorColor},
              ]}
            />
          )}
          <View style={{flex: 1, paddingLeft: 10, justifyContent: 'center'}}>
            <Text
              style={[
                styles.actionItemTitle,
                {color: titleColor || AppColors.text},
              ]}>
              {title}
            </Text>
            {description ? (
              <Text
                style={[
                  styles.actionItemDescription,
                  {color: descriptionColor || AppColors.grey},
                ]}>
                {description}
              </Text>
            ) : null}
          </View>
          {renderArrow && (
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
          )}
        </View>
      </TouchableDebounce>
    );
  }
}

const styles = StyleSheet.create({
  actionItemContainer: {
    backgroundColor: AppColors.white,
    flexDirection: 'row',
    marginBottom: 2,
    paddingVertical: 15,
    paddingLeft: 10,
    paddingRight: 10,
  },
  actionItemTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
  },
  actionItemDescription: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.regular,
    fontSize: 12,
    marginTop: 5,
  },
  actionItemIndicator: {
    backgroundColor: AppColors.warning,
    width: 4,
    marginRight: 10,
    marginVertical: -5,
  },
});
