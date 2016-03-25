import Icon from 'react-native-vector-icons/Ionicons'
var Button = require("react-native-button")
import moment from "moment"
import _ from "underscore"
import App from "./globals"
var store = require('react-native-simple-store')

import React, {
  Alert,
  TouchableNativeFeedback,
  TouchableOpacity,
  Text,
  View,
  TouchableHighlight
} from 'react-native'

var NativeModules = require("react-native").NativeModules
import { Actions } from 'react-native-router-flux'
import Dimensions from 'Dimensions';

export class AddAvailabilityHeader extends React.Component {
  propTypes = {
    currentScreen: React.PropTypes.string.isRequired,
    startTime: React.PropTypes.string.isRequired,
    endTime: React.PropTypes.string.isRequired,
    endDate: React.PropTypes.string.isRequired,
    recurring: React.PropTypes.boolean.isRequired,
    recurringPeriod: React.PropTypes.Object.isRequired,
    startDate: React.PropTypes.string.isRequired
  }

  onPress() {
    Actions.pop()
  }

  render() {
    return (
      <View style={{height:60,backgroundColor:"white",alignItems:"center",
                    paddingTop:20,borderColor:"grey",borderBottomWidth:1,
                    elevation:1}}>
        <View style={{position:"absolute",left:10,top:20}}>
          <Button onPress={this.onPress} style={{color:"#2D2D2D",fontSize:16}}>
            {(this.props.currentScreen) ? "Back" : "Cancel"}
          </Button>
        </View>
        <View >
          <Text style={{marginTop:-1,fontSize:18,color:"#2D2D2D",fontWeight:"bold"}}>{"Add Availability"}</Text>
        </View>
        <View style={{position:"absolute",right:10,top:20}}>
          <Button onPress={this.yoPress} style={{color:"#38C092",fontSize:16}}> 
            Done </Button>
        </View>
      </View>
    )
  }

  yoPress() {
    this.donePress().done()
  }

  warningMessage(msg) {
      Alert.alert( 'Warning!', msg,
      [ {text: 'Cancel', onPress: () => { }, style: 'cancel'},
        {text: 'OK', onPress: () => { }} ])
  }
  
  async donePress() {
    if(!this.props.startDate) {
      this.warningMessage('You must add a start date.')
    } else if(!this.props.startTime) {
      this.warningMessage('You must add a start time.')
    } else if(!this.props.endTime) {
      this.warningMessage('You must add an end time.')
    } else if(this.props.startTime == this.props.endTime) {
      this.warningMessage('Start Time and End Time Cannot Be The Same.')
    } else if (this.props.recurring && !this.props.recurringPeriod.startDate) {
      this.warningMessage('You must add a start date to your recurring period.')
    } else if (this.props.recurring && !this.props.recurringPeriod.startDate) {
      this.warningMessage('You must add an end date to your recurring period.')
    } else if(this.props.recurringPeriod.startDate > this.props.recurringPeriod.endDate) {
      this.warningMessage("Your recurring period's start date must be before your end date.")
    } else if(this.props.recurring && moment(this.props.recurringPeriod.startDate).format("MMM DD, YYYY") == moment(this.props.recurringPeriod.endDate).format("MMM DD, YYYY")) {
      this.warningMessage("Your recurring period's start date cannot be the same as your end date.")
    } else {
      var startTime = this.props.startTime.split(" ")[0].split(":")
      var hour = parseInt(startTime[0]); var min = parseInt(startTime[1]);
      hour = (this.props.startTime.indexOf("pm") == -1) ? hour : hour + 12
      hour = (hour != 0) ? hour + 12 : hour
      
      startTime = moment(this.props.startDate).hour(hour).minute(min).format()

      var endTime = this.props.endTime.split(" ")[0].split(":")
      hour = parseInt(endTime[0]); 
      min = parseInt(endTime[1]);
      hour = (this.props.endTime.indexOf("pm") == -1) ? hour : hour + 12
      hour = (hour != 0) ? hour + 12 : hour
      endTime = moment(this.props.endDate).hour(hour).minute(min).format()

      let diff = moment(startTime).diff(moment(endTime))
      let duration = moment.duration(diff)
      duration = duration.hours() + duration.minutes() / 60
      duration = Math.abs(duration)

      var event = {   
        "duration": duration,
        "startTime": startTime,
        "recurring": false 
      }

      let days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
      var _this = this;
      if(this.props.recurring) {
        event = _.extend(event, {
          startDate: moment(_this.props.recurringPeriod.startDate),
          endDate: moment(_this.props.recurringPeriod.endDate),
          days: [days.indexOf(moment(startTime).format("ddd"))],
          recurring: true
        })
      } 
      var token = await store.get("_token")
      var url = "http://dev.sage.care/api/v1/cp/s/availabilities"
      var data = { method: 'POST', body: JSON.stringify(event), 
                   headers: App.headers(token) }
      fetch(url, data).then(function(res) {
        if(res.status == 200) {
          res = JSON.parse(res._bodyText)
          res = (event.recurring) ? res.availabilities : res.availability
          _this.props.addAvailability(res)
          Actions.pop()
        } else {
          Alert.alert( 'Warning!', 'There was an error - please try again.',
          [ {text: 'Cancel', onPress: () => { }, style: 'cancel'},
            {text: 'Yes', onPress: () => { }}
          ])
        }
      })
    }
  }
}

