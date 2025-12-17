import { useRouter } from 'expo-router';
import { all, create } from 'mathjs';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Divider, IconButton, Menu, Text, TextInput } from 'react-native-paper';

const math = create(all);

export default function ConversorMedidas(){
  const router = useRouter();
  const [menu1, setMenu1Visible] = useState(false);
  const [menu2, setMenu2Visible] = useState(false);
  const [valor1, setValor1] = useState('');
  const [resultado, setResultado] = useState('');
  const [expresion1, setExpresion1] = useState('');
  
  // Estado que guarda tanto la etiqueta en español como la unidad para Math.js
  const [unidad1, setUnidad1] = useState({ 
    label: 'Sin selección', 
    value: '' 
  });
  const [unidad2, setUnidad2] = useState({ 
    label: 'Sin selección', 
    value: '' 
  });

  const openMenu1 = () => setMenu1Visible(true);
  const closeMenu1 = () => setMenu1Visible(false);
  const openMenu2 = () => setMenu2Visible(true);
  const closeMenu2 = () => setMenu2Visible(false);

  const handleMenu1 = (labelEsp: string, unidadMath: string) => {
    setUnidad1({ label: labelEsp, value: unidadMath });
    closeMenu1();
    actualizarExpresionYCalcular(labelEsp, unidadMath, unidad2.label, unidad2.value);
  };

  const handleMenu2 = (labelEsp: string, unidadMath: string) => {
    setUnidad2({ label: labelEsp, value: unidadMath });
    closeMenu2();
    actualizarExpresionYCalcular(unidad1.label, unidad1.value, labelEsp, unidadMath);
  };

  const handleValorChange = (text: string) => {
    setValor1(text);
    if (unidad1.value && unidad2.value) {
      actualizarExpresionYCalcular(unidad1.label, unidad1.value, unidad2.label, unidad2.value, text);
    }
  };

  // Función central que actualiza la UI y hace el cálculo
  const actualizarExpresionYCalcular = (
    label1: string, 
    mathUnit1: string, 
    label2: string, 
    mathUnit2: string, 
    valor = valor1
  ) => {
    if (!valor || !mathUnit1 || !mathUnit2) return;
    
    // 1. Actualizar expresión para Math.js
    const expresionMath = `${valor} ${mathUnit1} to ${mathUnit2}`;
    setExpresion1(expresionMath);
    
    // 2. Calcular con Math.js
    try {
      const resultadoMath = math.evaluate(expresionMath);
      // Formatear el resultado (2 decimales)
      setResultado(math.format(resultadoMath, { precision: 2 }).toString());
    } catch (error) {
      console.error('Error en conversión:', error);
      setResultado('Error en conversión');
    }
  };

    const intercambiarUnidades = () => {
        // Solo intercambia las unidades si ambas están seleccionadas
        if (!unidad1.value || !unidad2.value) {
            return; // No hacer nada si falta una unidad
        }
        
        // Intercambiar unidades
        const temp = unidad1;
        setUnidad1(unidad2);
        setUnidad2(temp);
        
        // Recalcular si hay un valor ingresado
        if (valor1) {
            actualizarExpresionYCalcular(
            unidad2.label, 
            unidad2.value, 
            unidad1.label, 
            unidad1.value, 
            valor1
            );
        }
    };

  return (
    <View style={styles.view}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Conversor de Medidas" />
      </Appbar.Header>
      
      <View style={styles.viewPrincipal}>
        <Text style={styles.expresionText}>
          {expresion1 || 'Selecciona medidas para ver la expresión'}
        </Text>
        
        <View style={styles.viewEntradaConversor}>
          <TextInput 
            style={styles.entradaTexto} 
            mode="outlined"
            keyboardType="numeric"
            value={valor1}
            onChangeText={handleValorChange}
            placeholder="Ingresa valor"
          />
          <View style={styles.vistaColumnas}>
            <Text variant="labelLarge" style={styles.textoSeleccion}>
              {unidad1.label}
            </Text>
            <Menu
              visible={menu1}
              onDismiss={closeMenu1}
              anchor={<IconButton onPress={openMenu1} icon="chevron-down" />}
              anchorPosition="bottom"
            >
              {/* Etiqueta en español, unidad en inglés para Math.js */}
              <Menu.Item 
                onPress={() => handleMenu1("Kilómetro", "km")} 
                title="Kilómetro" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu1("Metro", "m")} 
                title="Metro" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu1("Centímetro", "cm")} 
                title="Centímetro" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu1("Milímetro", "mm")} 
                title="Milímetro" 
              />
              <Divider />
              {/*es necesario poner el nombre completo de la medida y en ingles para usar mathjs*/}
              <Menu.Item 
                onPress={() => handleMenu1("Micrómetro", "micrometer")} 
                title="Micrómetro" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu1("Nanómetro", "nanometer")} 
                title="Nanómetro" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu1("Milla", "mile")} 
                title="Milla" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu1("Yarda", "yard")} 
                title="Yarda" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu1("Pie", "foot")} 
                title="Pie" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu1("Pulgada", "inch")} 
                title="Pulgada" 
              />
            </Menu>
          </View>
        </View>
        
        <View style={styles.viewCentral}>
          <IconButton icon="sync-circle" size={60} iconColor="#3d7aff" onPress={intercambiarUnidades} />
        </View>
        
        <View style={styles.viewEntradaConversor}>
          <TextInput 
            style={styles.entradaTexto} 
            mode="outlined"
            keyboardType="numeric"
            placeholder="Resultado"
            editable={false}
            value={resultado}
          />
          <View style={styles.vistaColumnas}>
            <Text variant="labelLarge" style={styles.textoSeleccion}>
              {unidad2.label}
            </Text>
            <Menu
              visible={menu2}
              onDismiss={closeMenu2}
              anchor={<IconButton onPress={openMenu2} icon="chevron-down" />}
              anchorPosition="bottom"
            >
              {/* Mismo mapeo para el segundo menú */}
              <Menu.Item 
                onPress={() => handleMenu2("Kilómetro", "km")} 
                title="Kilómetro" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu2("Metro", "m")} 
                title="Metro" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu2("Centímetro", "cm")} 
                title="Centímetro" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu2("Milímetro", "mm")} 
                title="Milímetro" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu2("Micrómetro", "micrometer")} 
                title="Micrómetro" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu2("Nanómetro", "nanometer")} 
                title="Nanómetro" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu2("Milla", "mile")} 
                title="Milla" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu2("Yarda", "yard")} 
                title="Yarda" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu2("Pie", "foot")} 
                title="Pie" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => handleMenu2("Pulgada", "inch")} 
                title="Pulgada" 
              />
            </Menu>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  view: { flex: 1 },
  viewPrincipal: { flex: 1, padding: 20 },
  expresionText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#000000',
    borderRadius: 5,
  },
  viewEntradaConversor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  entradaTexto: {
    flex: 1,
    marginRight: 10,
  },
  vistaColumnas: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoSeleccion: {
    marginRight: 5,
    minWidth: 100,
    color: '#000000'
  },
  viewCentral: {
    alignItems: 'center',
    marginVertical: 20,
  },
});