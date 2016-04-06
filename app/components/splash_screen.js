'use strict';

var { Actions }  = require('react-native-router-flux')
let store = require('react-native-simple-store');
import React, { Image, View } from 'react-native';

export default class SplashScreen extends React.Component {
  componentWillMount() {

  }

  componentDidMount () {
    store.get("_token").then(function(token) {
      if(token) {
        Actions.launch()
      } else {
        Actions.login()
      }
    })
  }

  onPress() {

  }

  render() {
    return (
      <View style={{flexDirection:'row',justifyContent:'center',backgroundColor:"#40BF93",flex:1,alignItems:"center",paddingTop:0}}>
          <Image source={require("./img/sage-logo-white@2x.png")}></Image>
      </View>
    )
  }
}
