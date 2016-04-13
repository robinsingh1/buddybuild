import Dimensions from 'Dimensions';
import Button from "react-native-button"
import _ from "underscore"
import moment from "moment"
import { Actions } from 'react-native-router-flux'
import App from "./globals"
import GiftedSpinner from 'react-native-gifted-spinner'
var mtz = require('moment-timezone')
var store = require('react-native-simple-store')

import React, {
  ListView,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  Text,
  PullToRefreshViewAndroid,
  View
} from 'react-native'

var ds = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2,
  sectionHeaderHasChanged: (s1, s2) => s1 !== s2
})

export default class PastListView extends React.Component {
  constructor() {
    super()
    this.state = { 
      events:[],
      page:0,
      dataSource: ds.cloneWithRowsAndSections({}),
      loading: true,
      isRefreshing: false,
      empty: true
    }
    this._onPress = this._onPress.bind(this)
    this.capitalize = this.capitalize.bind(this)
    this.renderRow = this.renderRow.bind(this)
    this.renderSectionHeader = this.renderSectionHeader.bind(this)
    this.loadEvents = this.loadEvents.bind(this)
  }

  _onPress(rowData) {
    let name = (rowData.Client.gender == "M") ? "Mr. " : "Ms. "
    name = name + rowData.Client.lastName
    Actions.visit_summary({title:name, completed: true, 
        name: name, 
        data: rowData
    })
  }

