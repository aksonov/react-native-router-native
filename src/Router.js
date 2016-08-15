/**
 * Copyright (c) 2015-present, Pavel Aksonov
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import Controllers from 'react-native-ios-controllers';
const {Modal} = Controllers;
import {assert} from './Util';
const React = Controllers.hijackReact();
import {AppRegistry, NativeModules, NativeEventEmitter} from 'react-native';
const {
  ControllerRegistry,
  TabBarControllerIOS,
  NavigationControllerIOS,
  ViewControllerIOS,
  DrawerControllerIOS,
  CubeBarControllerIOS,
} = React;
const eventEmitter = new NativeEventEmitter(NativeModules.RCCEventEmitter);

import Actions, { ActionMap } from './Actions';
import * as ActionConst from './ActionConst';

function registerListener(scene){
  const id = scene.key;
  if (scene.state) {
    scene.state.listener = {
      onEnter: (props) => {
        //console.log("RUN ACTION ",id);
        Actions[id](props);
        //InteractionManager.runAfterInteractions(()=>Actions[root.key](props));
      },
      onExit: (props) => {
        //console.log("RUN POP?");
        ///Actions.pop();
      }
    };
  } else {
    //console.log(`Scene ${scene.key} doesn't have state`)
  }
}

function registerButtons(scene, parent){
  if (scene.modal && !scene.onLeft && !scene.leftButton){
    scene.onLeft = ()=>Actions.pop();
  }
  if (scene.modal && !scene.leftTitle && !scene.leftButton){
    scene.leftTitle = 'Cancel';
  }
  if (!scene.rightButtons && scene.onRight){
    scene.rightButtons = [{title:scene.rightTitle, onPress:scene.onRight || scene.component.onRight}];
  }
  if (!scene.rightButtons && scene.rightButton){
    scene.rightButtons = [scene.rightButton];
  }
  if (!scene.rightButtons && parent.rightButtons){
    scene.rightButtons = parent.rightButtons;
  }
  if (!scene.leftButtons && scene.onLeft){
    scene.leftButtons = [{title:scene.leftTitle, onPress:scene.onLeft || scene.component.onLeft}];
  }
  if (!scene.leftButtons && scene.leftButton){
    scene.leftButtons = [scene.leftButton];
  }
  if (!scene.leftButtons && parent.leftButtons){
    scene.leftButtons = parent.leftButtons;
  }
}

function createStyles(scene, parent = {}) {
  const styles = {...parent.style, ...scene.style};
  if (scene.hideNavBar) {
    styles.navBarHidden = true;
  }
  if (scene.navTransparent){
    styles.drawUnderNavBar = true;
    styles.navBarTranslucent = true;
    styles.navBarTransparent = true;
  }
  if (scene.hideTabBar){
    styles.tabBarHidden = true;
  }
  return styles;
}

function registerComponent(scene){
  for (let value of ['component', 'componentRight', 'componentLeft']){
    if (scene[value]){
      const comp = scene[value];
      AppRegistry.registerComponent(scene.key+value, ()=>comp);
      scene[value] = scene.key+value;
    }
  }
}
function findRoot(scenes, key, parent = {}, index){
  console.log('findRoot', key);
  const id = key;
  const scene = scenes[key];
  let component = scene.component;
  scene.index = index;
  
  registerListener(scene);
  registerButtons(scene, parent);
  registerComponent(scene);
  
  const styles = createStyles(scene, parent);
  if (scene.tabs){
    if (scene.cube){
      scene.ref = Controllers.CubeBarControllerIOS(id);
      return <CubeBarControllerIOS id={id} {...scene} style={styles}>
        {scene.children.map((el,i)=><CubeBarControllerIOS.Item>
          {findRoot(scenes, el, scene,i)}
        </CubeBarControllerIOS.Item>)}
      </CubeBarControllerIOS>
    } else {
      scene.ref = Controllers.TabBarControllerIOS(id);
      return <TabBarControllerIOS id={id} {...scene} style={styles}>
        {scene.children
          .map((el,i)=>findRoot(scenes, el,  scene,i))
          .filter(el=>el)
          .map(el=><TabBarControllerIOS.Item>{el}</TabBarControllerIOS.Item>)}
      </TabBarControllerIOS>
    }
  } else {
    if (scene.subStates){
      scene.subStates.forEach(el => {
        registerListener(scenes[el]);
        registerButtons(scenes[el], scene);
      });
    }
    if (scene.component){
      const props = {...scene};
      delete props.state;
      if (props.modal){
        scene.ref = Controllers.NavigationControllerIOS(id);
        ControllerRegistry.registerController(id, ()=>Controllers.createClass({render(){
          return <NavigationControllerIOS id={id} {...props} passProps={props} style={styles} />}
        }));
        return null;
      }
      if (props.lightbox) {
        return null;
      }
      scene.ref = Controllers.ViewControllerIOS(id);
      return <ViewControllerIOS id={id} {...props} passProps={props} style={styles} />;
    } else {
      if (scene.drawer){
        scene.ref = Controllers.DrawerControllerIOS(id);
        return <DrawerControllerIOS animationType='slide' id={scene.key} {...scene} type="MMDrawer">
          {findRoot(scenes, scene.children[0],  scene)}
        </DrawerControllerIOS>;
      } else {
        scene.ref = Controllers.NavigationControllerIOS(id);
        const props = {...scene};
        return <NavigationControllerIOS id={id} {...props}>
          {scene.children.map((el,i)=>findRoot(scenes, el, scene,i))}
        </NavigationControllerIOS>;
      }
    }
  }
}
function actionCallbackCreate(scenes) {
  const stack = [];
  return (props = {}) => {
    let id = props.key;
    if (!id && stack.length){
      id = stack[stack.length-1].key;
    }
    const scene = scenes[id] || {};
    console.log("ACTION:", props);
    if (Actions.isTransition && scene.drawerDisableSwipe) {
      console.log("CANCELLED");
      return;
    }
    const parent = scenes[scene.parent || scene.base];
    const {component, state, style, ref, rightButtons = [], leftButtons = [], ...sceneProps} = scene;
    const newProps = {...sceneProps, ...props};
    const styles = createStyles(newProps);
    if (props.type === ActionConst.BACK_ACTION || props.type === ActionConst.BACK){
      if (stack.length){
        const prevScene = stack.pop();
        if (prevScene.lightbox){
          Modal.dismissLightBox();
        } else if (prevScene.modal){
          Modal.dismissController(prevScene.animationType);
        } else if (prevScene.parent && scenes[prevScene.parent].ref && scenes[prevScene.parent].ref.pop){
          scenes[prevScene.parent].ref.pop({animated: prevScene.animated === undefined ? true : prevScene.animated});
        }
      } else {
        console.log("CANNOT POP, empty stack!");
      }
    } else if (props.type === ActionConst.REFRESH) {
      const obj = ref || scenes[scene.base].ref;
      //console.log("REFRESH", props);
      if (obj.setStyle && Object.keys(styles).length) {
        obj.setStyle(styles);
      }
      if (obj.refresh) {
        console.log("OBJ REFRESH")
        obj.refresh(newProps);
      }
      
      if (obj.setRightButtons) {
        obj.setRightButtons([...rightButtons]);
      }
      if (obj.setLeftButtons) {
        obj.setLeftButtons([...leftButtons]);
      }
    } else if (props.type === ActionConst.PUSH && !scene.modal && !scene.lightbox) {
      stack.push(scene);
      //console.log("PUSH PROPS", scenes[scene.parent].ref, props);
        scenes[scene.parent].ref.push({id: scene.key, passProps: {...sceneProps, ...props}});
    } else if (scene.modal) {
      stack.push(scene);
      console.log("MODAL!", scene.key);
      Modal.showController(scene.key, scene.animationType);
    } else if (scene.lightbox) {
      stack.push(scene);
      console.log("LIGHTBOX!", scene.key);
      Modal.showLightBox({style: {
        backgroundBlur: "dark"}, ...scene});
    } else if (parent && parent.tabs) {
      if (parent.cube) {
        console.log("SWITCH CUBE", scene.index);
        parent.ref.switchTo({tabIndex: scene.index});
      } else {
        console.log("SWITCH TAB", scene.index);
        parent.ref.switchTo({tabIndex: scene.index});
      }
    }
  }
}

function createRouter(scenes, props){
  const {wrapBy, createReducer, reducer} = props;
  assert(scenes, "No root scene is defined");
  assert(scenes.key, "No root scene key is defined");
  const scenesMap = Actions.create(scenes, wrapBy);
  
  //console.log("SCENES:", Object.keys(Actions));
  const root = findRoot(scenesMap, scenes.key);
  Actions.get = id=>scenesMap[id];
  Actions.callback = actionCallbackCreate(scenesMap);
  eventEmitter.addListener('WillPop', (data) => {Actions.pop(); props.onPop && props.onPop(data)});
  eventEmitter.addListener('WillTransition', () => Actions.isTransition = true);
  eventEmitter.addListener('DidTransition', () => Actions.isTransition = false);
  return Controllers.createClass({
    render(){
      return root;
    }
  })
}
export default (scenes, props = {}) => {
  ControllerRegistry.registerController('Router', ()=>createRouter(scenes, props));
  ControllerRegistry.setRootController('Router', 'none', props);
};
