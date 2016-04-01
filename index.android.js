'use strict';
import moment from "moment"
import _ from "underscore"

import VisitSummary, {VisitHeader} from './app/components/visit_summary'
import Settings, { SettingsHeader } from "./app/components/settings"
import TaskScreen, { TaskHeader, } from "./app/components/task_screen"
import MapView, { MapHeader } from "./app/components/map_view"
import AddAvailabilityModal, { AddAvailabilityHeader } from "./app/components/add_availability_modal"

import MedicalSupplyNote from "./app/components/medical_note"
import OverallNote from "./app/components/overall_note"
import FinishNote from "./app/components/finish_note"
import SplashScreen from "./app/components/splash_screen"
import Login from "./app/components/login"
import UpcomingListView from "./app/components/upcoming_list_view"
import PastListView from "./app/components/past_list_view"
import AvailabilityView from "./app/components/availability_view"

var ScrollableTabView = require('react-native-scrollable-tab-view');
import Icon from 'react-native-vector-icons/FontAwesome'

import Dimensions from 'Dimensions';
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'

import React, { AppRegistry, StyleSheet, TouchableOpacity, Text, 
      Image, View, PullToRefreshViewAndroid, Navigator} from 'react-native' 

var FluxRouter = require('react-native-router-flux')
var { Actions, Route, Schema, Animations, TabBar} = FluxRouter;

function reducer(state = {}, action) {
    switch (action.type) {
        case Actions.BEFORE_ROUTE:
            //console.log("BEFORE_ROUTE:", action);
            return state;
        case Actions.AFTER_ROUTE:
            //console.log("AFTER_ROUTE:", action);
            return state;
        case Actions.AFTER_POP:
            //pastconsole.log("AFTER_POP:", action);
            return state;
        case Actions.BEFORE_POP:
            //console.log("BEFORE_POP:", action);
            return state;
        case Actions.AFTER_DISMISS:
            //console.log("AFTER_DISMISS:", action);
            return state;
        case Actions.BEFORE_DISMISS:
            //console.log("BEFORE_DISMISS:", action);
            return state;
        default:
            return state;
    }
}

let store = createStore(reducer);
const Router = connect()(require("react-native-router-flux").Router);

class Main extends React.Component {
  constructor() {
    super()
    this.state = {
      page: "upcoming",
      lastLoaded: 0,
      upcomingEvents: [],
      pastEvents: [],
    }
  }

  pastSelect = (el) => {
    this.setState({page: "past"});
  }

  upcomingSelect = (el) => {
    this.setState({page: "upcoming"});
  }

