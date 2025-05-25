<script setup>
import TableInfo from '@/user/components/TableInfo.vue'; // Import the TableInfo component

// TODO: Add any specific logic needed for the Seller Order List View

</script>

<template>
  <div class="basic-container">
    <div class="center-container">
      <el-card class="order-list-card">
        <h2>我的出售订单</h2> <!-- Add translation key -->
        <!-- Use the TableInfo component for displaying seller orders -->
        <TableInfo :is-sell="true" />
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.basic-container {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align to top */
  min-height: 100vh; /* Ensure container takes at least full viewport height */
  background-color: #CAD9F1; /* Light blue background */
  padding: 50px 20px; /* Add padding top and bottom */
  box-sizing: border-box;
}

.center-container{
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px; /* Adjust width for the table */
  background-color: #ffffff; /* White background */
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 30px; /* Add padding inside */
  box-sizing: border-box;
}

.order-list-card {
    width: 100%;
    border: none; /* Remove default card border */
    box-shadow: none; /* Remove default card shadow */
}

.order-list-card h2 {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
  text-align: center;
}
</style> 