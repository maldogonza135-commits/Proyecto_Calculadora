// app/login/index.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  Modal,
  Paragraph,
  Portal,
  Snackbar,
  Text,
  TextInput,
  Title
} from 'react-native-paper';
import { login, register, resetPassword } from '../../utils/authService';

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Estados para el formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  // Validar email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    };

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    // Validaciones para registro
    if (!isLogin) {
      if (!formData.displayName) {
        newErrors.displayName = 'El nombre es requerido';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma tu contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);

    // Verificar si hay errores
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Manejar cambio en inputs
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario escribe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Manejar submit
  const handleSubmit = async () => {
    if (!validateForm()) {
        showSnackbar('Por favor, corrige los errores');
        return;
    }

    setLoading(true);

    try {
        if (isLogin) {
        // Login
        const result = await login(formData.email, formData.password);
        
        // ✅ Verificar que result no sea undefined
        if (!result) {
            showSnackbar('Error: No se recibió respuesta del servidor');
            return;
        }
        
        if (result.success) {
            showSnackbar('¡Inicio de sesión exitoso!');
            router.replace('/(tabPrincipal)/(tabCalculadora)/CalculadoraBasica');
        } else {
            showSnackbar(result.error || 'Error al iniciar sesión');
        }
        } else {
        // Registro
        const result = await register(formData.email, formData.password);
        
        // ✅ Verificar que result no sea undefined
        if (!result) {
            showSnackbar('Error: No se recibió respuesta del servidor');
            return;
        }
        
        if (result.success) {
            showSnackbar('¡Registro exitoso!');
            // Opcional: auto-login después de registro
            const loginResult = await login(formData.email, formData.password);
            
            // ✅ Verificar que loginResult no sea undefined
            if (!loginResult) {
            showSnackbar('Error en auto-login después del registro');
            return;
            }
            
            if (loginResult.success) {
            router.replace('/(tabPrincipal)/(tabCalculadora)/CalculadoraBasica');
            }
        } else {
            showSnackbar(result.error || 'Error al crear la cuenta');
        }
        }
    } catch (error) {
        showSnackbar('Error inesperado. Intenta nuevamente.');
        console.error('Error en autenticación:', error);
    } finally {
        setLoading(false);
    }
  };

  // Recuperar contraseña
  // En tu AuthScreen, modifica handlePasswordReset:
const handlePasswordReset = async () => {
    if (!validateEmail(resetEmail)) {
        showSnackbar('Ingresa un email válido');
        return;
    }

    setLoading(true);
    
    try {
        // ✅ Usar la función real de Firebase
        const result = await resetPassword(resetEmail);
        
        if (result && result.success) {
            showSnackbar(`Email de recuperación enviado a ${resetEmail}`);
        } else {
            showSnackbar(result?.error || 'Error al enviar email de recuperación');
        }
    } catch (error) {
        showSnackbar('Error inesperado');
    } finally {
        setLoading(false);
        setModalVisible(false);
        setResetEmail('');
    }
};

  // Mostrar snackbar
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Resetear formulario al cambiar modo
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
    setErrors({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={isLogin ? 'login' : 'account-plus'}
              size={80}
              color="#6200ee"
            />
            <Title style={styles.title}>
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Title>
            <Paragraph style={styles.subtitle}>
              {isLogin 
                ? 'Ingresa a tu cuenta para continuar' 
                : 'Crea una cuenta para comenzar'
              }
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              {/* Nombre (solo en registro) */}
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Nombre completo"
                    value={formData.displayName}
                    onChangeText={(text) => handleInputChange('displayName', text)}
                    mode="outlined"
                    error={!!errors.displayName}
                    disabled={loading}
                    left={<TextInput.Icon icon="account" />}
                  />
                  {errors.displayName ? (
                    <Text style={styles.errorText}>{errors.displayName}</Text>
                  ) : null}
                </View>
              )}

              {/* Email */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={!!errors.email}
                  disabled={loading}
                  left={<TextInput.Icon icon="email" />}
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              {/* Contraseña */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Contraseña"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  error={!!errors.password}
                  disabled={loading}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              {/* Confirmar Contraseña (solo en registro) */}
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    mode="outlined"
                    secureTextEntry={!showConfirmPassword}
                    error={!!errors.confirmPassword}
                    disabled={loading}
                    left={<TextInput.Icon icon="lock-check" />}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                  />
                  {errors.confirmPassword ? (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  ) : null}
                </View>
              )}

              {/* Botón de acción */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                disabled={loading}
                loading={loading}
                icon={isLogin ? 'login' : 'account-plus'}
              >
                {loading ? 'Procesando...' : (isLogin ? 'Ingresar' : 'Registrarse')}
              </Button>

              {/* Olvidé mi contraseña (solo en login) */}
              {isLogin && (
                <Button
                  mode="text"
                  onPress={() => setModalVisible(true)}
                  style={styles.forgotButton}
                  disabled={loading}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              )}

              <Divider style={styles.divider} />

              {/* Cambiar entre login/registro */}
              <View style={styles.switchContainer}>
                <Paragraph style={styles.switchText}>
                  {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                </Paragraph>
                <Button
                  mode="text"
                  onPress={toggleMode}
                  disabled={loading}
                  style={styles.switchButton}
                >
                  {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                </Button>
              </View>

              {/* Información adicional */}
              <View style={styles.infoContainer}>
                <MaterialCommunityIcons name="shield-check" size={20} color="#6200ee" />
                <Paragraph style={styles.infoText}>
                  Tus datos están protegidos y seguros
                </Paragraph>
              </View>
            </Card.Content>
          </Card>

          {/* Modal para recuperar contraseña */}
          <Portal>
            <Modal
              visible={modalVisible}
              onDismiss={() => setModalVisible(false)}
              contentContainerStyle={styles.modalContainer}
            >
              <Card>
                <Card.Content>
                  <Title style={styles.modalTitle}>Recuperar Contraseña</Title>
                  <Paragraph style={styles.modalText}>
                    Te enviaremos un email con instrucciones para restablecer tu contraseña.
                  </Paragraph>
                  
                  <TextInput
                    label="Email"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.modalInput}
                    left={<TextInput.Icon icon="email" />}
                  />

                  <View style={styles.modalButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => setModalVisible(false)}
                      style={styles.modalButton}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handlePasswordReset}
                      style={styles.modalButton}
                      loading={loading}
                      disabled={loading}
                    >
                      Enviar
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </Modal>
          </Portal>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Snackbar para mensajes */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#6200ee',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    borderRadius: 12,
    elevation: 4,
    backgroundColor: 'white',
  },
  inputContainer: {
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  forgotButton: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  switchText: {
    fontSize: 14,
    color: '#666',
  },
  switchButton: {
    marginLeft: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  modalContainer: {
    margin: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  modalInput: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  snackbar: {
    backgroundColor: '#323232',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});