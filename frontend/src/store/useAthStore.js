import { create } from "zustand";
// import { get } from "zustand";
import { axiosInt } from '../lib/axios';  // Correct the axios instance import
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSignUp: false,
    isLoggedIn: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers:[],

    checkAuth: async () => {
        try {
            const response = await axiosInt.get('api/auth/check');
            set({
                authUser: response.data.user,
                isLoggedIn: response.data.isLoggedIn,
                isCheckingAuth: false,
            });
            useAuthStore.getState().connectSocket()
        } catch (error) {
            console.error("Failed to check auth", error);
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSignUp: true });
        try {
            const res = await axiosInt.post("/api/auth/signup", data);
            if (res.data) {
                toast.success("Account created successfully");
                // Add these lines to update auth state
                set({
                    authUser: res.data,
                    isLoggedIn: true,
                    isSignUp: false
                });
                useAuthStore.getState().connectSocket()
            }
        } catch (error) {
            console.error("Failed to sign up", error);
            toast.error(error.response?.data?.message || "Failed to create account");
            set({ isSignUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInt.post("/api/auth/login", data);
            if (res.data) {
                toast.success("Login successful");
                set({
                    authUser: res.data,
                    isLoggedIn: true,
                    isLoggingIn: false
                });
                useAuthStore.getState().connectSocket()
            }
        } catch (error) {
            console.error("Login failed", error);
            toast.error(error.response?.data?.message || "Invalid email or password");
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInt.post("/api/auth/logout"); // Add leading slash
            set({
                authUser: null,
                isLoggedIn: false // Add this to update login state
            });
            useAuthStore.getState().disconnectSocket()
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error(
                error.response?.data?.message || // Use optional chaining
                error.message ||
                "Failed to logout. Please try again."
            );
        }
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
    
        try {
            const res = await axiosInt.put("api/auth/update-profile", data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwts')}`,
                },
            });
    
            set((state) => ({
                authUser: { ...state.authUser, ...res.data }, // Preserve existing state
            }));
    
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Error in updating profile:", error);
            
            const errorMessage =
                error.response?.data?.message ||
                error.message || 
                "An error occurred while updating the profile";
    
            toast.error(errorMessage);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    connectSocket: () => {
        const { authUser } = useAuthStore.getState();
        if (!authUser || useAuthStore.getState().socket?.connected) return;
    
        const socket = io("http://localhost:5001", {
          query: {
            userId: authUser._id,
          },
        });
        socket.connect();
    
        set({ socket: socket });
    
        socket.on("getOnlineUsers", (userIds) => {
          set({ onlineUsers: userIds });
        });
      },
      disconnectSocket: () => {
        if (useAuthStore.getState().socket?.connected) useAuthStore.getState().socket.disconnect();
      },

}));
