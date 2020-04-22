import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { FadeInView, Icon, Text } from '../common';
import { Strings } from '../../locale/LocaleData';
import { IS_SMALL_SCREEN } from '../../constants/Constants';

interface Props {
  strings: Strings
}

const NoData = ({ strings: { scanHome: { noData, noDataDesc1, noDataDesc2 } } }: Props) => {
  return (
    <FadeInView style={styles.container}>
      <Icon source={require('../../assets/main/noData.png')} width={IS_SMALL_SCREEN ? 80 : 113} height={IS_SMALL_SCREEN ? 100 : 143} />

      <View>
        <Text style={{ ...styles.text, fontSize: 22 }} bold>{noData}</Text>
        <Text style={styles.text}>{noDataDesc1}</Text>
        <Text style={styles.text} bold>{noDataDesc2}</Text>
      </View>

      <View />
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 50
  },
  text: {
    marginBottom: 20,
    lineHeight: 20
  }
});

export default connect(null, null)(NoData);
