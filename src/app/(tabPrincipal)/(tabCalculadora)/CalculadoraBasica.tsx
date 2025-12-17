import React, { useState } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

/**
 * Props que recibe cada botón de la calculadora
 * label: el texto que se muestra en el botón
 * onPress: función que se ejecuta cuando lo presionas
 * variant: tipo de botón (número, operador o función)
 * flex: tamaño relativo del botón
 */
type CalcButtonProps = {
  label: string;    
  onPress: (e: GestureResponderEvent) => void;
  variant?: 'num' | 'op' | 'func';
  flex?: number;
};

/**
 * Componente que renderiza cada botón de la calculadora
 * Los colores cambian según el tipo de botón:
 * - Números: gris oscuro
 * - Operadores: naranja
 * - Funciones (AC, etc): gris claro
 */
const CalcButton: React.FC<CalcButtonProps> = ({
  label,
  onPress,
  variant = 'num',
  flex = 1,
}) => {
  const backgroundColor =
    variant === 'op'
      ? '#FF9500'
      : variant === 'func'
      ? '#A5A5A5'
      : '#333333';

  const color = variant === 'func' ? '#000' : '#fff';

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
      style={[styles.btn, { backgroundColor, flex }]}
    >
      <Text style={[styles.btnText, { color }]}>{label}</Text>
    </Pressable>
  );
};

export default function CalculadoraBasica() {
  /**
   * Estados de la calculadora:
   * display: lo que ves en pantalla
   * expression: la fórmula que está guardada
   * isError: si hubo un error
   * lastResult: el último resultado calculado
   */
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isError, setIsError] = useState(false);
  const [lastResult, setLastResult] = useState('0');

  /**
   * Limpia todo: reinicia la calculadora
   */
  const resetAll = () => {
    setDisplay('0');
    setExpression('');
    setIsError(false);
  };

  /**
   * Cuando presionas un número:
   * - Lo añade a la expresión
   * - Lo muestra en el display
   */
  const handleDigit = (d: number) => {
    if (isError) return; // No hace nada si hay error
    setExpression(prev => prev + d);
    setDisplay(prev => (prev === '0' ? String(d) : prev + d));
  };

  /**
   * Cuando presionas el punto decimal
   */
  const handleDot = () => {
    if (isError) return;
    setExpression(prev => prev + '.');
    setDisplay(prev => prev + '.');
  };

  /**
   * Cuando presionas un operador (+, -, *, /):
   * - Lo añade a la expresión
   * - Lo muestra en el display
   * - Evita dos operadores seguidos
   */
  const handleOperator = (op: '+' | '-' | '*' | '/') => {
    if (isError) return;
    if (expression.slice(-1).match(/[\+\-\*\/]/)) return; // No permite operadores consecutivos
    setExpression(prev => prev + op);
    setDisplay(prev => prev + op);
  };

  /**
   * Cuando presionas = :
   * - Evalúa la expresión completa
   * - Muestra el resultado
   * - Guarda el resultado en lastResult (para el botón ANS)
   */
  const handleEquals = () => {
    if (isError || expression.length === 0) return;

    try {
      // Reemplaza los símbolos visuales por los que usa JavaScript
      const sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/');
      
      // Usa Function para evaluar la expresión matemática
      const result = Function(`'use strict'; return (${sanitized})`)();
      
      // Muestra el resultado
      setDisplay(String(result));
      setExpression(String(result));
      setLastResult(String(result));
    } catch {
      // Si hay error, lo muestra
      setDisplay('Error');
      setExpression('');
      setIsError(true);
    }
  };

  /**
   * Cuando presionas el botón de borrar (⌫):
   * - Elimina el último carácter
   */
  const handleDelete = () => {
    if (isError || expression.length === 0) return;

    const newExpr = expression.slice(0, -1);
    setExpression(newExpr);

    // Extrae el último número para mostrarlo
    const match = newExpr.match(/([0-9.]+)$/);
    setDisplay(match ? match[0] : '0');
  };

  /**
   * Botón ANS: inserta el último resultado
   */
  const handleANS = () => {
    setExpression(prev => prev + lastResult);
    setDisplay(prev => (prev === '0' ? lastResult : prev + lastResult));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Pantalla de la calculadora */}
      <View style={styles.displayArea}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {expression || display}
        </Text>
      </View>

      {/* Fila 1: 7 8 9 Borrar AC */}
      <View style={styles.row}>
        <CalcButton label="7" onPress={() => handleDigit(7)} />
        <CalcButton label="8" onPress={() => handleDigit(8)} />
        <CalcButton label="9" onPress={() => handleDigit(9)} />
        <CalcButton label="⌫" variant="func" onPress={handleDelete} />
        <CalcButton label="AC" variant="func" onPress={resetAll} />
      </View>

      {/* Fila 2: 4 5 6 Multiplicar Dividir */}
      <View style={styles.row}>
        <CalcButton label="4" onPress={() => handleDigit(4)} />
        <CalcButton label="5" onPress={() => handleDigit(5)} />
        <CalcButton label="6" onPress={() => handleDigit(6)} />
        <CalcButton label="×" variant="op" onPress={() => handleOperator('*')} />
        <CalcButton label="÷" variant="op" onPress={() => handleOperator('/')} />
      </View>

      {/* Fila 3: 1 2 3 Sumar Restar */}
      <View style={styles.row}>
        <CalcButton label="1" onPress={() => handleDigit(1)} />
        <CalcButton label="2" onPress={() => handleDigit(2)} />
        <CalcButton label="3" onPress={() => handleDigit(3)} />
        <CalcButton label="+" variant="op" onPress={() => handleOperator('+')} />
        <CalcButton label="−" variant="op" onPress={() => handleOperator('-')} />
      </View>

      {/* Fila 4: 0 . ANS = */}
      <View style={styles.row}>
        <CalcButton label="0" flex={2} onPress={() => handleDigit(0)} />
        <CalcButton label="." onPress={handleDot} />
        <CalcButton label="ANS" variant="func" onPress={handleANS} />
        <CalcButton label="=" variant="op" onPress={handleEquals} />
      </View>
    </SafeAreaView>
  );
}

const SPACING = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: SPACING,
    paddingBottom: SPACING,
    justifyContent: 'flex-end',
  },
  displayArea: {
    minHeight: 110,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  displayText: {
    color: '#fff',
    fontSize: 64,
    fontWeight: '300',
  },
  row: {
    flexDirection: 'row',
    marginBottom: SPACING,
  },
  btn: {
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING / 2,
  },
  btnText: {
    fontSize: 28,
    fontWeight: '600',
  },
});
