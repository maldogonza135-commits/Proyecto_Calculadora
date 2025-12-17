import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { all, create } from "mathjs";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Icon, IconButton, Modal, Portal, Text, TextInput } from "react-native-paper";

const config = {};
const math = create(all, config);

const ANS_KEY = 'calculadora_ans';
const HISTORY_KEY = 'calculadora_historial';
const MEMORY_KEY = 'calculadora_memoria';

const _obtenerResultado = ( expresion: string ) => {
    try {
        if (expresion.length === 0) return "";
        const resultado = math.evaluate(expresion);
        return resultado.toString();
    } catch (error) {
        return "Error";
    }
}

export default function CalculadoraCientifica(){
    const [ ans, setAns ] = useState<string>("0");
    const [ display, setDisplay ] = useState<string>("");
    const [ result, setResult ] = useState<string>("0");
    const [ cursorPosition, setCursorPosition ] = useState<number>(0);
    const params = useLocalSearchParams();
    const router = useRouter();
    const [paramsProcesados, setParamsProcesados] = useState(false);

    const [memorySlots, setMemorySlots] = useState<Record<string, string>>({
        A: '', B: '', C: '', D: '', 
        E: '', F: '', G: '', H: '',
        I: '', J: '', K: '', L: '',
    });

    // Efecto para procesar parámetros inmediatamente
    useEffect(() => {
        // Solo procesar si hay parámetros y no han sido procesados aún
        if (Object.keys(params).length > 0 && !paramsProcesados) {
            console.log('Params recibidos:', params);
            
            if (params.expresion && params.resultado) {
                const expresion = params.expresion as string;
                const resultado = params.resultado as string;
                
                setDisplay(expresion);
                setResult(resultado);
                setCursorPosition(expresion.length);
                
                // Marcar como procesados para evitar re-ejecución
                setParamsProcesados(true);
                
                //LIMPIAR LOS PARÁMETROS DE LA URL
                // Opción 1: Reemplazar con la misma ruta sin parámetros
                setTimeout(() => {
                    router.replace({
                        pathname: '/(tabPrincipal)/(tabCalculadora)/CalculadoraCientifica', // o tu ruta actual
                        params: {}
                    });
                    
                    // Opción 2: Si estás usando navegación por tabs
                    // router.navigate('/calculadora');
                    
                    console.log('Parámetros limpiados de la URL');
                }, 0);
            }
        }
        
        // Resetear bandera cuando no hay parámetros
        if (Object.keys(params).length === 0 && paramsProcesados) {
            setParamsProcesados(false);
        }
    }, [params, paramsProcesados, router]);

    // Efecto para cargar datos persistentes al inicio
    useEffect(() => {
        const cargarDatosPersistentes = async () => {
            try {
                console.log('Cargando datos persistentes...');
                
                // Cargar memoria
                const memoriaGuardada = await AsyncStorage.getItem(MEMORY_KEY);
                if (memoriaGuardada) {
                    const memoria = JSON.parse(memoriaGuardada);
                    setMemorySlots(memoria);
                    console.log('Memoria cargada');
                }
                
                // Cargar ANS
                const ansGuardado = await AsyncStorage.getItem(ANS_KEY);
                if (ansGuardado) {
                    setAns(ansGuardado);
                    console.log('ANS cargado:', ansGuardado);
                }
                
            } catch (error) {
                console.error(' Error cargando datos:', error);
            }
        };
        cargarDatosPersistentes();
    }, []);

    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [useModalVisible, setUseModalVisible] = useState(false);

    const showSaveModal = () => setSaveModalVisible(true);
    const hideSaveModal = () => setSaveModalVisible(false);

    const showUseModal = async () => {
        try {
            const memoriaGuardada = await AsyncStorage.getItem(MEMORY_KEY);

            if (memoriaGuardada) {
                setMemorySlots(JSON.parse(memoriaGuardada));
            } else {
                // Si no existe memoria, aseguramos que se muestre vacía
                setMemorySlots({
                    A: '', B: '', C: '', D: '',
                    E: '', F: '', G: '', H: '',
                    I: '', J: '', K: '', L: '',
                });
            }

            setUseModalVisible(true);  // ← Solo ahora abrimos el modal

        } catch (error) {
            console.error("Error cargando memoria:", error);
        }
    };
    const hideUseModal = () => setUseModalVisible(false);

    function ingresarDisplay( valor: string ){
        let newDisplay = "";
        let valorAMostrar = valor === "π" ? "pi" : valor;
        
        if( display === "" ){
            newDisplay = valorAMostrar;
        } else {
            newDisplay = display.slice(0, cursorPosition) + valorAMostrar + display.slice(cursorPosition);
        }
        setDisplay(newDisplay);
        setCursorPosition(cursorPosition + valorAMostrar.length);
        setResult(_obtenerResultado(newDisplay));
    }

    const handleButtonSen = () => {
        ingresarDisplay("sin()");
    };
    const handleButtonCos = () => {
        ingresarDisplay("cos()");
    };
    const handleButtonTan = () => {
        ingresarDisplay("tan()");
    };
    const handleButtonAsin = () => {
        ingresarDisplay("asin()");
    };
    const handleButtonAcos = () => {
        ingresarDisplay("acos()");
    };
    const handleButtonAtan = () => {
        ingresarDisplay("atan()");
    };
    const handleButtonLn = () => {
        ingresarDisplay("ln()");
    };
    const handleButtonLog = () => {
        ingresarDisplay("log10()");
    };
    const handleButtonSqrt = () => {
        ingresarDisplay("sqrt()");
    };
    const handleButtonPi = () => {
        ingresarDisplay("π");
    };
    const handleButtonParentesisA = () => {
        ingresarDisplay("(");
    };
    const handleButtonParentesisC = () => {
        ingresarDisplay(")");
    };
    const handleButtonExp = () => {
        ingresarDisplay("^");
    };

    const handleButtonResult = async () => {
        const resultado = result === "Error" ? "" : result;
        setAns(resultado);

        try {
            if (resultado && resultado !== "Error") {
                await AsyncStorage.setItem(ANS_KEY, resultado); // Aquí sí necesita ANS_KEY
                console.log(' ANS guardado:', resultado);
            }
        } catch (error) {
            console.error(' Error guardando ANS:', error);
        }
        
        // Guardar en historial
        await setHistorial(display, resultado);
        
        // Limpiar display
        setDisplay("");
    };

    const handleButtonANS = () => {
        if (ans === "" || ans === "0") return;
        const newDisplay = display.slice(0, cursorPosition) + ans + display.slice(cursorPosition);
        setDisplay(newDisplay);
        setCursorPosition(cursorPosition + ans.length);
        setResult(_obtenerResultado(newDisplay));
    };

    const handleSaveToMemory = (slot: string) => {
        if (!canSaveToMemory()) {
            Alert.alert("Error", "No hay un resultado válido para guardar");
            return;
        }
        
        const nuevaMemoria = {
            ...memorySlots,
            [slot]: ans
        };
        
        setMemorySlots(nuevaMemoria);
        
        //Guardar automáticamente después de cambiar
        guardarMemoria(nuevaMemoria);
        
        hideSaveModal();
    };

    const handleUseMemory = (slot: string, value: string) => {
        if (!value || value.trim() === "") {
            Alert.alert("Error", `El slot ${slot} está vacío`);
            return;
        }

        const newDisplay = display.slice(0, cursorPosition) + value + display.slice(cursorPosition);

        setDisplay(newDisplay);
        setCursorPosition(cursorPosition + value.length);
        setResult(_obtenerResultado(newDisplay));

        hideUseModal();
    };

    const hasMemorySaved = () => {
        return Object.values(memorySlots).some(val => val !== '');
    };

    const canSaveToMemory = () => {
        return ans && ans !== "0" && ans !== "Error" && ans.trim() !== "";
    };

    const handleLeftArrow = () => {
        if (cursorPosition > 0) {
            setCursorPosition(cursorPosition - 1);
        }
    };

    const handleRightArrow = () => {
        if (cursorPosition < display.length) {
            setCursorPosition(cursorPosition + 1);
        }
    };

    const handleBackspace = () => {
        if (cursorPosition === 0) return;
        
        const newDisplay = display.slice(0, cursorPosition - 1) + display.slice(cursorPosition);
        setDisplay(newDisplay);
        
        if(newDisplay.length === 0){
            setResult("0");
        } else {
            setResult(_obtenerResultado(newDisplay));
        }
        
        setCursorPosition(cursorPosition - 1);
    };

    const handleClearAll = () => {
        setDisplay("");
        setResult("0");
        setCursorPosition(0);
    };

    const setHistorial = async (expresion: string, resultado: string) => {
        try {
            const historialActual = await getHistorial();

            const nuevoHistorial = {
                id: Date.now().toString(),
                expresion: expresion,
                resultado: resultado
            };

            const agregarHistorial = [nuevoHistorial, ...historialActual];

            const limitarHistorial = agregarHistorial.slice(0,10);
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(limitarHistorial));

            return nuevoHistorial;
        } catch (err) {
            console.error("Error al guardar el historial:", err);
        }
    };

    const getHistorial = async () => {
        try {
            const historyString = await AsyncStorage.getItem(HISTORY_KEY);
            return historyString ? JSON.parse(historyString) : [];
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            return [];
        }
    };

    //CORREGIDA - sin isLoading
    const guardarMemoria = async (memoria: Record<string, string>) => {
        try {
            await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(memoria));
            console.log('Memoria guardada');
        } catch (error) {
            console.error('Error guardando memoria:', error);
        }
    };

    const handleResetTotal = () => {
        console.log("handleResetTotal EJECUTADA");
        resetearTodoCompletamente();
    };

    const resetearTodoCompletamente = async () => {
        try {
            console.log('Reseteando todo...');
            
            // 1. Crear memoria vacía
            const memoriaVacia = {
                A: '', B: '', C: '', D: '',
                E: '', F: '', G: '', H: '',
                I: '', J: '', K: '', L: '',
            };
            
            console.log('memoriaVacia a guardar:', memoriaVacia);
            
            // 2. Guardar memoria vacía en AsyncStorage
            await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(memoriaVacia));
            console.log('MEMORY_KEY guardado en AsyncStorage');
            
            // 3. Guardar ANS vacío
            await AsyncStorage.setItem(ANS_KEY, "0");
            console.log('ANS_KEY guardado en AsyncStorage');
            
            // 4. Verificar lo que se guardó
            const memoriaVerificada = await AsyncStorage.getItem(MEMORY_KEY);
            const ansVerificado = await AsyncStorage.getItem(ANS_KEY);
            console.log('Verificación después de guardar:');
            console.log('- Memoria:', memoriaVerificada);
            console.log('- ANS:', ansVerificado);
            
            // 5. Actualizar estados locales
            console.log('Actualizando estados locales...');
            setAns("0");
            setMemorySlots(memoriaVacia);
            
            // 6. Forzar un re-render y verificar estados
            setTimeout(() => {
                console.log('memorySlots DESPUÉS del reset (en timeout):', memorySlots);
                console.log('ans DESPUÉS del reset:', ans);
            }, 1000);
            
            console.log('Reset completado');
            Alert.alert("Listo", "Se ha reseteado toda la memoria y el ANS");
            
        } catch (error) {
            console.error('Error reseteando:', error);
            Alert.alert("Error", "No se pudo completar el reset");
        }
    };

    return(
        <>
        <View>
            <TextInput 
                editable={false}
                caretHidden={true}
                value={display}
                style={styles.input}
            />
            <View style={styles.displayContainer}>
                <Text style={styles.displayText}>
                    {display.substring(0, cursorPosition)}
                    <Text style={styles.cursor}>|</Text>
                    {display.substring(cursorPosition)}
                </Text>
            </View>
            <Text style={styles.resultDisplay}>{result}</Text>
        </View>
        
        <View style={styles.controlRow}>
            <IconButton icon="chevron-left" size={24} onPress={handleLeftArrow} />
            <IconButton icon="chevron-right" size={24} onPress={handleRightArrow} />
            <IconButton icon="backspace" size={24} onPress={handleBackspace} />
            <IconButton icon="delete" size={24} onPress={handleClearAll} />
            <Button mode="text" onPress={handleButtonANS}>ANS</Button>
            <Button mode="text" onPress={handleResetTotal} textColor="#ff4444">RESET ALL</Button>
        </View>
        
        <Card mode="elevated" style={styles.functionsCard}>
            <View style={styles.functionsCardSection1}>
                {/* Columna 1 */}
                <View style={styles.buttonColumn}>
                    <Button mode="contained" style={styles.functionButton} onPress={handleButtonSen}>sin</Button>
                    <Button mode="contained" style={styles.functionButton} onPress={handleButtonAsin}>asi</Button>
                    <Button 
                        mode="contained" 
                        style={styles.functionButton} 
                        onPress={showUseModal}
                        disabled={!hasMemorySaved()}
                    >
                        M
                    </Button>
                </View>
                
                {/* Columna 2 */}
                <View style={styles.buttonColumn}>
                    <Button mode="contained" style={styles.functionButton} onPress={handleButtonTan}>tan</Button>
                    <Button mode="contained" style={styles.functionButton} onPress={handleButtonCos}>cos</Button>
                    <Button mode="contained" style={styles.functionButton} onPress={handleButtonParentesisA}>(</Button>                        
                </View>
                
                {/* Columna 3 */}
                <View style={styles.buttonColumn}>
                    <Button mode="contained" style={styles.functionButton} onPress={handleButtonAtan}>atn</Button>
                    <Button mode="contained" style={styles.functionButton} onPress={handleButtonAcos}>aco</Button>
                    <Button mode="contained" style={styles.functionButton} onPress={handleButtonParentesisC}>)</Button>
                </View>
                
                {/* Columna 4 */}
                <View style={styles.buttonColumn}>  
                    <Button mode="contained" style={styles.functionButton} onPress={handleButtonPi}>π</Button>
                    <Button mode="contained" style={styles.functionButton} onPress={handleButtonLn}>ln</Button>
                    <Button 
                        mode="contained" 
                        style={styles.functionButton} 
                        onPress={() => {
                            if (canSaveToMemory()) {
                                showSaveModal();
                            } else {
                                Alert.alert("Error", "No hay un resultado válido para guardar");
                            }
                        }}
                        disabled={!canSaveToMemory()}
                    >
                        M+
                    </Button>
                </View>
                
                {/* Columna 5 */}
                <View style={styles.buttonColumn}> 
                    <Button mode="contained" style={styles.functionButton} onPress={handleButtonSqrt}>√</Button>
                    <Button mode="contained" style={styles.functionButton} onPress={handleButtonLog}>log</Button>
                    <Button mode="contained" style={styles.functionButton} onPress={handleButtonExp}>
                        <Icon source="exponent" size={15} color="white" />
                    </Button>
                </View>
            </View>
        </Card>

        {/* Modal para guardar en memoria (M+) */}
        <Portal>
            <Modal 
                key={'save-' + JSON.stringify(memorySlots)}
                visible={saveModalVisible} 
                onDismiss={hideSaveModal} 
                contentContainerStyle={styles.modalContainer}
            >
                <Card style={styles.modalCard}>
                    <Card.Title 
                        title="Guardar en Memoria" 
                        titleStyle={styles.modalTitle}
                        right={(props) => (
                            <IconButton 
                                {...props} 
                                icon="close" 
                                onPress={hideSaveModal}
                            />
                        )}
                    />
                    <Card.Content>
                        <View style={styles.ansContainer}>
                            <Text style={styles.ansLabel}>Answer actual:</Text>
                            <Text style={styles.ansValue}>{ans}</Text>
                        </View>
                        
                        <Text style={styles.sectionLabel}>Seleccionar slot:</Text>
                        
                        <ScrollView style={styles.slotsScrollView}>
                            <View style={styles.slotsGrid}>
                                {Object.keys(memorySlots).map((letter) => (
                                    <View key={letter} style={styles.slotContainer}>
                                        <Button 
                                            mode={memorySlots[letter] ? "outlined" : "contained"}
                                            style={[
                                                styles.slotButton,
                                                memorySlots[letter] && styles.slotButtonOccupied
                                            ]}
                                            labelStyle={styles.slotButtonLabel}
                                            onPress={() => handleSaveToMemory(letter)}
                                        >
                                            {letter}
                                        </Button>
                                        <Text style={[
                                            styles.slotValue,
                                            memorySlots[letter] && styles.slotValueOccupied
                                        ]}>
                                            {memorySlots[letter] || 'Vacío'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </Card.Content>
                </Card>
            </Modal>
        </Portal>

        {/* Modal para usar memoria (M) */}
        <Portal>
            <Modal 
                key={JSON.stringify(memorySlots)}
                visible={useModalVisible} 
                onDismiss={hideUseModal} 
                contentContainerStyle={styles.modalContainer}
            >
                <Card style={styles.modalCard}>
                    <Card.Title 
                        title="Memoria Guardada" 
                        titleStyle={styles.modalTitle}
                        right={(props) => (
                            <IconButton 
                                {...props} 
                                icon="close" 
                                onPress={hideUseModal}
                            />
                        )}
                    />
                    <Card.Content>
                        {!hasMemorySaved() ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No hay valores guardados</Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Usa M+ para guardar resultados primero
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.sectionLabel}>Valores guardados:</Text>
                                
                                <ScrollView style={styles.slotsScrollView}>
                                    <View style={styles.slotsGrid}>
                                        {Object.entries(memorySlots)
                                            .filter(([_, value]) => value !== '')
                                            .map(([letter, value]) => (
                                                <Card key={letter} style={styles.memoryCard} mode="contained">
                                                    <Card.Content style={styles.memoryCardContent}>
                                                        <View style={styles.memoryCardHeader}>
                                                            <Text style={styles.memorySlotLetter}>{letter}</Text>
                                                            <Text style={styles.memorySlotValue} numberOfLines={1}>
                                                                {value}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.memoryCardActions}>
                                                            <Button 
                                                                mode="contained"
                                                                compact
                                                                style={styles.useMemoryButton}
                                                                onPress={() => handleUseMemory(letter, value)}
                                                            >
                                                                Usar
                                                            </Button>
                                                        </View>
                                                    </Card.Content>
                                                </Card>
                                            ))
                                        }
                                    </View>
                                </ScrollView>
                            </>
                        )}
                    </Card.Content>
                </Card>
            </Modal>
        </Portal>

        {/* Panel numérico */}
        <Card mode="elevated" style={styles.functionsCard}>
            <View style={styles.functionsCardSection1}>
                <View style={styles.buttonColumn}>
                    <Button mode="contained-tonal" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('7')}>7</Button>
                    <Button mode="contained-tonal" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('4')}>4</Button>
                    <Button mode="contained-tonal" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('1')}>1</Button>
                    <Button mode="contained-tonal" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('0')}>0</Button>
                </View>
                <View style={styles.buttonColumn}>
                    <Button mode="contained-tonal" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('8')}>8</Button>
                    <Button mode="contained-tonal" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('5')}>5</Button>
                    <Button mode="contained-tonal" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('2')}>2</Button>
                    <Button mode="contained" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('.')}>,</Button>
                </View>
                <View style={styles.buttonColumn}>
                    <Button mode="contained-tonal" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('9')}>9</Button>
                    <Button mode="contained-tonal" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('6')}>6</Button>
                    <Button mode="contained-tonal" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('3')}>3</Button>
                    <Button mode="contained" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('+')}>+</Button>
                </View>
                <View style={styles.buttonColumn}>
                    <Button mode="contained" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('-')}>-</Button>
                    <Button mode="contained" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('*')}>x</Button>
                    <Button mode="contained" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={() => ingresarDisplay('/')}>÷</Button>
                    <Button mode="contained" style={styles.Button} labelStyle={styles.buttonLabelStyle} onPress={handleButtonResult}>=</Button>
                </View>
            </View>
        </Card> 
        </>
    );
};

