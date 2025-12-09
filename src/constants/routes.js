export const ROUTES = {
  // ============ PÁGINAS PÚBLICAS ============
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  NEWS: "/news",
  
  // ============ TIENDA - ESTRUCTURA PROFESIONAL ============
  SHOP: "/tienda",
  
  // Categorías principales (para navegación del header)
  CATEGORY_LAPTOPS: "/tienda/laptops",
  CATEGORY_DESKTOPS: "/tienda/desktops",
  CATEGORY_ACCESSORIES: "/tienda/accessories",
  
  // Rutas dinámicas
  CATEGORY: (categorySlug) => `/tienda/categoria/${categorySlug}`,
  PRODUCT_CATEGORY: (categorySlug) => `/tienda/categoria/${categorySlug}`,
  SUBCATEGORY: (categorySlug, subcategorySlug) => `/tienda/categoria/${categorySlug}/${subcategorySlug}`,
  
  // Producto
  PRODUCT_DETAIL: (slugOrId) => `/tienda/producto/${slugOrId}`,
  
  // Búsqueda con filtros profesionales
  SEARCH: "/tienda/buscar",
  
  // ============ CARRITO ============
  CART: "/carrito",
  
  // ============ AUTENTICACIÓN ============
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  
  // ============ USUARIO ============
  ACCOUNT: "/mi-cuenta",
  ACCOUNT_TAB: (tab = "perfil") => `/mi-cuenta/${tab}`,
  
  // Checkout
  CHECKOUT: "/checkout",
  CHECKOUT_STEP: (step = "envio") => `/checkout/${step}`,
  CHECKOUT_SUCCESS: "/checkout/checkout-success",
  
  // ============ ADMIN ============
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_PRODUCT_EDIT: (id) => `/admin/products/edit/${id}`,
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_INVENTORY: "/admin/inventory",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_SETTINGS: "/admin/settings",
  
  // ============ HELPERS PROFESIONALES ============
  
  // Helper para búsqueda avanzada con filtros estructurados
  buildSearchUrl: (params = {}) => {
    const {
      q,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      condition,
      sort,
      inStock,
      onSale,
      rating,
      page,
      limit // límite por página
    } = params;
    
    const queryParams = new URLSearchParams();
    
    // Solo agregar parámetros con valores
    if (q) queryParams.append('q', q);
    if (category) queryParams.append('category', category);
    if (subcategory) queryParams.append('subcategory', subcategory);
    if (brand) {
      // Soporta múltiples marcas separadas por comas
      const brands = Array.isArray(brand) ? brand.join(',') : brand;
      queryParams.append('brand', brands);
    }
    if (minPrice) queryParams.append('minPrice', minPrice);
    if (maxPrice) queryParams.append('maxPrice', maxPrice);
    if (condition) queryParams.append('condition', condition);
    if (sort) queryParams.append('sort', sort);
    if (inStock !== undefined) queryParams.append('inStock', inStock);
    if (onSale !== undefined) queryParams.append('onSale', onSale);
    if (rating) queryParams.append('rating', rating);
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    
    const queryString = queryParams.toString();
    return `/tienda/buscar${queryString ? `?${queryString}` : ''}`;
  },
  
  // Helper para URLs amigables de búsqueda por categoría/marca
  buildCategorySearchUrl: (category, filters = {}) => {
    const baseParams = { category, ...filters };
    return ROUTES.buildSearchUrl(baseParams);
  },
  
  // Helper para URLs de filtros avanzados (estructura jerárquica)
  buildAdvancedSearchUrl: (mainCategory, subCategory = null, filters = {}) => {
    let url = `/tienda/buscar/${encodeURIComponent(mainCategory)}`;
    
    if (subCategory) {
      url += `/${encodeURIComponent(subCategory)}`;
    }
    
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  },
  
  // Helper para extraer y parsear parámetros de búsqueda
  parseSearchParams: (searchString) => {
    const params = Object.fromEntries(new URLSearchParams(searchString));
    
    // Parsear valores específicos
    const result = {};
    
    if (params.brand) {
      result.brand = params.brand.split(',').map(b => b.trim());
    }
    
    if (params.minPrice) {
      result.minPrice = parseFloat(params.minPrice);
    }
    
    if (params.maxPrice) {
      result.maxPrice = parseFloat(params.maxPrice);
    }
    
    if (params.rating) {
      result.rating = parseInt(params.rating);
    }
    
    if (params.page) {
      result.page = parseInt(params.page);
    }
    
    if (params.limit) {
      result.limit = parseInt(params.limit);
    }
    
    if (params.inStock) {
      result.inStock = params.inStock === 'true';
    }
    
    if (params.onSale) {
      result.onSale = params.onSale === 'true';
    }
    
    // Mantener todos los parámetros originales
    return { ...params, ...result };
  },
  
  // Helper para generar URLs canónicas (SEO)
  getCanonicalUrl: (pathname, search = '') => {
    const baseUrl = 'https://techzone.com'; // Cambiar por tu dominio real
    return `${baseUrl}${pathname}${search}`;
  },
  
  // Helper para compartir productos
  getShareableProductUrl: (productId, productName = '') => {
    const baseUrl = 'https://techzone.com';
    const productSlug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    return `${baseUrl}/tienda/producto/${productId}-${productSlug}`;
  }
};