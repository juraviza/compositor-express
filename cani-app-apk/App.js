import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const APP_URL = 'https://floppy-rocks-notice.loca.lt';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>CANI-APP</Text>
      </View>
      <WebView
        source={{
          uri: APP_URL,
          headers: { 'bypass-tunnel-reminder': '1' },
        }}
        style={styles.webview}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
      />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1f8f4a',
  },
  brand: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  webview: {
    flex: 1,
  },
});
