import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Simulated Lucide Icons for mobile styling
function MobileShieldIcon({ size = 24, color = "#C5A059" }) {
  return <Text style={{ color, fontSize: size, fontWeight: 'bold' }}>🛡️</Text>;
}
function MobileLockIcon({ size = 20, color = "#4ADE80" }) {
  return <Text style={{ color, fontSize: size }}>🔒</Text>;
}
function MobileRefreshIcon({ size = 18, color = "#C5A059" }) {
  return <Text style={{ color, fontSize: size }}>🔄</Text>;
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bioVerified, setBioVerified] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);

  useEffect(() => {
    if (bioVerified) {
      fetchMessages();
    }
  }, [bioVerified]);

  const fetchMessages = () => {
    setLoading(true);
    // Simulate fetching from FastAPI server
    setTimeout(() => {
      setMessages([
        { id: 1, sender: "Col. Alex Mercer", country: "Country A", content: "Superposition key confirmed. Deploying sector A defenses.", time: "20:04:12", status: "delivered" },
        { id: 2, sender: "Director Croft", country: "Country A", content: "Steganography scanner anomaly detected. Quarantine triggered.", time: "18:42:01", status: "blocked" },
        { id: 3, sender: "Gen. Beatrix Vance", country: "Country B", content: "Kyber decapsulation completed. Standby for sync.", time: "14:15:30", status: "delivered" }
      ]);
      setLoading(false);
    }, 1200);
  };

  const handleBiometricsAuth = () => {
    // Simulate FaceID / Fingerprint audit pattern checks
    setBioVerified(true);
  };

  const handleLogout = () => {
    setBioVerified(false);
    setSelectedMsg(null);
    setMessages([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* HEADER BANNER */}
      <View style={styles.header}>
        <MobileShieldIcon size={28} />
        <Text style={styles.headerTitle}>SHIELD // MOBILE COMMAND</Text>
      </View>

      {!bioVerified ? (
        // LOCK SCREEN
        <View style={styles.authContainer}>
          <Text style={styles.authSubtitle}>SECURE ENCRYPTED NODE ACCESS</Text>
          <Text style={styles.authInfo}>
            Multi-Factor Biometrics Verification Required.
          </Text>
          <TouchableOpacity style={styles.authBtn} onPress={handleBiometricsAuth}>
            <Text style={styles.authBtnText}>VERIFY MOBILE BIOMETRICS</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // MOBILE DASHBOARD
        <View style={styles.dashboard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>● CONNECTION: SECURE (KYBER-768)</Text>
            <TouchableOpacity onPress={fetchMessages}>
              <MobileRefreshIcon size={16} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#C5A059" style={styles.loader} />
          ) : (
            <ScrollView style={styles.scrollList}>
              <Text style={styles.sectionTitle}>INCOMING ENVELOPES</Text>
              
              {messages.map((m) => (
                <TouchableOpacity 
                  key={m.id} 
                  style={[
                    styles.msgCard,
                    selectedMsg?.id === m.id && styles.msgCardSelected
                  ]}
                  onPress={() => setSelectedMsg(m)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardSender}>FROM: {m.sender}</Text>
                    <Text style={[
                      styles.cardStatus,
                      m.status === 'blocked' ? styles.statusBlocked : styles.statusDelivered
                    ]}>
                      {m.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.cardTime}>ORIGIN: {m.country} // {m.time}</Text>
                </TouchableOpacity>
              ))}

              {/* MESSAGE DETAIL DRAWER */}
              {selectedMsg && (
                <View style={styles.detailContainer}>
                  <Text style={styles.detailTitle}>DECRYPTED SECURE DATA</Text>
                  <View style={styles.detailBody}>
                    <Text style={styles.detailText}>
                      {selectedMsg.status === 'blocked' 
                        ? "❌ QUARANTINED: MALICIOUS PAYLOAD INFECTED" 
                        : selectedMsg.content}
                    </Text>
                  </View>
                  <Text style={styles.detailReceipt}>
                    LEDGER SEAL VALID // AES-256 PARITY PASS
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>CLOSE CRYPTOGRAPHIC SESSION</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050705',
  },
  header: {
    height: 60,
    backgroundColor: '#0E140E',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2D1E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  headerTitle: {
    color: '#C5A059',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authSubtitle: {
    color: '#E8D2A6',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  authInfo: {
    color: '#7f8c8d',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 24,
  },
  authBtn: {
    backgroundColor: '#2A4D25',
    borderColor: '#4ADE80',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 4,
  },
  authBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  dashboard: {
    flex: 1,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0E140E',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1E2D1E',
    marginBottom: 16,
  },
  statusText: {
    color: '#4ADE80',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  scrollList: {
    flex: 1,
  },
  sectionTitle: {
    color: '#C5A059',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  msgCard: {
    backgroundColor: '#0E140E',
    borderWidth: 1,
    borderColor: '#1E2D1E',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  msgCardSelected: {
    borderColor: '#4ADE80',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSender: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardTime: {
    color: '#7f8c8d',
    fontSize: 8,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  cardStatus: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    fontWeight: 'bold',
  },
  statusDelivered: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    color: '#4ADE80',
    borderWidth: 0.5,
    borderColor: '#4ADE80',
  },
  statusBlocked: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#EF4444',
    borderWidth: 0.5,
    borderColor: '#EF4444',
  },
  detailContainer: {
    marginTop: 16,
    backgroundColor: '#0E140E',
    borderWidth: 1,
    borderColor: '#C5A059',
    borderRadius: 4,
    padding: 12,
  },
  detailTitle: {
    color: '#C5A059',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  detailBody: {
    backgroundColor: '#050705',
    borderWidth: 0.5,
    borderColor: '#1E2D1E',
    padding: 10,
    borderRadius: 2,
    minHeight: 60,
  },
  detailText: {
    color: '#4ADE80',
    fontSize: 10,
    lineHeight: 14,
    fontFamily: 'monospace',
  },
  detailReceipt: {
    color: '#7f8c8d',
    fontSize: 7,
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
    borderWidth: 0.5,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  }
});
