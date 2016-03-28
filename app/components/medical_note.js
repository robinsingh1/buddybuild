import Button from "react-native-button"
var dismissKeyboard = require('react-native-dismiss-keyboard');
import Icon from 'react-native-vector-icons/FontAwesome'
import Dimensions from 'Dimensions';
import { Actions } from 'react-native-router-flux'
import _ from "underscore"
var KeyboardSpacer = require('react-native-keyboard-spacer');

import React, {
  TouchableOpacity,
  Text,
  TextInput,
  View,
  ScrollView
} from 'react-native'


class TaskHeader extends React.Component {
  propTypes = {
    currentScreen: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    finishNote: React.PropTypes.bool.isRequired,
  }

  backPress() {
    dismissKeyboard()
    Actions.pop()
  }

  onPress() {
    dismissKeyboard()
    Actions.overall_notes(this.props)
  }

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  }

  render() {
    return (
      <View style={{height:60,backgroundColor:"#425869",alignItems:"center",paddingTop:20}}>
        <View style={{position:"absolute",left:10,top:0}}>
          <TouchableOpacity onPress={this.backPress} style={{padding:17}}>
            <Icon name="chevron-left" size={15} color="#fff" 
                style={{marginRight:5,marginTop:2,position:"absolute",left:0,top:21}}/>
              <Text style={{color:"white",fontWeight:"bold",fontSize:18}}>
            {(this.props.currentScreen) ? "Back" : "Cancel"}
            </Text>
          </TouchableOpacity>

        </View>
        <View >
          <Text style={{fontSize:20,color:"white",fontWeight:"bold"}}>
            {this.props.name}
          </Text>
        </View>
        <View style={{position:"absolute",right:10,top:0}}>
          {(!this.props.finish_note) ?  <TouchableOpacity onPress={this.onPress} style={{padding:17}}>
            <Icon name="chevron-right" size={15} color="#40BF93" 
                style={{marginRight:5,marginTop:2,position:"absolute",right:0,top:21}}/>
              <Text style={{color:"#40BF93",fontWeight:"bold",fontSize:18}}>
                Continue
            </Text> 
          </TouchableOpacity> : <View />}
        </View>
      </View>
    )
  }
}

export default class MedicalSupplyNote extends React.Component {
  constructor() {
    super()
    this.state = {
      medicalNotes: [1],
      supplyNotes: [1],
      medicalValues: {},
      supplyValues: {}
    }
  }

  componentDidMount() {

  }

  addMedicalNotes = () => {
    var notes = this.state.medicalNotes
    notes = notes.concat(1)
    this.setState({medicalNotes: notes})
  }

  addSupplyNotes = () => {
    var notes = this.state.supplyNotes
    notes = notes.concat(1)
    this.setState({supplyNotes: notes})
  }

  enterSupply = (event) => {
    let supplyValues = this.state.supplyValues
    supplyValues[event.nativeEvent.target] = event.nativeEvent.text
    this.setState({supplyValues: supplyValues})
  }

  enterMedical = (event) => {
    let medicalValues = this.state.medicalValues
    medicalValues[event.nativeEvent.target] = event.nativeEvent.text
    this.setState({medicalValues: medicalValues})
  }

  render() {
    var height = Dimensions.get('window').height

    var _this = this;
    var inputs = _.map(_.range(this.state.medicalNotes.length), function(a, b) {
      var style = {marginLeft:50}
      return ( 
        <TextInput placeholder={"Eggs.."} key={b} 
                   onChange={(event) => { _this.enterMedical(event) }}
                   underlineColorAndroid={"#C8C8C8"} style={style} />
      )
    })

    let supplyInputs = _.map(this.state.supplyNotes,function(a,b){
      return ( 
        <TextInput placeholder={"Eggs.."} 
                   style={{marginLeft:50}} key={b} 
                   onChange={(event) => { _this.enterSupply(event) }} />
      )
    })

    return (
      <View style={{backgroundColor:"#F6F6FB",height:height}}>
        <TaskHeader {...this.props} 
                    medicalValues={this.state.medicalValues}
                    supplyValues={this.state.supplyValues}/>
      <ScrollView style={{backgroundColor:"#F6F6FB",height:height-300}}>
            <View style={{borderColor:"#626262",borderBottomWidth:1,margin:15}}>
              <Text style={{fontSize:18}}>
                Add Observations</Text>
            </View>
            { inputs } 
            <Button onPress={this.addMedicalNotes} >
              <View style={{borderWidth:1,borderStyle:"dashed",borderColor:"#979797",
                padding:10,marginLeft:100,marginRight:15,borderRadius:5,alignItems:"center",
                backgroundColor:"#FFFFFF"}}>
                <Text style={{color:"#626262",fontSize:14}}>Add Another Note</Text>
              </View>
            </Button>
        <View style={{borderColor:"#626262",borderBottomWidth:1,margin:15}}>
          <Text style={{fontSize:18}}> {"Add Low-Running Supplies & Food"} </Text>
        </View>
            {supplyInputs}
            <KeyboardSpacer />
            <TouchableOpacity onPress={this.addSupplyNotes} >
              <View style={{borderWidth:1,borderStyle:"dashed",borderColor:"#979797",
                          padding:10,marginLeft:100, marginRight:15,borderRadius:5,
                          alignItems:"center",backgroundColor:"#FFFFFF",marginBottom:100}}>
                <Text style={{color:"#626262",fontSize:14}}>Add Another Note</Text>
              </View>
            </TouchableOpacity>
      </ScrollView>
    </View>
    )
  }
}
