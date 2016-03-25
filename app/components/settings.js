var store = require('react-native-simple-store');
var Button = require('react-native-button');
import React, { TouchableNativeFeedback, Text, View, TouchableOpacity } from 'react-native'
import { Actions } from 'react-native-router-flux'

export class SettingsHeader extends React.Component {
  gotoMain() {
    Actions.launch()
  }

  render() {
    return (
      <View style={{height:60,backgroundColor:"white",alignItems:"center",paddingTop:20,borderBottomWidth:1,borderBottomColor:"#Eee"}}>
        <View>
        <Text style={{color:"grey"}}>
          SETTINGS
          </Text>
        </View>
        <View style={{position:"absolute",right:10,top:20}}>
          <Button onPress={this.gotoMain}
                  style={{color:"grey"}}>Back</Button>
        </View>
      </View>
    )
  }
}

export default class Settings extends React.Component {
  _press() {
    store.delete("_token").then(function() {
      Actions.splash()
    })
  }

  render() {
    return (
      <View style={{backgroundColor:"#F6F6FB"}}>
        <TouchableOpacity onPress={this._press}
          background={TouchableNativeFeedback.SelectableBackground("white")}>
          <View style={{backgroundColor:"#AAAAAA",marginLeft:15,padding:5,borderRadius:3,marginTop:10,height:45,width:335,alignItems:"center",paddingTop:10}}>
            <Text style={{fontWeight:"bold",color:"white"}}> LOG OUT </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}