  onRefresh = () => {
    console.log("refresh")
    this.setState({lastLoaded: moment().valueOf()})
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

  loadEvents(page) {
    url = App.event_url+this.state.page
    url = App.past_event_url+this.state.page

    var _this = this;
    fetch(url, {method:'GET', headers: App.headers}).then(function(res) { 
      if(res.status != 200)
        _this.setState({error: true})

      if(res.status == 200) {
        events = _this.state.events.concat(JSON.parse(res._bodyText).events)
        _this.setState({loading: false, events: events,
                        dataSource: ds.cloneWithRowsAndSections(sorted_events) })
      }
    })
  }

  render() {
    var selected = {color:"#40BF93",textDecorationLine:"underline",textDecorationStyle:"solid",textDecorationColor:"#40BF93",fontWeight:"bold"}
    var unselected = {color:"#4A4A4A"}
    var sel = {marginTop: 0}; 
    var unsel = {marginTop:0, height:0, position:"absolute",left:10000}
    if(this.state.page == "upcoming") {
      var upcomingStyle = selected; var pastStyle = unselected; 
      var _upcomingStyle = sel; var _pastStyle = unsel; 
    } else {
      var upcomingStyle = unselected; var pastStyle = selected;
      var _upcomingStyle = unsel; var _pastStyle = sel; 
    }

    return (
      <ScrollableTabView style={{paddingTop: 0,backgroundColor:"white"}}
        tabBarBackgroundColor={"#40BF93"}
        tabBarInactiveTextColor={"white"}
        tabBarUnderlineColor={"#FFCE66"}
        tabBarActiveTextColor={"white"}>
        <View tabLabel='Visits'>
          <View style={{backgroundColor:"white"}}>
            <View style={{borderBottomWidth:1,borderColor:"#D2D2D2",backgroundColor:"#F0F0F0",height:60,flexDirection:"row",justifyContent:"space-between"}} >
            <TouchableOpacity onPress={this.upcomingSelect} ref="upcoming" name="upcoming" style={{padding:20,marginLeft:40}}>
              <Text name="upcoming" style={upcomingStyle}>UPCOMING</Text>
              {(this.state.page == "upcoming") ? <View style={{height:2,width:73,backgroundColor:"#40BF93"}}/> : <View /> }
            </TouchableOpacity>
            <TouchableOpacity onPress={this.pastSelect} ref="past" name="past" style={{padding:20,marginRight:60}}>
              <Text name="past" style={pastStyle}>PAST</Text>
              {(this.state.page == "past") ? <View style={{height:2,width:33,backgroundColor:"#40BF93"}}/> : <View /> }
            </TouchableOpacity>
          </View>

    {(this.state.page == "upcoming") ? <UpcomingListView 
                  page={this.state.page}
                  lastLoaded={this.state.lastLoaded} 
                  upcomingEvents={this.state.upcomingEvents}/> :
                <PastListView  
                  page={this.state.page}
                  lastLoaded={this.state.lastLoaded} 
                  pastEvents={this.state.pastEvents} /> }
          </View>
        </View>
        <View tabLabel='Availability'>
          <AvailabilityView />
        </View>
      </ScrollableTabView>
    )
  }
}

var Header = React.createClass({
  gotoSettings: function() {
    Actions.settings()
  },

  render: function() {
    return (
      <View style={{height:60,backgroundColor:"#40BF93",alignItems:"center",paddingTop:20}}>
        <View style={{position:"absolute",top:0}}>
          <TouchableOpacity onPress={this.gotoSettings}
            style={{padding:20,paddingLeft:15}}>
            <Icon name="gear" size={23} color="white" />
          </TouchableOpacity>
        </View>
        <View >
          <Image source={require("./app/components/img/sage-logo-white@2x.png")}></Image>
        </View>
      </View>
    )
  }
})

var AwesomeProject = React.createClass({
//var SageCare = React.createClass({
  render: function() {
    return (
      <Provider store={store} >
        <Router hideNavBar={true} name="root">
          <Schema name="modal" sceneConfig={Navigator.SceneConfigs.FloatFromBottom}/>
          <Schema name="default" sceneConfig={Navigator.SceneConfigs.FloatFromRight} navigationBarStyle={{backgroundColor: '#40BF93'}} />
          <Schema name="default_secondary" sceneConfig={Navigator.SceneConfigs.FloatFromRight} navigationBarStyle={{backgroundColor: '#ffffff'}}   />
          <Schema name="settings" sceneConfig={Navigator.SceneConfigs.FloatFromLeft} navigationBarStyle={{backgroundColor: '#40BF93'}} />
          <Schema name="withoutAnimation"/>

          <Route name="launch" schema="default" component={Main} initial={true} title="SAGE" header={Header} />
          <Route name="map_detail" schema="default" component={MapView} initial={false} title="SAGE" header={MapHeader} />
          <Route name="splash" schema="default" component={SplashScreen} initial={false} title="SAGE" />
          <Route name="notes_screen" component={TaskScreen} initial={false} />
          <Route name="next_notes_screen" component={TaskScreen}  />
          <Route name="medical_supplies" component={MedicalSupplyNote} initial={false}/>
          <Route name="overall_notes" component={OverallNote} initial={false}/>
          <Route name="finish_note" component={FinishNote} initial={false}/>
          <Route name="add_availability_modal" component={AddAvailabilityModal} schema="modal" initial={false}/>
          <Route name="settings" initial={false} component={Settings} header={SettingsHeader} schema="settings"/>
          <Route name="visit_summary" initial={false} component={VisitSummary} header={VisitHeader}/>
          <Route name="login" hideNavBar={true} initial={false} component={Login} schema="modal" />
      </Router>
    </Provider>
    )
  }
})

var styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  navBar: {
    height: 64,
    backgroundColor: '#CCC'
  },
  header: {
    backgroundColor: 'white',
    padding: 10,
  },
  headerTitle: {
    color: '#black',
    fontSize:18,
  },
  row: {
    padding: 12,
    height: 105,
    margin:5,
    borderRadius:3,
    borderColor: "#eee",
    borderWidth:1,
    shadowColor:"#000",
    shadowOpacity:1,
    shadowOffset:{width:5,height:5},
  },
};

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
//AppRegistry.registerComponent('SageCare', () => SageCare);
