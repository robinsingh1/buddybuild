var dismissKeyboard = require('react-native-dismiss-keyboard');
import Dimensions from 'Dimensions';
import Icon from 'react-native-vector-icons/FontAwesome'
import { Actions } from 'react-native-router-flux'

import React, {
  Text,
  TouchableOpacity,
  TextInput,
  View
} from 'react-native'

class TaskHeader extends React.Component {
  propTypes = {
    currentScreen: React.PropTypes.string.isRequired, 
    name: React.PropTypes.string.isRequired, 
    finish_note: React.PropTypes.string.isRequired
  }

  backPress() {
    dismissKeyboard()
    Actions.pop()
  }

  onPress = () => {
    dismissKeyboard()
    Actions.finish_note(this.props)
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

export default class OverallNote extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      text: ""
    }
  }

  render() {
    var height = Dimensions.get('window').height
    return (
      <View>
        <TaskHeader {...this.props} overallNote={this.state.text}/>
      <View style={{backgroundColor:"#F6F6FB",height:height - 85,paddingRight:20,paddingLeft:25,paddingTop:25}}>
        <Text style={{fontSize:18}}>Additional Notes</Text>
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
    )
    /*
          <AutoExpandingTextInput 
             placeholder={"Overall comments about today’s visit..."}
             enablesReturnKeyAutomatically={true}
             returnKeyType="done"
             value={this.state.value}
             category={this.state.category}
          />
    */
  }

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  }
}
