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
      empty: false,
      loadingMore: false
    }
  }

  addAvailability(event) {
    this.setState({events: this.state.events.concat(event) })
  }

  async deleteAvailability(rowData) {
    let url = "http://dev.sage.care/api/v1/cp/s/availabilities/"+rowData.id
    var _this = this;
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
    fetch(url, { method: 'GET', headers: App.headers(token)}).then(function(res) {
      if(res.status == 200) {
        var events = JSON.parse(res._bodyText).availabilities
        let empty = events.length
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
    })
  }

  componentWillMount() {
    this.loadData(0)
  }

  _press() {
    Actions.add_availability_modal({addAvailability: this.addAvailability})
  }

  render() {
    var btnColor = "#676767";
    var btnText = "Add New Availability";
    var height = Dimensions.get('window').height

    let loadingMore = <View />
    if(this.state.empty) {
      if(!this.state.loadingMore) {
        let loadingMore = <Button style={{color:"#bbb",marginTop:10,marginBottom:10}} onPress={this.loadMore}>Load More</Button> 
      } else {
        let loadingMore = <GiftedSpinner />
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
        <ScrollView style={{height:height-210}}>
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

  loadMore() {
    this.setState({loadingMore: true})
    this.loadData()
  }

  onRefresh() {
    this.loadData(0, true)
  }
}
