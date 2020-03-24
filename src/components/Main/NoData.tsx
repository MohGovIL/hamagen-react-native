import React from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { FadeInView, Icon, Text } from '../common';
import { IS_SMALL_SCREEN, SCREEN_WIDTH } from '../../constants/Constants';

interface Props {
  strings: any
}

const NoData = ({ strings: { scanHome: { noData, noDataDesc } } }: Props) => {
  return (
    <FadeInView style={styles.container}>
      <Icon source={require('../../assets/main/noData.png')} width={SCREEN_WIDTH * (IS_SMALL_SCREEN ? 0.3 : 0.5)} customStyles={{ marginBottom: 25 }} />
      <Text style={[styles.text, { fontSize: 22 }]} bold>{noData}</Text>
      <Text style={styles.text}>{noDataDesc}</Text>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 25
  },
  text: {
    width: 220,
    marginBottom: 20,
    lineHeight: 20
  }
});

export default connect(null, null)(NoData);
