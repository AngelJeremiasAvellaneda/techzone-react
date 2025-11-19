# 📘 **TechZone React – E-Commerce de Tecnología**

**Autor:** *Angel Addair Jeremías Avellaneda*

TechZone es una tienda online moderna desarrollada con **React + Vite**, integrada con **Firebase**, utilizando **TailwindCSS**, loaders con tema dinámico (dark/light), animaciones, filtros, carrito persistente y una arquitectura limpia basada en *layouts*, *hooks* y *components*.

---

## 🚀 **Características principales**

* 🌙 **Dark/Light Mode** sincronizado en todo el sitio
* 🛒 **Carrito de compras dinámico** con Firebase
* 🔎 **Filtros avanzados** de productos
* ⚡ **Loaders animados** con colores que cambian según el tema
* 🖼️ **Zoom interactivo en imágenes**
* 📱 **Diseño 100% responsive**
* 🔥 **Firebase Firestore** para productos y carrito
* 🎨 **TailwindCSS** + variables `CSS` para tema global
* ⚛️ Arquitectura limpia con `components`, `layouts`, `hooks` y `pages`

---

## 🧩 **Tecnologías utilizadas**

* **React 18** + **Vite**
* **TailwindCSS**
* **Firebase 10**
* **React Router**
* **CSS Variables (Theme System)**
* **Custom Hooks (useProducts, useCart, useFilters)**

---

## 📂 **Estructura del proyecto**

```
TechZoneReact/
│
├── public/
│   ├── image/
│   │   ├── accessories/
│   │   ├── desktops/
│   │   ├── laptops/
│   │   ├── news/
│   │   └── resources/
│   ├── oferta1.png
│   ├── oferta2.png
│   ├── oferta3.png
│   └── vite.svg
│
├── src/
│   ├── assets/
│   │   └── react.svg
│   │
│   ├── components/
│   │   ├── CartDrawer.jsx
│   │   ├── FiltersDrawer.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── ImageZoom.jsx
│   │   ├── SkeletonCard.jsx
│   │   └── useFilters.jsx
│   │
│   ├── data/
│   │   └── firebaseData.js
│   │
│   ├── firebase/
│   │   └── firebase.js
│   │
│   ├── hooks/
│   │   ├── useCart.js
│   │   └── useProducts.js
│   │
│   ├── layouts/
│   │   ├── BaseLayout.jsx
│   │   └── ProductsLayout.jsx
│   │
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── Accesories.jsx
│   │   ├── Contact.jsx
│   │   ├── Desktops.jsx
│   │   ├── Laptops.jsx
│   │   ├── News.jsx
│   │   └── index.jsx
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🔧 **Instalación y ejecución**

### 1️⃣ Clona el repositorio

```bash
git clone https://github.com/tu-usuario/TechZoneReact.git
cd TechZoneReact
```

### 2️⃣ Instala dependencias

```bash
npm install
```

### 3️⃣ Ejecuta el proyecto

```bash
npm run dev
```

### 4️⃣ Abre en el navegador

```
http://localhost:5173
```

---

## 🔥 Firebase Configuración

Edita:

```
src/firebase/firebase.js
```

Añade tus claves:

```js
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
```

---

## 🎨 Tema (Dark/Light)

El tema cambia modificando la clase del `<html>`:

```js
document.documentElement.classList.toggle("dark");
```

Variables usadas:

```css
--page-bg
--text
--accent
--menu-bg
--line
```

---

## 🛒 Carrito de compras

`useCart.js` maneja:

* Añadir productos
* Eliminar productos
* Contador del carrito
* Guardado en Firebase
* Drawer lateral con animaciones

---

## 📦 Productos por categoría

Los productos se obtienen de Firestore con:

```js
useProducts("laptops")
useProducts("desktops")
useProducts("accessories")
```

---

## 🖼️ Skeleton loaders con tema dinámico

Los loaders aplican:

```css
border-color: var(--line);
border-top-color: var(--accent);
```

✔ Cambian según el modo claro/oscuro
✔ Animación suave por defecto

---

## 👨‍💻 Autor

**Angel Addair Jeremías Avellaneda**
Desarrollador Full Stack
📌 Perú

---

## 🤝 Contribuciones

¡Son bienvenidas!
Puedes abrir **issues** o enviar **pull requests**.

---

## 📜 Licencia

MIT – Libre para utilizar y modificar.
