import _ from "underscore"
import Icon from 'react-native-vector-icons/FontAwesome'
import moment from "moment"
var mtz = require('moment-timezone');
import GiftedSpinner from 'react-native-gifted-spinner'

import React, {
  Text, 
  View, 
  Alert,
  ListView,
  ScrollView,
  TouchableHighlight
} from 'react-native'

var ds = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2,
  sectionHeaderHasChanged: (s1, s2) => s1 !== s2
})

export default class AvailabilityListView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      events:[],
      page:0,
      dataSource: ds.cloneWithRowsAndSections({}),
      loading: true,
      loadingMore: false
    }
    this.renderRow = this.renderRow.bind(this)
  }

  componentWillReceiveProps(newProps, b) {
    this.setState({
      dataSource: ds.cloneWithRowsAndSections(this.sortEvents(newProps.events)),
      events: newProps.events,
      loading: false,
    })
  }

  deleteRow = (rowData) => {
    var _this = this;
    Alert.alert( 'Warning!', 'Are you sure you want to delete this availability?',
      [ {text: 'Cancel', onPress: () => console.log('Cancel'), style: 'cancel'},
        {text: 'Yes', onPress: () => { 
          _this.props.deleteAvailability(rowData).done()
        }}
      ])
  }

  addRow = (event) => {
    this.setState({dataSource: ds.cloneWithRows([0,1,2,3,4])})
  }

  groupWeek(value, index, array) {
    var byweek = {}
    let d = new Date(value['startTime']);
    d = Math.floor(d.getTime()/(1000*60*60*24*7));
    byweek[d]=byweek[d]||[];
    byweek[d].push(value);
  }

  render() {
    return (
        <ScrollView>
        {(this.state.loading) ? <GiftedSpinner style={{height:20,marginTop:20}}/> : <View />}
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
            renderSectionHeader={this.renderSectionHeader}
            refreshDescription="Refreshing articles"
          />
        </ScrollView>
    )
  }

  loadData = () => {
    this.props.loadData()
  }

  sortEvents = (events) => {
    var formatOfDates = 'dddd MMM Do';
    var byweek = {}
    _.map(events, function(value) {
      value["timestamp"] = moment(value["startTime"]).unix()
      let d = new Date(value['startTime']);
      d = moment(d).week() - 1
      byweek[d]=byweek[d]||[];
      byweek[d].push(value);
    })

    var events = _.map(events, function(event) {
      return _.extend(event, {the_id: Math.random().toString(36).substring(7)})
    })

    var sorted_events = {}
    _.map(_.keys(byweek), function(key) {
      var val = byweek[key]
      var year = moment(val[0].startTime).year()
      var d1 = moment().year(year).dayOfYear((key-1)*7).format("MMM D")
      var d2 = moment().year(year).dayOfYear(key*7).format("MMM D")
      sorted_events[d1+" - "+d2] = _.sortBy(byweek[key],  "timestamp")
    })
    return sorted_events
  }

  renderSectionHeader(sectionData, sectionID) {
    return (
      <View style={{backgroundColor:"white"}}>
        <Text style={{fontSize:20,marginLeft:10,marginTop:10,marginBottom:10,color:"#40BF93"}}>{sectionID}</Text>
      </View>
    )
  }

  renderRow(rowData) {
    var year = moment(rowData.startTime).year()
    var day = moment(rowData.startTime).year(year).format("ddd, MMM D")
    return ( <View 
        style={styles.row} 
         >  
        <View style={{flexDirection:'column',height:100}}>
          <View style={{justifyContent:"space-between",flexDirection:'row',
                        padding:12}}>
            <View>
              <Text style={{fontSize:18,marginTop:20,marginLeft:30}}>
                {day}
              </Text>
            </View>

            <View style={{marginTop:15,marginRight:20}}>
              <View style={{justifyContent:"space-between",flexDirection:"row",
                            marginRight:20}}>
                  <Text style={{fontSize:12,textAlign:"center",width:100}}>
                    {"From " +mtz(rowData.startTime).tz('America/Toronto').format('h:mm A').toString()}
                    </Text>
              </View>
              <View style={{flexDirection:"row"}}>
                  <Text style={{fontSize:12,textAlign:"center",width:100}}>
                    {"to " + mtz(rowData.startTime).add(rowData.duration,'h').format('h:mm A').toString()}
                  </Text>
              </View>
            </View>
            <TouchableHighlight
              underlayColor='#fff'
              onPress={() => this.deleteRow(rowData)}
              style={{padding:20,position:"absolute",top:0,right:0}}
              >
              <Icon name="times" size={13} color="#ccc" 
                  style={{marginLeft:35,marginTop:15}}/>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    )
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
    color:"#40BF93",
    fontSize:18
  },
  row: {
    //padding: 12,
    height: 90,
    elevation:2,
    margin:5,
    borderRadius:3,
    borderColor: "#ccc",
    backgroundColor:"white",
    borderWidth:1,
    shadowColor:"#000",
    shadowOpacity:1,
    shadowOffset:{width:5,height:5}
  }
};