const styles = StyleSheet.create({
    input: {
        display: 'none',
    },
    displayContainer: {
        width: '100%',
        backgroundColor: '#000000',
        paddingHorizontal: 10,
        paddingVertical: 20,
        minHeight: 60,
        justifyContent: 'center',
    },
    displayText: {
        fontSize: 20,
        color: '#ffffff',
        textAlign: 'right',
        fontFamily: 'monospace',
    },
    cursor: {
        fontSize: 20,
        color: '#00ff00',
        fontWeight: 'bold',
        backgroundColor: 'rgba(0, 255, 0, 0.3)',
    },
    resultDisplay: {
        width: '100%',
        height: 110,
        backgroundColor: '#000000',
        color: '#ffffff',
        fontSize: 36,
        textAlign: 'right',
        justifyContent: 'center',
        paddingRight: 10,
        paddingVertical: 20,
    },
    controlRow: {
        height: 40,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        paddingVertical: 8,
        marginTop: 0,
        borderRadius: 0,
    },
    functionsCard: {
        width: '100%',
        marginTop: 0,
        borderRadius: 0,
        backgroundColor: "#2c2c2c",
        padding: 0,
    },
    functionsCardSection1: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 2,
    },
    buttonColumn: {
        flexDirection: 'column',
        gap: 8,
        flex: 1,
    },
    functionButton: {
        margin: 'auto',
        fontSize: 15,
        fontWeight: 'bold',
        height: 41,
        minWidth: 70,
    },
    Button: {
        width: '100%',
        height: 67,
        alignContent: 'center',
        justifyContent: 'center',
    },
    buttonLabelStyle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    // Modal styles
    modalContainer: {
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        height: '70%',
    },
    modalCard: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#2c2c2c',
        borderRadius: 8,
        maxHeight: '80%',
    },
    modalTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    ansContainer: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#1a1a1a',
        borderRadius: 5,
    },
    ansLabel: {
        color: '#cccccc',
        fontSize: 14,
        marginBottom: 5,
    },
    ansValue: {
        color: '#4CAF50',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    sectionLabel: {
        color: '#cccccc',
        fontSize: 14,
        marginBottom: 10,
    },
    slotsScrollView: {
        maxHeight: 300,
        marginBottom: 15,
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    slotContainer: {
        alignItems: 'center',
        width: 70,
        marginBottom: 10,
    },
    slotButton: {
        height: 41,
        width: 70,
        justifyContent: 'center',
    },
    slotButtonOccupied: {
        backgroundColor: '#3a3a3a',
        borderColor: '#FF9800',
    },
    slotButtonLabel: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    slotValue: {
        fontSize: 11,
        color: '#4CAF50',
        textAlign: 'center',
        marginTop: 2,
        width: '100%',
    },
    slotValueOccupied: {
        color: '#FF9800',
    },
    memoryCard: {
        backgroundColor: '#3a3a3a',
        borderRadius: 8,
        width: '100%',
        marginBottom: 8,
    },
    memoryCardContent: {
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    memoryCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    memorySlotLetter: {
        color: '#4CAF50',
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 4,
        minWidth: 30,
        textAlign: 'center',
    },
    memorySlotValue: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginLeft: 10,
        textAlign: 'right',
    },
    memoryCardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    useMemoryButton: {
        flex: 2,
    },
    clearSlotButton: {
        flex: 1,
        borderColor: '#ff4444',
    },
    clearAllButton: {
        borderColor: '#ff4444',
        marginTop: 10,
    },
    clearAllButtonLabel: {
        color: '#ff4444',
    },
    emptyState: {
        padding: 30,
        alignItems: 'center',
    },
    emptyStateText: {
        color: '#888',
        fontSize: 16,
        marginBottom: 10,
    },
    emptyStateSubtext: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
    },
});