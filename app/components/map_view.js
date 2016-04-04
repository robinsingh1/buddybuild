import App from "./globals"
import Icon from 'react-native-vector-icons/FontAwesome';
var RNGMap = require('react-native-gmaps');
import Button from "react-native-button"
import { Actions } from 'react-native-router-flux'
import React, { Text, View, TouchableOpacity } from 'react-native'
import Dimensions from 'Dimensions';
import MapView from 'react-native-maps';

export class MapHeader extends React.Component {
  goBack () {
    Actions.pop()
  }

  render() {
    //console.log(this.props)
    return (
      <View style={{height:60,backgroundColor:"#425869",alignItems:"center",paddingTop:20}}>
        <View style={{position:"absolute",left:10,top:0}}>
          <TouchableOpacity onPress={this.goBack} style={{padding:17}}>
              <Icon name="chevron-left" size={15} color="#fff" 
                  style={{marginRight:5,marginTop:2,position:"absolute",left:0,top:21}}/>
                <Text style={{color:"white",fontWeight:"bold",fontSize:18}}>
                  Back
              </Text>
          </TouchableOpacity>
        </View>
        <View >
          <Text style={{fontSize:20,color:"white",fontWeight:"bold"}}>
            {this.props.name}
          </Text>
        </View>
      </View>
    )
  }
}

export default class MapDetailView extends React.Component {
  render() {
    var location = this.props.location
    //console.log(location)
    //location = {lat: 10.0, lng: 51.0}
    var lat = location.lat
    var lng = location.lng
    var height = Dimensions.get('window').height
    var width = Dimensions.get('window').width
    return (
      <View>
        <MapHeader {...this.props}/>
      <View>
       <MapView 
          style={{height: height, width: width }}
          initialRegion={{
            latitude: lat, longitude: lng,
            //latitude: 10.0, longitude: 51.0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }} >
          <MapView.Marker coordinate={{latitude: lat, longitude: lng}} />
        </MapView>
      </View>
        <Button style={{elevation:1,position:"absolute",top:120,left:20,height:50,width:50}}>Back</Button>
    </View>
    )
  }
}
