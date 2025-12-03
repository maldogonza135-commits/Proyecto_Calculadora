import { Tabs } from "expo-router";
import { Icon } from "react-native-paper";

export default function tabPrincipal(){
    return(
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: { display: "flex" },
                tabBarPosition: "bottom",
            }}
        >
            <Tabs.Screen 
                name="(tabCalculadora)"
                options={{
                    title: 'Calculadora',
                    tabBarIcon: ({ color, size }) => (
                        <Icon source="calculator-variant" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen 
                name="Herramientas"
                options={{
                    title: 'Herramientas',
                    tabBarIcon: ({ color, size }) => (
                        <Icon source="tools" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen 
                name="Tareas"
                options={{
                    title: 'Tareas',
                    tabBarIcon: ({ color, size }) => (
                        <Icon source="notebook-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
};