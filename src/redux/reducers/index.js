import {combineReducers} from 'redux';
import {createNavigationReducer} from 'react-navigation-redux-helpers';
import {RootNavigator} from '../../components/Navigation';
import authReducer from '../reducers/auth';
import routeReducer from '../reducers/route';
import pickupReducer from '../reducers/pickup';

const navReducer = createNavigationReducer(RootNavigator);

// combine reducers to build the state
const mainReducer = combineReducers({
  nav: navReducer,
  auth: authReducer,
  route: routeReducer,
  pickup: pickupReducer,
});

// const rootReducer = (state, action) => {
//     if (action.type === LOG_OUT) {
//         state = undefined;
//     }

//     return appReducer(state, action);
// };

export default mainReducer;
