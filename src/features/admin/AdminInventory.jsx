import { useState } from 'react';
import { Plus, Edit3, Trash2, Search, X } from 'lucide-react';
import './AdminInventory.css';
import CatalogImage from '../../components/common/CatalogImage';

const AdminInventory = ({ productsData, setProductsData }) => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para el modal de Crear/Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Campos del formulario
  const [formData, setFormData] = useState({
    title: '',
    category: 'NENÚFAR',
    price: '',
    stock: '',
    image: '',
    description: ''
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({ title: '', category: 'NENÚFAR', price: '', stock: '', image: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      title: prod.title || '',
      category: prod.category || 'NENÚFAR',
      price: prod.price || '',
      stock: prod.stock !== undefined ? prod.stock : '',
      image: prod.image || '',
      description: prod.description || ''
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();

    const productPayload = {
      id: editingProduct ? editingProduct.id : Date.now(),
      title: formData.title,
      category: formData.category,
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0,
      image: formData.image || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop',
      description: formData.description || 'Ejemplar cultivado en vivero.'
    };

    if (editingProduct) {
      // Actualizar producto existente
      const updated = productsData.map(p => p.id === editingProduct.id ? productPayload : p);
      setProductsData(updated);
    } else {
      // Crear nuevo producto
      const updated = [...productsData, productPayload];
      setProductsData(updated);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const updated = productsData.filter(p => p.id !== id);
    setProductsData(updated);
  };

  const handleStockChange = (id, delta) => {
    const updated = productsData.map(p => {
      if (p.id === id) {
        const newStock = Math.max(0, p.stock + delta);
        return { ...p, stock: newStock };
      }
      return p;
    });
    setProductsData(updated);
  };

  // Filtrado por categoría y búsqueda
  const filteredProducts = productsData.filter(prod => {
    const matchesTab = activeTab === 'Todos' || prod.category.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Estadísticas rápidas
  const totalCount = productsData.length;
  const lowStockCount = productsData.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = productsData.filter(p => p.stock === 0).length;

  return (
    <div className="admin-inventory-wrapper">
      <div className="admin-page-header-row">
        <div>
          <span className="admin-kicker">CATÁLOGO Y EXISTENCIAS</span>
          <h1 className="admin-title">Inventario del <span className="italic-pink">Vivero</span></h1>
          <p className="admin-subtitle">Actualiza el precio, las existencias y añade nuevos ejemplares a la tienda.</p>
        </div>
        <button className="btn-add-main" onClick={handleOpenCreate}>
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="inventory-metrics-grid">
        <div className="metric-box">
          <span className="metric-label">TOTAL EN CATÁLOGO</span>
          <strong className="metric-num">{totalCount}</strong>
        </div>
        <div className="metric-box warning-box">
          <span className="metric-label">POCO STOCK (1-5)</span>
          <strong className="metric-num">{lowStockCount}</strong>
        </div>
        <div className="metric-box danger-box">
          <span className="metric-label">AGOTADOS</span>
          <strong className="metric-num">{outOfStockCount}</strong>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="inventory-filters-row">
        <div className="tab-pills">
          {['Todos', 'Nenúfares', 'Lotos', 'Peces'].map(tab => (
            <button
              key={tab}
              className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="admin-search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio (MXN)</th>
              <th>Estatus</th>
              <th>Stock Disponible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(prod => (
                <tr key={prod.id}>
                  <td>
                    <div className="table-prod-info">
                      <span className="catalog-table-image table-thumb"><CatalogImage image={prod.image} title={prod.title} category={prod.category} compact /></span>
                      <span className="prod-name">{prod.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{prod.category}</span>
                  </td>
                  <td><strong>${Number(prod.price).toFixed(2)}</strong></td>
                  <td>
                    {prod.stock === 0 ? (
                      <span className="status-badge out">Agotado</span>
                    ) : (
                      <span className="status-badge ok">En stock</span>
                    )}
                  </td>
                  <td>
                    <div className="stock-counter-control">
                      <button onClick={() => handleStockChange(prod.id, -1)}>-</button>
                      <span>{prod.stock}</span>
                      <button onClick={() => handleStockChange(prod.id, 1)}>+</button>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-table-edit" onClick={() => handleOpenEdit(prod)} title="Editar producto">
                        <Edit3 size={15} />
                      </button>
                      <button className="btn-table-delete" onClick={() => handleDelete(prod.id)} title="Eliminar">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">No se encontraron productos en esta categoría.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL PARA CREAR / EDITAR PRODUCTO */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form">
              <div className="modal-field">
                <label>Nombre del Producto</label>
                <input type="text" name="title" placeholder="Ej: Nenúfar Azul del Nilo" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="modal-row">
                <div className="modal-field">
                  <label>Categoría</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="NENÚFAR">Nenúfar</option>
                    <option value="LOTO">Loto</option>
                    <option value="PEZ">Pez</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Precio ($ MXN)</label>
                  <input type="number" step="0.01" name="price" placeholder="Ej: 350.00" value={formData.price} onChange={handleChange} required />
                </div>
              </div>

              <div className="modal-row">
                <div className="modal-field">
                  <label>Stock Inicial</label>
                  <input type="number" name="stock" placeholder="Ej: 10" value={formData.stock} onChange={handleChange} required />
                </div>
                <div className="modal-field">
                  <label>URL de Imagen</label>
                  <input type="url" name="image" placeholder="https://..." value={formData.image} onChange={handleChange} />
                </div>
              </div>

              <div className="modal-field">
                <label>Descripción corta</label>
                <textarea name="description" placeholder="Breve detalle del ejemplar..." value={formData.description} onChange={handleChange} rows="2"></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save">{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
