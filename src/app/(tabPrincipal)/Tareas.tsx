import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Button, Card, Icon, IconButton, Modal, Portal, Text, TextInput } from "react-native-paper";
import { DatePickerInput } from "react-native-paper-dates";
import { useAuthData } from '../../hooks/useAuthData';
import { tareaService } from '../../utils/firestoreService';

type TaskType = {
  id: string;
  nombreMateria: string;
  nombreTema: string;
  numeroClase: number;
  fechaTarea: Date;
};

export default function Tareas() {
  // Estados
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [fechaTarea, setFechaTarea] = useState<Date | undefined>(undefined);
  const [nombreMateria, setNombreMateria] = useState("");
  const [nombreTema, setNombreTema] = useState("");
  const [numeroClase, setNumeroClase] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  //editar
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<TaskType | null>(null);
  const [editNombreMateria, setEditNombreMateria] = useState("");
  const [editNombreTema, setEditNombreTema] = useState("");
  const [editNumeroClase, setEditNumeroClase] = useState("");
  const [editFechaTarea, setEditFechaTarea] = useState<Date | undefined>(undefined);
  
  // Obtener usuario autenticado
  const { user, loading: authLoading } = useAuthData();
  
  // Cargar tareas cuando el usuario cambie
  useEffect(() => {
    if (user && !authLoading) {
      cargarTareas();
    }
  }, [user, authLoading]);
  
  // Función para cargar tareas desde Firestore
  const cargarTareas = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const tareasData = await tareaService.obtenerTareas(user.uid);
      
      // Mapear datos a TaskType
      const tareasMapeadas: TaskType[] = tareasData.map(tarea => ({
        id: tarea.id || '',
        nombreMateria: tarea.nombreMateria,
        nombreTema: tarea.nombreTema,
        numeroClase: tarea.numeroClase,
        fechaTarea: tarea.fechaTarea || new Date()
      }));
      
      setTasks(tareasMapeadas);
    } catch (error) {
      console.error('Error cargando tareas:', error);
      Alert.alert('Error', 'No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
    }
  };
  
  // Refrescar manualmente
  const onRefresh = async () => {
    setRefreshing(true);
    await cargarTareas();
    setRefreshing(false);
  };
  
  // Manejar cambio de fecha
  const cambioFecha = (date: Date | undefined) => {
    setFechaTarea(date);
  };
  
  // Guardar tarea en Firestore
  const guardarTarea = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para crear tareas');
      return;
    }
    
    if (!nombreMateria.trim() || !nombreTema.trim()) {
      Alert.alert('Error', 'Materia y tema son obligatorios');
      return;
    }
    
    // Validar fecha
    if (!fechaTarea) {
      Alert.alert('Error', 'Selecciona una fecha para la tarea');
      return;
    }
    
    try {
      // Datos para Firestore
      const tareaData = {
        nombreMateria: nombreMateria.trim(),
        nombreTema: nombreTema.trim(),
        numeroClase: numeroClase ? parseInt(numeroClase) : 0,
        fechaTarea: fechaTarea
      };
      
      // Crear en Firestore
      const tareaId = await tareaService.crearTarea(user.uid, tareaData);
      
      // Actualizar estado local
      const nuevaTarea: TaskType = {
        id: tareaId,
        ...tareaData
      };
      
      setTasks(prev => [nuevaTarea, ...prev]);
      
      // Limpiar formulario y cerrar modal
      setNombreMateria('');
      setNombreTema('');
      setNumeroClase('');
      setFechaTarea(undefined);
      setCreateModalVisible(false);
      
      Alert.alert('Éxito', 'Tarea creada correctamente');
    } catch (error) {
      console.error('Error creando tarea:', error);
      Alert.alert('Error', 'No se pudo crear la tarea');
    }
  };
  
  // Eliminar tarea
  const eliminarTarea = async (tarea: TaskType) => {
    console.log('🔄 FUNCIÓN eliminarTarea INICIADA');
    console.log('👤 Usuario:', user?.uid);
    console.log('📋 Tarea ID:', tarea.id);
    
    if (!user) {
        Alert.alert('Error', 'No hay usuario autenticado');
        return;
    }
    
    if (!tarea.id) {
        Alert.alert('Error', 'La tarea no tiene ID');
        return;
    }
    
    try {
        const resultado = await tareaService.eliminarTarea(user.uid, tarea.id);
        
        if (resultado.success) {
            // Tarea eliminada exitosamente
            console.log('🎯 Tarea eliminada correctamente');
            
            onRefresh();
            
            return { success: true };
        } else {
            // Error específico del servicio
            console.log('⚠️ Error del servicio:', resultado.message);
            return { 
                success: false, 
                error: resultado.message || 'Error desconocido al eliminar' 
            };
        }
        
    } catch (error: any) {
        // Error de red o excepción no controlada
        console.error('💥 Error inesperado:', error);
        return { 
            success: false, 
            error: error.message || 'Error inesperado' 
        };
    }
  };
  
  // Formatear fecha para mostrar
  const formatearFechaCorta = (fecha?: Date): string => {
    if (!fecha) return 'Sin fecha';
    
    try {
        return fecha.toLocaleDateString('es-PY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
        });
    } catch (error) {
        return 'Fecha inválida';
    }
  };
  
  // Mostrar loading mientras se autentica
  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon source="loading" size={60} color="#3e92ff" />
        <Text variant="headlineSmall" style={styles.loadingText}>
          Cargando...
        </Text>
      </View>
    );
  }
  
  // Si no hay usuario autenticado
  if (!user) {
    return (
      <View style={styles.noAuthContainer}>
        <Icon source="alert-circle-outline" size={80} color="#666" />
        <Text variant="headlineSmall" style={styles.noAuthText}>
          Inicia sesión para ver tus tareas
        </Text>
      </View>
    );
  }

  const abrirEditarTarea = (tarea: TaskType) => {
    setTareaEditando(tarea);
    setEditNombreMateria(tarea.nombreMateria);
    setEditNombreTema(tarea.nombreTema);
    setEditNumeroClase(tarea.numeroClase.toString());
    setEditFechaTarea(tarea.fechaTarea);
    setEditModalVisible(true);
  };

  const guardarEdicion = async () => {
    if (!user || !tareaEditando) return;
    
    if (!editNombreMateria.trim() || !editNombreTema.trim()) {
        Alert.alert('Error', 'Materia y tema son obligatorios');
        return;
    }
    
    if (!editFechaTarea) {
        Alert.alert('Error', 'Selecciona una fecha válida');
        return;
    }
    
    try {
        await tareaService.actualizarTarea(user.uid, tareaEditando.id, {
        nombreMateria: editNombreMateria.trim(),
        nombreTema: editNombreTema.trim(),
        numeroClase: editNumeroClase ? parseInt(editNumeroClase) : 0,
        fechaTarea: editFechaTarea
        });
        
        // Actualizar estado local
        setTasks(prev => prev.map(tarea => 
        tarea.id === tareaEditando.id 
            ? { 
                ...tarea, 
                nombreMateria: editNombreMateria.trim(),
                nombreTema: editNombreTema.trim(),
                numeroClase: editNumeroClase ? parseInt(editNumeroClase) : 0,
                fechaTarea: editFechaTarea
            }
            : tarea
        ));
        
        // Limpiar y cerrar
        setEditModalVisible(false);
        setTareaEditando(null);
        Alert.alert('Éxito', 'Tarea actualizada correctamente');
        
    } catch (error) {
        console.error('Error actualizando tarea:', error);
        Alert.alert('Error', 'No se pudo actualizar la tarea');
    }
  };

  return (
    <View style={styles.viewPrincipal}>
      {/* Header con estadísticas */}
      <View style={styles.viewSubHeaderTareas}>
        <View style={styles.headerStats}>
          <Text variant="labelLarge" style={styles.textSubheader}>
            {tasks.length} tareas registradas
          </Text>
        </View>
        <IconButton 
          icon="plus" 
          containerColor="#3e92ffff" 
          iconColor="#fff" 
          size={45} 
          onPress={() => setCreateModalVisible(true)}
        />
      </View>
      
      {/* Lista de tareas */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3e92ff']}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.taskCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.taskMateria}>
                {item.nombreMateria}
              </Text>
              
              <Text variant="bodyLarge" style={styles.taskTema}>
                {item.nombreTema}
              </Text>
              
              <View style={styles.taskDetails}>
                <View style={styles.taskDetailItem}>
                  <Icon source="calendar" size={16} color="#666" />
                  <Text variant="bodySmall" style={styles.taskDetailText}>
                    {formatearFechaCorta(item.fechaTarea)}
                  </Text>
                </View>
                
                {item.numeroClase > 0 && (
                  <View style={styles.taskDetailItem}>
                    <Icon source="numeric" size={16} color="#666" />
                    <Text variant="bodySmall" style={styles.taskDetailText}>
                      Clase {item.numeroClase}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
            <Card.Actions>
              <Button 
                mode="outlined" 
                onPress={() => abrirEditarTarea(item)}
                style={styles.editButton}
              >
                  Editar
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => eliminarTarea(item)}
                textColor="#d32f2f"
              >
                Eliminar
              </Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.viewListaVacia}>
            <Icon source="alert-circle-outline" size={60} color="#666" />
            <Text variant="headlineSmall" style={styles.textListaVacia}>
              No hay tareas registradas
            </Text>
            <Text variant="bodyMedium" style={styles.subtextListaVacia}>
              Presiona el botón + para crear una nueva
            </Text>
          </View>
        }
        contentContainerStyle={tasks.length === 0 ? styles.scrollViewContent : styles.listContent}
      />
      
      {/* Modal para crear tarea */}
      <Portal>
        <Modal 
          visible={createModalVisible} 
          onDismiss={() => setCreateModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Title 
              titleVariant="titleLarge" 
              title="Nueva tarea"
              right={(props) => (
                <IconButton
                  {...props}
                  icon="close"
                  onPress={() => setCreateModalVisible(false)}
                />
              )}
            />
            <Card.Content>
              <Text variant="labelLarge" style={styles.modalLabel}>Fecha *</Text>
              <DatePickerInput
                locale="es"
                label="Fecha de la tarea"
                value={fechaTarea}
                onChange={cambioFecha}
                inputMode="start"
                mode="outlined"
                style={styles.datePicker}
                withDateFormatInLabel={false}
              />
              
              <Text variant="labelLarge" style={styles.modalLabel}>Materia *</Text>
              <TextInput
                mode="outlined"
                placeholder="Ej. Matemática Financiera"
                value={nombreMateria}
                onChangeText={setNombreMateria}
                style={styles.textInput}
              />
              
              <Text variant="labelLarge" style={styles.modalLabel}>Tema *</Text>
              <TextInput
                mode="outlined"
                placeholder="Ej. Anualidades Generales"
                value={nombreTema}
                onChangeText={setNombreTema}
                style={styles.textInput}
              />
              
              <Text variant="labelLarge" style={styles.modalLabel}>Número de Clase (Opcional)</Text>
              <TextInput
                mode="outlined"
                placeholder="Ej. 5"
                value={numeroClase}
                onChangeText={setNumeroClase}
                keyboardType="number-pad"
                style={styles.textInput}
              />
            </Card.Content>
            <Card.Actions style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={() => setCreateModalVisible(false)}
              >
                Cancelar
              </Button>
              <Button 
                mode="contained" 
                onPress={guardarTarea}
                disabled={!nombreMateria.trim() || !nombreTema.trim() || !fechaTarea}
              >
                Guardar
              </Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
      <Portal>
        <Modal 
            visible={editModalVisible} 
            onDismiss={() => setEditModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
        >
            <Card style={styles.modalCard}>
            <Card.Title 
                titleVariant="titleLarge" 
                title="Editar tarea"
                right={(props) => (
                <IconButton
                    {...props}
                    icon="close"
                    onPress={() => setEditModalVisible(false)}
                />
                )}
            />
            <Card.Content>
                <Text variant="labelLarge" style={styles.modalLabel}>Fecha *</Text>
                <DatePickerInput
                locale="es"
                label="Fecha de la tarea"
                value={editFechaTarea}
                onChange={setEditFechaTarea}
                inputMode="start"
                mode="outlined"
                style={styles.datePicker}
                withDateFormatInLabel={false}
                />
                
                <Text variant="labelLarge" style={styles.modalLabel}>Materia *</Text>
                <TextInput
                mode="outlined"
                placeholder="Ej. Matemática Financiera"
                value={editNombreMateria}
                onChangeText={setEditNombreMateria}
                style={styles.textInput}
                />
                
                <Text variant="labelLarge" style={styles.modalLabel}>Tema *</Text>
                <TextInput
                mode="outlined"
                placeholder="Ej. Anualidades Generales"
                value={editNombreTema}
                onChangeText={setEditNombreTema}
                style={styles.textInput}
                />
                
                <Text variant="labelLarge" style={styles.modalLabel}>Número de Clase (Opcional)</Text>
                <TextInput
                mode="outlined"
                placeholder="Ej. 5"
                value={editNumeroClase}
                onChangeText={setEditNumeroClase}
                keyboardType="number-pad"
                style={styles.textInput}
                />
            </Card.Content>
            <Card.Actions style={styles.modalActions}>
                <Button 
                mode="outlined" 
                onPress={() => setEditModalVisible(false)}
                >
                Cancelar
                </Button>
                <Button 
                mode="contained" 
                onPress={guardarEdicion}
                disabled={!editNombreMateria.trim() || !editNombreTema.trim() || !editFechaTarea}
                >
                Guardar cambios
                </Button>
            </Card.Actions>
            </Card>
        </Modal>
        </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  viewPrincipal: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    color: '#666',
  },
  noAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 40,
  },
  noAuthText: {
    marginTop: 20,
    color: '#666',
    textAlign: 'center',
  },
  viewSubHeaderTareas: {
    width: "100%",
    height: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#333333",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerStats: {
    flex: 1,
  },
  textSubheader: {
    color: "white",
    fontSize: 16,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
  },
  viewListaVacia: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 400,
  },
  textListaVacia: {
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  subtextListaVacia: {
    color: '#888',
    textAlign: 'center',
  },
  taskCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  taskMateria: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  taskTema: {
    color: '#555',
    marginBottom: 12,
  },
  taskDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  taskDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskDetailText: {
    color: '#666',
  },
  modalContainer: {
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
  },
  modalLabel: {
    marginTop: 12,
    marginBottom: 8,
    color: '#333',
  },
  datePicker: {
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 16,
  },
  modalActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  editButton: {
    marginRight: 8,
  },
});