export default class AddAvailabilityModal extends React.Component {
  propTypes = {
    addAvailability: React.PropTypes.string.isRequired
  }

  constructor() {
    super()
    this.state = {
      recurring: false,
      setRecurringPeriod: false,
      recurringPeriod: {},
      showView: false,
      startDate: undefined,
      startTime: undefined,
      endTime: undefined,
      addAvailability: this.props.addAvailability
    }
  }

  validateRecurringPeriod() {
  }

  toggleView() {
    this.setState({showView: !this.state.showView })
  }

  toggleRecurring() {
    this.setState({recurring: !this.state.recurring, setRecurringPeriod: true})
    if(!this.state.recurring) {
      this.setState({setRecurringPeriod: false, recurringPeriod: {}}) 
    }
  }

  toggleRecurringPeriod() {
    this.setState({setRecurringPeriod: !this.state.setRecurringPeriod})
  }

  startTime() {
    var _this = this;
    NativeModules.DateAndroid.showTimepicker(function(){},function(hour, minute) {
      minute = (minute < 10) ? "0"+minute : minute
      var dayTime = (hour < 12 ) ? " am" : " pm"
      hour = (hour < 12 ) ? hour : hour - 12
      hour = (hour == 0 ) ? hour + 12 : hour
      var startTime =  hour + ":" + minute + dayTime
      _this.setState({startTime: startTime})
    });
  }
  
  endTime() {
    var _this = this;
    NativeModules.DateAndroid.showTimepicker(function() {}, function(hour, minute) {
      minute = (minute < 10) ? "0"+minute : minute
      var dayTime = (hour < 12 ) ? " am" : " pm"
      hour = (hour < 12 ) ? hour : hour - 12
      hour = (hour == 0 ) ? hour + 12 : hour
      var endTime =  hour + ":" + minute + dayTime
      _this.setState({endTime: endTime})
    });
  }

  datepicker() {
    var _this = this;
    NativeModules.DateAndroid.showDatepicker(function() {}, function(y, m, d) {
      var date = moment().year(y).month(m).date(d).valueOf()
      //.format("MMM DD, YYYY")
      //console.log(date)
      _this.setState({startDate: date});
    });
  }

  componentDidMount() {
  }

