import Icon from 'react-native-vector-icons/Ionicons'
var Button = require("react-native-button")
import moment from "moment"
import _ from "underscore"
import App from "./globals"
var store = require('react-native-simple-store')
var mtz = require('moment-timezone');

import React, {
  Alert,
  TouchableNativeFeedback,
  DatePickerAndroid,
  TimePickerAndroid,
  TouchableOpacity,
  Text,
  View,
  TouchableHighlight
} from 'react-native'

var NativeModules = require("react-native").NativeModules
import { Actions } from 'react-native-router-flux'
import Dimensions from 'Dimensions';

export class AddAvailabilityHeader extends React.Component {
  constructor() {
    super()
    this.yoPress = this.yoPress.bind(this)
    this.donePress = this.donePress.bind(this)
  }

  static propTypes = {
    currentScreen: React.PropTypes.string.isRequired,
    startTime: React.PropTypes.string.isRequired,
    endTime: React.PropTypes.string.isRequired,
    endDate: React.PropTypes.string.isRequired,
    recurring: React.PropTypes.bool.isRequired,
    recurringPeriod: React.PropTypes.object.isRequired,
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

          <TouchableOpacity onPress={this.onPress} style={{padding:17}}>
            <Icon name="chevron-left" size={15} color="#fff" 
                style={{marginRight:5,marginTop:2,position:"absolute",left:0,top:21}}/>
              <Text style={{fontWeight:"bold",color:"#2D2D2D",fontSize:16}}>
            {(this.props.currentScreen) ? "Back" : "Cancel"}
            </Text>
          </TouchableOpacity>

        </View>
        <View >
          <Text style={{marginTop:-1,fontSize:18,color:"#2D2D2D",fontWeight:"bold"}}>{"Add Availability"}</Text>
        </View>

        <View style={{position:"absolute",right:10,top:0}}>
          <TouchableOpacity onPress={this.yoPress} style={{padding:17}}>
              <Text style={{color:"#38C092",fontWeight:"bold",fontSize:16}}>
                Done
            </Text> 
          </TouchableOpacity>
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
      var hour = parseInt(startTime[0]); 
      var min = parseInt(startTime[1]);
      hour = (this.props.startTime.indexOf("pm") == -1) ? hour : hour + 12
      hour = (hour == 0) ? hour + 12 : hour
      
      startTime = moment(this.props.startDate).hour(hour).minute(min)
      startTime = startTime.second(0).format()
      startTime = mtz(startTime).tz("America/Toronto").tz("UTC").format()

      var endTime = this.props.endTime.split(" ")[0].split(":")
      hour = parseInt(endTime[0]); 
      min = parseInt(endTime[1]);
      hour = (this.props.endTime.indexOf("pm") == -1) ? hour : hour + 12
      hour = (hour == 0) ? hour + 12 : hour
      endTime = moment(this.props.endDate).hour(hour).minute(min).second(0).format()

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
      var url = "https://app.sage.care/api/v1/cp/s/availabilities"
      var data = { method: 'POST', body: JSON.stringify(event), 
                   headers: App.headers(token) }
      var res =  await fetch(url, data)//.then(function(res) {
        if(res.status == 200) {
          res = await res.json()
          res = (event.recurring) ? res.availabilities : res.availability
          _this.props.addAvailability(res)
          Actions.pop()
        } else {
          res = await res.json()
          Alert.alert( 'Warning!', 'There was an error - please try again.',
          [ {text: 'Cancel', onPress: () => { }, style: 'cancel'},
            {text: 'Yes', onPress: () => { }}
          ])
        }
    }
  }
}

export default class AddAvailabilityModal extends React.Component {
  static propTypes = {
    addAvailability: React.PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)
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

