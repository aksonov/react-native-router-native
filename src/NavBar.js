/**
 * Copyright (c) 2015, Facebook, Inc.  All rights reserved.
 *
 * Facebook, Inc. ("Facebook") owns all right, title and interest, including
 * all intellectual property and other proprietary rights, in and to the React
 * Native CustomComponents software (the "Software").  Subject to your
 * compliance with these terms, you are hereby granted a non-exclusive,
 * worldwide, royalty-free copyright license to (1) use and copy the Software;
 * and (2) reproduce and distribute the Software as part of your own software
 * ("Your Software").  Facebook reserves all rights not expressly granted to
 * you in this license agreement.
 *
 * THE SOFTWARE AND DOCUMENTATION, IF ANY, ARE PROVIDED "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES (INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE) ARE DISCLAIMED.
 * IN NO EVENT SHALL FACEBOOK OR ITS AFFILIATES, OFFICERS, DIRECTORS OR
 * EMPLOYEES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
import React, {
  PropTypes,
} from 'react';
import {
  Platform,
  Animated,
  I18nManager,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewPropTypes,
} from 'react-native';
import Actions from './navigationStore';
import _backButtonImage from '../images/back_chevron.png';
import _drawerImage from '../images/menu_burger.png';

export function renderBackButton(state) {
  const textButtonStyle = [
    styles.barBackButtonText,
    state.backButtonTextStyle,
  ];
  const style = [
    styles.backButton,
    state.leftButtonStyle,
  ];
  const buttonImage = state.backButtonImage || _backButtonImage;
  let onPress = state.onBack;
  if (onPress) {
    onPress = onPress.bind(null, state);
  } else {
    onPress = Actions.pop;
  }

  const text = state.backTitle ?
    (<Text style={textButtonStyle}>
      {state.backTitle}
    </Text>)
    : null;

  return (
    <TouchableOpacity
      testID="backNavButton"
      style={{position:'absolute',top:0,left:0,height:50,width:70}}
      onPress={onPress}
    >
      <View style={style}>
      {buttonImage && !state.hideBackImage &&
      <Image
        source={buttonImage}
        style={[
          styles.backButtonImage,
          state.barButtonIconStyle,
          state.leftButtonIconStyle,
        ]}
      />
      }
      {text}
      </View>
    </TouchableOpacity>
  );
}

export function renderLeftButton(state, wrapBy) {
  let onPress = state.onLeft;
  let buttonImage = state.leftButtonImage;
  let menuIcon = state.drawerIcon;
  const style = [styles.leftButton, state.leftButtonStyle];
  const textStyle = [styles.barLeftButtonText, state.leftButtonTextStyle];
  const leftButtonStyle = [styles.defaultImageStyle, state.leftButtonIconStyle];
  const leftTitle = state.getLeftTitle ? state.getLeftTitle(navProps) : state.leftTitle;

  if (state.leftButton) {
    let Button = state.leftButton;
    if (wrapBy) {
      Button = wrapBy(Button);
    }
    return (
      <Button
        {...state}
        key={'leftNavBarBtn'}
        testID="leftNavButton"
        style={[...style, ...leftButtonStyle]}
        textStyle={textStyle}
      />
    );
  }

  if (onPress && (leftTitle || buttonImage)) {
    onPress = onPress.bind(null, state);
    return (
      <TouchableOpacity
        key={'leftNavBarBtn'}
        testID="leftNavButton"
        style={style}
        onPress={onPress}
      >
        {leftTitle &&
        <Text style={textStyle}>
          {leftTitle}
        </Text>
        }
        {!leftTitle && buttonImage &&
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-start'}}>
          {menuIcon || <Image
            source={buttonImage}
            style={state.leftButtonIconStyle || styles.defaultImageStyle}
          />
          }
        </View>
        }
      </TouchableOpacity>
    );
  }
  if ((!!state.onLeft ^ !!(leftTitle || buttonImage))) {
    console.warn(
      `Both onLeft and leftTitle/leftButtonImage
            must be specified for the scene: ${state.name}`,
    );
  }
  return null;
}


export function renderRightButton(state, wrapBy) {
  const drawer = null;
  if (!state) {
    return null;
  }

  let onPress = state.onRight;
  let buttonImage = state.rightButtonImage;
  let menuIcon = state.drawerIcon;
  const style = [styles.rightButton, state.rightButtonStyle];
  const textStyle = [styles.barRightButtonText, state.rightButtonTextStyle];
  const rightButtonStyle = [styles.defaultImageStyle, state.rightButtonIconStyle];
  const rightTitle = state.getRightTitle ? state.getRightTitle(navProps) : state.rightTitle;

  if (state.rightButton) {
    let Button = state.rightButton;
    if (wrapBy) {
      Button = wrapBy(Button);
    }
    return (
      <Button
        {...state}
        key={'rightNavBarBtn'}
        testID="rightNavButton"
        style={style}
        textButtonStyle={textStyle}
      />
    );
  }

  if (!onPress && !!drawer && typeof drawer.toggle === 'function' && drawer.props.side === 'right') {
    buttonImage = state.drawerImage;
    if (buttonImage || menuIcon) {
      onPress = drawer.toggle;
    }
    if (!menuIcon) {
      menuIcon = (
        <Image
          source={buttonImage}
          style={rightButtonStyle}
        />
      );
    }
  }

  if (onPress && (rightTitle || buttonImage)) {
    onPress = onPress.bind(null, state);
    return (
      <TouchableOpacity
        key={'rightNavBarBtn'}
        testID="rightNavButton"
        style={style}
        onPress={onPress}
      >
        {rightTitle &&
        <Text style={textStyle}>
          {rightTitle}
        </Text>
        }
        {buttonImage &&
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end'}}>
          {menuIcon || <Image
            source={buttonImage}
            style={state.rightButtonIconStyle || styles.defaultImageStyle}
          />
          }
        </View>
        }
      </TouchableOpacity>
    );
  }
  if ((!!state.onRight ^ !!(typeof (rightTitle) !== 'undefined'
    || typeof (buttonImage) !== 'undefined'))) {
    console.warn(
      `Both onRight and rightTitle/rightButtonImage
            must be specified for the scene: ${state.name}`,
    );
  }
  return null;
}




const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    color: '#0A0A0A',
    fontSize: 18,
    width: 180,
    alignSelf: 'center',
  },
  titleImage: {
    width: 180,
    alignSelf: 'center',
  },
  titleWrapper: {
    marginTop: 10,
    position: 'absolute',
    ...Platform.select({
      ios: {
        top: 20,
      },
      android: {
        top: 5,
      },
      windows: {
        top: 5,
      },
    }),
    left: 0,
    right: 0,
  },
  header: {
    backgroundColor: '#EFEFF2',
    paddingTop: 0,
    top: 0,
    ...Platform.select({
      ios: {
        height: 64,
      },
      android: {
        height: 54,
      },
      windows: {
        height: 54,
      },
    }),
    right: 0,
    left: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: '#828287',
    position: 'absolute',
  },
  backButton: {
    position: 'absolute',
    ...Platform.select({
      ios: {
        top: 12,
      },
      android: {
        top: 10,
      },
      windows: {
        top: 8,
      },
    }),
    left: 2,
    paddingLeft: 8,
    flexDirection: 'row',
    transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
  },
  rightButton: {
    position: 'absolute',
    ...Platform.select({
      ios: {
        top: 12,
      },
      android: {
        top: 10,
      },
      windows: {
        top: 8,
      },
    }),
    right: 2,
    paddingRight: 8,
  },
  leftButton: {
    position: 'absolute',
    ...Platform.select({
      ios: {
        top: 12,
      },
      android: {
        top: 8,
      },
      windows: {
        top: 8,
      },
    }),
    left: 2,
    paddingLeft: 8,
  },
  barRightButtonText: {
    color: 'rgb(0, 122, 255)',
    textAlign: 'right',
    fontSize: 17,
  },
  barBackButtonText: {
    color: 'rgb(0, 122, 255)',
    textAlign: 'left',
    fontSize: 17,
    paddingLeft: 6,
  },
  barLeftButtonText: {
    color: 'rgb(0, 122, 255)',
    textAlign: 'left',
    fontSize: 17,
  },
  backButtonImage: {
    width: 13,
    height: 21,
  },
  defaultImageStyle: {
    height: 24,
    resizeMode: 'contain',
  },
});

const propTypes = {
  navigationState: PropTypes.object,
  backButtonImage: Image.propTypes.source,
  wrapBy: PropTypes.any,
  component: PropTypes.any,
  backButtonTextStyle: Text.propTypes.style,
  leftButtonStyle: ViewPropTypes.style,
  leftButtonIconStyle: Image.propTypes.style,
  getTitle: PropTypes.func,
  titleWrapperStyle: Text.propTypes.style,
  titleStyle: Text.propTypes.style,
  titleOpacity: PropTypes.number,
  titleProps: PropTypes.any,
  position: PropTypes.object,
  navigationBarStyle: ViewPropTypes.style,
  navigationBarBackgroundImage: Image.propTypes.source,
  navigationBarBackgroundImageStyle: Image.propTypes.style,
  navigationBarTitleImage: Image.propTypes.source,
  navigationBarTitleImageStyle: Image.propTypes.style,
  navigationBarShowImageSelection: PropTypes.bool,
  navigationBarSelecionStyle: ViewPropTypes.style,
  renderTitle: PropTypes.any,
};

const contextTypes = {
  drawer: PropTypes.object,
};

const defaultProps = {
  backButtonImage: _backButtonImage,
  titleOpacity: 1,
};

class NavBar extends React.Component {

  constructor(props) {
    super(props);

    this.renderRightButton = this.renderRightButton.bind(this);
    this.renderBackButton = this.renderBackButton.bind(this);
    this.renderLeftButton = this.renderLeftButton.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
    this.renderImageTitle = this.renderImageTitle.bind(this);
  }

  renderBackButton() {
    const state = this.props.navigation.state;
    const childState = state.children[state.index];
    const BackButton = (childState.component && childState.component.backButton) || state.backButton
      || childState.backButton;
    const textButtonStyle = [
      styles.barBackButtonText,
      this.props.backButtonTextStyle,
      state.backButtonTextStyle,
      childState.backButtonTextStyle,
    ];
    const style = [
      styles.backButton,
      this.props.leftButtonStyle,
      state.leftButtonStyle,
      childState.leftButtonStyle,
    ];

    if (state.index === 0 && (!state.parentIndex || state.parentIndex === 0)) {
      return null;
    }

    if (BackButton) {
      return (
        <BackButton
          testID="backNavButton"
          textButtonStyle={textButtonStyle}
          {...childState}
          style={style}
        />
      );
    }
    const buttonImage = childState.backButtonImage ||
      state.backButtonImage || this.props.backButtonImage;
    let onPress = childState.onBack || childState.component.onBack;
    if (onPress) {
      onPress = onPress.bind(null, state);
    } else {
      onPress = Actions.pop;
    }

    const text = childState.backTitle ?
      (<Text style={textButtonStyle}>
        {childState.backTitle}
      </Text>)
      : null;

    return (
      <TouchableOpacity
        testID="backNavButton"
        style={style}
        onPress={onPress}
      >
        {buttonImage && !childState.hideBackImage &&
          <Image
            source={buttonImage}
            style={[
              styles.backButtonImage,
              this.props.leftButtonIconStyle,
              state.barButtonIconStyle,
              state.leftButtonIconStyle,
              childState.leftButtonIconStyle,
            ]}
          />
        }
        {text}
      </TouchableOpacity>
    );
  }

  renderRightButton(navProps) {
    const self = this;
    const drawer = this.context.drawer;
    function tryRender(state, wrapBy) {
      if (!state) {
        return null;
      }

      let onPress = state.onRight;
      let buttonImage = state.rightButtonImage;
      let menuIcon = state.drawerIcon;
      const style = [styles.rightButton, self.props.rightButtonStyle, state.rightButtonStyle];
      const textStyle = [styles.barRightButtonText, self.props.rightButtonTextStyle,
        state.rightButtonTextStyle];
      const rightButtonStyle = [styles.defaultImageStyle, state.rightButtonIconStyle];
      const rightTitle = state.getRightTitle ? state.getRightTitle(navProps) : state.rightTitle;

      if (state.rightButton) {
        let Button = state.rightButton;
        if (wrapBy) {
          Button = wrapBy(Button);
        }
        return (
          <Button
            {...self.props}
            {...state}
            key={'rightNavBarBtn'}
            testID="rightNavButton"
            style={style}
            textButtonStyle={textStyle}
          />
        );
      }

      if (!onPress && !!drawer && typeof drawer.toggle === 'function' && drawer.props.side === 'right') {
        buttonImage = state.drawerImage;
        if (buttonImage || menuIcon) {
          onPress = drawer.toggle;
        }
        if (!menuIcon) {
          menuIcon = (
            <Image
              source={buttonImage}
              style={rightButtonStyle}
            />
          );
        }
      }

      if (onPress && (rightTitle || buttonImage)) {
        onPress = onPress.bind(null, state);
        return (
          <TouchableOpacity
            key={'rightNavBarBtn'}
            testID="rightNavButton"
            style={style}
            onPress={onPress}
          >
            {rightTitle &&
              <Text style={textStyle}>
                {rightTitle}
              </Text>
            }
            {buttonImage &&
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                {menuIcon || <Image
                  source={buttonImage}
                  style={state.rightButtonIconStyle || styles.defaultImageStyle}
                />
                }
              </View>
            }
          </TouchableOpacity>
        );
      }
      if ((!!state.onRight ^ !!(typeof (rightTitle) !== 'undefined'
        || typeof (buttonImage) !== 'undefined'))) {
        console.warn(
          `Both onRight and rightTitle/rightButtonImage
            must be specified for the scene: ${state.name}`,
        );
      }
      return null;
    }
    return tryRender(this.props.component, this.props.wrapBy) || tryRender(this.props);
  }

  renderLeftButton(navProps) {
    const self = this;
    const drawer = this.context.drawer;
    function tryRender(state, wrapBy) {
      let onPress = state.onLeft;
      let buttonImage = state.leftButtonImage;
      let menuIcon = state.drawerIcon;
      const style = [styles.leftButton, self.props.leftButtonStyle, state.leftButtonStyle];
      const textStyle = [styles.barLeftButtonText, self.props.leftButtonTextStyle,
        state.leftButtonTextStyle];
      const leftButtonStyle = [styles.defaultImageStyle, state.leftButtonIconStyle];
      const leftTitle = state.getLeftTitle ? state.getLeftTitle(navProps) : state.leftTitle;

      if (state.leftButton) {
        let Button = state.leftButton;
        if (wrapBy) {
          Button = wrapBy(Button);
        }
        return (
          <Button
            {...self.props}
            {...state}
            key={'leftNavBarBtn'}
            testID="leftNavButton"
            style={style}
            textStyle={textStyle}
          />
        );
      }

      if (!onPress && !!drawer && typeof drawer.toggle === 'function' && drawer.props.side === 'left') {
        buttonImage = state.drawerImage;
        if (buttonImage || menuIcon) {
          onPress = drawer.toggle;
        }
        if (!menuIcon) {
          menuIcon = (
            <Image
              source={buttonImage}
              style={leftButtonStyle}
            />
          );
        }
      }

      if (onPress && (leftTitle || buttonImage)) {
        onPress = onPress.bind(null, state);
        return (
          <TouchableOpacity
            key={'leftNavBarBtn'}
            testID="leftNavButton"
            style={style}
            onPress={onPress}
          >
            {leftTitle &&
              <Text style={textStyle}>
                {leftTitle}
              </Text>
            }
            {buttonImage &&
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                {menuIcon || <Image
                  source={buttonImage}
                  style={state.leftButtonIconStyle || styles.defaultImageStyle}
                />
                }
              </View>
            }
          </TouchableOpacity>
        );
      }
      if ((!!state.onLeft ^ !!(leftTitle || buttonImage))) {
        console.warn(
          `Both onLeft and leftTitle/leftButtonImage
            must be specified for the scene: ${state.name}`,
        );
      }
      return null;
    }
    return tryRender(this.props.component, this.props.wrapBy) || tryRender(this.props);
  }

  renderTitle(childState, index:number) {
    let title = this.props.getTitle ? this.props.getTitle(childState) : childState.title;
    if (title === undefined && childState.component && childState.component.title) {
      title = childState.component.title;
    }
    if (typeof (title) === 'function') {
      title = title(childState);
    }
    return (
      <Animated.View
        key={childState.key}
        style={[
          styles.titleWrapper,
          this.props.titleWrapperStyle,
        ]}
      >
        <Animated.Text
          lineBreakMode="tail"
          numberOfLines={1}
          {...this.props.titleProps}
          style={[
            styles.title,
            this.props.titleStyle,
            this.props.navigationState.titleStyle,
            childState.titleStyle,
            {
              opacity: this.props.position.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [0, this.props.titleOpacity, 0],
              }),
              left: this.props.position.interpolate({
                inputRange: [index - 1, index + 1],
                outputRange: [200, -200],
              }),
              right: this.props.position.interpolate({
                inputRange: [index - 1, index + 1],
                outputRange: [-200, 200],
              }),
            },
          ]}
        >
          {title}
        </Animated.Text>
      </Animated.View>
    );
  }

  renderImageTitle() {
    const state = this.props.navigationState;
    const navigationBarTitleImage = this.props.navigationBarTitleImage ||
      state.navigationBarTitleImage;
    const navigationBarTitleImageStyle = this.props.navigationBarTitleImageStyle ||
      state.navigationBarTitleImageStyle;
    const navigationBarShowImageSelection = this.props.navigationBarShowImageSelection ||
      state.navigationBarShowImageSelection || false;
    const navigationBarSelecionStyle = this.props.navigationBarSelecionStyle ||
      state.navigationBarSelecionStyle || {};
    return (
      <Animated.View
        style={[
          styles.titleWrapper,
          this.props.titleWrapperStyle,
        ]}
      >
        <Animated.Image
          style={[styles.titleImage, navigationBarTitleImageStyle]}
          source={navigationBarTitleImage}
        />
        {navigationBarShowImageSelection && <Animated.View style={navigationBarSelecionStyle} />}
      </Animated.View>
    );
  }

  render() {
    let state = this.props.navigation.state;
    let selected = state.children[state.index];
    while ({}.hasOwnProperty.call(selected, 'children')) {
      state = selected;
      selected = selected.children[selected.index];
    }
    const navProps = { ...this.props, ...selected };

    const wrapByStyle = (component, wrapStyle) => {
      if (!component) { return null; }
      return props => <View style={wrapStyle}>{component(props)}</View>;
    };

    const leftButtonStyle = [styles.leftButton, { alignItems: 'flex-start' }, this.props.leftButtonStyle, state.leftButtonStyle];
    const rightButtonStyle = [styles.rightButton, { alignItems: 'flex-end' }, this.props.rightButtonStyle, state.rightButtonStyle];

    const renderLeftButton = wrapByStyle(selected.renderLeftButton, leftButtonStyle) ||
      wrapByStyle(selected.component.renderLeftButton, leftButtonStyle) ||
      this.renderLeftButton;
    const renderRightButton = wrapByStyle(selected.renderRightButton, rightButtonStyle) ||
      wrapByStyle(selected.component.renderRightButton, rightButtonStyle) ||
      this.renderRightButton;
    const renderBackButton = wrapByStyle(selected.renderBackButton, leftButtonStyle) ||
      wrapByStyle(selected.component.renderBackButton, leftButtonStyle) ||
      this.renderBackButton;
    const renderTitle = selected.renderTitle ||
      selected.component.renderTitle ||
      this.props.renderTitle;
    const navigationBarBackgroundImage = this.props.navigationBarBackgroundImage ||
      state.navigationBarBackgroundImage;
    const navigationBarBackgroundImageStyle = this.props.navigationBarBackgroundImageStyle ||
      state.navigationBarBackgroundImageStyle;
    const navigationBarTitleImage = this.props.navigationBarTitleImage ||
      state.navigationBarTitleImage;
    let imageOrTitle = null;
    if (navigationBarTitleImage) {
      imageOrTitle = this.renderImageTitle();
    } else {
      imageOrTitle = renderTitle ? renderTitle(navProps)
      : state.children.map(this.renderTitle, this);
    }
    const contents = (
      <View>
        {imageOrTitle}
        {renderBackButton(navProps) || renderLeftButton(navProps)}
        {renderRightButton(navProps)}
      </View>
    );
    return (
      <Animated.View
        style={[
          styles.header,
          this.props.navigationBarStyle,
          state.navigationBarStyle,
          selected.navigationBarStyle,
        ]}
      >
        {navigationBarBackgroundImage ? (
          <Image style={navigationBarBackgroundImageStyle} source={navigationBarBackgroundImage}>
            {contents}
          </Image>
        ) : contents}
      </Animated.View>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.contextTypes = contextTypes;
NavBar.defaultProps = defaultProps;

export default NavBar;
