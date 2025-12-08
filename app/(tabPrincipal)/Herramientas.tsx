import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { List } from "react-native-paper";

export default function Herramientas(){
    const router = useRouter();


    return(
        <View>
            <List.Item
                title="Conversor"
                description="Convierte unidades de medida"
                left={props => <List.Icon {...props} icon="swap-horizontal" />}
                titleStyle={style.ListItemTitle}
                descriptionStyle={style.ListItemDescription}
                containerStyle={style.ListItemContainerStyle}
                onPress={() => router.push('/Conversores/ConversorMedida')}
            />
        </View>
    );
}


const style = StyleSheet.create({
    ListItemTitle: {
        color: "#000000",
        fontSize: 20
    },
    ListItemDescription: {
        color: "#000000",
        fontSize: 15
    },
    ListItemContainerStyle: {
        padding: 4
    }
})