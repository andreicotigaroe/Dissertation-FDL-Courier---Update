export const consts = {
  STOP_TYPES: {
    PICKUP: 'pickup', // Pickup from depot
    COLLECT: 'collect', // Pickup from customer Reserved: Future Use
    DELIVERY: 'delivery',
    RETURN: 'return',
    CUSTOMER: 'customer',
  },

  STOP_STATUS: {
    DEFAULT: 'default',
    IN_TRAVEL: 'in_travel',
    ARRIVED: 'arrived',
    FINISHED: 'finished',
  },

  COLLECTION_FAILURE_TYPES: {
    NONE: 'none',
    NO_CUSTOMER: 'no_customer',
    BUSINESS_CLOSED: 'business_closed',
    NO_PARCEL: 'no_parcel',
  },

  DELIVERY_FAILURE_TYPES: {
    NONE: 'none',
    NO_CUSTOMER: 'no_customer',
    REJECTED: 'rejected',
    SHOP_CLOSED: 'shop_closed',
    DAMAGED_IN_TRANSIT: 'damaged_in_transit',
    MISSING: 'missing',
    CANNOT_ACCESS: 'cannot_access',
    WRONG_ADDRESS: 'wrong_address',
    OUT_OF_DELIVERY_AREA: 'out_of_delivery_area'
  },

  ROUTE_STATUS: {
    CREATED: 'created',
    COLLECTED: 'collected',
    FINISHED: 'finished',
    DEBRIEF: 'debrief',
  },

  COLLECT_PLACE: {
    SENDER: 'sender',
  },

  LEAVE_PLACE: {
    CUSTOMER: 'customer',
    // For Business
    MAIL_ROOM: 'mail_room',
    RECEPTION: 'reception',
    SHOP_ASSISTANT: 'shop_assistant',
    // For Residential
    NEIGHBOR: 'neighbor',
    FRONT_PORCH: 'front_porch',
    REAR_PORCH: 'rear_porch',
    GARDEN: 'garden',
    BEHIND_WHEELIE_BIN: 'behind_wheelie_bin',
    SHED_GARDEN_HOUSE: 'shed_garden_house',
    LETTERBOX: 'letterbox',
  },

  PARCEL_STATE: {
    NOT_VERIFIED: 'not_verified',
    NORMAL: 'normal',
    DAMAGED_IN_UNLOADING: 'damaged_in_unloading',
    DAMAGED_IN_LOADING: 'damaged_in_loading',
    DAMAGED_IN_TRANSIT: 'damaged_in_transit',
    MISSING: 'missing',
    CUSTOMER_REFUSED: 'customer_refused',
    NOT_RECEIVED: 'not_received',
  },

  PARCEL_STATUS: {
    CREATED: 'created',
    COLLECTED_BY_DRIVER: 'collected_by_driver',
    RECEIVED_AT_COLLECTION_DEPOT: 'received_at_collection_depot',

    IN_TRANSIT_TO_SORTATION_DEPOT: 'in_transit_to_sortation_depot',
    RECEIVED_AT_SORTATION_DEPOT: 'received_at_sortation_depot',
    IN_TRANSIT_TO_DELIVERY_DEPOT: 'in_transit_to_delivery_depot',

    RECEIVED_AT_DEPOT: 'received_at_depot',
    IN_DELIVERY: 'in_delivery',
    DELIVERED: 'delivered',
    NOT_DELIVERED: 'not_delivered',
    ACCEPTED: 'accepted',
    RETURNED: 'returned',
    SENT_TO_SENDER: 'sent_to_sender',
    SENT_TO_NEW_ORDER: 'sent_to_new_order',
    KEEP_AT_DEPOT: 'keep_at_depot',
    DESTROYED: 'destroyed',
  },

  RECIPIENT_TYPE: {
    BUSINESS: 'business',
    RESIDENTIAL: 'residential',
  },

  ORDER_TYPE: {
    RETURN: 'return',
    DELIVERY: 'delivery',
  },

  ORDER_STATUS: {
    CREATED: 'created',

    ROUTE_ASSIGNED_FOR_COLLECTION: 'route_assigned_for_collection',
    DRIVER_ASSIGNED_FOR_COLLECTION: 'driver_assigned_for_collection',
    OUT_FOR_COLLECTION: 'out_for_collection',
    COLLECTED: 'collected',
    NOT_COLLECTED: 'not_collected',
    RECEIVED_AT_COLLECTION_DEPOT: 'received_at_collection_depot',

    IN_TRANSIT_TO_SORTATION_DEPOT: 'in_transit_to_sortation_depot',
    RECEIVED_AT_SORTATION_DEPOT: 'received_at_sortation_depot',
    IN_TRANSIT_TO_DELIVERY_DEPOT: 'in_transit_to_delivery_depot',

    RECEIVED_AT_LAST_DEPOT: 'received_at_last_depot',
    AWAITING_PICKUP_FOR_DELIVERY: 'awaiting_pickup_for_delivery',
    ROUTE_ASSIGNED_FOR_DELIVERY: 'route_assigned_for_delivery',
    DRIVER_ASSIGNED_FOR_DELIVERY: 'driver_assigned_for_delivery',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    PARTIALLY_DELIVERED: 'partially_delivered',
    NOT_DELIVERED: 'not_delivered',
    FINISHED: 'finished',
  },

  FINISH_WORK_PLACE: {
    DEPOT: 'depot',
    LAST_STOP: 'last_stop',
    OTHER_PLACE: 'other_place',
  },
};

export const LEAVE_PLACE_TITLE = {
  [consts.LEAVE_PLACE.CUSTOMER]: 'Customer',
  [consts.LEAVE_PLACE.NEIGHBOR]: 'Neighbor',
  [consts.LEAVE_PLACE.FRONT_PORCH]: 'Front Porch',
  [consts.LEAVE_PLACE.REAR_PORCH]: 'Rear Porch',
  [consts.LEAVE_PLACE.GARDEN]: 'Garden',
  [consts.LEAVE_PLACE.BEHIND_WHEELIE_BIN]: 'Behind Wheelie Bin',
  [consts.LEAVE_PLACE.SHED_GARDEN_HOUSE]: 'Shed/Garden House',
  [consts.LEAVE_PLACE.LETTERBOX]: 'Letterbox',
};
