import {Types} from '../actions/pickup';
import {consts} from '../../assets/values';

const initialState = {
  scans: [],
};

export default pickupReducer = (state = initialState, action) => {
  switch (action.type) {
    case Types.SET_SCANS:
      return {
        ...state,
        scans: action.data.scans,
      };
    case Types.CLEAR_SCANS:
      return {
        ...state,
        scans: [],
      };
    default:
      return state;
  }
};
