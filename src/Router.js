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
import createState from './State';
import createReducer, {getCurrent} from './Reducer';
import * as ActionConst from './ActionConst';

function registerListener(scene){
  const id = scene.key;
  if (scene.state) {
    scene.state.listener = {
      onEnter: (props) => {
        console.log("RUN ACTION ",id);
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

function registerButtons(scene, parent = {}){
  if (scene.modal && !scene.leftTitle && !scene.leftButton){
    scene.leftButton = {title: 'Cancel', textColor: parent.style && parent.style.navBarCancelColor, onPress: ()=>Actions.pop()};
  }
  if (!scene.rightButtons && scene.onRight){
    if (scene.rightTitle){
      scene.rightButtons = [{title:scene.rightTitle, onPress:scene.onRight || scene.component.onRight}];
    } else {
      scene.rightButtons = [{icon:scene.rightButtonImage, onPress:scene.onRight || scene.component.onRight}];
    }
  }
  if (!scene.rightButtons && scene.rightButton){
    scene.rightButtons = [scene.rightButton];
  }
  if (!scene.rightButtons && parent.rightButtons){
    scene.rightButtons = parent.rightButtons;
  }
  if (!scene.leftButtons && scene.onLeft){
    if (scene.leftTitle){
      scene.leftButtons = [{title:scene.leftTitle, onPress:scene.onLeft || scene.component.onLeft}];
    } else {
      scene.leftButtons = [{icon:scene.leftButtonImage, onPress:scene.onLeft || scene.component.onLeft}];
    }
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
  if (scene.hideNavBar === false) {
    styles.navBarHidden = false;
  }
  if (scene.navTransparent){
    styles.drawUnderNavBar = true;
    styles.navBarTranslucent = true;
    styles.navBarTransparent = true;
  }
  if (scene.navTransparent === false){
    styles.drawUnderNavBar = false;
    styles.navBarTranslucent = false;
    styles.navBarTransparent = false;
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

function clone(obj) {
  if(obj == null || typeof(obj) != 'object') {
    return obj;
  }
  
  var temp = new obj.constructor();
  
  for(var key in obj) {
      
    if (obj.hasOwnProperty(key)) {
      if (key != 'state') {
        temp[key] = clone(obj[key]);
      }
    }
  }
  
  return temp;
}
function findRoot(scenes, key, parent = {}, index){
  const id = key;
  const scene = scenes[key];
  let component = scene.component;
  scene.index = index;
  
  registerListener(scene);
  registerButtons(scene, parent);
  registerComponent(scene);
  
  const styles = createStyles(scene, parent);
  if (scene.modal){
    scene.style = styles;
  }
  if (scene.tabs){
    if (scene.cube){
      scene.ref = Controllers.CubeBarControllerIOS(id);
      return <CubeBarControllerIOS id={id} {...clone(scene)} style={styles}>
        {scene.children
          .map((el,i)=>{
            const res = findRoot(scenes, el,  scene, i);
            return res && !scenes[el].clone && <CubeBarControllerIOS.Item {...scenes[el]}>{res}</CubeBarControllerIOS.Item>;
          }).filter(el=>el)}
      </CubeBarControllerIOS>
    } else {
      scene.ref = Controllers.TabBarControllerIOS(id);
      return <TabBarControllerIOS id={id} {...clone(scene)} style={styles}>
        {scene.children
          .map((el,i)=>{
            const res = findRoot(scenes, el,  scene, i);
            return res && !scenes[el].clone && <TabBarControllerIOS.Item {...scenes[el]}>{res}</TabBarControllerIOS.Item>;
          }).filter(el=>el)}
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
      let props = {...scene};
      delete props.state;
      if (props.modal){
        scene.ref = Controllers.NavigationControllerIOS(id);
        ControllerRegistry.registerController(id, ()=>Controllers.createClass({render(){
          const currentStyles = {...scenes[id].style, navBarHidden: false};
          console.log("MODAL STYLES:", currentStyles);
          return <NavigationControllerIOS id={id} {...clone(props)} passProps={props} style={currentStyles} />}
        }));
        return null;
      }
      if (props.lightbox) {
        return null;
      }
      if (props.clone) {
        return null;
      }
      scene.ref = Controllers.ViewControllerIOS(id);
      return <ViewControllerIOS id={id} {...clone(props)} passProps={props} style={styles} />;
    } else {
      if (scene.drawer){
        scene.ref = Controllers.DrawerControllerIOS(id);
        return <DrawerControllerIOS animationType='slide' id={scene.key} {...clone(scene)} type="MMDrawer">
          {findRoot(scenes, scene.children[0],  scene, undefined)}
        </DrawerControllerIOS>;
      } else {
        scene.ref = Controllers.NavigationControllerIOS(id);
        const props = {...scene};
        const children = scene.children;
        // empty left buttons for all children
        scene.children.forEach((el,i)=>{
          if (!scenes[el].modal && i){
            scenes[el].leftButtons = [];
          }
        });
        return <NavigationControllerIOS id={id} {...clone(props)} style={styles}>
          {children.map((el,i)=>findRoot(scenes, el, scene, i))}
        </NavigationControllerIOS>;
      }
    }
  }
}

function actionCallbackCreate(scenes) {
  let currentState = undefined;
  let nextState = undefined;
  let currentScene = undefined;
  const reducer = createReducer({initialState: createState(scenes), scenes});
  return (props = {}) => {
    currentState = nextState;
    let id = props.key;
    if (currentState){
      currentScene = getCurrent(currentState);
      console.log("CURRENT SCENE:", currentScene.sceneKey);
    }
    if (!id){
      id = currentScene.sceneKey;
    }
    const scene = scenes[id] || {};
    console.log("ACTION:", props);
    if (Actions.isTransition && scene.drawerDisableSwipe && !props.force) {
      console.log("CANCELLED", Actions.isTransition);
      return;
    }
    nextState = reducer(currentState, props);
    const parent = scenes[props.parent || scene.parent || scene.base];
    console.log("PARENT:", parent && parent.key);
    let {component, state, style, ref, rightButtons, leftButtons, ...sceneProps} = scene;
    const newProps = {...sceneProps, ...props};
    const styles = createStyles(newProps);
    if (props.type === ActionConst.BACK_ACTION || props.type === ActionConst.BACK){
      if (currentScene.lightbox){
        Modal.dismissLightBox();
      } else if (currentScene.modal){
        Modal.dismissController(currentScene.animationType);
      } else if (currentScene.parent && scenes[currentScene.parent].ref && scenes[currentScene.parent].ref.pop){
        if (currentScene.state){
          console.log("CALL POP FOR STATE", currentScene.sceneKey);
          currentScene.state.parent.pop();
        }
        scenes[currentScene.parent].ref.pop({animated: currentScene.animated === undefined ? true : currentScene.animated});
      }
    } else if (props.type === ActionConst.REFRESH) {
      const obj = ref || scenes[scene.base].ref;
      console.log("REFRESH", props, rightButtons, leftButtons);
      if (obj.setStyle && Object.keys(styles).length) {
        obj.setStyle({...styles});
        // check modal children
        if (scene.children){
          scene.children.forEach(el=>{
            if (scenes[el].modal){
              //console.log("REFRESH MODAL:", scenes[el].ref);
              const modalStyles = {...styles};
              delete modalStyles.hideNavBar;
              console.log("REFRESH MODAL:", {...modalStyles});
              scenes[el].ref.setStyle({...modalStyles});
              scenes[el].style = {...scenes[el].style, ...modalStyles};
            }
          })
        }
      }
      if (obj.setRightButtons && rightButtons) {
        obj.setRightButtons(clone(rightButtons));
      }
      if (obj.setLeftButtons && leftButtons) {
        obj.setLeftButtons(clone(leftButtons));
      }
      const refreshProps = clone(newProps);
      delete refreshProps.hideNavBar;
      delete refreshProps.key;
      delete refreshProps.name;
      delete refreshProps.base;
      delete refreshProps.parent;
      delete refreshProps.index;
      delete refreshProps.type;
      if (obj.refresh && Object.keys(refreshProps).length) {
        console.log("OBJ REFRESH", refreshProps)
        obj.refresh(refreshProps);
      }
    } else if (props.type === ActionConst.PUSH && !scene.modal && !scene.lightbox) {
      let parent = scenes[scene.parent]
      if (scene.clone){
        console.log("GET PARENT FOR CLONE", getCurrent(currentState).sceneKey);
        parent = scenes[getCurrent(currentState).parent];
        parent.ref.push({...scene, id: scene.key, passProps: {...sceneProps, ...props}});
      } else {
        console.log("PUSH PROPS", parent.ref, props);
        parent.ref.push({id: scene.key, passProps: {...sceneProps, ...props}});
      }
    } else if (scene.modal) {
      console.log("MODAL!", scene.key);
      Modal.showController(scene.key, scene.animationType);
    } else if (scene.lightbox) {
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
  const root = findRoot(scenesMap, scenes.key, undefined);
  Actions.get = id=>scenesMap[id];
  Actions.callback = actionCallbackCreate(scenesMap);
  eventEmitter.addListener('WillPop', (data) => {console.log("ONPOP");Actions.pop(); props.onPop && props.onPop(data)});
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
