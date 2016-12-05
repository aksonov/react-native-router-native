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

function merge(target, source) {
  
  /* Merges two (or more) objects,
   giving the last one precedence */
  
  if ( typeof target !== 'object' ) {
    target = {};
  }
  
  for (var property in source) {
    
    if ( source.hasOwnProperty(property) ) {
      
      var sourceProperty = source[ property ];
      
      if ( typeof sourceProperty === 'object' ) {
        target[ property ] =merge( target[ property ], sourceProperty );
        continue;
      }
      
      target[ property ] = sourceProperty;
      
    }
    
  }
  
  for (var a = 2, l = arguments.length; a < l; a++) {
    merge(target, arguments[a]);
  }
  
  return target;
}

function registerButtons(scene, parent = {}){
  if (scene.modal && !scene.leftTitle && !scene.leftButton){
    const styles = clone({...parent.style, ...scene.style});
    scene.leftButton = {title: 'Cancel', fontFamily:styles.navBarFontFamily, textColor: styles.navBarCancelColor, onPress: ()=>Actions.pop()};
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
  delete scene.leftButton;
  delete scene.rightButton;
  delete scene.onRight;
  delete scene.onLeft;
  delete scene.rightTitle;
  delete scene.leftTitle;
  delete scene.rightButtonImage;
  delete scene.leftButtonImage;
}

function createStyles(scene, parent = {}) {
  const styles = clone({...parent.style, ...scene.style});
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
  if (Array.isArray(obj)){
    return obj.map(x=>clone(x));
  }
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
            return res && !scenes[el].clone && <CubeBarControllerIOS.Item {...clone(scenes[el])}>{res}</CubeBarControllerIOS.Item>;
          }).filter(el=>el)}
      </CubeBarControllerIOS>
    } else {
      scene.ref = Controllers.TabBarControllerIOS(id);
      return <TabBarControllerIOS id={id} {...clone(scene)} style={styles}>
        {scene.children
          .map((el,i)=>{
            const res = findRoot(scenes, el,  scene, i);
            return res && !scenes[el].clone && <TabBarControllerIOS.Item {...clone(scenes[el])}>{res}</TabBarControllerIOS.Item>;
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
          return <NavigationControllerIOS id={id} {...clone(props)} passProps={clone(props)} style={currentStyles} />}
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
      return <ViewControllerIOS id={id} {...clone(props)} passProps={clone(props)} style={styles} />;
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
          if (!scenes[el].modal && i && !(scenes[el].type === 'reset')){
            scenes[el].leftButtons = [];
          }
        });
        const res = <NavigationControllerIOS id={id} {...clone(props)} style={styles}>
          {children.map((el,i)=>findRoot(scenes, el, scene, i))}
        </NavigationControllerIOS>;
        
        if (scene.modal){
          ControllerRegistry.registerController(id, ()=>Controllers.createClass({render(){
            return res
          
          }
          }));
          return null;
        }
        return res;
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
    if (!currentState) {
      currentState = reducer(null, {});
    }
    let id = props.key;
    currentScene = getCurrent(currentState);
    if (!id){
      id = currentScene.sceneKey;
    }
    const scene = scenes[id] || {};
    console.log("ACTION:", props, "CURRENT SCENE:", id, scene.ref);
    if (Actions.isTransition && scene.drawerDisableSwipe && !props.force) {
      console.log("CANCELLED", Actions.isTransition);
      return;
    }
    nextState = reducer(currentState, props);
    const parent = scenes[props.parent || scene.parent || scene.base];
    //console.log("PARENT:", parent && parent.key);
    let {component, state, style, ref, rightButtons, leftButtons, ...sceneProps} = scene;
    if (!leftButtons) {
      leftButtons = [];
    }
    if (!rightButtons) {
      rightButtons = [];
    }
    const newProps = {...sceneProps, ...props};
    const styles = createStyles(newProps);
    if (props.type === ActionConst.BACK_ACTION || props.type === ActionConst.BACK){
      if (currentScene.lightbox){
        Modal.dismissLightBox();
      } else if (currentScene.modal){
        Modal.dismissController(currentScene.animationType);
      } else if (currentScene.parent && scenes[currentScene.parent].ref && scenes[currentScene.parent].ref.pop){
        if (currentScene.state){
          console.log("CALL POP FOR STATE", currentScene.sceneKey, currentScene.parent);
          currentScene.state.parent.pop();
        }
        if (scenes[currentScene.parent].modal && (scenes[currentScene.parent].children.indexOf(currentScene.sceneKey) === 0 || currentScene.type === 'reset')) {
          Modal.dismissController(scenes[currentScene.parent].animationType);
        } else {
          if (!props.alreadyPop){
            console.log("DO POP", props.alreadyPop, props.animated);
            let animated = props.animated;
            if (animated === undefined) {
              animated = currentScene.animated;
            }
            scenes[currentScene.parent].ref.pop({animated: animated === undefined ? true : animated});
          }
        }
      }
    } else if (props.type === ActionConst.REFRESH) {
      let obj = ref || scenes[scene.base || scene.parent].ref;
      if (scene.clone){
        const current = getCurrent(currentState);
        const cloneParent = scenes[current.modal ? current.sceneKey : current.parent];
        console.log("GET PARENT FOR CLONE", current.sceneKey, cloneParent.key);
        obj = cloneParent.ref;
      }
      if (obj.setStyle && Object.keys(styles).length) {
        //obj.setStyle(clone(styles));
        // check modal children
        if (scene.children){
          scene.children.forEach(el=>{
            if (scenes[el].modal){
              //console.log("REFRESH MODAL:", scenes[el].ref);
              const modalStyles = {...styles};
              delete modalStyles.hideNavBar;
              //console.log("REFRESH MODAL:", {...modalStyles});
              scenes[el].ref.setStyle({...modalStyles});
              scenes[el].style = {...scenes[el].style, ...modalStyles};
            }
          })
        }
      }
      let refreshProps = clone(newProps);
      registerButtons(refreshProps);
      refreshProps = merge(clone({leftButtons, rightButtons}), refreshProps);
      console.log("REFRESH", obj, refreshProps.rightButtons, refreshProps.leftButtons, leftButtons);
      if (scene.unsubscribes){
        scene.unsubscribes.forEach(unsubscribe=>unsubscribe());
      }
      scene.unsubscribes = [];
      if (obj.setRightButtons && refreshProps.rightButtons) {
        //console.log("SETRIGHTBUTTONS");
        scene.unsubscribes.push(obj.setRightButtons(clone(refreshProps.rightButtons)));
      }
      if (obj.setLeftButtons && refreshProps.leftButtons) {
        //console.log("SETLEFTBUTTONS",scene.leftButtons, JSON.stringify(refreshProps.leftButtons));
        scene.unsubscribes.push(obj.setLeftButtons(clone(refreshProps.leftButtons)));
      }
      delete refreshProps.hideNavBar;
      delete refreshProps.hideTabBar;
      delete refreshProps.key;
      delete refreshProps.unsubscribes;
      delete refreshProps.sceneKey;
      delete refreshProps.name;
      delete refreshProps.children;
      delete refreshProps.tabs;
      delete refreshProps.base;
      delete refreshProps.parent;
      delete refreshProps.index;
      delete refreshProps.type;
      delete refreshProps.rightButtons;
      delete refreshProps.leftButtons;
      if (obj.refresh && Object.keys(refreshProps).length) {
        //console.log("OBJ REFRESH", refreshProps)
        obj.refresh(refreshProps);
      }
    } else if (props.type === ActionConst.PUSH && !scene.modal && !scene.lightbox) {
      if (currentScene && getCurrent(nextState).sceneKey === currentScene.sceneKey){
        //console.log("IGNORE PUSH ACTION BECAUSE OF THE SAME SCENE");
        nextState = currentState;
        return;
      }
      let parent = scenes[scene.parent]
      if (scene.clone){
        //console.log("getCurrent for clone");
        const current = getCurrent(currentState);
        parent = scenes[current.modal ? current.sceneKey : current.parent];
        //console.log("GET PARENT FOR CLONE", current.sceneKey, parent.key, sceneProps);
        const passProps = {...sceneProps, ...props};
        parent.ref.push({...scene, id: scene.key, passProps, title:passProps.title, style: styles});
      } else {
        if (parent){
          //console.log("PUSH PROPS", parent.ref, props);
          parent.ref.push({id: scene.key, passProps: {...sceneProps, ...props}, style: styles});
        }
      }
    } else if (props.type === 'reset') {
      //console.log("RESET ACTION!", scene.key, scene.leftButtons, sceneProps.leftButtons);
      parent.ref.resetTo(clone({...scene, id: scene.key, passProps: {...sceneProps, ...props}, style: styles}));
    } else if (scene.modal) {
      Modal.showController(scene.key, scene.animationType, {...sceneProps, ...props, style: styles});
    } else if (scene.lightbox) {
      Modal.showLightBox({passProps: {...sceneProps, ...props}, style: {
        backgroundBlur: "dark"}, ...scene});
    } else if (parent && parent.tabs) {
      if (parent.cube) {
        //console.log("SWITCH CUBE", scene.index);
        parent.ref.switchTo({tabIndex: scene.index});
      } else {
        //console.log("SWITCH TAB", scene.index);
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
  eventEmitter.addListener('WillPop', (data) => {console.log("ONPOP");Actions.pop({alreadyPop: true}); props.onPop && props.onPop(data)});
  eventEmitter.addListener('WillTransition', (event) => {Actions.willTransition && Actions.willTransition(event);Actions.isTransition = true});
  eventEmitter.addListener('DidTransition', () => {Actions.didTransition && Actions.didTransition();Actions.isTransition = false});
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
