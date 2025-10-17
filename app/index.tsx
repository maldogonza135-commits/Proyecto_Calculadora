import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  GestureResponderEvent,
} from 'react-native';

type CalcButtonProps = {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: 'num' | 'op' | 'func';
  flex?: number;
};

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

export default function Index() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isError, setIsError] = useState(false);
  const [lastResult, setLastResult] = useState('0');

  const resetAll = () => {
    setDisplay('0');
    setExpression('');
    setIsError(false);
  };

  const handleDigit = (d: number) => {
    if (isError) return;
    setExpression(prev => prev + d);
    setDisplay(prev => (prev === '0' ? String(d) : prev + d));
  };

  const handleDot = () => {
    if (isError) return;
    setExpression(prev => prev + '.');
    setDisplay(prev => prev + '.');
  };

  const handleOperator = (op: '+' | '-' | '*' | '/') => {
    if (isError) return;
    if (expression.slice(-1).match(/[\+\-\*\/]/)) return; // Evita operadores consecutivos
    setExpression(prev => prev + op);
    setDisplay(prev => prev + op);
  };

  const handleEquals = () => {
    if (isError || expression.length === 0) return;

    try {
      const sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/');
      const result = Function(`'use strict'; return (${sanitized})`)();
      setDisplay(String(result));
      setExpression(String(result));
      setLastResult(String(result));
    } catch {
      setDisplay('Error');
      setExpression('');
      setIsError(true);
    }
  };

  const handleDelete = () => {
    if (isError || expression.length === 0) return;

    const newExpr = expression.slice(0, -1);
    setExpression(newExpr);

    const match = newExpr.match(/([0-9.]+)$/);
    setDisplay(match ? match[0] : '0');
  };

  const handleANS = () => {
    setExpression(prev => prev + lastResult);
    setDisplay(prev => (prev === '0' ? lastResult : prev + lastResult));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Display principal */}
      <View style={styles.displayArea}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {expression || display}
        </Text>
      </View>

      {/* Fila 1 */}
      <View style={styles.row}>
        <CalcButton label="7" onPress={() => handleDigit(7)} />
        <CalcButton label="8" onPress={() => handleDigit(8)} />
        <CalcButton label="9" onPress={() => handleDigit(9)} />
        <CalcButton label="⌫" variant="func" onPress={handleDelete} />
        <CalcButton label="AC" variant="func" onPress={resetAll} />
      </View>

      {/* Fila 2 */}
      <View style={styles.row}>
        <CalcButton label="4" onPress={() => handleDigit(4)} />
        <CalcButton label="5" onPress={() => handleDigit(5)} />
        <CalcButton label="6" onPress={() => handleDigit(6)} />
        <CalcButton label="×" variant="op" onPress={() => handleOperator('*')} />
        <CalcButton label="÷" variant="op" onPress={() => handleOperator('/')} />
      </View>

      {/* Fila 3 */}
      <View style={styles.row}>
        <CalcButton label="1" onPress={() => handleDigit(1)} />
        <CalcButton label="2" onPress={() => handleDigit(2)} />
        <CalcButton label="3" onPress={() => handleDigit(3)} />
        <CalcButton label="+" variant="op" onPress={() => handleOperator('+')} />
        <CalcButton label="−" variant="op" onPress={() => handleOperator('-')} />
      </View>

      {/* Fila 4 */}
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
