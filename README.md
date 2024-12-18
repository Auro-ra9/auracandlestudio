# **Aura Candle Studio - E-Commerce Website**  

![Aura Candle Studio Banner](https://via.placeholder.com/1200x400.png?text=Aura+Candle+Studio+-+Your+One-Stop+Candle+Shop)  
*(Replace with your actual project banner if available)*  



## **Live Demo AWS**  
🌐 [Visit Aura Candle Studio](https://auracandlestudio.shop)  

## **Live Demo on render**  
🌐 [Visit Aura Candle Studio](https://auracandlestudio.onrender.com)  



## **About the Project**  
**Aura Candle Studio** is a fully functional e-commerce website specializing in candles. This project is a complete implementation of an online shopping platform, featuring:  
- User-friendly **front-end interface** for customers.  
- **Admin dashboard** for managing products, orders, coupons, and users.  
- Integrated payment gateway with **Razorpay** for secure transactions.  
- **Google Authentication** for user registration and login.  
- Features like a **wishlist**, **wallet system**, and **return requests**.  
- Robust backend architecture using **Node.js** and **MongoDB**.  



## **Key Features**  

### **Customer Side**  
- Account creation with **Google Authentication**.  
- Product browsing and filtering options (e.g., by price, category, popularity).  
- Add-to-cart, wishlist, and order tracking.  
- **Apply coupons** during checkout.  
- Razorpay-integrated payment system.  

### **Admin Side**  
- Dashboard for managing users, products, categories, and coupons.  
- CRUD operations for products and categories.  
- Monitoring orders and managing statuses.  
- Referral and wallet reward systems.  

### **General Features**  
- **Responsive design** using **Bootstrap**.  
- Efficient **image management** with **Multer**.  
- Secure OTP-based verification for user actions.  
- Robust error handling and input validations.  



## **Tech Stack**  

### **Frontend:**  
- **HTML5**, **CSS3**, **JavaScript**  
- **EJS** templates  
- **Bootstrap** for responsive design  

### **Backend:**  
- **Node.js**  
- **Express.js**  

### **Database:**  
- **MongoDB** (hosted on **MongoDB Atlas**)  

### **Other Tools and Libraries:**  
- **Razorpay** for payment integration  
- **Google OAuth** for authentication  
- **Multer** for file uploads  
- **Nodemailer** for OTP emails  



## **Screenshots**  
### **Home Page**  
![Home Page Screenshot](https://via.placeholder.com/800x400.png?text=Home+Page)  
*(Replace with an actual screenshot)*  

### **Admin Dashboard**  
![Admin Dashboard Screenshot](https://via.placeholder.com/800x400.png?text=Admin+Dashboard)  
*(Replace with an actual screenshot)*  



## **How to Run Locally**  

1. **Clone the repository:**  
   ```bash
   git clone https://github.com/Auro-ra9/auracandlestudio.git
   cd Candle-e-commerce-website
   ```

2. **Install dependencies:**  
   ```bash
   npm install
   ```

3. **Set up environment variables:**  
   Create a `.env` file and add the following:  
   ```env
   PORT=5000  
   MONGODB_CONNECTION_STRING=<your-mongodb-connection-string>  
   GOOGLE_CLIENT_ID=<your-google-client-id>  
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>  
   GOOGLE_CLIENT_CALLBACK=<your-callback-url>  
   SMTP_MAIL=<your-smtp-email>  
   SMTP_PASSWORD=<your-smtp-password>  
   RAZORPAY_SECRET_ID=<your-razorpay-id>  
   RAZORPAY_SECRET_KEY=<your-razorpay-key>  
   ```

4. **Start the application:**  
   ```bash
   npm start
   ```  

5. **Access the application:**  
   - User side: `http://localhost:5000/`  
   - Admin side: `http://localhost:5000/admin`  



## **Folder Structure**  

```
Candle-e-commerce-website/
├── controllers/
├── middleware/
├── model/
├── public/
│   └──  images/
├── router/
├── services/
├── uploads/
├── views/
│   ├── admin/
│   ├── user/
│   └── layouts/
├── .env
├── app.js
├── package.json
└── README.md
```



## **Contributors**  
- **Ashna Ahammed** (Developer)  



## **Contact**  
📧 Email: [ashnaahammed9@gmail.com](mailto:ashnaahammed9@gmail.com)  
🌐 Portfolio: []  



## **Future Enhancements**  
- Adding dynamic reviews and ratings for products.  
- Implementing a subscription-based newsletter system.  
- Expanding to include more payment gateways like PayPal.  

