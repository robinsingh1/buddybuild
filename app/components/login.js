'use strict';

import App from "./globals"
var store = require('react-native-simple-store');
import { Actions } from 'react-native-router-flux'

import React, {
  Text,
  TextInput,
  Image,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native'

export default class Login extends React.Component {
  constructor() {
    super()
    this.state = {
      text: "",
      textt: "",
      loginError:false
    }
  }

  login() {
    var _this = this;
    let headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    let body =  JSON.stringify({
      //email: 'robin@robinsingh.co',
      //password: '111111'
      email: _this.state.text,
      password: _this.state.textt
    })
    fetch(App.auth_url, { method: 'POST', headers: headers, body: body })
    .then(function(res) {
      if(res.status != 200) {
        _this.setState({loginError: true, loginMessage: ""})
      }

      if(res.status == 200) {
        var _token = JSON.parse(res._bodyText).token
        _this.setState({token: _token})
        store.save("_token", _token).then(function(i) {
          Actions.launch()
        })
      }
    }).catch((error) => {
      _this.setState({loginError: true, loginMessage: ""})
    })
  }

  _press() {
    this.login()
  }

  componentDidMount() {
  }

  render() {
    return (
      <ScrollView style={{backgroundColor:"#40BF93",flex:1,paddingTop:0}}>
          <View style={{alignItems:"center"}}>
          <Image source={require("./img/sage-logo-white@2x.png")} style={{height:40,marginTop:100,width:130}}></Image>
        <Text style={{fontSize:17,color:"white",paddingTop:0,marginTop:0}}>Care Pro App</Text>
      {(!this.state.loginError) ? <Text style={{marginTop:30}}>{""}</Text> : <View style={{borderRadius:5,backgroundColor:"#37a67f",marginTop:40,padding:10,paddingTop:15}}><Text style={{color:"#fff",padding:5,fontSize:14,alignItems:"center"}}>There was an error. Incorrect password and email combination</Text></View>}

      <View style={{marginTop:40,paddingLeft:33,paddingRight:33,borderRadius:5}}>
      <TextInput
          placeholder={"EMAIL"}
          placeholderTextColor={"#80d4b7"}
          style={{height: 60, borderColor:'gray', borderWidth: 1,
                  backgroundColor:"white",borderRadius:5}}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text}
        />
      <TextInput
          placeholder={"PASSWORD"}
          placeholderTextColor={"#80d4b7"}
          underlineColorAndroid={"#FFCE66"}
          style={{height: 40, borderColor: 'gray', borderWidth: 1,marginTop:0,backgroundColor:"white",borderRadius:5}}
          onChangeText={(textt) => this.setState({textt})}
          secureTextEntry={true}
          value={this.state.textt} />
      </View>
      <TouchableOpacity onPress={this._press} 
        style={{backgroundColor:"white",marginLeft:33,marginRight:33,
          padding:5,borderRadius:3,marginTop:40,height:45,
          alignItems:"center",paddingTop:12,alignSelf: 'stretch'}}>
          <Text style={{fontWeight:"bold",color:"#2E2E2E"}}> LOGIN </Text>
      </TouchableOpacity>

          <Text style={{marginLeft:33,marginRight:33,fontSize:10,marginTop:10,color:"white"}}> 
    To use the Care Pro App, you must be a Sage Caregiver and be using the application only with Sage clients. You are also agreeing to the Sage Caregiver App Terms of Use. 
          </Text>
        </View>
      </ScrollView>
    )
  }
}
