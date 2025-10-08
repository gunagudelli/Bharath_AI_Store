import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MyAgent from '../userflow/MyAgent'

const explore = () => {
  return (
    <View style={styles.container}>
      <MyAgent />
    </View>
  )
}

export default explore

const styles = StyleSheet.create({
  container:{
    flex:1,
    // justifyContent:'center',
    // alignItems:'center',
    // backgroundColor:'#f0f0f0'
  }
})