  render() {
    var height = Dimensions.get('window').height

    if (this.state.setRecurringPeriod) {
      let recurringPeriodView = <SetRecurringPeriodView 
        toggleRecurringPeriod={this.toggleRecurringPeriod} 
        toggleRecurring={this.toggleRecurring} 
        setRecurringPeriod={this.setRecurringPeriod} 
        currentPeriod={this.state.recurringPeriod} />
    } else {
      if (!_.isEqual({}, this.state.recurringPeriod)) {
        let recurringPeriodView = <RecurringPeriodView recurringPeriod={this.state.recurringPeriod} />
      } else {
        let recurringPeriodView = <View />
      }
    }
    return (
      <View>
        <AddAvailabilityHeader {...this.state} validateRecurringPeriod={this.validateRecurringPeriod}/>
      <View style={{height:height,backgroundColor:"#F6F6FB",alignItems:"center",paddingTop:30}}>
        <View style={{flexDirection:"column"}}>
          <View style={{flexDirection:"row",justifyContent:"space-between",width:300,marginBottom:20}}>
            <Text>On</Text>
            <TouchableOpacity onPress={this.datepicker} style={{padding:15,marginTop:-15}}>
              <Text style={{color:"#443E3E",fontSize:14,fontWeight:"bold",paddingRight:10}}>
                {(this.state.startDate) ? moment(this.state.startDate).format("MMM DD, YYYY") : "Set Date" }
              </Text>
              {(this.state.startDate) ? <View /> : <View style={{position:"absolute",top:13,right:0}}>
                <Icon name="ios-arrow-thin-right" size={22} fontWeight="bold"/></View>}
            </TouchableOpacity>
          </View>

          <View style={{flexDirection:"row",justifyContent:"space-between",width:300,marginBottom:20}}>
            <Text>{"I'm available from"}</Text>
            <TouchableOpacity onPress={this.startTime} style={{padding:15,marginTop:-15}}>
              <Text style={{color:"#443E3E",fontSize:14,fontWeight:"bold",marginRight:10}}>
                {(this.state.startTime) ? this.state.startTime : "Set Time" }
              </Text>
              {(this.state.startTime) ? <View /> : <View style={{position:"absolute",top:13,right:0}}>
            <Icon name="ios-arrow-thin-right" size={22} fontWeight="bold"/> 
                </View> }
            </TouchableOpacity>
          </View>

          <View style={{flexDirection:"row",justifyContent:"space-between",width:300,marginBottom:60}}>
            <Text>To</Text>
            <TouchableOpacity onPress={this.endTime} style={{padding:15,marginTop:-15}}>
              <Text style={{color:"#443E3E",fontSize:14,fontWeight:"bold",marginRight:10}}>
                {(this.state.endTime) ? this.state.endTime : "Set Time" }
              </Text>
              {(this.state.endTime) ? <View/> :<View style={{position:"absolute",top:13,right:0}}>
            <Icon name="ios-arrow-thin-right" size={22} fontWeight="bold"/> 
                </View> }
            </TouchableOpacity>
          </View>
        </View>

        <Button onPress={this.toggleRecurring} style={{marginTop:100}}> 
          <View style={{height:60,width:300,backgroundColor:"white", borderRadius:3,borderColor:"#bbb",borderWidth:1,alignItems:"center",paddingTop:20}}>
              <Icon name={(!this.state.recurring) ? "android-checkbox-outline-blank" : "android-checkbox"} size={33} color="#38C092" style={{position:"absolute",top:15,left:20}}/>
            <Text>Make Recurring</Text>
          </View>
        </Button>
        {recurringPeriodView }
      </View>
    </View>
    )
  }

  setRecurringPeriod(period) {
    this.setState({recurringPeriod: period,
                  setRecurringPeriod: true})
  }
}

class SetRecurringPeriodView extends React.Component {
  propTypes = {
    currentPeriod: React.PropTypes.string.isRequired,
    toggleRecurring: React.PropTypes.function.isRequired,
    setRecurringPeriod: React.PropTypes.boolean.isRequired,
    toggleRecurringPeriod: React.PropTypes.function.isRequired
  }

  constructor(props) {
    super(props)
    let { currentPeriod } = this.props
    return {
      startDate: (currentPeriod.startDate) ? currentPeriod.startDate : 0,
      endDate: (currentPeriod.endDate) ? currentPeriod.endDate : 0
    }
  }

  chooseRecurringStartDate() {
    var _this = this;
    NativeModules.DateAndroid.showDatepicker(function(){}, function(year,month,day){
      var date = moment().year(year).month(month).date(day).valueOf()
      _this.setState({startDate: date});

      _this.props.setRecurringPeriod({
        startDate: date, 
        endDate: _this.state.endDate
      })
    });
  }

  chooseRecurringEndDate() {
    var _this = this;
    NativeModules.DateAndroid.showDatepicker(function(){}, function(year,month,day){
      var date = moment().year(year).month(month).date(day).valueOf()
      _this.setState({endDate: date});

      _this.props.setRecurringPeriod({
        startDate: _this.state.startDate, 
        endDate: date
      })
    });
  }


