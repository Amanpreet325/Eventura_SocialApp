

---

# **Social Media Dashboard for Role-Based Access Control (RBAC)**

## **Project Overview**

This project is a full-stack **Role-Based Access Control (RBAC)** application designed for managing users, roles, permissions, posts, and event venues. The system provides an interactive platform where users can log in with different roles (e.g., Club, Volunteer, Super Admin) and interact with features according to their permissions. The admin dashboard ensures secure and efficient management of users, roles, and venue bookings while offering tailored UI dashboards for each user type.
![ss10](https://github.com/user-attachments/assets/ccc4cb12-2477-43e0-91b6-2e73ad28b57f)

---

## **Features**

### **Core Features**

#### **User Model**
- **User Role Management:**
  - Users can log in with different roles: **Club, Volunteer, and Super Admin.**
  - Each role determines access and available features.
- **Post Management:**
  - Users (e.g., Club or Volunteer roles) can add, edit, or delete posts.
  - New posts or new users require **Super Admin** approval before being published or activated.
- **Dynamic Dashboards:**
  - Each user role is presented with a unique and role-specific dashboard UI, enhancing the user experience.

#### **Venue Model**
- **Venue Management by Admin:**
  - Only the **Admin role** has the authority to add, edit, and delete venues.
  - Venues can be showcased as available options for event bookings.
- **Event Booking:**
  - Venue bookings can only be done by **Club profiles**.

#### **Approval Workflow**
- New users and posts must first be approved by the **Super Admin** to ensure compliance and content quality before being displayed.

#### **Social Media Functionality**
- Users can upload, edit, and delete their posts.
- Venue options are showcased with detailed descriptions to facilitate event planning.
- The system supports adding, updating, and editing profiles.

---

## **Default Login Credentials**

To test the application, use the following default credentials:

1. **Super Admin**
   - Email: **superadmin@college.com**
   - Password: **12345678**
     ![ss2](https://github.com/user-attachments/assets/fe9db509-7b22-4fe4-8de1-a69521fa3a63)


2. **Club User (Debsoc)**
   - Username: **Debsoc**
   - Password: **debsoc123**
     ![ss 1](https://github.com/user-attachments/assets/c84df7e0-13d6-4cdb-9be7-c1d13e6d922a)


3. **Volunteer/User**
   - Username: **aps**
   - Password: **123**
![ss8](https://github.com/user-attachments/assets/90b60d89-19ed-4493-b04d-32c12ec6276f)

Each of these credentials gives access to a unique dashboard tailored to the respective roles and permissions.

---

## **Tech Stack**

- **Frontend:** React.js, Chakra UI, HTML, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, MySQL (depending on the module)
- **Frameworks/Libraries:** 
  - Authentication: JWT
  - UI Framework: Bootstrap/Material-UI
- **Hosting:** Deployed using AWS/Heroku

---

## **How It Works**

1. **User Roles and Permissions:**
   - User roles (e.g., Club, Volunteer) determine their dashboard access and allowed actions.
   - Only **Super Admin** can approve new users and posts.
2. **Post Workflow:**
   - A user (Club/Volunteer) creates a post.
   - The post enters a "Pending Approval" state visible only to the **Super Admin**.
   - After approval, the post is visible to all users.
    ![ss4](https://github.com/user-attachments/assets/edeb6ff7-9a3d-48b1-a3da-831042c7b3ec)

3. **Venue Management:**
   - Admin adds new venues to the system.
   - Clubs can browse and book venues for events directly from their dashboard.
     ![ss7](https://github.com/user-attachments/assets/6f1f842e-4429-4839-b829-c988dc48e41c)

4. **Dashboards:**
   - Role-specific dashboards provide tailored UI experiences:
     - **Super Admin Dashboard:** Approve users, posts, and manage all system elements.
     - **Admin Dashboard:** Manage venues and view system stats.
     - **Club Dashboard:** Manage posts and book venues.
     - **Volunteer Dashboard:** Upload and manage personal posts.
       ![ss6](https://github.com/user-attachments/assets/ac8f3550-4a92-445a-9294-5a91d5fc65d2)
       ![ss5](https://github.com/user-attachments/assets/4a0bf5fa-6cae-4d2d-9546-33a1527ad082)
![ss9](https://github.com/user-attachments/assets/b36c603f-2a53-4a2e-b957-d84cdd3b6664)



---

## **Installation**

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/social-media-dashboard.git
   cd social-media-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory and add the following:
     ```env
     PORT=5000
     MONGO_URI=your-mongodb-uri
     JWT_SECRET=your-secret-key
     ```

4. Run the application:
   ```bash
   npm start
   ```

5. Access the app in your browser at `http://localhost:5000`.

---

## **Database Schema**

### **User Model**
| Field          | Type     | Description                       |
|----------------|----------|-----------------------------------|
| `username`     | String   | Unique username for login         |
| `email`        | String   | User email                       |
| `role`         | String   | Role (e.g., Club, Volunteer)      |
| `status`       | String   | Active, Inactive                 |

### **Post Model**
| Field          | Type     | Description                       |
|----------------|----------|-----------------------------------|
| `title`        | String   | Title of the post                |
| `content`      | String   | Content of the post              |
| `status`       | String   | Pending/Approved/Rejected        |
| `author`       | ObjectId | Reference to User Model          |

### **Venue Model**
| Field          | Type     | Description                       |
|----------------|----------|-----------------------------------|
| `name`         | String   | Name of the venue                |
| `location`     | String   | Address or location              |
| `capacity`     | Number   | Maximum capacity                 |

---

## **Evaluation Criteria**

1. **Creativity and Design:**
   - A clean, modern, and role-specific dashboard UI.
2. **Functionality:**
   - Implementing approval workflows, dynamic permissions, and venue bookings.
3. **User Experience (UX):**
   - Intuitive and accessible UI interactions.
4. **Documentation:**
   - A detailed and structured README file.
5. **Security:**
   - Secure login, role-based access, and input validations.

---

## **Future Enhancements**

- Integrate notifications for approvals and rejections.
- Implement analytics for post engagement and venue bookings.
- Add export/import features for user and venue data.

---

