import User from "../models/user.model.js";
import Message from '../models/message.model.js'

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedUserId } }).select("-password");
        res.status(200).json(filteredUsers)

    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params
        const myId = req.user._id
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ]
        })
        res.status(200).json(messages)

    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });

    }

}

export const sendMessage = async (req, res) => {
    try {
      const { text, image } = req.body;
      const { id: receiverId } = req.params;
      const senderId = req.user._id;
  
      let imageUrl;
      if (image) {
        // Upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }
  
      const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
      });
  
      await newMessage.save();
  
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
  
      res.status(201).json(newMessage);
    } catch (error) {
      console.log("Error in sendMessage controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }

}


// req.user._id: هنا المفروض يكون فيه بيانات المستخدم اللي مسجل دخوله (وده عادة بيتحط بعد ما تعمل Middleware للتوثيق).
// User.find({ _id: { $ne: loggedUserId } }): الاستعلام ده بيجيب كل المستخدمين اللي _id بتاعهم مش بيساوي id المستخدم الحالي (يعني كل الناس غيرك).
// .select("-password"): ده بيمنع إرسال بيانات كلمة السر في النتيجة.
// لو حصل خطأ، الكود بيطبع رسالة الخطأ وبيرجع response بحالة 500.
// req.params: بيسحب الباراميتر من الـ URL، والباراميتر ده بيمثل ال id الخاص بالمستخدم اللي عايز تتكلم معاه (userToChatId).
// req.user._id: بيجيب id بتاع المستخدم الحالي (المسجل دخوله).
// الاستعلام بيستخدم الـ $or علشان يدور على الرسائل اللي بين الاتنين، سواء كان المستخدم الحالي هو الراسل أو المستقبل.
// بعد كده، الرسائل اللي اتحصل عليها بتتبعت في الـ response.
// لو حصل خطأ، الكود بيطبع رسالة الخطأ وبيرجع response بحالة 500.

// req.body: بيسحب بيانات الرسالة اللي جايه من العميل، زي النص والصورة.
// req.params: بياخد الـ id من رابط الـ URL وبيحوله لـ receiverId (اللي هو الـ id الخاص بالمستخدم المستقبل للرسالة).
// req.user._id: بيوضح الـ id الخاص بالمستخدم اللي بعت الرسالة (المُرسل)، والبيانات دي بتكون موجودة بعد ما المستخدم اتوثق (بواسطة middleware للتوثيق).
// الكود بيرفع الصورة على خدمة Cloudinary علشان تحصل على URL آمن للصورة.
// imageUrl: بيتخزن فيه الرابط الآمن اللي بيوصلك بيه Cloudinary.

// هنا بيتم إنشاء كائن جديد من نوع Message (باستخدام الموديل بتاع الرسائل).
// البيانات بتشمل:
// senderId: المستخدم اللي بعت الرسالة.
// receiverId: المستخدم المستقبل للرسالة.
// text: النص المرسَل.
// image: رابط الصورة (لو موجود).
// newMessage.save(): بيحفظ الرسالة في قاعدة البيانات.

// getReceiverSocketId(receiverId): دالة بتجيب الـ socket id للمستخدم المستقبل لو هو متصل.
// لو المستقبل متصل (يعني الـ socket id موجود):
// بيستخدم Socket.io لإرسال حدث ("newMessage") للمستخدم المستقبل مع بيانات الرسالة الجديدة
