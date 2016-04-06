'use strict';
import GiftedSpinner from 'react-native-gifted-spinner'

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
      loginError:false,
      loading:false
    }
  }

  login = () => {
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
        _this.setState({loginError: true, loginMessage: "",loading:false})
      }

      if(res.status == 200) {
        var _token = JSON.parse(res._bodyText).token
        _this.setState({token: _token,loading:false})
        store.save("_token", _token).then(function(i) {
          Actions.launch()
        })
      }
    }).catch((error) => {
      _this.setState({loginError: true, loginMessage: "",loading:false})
    })
  }

  _press = () => {
    this.setState({loading:true})
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
      {(!this.state.loginError) ? <Text style={{marginTop:30}}>{""}</Text> : <View style={{marginLeft:33,marginRight:33,borderRadius:5,backgroundColor:"#37a67f",marginTop:40,padding:10,paddingTop:15}}><Text style={{color:"#fff",padding:5,fontSize:14,alignItems:"center"}}>There was an error. Incorrect password and email combination</Text></View>}
      {(this.state.loading) ? <GiftedSpinner color={"white"} style={{height:12}} /> : <View /> }


      <View style={{marginTop:40,marginLeft:33,marginRight:33,borderRadius:5,padding:5, backgroundColor:"white",paddingTop:0,paddingBottom:0}}>
      <TextInput
          placeholder={"EMAIL"}
          placeholderTextColor={"#80d4b7"}
          style={{height: 60, borderColor:'gray', borderWidth: 1,
                  backgroundColor:"white",borderRadius:5,margin:5,marginBottom:0}}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text}
        />
      <TextInput
          placeholder={"PASSWORD"}
          placeholderTextColor={"#80d4b7"}
          underlineColorAndroid={"#FFCE66"}
          style={{height: 40, borderColor: 'gray', borderWidth: 1,marginTop:0,backgroundColor:"white",borderRadius:5,margin:5}}
          onChangeText={(textt) => this.setState({textt})}
          secureTextEntry={true}
          value={this.state.textt} />
      </View>
      <TouchableOpacity onPress={this._press} 
        style={{backgroundColor:"white",marginLeft:33,marginRight:33,
          padding:5,borderRadius:3,marginTop:40,height:45,
          alignItems:"center",paddingTop:12,alignSelf: 'stretch'}}>
          <Text style={{fontWeight:"bold",color:"#2E2E2E"}}> 
            {(!this.state.loading) ? "LOGIN" : "LOGGING IN..."}
          </Text>
      </TouchableOpacity>

          <Text style={{marginLeft:33,marginRight:33,fontSize:10,marginTop:10,color:"white"}}> 
    To use the Care Pro App, you must be a Sage Caregiver and be using the application only with Sage clients. You are also agreeing to the Sage Caregiver App Terms of Use. 
          </Text>
        </View>
      </ScrollView>
    )
  }
}
