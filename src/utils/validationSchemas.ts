import * as Yup from 'yup';

// Login Validation Schema
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .required('กรุณากรอกอีเมล'),
  password: Yup.string()
    .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    .required('กรุณากรอกรหัสผ่าน'),
});

// Register Validation Schema
export const registerSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร')
    .required('กรุณากรอกชื่อ'),
  lastName: Yup.string()
    .min(2, 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร')
    .required('กรุณากรอกนามสกุล'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก')
    .required('กรุณากรอกเบอร์โทรศัพท์'),
  email: Yup.string()
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .required('กรุณากรอกอีเมล'),
  password: Yup.string()
    .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    .required('กรุณากรอกรหัสผ่าน'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'รหัสผ่านไม่ตรงกัน')
    .required('กรุณายืนยันรหัสผ่าน'),
});
