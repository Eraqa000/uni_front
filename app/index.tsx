import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  // Просто заглушка, пока RootLayoutNav выполняет редирект
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  }
});