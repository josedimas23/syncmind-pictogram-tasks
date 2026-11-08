// navigator/AppNavigator.js
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { headerOptions } from '../utils/theme';

// Pantallas comunes
import HomeScreen from '../screens/HomeScreen';
import PasswordUser from '../screens/PasswordUser';
import LoadingScreen from '../screens/LoadingScreen';
import RefuerzoPositivo from '../screens/RefuerzoPositivo';

//Pantallas de estudiantes
import UserScreen from '../screens/students/UserMainScreen';
import ShowFotocopia from '../screens/students/ShowFotocopia';
import UserMaterialTask from '../screens/students/UserMaterialTask';
import UserMenuTask from '../screens/students/UserMenuTask';
import UserStepsTask from '../screens/students/UserStepsTask';
import AssigmentMenuClass from '../screens/students/AssignmentMenuClass';

// Pantallas de profesores
import LoginPage from '../screens/teachers/LoginPageTeachers';
import TeachersMainScreen from '../screens/teachers/teachersMainScreen';
import UsersManagement from '../screens/teachers/userManagement/UsersManagement';
import EditUser from '../screens/teachers/userManagement/EditUser';
import AddUser from '../screens/teachers/userManagement/AddUser';

import ShowTasks from '../screens/teachers/taskManagement/ShowTasks';
import EditTask from '../screens/teachers/taskManagement/EditTask';
import AddTask from '../screens/teachers/taskManagement/AddTask';
import TaskAssignment from '../screens/teachers/taskManagement/taskAssignment';
import TaskMenu from '../screens/teachers/taskManagement/taskMenu';
import MaterialTaskTeacher from '../screens/teachers/taskManagement/MaterialTaskTeacher';
import StepsTask from '../screens/teachers/taskManagement/StepsTask';
import TaskFotocopias from '../screens/teachers/taskManagement/taskFotocopias';
import GraphicUser from '../screens/teachers/userManagement/GraphicUser';


const Stack = createStackNavigator();


export default function AppNavigator({ isLoading}) {

  if (isLoading) {
    return <LoadingScreen />;
  }


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={headerOptions}>
        
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          //options={{ headerShown: false }}
        />

        <Stack.Screen
          name="RefuerzoPositivo"
          component={RefuerzoPositivo}
          options={{ headerShown: false }}
        />

        {/* Pantallas de profesores */}
        <Stack.Screen
          name="LoginPage"
          component={LoginPage}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
         name="TeachersMainScreen" 
         component={TeachersMainScreen}
         options={{ headerLeft: () => null }}
        />

        <Stack.Screen 
          name="MaterialTaskTeacher" 
          component={MaterialTaskTeacher} 
        />

        <Stack.Screen 
          name="StepsTask" 
          component={StepsTask} 
        />

        <Stack.Screen
          name="TaskFotocopias"
          component={TaskFotocopias}
        />

        <Stack.Screen
          name="TaskAssignment"
          component={TaskAssignment}
        />

        <Stack.Screen
          name="TaskMenu"
          component={TaskMenu}
        />

        <Stack.Screen
          name="UsersManagement"
          component={UsersManagement}
        />

        <Stack.Screen
          name="EditUser"
          component={EditUser}
        />

        <Stack.Screen
          name="AddUser"
          component={AddUser}
        />

        <Stack.Screen
          name="GraphicUser"
          component={GraphicUser}
        />

        <Stack.Screen
          name="EditTask"
          component={EditTask}
        />

        <Stack.Screen
          name="AddTask"
          component={AddTask}
        />



       {/* Pantallas de estudiantes */}
        <Stack.Screen
          name="LoginUser"
          component={PasswordUser}
          //options={{ title: 'Selecciona la Contraseña' }}
        />
        <Stack.Screen
            name="UserScreen"
            component={UserScreen}
        />

        <Stack.Screen
          name="ShowTasks"
          component={ShowTasks}
        />

        <Stack.Screen
          name="ShowFotocopia"
          component={ShowFotocopia}
        />

        <Stack.Screen
          name="Recoger Material"
          component={UserMaterialTask}
        />

        <Stack.Screen
          name="UserStepsTask"
          component={UserStepsTask}
        />

        <Stack.Screen
          name="UserMenuTask"
          component={UserMenuTask}
        />

        <Stack.Screen
          name="AssigmentMenuClass"
          component={AssigmentMenuClass}
        />


      </Stack.Navigator>
    </NavigationContainer>
  );
}
