import './Sidebar.css'

export function Sidebar({ activeView, onChangeView, onLogout, profileName }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <p className="sidebar__eyebrow">energia electrica</p>
        <h2 className="sidebar__title">Portal cliente</h2>
        <p className="sidebar__profile">{profileName}</p>
        <span className="sidebar__status">Cuenta activa</span>
      </div>

      <nav className="sidebar__nav">
        <button
          className={`sidebar__item ${activeView === 'dashboard' ? 'sidebar__item--active' : ''}`}
          type="button"
          onClick={() => onChangeView('dashboard')}
        >
          <span className="sidebar__item-icon">01</span>
          <span>Dashboard</span>
        </button>
        <button
          className={`sidebar__item ${activeView === 'consumption' ? 'sidebar__item--active' : ''}`}
          type="button"
          onClick={() => onChangeView('consumption')}
        >
          <span className="sidebar__item-icon">02</span>
          <span>Consumo</span>
        </button>
        <button
          className={`sidebar__item ${activeView === 'qr' ? 'sidebar__item--active' : ''}`}
          type="button"
          onClick={() => onChangeView('qr')}
        >
          <span className="sidebar__item-icon">03</span>
          <span>Pagos QR</span>
        </button>
      </nav>

      <button className="sidebar__logout" type="button" onClick={onLogout}>
        Cerrar sesion
      </button>
    </aside>
  )
}