    this.toggleRecurringPeriod = this.toggleRecurringPeriod.bind(this)
    this.toggleRecurring = this.toggleRecurring.bind(this)
    this.setRecurringPeriod = this.setRecurringPeriod.bind(this)
    this.datepicker = this.datepicker.bind(this)
    //this.startTime = this.startTime.bind(this)
    //this.endTime = this.endTime.bind(this)
    this.setTime = this.setTime.bind(this)
  }

  validateRecurringPeriod() {
  }

  toggleView = () => {
    this.setState({showView: !this.state.showView })
  }

  toggleRecurring = () => {
    this.setState({recurring: !this.state.recurring, setRecurringPeriod: true})
    if(!this.state.recurring) {
      this.setState({setRecurringPeriod: false, recurringPeriod: {}}) 
    }
  }

  toggleRecurringPeriod = () => {
    this.setState({setRecurringPeriod: !this.state.setRecurringPeriod})
  }

  async setTime (k) {
    var _this = this;
    try {
      const {action, hour, minute} = await TimePickerAndroid.open({
        hour: 14,
        minute: 0,
        is24Hour: true, // Will display '2 PM'
      });
      if (action !== TimePickerAndroid.dismissedAction) {
        // Selected hour (0-23), minute (0-59)
        minute = (minute < 10) ? "0"+minute : minute
        var dayTime = (hour < 12 ) ? " am" : " pm"
        hour = (hour < 12 ) ? hour : hour - 12
        hour = (hour == 0 ) ? hour + 12 : hour
        var time =  hour + ":" + minute + dayTime
        state = {}
        state[k] = time
        this.setState(state)
      }
    } catch ({code, message}) {
      console.warn('Cannot open time picker', message);
    }
  }

  async datepicker () {
    var _this = this;
    try {
      const {action, year, month, day} = await DatePickerAndroid.open({
        date: new Date()
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        var date = moment().year(year).month(month).date(day).valueOf()
        _this.setState({startDate: date});
      }
    } catch ({code, message}) {
      console.warn('Cannot open date picker', message);
    }
  }

  componentDidMount() {
    
  }

  render() {
    var height = Dimensions.get('window').height

    var recurringPeriodView = <View />
    if (this.state.setRecurringPeriod) {
      recurringPeriodView = <SetRecurringPeriodView 
        toggleRecurringPeriod={this.toggleRecurringPeriod} 
        toggleRecurring={this.toggleRecurring} 
        setRecurringPeriod={this.setRecurringPeriod} 
        currentPeriod={this.state.recurringPeriod} />
    } else {
      if (!_.isEqual({}, this.state.recurringPeriod)) {
        recurringPeriodView = <RecurringPeriodView recurringPeriod={this.state.recurringPeriod} />
      } else {
        recurringPeriodView = <View />
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
            <TouchableOpacity onPress={() => { this.setTime('startTime').done() } } style={{padding:15,marginTop:-15}}>
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
            <TouchableOpacity onPress={() => this.setTime('endTime')} style={{padding:15,marginTop:-15}}>
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
  static propTypes = {
    currentPeriod: React.PropTypes.string.isRequired,
    toggleRecurring: React.PropTypes.func.isRequired,
    setRecurringPeriod: React.PropTypes.bool.isRequired,
    toggleRecurringPeriod: React.PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    let { currentPeriod } = this.props
    this.state = {
      startDate: (currentPeriod.startDate) ? currentPeriod.startDate : 0,
      endDate: (currentPeriod.endDate) ? currentPeriod.endDate : 0
    }
    this.chooseRecurringStartDate = this.chooseRecurringStartDate.bind(this)
    this.chooseRecurringEndDate = this.chooseRecurringEndDate.bind(this)
  }

  async chooseRecurringStartDate () {
    var _this = this;
    try {
      const {action, year, month, day} = await DatePickerAndroid.open({
        date: new Date()
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        var date = moment().year(year).month(month).date(day).valueOf()
        _this.setState({startDate: date});

        _this.props.setRecurringPeriod({
          startDate: date, 
          endDate: _this.state.endDate
        })
      }
    } catch ({code, message}) {
      console.warn('Cannot open date picker', message);
    }
  }

  async chooseRecurringEndDate () {
    var _this = this;
    try {
      const {action, year, month, day} = await DatePickerAndroid.open({
        date: new Date()
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        var date = moment().year(year).month(month).date(day).valueOf()
        _this.setState({endDate: date});

        _this.props.setRecurringPeriod({
          startDate: _this.state.startDate, 
          endDate: date
        })
      }
    } catch ({code, message}) {
      console.warn('Cannot open date picker', message);
    }
  }


  render() {
    var startDate = this.state.startDate

    return (
      <View style={{backgroundColor:"#FFF6E2",borderWidth:1,borderColor:"#FFCE66",height:150,width:300,marginTop:10,borderRadius:3}}>
        <View style={{alignItems:"center",flexDirection:"row",justifyContent:"space-between",width:200,marginLeft:40,marginTop:20}}>
          <Text>Start Date</Text>
          <Text>End Date</Text>
        </View>

        <View style={{alignItems:"center",flexDirection:"row",
                  justifyContent:"space-between",width:250,marginLeft:20,
                  marginTop:0,marginBottom:10}}>

          {(startDate) ? <Button style={{marginTop:25,paddingTop:10,paddingBottom:10}} onPress={this.chooseRecurringStartDate}>{moment(this.state.startDate).format("MMM DD, YYYY")}</Button> : <TouchableOpacity onPress={this.chooseRecurringStartDate} 
              style={{marginTop:10}}> 
              <View style={{backgroundColor:"#676767",marginLeft:0,padding:5,
                borderRadius:3,marginTop:10,height:45,alignItems:"center",paddingTop:10,paddingLeft:10,paddingRight:10}}> 
                <Text style={{fontWeight:"bold",color:"white"}}>
                  Choose Date
                </Text> 
            </View> 
          </TouchableOpacity>}

          {(this.state.endDate) ? <Button style={{marginTop:25,paddingTop:10,paddingBottom:10}} onPress={this.chooseRecurringEndDate}>{moment(this.state.endDate).format("MMM DD, YYYY")}</Button> : <TouchableOpacity onPress={this.chooseRecurringEndDate} 
              style={{marginTop:10}}> 
              <View style={{backgroundColor:"#676767",marginLeft:0,padding:5,
                borderRadius:3,marginTop:10,height:45,alignItems:"center",paddingTop:10,paddingLeft:10,paddingRight:10}}> 
                <Text style={{fontWeight:"bold",color:"white"}}>
                  Choose Date
                </Text> 
            </View> 
          </TouchableOpacity> }
        </View>
      </View> 
    )
  }

  toggleRecurring = () => {
    this.props.toggleRecurring()
  }

  toggleRecurringPeriod = () => {
    this.props.toggleRecurringPeriod()
  }

  setRecurringPeriod = () => {
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
  static propTypes = {
    //recurringPeriod: React.PropTypes.object.isRequired
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
