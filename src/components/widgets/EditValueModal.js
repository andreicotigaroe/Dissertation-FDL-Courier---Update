import React, {useState, useEffect, useCallback} from 'react';
import {Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';

import { AppColors } from '~/assets/styles';
import SubmitButton from '../screens/common/SubmitButton';

const EditValueModal = props => {
  const [inputValue, setInputValue] = useState(props.defaultValue);
  const {submitting, onOk, onCancel, visible, backdrop} = props;

  const onPressOk = () => {
    if (onOk) onOk(inputValue);
  };

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
                <TextInput
                  style={styles.textInput}
                  autoCapitalize="none"
                  placeholder="Enter here"
                  value={inputValue}
                  // editable={!submitting}
                  onChangeText={setInputValue}
                />
              </View>
              <View style={{alignSelf: 'stretch', marginTop: 20}}>
                <SubmitButton
                  style={{height: 40}}
                  caption={'OK'}
                  submitting={submitting}
                  disabled={submitting}
                  onPress={onPressOk}
                />
              </View>
              {/* <View style={{alignSelf: 'stretch', marginTop: 10}}>
                  <SubmitButton
                    height={40}
                    caption={'CANCEL'}
                    gradientColors={['#e4e5e1', '#cececb']}
                    captionColor={Colors.TEXT}
                    onPress={() => {}}
                  />
                </View> */}
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
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
    width: '70%',
  },
  textInput: {
    borderBottomColor: AppColors.grey3,
    borderBottomWidth: 1,
    textAlign: 'center',
  },
});

export default EditValueModal;