  renderRow(rowData) {
    let client = rowData.Client
    client.gender = (client.gender) ? client.gender : "M"
    
    var actualDuration = ""
    if(rowData.checkOutTime) {
      let diff = moment(rowData.checkInTime).diff(moment(rowData.checkOutTime))
      let duration = moment.duration(diff)._data

      if(duration.days) 
        actualDuration = Math.abs(duration.days) + " days " 
      if(duration.hours)
        actualDuration = actualDuration + Math.abs(duration.hours) + " hours " 
      if(duration.minutes)
        actualDuration = actualDuration + Math.abs(duration.minutes) + " mins"

    } else {
      let actualDuration = ""
    }

    return (
      <TouchableHighlight 
        style={styles.row} 
        underlayColor='#c8c7cc'
        onPress={() => { this._onPress(rowData) }} >  
        <View style={{flexDirection:'column'}}>
          <View style={{justifyContent:"space-between",flexDirection:'row',padding:12,elevation:4}}>
            <View>
              <Text style={{fontSize:18}}>
                {(client.gender == "M") ? "Mr. " : "Ms."} 
                {client.lastName}
              </Text>
              <Text style={{fontSize:12}}>{client.streetAddress1}</Text>
              <Text style={{fontSize:12}}>
          {client.addressLocality+", "+client.addressRegion+", "+client.postalCode}
              </Text>
            </View>

            <View style={{marginTop:22,elevation:5}}>
              <View style={{justifyContent:"space-between",flexDirection:"row",marginRight:20}}>
              <View style={{height:10,width:10,borderRadius:5,marginTop:4,marginRight:10, backgroundColor:"#40BF93"}}/>
                <Text style={{color:"#40BF93",fontSize:12}}>{mtz(rowData.startTime).tz("America/Toronto").format('h:mm A').toString()}</Text>
              </View>
              <View style={{flexDirection:"row"}}>
              <View style={{height:10,width:10,borderRadius:5,marginTop:4,marginRight:10, backgroundColor:"#F02200"}}/>
                <Text style={{color:"#F02200",fontSize:12}}>{mtz(rowData.startTime).add(rowData.duration,'h').tz("America/Toronto").format('h:mm A').toString()}</Text>
              </View>
            </View>
          </View>
          <View style={{flexDirection:'row',justifyContent:"space-between",
            backgroundColor:"#494949", padding:12,paddingRight:25,
            borderBottomLeftRadius:5,borderBottomRightRadius:5,
            borderTopLeftRadius:0, borderRadius:5,borderTopRightRadius:0,marginTop:4}}>
            <View>
              <Text style={{fontSize:14,color:(rowData.status != "cancelled") ? "#40BF93" : "#FFCE66"}}>{this.capitalize(rowData.status)}</Text>
              <Text style={{fontSize:12,color:"white",height:15}}>
                {(rowData.status != "cancelled") ? "Duration: "+actualDuration : ""}
              </Text>
            </View>
            <View style={{marginTop:2,marginLeft:165,position:"absolute",right:30}}>
              <View style={{flexDirection:"row"}}>
                <Text style={{color:"white",fontSize:12}}>{(rowData.checkInTime) ? mtz(rowData.checkInTime).tz('America/Toronto').format('h:mm A').toString() : ""}</Text>
              </View>
              <View style={{flexDirection:"row"}}>
                <Text style={{color:"white",fontSize:12}}>{(rowData.checkOutTime) ? mtz(rowData.checkOutTime).tz('America/Toronto').format('h:mm A').toString() : ""}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  }

  updateCheckedinState(id, time) {
    var events = this.state.events
    events = _.map(events, function(event) {
      if(event.id == id) {
        event.checkInTime = time
        return event
      }
      return event
    })
  }

  sortEvents(events) {
    var sorted_events = {},
    formatOfDates = 'dddd MMM Do';
    _.map(events, function(visit){ 
      var date = moment(visit.startTime).format(formatOfDates).toString()
      if(!sorted_events[date] || !sorted_events[date].length) 
          sorted_events[date] = [];
      sorted_events[date].push(visit);
    });
  }

  async loadEvents(page, replace) {
    page = (typeof(page) == "undefined") ? this.state.page : page
    var _this = this;
    var token = await store.get("_token")
    var url = App.event_url+`page=${page}&endDate=${moment().hours(0).minutes(0).seconds(0).format('ddd MM-DD-YYYY HH:mm:ssZZ')}`
    var res = await fetch(url, {headers: App.headers(token)})
    if(res.status != 200) {
      this.setState({error: true, loading:false})
    }

    if(res.status == 200) {
      var res = await res.json();
      events = res.events
      let empty = !events.length
      events = (replace) ? events : _this.state.events.concat(events) 
      events = _.sortBy(events, function(e) { return moment(e.startTime) })
      var events = events.reverse()
      sorted_events = _.groupBy(events, function(event) {
        return moment(event.startTime).format('dddd MMM Do').toString()
      })
      this.setState({loading: false, 
                      events: events,
                      loadingMore: false,
                      empty: empty,
                      page: page + 1,
                      dataSource: ds.cloneWithRowsAndSections(sorted_events) 
      })
    }
  }

  //componentWillReceiveProps(a, b) {
  shouldComponentUpdate (a, b) {
    return a.page != b.page
    /*
    if(a.lastLoaded != b.lastLoaded) {
      if(this.props.page == "past") {
        this.setState({loading:true})
        this.loadEvents(0, true)
      }
    }
    */
  }

  //componentWillMount() {
  componentDidMount() {
    this.loadEvents().done()
  }

  renderSectionHeader(sectionData, sectionID) {
    return (
      <View style={{backgroundColor:"white"}}>
        <Text style={{fontSize:20,marginLeft:10,marginTop:20,marginBottom:2,
          color:"#40BF93"}}>{sectionID}</Text>
      </View>
    )
  }

  onRefresh = () => {
    this.setState({loading: true})
    this.loadEvents(0, true).done()
  }

  render() {
    var height = Dimensions.get('window').height

    if(this.state.empty) {
      if(this.state.loading) {
        var loadingMore = <View />
      } else {
        loadingMore = <View style={{backgroundColor:"#bbb",alignSelf:"center",borderRadius:5,padding:15,marginTop:20,marginBottom:30}} onPress={this.loadMore}>
          <Text style={{color:"white",fontWeight:"bold",fontSize:16}}> No More Events.</Text>
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
        <PullToRefreshViewAndroid
          onRefresh={this.onRefresh}
          style={{backgroundColor:"white"}}>
        <ScrollView style={{height: height - 185}}>
        {(this.state.loading) ? <GiftedSpinner style={{height:20,marginTop:20}}/> : <View />}
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
            renderSectionHeader={this.renderSectionHeader}
            refreshDescription="Refreshing articles" />
          {loadingMore}
        </ScrollView>
        </PullToRefreshViewAndroid>
    )
  }
  
  loadMore = () => {
    this.setState({loadingMore: true})
    this.loadEvents()
  }
}

var styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  navBar: {
    height: 64,
    backgroundColor: '#CCC'
  },
  header: {
    backgroundColor: 'white',
    padding: 10
  },
  headerTitle: {
    color: '#black',
    fontSize:18
  },
  row: {
    //padding: 12,
    height: 141,
    elevation:2,
    margin:5,
    borderRadius:3,
    borderColor: "#eee",
    borderWidth:1,
    shadowColor:"#000",
    shadowOpacity:1,
    shadowOffset:{width:5,height:5}
  },
};
