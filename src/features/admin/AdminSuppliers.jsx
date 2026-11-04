import { useState } from 'react';
import { Plus, Edit3, Trash2, Search, X, Truck, Phone, Mail, MapPin } from 'lucide-react';

const AdminSuppliers = ({ suppliersData, setSuppliersData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    category: 'Plantas Acuáticas',
    address: ''
  });

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({ name: '', contactPerson: '', phone: '', email: '', category: 'Plantas Acuáticas', address: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name || '',
      contactPerson: sup.contactPerson || '',
      phone: sup.phone || '',
      email: sup.email || '',
      category: sup.category || 'Plantas Acuáticas',
      address: sup.address || ''
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveSupplier = (e) => {
    e.preventDefault();
    const supplierPayload = {
      id: editingSupplier ? editingSupplier.id : Date.now(),
      ...formData
    };

    if (editingSupplier) {
      const updated = suppliersData.map(s => s.id === editingSupplier.id ? supplierPayload : s);
      setSuppliersData(updated);
    } else {
      const updated = [...suppliersData, supplierPayload];
      setSuppliersData(updated);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const updated = suppliersData.filter(s => s.id !== id);
    setSuppliersData(updated);
  };

  const filteredSuppliers = suppliersData.filter(sup =>
    sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sup.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '2.5rem 3rem', fontFamily: 'Inter, sans-serif', color: '#1a3c35', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.72rem', letterSpacing: '2px', color: '#889995', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>CADENA DE SUMINISTRO</span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: '#1a3c35', margin: 0, fontWeight: 400 }}>Gestión de <span style={{ fontStyle: 'italic', color: '#dcb358' }}>Proveedores</span></h1>
          <p style={{ fontSize: '0.88rem', color: '#6c7c79', marginTop: '0.4rem' }}>Administra la información de tus aliados comerciales y viveros surtidores.</p>
        </div>
        <button onClick={handleOpenCreate} style={{ background: '#1a3c35', color: 'white', border: 'none', padding: '0.75rem 1.2rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Nuevo Distribuidor
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e0dfd5', borderRadius: '6px', padding: '0.5rem 1rem', width: '300px' }}>
          <Search size={16} style={{ color: '#889995', marginRight: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="Buscar distribuidor..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.85rem', color: '#1a3c35' }}
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e0dfd5', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7f6f0', borderBottom: '1px solid #e0dfd5' }}>
              <th style={{ padding: '1rem 1.2rem', fontSize: '0.72rem', textTransform: 'uppercase', color: '#889995', fontWeight: 600 }}>Proveedor</th>
              <th style={{ padding: '1rem 1.2rem', fontSize: '0.72rem', textTransform: 'uppercase', color: '#889995', fontWeight: 600 }}>Contacto</th>
              <th style={{ padding: '1rem 1.2rem', fontSize: '0.72rem', textTransform: 'uppercase', color: '#889995', fontWeight: 600 }}>Teléfono / Correo</th>
              <th style={{ padding: '1rem 1.2rem', fontSize: '0.72rem', textTransform: 'uppercase', color: '#889995', fontWeight: 600 }}>Categoría</th>
              <th style={{ padding: '1rem 1.2rem', fontSize: '0.72rem', textTransform: 'uppercase', color: '#889995', fontWeight: 600 }}>Ubicación</th>
              <th style={{ padding: '1rem 1.2rem', fontSize: '0.72rem', textTransform: 'uppercase', color: '#889995', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map(sup => (
                <tr key={sup.id} style={{ borderBottom: '1px solid #f2efe9' }}>
                  <td style={{ padding: '1rem 1.2rem', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ width: '35px', height: '35px', background: '#f5f4f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3c35' }}><Truck size={16} /></div>
                      <strong>{sup.name}</strong>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.2rem', fontSize: '0.88rem' }}>{sup.contactPerson}</td>
                  <td style={{ padding: '1rem 1.2rem', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      <span style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={11} /> {sup.phone}</span>
                      <span style={{ fontSize: '0.75rem', color: '#889995', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={11} /> {sup.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.2rem', fontSize: '0.88rem' }}>
                    <span style={{ background: '#f5f4f0', color: '#6c7c79', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>{sup.category}</span>
                  </td>
                  <td style={{ padding: '1rem 1.2rem', fontSize: '0.88rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#6c7c79', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={11} /> {sup.address}</span>
                  </td>
                  <td style={{ padding: '1rem 1.2rem', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => handleOpenEdit(sup)} style={{ background: '#e6fcf5', border: 'none', color: '#0ca678', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(sup.id)} style={{ background: '#fce8e8', border: 'none', color: '#c92a2a', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#889995', fontStyle: 'italic' }}>No hay proveedores registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '8px', padding: '2rem', boxSizing: 'border-box', border: '1px solid #e0dfd5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', margin: 0, color: '#1a3c35' }}>{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#889995' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6c7c79', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Nombre Empresa / Vivero</label>
                <input type="text" name="name" placeholder="Ej: Acuarios Teya" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '0.7rem', border: '1px solid #e0dfd5', borderRadius: '6px', boxSizing: 'border-box', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6c7c79', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Contacto</label>
                  <input type="text" name="contactPerson" placeholder="Nombre" value={formData.contactPerson} onChange={handleChange} required style={{ width: '100%', padding: '0.7rem', border: '1px solid #e0dfd5', borderRadius: '6px', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6c7c79', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Insumo</label>
                  <input type="text" name="category" placeholder="Ej: Peces" value={formData.category} onChange={handleChange} required style={{ width: '100%', padding: '0.7rem', border: '1px solid #e0dfd5', borderRadius: '6px', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6c7c79', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Teléfono</label>
                  <input type="text" name="phone" placeholder="Teléfono" value={formData.phone} onChange={handleChange} required style={{ width: '100%', padding: '0.7rem', border: '1px solid #e0dfd5', borderRadius: '6px', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6c7c79', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Correo</label>
                  <input type="email" name="email" placeholder="Correo" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '0.7rem', border: '1px solid #e0dfd5', borderRadius: '6px', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6c7c79', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Dirección</label>
                <input type="text" name="address" placeholder="Ciudad / Estado" value={formData.address} onChange={handleChange} required style={{ width: '100%', padding: '0.7rem', border: '1px solid #e0dfd5', borderRadius: '6px', boxSizing: 'border-box', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#f1f3f5', border: '1px solid #ced4da', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ background: '#1a3c35', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuppliers;