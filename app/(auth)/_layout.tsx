// app/login/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function LoginLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Autenticación',
            animation: 'slide_from_right'
          }} 
        />
      </Stack>
    </>
  );
}