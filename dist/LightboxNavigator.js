Object.defineProperty(exports,"__esModule",{value:true});var _jsxFileName='src/LightboxNavigator.js';

var _react=require('react');var _react2=_interopRequireDefault(_react);
var _reactNavigation=require('react-navigation');
var _reactNative=require('react-native');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _objectWithoutProperties(obj,keys){var target={};for(var i in obj){if(keys.indexOf(i)>=0)continue;if(!Object.prototype.hasOwnProperty.call(obj,i))continue;target[i]=obj[i];}return target;}

var LightboxNavigator=function LightboxNavigator(
routeConfigs)

{var tabsConfig=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};
var router=(0,_reactNavigation.TabRouter)(routeConfigs,tabsConfig);

var navigator=(0,_reactNavigation.createNavigator)(
router,
routeConfigs,
tabsConfig,
'react-navigation/STACK')(
function(_ref){var navigation=_ref.navigation,props=_objectWithoutProperties(_ref,['navigation']);var
state=navigation.state,dispatch=navigation.dispatch;var
routes=state.routes,index=state.index;


var Component=routeConfigs[tabsConfig.initialRouteName].screen;
var Popup=index?routeConfigs[routes[index].routeName].screen:null;

return _react2.default.createElement(_reactNative.View,{style:{flex:1},__source:{fileName:_jsxFileName,lineNumber:26}},
_react2.default.createElement(Component,{navigation:{dispatch:dispatch,state:routes[0]},__source:{fileName:_jsxFileName,lineNumber:27}}),
Popup&&_react2.default.createElement(Popup,{navigation:{dispatch:dispatch,state:routes[index]},__source:{fileName:_jsxFileName,lineNumber:28}}));

});

return(0,_reactNavigation.createNavigationContainer)(navigator,tabsConfig.containerOptions);
};exports.default=

LightboxNavigator;