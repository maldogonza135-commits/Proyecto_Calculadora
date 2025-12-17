import type { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import type { NavigationHelpers } from "@react-navigation/native";

import { Slot, Tabs, usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Appbar } from "react-native-paper";

// ============ COMPONENTE PRINCIPAL ============
export default function CalculadoraNavTabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const prevPathRef = useRef<string | null>(null);
  const [headerTitle, setHeaderTitle] = useState<string>("Calculadora");

  useEffect(() => {
    if (!pathname) return;
    
    const prev = prevPathRef.current;
    if (prev !== pathname) {
      const segments = pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1] ?? "";

      let title = "Calculadora";
      if (last === "CalculadoraBasica") title = "Básica";
      else if (last === "CalculadoraCientifica") title = "Científica";
      else if (last === "settings") title = "Ajustes";
      else if (last === "historial") title = "Historial";

      setHeaderTitle(title);
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  // Verificar si estamos en pantalla hija (historial/settings)
  const isChildScreen = pathname?.includes('/historial') || pathname?.includes('/settings');

  // CORREGIDO: Funciones separadas y con logs
  const openHistorial = () => {
    console.log('🎯 Navegando a HISTORIAL');
    router.push({
      pathname: '/(tabPrincipal)/(tabCalculadora)/historial',
      params: {
        modoRetorno: 'conDato',
        pantallaOrigen: 'calculadora',
        tabActual: pathname.split('/').pop()
      },
    });
  };

  const openSettings = () => {
    console.log('⚙️ Navegando a SETTINGS');
    router.push({
      pathname: '/(tabPrincipal)/(tabCalculadora)/settings',
      params: {
        pantallaOrigen: 'calculadora',
        tabActual: pathname.split('/').pop()
      },
    });
  };

  //Para que no se ejecute tabs en settings e historial
  const hideTabs = pathname?.includes('/settings') || pathname?.includes('/historial');
  
  return (
    <>
      {/* ✅ APP BAR DIRECTAMENTE - SIN COMPONENTE PERSONALIZADO */}
      <Appbar.Header>
        {/* Botón de volver si estamos en pantalla hija */}
        {isChildScreen ? (
          <Appbar.BackAction onPress={() => router.back()} />
        ) : null}
        
        <Appbar.Content title={headerTitle} />
        
        {/* Mostrar botones solo si NO estamos en pantalla hija */}
        {!isChildScreen ? (
          <>
            <Appbar.Action 
              icon="history" 
              onPress={openHistorial}  // ✅ Usa la función corregida
            />
            <Appbar.Action 
              icon="cog" 
              onPress={openSettings}  // ✅ Usa la nueva función
            />
          </>
        ) : null}
      </Appbar.Header>
      
      {/* Tabs: contenedor de las dos pantallas de calculadora */}
      {hideTabs ? (
          <Slot />
        ) : (
        <Tabs
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            tabBarPosition: "top",
          }}
        >
        {/* Primera pestaña: Calculadora Básica */}
        <Tabs.Screen
          name="CalculadoraBasica"
          options={{
            title: "Básica",
          }}
        />
        
        {/* Segunda pestaña: Calculadora Científica */}
        <Tabs.Screen
          name="CalculadoraCientifica"
          options={{
            title: "Cientifica",
          }}
        />
        </Tabs>
      )}
      </>
  );
}

// ============ COMPONENTE TAB BAR PERSONALIZADO ============
type CustomTabBarProps = {
  state: any;
  descriptors: Record<string, any>;
  navigation: NavigationHelpers<Record<string, any>, BottomTabNavigationEventMap>;
};

const CustomTabBar = ({ state, descriptors, navigation }: CustomTabBarProps) => {
  // ✅ FILTRAR RUTAS: excluir [settings] y [historial]
  const visibleRoutes = state.routes.filter((route: any) => {
    // Solo mostrar rutas que NO sean dinámicas
    return !route.name.includes('settings') && !route.name.includes('historial');
  });

  return (
    <View style={styles.tabBarContainer}>
      {/* Recorre solo las rutas visibles */}
      {visibleRoutes.map((route: any, index: number) => {
        const descriptor = descriptors[route.key];
        const { options } = descriptor;
        const label = options?.title || route.name;
        
        // Para determinar si está enfocado, necesitamos mapear el índice
        // porque estamos filtrando las rutas
        const originalIndex = state.routes.findIndex((r: any) => r.key === route.key);
        const isFocused = state.index === originalIndex;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Text
              style={[
                styles.tabText,
                isFocused ? styles.activeTabText : styles.inactiveTabText,
              ]}
            >
              {label}
            </Text>
            {isFocused && <View style={styles.activeIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
};

// ============ ESTILOS ============
const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    height: 60,
    borderTopWidth: 0,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  activeTabText: {
    color: "#4CAF50",
  },
  inactiveTabText: {
    color: "#0a0606ff",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "60%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
});