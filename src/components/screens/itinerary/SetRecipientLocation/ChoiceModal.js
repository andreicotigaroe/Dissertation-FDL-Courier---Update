import React, {useState, useEffect, useCallback} from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {AppColors} from '~/assets/styles';
import { consts } from '~/assets/values';
import ListItem from '~/components/widgets/ListItem';
import SubmitButton from '../../common/SubmitButton';

const ChoiceModal = (props) => {
  const {submitting, onOk, onCancel, visible, backdrop} = props;

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        if (submitting) return;
        if (onCancel) onCancel();
      }}>
      <TouchableWithoutFeedback
        onPress={() => {
          if (backdrop) onCancel();
        }}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalView}>
              <View style={{alignSelf: 'stretch'}}>
                <ListItem
                  title={'I can deliver today'}
                  titleColor={AppColors.text}
                  renderIndicator={false}
                  renderArrow={false}
                  onPress={() => onOk('can_deliver')}
                />
                <ListItem
                  title={'I cannot deliver today, can deliver tomorrow'}
                  titleColor={AppColors.danger}
                  renderIndicator={false}
                  renderArrow={false}
                  onPress={() => onOk('cannot_deliver')}
                />
                <ListItem
                  title={'This is out of delivery area'}
                  titleColor={AppColors.danger}
                  renderIndicator={false}
                  renderArrow={false}
                  onPress={() => onOk('out_of_delivery_area')}
                />
              </View>
              <View style={{alignSelf: 'stretch', padding: 10}}>
                <SubmitButton
                  height={40}
                  caption={'CANCEL'}
                  gradientColors={['#e4e5e1', '#cececb']}
                  captionColor={AppColors.text}
                  onPress={() => {
                    if (onCancel) onCancel();
                  }}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000080',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    width: '80%',
    padding: 2,
    backgroundColor: AppColors.mainBackground,
    overflow: 'hidden',
  },
  textInput: {
    borderBottomColor: AppColors.grey3,
    borderBottomWidth: 1,
    textAlign: 'center',
  },
});

export default ChoiceModal;
