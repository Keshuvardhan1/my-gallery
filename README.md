📸 My Gallery App

A React Native app built with Expo, featuring Google Authentication, Dark Mode toggle, and a simple photo gallery where users can add and view images.

🚀 Features

🔐 Google Authentication (Firebase + Expo Auth Session)

🌓 Dark/Light Mode Toggle (applies across all screens, including headers)

🖼️ Photo Gallery (view added photos in gallery view)

📷 Add Photo screen (capture or pick from device and display)

🔄 Sign Out (secure logout, returns to login screen)

📱 Responsive UI for both Android and iOS

🛠️ Tech Stack

React Native (Expo) – UI framework

Firebase Authentication – Google login integration

Expo AuthSession – Google OAuth

React Navigation – Navigation between screens

Context API – Auth and theme state management

📂 Project Structure
my-gallery/
│── src/
│   ├── AuthContext.js   # Handles authentication & theme context
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── GalleryScreen.js
│   │   └── AddPhotoScreen.js
│   └── components/      # (Optional future components)
│
│── assets/              # App icons, splash, images
│── App.js               # Entry point
│── app.json             # Expo config
│── package.json

⚙️ Setup Instructions

Clone the repo

git clone https://github.com/your-username/my-gallery.git
cd my-gallery


Install dependencies

npm install


Configure Firebase

Go to Firebase Console

Enable Google Sign-In under Authentication

Add your Expo redirect URI in Google Cloud Console

Example: https://auth.expo.io/@your-username/my-gallery

Copy your Web Client ID and add it in your AuthContext.js

Run the app

npx expo start

🎨 Dark Mode Preview

Light Mode


Dark Mode


✨ Future Enhancements

📂 Store uploaded photos in Firebase Storage or Cloud Firestore

🔄 Persist dark mode preference using AsyncStorage

🖼️ Gallery Grid layout

🌐 Deploy as a PWA for web access

👨‍💻 Author

Developed by Keshuvardhan 🚀