  render() {
    var startDate = this.state.startDate

    return (
      <View style={{backgroundColor:"#FFF6E2",borderWidth:1,borderColor:"#FFCE66",height:170,width:300,marginTop:10,borderRadius:3}}>

        <View style={{alignItems:"center",flexDirection:"row",justifyContent:"space-between",width:200,marginLeft:40,marginTop:20}}>
          <Text>Start Date</Text>
          <Text>End Date</Text>
        </View>

        <View style={{alignItems:"center",flexDirection:"row",
                  justifyContent:"space-between",width:250,marginLeft:20,
                  marginTop:0,marginBottom:10}}>

          {(startDate) ? <Button style={{marginTop:25,paddingTop:10,paddingBottom:10}} onPress={this.chooseRecurringStartDate}>{moment(this.state.startDate).format("MMM DD, YYYY")}</Button> : <TouchableHighlight onPress={this.chooseRecurringStartDate} 
              background={TouchableNativeFeedback.Ripple()} 
              style={{marginTop:10}}> 
              <View style={{backgroundColor:"#676767",marginLeft:0,padding:5,
                borderRadius:3,marginTop:10,height:45,alignItems:"center",paddingTop:10,paddingLeft:10,paddingRight:10}}> 
                <Text style={{fontWeight:"bold",color:"white"}}>
                  Choose Date
                </Text> 
            </View> 
          </TouchableHighlight>}

          {(this.state.endDate) ? <Button style={{marginTop:25,paddingTop:10,paddingBottom:10}} onPress={this.chooseRecurringEndDate}>{moment(this.state.endDate).format("MMM DD, YYYY")}</Button> : <TouchableHighlight onPress={this.chooseRecurringEndDate} 
              style={{marginTop:10}}> 
              <View style={{backgroundColor:"#676767",marginLeft:0,padding:5,
                borderRadius:3,marginTop:10,height:45,alignItems:"center",paddingTop:10,paddingLeft:10,paddingRight:10}}> 
                <Text style={{fontWeight:"bold",color:"white"}}>
                  Choose Date
                </Text> 
            </View> 
          </TouchableHighlight> }
        </View>
      </View> 
    )
  }

  toggleRecurring () {
    this.props.toggleRecurring()
  }

  toggleRecurringPeriod() {
    this.props.toggleRecurringPeriod()
  }

  setRecurringPeriod() {
    this.props.setRecurringPeriod({
      startDate: this.state.startDate, 
      endDate: this.state.endDate
    })

    if(this.state.startDate == 0) {
      Alert.alert( 'Warning!', 'You must add a start date.',
      [ {text: 'Cancel', onPress: () => {  }, style: 'cancel'},
        {text: 'Yes', onPress: () => { }}
      ])
    } else if(this.state.endDate == 0) {
      Alert.alert( 'Warning!', 'You must add an end date.',
      [ {text: 'Cancel', onPress: () => { }, style: 'cancel'},
        {text: 'Yes', onPress: () => { }}
      ])
    } else if(this.state.startDate > this.state.endDate) {
      Alert.alert( 'Warning!', 'Your start date must be before your end date.',
      [ {text: 'Cancel', onPress: () => { }, style: 'cancel'},
        {text: 'Yes', onPress: () => { }} ])
    } else if(moment(this.state.startDate).format("MMM DD, YYYY") == moment(this.state.endDate).format("MMM DD, YYYY")) {
      Alert.alert( 'Warning!', 'Your start date cannot be the same as your end date.',
      [ {text: 'Cancel', onPress: () => { }, style: 'cancel'},
        {text: 'Yes', onPress: () => { }}
      ])
    }  else {
      this.props.setRecurringPeriod({
        startDate: this.state.startDate, 
        endDate: this.state.endDate
      })
    }
  }
}

class RecurringPeriodView extends React.Component {
  propTypes = {
    recurringPeriod: React.PropTypes.Object.isRequired
  }
  render() {
    var startDate = moment(this.props.recurringPeriod.startDate).format("MMM DD")
    var endDate = moment(this.props.recurringPeriod.endDate).format("MMM DD")
    return (
      <View style={{backgroundColor:"#FFF6E2",borderWidth:1,borderColor:"#FFCE66",
                    height:70,width:300,marginTop:10,borderRadius:3}}>
        <View style={{alignItems:"center",flexDirection:"row",
                      justifyContent:"space-between",width:200,marginLeft:40,marginTop:20}}>
          <Text> {"Recurring from " + startDate + " to "+ endDate } </Text>
        </View>
      </View>
    )
  }
}
