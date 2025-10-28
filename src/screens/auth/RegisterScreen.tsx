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
import { registerSchema } from "../../utils/validationSchemas";

const RegisterScreen = ({ navigation }: any) => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  };

  const handleRegister = async (values: typeof initialValues) => {
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phoneNumber,
    } = values;

    setLoading(true);
    try {
      const result = await register({
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        phone: phoneNumber,
        phoneNumber,
        password,
        confirmPassword,
        role: "Customer",
      });

      if (result.success) {
        // Navigate back to main screen after successful registration
        navigation.navigate("Main");
      } else {
        Alert.alert("สมัครสมาชิกไม่สำเร็จ", result.message);
      }
    } catch (error: any) {
      Alert.alert(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง"
      );
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
          <Text style={styles.title}>สมัครสมาชิก</Text>
          <Text style={styles.subtitle}>สร้างบัญชีของคุณ</Text>
        </View>

        <Formik
          initialValues={initialValues}
          validationSchema={registerSchema}
          onSubmit={handleRegister}
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
                label="ชื่อ"
                placeholder="ชื่อ"
                value={values.firstName}
                onChangeText={handleChange("firstName")}
                onBlur={handleBlur("firstName")}
                editable={!loading}
                icon="account"
                required
                error={
                  touched.firstName && errors.firstName
                    ? errors.firstName
                    : undefined
                }
              />

              <FormInput
                label="นามสกุล"
                placeholder="นามสกุล"
                value={values.lastName}
                onChangeText={handleChange("lastName")}
                onBlur={handleBlur("lastName")}
                editable={!loading}
                icon="account"
                required
                error={
                  touched.lastName && errors.lastName
                    ? errors.lastName
                    : undefined
                }
              />

              <FormInput
                label="เบอร์โทรศัพท์"
                placeholder="0812345678"
                value={values.phoneNumber}
                onChangeText={handleChange("phoneNumber")}
                onBlur={handleBlur("phoneNumber")}
                keyboardType="phone-pad"
                editable={!loading}
                icon="phone"
                required
                error={
                  touched.phoneNumber && errors.phoneNumber
                    ? errors.phoneNumber
                    : undefined
                }
              />

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

              <FormInput
                label="ยืนยันรหัสผ่าน"
                placeholder="••••••••"
                value={values.confirmPassword}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                editable={!loading}
                icon="lock-check"
                isPassword
                required
                error={
                  touched.confirmPassword && errors.confirmPassword
                    ? errors.confirmPassword
                    : undefined
                }
              />

              <PrimaryButton
                label="สมัครสมาชิก"
                onPress={handleSubmit}
                loading={loading}
                icon="account-plus"
                style={styles.registerButton}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                disabled={loading}
              >
                <Text style={styles.link}>มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Text>
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
    padding: 20,
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
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
  registerButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  link: {
    color: "#4CAF50",
    textAlign: "center",
    fontSize: 14,
  },
});

export default RegisterScreen;
