var App = require("./globals")
import Dimensions from 'Dimensions';
var RNGMap = require('react-native-gmaps');
var Button = require("react-native-button")
var React = require('react-native');
var FluxRouter = require('react-native-router-flux')
var { Schema, Route, Actions, TabBar, Animations } = FluxRouter
var { Text, View, } = React;

var MapHeader = React.createClass({
  goBack () {
    Actions.pop()
  },

  render() {
    return (
      <View style={{height:60,backgroundColor:"#425869",alignItems:"center",paddingTop:20}}>
        <View style={{position:"absolute",left:10,top:20}}>
          <Button onPress={this.goBack} style={{color:"white"}}>Back</Button>
        </View>
        <View >
          <Text style={{fontSize:20,color:"white",fontWeight:"bold"}}>
            {this.props.name}
          </Text>
        </View>
      </View>
    )
  }
})

var MapView = React.createClass({
  render: function() {
    var location = this.props.location
    console.log(location)
    var lat = location.lat
    var lng = location.lng
    var height = Dimensions.get('window').height
    var width = Dimensions.get('window').width
    return (
      <View>
      <View>
        <RNGMap
          ref={'gmap'}
          style={ { height: height, width: width ,position:"absolute"} }
          markers={ [
            //{ coordinates: {lng: lng, lat: lat} },
                { coordinates: {lng: lng, lat: lat}, 
                  title: "Click marker to see this title!",
                  snippet: "Subtitle",
                  id: 0,
                  color: 120,
                }
            ] }
          zoomLevel={15}
          onMapChange={(e) => console.log(e)}
          onMapError={(e) => console.log('Map error --> ', e)}
          center={ { lng: lng, lat: lat } } 
          clickMarker={0}/>
      </View>
        <Button style={{elevation:1,position:"absolute",top:120,left:20,height:50,width:50}}>Back</Button>
    </View>
    )
  }
})

module.exports = { 
  MapView: MapView,
  MapHeader: MapHeader
}
