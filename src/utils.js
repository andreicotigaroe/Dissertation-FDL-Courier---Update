import { PermissionsAndroid } from 'react-native';
import {consts} from './assets/values';

export const decodeCoords = (t, e) => {
  for (
    var n,
      o,
      u = 0,
      l = 0,
      r = 0,
      d = [],
      h = 0,
      i = 0,
      a = null,
      c = Math.pow(10, e || 5);
    u < t.length;

  ) {
    (a = null), (h = 0), (i = 0);
    do (a = t.charCodeAt(u++) - 63), (i |= (31 & a) << h), (h += 5);
    while (a >= 32);
    (n = 1 & i ? ~(i >> 1) : i >> 1), (h = i = 0);
    do (a = t.charCodeAt(u++) - 63), (i |= (31 & a) << h), (h += 5);
    while (a >= 32);
    (o = 1 & i ? ~(i >> 1) : i >> 1),
      (l += n),
      (r += o),
      d.push([l / c, r / c]);
  }
  return (d = d.map(function (t) {
    return {
      latitude: t[0],
      longitude: t[1],
    };
  }));
};

export function distance(lat1, lon1, lat2, lon2, unit = 'K') {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == 'K') {
      dist = dist * 1.609344;
    }
    if (unit == 'N') {
      dist = dist * 0.8684;
    }
    return dist;
  }
}

export function isDelivery(stop) {
  return !(
    stop.type === consts.STOP_TYPES.PICKUP ||
    stop.type === consts.STOP_TYPES.RETURN
  );
}

export function calculate_age(dob) {
  var diff_ms = Date.now() - dob.getTime();
  var age_dt = new Date(diff_ms);

  return Math.abs(age_dt.getUTCFullYear() - 1970);
}

// Return 1 if a > b
// Return -1 if a < b
// Return 0 if a == b
export function compareVersions(a, b) {
  if (a === b) {
    return 0;
  }

  var a_components = a.split('.');
  var b_components = b.split('.');

  var len = Math.min(a_components.length, b_components.length);

  // loop while the components are equal
  for (var i = 0; i < len; i++) {
    // A bigger than B
    if (parseInt(a_components[i]) > parseInt(b_components[i])) {
      return 1;
    }

    // B bigger than A
    if (parseInt(a_components[i]) < parseInt(b_components[i])) {
      return -1;
    }
  }

  // If one's a prefix of the other, the longer one is greater.
  if (a_components.length > b_components.length) {
    return 1;
  }

  if (a_components.length < b_components.length) {
    return -1;
  }

  // Otherwise they are the same.
  return 0;
}

export function isDeliveryOrder(order) {
  return (
    order.status === consts.ORDER_STATUS.RECEIVED_AT_LAST_DEPOT ||
    order.status === consts.ORDER_STATUS.ROUTE_ASSIGNED_FOR_DELIVERY ||
    order.status === consts.ORDER_STATUS.DRIVER_ASSIGNED_FOR_DELIVERY ||
    order.status === consts.ORDER_STATUS.OUT_FOR_DELIVERY ||
    order.status === consts.ORDER_STATUS.DELIVERED ||
    order.status === consts.ORDER_STATUS.NOT_DELIVERED ||
    order.status === consts.ORDER_STATUS.PARTIALLY_DELIVERED
  );
}

export function isCollectionOrder(order) {
  return (
    order.status === consts.ORDER_STATUS.ROUTE_ASSIGNED_FOR_COLLECTION ||
    order.status === consts.ORDER_STATUS.DRIVER_ASSIGNED_FOR_COLLECTION ||
    order.status === consts.ORDER_STATUS.OUT_FOR_COLLECTION ||
    order.status === consts.ORDER_STATUS.COLLECTED ||
    order.status === consts.ORDER_STATUS.NOT_COLLECTED
  );
}

export function groupOrdersByContacts(orders) {
  const contactOrders = [];
  orders.forEach((order) => {
    if (isCollectionOrder(order)) {
      contacts = contactOrders.filter(
        (contact) =>
          contact.type === 'collection' &&
          contact.orders.filter(
            (_order) => _order.sender_email === order.sender_email,
          ).length > 0,
      );
      if (contacts.length > 0) {
        contacts[0].orders.push(order);
      } else {
        contactOrders.push({
          type: 'collection',
          contactName: order.sender_contact,
          email: order.sender_email,
          phoneNumber: order.sender_phone_number,
          companyName: order.sender_company_name,
          orders: [order],
        });
      }
    } else if (isDeliveryOrder(order)) {
      if (order.type === consts.ORDER_TYPE.DELIVERY) {
        contactOrders.push({
          type: 'delivery',
          order: order,
        });
      } else if (order.type === consts.ORDER_TYPE.RETURN) {
        contacts = contactOrders.filter(
          (contact) =>
            contact.type === 'return' &&
            contact.orders.filter(
              (_order) => _order.recipient_email === order.recipient_email,
            ).length > 0,
        );
        if (contacts.length > 0) {
          contacts[0].orders.push(order);
        } else {
          contactOrders.push({
            type: 'return',
            contactName: order.recipient_contact,
            email: order.recipient_email,
            phoneNumber: order.recipient_phone_number,
            companyName: order.recipient_company_name,
            orders: [order],
          });
        }
      }
    }
  });
  return contactOrders;
}

export function firstCharUppercase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function objectToQueryString(obj) {
  if (!obj) return '';

  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  return str.join('&');
}

export function getAddressObject(addressComponents) {
  var country = null;
  addressComponents.forEach((component) => {
    if (component.types.indexOf('country') !== -1) {
      country = component.short_name;
    }
  });

  var ShouldBeComponent = {
    home: ['street_number'],
    postal_code: ['postal_code'],
    street: ['street_address', 'route', 'neighborhood'],
    state: [
      'administrative_area_level_2',
      'administrative_area_level_1',
      'administrative_area_level_3',
      'administrative_area_level_4',
      'administrative_area_level_5',
    ],
    city: [
      'locality',
      'sublocality',
      'sublocality_level_1',
      'sublocality_level_2',
      'sublocality_level_3',
      'sublocality_level_4',
      'postal_town',
    ],
    country: ['country'],
  };

  let address = {
    home: '',
    postal_code: '',
    street: '',
    state: '',
    city: '',
    country: '',
  };
  addressComponents.forEach((component) => {
    for (let shouldBe in ShouldBeComponent) {
      if (ShouldBeComponent[shouldBe].indexOf(component.types[0]) !== -1) {
        if (shouldBe === 'country') address[shouldBe] = component.short_name;
        else address[shouldBe] = component.long_name;
      }
    }
  });
  return address;
}

export async function requestLocationPermission(onGranted) {
  console.log('Geolocation requested!');
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Access Required',
        message: 'This App needs to Access your location',
      },
    );
    console.log('Granted:', granted);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      if (onGranted) onGranted();
    } else {
      console.log('Permission Denied');
    }
  } catch (err) {
    console.log('Geolocation Error: ', err);
  }
}

export function formatStopAddress(stop) {
  return `${stop.address.address1}${stop.address.address2 ? ", " + stop.address.address2: ""}, ${stop.address.city}, ${stop.address.postcode}`;
}