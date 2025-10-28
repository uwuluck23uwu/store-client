import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Formik } from "formik";
import { useAuth } from "../../hooks/useAuth";
import { FormInput, PrimaryButton } from "../../components/common";
import { loginSchema } from "../../utils/validationSchemas";

const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    email: "",
    password: "",
  };

  const handleLogin = async (values: typeof initialValues) => {
    setLoading(true);
    try {
      const result = await login({
        email: values.email.trim(),
        password: values.password,
      });

      if (result.success) {
        // Navigate back to main screen after successful login
        navigation.navigate('Main');
      } else {
        Alert.alert(
          "เข้าสู่ระบบไม่สำเร็จ",
          result.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
        );
      }
    } catch (error: any) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>ยินดีต้อนรับ</Text>
          <Text style={styles.subtitle}>เข้าสู่ระบบเพื่อเริ่มช้อปปิ้ง</Text>
        </View>

        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.form}>
              <FormInput
                label="อีเมล"
                placeholder="user@gmail.com"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                icon="email"
                required
                error={touched.email && errors.email ? errors.email : undefined}
              />

              <FormInput
                label="รหัสผ่าน"
                placeholder="••••••••"
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                editable={!loading}
                icon="lock"
                isPassword
                required
                error={
                  touched.password && errors.password
                    ? errors.password
                    : undefined
                }
              />

              <PrimaryButton
                label="เข้าสู่ระบบ"
                onPress={handleSubmit}
                loading={loading}
                icon="login"
                style={styles.loginButton}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate("Register")}
                disabled={loading}
              >
                <Text style={styles.link}>ยังไม่มีบัญชี? สมัครสมาชิก</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    width: "100%",
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  link: {
    color: "#4CAF50",
    textAlign: "center",
    fontSize: 14,
  },
});

export default LoginScreen;
