import Config from "react-native-config";

export const Types = {
  SET_SCANS: 'PICKUP_SET_SCANS',
  CLEAR_SCANS: 'PICKUP_CLEAR_SCANS'
};

export const setPickupScans = (scans) => ({
  type: Types.SET_SCANS,
  data: {
    scans,
  },
});

export const clearPickupScans = () => ({
  type: Types.CLEAR_SCANS,
});
