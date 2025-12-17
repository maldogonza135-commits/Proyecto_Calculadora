import { Tabs, usePathname, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Icon } from "react-native-paper";

export default function tabPrincipal(){
    const router = useRouter();
    const pathname = usePathname();

    
    return(
        <View style={Styles.PrincipalView}>
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
                        )
                    }}
                />
                <Tabs.Screen 
                    name="Herramientas"
                    options={{
                        title: 'Herramientas',
                        tabBarIcon: ({ color, size }) => (
                            <Icon source="tools" color={color} size={size} />
                        ),
                        headerShown: true,
                        headerTitle: "Herramientas",
                        headerTintColor: "#ffffff",
                        headerStyle:{
                            backgroundColor: "#000000",
                        }
                        
                    }}
                />
                <Tabs.Screen 
                    name="Tareas"
                    options={{
                        title: 'Tareas',
                        tabBarIcon: ({ color, size }) => (
                            <Icon source="notebook-outline" color={color} size={size} />
                        ),
                        headerShown: true,
                        headerTitle: "Tareas",
                        headerTintColor: "#ffffff",
                        headerStyle:{
                            backgroundColor: "#000000",
                        }
                    }}
                />
            </Tabs>
        </View>
    );
};


const Styles = StyleSheet.create({
    PrincipalView: {
        width: '100%',
        height: '100%'
    },
});