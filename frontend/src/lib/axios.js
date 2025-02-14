import axios from "axios";


export const axiosInt = axios.create({
    baseURL: "http://localhost:5001",
    withCredentials:true
})

//axiosInt ده هو نسخة مخصصة من Axios بتحتوي على إعدادات ثابتة زي:

// baseURL اللي هتستخدمه في كل طلب.
// withCredentials: true علشان لو فيه كوكيز (مثلاً توكين) محتاجين يتبعتوا مع الطلبات.
