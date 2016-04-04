import App from "./globals"
import Dimensions from 'Dimensions';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from "moment"
import React from 'react-native'
//var React = require('react-native')
import { Actions } from 'react-native-router-flux'
import _ from "underscore"
var mtz = require('moment-timezone');
var store = require('react-native-simple-store');

var {
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  View,
  ScrollView
} = React;

export class VisitHeader extends React.Component {
  static propTypes = {
    name: React.PropTypes.string.isRequired
  }

  onPress () {
    Actions.pop()
  }

  render() {
    return (
      <View style={{height:60,backgroundColor:"#425869",alignItems:"center",paddingTop:20}}>
        <View style={{position:"absolute",left:10,top:0}}>
          <TouchableOpacity onPress={this.onPress} style={{padding:17}}>
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

class TimingComponent extends React.Component {
  static propTypes = {
    checkinTime: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired
  }

  render() {
    //console.log(this.props)
    return (
      <View style={{borderColor:"#ddd",borderWidth:1,flexDirection:'row',
        elevation:1, backgroundColor:"white",width:335,borderRadius:5,
        marginTop:10,height:70}}>

        <View style={{height:1,position:"absolute",width:400,top:35,
                      backgroundColor:"#eee"}} />

        <View style={{marginTop:22,marginLeft:10,height:85}}>
            <View style={{flexDirection:"row",width:300}}>
              <View style={{height:10,width:10,borderRadius:5,marginTop:-5,
                marginLeft:10, marginRight:10,backgroundColor:"#40BF93"}}/>

             <Text style={{fontSize:12,marginLeft:-4, marginTop:-10,color:"#292E30"}}>
                {mtz(this.props.data.startTime).tz("America/Toronto").format("dddd h:mm A").toString()}  
              </Text>

                <Text style={{fontSize:12,color:"#949DA9",marginTop:-10,marginLeft:10}}>
                  {mtz(this.props.data.startTime).tz("America/Toronto").format("MMM Do").toString()}  
                </Text>
                <Text style={{position:"absolute",top:0,right:20,fontSize:12,color:"#949DA9",marginTop:-11}}>
                  {(this.props.checkinTime) ? mtz(this.props.checkinTime).tz("America/Toronto").format("h:mm A").toString() : ""}  
                </Text>
            </View>

            <View style={{flexDirection:"row",marginTop:15,width:300}}>
              <View style={{height:10,width:10,borderRadius:5,marginTop:5,
 marginLeft:10, marginRight:10, backgroundColor:"#F02200"}} />
                <Text style={{fontSize:12,marginLeft:-4, color:"#292E30"}}>
                    {mtz(this.props.data.startTime).add(this.props.data.duration,'h').tz("America/Toronto").format("dddd h:mm A").toString()}  
                </Text>
                <Text style={{fontSize:12,color:"#949DA9",marginLeft:10}}>
                  {mtz(this.props.data.startTime).add(this.props.data.duration,'h').tz("America/Toronto").format("MMM Do").toString()}  
                </Text>

                <Text style={{fontSize:12,color:"#949DA9",position:"absolute",right:20,top:0}}>
                  {(this.props.data.checkOutTime) ? mtz(this.props.data.checkOutTime).tz("America/Toronto").format("h:mm A").toString() : ""}  
                </Text>
            </View>
        </View>
      </View>

    )
  } 
}

class CompletedView extends React.Component {
  render() {
    return (
      <View style={{}}>
        <View style={{flexDirection:"row",alignItems:"center",width:335,height:70,paddingTop:7}}>
          <View style={{marginLeft:40}}>
            <Text style={{fontSize:16,color:"#40BF93"}}>
              Completed
            </Text>
            <View style={{height:2,borderWidth:1,borderColor:"black"}}/>
            <Text style={{fontSize:16}}>
              Duration: 2.1 hrs
            </Text>
          </View>

          <View style={{marginTop:5,height:85,position:"absolute",right:0}}>
              <View style={{flexDirection:"row"}}>
                <Text style={{color:"black",fontSize:12,marginLeft:-4,
                  marginTop:7}}> {"9:58 am"} </Text>
              </View>
              <View style={{flexDirection:"row",marginTop:6,marginLeft:-4}}>
                <Text style={{color:"black",fontSize:12}}>{"12:01 pm"}</Text>
              </View>
          </View>
        </View>
      </View>
    )
  }
}

class Task extends React.Component {
  static propTypes = {
    category: React.PropTypes.string.isRequired,
    details: React.PropTypes.string.isRequired
  }

  render() {
    let icons = {
      'entry':  <Image source={require("./img/icon-entry@2x.png")} />,
      'alerts':  <Image source={require("./img/icon-warning@2x.png")} />,
      'housekeeping':  <Image source={require("./img/icon-broom@2x.png")} />,
      'medication': <Image source={require("./img/icon-reminders@2x.png")} />,
      'meal': <Image source={require("./img/icon-meal@2x.png")} />,
      'grooming': <Image source={require("./img/icon-shower@2x.png")} />,
      'activity': <Image source={require("./img/icon-exercise@2x.png")} />,
      'transportation':<Image source={require("./img/icon-transportation@2x.png")}/>,
      'other': <Image source={require("./img/icon-check@2x.png")} />
    }
    return (
        <View style={{flexDirection:'row',marginLeft:0,marginTop:20,paddingBottom:10,borderBottomWidth:1,borderBottomColor:"#ddd"}}>
          <View style={{marginTop:5}}> 
            {icons[this.props.category]}
          </View>
        <View style={{marginLeft:20, width:270}}>
          <Text style={{fontSize:16}}>
            {this.capitalize(this.props.category)}
          </Text>
          <Text style={{fontSize:14}}>
            {this.props.details}
          </Text>
        </View>
        </View>

    )
  }

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  }
}

class MapButton extends React.Component {
  static propTypes = {
    address: React.PropTypes.string.isRequired
  }

  constructor() {
    super() 
    this.state = {
      location: {}
    }
    this.imagePress = this.imagePress.bind(this)
    this.getLocationDetails = this.getLocationDetails.bind(this)
  }

  imagePress = () => {
    let _location = this.state.location
    console.log(_location)
    Actions.map_detail({...this.props, location: _location })
  }

  async getLocationDetails() {
    let apiKey = "AIzaSyAyeTz-PBVZu1sSv1JeeCeE2xOI6xSiW6s"
    let url = "https://maps.googleapis.com/maps/api/geocode/json?"
    url = url+`address=${this.props.address}&key=${apiKey}`
    console.log(url)

    var _this = this;
    var data = await fetch(url, { method: 'GET'})
    var body = await data.json()
    //.then(function(res) {
    //console.log(res)
      //let body = JSON.parse(res._bodyInit)
    //console.log(body)
      body = body.results[0]
      let location = body.geometry.location
      //console.log(location)
      _this.setState({location: location})
      //})
  }

  componentDidMount() {
    this.getLocationDetails().done()
  }

  render() {
    var address = this.props.address
    address = address.split(' ').join('+');
    let args = `&zoom=13&scale=false&size=335x83&maptype=roadmap&format=png&visual_refresh=true&markers=size:mid%7Ccolor:0xff0000%7Clabel:1%7C${address}`
    var uri = `http://maps.googleapis.com/maps/api/staticmap?center=${address}`
    uri = uri + args
    return (
      <TouchableOpacity onPress={this.imagePress} >
        <View style={{elevation:2}}>
          <Image onPress={this.imagePress} 
            style={styles.mapImage} 
            source={{uri: uri}} />
        </View>
      </TouchableOpacity>
    )
  }
}

export default class VisitSummary extends React.Component {
  static propTypes = {
    checkInTime: React.PropTypes.string.isRequired,
    completed: React.PropTypes.bool.isRequired,
    data: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      checkedIn: this.props.data.checkInTime,
      checkedOut: false,
      checkinTime: this.props.data.checkInTime,
      checkoutTime: 0,
      geo: {}
    }
    this._press = this._press.bind(this)
  }

  imagePress() {
    Actions.map_detail()
  }

  componentWillMount() {

  }

  async _press() {
    console.log("press")
    // _press() {
    if(_.isEqual(this.state.geo, {})) {
      Alert.alert( 'Warning!', "We couldn't check you in/out right now due to an error. Please call +1 877-960-0235.",
        [{text: 'Cancel', onPress: () => { }}, {text: 'Yes', onPress: () => { }}])
      return false
    }

    let geo = _.pick(this.state.geo, 'latitude','longitude')
    geo = _.object(_.zip(["lat","lng"], _.values(geo)))
    if(this.state.checkedIn) {
      let _this = this;
      if(this.props.data["Tasks"].length) {
        console.log("notes")
        Actions.notes_screen({currentScreen: 0, 
                              _id: _this.props.data.id,
                              checkOutTime: moment().format(),
                              checkOutGeolocation: geo,
                              tasks: _this.props.data["Tasks"], 
                              name: _this.props.name})
      } else {
        Actions.medical_supplies({currentScreen: 0, 
                              _id: _this.props.data.id,
                              checkOutTime: moment().format(),
                              checkOutGeolocation: geo,
                              tasks: _this.props.data["Tasks"], 
                              name: _this.props.name})
      }
        
      this.setState({ checkedOut: moment().valueOf()})
    } else {
      var token = await store.get("_token")
      let time = moment().valueOf()
      var _this = this;
      let url = `http://dev.sage.care/api/v1/cp/s/events/${this.props.data.id}/checkin`
      let body={checkInTime: moment().valueOf(), metadata: {checkInGeolocation: geo}}
      body = JSON.stringify(body)
      fetch(url, { method: 'PUT', headers: App.headers(token), body: body})
      .then(function(res) {
        if(res.status == 200) {
          _this.setState({checkedIn:  time})
          _this.props.updateCheckedinState(_this.props.data.id, time)
        } else {
          Alert.alert( 'Warning!', " Warning: We couldn't check you in/out right now due to an error. Please call +1 877-960-0235. ",
          [{text: 'Cancel', onPress:() => {}}, {text:'Yes', onPress: () => { }}]) }
      })
    }
  }

  getGeo() {
    var _this = this;
    navigator.geolocation.getCurrentPosition(function(geo) {
      _this.setState({geo: geo.coords})
    })
  }

  componentWillUnmount() {
    clearInterval(this.state.interval)
  }

  componentDidMount() {
    let _this = this;
    let interval = setInterval(function() { _this.getGeo() }, 300)
    this.setState({interval: interval})
  }


  render() {
    let data = (this.props.data) ? this.props.data : {}
    data.Tasks = (data.Tasks) ? data.Tasks : {}
    let client = (data.Client) ? data.Client : {}

    let btnColor = (this.state.checkedIn) ?  "red" : "#40BF93"
    let btnText = (this.state.checkedIn) ?  "CHECK OUT" : "CHECK IN"
    let address = client.addressLocality + ", "+ client.addressRegion + ", "
    address = address + client.postalCode

    let height = Dimensions.get('window').height
    return (
      <ScrollView style={{marginTop:0,paddingTop:0,height:height,backgroundColor:"#F6F6FB"}}>
       <View style={{backgroundColor:"#F6F6FB",flex:1,alignItems:"center",paddingTop:0}}>
        <View style={{backgroundColor:"#F9F9F9",marginTop:0,height:70,width:400,borderBottomWidth:1,borderBottomColor:"#D2D2D2"}} >
          { (this.props.completed) ? <CompletedView /> : 
            <TouchableOpacity onPress={() => { this._press().done() }} >
                  <View style={{backgroundColor:btnColor,marginLeft:35,padding:5,
                    borderRadius:3,marginTop:10,height:45,width:335,
                  alignItems:"center",paddingTop:10}}> 
                    <Text style={{fontWeight:"bold",color:"white"}}> 
                      {btnText} 
                    </Text> 
                </View> 
          </TouchableOpacity> 
          }
        </View>
        <Text style={{textAlign:"center",marginTop:10}}> 
          {client.streetAddress1} 
        </Text>

        <Text style={{textAlign:"center"}}> {address} </Text>
        <MapButton address={address} {...this.props}/>
        <TimingComponent checkinTime={this.state.checkedIn} data={this.props.data}/>

        <View style={{borderColor:"black"}}>
          <Task details={data.Client.metadata.entryDetails} category={"entry"} />
          <Task details={data.Client.metadata.allergies} category={"alerts"} />

          { _.map(data.Tasks, function(task, i) {
              return <Task details={task.details} key={i} category={task.category} />
            })
          }
        </View>
        </View>
      </ScrollView>
    )
  }
}

VisitSummary.propTypes = {
  data: React.PropTypes.object,
  property: React.PropTypes.object
}


let styles = StyleSheet.create({
  mapImage: {
    height:83,
    width:335,
    marginTop:10, 
    borderRadius:5,
    borderColor:"#ccc",
    borderWidth:1
  }
});

