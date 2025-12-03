// src/pages/admin/Customers.jsx
import React from "react";
import AdminLayout from "./AdminLayout"; // Necesitas crear este componente

const AdminCustomers = () => {
  return (
    <AdminLayout title="Clientes - Admin">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Gestión de Clientes</h1>
        <p>Contenido de gestión de clientes</p>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;