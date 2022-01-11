import React from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {default as IonIcon} from 'react-native-vector-icons/Ionicons';

import { AppColors } from '~/assets/styles';

const PairListItem = props => {
  const {label, value, disabled, placeholder, onPress} = props;

  return (
    <TouchableOpacity style={[styles.container, {paddingVertical: props.verticalPadding}]} activeOpacity={0.5} disabled={disabled} onPress={onPress}>
      <Text style={{color: AppColors.grey}}>{label}</Text>
      {value ? (
        <Text style={{color: disabled ? AppColors.grey2 : AppColors.text, flex: 1, textAlign: 'right', paddingLeft: 10}}>{value}</Text>
      ) : (
        <Text style={{color: AppColors.grey2, flex: 1, textAlign: 'right', paddingLeft: 10}}>{placeholder}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 1,
    backgroundColor: AppColors.white,
  },
});

PairListItem.defaultProps = {
  disabled: false,
  verticalPadding: 15,
  placeholder: '',
  onPress: () => {},
};

PairListItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onPress: PropTypes.func,
  verticalPadding: PropTypes.number,
  placeholder: PropTypes.string,
};

export default PairListItem;
