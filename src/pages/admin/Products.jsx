import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../layouts/AdminLayout';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useSubcategories } from '../../hooks/useSubcategories';
import {
  Search, Filter, Plus, Edit, Trash2, Eye,
  Download, Upload, Package, Tag, DollarSign,
  Percent, BarChart3, Star, Image as ImageIcon,
  Grid, List, MoreVertical, RefreshCw, AlertCircle,
  CheckCircle, XCircle, Clock, Loader, Copy,
  Archive,  TrendingUp, TrendingDown
} from 'lucide-react';

const AdminProducts = () => {
  const { products: hookProducts, loading: productsLoading, error: productsError } = useProducts();
  const { categories } = useCategories();
  const { subcategories } = useSubcategories();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [quickEditField, setQuickEditField] = useState('');
  const [quickEditValue, setQuickEditValue] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Form state for new/edit product
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    compare_price: '',
    cost: '',
    sku: '',
    barcode: '',
    stock: '',
    low_stock_threshold: '5',
    weight: '',
    dimensions: '',
    category_id: '',
    subcategory_id: '',
    brand: '',
    status: 'active',
    featured: false,
    image: '',
    images: [],
    specifications: {},
    tags: [],
    meta_title: '',
    meta_description: ''
  });

  useEffect(() => {
    if (hookProducts) {
      setProducts(hookProducts);
      setFilteredProducts(hookProducts);
      setLoading(productsLoading);
    }
  }, [hookProducts, productsLoading]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, categoryFilter, statusFilter, stockFilter, products]);

  const filterProducts = () => {
    let filtered = [...products];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category_id === categoryFilter);
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    // Filtrar por stock
    if (stockFilter === 'in_stock') {
      filtered = filtered.filter(product => product.stock > 0);
    } else if (stockFilter === 'low_stock') {
      filtered = filtered.filter(product => product.stock > 0 && product.stock <= (product.low_stock_threshold || 5));
    } else if (stockFilter === 'out_of_stock') {
      filtered = filtered.filter(product => product.stock <= 0);
    }

    setFilteredProducts(filtered);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      active: { label: 'Activo', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      draft: { label: 'Borrador', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      archived: { label: 'Archivado', color: 'bg-gray-100 text-gray-800', icon: Archive },
      discontinued: { label: 'Descontinuado', color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Package };
  };

  const getStockInfo = (stock, lowStockThreshold = 5) => {
    if (stock <= 0) {
      return { label: 'Sin stock', color: 'bg-red-100 text-red-800' };
    } else if (stock <= lowStockThreshold) {
      return { label: 'Stock bajo', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'En stock', color: 'bg-green-100 text-green-800' };
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories?.find(c => c.id === categoryId);
    return category?.name || 'Sin categoría';
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Aquí normalmente subirías la imagen a Supabase Storage
      // Por ahora, solo guardamos el nombre del archivo
      const fileName = `${Date.now()}-${file.name}`;
      
      setProductForm(prev => ({
        ...prev,
        image: fileName
      }));

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const createProduct = async () => {
    try {
      // Validar datos requeridos
      if (!productForm.name || !productForm.price) {
        alert('Nombre y precio son campos requeridos');
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productForm,
          price: parseFloat(productForm.price),
          compare_price: productForm.compare_price ? parseFloat(productForm.compare_price) : null,
          cost: productForm.cost ? parseFloat(productForm.cost) : null,
          stock: parseInt(productForm.stock) || 0,
          low_stock_threshold: parseInt(productForm.low_stock_threshold) || 5,
          featured: productForm.featured || false,
          tags: productForm.tags || [],
          specifications: productForm.specifications || {},
          images: productForm.images || []
        }])
        .select()
        .single();

      if (error) throw error;

      // Actualizar lista local
      setProducts(prev => [data, ...prev]);
      
      // Reset form
      resetProductForm();
      setShowEditModal(false);
      
      alert('Producto creado exitosamente');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error al crear el producto');
    }
  };

  const updateProduct = async () => {
    try {
      if (!editingProduct) return;

      const { error } = await supabase
        .from('products')
        .update({
          ...productForm,
          price: parseFloat(productForm.price),
          compare_price: productForm.compare_price ? parseFloat(productForm.compare_price) : null,
          cost: productForm.cost ? parseFloat(productForm.cost) : null,
          stock: parseInt(productForm.stock) || 0,
          low_stock_threshold: parseInt(productForm.low_stock_threshold) || 5,
          featured: productForm.featured || false,
          tags: productForm.tags || [],
          specifications: productForm.specifications || {},
          images: productForm.images || []
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      // Actualizar lista local
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...p, ...productForm } : p
      ));
      
      // Reset form
      resetProductForm();
      setEditingProduct(null);
      setShowEditModal(false);
      
      alert('Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error al actualizar el producto');
    }
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;

      // Actualizar lista local
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setFilteredProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setSelectedProducts(prev => prev.filter(id => id !== productToDelete.id));
      
      setShowDeleteModal(false);
      setProductToDelete(null);
      
      alert('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  const archiveProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'archived' })
        .eq('id', productId);

      if (error) throw error;

      // Actualizar lista local
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, status: 'archived' } : p
      ));
      
      alert('Producto archivado');
    } catch (error) {
      console.error('Error archiving product:', error);
      alert('Error al archivar el producto');
    }
  };

  const unarchiveProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'active' })
        .eq('id', productId);

      if (error) throw error;

      // Actualizar lista local
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, status: 'active' } : p
      ));
      
      alert('Producto activado');
    } catch (error) {
      console.error('Error unarchiving product:', error);
      alert('Error al activar el producto');
    }
  };

  const duplicateProduct = async (product) => {
    try {
      const newProduct = {
        ...product,
        name: `${product.name} (Copia)`,
        sku: product.sku ? `${product.sku}-COPY` : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      delete newProduct.id;

      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) throw error;

      // Actualizar lista local
      setProducts(prev => [data, ...prev]);
      
      alert('Producto duplicado exitosamente');
    } catch (error) {
      console.error('Error duplicating product:', error);
      alert('Error al duplicar el producto');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return;

    if (!window.confirm(`¿Estás seguro de que quieres ${bulkAction} ${selectedProducts.length} productos?`)) {
      return;
    }

    try {
      let updateData = {};
      
      switch (bulkAction) {
        case 'archive':
          updateData = { status: 'archived' };
          break;
        case 'activate':
          updateData = { status: 'active' };
          break;
        case 'delete':
          // Eliminar múltiples productos
          const { error } = await supabase
            .from('products')
            .delete()
            .in('id', selectedProducts);

          if (error) throw error;
          
          // Actualizar lista local
          setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
          setFilteredProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
          setSelectedProducts([]);
          setBulkAction('');
          
          alert(`${selectedProducts.length} productos eliminados`);
          return;
        default:
          return;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('products')
          .update(updateData)
          .in('id', selectedProducts);

        if (error) throw error;

        // Actualizar lista local
        setProducts(prev => prev.map(p => 
          selectedProducts.includes(p.id) ? { ...p, ...updateData } : p
        ));

        setSelectedProducts([]);
        setBulkAction('');
        
        alert(`${selectedProducts.length} productos actualizados`);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error al realizar la acción masiva');
    }
  };

  const exportProducts = () => {
    const dataToExport = filteredProducts.map(product => ({
      'ID': product.id,
      'Nombre': product.name,
      'SKU': product.sku || '',
      'Categoría': getCategoryName(product.category_id),
      'Precio': `S/. ${product.price?.toFixed(2)}`,
      'Stock': product.stock,
      'Estado': getStatusInfo(product.status).label,
      'Destacado': product.featured ? 'Sí' : 'No',
      'Fecha Creación': new Date(product.created_at).toLocaleDateString('es-PE')
    }));

    const csvContent = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `productos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      compare_price: '',
      cost: '',
      sku: '',
      barcode: '',
      stock: '',
      low_stock_threshold: '5',
      weight: '',
      dimensions: '',
      category_id: '',
      subcategory_id: '',
      brand: '',
      status: 'active',
      featured: false,
      image: '',
      images: [],
      specifications: {},
      tags: [],
      meta_title: '',
      meta_description: ''
    });
    setImagePreview(null);
  };

  const openEditModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        compare_price: product.compare_price || '',
        cost: product.cost || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        stock: product.stock || '',
        low_stock_threshold: product.low_stock_threshold || '5',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        category_id: product.category_id || '',
        subcategory_id: product.subcategory_id || '',
        brand: product.brand || '',
        status: product.status || 'active',
        featured: product.featured || false,
        image: product.image || '',
        images: product.images || [],
        specifications: product.specifications || {},
        tags: product.tags || [],
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || ''
      });
      setImagePreview(product.image);
    } else {
      setEditingProduct(null);
      resetProductForm();
    }
    setShowEditModal(true);
  };

  const openQuickEdit = (field, value = '') => {
    setQuickEditField(field);
    setQuickEditValue(value);
    setShowQuickEdit(true);
  };

  const handleQuickEdit = async () => {
    if (!quickEditField || selectedProducts.length === 0) return;

    try {
      let updateValue = quickEditValue;
      
      // Parsear según el tipo de campo
      if (quickEditField === 'price' || quickEditField === 'compare_price' || quickEditField === 'cost') {
        updateValue = parseFloat(quickEditValue);
      } else if (quickEditField === 'stock') {
        updateValue = parseInt(quickEditValue);
      } else if (quickEditField === 'featured') {
        updateValue = quickEditValue === 'true';
      }

      const { error } = await supabase
        .from('products')
        .update({ [quickEditField]: updateValue })
        .in('id', selectedProducts);

      if (error) throw error;

      // Actualizar lista local
      setProducts(prev => prev.map(p => 
        selectedProducts.includes(p.id) ? { ...p, [quickEditField]: updateValue } : p
      ));

      setShowQuickEdit(false);
      setQuickEditField('');
      setQuickEditValue('');
      
      alert(`${selectedProducts.length} productos actualizados`);
    } catch (error) {
      console.error('Error in quick edit:', error);
      alert('Error al actualizar los productos');
    }
  };

  // Calcular estadísticas
  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    outOfStock: products.filter(p => p.stock <= 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= (p.low_stock_threshold || 5)).length,
    featured: products.filter(p => p.featured).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  return (
    <AdminLayout title="Gestión de Productos">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Productos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Administra el catálogo completo de productos ({stats.total} productos)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => openEditModal()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
          <button
            onClick={exportProducts}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Activos</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.outOfStock}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Sin Stock</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.lowStock}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Stock Bajo</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.featured}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Destacados</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            S/. {stats.totalValue.toLocaleString('es-PE')}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Valor Inventario</div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar productos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre, SKU, descripción..."
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="draft">Borrador</option>
              <option value="archived">Archivado</option>
              <option value="discontinued">Descontinuado</option>
            </select>
          </div>

          {/* Filtro por stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todo el stock</option>
              <option value="in_stock">En stock</option>
              <option value="low_stock">Stock bajo</option>
              <option value="out_of_stock">Sin stock</option>
            </select>
          </div>
        </div>

        {/* Acciones adicionales */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredProducts.length} productos encontrados
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <Upload className="w-4 h-4" />
              Importar
              <input type="file" accept=".csv,.xlsx" className="hidden" />
            </label>
            
            <button
              onClick={() => openQuickEdit('price', '')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Edición Rápida
            </button>
          </div>
        </div>
      </div>

      {/* Acciones masivas */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedProducts.length} productos seleccionados
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Acción masiva</option>
                <option value="activate">Activar</option>
                <option value="archive">Archivar</option>
                <option value="delete">Eliminar</option>
                <option value="feature">Marcar como destacado</option>
                <option value="unfeature">Quitar destacado</option>
              </select>
              
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aplicar
              </button>
              
              <button
                onClick={() => setSelectedProducts([])}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Limpiar selección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista de productos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Cargando productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || stockFilter !== 'all'
              ? 'Intenta con otros filtros de búsqueda'
              : 'No hay productos en el catálogo'}
          </p>
          <button
            onClick={() => openEditModal()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Crear primer producto
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        // Vista en cuadrícula
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const statusInfo = getStatusInfo(product.status);
            const stockInfo = getStockInfo(product.stock, product.low_stock_threshold);
            const StatusIcon = statusInfo.icon;
            const discount = product.compare_price
              ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Imagen del producto */}
                <div className="relative h-48 bg-gray-100 dark:bg-gray-900">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.featured && (
                      <span className="px-2 py-1 text-xs font-bold bg-yellow-500 text-white rounded-full">
                        Destacado
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  
                  {/* Checkbox de selección */}
                  <div className="absolute top-3 right-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => {
                        if (selectedProducts.includes(product.id)) {
                          setSelectedProducts(prev => prev.filter(id => id !== product.id));
                        } else {
                          setSelectedProducts(prev => [...prev, product.id]);
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                    />
                  </div>
                </div>

                {/* Información del producto */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                      {product.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {product.description || 'Sin descripción'}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        S/. {product.price?.toFixed(2)}
                      </span>
                      {product.compare_price && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">
                          S/. {product.compare_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${stockInfo.color}`}>
                      {stockInfo.label}: {product.stock}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3" />
                      {getCategoryName(product.category_id)}
                    </div>
                    {product.sku && (
                      <div className="mt-1">SKU: {product.sku}</div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Editar
                    </button>
                    
                    <div className="relative">
                      <button
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => {
                          // Toggle dropdown
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 hidden group-hover:block">
                        <button
                          onClick={() => duplicateProduct(product)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicar
                        </button>
                        
                        {product.status === 'archived' ? (
                          <button
                            onClick={() => unarchiveProduct(product.id)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Unarchive className="w-4 h-4" />
                            Activar
                          </button>
                        ) : (
                          <button
                            onClick={() => archiveProduct(product.id)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                          >
                            <Archive className="w-4 h-4" />
                            Archivar
                          </button>
                        )}
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                        
                        <button
                          onClick={() => {
                            setProductToDelete(product);
                            setShowDeleteModal(true);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Vista en lista
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={() => {
                      if (selectedProducts.length === filteredProducts.length) {
                        setSelectedProducts([]);
                      } else {
                        setSelectedProducts(filteredProducts.map(p => p.id));
                      }
                    }}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SKU / Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => {
                const statusInfo = getStatusInfo(product.status);
                const stockInfo = getStockInfo(product.stock, product.low_stock_threshold);
                const StatusIcon = statusInfo.icon;

                return (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => {
                          if (selectedProducts.includes(product.id)) {
                            setSelectedProducts(prev => prev.filter(id => id !== product.id));
                          } else {
                            setSelectedProducts(prev => [...prev, product.id]);
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {product.description || 'Sin descripción'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {product.sku || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {getCategoryName(product.category_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        S/. {product.price?.toFixed(2)}
                      </div>
                      {product.compare_price && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                          S/. {product.compare_price.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${stockInfo.color}`}>
                        {stockInfo.label}: {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4" />
                        <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      {product.featured && (
                        <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          ★ Destacado
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateProduct(product)}
                          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {product.status === 'archived' ? (
                          <button
                            onClick={() => unarchiveProduct(product.id)}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                            title="Activar"
                          >
                            <Unarchive className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => archiveProduct(product.id)}
                            className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg"
                            title="Archivar"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setProductToDelete(product);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edición/creación */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProduct(null);
                      resetProductForm();
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Formulario */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Columna izquierda - Información básica */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Nombre y SKU */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre del producto *
                        </label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Ej: Laptop Gaming MSI"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={productForm.sku}
                          onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Ej: MSI-GF63-001"
                        />
                      </div>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Describe el producto..."
                      />
                    </div>

                    {/* Precios */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Precio de venta *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            S/.
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            className="pl-12 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Precio comparación
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            S/.
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productForm.compare_price}
                            onChange={(e) => setProductForm({ ...productForm, compare_price: e.target.value })}
                            className="pl-12 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Costo
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            S/.
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productForm.cost}
                            onChange={(e) => setProductForm({ ...productForm, cost: e.target.value })}
                            className="pl-12 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stock y categoría */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Stock disponible
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Umbral stock bajo
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={productForm.low_stock_threshold}
                          onChange={(e) => setProductForm({ ...productForm, low_stock_threshold: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="5"
                        />
                      </div>
                    </div>

                    {/* Categoría y subcategoría */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Categoría
                        </label>
                        <select
                          value={productForm.category_id}
                          onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar categoría</option>
                          {categories?.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subcategoría
                        </label>
                        <select
                          value={productForm.subcategory_id}
                          onChange={(e) => setProductForm({ ...productForm, subcategory_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          disabled={!productForm.category_id}
                        >
                          <option value="">Seleccionar subcategoría</option>
                          {subcategories
                            ?.filter(sc => sc.category_id === productForm.category_id)
                            .map((subcategory) => (
                              <option key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha - Imagen y opciones */}
                  <div className="space-y-6">
                    {/* Imagen del producto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Imagen principal
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => {
                                setImagePreview(null);
                                setProductForm({ ...productForm, image: '' });
                              }}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Arrastra una imagen o haz clic para subir
                            </p>
                            <label className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
                              {uploadingImage ? (
                                <Loader className="w-4 h-4 animate-spin inline mr-2" />
                              ) : (
                                <Upload className="w-4 h-4 inline mr-2" />
                              )}
                              Subir imagen
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploadingImage}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Estado y opciones */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Estado
                        </label>
                        <select
                          value={productForm.status}
                          onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="active">Activo</option>
                          <option value="draft">Borrador</option>
                          <option value="archived">Archivado</option>
                          <option value="discontinued">Descontinuado</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={productForm.featured}
                          onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Producto destacado
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Marca
                        </label>
                        <input
                          type="text"
                          value={productForm.brand}
                          onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Ej: MSI, Apple, etc."
                        />
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={editingProduct ? updateProduct : createProduct}
                          disabled={!productForm.name || !productForm.price}
                          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                        </button>
                        <button
                          onClick={() => {
                            setShowEditModal(false);
                            setEditingProduct(null);
                            resetProductForm();
                          }}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                  ¿Eliminar producto?
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  Estás a punto de eliminar el producto <strong>"{productToDelete.name}"</strong>. 
                  Esta acción no se puede deshacer.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setProductToDelete(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteProduct}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición rápida */}
      {showQuickEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Edición rápida ({selectedProducts.length} productos)
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Campo a editar
                    </label>
                    <select
                      value={quickEditField}
                      onChange={(e) => setQuickEditField(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar campo</option>
                      <option value="price">Precio</option>
                      <option value="compare_price">Precio comparación</option>
                      <option value="stock">Stock</option>
                      <option value="status">Estado</option>
                      <option value="featured">Destacado</option>
                      <option value="category_id">Categoría</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nuevo valor
                    </label>
                    {quickEditField === 'status' ? (
                      <select
                        value={quickEditValue}
                        onChange={(e) => setQuickEditValue(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="active">Activo</option>
                        <option value="draft">Borrador</option>
                        <option value="archived">Archivado</option>
                        <option value="discontinued">Descontinuado</option>
                      </select>
                    ) : quickEditField === 'featured' ? (
                      <select
                        value={quickEditValue}
                        onChange={(e) => setQuickEditValue(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                      </select>
                    ) : quickEditField === 'category_id' ? (
                      <select
                        value={quickEditValue}
                        onChange={(e) => setQuickEditValue(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories?.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={quickEditField === 'price' || quickEditField === 'compare_price' ? 'number' : 'text'}
                        value={quickEditValue}
                        onChange={(e) => setQuickEditValue(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ingresa el nuevo valor"
                      />
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowQuickEdit(false);
                      setQuickEditField('');
                      setQuickEditValue('');
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleQuickEdit}
                    disabled={!quickEditField || !quickEditValue}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;