import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useSubcategories } from '../../hooks/useSubcategories';
import {
  Search, Filter, Plus, Edit, Trash2, Eye,
  Download, Upload, Package, Tag, DollarSign,
  Percent, BarChart3, Star, Image as ImageIcon,
  Grid, List, MoreVertical, RefreshCw, AlertCircle,
  CheckCircle, XCircle, Clock, Loader, Copy,
  Archive, TrendingUp, TrendingDown, ChevronDown,
  ChevronUp, X, Check, AlertTriangle, ShoppingBag,
  Layers, Hash, Scale, Ruler, Zap,
  ArchiveRestore, Filter as FilterIcon, Sliders,
  ChevronLeft, ChevronRight, Calendar, EyeOff,
  Globe, Heart, Share2, Bookmark, Award,
  Barcode
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  getCategoryFolder, 
  getSubcategoryFolder 
} from "../../helpers/folders";

const AdminProducts = () => {
  const { products: hookProducts, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts();
  const { categories } = useCategories();
  const { subcategories } = useSubcategories();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [productStats, setProductStats] = useState({
    totalValue: 0,
    averagePrice: 0,
    totalStock: 0,
    outOfStockCount: 0
  });
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-wrapper")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
      calculateStats(hookProducts);
    }
  }, [hookProducts, productsLoading]);

  const calculateStats = useCallback((products) => {
    const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
    const averagePrice = products.length > 0 ? totalValue / products.length : 0;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const outOfStockCount = products.filter(p => (p.stock || 0) <= 0).length;
    
    setProductStats({
      totalValue,
      averagePrice,
      totalStock,
      outOfStockCount
    });
  }, []);

  const filterProducts = useCallback(() => {
    let filtered = [...products];

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category_id?.toString() === categoryFilter.toString());
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    // Filtrar por stock
    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'in_stock':
          filtered = filtered.filter(product => product.stock > 0);
          break;
        case 'low_stock':
          filtered = filtered.filter(product => product.stock > 0 && product.stock <= (product.low_stock_threshold || 5));
          break;
        case 'out_of_stock':
          filtered = filtered.filter(product => product.stock <= 0);
          break;
      }
    }

    // Filtrar por precio
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filtrar por destacado
    if (featuredFilter !== 'all') {
      filtered = filtered.filter(product => 
        featuredFilter === 'featured' ? product.featured : !product.featured
      );
    }

    // Ordenar productos
    switch (sortBy) {
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'stock_asc':
        filtered.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock_desc':
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Resetear a primera página al filtrar
  }, [searchTerm, categoryFilter, statusFilter, stockFilter, priceRange, featuredFilter, sortBy, products]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);
  // Exportación de productos a CSV con toast elegante
  const exportProducts = () => {
    if (!filteredProducts || filteredProducts.length === 0) {
      return toast.error("No hay productos para exportar.");
    }

    try {
      const headers = [
        "ID",
        "Nombre",
        "Descripción",
        "Precio",
        "Precio Comparativo",
        "Costo",
        "SKU",
        "Código de Barras",
        "Stock",
        "Categoría",
        "Subcategoría",
        "Marca",
        "Destacado",
        "Estado"
      ];

      const rows = filteredProducts.map(p => [
        p.id,
        `"${p.name || ""}"`,
        `"${p.description || ""}"`,
        p.price ?? "",
        p.compare_price ?? "",
        p.cost ?? "",
        `"${p.sku || ""}"`,
        `"${p.barcode || ""}"`,
        p.stock ?? 0,
        getCategoryName(p.category_id),
        getSubcategoryName(p.subcategory_id),
        `"${p.brand || ""}"`,
        p.featured ? "Sí" : "No",
        p.status
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Productos exportados correctamente 🎉");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Error al exportar los productos.");
    }
  };
  const getStatusInfo = (status) => {
    const statusMap = {
      active: { label: 'Activo', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', icon: CheckCircle, bg: 'bg-emerald-500' },
      draft: { label: 'Borrador', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20', icon: Clock, bg: 'bg-amber-500' },
      archived: { label: 'Archivado', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20', icon: Archive, bg: 'bg-slate-500' },
      discontinued: { label: 'Descontinuado', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20', icon: XCircle, bg: 'bg-rose-500' }
    };
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800', icon: Package };
  };

  const getStockInfo = (stock, lowStockThreshold = 5) => {
    if (stock <= 0) {
      return { label: 'Sin stock', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20', icon: AlertTriangle };
    } else if (stock <= lowStockThreshold) {
      return { label: 'Stock bajo', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20', icon: AlertTriangle };
    } else {
      return { label: 'En stock', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', icon: CheckCircle };
    }
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Sin categoría';
    const category = categories?.find(c => c.id.toString() === categoryId.toString());
    return category?.name || 'Sin categoría';
  };

  const getSubcategoryName = (subcategoryId) => {
    if (!subcategoryId) return null;
    const subcategory = subcategories?.find(s => s.id.toString() === subcategoryId.toString());
    return subcategory?.name;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validaciones
    if (!file.type.startsWith("image/")) return toast.error("Selecciona una imagen válida");
    if (file.size > 5 * 1024 * 1024) return toast.error("Máximo permitido 5MB");

    const categoryFolder = await getCategoryFolder(productForm.category_id);

    const subcategoryFolder = await getSubcategoryFolder(productForm.subcategory_id);

    const folder = subcategoryFolder || categoryFolder || "general";

    const filePath = `image/${folder}/${Date.now()}-${file.name}`;

    setUploadingImage(true);

    try {
      const { error } = await supabase.storage
        .from("images-techzone")
        .upload(filePath, file, { upsert: false });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("images-techzone")
        .getPublicUrl(filePath);

      setProductForm(prev => ({ ...prev, image: publicUrlData.publicUrl }));
      toast.success("Imagen subida correctamente 🎉");

    } catch (error) {
      console.error(error);
      toast.error("Error al subir la imagen");
    } finally {
      setUploadingImage(false);
    }
  };

  const createPrsoduct = async () => {
    try {
      if (!productForm.name || !productForm.price) {
        toast.error('Nombre y precio son campos requeridos');
        return;
      }

      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        compare_price: productForm.compare_price ? parseFloat(productForm.compare_price) : null,
        cost: productForm.cost ? parseFloat(productForm.cost) : null,
        stock: parseInt(productForm.stock) || 0,
        low_stock_threshold: parseInt(productForm.low_stock_threshold) || 5,
        featured: productForm.featured || false,
        tags: Array.isArray(productForm.tags) ? productForm.tags : [],
        specifications: productForm.specifications || {},
        images: productForm.images || []
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      // Actualizar lista local
      setProducts(prev => [data, ...prev]);
      await refetchProducts();
      
      // Reset form
      resetProductForm();
      setShowEditModal(false);
      
      toast.success('✅ Producto creado exitosamente');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
    }
  };

  const updateProduct = async () => {
    try {
      if (!editingProduct) {
        toast.error("No hay producto seleccionado.");
        return;
      }

      // VALIDACIONES
      if (!productForm.name || productForm.name.trim() === "") {
        toast.error("El nombre es obligatorio.");
        return;
      }

      if (!productForm.price || isNaN(productForm.price)) {
        toast.error("El precio debe ser un número válido.");
        return;
      }

      const updatedData = {
        name: productForm.name,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        compare_price: productForm.compare_price ? parseFloat(productForm.compare_price) : null,
        cost: productForm.cost ? parseFloat(productForm.cost) : null,
        stock: parseInt(productForm.stock) || 0,
        low_stock_threshold: parseInt(productForm.low_stock_threshold) || 5,
        category_id: productForm.category_id ? parseInt(productForm.category_id) : null,
        subcategory_id: productForm.subcategory_id ? parseInt(productForm.subcategory_id) : null,
        brand: productForm.brand || null,
        status: productForm.status || 'active',
        featured: productForm.featured || false,
        image: productForm.image || null,
        sku: productForm.sku || null,
        barcode: productForm.barcode || null,
        tags: Array.isArray(productForm.tags) ? productForm.tags : [],
        specifications: productForm.specifications || {},
        images: productForm.images || []
      };

      const { error } = await supabase
        .from("products")
        .update(updatedData)
        .eq("id", editingProduct.id);

      if (error) throw error;

      // Actualizar UI
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id ? { ...p, ...updatedData } : p
        )
      );

      resetProductForm();
      setEditingProduct(null);
      setShowEditModal(false);

      toast.success("✅ Producto actualizado con éxito");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Hubo un error al actualizar el producto.");
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
      
      toast.success('✅ Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
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
      
      toast.success('✅ Producto archivado');
    } catch (error) {
      console.error('Error archiving product:', error);
      toast.error('Error al archivar el producto');
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
      
      toast.success('✅ Producto activado');
    } catch (error) {
      console.error('Error unarchiving product:', error);
      toast.error('Error al activar el producto');
    }
  };

  const duplicateProduct = async (product) => {
    try {
      // Creamos solo las columnas permitidas por Supabase
      const newProduct = {
        name: `${product.name} (Copia)`,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
        category_id: product.category_id,
        subcategory_id: product.subcategory_id,
        specs: product.specs,
        specifications: product.specifications,
        compare_price: product.compare_price,
        cost: product.cost,
        sku: product.sku ? `${product.sku}-COPY-${Date.now()}` : null,
        low_stock_threshold: product.low_stock_threshold,
        weight: product.weight,
        dimensions: product.dimensions,
        status: product.status,
        featured: product.featured,
        images: product.images,
        tags: product.tags,
        meta_title: product.meta_title,
        meta_description: product.meta_description,
        barcode: product.barcode,
        brand: product.brand,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) throw error;

      // Actualizamos la lista local de productos
      setProducts(prev => [data, ...prev]);

      toast.success('✅ Producto duplicado exitosamente');
    } catch (error) {
      console.error('Error duplicando producto:', error);
      toast.error('Error al duplicar el producto');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) {
      toast.error('Selecciona una acción y productos');
      return;
    }

    const confirm = window.confirm(`¿Estás seguro de que quieres ${bulkAction} ${selectedProducts.length} productos?`);
    if (!confirm) return;

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
          const { error } = await supabase
            .from('products')
            .delete()
            .in('id', selectedProducts);

          if (error) throw error;
          
          setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
          setFilteredProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
          setSelectedProducts([]);
          setBulkAction('');
          
          toast.success(`${selectedProducts.length} productos eliminados`);
          return;
        case 'feature':
          updateData = { featured: true };
          break;
        case 'unfeature':
          updateData = { featured: false };
          break;
        default:
          return;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('products')
          .update(updateData)
          .in('id', selectedProducts);

        if (error) throw error;

        setProducts(prev => prev.map(p => 
          selectedProducts.includes(p.id) ? { ...p, ...updateData } : p
        ));

        setSelectedProducts([]);
        setBulkAction('');
        
        toast.success(`${selectedProducts.length} productos actualizados`);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Error al realizar la acción masiva');
    }
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

  // Calcular estadísticas
  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    outOfStock: products.filter(p => (p.stock || 0) <= 0).length,
    lowStock: products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.low_stock_threshold || 5)).length,
    featured: products.filter(p => p.featured).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0)
  };

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setStockFilter('all');
    setPriceRange([0, 50000]);
    setFeaturedFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Gestión de Productos
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Administra el catálogo completo de productos • {stats.total} productos
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow"
          >
            <RefreshCw className="w-4 h-4" />
            Limpiar Filtros
          </button>
          <button
            onClick={() => openEditModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Productos Totales</div>
            </div>
            <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Activos: {stats.active}</span>
              <span>Destacados: {stats.featured}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                S/. {stats.totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Valor Inventario</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Precio promedio: S/. {productStats.averagePrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {productStats.totalStock}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Stock Total</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {stats.lowStock} productos con stock bajo
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                {stats.outOfStock}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sin Stock</div>
            </div>
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/30">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {((stats.outOfStock / stats.total) * 100 || 0).toFixed(1)}% del inventario
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos por nombre, SKU, descripción..."
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <FilterIcon className="w-4 h-4" />
              Filtros
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filtros avanzados */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="draft">Borrador</option>
                <option value="archived">Archivado</option>
                <option value="discontinued">Descontinuado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Todo el stock</option>
                <option value="in_stock">En stock</option>
                <option value="low_stock">Stock bajo</option>
                <option value="out_of_stock">Sin stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="name_asc">Nombre (A-Z)</option>
                <option value="name_desc">Nombre (Z-A)</option>
                <option value="price_asc">Precio (Menor a Mayor)</option>
                <option value="price_desc">Precio (Mayor a Menor)</option>
                <option value="stock_asc">Stock (Menor a Mayor)</option>
                <option value="stock_desc">Stock (Mayor a Menor)</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rango de Precio: S/. {priceRange[0]} - S/. {priceRange[1]}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="100"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Destacados
              </label>
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="featured">Solo destacados</option>
                <option value="not_featured">No destacados</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Acciones masivas y resultados */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-white">{filteredProducts.length}</span> productos encontrados
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {selectedProducts.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-800">
                {selectedProducts.length} seleccionados
              </div>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="">Acción masiva</option>
                <option value="activate">Activar</option>
                <option value="archive">Archivar</option>
                <option value="feature">Destacar</option>
                <option value="unfeature">Quitar destacado</option>
                <option value="delete">Eliminar</option>
              </select>
              
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Aplicar
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <button
              onClick={exportProducts}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            
            <button
              onClick={() => refetchProducts()}
              className="p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
              title="Refrescar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-600 dark:text-gray-400">Cargando productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6">
            <Package className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            No se encontraron productos
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || stockFilter !== 'all'
              ? 'Intenta con otros filtros de búsqueda'
              : 'No hay productos en el catálogo'}
          </p>
          <button
            onClick={() => openEditModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Crear primer producto
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentProducts.map((product) => {
              const statusInfo = getStatusInfo(product.status);
              const stockInfo = getStockInfo(product.stock, product.low_stock_threshold);
              const discount = product.compare_price
                ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Header con imagen */}
                  <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6">
                        <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                          Sin imagen
                        </p>
                      </div>
                    )}
                    
                    {/* Overlay de acciones */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <button
                          onClick={() => openEditModal(product)}
                          className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg hover:bg-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateProduct(product)}
                          className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg hover:bg-white transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Badges superiores */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.featured && (
                        <span className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg">
                          <Star className="w-3 h-3 inline mr-1" />
                          Destacado
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-lg">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    
                    {/* Checkbox y acciones */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
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
                        className="w-5 h-5 rounded-lg border-2 border-white/50 bg-white/20 backdrop-blur-sm checked:bg-indigo-500 checked:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className={`px-2 py-1 text-xs rounded-lg ${statusInfo.color}`}>
                        {statusInfo.label}
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-5">
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {product.description || 'Sin descripción'}
                      </p>
                    </div>
                    
                    {/* Precios */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          S/. {product.price?.toFixed(2)}
                        </div>
                        {product.compare_price && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            S/. {product.compare_price.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div className={`px-3 py-1.5 text-sm rounded-lg ${stockInfo.color} flex items-center gap-1`}>
                        <stockInfo.icon className="w-3 h-3" />
                        {product.stock}
                      </div>
                    </div>
                    
                    {/* Metadatos */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3" />
                        {getCategoryName(product.category_id)}
                        {getSubcategoryName(product.subcategory_id) && (
                          <span className="text-gray-400">• {getSubcategoryName(product.subcategory_id)}</span>
                        )}
                      </div>
                      {product.sku && (
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {product.sku}
                        </div>
                      )}
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 text-sm font-medium"
                      >
                        <Edit className="w-4 h-4 inline mr-2" />
                        Editar
                      </button>
                      
                      <div className="relative z-[50] dropdown-wrapper">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === product.id ? null : product.id);
                          }}
                          className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {/* Dropdown menu */}
                        <div
                          className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 transition-all duration-300 -translate-y-48 ${
                            openDropdownId === product.id ? "opacity-100 visible z-[9999]" : "opacity-0 invisible"
                          }`}
                        >
                          <button
                            onClick={() => duplicateProduct(product)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicar
                          </button>

                          {product.status === "archived" ? (
                            <button
                              onClick={() => unarchiveProduct(product.id)}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                              <ArchiveRestore className="w-4 h-4" />
                              Activar
                            </button>
                          ) : (
                            <button
                              onClick={() => archiveProduct(product.id)}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
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
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        // Vista en lista
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left">
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
                      className="rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentProducts.map((product) => {
                  const statusInfo = getStatusInfo(product.status);
                  const stockInfo = getStockInfo(product.stock, product.low_stock_threshold);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
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
                          className="rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden flex-shrink-0 mr-4">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {product.sku || 'Sin SKU'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getCategoryName(product.category_id)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {getSubcategoryName(product.subcategory_id) || '—'}
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
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg ${stockInfo.color}`}>
                          <stockInfo.icon className="w-3 h-3" />
                          {product.stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </div>
                          {product.featured && (
                            <span className="px-2 py-1 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                              ★
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => duplicateProduct(product)}
                            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            title="Duplicar"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          {product.status === 'archived' ? (
                            <button
                              onClick={() => unarchiveProduct(product.id)}
                              className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              title="Activar"
                            >
                              <ArchiveRestore className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => archiveProduct(product.id)}
                              className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
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
                            className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
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
        </div>
      )}

      {/* Modal de edición/creación */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 px-8 py-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {editingProduct ? 'Modifica los detalles del producto' : 'Agrega un nuevo producto al catálogo'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProduct(null);
                      resetProductForm();
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Formulario */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Columna izquierda - Información básica */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Nombre y SKU */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Nombre del producto *
                        </label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          placeholder="Ej: Laptop Gaming MSI Katana"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={productForm.sku}
                          onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                          className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          placeholder="Ej: MSI-KATANA-15"
                        />
                      </div>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Descripción
                      </label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        rows="5"
                        className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Describe las características, beneficios y especificaciones del producto..."
                      />
                    </div>

                    {/* Precios */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Precio de venta *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            S/.
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            className="pl-14 w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Precio comparación
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            S/.
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productForm.compare_price}
                            onChange={(e) => setProductForm({ ...productForm, compare_price: e.target.value })}
                            className="pl-14 w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Costo
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            S/.
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productForm.cost}
                            onChange={(e) => setProductForm({ ...productForm, cost: e.target.value })}
                            className="pl-14 w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stock y categoría */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Stock disponible
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Umbral stock bajo
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={productForm.low_stock_threshold}
                          onChange={(e) => setProductForm({ ...productForm, low_stock_threshold: e.target.value })}
                          className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          placeholder="5"
                        />
                      </div>
                    </div>

                    {/* Categoría y subcategoría */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Categoría
                        </label>
                        <select
                          value={productForm.category_id}
                          onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value, subcategory_id: '' })}
                          className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Subcategoría
                        </label>
                        <select
                          value={productForm.subcategory_id}
                          onChange={(e) => setProductForm({ ...productForm, subcategory_id: e.target.value })}
                          className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          disabled={!productForm.category_id}
                        >
                          <option value="">Seleccionar subcategoría</option>
                          {subcategories
                            ?.filter(sc => sc.category_id?.toString() === productForm.category_id?.toString())
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
                  <div className="space-y-8">
                    {/* Imagen del producto */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Imagen principal
                      </label>
                      <div className="border-3 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-500">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-64 object-cover rounded-xl shadow-lg"
                            />
                            <button
                              onClick={() => {
                                setImagePreview(null);
                                setProductForm({ ...productForm, image: '' });
                              }}
                              className="absolute top-3 right-3 p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="py-8">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                              <ImageIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                              Arrastra una imagen o haz clic para subir
                            </p>
                            <label className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300">
                              {uploadingImage ? (
                                <Loader className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <Upload className="w-5 h-5" />
                                  Subir imagen
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploadingImage}
                              />                             
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                              PNG, JPG, WEBP hasta 5MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Estado y opciones */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Estado
                          </label>
                          <select
                            value={productForm.status}
                            onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                            className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="active">Activo</option>
                            <option value="draft">Borrador</option>
                            <option value="archived">Archivado</option>
                            <option value="discontinued">Descontinuado</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="featured"
                            checked={productForm.featured}
                            onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                            className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">
                            <div className="font-medium">Producto destacado</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Aparecerá en secciones especiales</div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Marca
                          </label>
                          <input
                            type="text"
                            value={productForm.brand}
                            onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                            className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                            placeholder="Ej: MSI, Apple, Samsung, etc."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-6 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex flex-col gap-4">
                        <button
                          onClick={editingProduct ? updateProduct : createProduct}
                          disabled={!productForm.name || !productForm.price}
                          className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                        >
                          {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                        </button>
                        <button
                          onClick={() => {
                            setShowEditModal(false);
                            setEditingProduct(null);
                            resetProductForm();
                          }}
                          className="w-full px-6 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium"
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  ¿Eliminar producto?
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Estás a punto de eliminar el producto <strong className="text-gray-900 dark:text-white">"{productToDelete.name}"</strong>. 
                  Esta acción no se puede deshacer.
                </p>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setProductToDelete(null);
                    }}
                    className="flex-1 px-6 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={deleteProduct}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;