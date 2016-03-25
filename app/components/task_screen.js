import _ from "underscore"
import { Actions } from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/Ionicons'
import Dimensions from 'Dimensions';

import React, {
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native'

export class TaskHeader extends React.Component {
  propTypes = {
    tasks: React.propTypes.String.isRequired,
    name: React.propTypes.String.isRequired,
    text: React.propTypes.String.isRequired,
    finish_note: React.propTypes.boolean.isRequired,
    currentScreen: React.propTypes.String.isRequired
  }

  backPress() {
    Actions.pop()
  }

  onPress() {
    let tasks = this.props.tasks
    this.props.tasks[this.props.currentScreen].notes = this.props.text 
    this.props.tasks[this.props.currentScreen].completed = true

    if(tasks.length - 1 == this.props.currentScreen){
      Actions.medical_supplies(this.props)
    } else {
      var props = _.clone(this.props)
      props["currentScreen"] = props["currentScreen"] + 1
      Actions.next_notes_screen(props)
    }
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

export default class TaskScreen extends React.Component {
  propTypes = {
    tasks: React.propTypes.string.isRequired,
    name: React.propTypes.string.isRequired,
    text: React.propTypes.string.isRequired,
    finish_note: React.propTypes.boolean.isRequired,
    currentScreen: React.propTypes.string.isRequired,
    screen: React.propTypes.string.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      text: ""
    }
  }

  imagePress() {
    var _finished = !this.state.finished
    this.setState({finished: _finished})
  }

  capitalize(string) {
    if(string)
      return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
    else
      return ""
  }

  render() {
    let height = Dimensions.get('window').height
    let icons = {
      'entry':  <Image style={{position:"absolute",left:55,top:20}} source={require("./img/icon-entry@2x.png")} />,
      'alerts':  <Image style={{position:"absolute",left:55,top:20}} source={require("./img/icon-warning@2x.png")} />,
      'housekeeping':  <Image style={{position:"absolute",left:55,top:20}} source={require("./img/icon-broom@2x.png")} />,
      'medication': <Image style={{position:"absolute",left:55,top:20}} source={require("./img/icon-reminders@2x.png")} />,
      'meal': <Image style={{position:"absolute",left:55,top:20}} source={require("./img/icon-meal@2x.png")} />,
      'grooming': <Image style={{position:"absolute",left:55,top:20}} source={require("./img/icon-shower@2x.png")} />,
      'activity': <Image style={{position:"absolute",left:55,top:20}} source={require("./img/icon-exercise@2x.png")} />,
      'transportation': <Image style={{position:"absolute",left:55,top:20}} source={require("./img/icon-transportation@2x.png")} />,
      'other': <Image style={{position:"absolute",left:55,top:20}} source={require("./img/icon-check@2x.png")} />
    }

    return (
      <ScrollView>
        <TaskHeader {...this.props} text={this.state.text}/>
      <View style={{backgroundColor:"#F6F6FB",height:height - 85}}>
        <TouchableOpacity onPress={this.imagePress} >
        <View style={{backgroundColor:"white",marginLeft:20,marginRight:20,borderRadius:5,marginTop:20,padding:10}}>
          <Icon name={(!this.state.finished) ? "android-checkbox-outline-blank" : "android-checkbox"} size={33} color="#38C092" style={{position:"absolute",top:20,left:20}}/>
            {icons[this.props.tasks[this.props.currentScreen].category] }
          <View style={{marginLeft:100,marginTop:0}}>
            <Text style={{color:"#40BF93",fontSize:20}}>
              {this.capitalize(this.props.tasks[this.props.currentScreen].category)}
            </Text>
            <Text style={{width:200}}>
              {this.capitalize(this.props.tasks[this.props.currentScreen].details)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

        <View style={{marginLeft:20,marginRight:20,marginTop:20}}>
          <Text style={{color:"#BEBEBE"}}>Notes:</Text>
         <TextInput
           multiline={true}
           numberOfLines={10}
           autoFocus={false}
           onChange={(event) => {
             this.setState({ text: event.nativeEvent.text })
           }}
          />
          
        </View>
      </View>
    </ScrollView>
    )
  }
}
