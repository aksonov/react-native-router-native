# react-native-router-native
Easy native navigation with react-native-controllers (forked) and declarative RNRF syntax (react-native-router-flux) (iOS is supported at this time). Experimental!

## Why ?
Native iOS Navigation with declarative syntax. JS Navigation could be laggy and doesn't look as iOS native one.
Detailed motivation is explained here: https://github.com/aksonov/react-native-controllers

## Example
Check Example iOS project (it is simular to react-native-router-flux demo)
```
import React, {
  Component,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Launch from './components/Launch';
import Register from './components/Register';
import Login from './components/Login';
import TabView from './components/TabView';
import {
  Scene,
  Router,
} from 'react-native-router-native';
import Error from './components/Error';

Router(<Scene key="root" >
  <Scene key="launch" component={Launch} title="Launch" hideNavBar />
  <Scene key="register" component={Register} title="Register" />
  <Scene key="login" component={Login} title="Login" modal/>
  <Scene key="tabbar" drawer >
    <Scene key="main" tabs>
      <Scene
        key="tab1"
        title="Tab #1"
        style={{ navBarBackgroundColor: 'red' }}
        titleStyle={{ color: 'white' }}
      >
        <Scene
          key="tab1_1"
          component={TabView}
          title="Tab #1_1"
          onRight={() => alert('Right button')}
          rightTitle="Right"
        />
        <Scene
          key="tab1_2"
          component={TabView}
          title="Tab #1_2"
          titleStyle={{ color: 'black' }}
        />
      </Scene>
      <Scene key="tab2" initial title="Tab #2" >
        <Scene
          key="tab2_1"
          component={TabView}
          title="Tab #2_1"
          renderRightButton={() => <Right />}
        />
        <Scene
          key="tab2_2"
          component={TabView}
          title="Tab #2_2"
          hideBackImage
          onBack={() => alert('Left button!')}
          backTitle="Left"
        />
      </Scene>
      <Scene key="tab3" component={TabView} title="Tab #3"  />
      <Scene key="tab4" component={TabView} title="Tab #4" hideNavBar />
      <Scene key="tab5" component={TabView} title="Tab #5" hideTabBar />
    </Scene>
  </Scene>
  <Scene key="error" component={Error} lightbox/>
</Scene>);

```

## Installation
1. Run npm react-native-router-native --save
2. In Xcode, in Project Navigator (left pane), right-click on the Libraries > Add files to [project name] 
Add ./node_modules/react-native-ios-controllers/ios/ReactNativeControllers.xcodeproj (screenshots)
3. In Xcode, in Project Navigator (left pane), click on your project (top) and select the Build Phases tab (right pane) 
In the Link Binary With Libraries section add libReactNativeControllers.a (screenshots)
4. In Xcode, in Project Navigator (left pane), click on your project (top) and select the Build Settings tab (right pane) 
In the Header Search Paths section add $(SRCROOT)/../node_modules/react-native-ios-controllers/ios 
Make sure on the right to mark this new path recursive
