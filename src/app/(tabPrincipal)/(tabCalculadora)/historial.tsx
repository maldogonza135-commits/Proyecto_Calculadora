import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Text
} from 'react-native-paper';

// Definir tipo para los items del historial
type HistorialItem = {
  id: string;
  expresion: string;
  resultado: string;
};

export default function HistorialScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const HISTORY_KEY = 'calculadora_historial';

  // Cargar historial al abrir la pantalla
  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const historialString = await AsyncStorage.getItem(HISTORY_KEY);
      if (historialString) {
        const historialData = JSON.parse(historialString);
        setHistorial(historialData);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const seleccionaResultado = (item: HistorialItem) => {
    // Guardar el resultado seleccionado para usarlo en la calculadora
    AsyncStorage.setItem('ultimo_resultado_seleccionado', item.resultado);
    
    // Regresar a la calculadora
    const tabActual = params.tabActual as string;
    if (tabActual === 'CalculadoraCientifica') {
      router.push({
        pathname: '/(tabPrincipal)/(tabCalculadora)/CalculadoraCientifica',
        params: {
          expresion: item.expresion,
          resultado: item.resultado
        }
      });
      console.log(item.expresion);
    } else {
      router.push({
        pathname: '/(tabPrincipal)/(tabCalculadora)/CalculadoraBasica',
        params: {
          expresion: item.expresion,
          resultado: item.resultado
        }
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Lista de historial */}
      <ScrollView style={styles.scrollView}>
        {historial.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay cálculos guardados</Text>
          </View>
        ) : (
          historial.map((item, index) => (
            <Card 
              key={item.id} 
              style={styles.historialCard}
              onPress={() => seleccionaResultado(item)}
            >
              <Card.Content style={styles.cardContent}>
                {/* Expresión y resultado */}
                <View style={styles.expressionContainer}>
                  <Text style={styles.expressionText}>
                    {item.expresion}
                  </Text>
                  <Text style={styles.equalsText}>=</Text>
                  <Text style={styles.resultText}>
                    {item.resultado}
                  </Text>
                </View>
                
                {/* Botón para seleccionar */}
                <Button 
                  mode="contained"
                  onPress={() => seleccionaResultado(item)}
                  style={styles.selectButton}
                  icon="arrow-left"
                  compact
                >
                  Usar
                </Button>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    marginTop: 12,
    color: '#CCCCCC',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 80, // Para mantener el balance con el botón de volver
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  historialCard: {
    marginBottom: 12,
    backgroundColor: '#1E1E1E',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expressionContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  expressionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'monospace',
    marginRight: 8,
  },
  equalsText: {
    color: '#888',
    fontSize: 16,
    marginRight: 8,
  },
  resultText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  selectButton: {
    backgroundColor: '#4CAF50',
  },
});