import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {appStyles as styles} from '../styles/AppStyles';

type QuoteInfo = {
  day: string;
  quote: string;
};

type QuoteCardProps = {
  isLoading: boolean;
  quoteInfo: QuoteInfo | null;
};

const QuoteCard = ({isLoading, quoteInfo}: QuoteCardProps) => {
  if (!isLoading && !quoteInfo) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Quote of the day</Text>
      {isLoading ? (
        <ActivityIndicator color="#0f766e" />
      ) : (
        <View style={styles.quoteContent}>
          <Text style={styles.quoteDay}>{quoteInfo?.day}</Text>
          <Text style={styles.quoteText}>{quoteInfo?.quote}</Text>
        </View>
      )}
    </View>
  );
};

export default QuoteCard;
