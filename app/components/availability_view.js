import GiftedSpinner from 'react-native-gifted-spinner'
import Button from 'react-native-button'
import moment from "moment"
import Dimensions from 'Dimensions';
var FluxRouter = require('react-native-router-flux')
var { Actions } = FluxRouter
import App from "./globals"
import AvailabilityListView from "./availability_listview"
import _ from "underscore"
var store = require('react-native-simple-store')

import React, {
  Alert,
  TouchableOpacity,
  Text,
  PullToRefreshViewAndroid,
  View,
  ScrollView
} from 'react-native'

export default class AvailabilityView extends React.Component {
  constructor() {
    super()
    this.state = {
      date: false,
      startTime: false,
      endTime: false,
      recurringPeriod: [],
      events: [],
      setRecurringPeriod: true,
      page: 0, 
      empty: true,
      loading:true,
      loadingMore: false
    }
    this.deleteAvailability = this.deleteAvailability.bind(this)
    this.loadData = this.loadData.bind(this)
  }

  addAvailability = (event) => {
    this.setState({events: this.state.events.concat(event) })
  }

  async deleteAvailability(rowData) {
    let url = "https://app.sage.care/api/v1/cp/s/availabilities/"+rowData.id
    var _this = this;
    var current_events = this.state.events
    var token = await store.get("_token")
    fetch(url, { method: 'DELETE', headers: App.headers(token)}).then(function(res) {
      if(res.status == 200) {
        var events = _.reject(_this.state.events, function(event) {
          return event.the_id == rowData.the_id
        })
        _this.setState({events: events})
      } else {
          Alert.alert( 'Warning!', 'Unable to delete availability - please try again.',
          [ {text: 'Cancel', onPress: () => { }, style: 'cancel'},
            {text: 'OK', onPress: () => { }} ])
      }
    })
  }

  async loadData(page, replace) {
    page = (typeof(page) != "undefined") ? page : this.state.page
    var url = App.availability_url+`page=${page}&startDate=${moment().format('ddd MM-DD-YYYY HH:mm:ssZZ')}`
    var _this = this;
    var token = await store.get("_token")
    var res = await fetch(url, { method: 'GET', headers: App.headers(token)})
    if(res.status == 200) {
      var res = await res.json()
      var events = res.availabilities
      let empty = !events.length
      if(!replace)
        events = _this.state.events.concat(events)

      _this.setState({events: events, 
                      loading: false, 
                      page: _this.state.page + 1, 
                      loadingMore: false,
                      empty: empty })
    } else {
      _this.setState({error: true})
    }
  }

  componentDidMount() {
    this.loadData().done()
  }

  _press = () => {
    Actions.add_availability_modal({addAvailability: this.addAvailability})
  }

  render() {
    var btnColor = "#676767";
    var btnText = "Add New Availability";
    var height = Dimensions.get('window').height

    if(this.state.empty) {
      if(this.state.loading) {
        var loadingMore = <View />
      } else {
        loadingMore = <View style={{backgroundColor:"#bbb",alignSelf:"center",borderRadius:5,padding:15,marginTop:20,marginBottom:30}} onPress={this.loadMore}>
          <Text style={{color:"white",fontWeight:"bold",fontSize:16}}> No More Availabilities.</Text>
          </View> 
      }
    } else {
      if(!this.state.loadingMore) {
        loadingMore = <TouchableOpacity style={{backgroundColor:"#40BF93",borderRadius:5,padding:15,marginTop:20,alignSelf:"center",marginBottom:30}} onPress={this.loadMore}>
          <Text style={{color:"white",fontWeight:"bold",fontSize:16}}> Load More </Text>
        </TouchableOpacity> 
      } else {
        loadingMore = <GiftedSpinner style={{marginTop:20,marginBottom:30,height:20}}/>
      }
    }
    return (
      <View >
        <View style={{backgroundColor:"#F9F9F9",marginTop:3,marginLeft:3,height:70,borderBottomWidth:1,borderBottomColor:"#D2D2D2",alignItems:"center"}} >
          <TouchableOpacity onPress={this._press} >
                  <View style={{backgroundColor:btnColor,marginLeft:0,padding:5,borderRadius:3,marginTop:10,height:45,width:335,alignItems:"center",paddingTop:10}}> 
                    <Text style={{fontWeight:"bold",color:"white"}}> {btnText} </Text> 
                </View> 
            </TouchableOpacity> 
        </View>
      <PullToRefreshViewAndroid
        onRefresh={this.onRefresh}
        enabled={true}
        style={{backgroundColor:"white"}}>
        <ScrollView style={{height:height-220}}>
          <AvailabilityListView 
              loadData={this.loadData}
              paginate={this.paginate}
              deleteAvailability={this.deleteAvailability}
              events={this.state.events}/>
          {loadingMore}
        </ScrollView>
      </PullToRefreshViewAndroid>
      </View>
    )
  }

  loadMore = () => {
    this.setState({loadingMore: true})
    this.loadData()
  }

  onRefresh = () => {
    this.loadData(0, true).done()
  }
}
