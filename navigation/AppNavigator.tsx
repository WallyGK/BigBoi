import EditTemplate from "@/app/EditTemplate";
import Exercises from "@/app/exercises";
import Templates from "@/app/templates";
import { RootStackParamList } from "@/types/navigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Templates">
      <Stack.Screen name="Templates" component={Templates} />
      <Stack.Screen name="EditTemplate" component={EditTemplate} />
      <Stack.Screen name="Exercises" component={Exercises} />
    </Stack.Navigator>
  );
}
