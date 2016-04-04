import Button from "react-native-button"
import moment from "moment"
import { Actions } from 'react-native-router-flux'
import App from "./globals"
import _ from "underscore"
import Dimensions from 'Dimensions';
import GiftedSpinner from 'react-native-gifted-spinner'
var mtz = require('moment-timezone');
var store = require('react-native-simple-store')

import React, {
  Text, 
  ListView,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  PullToRefreshViewAndroid,
  View
} from 'react-native'

var ds = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2,
  sectionHeaderHasChanged: (s1, s2) => s1 !== s2
})

export default class UpcomingListView extends React.Component {
  static propTypes = {
    page: React.PropTypes.string.isRequired
  }

  constructor() {
    super()
    this.state = { 
      events:[],
      page:0,
      lastLoaded: 0,
      dataSource: ds.cloneWithRowsAndSections({}),
      loading: true,
      empty:true,
    }
    this._onPress = this._onPress.bind(this)
    this.renderRow = this.renderRow.bind(this)
    this.loadEvents = this.loadEvents.bind(this)
  }

  _onPress(rowData) {
    let name = (rowData.Client.gender == "M") ? "Mr. " : "Ms. "
    name = name + rowData.Client.lastName
    let data = {completed: rowData.checkoutTime, name: name}
    data = _.extend(rowData, data)
    Actions.visit_summary({lol:"lmao", data: rowData, name: name, completed: rowData.checkOutTime})
  }

  renderRow(rowData) {
    let client = rowData.Client
    client.gender = (client.gender) ? client.gender : "M"
    return (
      <TouchableHighlight 
        style={styles.row} 
        onPress={() => { this._onPress(rowData) }}
        underlayColor='#c8c7cc' >
        <View style={{flexDirection:'row'}}>
          <View>
            <Text style={{fontSize:18}}>
              {(client.gender == "M") ? "Mr. " : "Ms."} {client.lastName}
            </Text>
            <Text style={{fontSize:12}}>{client.streetAddress1}</Text>
            <Text style={{fontSize:12}}>
              {client.addressLocality+", "+client.addressRegion+", "+client.postalCode}
            </Text>
            <Text style={{marginTop:5,fontSize:12,color: "#40BF93"}}>
              {_.map(_.pluck(rowData.Tasks,"category"), function(string) { 
                  return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
                }).join(", ")
              }
            </Text>
          </View>
          <View style={{position:"absolute",top:22,right:10}}>
            <View style={{flexDirection:"row"}}>
              <View style={{height:10,width:10,borderRadius:5,marginTop:4,marginRight:10,
                    backgroundColor:"#40BF93"}}/>
                <Text style={{color:"#40BF93",fontSize:12,width:60}}>
                  {mtz(rowData.startTime).tz("America/Toronto").format("h:mm A").toString()}  
                </Text>
              </View>
            <View style={{flexDirection:"row"}}>
              <View style={{height:10,width:10,borderRadius:5,marginTop:4,marginRight:10,
                    backgroundColor:"#F02200"}}/>
                <Text style={{color:"#F02200",fontSize:12,width:60}}>
                  {mtz(rowData.startTime).add(rowData.duration,'h').tz("America/Toronto").format('h:mm A').toString()}
                </Text>
              </View>
            </View>
        </View>
      </TouchableHighlight>
    );
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

  async loadEvents (page, replace) {
    page = (typeof(page) == "undefined") ? this.state.page : page
    var _this = this;
    var token = await store.get("_token")
    var url = App.event_url+`page=${page}&startDate=${moment().format('ddd MM-DD-YYYY HH:mm:ssZZ')}`
    var res = await fetch(url, {headers: App.headers(token)})
    if(res.status != 200) {
      _this.setState({error: true,loading:false})
    }
    if(res.status == 200) {
      var res = await res.json();
      //console.log(res)
      events = res.events
      let empty = !events.length
      events = (replace) ? events : _this.state.events.concat(events) 
      events = _.sortBy(events, function(e) { return moment(e.startTime) })

      let sorted_events = _.groupBy(events, function(event) {
        return moment(event.startTime).format('dddd MMM Do').toString()
      })
      _this.setState({loading: false,
                      events: events,
                      loadingMore: false,
                      empty: empty,
                      page: page + 1,
                      dataSource: ds.cloneWithRowsAndSections(sorted_events) })
    }
  }

  //componentWillReceiveProps (a, b) {
  shouldComponentUpdate (a, b) {
    //if(a.lastLoaded != b.lastLoaded) {
    //if(this.props.page == "upcoming") {
    //console.log("should component update?")
    return a.page != b.page
    /*
      if(a.page != b.page) {
        this.setState({loading:true})
        this.loadEvents(0, true)
      }
    */
      //}
  }

  //componentWillMount() {
  componentDidMount() {
    this.loadEvents().done()
  }

  renderSectionHeader (sectionData, sectionID) {
    return (
      <View style={{backgroundColor:"white"}}>
        <Text style={{fontSize:20,marginLeft:10,marginTop:20,marginBottom:2,
          color:"#40BF93"}}>{sectionID}</Text>
      </View>
    )
  }

  onRefresh = () => {
    this.setState({loading: true})
    this.loadEvents(0, true)
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
        <ScrollView style={{height: height-185}}>
        {(this.state.loading) ? <GiftedSpinner style={{height:20,marginTop:20}}/> : <View />}
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
            renderSectionHeader={this.renderSectionHeader}
            refreshDescription="Refreshing articles"
          />
          { loadingMore }
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
    padding: 12,
    elevation:2,
    height: 105,
    margin:5,
    borderRadius:3,
    borderColor: "#eee",
    borderWidth:1,
    backgroundColor:"white",
    shadowColor:"#000",
    shadowOpacity:1,
    shadowOffset:{width:5,height:5}
  }
};
